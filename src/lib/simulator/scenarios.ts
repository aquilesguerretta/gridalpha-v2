// FORGE Wave 2 — Strategy generation.
// Given a facility profile, build the list of evaluable strategies. Each
// strategy carries its own components (kind + sizing) and capex total so
// runSimulation can dispatch them without reimplementing pricing.

import type {
  FacilityProfile,
  Strategy,
  StrategyComponent,
} from '@/lib/types/simulator';
import { TECH_COSTS, TARIFF_LIBRARY } from '@/lib/mock/simulator-mock';

// ─── Helpers ──────────────────────────────────────────────────────

function solarAddCost(capacityKW: number): number {
  return capacityKW * TECH_COSTS.solarPerKW;
}

function batteryCost(capacityKWh: number, powerKW: number): number {
  return (
    capacityKWh * TECH_COSTS.batteryPerKWh + powerKW * TECH_COSTS.batteryPerKW
  );
}

function dieselCost(capacityKW: number): number {
  return capacityKW * TECH_COSTS.dieselPerKW;
}

function totalCapex(components: StrategyComponent[]): number {
  return components.reduce((sum, c) => {
    switch (c.kind) {
      case 'solar-add':
        return sum + solarAddCost(c.capacityKW);
      case 'battery-add':
        return sum + batteryCost(c.capacityKWh, c.powerKW);
      case 'diesel-add':
        return sum + dieselCost(c.capacityKW);
      case 'demand-response':
        return sum + TECH_COSTS.drImplementationCost;
      case 'tariff-switch':
        return sum + TECH_COSTS.tariffSwitchCost;
    }
  }, 0);
}

/** Peak hourly load in MW across the year. */
function peakLoadMW(profile: FacilityProfile): number {
  let peak = 0;
  for (const month of profile.hourlyLoadProfile) {
    for (const v of month) {
      if (v > peak) peak = v;
    }
  }
  return peak;
}

/** Build a Strategy from components (id/name/description/components/capex). */
function build(
  id: string,
  name: string,
  description: string,
  components: StrategyComponent[],
): Strategy {
  return {
    id,
    name,
    description,
    components,
    capExUSD: totalCapex(components),
  };
}

// ─── Strategy generator ───────────────────────────────────────────

export function generateStrategies(profile: FacilityProfile): Strategy[] {
  const strategies: Strategy[] = [];
  const peakMW = peakLoadMW(profile);
  const peakKW = peakMW * 1000;
  const baseSolarKW = Math.max(profile.existingSolarKW, peakKW * 0.5);
  const budget = profile.capitalBudgetUSD;

  // 1. Baseline — no new investment
  strategies.push(
    build('baseline', 'Baseline', 'No new investment. Status quo.', []),
  );

  // 2. Solar +25% (only if facility already has some solar; else propose initial solar)
  const solar25Add = Math.round(baseSolarKW * 0.25);
  const solar25Components: StrategyComponent[] = [
    { kind: 'solar-add', capacityKW: solar25Add },
  ];
  const solar25Capex = totalCapex(solar25Components);
  if (solar25Capex <= budget && solar25Add > 0) {
    strategies.push(
      build(
        'solar-25',
        'Solar +25%',
        `Add ${solar25Add.toLocaleString()} kW DC of solar PV.`,
        solar25Components,
      ),
    );
  }

  // 3. Solar +50%
  const solar50Add = Math.round(baseSolarKW * 0.5);
  const solar50Components: StrategyComponent[] = [
    { kind: 'solar-add', capacityKW: solar50Add },
  ];
  const solar50Capex = totalCapex(solar50Components);
  if (solar50Capex <= budget && solar50Add > 0) {
    strategies.push(
      build(
        'solar-50',
        'Solar +50%',
        `Add ${solar50Add.toLocaleString()} kW DC of solar PV.`,
        solar50Components,
      ),
    );
  }

  // 4. Battery 2hr — sized to half of peak load × 2 hours
  const batt2hPower = Math.round(peakKW * 0.5);
  const batt2hCapacity = batt2hPower * 2;
  const batt2hComponents: StrategyComponent[] = [
    {
      kind: 'battery-add',
      capacityKWh: batt2hCapacity,
      powerKW: batt2hPower,
      rte: TECH_COSTS.batteryRTE,
    },
  ];
  if (totalCapex(batt2hComponents) <= budget) {
    strategies.push(
      build(
        'battery-2h',
        'Battery 2hr',
        `Add ${batt2hPower.toLocaleString()} kW / ${batt2hCapacity.toLocaleString()} kWh battery storage.`,
        batt2hComponents,
      ),
    );
  }

  // 5. Battery 4hr
  const batt4hPower = Math.round(peakKW * 0.5);
  const batt4hCapacity = batt4hPower * 4;
  const batt4hComponents: StrategyComponent[] = [
    {
      kind: 'battery-add',
      capacityKWh: batt4hCapacity,
      powerKW: batt4hPower,
      rte: TECH_COSTS.batteryRTE,
    },
  ];
  if (totalCapex(batt4hComponents) <= budget) {
    strategies.push(
      build(
        'battery-4h',
        'Battery 4hr',
        `Add ${batt4hPower.toLocaleString()} kW / ${batt4hCapacity.toLocaleString()} kWh battery storage.`,
        batt4hComponents,
      ),
    );
  }

  // 6. Battery 8hr
  const batt8hPower = Math.round(peakKW * 0.4);
  const batt8hCapacity = batt8hPower * 8;
  const batt8hComponents: StrategyComponent[] = [
    {
      kind: 'battery-add',
      capacityKWh: batt8hCapacity,
      powerKW: batt8hPower,
      rte: TECH_COSTS.batteryRTE,
    },
  ];
  if (totalCapex(batt8hComponents) <= budget) {
    strategies.push(
      build(
        'battery-8h',
        'Battery 8hr',
        `Add ${batt8hPower.toLocaleString()} kW / ${batt8hCapacity.toLocaleString()} kWh battery storage.`,
        batt8hComponents,
      ),
    );
  }

  // 7. Demand response
  strategies.push(
    build(
      'demand-response',
      'Demand Response',
      'Install controls to shed up to 15% of load at peak hours.',
      [{ kind: 'demand-response', targetReductionPct: 0.15 }],
    ),
  );

  // 8. Diesel backup (peak shaving + outage)
  const dieselKW = Math.round(peakKW * 0.6);
  const dieselComponents: StrategyComponent[] = [
    {
      kind: 'diesel-add',
      capacityKW: dieselKW,
      fuelCostPerGallon: TECH_COSTS.dieselFuelPerGallon,
    },
  ];
  if (totalCapex(dieselComponents) <= budget) {
    strategies.push(
      build(
        'diesel',
        'Diesel Backup',
        `Add ${dieselKW.toLocaleString()} kW diesel generator for outage coverage.`,
        dieselComponents,
      ),
    );
  }

  // 9. Solar +25% + Battery 4hr combo
  const combo1Components: StrategyComponent[] = [
    ...solar25Components,
    ...batt4hComponents,
  ];
  if (totalCapex(combo1Components) <= budget && solar25Add > 0) {
    strategies.push(
      build(
        'solar-25-battery-4h',
        'Solar +25% + Battery 4hr',
        'Layer additional solar with 4-hour storage for self-consumption + arbitrage.',
        combo1Components,
      ),
    );
  }

  // 10. Solar +50% + Battery 4hr + DR combo
  const combo2Components: StrategyComponent[] = [
    ...solar50Components,
    ...batt4hComponents,
    { kind: 'demand-response', targetReductionPct: 0.15 },
  ];
  if (totalCapex(combo2Components) <= budget && solar50Add > 0) {
    strategies.push(
      build(
        'solar-50-battery-4h-dr',
        'Solar +50% + Battery 4hr + DR',
        'Aggressive solar + storage with demand response on peak hours.',
        combo2Components,
      ),
    );
  }

  // 11. Full hybrid microgrid
  const microgridComponents: StrategyComponent[] = [
    ...solar50Components,
    ...batt4hComponents,
    {
      kind: 'diesel-add',
      capacityKW: Math.round(peakKW * 0.4),
      fuelCostPerGallon: TECH_COSTS.dieselFuelPerGallon,
    },
    { kind: 'demand-response', targetReductionPct: 0.15 },
    { kind: 'tariff-switch', newTariff: TARIFF_LIBRARY.tou_industrial },
  ];
  if (totalCapex(microgridComponents) <= budget && solar50Add > 0) {
    strategies.push(
      build(
        'microgrid',
        'Full Hybrid Microgrid',
        'Solar + 4-hour battery + diesel + demand response + TOU tariff.',
        microgridComponents,
      ),
    );
  }

  return strategies;
}
