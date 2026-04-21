// src/components/atlas/utils/buildPipelineTermini.ts
// Extracts the first and last coordinate of every pipeline LineString
// and emits a Point FeatureCollection. Used to render terminus markers
// (valve-style dots + name labels) so pipelines don't end in dead air.

type LineOrMulti = GeoJSON.LineString | GeoJSON.MultiLineString;

export function buildPipelineTermini(
  pipelines: GeoJSON.FeatureCollection | null,
): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature<GeoJSON.Point>[] = [];
  if (!pipelines) return { type: 'FeatureCollection', features };

  pipelines.features.forEach((f, i) => {
    const geom = f.geometry as LineOrMulti;
    if (!geom) return;

    // Normalize LineString and MultiLineString into an array of coord lists.
    const lines: GeoJSON.Position[][] =
      geom.type === 'LineString'
        ? [geom.coordinates]
        : geom.type === 'MultiLineString'
          ? geom.coordinates
          : [];

    lines.forEach((coords, segIdx) => {
      if (coords.length < 2) return;
      const first = coords[0];
      const last  = coords[coords.length - 1];
      const name  = (f.properties?.NAME ?? f.properties?.name ?? 'Pipeline') as string;

      features.push({
        type: 'Feature',
        properties: { NAME: name, role: 'start' },
        geometry:   { type: 'Point', coordinates: first },
        id:         `${i}-${segIdx}-start`,
      });
      features.push({
        type: 'Feature',
        properties: { NAME: name, role: 'end' },
        geometry:   { type: 'Point', coordinates: last },
        id:         `${i}-${segIdx}-end`,
      });
    });
  });

  return { type: 'FeatureCollection', features };
}
