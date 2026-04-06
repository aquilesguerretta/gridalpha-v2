// src/types/domain.ts
// PJM domain enums and union types.
// No external dependencies. Import here for all domain-specific types.

export type PjmZoneId =
  | "WEST_HUB" | "COMED"    | "AEP"      | "ATSI"
  | "DAY"      | "DEOK"     | "DUQ"      | "DOMINION"
  | "DPL"      | "EKPC"     | "PPL"      | "PECO"
  | "PSEG"     | "JCPL"     | "PEPCO"    | "BGE"
  | "METED"    | "PENELEC"  | "RECO"     | "OVEC";

export type FuelType =
  | "Gas" | "Nuclear" | "Wind" | "Solar"
  | "Coal" | "Hydro"  | "Other";

export type MarketRegime =
  | "NORMAL OPERATIONS"
  | "ELEVATED DEMAND"
  | "PEAK STRESS"
  | "EMERGENCY CONDITIONS";

export type AlertSeverity = "info" | "warning" | "critical";

export type DataQuality = "LIVE" | "STALE" | "RECONNECTING";

export type PerformanceTier = 1 | 2 | 3;
