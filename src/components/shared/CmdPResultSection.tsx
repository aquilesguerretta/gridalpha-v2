import { C, F, S } from '@/design/tokens';
import type { CmdPResult, ResultCategory } from '@/lib/types/cmdp';
import { CATEGORY_LABELS } from '@/lib/types/cmdp';
import { CmdPResultItem } from './CmdPResultItem';

// CONDUIT Wave 3 — section header + result list for one category.
// Renders a skeleton state while loading, an empty hint when the
// resolver returned 0 results, and a stack of CmdPResultItem rows
// otherwise.

interface Props {
  category: ResultCategory;
  results: CmdPResult[];
  isLoading: boolean;
  /** Called when a row activates; the drawer typically closes. */
  onActivated: () => void;
}

export function CmdPResultSection({
  category,
  results,
  isLoading,
  onActivated,
}: Props) {
  // Hide entirely if both: not loading AND no results — keeps the
  // drawer compact for queries that only resolve a couple of categories.
  if (!isLoading && results.length === 0) return null;

  // Sort within section by relevance descending.
  const sorted = [...results].sort((a, b) => b.relevance - a.relevance);

  return (
    <div style={{ marginBottom: S.lg }}>
      <div
        style={{
          padding: `${S.xs} ${S.md}`,
          fontFamily: F.mono,
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: C.textMuted,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>{CATEGORY_LABELS[category]}</span>
        {!isLoading && results.length > 0 && (
          <span
            style={{
              fontSize: 9,
              color: C.textMuted,
              letterSpacing: '0.12em',
            }}
          >
            {results.length}
          </span>
        )}
      </div>

      {isLoading ? (
        <Skeleton category={category} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {sorted.map((r) => (
            <CmdPResultItem
              key={r.id}
              result={r}
              onActivated={onActivated}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Skeleton({ category }: { category: ResultCategory }) {
  // Synthesis skeleton is tall (prose card); the others are slim rows.
  const rows = category === 'ai-synthesis' ? 1 : 2;
  const height = category === 'ai-synthesis' ? 88 : 44;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          aria-hidden
          style={{
            height,
            margin: `0 ${S.md}`,
            borderRadius: 4,
            background:
              'linear-gradient(90deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.02) 100%)',
            backgroundSize: '200% 100%',
            animation: 'cmdp-skeleton 1.6s ease-in-out infinite',
          }}
        />
      ))}
      <style>{`@keyframes cmdp-skeleton { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
    </div>
  );
}
