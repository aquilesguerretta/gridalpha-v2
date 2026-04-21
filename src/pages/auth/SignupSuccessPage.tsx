import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { C, F, R } from '@/design/tokens';
import { useAuthStore, type ProfileType } from '@/stores/authStore';

const AUTO_REDIRECT_MS = 5000;

const PROFILE_LABELS: Record<ProfileType, string> = {
  everyone: 'EVERYONE',
  trader: 'TRADER',
  analyst: 'ANALYST',
  storage: 'STORAGE OPERATOR',
  industrial: 'INDUSTRIAL CONSUMER',
  student: 'STUDENT',
  developer: 'DEVELOPER / IPP',
};

export function SignupSuccessPage() {
  const navigate = useNavigate();
  const email = useAuthStore((s) => s.email);
  const selectedProfile = useAuthStore((s) => s.selectedProfile);
  const [cancelled, setCancelled] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (cancelled) return;
    timerRef.current = window.setTimeout(() => {
      navigate('/nest', { state: { fromAuth: true } });
    }, AUTO_REDIRECT_MS);
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, [cancelled, navigate]);

  if (email === '') return <Navigate to="/signup" replace />;

  const profileText = selectedProfile ? PROFILE_LABELS[selectedProfile] : 'EVERYONE';

  const openTerminal = () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    setCancelled(true);
    navigate('/nest', { state: { fromAuth: true } });
  };

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
      <SuccessCheckmark />

      <h1
        style={{
          margin: '32px 0 0 0',
          fontFamily: F.display,
          fontWeight: 400,
          fontSize: 48,
          lineHeight: 1.1,
          color: C.textPrimary,
        }}
      >
        You're in.
      </h1>

      <p
        style={{
          margin: '16px 0 0 0',
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
        CONFIGURED AS {profileText}
      </div>

      <button
        type="button"
        onClick={openTerminal}
        className="group"
        style={{
          marginTop: 48,
          width: '100%',
          height: 48,
          border: 'none',
          borderRadius: R.lg,
          background: C.electricBlue,
          color: C.textPrimary,
          fontFamily: F.sans,
          fontSize: 15,
          fontWeight: 500,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        <span>Open the Terminal</span>
        <span aria-hidden className="transition-transform duration-150 group-hover:translate-x-1">
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
            overflow: 'hidden',
          }}
        >
          <div
            data-success-countdown
            style={{
              width: '100%',
              height: '100%',
              background: C.electricBlue,
              opacity: 0.3,
              animation: `ga-success-countdown ${AUTO_REDIRECT_MS}ms linear forwards`,
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes ga-success-countdown {
          from { width: 100%; }
          to { width: 0%; }
        }
        @keyframes ga-success-circle-draw {
          from { stroke-dashoffset: 226.2; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes ga-success-check-draw {
          from { stroke-dashoffset: 48; }
          to { stroke-dashoffset: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          [data-success-circle], [data-success-check], [data-success-countdown] {
            animation: none !important;
            stroke-dashoffset: 0 !important;
            width: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}

function SuccessCheckmark() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" aria-hidden>
      <circle
        data-success-circle
        cx="40"
        cy="40"
        r="36"
        fill="none"
        stroke={C.alertNormal}
        strokeWidth="3"
        strokeLinecap="round"
        style={{
          strokeDasharray: 226.2,
          strokeDashoffset: 226.2,
          animation: 'ga-success-circle-draw 600ms ease-out forwards',
        }}
      />
      <path
        data-success-check
        d="M26 41 L36 51 L55 32"
        fill="none"
        stroke={C.alertNormal}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: 48,
          strokeDashoffset: 48,
          animation: 'ga-success-check-draw 300ms ease-out 400ms forwards',
        }}
      />
    </svg>
  );
}
