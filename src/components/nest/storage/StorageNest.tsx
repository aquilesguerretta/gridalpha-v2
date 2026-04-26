import { useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts';
import { C, F, R, S } from '@/design/tokens';
import { ContainedCard } from '@/components/terminal/ContainedCard';
import { EditorialIdentity } from '@/components/terminal/EditorialIdentity';
import { FlowSection } from '@/components/terminal/FlowSection';
import { HeroNumber } from '@/components/terminal/HeroNumber';
import { RegimeBadge } from '@/components/terminal/RegimeBadge';
import { StatusDot } from '@/components/terminal/StatusDot';
import {
  BATTERY_ASSETS,
  REVENUE_ATTRIBUTION_30D,
  DA_BID_RECOMMENDATIONS,
  CYCLING_TRACKER,
  ANCILLARY_SIGNALS,
  ASSET_HEALTH,
} from '@/lib/mock/storage-mock';
import type { BatteryAsset, AssetHealth as AssetHealthRow } from '@/lib/mock/storage-mock';

const STATUS_DOT_MAP: Record<AssetHealthRow['status'], 'live' | 'stale' | 'offline'> = {
  green: 'live',
  amber: 'stale',
  red: 'offline',
};

// ─── PORTFOLIO STRIP ──────────────────────────────────────────────
function PortfolioStrip() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: S.sm,
      }}
    >
      {BATTERY_ASSETS.map((a) => (
        <BatteryAssetCard key={a.id} asset={a} />
      ))}
    </div>
  );
}

function BatteryAssetCard({ asset }: { asset: BatteryAsset }) {
  return (
    <ContainedCard minHeight={200}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: S.sm, height: '100%' }}>
        {/* Header */}
        <div>
          <div style={{ fontFamily: F.sans, fontSize: 14, fontWeight: 600, color: C.textPrimary }}>
            {asset.name}
          </div>
          <div style={{
            fontFamily: F.mono,
            fontSize: 10,
            color: C.textMuted,
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
            marginTop: 2,
          }}>
            {asset.location}
          </div>
        </div>

        {/* SOC + revenue */}
        <div style={{ display: 'flex', alignItems: 'center', gap: S.md }}>
          <SOCGauge soc={asset.soc} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
            <HeroNumber value={`$${asset.todayRevenue.toLocaleString()}`} size={28} color={C.falconGold} />
            <div style={{
              fontFamily: F.mono,
              fontSize: 10,
              color: C.textMuted,
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
            }}>
              TODAY
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 'auto',
          paddingTop: S.sm,
          borderTop: `1px solid ${C.borderDefault}`,
        }}>
          <span style={{
            fontFamily: F.mono,
            fontSize: 10,
            color: C.textMuted,
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
          }}>
            {asset.mwCapacity}MW · {asset.mwhCapacity}MWh
          </span>
          <RegimeBadge regime={asset.regime} />
        </div>
      </div>
    </ContainedCard>
  );
}

function SOCGauge({ soc }: { soc: number }) {
  // Circular SVG 60x60 — electric blue arc proportional to soc%
  const size = 60;
  const r = 24;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const dash = (soc / 100) * circumference;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle cx={cx} cy={cy} r={r} stroke={C.borderDefault} strokeWidth={3} fill="none" />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={C.electricBlue}
          strokeWidth={3}
          fill="none"
          strokeDasharray={`${dash} ${circumference - dash}`}
          strokeDashoffset={circumference / 4}
          transform={`rotate(-90 ${cx} ${cy})`}
          strokeLinecap="round"
        />
      </svg>
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: F.mono,
        fontSize: 12,
        fontWeight: 600,
        color: C.textPrimary,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {soc}%
      </div>
    </div>
  );
}

// ─── HERO BLOCK ───────────────────────────────────────────────────
function StorageHeroBlock() {
  const total = BATTERY_ASSETS.reduce((sum, a) => sum + a.todayRevenue, 0);
  const data = BATTERY_ASSETS.map((a) => ({ name: a.name, revenue: a.todayRevenue }));

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
        PORTFOLIO TODAY
      </div>
      <EditorialIdentity size="hero">Your fleet.</EditorialIdentity>

      <div style={{ display: 'flex', alignItems: 'center', gap: S.xxl, marginTop: S.sm }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: S.xs }}>
          <HeroNumber value={`$${total.toLocaleString()}`} size={80} color={C.falconGold} />
          <div style={{
            fontFamily: F.mono,
            fontSize: 11,
            color: C.textMuted,
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
          }}>
            REVENUE · 4 ASSETS
          </div>
        </div>

        <div style={{ height: 120, flex: 1, minWidth: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
              <CartesianGrid stroke={C.borderDefault} strokeDasharray="2 4" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontFamily: F.mono, fontSize: 9, fill: C.textMuted }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}k`}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontFamily: F.mono, fontSize: 10, fill: C.textSecondary }}
                tickLine={false}
                axisLine={false}
                width={80}
              />
              <Bar dataKey="revenue" fill={C.electricBlue} radius={[0, 2, 2, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ─── REVENUE ATTRIBUTION ──────────────────────────────────────────
function RevenueAttributionCard() {
  return (
    <ContainedCard minHeight={280}>
      <SectionHeader eyebrow="REVENUE BY SOURCE · 30D" identity="Where it comes from." />
      <div style={{ height: 200, marginTop: S.md }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={REVENUE_ATTRIBUTION_30D} margin={{ top: 4, right: 8, bottom: 4, left: -12 }}>
            <CartesianGrid stroke={C.borderDefault} strokeDasharray="2 4" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fontFamily: F.mono, fontSize: 10, fill: C.textMuted }}
              tickLine={false}
              axisLine={{ stroke: C.borderDefault }}
              interval={4}
            />
            <YAxis
              tick={{ fontFamily: F.mono, fontSize: 10, fill: C.textMuted }}
              tickLine={false}
              axisLine={{ stroke: C.borderDefault }}
              width={48}
              tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}k`}
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
              formatter={(v: number, n: string) => [`$${v.toLocaleString()}`, n]}
            />
            <Area type="monotone" dataKey="arbitrage" stackId="1" stroke={C.electricBlue} fill={C.electricBlue} fillOpacity={0.5} name="Arbitrage" />
            <Area type="monotone" dataKey="capacity"  stackId="1" stroke={C.falconGold}   fill={C.falconGold}   fillOpacity={0.5} name="Capacity" />
            <Area type="monotone" dataKey="ancillary" stackId="1" stroke={C.alertNormal}  fill={C.alertNormal}  fillOpacity={0.5} name="Ancillary" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display: 'flex', gap: S.lg, marginTop: S.sm }}>
        <LegendChip label="Arbitrage" color={C.electricBlue} />
        <LegendChip label="Capacity" color={C.falconGold} />
        <LegendChip label="Ancillary" color={C.alertNormal} />
      </div>
    </ContainedCard>
  );
}

function LegendChip({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      fontFamily: F.mono,
      fontSize: 11,
      fontWeight: 500,
      letterSpacing: '0.10em',
      textTransform: 'uppercase',
      color: C.textSecondary,
    }}>
      <span aria-hidden style={{ width: 10, height: 2, background: color, borderRadius: 1 }} />
      {label}
    </span>
  );
}

// ─── DA BID OPTIMIZER ─────────────────────────────────────────────
function DABidOptimizerCard() {
  // chargeMw rendered as negative for visual clarity (below axis)
  const data = DA_BID_RECOMMENDATIONS.map((d) => ({
    hour: d.hour,
    charge: -d.chargeMw,
    discharge: d.dischargeMw,
  }));
  const [exportHovered, setExportHovered] = useState(false);

  return (
    <ContainedCard minHeight={240}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: S.md }}>
        <SectionHeader eyebrow="DA BID RECOMMENDATIONS · TOMORROW" identity="Suggested bids." />
        <button
          onMouseEnter={() => setExportHovered(true)}
          onMouseLeave={() => setExportHovered(false)}
          style={{
            height: 32,
            paddingInline: S.md,
            background: 'transparent',
            color: C.electricBlue,
            border: `1px solid ${exportHovered ? C.electricBlue : C.borderDefault}`,
            borderRadius: R.md,
            fontFamily: F.mono,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'border-color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          EXPORT BID STACK
        </button>
      </div>
      <div style={{ height: 160, marginTop: S.md }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: -8 }} stackOffset="sign">
            <CartesianGrid stroke={C.borderDefault} strokeDasharray="2 4" vertical={false} />
            <XAxis
              dataKey="hour"
              tick={{ fontFamily: F.mono, fontSize: 10, fill: C.textMuted }}
              tickLine={false}
              axisLine={{ stroke: C.borderDefault }}
            />
            <YAxis
              tick={{ fontFamily: F.mono, fontSize: 10, fill: C.textMuted }}
              tickLine={false}
              axisLine={{ stroke: C.borderDefault }}
              width={48}
              tickFormatter={(v: number) => `${v > 0 ? '+' : ''}${v}MW`}
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
              formatter={(v: number, n: string) => [`${Math.abs(v)} MW`, n === 'charge' ? 'Charge' : 'Discharge']}
            />
            <Bar dataKey="charge" stackId="bid" fill={C.electricBlue} name="charge" />
            <Bar dataKey="discharge" stackId="bid" fill={C.falconGold} name="discharge" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div style={{ display: 'flex', gap: S.lg, marginTop: S.sm }}>
        <LegendChip label="Charge" color={C.electricBlue} />
        <LegendChip label="Discharge" color={C.falconGold} />
      </div>
    </ContainedCard>
  );
}

// ─── RIGHT COLUMN — CYCLING TRACKER ───────────────────────────────
function CyclingTrackerSection() {
  const rows = [
    { label: "TODAY'S CYCLES", value: CYCLING_TRACKER.todayCycles.toFixed(1) },
    { label: 'DEGRADATION COST', value: `$${CYCLING_TRACKER.degradationCost.toLocaleString()}` },
    { label: 'NET P&L', value: `$${CYCLING_TRACKER.netPnl.toLocaleString()}`, gold: true },
  ];
  return (
    <FlowSection eyebrow="CYCLING TRACKER" identity="Wear tracking.">
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {rows.map((r) => (
          <KeyValueRow key={r.label} label={r.label} value={r.value} valueColor={r.gold ? C.falconGold : C.textPrimary} />
        ))}
      </div>
    </FlowSection>
  );
}

function KeyValueRow({ label, value, valueColor = C.textPrimary }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{
      height: 44,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingInline: S.sm,
      borderBottom: `1px solid ${C.borderDefault}`,
    }}>
      <span style={{
        fontFamily: F.mono,
        fontSize: 10,
        color: C.textMuted,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: F.mono,
        fontSize: 14,
        fontWeight: 600,
        color: valueColor,
        fontVariantNumeric: 'tabular-nums',
      }}>
        {value}
      </span>
    </div>
  );
}

// ─── ANCILLARY SERVICES ───────────────────────────────────────────
function AncillaryServicesSection() {
  const rows = [
    { label: 'FREQUENCY REGULATION', value: `$${ANCILLARY_SIGNALS.freqReg.toFixed(1)}/MW-h` },
    { label: 'RESERVES', value: `$${ANCILLARY_SIGNALS.reserves.toFixed(1)}/MW-h` },
    { label: 'REGULATION CLEARED', value: `${ANCILLARY_SIGNALS.regulationClearedMw} MW` },
  ];
  return (
    <FlowSection eyebrow="ANCILLARY SERVICES" identity="The other revenue.">
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {rows.map((r) => (
          <KeyValueRow key={r.label} label={r.label} value={r.value} />
        ))}
      </div>
    </FlowSection>
  );
}

// ─── ASSET HEALTH ─────────────────────────────────────────────────
function AssetHealthSection() {
  return (
    <FlowSection eyebrow="ASSET HEALTH" identity="Status check.">
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {ASSET_HEALTH.map((row) => {
          const asset = BATTERY_ASSETS.find((a) => a.id === row.assetId);
          return (
            <div
              key={row.assetId}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: S.xs,
                padding: `${S.sm} ${S.sm}`,
                borderBottom: `1px solid ${C.borderDefault}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: S.sm }}>
                <StatusDot status={STATUS_DOT_MAP[row.status]} />
                <span style={{
                  fontFamily: F.mono,
                  fontSize: 12,
                  fontWeight: 600,
                  color: C.textPrimary,
                  letterSpacing: '0.06em',
                }}>
                  {asset?.name ?? row.assetId}
                </span>
              </div>
              <div style={{
                fontFamily: F.mono,
                fontSize: 12,
                color: C.textSecondary,
                lineHeight: 1.5,
                paddingLeft: 14,
              }}>
                {row.detail}
              </div>
            </div>
          );
        })}
      </div>
    </FlowSection>
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

// ─── MAIN ─────────────────────────────────────────────────────────
export function StorageNest() {
  return (
    <div
      style={{
        height: '100%',
        background: C.bgBase,
        overflow: 'auto',
        position: 'relative',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          background:
            'radial-gradient(ellipse 80% 60% at center 30%, rgba(255,255,255,0.025) 0%, transparent 70%)',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: S.xl,
          padding: S.xl,
        }}
      >
        {/* Top — Portfolio strip (full width) */}
        <PortfolioStrip />

        {/* Two-column grid below */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: S.sm,
          }}
        >
          {/* LEFT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: S.xl }}>
            <StorageHeroBlock />
            <RevenueAttributionCard />
            <DABidOptimizerCard />
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: S.xl }}>
            <CyclingTrackerSection />
            <AncillaryServicesSection />
            <AssetHealthSection />
          </div>
        </div>
      </div>
    </div>
  );
}
