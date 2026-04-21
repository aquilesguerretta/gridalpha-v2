// src/components/atlas/layers/infrastructureLayers.ts
// Mapbox native layer definitions for infrastructure overlays.
// Gas pipelines, substations — static HIFLD data.

import type { LayerProps } from 'react-map-gl';

// Overlays used to pass `slot: 'top'` for Mapbox Standard styles. The prop
// isn't in react-map-gl's LayerProps type and is silently ignored on the
// current basemap, so it was removed to unbreak the build. If we switch to
// a Standard style, add it back via a cast or extended LayerProps type.

export const gasPipelineGlowLayer: LayerProps = {
  id:   'gas-pipelines-glow',
  type: 'line',
  paint: {
    'line-color':   '#F97316',
    'line-width':   [
      'interpolate', ['linear'], ['zoom'],
      3, 4,
      6, 7,
      10, 12,
    ] as any,
    'line-opacity': 0.15,
    'line-blur':    4,
  },
};

export const gasPipelineLayer: LayerProps = {
  id:   'gas-pipelines',
  type: 'line',
  paint: {
    'line-color':   '#F97316',
    'line-width':   [
      'interpolate', ['linear'], ['zoom'],
      3,  1.5,
      6,  2.5,
      10, 4.0,
    ] as any,
    'line-opacity':    0.85,
    'line-dasharray': [4, 3],
  },
};

// ── Pipeline terminus markers ─────────────────────────────────────────────
// Anchor the start/end of every pipeline line so it never trails off into
// empty map. The outer ring is a soft halo; the inner dot is solid orange.

export const pipelineTerminusHaloLayer: LayerProps = {
  id:   'gas-pipeline-terminus-halo',
  type: 'circle',
  paint: {
    'circle-radius': [
      'interpolate', ['linear'], ['zoom'],
      3,  4,
      6,  7,
      10, 12,
    ] as any,
    'circle-color':         '#F97316',
    'circle-opacity':       0.18,
    'circle-blur':          0.6,
    'circle-stroke-width':  0,
  },
};

export const pipelineTerminusDotLayer: LayerProps = {
  id:   'gas-pipeline-terminus',
  type: 'circle',
  paint: {
    'circle-radius': [
      'interpolate', ['linear'], ['zoom'],
      3,  2.5,
      6,  3.5,
      10, 5,
    ] as any,
    'circle-color':        '#F97316',
    'circle-opacity':      0.95,
    'circle-stroke-width': 1.5,
    'circle-stroke-color': 'rgba(255,255,255,0.85)',
  },
};

export const pipelineTerminusLabelLayer: LayerProps = {
  id:   'gas-pipeline-terminus-label',
  type: 'symbol',
  minzoom: 5,
  layout: {
    'text-field':        ['coalesce', ['get', 'NAME'], ''] as any,
    'text-font':         ['Open Sans Bold', 'Arial Unicode MS Bold'],
    'text-size':         [
      'interpolate', ['linear'], ['zoom'],
      5,  9,
      8,  11,
      12, 13,
    ] as any,
    'text-offset':       [0, 1.1],
    'text-anchor':       'top',
    'text-optional':     true,
    'text-allow-overlap': false,
  },
  paint: {
    'text-color':      '#FDBA74',
    'text-halo-color': 'rgba(0,0,0,0.9)',
    'text-halo-width': 1.5,
  },
};

export const substationLayer: LayerProps = {
  id:   'substations',
  type: 'circle',
  paint: {
    'circle-radius': [
      'interpolate', ['linear'],
      ['coalesce', ['get', 'VOLTAGE'], 115],
      69,  3,
      115, 4,
      230, 6,
      345, 8,
      500, 10,
      765, 13,
    ] as any,
    'circle-color': [
      'interpolate', ['linear'],
      ['coalesce', ['get', 'VOLTAGE'], 115],
      69,  '#4B3D8F',
      115, '#6D28D9',
      230, '#6B7FD4',
      345, '#00A3FF',
      500, '#00FFF0',
      765, '#FFFFFF',
    ] as any,
    'circle-opacity':      0.85,
    'circle-stroke-width': 1,
    'circle-stroke-color': 'rgba(255,255,255,0.4)',
  },
};

export const substationLabelLayer: LayerProps = {
  id:   'substation-labels',
  type: 'symbol',
  minzoom: 10,
  layout: {
    'text-field':   ['coalesce', ['get', 'NAME'], ''] as any,
    'text-size':    9,
    'text-offset':  [0, 1.4],
    'text-anchor':  'top',
    'text-font':    ['Open Sans Bold', 'Arial Unicode MS Bold'],
    'text-optional': true,
  },
  paint: {
    'text-color':       'rgba(255,255,255,0.7)',
    'text-halo-color':  'rgba(0,0,0,0.8)',
    'text-halo-width':  1,
  },
};
