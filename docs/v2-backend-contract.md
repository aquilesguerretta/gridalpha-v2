# GridAlpha V2 Backend — Endpoint Contract

**Status:** Active contract for Cursor Wave 5.
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

## Versioning

This contract is version `1.0` (Wave 5). Additive changes (new fields
in `meta` or `data`) are non-breaking and ship under the same version.
Field renames or removals require a new version doc and coordinated
frontend update.
