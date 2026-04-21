import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { C, F, R } from '@/design/tokens';
import { useAuthStore } from '@/stores/authStore';

export function SignupSuccessPage() {
  const navigate = useNavigate();
  const email = useAuthStore((s) => s.email);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setShow(true), 100);
    return () => window.clearTimeout(t);
  }, []);

  if (email === '') return <Navigate to="/signup" replace />;

  return (
    <div
      className="flex flex-col items-center justify-center text-center transition-all duration-700"
      style={{
        width: '100%',
        maxWidth: 520,
        opacity: show ? 1 : 0,
        transform: show ? 'translateY(0)' : 'translateY(20px)',
      }}
    >
      <div
        className="flex items-center justify-center transition-all duration-500"
        style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'rgba(59,130,246,0.12)',
          border: '1px solid rgba(59,130,246,0.30)',
          boxShadow: '0 0 40px rgba(59,130,246,0.25)',
          marginBottom: 32,
          transform: show ? 'scale(1)' : 'scale(0.8)',
        }}
      >
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M20 6L9 17L4 12"
            stroke={C.electricBlue}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div
        style={{
          fontFamily: F.mono,
          fontSize: 11,
          letterSpacing: '0.12em',
          color: C.electricBlue,
          marginBottom: 16,
        }}
      >
        ACCOUNT CREATED
      </div>

      <h1
        style={{
          margin: 0,
          fontFamily: F.display,
          fontSize: 'clamp(36px, 5vw, 48px)',
          lineHeight: 1.1,
          letterSpacing: '-0.01em',
          color: C.textPrimary,
          marginBottom: 16,
        }}
      >
        Welcome to <span style={{ fontStyle: 'italic', color: C.electricBlue }}>GridAlpha</span>
      </h1>

      <p
        style={{
          margin: 0,
          fontFamily: F.sans,
          fontSize: 15,
          color: 'rgba(255,255,255,0.55)',
          lineHeight: 1.6,
          maxWidth: 420,
          marginBottom: 40,
        }}
      >
        Your terminal is ready. Real-time market data, analytics, and intelligence for global energy
        markets — all in one place.
      </p>

      <button
        type="button"
        onClick={() => navigate('/nest', { state: { fromAuth: true } })}
        className="group"
        style={{
          width: '100%',
          height: 48,
          padding: '0 20px',
          border: 'none',
          borderRadius: R.lg,
          background: C.electricBlue,
          color: '#fff',
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
        <span>Enter Terminal</span>
        <span aria-hidden className="transition-transform duration-150 group-hover:translate-x-1">
          →
        </span>
      </button>

      <div
        className="grid gap-4"
        style={{
          marginTop: 48,
          width: '100%',
          gridTemplateColumns: '1fr 1fr',
        }}
      >
        <div
          style={{
            padding: 20,
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: R.lg,
          }}
        >
          <div
            style={{
              fontFamily: F.mono,
              fontSize: 10,
              letterSpacing: '0.12em',
              color: 'rgba(255,255,255,0.45)',
              marginBottom: 8,
            }}
          >
            MARKETS LIVE
          </div>
          <div
            style={{
              fontFamily: F.display,
              fontSize: 24,
              color: C.electricBlue,
            }}
          >
            24/7
          </div>
        </div>

        <div
          style={{
            padding: 20,
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: R.lg,
          }}
        >
          <div
            style={{
              fontFamily: F.mono,
              fontSize: 10,
              letterSpacing: '0.12em',
              color: 'rgba(255,255,255,0.45)',
              marginBottom: 8,
            }}
          >
            DATA POINTS
          </div>
          <div
            style={{
              fontFamily: F.display,
              fontSize: 24,
              color: C.electricBlue,
            }}
          >
            50M+
          </div>
        </div>
      </div>
    </div>
  );
}
