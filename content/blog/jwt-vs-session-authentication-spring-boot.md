---
title: "JWT vs Session Authentication in Spring Boot"
description: "How session cookies and JWTs work in Spring Security, how they compare, and why FoodMap uses JWTs while Cyan Arcade uses server-side sessions."
date: 2026-11-18
tags: [spring-boot, spring-security, authentication, jwt]
slug: jwt-vs-session-authentication-spring-boot
published: true
---

I built two Spring Boot projects that sign users in very differently. [FoodMap](/projects/foodmap) uses JWT access tokens with refresh tokens. [Cyan Arcade](/projects/cyan-arcade) uses server-side sessions with an HttpOnly cookie. Neither is "the modern one". They answer one question differently: where is the proof that a request belongs to a signed-in user kept?

This post explains both approaches and what each project actually does, including what I would still improve.

## How session-based authentication works

With sessions, the server remembers who you are:

1. The client sends a username and password once.
2. The server verifies them, creates a session, and stores the authenticated user in it.
3. The response sets a cookie holding only a random session ID.
4. The browser sends that cookie automatically on every later request, and the server looks the session up.

In Cyan Arcade, the exchange looks like this:

```text
POST /api/auth/login             → Set-Cookie: CYAN_SESSION=4f1c…; HttpOnly; SameSite=Lax
GET  /api/auth/session
Cookie: CYAN_SESSION=4f1c…       → server finds the session → user is known
```

In Spring Security, the signed-in user is a `SecurityContext` stored in the `HttpSession`. The cookie itself carries no user data, so there is nothing to decode and nothing to forge. Logging out is simple: the server invalidates the session, and the cookie stops working immediately.

The cost is state. Every active session lives somewhere on the server. One instance can keep sessions in memory; several instances need a shared store such as a database or Redis.

## How JWT-based authentication works

With a JWT, the client carries a signed statement about itself:

1. The client signs in once.
2. The server returns a token whose payload holds claims such as the subject (the user) and an expiry time, signed with a secret key.
3. The client sends it on each request, usually in a header.
4. The server checks the signature and the expiry. If both are valid, it trusts the claims.

In FoodMap, it looks like this:

```text
POST /api/v1/auth/login         → { "accessToken": "eyJhbGciOi…", "refreshToken": "…" }
POST /api/v1/restaurants/42/reviews
Authorization: Bearer eyJhbGciOi…
```

The server keeps no session for this token. That is the main advantage and the main problem: a valid token stays valid until it expires, because the server has nothing to delete. So access tokens are kept short-lived and paired with a refresh token the server *does* track.

## Session vs JWT at a glance

| | Server-side session | JWT access token |
| --- | --- | --- |
| Where the state lives | On the server | Inside the signed token |
| What the client holds | A random session ID | Signed claims (readable, not encrypted) |
| How it is sent | Cookie, automatically | Usually an `Authorization` header |
| Logout | Invalidate the session, effective at once | Token works until it expires, unless you add a denylist |
| CSRF exposure | Yes, cookies are sent automatically | No, if sent only in a header |
| XSS exposure | An HttpOnly cookie cannot be read by scripts | A token in `localStorage` can be read by any script on the page |
| Several server instances | Needs a shared session store | Any instance with the key can verify it |

## Why FoodMap uses JWT

FoodMap is a REST API with a separate React frontend. The frontend's API base URL is configurable, so the API can be served from a different origin. Bearer tokens fit that setup: each request carries its own credential, and the security chain needs no session:

```java
http
    .csrf(AbstractHttpConfigurer::disable)
    .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
    .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
```

Disabling CSRF protection is reasonable here only because the token travels in the `Authorization` header, which a browser never attaches on its own.

What the implementation does:

- **Access token:** a JWT signed with an HMAC key, valid for one hour by default. The application refuses to start if the secret is shorter than 32 bytes.
- **Refresh token:** not a JWT, but 32 random bytes. The database stores only its SHA-256 hash, and it expires after seven days.
- **Rotation:** every refresh revokes the old refresh token and issues a new pair. If a revoked token is presented again, the server treats it as possible theft and revokes all of that user's refresh tokens. Optimistic locking (`@Version`) stops two concurrent requests from using the same token twice.
- **Logout:** revokes the refresh token on the server. The current access token still works until it expires, the usual JWT trade-off.

"Stateless" has limits here too. FoodMap's filter verifies the token and then loads the user from the database on each request, so the user's roles come from the database, not from the token. The statelessness means no session store, not no database.

Two things I would change. The React client keeps both tokens in `localStorage`, where any injected script could read them. And it does not call the refresh endpoint yet, so the user signs in again when the access token expires. Moving the refresh token into an HttpOnly cookie would protect it from scripts, but the refresh endpoint would then need CSRF protection.

## Why Cyan Arcade uses sessions

Cyan Arcade is a web game platform with a React frontend. In both the Vite dev server and the Docker setup, the frontend proxies `/api` to the backend, so the browser sees a single origin. That makes cookies the natural fit. The security configuration states the goal directly: nothing secret is stored in the browser.

How sign-in works:

- **Login:** a JSON endpoint authenticates the user and saves the `SecurityContext` in the HTTP session through `HttpSessionSecurityContextRepository`.
- **Session fixation:** at that moment the session ID is changed and a fresh CSRF token is issued, so an ID planted before login becomes worthless.
- **Session cookie:** named `CYAN_SESSION`, `HttpOnly`, `SameSite=Lax`, with `Secure` switched on by configuration for HTTPS. A session ends after 14 days without activity.
- **CSRF:** the server sends a readable `XSRF-TOKEN` cookie, and the app returns its value in an `X-XSRF-TOKEN` header on every request that changes something. Another site cannot read that cookie, so it cannot forge the header.
- **Logout:** `POST /api/auth/logout` invalidates the session and returns `204`. The cookie is useless from then on.

The main limitation is documented in the README: sessions live in the backend's memory, so a restart signs everyone out, and several instances would need a shared session store. Persistent sessions are planned.

## Common mistakes

**Copying `csrf().disable()` into a cookie-based app.** Fine for header-based tokens; with session cookies it removes the protection you need.

**Assuming JWT means "no CSRF".** If you move the JWT into a cookie, the browser sends it automatically again, and CSRF matters again.

**A logout that only deletes the token in the browser.** A copied JWT keeps working until it expires. Keep access tokens short-lived and revoke refresh tokens on the server.

**Storing refresh tokens in plain text.** A leaked table then lets anyone sign in as your users. Store a hash, as FoodMap does.

**Skipping session fixation protection on a custom login endpoint.** Spring Security's built-in form login handles it. A hand-written JSON endpoint has to apply a `SessionAuthenticationStrategy` itself, as Cyan Arcade does.

**Forgetting cookie flags.** Without `Secure`, a cookie can travel over plain HTTP. Without `SameSite`, cross-site requests carry it by default in more cases.

## Practical takeaways

- Choose by client and deployment, not by trend. A browser app on one origin works well with sessions. An API used across origins or by non-browser clients often fits tokens better.
- With sessions, keep CSRF protection on, change the session ID at login, and plan a shared session store before running more than one instance.
- With JWTs, keep access tokens short, make refresh tokens revocable, and decide deliberately where the client stores them.
- Write down what your logout guarantees. "The token still works for up to an hour" is acceptable if it is a decision, not a surprise.

The full source for both projects is on GitHub: [FoodMap](https://github.com/trannguyendangtam1111/FoodMap) and [Cyan Arcade](https://github.com/trannguyendangtam1111/cyan-arcade).
