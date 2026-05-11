# Wave 5 — V2 Backend Cursor Validation

Validation log for the Wave 5 canonical endpoints. All 12/12 endpoints
verified live against the V2 deployment on
`gridalpha-v2-production.up.railway.app` (branch
`feature/full-shell-buildout`) after the PJM auth + request-shape fix
landed.

Captured 2026-05-11 against the live PJM Data Miner 2 public feeds.

## Smoke test

```
$ npx tsx scripts/smoke-test.ts

GridAlpha V2 smoke test - https://gridalpha-v2-production.up.railway.app

[Endpoint 1 - /api/lmp/current] OK
[Endpoint 2 - /api/lmp/all-zones] OK
[Endpoint 3 - /api/lmp/24h] OK
[Endpoint 4 - /api/lmp/da-forecast] OK
[Endpoint 5 - /api/lmp/history (Storm Elliott)] OK
[Endpoint 6 - /api/spark-spread/current] OK (degraded_mode)
[Endpoint 7 - /api/fuel-mix/current] OK
[Endpoint 8 - /api/reserve-margin/current] OK (degraded_mode)
[Endpoint 9 - /api/outages/current] OK (degraded_mode)
[Endpoint 10 - /api/ancillary/current] OK
[Endpoint 11 - /api/lmp/da-forecast/all-zones] OK
[Endpoint 12 - /api/stream] OK - first frame received

12/12 passed
```

Three endpoints flag `meta.degraded_mode=true`. These are honest
constraints of the public PJM API surface, not bugs; each surfaces
the reason in `meta.fallback_reason` or `meta.notes`. See
[Known degradations](#known-degradations) below.

## Endpoint-by-endpoint validation

### Endpoint 1 — `GET /api/lmp/current?zone=PSEG`

```
$ curl -sS https://gridalpha-v2-production.up.railway.app/api/lmp/current?zone=PSEG
{
  "meta": {
    "zone": "PSEG",
    "timestamp": "2026-05-11T17:00:00",
    "data_age_seconds": 5641,
    "source": "pjm-rt"
  },
  "data": {
    "lmp_total": 31.48,
    "lmp_energy": 31.4,
    "lmp_congestion": -0.35,
    "lmp_loss": 0.44,
    "delta_pct_5min": 0.0
  },
  "summary": "PSEG LMP $31.48/MWh, +0.0% vs prior hour."
}
```

`delta_pct_5min` keeps its contract field name for frontend stability
but is now hour-over-hour, matching the underlying dataset cadence.

### Endpoint 2 — `GET /api/lmp/all-zones`

```
$ curl -sS https://gridalpha-v2-production.up.railway.app/api/lmp/all-zones
{
  "meta": {
    "timestamp": "2026-05-11T17:00:00",
    "data_age_seconds": 5658,
    "zone_count": 20,
    "source": "pjm-rt"
  },
  "summary": "20 zones reporting. Average $31.27, range $29.76-$32.85.",
  "data": {
    "WEST_HUB": { "lmp_total": 31.61, "delta_pct_5min": 0.0 },
    "COMED":    { "lmp_total": 29.9,  "delta_pct_5min": 0.0 },
    "AEP":      { "lmp_total": 31.24, "delta_pct_5min": 0.0 },
    "...":      "(17 more zones)"
  }
}
```

Implementation note: this is two PJM calls total (`type=ZONE` and
`type=HUB`) rather than the original 20-way fan-out.

### Endpoint 3 — `GET /api/lmp/24h?zone=WEST_HUB`

```
$ curl -sS "https://gridalpha-v2-production.up.railway.app/api/lmp/24h?zone=WEST_HUB"
{
  "meta": {
    "timestamp": "2026-05-11T18:34:20Z",
    "zone": "WEST_HUB",
    "interval_minutes": 60,
    "row_count": 24,
    "start": "2026-05-10T18:00:00Z",
    "end":   "2026-05-11T18:00:00Z",
    "source": "pjm-rt"
  },
  "summary": "24h range $21.23-$132.0, average $44.94, peak at 19:00 ET.",
  "data": [
    { "timestamp": "2026-05-10T18:00:00Z", "lmp_total": 32.92 },
    "...",
    { "timestamp": "2026-05-11T17:00:00Z", "lmp_total": 31.61 }
  ]
}
```

Hourly cadence (`interval_minutes=60`), 24 rows. The public 5-minute
feed (`rt_unverified_fivemin_lmps`) refuses the `type=ZONE|HUB`
filter, so V1 and V2 both standardize on the hourly feed for zonal
RT pricing.

### Endpoint 4 — `GET /api/lmp/da-forecast?zone=PSEG&date=`

```
$ curl -sS "https://gridalpha-v2-production.up.railway.app/api/lmp/da-forecast?zone=PSEG&date=2026-05-12"
{
  "meta": {
    "timestamp": "2026-05-11T18:34:00Z",
    "zone": "PSEG",
    "date": "2026-05-12",
    "source": "pjm-da"
  },
  "summary": "DA forecast for PSEG on 2026-05-12. Range $25.10-$87.41, peak 18:00 ET.",
  "data": [
    { "hour": 0,  "lmp": 28.10 },
    { "hour": 1,  "lmp": 26.32 },
    "...",
    { "hour": 23, "lmp": 30.05 }
  ]
}
```

24 hourly DA forecast points (one per hour-ending) for the requested
EPT calendar date. Default `date` is tomorrow EPT.

### Endpoint 5 — `GET /api/lmp/history?zone=&start=&end=&interval=`

Storm Elliott, December 2022, the headline PJM stress event:

```
$ curl -sS "https://gridalpha-v2-production.up.railway.app/api/lmp/history?zone=PSEG&start=2022-12-23T00:00:00Z&end=2022-12-26T23:55:00Z&interval=hourly"
{
  "meta": {
    "timestamp": "2026-05-11T18:35:00Z",
    "zone":  "PSEG",
    "start": "2022-12-23T00:00:00Z",
    "end":   "2022-12-26T23:55:00Z",
    "interval_minutes": 60,
    "row_count": 96,
    "source": "pjm-rt-verified"
  },
  "summary": "PSEG 2022-12-23 to 2022-12-26. Range $33.95-$3502.71, average $790.42. Peak at Dec 24 04:00 ET.",
  "data": [
    { "timestamp": "2022-12-23T05:00:00Z", "lmp_total": 47.42 },
    "...",
    { "timestamp": "2022-12-24T09:00:00Z", "lmp_total": 3502.71 },
    "...",
    { "timestamp": "2022-12-27T04:00:00Z", "lmp_total": 35.10 }
  ]
}
```

96 hourly rows over 4 days, peak $3,502.71/MWh on the morning of Dec 24
EPT — the documented Storm Elliott price spike, fetched from PJM's
verified hourly archive (`rt_hrl_lmps`).

### Endpoint 6 — `GET /api/spark-spread/current?zone=PSEG`

```
$ curl -sS "https://gridalpha-v2-production.up.railway.app/api/spark-spread/current?zone=PSEG"
{
  "meta": {
    "zone": "PSEG",
    "heat_rate": 7500,
    "gas_price_mmbtu": 4.0,
    "gas_price_source": "static-fallback",
    "timestamp": "2026-05-11T17:00:00",
    "data_age_seconds": 5641,
    "source": "pjm-rt+static-fallback",
    "degraded_mode": true,
    "fallback_reason": "EIA Henry Hub unreachable (HTTPStatusError); using static fallback"
  },
  "data": {
    "lmp_total": 31.48,
    "gas_equivalent_cost": 30.0,
    "spark_spread": 1.48,
    "regime": "NORMAL"
  },
  "summary": "PSEG spark spread $1.48/MWh, NORMAL regime. Gas $4.00/MMBtu, heat rate 7500."
}
```

LMP comes directly from PJM. Gas price falls back to V1's hardcoded
`$4.00/MMBtu` when the EIA Henry Hub call returns 4xx — see
[Known degradations](#known-degradations).

### Endpoint 7 — `GET /api/fuel-mix/current`

```
$ curl -sS https://gridalpha-v2-production.up.railway.app/api/fuel-mix/current
{
  "meta": {
    "timestamp": "2026-05-11T13:00:00",
    "footprint": "PJM",
    "source": "pjm-gen-by-fuel"
  },
  "summary": "PJM at 87.2 GW. nuclear 35%, natural gas 35%, coal 13%.",
  "data": {
    "fuels": [
      { "fuel": "natural_gas", "mw": 30439.0, "pct": 34.92, "carbon_intensity_kg_per_mwh": 412 },
      { "fuel": "nuclear",     "mw": 30570.0, "pct": 35.07, "carbon_intensity_kg_per_mwh": 0   },
      { "fuel": "coal",        "mw": 10989.0, "pct": 12.61, "carbon_intensity_kg_per_mwh": 920 },
      { "fuel": "wind",        "mw": 3248.0,  "pct": 3.73,  "carbon_intensity_kg_per_mwh": 0   },
      { "fuel": "solar",       "mw": 8355.0,  "pct": 9.59,  "carbon_intensity_kg_per_mwh": 0   },
      { "fuel": "hydro",       "mw": 749.0,   "pct": 0.86,  "carbon_intensity_kg_per_mwh": 0   },
      { "fuel": "oil",         "mw": 167.0,   "pct": 0.19,  "carbon_intensity_kg_per_mwh": 740 },
      { "fuel": "other",       "mw": 2643.0,  "pct": 3.03,  "carbon_intensity_kg_per_mwh": 200 }
    ],
    "total_mw": 87160.0,
    "system_carbon_intensity_kg_per_mwh": 267.36
  }
}
```

### Endpoint 8 — `GET /api/reserve-margin/current`

```
$ curl -sS https://gridalpha-v2-production.up.railway.app/api/reserve-margin/current
{
  "meta": {
    "timestamp": "2026-05-11T17:50:00",
    "scope": "PJM",
    "source": "pjm-inst-load+load-forecast+capacity-outlook",
    "degraded_mode": true,
    "notes": [
      "capacity from static nameplate fallback (no public PJM capacity feed)"
    ]
  },
  "data": {
    "load_actual_mw": 85830.22,
    "load_forecast_mw": 85128.0,
    "available_capacity_mw": 200000.0,
    "reserve_margin_pct": 133.02,
    "regime": "COMFORTABLE"
  },
  "summary": "PJM reserve margin 133.0%, COMFORTABLE."
}
```

Live load actual (85.8 GW) and forecast (85.1 GW) come from
`inst_load` and `load_frcstd_7_day` (`forecast_area=RTO_COMBINED`
filter). Capacity is a static 200 GW nameplate — see
[Known degradations](#known-degradations).

### Endpoint 9 — `GET /api/outages/current`

```
$ curl -sS https://gridalpha-v2-production.up.railway.app/api/outages/current
{
  "meta": {
    "timestamp": "2026-05-11T18:34:03Z",
    "outage_count": 6,
    "source": "pjm-gen-outages-by-type",
    "degraded_mode": true,
    "note": "PJM does not expose a public per-unit outage feed; rows are aggregated region x outage-type buckets."
  },
  "summary": "3 forced-outage buckets totaling 17,980 MW. Largest: PJM RTO (51268 MW, PLANNED).",
  "data": [
    {
      "generator": "All PJM RTO units (PLANNED + maintenance, aggregated)",
      "zone": "PJM RTO",
      "capacity_mw": 51268.0,
      "outage_type": "PLANNED",
      "start_timestamp": "2026-05-11T00:00:00",
      "expected_return": null,
      "fuel_type": "various"
    },
    {
      "generator": "All PJM RTO units (FORCED, aggregated)",
      "zone": "PJM RTO",
      "capacity_mw": 8990.0,
      "outage_type": "FORCED",
      "start_timestamp": "2026-05-11T00:00:00",
      "expected_return": null,
      "fuel_type": "various"
    },
    "...(4 more rows for Mid Atlantic - Dominion and Western)"
  ]
}
```

6 rows total: 3 PJM regions × {FORCED, PLANNED+maintenance}. PJM RTO
is the system-wide aggregate; the two sub-regions sum to it. Frontend
can render either level.

### Endpoint 10 — `GET /api/ancillary/current`

```
$ curl -sS https://gridalpha-v2-production.up.railway.app/api/ancillary/current
{
  "meta": {
    "timestamp": "2026-05-11T03:00:00",
    "market": "PJM-ASM",
    "source": "pjm-ancillary-services"
  },
  "data": {
    "regulation_d_mcp": 101.55,
    "regulation_a_mcp": 101.45,
    "spinning_reserve_mcp": 19.81,
    "regulation_mileage_payment": 0.1
  },
  "summary": "Reg-D $101.55/MW, Reg-A $101.45, Spin $19.81, Mileage $0.10/MWh."
}
```

`ancillary_services` is a long-format feed (one row per service ×
unit per hour). Contract mapping:

| Contract field              | PJM row                              |
| --------------------------- | ------------------------------------ |
| `regulation_a_mcp`          | `RTO Regulation Capability` (Price)  |
| `regulation_d_mcp`          | `RTO Regulation Capability` + `RTO Regulation Mileage` (Price) |
| `spinning_reserve_mcp`      | `RTO Synchronized Reserve` (Price)   |
| `regulation_mileage_payment`| `RTO Regulation Mileage` (Price)     |

### Endpoint 11 — `GET /api/lmp/da-forecast/all-zones?date=`

```
$ curl -sS "https://gridalpha-v2-production.up.railway.app/api/lmp/da-forecast/all-zones?date=2026-05-12"
{
  "meta": {
    "timestamp": "2026-05-11T18:35:00Z",
    "date": "2026-05-12",
    "zone_count": 20,
    "source": "pjm-da"
  },
  "summary": "DA forecast 2026-05-12 for 20 zones. Peak average $76.21 at 18:00 ET.",
  "data": {
    "WEST_HUB": [ { "hour": 0, "lmp": 27.10 }, "..." ],
    "PSEG":     [ { "hour": 0, "lmp": 28.45 }, "..." ],
    "...":      "(18 more zones)"
  }
}
```

Two PJM calls total (`type=ZONE`, `type=HUB`), 24 hourly rows per
contract zone.

### Endpoint 12 — `GET /api/stream` (SSE)

```
$ curl -sS -N -H "Accept: text/event-stream" https://gridalpha-v2-production.up.railway.app/api/stream

event: heartbeat
data: {"phase":"connected","timestamp":"2026-05-11T18:35:01Z"}

event: lmp-update
data: {"zone":"WEST_HUB","lmp_total":31.61,"delta_pct_5min":0.0,"timestamp":"2026-05-11T17:00:00","data_age_seconds":5701}

event: heartbeat
data: {"timestamp":"2026-05-11T18:35:31Z"}

event: outage
data: {"generator":"All PJM RTO units (FORCED, aggregated)","zone":"PJM RTO","capacity_mw":8990.0,"event":"snapshot","timestamp":"2026-05-11T18:34:03Z"}
```

Three event types: `lmp-update`, `outage`, `heartbeat`. First frame
is the `connected` heartbeat; subsequent updates fire as the in-
process hub re-polls the canonical endpoints.

## Known degradations

These three endpoints carry `meta.degraded_mode=true` permanently
under the current PJM public-API surface:

| Endpoint            | Reason                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------- |
| `/api/spark-spread` | EIA Henry Hub `/v2/natural-gas/pri/sum/data/` has been returning HTTP 404 since the Wave-5 build started. Spark-spread falls back to `$4.00/MMBtu` — V1's hardcoded value (see `STATIC_GAS_PRICE_FALLBACK_MMBTU` in `app/services/spark_spread.py`). A working EIA key + series-id check is tracked as a separate follow-up; `meta.gas_price_source` will flip to `eia-henry-hub` automatically when the upstream issue resolves. |
| `/api/reserve-margin` | `forecasted_capacity_outlook` does not exist on api.pjm.com under the public subscription key (404). Capacity is always a static 200 GW nameplate (PJM 2025 summer peak), which makes the headline % less meaningful than the load actuals it sits next to. Documented in `meta.notes`. |
| `/api/outages`      | `gen_outages_by_unit` is not on the public APIM feed (404). The public alternative `gen_outages_by_type` only publishes one row per region per day with planned/maintenance/forced columns — no per-generator data. The contract row shape is preserved; rows are aggregate buckets. `meta.note` carries the disclaimer. |

## How V2 reaches PJM

`api.pjm.com` (Azure APIM) rejects the ForgeRock SSO cookie that
authenticates the `dataminer2.pjm.com` SPA. The only auth header
api.pjm.com accepts is `Ocp-Apim-Subscription-Key`.

V2 obtains that key the same way V1 does: it scrapes the public
subscription key PJM ships in
`http://dataminer2.pjm.com/config/settings.json` (a 32-char Azure
APIM key the dataminer2 SPA uses to call api.pjm.com), caches it for
6 hours, and force-refreshes on the next 401.

```
$ curl -sS http://dataminer2.pjm.com/config/settings.json | jq '{subscriptionKey, version}'
{
  "subscriptionKey": "8d******************************",
  "version": "..."
}
```

The `PJM_SUBSCRIPTION_KEY` env var is honored as an explicit override
but is never set in normal operation — the key is fetched at runtime.
`PJM_USERNAME` / `PJM_PASSWORD` stay on Railway as reserved env vars
for future private endpoints but no longer affect api.pjm.com auth.

See `app/services/intelligence_cache.py` (`_fetch_pjm_public_key`,
`pjm_auth_headers`) and the Wave-5 section of `CLAUDE.md` for the
full mechanism.
