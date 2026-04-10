// Generate synthetic PJM transmission line corridors
// Lines connect hub node centroids with intermediate waypoints for realism
const hubs = {
  WEST_HUB: [-80.52, 40.46], COMED: [-87.83, 41.76], AEP: [-82.01, 39.46],
  ATSI: [-81.24, 41.08], DAY: [-84.19, 39.76], DEOK: [-84.51, 38.74],
  DUQ: [-79.99, 40.44], DOMINION: [-77.46, 37.54], DPL: [-75.52, 38.91],
  EKPC: [-83.94, 37.78], PPL: [-76.30, 40.90], PECO: [-75.37, 40.00],
  PSEG: [-74.41, 40.56], JCPL: [-74.37, 40.10], PEPCO: [-77.01, 38.91],
  BGE: [-76.61, 39.29], METED: [-76.02, 40.32], PENELEC: [-79.10, 41.00],
  RECO: [-74.10, 41.12], OVEC: [-82.52, 38.72],
};

// Major PJM transmission corridors with voltage levels
const corridors = [
  // 500kV backbone
  { from: 'COMED', to: 'AEP', voltage: '345', waypoints: [[-85.5, 40.8], [-83.8, 40.2]] },
  { from: 'AEP', to: 'DOMINION', voltage: '500', waypoints: [[-80.5, 38.5], [-79.0, 38.0]] },
  { from: 'AEP', to: 'WEST_HUB', voltage: '345', waypoints: [[-81.5, 40.0]] },
  { from: 'WEST_HUB', to: 'DUQ', voltage: '345', waypoints: [] },
  { from: 'WEST_HUB', to: 'ATSI', voltage: '345', waypoints: [[-81.0, 40.8]] },
  { from: 'ATSI', to: 'DUQ', voltage: '345', waypoints: [[-80.2, 40.8]] },
  { from: 'ATSI', to: 'PENELEC', voltage: '230', waypoints: [[-80.0, 41.2]] },
  { from: 'DUQ', to: 'PENELEC', voltage: '345', waypoints: [[-79.5, 40.8]] },
  { from: 'DUQ', to: 'PPL', voltage: '500', waypoints: [[-78.5, 40.8], [-77.2, 40.9]] },
  { from: 'PPL', to: 'METED', voltage: '230', waypoints: [[-76.1, 40.6]] },
  { from: 'PPL', to: 'PECO', voltage: '500', waypoints: [[-76.0, 40.5], [-75.6, 40.2]] },
  { from: 'PECO', to: 'PSEG', voltage: '500', waypoints: [[-75.0, 40.2], [-74.8, 40.4]] },
  { from: 'PSEG', to: 'JCPL', voltage: '345', waypoints: [[-74.4, 40.3]] },
  { from: 'JCPL', to: 'RECO', voltage: '230', waypoints: [[-74.2, 40.6]] },
  { from: 'PECO', to: 'DPL', voltage: '230', waypoints: [[-75.5, 39.5]] },
  { from: 'DPL', to: 'PEPCO', voltage: '230', waypoints: [[-76.2, 39.0]] },
  { from: 'PEPCO', to: 'BGE', voltage: '345', waypoints: [[-76.9, 39.1]] },
  { from: 'BGE', to: 'DOMINION', voltage: '500', waypoints: [[-77.0, 38.5], [-77.2, 37.9]] },
  { from: 'DOMINION', to: 'DEOK', voltage: '345', waypoints: [[-79.5, 37.5], [-82.0, 38.0], [-83.5, 38.5]] },
  { from: 'AEP', to: 'DAY', voltage: '345', waypoints: [[-83.0, 39.6]] },
  { from: 'DAY', to: 'DEOK', voltage: '230', waypoints: [[-84.3, 39.2]] },
  { from: 'DEOK', to: 'EKPC', voltage: '230', waypoints: [[-84.2, 38.2]] },
  { from: 'AEP', to: 'OVEC', voltage: '345', waypoints: [[-82.3, 39.0]] },
  { from: 'COMED', to: 'ATSI', voltage: '345', waypoints: [[-85.0, 41.5], [-83.0, 41.4]] },
  { from: 'METED', to: 'BGE', voltage: '230', waypoints: [[-76.3, 39.8]] },
  { from: 'PENELEC', to: 'METED', voltage: '230', waypoints: [[-77.8, 40.7]] },
  // Cross-ties
  { from: 'COMED', to: 'DAY', voltage: '345', waypoints: [[-86.5, 40.5], [-85.0, 40.0]] },
  { from: 'OVEC', to: 'EKPC', voltage: '230', waypoints: [[-83.2, 38.3]] },
  { from: 'WEST_HUB', to: 'PENELEC', voltage: '230', waypoints: [[-79.8, 40.7]] },
];

function buildLine(from, to, waypoints) {
  const coords = [hubs[from], ...waypoints, hubs[to]];
  return coords;
}

const features = corridors.map((c, i) => ({
  type: 'Feature',
  properties: {
    ID: i + 1,
    VOLTAGE: c.voltage,
    NAME: `${c.from} - ${c.to}`,
    OWNER: 'PJM Interconnection',
  },
  geometry: {
    type: 'LineString',
    coordinates: buildLine(c.from, c.to, c.waypoints),
  },
}));

const geojson = { type: 'FeatureCollection', features };
require('fs').writeFileSync('public/data/transmission-lines.geojson', JSON.stringify(geojson));
console.log('Transmission lines written:', features.length);
