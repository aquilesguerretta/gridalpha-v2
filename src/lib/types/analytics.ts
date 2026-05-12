// FOUNDRY contract — analytics workbench types.
// AnalyticsTab drives the six-tab Analytics destination. The 'intelligence'
// tab uses live Peregrine RSS; the other five consume from analytics-mock.ts.

export type AnalyticsTab =
  | 'intelligence'
  | 'price'
  | 'spread'
  | 'battery'
  | 'marginal'
  | 'convergence';

export interface PlantProfitabilityRow {
  name: string;
  zone: string;
  fuel: string;
  heatRate: number;
  capacity: number;
  sparkSpread: number;
  status: 'profitable' | 'breakeven' | 'unprofitable';
}

export interface BidScheduleHour {
  hour: number;
  chargeMw: number;
  dischargeMw: number;
  expectedPrice: number;
}

export interface FuelGanttSegment {
  hour: number;
  fuel: string;
  color: string;
}

export interface ReserveMarginPoint {
  hour: number;
  margin: number;
  threshold: number;
}

export interface ConvergencePoint {
  hour: number;
  daPrice: number;
  rtPrice: number;
  spread: number;
}
