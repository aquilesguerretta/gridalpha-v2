// FOUNDRY mock — Industrial Consumer Nest data.
// Facility profile, 5 strategies (NPV-ranked), tariff comparison, demand
// response, carbon intensity, 12-month bill projection.

export interface FacilityProfile {
  name: string;
  location: string;
  peakLoadMw: number;
  typicalLoadMw: number;
  currentSolarMw: number;
  currentTariff: string;
}

export interface IndustrialStrategy {
  id: string;
  name: string;
  capitalCost: number;
  paybackYears: number;
  irr: number;
  npv10yr: number;
  riskScore: number;
}

export interface TariffComparison {
  currentName: string;
  currentRate: number;
  alternativeName: string;
  alternativeRate: number;
  annualSavings: number;
}

export interface DemandResponseOpportunity {
  programName: string;
  paymentPerMw: number;
  mwAvailable: number;
}

export interface CarbonIntensitySnapshot {
  kgCo2PerMwh: number;
  gridMixDescription: string;
}

export const FACILITY_PROFILE: FacilityProfile = {
  name: 'Ohio Manufacturing Facility',
  location: 'Columbus, OH',
  peakLoadMw: 18.4,
  typicalLoadMw: 12.1,
  currentSolarMw: 2.5,
  currentTariff: 'AEP-Ohio GS-4 Industrial',
};

// Strategies ranked by 10-year NPV, descending.
export const STRATEGIES: IndustrialStrategy[] = [
  { id: 'st-bess',  name: 'Behind-the-meter battery storage',   capitalCost: 4_200_000, paybackYears: 5.8, irr: 0.181, npv10yr: 3_950_000, riskScore: 4 },
  { id: 'st-tar',   name: 'Switch to AEP GS-T Time-of-Use',      capitalCost:         0, paybackYears: 0.0, irr: 0.999, npv10yr: 2_100_000, riskScore: 2 },
  { id: 'st-solar', name: 'Expand on-site solar to 8 MW',        capitalCost: 7_800_000, paybackYears: 7.4, irr: 0.142, npv10yr: 1_840_000, riskScore: 5 },
  { id: 'st-dr',    name: 'Enroll in PJM Emergency DR',          capitalCost:   250_000, paybackYears: 1.2, irr: 0.622, npv10yr: 1_320_000, riskScore: 6 },
  { id: 'st-shift', name: 'Production load shifting to off-peak', capitalCost: 1_100_000, paybackYears: 4.1, irr: 0.198, npv10yr:   980_000, riskScore: 7 },
];

export const TARIFF_COMPARISON: TariffComparison = {
  currentName: 'AEP-Ohio GS-4 Industrial (flat)',
  currentRate: 54.80,
  alternativeName: 'AEP-Ohio GS-T Time-of-Use',
  alternativeRate: 51.48,
  annualSavings: 320_000,
};

export const DEMAND_RESPONSE_OPPS: DemandResponseOpportunity[] = [
  { programName: 'PJM Emergency Load Response',  paymentPerMw: 90_000, mwAvailable: 6.0 },
  { programName: 'PJM Economic DR (Real-Time)',  paymentPerMw: 47_500, mwAvailable: 6.0 },
  { programName: 'PJM Synchronized Reserves',    paymentPerMw: 27_000, mwAvailable: 6.0 },
];

export const CARBON_INTENSITY: CarbonIntensitySnapshot = {
  kgCo2PerMwh: 412,
  gridMixDescription: 'AEP zone real-time mix: Coal 34% / Gas 31% / Nuc 22% / Wind 9% / Solar 4%.',
};

export const MONTHLY_BILL_PROJECTION: number[] = [
  612_000, 568_000, 491_000, 442_000, 461_000, 538_000,
  638_000, 651_000, 528_000, 472_000, 491_000, 581_000,
];
