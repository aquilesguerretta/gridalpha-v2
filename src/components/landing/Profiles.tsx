import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { C, F, R } from '@/design/tokens';
import { EDITORIAL_SURFACE, EDITORIAL_SURFACE_RAISED, EDITORIAL_DEVELOPER_ACCENT } from '@/design/editorial';

type Mode = 'EVERYONE' | 'TRADER' | 'ANALYST' | 'STORAGE' | 'INDUSTRIAL' | 'STUDENT' | 'DEVELOPER';

const MODES: Mode[] = ['EVERYONE', 'TRADER', 'ANALYST', 'STORAGE', 'INDUSTRIAL', 'STUDENT', 'DEVELOPER'];

const QUOTES: Record<Mode, string> = {
  EVERYONE: 'Configure it around what you do.',
  TRADER: 'I need the edge before the print.',
  ANALYST: 'My decks need defensible numbers.',
  STORAGE: 'Every dispatch is a revenue decision.',
  INDUSTRIAL: 'The bill is the third-largest line on my P&L.',
  STUDENT: 'Textbooks never show a real market clearing.',
  DEVELOPER: 'Siting a project is a twenty-year bet on a node.',
};

const CAPS: Record<Mode, string> = {
  EVERYONE: 'Live LMP, spark spread, Peregrine feed, and generation mix. The default terminal for every professional.',
  TRADER: 'Day-ahead versus real-time spread, generator outage feed, basis dashboard, configurable alerts.',
  ANALYST: 'Clean historical pulls, PNG and CSV exports, zone correlation matrices, AI-drafted reports.',
  STORAGE: 'Asset registration, day-ahead bid optimization, revenue attribution, ancillary services signal.',
  INDUSTRIAL: 'Facility profile, tariff optimization, daily cost intelligence, carbon tracking.',
  STUDENT: 'Live market explainer, interview prep mode, concept map, historical sandbox.',
  DEVELOPER: 'Zone revenue history, interconnection queue intelligence, congestion pattern analysis, PPA benchmarks.',
};

type Card = { label: string; value: string; meta?: string; visual: 'sparkline' | 'badge' | 'bars' | 'lines' | 'list' | 'heatmap' | 'gauge' | 'none' | 'alert' };

const CARDS: Record<Mode, Card[]> = {
  EVERYONE: [
    { label: 'LMP · WEST HUB', value: '$42.80', meta: '+5.9%', visual: 'sparkline' },
    { label: 'SPARK SPREAD', value: '+$18.20', meta: 'BURNING', visual: 'badge' },
    { label: 'GENERATION MIX', value: '', visual: 'bars' },
    { label: 'PEREGRINE FEED', value: '', visual: 'lines' },
  ],
  TRADER: [
    { label: 'DA/RT SPREAD · PSEG', value: '+$24.10', meta: '+3.2%', visual: 'sparkline' },
    { label: 'BASIS · 20 ZONES', value: '', visual: 'list' },
    { label: 'OUTAGE FEED', value: 'SALEM 2', meta: '1170MW · TRIPPED', visual: 'alert' },
    { label: 'RESERVE MARGIN', value: '14.2%', visual: 'gauge' },
  ],
  ANALYST: [
    { label: '30-DAY AVG · WEST HUB', value: '$38.40', meta: 'σ 4.20', visual: 'sparkline' },
    { label: 'ZONE CORRELATION', value: '', visual: 'heatmap' },
    { label: 'EXPORT READY', value: '3 CHARTS', meta: 'PNG / CSV', visual: 'none' },
    { label: 'REPORT DRAFT', value: 'READY', meta: '1,240 WORDS', visual: 'none' },
  ],
  STORAGE: [
    { label: 'PORTFOLIO · 3 ASSETS', value: '280MW', meta: 'TOTAL', visual: 'bars' },
    { label: "TODAY'S REVENUE", value: '$8,420', meta: '+$12 / MIN', visual: 'sparkline' },
    { label: 'DA BID · TOMORROW', value: 'OPTIMIZED', meta: '92% CONF', visual: 'gauge' },
    { label: 'ANCILLARY SIGNAL', value: 'REG D', meta: '$28.40/MW', visual: 'lines' },
  ],
  INDUSTRIAL: [
    { label: "TODAY'S COST", value: '$4,280', meta: '▼ 8.2%', visual: 'sparkline' },
    { label: 'DEMAND CHARGE', value: '68%', meta: 'OF MONTHLY PEAK', visual: 'gauge' },
    { label: 'CARBON INTENSITY', value: '420', meta: 'gCO₂/kWh', visual: 'bars' },
    { label: 'RECOMMENDATION', value: 'SHIFT CRUSHER', meta: '-2H', visual: 'none' },
  ],
  STUDENT: [
    { label: 'LIVE EXPLAINER', value: 'PSEG SPIKED 4PM', visual: 'lines' },
    { label: 'CONCEPT UNLOCKED', value: 'CONGESTION RENT', visual: 'none' },
    { label: "THIS WEEK'S BRIEF", value: '5 EVENTS', visual: 'bars' },
    { label: 'SANDBOX P&L', value: '+$1,240', meta: '7 DAYS', visual: 'sparkline' },
  ],
  DEVELOPER: [
    { label: 'ZONE REVENUE · AEP', value: '$184', meta: '/kW-yr', visual: 'sparkline' },
    { label: 'INTERCONNECT QUEUE', value: '12 PROJECTS', meta: 'NEARBY', visual: 'list' },
    { label: 'CONGESTION PATTERN', value: 'PERSISTENT', meta: '3YR', visual: 'heatmap' },
    { label: 'PPA BENCHMARK', value: '$42-48', meta: '/MWh · SOLAR', visual: 'bars' },
  ],
};

function Sparkline({ color = C.electricBlue, seed = 1 }: { color?: string; seed?: number }) {
  const pts: number[] = [];
  for (let i = 0; i < 20; i++) {
    pts.push(50 + Math.sin(i / 2 + seed) * 15 + Math.cos(i / 3 + seed * 2) * 8);
  }
  const d = pts.map((v, i) => `${i === 0 ? 'M' : 'L'} ${i * 10} ${v}`).join(' ');
  return (
    <svg width="100%" height="40" viewBox="0 0 200 80" preserveAspectRatio="none">
      <path d={d} stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
    </svg>
  );
}
function Bars({ color = C.electricBlue, n = 8 }: { color?: string; n?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'end', gap: 3, height: 40 }}>
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} style={{
          flex: 1,
          height: `${30 + ((i * 37) % 65)}%`,
          background: i % 2 === 0 ? color : 'rgba(255,255,255,0.15)',
          opacity: 0.8,
        }} />
      ))}
    </div>
  );
}
function Heatmap({ color = C.electricBlue }: { color?: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 2, height: 40 }}>
      {Array.from({ length: 24 }).map((_, i) => {
        const v = ((i * 53) % 100) / 100;
        return <div key={i} style={{ background: color, opacity: 0.15 + v * 0.7 }} />;
      })}
    </div>
  );
}
function Gauge({ pct, color = C.electricBlue }: { pct: number; color?: string }) {
  return (
    <div style={{ marginTop: 6, height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, transition: 'width 600ms ease-out' }} />
    </div>
  );
}
function ListMini({ color = C.electricBlue }: { color?: string }) {
  const items: [string, string][] = [['WEST', '+$0.80'], ['AEP', '+$0.40'], ['DOM', '-$0.20'], ['PSEG', '-$0.60'], ['ATSI', '-$1.20']];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {items.map(([a, b], i) => (
        <div key={i} className="flex justify-between" style={{ fontFamily: F.mono, fontSize: 9, color: 'rgba(255,255,255,0.55)' }}>
          <span>{a}</span>
          <span style={{ color: b.startsWith('+') ? color : 'rgba(255,255,255,0.45)' }}>{b}</span>
        </div>
      ))}
    </div>
  );
}
function LinesMini() {
  const lines = ['14:02 · PSEG spike, +$18 over 15m', '14:05 · Salem 2 outage reported', '14:08 · Reserve margin tightening'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {lines.map((l, i) => (
        <div key={i} style={{ fontFamily: F.mono, fontSize: 9, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.04em' }}>
          {l}
        </div>
      ))}
    </div>
  );
}

function MiniCard({ card, index, mode, accent }: { card: Card; index: number; mode: Mode; accent: string }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => setVisible(true), 60 + index * 60);
    return () => clearTimeout(t);
  }, [mode, index]);

  return (
    <div
      style={{
        background: EDITORIAL_SURFACE,
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 6,
        padding: 14,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(6px)',
        transition: 'opacity 200ms ease-out, transform 200ms ease-out',
      }}
    >
      <div style={{ fontFamily: F.mono, fontSize: 9, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.45)' }}>
        {card.label}
      </div>
      {card.value && (
        <div className="flex items-baseline justify-between">
          <span style={{ fontFamily: F.mono, fontSize: 18, color: C.textPrimary }}>{card.value}</span>
          {card.meta && (
            <span style={{ fontFamily: F.mono, fontSize: 9, color: accent, letterSpacing: '0.08em' }}>
              {card.meta}
            </span>
          )}
        </div>
      )}
      <div style={{ flex: 1 }}>
        {card.visual === 'sparkline' && <Sparkline color={accent} seed={index} />}
        {card.visual === 'bars' && <Bars color={accent} />}
        {card.visual === 'heatmap' && <Heatmap color={accent} />}
        {card.visual === 'list' && <ListMini color={accent} />}
        {card.visual === 'lines' && <LinesMini />}
        {card.visual === 'gauge' && <Gauge pct={parseInt(card.value) || 70} color={accent} />}
        {card.visual === 'badge' && (
          <div style={{ display: 'inline-block', padding: '3px 8px', border: `1px solid ${accent}`, color: accent, fontFamily: F.mono, fontSize: 9, letterSpacing: '0.12em', borderRadius: 3 }}>
            {card.meta}
          </div>
        )}
        {card.visual === 'alert' && (
          <div style={{ fontFamily: F.mono, fontSize: 9, color: C.alertCritical, letterSpacing: '0.1em' }}>
            ● {card.meta}
          </div>
        )}
      </div>
    </div>
  );
}

const MODE_ACCENT: Record<Mode, string> = {
  EVERYONE: C.electricBlue,
  TRADER: C.alertCritical,
  ANALYST: C.electricBlue,
  STORAGE: C.fuelBattery,
  INDUSTRIAL: C.falconGold,
  STUDENT: C.alertNormal,
  DEVELOPER: EDITORIAL_DEVELOPER_ACCENT,
};

function CrossFade({ mode, children }: { mode: Mode; children: ReactNode }) {
  const [visible, setVisible] = useState(true);
  const [rendered, setRendered] = useState<ReactNode>(children);
  useEffect(() => {
    setVisible(false);
    const t = setTimeout(() => {
      setRendered(children);
      setVisible(true);
    }, 180);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);
  return (
    <div style={{ opacity: visible ? 1 : 0, transition: 'opacity 200ms ease-out' }}>
      {rendered}
    </div>
  );
}

export function Profiles() {
  const [mode, setMode] = useState<Mode>('EVERYONE');
  const accent = MODE_ACCENT[mode];

  return (
    <section className="relative w-full px-8 py-32" style={{ maxWidth: '1280px', margin: '0 auto' }}>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: '-500px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '1400px',
          height: '1400px',
          background: `radial-gradient(circle at center, ${C.electricBlue} 0%, rgba(0,0,0,0) 65%)`,
          opacity: 0.03,
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          right: '5%',
          top: '60%',
          width: '600px',
          height: '600px',
          transform: 'translateY(-50%)',
          background: `radial-gradient(circle at center, ${MODE_ACCENT[mode]} 0%, rgba(0,0,0,0) 60%)`,
          opacity: 0.08,
          pointerEvents: 'none',
          transition: 'background 400ms ease-out',
        }}
      />
      <div style={{ fontFamily: F.mono, fontSize: 11, letterSpacing: '0.18em', color: C.electricBlue, position: 'relative' }}>
        03 · WHO IT&rsquo;S FOR
      </div>
      <h2 style={{ margin: '20px 0 0 0', fontFamily: F.display, fontSize: 'clamp(48px, 7vw, 72px)', lineHeight: 1.05, letterSpacing: '-0.02em', color: C.textPrimary }}>
        <span style={{ display: 'block' }}>Built for the work</span>
        <span style={{ display: 'block', fontStyle: 'italic', color: 'rgba(255,255,255,0.45)' }}>you actually do.</span>
      </h2>
      <p style={{ marginTop: 24, fontFamily: F.sans, fontSize: 17, lineHeight: 1.55, color: 'rgba(255,255,255,0.55)', maxWidth: 580 }}>
        These are starting points. Every view, every alert, every feature configures around what you do.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-3" style={{ marginTop: 80 }}>
        {MODES.map((m, i) => (
          <div key={m} className="flex items-center gap-2">
            <button
              onMouseEnter={() => setMode(m)}
              onClick={() => setMode(m)}
              style={{
                position: 'relative',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '6px 2px',
                fontFamily: F.mono,
                fontSize: 13,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: mode === m ? C.textPrimary : 'rgba(255,255,255,0.35)',
                transition: 'color 150ms ease-out',
              }}
            >
              {m}
              <span
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: -6,
                  height: 1,
                  background: mode === m ? accent : 'transparent',
                  transform: mode === m ? 'scaleX(1)' : 'scaleX(0)',
                  transformOrigin: 'center',
                  transition: 'transform 150ms ease-out, background 200ms',
                }}
              />
            </button>
            {i < MODES.length - 1 && <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>}
          </div>
        ))}
      </div>

      <div
        className="mt-20 grid gap-8 md:grid-cols-2"
        style={{
          background: 'transparent',
          minHeight: 480,
        }}
      >
        <div style={{ padding: '24px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 480 }}>
          <CrossFade mode={mode}>
            <div style={{ fontFamily: F.display, fontStyle: 'italic', fontSize: 28, lineHeight: 1.3, color: C.textPrimary, letterSpacing: '-0.01em' }}>
              &ldquo;{QUOTES[mode]}&rdquo;
            </div>
            <div style={{ marginTop: 24, fontFamily: F.sans, fontSize: 17, lineHeight: 1.7, color: 'rgba(255,255,255,0.72)' }}>
              {CAPS[mode]}
            </div>
            <div style={{ marginTop: 40, fontFamily: F.mono, fontSize: 11, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.45)' }}>
              CURRENT VIEW · <span style={{ color: accent }}>{mode}</span>
            </div>
          </CrossFade>
        </div>

        <div
          style={{
            background: EDITORIAL_SURFACE_RAISED,
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: R.lg,
            minHeight: 480,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: `0 40px 80px -40px ${accent}22`,
            transition: 'box-shadow 400ms ease-out',
          }}
        >
          <div className="flex items-center justify-between" style={{ height: 36, padding: '0 14px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <span key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.25)' }} />
              ))}
            </div>
            <div style={{ fontFamily: F.mono, fontSize: 10, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.14em' }}>
              GRIDALPHA TERMINAL
            </div>
            <div className="flex items-center gap-1.5" style={{ fontFamily: F.mono, fontSize: 10, color: C.alertNormal, letterSpacing: '0.14em' }}>
              <span className="relative inline-flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full" style={{ background: C.alertNormal, opacity: 0.7 }} />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: C.alertNormal }} />
              </span>
              LIVE
            </div>
          </div>
          <div className="grid flex-1" style={{ gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 12, padding: 16 }}>
            {CARDS[mode].map((c, i) => (
              <MiniCard key={`${mode}-${i}`} card={c} index={i} mode={mode} accent={accent} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
