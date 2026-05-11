// CHROMA Wave 4 — ErrorBoundaryFallback primitive.
//
// Standard visual treatment when a wrapped component crashes — used
// as the default fallback for src/components/shared/ErrorBoundary.
//
// Container style mirrors the platform's data-card chrome:
//   - bgSurface background, 1px borderDefault
//   - red dot indicator + F.mono caps "DATA UNAVAILABLE"
//   - F.sans 13px secondary message
//   - F.mono caps electric-blue "Retry" button (no fill, just border)
//
// When invoked from a hook's `isStale fallback fires` scenario, the
// previously-successful data should still show through with a subtle
// dim treatment — that mode is opt-in via the `mode="overlay"` prop,
// which makes the fallback render as a semi-transparent overlay on
// top of whatever the boundary was protecting.

import type { CSSProperties, ReactNode } from 'react';
import { C, F, R, S } from '@/design/tokens';

interface Props {
  /** Error caught by the boundary. */
  error?: Error;
  /** Optional callback — usually wired to ErrorBoundary's reset handler. */
  onRetry?: () => void;
  /**
   * Optional eyebrow override. Defaults to "DATA UNAVAILABLE". Pass
   * something more specific when the surface knows what failed
   * (e.g. "LMP FEED UNAVAILABLE").
   */
  label?: string;
  /**
   * Optional body copy override. Defaults to the generic "Failed to
   * load. Reload page or contact support if this persists."
   */
  message?: string;
  /**
   * 'card' (default) — renders as a self-contained fallback card.
   * 'inline' — minimal treatment, fits inside an existing card.
   */
  mode?: 'card' | 'inline';
  /** Style overrides for the outer container. */
  style?: CSSProperties;
  /** Optional content to render BELOW the error UI (e.g. stale data). */
  staleContent?: ReactNode;
}

export function ErrorBoundaryFallback({
  error,
  onRetry,
  label,
  message,
  mode = 'card',
  style,
  staleContent,
}: Props) {
  const eyebrowText = label ?? 'DATA UNAVAILABLE';
  const messageText =
    message ??
    'Failed to load. Reload page or contact support if this persists.';

  const containerStyle: CSSProperties =
    mode === 'card'
      ? {
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          justifyContent: 'center',
          gap:            S.md,
          padding:        S.xl,
          background:     C.bgSurface,
          border:         `1px solid ${C.borderDefault}`,
          borderRadius:   R.lg,
          textAlign:      'center',
        }
      : {
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'flex-start',
          gap:            S.sm,
          padding:        S.md,
        };

  return (
    <div role="alert" style={{ ...containerStyle, ...style }}>
      {/* Eyebrow row — red dot + caps label */}
      <div
        style={{
          display:    'inline-flex',
          alignItems: 'center',
          gap:        6,
          fontFamily: F.mono,
          fontSize:   11,
          fontWeight: 600,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color:      C.alertCritical,
        }}
      >
        <span
          aria-hidden
          style={{
            width:        6,
            height:       6,
            borderRadius: '50%',
            background:   C.alertCritical,
          }}
        />
        {eyebrowText}
      </div>

      {/* Body copy */}
      <div
        style={{
          fontFamily: F.sans,
          fontSize:   13,
          lineHeight: 1.5,
          color:      C.textSecondary,
          maxWidth:   320,
        }}
      >
        {messageText}
      </div>

      {/* Error message — only in card mode, only if dev / verbose */}
      {mode === 'card' && error?.message && (
        <div
          style={{
            fontFamily: F.mono,
            fontSize:   10,
            color:      C.textMuted,
            opacity:    0.7,
            maxWidth:   320,
            wordBreak:  'break-word',
          }}
        >
          {error.message}
        </div>
      )}

      {/* Retry — no fill, just border */}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          style={{
            fontFamily:    F.mono,
            fontSize:      11,
            fontWeight:    600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color:         C.electricBlue,
            background:    'transparent',
            border:        `1px solid ${C.borderActive}`,
            borderRadius:  R.md,
            padding:       `${S.xs} ${S.lg}`,
            cursor:        'pointer',
            transition:    'background-color 150ms cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          Retry
        </button>
      )}

      {/* Optional stale-data passthrough — dimmed below the fallback */}
      {staleContent && (
        <div
          aria-hidden
          style={{
            width:      '100%',
            opacity:    0.4,
            marginTop:  S.md,
            pointerEvents: 'none',
          }}
        >
          {staleContent}
        </div>
      )}
    </div>
  );
}

export default ErrorBoundaryFallback;
