import { View, Text } from '@react-pdf/renderer';
import { BasePDFTemplate } from './BasePDFTemplate';
import { PDFEyebrow } from './components/PDFEyebrow';
import { PDFHeading } from './components/PDFHeading';
import { PDFBody, PDFBulletList } from './components/PDFBody';
import { PDFTable } from './components/PDFTable';
import type { PDFTableColumn } from './components/PDFTable';
import { PDFMetricCallout } from './components/PDFMetricCallout';
import { PDFChartImage } from './components/PDFChartImage';
import type { PDFDocumentMeta } from './types';
import type {
  AssetResult,
  Fleet,
  FleetResult,
} from '@/lib/types/storage';

// FORGE Wave 3 — Storage DA Bid Optimizer "Bid Pack" template.
//
// Hero (operator + fleet revenue) → executive summary → per-asset bid
// schedule table → per-asset SOC chart (if rasterized image supplied) →
// revenue attribution breakdown → sensitivity strip → methodology +
// disclaimer. Mirrors StrategyMemoTemplate's structure so the visual
// language matches across exporters.

interface ChartImagesByAsset {
  /** Map asset.id → SOC trajectory rasterized PNG data URL. */
  socByAssetId?: Record<string, string>;
}

interface Props {
  fleet: Fleet;
  result: FleetResult;
  meta: PDFDocumentMeta;
  chartImages?: ChartImagesByAsset;
}

function formatUSD(v: number): string {
  const sign = v < 0 ? '−' : '';
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}k`;
  return `${sign}$${abs.toFixed(0)}`;
}

export function StorageBidPackTemplate({
  fleet,
  result,
  meta,
  chartImages,
}: Props) {
  const baseRevenue = result.scenarios.base.fleetTotalRevenueUSD;
  const volRevenue = result.scenarios.volatilityUp.fleetTotalRevenueUSD;
  const missRevenue = result.scenarios.forecastMiss.fleetTotalRevenueUSD;
  const top = result.perAssetRanking[0];

  return (
    <BasePDFTemplate meta={meta}>
      {/* ── Hero ───────────────────────────────────────────────── */}
      <HeroSection fleet={fleet} result={result} />

      {/* ── Executive summary ──────────────────────────────────── */}
      <ExecutiveSummarySection
        fleet={fleet}
        result={result}
        topAssetName={top?.asset.name ?? '—'}
      />

      {/* ── Per-asset bid schedule ─────────────────────────────── */}
      {result.perAssetRanking.map((r) => (
        <AssetSection
          key={r.asset.id}
          assetResult={r}
          chartImage={chartImages?.socByAssetId?.[r.asset.id]}
        />
      ))}

      {/* ── Sensitivity strip ──────────────────────────────────── */}
      <SensitivitySection
        baseRevenue={baseRevenue}
        volRevenue={volRevenue}
        missRevenue={missRevenue}
      />

      {/* ── Methodology ────────────────────────────────────────── */}
      <MethodologySection />

      {/* ── Disclaimer ─────────────────────────────────────────── */}
      <DisclaimerSection />
    </BasePDFTemplate>
  );
}

// ─── Hero ──────────────────────────────────────────────────────────

function HeroSection({ fleet, result }: { fleet: Fleet; result: FleetResult }) {
  const totalPowerMW =
    fleet.assets.reduce((s, a) => s + a.powerKW, 0) / 1000;
  const totalEnergyMWh =
    fleet.assets.reduce((s, a) => s + a.capacityKWh, 0) / 1000;
  const baseRevenue = result.scenarios.base.fleetTotalRevenueUSD;

  return (
    <View>
      <PDFEyebrow variant="hero">DA BID PACK · TOMORROW</PDFEyebrow>
      <PDFHeading level={1}>{fleet.operatorName}</PDFHeading>
      <PDFHeading level={3} subtitle>
        {fleet.assets.length}{' '}
        {fleet.assets.length === 1 ? 'asset' : 'assets'} · {totalPowerMW.toFixed(0)} MW · {totalEnergyMWh.toFixed(0)} MWh
      </PDFHeading>

      <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
        <PDFMetricCallout
          label="PROJECTED REVENUE (BASE)"
          value={formatUSD(baseRevenue)}
          tone={baseRevenue > 0 ? 'positive' : 'neutral'}
        />
        <PDFMetricCallout
          label="FLEET CYCLES (DAY)"
          value={result.fleetTotalCycles.toFixed(2)}
          tone="neutral"
        />
        <PDFMetricCallout
          label="VS PERFECT FORESIGHT"
          value={`${(result.performanceVsOptimal * 100).toFixed(0)}%`}
          tone={
            result.performanceVsOptimal >= 0.85
              ? 'positive'
              : result.performanceVsOptimal >= 0.65
                ? 'neutral'
                : 'negative'
          }
        />
      </View>
    </View>
  );
}

// ─── Executive summary ────────────────────────────────────────────

function ExecutiveSummarySection({
  fleet,
  result,
  topAssetName,
}: {
  fleet: Fleet;
  result: FleetResult;
  topAssetName: string;
}) {
  const baseRevenue = result.scenarios.base.fleetTotalRevenueUSD;
  const ancillaryShare =
    result.perAssetRanking.reduce(
      (s, r) => s + r.attribution.ancillaryUSD,
      0,
    ) / Math.max(1, baseRevenue);

  return (
    <View style={{ marginTop: 16 }}>
      <PDFEyebrow>EXECUTIVE SUMMARY</PDFEyebrow>
      <PDFBody>
        Tomorrow's heuristic bid plan for the {fleet.operatorName} fleet
        projects {formatUSD(baseRevenue)} in net revenue under the base
        scenario (current PJM DA forecast). The top-revenue asset is{' '}
        {topAssetName}.
      </PDFBody>
      <PDFBulletList
        items={[
          `Fleet capacity: ${fleet.assets.length} ${fleet.assets.length === 1 ? 'asset' : 'assets'} across ${new Set(fleet.assets.map((a) => a.zone)).size} zones.`,
          `Ancillary revenue share: ${(ancillaryShare * 100).toFixed(0)}% of net.`,
          `Cycles consumed today: ${result.fleetTotalCycles.toFixed(2)} across the fleet.`,
          `Heuristic captures ${(result.performanceVsOptimal * 100).toFixed(0)}% of the theoretical perfect-foresight optimum spread × power × duration.`,
        ]}
      />
    </View>
  );
}

// ─── Per-asset section ────────────────────────────────────────────

function AssetSection({
  assetResult,
  chartImage,
}: {
  assetResult: AssetResult;
  chartImage?: string;
}) {
  const { asset, bidCurve, attribution } = assetResult;

  const columns: PDFTableColumn[] = [
    { label: 'HR', flex: 0.5, align: 'right' },
    { label: 'ACTION', flex: 1, align: 'left' },
    { label: 'MW', flex: 1, align: 'right' },
    { label: 'LMP $/MWh', flex: 1, align: 'right' },
    { label: 'EXPECTED $', flex: 1.2, align: 'right' },
  ];

  const rows: (string | number)[][] = bidCurve.map((b) => [
    String(b.hour).padStart(2, '0'),
    b.action.toUpperCase(),
    b.mwBid.toFixed(2),
    `$${b.lmp.toFixed(2)}`,
    formatUSD(b.expectedRevenueUSD),
  ]);

  return (
    <View break style={{ marginTop: 18 }}>
      <PDFEyebrow>ASSET · {asset.zone}</PDFEyebrow>
      <PDFHeading level={2}>{asset.name}</PDFHeading>
      <PDFHeading level={3} subtitle>
        {(asset.powerKW / 1000).toFixed(0)} MW · {asset.durationHours} hr ·{' '}
        RTE {(asset.rte * 100).toFixed(0)}%
        {asset.ancillaryEnabled && asset.ancillaryService
          ? ` · ${asset.ancillaryService.toUpperCase()}`
          : ''}
      </PDFHeading>

      {/* Headline metrics */}
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
        <PDFMetricCallout
          label="NET (DAY)"
          value={formatUSD(attribution.netUSD)}
          tone={
            attribution.netUSD > 0
              ? 'positive'
              : attribution.netUSD < 0
                ? 'negative'
                : 'neutral'
          }
        />
        <PDFMetricCallout
          label="ENERGY"
          value={formatUSD(attribution.energyUSD)}
          tone="positive"
        />
        <PDFMetricCallout
          label="ANCILLARY"
          value={formatUSD(attribution.ancillaryUSD)}
          tone="neutral"
        />
        <PDFMetricCallout
          label="DEGRADATION"
          value={formatUSD(-attribution.degradationCostUSD)}
          tone="negative"
        />
      </View>

      {/* SOC chart image (if supplied) */}
      <View style={{ marginTop: 12 }}>
        <PDFChartImage
          src={chartImage}
          caption={`SOC trajectory · ${asset.name}`}
          height={140}
        />
      </View>

      {/* Bid schedule table */}
      <View style={{ marginTop: 12 }}>
        <PDFEyebrow>HOURLY BID SCHEDULE</PDFEyebrow>
        <PDFTable columns={columns} rows={rows} />
      </View>

      {assetResult.constraintViolations.length > 0 && (
        <View style={{ marginTop: 8 }}>
          <PDFEyebrow>CONSTRAINTS</PDFEyebrow>
          <PDFBulletList items={assetResult.constraintViolations} />
        </View>
      )}
    </View>
  );
}

// ─── Sensitivity strip ───────────────────────────────────────────

function SensitivitySection({
  baseRevenue,
  volRevenue,
  missRevenue,
}: {
  baseRevenue: number;
  volRevenue: number;
  missRevenue: number;
}) {
  return (
    <View break style={{ marginTop: 18 }}>
      <PDFEyebrow>SENSITIVITY · FLEET REVENUE BY SCENARIO</PDFEyebrow>
      <PDFBody>
        Three scenarios are simulated to bracket the forecast risk: the
        base case uses the published DA forecast, volatility-up applies a
        1.5× spread amplification (peaks +50%, troughs −25%), and
        forecast-miss rotates the curve forward by three hours to
        approximate a peak that arrives earlier than expected.
      </PDFBody>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
        <PDFMetricCallout
          label="BASE"
          value={formatUSD(baseRevenue)}
          tone="neutral"
        />
        <PDFMetricCallout
          label="VOLATILITY UP"
          value={formatUSD(volRevenue)}
          tone={volRevenue > baseRevenue ? 'positive' : 'neutral'}
        />
        <PDFMetricCallout
          label="FORECAST MISS"
          value={formatUSD(missRevenue)}
          tone={missRevenue < baseRevenue ? 'negative' : 'neutral'}
        />
      </View>
    </View>
  );
}

// ─── Methodology ─────────────────────────────────────────────────

function MethodologySection() {
  return (
    <View style={{ marginTop: 18 }}>
      <PDFEyebrow>METHODOLOGY</PDFEyebrow>
      <PDFBulletList
        items={[
          'Heuristic optimizer: per asset, charge in the N lowest-LMP hours and discharge in the N highest-LMP hours, where N = duration_hours.',
          'SOC validation: the plan is simulated forward through 24 hours and rebalanced (drop the weakest discharge hour) until the trajectory respects [socMin, socMax].',
          'Ancillary stacking: idle hours are reserved for the asset\'s enabled ancillary service, earning capacity revenue at the hourly MCP plus a deterministic mileage payment based on V1 utilization assumptions.',
          'Degradation: linear $/MWh-throughput model. Future revisions will integrate over the SOC trajectory with a depth-of-discharge curve.',
          'Performance-vs-optimal: theoretical perfect-foresight optimum is sum over assets of (high-half avg LMP − low-half avg LMP / RTE) × power × duration.',
        ]}
      />
    </View>
  );
}

// ─── Disclaimer ──────────────────────────────────────────────────

function DisclaimerSection() {
  return (
    <View style={{ marginTop: 18 }}>
      <PDFEyebrow>DISCLAIMER</PDFEyebrow>
      <PDFBody>
        This bid pack is a decision-support artifact, not an auto-bid
        execution. Review every hourly slot, validate against your own
        portfolio constraints, and submit to PJM through your existing
        bid-submission workflow. GridAlpha is not a registered Market
        Participant and accepts no responsibility for cleared positions.
      </PDFBody>
      <PDFBody>
        Forecast uncertainty: V1 uses a heuristic optimizer trained on the
        published DA forecast. Real outcomes vary with intra-day load,
        outages, and ancillary clearing dynamics. The sensitivity strip
        above brackets the most likely outcomes; the realized revenue can
        fall outside the bracket on tail-risk days.
      </PDFBody>
    </View>
  );
}

// Mark the component as having React PDF's <Document> root via BasePDFTemplate.
// react-pdf uses the `Text`/`View`/`Page` render tree; we re-export the
// `Text` import to silence the linter when the template renders only
// `<View>` containers in some sections. (Touch-only — never actually
// renders.)
export const __TEMPLATE_REFERENCE__ = Text;
