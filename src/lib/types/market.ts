// FOUNDRY contract — market data types for terminal surfaces.

export type Regime =
  | 'normal'
  | 'burning'
  | 'suppressed'
  | 'scarcity'
  | 'transition'
  | 'discharging'
  | 'charging'
  | 'idle';

export interface PricePoint {
  hour: number;
  price: number;
}

export interface ZoneSnapshot {
  zoneKey: string;
  zoneDisplay: string;
  lmp: number;
  delta1h: number;
  avg24h: number;
  daPrice: number;
  daRtSpread: number;
  regime: Regime;
  timestamp: string;
  prices24h: PricePoint[];
}
