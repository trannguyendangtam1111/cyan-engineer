# PostgreSQL `::` casts in Hibernate native queries: reproduction

Evidence for the draft article
`content/blog/hibernate-native-query-postgresql-cast-syntax-error.md`.

`src/Repro.java` runs five spellings of the same PostGIS query through
`Session#createNativeQuery` on four Hibernate versions against a real
PostgreSQL/PostGIS container, and prints, for each one, what Hibernate threw
and what PostgreSQL logged (`log_statement=all`).

## Contents

| Path | What it is |
| --- | --- |
| `pom.xml` | Dependencies; `hibernate.version` is overridden per run |
| `src/Repro.java` | The reproduction (plain Hibernate, no Spring) |
| `run.sh` | Resolves, compiles and runs each version; writes `results/` |
| `results/hibernate-<version>.txt` | Filtered output of `run.sh` (stack frames and INFO lines removed) |
| `results/foodmap-*.txt` | Excerpts from FoodMap's PostGIS integration test runs before and after the fixes |

`target/` (classpaths, classes, full logs) is generated and not committed.

## Environment of the recorded run (2026-11-18)

- Windows 11, Git Bash, Temurin OpenJDK 21.0.11, Maven 3.9.16
- Docker Desktop 29.8.1, Testcontainers 1.21.4
- Image `postgis/postgis:16-3.4` (PostgreSQL 16.4, PostGIS 3.4.3)
- PostgreSQL JDBC 42.6.1 (the version FoodMap resolves through Spring Boot 3.2.3)
- hibernate-core 6.4.4.Final, 6.4.5.Final, 6.6.59.Final, 7.4.16.Final

## Running it

Docker must be running.

```bash
./run.sh                 # all four versions
./run.sh 6.4.4.Final     # one version
MVN=/path/to/mvn ./run.sh
```

Verified only in Git Bash on Windows. The script picks `:` as the classpath
separator on other systems; that branch has not been run.

## Results

Test data: two points, id 1 at the search point and id 2 about 5.5 km east;
radius 1000 m, so the correct answer is `[1]`.

| Variant | 6.4.4 | 6.4.5 | 6.6.59 | 7.4.16 |
| --- | --- | --- | --- | --- |
| V1 `geom::geography` | FAIL, SQLState 42601 | PASS | PASS | PASS |
| V2 `CAST(geom AS geography)` | PASS | PASS | PASS | PASS |
| V3 `geom\:\:geography` | PASS | PASS | PASS | PASS |
| V4 `geom::::geography` | PASS | PASS, HHH90000031 warning | PASS, HHH90000031 warning | PASS, HHH90000031 warning |
| V5 `:radius::float8` | FAIL, unknown parameter | FAIL | FAIL | FAIL |

- V1 on 6.4.4: PostgreSQL received `geom:geography` and
  `...4326):geography` and rejected the statement at character 44.
- V3 and V4: PostgreSQL received `::` on every version.
- V5: Hibernate registered a parameter named `radius::float8`, so
  `setParameter("radius", ...)` failed before any SQL was sent.

The recorded run in `results/` is a re-run from this folder. It matches the
first run made during the investigation.

## FoodMap

FoodMap (Spring Boot 3.2.3, Hibernate 6.4.4.Final) had the V1 form in two
repository queries:

- [`4f988c5`](https://github.com/trannguyendangtam1111/FoodMap/commit/4f988c587df2ff5f33aecea5478d36ee03d8cd6b)
  fixes `findWithinRadius` (2 casts) and adds a regression test.
- [`2a029d7`](https://github.com/trannguyendangtam1111/FoodMap/commit/2a029d72fac7f909a0410bbb4632e9297f66d378)
  fixes `searchPlaces` (4 casts in the main query, including
  `COALESCE(avg_rating, 0)::FLOAT`, and 1 in its countQuery) and adds a paged
  regression test.

The tests run with:

```bash
mvn -B -Ppostgres-it -Dit.test=RestaurantRepositoryPostgresIT test-compile failsafe:integration-test
```

`results/foodmap-searchPlaces-before.txt` includes one intermediate working
tree state (main query fixed, countQuery not yet fixed) that was never
committed. It was used to show that the countQuery failed on its own.

## Sources

- [HHH-17759](https://hibernate.atlassian.net/browse/HHH-17759), "Undocumented
  escape behavior of colon characters in native queries". Affects 6.4.4; fix
  versions 6.5.0.CR1 (2024-03-20) and 6.4.5 (2024-04-23).
- `org.hibernate.query.sql.internal.ParameterParser`, read from the
  hibernate-core sources jars:
  - 6.4.4, lines 131–135: `::` is treated as an escaped colon and one `:` is emitted.
  - 6.4.5 lines 132–177, 6.6.59 lines 132–177, 7.4.16 lines 164–210: `:` starts a
    named parameter only before a Java identifier start; other colons pass
    through, `::::` maps to `::` with a deprecation warning.
  - `HQL_SEPARATORS` contains no `:` in any of the four versions
    (6.4.4 line 25, 6.4.5 line 26, 6.6.59 line 26, 7.4.16 line 30).
  - All four versions drop a backslash and keep the next character literally.

## Not covered

- Hibernate 6.0–6.4.3, 6.5.x, other 6.6.x and 7.x releases, and 8.0 were not run.
- Only PostgreSQL 16.4 with PostGIS 3.4.3 and PgJDBC 42.6.1 were used.
- Only `Session#createNativeQuery` (Repro) and Spring Data `@Query(nativeQuery = true)`
  (FoodMap) were exercised; `@NamedNativeQuery`, `@Formula` and HQL were not.
