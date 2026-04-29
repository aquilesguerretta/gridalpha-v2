// ATLAS — Vault case study viewer.
// Hero header + KPI strip + annotated 24h LMP chart + 3 written sections + footer.

import { Link } from 'react-router-dom';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { C, F, R, S } from '@/design/tokens';
import { ContainedCard } from '@/components/terminal/ContainedCard';
import { EditorialIdentity } from '@/components/terminal/EditorialIdentity';
import { MetricTile } from '@/components/terminal/MetricTile';
import { PageAtmosphere } from '@/components/terminal/PageAtmosphere';
import { AnnotatableChart } from '@/components/shared/AnnotatableChart';
import { CASE_STUDIES } from '@/lib/mock/vault-mock';
import type { CaseCategory, CaseSeverity } from '@/lib/types/vault';

const TICK_INDICES = [0, 6, 12, 18, 23];

const CATEGORY_DISPLAY: Record<CaseCategory, string> = {
  arbitrage:  'ARBITRAGE',
  congestion: 'CONGESTION',
  spark:      'SPARK SPREAD',
  forecast:   'FORECAST',
  extreme:    'EXTREME EVENT',
  regulatory: 'REGULATORY',
};

const SEVERITY_COLOR: Record<CaseSeverity, string> = {
  low:      C.alertNormal,
  medium:   C.electricBlue,
  high:     C.falconGold,
  critical: C.alertCritical,
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatHour(idx: number): string {
  return `${idx.toString().padStart(2, '0')}:00`;
}

interface ChartTooltipPayload {
  value: number;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: ChartTooltipPayload[];
  label?: number | string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const hourIdx = typeof label === 'number' ? label : Number(label);
  const v = payload[0].value;
  return (
    <div
      style={{
        background:   C.bgElevated,
        border:       `1px solid ${C.borderDefault}`,
        borderRadius: R.md,
        padding:      S.md,
        minWidth:     140,
      }}
    >
      <div
        style={{
          fontFamily:    F.mono,
          fontSize:      9,
          letterSpacing: '0.18em',
          color:         C.textMuted,
          textTransform: 'uppercase',
          marginBottom:  6,
          fontWeight:    600,
        }}
      >
        HOUR {Number.isFinite(hourIdx) ? formatHour(hourIdx) : String(label)}
      </div>
      <div
        style={{
          fontFamily:         F.mono,
          fontSize:           14,
          fontWeight:         600,
          color:              C.textPrimary,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        ${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/MWh
      </div>
    </div>
  );
}

interface CaseStudyViewProps {
  caseStudyId: string;
}

export function CaseStudyView({ caseStudyId }: CaseStudyViewProps) {
  const study = CASE_STUDIES.find((s) => s.id === caseStudyId);

  if (!study) {
    return (
      <PageAtmosphere variant="hero">
        <div
          style={{
            padding:        S.xl,
            display:        'flex',
            flexDirection:  'column',
            gap:            S.lg,
            alignItems:     'flex-start',
          }}
        >
          <div
            style={{
              fontFamily:    F.mono,
              fontSize:      11,
              fontWeight:    600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color:         C.alertWarning,
            }}
          >
            404 · NOT FOUND
          </div>
          <div
            style={{
              fontFamily:    F.display,
              fontSize:      48,
              color:         C.textPrimary,
              fontWeight:    400,
              letterSpacing: '-0.02em',
            }}
          >
            Case study not found.
          </div>
          <div
            style={{
              fontFamily: F.sans,
              fontSize:   16,
              color:      C.textSecondary,
              lineHeight: 1.5,
            }}
          >
            We couldn’t locate <code style={{ fontFamily: F.mono, color: C.electricBlue }}>{caseStudyId}</code> in the archive.
          </div>
          <Link
            to="/vault"
            style={{
              fontFamily:     F.mono,
              fontSize:       12,
              fontWeight:     600,
              letterSpacing:  '0.10em',
              textTransform:  'uppercase',
              color:          C.electricBlue,
              textDecoration: 'none',
              display:        'inline-flex',
              alignItems:     'center',
              gap:            S.xs,
              padding:        `${S.sm} ${S.md}`,
              border:         `1px solid ${C.borderActive}`,
              borderRadius:   R.md,
            }}
          >
            ← Back to vault
          </Link>
        </div>
      </PageAtmosphere>
    );
  }

  const chartData = study.prices24h.map((price, hour) => ({ hour, price }));
  const peakPrice = Math.max(...study.prices24h);
  const minPrice = Math.min(...study.prices24h);
  const yMax = Math.ceil(peakPrice * 1.05);

  return (
    <PageAtmosphere variant="hero">
      <div style={{ padding: S.xl, maxWidth: 1280, margin: '0 auto' }}>
        {/* Back link */}
        <Link
          to="/vault"
          style={{
            fontFamily:     F.mono,
            fontSize:       11,
            fontWeight:     600,
            letterSpacing:  '0.12em',
            textTransform:  'uppercase',
            color:          C.electricBlue,
            textDecoration: 'none',
            display:        'inline-flex',
            alignItems:     'center',
            gap:            S.xs,
            marginBottom:   S.lg,
          }}
        >
          ← The Vault
        </Link>

        {/* Eyebrow row */}
        <div
          style={{
            display:        'flex',
            alignItems:     'center',
            gap:            S.md,
            marginBottom:   S.md,
          }}
        >
          <span
            style={{
              fontFamily:    F.mono,
              fontSize:      11,
              fontWeight:    600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color:         C.electricBlue,
              border:        `1px solid ${C.borderActive}`,
              borderRadius:  R.sm,
              padding:       '4px 10px',
            }}
          >
            {CATEGORY_DISPLAY[study.category]}
          </span>
          <span
            style={{
              fontFamily:    F.mono,
              fontSize:      11,
              color:         C.textMuted,
              letterSpacing: '0.12em',
            }}
          >
            {formatDate(study.date)} · {study.region.toUpperCase()}
          </span>
          <span
            style={{
              display:        'inline-flex',
              alignItems:     'center',
              gap:            6,
              fontFamily:     F.mono,
              fontSize:       10,
              fontWeight:     600,
              letterSpacing:  '0.12em',
              textTransform:  'uppercase',
              color:          SEVERITY_COLOR[study.severity],
              marginLeft:     'auto',
            }}
          >
            <span
              style={{
                width:        6,
                height:       6,
                borderRadius: '50%',
                background:   SEVERITY_COLOR[study.severity],
              }}
            />
            {study.severity} severity
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            fontFamily:    F.display,
            fontSize:      56,
            lineHeight:    1.05,
            color:         C.textPrimary,
            fontWeight:    400,
            letterSpacing: '-0.02em',
            marginBottom:  S.sm,
          }}
        >
          {study.title}
        </div>

        {/* Italic gray subtitle */}
        <div
          style={{
            fontFamily:    F.display,
            fontSize:      24,
            fontStyle:     'italic',
            color:         'rgba(255,255,255,0.45)',
            fontWeight:    400,
            lineHeight:    1.3,
            marginBottom:  S.xl,
            maxWidth:      900,
          }}
        >
          {study.headline}
        </div>

        {/* KPI strip */}
        <div
          style={{
            display:             'grid',
            gridTemplateColumns: `repeat(${Math.min(5, study.metrics.length)}, 1fr)`,
            gap:                 S.md,
            marginBottom:        S.xl,
          }}
        >
          {study.metrics.slice(0, 5).map((m) => (
            <MetricTile key={m.label} label={m.label} value={m.value} />
          ))}
        </div>

        {/* Annotated chart */}
        <ContainedCard style={{ marginBottom: S.xl, height: 360, display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display:        'flex',
              justifyContent: 'space-between',
              alignItems:     'center',
              marginBottom:   S.md,
            }}
          >
            <span
              style={{
                fontFamily:    F.mono,
                fontSize:      11,
                fontWeight:    600,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color:         C.electricBlue,
              }}
            >
              LMP · 24H · ANNOTATED
            </span>
            <span
              style={{
                fontFamily:         F.mono,
                fontSize:           11,
                color:              'rgba(245,158,11,0.65)',
                letterSpacing:      '0.08em',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              ${minPrice.toFixed(0)} – ${peakPrice.toFixed(0)} $/MWh
            </span>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <AnnotatableChart chartId={`vault:case-study:${study.id}:lmp-24h`}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 24, right: 24, bottom: 24, left: 40 }}>
                <CartesianGrid horizontal vertical={false} strokeDasharray="2 4" stroke={C.borderDefault} />
                <XAxis
                  dataKey="hour"
                  type="number"
                  domain={[0, 23]}
                  ticks={TICK_INDICES}
                  tickFormatter={(v) => formatHour(v as number)}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: C.textMuted, fontFamily: F.mono, fontSize: 10 }}
                />
                <YAxis
                  domain={[0, yMax]}
                  axisLine={false}
                  tickLine={false}
                  width={48}
                  tick={{ fill: C.textMuted, fontFamily: F.mono, fontSize: 10 }}
                  tickFormatter={(v) => {
                    const n = v as number;
                    if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
                    return `$${n.toFixed(0)}`;
                  }}
                />
                <Tooltip
                  cursor={{ stroke: C.borderDefault, strokeDasharray: '2 4' }}
                  content={<ChartTooltip />}
                />
                {study.events.map((evt) => (
                  <ReferenceLine
                    key={`evt-${evt.hour}`}
                    x={evt.hour}
                    stroke={C.falconGold}
                    strokeDasharray="3 3"
                    strokeOpacity={0.7}
                    label={{
                      value:    evt.label,
                      position: 'top',
                      fill:     C.falconGold,
                      fontSize: 10,
                      fontFamily: F.mono,
                    }}
                  />
                ))}
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke={C.electricBlue}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                  activeDot={{ r: 4, fill: C.electricBlue, stroke: C.bgBase, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
            </AnnotatableChart>
          </div>
        </ContainedCard>

        {/* Three written sections */}
        <WrittenSection title="What Happened." body={study.whatHappened} />
        <WrittenSection title="Why It Happened." body={study.whyItHappened} />
        <WrittenSection title="Trading Implication." body={study.tradingImplication} />

        {/* Footer */}
        <div
          style={{
            marginTop:    S.xxl,
            paddingTop:   S.lg,
            borderTop:    `1px solid ${C.borderDefault}`,
            display:      'flex',
            flexDirection: 'column',
            gap:          S.lg,
          }}
        >
          <div>
            <div
              style={{
                fontFamily:    F.mono,
                fontSize:      10,
                fontWeight:    600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color:         C.textMuted,
                marginBottom:  S.xs,
              }}
            >
              Data sources
            </div>
            <div
              style={{
                fontFamily:    F.mono,
                fontSize:      10,
                color:         C.textSecondary,
                letterSpacing: '0.06em',
                lineHeight:    1.6,
              }}
            >
              {study.sources.join(' · ')}
            </div>
          </div>

          <div>
            <div
              style={{
                fontFamily:    F.mono,
                fontSize:      10,
                fontWeight:    600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color:         C.textMuted,
                marginBottom:  S.sm,
              }}
            >
              Related concepts
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: S.sm }}>
              {study.relatedConcepts.map((concept) => (
                <Link
                  key={concept}
                  to="/vault/alexandria"
                  style={{
                    fontFamily:     F.mono,
                    fontSize:       11,
                    fontWeight:     500,
                    letterSpacing:  '0.06em',
                    color:          C.electricBlue,
                    textDecoration: 'none',
                    border:         `1px solid ${C.borderActive}`,
                    borderRadius:   R.sm,
                    padding:        '4px 10px',
                    background:     C.electricBlueWash,
                  }}
                >
                  {concept}
                </Link>
              ))}
            </div>
          </div>

          <button
            type="button"
            style={{
              alignSelf:      'flex-start',
              fontFamily:     F.mono,
              fontSize:       12,
              fontWeight:     600,
              letterSpacing:  '0.10em',
              textTransform:  'uppercase',
              color:          C.bgBase,
              background:     C.electricBlue,
              border:         `1px solid ${C.electricBlue}`,
              borderRadius:   R.md,
              padding:        `${S.sm} ${S.lg}`,
              cursor:         'pointer',
              transition:     'background-color 150ms cubic-bezier(0.4,0,0.2,1)',
            }}
          >
            Replay this day in the platform →
          </button>
        </div>
      </div>
    </PageAtmosphere>
  );
}

function WrittenSection({ title, body }: { title: string; body: string }) {
  // Editorial paragraph rhythm — split on blank lines so multi-paragraph
  // bodies read as long-form journalism, not a wall of text. Mirrors the
  // pattern used by SCRIBE's Lesson viewer.
  const paragraphs = body.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  return (
    <div style={{ marginBottom: S.xl }}>
      <EditorialIdentity size="hero">{title}</EditorialIdentity>
      <div style={{ height: S.md }} />
      <div
        style={{
          display:        'flex',
          flexDirection:  'column',
          gap:            S.md,
          maxWidth:       780,
        }}
      >
        {paragraphs.map((p, i) => (
          <p
            key={i}
            style={{
              margin:     0,
              fontFamily: F.sans,
              fontSize:   16,
              color:      C.textSecondary,
              lineHeight: 1.7,
            }}
          >
            {p}
          </p>
        ))}
      </div>
    </div>
  );
}

export default CaseStudyView;
