---
title: "Building a Reliable Coin Wallet with Spring Boot and PostgreSQL"
description: "How Cyan Arcade keeps coin balances correct under double clicks, retries and concurrent requests, using row locks, an append-only ledger, idempotency keys and database constraints."
date: 2026-11-18
tags: [spring-boot, postgresql, transactions, concurrency]
slug: reliable-coin-wallet-spring-boot-postgresql
published: true
---

[Cyan Arcade](/projects/cyan-arcade) has a small virtual economy. Players earn coins for finishing games, high scores, achievements, daily challenges and a daily login reward, and they spend coins in a shop. The coins are not real money, but the rules are the same as for any balance: a player must never spend coins they do not have, never be paid twice for the same thing, and never lose coins because a request failed halfway through.

Those rules are easy to break by accident: a double click on "Buy", a retry after a timeout, two tabs claiming the same reward at once. This post shows how the backend handles these cases with plain Spring and PostgreSQL. The snippets come from the public repository, shortened where marked.

## Two tables: a balance and a ledger

The economy uses two tables:

- `user_wallets` holds one row per player with the current `balance`, so reading a balance is cheap.
- `coin_transactions` is the ledger: one row for every change, with a signed `amount` (positive when earned, negative when spent) and the `balance_after` that change.

The rule written into the schema comments is that the balance changes **only** together with a new ledger row, in the same transaction, while the wallet row is locked. A test checks the result: after a mix of credits and debits, the sum of the ledger equals the balance, and the latest `balance_after` equals it too.

The ledger is append-only. The application has no code path that updates or deletes a ledger row; a refund, if one were ever needed, would be a new row. This is a convention kept by the code, not something the database enforces with triggers or permissions.

## Transactions: all or nothing

Every coin operation runs inside a Spring `@Transactional` method. A shop purchase records the purchase, debits the price and puts the item in the inventory, all in one database transaction, because the wallet methods use the default propagation (`REQUIRED`) and join the purchase's transaction instead of starting their own.

If any step throws a runtime exception, Spring rolls the whole transaction back. "Not enough coins", "level too low" and "already owned" are all runtime exceptions in this codebase, so a failed purchase leaves no purchase row, no ledger row and no changed balance. An integration test credits 50 coins inside a transaction, then throws; afterwards the balance is zero, the ledger is empty, and a later attempt can still pay that reward.

## Row-level locking for concurrent requests

Transactions alone do not stop a race. Under PostgreSQL's default isolation level, READ COMMITTED, which the project does not change, two requests could both read a balance of 100, both decide a 100-coin purchase is affordable, and both write.

Cyan Arcade prevents that with a **pessimistic row lock**. Before any change, the wallet row is locked with `SELECT ... FOR UPDATE`:

```sql
INSERT INTO user_wallets (user_id, balance, updated_at) VALUES (:userId, 0, :now)
ON CONFLICT (user_id) DO NOTHING;

SELECT balance FROM user_wallets WHERE user_id = :userId FOR UPDATE;
```

The `INSERT ... ON CONFLICT DO NOTHING` creates an empty wallet the first time, so there is always a row to lock. The `FOR UPDATE` then makes any other transaction that wants to lock the same row wait until this one commits or rolls back. Changes to one player's balance therefore happen one at a time, while different players never wait for each other's wallet.

The core of every balance change looks like this (simplified from `CoinService`):

```java
long balance = store.lockWallet(userId, now);          // SELECT ... FOR UPDATE
long after = balance + amount;                         // amount is negative for spending
if (after < 0) {
    throw new InsufficientCoinsException(balance, -amount);
}
Optional<Long> id = store.insert(userId, amount, after, type, reference, description, createdBy, now);
if (id.isEmpty()) {
    return Optional.empty();                           // this reference was already paid
}
store.setBalance(userId, after, now);
```

This is different from **optimistic locking**. With optimistic locking, for example a JPA `@Version` column, nobody waits: each transaction reads freely, and the update fails if someone else changed the row in the meantime, so the caller has to retry. That suits rows that rarely conflict. A wallet is a single hot row per player where a conflict means "two purchases at once", and making the second request wait and then re-check the balance is simpler than retrying. The Cyan Arcade code uses no `@Version` columns; the wallet relies only on the row lock.

The shop locks the wallet first, before checking level and ownership, so a parallel purchase cannot invalidate those checks.

## Idempotency: the same request does the same thing once

Locking serialises requests but cannot tell whether two of them are the same request sent twice. For that, there are two mechanisms.

**Reward references.** A credit carries a reference such as `GAME_SESSION` plus the session id, or `ACHIEVEMENT` plus its code. A partial unique index allows one ledger row per player, type and reference:

```sql
CREATE UNIQUE INDEX uq_coin_transactions_reference
    ON coin_transactions (user_id, type, reference_id) WHERE reference_id IS NOT NULL;
```

The insert uses `ON CONFLICT ... DO NOTHING RETURNING id`. If nothing comes back, the reward was already paid and the balance is left alone.

**Client request ids for purchases.** Before a purchase, the frontend creates a random UUID and sends it with the request. `purchases` has a unique constraint on `(user_id, request_id)`. After locking the wallet, the service looks the id up. If a purchase with that id exists, it returns that purchase, marked as `repeated`, without charging again. A double click or a retry therefore gets the first result back.

Opening a card pack works the same way through an `Idempotency-Key` header, and it goes one step further: it stores the original response as JSON and replays it, and it rejects a key reused for a different pack.

These mechanisms give **idempotent effects**, not exactly-once execution. A retried request still runs; it simply finds the earlier result and changes nothing. If the first response is lost, the client only learns that the purchase went through by retrying with the same id.

## Constraints as the last line of defence

The application checks everything first, but the schema refuses invalid states on its own:

```sql
CONSTRAINT ck_user_wallets_balance CHECK (balance >= 0)              -- user_wallets
CONSTRAINT ck_coin_transactions_amount CHECK (amount <> 0)           -- coin_transactions
CONSTRAINT ck_coin_transactions_balance_after CHECK (balance_after >= 0)
CONSTRAINT uq_purchases_request UNIQUE (user_id, request_id)         -- purchases
```

If a bug ever skipped a check, the statement would fail, the exception would roll back the transaction, and no partial change would be committed. A test writes a negative balance and a zero-amount row directly with SQL and expects both to be refused.

## How it is tested

The wallet tests are integration tests against a real PostgreSQL started by Testcontainers and migrated by Flyway, so the locks and constraints are the real ones. Two tests start requests in parallel with a thread pool:

- Ten 100-coin debits against a balance of 500: exactly five succeed, and the balance ends at zero.
- Eight different rewards plus eight claims of the same achievement: the balance counts each different reward once and the achievement once.

A shop test does the same with eight simultaneous purchases and coins for three.

## Trade-offs and limitations

- **Per-player serialisation.** Every coin change for one player waits for the previous one. That is intended, but a slow transaction holding the lock delays that player's other requests. I have not measured lock wait times.
- **The ledger rule is enforced by code.** Nothing in the database stops a manual `UPDATE` of the ledger, and the "balance equals the sum of the ledger" invariant is verified by tests, not by a constraint.
- **Purchase ids are not tied to an item.** A repeated purchase request returns the earlier purchase even if the retry names a different item. Pack opening rejects that case; the shop does not.
- **One database.** The design relies on a single PostgreSQL transaction. It would need a different approach if coins ever moved between separate services.

## Lessons learned

- Decide where the truth lives. Here it is the ledger, with the balance as a locked, cached sum.
- Use a row lock for a single hot row that must not go negative; use optimistic locking when conflicts are rare and retries are cheap.
- Make every retry safe with a key the client or the server can repeat, and back it with a unique constraint.
- Let constraints catch what the code misses, and test concurrency with real parallel requests against the real database.

The source is on GitHub: [Cyan Arcade](https://github.com/trannguyendangtam1111/cyan-arcade).
