// src/components/atlas/GridAtlasMap.tsx
// Native Mapbox GL rendering via react-map-gl Source+Layer components.
// All layers render inside Mapbox's GPU pipeline — no floating at any pitch.
// CARTO Dark Matter basemap for perfect dark aesthetic.

import {
  useRef, useCallback, forwardRef, useImperativeHandle,
} from 'react';
import Map, {
  Source, Layer,
  type MapRef,
  type LayerProps,
} from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// ── Constants ─────────────────────────────────────────────────────────────

export const CARTO_DARK =
  'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

export const MAPBOX_SATELLITE =
  'mapbox://styles/mapbox/satellite-streets-v12';

export const MAPBOX_TERRAIN =
  'mapbox://styles/mapbox/outdoors-v12';

export const MAPBOX_MINIMAL =
  'mapbox://styles/mapbox/light-v11';

const INITIAL_VIEW = {
  longitude:  -79.5,
  latitude:    39.8,
  zoom:         5.8,
  pitch:         0,
  bearing:       0,
};

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

const zoneFillLayer: LayerProps = {
  id:   'zone-fill',
  type: 'fill',
  paint: {
    'fill-color': [
      'interpolate', ['linear'],
      ['coalesce', ['get', 'lmp_total'], 33],
      28, '#00A3FF',
      35, '#FFB800',
      42, '#FF3B3B',
    ] as any,
    'fill-opacity': 0.25,
  },
};

const zoneBorderLayer: LayerProps = {
  id:   'zone-border',
  type: 'line',
  paint: {
    'line-color':   '#00A3FF',
    'line-width':   1.2,
    'line-opacity': 0.7,
  },
};

const zoneExtrusionLayer: LayerProps = {
  id:   'zone-extrusion',
  type: 'fill-extrusion',
  paint: {
    'fill-extrusion-color': [
      'interpolate', ['linear'],
      ['coalesce', ['get', 'lmp_total'], 33],
      28, '#00A3FF',
      35, '#FFB800',
      42, '#FF3B3B',
    ] as any,
    'fill-extrusion-height': [
      'interpolate', ['linear'],
      ['coalesce', ['get', 'lmp_total'], 33],
      28, 0,
      42, 60000,
    ] as any,
    'fill-extrusion-base':    0,
    'fill-extrusion-opacity': 0.5,
  },
};

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
      'rgba(0,163,255,0.7)', 10,
      'rgba(255,183,0,0.7)', 30,
      'rgba(255,59,59,0.7)',
    ] as any,
    'circle-radius':  ['step', ['get', 'point_count'], 14, 10, 20, 30, 26] as any,
    'circle-opacity': 0.85,
    'circle-stroke-width': 1.5,
    'circle-stroke-color': 'rgba(255,255,255,0.4)',
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
  paint: { 'text-color': '#ffffff' },
};

const plantSymbolLayer: LayerProps = {
  id:     'plant-symbols',
  type:   'symbol',
  filter: ['!', ['has', 'point_count']],
  layout: {
    'icon-image':              ['get', 'fuel_icon'] as any,
    'icon-size':               [
      'interpolate', ['linear'],
      ['coalesce', ['get', 'INSTALL_MW'], ['get', 'capacity_mw'], 100],
      50,   0.4,
      500,  0.7,
      2000, 1.0,
      5000, 1.4,
    ] as any,
    'icon-allow-overlap':      true,
    'icon-ignore-placement':   false,
    'text-field':              [
      'step', ['zoom'],
      '', 9,
      ['coalesce', ['get', 'NAME'], ['get', 'name'], ''],
    ] as any,
    'text-font':               ['Open Sans Bold', 'Arial Unicode MS Bold'],
    'text-size':               10,
    'text-offset':             [0, 1.5],
    'text-anchor':             'top',
    'text-optional':           true,
  },
  paint: {
    'text-color':      '#ffffff',
    'text-halo-color': 'rgba(0,0,0,0.8)',
    'text-halo-width': 1,
    'icon-opacity':    0.92,
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
    'circle-opacity':      0.9,
    'circle-stroke-width': 2,
    'circle-stroke-color': 'rgba(255,255,255,0.6)',
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
    'circle-opacity':      0.85,
    'circle-stroke-width': 1,
    'circle-stroke-color': 'rgba(255,255,255,0.35)',
  },
};

// SVG circle icon generator
function circleIcon(color: string, symbol: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="13" fill="${color}" fill-opacity="0.85" stroke="rgba(255,255,255,0.5)" stroke-width="1.5"/>
    <text x="16" y="21" text-anchor="middle" font-size="12" fill="white" font-family="Arial">${symbol}</text>
  </svg>`;
}

// ── FlyTo helper exposed to parent ────────────────────────────────────────

export interface GridAtlasMapHandle {
  flyTo: (lon: number, lat: number, zoom: number) => void;
}

// ── Props ─────────────────────────────────────────────────────────────────

export interface GridAtlasMapProps {
  mapStyle:      string;
  zoneGeoJson:   GeoJSON.FeatureCollection | null;
  txGeoJson:     GeoJSON.FeatureCollection | null;
  plantGeoJson:  GeoJSON.FeatureCollection | null;
  hubGeoJson:    GeoJSON.FeatureCollection | null;
  showZones:     boolean;
  showTx:        boolean;
  showPlants:    boolean;
  showNodes:     boolean;
  showExtrusion: boolean;
  onZoneClick:   (zoneId: string | null) => void;
  onPlantHover:  (props: Record<string, unknown> | null, x: number, y: number) => void;
  onZoneHover:   (name: string | null) => void;
}

// ── Component ─────────────────────────────────────────────────────────────

const GridAtlasMap = forwardRef<GridAtlasMapHandle, GridAtlasMapProps>(
  function GridAtlasMap(
    {
      mapStyle, zoneGeoJson, txGeoJson, plantGeoJson, hubGeoJson,
      showZones, showTx, showPlants, showNodes, showExtrusion,
      onZoneClick, onPlantHover, onZoneHover,
    },
    ref,
  ) {
    const mapRef = useRef<MapRef>(null);

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
      } else if (f.layer?.id === 'zone-fill' || f.layer?.id === 'zone-extrusion') {
        onPlantHover(null, 0, 0);
        onZoneHover(
          f.properties?.zone_id ?? f.properties?.ZONE ?? f.properties?.name ?? null,
        );
      }
    }, [onPlantHover, onZoneHover]);

    const onMouseLeave = useCallback(() => {
      onPlantHover(null, 0, 0);
      onZoneHover(null);
    }, [onPlantHover, onZoneHover]);

    const onMapLoad = useCallback(() => {
      const map = mapRef.current?.getMap();
      if (!map) return;

      // Fog for depth (Mapbox styles only)
      try {
        map.setFog({
          color:           '#0A0A0B',
          'high-color':    '#0D1520',
          'horizon-blend':  0.06,
          'space-color':   '#000005',
          'star-intensity': 0.5,
        } as any);
      } catch { /* CARTO doesn't support fog */ }

      // Register custom fuel-type SVG icons
      const icons: [string, string][] = [
        ['fuel-nuclear',  circleIcon('#9B59B6', '☢')],
        ['fuel-gas',      circleIcon('#E67E22', '⚡')],
        ['fuel-wind',     circleIcon('#00A3FF', '↻')],
        ['fuel-solar',    circleIcon('#F1C40F', '☀')],
        ['fuel-coal',     circleIcon('#636E72', '■')],
        ['fuel-hydro',    circleIcon('#3498DB', '≈')],
        ['fuel-battery',  circleIcon('#00E676', '⬡')],
        ['fuel-geo',      circleIcon('#FF6B35', '◆')],
        ['fuel-oil',      circleIcon('#A0522D', '●')],
        ['fuel-default',  circleIcon('#BDC3C7', '●')],
      ];

      const loadIcon = (name: string, svg: string): Promise<void> =>
        new Promise(resolve => {
          const img = new Image(32, 32);
          img.onload = () => {
            if (!map.hasImage(name)) map.addImage(name, img);
            resolve();
          };
          img.onerror = () => resolve();
          img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
        });

      Promise.all(icons.map(([n, s]) => loadIcon(n, s)));
    }, []);

    const interactiveLayerIds = [
      ...(showZones  ? ['zone-fill', 'zone-extrusion'] : []),
      ...(showPlants ? ['plant-circles', 'plant-clusters'] : []),
      ...(showNodes  ? ['hub-dots'] : []),
    ];

    return (
      <Map
        ref={mapRef}
        initialViewState={INITIAL_VIEW}
        mapStyle={mapStyle}
        mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN as string}
        style={{ position: 'absolute', inset: 0 }}
        interactiveLayerIds={interactiveLayerIds}
        onClick={onMapClick}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onLoad={onMapLoad}
        cursor="crosshair"
      >
        {/* PJM Zone Boundaries */}
        {showZones && zoneGeoJson && (
          <Source id="pjm-zones" type="geojson" data={zoneGeoJson} generateId={true}>
            {showExtrusion
              ? <Layer {...zoneExtrusionLayer} />
              : <Layer {...zoneFillLayer} />
            }
            <Layer {...zoneBorderLayer} />
          </Source>
        )}

        {/* Transmission Lines */}
        {showTx && txGeoJson && (
          <Source id="transmission" type="geojson" data={txGeoJson}>
            <Layer {...txGlowLayer} />
            <Layer {...txCoreLayer} />
          </Source>
        )}

        {/* Power Plants */}
        {showPlants && plantGeoJson && (
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
        {showNodes && hubGeoJson && (
          <Source id="hub-nodes" type="geojson" data={hubGeoJson}>
            <Layer {...hubDotLayer} />
            <Layer {...hubLabelLayer} />
          </Source>
        )}
      </Map>
    );
  },
);

export default GridAtlasMap;
