import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { C, F, R, S } from '@/design/tokens';
import type { CmdPResult } from '@/lib/types/cmdp';

// CONDUIT Wave 3 — single result row in the Cmd+P drawer.
// Per-category render variants, all sharing the active-edge hover
// chrome we use elsewhere in the platform.

interface Props {
  result: CmdPResult;
  /** Called after the row is activated, so the parent can close
   *  the drawer (or not, depending on category). */
  onActivated: () => void;
}

export function CmdPResultItem({ result, onActivated }: Props) {
  const [hover, setHover] = useState(false);
  const navigate = useNavigate();
  const isInteractive = Boolean(result.href || result.action);

  // ai-synthesis is non-interactive — render as a prose card, not a row.
  if (result.category === 'ai-synthesis') {
    return <SynthesisCard result={result} />;
  }

  const handleActivate = () => {
    if (result.action) result.action();
    if (result.href) navigate(result.href);
    onActivated();
  };

  return (
    <div
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={isInteractive ? handleActivate : undefined}
      onKeyDown={
        isInteractive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleActivate();
              }
            }
          : undefined
      }
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: `${S.sm} ${S.md}`,
        borderRadius: R.sm,
        // CHROMA Wave 3 — bgSurface base, hover lifts to bgElevated.
        background: hover ? C.bgElevated : C.bgSurface,
        cursor: isInteractive ? 'pointer' : 'default',
        transition:
          'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1), color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <RowVariant result={result} hover={hover} />
    </div>
  );
}

function RowVariant({
  result,
  hover,
}: {
  result: CmdPResult;
  hover: boolean;
}) {
  switch (result.category) {
    case 'alexandria-entry':  return <AlexandriaRow result={result} hover={hover} />;
    case 'vault-case-study':  return <CaseStudyRow result={result} hover={hover} />;
    case 'peregrine-article': return <PeregrineRow result={result} hover={hover} />;
    case 'live-data-point':   return <DataPointRow result={result} />;
    case 'related-zone':      return <SimpleRow result={result} hover={hover} />;
    case 'related-asset':     return <SimpleRow result={result} hover={hover} />;
    case 'ai-synthesis':      return null; // handled above
  }
}

// ─── Alexandria ─────────────────────────────────────────────────────

function AlexandriaRow({ result, hover }: { result: CmdPResult; hover: boolean }) {
  const kind = result.metadata?.kind === 'lesson' ? 'LESSON' : 'ENTRY';
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: S.sm }}>
        <span style={{
          fontFamily: F.sans,
          fontSize: 14,
          fontWeight: 500,
          color: hover ? C.electricBlue : C.textPrimary,
        }}>
          {result.title}
        </span>
        <span style={chipStyle(C.electricBlue)}>{kind}</span>
      </div>
      {result.excerpt && (
        <span style={excerptStyle()}>{result.excerpt}</span>
      )}
      <span style={ctaStyle(hover)}>Open in Alexandria →</span>
    </>
  );
}

// ─── Vault case study ───────────────────────────────────────────────

function CaseStudyRow({ result, hover }: { result: CmdPResult; hover: boolean }) {
  const date = result.metadata?.date;
  const region = result.metadata?.region;
  const severity = result.metadata?.severity?.toUpperCase();
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: S.sm }}>
        <span style={{
          fontFamily: F.sans,
          fontSize: 14,
          fontWeight: 500,
          color: hover ? C.electricBlue : C.textPrimary,
        }}>
          {result.title}
        </span>
        {(date || region) && (
          <span style={{
            fontFamily: F.mono,
            fontSize: 10,
            color: C.textMuted,
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
          }}>
            {[date, region].filter(Boolean).join(' · ')}
          </span>
        )}
      </div>
      {result.excerpt && <span style={excerptStyle()}>{result.excerpt}</span>}
      {severity && <span style={chipStyle(severityColor(severity))}>{severity}</span>}
    </>
  );
}

// ─── Peregrine article ──────────────────────────────────────────────

function PeregrineRow({ result, hover }: { result: CmdPResult; hover: boolean }) {
  const source = result.metadata?.source;
  const timeAgo = result.metadata?.timeAgo;
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: S.sm }}>
        <span style={{
          fontFamily: F.sans,
          fontSize: 14,
          fontWeight: 500,
          color: hover ? C.electricBlue : C.textPrimary,
          lineHeight: 1.35,
        }}>
          {result.title}
        </span>
      </div>
      <div style={{ display: 'flex', gap: S.sm, alignItems: 'center' }}>
        {source && <span style={chipStyle(C.textSecondary)}>{source}</span>}
        {timeAgo && <span style={metaStyle()}>{timeAgo}</span>}
      </div>
      {result.excerpt && <span style={excerptStyle()}>{truncate(result.excerpt, 140)}</span>}
    </>
  );
}

// ─── Live data point ────────────────────────────────────────────────

function DataPointRow({ result }: { result: CmdPResult }) {
  const zone = result.metadata?.zone;
  const zoneSource = result.metadata?.zoneSource;
  const term = result.metadata?.term;
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: S.md }}>
        <span style={{
          fontFamily: F.mono,
          fontSize: 28,
          fontWeight: 700,
          fontVariantNumeric: 'tabular-nums',
          color: C.falconGold,
          lineHeight: 1,
        }}>
          {result.title}
        </span>
        {zone && (
          <span style={{
            fontFamily: F.mono,
            fontSize: 11,
            color: C.textMuted,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}>
            {zone}{zoneSource === 'default' ? ' · default' : ''}
          </span>
        )}
      </div>
      {result.excerpt && <span style={excerptStyle()}>{result.excerpt}</span>}
      {term && (
        <span style={{
          fontFamily: F.mono,
          fontSize: 10,
          color: C.textMuted,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          marginTop: 2,
        }}>
          MATCHED · {term}
        </span>
      )}
    </>
  );
}

// ─── Simple row (related-zone / related-asset placeholders) ─────────

function SimpleRow({ result, hover }: { result: CmdPResult; hover: boolean }) {
  return (
    <>
      <span style={{
        fontFamily: F.sans,
        fontSize: 13,
        color: hover ? C.textPrimary : C.textSecondary,
      }}>
        {result.title}
      </span>
      {result.excerpt && <span style={excerptStyle()}>{result.excerpt}</span>}
    </>
  );
}

// ─── AI synthesis card ──────────────────────────────────────────────

function SynthesisCard({ result }: { result: CmdPResult }) {
  const isError = result.metadata?.error === 'true';
  return (
    <div
      style={{
        padding: `${S.md} ${S.md}`,
        borderRadius: R.md,
        // CHROMA Wave 3 — slightly warmer tint via electricBlueWash for AI
        // synthesis (the brief asks for a "warmer background tint" to set
        // it apart from regular result rows).
        background: isError ? 'rgba(239,68,68,0.06)' : C.electricBlueWash,
        border: `1px solid ${isError ? C.borderAlert : C.borderAccent}`,
        display: 'flex',
        flexDirection: 'column',
        gap: S.sm,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: S.sm }}>
        <span style={{
          fontFamily: F.mono,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: isError ? C.alertCritical : C.electricBlue,
          padding: '2px 6px',
          border: `1px solid ${isError ? C.alertCritical : C.electricBlue}`,
          borderRadius: R.sm,
        }}>
          AI
        </span>
        <span style={{
          fontFamily: F.mono,
          fontSize: 10,
          color: C.textMuted,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
        }}>
          {result.title}
        </span>
      </div>
      <p style={{
        margin: 0,
        fontFamily: F.sans,
        fontSize: 13,
        color: C.textPrimary,
        lineHeight: 1.55,
      }}>
        {result.excerpt}
      </p>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────

function chipStyle(color: string): React.CSSProperties {
  return {
    fontFamily: F.mono,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color,
    padding: '2px 6px',
    border: `1px solid ${color}`,
    borderRadius: R.sm,
    flexShrink: 0,
  };
}

function metaStyle(): React.CSSProperties {
  return {
    fontFamily: F.mono,
    fontSize: 10,
    color: C.textMuted,
    letterSpacing: '0.10em',
    textTransform: 'uppercase',
  };
}

function excerptStyle(): React.CSSProperties {
  return {
    fontFamily: F.sans,
    fontSize: 12,
    color: C.textSecondary,
    lineHeight: 1.45,
  };
}

function ctaStyle(hover: boolean): React.CSSProperties {
  return {
    fontFamily: F.mono,
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: hover ? C.electricBlue : C.textMuted,
    marginTop: 2,
  };
}

function severityColor(s: string): string {
  switch (s.toUpperCase()) {
    case 'CRITICAL': return C.alertCritical;
    case 'HIGH':     return C.alertHigh;
    case 'MEDIUM':   return C.alertWarning;
    case 'LOW':      return C.alertNormal;
    default:         return C.textSecondary;
  }
}

function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}
