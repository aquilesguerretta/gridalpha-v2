import { useEffect, useMemo, useRef, useState } from 'react';
import { C, F } from '@/design/tokens';

const LABELS = [
  'CSV', 'PDF', 'FERC FILING', 'EIA-930', 'PJM EXPORT',
  'UTILITY TARIFF', 'POWERPOINT', 'EMAIL THREAD', 'SPREADSHEET',
  'API DOC', 'OUTAGE REPORT', 'LOAD FORECAST', 'MAP BOOK',
  'SCADA LOG', 'AUCTION RESULT', 'FTR REPORT', 'WEATHER FEED',
  'SETTLEMENT', 'HEAT RATE TABLE', 'CAPACITY FILING',
];

type Frag = {
  label: string;
  x: number; y: number;
  w: number; h: number;
  dx: number; dy: number;
  period: number;
  phase: number;
};

function hash(n: number) {
  const x = Math.sin(n * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

export function Wedge() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [resolve, setResolve] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const h = () => setReducedMotion(mq.matches);
    mq.addEventListener?.('change', h);
    return () => mq.removeEventListener?.('change', h);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.max(0, Math.min(1, (vh - r.bottom + vh * 0.3) / vh));
      setResolve(p);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const frags: Frag[] = useMemo(() => {
    return LABELS.map((label, i) => {
      const r1 = hash(i + 1);
      const r2 = hash(i + 100);
      const r3 = hash(i + 200);
      const r4 = hash(i + 300);
      const r5 = hash(i + 400);
      return {
        label,
        x: 6 + r1 * 80,
        y: 6 + r2 * 82,
        w: 90 + r3 * 50,
        h: 24 + r4 * 8,
        dx: (r5 - 0.5) * 40,
        dy: (hash(i + 500) - 0.5) * 40,
        period: 8 + r1 * 6,
        phase: r2 * 10,
      };
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{ height: '100vh', minHeight: '720px' }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '-400px',
          right: '-400px',
          width: '1200px',
          height: '1200px',
          background: `radial-gradient(circle at center, ${C.electricBlue} 0%, rgba(0,0,0,0) 65%)`,
          opacity: 0.03,
          pointerEvents: 'none',
        }}
      />
      <div className="grid h-full w-full grid-cols-1 md:grid-cols-2">
        <div className="relative overflow-hidden" style={{ borderRight: '1px solid rgba(255,255,255,0.04)' }}>
          {frags.map((f, i) => {
            const stagger = i * 20;
            const progress = Math.max(0, Math.min(1, resolve));
            const targetX = 50;
            const targetY = 92;
            const curX = f.x + (targetX - f.x) * progress;
            const curY = f.y + (targetY - f.y) * progress;
            const labelOpacity = Math.max(0, 1 - progress * 1.6);
            const boxOpacity = Math.max(0, 1 - progress * 1.4);

            return (
              <div
                key={f.label}
                style={{
                  position: 'absolute',
                  left: `${curX}%`,
                  top: `${curY}%`,
                  width: `${f.w}px`,
                  height: `${f.h}px`,
                  transform: 'translate(-50%, -50%)',
                  opacity: boxOpacity,
                  transition: reducedMotion
                    ? 'none'
                    : `left 400ms ease-out ${stagger}ms, top 400ms ease-out ${stagger}ms, opacity 400ms ease-out ${stagger}ms`,
                  pointerEvents: 'none',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    border: '1px solid rgba(255,255,255,0.12)',
                    background: 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 10px',
                    fontFamily: F.mono,
                    fontSize: '10px',
                    letterSpacing: '0.12em',
                    color: 'rgba(255,255,255,0.55)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    willChange: 'transform',
                    animation: reducedMotion
                      ? 'none'
                      : `ga-drift-${i} ${f.period}s ease-in-out ${-f.phase}s infinite`,
                  }}
                >
                  <span style={{ opacity: labelOpacity, transition: 'opacity 300ms' }}>{f.label}</span>
                </div>
              </div>
            );
          })}

          <div
            style={{
              position: 'absolute',
              left: '10%',
              right: '10%',
              bottom: '8%',
              height: '1px',
              background: 'rgba(255,255,255,0.25)',
              transform: `scaleX(${Math.max(0, (resolve - 0.5) * 2)})`,
              transformOrigin: 'center',
              transition: reducedMotion ? 'none' : 'transform 500ms ease-out',
            }}
          />

          <style>{frags.map((f, i) => `
            @keyframes ga-drift-${i} {
              0%, 100% { transform: translate(0px, 0px); }
              50% { transform: translate(${f.dx}px, ${f.dy}px); }
            }
          `).join('\n')}</style>
        </div>

        <div className="relative flex items-center" style={{ padding: '0 clamp(32px, 6vw, 96px)' }}>
          <div style={{ maxWidth: '520px' }}>
            <div
              style={{
                fontFamily: F.mono,
                fontSize: '11px',
                letterSpacing: '0.18em',
                color: C.electricBlue,
              }}
            >
              01 · THE WEDGE
            </div>
            <h2
              style={{
                margin: '20px 0 0 0',
                fontFamily: F.display,
                fontSize: 'clamp(48px, 6vw, 72px)',
                lineHeight: 1.05,
                letterSpacing: '-0.02em',
                color: C.textPrimary,
              }}
            >
              Energy runs on fragments.
            </h2>
            <p
              style={{
                fontFamily: F.sans,
                fontSize: '17px',
                lineHeight: 1.7,
                color: 'rgba(255,255,255,0.72)',
                marginTop: '32px',
              }}
            >
              The largest industry on earth coordinates itself through CSV
              exports, legacy terminals, and PDFs emailed between analysts.
              The trader watching the morning print. The operator running a
              battery. The industrial buyer carrying a seven-figure bill. All
              stitching together the same public data by hand.
            </p>
            <p
              style={{
                fontFamily: F.display,
                fontStyle: 'italic',
                fontSize: '22px',
                lineHeight: 1.4,
                color: 'rgba(255,255,255,0.92)',
                marginTop: '28px',
              }}
            >
              GridAlpha is the live layer that was missing.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
