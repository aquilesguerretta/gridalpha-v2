// CONDUIT Wave 3 — live data point query service.
//
// Map a small set of canonical PJM terms ("LMP", "spark spread",
// "battery", "reserve margin", "congestion") to the current value
// for the user's selected zone. The selected zone comes from the
// query's contextSnapshot; when no zone is set, we default to
// WEST_HUB and tag the result with `zoneSource: 'default'` so the
// drawer can render the caveat.
//
// Result category: `live-data-point`. No href — clicking is a no-op
// (or could be wired to drill into the relevant KPI page later).

import {
  ZONE_LMP,
  ZONE_SPARK,
  ZONE_BATTERY,
  ZONE_RESERVE,
} from '@/lib/pjm/mock-data';
import type { CmdPQuery, CmdPResult } from '@/lib/types/cmdp';

const DEFAULT_ZONE = 'WEST_HUB';

/** Term aliases → canonical metric name. Lowercased for matching. */
const TERM_ALIASES: Record<string, MetricKind> = {
  'lmp': 'lmp',
  'locational marginal price': 'lmp',
  'price': 'lmp',
  'spark spread': 'spark',
  'spark': 'spark',
  'gas margin': 'spark',
  'battery arb': 'battery',
  'battery arbitrage': 'battery',
  'battery revenue': 'battery',
  'storage revenue': 'battery',
  'soc': 'battery',
  'reserve margin': 'reserve',
  'reserve': 'reserve',
  'capacity factor': 'reserve',
  'congestion': 'lmp', // surfaces LMP for the selected zone
};

type MetricKind = 'lmp' | 'spark' | 'battery' | 'reserve';

export async function dataPointQuery(query: CmdPQuery): Promise<CmdPResult[]> {
  const text = query.rawText.trim().toLowerCase();
  if (!text) return [];

  // Find the longest alias that appears in the selection text.
  const aliases = Object.keys(TERM_ALIASES).sort((a, b) => b.length - a.length);
  const matched = aliases.find((a) => text.includes(a));
  if (!matched) return [];

  const kind = TERM_ALIASES[matched];

  const zoneFromContext =
    query.contextSnapshot.surface.selectedZone ||
    query.contextSnapshot.user.selectedZone;
  const zoneSource: 'context' | 'default' = zoneFromContext ? 'context' : 'default';
  const zone = zoneFromContext ?? DEFAULT_ZONE;

  const result = buildResult(kind, zone, matched, zoneSource);
  return result ? [result] : [];
}

function buildResult(
  kind: MetricKind,
  zone: string,
  matchedTerm: string,
  zoneSource: 'context' | 'default',
): CmdPResult | null {
  switch (kind) {
    case 'lmp': {
      const v = ZONE_LMP[zone] ?? ZONE_LMP[DEFAULT_ZONE];
      if (!v) return null;
      const sign = v.delta >= 0 ? '+' : '';
      return {
        category: 'live-data-point',
        id: `data:lmp:${zone}`,
        title: `$${v.price.toFixed(2)}/MWh`,
        excerpt: `Real-time LMP for ${zone} · ${sign}${v.delta.toFixed(2)} vs −1H`,
        relevance: 0.7,
        metadata: {
          zone,
          zoneSource,
          metricKind: 'lmp',
          term: matchedTerm,
          unit: '$/MWh',
        },
      };
    }
    case 'spark': {
      const v = ZONE_SPARK[zone] ?? ZONE_SPARK[DEFAULT_ZONE];
      if (v == null) return null;
      return {
        category: 'live-data-point',
        id: `data:spark:${zone}`,
        title: `+$${v.toFixed(2)}/MWh`,
        excerpt: `Spark spread (gas-fired plant net margin) for ${zone}`,
        relevance: 0.7,
        metadata: {
          zone,
          zoneSource,
          metricKind: 'spark',
          term: matchedTerm,
          unit: '$/MWh',
        },
      };
    }
    case 'battery': {
      const v = ZONE_BATTERY[zone] ?? ZONE_BATTERY[DEFAULT_ZONE];
      if (!v) return null;
      return {
        category: 'live-data-point',
        id: `data:battery:${zone}`,
        title: `$${v.revenue.toLocaleString()}`,
        excerpt: `Daily battery arbitrage revenue for ${zone} · SOC ${v.soc}% · charge ${v.charge}, discharge ${v.discharge}`,
        relevance: 0.65,
        metadata: {
          zone,
          zoneSource,
          metricKind: 'battery',
          term: matchedTerm,
          unit: 'USD',
        },
      };
    }
    case 'reserve': {
      const v = ZONE_RESERVE[zone] ?? ZONE_RESERVE[DEFAULT_ZONE];
      if (v == null) return null;
      return {
        category: 'live-data-point',
        id: `data:reserve:${zone}`,
        title: `${v.toFixed(1)}%`,
        excerpt: `Operating reserve margin for ${zone}`,
        relevance: 0.65,
        metadata: {
          zone,
          zoneSource,
          metricKind: 'reserve',
          term: matchedTerm,
          unit: '%',
        },
      };
    }
  }
}
