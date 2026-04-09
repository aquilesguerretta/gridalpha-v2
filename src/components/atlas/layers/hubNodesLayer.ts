import { ScatterplotLayer, TextLayer } from '@deck.gl/layers';
import type { PickingInfo } from '@deck.gl/core';

// 20 PJM pricing hubs / representative nodes
const HUB_NODES = [
  { id: 'WESTERN_HUB',  name: 'W HUB',    lmp: 45.20, coordinates: [-79.90, 40.44] as [number, number] },
  { id: 'EASTERN_HUB',  name: 'E HUB',    lmp: 52.80, coordinates: [-75.78, 40.00] as [number, number] },
  { id: 'AEP_DAYTON',   name: 'AD HUB',   lmp: 38.60, coordinates: [-83.80, 39.90] as [number, number] },
  { id: 'DOMINION',     name: 'DOM HUB',  lmp: 49.10, coordinates: [-77.46, 38.40] as [number, number] },
  { id: 'NJ_HUB',       name: 'NJ HUB',   lmp: 58.90, coordinates: [-74.40, 40.42] as [number, number] },
  { id: 'CHICAGO_HUB',  name: 'CHI HUB',  lmp: 42.30, coordinates: [-87.63, 41.88] as [number, number] },
  { id: 'OHIO_HUB',     name: 'OH HUB',   lmp: 36.80, coordinates: [-83.00, 40.50] as [number, number] },
  { id: 'PENELEC',      name: 'PENELEC',  lmp: 41.50, coordinates: [-78.50, 41.00] as [number, number] },
  { id: 'PECO',         name: 'PECO',     lmp: 47.20, coordinates: [-75.54, 40.02] as [number, number] },
  { id: 'BGE',          name: 'BGE',      lmp: 51.40, coordinates: [-76.80, 39.20] as [number, number] },
  { id: 'PEPCO',        name: 'PEPCO',    lmp: 50.70, coordinates: [-77.10, 38.90] as [number, number] },
  { id: 'APS',          name: 'APS',      lmp: 53.20, coordinates: [-78.20, 38.60] as [number, number] },
  { id: 'DOMINION_SW',  name: 'DOM SW',   lmp: 44.80, coordinates: [-80.50, 37.50] as [number, number] },
  { id: 'DLCO',         name: 'DLCO',     lmp: 43.10, coordinates: [-79.90, 40.80] as [number, number] },
  { id: 'ATSI',         name: 'ATSI',     lmp: 39.20, coordinates: [-81.00, 41.48] as [number, number] },
  { id: 'COMED',        name: 'COMED',    lmp: 40.60, coordinates: [-87.90, 41.80] as [number, number] },
  { id: 'DEOK',         name: 'DEOK',     lmp: 37.90, coordinates: [-84.20, 39.10] as [number, number] },
  { id: 'EKPC',         name: 'EKPC',     lmp: 35.40, coordinates: [-84.40, 37.60] as [number, number] },
  { id: 'PS',           name: 'PS',       lmp: 57.30, coordinates: [-74.10, 40.74] as [number, number] },
  { id: 'RECO',         name: 'RECO',     lmp: 55.60, coordinates: [-74.30, 41.10] as [number, number] },
] as const;

export type HubNode = typeof HUB_NODES[number];

// LMP → RGBA color. Green < $40, amber $40–$55, orange $55–$70, red > $70
function lmpToColor(lmp: number): [number, number, number, number] {
  if (lmp < 40)  return [0,   230, 118, 230];  // green
  if (lmp < 55)  return [255, 184,   0, 230];  // amber
  if (lmp < 70)  return [249, 115,  22, 230];  // orange
  return              [255,  59,  59, 230];    // red
}

export type HubHoverInfo = {
  type: 'hub';
  data: HubNode;
  x: number;
  y: number;
};

export function createHubNodesLayer(
  onHover: (info: HubHoverInfo | null) => void,
) {
  return [
    new ScatterplotLayer<HubNode>({
      id:              'hub-nodes-scatter',
      data:            HUB_NODES as unknown as HubNode[],
      getPosition:     (d) => d.coordinates,
      getFillColor:    (d) => lmpToColor(d.lmp),
      getRadius:       5500,
      radiusMinPixels: 5,
      radiusMaxPixels: 18,
      pickable:        true,
      stroked:         true,
      getLineColor:    [255, 255, 255, 60],
      lineWidthMinPixels: 1,
      onHover: (info: PickingInfo<HubNode>) => {
        if (info.object) {
          onHover({ type: 'hub', data: info.object, x: info.x, y: info.y });
        } else {
          onHover(null);
        }
      },
    }),

    new TextLayer<HubNode>({
      id:             'hub-nodes-labels',
      data:           HUB_NODES as unknown as HubNode[],
      getPosition:    (d) => d.coordinates,
      getText:        (d) => d.name,
      getSize:        11,
      getColor:       [255, 255, 255, 180],
      getPixelOffset: [0, -20] as [number, number],
      fontFamily:     "'Geist Mono', 'SF Mono', monospace",
      fontWeight:     500,
      getTextAnchor:  'middle',
      getAlignmentBaseline: 'bottom',
      pickable:       false,
    }),
  ];
}
