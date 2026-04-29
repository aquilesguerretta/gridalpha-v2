// ORACLE Wave 2 — Analyst Nest context provider.

import type { ContextProvider } from '../aiContext';
import { ANOMALY_DETECTIONS, CORRELATION_ZONES } from '@/lib/mock/analyst-mock';

export const analystNestContextProvider: ContextProvider = (input) => {
  const zone = input.selectedZone ?? null;

  const topAnomalies = ANOMALY_DETECTIONS.slice(0, 3).map(
    (a) => `${a.zone} (${a.sigma.toFixed(1)}σ): ${a.description}`,
  );

  const description =
    `Analyst Nest. Comparison series view, saved-query rail, and ` +
    `correlation matrix across ${CORRELATION_ZONES.join(', ')}. ` +
    `Recent anomaly detections are shown in the right rail. ` +
    `The user is investigating relationships between zones, time-series ` +
    `comparisons, and statistical outliers.`;

  return {
    surfaceLabel: 'Analyst Nest',
    selectedZone: zone,
    visibleData: {
      description,
      metrics: {
        correlatedZones: CORRELATION_ZONES.join(', '),
        anomalyCount: ANOMALY_DETECTIONS.length,
      },
      alerts: topAnomalies,
    },
  };
};
