// FOUNDRY contract — US grid infrastructure types.
// Consumed by:
//   Wave 10 (ATLAS Atlas all-US frontend)
//   Wave 7  (CURSOR backend infra endpoints)
//   Wave 11 (CURSOR multi-ISO backend)
//   Wave 12 (FORGE ISO selector)
//   Wave 13 (FORGE advanced simulates)

export type IsoMarket =
  | 'PJM'        // PJM Interconnection (Eastern)
  | 'MISO'       // Midcontinent ISO (Eastern + Central)
  | 'NYISO'      // New York ISO (Eastern)
  | 'ISO-NE'     // ISO New England (Eastern)
  | 'CAISO'      // California ISO (Western)
  | 'SPP'        // Southwest Power Pool (Eastern + Central)
  | 'ERCOT'      // Texas (isolated grid)
  | 'WECC'       // Western Electricity Coordinating Council (non-CAISO West)
  | 'AK'         // Alaska Interconnection
  | 'QC'         // Quebec Interconnection (cross-border ties)
  | 'OTHER';     // Unmapped / non-organized markets

export type LodLevel = 'low' | 'mid' | 'high';
// low  → zoom ≤ 4 (continental view, simplified geometry, voltage ≥ 345 kV)
// mid  → zoom 5–7 (regional, partial simplification)
// high → zoom ≥ 8 (asset-level, native precision)

export type AssetStatus =
  | 'operating'
  | 'planned'
  | 'under-construction'
  | 'standby'
  | 'retired'
  | 'cancelled';

export type FuelType =
  | 'gas'        // Natural gas (combined cycle, combustion turbine, steam)
  | 'coal'       // All coal subtypes (bituminous, subbituminous, lignite)
  | 'nuclear'
  | 'wind'       // Onshore + offshore
  | 'solar'      // PV + thermal
  | 'hydro'      // Conventional hydro
  | 'pumped'     // Pumped hydro storage
  | 'biomass'    // Biomass + waste
  | 'geothermal'
  | 'oil'        // Petroleum
  | 'other';
// Note: battery storage is NOT a FuelType. Batteries live in BatteryAsset.

export interface GenerationUnit {
  id: string;                   // Stable id: `eia-{plantId}-{generatorId}`
  eiaPlantId: number | null;
  eiaGeneratorId: string | null;
  name: string;
  owner: string | null;
  iso: IsoMarket;
  state: string;                // Two-letter US state code
  lat: number;
  lon: number;
  fuel: FuelType;
  capacityMw: number;           // Nameplate
  status: AssetStatus;
  codDate: string | null;       // ISO YYYY-MM-DD
  retirementDate: string | null;
}

// LineString geometry as [lon, lat] pairs (Mapbox convention).
// Backend serves three precisions; the frontend selects via LodLevel.
export type LineStringGeometry = [number, number][];

export interface TransmissionSegment {
  id: string;
  voltageKv: number;            // Discrete values: 115, 138, 161, 230, 345, 500, 735, 765
  name: string | null;
  owner: string | null;
  iso: IsoMarket;               // Inferred via spatial join; may be 'OTHER'
  geometry: LineStringGeometry; // Pre-simplified to the LodLevel requested
  segmentLengthKm: number;
}
