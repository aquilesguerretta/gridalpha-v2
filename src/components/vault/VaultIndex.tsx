// ATLAS — Vault index page.
// Filter rail (left) + 2-column case study card grid (right).

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { C, F, R, S } from '@/design/tokens';
import { ContainedCard } from '@/components/terminal/ContainedCard';
import { FlowSection } from '@/components/terminal/FlowSection';
import { CASE_STUDIES } from '@/lib/mock/vault-mock';
import type { CaseStudy, CaseCategory, CaseSeverity } from '@/lib/types/vault';

const CATEGORY_FILTERS: Array<{ id: CaseCategory; label: string }> = [
  { id: 'arbitrage',  label: 'Arbitrage'      },
  { id: 'congestion', label: 'Congestion'     },
  { id: 'spark',      label: 'Spark Spread'   },
  { id: 'forecast',   label: 'Forecast'       },
  { id: 'extreme',    label: 'Extreme Event'  },
  { id: 'regulatory', label: 'Regulatory'     },
];

const DATE_FILTERS = [
  { id: 'this-year', label: 'This year'        },
  { id: 'last-year', label: 'Last year'        },
  { id: 'two-three', label: '2–3 years'        },
  { id: 'all',       label: 'All time'         },
] as const;

const SEVERITY_FILTERS: Array<{ id: CaseSeverity; label: string }> = [
  { id: 'low',      label: 'Low'      },
  { id: 'medium',   label: 'Medium'   },
  { id: 'high',     label: 'High'     },
  { id: 'critical', label: 'Critical' },
];

const REGION_FILTERS = [
  { id: 'us',     label: 'United States' },
  { id: 'brasil', label: 'Brasil'        },
  { id: 'china',  label: 'China'         },
] as const;

const CATEGORY_DISPLAY: Record<CaseCategory, string> = {
  arbitrage:  'ARBITRAGE',
  congestion: 'CONGESTION',
  spark:      'SPARK SPREAD',
  forecast:   'FORECAST',
  extreme:    'EXTREME',
  regulatory: 'REGULATORY',
};

const SEVERITY_COLOR: Record<CaseSeverity, string> = {
  low:      C.alertNormal,
  medium:   C.electricBlue,
  high:     C.falconGold,
  critical: C.alertCritical,
};

function pageVignette() {
  return {
    position: 'absolute' as const,
    inset: 0,
    background:
      'radial-gradient(ellipse at top, rgba(59,130,246,0.05) 0%, transparent 55%), radial-gradient(ellipse at bottom right, rgba(245,158,11,0.04) 0%, transparent 60%), repeating-radial-gradient(circle at 50% 50%, rgba(255,255,255,0.012) 0px, rgba(255,255,255,0.012) 1px, transparent 1px, transparent 4px)',
    pointerEvents: 'none' as const,
    zIndex: 0,
  };
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }).toUpperCase();
}

function getHeadlineMetric(study: CaseStudy): string {
  return study.metrics[0] ? `${study.metrics[0].label.toUpperCase()} · ${study.metrics[0].value}` : '';
}

export function VaultIndex() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategories, setActiveCategories] = useState<Set<CaseCategory>>(new Set());
  const [activeSeverities, setActiveSeverities] = useState<Set<CaseSeverity>>(new Set());

  const visible = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return CASE_STUDIES.filter((s) => {
      if (activeCategories.size > 0 && !activeCategories.has(s.category)) return false;
      if (activeSeverities.size > 0 && !activeSeverities.has(s.severity)) return false;
      if (q && !`${s.title} ${s.headline} ${s.region}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [activeCategories, activeSeverities, searchTerm]);

  const toggleCategory = (id: CaseCategory) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSeverity = (id: CaseSeverity) => {
    setActiveSeverities((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div
      style={{
        height:     '100%',
        background: C.bgBase,
        overflow:   'auto',
        position:   'relative',
      }}
    >
      <div style={pageVignette()} />

      <div style={{ position: 'relative', zIndex: 1, padding: S.xl }}>
        {/* Page header */}
        <div
          style={{
            display:        'flex',
            justifyContent: 'space-between',
            alignItems:     'flex-end',
            marginBottom:   S.xxl,
            gap:            S.lg,
          }}
        >
          <div>
            <div
              style={{
                fontFamily:    F.mono,
                fontSize:      11,
                fontWeight:    600,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color:         C.electricBlue,
                marginBottom:  S.xs,
              }}
            >
              01 · ARCHIVE
            </div>
            <div
              style={{
                fontFamily:    F.display,
                fontSize:      48,
                lineHeight:    1.05,
                color:         C.textPrimary,
                fontWeight:    400,
                letterSpacing: '-0.02em',
                marginBottom:  S.sm,
              }}
            >
              The Vault.
            </div>
            <div
              style={{
                fontFamily: F.sans,
                fontSize:   16,
                color:      C.textSecondary,
                lineHeight: 1.5,
                maxWidth:   560,
              }}
            >
              Every major market event, reconstructed.
            </div>
          </div>
          <Link
            to="/vault/alexandria"
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
            Open Alexandria →
          </Link>
        </div>

        {/* Two-column layout */}
        <div
          style={{
            display:             'grid',
            gridTemplateColumns: '320px 1fr',
            gap:                 S.lg,
            alignItems:          'start',
          }}
        >
          {/* Filter rail */}
          <aside
            style={{
              position: 'sticky',
              top:      S.xxxl,
              display:  'flex',
              flexDirection: 'column',
              gap:      S.lg,
            }}
          >
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search case studies..."
              style={{
                height:       40,
                background:   C.bgElevated,
                border:       `1px solid ${C.borderDefault}`,
                borderTop:    `1px solid ${C.borderAccent}`,
                borderRadius: R.md,
                padding:      `0 ${S.md}`,
                color:        C.textPrimary,
                fontFamily:   F.sans,
                fontSize:     13,
                outline:      'none',
                width:        '100%',
                boxSizing:    'border-box',
              }}
            />

            <FlowSection eyebrow="CATEGORY" identity="By type.">
              <div style={{ display: 'flex', flexDirection: 'column', gap: S.sm }}>
                {CATEGORY_FILTERS.map((c) => (
                  <CheckboxRow
                    key={c.id}
                    label={c.label}
                    checked={activeCategories.has(c.id)}
                    onToggle={() => toggleCategory(c.id)}
                  />
                ))}
              </div>
            </FlowSection>

            <FlowSection eyebrow="DATE RANGE" identity="When.">
              <div style={{ display: 'flex', flexDirection: 'column', gap: S.sm }}>
                {DATE_FILTERS.map((d, i) => (
                  <RadioRow key={d.id} label={d.label} name="vault-date" defaultChecked={i === 3} />
                ))}
              </div>
            </FlowSection>

            <FlowSection eyebrow="SEVERITY" identity="How big.">
              <div style={{ display: 'flex', flexDirection: 'column', gap: S.sm }}>
                {SEVERITY_FILTERS.map((s) => (
                  <CheckboxRow
                    key={s.id}
                    label={s.label}
                    checked={activeSeverities.has(s.id)}
                    onToggle={() => toggleSeverity(s.id)}
                    accent={SEVERITY_COLOR[s.id]}
                  />
                ))}
              </div>
            </FlowSection>

            <FlowSection eyebrow="REGION" identity="Where.">
              <div style={{ display: 'flex', flexDirection: 'column', gap: S.sm }}>
                {REGION_FILTERS.map((r) => (
                  <CheckboxRow key={r.id} label={r.label} checked={false} onToggle={() => {}} />
                ))}
              </div>
            </FlowSection>
          </aside>

          {/* Case study grid */}
          <div
            style={{
              display:             'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap:                 S.md,
            }}
          >
            {visible.map((study) => (
              <CaseStudyCard key={study.id} study={study} />
            ))}
            {visible.length === 0 && (
              <div
                style={{
                  gridColumn:    '1 / -1',
                  padding:       S.xl,
                  border:        `1px dashed ${C.borderDefault}`,
                  borderRadius:  R.lg,
                  fontFamily:    F.sans,
                  fontSize:      14,
                  color:         C.textMuted,
                  textAlign:     'center',
                }}
              >
                No case studies match the current filters.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CaseStudyCard({ study }: { study: CaseStudy }) {
  return (
    <Link
      to={`/vault/${study.id}`}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <ContainedCard style={{ height: 280, display: 'flex', flexDirection: 'column' }}>
        {/* Eyebrow row */}
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
              fontSize:      10,
              fontWeight:    600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color:         C.electricBlue,
              border:        `1px solid ${C.borderActive}`,
              borderRadius:  R.sm,
              padding:       '3px 8px',
            }}
          >
            {CATEGORY_DISPLAY[study.category]}
          </span>
          <span
            style={{
              fontFamily:    F.mono,
              fontSize:      10,
              color:         C.textMuted,
              letterSpacing: '0.10em',
            }}
          >
            {formatDate(study.date)}
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            fontFamily:    F.display,
            fontSize:      22,
            fontStyle:     'italic',
            color:         C.textPrimary,
            fontWeight:    400,
            lineHeight:    1.2,
            letterSpacing: '-0.01em',
            marginBottom:  S.xs,
          }}
        >
          {study.title}
        </div>

        {/* Headline metric */}
        <div
          style={{
            fontFamily:    F.mono,
            fontSize:      12,
            fontWeight:    600,
            color:         C.falconGold,
            letterSpacing: '0.06em',
            marginBottom:  S.md,
          }}
        >
          {getHeadlineMetric(study)}
        </div>

        {/* Summary */}
        <div
          style={{
            fontFamily:    F.sans,
            fontSize:      13,
            color:         C.textSecondary,
            lineHeight:    1.5,
            display:       '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow:      'hidden',
          }}
        >
          {study.headline}
        </div>

        <div style={{ flex: 1 }} />

        {/* CTA */}
        <div
          style={{
            display:        'flex',
            justifyContent: 'space-between',
            alignItems:     'center',
            marginTop:      S.md,
          }}
        >
          <span
            style={{
              fontFamily:    F.mono,
              fontSize:      11,
              fontWeight:    600,
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
              color:         C.electricBlue,
            }}
          >
            Read case study →
          </span>
          <span
            style={{
              display:        'inline-flex',
              alignItems:     'center',
              gap:            6,
              fontFamily:     F.mono,
              fontSize:       10,
              fontWeight:     600,
              letterSpacing:  '0.10em',
              textTransform:  'uppercase',
              color:          SEVERITY_COLOR[study.severity],
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
            {study.severity}
          </span>
        </div>
      </ContainedCard>
    </Link>
  );
}

function CheckboxRow({
  label,
  checked,
  onToggle,
  accent = C.electricBlue,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
  accent?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        display:        'flex',
        alignItems:     'center',
        gap:            S.sm,
        background:     'transparent',
        border:         'none',
        padding:        `${S.xs} 0`,
        cursor:         'pointer',
        textAlign:      'left',
        width:          '100%',
      }}
    >
      <span
        aria-hidden
        style={{
          width:        14,
          height:       14,
          borderRadius: 3,
          border:       `1px solid ${checked ? accent : C.borderStrong}`,
          background:   checked ? accent : 'transparent',
          display:      'inline-flex',
          alignItems:   'center',
          justifyContent: 'center',
          color:        C.bgBase,
          fontSize:     10,
          fontWeight:   700,
          flexShrink:   0,
        }}
      >
        {checked ? '✓' : ''}
      </span>
      <span
        style={{
          fontFamily: F.sans,
          fontSize:   13,
          color:      checked ? C.textPrimary : C.textSecondary,
        }}
      >
        {label}
      </span>
    </button>
  );
}

function RadioRow({
  label,
  name,
  defaultChecked,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
}) {
  return (
    <label
      style={{
        display:    'flex',
        alignItems: 'center',
        gap:        S.sm,
        cursor:     'pointer',
        padding:    `${S.xs} 0`,
      }}
    >
      <input
        type="radio"
        name={name}
        defaultChecked={defaultChecked}
        style={{ accentColor: C.electricBlue, margin: 0 }}
      />
      <span
        style={{
          fontFamily: F.sans,
          fontSize:   13,
          color:      C.textSecondary,
        }}
      >
        {label}
      </span>
    </label>
  );
}
