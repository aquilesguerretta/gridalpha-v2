import { useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { C, F } from '@/design/tokens';
import { EDITORIAL_BG } from '@/design/editorial';

/**
 * Shared layout for /login, /signup, /signup/profile, /signup/details,
 * /signup/success.
 *
 * 72px nav (wordmark + "← Back to home")
 * Main slot — centered content
 * Nothing pinned to the bottom — focused flow, no market chrome.
 * Background: EDITORIAL_BG base + 3% C.electricBlue radial (top-right)
 *             + 1px / 32px dotted grid at rgba(255,255,255,0.02)
 */
export function AuthLayout() {
  // Release the terminal's no-scroll chrome while auth pages are mounted.
  useEffect(() => {
    const root = document.getElementById('root');
    const prev = {
      htmlOverflowX: document.documentElement.style.overflowX,
      htmlOverflowY: document.documentElement.style.overflowY,
      bodyOverflowX: document.body.style.overflowX,
      bodyOverflowY: document.body.style.overflowY,
      htmlHeight: document.documentElement.style.height,
      bodyHeight: document.body.style.height,
      rootOverflowX: root?.style.overflowX ?? '',
      rootOverflowY: root?.style.overflowY ?? '',
      rootHeight: root?.style.height ?? '',
      rootWidth: root?.style.width ?? '',
    };
    document.documentElement.style.overflowY = 'auto';
    document.documentElement.style.overflowX = 'hidden';
    document.body.style.overflowY = 'auto';
    document.body.style.overflowX = 'hidden';
    document.documentElement.style.height = 'auto';
    document.body.style.height = 'auto';
    if (root) {
      root.style.overflowY = 'visible';
      root.style.overflowX = 'hidden';
      root.style.height = 'auto';
      root.style.width = '100%';
    }
    return () => {
      document.documentElement.style.overflowX = prev.htmlOverflowX;
      document.documentElement.style.overflowY = prev.htmlOverflowY;
      document.body.style.overflowX = prev.bodyOverflowX;
      document.body.style.overflowY = prev.bodyOverflowY;
      document.documentElement.style.height = prev.htmlHeight;
      document.body.style.height = prev.bodyHeight;
      if (root) {
        root.style.overflowX = prev.rootOverflowX;
        root.style.overflowY = prev.rootOverflowY;
        root.style.height = prev.rootHeight;
        root.style.width = prev.rootWidth;
      }
    };
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: EDITORIAL_BG,
        color: C.textPrimary,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'hidden',
      }}
    >
      {/* editorial background layers */}
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          background: `radial-gradient(60% 50% at 90% 0%, ${C.electricBlue}08 0%, transparent 70%)`,
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          opacity: 0.4,
        }}
      />

      <AuthNav />

      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px 48px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}

function AuthNav() {
  return (
    <header
      style={{
        height: '72px',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 2,
      }}
    >
      <Link
        to="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          textDecoration: 'none',
          color: C.textPrimary,
        }}
      >
        <svg width="22" height="24" viewBox="0 0 22 24" fill="none">
          <path
            d="M11 1L20.5263 6.5V17.5L11 23L1.47372 17.5V6.5L11 1Z"
            stroke={C.electricBlue}
            strokeWidth="1.5"
            fill="rgba(59,130,246,0.08)"
          />
          <path d="M11 7L15 9.5V14.5L11 17L7 14.5V9.5L11 7Z" fill={C.electricBlue} />
        </svg>
        <span
          style={{
            fontFamily: F.display,
            fontStyle: 'italic',
            fontSize: '20px',
            letterSpacing: '-0.01em',
          }}
        >
          GridAlpha
        </span>
      </Link>

      <Link
        to="/"
        style={{
          fontFamily: F.sans,
          fontSize: '13px',
          color: C.textSecondary,
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span aria-hidden>←</span>
        Back to home
      </Link>
    </header>
  );
}

