import { Link } from 'react-router-dom';
import { C, F, R } from '@/design/tokens';
import { Reveal } from './Reveal';

export function FinalCta() {
  return (
    <section
      className="relative flex w-full flex-col items-center justify-center px-8 text-center"
      style={{ height: '80vh', minHeight: 640 }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 1600,
          height: 1600,
          background: `radial-gradient(circle at center, ${C.electricBlue} 0%, rgba(0,0,0,0) 65%)`,
          opacity: 0.06,
          pointerEvents: 'none',
        }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Reveal>
          <div style={{ fontFamily: F.mono, fontSize: 11, letterSpacing: '0.18em', color: C.electricBlue }}>
            07 · OPEN THE TERMINAL
          </div>
        </Reveal>
        <Reveal delay={120}>
          <h2 style={{ margin: '24px 0 0 0', fontFamily: F.display, fontSize: 'clamp(56px, 10vw, 96px)', lineHeight: 1.03, letterSpacing: '-0.02em', color: C.textPrimary }}>
            <span style={{ display: 'block' }}>Energy intelligence</span>
            <span style={{ display: 'block', fontStyle: 'italic', color: 'rgba(255,255,255,0.45)' }}>
              for everyone.
            </span>
          </h2>
        </Reveal>
        <Reveal delay={240}>
          <div
            style={{
              marginTop: 32,
              fontFamily: F.mono,
              fontSize: 12,
              letterSpacing: '0.12em',
              color: 'rgba(255,255,255,0.55)',
            }}
          >
            FREE FOR STUDENTS · 14-DAY TRIAL FOR EVERYONE ELSE
          </div>
        </Reveal>
        <Reveal delay={360}>
          <div className="flex items-center justify-center gap-4" style={{ marginTop: 48 }}>
            <Link
              to="/signup"
              className="group inline-flex items-center gap-2"
              style={{
                padding: '14px 28px',
                background: C.electricBlue,
                borderRadius: R.lg,
                color: '#fff',
                fontFamily: F.sans,
                fontSize: 15,
                textDecoration: 'none',
                boxShadow: '0 0 0 1px rgba(59,130,246,0.4), 0 14px 36px -12px rgba(59,130,246,0.6)',
                transition: 'filter 150ms ease-out',
              }}
            >
              <span>Access the Terminal</span>
              <span className="transition-transform duration-150 group-hover:translate-x-1">→</span>
            </Link>
            <a
              href="#"
              className="hover:underline"
              style={{
                fontFamily: F.sans,
                fontSize: 15,
                color: 'rgba(255,255,255,0.72)',
                textDecoration: 'none',
                padding: '14px 8px',
              }}
            >
              Talk to the founder
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
