import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { C, F, R } from '@/design/tokens';
import { EDITORIAL_SURFACE_RAISED } from '@/design/editorial';

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

/* ───────────────────── Widget: Terminal Sparkline ───────────────────── */

function TerminalWidget() {
  const [points, setPoints] = useState<number[]>(() => {
    const seed: number[] = [];
    for (let i = 0; i < 24; i++) seed.push(40 + Math.sin(i / 3) * 12 + (Math.random() - 0.5) * 6);
    return seed;
  });

  useEffect(() => {
    const id = setInterval(() => {
      setPoints((p) => {
        const next = p.slice(1);
        const last = p[p.length - 1];
        next.push(last + (Math.random() - 0.48) * 6);
        return next;
      });
    }, 2000);
    return () => clearInterval(id);
  }, []);

  const W = 320, H = 90;
  const min = Math.min(...points), max = Math.max(...points);
  const norm = (v: number) => H - ((v - min) / (max - min || 1)) * H;
  const step = W / (points.length - 1);
  const pathPoints = points.map((v, i) => ({ x: i * step, y: norm(v) }));
  const pathD = toSmoothPath(pathPoints);
  const lastX = (points.length - 1) * step;
  const lastY = norm(points[points.length - 1]);

  return (
    <div style={widgetStyle}>
      <div className="flex items-center justify-between">
        <span style={labelTiny}>WEST HUB</span>
        <span className="flex items-center gap-2" style={{ ...labelTiny, color: C.alertNormal }}>
          <span className="relative inline-flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full" style={{ background: C.alertNormal, opacity: 0.7 }} />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: C.alertNormal }} />
          </span>
          LIVE
        </span>
      </div>
      <div style={{ marginTop: 8, fontFamily: F.mono, fontSize: 32, color: C.textPrimary, letterSpacing: '-0.01em' }}>
        $42.80
      </div>
      <div style={{ fontFamily: F.mono, fontSize: 12, color: C.falconGold, marginTop: 2 }}>
        ▲ 2.40 (+5.9%)
      </div>

      <div style={{ marginTop: 12, flex: 1, position: 'relative' }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="spark-fade" x1="0" x2="1">
              <stop offset="0" stopColor={C.electricBlue} stopOpacity="0" />
              <stop offset="0.3" stopColor={C.electricBlue} stopOpacity="1" />
              <stop offset="1" stopColor={C.electricBlue} stopOpacity="1" />
            </linearGradient>
          </defs>
          <path
            d={pathD}
            fill="none"
            stroke="url(#spark-fade)"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            style={{ transition: 'd 1800ms ease-out' }}
          />
          <circle cx={lastX} cy={lastY} r="3" fill={C.electricBlue}>
            <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>

      <div className="flex justify-between" style={{ marginTop: 10, fontFamily: F.mono, fontSize: 9, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em' }}>
        <span>ENERGY  $39.20</span>
        <span>CONGESTION  +$3.40</span>
        <span>LOSS  +$0.20</span>
      </div>
    </div>
  );
}

function toSmoothPath(points: Array<{ x: number; y: number }>) {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    const prev = points[i - 2] ?? p0;
    const next = points[i + 1] ?? p1;

    // Catmull-Rom to Bezier conversion gives a smooth, chart-like curve.
    const cp1x = p0.x + (p1.x - prev.x) / 6;
    const cp1y = p0.y + (p1.y - prev.y) / 6;
    const cp2x = p1.x - (next.x - p0.x) / 6;
    const cp2y = p1.y - (next.y - p0.y) / 6;

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
  }
  return d;
}

/* ───────────────────── Widget: SOC Gauge ───────────────────── */

function SimulateWidget() {
  const [soc, setSoc] = useState(15);
  const [rev, setRev] = useState(2847);
  const socRef = useRef(15);
  const dirRef = useRef<1 | -1>(1);
  const pauseRef = useRef(0);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (pauseRef.current > 0) {
        pauseRef.current -= dt;
      } else {
        const speed = 70 / 4;
        socRef.current += dirRef.current * speed * dt;
        if (dirRef.current === 1 && socRef.current >= 85) {
          socRef.current = 85;
          dirRef.current = -1;
          pauseRef.current = 2;
        } else if (dirRef.current === -1 && socRef.current <= 15) {
          socRef.current = 15;
          dirRef.current = 1;
          pauseRef.current = 2;
        }
      }
      setSoc(Math.round(socRef.current));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setRev((r) => r + Math.floor(1 + Math.random() * 5)), 2000);
    return () => clearInterval(id);
  }, []);

  const RADIUS = 60, CX = 70, CY = 70;
  const startAngle = 135;
  const sweep = 270;
  const toXY = (ang: number) => {
    const rad = (ang * Math.PI) / 180;
    return [CX + RADIUS * Math.cos(rad), CY + RADIUS * Math.sin(rad)];
  };
  const [sx, sy] = toXY(startAngle);
  const [ex, ey] = toXY(startAngle + sweep);
  const bgPath = `M ${sx} ${sy} A ${RADIUS} ${RADIUS} 0 1 1 ${ex} ${ey}`;
  const filledSweep = sweep * (soc / 100);
  const [fex, fey] = toXY(startAngle + filledSweep);
  const largeArc = filledSweep > 180 ? 1 : 0;
  const fillPath = `M ${sx} ${sy} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${fex} ${fey}`;

  return (
    <div style={widgetStyle}>
      <div style={{ ...labelTiny, textAlign: 'center' }}>BATTERY  ·  100MW / 400MWh</div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="140" height="140" viewBox="0 0 140 140">
          <path d={bgPath} stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="none" />
          <path d={fillPath} stroke={C.falconGold} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <text x="70" y="72" textAnchor="middle" style={{ fontFamily: F.mono, fontSize: 22, fill: C.textPrimary }}>
            {soc}%
          </text>
          <text x="70" y="90" textAnchor="middle" style={{ fontFamily: F.mono, fontSize: 9, fill: 'rgba(255,255,255,0.45)', letterSpacing: '0.14em' }}>
            SOC
          </text>
        </svg>
      </div>
      <div className="flex items-center justify-between">
        <span style={labelTiny}>TODAY&rsquo;S REVENUE</span>
        <span style={{ fontFamily: F.mono, fontSize: 14, color: C.alertNormal }}>
          ${rev.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

/* ───────────────────── Widget: Concept Map ───────────────────── */

type CNode = { id: string; x: number; y: number; tier: 1 | 2 | 3 };
const CNODES: CNode[] = [
  { id: 'Electricity markets', x: 80, y: 360, tier: 1 },
  { id: 'LMP', x: 170, y: 280, tier: 1 },
  { id: 'Dispatch', x: 80, y: 200, tier: 1 },
  { id: 'Generation', x: 200, y: 380, tier: 1 },
  { id: 'Congestion', x: 300, y: 220, tier: 2 },
  { id: 'Spark spread', x: 280, y: 340, tier: 2 },
  { id: 'Capacity markets', x: 380, y: 360, tier: 2 },
  { id: 'Ancillary services', x: 400, y: 140, tier: 2 },
  { id: 'FTR auctions', x: 520, y: 80, tier: 3 },
  { id: 'Battery dispatch', x: 500, y: 260, tier: 3 },
  { id: 'Revenue attribution', x: 520, y: 380, tier: 3 },
];
const CEDGES: [string, string][] = [
  ['Electricity markets', 'LMP'],
  ['Electricity markets', 'Dispatch'],
  ['Electricity markets', 'Generation'],
  ['LMP', 'Dispatch'],
  ['LMP', 'Congestion'],
  ['LMP', 'Spark spread'],
  ['Generation', 'Capacity markets'],
  ['Dispatch', 'Ancillary services'],
  ['Congestion', 'FTR auctions'],
  ['Spark spread', 'Battery dispatch'],
  ['Capacity markets', 'Revenue attribution'],
  ['Ancillary services', 'Revenue attribution'],
  ['Battery dispatch', 'Revenue attribution'],
];

const LIGHT_TIMING: Record<string, number> = {
  'Electricity markets': 0,
  'LMP': 300,
  'Dispatch': 600,
  'Generation': 900,
  'Congestion': 1200,
  'Spark spread': 1600,
  'Capacity markets': 2000,
  'Ancillary services': 2400,
  'FTR auctions': 2800,
  'Battery dispatch': 3200,
  'Revenue attribution': 3600,
};

function LearnWidget() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [lit, setLit] = useState<Set<string>>(new Set());
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
  }, []);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    let timeouts: ReturnType<typeof setTimeout>[] = [];
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (reduced) {
            setLit(new Set(Object.keys(LIGHT_TIMING)));
            return;
          }
          setLit(new Set());
          timeouts = Object.entries(LIGHT_TIMING).map(([id, delay]) =>
            setTimeout(() => setLit((p) => new Set(p).add(id)), delay),
          );
        } else {
          timeouts.forEach(clearTimeout);
          timeouts = [];
          setLit(new Set());
        }
      },
      { threshold: 0.35 },
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      timeouts.forEach(clearTimeout);
    };
  }, [reduced]);

  const byId = (id: string) => CNODES.find((n) => n.id === id)!;
  const nodeLit = (id: string) => lit.has(id);
  const edgeLit = (a: string, b: string) => lit.has(a) && lit.has(b);

  return (
    <div ref={ref} style={{ position: 'relative', width: '100%', maxWidth: 560 }}>
      <div
        style={{
          position: 'absolute',
          left: 20,
          top: -8,
          fontFamily: F.mono,
          fontSize: 10,
          letterSpacing: '0.14em',
          color: 'rgba(255,255,255,0.35)',
        }}
      >
        CONCEPT MAP · 11 CORE CONCEPTS
      </div>
      <svg width="100%" viewBox="0 0 560 440" style={{ display: 'block', marginTop: 20 }}>
        {CEDGES.map(([a, b]) => {
          const na = byId(a), nb = byId(b);
          const on = edgeLit(a, b);
          return (
            <line
              key={a + b}
              x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
              stroke={on ? 'rgba(16,185,129,0.35)' : 'rgba(255,255,255,0.10)'}
              strokeWidth="1"
              style={{ transition: 'stroke 400ms ease-out' }}
            />
          );
        })}
        {CNODES.map((n) => {
          const on = nodeLit(n.id);
          return (
            <g key={n.id}>
              {on && (
                <circle cx={n.x} cy={n.y} r="20" fill="none" stroke="rgba(16,185,129,0.2)" strokeWidth="1">
                  <animate attributeName="r" values="10;22;10" dur="3s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.6;0;0.6" dur="3s" repeatCount="indefinite" />
                </circle>
              )}
              <circle
                cx={n.x} cy={n.y} r="10"
                fill={on ? C.alertNormal : 'transparent'}
                stroke={on ? C.alertNormal : 'rgba(255,255,255,0.25)'}
                strokeWidth="1.5"
                style={{ transition: 'fill 400ms ease-out, stroke 400ms ease-out' }}
              />
              <text
                x={n.x} y={n.y + 26}
                textAnchor="middle"
                style={{
                  fontFamily: F.mono,
                  fontSize: 10,
                  fill: on ? C.textPrimary : 'rgba(255,255,255,0.55)',
                  transition: 'fill 400ms ease-out',
                  letterSpacing: '0.04em',
                }}
              >
                {n.id}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ───────────────────── Block shell ───────────────────── */

const widgetStyle: CSSProperties = {
  width: '360px',
  maxWidth: '100%',
  height: '240px',
  background: EDITORIAL_SURFACE_RAISED,
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: R.lg,
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
};

const labelTiny: CSSProperties = {
  fontFamily: F.mono,
  fontSize: 10,
  color: 'rgba(255,255,255,0.45)',
  letterSpacing: '0.14em',
};

type BlockProps = {
  eyebrow: string;
  eyebrowColor: string;
  title: string;
  body: string;
  link: string;
  linkColor: string;
  widget: ReactNode;
  reverse?: boolean;
  haloColor: string;
  haloSize?: number;
};

function Block({ eyebrow, eyebrowColor, title, body, link, linkColor, widget, reverse, haloColor, haloSize = 600 }: BlockProps) {
  const sectionGlow = 1000;
  const elementHalo = haloSize;
  const { ref, inView } = useInView<HTMLDivElement>(0.2);
  return (
    <div
      ref={ref}
      className={`relative flex flex-col items-center gap-12 py-24 md:gap-20 md:py-32 ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'}`}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 600ms ease-out, transform 600ms ease-out',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '50%',
          [reverse ? 'left' : 'right']: '8%',
          transform: 'translateY(-50%)',
          width: `${sectionGlow}px`,
          height: `${sectionGlow}px`,
          background: `radial-gradient(circle at center, ${haloColor} 0%, rgba(0,0,0,0) 65%)`,
          opacity: 0.04,
          pointerEvents: 'none',
          zIndex: 0,
        } as CSSProperties}
      />
      <div className="flex-[1.4]" style={{ maxWidth: '520px' }}>
        <div style={{ fontFamily: F.mono, fontSize: 11, letterSpacing: '0.18em', color: eyebrowColor }}>
          {eyebrow}
        </div>
        <h3 style={{ margin: '16px 0 0 0', fontFamily: F.display, fontStyle: 'italic', fontSize: 'clamp(36px, 4.5vw, 48px)', lineHeight: 1.1, letterSpacing: '-0.01em', color: C.textPrimary }}>
          {title}
        </h3>
        <p style={{ marginTop: 24, fontFamily: F.sans, fontSize: 17, lineHeight: 1.7, color: 'rgba(255,255,255,0.72)' }}>
          {body}
        </p>
        <a href="#" className="group inline-flex items-center gap-2" style={{ marginTop: 24, fontFamily: F.sans, fontSize: 15, color: linkColor, textDecoration: 'none' }}>
          <span>{link}</span>
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </a>
      </div>
      <div className="relative flex flex-1 justify-center md:justify-start" style={{ ...(reverse ? { justifyContent: 'flex-end' } : { justifyContent: 'flex-start' }), zIndex: 1 }}>
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: `${elementHalo}px`,
            height: `${elementHalo}px`,
            background: `radial-gradient(circle at center, ${haloColor} 0%, rgba(0,0,0,0) 60%)`,
            opacity: 0.08,
            pointerEvents: 'none',
            zIndex: -1,
          }}
        />
        {widget}
      </div>
    </div>
  );
}

export function Stack() {
  return (
    <section className="relative w-full px-8 py-32" style={{ maxWidth: '1280px', margin: '0 auto' }}>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '-200px',
          left: '-300px',
          width: '1200px',
          height: '1200px',
          background: `radial-gradient(circle at center, ${C.electricBlue} 0%, rgba(0,0,0,0) 65%)`,
          opacity: 0.03,
          pointerEvents: 'none',
        }}
      />
      <div style={{ fontFamily: F.mono, fontSize: 11, letterSpacing: '0.18em', color: C.electricBlue }}>
        02 · THE STACK
      </div>
      <h2 style={{ margin: '20px 0 0 0', fontFamily: F.display, fontSize: 'clamp(48px, 7vw, 72px)', lineHeight: 1.05, letterSpacing: '-0.02em', color: C.textPrimary }}>
        <span style={{ display: 'block' }}>Three products.</span>
        <span style={{ display: 'block', fontStyle: 'italic', color: 'rgba(255,255,255,0.45)' }}>One grid.</span>
      </h2>
      <div style={{ marginTop: 16, fontFamily: F.mono, fontSize: 12, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.18em' }}>
        ONE PLATFORM · THREE LAYERS
      </div>

      <Block
        eyebrow="01 · TERMINAL · LIVE"
        eyebrowColor={C.electricBlue}
        title="Live market intelligence."
        body="Real-time LMP across the continental US. Spark spread, battery arbitrage, generation mix, congestion components, and the Peregrine Intelligence feed with built-in analysis. The professional market view at an independent's price."
        link="Open the Terminal →"
        linkColor={C.electricBlue}
        haloColor={C.electricBlue}
        haloSize={600}
        widget={<TerminalWidget />}
      />
      <Block
        reverse
        eyebrow="02 · SIMULATE · Q3 2026"
        eyebrowColor={C.falconGold}
        title="Every asset, modeled."
        body="Register a battery, a solar site, an industrial load, or a full portfolio. Simulate runs day-ahead bid optimization, revenue attribution by service type, tariff arbitrage, degradation versus revenue tradeoffs, and hedge backtests against live and historical data. The optimizer desk inside the terminal."
        link="Join the waitlist →"
        linkColor={C.falconGold}
        haloColor={C.falconGold}
        haloSize={600}
        widget={<SimulateWidget />}
      />
      <Block
        eyebrow="03 · LEARN · FREE FOREVER"
        eyebrowColor={C.alertNormal}
        title="Markets made legible."
        body="A live explainer that narrates dispatch events as they happen. A historical sandbox for building intuition against real data. A concept map that unlocks with use. An interview prep mode that turns this week into a briefing."
        link="Start learning →"
        linkColor={C.alertNormal}
        haloColor={C.alertNormal}
        haloSize={800}
        widget={<LearnWidget />}
      />
    </section>
  );
}
