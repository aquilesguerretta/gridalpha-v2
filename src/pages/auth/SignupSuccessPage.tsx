import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { C, F, R } from '@/design/tokens';
import { useAuthStore } from '@/stores/authStore';

const PROFILE_LABEL: Record<string, string> = {
  everyone: 'EVERYONE',
  trader: 'TRADER',
  analyst: 'ANALYST',
  storage: 'STORAGE OPERATOR',
  industrial: 'INDUSTRIAL CONSUMER',
  student: 'STUDENT',
  developer: 'DEVELOPER / IPP',
};

const AUTO_REDIRECT_MS = 5000;

export function SignupSuccessPage() {
  const navigate = useNavigate();
  const email = useAuthStore((s) => s.email);
  const selectedProfile = useAuthStore((s) => s.selectedProfile);

  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    if (cancelled) return;
    const t = window.setTimeout(() => {
      navigate('/nest', { state: { fromAuth: true } });
    }, AUTO_REDIRECT_MS);
    return () => window.clearTimeout(t);
  }, [cancelled, navigate]);

  if (email === '') return <Navigate to="/signup" replace />;

  const enterTerminal = () => {
    setCancelled(true);
    navigate('/nest', { state: { fromAuth: true } });
  };

  const profileLabel = selectedProfile ? PROFILE_LABEL[selectedProfile] : 'EVERYONE';

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 480,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <Checkmark />

      <h1
        style={{
          marginTop: 32,
          fontFamily: F.display,
          fontWeight: 400,
          fontSize: 48,
          lineHeight: 1.05,
          letterSpacing: '-0.02em',
          color: C.textPrimary,
        }}
      >
        You're in.
      </h1>

      <p
        style={{
          marginTop: 16,
          maxWidth: 400,
          fontFamily: F.sans,
          fontSize: 16,
          lineHeight: 1.6,
          color: 'rgba(255,255,255,0.72)',
        }}
      >
        Your terminal is configured. Live markets, your profile, your alerts — ready.
      </p>

      <div
        style={{
          marginTop: 24,
          fontFamily: F.mono,
          fontSize: 11,
          letterSpacing: '0.12em',
          color: 'rgba(255,255,255,0.45)',
        }}
      >
        CONFIGURED AS {profileLabel}
      </div>

      <button
        type="button"
        onClick={enterTerminal}
        className="group"
        style={{
          marginTop: 48,
          width: '100%',
          height: 48,
          padding: '0 20px',
          background: C.electricBlue,
          border: 'none',
          borderRadius: R.lg,
          color: '#ffffff',
          fontFamily: F.sans,
          fontSize: 15,
          fontWeight: 500,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          boxShadow: '0 0 0 1px rgba(59,130,246,0.4), 0 14px 36px -12px rgba(59,130,246,0.6)',
          transition: 'filter 150ms ease-out',
        }}
      >
        <span>Open the Terminal</span>
        <span
          aria-hidden
          className="transition-transform duration-150 group-hover:translate-x-1"
        >
          →
        </span>
      </button>

      {!cancelled && (
        <div
          aria-hidden
          style={{
            marginTop: 12,
            width: '100%',
            height: 2,
            background: 'rgba(255,255,255,0.06)',
            borderRadius: 1,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: '100%',
              background: C.electricBlue,
              opacity: 0.3,
              transformOrigin: 'left center',
              animation: `ga-success-countdown ${AUTO_REDIRECT_MS}ms linear forwards`,
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes ga-success-countdown {
          from { transform: scaleX(1); }
          to   { transform: scaleX(0); }
        }
        @keyframes ga-success-ring {
          to { stroke-dashoffset: 0; }
        }
        @keyframes ga-success-tick {
          to { stroke-dashoffset: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          [data-ga-success-ring], [data-ga-success-tick] {
            animation: none !important;
            stroke-dashoffset: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * 80×80 SVG checkmark that draws itself — the circle strokes in over 600ms
 * ease-out, then the check path strokes in over 300ms ease-out. Color is
 * C.alertNormal (the "normal / green" status token, #10B981).
 */
function Checkmark() {
  const size = 80;
  // Circle: r=36 → circumference ≈ 226.19
  const CIRCLE_LEN = 2 * Math.PI * 36;
  // Check path length (approx) — hand-tuned to the path drawn below.
  const CHECK_LEN = 48;

  return (
    <svg width={size} height={size} viewBox="0 0 80 80" aria-hidden>
      <circle
        data-ga-success-ring
        cx="40"
        cy="40"
        r="36"
        fill="none"
        stroke={C.alertNormal}
        strokeWidth="3"
        strokeLinecap="round"
        style={{
          strokeDasharray: CIRCLE_LEN,
          strokeDashoffset: CIRCLE_LEN,
          transform: 'rotate(-90deg)',
          transformOrigin: '40px 40px',
          animation: 'ga-success-ring 600ms ease-out forwards',
        }}
      />
      <path
        data-ga-success-tick
        d="M26 41 L36 51 L55 32"
        fill="none"
        stroke={C.alertNormal}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: CHECK_LEN,
          strokeDashoffset: CHECK_LEN,
          animation: 'ga-success-tick 300ms ease-out 500ms forwards',
        }}
      />
    </svg>
  );
}
