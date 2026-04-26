// FOUNDRY contract — anomaly feed item types.
// Used by Nest anomaly rails. Peregrine renders live RSS via useNewsData
// and does not consume from this contract.

export type AnomalySeverity = 'critical' | 'warning' | 'normal';

export interface AnomalyItem {
  id: string;
  severity: AnomalySeverity;
  icon: string;
  label: string;
  detail?: string;
  zone: string;
  market: string;
  sigma: string;
  time: string;
}
