// Generate PJM zone boundaries with more realistic geographic shapes
// Based on approximate utility service territory boundaries
const zones = [
  {
    zone_id: 'COMED', name: 'COMED', lmp_total: 31.2,
    // Northern Illinois — follows IL state boundary roughly
    coords: [[[-90.6,42.5],[-87.5,42.5],[-87.5,41.5],[-87.8,41.2],[-88.2,40.8],[-88.5,40.2],[-89.0,39.8],[-89.5,39.5],[-90.0,39.2],[-90.6,39.0],[-91.0,39.5],[-91.2,40.5],[-91.0,41.5],[-90.6,42.5]]]
  },
  {
    zone_id: 'AEP', name: 'AEP', lmp_total: 32.4,
    // Central Ohio + southern Ohio + WV panhandle
    coords: [[[-84.8,41.2],[-82.8,41.0],[-81.5,40.8],[-81.0,40.2],[-80.8,39.5],[-81.0,38.8],[-81.5,38.2],[-82.0,37.5],[-83.0,37.2],[-84.0,37.5],[-84.8,38.0],[-85.0,39.0],[-84.8,40.0],[-84.8,41.2]]]
  },
  {
    zone_id: 'ATSI', name: 'ATSI', lmp_total: 31.8,
    // Northeast Ohio — Cleveland/Akron/Youngstown
    coords: [[[-82.3,42.0],[-80.5,42.0],[-80.5,41.3],[-80.7,40.8],[-81.0,40.2],[-81.5,40.0],[-82.0,40.2],[-82.5,40.5],[-82.8,41.0],[-82.5,41.5],[-82.3,42.0]]]
  },
  {
    zone_id: 'DAY', name: 'DAY', lmp_total: 32.1,
    // Western Ohio — Dayton/Springfield
    coords: [[[-84.8,40.3],[-83.5,40.3],[-83.2,39.8],[-83.5,39.2],[-83.8,38.8],[-84.5,38.8],[-84.8,39.2],[-85.0,39.8],[-84.8,40.3]]]
  },
  {
    zone_id: 'DEOK', name: 'DEOK', lmp_total: 31.5,
    // Greater Cincinnati — SW Ohio + N Kentucky
    coords: [[[-84.8,39.4],[-84.0,39.4],[-83.5,39.1],[-83.5,38.5],[-84.0,38.0],[-84.5,38.0],[-85.0,38.2],[-85.2,38.8],[-85.0,39.2],[-84.8,39.4]]]
  },
  {
    zone_id: 'EKPC', name: 'EKPC', lmp_total: 30.9,
    // Eastern Kentucky
    coords: [[[-85.5,38.5],[-84.0,38.5],[-83.5,38.0],[-83.0,37.5],[-83.5,37.0],[-84.5,36.8],[-85.5,37.0],[-86.0,37.5],[-85.8,38.0],[-85.5,38.5]]]
  },
  {
    zone_id: 'DUQ', name: 'DUQ', lmp_total: 33.2,
    // Greater Pittsburgh
    coords: [[[-80.5,40.8],[-79.5,40.8],[-79.2,40.5],[-79.3,40.0],[-79.5,39.8],[-80.0,39.8],[-80.5,40.0],[-80.7,40.4],[-80.5,40.8]]]
  },
  {
    zone_id: 'PENELEC', name: 'PENELEC', lmp_total: 32.8,
    // Central/northern PA — Erie to Scranton corridor
    coords: [[[-80.5,42.3],[-78.0,42.3],[-77.5,41.8],[-77.0,41.2],[-77.2,40.8],[-78.0,40.5],[-79.0,40.5],[-79.8,40.8],[-80.3,41.2],[-80.5,41.8],[-80.5,42.3]]]
  },
  {
    zone_id: 'PPL', name: 'PPL', lmp_total: 33.5,
    // Eastern PA — Lehigh Valley/Pocono/Harrisburg
    coords: [[[-77.5,41.5],[-75.5,41.5],[-75.2,41.0],[-75.0,40.5],[-75.3,40.2],[-76.0,40.0],[-77.0,40.2],[-77.5,40.5],[-77.5,41.5]]]
  },
  {
    zone_id: 'METED', name: 'METED', lmp_total: 33.4,
    // South-central PA — Reading/Lancaster area
    coords: [[[-77.5,40.5],[-76.0,40.5],[-75.5,40.2],[-75.5,39.8],[-76.0,39.6],[-77.0,39.6],[-77.5,39.8],[-77.5,40.5]]]
  },
  {
    zone_id: 'PECO', name: 'PECO', lmp_total: 34.2,
    // Philadelphia metro — SE PA
    coords: [[[-75.8,40.3],[-75.0,40.3],[-74.8,40.0],[-74.9,39.6],[-75.2,39.4],[-75.8,39.5],[-76.0,39.8],[-75.8,40.3]]]
  },
  {
    zone_id: 'PSEG', name: 'PSEG', lmp_total: 35.1,
    // Northern NJ — Newark/Jersey City
    coords: [[[-75.0,41.0],[-74.2,41.0],[-74.0,40.7],[-74.0,40.2],[-74.3,39.8],[-74.8,39.6],[-75.2,39.8],[-75.2,40.5],[-75.0,41.0]]]
  },
  {
    zone_id: 'JCPL', name: 'JCPL', lmp_total: 34.7,
    // Central NJ — Monmouth/Ocean
    coords: [[[-74.8,40.5],[-74.0,40.5],[-73.9,40.2],[-74.0,39.6],[-74.4,39.5],[-74.8,39.8],[-74.8,40.5]]]
  },
  {
    zone_id: 'RECO', name: 'RECO', lmp_total: 36.6,
    // Northern NJ — Rockland/Orange border
    coords: [[[-74.5,41.4],[-74.0,41.4],[-73.9,41.1],[-74.0,40.9],[-74.3,40.9],[-74.5,41.1],[-74.5,41.4]]]
  },
  {
    zone_id: 'DPL', name: 'DPL', lmp_total: 33.8,
    // Delmarva — Delaware + Eastern Shore MD
    coords: [[[-76.0,39.8],[-75.0,39.8],[-75.0,39.2],[-75.1,38.5],[-75.3,38.0],[-75.8,38.0],[-76.2,38.5],[-76.3,39.0],[-76.0,39.8]]]
  },
  {
    zone_id: 'PEPCO', name: 'PEPCO', lmp_total: 33.9,
    // DC metro — Montgomery County MD + DC + PG County
    coords: [[[-77.5,39.2],[-76.8,39.2],[-76.7,38.9],[-76.8,38.5],[-77.1,38.3],[-77.5,38.5],[-77.6,38.8],[-77.5,39.2]]]
  },
  {
    zone_id: 'BGE', name: 'BGE', lmp_total: 33.6,
    // Baltimore metro — central MD
    coords: [[[-77.2,39.7],[-76.2,39.7],[-75.8,39.4],[-75.8,38.8],[-76.0,38.3],[-76.5,38.2],[-77.0,38.5],[-77.3,39.0],[-77.2,39.7]]]
  },
  {
    zone_id: 'DOMINION', name: 'DOMINION', lmp_total: 34.1,
    // Virginia — follows VA state shape roughly
    coords: [[[-80.5,38.5],[-79.5,38.0],[-78.5,37.5],[-77.5,37.0],[-76.5,37.0],[-75.5,37.5],[-75.8,38.0],[-76.2,38.5],[-77.0,38.5],[-77.5,38.2],[-78.5,38.0],[-79.5,38.5],[-80.5,38.5]]]
  },
  {
    zone_id: 'OVEC', name: 'OVEC', lmp_total: 31.1,
    // Ohio Valley — along OH/WV border
    coords: [[[-83.0,39.2],[-81.5,39.2],[-81.2,38.8],[-81.5,38.2],[-82.0,37.8],[-82.8,38.0],[-83.2,38.5],[-83.0,39.2]]]
  },
  {
    zone_id: 'WEST_HUB', name: 'WEST HUB', lmp_total: 35.9,
    // Western PA hub area
    coords: [[[-80.8,41.0],[-79.8,41.0],[-79.5,40.7],[-79.5,40.2],[-79.8,39.9],[-80.5,39.9],[-80.8,40.3],[-80.8,41.0]]]
  },
];

const geojson = {
  type: 'FeatureCollection',
  features: zones.map((z, i) => ({
    type: 'Feature',
    id: i + 1,
    properties: { zone_id: z.zone_id, name: z.name, lmp_total: z.lmp_total },
    geometry: { type: 'Polygon', coordinates: z.coords },
  })),
};

require('fs').writeFileSync('public/data/pjm-zones.geojson', JSON.stringify(geojson));
console.log('Zones written:', geojson.features.length);
