// FORGE Wave 2 — Export-memo button stub.
// CONDUIT-2 owns the actual PDF pipeline. Until that lands, this button
// renders disabled with a "PDF export coming soon" tooltip. The feature
// detection is dynamic so flipping a single flag (or shipping the
// pdfExport service) enables this button without touching the simulator
// UI.

import { useEffect, useState } from 'react';
import { C, F, R, S } from '@/design/tokens';
import type { StrategyResult } from '@/lib/types/simulator';
import type { FacilityProfile } from '@/lib/types/simulator';

interface Props {
  result: StrategyResult;
  profile: FacilityProfile;
}

interface PdfExportApi {
  exportStrategyMemo: (
    profile: FacilityProfile,
    result: StrategyResult,
  ) => Promise<void>;
}

/**
 * Feature-detect CONDUIT-2's PDF export service. We dynamically import to
 * avoid a hard dependency at compile time. The specifier is built at
 * runtime so TypeScript does not try to resolve it; if the module isn't
 * on disk yet, the import rejects and we return null.
 */
async function loadPdfExport(): Promise<PdfExportApi | null> {
  try {
    // Build the specifier at runtime so TS doesn't statically resolve it.
    const specifier = ['@', '/services/pdfExport'].join('');
    const mod: unknown = await import(/* @vite-ignore */ specifier).catch(
      () => null,
    );
    if (!mod || typeof mod !== 'object') return null;
    const candidate = mod as Partial<PdfExportApi>;
    if (typeof candidate.exportStrategyMemo !== 'function') return null;
    return candidate as PdfExportApi;
  } catch {
    return null;
  }
}

export function ExportMemoButton({ result, profile }: Props) {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    loadPdfExport().then((api) => {
      if (!mounted) return;
      setAvailable(Boolean(api));
    });
    return () => {
      mounted = false;
    };
  }, []);

  async function handleClick() {
    setError(null);
    const api = await loadPdfExport();
    if (!api) {
      setError('PDF export pipeline not yet available.');
      return;
    }
    try {
      setBusy(true);
      await api.exportStrategyMemo(profile, result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed.');
    } finally {
      setBusy(false);
    }
  }

  const disabled = available === false || busy;
  const tooltip =
    available === false
      ? 'PDF export coming soon — CONDUIT-2 ships the export pipeline in a future sprint.'
      : busy
        ? 'Generating memo…'
        : 'Export this strategy as a board-ready PDF memo.';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: S.xs }}>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        title={tooltip}
        style={{
          background: disabled ? 'transparent' : C.electricBlue,
          border: `1px solid ${disabled ? C.borderDefault : C.electricBlue}`,
          borderRadius: R.md,
          padding: `0 ${S.lg}`,
          height: 40,
          fontFamily: F.mono,
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: disabled ? C.textMuted : '#fff',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.55 : 1,
        }}
      >
        {busy ? 'Generating…' : 'Export Memo (PDF)'}
      </button>
      {error && (
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 11,
            color: C.alertCritical,
            letterSpacing: '0.10em',
          }}
        >
          {error}
        </div>
      )}
      {available === false && !error && (
        <div
          style={{
            fontFamily: F.mono,
            fontSize: 10,
            color: C.textMuted,
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
          }}
        >
          PDF EXPORT — COMING SOON
        </div>
      )}
    </div>
  );
}
