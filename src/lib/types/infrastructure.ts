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
