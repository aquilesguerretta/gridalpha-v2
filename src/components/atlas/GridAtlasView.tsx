// src/components/atlas/GridAtlasView.tsx
// Grid Atlas view — full Mapbox native layer map.
// react-map-gl Source+Layer renders everything inside Mapbox GPU pipeline.
// No deck.gl. No floating layers.

import {
  useState, useEffect, useRef, useCallback, lazy, Suspense,
} from 'react';
import { C, F } from '../../config/design-tokens';
import { CardSkeleton } from '../shared/CardSkeleton';
import { ErrorBoundary } from '../shared/ErrorBoundary';
import { captureError } from '../../lib/shared/error-tracking';
import {
  CARTO_DARK, MAPBOX_SATELLITE, MAPBOX_TERRAIN, MAPBOX_MINIMAL,
  type GridAtlasMapHandle,
} from './GridAtlasMap';

const GridAtlasMap = lazy(() => import('./GridAtlasMap'));

// ── Types ─────────────────────────────────────────────────────────────────

export type FuelFilter = {
  NG: boolean; NUC: boolean; WIND: boolean; SUN: boolean;
  COAL: boolean; WAT: boolean; BAT: boolean; GEO: boolean;
  OIL: boolean; OTHER: boolean;
};

export const DEFAULT_FUEL_FILTER: FuelFilter = {
  NG: true, NUC: true, WIND: true, SUN: true,
  COAL: true, WAT: true, BAT: true, GEO: true, OIL: true, OTHER: true,
};

interface PlantTooltip {
  name: string; fuel: string; capacity: number; state: string;
  x: number; y: number;
}

interface SearchResult {
  id: string; label: string; type: 'zone' | 'plant';
  lon: number; lat: number; zoom: number;
}

// ── Map style options ─────────────────────────────────────────────────────

const MAP_STYLES = [
  { id: 'terminal'  as const, label: 'TERMINAL',  style: CARTO_DARK         },
  { id: 'satellite' as const, label: 'SATELLITE', style: MAPBOX_SATELLITE   },
  { id: 'terrain'   as const, label: 'TERRAIN',   style: MAPBOX_TERRAIN     },
  { id: 'minimal'   as const, label: 'MINIMAL',   style: MAPBOX_MINIMAL     },
];
type MapStyleId = typeof MAP_STYLES[number]['id'];

// ── PJM hub centroids for search ──────────────────────────────────────────

const PJM_ZONES = [
  { id: 'WEST_HUB', label: 'WEST HUB', lon: -80.52, lat: 40.46, lmp: 35.9 },
  { id: 'COMED',    label: 'COMED',    lon: -87.83, lat: 41.76, lmp: 31.2 },
  { id: 'AEP',      label: 'AEP',      lon: -82.01, lat: 39.46, lmp: 32.4 },
  { id: 'ATSI',     label: 'ATSI',     lon: -81.24, lat: 41.08, lmp: 31.8 },
  { id: 'DAY',      label: 'DAY',      lon: -84.19, lat: 39.76, lmp: 32.1 },
  { id: 'DEOK',     label: 'DEOK',     lon: -84.51, lat: 38.74, lmp: 31.5 },
  { id: 'DUQ',      label: 'DUQ',      lon: -79.99, lat: 40.44, lmp: 33.2 },
  { id: 'DOMINION', label: 'DOMINION', lon: -77.46, lat: 37.54, lmp: 34.1 },
  { id: 'DPL',      label: 'DPL',      lon: -75.52, lat: 38.91, lmp: 33.8 },
  { id: 'EKPC',     label: 'EKPC',     lon: -83.94, lat: 37.78, lmp: 30.9 },
  { id: 'PPL',      label: 'PPL',      lon: -76.30, lat: 40.90, lmp: 33.5 },
  { id: 'PECO',     label: 'PECO',     lon: -75.37, lat: 40.00, lmp: 34.2 },
  { id: 'PSEG',     label: 'PSEG',     lon: -74.41, lat: 40.56, lmp: 35.1 },
  { id: 'JCPL',     label: 'JCPL',     lon: -74.37, lat: 40.10, lmp: 34.7 },
  { id: 'PEPCO',    label: 'PEPCO',    lon: -77.01, lat: 38.91, lmp: 33.9 },
  { id: 'BGE',      label: 'BGE',      lon: -76.61, lat: 39.29, lmp: 33.6 },
  { id: 'METED',    label: 'METED',    lon: -76.02, lat: 40.32, lmp: 33.4 },
  { id: 'PENELEC',  label: 'PENELEC',  lon: -79.10, lat: 41.00, lmp: 32.8 },
  { id: 'RECO',     label: 'RECO',     lon: -74.10, lat: 41.12, lmp: 36.6 },
  { id: 'OVEC',     label: 'OVEC',     lon: -82.52, lat: 38.72, lmp: 31.1 },
];

// ── Fuel filter UI metadata ───────────────────────────────────────────────

const FUEL_UI = [
  { key: 'NG'   as keyof FuelFilter, label: 'Natural Gas', color: '#E67E22' },
  { key: 'NUC'  as keyof FuelFilter, label: 'Nuclear',     color: '#9B59B6' },
  { key: 'WIND' as keyof FuelFilter, label: 'Wind',        color: '#00A3FF' },
  { key: 'SUN'  as keyof FuelFilter, label: 'Solar',       color: '#F1C40F' },
  { key: 'COAL' as keyof FuelFilter, label: 'Coal',        color: '#636E72' },
  { key: 'WAT'  as keyof FuelFilter, label: 'Hydro',       color: '#3498DB' },
  { key: 'BAT'  as keyof FuelFilter, label: 'Battery',     color: '#00E676' },
  { key: 'GEO'  as keyof FuelFilter, label: 'Geothermal',  color: '#FF6B35' },
  { key: 'OIL'  as keyof FuelFilter, label: 'Oil',         color: '#A0522D' },
  { key: 'OTHER'as keyof FuelFilter, label: 'Other',       color: '#BDC3C7' },
];

// ── Helper: filter plant GeoJSON by fuel and min capacity ─────────────────

function filterPlants(
  geojson: GeoJSON.FeatureCollection | null,
  fuelFilter: FuelFilter,
  minCap: number,
): GeoJSON.FeatureCollection | null {
  if (!geojson) return null;
  const fuelKey = (raw: string): keyof FuelFilter => {
    const n = (raw ?? '').toUpperCase().trim();
    if (n === 'NG' || n === 'GAS') return 'NG';
    if (n === 'NUC' || n === 'NUCLEAR') return 'NUC';
    if (n === 'WIND' || n === 'WND') return 'WIND';
    if (n === 'SUN' || n === 'SOLAR') return 'SUN';
    if (n === 'COAL' || n === 'COL') return 'COAL';
    if (n === 'WAT' || n === 'HYDRO') return 'WAT';
    if (n === 'BAT') return 'BAT';
    if (n === 'GEO') return 'GEO';
    if (n === 'OIL') return 'OIL';
    return 'OTHER';
  };
  const fuelIconMap: Record<string, string> = {
    NG: 'fuel-gas', GAS: 'fuel-gas',
    NUC: 'fuel-nuclear', NUCLEAR: 'fuel-nuclear',
    WIND: 'fuel-wind', WND: 'fuel-wind',
    SUN: 'fuel-solar', SOLAR: 'fuel-solar',
    COAL: 'fuel-coal', COL: 'fuel-coal',
    WAT: 'fuel-hydro', HYDRO: 'fuel-hydro',
    BAT: 'fuel-battery',
    GEO: 'fuel-geo',
    OIL: 'fuel-oil',
  };

  return {
    ...geojson,
    features: geojson.features
      .filter(f => {
        const p    = f.properties as Record<string, unknown>;
        const fuel = fuelKey((p?.PRIM_FUEL ?? p?.fuel_type ?? '') as string);
        const cap  = ((p?.INSTALL_MW ?? p?.capacity_mw ?? 0) as number);
        return fuelFilter[fuel] && cap >= minCap;
      })
      .map(f => {
        const raw = ((f.properties as Record<string, unknown>)?.PRIM_FUEL ??
                     (f.properties as Record<string, unknown>)?.fuel_type ?? '') as string;
        return {
          ...f,
          properties: {
            ...f.properties,
            fuel_icon: fuelIconMap[raw.toUpperCase()] ?? 'fuel-default',
          },
        };
      }),
  };
}

// ── Main component ────────────────────────────────────────────────────────

export default function GridAtlasView() {
  // Layer visibility
  const [showZones,     setShowZones]     = useState(true);
  const [showTx,        setShowTx]        = useState(true);
  const [showPlants,    setShowPlants]    = useState(true);
  const [showNodes,     setShowNodes]     = useState(true);
  const [showExtrusion, setShowExtrusion] = useState(false);

  // Map style
  const [activeStyle, setActiveStyle] = useState<MapStyleId>('terminal');

  // Zone / plant interaction
  const [selectedZone,  setSelectedZone]  = useState<string | null>(null);
  const [hoveredZone,   setHoveredZone]   = useState<string | null>(null);
  const [plantTooltip,  setPlantTooltip]  = useState<PlantTooltip | null>(null);

  // Fuel filters
  const [fuelFilter,  setFuelFilter]  = useState<FuelFilter>(DEFAULT_FUEL_FILTER);
  const [minCapacity, setMinCapacity] = useState(0);

  // GeoJSON data
  const [zoneGeoJson,  setZoneGeoJson]  = useState<GeoJSON.FeatureCollection | null>(null);
  const [txGeoJson,    setTxGeoJson]    = useState<GeoJSON.FeatureCollection | null>(null);
  const [rawPlants,    setRawPlants]    = useState<GeoJSON.FeatureCollection | null>(null);

  // Search
  const [searchQuery,   setSearchQuery]   = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults,   setShowResults]   = useState(false);

  // Timeline
  const [timeOffset, setTimeOffset] = useState(48);

  // Map ref for flyTo
  const mapRef = useRef<GridAtlasMapHandle>(null);

  // Load all GeoJSON on mount
  useEffect(() => {
    fetch('/data/pjm-zones.geojson')
      .then(r => r.json())
      .then((d: GeoJSON.FeatureCollection) => setZoneGeoJson(d))
      .catch(err => captureError(err, { context: 'zones-fetch' }));

    fetch('/data/transmission-lines.geojson')
      .then(r => { if (!r.ok) throw new Error(`${r.status}`); return r.json(); })
      .then((d: GeoJSON.FeatureCollection) => setTxGeoJson(d))
      .catch(() => { /* tx lines file may not exist — gracefully skip */ });

    fetch('/data/power-plants.geojson')
      .then(r => r.json())
      .then((d: GeoJSON.FeatureCollection) => setRawPlants(d))
      .catch(err => captureError(err, { context: 'plants-fetch' }));
  }, []);

  // Filtered plant GeoJSON
  const plantGeoJson = filterPlants(rawPlants, fuelFilter, minCapacity);

  // Build hub node GeoJSON from PJM_ZONES centroids
  const hubGeoJson: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: PJM_ZONES.map(z => ({
      type: 'Feature' as const,
      properties: { id: z.id, label: z.label, lmp: z.lmp ?? 33 },
      geometry: { type: 'Point' as const, coordinates: [z.lon, z.lat] },
    })),
  };

  // Search
  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
    if (q.length < 2) { setSearchResults([]); setShowResults(false); return; }
    const upper   = q.toUpperCase();
    const results: SearchResult[] = [];

    PJM_ZONES
      .filter(z => z.label.includes(upper) || z.id.includes(upper))
      .forEach(z => results.push({
        id: z.id, label: z.label, type: 'zone',
        lon: z.lon, lat: z.lat, zoom: 8,
      }));

    if (rawPlants) {
      rawPlants.features
        .filter(f => {
          const n = ((f.properties?.NAME ?? f.properties?.name ?? '') as string).toUpperCase();
          return n.includes(upper);
        })
        .slice(0, 6)
        .forEach(f => {
          const coords = (f.geometry as GeoJSON.Point).coordinates;
          const name   = (f.properties?.NAME ?? f.properties?.name ?? 'Unknown') as string;
          results.push({
            id: name, label: name, type: 'plant',
            lon: coords[0] as number, lat: coords[1] as number, zoom: 13,
          });
        });
    }
    setSearchResults(results.slice(0, 8));
    setShowResults(results.length > 0);
  }, [rawPlants]);

  const handleSelectResult = useCallback((r: SearchResult) => {
    setSearchQuery(r.label);
    setShowResults(false);
    mapRef.current?.flyTo(r.lon, r.lat, r.zoom);
    if (r.type === 'zone') setSelectedZone(r.id);
  }, []);

  // Plant hover handler
  const handlePlantHover = useCallback(
    (props: Record<string, unknown> | null, x: number, y: number) => {
      if (!props) { setPlantTooltip(null); return; }
      setPlantTooltip({
        name:     (props.NAME ?? props.name ?? 'Unknown') as string,
        fuel:     (props.PRIM_FUEL ?? props.fuel_type ?? '') as string,
        capacity: (props.INSTALL_MW ?? props.capacity_mw ?? 0) as number,
        state:    (props.STATE ?? props.state ?? '') as string,
        x, y,
      });
    },
    [],
  );

  const toggleFuel = (key: keyof FuelFilter) =>
    setFuelFilter(prev => ({ ...prev, [key]: !prev[key] }));

  const allOn   = Object.values(fuelFilter).every(Boolean);
  const toggleAll = () => setFuelFilter(
    Object.fromEntries(Object.keys(fuelFilter).map(k => [k, !allOn])) as FuelFilter,
  );

  const currentStyle = MAP_STYLES.find(s => s.id === activeStyle)!.style;
  const plantCount   = plantGeoJson?.features.length ?? 0;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>

      {/* ── Map ───────────────────────────────────────── */}
      <ErrorBoundary label="GRID ATLAS">
        <Suspense fallback={<CardSkeleton rows={4} />}>
          <GridAtlasMap
            ref={mapRef}
            mapStyle={currentStyle}
            zoneGeoJson={zoneGeoJson}
            txGeoJson={txGeoJson}
            plantGeoJson={plantGeoJson}
            hubGeoJson={hubGeoJson}
            showZones={showZones}
            showTx={showTx}
            showPlants={showPlants}
            showNodes={showNodes}
            showExtrusion={showExtrusion}
            onZoneClick={setSelectedZone}
            onPlantHover={handlePlantHover}
            onZoneHover={setHoveredZone}
          />
        </Suspense>
      </ErrorBoundary>

      {/* ── Top status bar ───────────────────────────── */}
      <div style={{
        position: 'absolute', top: 12, left: '50%',
        transform: 'translateX(-50%)', zIndex: 10,
        display: 'flex', alignItems: 'center', gap: 12,
        pointerEvents: 'none', whiteSpace: 'nowrap',
      }}>
        <div style={{
          background: 'rgba(10,10,11,0.88)',
          border: `1px solid ${C.glassBorder}`,
          borderRadius: 20, padding: '6px 18px',
          backdropFilter: 'blur(12px)',
        }}>
          <span style={{ fontFamily: F.mono, fontSize: '0.65rem', color: C.electricBlue, letterSpacing: '0.15em' }}>
            PJM · REAL-TIME · 5-MIN DISPATCH
          </span>
        </div>
        <div style={{
          background: 'rgba(10,10,11,0.88)',
          border: `1px solid ${C.glassBorder}`,
          borderRadius: 6, padding: '5px 14px',
          backdropFilter: 'blur(12px)',
          display: 'flex', gap: 16,
        }}>
          {[
            { label: 'ZONES',       value: '20'                },
            { label: 'PLANTS',      value: String(plantCount)  },
            { label: 'LAST UPDATE', value: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'America/New_York' }) + ' EPT' },
          ].map(item => (
            <span key={item.label} style={{ fontFamily: F.mono, fontSize: '0.6rem' }}>
              <span style={{ color: C.textMuted, letterSpacing: '0.1em' }}>{item.label}: </span>
              <span style={{ color: C.electricBlue }}>{item.value}</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Left panel ───────────────────────────────── */}
      <div style={{
        position: 'absolute', top: 12, left: 12,
        width: 200, zIndex: 20,
        display: 'flex', flexDirection: 'column', gap: 8,
        pointerEvents: 'auto',
        maxHeight: 'calc(100% - 100px)', overflowY: 'auto',
      }}>

        {/* Search */}
        <Panel label="">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: F.mono, fontSize: '0.75rem', color: C.textMuted }}>⌕</span>
            <input
              type="text"
              placeholder="FLY TO ZONE OR PLANT"
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
              onBlur={() => setTimeout(() => setShowResults(false), 180)}
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                fontFamily: F.mono, fontSize: '0.58rem',
                color: C.textPrimary, width: '100%',
              }}
            />
          </div>
          {showResults && searchResults.length > 0 && (
            <div style={{ borderTop: `1px solid ${C.glassBorder}`, maxHeight: 180, overflowY: 'auto' }}>
              {searchResults.map(r => (
                <button key={`${r.type}-${r.id}`}
                  onMouseDown={() => handleSelectResult(r)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    width: '100%', padding: '5px 0',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    textAlign: 'left' as const,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,163,255,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ fontFamily: F.mono, fontSize: '0.5rem', color: r.type === 'zone' ? C.electricBlue : C.amber, minWidth: 30, letterSpacing: '0.1em' }}>
                    {r.type === 'zone' ? 'ZONE' : 'PLANT'}
                  </span>
                  <span style={{ fontFamily: F.mono, fontSize: '0.58rem', color: C.textPrimary }}>
                    {r.label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </Panel>

        {/* Layers */}
        <Panel label="LAYERS">
          <Toggle label="TRANSMISSION"   active={showTx}        color="#00FFF0"        onToggle={() => setShowTx(p => !p)} />
          <Toggle label="ZONE FILLS"     active={showZones}     color={C.electricBlue} onToggle={() => setShowZones(p => !p)} />
          <Toggle label="3D EXTRUSION"   active={showExtrusion} color={C.amber}        onToggle={() => setShowExtrusion(p => !p)} />
          <Toggle label="POWER PLANTS"   active={showPlants}    color={C.cyan}         onToggle={() => setShowPlants(p => !p)} />
          <Toggle label="HUB NODES"      active={showNodes}     color="#FFB800"        onToggle={() => setShowNodes(p => !p)} />
        </Panel>

        {/* Fuel type filter */}
        {showPlants && (
          <Panel label="FUEL TYPE">
            <button onClick={toggleAll} style={{
              background: 'transparent',
              border: `1px solid ${C.glassBorder}`,
              borderRadius: 4, color: C.textSecondary,
              fontFamily: F.mono, fontSize: '0.55rem',
              letterSpacing: '0.1em', cursor: 'pointer',
              padding: '3px 8px', marginBottom: 4,
            }}>
              {allOn ? 'HIDE ALL' : 'SHOW ALL'}
            </button>
            {FUEL_UI.map(f => (
              <button key={f.key} onClick={() => toggleFuel(f.key)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px 0', width: '100%' }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: fuelFilter[f.key] ? f.color : 'transparent',
                  border: `1.5px solid ${fuelFilter[f.key] ? f.color : C.textMuted}`,
                  flexShrink: 0,
                }} />
                <span style={{ fontFamily: F.mono, fontSize: '0.58rem', color: fuelFilter[f.key] ? C.textPrimary : C.textMuted }}>
                  {f.label}
                </span>
              </button>
            ))}
            <div style={{ marginTop: 8, borderTop: `1px solid ${C.glassBorder}`, paddingTop: 8 }}>
              <span style={{ fontFamily: F.mono, fontSize: '0.55rem', color: C.textMuted }}>
                MIN CAPACITY: {minCapacity === 0 ? 'ALL' : `${minCapacity} MW`}
              </span>
              <input type="range" min={0} max={1000} step={50} value={minCapacity}
                onChange={e => setMinCapacity(Number(e.target.value))}
                style={{
                  width: '100%', marginTop: 6, appearance: 'none', height: 3,
                  borderRadius: 2, outline: 'none', cursor: 'pointer',
                  background: `linear-gradient(to right, ${C.electricBlue} ${minCapacity / 10}%, rgba(255,255,255,0.1) ${minCapacity / 10}%)`,
                }}
              />
            </div>
          </Panel>
        )}

        {/* Map style */}
        <Panel label="MAP STYLE">
          {MAP_STYLES.map(s => (
            <button key={s.id} onClick={() => setActiveStyle(s.id)} style={{
              width: '100%', padding: '5px 8px',
              background: activeStyle === s.id ? 'rgba(0,163,255,0.12)' : 'transparent',
              border: activeStyle === s.id ? '1px solid rgba(0,163,255,0.3)' : '1px solid transparent',
              borderRadius: 4,
              color: activeStyle === s.id ? C.electricBlue : C.textSecondary,
              fontFamily: F.mono, fontSize: '0.6rem', letterSpacing: '0.1em',
              cursor: 'pointer', textAlign: 'left' as const,
            }}>
              {activeStyle === s.id ? '● ' : '○ '}{s.label}
            </button>
          ))}
        </Panel>

        {/* Selected zone */}
        {selectedZone && (
          <Panel label="SELECTED ZONE">
            <span style={{ fontFamily: F.mono, fontSize: '0.75rem', color: C.electricBlue }}>
              {selectedZone}
            </span>
            <button onClick={() => setSelectedZone(null)} style={{
              marginTop: 4, background: 'transparent', border: 'none',
              color: C.textMuted, fontFamily: F.mono, fontSize: '0.55rem',
              cursor: 'pointer', padding: 0, textAlign: 'left' as const,
            }}>
              CLEAR SELECTION
            </button>
          </Panel>
        )}
      </div>

      {/* ── Plant tooltip ─────────────────────────────── */}
      {plantTooltip && (
        <div style={{
          position: 'fixed', left: plantTooltip.x + 14, top: plantTooltip.y - 10,
          zIndex: 50, background: 'rgba(10,10,11,0.95)',
          border: `1px solid ${C.glassBorder}`, borderRadius: 6,
          backdropFilter: 'blur(12px)', padding: '8px 12px',
          pointerEvents: 'none', minWidth: 160,
        }}>
          <div style={{ fontFamily: F.mono, fontSize: '0.7rem', color: C.textPrimary, fontWeight: 600, marginBottom: 4 }}>
            {plantTooltip.name}
          </div>
          {[
            { label: 'FUEL',     value: plantTooltip.fuel || '–'                            },
            { label: 'CAPACITY', value: `${Number(plantTooltip.capacity).toLocaleString()} MW` },
            { label: 'STATE',    value: plantTooltip.state || '–'                           },
          ].map(row => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <span style={{ fontFamily: F.mono, fontSize: '0.55rem', color: C.textMuted }}>{row.label}</span>
              <span style={{ fontFamily: F.mono, fontSize: '0.6rem', color: C.textSecondary }}>{row.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Zone hover label ──────────────────────────── */}
      {hoveredZone && !plantTooltip && (
        <div style={{
          position: 'absolute', bottom: 90, left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(10,10,11,0.92)',
          border: `1px solid ${C.electricBlue}`,
          borderRadius: 6, padding: '6px 16px',
          fontFamily: F.mono, fontSize: '0.65rem',
          color: C.electricBlue, letterSpacing: '0.12em',
          pointerEvents: 'none', zIndex: 10, whiteSpace: 'nowrap',
        }}>
          {hoveredZone}
        </div>
      )}

      {/* ── Timeline scrubber ─────────────────────────── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        zIndex: 10, background: 'rgba(10,10,11,0.92)',
        borderTop: `1px solid ${C.glassBorder}`,
        backdropFilter: 'blur(12px)', padding: '10px 32px 14px',
        pointerEvents: 'auto',
      }}>
        <div style={{
          height: 6, borderRadius: 3, marginBottom: 8, overflow: 'hidden',
          background: 'linear-gradient(to right,#22C55E 0%,#22C55E 33%,#DC2626 35%,#DC2626 40%,#22C55E 40%,#22C55E 66%,#DC2626 68%,#DC2626 73%,#22C55E 73%,#22C55E 90%,#DC2626 92%,#DC2626 96%,#22C55E 96%)',
        }} />
        <input type="range" min={0} max={48} value={timeOffset}
          onChange={e => setTimeOffset(Number(e.target.value))}
          style={{
            width: '100%', appearance: 'none', height: 4, borderRadius: 2,
            outline: 'none', cursor: 'pointer',
            background: `linear-gradient(to right,${C.electricBlue} ${(timeOffset/48)*100}%,rgba(255,255,255,0.1) ${(timeOffset/48)*100}%)`,
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
          {['-48H', '-36H', '-24H', '-12H', 'NOW'].map(label => (
            <span key={label} style={{
              fontFamily: F.mono, fontSize: '0.55rem',
              color: label === 'NOW' ? C.electricBlue : C.textMuted,
              letterSpacing: '0.1em',
            }}>{label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────

function Panel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: 'rgba(10,10,11,0.88)',
      border: `1px solid ${C.glassBorder}`,
      borderRadius: 6, backdropFilter: 'blur(12px)',
      padding: '10px 12px',
      display: 'flex', flexDirection: 'column' as const, gap: 6,
    }}>
      {label && (
        <span style={{
          fontFamily: F.mono, fontSize: '0.55rem', color: C.textMuted,
          letterSpacing: '0.15em', textTransform: 'uppercase' as const, marginBottom: 2,
        }}>
          {label}
        </span>
      )}
      {children}
    </div>
  );
}

function Toggle({ label, active, color, onToggle }: {
  label: string; active: boolean; color: string; onToggle: () => void;
}) {
  return (
    <button onClick={onToggle} style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: 'transparent', border: 'none', cursor: 'pointer',
      padding: '2px 0', width: '100%',
    }}>
      <div style={{
        width: 10, height: 10, borderRadius: '50%',
        background: active ? color : 'transparent',
        border: `1.5px solid ${active ? color : C.textMuted}`,
        flexShrink: 0,
      }} />
      <span style={{
        fontFamily: F.mono, fontSize: '0.6rem',
        color: active ? C.textPrimary : C.textMuted,
        letterSpacing: '0.08em',
      }}>
        {label}
      </span>
    </button>
  );
}
