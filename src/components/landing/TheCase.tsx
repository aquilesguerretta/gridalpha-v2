import type { CSSProperties } from 'react';
import { C, F } from '@/design/tokens';
import { Reveal, useInViewOnce, useReducedMotion } from './Reveal';

const ROWS: [string, string, string, string][] = [
  ['Real-time LMP across the continental US', '✓', '✓', 'delayed'],
  ['All 20 PJM zones with full components', '✓', '✓', 'partial'],
  ['Spark spread, live with heat rate inputs', '✓', '✓', '—'],
  ['Battery arbitrage engine', '✓', '—', '—'],
  ['AI news analysis on dispatch events', '✓', '—', '—'],
  ['Historical database with export', '✓', '✓', '—'],
  ['Configurable alerts, browser and mobile', '✓', '✓', '—'],
  ['Asset optimization simulator', '✓', '—', '—'],
  ['Free tier for students', '✓', '—', '✓'],
  ['Monthly price', 'from $0', 'institutional', 'free'],
];

const headerCell: CSSProperties = {
  fontFamily: F.mono,
  fontSize: 11,
  letterSpacing: '0.14em',
  padding: '14px 16px',
  textAlign: 'left',
};

function Row({ r, index }: { r: typeof ROWS[number]; index: number }) {
  const { ref, inView } = useInViewOnce<HTMLTableRowElement>(0.1);
  const reduced = useReducedMotion();
  const active = reduced ? true : inView;

  const cellBase: CSSProperties = {
    padding: '16px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    transition: 'background 150ms ease-out',
  };

  const marks = [r[1], r[2], r[3]];
  const renderMark = (m: string) => {
    if (m === '✓') return <span style={{ fontFamily: F.mono, fontSize: 16, color: C.alertNormal }}>✓</span>;
    if (m === '—') return <span style={{ fontFamily: F.mono, fontSize: 16, color: 'rgba(255,255,255,0.25)' }}>—</span>;
    return <span style={{ fontFamily: F.mono, fontSize: 13, color: 'rgba(255,255,255,0.72)' }}>{m}</span>;
  };

  return (
    <tr
      ref={ref}
      className="group"
      style={{
        opacity: active ? 1 : 0,
        transform: active ? 'translateY(0)' : 'translateY(8px)',
        transition: reduced ? 'none' : `opacity 400ms ease-out ${index * 80}ms, transform 400ms ease-out ${index * 80}ms`,
      }}
    >
      <td
        style={{
          ...cellBase,
          fontFamily: F.sans,
          fontSize: 15,
          color: C.textPrimary,
          width: '40%',
        }}
        className="group-hover:bg-white/[0.02]"
      >
        {r[0]}
      </td>
      <td style={{ ...cellBase, background: 'rgba(59,130,246,0.04)', textAlign: 'center' }} className="group-hover:bg-white/[0.02]">
        <div style={{ display: 'flex', justifyContent: 'center' }}>{renderMark(marks[0])}</div>
      </td>
      <td style={{ ...cellBase, textAlign: 'center' }} className="group-hover:bg-white/[0.02]">
        {renderMark(marks[1])}
      </td>
      <td style={{ ...cellBase, textAlign: 'center' }} className="group-hover:bg-white/[0.02]">
        {renderMark(marks[2])}
      </td>
    </tr>
  );
}

export function TheCase() {
  return (
    <section className="relative w-full px-8 py-32" style={{ maxWidth: '1280px', margin: '0 auto' }}>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '-200px',
          right: '-300px',
          width: '1200px',
          height: '1200px',
          background: `radial-gradient(circle at center, ${C.electricBlue} 0%, rgba(0,0,0,0) 65%)`,
          opacity: 0.03,
          pointerEvents: 'none',
        }}
      />
      <Reveal>
        <div style={{ fontFamily: F.mono, fontSize: 11, letterSpacing: '0.18em', color: C.electricBlue }}>
          05 · THE CASE
        </div>
      </Reveal>
      <Reveal delay={120}>
        <h2 style={{ margin: '20px 0 0 0', fontFamily: F.display, fontSize: 'clamp(40px, 5.5vw, 64px)', lineHeight: 1.05, letterSpacing: '-0.02em', color: C.textPrimary }}>
          <span style={{ display: 'block' }}>The professional view.</span>
          <span style={{ display: 'block', fontStyle: 'italic', color: 'rgba(255,255,255,0.45)' }}>
            At an independent&rsquo;s price.
          </span>
        </h2>
      </Reveal>
      <Reveal delay={240}>
        <p style={{ marginTop: 24, fontFamily: F.sans, fontSize: 17, lineHeight: 1.55, color: 'rgba(255,255,255,0.55)', maxWidth: 580 }}>
          What other platforms gatekeep behind institutional contracts, GridAlpha delivers
          live, continuously, to anyone who needs it.
        </p>
      </Reveal>

      <div style={{ marginTop: 64, position: 'relative' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...headerCell, color: 'rgba(255,255,255,0.35)' }}>CAPABILITY</th>
              <th style={{ ...headerCell, color: C.electricBlue, textAlign: 'center', background: 'rgba(59,130,246,0.04)' }}>GridAlpha</th>
              <th style={{ ...headerCell, color: 'rgba(255,255,255,0.45)', textAlign: 'center' }}>Institutional terminals</th>
              <th style={{ ...headerCell, color: 'rgba(255,255,255,0.45)', textAlign: 'center' }}>Free aggregators</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r, i) => <Row key={r[0]} r={r} index={i} />)}
          </tbody>
        </table>
      </div>
    </section>
  );
}
