// src/components/atlas/GridAtlasView.tsx
// Grid Atlas view — full Mapbox native layer map.
// react-map-gl Source+Layer renders everything inside Mapbox GPU pipeline.
// No deck.gl. No floating layers.

import {
  useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense,
} from 'react';
import { C, F } from '../../config/design-tokens';
import { CardSkeleton } from '../shared/CardSkeleton';
import { ErrorBoundary } from '../shared/ErrorBoundary';
import { captureError } from '../../lib/shared/error-tracking';
import {
  CARTO_DARK, MAPBOX_SATELLITE, MAPBOX_TERRAIN, MAPBOX_MINIMAL,
  type GridAtlasMapHandle,
} from './GridAtlasMap';

import {
  useFuelMix,
  useBindingConstraints,
  useInterfaceFlows,
  useOutages,
  useSubstations,
  useGasPipelines,
  useEarthquakes,
} from '../../hooks/data/useAtlasData';
import { buildFlowArrows } from './utils/buildFlowArrows';

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

// ── Mock infrastructure data (replaced by backend when live) ──────────────

const MOCK_GAS_PIPELINES: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    { type:'Feature', properties:{ NAME:'Transcontinental Gas Pipeline', OPERATOR:'Williams' }, geometry:{ type:'LineString', coordinates:[[-80.5,36.8],[-79.2,37.4],[-77.5,38.2],[-76.1,39.0],[-75.2,39.8],[-74.5,40.5],[-74.0,40.9]] } },
    { type:'Feature', properties:{ NAME:'Tennessee Gas Pipeline', OPERATOR:'Kinder Morgan' }, geometry:{ type:'LineString', coordinates:[[-88.5,39.2],[-86.8,39.5],[-84.9,39.8],[-83.2,40.1],[-81.5,40.4],[-79.8,40.6],[-78.1,40.8],[-76.4,41.0],[-74.9,41.2]] } },
    { type:'Feature', properties:{ NAME:'Columbia Gas Transmission', OPERATOR:'TC Energy' }, geometry:{ type:'LineString', coordinates:[[-82.5,38.2],[-81.2,38.8],[-79.9,39.4],[-78.6,39.9],[-77.3,40.3],[-76.0,40.7],[-74.8,40.9]] } },
    { type:'Feature', properties:{ NAME:'Texas Eastern Transmission', OPERATOR:'Enbridge' }, geometry:{ type:'LineString', coordinates:[[-89.2,38.5],[-87.5,38.9],[-85.8,39.3],[-84.1,39.7],[-82.4,40.1],[-80.7,40.4],[-79.0,40.7],[-77.3,41.0],[-75.6,41.2],[-74.1,40.8]] } },
    { type:'Feature', properties:{ NAME:'Iroquois Gas Transmission', OPERATOR:'Iroquois' }, geometry:{ type:'LineString', coordinates:[[-74.2,41.5],[-73.8,41.8],[-73.3,42.1],[-72.8,42.3]] } },
    { type:'Feature', properties:{ NAME:'Rockies Express Pipeline', OPERATOR:'Tallgrass' }, geometry:{ type:'LineString', coordinates:[[-90.5,39.8],[-88.8,39.9],[-87.1,40.0],[-85.4,40.1],[-83.7,40.2],[-82.0,40.3],[-80.3,40.3]] } },
    { type:'Feature', properties:{ NAME:'Eastern Gas Transmission', OPERATOR:'EQT' }, geometry:{ type:'LineString', coordinates:[[-80.2,39.8],[-79.0,39.9],[-77.8,40.1],[-76.5,40.4],[-75.3,40.6]] } },
    { type:'Feature', properties:{ NAME:'Algonquin Gas Transmission', OPERATOR:'Enbridge' }, geometry:{ type:'LineString', coordinates:[[-74.1,40.7],[-73.5,41.1],[-72.9,41.4],[-72.1,41.6],[-71.5,41.8],[-71.0,42.0]] } },
  ],
};

const MOCK_SUBSTATIONS: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    { type:'Feature', properties:{ NAME:'Susquehanna', VOLTAGE:500 }, geometry:{ type:'Point', coordinates:[-76.15,41.10] } },
    { type:'Feature', properties:{ NAME:'Juniata', VOLTAGE:500 }, geometry:{ type:'Point', coordinates:[-77.86,40.47] } },
    { type:'Feature', properties:{ NAME:'Keystone', VOLTAGE:500 }, geometry:{ type:'Point', coordinates:[-79.20,40.55] } },
    { type:'Feature', properties:{ NAME:'Tabb', VOLTAGE:500 }, geometry:{ type:'Point', coordinates:[-76.42,37.09] } },
    { type:'Feature', properties:{ NAME:'Doubs', VOLTAGE:500 }, geometry:{ type:'Point', coordinates:[-77.38,39.42] } },
    { type:'Feature', properties:{ NAME:'Kemptown', VOLTAGE:500 }, geometry:{ type:'Point', coordinates:[-77.22,39.38] } },
    { type:'Feature', properties:{ NAME:'Meadow Brook', VOLTAGE:500 }, geometry:{ type:'Point', coordinates:[-77.55,38.95] } },
    { type:'Feature', properties:{ NAME:'Elroy', VOLTAGE:345 }, geometry:{ type:'Point', coordinates:[-75.31,40.08] } },
    { type:'Feature', properties:{ NAME:'Burlington', VOLTAGE:345 }, geometry:{ type:'Point', coordinates:[-74.88,39.95] } },
    { type:'Feature', properties:{ NAME:'Otter Creek', VOLTAGE:345 }, geometry:{ type:'Point', coordinates:[-82.54,41.32] } },
    { type:'Feature', properties:{ NAME:'Beaver', VOLTAGE:345 }, geometry:{ type:'Point', coordinates:[-80.34,40.75] } },
    { type:'Feature', properties:{ NAME:'Hatfield Ferry', VOLTAGE:345 }, geometry:{ type:'Point', coordinates:[-80.13,39.88] } },
    { type:'Feature', properties:{ NAME:'Tidd', VOLTAGE:345 }, geometry:{ type:'Point', coordinates:[-80.70,40.35] } },
    { type:'Feature', properties:{ NAME:'Marysville', VOLTAGE:230 }, geometry:{ type:'Point', coordinates:[-77.02,40.08] } },
    { type:'Feature', properties:{ NAME:'Peach Bottom', VOLTAGE:230 }, geometry:{ type:'Point', coordinates:[-76.27,39.76] } },
    { type:'Feature', properties:{ NAME:'Plymouth Meeting', VOLTAGE:230 }, geometry:{ type:'Point', coordinates:[-75.28,40.10] } },
    { type:'Feature', properties:{ NAME:'Whitpain', VOLTAGE:230 }, geometry:{ type:'Point', coordinates:[-75.32,40.14] } },
    { type:'Feature', properties:{ NAME:'Conemaugh', VOLTAGE:230 }, geometry:{ type:'Point', coordinates:[-79.14,40.46] } },
    { type:'Feature', properties:{ NAME:'Wylie Ridge', VOLTAGE:230 }, geometry:{ type:'Point', coordinates:[-80.03,39.76] } },
    { type:'Feature', properties:{ NAME:'Greensburg', VOLTAGE:230 }, geometry:{ type:'Point', coordinates:[-79.53,40.30] } },
    { type:'Feature', properties:{ NAME:'Cresap', VOLTAGE:230 }, geometry:{ type:'Point', coordinates:[-79.05,39.55] } },
    { type:'Feature', properties:{ NAME:'Loudoun', VOLTAGE:230 }, geometry:{ type:'Point', coordinates:[-77.62,38.98] } },
    { type:'Feature', properties:{ NAME:'Ox', VOLTAGE:230 }, geometry:{ type:'Point', coordinates:[-77.35,38.78] } },
    { type:'Feature', properties:{ NAME:'Possum Point', VOLTAGE:230 }, geometry:{ type:'Point', coordinates:[-77.23,38.57] } },
    { type:'Feature', properties:{ NAME:'Chalk Point', VOLTAGE:230 }, geometry:{ type:'Point', coordinates:[-76.67,38.53] } },
    { type:'Feature', properties:{ NAME:'Conastone', VOLTAGE:115 }, geometry:{ type:'Point', coordinates:[-76.17,39.55] } },
    { type:'Feature', properties:{ NAME:'Stony Point', VOLTAGE:115 }, geometry:{ type:'Point', coordinates:[-74.02,41.23] } },
    { type:'Feature', properties:{ NAME:'Lambertville', VOLTAGE:115 }, geometry:{ type:'Point', coordinates:[-74.94,40.37] } },
    { type:'Feature', properties:{ NAME:'Mickleton', VOLTAGE:115 }, geometry:{ type:'Point', coordinates:[-75.24,39.79] } },
    { type:'Feature', properties:{ NAME:'Elsinboro', VOLTAGE:115 }, geometry:{ type:'Point', coordinates:[-75.46,39.49] } },
  ],
};

// ── Main component ────────────────────────────────────────────────────────

export default function GridAtlasView() {
  // Layer visibility
  const [showZones,     setShowZones]     = useState(true);
  const [showTx,        setShowTx]        = useState(true);
  const [showPlants,    setShowPlants]    = useState(true);
  const [showNodes,     setShowNodes]     = useState(true);
  const [showExtrusion,     setShowExtrusion]     = useState(false);
  const [showSubstations,    setShowSubstations]    = useState(false);
  const [showGasPipelines,   setShowGasPipelines]   = useState(false);
  const [showEarthquakes,    setShowEarthquakes]    = useState(true);
  const [showInterfaceFlows, setShowInterfaceFlows] = useState(true);

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

  // Live data hooks (gracefully return empty when backend not ready)
  const { data: fuelMixData,    live: fuelLive   } = useFuelMix();
  const { data: constraintData, live: constLive  } = useBindingConstraints();
  const { data: flowData,       live: flowLive   } = useInterfaceFlows();
  const { data: outageData,     live: outageLive } = useOutages();
  const { data: substationGeoJsonBackend } = useSubstations();
  const { data: pipelineGeoJsonBackend }   = useGasPipelines();
  const substationGeoJson = substationGeoJsonBackend ?? MOCK_SUBSTATIONS;
  const pipelineGeoJson   = pipelineGeoJsonBackend   ?? MOCK_GAS_PIPELINES;
  const earthquakeGeoJson            = useEarthquakes();

  const flowArrowsGeoJson = useMemo(
    () => buildFlowArrows(flowData?.flows ?? []),
    [flowData],
  );
  const totalOutageMW = useMemo(
    () => outageData?.outages.reduce((sum, o) => sum + o.mw, 0) ?? 0,
    [outageData],
  );

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

  // Manage terrain when style changes (CARTO doesn't support Mapbox DEM)
  useEffect(() => {
    const handle = mapRef.current;
    if (!handle) return;
    const timer = setTimeout(() => {
      try {
        const nativeMap = (handle as any).getMap?.() ?? (handle as any);
        if (!nativeMap?.getSource) return;
        if (activeStyle === 'terminal') {
          if (nativeMap.getTerrain?.()) nativeMap.setTerrain(null);
        } else {
          if (!nativeMap.getSource('mapbox-dem')) {
            nativeMap.addSource('mapbox-dem', {
              type: 'raster-dem', url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
              tileSize: 512, maxzoom: 14,
            });
          }
          nativeMap.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });
        }
      } catch { /* style not ready — ignore */ }
    }, 500);
    return () => clearTimeout(timer);
  }, [activeStyle]);

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
            key={currentStyle}
            ref={mapRef}
            mapStyle={currentStyle}
            zoneGeoJson={zoneGeoJson}
            txGeoJson={txGeoJson}
            plantGeoJson={plantGeoJson}
            hubGeoJson={hubGeoJson}
            substationGeoJson={substationGeoJson}
            pipelineGeoJson={pipelineGeoJson}
            earthquakeGeoJson={earthquakeGeoJson}
            flowArrowsGeoJson={flowArrowsGeoJson}
            showZones={showZones}
            showTx={showTx}
            showPlants={showPlants}
            showNodes={showNodes}
            showExtrusion={showExtrusion}
            showSubstations={showSubstations}
            showGasPipelines={showGasPipelines}
            showEarthquakes={showEarthquakes}
            showInterfaceFlows={showInterfaceFlows}
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
            { label: 'ZONES',   value: '20',               warn: false },
            { label: 'PLANTS',  value: String(plantCount),  warn: false },
            { label: 'OUTAGES', value: totalOutageMW > 0 ? `${(totalOutageMW/1000).toFixed(1)}GW` : '–', warn: totalOutageMW > 2000 },
            { label: 'UPDATED', value: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'America/New_York' }) + ' EPT', warn: false },
          ].map(item => (
            <span key={item.label} style={{ fontFamily: F.mono, fontSize: '0.6rem' }}>
              <span style={{ color: C.textMuted, letterSpacing: '0.1em' }}>{item.label}: </span>
              <span style={{ color: item.warn ? '#FFB800' : C.electricBlue }}>{item.value}</span>
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
          <Toggle label="TRANSMISSION"    active={showTx}             color="#00FFF0"        onToggle={() => setShowTx(p => !p)} />
          <Toggle label="ZONE FILLS"      active={showZones}          color={C.electricBlue} onToggle={() => setShowZones(p => !p)} />
          <Toggle label="3D EXTRUSION"    active={showExtrusion}      color={C.amber}        onToggle={() => setShowExtrusion(p => !p)} />
          <Toggle label="POWER PLANTS"    active={showPlants}         color={C.cyan}         onToggle={() => setShowPlants(p => !p)} />
          <Toggle label="HUB NODES"       active={showNodes}          color="#FFB800"        onToggle={() => setShowNodes(p => !p)} />
          <Toggle label="GAS PIPELINES"   active={showGasPipelines}   color="#F97316"        onToggle={() => setShowGasPipelines(p => !p)} />
          <Toggle label="SUBSTATIONS"     active={showSubstations}    color="#FFFFFF"        onToggle={() => setShowSubstations(p => !p)} />
          <Toggle label="SEISMIC ALERTS"  active={showEarthquakes}    color="#FF3B3B"        onToggle={() => setShowEarthquakes(p => !p)} />
          <Toggle label="INTERFACE FLOWS" active={showInterfaceFlows} color="#00E676"        onToggle={() => setShowInterfaceFlows(p => !p)} />
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
        {/* Live Intelligence Panel */}
        <Panel label="GRID INTELLIGENCE">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontFamily: F.mono, fontSize: '0.55rem', color: C.textMuted }}>DATA SOURCE</span>
            <span style={{
              fontFamily: F.mono, fontSize: '0.5rem',
              color: fuelLive ? '#10B981' : '#FFB800',
              letterSpacing: '0.1em',
            }}>
              {fuelLive ? '\u25CF LIVE' : '\u25D0 SIMULATED'}
            </span>
          </div>
          {fuelMixData.fuels.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontFamily: F.mono, fontSize: '0.55rem', color: C.textMuted, letterSpacing: '0.1em' }}>
                GENERATION MIX
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 4 }}>
                {fuelMixData.fuels
                  .sort((a, b) => b.mw - a.mw)
                  .slice(0, 5)
                  .map(f => {
                    const total = fuelMixData.fuels.reduce((s, x) => s + x.mw, 0);
                    const pct   = total > 0 ? (f.mw / total) * 100 : 0;
                    const color = f.type === 'Gas' ? '#E67E22' : f.type === 'Nuclear' ? '#9B59B6'
                                : f.type === 'Wind' ? '#00A3FF' : f.type === 'Solar' ? '#F1C40F'
                                : f.type === 'Coal' ? '#636E72' : '#3498DB';
                    return (
                      <div key={f.type} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: `${pct}%`, maxWidth: '60%', height: 4, borderRadius: 2, background: color, flexShrink: 0 }} />
                        <span style={{ fontFamily: F.mono, fontSize: '0.55rem', color: C.textSecondary }}>
                          {f.type} {f.mw.toLocaleString()}MW
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
          {constraintData.constraints.length > 0 && (
            <div style={{ marginBottom: 8, borderTop: `1px solid ${C.glassBorder}`, paddingTop: 8 }}>
              <span style={{ fontFamily: F.mono, fontSize: '0.55rem', color: '#FF3B3B', letterSpacing: '0.1em' }}>
                BINDING CONSTRAINTS
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 4 }}>
                {constraintData.constraints.slice(0, 3).map((c, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: F.mono, fontSize: '0.5rem', color: C.textSecondary, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.name}
                    </span>
                    <span style={{ fontFamily: F.mono, fontSize: '0.55rem', color: '#FF3B3B' }}>
                      ${c.shadow_price.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {totalOutageMW > 0 && (
            <div style={{ borderTop: `1px solid ${C.glassBorder}`, paddingTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: F.mono, fontSize: '0.55rem', color: C.textMuted, letterSpacing: '0.1em' }}>OUTAGES</span>
                <span style={{ fontFamily: F.mono, fontSize: '0.65rem', color: '#FFB800' }}>{totalOutageMW.toLocaleString()} MW</span>
              </div>
            </div>
          )}
        </Panel>

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
