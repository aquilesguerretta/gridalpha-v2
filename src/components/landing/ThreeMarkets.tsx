import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { C, F } from '@/design/tokens';

function useInView<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => e.isIntersecting && setInView(true), { threshold });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function DotGrid({ liveIndices }: { liveIndices?: number[] }) {
  const cols = 18, rows = 14;
  const lerp = (a: number[], b: number[], t: number) =>
    [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const BLUE = [59, 130, 246];
  const AMBER = [245, 158, 11];

  const dots = useMemo(() => {
    const arr: { i: number; x: number; y: number }[] = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      arr.push({ i: r * cols + c, x: c, y: r });
    }
    return arr;
  }, []);

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${cols * 8} ${rows * 8}`} preserveAspectRatio="xMidYMid meet">
      {dots.map((d) => {
        const live = liveIndices?.indexOf(d.i) ?? -1;
        const isLive = live >= 0;
        if (!isLive) {
          return <circle key={d.i} cx={d.x * 8 + 4} cy={d.y * 8 + 4} r="1.5" fill="rgba(255,255,255,0.15)" />;
        }
        const t = (live % 20) / 19;
        const [r, g, b] = lerp(BLUE, AMBER, t);
        const delay = (live * 137) % 3000;
        return (
          <circle key={d.i} cx={d.x * 8 + 4} cy={d.y * 8 + 4} r="1.8" fill={`rgb(${r},${g},${b})`}>
            <animate attributeName="opacity" values="0.4;1;0.4" dur="3s" begin={`-${delay}ms`} repeatCount="indefinite" />
            <animate attributeName="r" values="1.5;2.4;1.5" dur="3s" begin={`-${delay}ms`} repeatCount="indefinite" />
          </circle>
        );
      })}
    </svg>
  );
}

type Region = {
  label: string;
  statusRight: ReactNode;
  title: string;
  body: string;
  liveIndices?: number[];
};

const US_LIVE = Array.from({ length: 20 }).map((_, i) => ((i * 13 + 7) % (18 * 14)));

const REGIONS: Region[] = [
  {
    label: 'UNITED STATES',
    statusRight: (
      <span className="inline-flex items-center gap-2" style={{ fontFamily: F.mono, fontSize: 11, color: C.alertNormal, letterSpacing: '0.14em' }}>
        <span className="relative inline-flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full" style={{ background: C.alertNormal, opacity: 0.7 }} />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: C.alertNormal }} />
        </span>
        LIVE NOW
      </span>
    ),
    title: 'Peregrine Falcon',
    body: 'Continental US. PJM live across 20 zones and 13 states. MISO, ERCOT, and CAISO on the roadmap.',
    liveIndices: US_LIVE,
  },
  {
    label: 'BRASIL',
    statusRight: <span style={{ fontFamily: F.mono, fontSize: 11, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.14em' }}>Q4 2026</span>,
    title: 'Jaguar',
    body: 'ONS and CCEE coverage. Subsistemas NE, N, SE, and S. PLD spot pricing, reservoir tracking, thermal dispatch economics.',
  },
  {
    label: 'CHINA',
    statusRight: <span style={{ fontFamily: F.mono, fontSize: 11, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.14em' }}>ROADMAP</span>,
    title: 'Dragon',
    body: 'Provincial spot markets. Industrial demand patterns. Coal-to-renewable transition, cross-border flow tracking.',
  },
];

function RegionBlock({ r, index }: { r: Region; index: number }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.25);
  return (
    <div
      ref={ref}
      className="grid items-center"
      style={{
        padding: '48px 80px',
        gridTemplateColumns: '160px 1fr',
        gap: '48px',
        borderTop: index === 0 ? 'none' : '1px solid rgba(255,255,255,0.06)',
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(16px)',
        transition: `opacity 600ms ease-out ${index * 80}ms, transform 600ms ease-out ${index * 80}ms`,
      }}
    >
      <div style={{ width: 160, height: 120, opacity: 0.8, position: 'relative' }}>
        {r.liveIndices && (
          <div
            aria-hidden
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: 900,
              height: 900,
              background: `radial-gradient(circle at center, ${C.electricBlue} 0%, rgba(0,0,0,0) 60%)`,
              opacity: 0.08,
              pointerEvents: 'none',
              zIndex: -1,
            }}
          />
        )}
        <DotGrid liveIndices={r.liveIndices} />
      </div>
      <div>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <span style={{ fontFamily: F.mono, fontSize: 11, color: C.textPrimary, letterSpacing: '0.12em' }}>
            {r.label}
          </span>
          {r.statusRight}
        </div>
        <div style={{ marginTop: 8, fontFamily: F.display, fontStyle: 'italic', fontSize: 'clamp(32px, 4vw, 40px)', color: C.textPrimary, letterSpacing: '-0.01em' }}>
          {r.title}
        </div>
        <p style={{ marginTop: 16, fontFamily: F.sans, fontSize: 16, lineHeight: 1.7, color: 'rgba(255,255,255,0.72)', maxWidth: 640 }}>
          {r.body}
        </p>
      </div>
    </div>
  );
}

export function ThreeMarkets() {
  return (
    <section className="relative w-full overflow-hidden" style={{ maxWidth: '1280px', margin: '0 auto', padding: '128px 0' }}>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '-300px',
          right: '-300px',
          width: '1200px',
          height: '1200px',
          background: `radial-gradient(circle at center, ${C.electricBlue} 0%, rgba(0,0,0,0) 65%)`,
          opacity: 0.03,
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: '-300px',
          left: '-300px',
          width: '1100px',
          height: '1100px',
          background: `radial-gradient(circle at center, ${C.falconGold} 0%, rgba(0,0,0,0) 65%)`,
          opacity: 0.02,
          pointerEvents: 'none',
        }}
      />
      <div style={{ padding: '0 80px', position: 'relative' }}>
        <div style={{ fontFamily: F.mono, fontSize: 11, letterSpacing: '0.18em', color: C.electricBlue }}>
          04 · THE VISION
        </div>
        <h2 style={{ margin: '20px 0 64px 0', fontFamily: F.display, fontSize: 'clamp(48px, 7vw, 72px)', lineHeight: 1.05, letterSpacing: '-0.02em', color: C.textPrimary }}>
          <span style={{ display: 'block' }}>Three markets.</span>
          <span style={{ display: 'block', fontStyle: 'italic', color: 'rgba(255,255,255,0.45)' }}>One intelligence layer.</span>
        </h2>
      </div>

      <div>
        {REGIONS.map((r, i) => <RegionBlock key={r.label} r={r} index={i} />)}
      </div>
    </section>
  );
}
