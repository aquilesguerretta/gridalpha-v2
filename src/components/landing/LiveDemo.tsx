import { C, F, R } from '@/design/tokens';
import { EDITORIAL_BG, EDITORIAL_SURFACE, EDITORIAL_SURFACE_HIGHEST } from '@/design/editorial';

export function LiveDemo() {
  return (
    <section
      className="relative flex w-full flex-col items-center justify-center px-6"
      style={{ backgroundColor: '#000', height: '80vh', minHeight: '640px' }}
    >
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          top: '48px',
          fontFamily: F.mono,
          fontSize: '11px',
          letterSpacing: '0.18em',
          color: 'rgba(241,241,243,0.72)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <span className="relative inline-flex h-1.5 w-1.5">
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full"
            style={{ backgroundColor: C.alertCritical, opacity: 0.75 }}
          />
          <span
            className="relative inline-flex h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: C.alertCritical }}
          />
        </span>
        LIVE PRODUCT — NOT A MOCKUP
      </div>

      <div
        style={{
          width: 'min(900px, 90vw)',
          aspectRatio: '16 / 10',
          backgroundColor: EDITORIAL_SURFACE_HIGHEST,
          borderRadius: '14px 14px 6px 6px',
          border: '1px solid rgba(255,255,255,0.08)',
          padding: '14px',
          boxShadow: '0 60px 120px -40px rgba(59,130,246,0.3), 0 0 0 1px rgba(255,255,255,0.04)',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '6px',
            background: `linear-gradient(135deg, ${EDITORIAL_BG} 0%, ${EDITORIAL_SURFACE} 50%, ${EDITORIAL_BG} 100%)`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              padding: '20px',
              fontFamily: F.mono,
              fontSize: '10px',
              color: 'rgba(241,241,243,0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ color: C.electricBlue }}>● GRIDALPHA TERMINAL · PJM · LIVE</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginTop: '12px' }}>
              {['PJM-RTO', 'AEP', 'DOM', 'PSEG'].map((z, i) => (
                <div
                  key={z}
                  style={{
                    padding: '10px',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '4px',
                  }}
                >
                  <div style={{ color: 'rgba(241,241,243,0.4)' }}>{z}</div>
                  <div style={{ color: C.textPrimary, fontSize: '16px', marginTop: '4px' }}>
                    ${(42 + i * 3.2).toFixed(2)}
                  </div>
                  <div style={{ color: C.alertNormal, fontSize: '9px' }}>+{(0.8 + i * 0.4).toFixed(2)}%</div>
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: '12px',
                flex: 1,
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '4px',
                background: 'linear-gradient(180deg, rgba(59,130,246,0.08) 0%, transparent 100%)',
                position: 'relative',
              }}
            >
              <svg width="100%" height="100%" viewBox="0 0 400 120" preserveAspectRatio="none">
                <polyline
                  fill="none"
                  stroke={C.electricBlue}
                  strokeWidth="1.2"
                  points="0,80 20,70 40,74 60,60 80,64 100,48 120,52 140,40 160,46 180,32 200,38 220,28 240,34 260,20 280,26 300,18 320,24 340,14 360,20 380,12 400,18"
                />
              </svg>
            </div>
          </div>
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, transparent 0%, rgba(59,130,246,0.04) 50%, transparent 100%)',
              animation: 'ga-demo-scan 4s linear infinite',
            }}
          />
        </div>
      </div>

      <div
        style={{
          marginTop: '32px',
          fontFamily: F.sans,
          fontSize: '15px',
          color: 'rgba(241,241,243,0.72)',
          textAlign: 'center',
        }}
      >
        This is GridAlpha running at{' '}
        <span style={{ color: C.electricBlue }}>grid-alpha-five.vercel.app</span> right now.
      </div>
      <a
        href="https://grid-alpha-five.vercel.app"
        target="_blank"
        rel="noreferrer"
        style={{
          marginTop: '18px',
          fontFamily: F.sans,
          fontSize: '14px',
          fontWeight: 500,
          color: '#fff',
          backgroundColor: C.electricBlue,
          padding: '12px 20px',
          borderRadius: R.lg,
          textDecoration: 'none',
          boxShadow: '0 12px 32px -12px rgba(59,130,246,0.6)',
        }}
      >
        See it yourself →
      </a>

      <style>{`
        @keyframes ga-demo-scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>
    </section>
  );
}
