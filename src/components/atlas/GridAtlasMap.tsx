import { useState, useCallback } from 'react';
import DeckGL from '@deck.gl/react';
import { Map } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { createHubNodesLayer, type HubHoverInfo } from './layers/hubNodesLayer';
import { createZoneBoundariesLayer, type ZoneHoverInfo } from './layers/zoneBoundariesLayer';
import { createPowerPlantsLayer, type PlantHoverInfo } from './layers/powerPlantsLayer';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string;
const MAPBOX_STYLE  = import.meta.env.VITE_MAPBOX_STYLE  as string;

const INITIAL_VIEW_STATE = {
  longitude: -79.5,
  latitude:  39.8,
  zoom:      6.0,
  pitch:     0,
  bearing:   0,
};

type HoverInfo = HubHoverInfo | ZoneHoverInfo | PlantHoverInfo | null;

export type LayersEnabled = {
  zones:  boolean;
  plants: boolean;
  nodes:  boolean;
};

interface GridAtlasMapProps {
  layersEnabled: LayersEnabled;
}

// ── Tooltip ───────────────────────────────────────────────────────────────────
function MapTooltip({ info }: { info: HoverInfo }) {
  if (!info) return null;

  const style: React.CSSProperties = {
    position:        'fixed',
    left:            info.x + 12,
    top:             info.y + 12,
    pointerEvents:   'none',
    zIndex:          9999,
    background:      'rgba(10,10,11,0.92)',
    border:          '1px solid rgba(6,182,212,0.30)',
    borderTop:       '1px solid rgba(6,182,212,0.70)',
    borderRadius:    6,
    padding:         '8px 12px',
    fontFamily:      "'Geist Mono','SF Mono',monospace",
    minWidth:        160,
  };

  const label: React.CSSProperties = {
    fontSize:      9,
    letterSpacing: '0.12em',
    color:         'rgba(255,255,255,0.40)',
    textTransform: 'uppercase',
    marginBottom:  2,
  };

  const value: React.CSSProperties = {
    fontSize:   13,
    color:      'rgba(255,255,255,0.90)',
    fontWeight: 500,
  };

  const row: React.CSSProperties = {
    display:       'flex',
    justifyContent:'space-between',
    gap:           16,
    marginTop:     6,
  };

  const muted: React.CSSProperties = {
    fontSize: 11,
    color:    'rgba(255,255,255,0.40)',
  };

  if (info.type === 'hub') {
    const { data } = info;
    const lmpColor =
      data.lmp < 40  ? '#22C55E' :
      data.lmp < 55  ? '#F59E0B' :
      data.lmp < 70  ? '#F97316' : '#EF4444';

    return (
      <div style={style}>
        <div style={label}>PRICING HUB</div>
        <div style={{ ...value, fontSize: 15 }}>{data.id.replace(/_/g, ' ')}</div>
        <div style={row}>
          <span style={muted}>LMP</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: lmpColor }}>
            ${data.lmp.toFixed(2)}/MWh
          </span>
        </div>
      </div>
    );
  }

  if (info.type === 'zone') {
    const { data } = info;
    return (
      <div style={style}>
        <div style={label}>ZONE</div>
        <div style={value}>{data.zone_id}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>
          {data.display_name}
        </div>
        <div style={row}>
          <span style={muted}>LMP</span>
          <span style={{ fontSize: 12, color: '#06B6D4' }}>${data.lmp_total.toFixed(2)}</span>
        </div>
        <div style={row}>
          <span style={muted}>PEAK LOAD</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.70)' }}>
            {(data.peak_load_mw / 1000).toFixed(1)} GW
          </span>
        </div>
        <div style={row}>
          <span style={muted}>CONGESTION</span>
          <span style={{
            fontSize: 12,
            color: data.congestion > 2 ? '#F97316' : 'rgba(255,255,255,0.70)',
          }}>
            ${data.congestion.toFixed(2)}
          </span>
        </div>
      </div>
    );
  }

  if (info.type === 'plant') {
    const { data } = info;
    const FUEL_LABELS: Record<string, string> = {
      NG:  'NATURAL GAS',
      NUC: 'NUCLEAR',
      WND: 'WIND',
      SUN: 'SOLAR',
      COL: 'COAL',
      WAT: 'HYDRO',
      MWH: 'BATTERY',
    };
    return (
      <div style={style}>
        <div style={label}>POWER PLANT</div>
        <div style={value}>{data.name}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.50)', marginTop: 2 }}>
          {FUEL_LABELS[data.fuel_type] ?? data.fuel_type} · {data.state} · {data.zone}
        </div>
        <div style={row}>
          <span style={muted}>CAPACITY</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.70)' }}>
            {data.capacity_mw.toLocaleString()} MW
          </span>
        </div>
      </div>
    );
  }

  return null;
}

// ── Map ───────────────────────────────────────────────────────────────────────
export function GridAtlasMap({ layersEnabled }: GridAtlasMapProps) {
  const [hoverInfo, setHoverInfo] = useState<HoverInfo>(null);

  const handleHover = useCallback((info: HoverInfo) => {
    setHoverInfo(info);
  }, []);

  const layers = [
    ...(layersEnabled.zones  ? [createZoneBoundariesLayer(handleHover)] : []),
    ...(layersEnabled.plants ? [createPowerPlantsLayer(handleHover)]    : []),
    ...(layersEnabled.nodes  ? createHubNodesLayer(handleHover)         : []),
  ];

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller
        layers={layers}
        style={{ width: '100%', height: '100%' }}
      >
        <Map
          mapboxAccessToken={MAPBOX_TOKEN}
          mapStyle={MAPBOX_STYLE}
        />
      </DeckGL>
      <MapTooltip info={hoverInfo} />
    </div>
  );
}
