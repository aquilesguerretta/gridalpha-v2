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
