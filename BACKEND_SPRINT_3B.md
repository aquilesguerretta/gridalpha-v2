# BACKEND SPRINT 3B — New Endpoints Required

Cursor owns this. Add these endpoints to the FastAPI backend on Railway.
All endpoints use httpx for async requests, cache with a simple dict+timestamp.

## Priority order

### 1. GET /api/atlas/generation-fuel
Source: https://api.pjm.com/api/v1/gen_by_fuel?rowCount=100&fields=datetime_beginning_ept,fuel_type,mw
Cache: 5 minutes
Returns: `{ timestamp, fuels: [{type, mw}] }`

### 2. GET /api/atlas/binding-constraints
Source: https://api.pjm.com/api/v1/da_marginal_value?rowCount=50&fields=datetime_beginning_ept,constraint_name,shadow_price,contingency_name
Cache: 5 minutes
Returns: `{ timestamp, constraints: [{name, shadow_price, contingency}] }`

### 3. GET /api/atlas/interface-flows
Source: https://api.pjm.com/api/v1/transfer_interfaces?rowCount=50&fields=datetime_beginning_ept,interface_name,actual_flow,max_flow
Cache: 5 minutes
Returns: `{ flows: [{name, actual_mw, max_mw, pct_loading}] }`

### 4. GET /api/atlas/outages
Source: https://api.pjm.com/api/v1/gen_outages_by_type?rowCount=200&fields=datetime_beginning_ept,fuel_type,outage_mw,reason
Cache: 30 minutes
Returns: `{ outages: [{fuel_type, mw, reason, datetime}] }`

### 5. GET /api/atlas/substations
Source: https://services1.arcgis.com/Hp6G80Pky0om7QvQ/arcgis/rest/services/Electric_Substations/FeatureServer/0/query?where=STATE+IN+('PA','OH','WV','VA','MD','DE','NJ','IL','IN','KY','MI')&outFields=NAME,STATE,VOLTAGE,LINES&geometry=-90,36,-73,43&geometryType=esriGeometryEnvelope&f=geojson
Cache: 24 hours (static infrastructure)
Returns: GeoJSON FeatureCollection

### 6. GET /api/atlas/gas-pipelines
Source: https://services1.arcgis.com/Hp6G80Pky0om7QvQ/arcgis/rest/services/Natural_Gas_Interstate_and_Intrastate_Pipelines/FeatureServer/0/query?where=1=1&outFields=NAME,OPERATOR,CAPACITY&geometry=-90,36,-73,43&geometryType=esriGeometryEnvelope&f=geojson
Cache: 24 hours (static infrastructure)
Returns: GeoJSON FeatureCollection

## Notes
- Frontend hooks in `src/hooks/data/useAtlasData.ts` poll these endpoints
- Earthquakes are fetched directly from USGS (no CORS issues, free API)
- All layers gracefully show "AWAITING BACKEND..." when endpoints return errors

---

### 7. GET /api/weather/current
Source: Tomorrow.io API v4
Endpoint: https://api.tomorrow.io/v4/timelines
Parameters:
  - location: PJM grid centroid points (sample 9 points across footprint)
  - fields: temperature,windSpeed,windDirection,cloudCover,precipitationIntensity
  - timesteps: 1h
  - units: metric
  - apikey: TOMORROW_API_KEY (from Railway env)
Cache: 30 minutes
Returns: {
  points: [{
    lat, lon, label,
    temperature_c, wind_speed_ms, wind_direction_deg,
    cloud_cover_pct, precip_mm
  }]
}

Sample PJM grid points to query:
  Pittsburgh:    lat=40.44, lon=-79.99
  Philadelphia:  lat=39.95, lon=-75.16
  Baltimore:     lat=39.29, lon=-76.61
  Chicago:       lat=41.88, lon=-87.63
  Cleveland:     lat=41.50, lon=-81.69
  Columbus:      lat=39.96, lon=-82.99
  Richmond:      lat=37.54, lon=-77.44
  Charleston WV: lat=38.35, lon=-81.63
  Harrisburg:    lat=40.27, lon=-76.88

### 8. GET /api/weather/forecast
Source: Tomorrow.io API v4
Same fields as /current but timesteps=1h for next 24 hours
Cache: 1 hour
Returns: {
  points: [{
    lat, lon, label,
    hourly: [{hour, temperature_c, wind_speed_ms, wind_direction_deg, cloud_cover_pct}]
  }]
}

### 9. GET /api/energy/henry-hub
Source: EIA API v2
Endpoint: https://api.eia.gov/v2/natural-gas/pri/sum/data/
Parameters:
  - api_key: EIA_API_KEY (from Railway env)
  - frequency: daily
  - data[0]: value
  - facets[series][]: N9HHNGSPOT — Henry Hub Natural Gas Spot Price
  - sort[0][column]: period
  - sort[0][direction]: desc
  - length: 30
Cache: 1 hour
Returns: {
  current_price_mmbtu: number,  (latest Henry Hub $/MMBtu)
  prices_30d: [{date, price}],  (30-day history for sparkline)
  change_pct: number            (vs yesterday)
}

### 10. GET /api/energy/electricity-prices
Source: EIA API v2
Endpoint: https://api.eia.gov/v2/electricity/rto/fuel-type-data/data/
Parameters:
  - api_key: EIA_API_KEY
  - frequency: hourly
  - data[0]: value
  - facets[respondent][]: PJM
  - sort[0][column]: period
  - sort[0][direction]: desc
  - length: 24
Cache: 15 minutes
Returns: {
  fuel_mix_24h: [{period, fuel_type, mw}]
}

## Railway Environment Variables Required

Set these in the Railway dashboard for the **FastAPI** service that serves `app.main:app` (must match `VITE_BACKEND_URL` / `useAtlasData` base URL so the frontend hits these routes):

| Variable | Purpose |
|----------|---------|
| `EIA_API_KEY` | Henry Hub + PJM fuel-mix (`/api/energy/*`) |
| `TOMORROW_API_KEY` | `/api/weather/current` and `/api/weather/forecast` |
| `PJM_USERNAME` | PJM Tools username for DataMiner API (`/api/atlas/*` except static GeoJSON) |
| `PJM_PASSWORD` | Same account password; server obtains an SSO session via [PJM SSO](https://sso.pjm.com) and calls `api.pjm.com` with the session cookie |

Use the **same key values** as in local `.env.local` (`VITE_EIA_API_KEY`, `VITE_TOMORROW_API_KEY`); server-side names **omit** the `VITE_` prefix.

### Deploy note

`src/hooks/data/useAtlasData.ts` and `useEnergyPrices` / `useWeatherData` call **`https://gridalpha-production.up.railway.app`** by default. This repo’s API must be deployed to that host (or merge routers into that service), **or** point `VITE_BACKEND_URL` at the Railway URL that runs this FastAPI app—otherwise the UI will keep mock fallbacks.
