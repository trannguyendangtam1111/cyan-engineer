---
title: "PostgreSQL :: Casts in Hibernate Native Queries: A Version-by-Version Reproduction"
description: "Why a PostgreSQL ::geography cast in a Hibernate 6.4.4 native query fails with SQLState 42601, what four Hibernate versions do with five cast spellings, and how FoodMap fixed it."
date: 2026-11-18
tags: [hibernate, postgresql, spring-data-jpa, postgis]
slug: hibernate-native-query-postgresql-cast-syntax-error
published: false
---

If a Hibernate native query with a PostgreSQL cast such as `geom::geography` fails with `syntax error at or near ":"` (SQLState 42601), check your Hibernate version. Hibernate 6.4.4 reads `::` in a native query as an escaped colon and sends a single `:` to PostgreSQL. Hibernate 6.4.5 changed that behaviour ([HHH-17759](https://hibernate.atlassian.net/browse/HHH-17759)). The spelling that worked on every version I tested is standard SQL: `CAST(geom AS geography)`.

I ran into this in [FoodMap](/projects/foodmap), where two repository queries failed on every call. This post shows the failure, a reproduction across four Hibernate versions and five cast spellings, the parser behaviour behind it, a second trap with parameters, and the FoodMap fixes.

## The short answer

From the reproduction below, on PostgreSQL 16.4:

- **Hibernate 6.4.4:** `expr::type` reaches PostgreSQL as `expr:type` and fails with SQLState 42601.
- **Hibernate 6.4.5, 6.6.59 and 7.4.16:** `expr::type` reaches PostgreSQL unchanged and works.
- **All four versions:** `CAST(expr AS type)` works.
- **All four versions:** a named parameter followed directly by a cast, `:radius::float8`, fails, because Hibernate reads the whole `radius::float8` as the parameter name.

## What the failure looks like

FoodMap runs on Spring Boot 3.2.3, which brings in Hibernate 6.4.4.Final. Its nearby search was a Spring Data native query:

```java
@Query(value = """
    SELECT * FROM restaurants r
    WHERE r.is_active = true
      AND ST_DWithin(
              r.geom::geography,
              ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
              :radius
          )
    ORDER BY r.geom <-> ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)
    LIMIT :cap
    """, nativeQuery = true)
List<Restaurant> findWithinRadius(@Param("lat") double lat, @Param("lng") double lng,
                                  @Param("radius") double radiusMeters, @Param("cap") int cap);
```

Against a real PostGIS database, the call failed like this (from the integration test run, whitespace trimmed):

```text
org.hibernate.exception.SQLGrammarException: JDBC exception executing SQL
[SELECT * FROM restaurants r WHERE r.is_active = true AND ST_DWithin(
  r.geom:geography,
  ST_SetSRID(ST_MakePoint(?, ?), 4326):geography,
  ?) ORDER BY r.geom <-> ST_SetSRID(ST_MakePoint(?, ?), 4326) LIMIT ?]
[ERROR: syntax error at or near ":"  Position: 88]
```

The SQL in the message is what Hibernate sent: each `::geography` has become `:geography`. SQLState 42601 is PostgreSQL's `syntax_error`. PostgreSQL rejected the text before planning it, so the result does not depend on the parameter values or the data. Every call fails.

Nothing failed earlier. The repository was created normally, and the other queries in the same interface worked. Only calling this method showed the problem.

## The reproduction

To separate Hibernate from Spring Data and from FoodMap's schema, I wrote a small program that uses plain Hibernate:

- A Testcontainers PostgreSQL container from the `postgis/postgis:16-3.4` image, started with `log_statement=all`, so the server logs every statement it receives.
- A `places` table with two points: id 1 at the search point and id 2 about 5.5 km east.
- The same `ST_DWithin` query with a 1,000 m radius, so the correct result is `[1]`.

Each spelling goes through `Session#createNativeQuery`:

```java
List<?> rows = session.createNativeQuery(sql)
        .setParameter("lng", 106.7)
        .setParameter("lat", 10.77)
        .setParameter("radius", 1000.0)
        .getResultList();
```

The five spellings differ only in how the casts are written:

| Variant | Cast spelling in the native query |
| --- | --- |
| V1 | `geom::geography`, `ST_SetSRID(...)::geography` |
| V2 | `CAST(geom AS geography)`, `CAST(ST_SetSRID(...) AS geography)` |
| V3 | `geom\:\:geography` (each colon escaped with a backslash) |
| V4 | `geom::::geography` (each colon doubled) |
| V5 | V2's casts, plus `:radius::float8` for the radius parameter |

For each run I recorded what Hibernate threw and the statement PostgreSQL logged.

## Results across four Hibernate versions

| Variant | 6.4.4 | 6.4.5 | 6.6.59 | 7.4.16 |
| --- | --- | --- | --- | --- |
| V1 `::` | **Fails** (42601) | Works | Works | Works |
| V2 `CAST` | Works | Works | Works | Works |
| V3 `\:\:` | Works | Works | Works | Works |
| V4 `::::` | Works | Works, with a deprecation warning | Works, with a deprecation warning | Works, with a deprecation warning |
| V5 `:radius::float8` | **Fails** (unknown parameter) | **Fails** | **Fails** | **Fails** |

"Works" means the query returned `[1]`. The PostgreSQL log shows the difference for V1. On 6.4.4 the server received:

```sql
SELECT id FROM places WHERE ST_DWithin(geom:geography,
  ST_SetSRID(ST_MakePoint($1, $2), 4326):geography, $3) ORDER BY id
```

and answered `syntax error at or near ":" at character 44`. On 6.4.5, 6.6.59 and 7.4.16 it received `geom::geography` and `4326)::geography`, and the query ran. (The `$1` placeholders come from the JDBC driver; Hibernate sends `?`.)

For V3 and V4, PostgreSQL received `::` on all four versions. From 6.4.5 on, V4 also logs this warning once for each `::::`:

```text
HHH90000031: The native query colon escaping used for the [::::] operator is
deprecated and will be removed. Use [::] instead.
```

## Why Hibernate 6.4.4 rewrites `::`

Before a native query reaches JDBC, Hibernate scans the SQL for parameters with `org.hibernate.query.sql.internal.ParameterParser`. The parser skips quoted text, replaces each named parameter such as `:lat` with `?`, and passes everything else through. The question is what it does with a colon that is not a parameter.

In **6.4.4**, the rule is short: two colons in a row are an *escaped* colon, and the parser emits one `:`. That is how `geom::geography` becomes `geom:geography`. Every other colon starts a named parameter.

The HHH-17759 issue was reported against 6.4.4 with an example almost identical to this one, `now()::text` turning into `now():text`. In the discussion, a Hibernate maintainer explained that `::` was an intentional but undocumented escape for a literal colon, and that `::::` was the way to get `::` through.

In **6.4.5, 6.6.59 and 7.4.16** the parser works differently. HHH-17759 lists 6.4.5 and 6.5.0.CR1 as the fix versions.

- A colon starts a named parameter only when the next character can start a Java identifier. `:lat` is a parameter; the second colon of `::` is not followed by a letter.
- Any other colon is passed through, together with any colons directly after it, so `::geography` stays `::geography`.
- `::::` is still turned into `::`, and `::=` into `:=`, for backwards compatibility, but both log the HHH90000031 deprecation warning.

The source of all four versions confirms this, and the results above match it. In every version, a backslash makes the parser emit the next character literally, which is why V3 works everywhere. In a Java string literal or text block the backslash itself must be escaped, so V3 is written `geom\\:\\:geography` in Java source.

I did not find this colon escaping described in the Hibernate 6.5 migration guide or in the 6.6 or 7.1 User Guide. One comment on HHH-17759 also reports that the 6.4.5 change broke purely numeric named parameters such as `:1`. I did not test that.

```mermaid How the same native query reaches PostgreSQL under Hibernate 6.4.4 and under 6.4.5 or later, and why a parameter followed by a cast fails in every tested version. Based on the ParameterParser source and the PostgreSQL statement log of the reproduction.
flowchart TD
  accTitle: How Hibernate's native-query parser handles PostgreSQL double-colon casts
  accDescr: A native query containing geom::geography is scanned by Hibernate's ParameterParser. In Hibernate 6.4.4 the double colon is read as an escaped colon, so PostgreSQL receives geom:geography and rejects it with a syntax error, SQLState 42601. In Hibernate 6.4.5 and later the double colon is passed through, so PostgreSQL receives geom::geography and the query runs. Separately, in every tested version a named parameter followed directly by a cast, such as :radius::float8, is read as one parameter named radius::float8, so setting the parameter radius fails before any SQL is sent.
  Q["Native query<br/>geom::geography<br/>:radius::float8"] --> P{"Hibernate<br/>ParameterParser"}
  P -->|"6.4.4"| A["'::' read as an<br/>escaped colon"]
  A --> A2["PostgreSQL receives<br/>geom:geography"]
  A2 --> A3["syntax error at or<br/>near ':' (42601)"]
  P -->|"6.4.5 and later"| B["'::' passed<br/>through"]
  B --> B2["PostgreSQL receives<br/>geom::geography"]
  B2 --> B3["Cast runs,<br/>query succeeds"]
  P -->|"all tested versions"| C["Parameter named<br/>radius::float8"]
  C --> C2["setParameter(radius)<br/>fails, no SQL sent"]
```

## The named-parameter trap: `:radius::float8`

V5 fails on every version, for a different reason. When the parser finds a named parameter, it reads the name up to the next separator character. The separator list includes spaces, commas, parentheses and operators, but not `:` in any of the four versions. So in `:radius::float8` the parameter name is `radius::float8`.

The query is never sent. `setParameter("radius", ...)` fails because no parameter has that name:

```text
6.4.4 and 6.4.5:   Could not locate named parameter [radius],
                   expecting one of [lng, radius::float8, lat]
6.6.59 and 7.4.16: No parameter named ':radius' in query with
                   named parameters [lng, radius::float8, lat]
```

Upgrading Hibernate does not help here. Write the cast around the parameter instead: `CAST(:radius AS float8)`. FoodMap's place search already does this with `CAST(:radiusMeters AS DOUBLE PRECISION)`, and that query passes on 6.4.4 once its other casts are fixed.

## Before and after in FoodMap

The nearby query only needed its two casts rewritten. The filter, the ordering, the limit and the method signature stay the same:

```sql
-- Before: fails on Hibernate 6.4.4
AND ST_DWithin(
        r.geom::geography,
        ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
        :radius
    )

-- After: works on every tested version
AND ST_DWithin(
        CAST(r.geom AS geography),
        CAST(ST_SetSRID(ST_MakePoint(:lng, :lat), 4326) AS geography),
        :radius
    )
```

The place search query had the same problem in more places. Its main query had four `::geography` casts and one easy-to-miss numeric cast in the ranking expression:

```sql
-- Before
0.3 * (COALESCE(avg_rating, 0)::FLOAT / 5.0)
-- After
0.3 * (CAST(COALESCE(avg_rating, 0) AS FLOAT) / 5.0)
```

Its separate `countQuery`, which Spring Data uses for the page total, had one more `::geography` cast.

## How FoodMap fixed and tested it

Another query in the same repository already used `CAST(... AS geography)`, with a comment explaining why. The two broken queries had never run against a real PostgreSQL database: no test called either method, and the existing PostGIS integration tests exercised other repository queries.

The fixes are two public commits:

- [`4f988c5`](https://github.com/trannguyendangtam1111/FoodMap/commit/4f988c587df2ff5f33aecea5478d36ee03d8cd6b) rewrites the two casts in `findWithinRadius`. It also adds a regression test that inserts an active place at the centre, one 999.9 m away, one 1,000.1 m away and an inactive one 500 m away. The test expects exactly the first two, nearest first.
- [`2a029d7`](https://github.com/trannguyendangtam1111/FoodMap/commit/2a029d72fac7f909a0410bbb4632e9297f66d378) rewrites the five casts in `searchPlaces` and adds a paged regression test. Three active places lie inside the radius. With a page size of 2 the first page is full, so Spring Data must run the count query to find the total. The test checks the first two results, a total of 3 and the single result on page 2.

Both tests run in FoodMap's optional Testcontainers suite, with the real Flyway migrations, on Hibernate 6.4.4:

| Change | Result before the fix | Result after the fix |
| --- | --- | --- |
| `findWithinRadius` | 4 tests, 1 error: `r.geom:geography`, 42601 at position 88 | 4 tests passed |
| `searchPlaces` main query | 5 tests, 1 error: 42601 at position 551 | |
| `searchPlaces` countQuery | Main query fixed alone: 5 tests, 1 error, 42601 at position 250 | 5 tests passed |

Fixing the main query first and running the test again confirmed that the count query failed on its own. That intermediate state was never committed.

I chose `CAST` over the alternatives for three reasons:

- **Upgrading Hibernate** to 6.4.5 or later would fix the `::` casts, but it is a larger dependency change, and it would not fix the parameter trap.
- **`::::`** depends on an escape that newer versions deprecate.
- **`\:\:`** works on all four versions, but it is easy to misread and needs doubled backslashes in Java.

`CAST(expr AS type)` is standard SQL and behaved the same on every version tested.

## Reproduce it yourself

The reproduction, the run script and the recorded output are in the [cyan-engineer repository](https://github.com/trannguyendangtam1111/cyan-engineer/tree/main/research/hibernate-native-query-casts). The recorded run used:

- Windows 11 with Git Bash, Temurin OpenJDK 21.0.11, Maven 3.9.16
- Docker Desktop 29.8.1, Testcontainers 1.21.4
- `postgis/postgis:16-3.4` (PostgreSQL 16.4, PostGIS 3.4.3), PostgreSQL JDBC 42.6.1
- hibernate-core 6.4.4.Final, 6.4.5.Final, 6.6.59.Final and 7.4.16.Final

With Docker running, this runs all four versions and writes one transcript per version to `results/`:

```bash
./run.sh
```

To check a single version, pass it as an argument, for example `./run.sh 6.4.4.Final`. The FoodMap regression tests run from `foodmap-backend` with:

```bash
mvn -B -Ppostgres-it -Dit.test=RestaurantRepositoryPostgresIT test-compile failsafe:integration-test
```

I ran both commands only on Windows in Git Bash.

## What this does not show

- **Untested Hibernate versions:** 6.0 to 6.4.3, 6.5.x, other 6.6.x and 7.x releases, and 8.0 were not run. HHH-17759 lists 6.4.4 as the affected version. I have not checked how far back the escape behaviour goes.
- **One database setup:** only PostgreSQL 16.4 with PostGIS 3.4.3 and PostgreSQL JDBC 42.6.1.
- **Two query paths:** `Session#createNativeQuery` and Spring Data `@Query(nativeQuery = true)`. Named native queries, `@Formula`, other annotations that take SQL, and HQL were not tested.
- **No HTTP-level test:** the FoodMap results come from repository-level integration tests, not requests to the running API.

## Takeaways

- If a native query that is valid PostgreSQL fails with `syntax error at or near ":"`, something between your code and the database may have changed the SQL. Turn on the PostgreSQL statement log, or read the SQL in the exception, to see what actually arrived.
- On Hibernate 6.4.4, write PostgreSQL casts as `CAST(expr AS type)` in native queries. From 6.4.5 on, `::` passes through again.
- Never put `::type` directly after a named parameter. Use `CAST(:param AS type)` on every version.
- Run every native query at least once against the real database in a test. Mocked repositories cannot catch SQL that only PostgreSQL rejects.

The source for FoodMap is on GitHub: [FoodMap](https://github.com/trannguyendangtam1111/FoodMap).
