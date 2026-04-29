import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { C, F, R, S } from '@/design/tokens';
import { ContainedCard } from '@/components/terminal/ContainedCard';
import { EditorialIdentity } from '@/components/terminal/EditorialIdentity';
import { FlowSection } from '@/components/terminal/FlowSection';
import { HeroNumber } from '@/components/terminal/HeroNumber';
import { PageAtmosphere } from '@/components/terminal/PageAtmosphere';
import { AnnotatableChart } from '@/components/shared/AnnotatableChart';
import {
  FACILITY_PROFILE,
  TARIFF_COMPARISON,
  DEMAND_RESPONSE_OPPS,
  CARBON_INTENSITY,
  MONTHLY_BILL_PROJECTION,
} from '@/lib/mock/industrial-mock';
import { SimulatorView } from './StrategySimulator/SimulatorView';

type IndustrialTab = 'overview' | 'simulator';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const CURRENT_MONTH_IDX = 3; // April highlighted

// ─── HERO BLOCK ───────────────────────────────────────────────────
function IndustrialHeroBlock() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: S.lg }}>
      <div style={{
        fontFamily: F.mono,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: C.electricBlue,
      }}>
        TODAY'S ENERGY COST · OHIO FACILITY
      </div>
      <EditorialIdentity size="hero">What today is costing.</EditorialIdentity>

      <div style={{ marginTop: S.sm }}>
        <HeroNumber value="$8,420" size={88} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: S.lg, marginTop: S.xs }}>
        <DeltaPill arrow="down" value="8%" tail="vs YESTERDAY" color={C.alertNormal} />
        <DeltaPill arrow="up" value="3%" tail="vs THIS WEEK AVG" color={C.alertCritical} />
        <span style={{
          fontFamily: F.mono,
          fontSize: 11,
          color: C.textSecondary,
          letterSpacing: '0.10em',
          textTransform: 'uppercase',
        }}>
          MONTH PROJECTION <span style={{ color: C.textPrimary, fontWeight: 600 }}>$248K</span>
        </span>
      </div>
    </div>
  );
}

function DeltaPill({ arrow, value, tail, color }: { arrow: 'up' | 'down'; value: string; tail: string; color: string }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      fontFamily: F.mono,
      fontSize: 11,
      letterSpacing: '0.10em',
      textTransform: 'uppercase',
      color: C.textSecondary,
    }}>
      <ArrowGlyph dir={arrow} color={color} />
      <span style={{ color, fontWeight: 600 }}>{value}</span>
      <span>{tail}</span>
    </span>
  );
}

function ArrowGlyph({ dir, color }: { dir: 'up' | 'down'; color: string }) {
  if (dir === 'up') {
    return (
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
        <path d="M5 1L9 7H1L5 1Z" fill={color} />
      </svg>
    );
  }
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
      <path d="M5 9L1 3H9L5 9Z" fill={color} />
    </svg>
  );
}

// ─── STRATEGY SIMULATOR ───────────────────────────────────────────
// FORGE Wave 2: the real Strategy Simulator now lives at
// `./StrategySimulator/SimulatorView.tsx` and renders inside the
// 'simulator' tab below. The previous mock-data placeholder
// (StrategySimulatorCard / NPVBar) has been removed. The mock STRATEGIES
// export in `industrial-mock.ts` is preserved for any other consumers
// that still reference it.

// ─── TARIFF OPTIMIZATION ──────────────────────────────────────────
function TariffOptimizationCard() {
  return (
    <ContainedCard minHeight={240}>
      <SectionHeader eyebrow="TARIFF ANALYSIS" identity="The right rate." />
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: S.lg,
        marginTop: S.lg,
      }}>
        {/* Current */}
        <TariffColumn
          label="CURRENT"
          name={TARIFF_COMPARISON.currentName}
          rate={TARIFF_COMPARISON.currentRate}
        />
        {/* Alternative */}
        <TariffColumn
          label="ALTERNATIVE"
          name={TARIFF_COMPARISON.alternativeName}
          rate={TARIFF_COMPARISON.alternativeRate}
          accent={C.electricBlue}
        />
        {/* Savings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: S.sm, paddingLeft: S.md, borderLeft: `1px solid ${C.borderDefault}` }}>
          <div style={{
            fontFamily: F.mono,
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: C.textMuted,
          }}>
            ANNUAL SAVINGS
          </div>
          <HeroNumber value={`$${(TARIFF_COMPARISON.annualSavings / 1000).toFixed(0)}K`} size={48} color={C.falconGold} />
          <div style={{
            fontFamily: F.mono,
            fontSize: 11,
            color: C.textSecondary,
            letterSpacing: '0.06em',
          }}>
            Differential: ${(TARIFF_COMPARISON.currentRate - TARIFF_COMPARISON.alternativeRate).toFixed(2)}/MWh
          </div>
        </div>
      </div>
    </ContainedCard>
  );
}

function TariffColumn({ label, name, rate, accent = C.textPrimary }: { label: string; name: string; rate: number; accent?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: S.sm }}>
      <div style={{
        fontFamily: F.mono,
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: C.textMuted,
      }}>
        {label}
      </div>
      <div style={{ fontFamily: F.sans, fontSize: 14, color: C.textPrimary, lineHeight: 1.4 }}>
        {name}
      </div>
      <div style={{
        fontFamily: F.mono,
        fontSize: 22,
        fontWeight: 600,
        color: accent,
        fontVariantNumeric: 'tabular-nums',
        marginTop: S.xs,
      }}>
        ${rate.toFixed(2)}<span style={{ fontSize: 11, color: C.textMuted, marginLeft: 4 }}>/MWh</span>
      </div>
    </div>
  );
}

// ─── CARBON + BILL PROJECTOR ──────────────────────────────────────
function CarbonAndBillRow() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: S.md }}>
      <CarbonGaugeCard />
      <MonthlyBillCard />
    </div>
  );
}

function CarbonGaugeCard() {
  return (
    <ContainedCard minHeight={260}>
      <SectionHeader eyebrow="CARBON INTENSITY" identity="Your grid mix." />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: S.lg }}>
        <CarbonGauge value={CARBON_INTENSITY.kgCo2PerMwh} />
      </div>
      <div style={{
        fontFamily: F.mono,
        fontSize: 11,
        color: C.textSecondary,
        lineHeight: 1.6,
        textAlign: 'center',
        marginTop: S.md,
        letterSpacing: '0.04em',
      }}>
        {CARBON_INTENSITY.gridMixDescription}
      </div>
    </ContainedCard>
  );
}

function CarbonGauge({ value }: { value: number }) {
  // 412 kg/MWh — semicircular gauge
  const min = 200;
  const max = 800;
  const pct = Math.min(1, Math.max(0, (value - min) / (max - min)));
  const radius = 56;
  const circumference = Math.PI * radius;
  const dash = pct * circumference;

  // Color gradient: green at low, gold mid, red at high
  const color =
    value < 350 ? C.alertNormal :
    value < 550 ? C.falconGold :
    C.alertCritical;

  return (
    <div style={{ position: 'relative', width: 160, height: 90 }}>
      <svg width={160} height={90} viewBox="0 0 160 90" aria-hidden>
        <path
          d={`M 16 80 A ${radius} ${radius} 0 0 1 144 80`}
          stroke={C.borderDefault}
          strokeWidth={6}
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={`M 16 80 A ${radius} ${radius} 0 0 1 144 80`}
          stroke={color}
          strokeWidth={6}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
        />
      </svg>
      <div style={{
        position: 'absolute',
        inset: 0,
        top: 28,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{
          fontFamily: F.mono,
          fontSize: 22,
          fontWeight: 600,
          color: C.textPrimary,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {value}
        </span>
        <span style={{
          fontFamily: F.mono,
          fontSize: 9,
          color: C.textMuted,
          letterSpacing: '0.10em',
          textTransform: 'uppercase',
          marginTop: 2,
        }}>
          kg CO₂ / MWh
        </span>
      </div>
    </div>
  );
}

function MonthlyBillCard() {
  const data = MONTHLY_BILL_PROJECTION.map((v, i) => ({ month: MONTH_LABELS[i], cost: v }));
  return (
    <ContainedCard minHeight={260}>
      <SectionHeader eyebrow="MONTHLY BILL PROJECTION" identity="Twelve months ahead." />
      <div style={{ height: 170, marginTop: S.md }}>
        <AnnotatableChart chartId="industrial:bill-projection-12mo">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: -4 }}>
            <CartesianGrid stroke={C.borderDefault} strokeDasharray="2 4" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontFamily: F.mono, fontSize: 9, fill: C.textMuted }}
              tickLine={false}
              axisLine={{ stroke: C.borderDefault }}
            />
            <YAxis
              tick={{ fontFamily: F.mono, fontSize: 9, fill: C.textMuted }}
              tickLine={false}
              axisLine={false}
              width={40}
              tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`}
            />
            <Tooltip
              contentStyle={{
                background: C.bgSurface,
                border: `1px solid ${C.borderDefault}`,
                borderRadius: R.md,
                fontFamily: F.mono,
                fontSize: 11,
                color: C.textPrimary,
              }}
              labelStyle={{ color: C.textMuted }}
              formatter={(v) => v != null ? [`$${Number(v).toLocaleString()}`, 'Cost'] : ['—', '—']}
            />
            <Bar dataKey="cost" radius={[2, 2, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={i === CURRENT_MONTH_IDX ? C.electricBlue : C.bgOverlay} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        </AnnotatableChart>
      </div>
    </ContainedCard>
  );
}

// ─── DEMAND RESPONSE OPPS (right column) ──────────────────────────
function DemandResponseSection() {
  return (
    <FlowSection eyebrow="DEMAND RESPONSE OPPORTUNITIES" identity="Get paid to reduce.">
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {DEMAND_RESPONSE_OPPS.map((d) => (
          <div
            key={d.programName}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: S.xs,
              padding: `${S.sm} ${S.sm}`,
              borderBottom: `1px solid ${C.borderDefault}`,
            }}
          >
            <div style={{ fontFamily: F.sans, fontSize: 13, color: C.textPrimary }}>
              {d.programName}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                fontFamily: F.mono,
                fontSize: 11,
                color: C.textMuted,
                letterSpacing: '0.06em',
              }}>
                {d.mwAvailable.toFixed(1)} MW available
              </span>
              <span style={{
                fontFamily: F.mono,
                fontSize: 13,
                fontWeight: 600,
                color: C.falconGold,
                fontVariantNumeric: 'tabular-nums',
              }}>
                ${(d.paymentPerMw / 1000).toFixed(0)}K/MW-yr
              </span>
            </div>
          </div>
        ))}
      </div>
    </FlowSection>
  );
}

// ─── TARIFF ALERTS (right column) ────────────────────────────────
const TARIFF_ALERTS = [
  { id: 'ta-001', title: 'AEP-Ohio rate filing — June 2026', detail: '+1.8% energy charge expected', date: '2026-06-01' },
  { id: 'ta-002', title: 'PJM capacity rates — 2026/27 BRA',  detail: 'New cap. price flows through Jan 2027', date: '2026-05-15' },
  { id: 'ta-003', title: 'Demand charge restructuring filing', detail: 'GS-4 demand window narrowing to 14:00–18:00', date: '2026-08-22' },
];

function TariffAlertsSection() {
  return (
    <FlowSection eyebrow="TARIFF ALERTS" identity="Rate changes.">
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {TARIFF_ALERTS.map((t) => (
          <div
            key={t.id}
            style={{
              padding: `${S.sm} ${S.sm}`,
              borderBottom: `1px solid ${C.borderDefault}`,
            }}
          >
            <div style={{ fontFamily: F.sans, fontSize: 13, color: C.textPrimary, marginBottom: 2 }}>
              {t.title}
            </div>
            <div style={{
              fontFamily: F.mono,
              fontSize: 11,
              color: C.textSecondary,
              marginBottom: 2,
            }}>
              {t.detail}
            </div>
            <div style={{
              fontFamily: F.mono,
              fontSize: 10,
              color: C.textMuted,
              letterSpacing: '0.08em',
            }}>
              EFFECTIVE {t.date}
            </div>
          </div>
        ))}
      </div>
    </FlowSection>
  );
}

// ─── FACILITY PROFILE CARD (right column) ─────────────────────────
function FacilityProfileCard() {
  const rows = [
    { label: 'PEAK LOAD', value: `${FACILITY_PROFILE.peakLoadMw.toFixed(1)} MW` },
    { label: 'TYPICAL LOAD', value: `${FACILITY_PROFILE.typicalLoadMw.toFixed(1)} MW` },
    { label: 'ON-SITE SOLAR', value: `${FACILITY_PROFILE.currentSolarMw.toFixed(1)} MW` },
    { label: 'CURRENT TARIFF', value: FACILITY_PROFILE.currentTariff },
  ];

  return (
    <ContainedCard>
      <SectionHeader eyebrow={`FACILITY PROFILE · ${FACILITY_PROFILE.location.toUpperCase()}`} identity="What you're working with." />
      <div style={{ display: 'flex', flexDirection: 'column', marginTop: S.md }}>
        {rows.map((r, i) => (
          <div
            key={r.label}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: S.md,
              height: 36,
              borderBottom: i === rows.length - 1 ? 'none' : `1px solid ${C.borderDefault}`,
            }}
          >
            <span style={{
              fontFamily: F.mono,
              fontSize: 10,
              color: C.textMuted,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}>
              {r.label}
            </span>
            <span style={{
              fontFamily: F.mono,
              fontSize: 12,
              color: C.textPrimary,
              fontVariantNumeric: 'tabular-nums',
              textAlign: 'right',
            }}>
              {r.value}
            </span>
          </div>
        ))}
      </div>
    </ContainedCard>
  );
}

// ─── SHARED SECTION HEADER ────────────────────────────────────────
function SectionHeader({ eyebrow, identity }: { eyebrow: string; identity: string }) {
  return (
    <div>
      <div style={{
        fontFamily: F.mono,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: C.electricBlue,
        marginBottom: S.xs,
      }}>
        {eyebrow}
      </div>
      <EditorialIdentity size="section">{identity}</EditorialIdentity>
    </div>
  );
}

// ─── TAB STRIP ────────────────────────────────────────────────────
function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontFamily: F.mono,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        color: active ? C.electricBlue : C.textMuted,
        padding: `${S.sm} 0`,
        borderBottom: active
          ? `2px solid ${C.electricBlue}`
          : '2px solid transparent',
        marginBottom: -1,
        transition: 'color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {children}
    </button>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────
export function IndustrialNest() {
  const [tab, setTab] = useState<IndustrialTab>('overview');

  return (
    <PageAtmosphere tint="industrial">
      {/* Tab strip — surgical addition above the existing layout */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          gap: S.lg,
          padding: `${S.md} ${S.xl} 0`,
          borderBottom: `1px solid ${C.borderDefault}`,
        }}
      >
        <TabButton
          active={tab === 'overview'}
          onClick={() => setTab('overview')}
        >
          OVERVIEW
        </TabButton>
        <TabButton
          active={tab === 'simulator'}
          onClick={() => setTab('simulator')}
        >
          STRATEGY SIMULATOR
        </TabButton>
      </div>

      {tab === 'overview' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: S.sm,
            padding: S.xl,
          }}
        >
          {/* LEFT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: S.xl }}>
            <IndustrialHeroBlock />
            <TariffOptimizationCard />
            <CarbonAndBillRow />
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: S.xl }}>
            <DemandResponseSection />
            <TariffAlertsSection />
            <FacilityProfileCard />
          </div>
        </div>
      )}

      {tab === 'simulator' && <SimulatorView />}
    </PageAtmosphere>
  );
}
