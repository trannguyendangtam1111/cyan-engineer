---
title: "Building Location-Based Restaurant Search with PostgreSQL and PostGIS"
description: "How FoodMap finds restaurants by map area, distance and Vietnamese text in PostgreSQL with PostGIS, pg_trgm and unaccent, and why the final ranking happens in Java."
date: 2026-11-18
tags: [postgresql, postgis, spring-boot, search]
slug: location-based-restaurant-search-postgresql-postgis
published: true
---

[FoodMap](/projects/foodmap) is a food and restaurant discovery app for Ho Chi Minh City. That sounds like one search box, but it is really two problems. A restaurant has to match what the user typed, and it has to be somewhere the user can actually go. "Phở" means little without a place, and "near me" means little without a dish.

This post walks through how FoodMap handles both in PostgreSQL. The SQL snippets are taken from the project and trimmed for length; I mark the places where I simplified.

## Why PostgreSQL and PostGIS

The restaurants already live in PostgreSQL, so the question was whether the database could also answer "where" and "what", instead of adding a separate search service. Three extensions cover it:

- **PostGIS** for points, bounding boxes and distances.
- **pg_trgm** for typo-tolerant name matching with trigram similarity.
- **unaccent** for matching Vietnamese text with or without diacritics.

All three are enabled in Flyway migrations, so a fresh database gets the same schema as the development one.

## How spatial search works in FoodMap

Each restaurant stores `latitude` and `longitude` as plain numbers. A migration adds a generated PostGIS column next to them:

```sql
ALTER TABLE restaurants
    ADD COLUMN geom geometry(Point, 4326)
    GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)) STORED;

CREATE INDEX idx_restaurants_geom ON restaurants USING GIST (geom);
```

Two details matter here. `ST_MakePoint` takes **longitude first**, the opposite of how people usually say coordinates. And SRID 4326 is WGS 84, the system browser geolocation and map libraries use, so its units are **degrees**, not metres. Because the column is generated, application code never writes it and it cannot drift from the latitude and longitude.

FoodMap queries this column in two main ways.

**Viewport reads.** When the user pans the map, the frontend sends the south-west and north-east corners. The query keeps every active restaurant whose point falls inside that rectangle, best rated first, capped at 200 rows:

```sql
SELECT * FROM restaurants r
WHERE r.is_active = true
  AND r.geom && ST_MakeEnvelope(:swLng, :swLat, :neLng, :neLat, 4326)
ORDER BY r.avg_rating DESC NULLS LAST
LIMIT :cap
```

**Radius reads.** The "what should I eat today?" feature can use the browser's location and needs restaurants within a real distance: 1,000 metres by default, at most 5,000. Degrees cannot express that, because a degree of longitude gets shorter away from the equator. So the query casts to `geography`, where `ST_DWithin` measures in metres:

```sql
SELECT * FROM restaurants r
WHERE r.is_active = true
  AND r.geom && ST_MakeEnvelope(:swLng, :swLat, :neLng, :neLat, 4326)
  AND ST_DWithin(CAST(r.geom AS geography),
                 CAST(ST_SetSRID(ST_MakePoint(:lng, :lat), 4326) AS geography),
                 :radius)
ORDER BY r.geom <-> ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)
LIMIT :cap
```

The `&&` box comes first because the GIST index is built on the geometry column; the geography check alone cannot use it. Java computes that box from the radius and pads it by 1% so it never cuts off a row the exact check would keep. The `<->` operator orders by distance in degrees. That is approximate, but it is only used for ordering. The distance shown to the user ("450 m away") is calculated separately in Java with the haversine formula.

One practical trap: the project writes `CAST(... AS geography)` instead of `::geography`, because a code comment records that Hibernate 6 rewrites the `::` cast inside native queries and the query fails at runtime.

## Handling Vietnamese search queries

Vietnamese tones change meaning. "Phở" is noodle soup, "phố" is a street, and "lẩu" (hotpot) is not "lầu" (floor). Users also type without accents all the time, so "pho" has to find "Phở".

`unaccent` handles the second case, but it erases the difference that matters in the first. FoodMap therefore splits the work:

1. **PostgreSQL over-matches.** Everything is compared in folded form (lowercase, no diacritics), so the database never misses a plausible hit. A small wrapper, `immutable_unaccent`, exists because `unaccent` is declared `STABLE`, and PostgreSQL only allows `IMMUTABLE` functions in index expressions.
2. **Java decides relevance.** A `VietnameseText` utility normalises both sides to Unicode NFC, unifies the two common tone placements ("hòa" and "hoà"), and tokenises into words. An accented query token must match the same accents, or an unaccented word such as "Pho" in "Viet Pho". An unaccented query token matches any word that folds to it, because the user gave no accents to respect.

Full-text search uses PostgreSQL's `simple` configuration. There is no built-in Vietnamese dictionary, and the English one would stem Vietnamese words incorrectly.

## Filtering, ranking and limiting candidates

Text search (`GET /api/v1/restaurants/search?query=...`) runs in two stages.

```mermaid The two-stage text search: a capped, generous candidate query in PostgreSQL, then relevance ranking and pagination in Java. Simplified from RestaurantSearchService.
flowchart TD
  accTitle: FoodMap two-stage restaurant text search
  accDescr: A search request first runs a candidate query in PostgreSQL that matches by name LIKE, trigram similarity, full text or a menu dish, puts names starting with the query first and stops at the candidate cap, 300 by default. If the query names a known food, a second capped query for that food's synonyms is merged in by restaurant id. The candidates and their menus go to SearchRanker in Java, which drops candidates that do not match and sorts the rest into five tiers, then by accent match, name prefix, rating and review count. The ranked list is paginated in Java and the page's restaurants are loaded and returned.
  Q["Search request<br/>query text"] --> S1["Stage 1 · PostgreSQL<br/>name LIKE, trigram, full text or menu dish<br/>prefix matches first · LIMIT cap (default 300)"]
  S1 --> K{"Query names<br/>a known food?"}
  K -- yes --> S1b["Second capped query for its synonyms<br/>merged by restaurant id"]
  K -- no --> R
  S1b --> R["Stage 2 · Java SearchRanker<br/>drops non-matches · five tiers<br/>then accent, prefix, rating, reviews"]
  R --> P["Paginate the ranked list in Java<br/>load that page's restaurants"]
  P --> O["Results page"]
```

**Stage 1: a bounded candidate set in SQL.** A restaurant becomes a candidate if any of these is true (simplified from the real query):

```sql
WHERE r.is_active = true
  AND (   immutable_unaccent(lower(r.name)) LIKE immutable_unaccent(lower(:likeAny))   -- '%query%'
       OR immutable_unaccent(lower(r.name)) % immutable_unaccent(lower(:query))         -- trigram
       OR to_tsvector('simple', immutable_unaccent(name || ' ' || address))
              @@ plainto_tsquery('simple', immutable_unaccent(:query))                  -- full text
       OR r.id IN (/* a dish on the restaurant's FoodMap menu matches */))
LIMIT :cap
```

The cap defaults to 300 (`SEARCH_CANDIDATE_CAP`). The `ORDER BY` only decides which rows survive the cap: names that start with the query first. `LIKE` wildcards in the input are escaped, and `plainto_tsquery` keeps user input from being parsed as search operators. If the query names a known food, a second capped query adds restaurants that match the food's synonyms, for example "cafe" also finding "cà phê".

**Stage 2: deterministic ranking in Java.** `SearchRanker` puts each candidate into one of five tiers, best first:

1. The whole name is the query.
2. The query appears as whole words in the name.
3. The query appears in a dish on the menu.
4. A prefix match on the last word, or trigram similarity of at least 0.30 (only for queries of four letters or more, and never across an accent conflict).
5. Only the address matches.

Inside a tier, accent-exact matches come before unaccented ones, names starting with the query come first, and then rated restaurants are ordered by rating and review count. The search API accepts an optional user location, which only breaks ties at the end. Trigram similarity decides whether a weak match is included, but never orders the results.

## Trade-offs and limitations

- **The cap is a real limit.** If a query matches more than 300 restaurants, the ranker only sees the first 300 by the stage-1 order. Pagination happens in Java over the ranked list.
- **Location is not a ranking signal in text search.** The API supports it as a tie-break, but the current search bar does not send the user's location.
- **Ranking cost grows with the candidates.** Ranking in Java keeps the Vietnamese rules testable and readable, but every search loads and ranks up to the cap. I have not benchmarked this, so I make no performance claim.
- **The `IMMUTABLE` wrapper is a contract.** It is correct only while the unaccent rules file is not changed after the indexes are built.
- **Test coverage is split.** The default test profile uses H2 with PostGIS repositories mocked, so it does not run the spatial SQL. A separate Testcontainers suite runs against real PostgreSQL/PostGIS, covering migrations, a radius boundary case and PostgreSQL-specific search.

## Lessons learned

- Decide the unit before writing the query. Degrees are fine for boxes and ordering; anything shown as a distance needs metres.
- Use the database for a cheap, generous filter, and keep language-specific relevance in code you can unit test.
- Normalise Vietnamese text deliberately: Unicode form, tone placement, and the `đ` → `d` fold all affect matching.
- Make limits explicit and configurable. A named candidate cap is easier to reason about than an accidental one.

The source is on GitHub: [FoodMap](https://github.com/trannguyendangtam1111/FoodMap).
