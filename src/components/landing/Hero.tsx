import { C, F, R } from '@/design/tokens';
import { Ticker } from './Ticker';

function StaggeredHeadline({
  text,
  italic,
  color,
  baseDelay,
}: {
  text: string;
  italic?: boolean;
  color: string;
  baseDelay: number;
}) {
  return (
    <span
      style={{
        fontFamily: F.display,
        fontStyle: italic ? 'italic' : 'normal',
        fontSize: 'clamp(56px, 9vw, 96px)',
        lineHeight: 1.02,
        letterSpacing: '-0.02em',
        color,
        display: 'block',
      }}
    >
      {text.split('').map((ch, i) => (
        <span
          key={i}
          className="inline-block animate-rise"
          style={{
            animationDelay: `${baseDelay + i * 40}ms`,
            whiteSpace: ch === ' ' ? 'pre' : 'normal',
          }}
        >
          {ch}
        </span>
      ))}
    </span>
  );
}

export function Hero() {
  return (
    <section
      className="relative flex w-full flex-col"
      style={{ height: '100vh', minHeight: '760px' }}
    >
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[55%] animate-blob"
        style={{
          width: '800px',
          height: '800px',
          background:
            'radial-gradient(circle at center, rgba(59,130,246,0.08) 0%, rgba(59,130,246,0) 60%)',
          filter: 'blur(8px)',
        }}
      />

      <div className="relative flex items-center justify-center" style={{ flex: '0 0 10%' }}>
        <div
          className="flex items-center gap-2.5 animate-fade"
          style={{
            fontFamily: F.mono,
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: C.textSecondary,
            paddingTop: '12px',
          }}
        >
          <span>US · BRASIL · CHINA · REAL-TIME DISPATCH</span>
          <span style={{ color: 'rgba(241,241,243,0.25)' }}>·</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="relative inline-flex h-1.5 w-1.5">
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full"
                style={{ backgroundColor: C.alertNormal, opacity: 0.75 }}
              />
              <span
                className="relative inline-flex h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: C.alertNormal }}
              />
            </span>
            <span style={{ color: C.alertNormal }}>LIVE</span>
          </span>
        </div>
      </div>

      <div className="relative flex flex-col items-center justify-center px-8 text-center" style={{ flex: '0 0 60%' }}>
        <h1 className="m-0">
          <StaggeredHeadline text="Energy intelligence" color={C.textPrimary} baseDelay={100} />
          <StaggeredHeadline
            text="for everyone."
            italic
            color="rgba(241,241,243,0.45)"
            baseDelay={700}
          />
        </h1>
        <p
          className="mt-8 animate-fade-late text-center"
          style={{
            fontFamily: F.sans,
            fontSize: '20px',
            lineHeight: 1.5,
            color: 'rgba(241,241,243,0.72)',
            maxWidth: '560px',
          }}
        >
          Energy is the infrastructure the world runs on. GridAlpha is the intelligence
          infrastructure you run on. Live markets, asset optimization, and AI-powered analysis
          built for every professional in the industry.
        </p>
      </div>

      <div className="relative flex flex-col justify-center gap-5" style={{ flex: '0 0 30%' }}>
        <div
          className="flex items-center justify-center gap-2"
          style={{
            fontFamily: F.mono,
            fontSize: '10px',
            fontWeight: 500,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'rgba(241,241,243,0.45)',
          }}
        >
          <span>LIVE PRICES — UPDATED 4S AGO</span>
          <span style={{ color: 'rgba(241,241,243,0.20)' }}>·</span>
          <span>REAL-TIME DISPATCH</span>
        </div>

        <Ticker />

        <div className="flex items-center justify-center gap-3 px-8">
          <button
            className="group flex items-center gap-2 px-5 py-3 transition-all hover:brightness-110"
            style={{
              fontFamily: F.sans,
              fontSize: '14px',
              fontWeight: 500,
              color: '#ffffff',
              backgroundColor: C.electricBlue,
              borderRadius: R.lg,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 0 0 1px rgba(59,130,246,0.4), 0 12px 32px -12px rgba(59,130,246,0.6)',
            }}
          >
            Access the Terminal
            <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </button>
          <button
            className="group flex items-center gap-2 px-5 py-3 transition-colors"
            style={{
              fontFamily: F.sans,
              fontSize: '14px',
              fontWeight: 500,
              color: 'rgba(241,241,243,0.85)',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: R.lg,
              cursor: 'pointer',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 1.5L10 6L2.5 10.5V1.5Z" fill="currentColor" />
            </svg>
            Watch 2-minute demo
          </button>
        </div>
      </div>

      <style>{`
        @keyframes ga-rise {
          0%   { opacity: 0; transform: translate3d(0, 28px, 0); }
          100% { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        .animate-rise {
          opacity: 0;
          animation: ga-rise 620ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @keyframes ga-fade {
          0% { opacity: 0; } 100% { opacity: 1; }
        }
        .animate-fade { opacity: 0; animation: ga-fade 600ms ease-out 60ms forwards; }
        .animate-fade-late { opacity: 0; animation: ga-fade 700ms ease-out 1600ms forwards; }
        @keyframes ga-blob {
          0%, 100% { transform: translate(-50%, -55%) scale(1);   opacity: 0.9; }
          50%      { transform: translate(-50%, -55%) scale(1.08); opacity: 1; }
        }
        .animate-blob { animation: ga-blob 4s ease-in-out infinite; }
      `}</style>
    </section>
  );
}
