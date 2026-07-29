# GridAlpha V2 Backend — Endpoint Contract

**Status:** Active contract for Cursor Wave 5. Endpoints 13–15 serve live
PostGIS data as of Wave 8 — see [Infrastructure data provenance](#infrastructure-data-provenance).
**Service:** `gridalpha-v2-production.up.railway.app` (Railway service `gridalpha-v2`).
**Source:** [app/](../app) (FastAPI) in this monorepo.
**Branch:** `feature/full-shell-buildout`.

This document is the source of truth that frontend hooks compile against.
Any change to a field name or response shape must be flagged to Aquiles
before either side adjusts.

---

## Legacy vs Canonical Routes

The V2 backend has historically exposed Sprint 3B/3C intelligence routes
that do **not** use the canonical `{meta, data, summary}` envelope. Those
routes are **frozen** as of Wave 5 — existing consumers can keep reading
them, but no new wiring should target them. All new frontend code must
import from the canonical paths in the table below.

| Domain | Legacy (frozen) | Canonical (Wave 5) | Envelope |
| --- | --- | --- | --- |
| Health | `GET /health` | (unchanged) | `{ status }` |
| Anthropic proxy | `POST /api/ai/complete` | (unchanged) | passthrough |
| RT LMP, single zone | — | `GET /api/lmp/current?zone=` | `{ meta, data, summary }` |
| RT LMP, all zones | — | `GET /api/lmp/all-zones` | `{ meta, data, summary }` |
| 24h LMP history, zone | — | `GET /api/lmp/24h?zone=` | `{ meta, data, summary }` |
| DA hourly forecast, zone | — | `GET /api/lmp/da-forecast?zone=&date=` | `{ meta, data, summary }` |
| DA hourly forecast, all zones | — | `GET /api/lmp/da-forecast/all-zones?date=` | `{ meta, data, summary }` |
| Historical LMP range | — | `GET /api/lmp/history?zone=&start=&end=&interval=` | `{ meta, data, summary }` |
| Spark spread | — | `GET /api/spark-spread/current?zone=&heat_rate=` | `{ meta, data, summary }` |
| Fuel mix | `GET /api/atlas/generation-fuel` (frozen) | `GET /api/fuel-mix/current` | `{ meta, data, summary }` |
| Reserve margin | — | `GET /api/reserve-margin/current?zone=` | `{ meta, data, summary }` |
| Generator outages | `GET /api/atlas/outages` (frozen) | `GET /api/outages/current` | `{ meta, data, summary }` |
| Ancillary services | — | `GET /api/ancillary/current?zone=` | `{ meta, data, summary }` |
| SSE live stream | — | `GET /api/stream` | event stream |
| Henry Hub spot | `GET /api/energy/henry-hub` (frozen) | (composed into `/api/spark-spread/current`) | passthrough |
| Binding constraints | `GET /api/atlas/binding-constraints` (frozen) | (no canonical equivalent yet) | — |
| Interface flows | `GET /api/atlas/interface-flows` (frozen) | (no canonical equivalent yet) | — |
| Substations GeoJSON | `GET /api/atlas/substations` (frozen) | (unchanged — GeoJSON is its own contract) | GeoJSON |
| Gas pipelines GeoJSON | `GET /api/atlas/gas-pipelines` (frozen) | (unchanged — GeoJSON is its own contract) | GeoJSON |
| Weather (current/forecast) | `GET /api/weather/*` (frozen) | (no canonical Wave-5 work) | passthrough |
| Peregrine RSS | `GET /api/news/*` (frozen) | (no Wave-5 changes) | passthrough |

**Rule of thumb for frontend agents:** if both a legacy and a canonical
route exist for the same data, import the canonical one. The legacy
routes will not be deleted in Wave 5 but they will not gain new fields.

---

## Canonical Envelope

Every Wave-5 endpoint returns:

```json
{
  "meta":    { /* timestamps, scope, source provenance */ },
  "data":    { /* the payload */ },
  "summary": "Short human-readable line for AI assistants and tooltips."
}
```

`meta` always carries an ISO-8601 `timestamp` and (where applicable) a
`data_age_seconds` integer so consumers can decide whether to render
the value as live, stale, or simulated.

---

## Endpoint Contract

### ENDPOINT 1 — Real-time LMP for one zone

`GET /api/lmp/current?zone={zone_id}`

Query params:

- `zone` (required, string, one of the 20 PJM zone IDs:
  `WEST_HUB`, `COMED`, `AEP`, `ATSI`, `DAY`, `DEOK`, `DUQ`, `DOMINION`,
  `DPL`, `EKPC`, `PPL`, `PECO`, `PSEG`, `JCPL`, `PEPCO`, `BGE`, `METED`,
  `PENELEC`, `RECO`, `OVEC`)

Response (200):

```json
{
  "meta": {
    "zone": "WEST_HUB",
    "timestamp": "2026-05-03T14:35:00Z",
    "data_age_seconds": 23,
    "source": "pjm-rt"
  },
  "data": {
    "lmp_total": 35.90,
    "lmp_energy": 31.20,
    "lmp_congestion": 4.50,
    "lmp_loss": 0.20,
    "delta_pct_5min": 0.5
  },
  "summary": "WEST_HUB LMP $35.90/MWh, +0.5% over last 5 min."
}
```

Cache TTL: 60s. Stale-while-revalidate acceptable.

### ENDPOINT 2 — Real-time LMP for all 20 zones

`GET /api/lmp/all-zones`

Response (200):

```json
{
  "meta": { "timestamp": "...", "data_age_seconds": "...", "zone_count": 20 },
  "data": {
    "WEST_HUB": { "lmp_total": 35.90, "delta_pct_5min": 0.5 },
    "COMED":    { "lmp_total": 32.04, "delta_pct_5min": -0.8 }
  },
  "summary": "20 zones reporting. Average $34.12, range $31.20-$42.10."
}
```

Cache TTL: 60s. Used by GridAtlasMap zone fill, Trader Nest
ZoneWatchlist, and the Cmd+P data-point query service.

### ENDPOINT 3 — 24-hour LMP history for one zone

`GET /api/lmp/24h?zone={zone_id}`

Response (200):

```json
{
  "meta": { "zone": "WEST_HUB", "interval_minutes": 5, "row_count": 288 },
  "data": [
    { "timestamp": "2026-05-02T14:35:00Z", "lmp_total": 28.40 },
    { "timestamp": "2026-05-02T14:40:00Z", "lmp_total": 28.55 }
  ],
  "summary": "24h range $24.80-$42.10, average $34.20, peak at 17:35 ET."
}
```

Cache TTL: 5 minutes. Used by LMP24HChart in TraderNest and
the Analytics > Price Intelligence tab.

### ENDPOINT 4 — Day-ahead hourly LMP forecast for one zone

`GET /api/lmp/da-forecast?zone={zone_id}&date={YYYY-MM-DD}`

`date` param defaults to tomorrow if omitted.

Response (200):

```json
{
  "meta": { "zone": "PSEG", "market_date": "2026-05-04", "interval": "hourly" },
  "data": [
    { "hour": 0, "lmp": 28.40 },
    { "hour": 1, "lmp": 26.80 }
  ],
  "summary": "Day-ahead PSEG forecast: peak $58.40 at hour 18, trough $26.20 at hour 4."
}
```

Cache TTL: 1 hour. Used by Storage DA Bid Optimizer.

### ENDPOINT 5 — Historical LMP for date range

`GET /api/lmp/history?zone={zone_id}&start={ISO}&end={ISO}&interval={5min|hourly}`

Query params:

- `zone` (required)
- `start`, `end` (required, ISO timestamps; max range 168 hours / 7 days)
- `interval` (optional, default `5min`)

Response (200):

```json
{
  "meta": {
    "zone": "PSEG",
    "start": "2022-12-23T00:00:00Z",
    "end": "2022-12-26T23:55:00Z",
    "interval_minutes": 5,
    "row_count": 1152
  },
  "data": [{ "timestamp": "...", "lmp_total": "..." }],
  "summary": "Storm Elliott Dec 23-26 2022. Range $18.40-$2,120.50. Peak at Dec 24 06:30 ET."
}
```

Cache TTL: indefinite (historical data doesn't change).
**PRIORITIZE this endpoint** — Atlas time-travel is one of the
platform's defining features and it currently runs on curated mocks.

### ENDPOINT 6 — Spark spread (LMP minus gas-equivalent cost)

`GET /api/spark-spread/current?zone={zone_id}&heat_rate={btu_per_kwh}`

`heat_rate` defaults to `7500` (typical CCGT).

Response (200):

```json
{
  "meta": { "zone": "PSEG", "heat_rate": 7500, "gas_price_mmbtu": 3.42, "timestamp": "..." },
  "data": {
    "lmp_total": 38.40,
    "gas_equivalent_cost": 25.65,
    "spark_spread": 12.75,
    "regime": "BURNING"
  },
  "summary": "PSEG spark spread $12.75/MWh, BURNING regime. Gas $3.42/MMBtu, heat rate 7500."
}
```

Regime classification: `BURNING > $5`, `NORMAL $0-5`, `SUPPRESSED < $0`.
Cache TTL: 60s. Henry Hub gas price from EIA, refreshed daily.

### ENDPOINT 7 — Generation fuel mix snapshot

`GET /api/fuel-mix/current`

Response (200):

```json
{
  "meta": { "timestamp": "...", "footprint": "PJM" },
  "data": {
    "fuels": [
      { "fuel": "natural_gas", "mw": 48200, "pct": 38.4, "carbon_intensity_kg_per_mwh": 412 },
      { "fuel": "nuclear",     "mw": 32100, "pct": 25.6, "carbon_intensity_kg_per_mwh": 0 },
      { "fuel": "coal",        "mw": 18400, "pct": 14.7, "carbon_intensity_kg_per_mwh": 920 },
      { "fuel": "wind",        "mw": 12800, "pct": 10.2, "carbon_intensity_kg_per_mwh": 0 },
      { "fuel": "solar",       "mw":  8200, "pct":  6.5, "carbon_intensity_kg_per_mwh": 0 },
      { "fuel": "hydro",       "mw":  3100, "pct":  2.5, "carbon_intensity_kg_per_mwh": 0 },
      { "fuel": "oil",         "mw":  1300, "pct":  1.0, "carbon_intensity_kg_per_mwh": 740 },
      { "fuel": "other",       "mw":  1500, "pct":  1.2, "carbon_intensity_kg_per_mwh": 200 }
    ],
    "total_mw": 125600,
    "system_carbon_intensity_kg_per_mwh": 367
  },
  "summary": "PJM at 125.6 GW. Gas-led at 38%, nuclear 26%, coal 15%."
}
```

Cache TTL: 5 minutes.

### ENDPOINT 8 — Resource adequacy / reserve margin

`GET /api/reserve-margin/current?zone={zone_id|all}`

Response (200) for `zone=all`:

```json
{
  "meta": { "timestamp": "...", "scope": "PJM" },
  "data": {
    "load_actual_mw": 112400,
    "load_forecast_mw": 113800,
    "available_capacity_mw": 138200,
    "reserve_margin_pct": 22.9,
    "regime": "ADEQUATE"
  },
  "summary": "PJM reserve margin 22.9%, ADEQUATE."
}
```

Regime: `TIGHT < 12%`, `ADEQUATE 12-25%`, `COMFORTABLE > 25%`.

### ENDPOINT 9 — Generator outage feed

`GET /api/outages/current`

Response (200):

```json
{
  "meta": { "timestamp": "...", "outage_count": 4 },
  "data": [
    {
      "generator": "Salem 2",
      "zone": "PSEG",
      "capacity_mw": 1170,
      "outage_type": "FORCED",
      "start_timestamp": "2026-05-02T18:42:00Z",
      "expected_return": null,
      "fuel_type": "nuclear"
    }
  ],
  "summary": "4 forced outages totaling 2,840 MW. Largest: Salem 2 (1170 MW, PSEG)."
}
```

Cache TTL: 5 minutes. Drives Trader Nest AnomalyFeed and Atlas
outage markers.

When PJM only exposes the fuel-aggregated outage feed at our subscription
tier, the response carries `meta.degraded_mode = true` and `data` rows
collapse to one entry per fuel family.

### ENDPOINT 10 — Ancillary services market clearing prices

`GET /api/ancillary/current?zone={zone_id|all}`

Response (200):

```json
{
  "meta": { "timestamp": "...", "market": "PJM-ASM" },
  "data": {
    "regulation_d_mcp": 18.40,
    "regulation_a_mcp": 11.20,
    "spinning_reserve_mcp": 4.80,
    "regulation_mileage_payment": 28.20
  },
  "summary": "Reg-D $18.40/MW, Reg-A $11.20, Spin $4.80, Mileage $28.20/MWh."
}
```

Cache TTL: 5 minutes. Drives Storage DA Bid Optimizer's
ancillary stacking.

### ENDPOINT 11 — Day-ahead hourly LMP forecast for ALL zones

`GET /api/lmp/da-forecast/all-zones?date={YYYY-MM-DD}`

Response shape: same as Endpoint 4 but `data` is keyed by zone:

```json
{
  "meta": { "...": "..." },
  "data": {
    "WEST_HUB": [{ "hour": 0, "lmp": "..." }],
    "COMED":    [{ "hour": 0, "lmp": "..." }]
  },
  "summary": "..."
}
```

Used by Storage DA Bid Optimizer when fleet has assets across
multiple zones.

### ENDPOINT 12 — Real-time SSE stream for live updates

`GET /api/stream`

Server-sent events stream. On connection, the server pushes a
frame every 5 minutes (matching PJM's 5-min RT interval) plus
on every incoming PJM data refresh.

Frame format:

```
event: lmp-update
data: {"zone":"WEST_HUB","lmp_total":35.90,"timestamp":"...","data_age_seconds":3}

event: outage
data: {"generator":"Salem 2","zone":"PSEG","capacity_mw":1170,"event":"start","timestamp":"..."}

event: heartbeat
data: {"timestamp":"..."}
```

Heartbeat every 30 seconds. Reconnect on connection drop.

Used by FORGE Wave 5's `useLMPStream` hook.

### ENDPOINT 13 — Generation units by viewport (EIA 860 + PostGIS)

`GET /api/infra/generation-units`

Static, annually refreshed EIA Form 860 generator fleet (battery technologies
excluded — those are Endpoint 15). Returns `GenerationUnit[]` in **camelCase**
matching `src/lib/types/infrastructure.ts`.

Query params:

- `bbox` (required): `min_lon,min_lat,max_lon,max_lat` (WGS84).
- `iso` (optional, repeatable): one or more of `PJM`, `MISO`, `NYISO`,
  `ISO-NE`, `CAISO`, `SPP`, `ERCOT`, `WECC`, `AK`, `QC`, `OTHER`.
- `fuel` (optional, repeatable): `gas`, `coal`, `nuclear`, `wind`, `solar`,
  `hydro`, `pumped`, `biomass`, `geothermal`, `oil`, `other`.
- `min_capacity_mw` (optional, default `0`).
- `status` (optional, default `operating`): `operating` | `planned` |
  `under-construction` | `standby` | `retired` | `cancelled`.
- `limit` (optional, default `5000`, max `10000`).

Response (200) — canonical envelope; `data` is an array:

```json
{
  "meta": {
    "timestamp": "2026-05-13T01:23:45Z",
    "data_age_seconds": 0,
    "source": "eia-860+postgis",
    "count": 3,
    "truncated": false,
    "bbox": "-125,24,-66,49",
    "iso_filter": ["PJM"],
    "fuel_filter": null,
    "min_capacity_mw": 0,
    "status": "operating",
    "limit": 5000
  },
  "data": [
    {
      "id": "eia-3-1",
      "eiaPlantId": 3,
      "eiaGeneratorId": "1",
      "name": "Barry Steam Plant",
      "owner": "Alabama Power Co",
      "iso": "OTHER",
      "state": "AL",
      "lat": 31.0098,
      "lon": -88.0103,
      "fuel": "coal",
      "capacityMw": 250.0,
      "status": "operating",
      "codDate": "1954-06-01",
      "retirementDate": null
    }
  ],
  "summary": "3 generation units in viewport (PJM, operating)."
}
```

`truncated` is `true` when the server applied `limit` and additional rows
would have matched the filter. On filter/bbox errors the API returns **422**
with a plain `detail` string.

Cache TTL: long (static dataset). Rate limit: none beyond Railway defaults.

### ENDPOINT 14 — Transmission segments by viewport + LOD (HIFLD + PostGIS)

`GET /api/infra/transmission`

High-voltage transmission (≥115 kV) from HIFLD-sourced geometries stored with
three simplification tiers. `data` is `TransmissionSegment[]`; `geometry` is
`[[lon,lat], ...]` (**not** a GeoJSON Feature wrapper).

Query params:

- `bbox` (required): `min_lon,min_lat,max_lon,max_lat`.
- `lod` (required): `low` | `mid` | `high` — selects `geom_low`, `geom_mid`, or
  full `geom` respectively.
- `voltage_min_kv` (optional): defaults by LOD — `low=345`, `mid=230`, `high=115`.
- `voltage_max_kv` (optional): upper bound in kV; must be ≥ `voltage_min_kv`.
- `iso` (optional, repeatable): same ISO codes as Endpoint 13.
- `limit` (optional, default `10000`, max `10000`).

Response (200):

```json
{
  "meta": {
    "timestamp": "2026-05-13T01:23:45Z",
    "data_age_seconds": 0,
    "source": "hifld+postgis",
    "count": 1,
    "truncated": false,
    "bbox": "-125,24,-66,49",
    "lod": "low",
    "voltage_min_kv": 345,
    "voltage_max_kv": null,
    "iso_filter": null,
    "limit": 10000
  },
  "data": [
    {
      "id": "100005",
      "voltageKv": 345,
      "name": "SUB A – SUB B",
      "owner": "EXAMPLE OWNER",
      "iso": "PJM",
      "geometry": [[-77.02, 38.9], [-77.01, 38.91]],
      "segmentLengthKm": 1.25
    }
  ],
  "summary": "1 transmission segments in viewport (all ISOs, lod=low, ≥345 kV)."
}
```

Performance expectation: for a continental US `bbox`, `lod=low` should produce a
payload an order of magnitude smaller than `lod=high` with the same filters
(coarser geometry + higher default voltage floor).

422 on invalid `bbox`, `lod`, ISO codes, or voltage range. Cache TTL: long.

### ENDPOINT 15 — Battery storage assets by viewport (EIA 860M + PostGIS)

`GET /api/infra/batteries`

Monthly EIA Form 860M battery/energy-storage rows. `data` is `BatteryAsset[]`
(camelCase).

Query params:

- `bbox` (required).
- `iso` (optional, repeatable).
- `min_capacity_mw` (optional, default `0`).
- `status` (optional, default `operating`).
- `limit` (optional, default `2000`, max `50000` on the server; prefer ≤10k for UI).

Response (200):

```json
{
  "meta": {
    "timestamp": "2026-05-13T01:23:45Z",
    "data_age_seconds": 0,
    "source": "eia-860m+postgis",
    "count": 1,
    "truncated": false,
    "bbox": "-125,24,-66,49",
    "iso_filter": ["CAISO"],
    "min_capacity_mw": 0,
    "status": "operating",
    "limit": 2000
  },
  "data": [
    {
      "id": "eia-123-1",
      "eiaPlantId": 123,
      "eiaGeneratorId": "1",
      "name": "Example Battery",
      "owner": null,
      "iso": "CAISO",
      "state": "CA",
      "lat": 34.05,
      "lon": -118.25,
      "capacityMw": 100.0,
      "capacityMwh": 400.0,
      "durationHours": 4.0,
      "status": "operating",
      "codDate": "2024-01-01",
      "retirementDate": null
    }
  ],
  "summary": "1 battery assets in viewport (CAISO, operating)."
}
```

500/503 may occur if `DATABASE_URL` / PostGIS is misconfigured. 422 on invalid
parameters.

---

## Operational Notes

- **Auth.** PJM Data Miner 2 via `PJM_USERNAME` / `PJM_PASSWORD`
  (ForgeRock SSO with cached `tokenId`) or `PJM_SUBSCRIPTION_KEY`
  (Azure APIM) — whichever the Railway env exposes.
- **Pagination.** PJM caps responses at 100 rows. Endpoints 3 and 5
  loop with `startRow=1,101,201,...` until the page comes back short.
- **Caching.** All endpoints use the in-process TTL cache from
  `app/services/intelligence_cache.py`. Cache keys are scoped per
  zone + interval so single-zone and all-zones caches are independent.
- **Static carbon-intensity table.** Endpoint 7 enriches PJM's raw
  fuel rows with a per-family carbon-intensity constant (kg CO2/MWh):
  `natural_gas=412`, `coal=920`, `oil=740`, `other=200`,
  `nuclear=0`, `wind=0`, `solar=0`, `hydro=0`. System intensity is
  `Sigma(mw * ci) / Sigma(mw)`.
- **Spark spread regimes.** `BURNING > $5`, `NORMAL $0-5`,
  `SUPPRESSED < $0`. Heat rate default `7500` BTU/kWh (typical CCGT).
- **Reserve regimes.** `TIGHT < 12%`, `ADEQUATE 12-25%`,
  `COMFORTABLE > 25%`.

---

## Infrastructure data provenance

Endpoints 13–15 read three PostGIS tables created by migration
`0001_postgis_infrastructure` and populated by the ingest scripts in
`app/scripts/`. The database is the `PostGIS 17` service in Railway project
`rare-victory` (PostGIS 3.7.0dev on PostgreSQL 17.9).

Loaded on 2026-07-29:

| Table | Rows | Source | Runtime |
| --- | --- | --- | --- |
| `generation_units` | 34,347 | EIA 860, 2025 Early Release | 91 s |
| `battery_assets` | 1,609 | EIA 860M, `june_generator2026.xlsx` | 23 s |
| `transmission_segments` | 37,947 | HIFLD FeatureServer, ≥115 kV | 204 s |

Refresh (from repo root, with `DATABASE_URL` in the environment):

```bash
py -3 -m app.scripts.ingest_eia_860
py -3 -m app.scripts.ingest_eia_860m
py -3 -m app.scripts.ingest_hifld_transmission
```

All three upsert on `id`, so re-running is idempotent and safe to interrupt.

### Counting units

`generation_units` counts **generators**, not plants — a combined-cycle site
contributes several rows. The 2025 archive holds 34,347 generators across
16,900 plants. The table also carries retired (5,565) and planned (2,015)
units, because `status` and `retirement_date` exist to express them; clients
that want only live capacity must filter on `status`, which Endpoint 13 does
by default.

`transmission_segments` holds 37,947 rows built from 38,353 upserts — HIFLD
reuses `ID` across 406 features, and `ON CONFLICT` collapses them.

### Source formats that moved after Wave 7

The ingest scripts were written in Wave 7 and first executed in Wave 8. Four
breakages surfaced, all fixed in the scripts, none requiring a schema change:

- **EIA renamed the annual archive** from `f860YYYY.zip` to `eia860YYYY.zip`,
  and now also ships `eia860YYYYER.zip` (early release). `EIA_860_ZIP_URL`
  pins a specific archive; otherwise the newest year wins, with the final
  archive outranking the early release for the same year.
- **EIA workbooks open with a two-row title banner**, so the header is not the
  first row. Both EIA scripts now scan for the header instead of assuming it.
- **Coordinates are not in schedule `3_1_Generator`** — they live in
  `2___Plant`, keyed by plant code. `ingest_eia_860` joins the two.
- **860M spells the month out** (`june_generator2026.xlsx`), and names its
  state column `Plant State`.

No EIA API key is required — all three sources are unauthenticated bulk
downloads. `EIA_API_KEY` exists in the service environment for the Henry Hub
routes and is unrelated to these three.

`ST_Simplify` returns `NULL` when the tolerance collapses a line, which the
`NOT NULL` on `geom_mid` / `geom_low` rejects. Segments shorter than roughly
111 m (mid) or 1.1 km (low) therefore store the full geometry via `COALESCE`
rather than a degenerate stub.

### LOD compression, measured

Same CONUS bbox, `voltage_min_kv=345` and `limit=10000` held constant across
all three LODs, so geometry is the only variable:

| LOD | Payload | Vertices |
| --- | --- | --- |
| `high` | 9,023,881 B | 302,283 |
| `mid` | 1,685,929 B | 44,274 |
| `low` | 878,236 B | 15,800 |

That is **10.3× payload** and 19.1× vertices between `high` and `low`. Left at
each LOD's default voltage floor the payload ratio reaches 13.9×, and that
figure understates the real gap because `high` truncates at the 10,000-row cap.

### Known path mismatch

`src/services/api/transmission.ts` calls `/api/infra/transmission-segments`.
The route is `/api/infra/transmission` (Endpoint 14). The frontend service is
ATLAS-owned, so the backend was left alone; Atlas will not render transmission
until the two agree.

---

## Platform identity (Wave 9)

One account per person at the platform level, not per product. Alexandria,
Portal Brasil and the future US terminal all read this base — none of them
keeps its own user store. Creating an account activates nothing; a product
becomes active only when the user enters it. **No payment gate in this wave**,
by explicit decision.

### Response shape — not the canonical envelope

Endpoints 16–21 return plain JSON, **not** the `{meta, data, summary}` envelope
of Endpoints 1–15. That envelope exists to carry data-freshness affordances
(`timestamp`, `data_age_seconds`) for market and infrastructure reads, and none
of it means anything for an identity call. The whole identity domain sits on one
shape rather than splitting mid-domain.

### Session transport

The session is a **stateless JWT** (HS256, `iss: gridalpha`, 30-day expiry)
signed with `JWT_SECRET`. Validation is a signature check, so it holds no state
in the backend process.

A caller may present the token two ways, and the endpoints accept either:

| Transport | How | Renewal |
| --- | --- | --- |
| `httpOnly` cookie | Set automatically on signup/login | Slides forward on every authenticated request |
| `Authorization: Bearer <token>` | Caller supplies the header | None in this wave — re-authenticate at expiry |

`Authorization` wins over the cookie when both are present: explicit beats
ambient.

The raw token appears in the response body **only** when the request carries
`X-Auth-Transport: bearer`. A browser therefore receives the token in the
httpOnly cookie and nowhere else, so nothing readable by XSS lands in the
payload; native and cross-domain callers opt in and read it themselves.

Cookie attributes are environment-driven, with defaults tuned for today's
same-origin Railway deploy. **The final domain topology is undecided** — see
the Wave 9 section of `CLAUDE.md`.

| Variable | Default | Notes |
| --- | --- | --- |
| `JWT_SECRET` | *(none)* | Required. Absent → identity endpoints answer 503; the rest of the API is unaffected. |
| `SESSION_TTL_DAYS` | `30` | |
| `SESSION_COOKIE_NAME` | `ga_session` | |
| `SESSION_COOKIE_SAMESITE` | `lax` | `lax` \| `strict` \| `none` |
| `SESSION_COOKIE_SECURE` | `true` | Forced `true` when sameSite is `none` — browsers reject the pair otherwise. |
| `SESSION_COOKIE_DOMAIN` | *(empty)* | Empty = host-only. Set to e.g. `.gridalpha.com` for sibling subdomains. |
| `SESSION_COOKIE_PATH` | `/` | |

### ENDPOINT 16 — Sign up with email and password

`POST /api/auth/signup`

Request: `{ "email": "a@b.com", "password": "min 8 chars", "name": "Full Name" }`

Response (201) — plus `Set-Cookie: ga_session=…; HttpOnly; Secure; SameSite=lax; Path=/`:

```json
{
  "user": {
    "id": "1f0c…",
    "email": "a@b.com",
    "name": "Full Name",
    "authMethods": ["password"],
    "createdAt": "2026-07-29T15:04:05+00:00",
    "updatedAt": "2026-07-29T15:04:05+00:00"
  },
  "expiresAt": "2026-08-28T15:04:05+00:00"
}
```

`409` if the address is already registered — case-insensitively, since email is
normalised to lower case on every write and lookup. `422` on a malformed
address, a password under 8 characters, or a blank name. Reserved TLDs
(`.test`, `.invalid`, `.localhost`) are rejected by the validator.

### ENDPOINT 17 — Log in

`POST /api/auth/login`

Request: `{ "email": "a@b.com", "password": "…" }`. Response (200) is identical
in shape to Endpoint 16.

`401` with the single message `invalid email or password` for **every** failure
mode — unknown address, wrong password, and a Google-only account are
deliberately indistinguishable, or the endpoint becomes an oracle for which
addresses are registered.

### ENDPOINT 18 — Log out

`POST /api/auth/logout` → `200 {"ok": true}` and an expired cookie.

Clears the browser's copy and nothing else. The token is stateless by design, so
a Bearer token already in a caller's hands stays valid until it expires. Real
revocation needs a denylist or short access tokens plus refresh — neither is in
this wave.

### ENDPOINT 19 — Current user

`GET /api/auth/me` → `200 {"user": { … }}`, same user object as Endpoint 16.

`401` when no token, an expired token, a tampered signature, or a token whose
user row no longer exists. Refreshes the session cookie when the token arrived
by cookie.

### ENDPOINT 20 — Activate a product

`POST /api/products/{product_id}/activate`

Authenticated. **Idempotent** — enforced by `ON CONFLICT DO NOTHING` against
`UNIQUE(user_id, product_id)`, so two simultaneous clicks cannot write two rows.

```json
{ "productId": "alexandria", "activatedAt": "2026-07-29T15:04:05+00:00", "alreadyActive": false }
```

`alreadyActive` distinguishes a first activation from a repeat; `activatedAt`
keeps the original timestamp on repeats. `404` for an id outside the catalog —
a path segment naming no resource is a missing resource, not a malformed field.
`401` unauthenticated.

### ENDPOINT 21 — Products activated by the current user

`GET /api/products/me`

```json
{
  "products": [
    { "productId": "alexandria", "activatedAt": "2026-07-29T15:04:05+00:00" }
  ],
  "catalog": [
    "alexandria", "terminal-brasil", "energy-brief",
    "conta-de-luz-express", "diagnostico-energetico", "us-terminal"
  ]
}
```

`products` is ordered by activation time and is empty for a fresh account.
`catalog` is the canonical backend list, served so the frontend reads it instead
of keeping a second hardcoded copy that can drift. `401` unauthenticated.

### Google OAuth — not shipped

`GET /api/auth/google/start` and `GET /api/auth/google/callback` are **absent**.
The Wave 9 audit found no `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` in the
Railway environment, and a placeholder pretending to work was forbidden. The
schema is already prepared: `users.google_id` exists with a UNIQUE constraint,
and the `users_has_auth_method` CHECK permits a row with `password_hash NULL`.

When the credentials arrive, callback resolution must be: look up `google_id`;
failing that look up the email and **link** `google_id` to the existing row;
only if neither matches create a new user. Never a second account for an
address that already exists under another method.

---

## Versioning

This contract is version `1.0` (Wave 5). Wave 7 adds Endpoints 13–15
(infrastructure viewport APIs) and Wave 9 adds Endpoints 16–21 (platform
identity) additively under the same version.
Additive changes (new fields in `meta` or `data`) remain non-breaking.
Field renames or removals require a new version doc and coordinated
frontend update.
