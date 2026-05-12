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
  FacilityProfile,
  StrategyResult,
  ScenarioName,
} from '@/lib/types/simulator';

// CONDUIT-2 — Industrial Strategy Simulator memo template.
// Hero → executive summary → strategy ranking table → top-strategy
// detail → sensitivity chart → hourly dispatch chart → carbon →
// methodology → disclaimer.
//
// Charts (sensitivity, dispatch) accept pre-rasterized PNG data URLs
// via `chartImages`. When omitted, the template renders text-only
// substitutes so the memo always works without DOM/chart access.

interface ChartImages {
  /** Sensitivity chart (NPV under base/optimistic/pessimistic). */
  sensitivity?: string;
  /** Hourly dispatch chart (representative day). */
  dispatch?: string;
}

interface Props {
  facilityProfile: FacilityProfile;
  results: StrategyResult[];
  scenarioForCharts?: ScenarioName;
  chartImages?: ChartImages;
  meta: PDFDocumentMeta;
}

export function StrategyMemoTemplate({
  facilityProfile,
  results,
  scenarioForCharts = 'base',
  chartImages,
  meta,
}: Props) {
  // Defensive ordering: caller is expected to pass results pre-sorted by
  // base-case NPV descending, but template enforces the same order so
  // hero/ranking are consistent.
  const ranked = [...results].sort(
    (a, b) => b.scenarios.base.npvUSD - a.scenarios.base.npvUSD,
  );
  const top = ranked[0];

  return (
    <BasePDFTemplate meta={meta}>
      {/* ── Hero ───────────────────────────────────────────────── */}
      <HeroSection facilityProfile={facilityProfile} top={top} />

      {/* ── Executive summary ──────────────────────────────────── */}
      <ExecutiveSummarySection
        facilityProfile={facilityProfile}
        ranked={ranked}
      />

      {/* ── Strategy ranking ───────────────────────────────────── */}
      <StrategyRankingSection ranked={ranked} />

      {/* ── Top-strategy detail ────────────────────────────────── */}
      <TopStrategyDetailSection top={top} />

      {/* ── Sensitivity ────────────────────────────────────────── */}
      <SensitivitySection top={top} chartImage={chartImages?.sensitivity} />

      {/* ── Hourly dispatch ────────────────────────────────────── */}
      <HourlyDispatchSection
        top={top}
        scenarioForCharts={scenarioForCharts}
        chartImage={chartImages?.dispatch}
      />

      {/* ── Carbon reduction ───────────────────────────────────── */}
      <CarbonSection top={top} />

      {/* ── Methodology ────────────────────────────────────────── */}
      <MethodologySection facilityProfile={facilityProfile} />

      {/* ── Disclaimer ─────────────────────────────────────────── */}
      <DisclaimerSection />
    </BasePDFTemplate>
  );
}

// ─── Hero ────────────────────────────────────────────────────────────

function HeroSection({
  facilityProfile,
  top,
}: {
  facilityProfile: FacilityProfile;
  top: StrategyResult;
}) {
  const npv = top.scenarios.base.npvUSD;
  const tone =
    npv > 0 ? 'positive' : npv < 0 ? 'negative' : 'neutral';
  return (
    <View style={{ marginBottom: 32 }}>
      <PDFEyebrow variant="hero">
        STRATEGY MEMO {'·'} {facilityProfile.zone}
      </PDFEyebrow>
      <PDFHeading level={1}>{facilityProfile.name}</PDFHeading>
      <PDFHeading subtitle>
        Recommended strategy: {top.strategy.name}.
      </PDFHeading>
      <PDFMetricCallout
        label="10-YEAR NPV (BASE CASE)"
        value={formatUSDShort(npv)}
        unit={`Capex ${formatUSDShort(top.strategy.capExUSD)} · Payback ${formatPaybackYears(top.paybackYears)}`}
        tone={tone}
      />
    </View>
  );
}

// ─── Executive summary ──────────────────────────────────────────────

function ExecutiveSummarySection({
  facilityProfile,
  ranked,
}: {
  facilityProfile: FacilityProfile;
  ranked: StrategyResult[];
}) {
  const top = ranked[0];
  const totalEvaluated = ranked.length;
  const positiveCount = ranked.filter(
    (r) => r.scenarios.base.npvUSD > 0,
  ).length;
  const carbonTons = Math.max(0, Math.round(top.carbonReductionTons10Yr));

  return (
    <View style={{ marginBottom: 28 }}>
      <PDFEyebrow>EXECUTIVE SUMMARY</PDFEyebrow>
      <PDFHeading level={2}>The optimal energy strategy.</PDFHeading>
      <PDFBulletList
        items={[
          `${top.strategy.name} produces a ${formatUSDShort(top.scenarios.base.npvUSD)} 10-year NPV under the base case at a ${(facilityProfile.discountRate * 100).toFixed(0)}% discount rate, with a ${formatPaybackYears(top.paybackYears)} payback and ${top.riskRanking} risk profile.`,
          `${positiveCount} of ${totalEvaluated} strategies generate positive 10-year NPV. The remaining ${totalEvaluated - positiveCount} are excluded from the recommendation set as they would erode capital under base assumptions.`,
          carbonTons > 0
            ? `Recommended strategy avoids approximately ${carbonTons.toLocaleString()} t CO₂ over 10 years versus the do-nothing baseline.`
            : 'Recommended strategy holds carbon impact roughly flat versus the do-nothing baseline.',
        ]}
      />
    </View>
  );
}

// ─── Strategy ranking table ─────────────────────────────────────────

function StrategyRankingSection({ ranked }: { ranked: StrategyResult[] }) {
  const columns: PDFTableColumn[] = [
    { label: 'Rank', flex: 0.5, align: 'right' },
    { label: 'Strategy', flex: 3, align: 'left' },
    { label: '10-Yr NPV', flex: 1.4, align: 'right' },
    { label: 'Capex', flex: 1.2, align: 'right' },
    { label: 'Payback', flex: 1, align: 'right' },
    { label: 'Risk', flex: 0.9, align: 'right' },
  ];
  const rows: (string | number)[][] = ranked.slice(0, 5).map((r, i) => [
    i + 1,
    r.strategy.name,
    formatUSDShort(r.scenarios.base.npvUSD),
    formatUSDShort(r.strategy.capExUSD),
    formatPaybackYears(r.paybackYears),
    r.riskRanking.toUpperCase(),
  ]);
  return (
    <View break style={{ marginBottom: 28 }}>
      <PDFEyebrow>STRATEGY RANKING</PDFEyebrow>
      <PDFHeading level={2}>All evaluated strategies.</PDFHeading>
      <PDFTable columns={columns} rows={rows} />
      {ranked.length > 5 && (
        <PDFBody variant="small">
          {ranked.length - 5} additional {ranked.length - 5 === 1 ? 'strategy was' : 'strategies were'} evaluated and ranked below the top five.
        </PDFBody>
      )}
    </View>
  );
}

// ─── Top-strategy detail ────────────────────────────────────────────

function TopStrategyDetailSection({ top }: { top: StrategyResult }) {
  return (
    <View style={{ marginBottom: 28 }}>
      <PDFEyebrow>TOP STRATEGY · DETAIL</PDFEyebrow>
      <PDFHeading level={2}>{top.strategy.name}</PDFHeading>
      <PDFBody>{top.strategy.description}</PDFBody>
      <PDFTable
        columns={[
          { label: 'Component', flex: 2.4, align: 'left' },
          { label: 'Specification', flex: 2, align: 'left' },
        ]}
        rows={top.strategy.components.map((c) => [
          componentLabel(c),
          componentSpec(c),
        ])}
      />
    </View>
  );
}

function componentLabel(c: StrategyResult['strategy']['components'][number]): string {
  switch (c.kind) {
    case 'solar-add': return 'Solar PV addition';
    case 'battery-add': return 'Battery storage addition';
    case 'diesel-add': return 'Diesel generator';
    case 'demand-response': return 'Demand response';
    case 'tariff-switch': return 'Tariff switch';
  }
}

function componentSpec(c: StrategyResult['strategy']['components'][number]): string {
  switch (c.kind) {
    case 'solar-add':
      return `${c.capacityKW.toLocaleString()} kW DC`;
    case 'battery-add':
      return `${c.capacityKWh.toLocaleString()} kWh / ${c.powerKW.toLocaleString()} kW · ${(c.rte * 100).toFixed(0)}% RTE`;
    case 'diesel-add':
      return `${c.capacityKW.toLocaleString()} kW · $${c.fuelCostPerGallon.toFixed(2)}/gal`;
    case 'demand-response':
      return `${(c.targetReductionPct * 100).toFixed(0)}% peak reduction`;
    case 'tariff-switch':
      return `Switch to ${c.newTariff.type} at $${c.newTariff.energyRate.toFixed(2)}/MWh`;
  }
}

// ─── Sensitivity ────────────────────────────────────────────────────

function SensitivitySection({
  top,
  chartImage,
}: {
  top: StrategyResult;
  chartImage?: string;
}) {
  const columns: PDFTableColumn[] = [
    { label: 'Scenario', flex: 1.6, align: 'left' },
    { label: '10-Yr NPV', flex: 1.4, align: 'right' },
    { label: 'Total Savings', flex: 1.6, align: 'right' },
    { label: 'Capex', flex: 1.2, align: 'right' },
  ];
  const rows: (string | number)[][] = (
    ['optimistic', 'base', 'pessimistic'] as ScenarioName[]
  ).map((s) => [
    s.toUpperCase(),
    formatUSDShort(top.scenarios[s].npvUSD),
    formatUSDShort(top.scenarios[s].totalSavings10YrUSD),
    formatUSDShort(top.scenarios[s].capExUSD),
  ]);
  return (
    <View style={{ marginBottom: 28 }}>
      <PDFEyebrow>SENSITIVITY · TOP STRATEGY</PDFEyebrow>
      <PDFHeading level={2}>NPV under three scenarios.</PDFHeading>
      <PDFChartImage
        src={chartImage}
        height={200}
        caption="Top strategy NPV — base / optimistic / pessimistic"
      />
      <PDFTable columns={columns} rows={rows} />
    </View>
  );
}

// ─── Hourly dispatch ────────────────────────────────────────────────

function HourlyDispatchSection({
  top,
  scenarioForCharts,
  chartImage,
}: {
  top: StrategyResult;
  scenarioForCharts: ScenarioName;
  chartImage?: string;
}) {
  // Sample three representative hours: a low-demand pre-dawn hour, a
  // peak afternoon hour, and an evening shoulder. The full 24-hour
  // dispatch is in the source data; the table is a digest, not a
  // replacement for the chart.
  const hours = top.hourlyDispatch;
  const samples = hours.length === 24
    ? [hours[3], hours[14], hours[19]]
    : hours.slice(0, Math.min(3, hours.length));
  const columns: PDFTableColumn[] = [
    { label: 'Hour', flex: 0.6, align: 'right' },
    { label: 'Load (MW)', flex: 1.1, align: 'right' },
    { label: 'Solar', flex: 1, align: 'right' },
    { label: 'Battery', flex: 1.1, align: 'right' },
    { label: 'Grid', flex: 1, align: 'right' },
    { label: 'Diesel', flex: 1, align: 'right' },
  ];
  const rows: (string | number)[][] = samples.map((h) => [
    `${String(h.hour).padStart(2, '0')}:00`,
    h.loadMW.toFixed(1),
    h.solarMW.toFixed(1),
    h.batteryDispatchMW.toFixed(1),
    h.gridDispatchMW.toFixed(1),
    h.dieselDispatchMW.toFixed(1),
  ]);
  return (
    <View break style={{ marginBottom: 28 }}>
      <PDFEyebrow>HOURLY DISPATCH · REPRESENTATIVE DAY</PDFEyebrow>
      <PDFHeading level={2}>How the day is served.</PDFHeading>
      <PDFChartImage
        src={chartImage}
        height={220}
        caption={`24-hour stacked dispatch · ${scenarioForCharts.toUpperCase()} scenario`}
      />
      <PDFBody variant="small">
        Sample hours from the {hours.length}-hour dispatch:
      </PDFBody>
      <PDFTable columns={columns} rows={rows} />
    </View>
  );
}

// ─── Carbon ─────────────────────────────────────────────────────────

function CarbonSection({ top }: { top: StrategyResult }) {
  const tons = top.carbonReductionTons10Yr;
  const tone: 'positive' | 'negative' | 'neutral' =
    tons > 0 ? 'positive' : tons < 0 ? 'negative' : 'neutral';
  const annual = tons / 10;
  const carYears = Math.round(Math.abs(annual) / 4.6);
  return (
    <View style={{ marginBottom: 28 }}>
      <PDFEyebrow>CARBON REDUCTION</PDFEyebrow>
      <PDFHeading level={2}>10-year impact vs baseline.</PDFHeading>
      <PDFMetricCallout
        label={tons >= 0 ? 'TONS CO₂ AVOIDED · 10-YR' : 'TONS CO₂ ADDED · 10-YR'}
        value={formatTons(Math.abs(tons))}
        unit={
          tons >= 0
            ? `≈ ${carYears.toLocaleString()} car-years off the road per year`
            : `≈ ${carYears.toLocaleString()} additional car-years per year`
        }
        tone={tone}
      />
    </View>
  );
}

// ─── Methodology ────────────────────────────────────────────────────

function MethodologySection({
  facilityProfile,
}: {
  facilityProfile: FacilityProfile;
}) {
  const dr = (facilityProfile.discountRate * 100).toFixed(0);
  return (
    <View style={{ marginBottom: 24 }}>
      <PDFEyebrow>METHODOLOGY</PDFEyebrow>
      <PDFHeading level={2}>How this analysis was generated.</PDFHeading>
      <PDFBody>
        This memo is generated by the GridAlpha Strategy Simulator using a deterministic NPV model with sensitivity analysis across three scenarios (base, optimistic, pessimistic). For each strategy combination, the simulator runs a representative-day dispatch (24 hours, scaled to a year via load profile), projects annual cash flows over 10 years at a {dr}% discount rate, and ranks strategies by base-case NPV. Hourly dispatch uses a heuristic merit order (solar → battery → grid → diesel) that approximates but does not solve the full optimal control problem. Carbon reductions are computed against the do-nothing baseline using zone-specific PJM carbon intensities and a fixed diesel intensity assumption.
      </PDFBody>
    </View>
  );
}

// ─── Disclaimer ─────────────────────────────────────────────────────

function DisclaimerSection() {
  return (
    <View style={{ marginTop: 12 }}>
      <Text
        style={{
          fontFamily: 'Helvetica-Oblique',
          fontSize: 9,
          color: '#71717A',
          lineHeight: 1.45,
        }}
      >
        This memo is generated by GridAlpha for informational purposes. It is not financial, engineering, or regulatory advice. Real-world implementation requires validation by qualified advisors. Technology costs, grid prices, and regulatory environments change; results assume conditions current at the generation date shown in the page header.
      </Text>
    </View>
  );
}

// ─── Formatters ─────────────────────────────────────────────────────

function formatUSDShort(v: number): string {
  const sign = v < 0 ? '-' : '';
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}k`;
  return `${sign}$${abs.toFixed(0)}`;
}

function formatPaybackYears(years: number | null): string {
  if (years == null || !isFinite(years)) return 'never';
  if (years < 1) return `${(years * 12).toFixed(0)} mo`;
  return `${years.toFixed(1)} yr`;
}

function formatTons(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M t`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}k t`;
  return `${v.toFixed(0)} t`;
}
