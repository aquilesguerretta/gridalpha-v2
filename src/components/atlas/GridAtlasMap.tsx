// src/components/atlas/GridAtlasMap.tsx
// Native Mapbox GL rendering via react-map-gl Source+Layer components.
// All layers render inside Mapbox's GPU pipeline — no floating at any pitch.
// CARTO Dark Matter basemap for perfect dark aesthetic.

import {
  useState, useRef, useEffect, useMemo, useCallback, forwardRef, useImperativeHandle,
} from 'react';
import Map, {
  Source, Layer,
  type MapRef,
  type LayerProps,
} from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  gasPipelineLayer,
  gasPipelineGlowLayer,
  pipelineTerminusHaloLayer,
  pipelineTerminusDotLayer,
  pipelineTerminusLabelLayer,
  substationLayer,
  substationLabelLayer,
} from './layers/infrastructureLayers';
import {
  earthquakeLayer,
  earthquakeLabelLayer,
} from './layers/intelligenceLayers';
import { buildPipelineTermini } from './utils/buildPipelineTermini';

// ── Constants ─────────────────────────────────────────────────────────────

export const CARTO_DARK =
  'mapbox://styles/aquiles-guerretta/cmns0ux4s002s01s3au66boo8';

export const MAPBOX_SATELLITE =
  'mapbox://styles/mapbox/satellite-streets-v12';

export const MAPBOX_TERRAIN =
  'mapbox://styles/mapbox/outdoors-v12';

export const MAPBOX_MINIMAL =
  'mapbox://styles/mapbox/light-v11';

// PJM footprint overview — all 20 zones visible, labels readable.
const PJM_OVERVIEW = {
  longitude: -79.5,
  latitude:   39.8,
  zoom:       5.5,
  pitch:      0,
  bearing:    0,
} as const;

// Globe entry — camera zoomed out; intro animation flies into PJM_OVERVIEW.
const GLOBE_START = {
  longitude: -60,
  latitude:   25,
  zoom:       1.6,
  pitch:      0,
  bearing:    0,
} as const;

// Session-scoped camera persistence so Atlas remembers position
// when user navigates away and back.
const SS_CAMERA_KEY   = 'gridalpha:atlas-camera';
const SS_INTRO_PLAYED = 'gridalpha:atlas-intro-played';

interface CameraState {
  longitude: number; latitude: number;
  zoom:      number; pitch:    number; bearing: number;
}

function readSavedCamera(): CameraState | null {
  try {
    const raw = sessionStorage.getItem(SS_CAMERA_KEY);
    return raw ? JSON.parse(raw) as CameraState : null;
  } catch { return null; }
}

function saveCamera(c: CameraState): void {
  try { sessionStorage.setItem(SS_CAMERA_KEY, JSON.stringify(c)); } catch { /* ignore */ }
}

function pickInitialView(): CameraState {
  // If we already played intro this session, restore last position.
  const saved = readSavedCamera();
  if (saved) return saved;
  // First visit in this session — start at globe; intro will fly to PJM.
  const introPlayed = (() => {
    try { return sessionStorage.getItem(SS_INTRO_PLAYED) === '1'; } catch { return false; }
  })();
  return introPlayed ? PJM_OVERVIEW : GLOBE_START;
}

// ── Voltage colour mapping ────────────────────────────────────────────────

const voltageColor: any = [
  'match',
  ['get', 'VOLTAGE'],
  '735',  '#FFFFFF',
  '765',  '#FFFFFF',
  '500',  '#00FFF0',
  '345',  '#00A3FF',
  '230',  '#6B7FD4',
  '161',  '#8B5CF6',
  '138',  '#7C3AED',
  '115',  '#6D28D9',
  '#4B3D8F',
];

const voltageWidth: any = [
  'interpolate', ['linear'], ['zoom'],
  4,  ['match', ['get', 'VOLTAGE'], '500', 1.5, '345', 1.2, '230', 0.8, 0.4],
  8,  ['match', ['get', 'VOLTAGE'], '500', 3.0, '345', 2.5, '230', 1.8, 1.0],
  12, ['match', ['get', 'VOLTAGE'], '500', 5.0, '345', 4.0, '230', 3.0, 1.8],
];

// ── Fuel colour mapping ───────────────────────────────────────────────────

const fuelColor: any = [
  'match', ['upcase', ['coalesce', ['get', 'PRIM_FUEL'], ['get', 'fuel_type'], '']],
  'NG',    '#E67E22',
  'GAS',   '#E67E22',
  'NUC',   '#9B59B6',
  'NUCLEAR','#9B59B6',
  'WIND',  '#00A3FF',
  'WND',   '#00A3FF',
  'SUN',   '#F1C40F',
  'SOLAR', '#F1C40F',
  'COAL',  '#636E72',
  'COL',   '#636E72',
  'WAT',   '#3498DB',
  'HYDRO', '#3498DB',
  'BAT',   '#00E676',
  'GEO',   '#FF6B35',
  'OIL',   '#A0522D',
  '#BDC3C7',
];

// ── Layer style definitions ───────────────────────────────────────────────

// All overlay layers use `slot: 'top'` so Mapbox Standard (Terminal) style
// renders them ABOVE its basemap composite — without this, fuel/hub colors
// get crushed to near-black by the Monochrome Night dark theme.

const txGlowLayer: LayerProps = {
  id:   'tx-glow',
  type: 'line',
  paint: {
    'line-color':   voltageColor,
    'line-width':   voltageWidth,
    'line-blur':    6,
    'line-opacity': 0.35,
  },
};

const txCoreLayer: LayerProps = {
  id:   'tx-core',
  type: 'line',
  paint: {
    'line-color':   voltageColor,
    'line-width':   voltageWidth,
    'line-opacity': 0.9,
  },
};

const plantClusterLayer: LayerProps = {
  id:     'plant-clusters',
  type:   'circle',
  filter: ['has', 'point_count'],
  paint:  {
    'circle-color': [
      'step', ['get', 'point_count'],
      '#00A3FF', 10,
      '#FFB800', 30,
      '#FF3B3B',
    ] as any,
    'circle-radius':  ['step', ['get', 'point_count'], 14, 10, 20, 30, 26] as any,
    'circle-opacity': 0.95,
    'circle-stroke-width': 1.5,
    'circle-stroke-color': 'rgba(255,255,255,0.55)',
  },
};

const plantClusterCountLayer: LayerProps = {
  id:     'plant-cluster-count',
  type:   'symbol',
  filter: ['has', 'point_count'],
  layout: {
    'text-field':  '{point_count_abbreviated}',
    'text-size':   11,
    'text-font':   ['Open Sans Bold', 'Arial Unicode MS Bold'],
  },
  paint: {
    'text-color':      '#ffffff',
    'text-halo-color': 'rgba(0,0,0,0.8)',
    'text-halo-width': 1,
  },
};

// ── Hub node layers ───────────────────────────────────────────────────────

const hubDotLayer: LayerProps = {
  id:   'hub-dots',
  type: 'circle',
  paint: {
    'circle-radius':       [
      'interpolate', ['linear'], ['zoom'],
      4, 6,  8, 12,  12, 18,
    ] as any,
    'circle-color':        [
      'interpolate', ['linear'], ['get', 'lmp'],
      30, '#00A3FF',
      34, '#FFB800',
      37, '#FF3B3B',
    ] as any,
    'circle-opacity':      1.0,
    'circle-stroke-width': 2,
    'circle-stroke-color': 'rgba(255,255,255,0.75)',
  },
};

const hubLabelLayer: LayerProps = {
  id:     'hub-labels',
  type:   'symbol',
  layout: {
    'text-field':       ['get', 'label'],
    'text-font':        ['Open Sans Bold', 'Arial Unicode MS Bold'],
    'text-size':        11,
    'text-offset':      [0, -2],
    'text-anchor':      'bottom',
    'text-allow-overlap': true,
  },
  paint: {
    'text-color':      'rgba(255,255,255,0.85)',
    'text-halo-color': 'rgba(0,0,0,0.8)',
    'text-halo-width': 1.5,
  },
};

// ── Outage markers (Wave 2 — driven by AtlasSnapshot.outages) ─────────────
// Outage rings appear / disappear as the scrubber moves through each
// outage's active window. Color encodes fuel; halo encodes severity.

const fuelOutageColor: any = [
  'match', ['upcase', ['coalesce', ['get', 'fuel'], '']],
  'NG',    '#E67E22',
  'NUC',   '#9B59B6',
  'COAL',  '#636E72',
  'WIND',  '#00A3FF',
  'SOLAR', '#F1C40F',
  'HYDRO', '#3498DB',
  'BAT',   '#00E676',
  'OIL',   '#A0522D',
  '#FF3B3B',
];

const outageHaloLayer: LayerProps = {
  id:   'outages-halo',
  type: 'circle',
  paint: {
    'circle-radius': [
      'interpolate', ['linear'],
      ['coalesce', ['get', 'mw'], 500],
      300,  16,
      1000, 24,
      2500, 36,
    ] as any,
    'circle-color':         '#FF3B3B',
    'circle-opacity':       0.18,
    'circle-blur':          0.55,
    'circle-stroke-width':  0,
  },
};

const outageRingLayer: LayerProps = {
  id:   'outages-ring',
  type: 'circle',
  paint: {
    'circle-radius': [
      'interpolate', ['linear'],
      ['coalesce', ['get', 'mw'], 500],
      300,  10,
      1000, 14,
      2500, 20,
    ] as any,
    'circle-color':        'rgba(0,0,0,0)',
    'circle-stroke-color': fuelOutageColor,
    'circle-stroke-width': 2,
    'circle-opacity':      1,
  },
};

const outageLabelLayer: LayerProps = {
  id:     'outage-labels',
  type:   'symbol',
  minzoom: 6,
  layout: {
    'text-field':       ['concat', ['get', 'name'], ' · -', ['to-string', ['get', 'mw']], ' MW'] as any,
    'text-font':        ['Open Sans Bold', 'Arial Unicode MS Bold'],
    'text-size':        10,
    'text-offset':      [0, 1.6],
    'text-anchor':      'top',
    'text-allow-overlap': false,
    'text-optional':    true,
  },
  paint: {
    'text-color':      '#FF3B3B',
    'text-halo-color': 'rgba(0,0,0,0.85)',
    'text-halo-width': 1.5,
  },
};

// ── Plant fallback circle layer (renders immediately, before SVG icons load) ─

const plantCircleFallback: LayerProps = {
  id:     'plant-circles',
  type:   'circle',
  filter: ['!', ['has', 'point_count']],
  paint: {
    'circle-radius': [
      'interpolate', ['linear'],
      ['coalesce', ['get', 'INSTALL_MW'], ['get', 'capacity_mw'], 100],
      50, 4, 500, 7, 2000, 12, 5000, 18,
    ] as any,
    'circle-color':        fuelColor,
    'circle-opacity':      1.0,
    'circle-stroke-width': 1,
    'circle-stroke-color': 'rgba(255,255,255,0.55)',
  },
};

// SVG circle icon generator
// ── FlyTo helper exposed to parent ────────────────────────────────────────

export interface GridAtlasMapHandle {
  flyTo: (lon: number, lat: number, zoom: number) => void;
}

// ── Props ─────────────────────────────────────────────────────────────────

export interface GridAtlasMapProps {
  mapStyle:           string;
  txGeoJson:          GeoJSON.FeatureCollection | null;
  plantGeoJson:       GeoJSON.FeatureCollection | null;
  hubGeoJson:         GeoJSON.FeatureCollection | null;
  /**
   * ATLAS Wave 2 — outage markers driven by the AtlasSnapshot. Markers
   * appear/disappear as the scrubber moves through outages' active windows.
   */
  outagesGeoJson?:    GeoJSON.FeatureCollection | null;
  substationGeoJson:  GeoJSON.FeatureCollection | null;
  pipelineGeoJson:    GeoJSON.FeatureCollection | null;
  earthquakeGeoJson:  GeoJSON.FeatureCollection | null;
  weatherGeoJson:     GeoJSON.FeatureCollection | null;
  showTx:             boolean;
  showPlants:         boolean;
  showNodes:          boolean;
  showSubstations:    boolean;
  showGasPipelines:   boolean;
  showEarthquakes:    boolean;
  onZoneClick:        (zoneId: string | null) => void;
  onPlantHover:       (props: Record<string, unknown> | null, x: number, y: number) => void;
  onZoneHover:        (name: string | null) => void;
}

// ── Component ─────────────────────────────────────────────────────────────

const GridAtlasMap = forwardRef<GridAtlasMapHandle, GridAtlasMapProps>(
  function GridAtlasMap(
    {
      mapStyle, txGeoJson, plantGeoJson, hubGeoJson, outagesGeoJson,
      substationGeoJson, pipelineGeoJson, earthquakeGeoJson,
      weatherGeoJson,
      showTx, showPlants, showNodes,
      showSubstations, showGasPipelines, showEarthquakes,
      onZoneClick, onPlantHover, onZoneHover,
    },
    ref,
  ) {
    const mapRef = useRef<MapRef>(null);
    const [styleLoaded, setStyleLoaded] = useState(false);

    // Derived terminus points for gas pipelines (first + last coord of each line)
    const pipelineTerminiGeoJson = useMemo(
      () => buildPipelineTermini(pipelineGeoJson),
      [pipelineGeoJson],
    );

    useImperativeHandle(ref, () => ({
      flyTo: (lon, lat, zoom) => {
        mapRef.current?.flyTo({
          center: [lon, lat],
          zoom,
          duration: 1400,
          essential: true,
        });
      },
    }));

    const onMapClick = useCallback((e: any) => {
      const features = e.features as any[];
      if (!features?.length) { onZoneClick(null); return; }
      const zoneId =
        features[0]?.properties?.zone_id ??
        features[0]?.properties?.ZONE ??
        features[0]?.properties?.name ??
        null;
      onZoneClick(zoneId);
    }, [onZoneClick]);

    const onMouseMove = useCallback((e: any) => {
      const features = e.features as any[];
      if (!features?.length) {
        onPlantHover(null, 0, 0);
        onZoneHover(null);
        return;
      }
      const f = features[0];
      if (f.layer?.id === 'plant-circles' || f.layer?.id === 'plant-clusters') {
        onPlantHover(f.properties as Record<string, unknown>, e.point.x, e.point.y);
        onZoneHover(null);
      }
    }, [onPlantHover, onZoneHover]);

    const onMouseLeave = useCallback(() => {
      onPlantHover(null, 0, 0);
      onZoneHover(null);
    }, [onPlantHover, onZoneHover]);

    // Re-applies terrain + Standard style config + fog. Safe to call
    // on every `styledata` event so the look survives style swaps.
    const applyStyleSetup = useCallback(() => {
      const map = mapRef.current?.getMap();
      if (!map) return;

      try {
        if (!map.getSource('mapbox-dem')) {
          map.addSource('mapbox-dem', {
            type:     'raster-dem',
            url:      'mapbox://mapbox.mapbox-terrain-dem-v1',
            tileSize:  512,
            maxzoom:   14,
          });
        }
        map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });
      } catch { /* ignore */ }

      // Force Standard style config — `dusk` keeps the dark aesthetic
      // without the aggressive color darkening that `night` applies
      // to slot:'top' overlay layers (which crushes fuel/hub colors).
      try {
        map.setConfigProperty('basemap', 'lightPreset', 'dusk');
        map.setConfigProperty('basemap', 'showPointOfInterestLabels', false);
        map.setConfigProperty('basemap', 'showTransitLabels', false);
      } catch { /* style may not support config */ }

      try {
        map.setFog({
          color:            '#0A0A0B',
          'high-color':     '#0D1520',
          'horizon-blend':   0.04,
          'space-color':    '#000005',
          'star-intensity':  0.7,
        } as any);
      } catch { /* ignore */ }
    }, []);

    const onMapLoad = useCallback(() => {
      const map = mapRef.current?.getMap();
      if (!map) return;

      applyStyleSetup();
      setStyleLoaded(true);

      // Cinematic intro — only once per session.
      let introPlayed = false;
      try { introPlayed = sessionStorage.getItem(SS_INTRO_PLAYED) === '1'; } catch { /* ignore */ }
      const hasSavedCamera = !!readSavedCamera();

      if (!introPlayed && !hasSavedCamera) {
        // Small delay so the globe renders a frame before the fly-in.
        setTimeout(() => {
          map.flyTo({
            ...PJM_OVERVIEW,
            duration:  3500,
            essential: true,
            curve:     1.6,
            speed:     0.9,
          });
          try { sessionStorage.setItem(SS_INTRO_PLAYED, '1'); } catch { /* ignore */ }
        }, 350);
      }
    }, [applyStyleSetup]);

    // Re-apply terrain/config whenever a new style loads (style swap).
    useEffect(() => {
      const map = mapRef.current?.getMap();
      if (!map) return;
      const handler = () => {
        if (!map.isStyleLoaded()) return;
        applyStyleSetup();
      };
      map.on('styledata', handler);
      return () => { try { map.off('styledata', handler); } catch { /* ignore */ } };
    }, [applyStyleSetup]);

    // Persist camera to sessionStorage so nav-away / nav-back restores position.
    const onMoveEnd = useCallback(() => {
      const map = mapRef.current?.getMap();
      if (!map) return;
      const c = map.getCenter();
      saveCamera({
        longitude: c.lng,
        latitude:  c.lat,
        zoom:      map.getZoom(),
        pitch:     map.getPitch(),
        bearing:   map.getBearing(),
      });
    }, []);

    const interactiveLayerIds = [
      ...(showPlants ? ['plant-circles', 'plant-clusters'] : []),
      ...(showNodes  ? ['hub-dots'] : []),
    ];

    return (
      <Map
        ref={mapRef}
        initialViewState={pickInitialView()}
        mapStyle={mapStyle}
        mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN as string}
        style={{ position: 'absolute', inset: 0 }}
        projection={{ name: 'globe' } as any}
        interactiveLayerIds={interactiveLayerIds}
        onClick={onMapClick}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onLoad={onMapLoad}
        onMoveEnd={onMoveEnd}
        cursor="crosshair"
      >
        {/* Transmission Lines */}
        {styleLoaded && showTx && txGeoJson && (
          <Source id="transmission" type="geojson" data={txGeoJson}>
            <Layer {...txGlowLayer} />
            <Layer {...txCoreLayer} />
          </Source>
        )}

        {/* Power Plants */}
        {styleLoaded && showPlants && plantGeoJson && (
          <Source
            id="plants" type="geojson" data={plantGeoJson}
            cluster={true} clusterMaxZoom={8} clusterRadius={40}
          >
            <Layer {...plantClusterLayer} />
            <Layer {...plantClusterCountLayer} />
            <Layer {...plantCircleFallback} />
          </Source>
        )}

        {/* Hub Nodes */}
        {styleLoaded && showNodes && hubGeoJson && (
          <Source id="hub-nodes" type="geojson" data={hubGeoJson}>
            <Layer {...hubDotLayer} />
            <Layer {...hubLabelLayer} />
          </Source>
        )}

        {/* Gas Pipelines */}
        {styleLoaded && showGasPipelines && pipelineGeoJson && (
          <Source id="gas-pipelines" type="geojson" data={pipelineGeoJson}>
            <Layer {...gasPipelineGlowLayer} />
            <Layer {...gasPipelineLayer} />
          </Source>
        )}

        {/* Pipeline terminus markers — anchor every line end with a dot + label */}
        {styleLoaded && showGasPipelines && pipelineTerminiGeoJson.features.length > 0 && (
          <Source id="gas-pipeline-termini" type="geojson" data={pipelineTerminiGeoJson}>
            <Layer {...pipelineTerminusHaloLayer} />
            <Layer {...pipelineTerminusDotLayer} />
            <Layer {...pipelineTerminusLabelLayer} />
          </Source>
        )}

        {/* Substations */}
        {styleLoaded && showSubstations && substationGeoJson && (
          <Source id="substations" type="geojson" data={substationGeoJson}>
            <Layer {...substationLayer} />
            <Layer {...substationLabelLayer} />
          </Source>
        )}

        {/* Earthquakes */}
        {styleLoaded && showEarthquakes && earthquakeGeoJson && (
          <Source id="earthquakes" type="geojson" data={earthquakeGeoJson}>
            <Layer {...earthquakeLayer} />
            <Layer {...earthquakeLabelLayer} />
          </Source>
        )}

        {/* Outages — Wave 2 time-travel-driven generator outage rings.
            Source is keyed on `outages` so re-mounting the source on
            every snapshot change triggers a smooth Mapbox repaint. */}
        {styleLoaded && outagesGeoJson && outagesGeoJson.features.length > 0 && (
          <Source id="outages" type="geojson" data={outagesGeoJson}>
            <Layer {...outageHaloLayer} />
            <Layer {...outageRingLayer} />
            <Layer {...outageLabelLayer} />
          </Source>
        )}

        {/* Weather Overlay */}
        {styleLoaded && weatherGeoJson && (
          <Source id="weather" type="geojson" data={weatherGeoJson}>
            <Layer
              id="weather-wind"
              type="circle"
              paint={{
                'circle-radius': [
                  'interpolate', ['linear'],
                  ['get', 'wind_ms'],
                  0,  8,
                  5,  14,
                  10, 20,
                  15, 28,
                ] as any,
                'circle-color':        ['get', 'wind_color'] as any,
                'circle-opacity':       0.15,
                'circle-stroke-color': ['get', 'wind_color'] as any,
                'circle-stroke-width':  1.5,
                'circle-stroke-opacity': 0.7,
              }}
            />
            <Layer
              id="weather-labels"
              type="symbol"
              layout={{
                'text-field':   ['get', 'display_label'] as any,
                'text-size':     10,
                'text-font':    ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                'text-offset':  [0, 2.2] as any,
                'text-anchor':  'top',
                'text-optional': true,
              }}
              paint={{
                'text-color':       ['get', 'temp_color'] as any,
                'text-halo-color':  'rgba(0,0,0,0.85)',
                'text-halo-width':   1.5,
              }}
            />
          </Source>
        )}
      </Map>
    );
  },
);

export default GridAtlasMap;
