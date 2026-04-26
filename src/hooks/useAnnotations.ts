import { useCallback, useMemo } from 'react';
import { useAnnotationStore } from '@/stores/annotationStore';

// CONDUIT — per-chart annotation hook.
// Caller passes the stable chartId (pattern: "<screen>:<chart-id>") and
// gets back the slice of annotations for that chart plus typed helpers.

export function useAnnotations(chartId: string) {
  const allAnnotations = useAnnotationStore((s) => s.annotations);
  const addAnnotation = useAnnotationStore((s) => s.addAnnotation);
  const updateAnnotation = useAnnotationStore((s) => s.updateAnnotation);
  const deleteAnnotation = useAnnotationStore((s) => s.deleteAnnotation);
  const clearChart = useAnnotationStore((s) => s.clearChart);

  // Derive the per-chart slice with stable referential identity so
  // consumers can use it as an effect dependency without thrashing.
  const annotations = useMemo(
    () =>
      allAnnotations
        .filter((a) => a.chartId === chartId)
        .sort((a, b) => a.sequence - b.sequence),
    [allAnnotations, chartId],
  );

  const add = useCallback(
    (xNormalized: number, yNormalized: number, text: string) => {
      return addAnnotation({ chartId, xNormalized, yNormalized, text });
    },
    [chartId, addAnnotation],
  );

  const clearAll = useCallback(() => clearChart(chartId), [chartId, clearChart]);

  return {
    annotations,
    add,
    update: updateAnnotation,
    remove: deleteAnnotation,
    clearAll,
  };
}
