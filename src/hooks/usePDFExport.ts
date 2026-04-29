import { useCallback, useState } from 'react';
import type { PDFExportResult } from '@/services/pdfTemplates/types';

// CONDUIT-2 — orchestration hook.
// Wraps any pdf-export call (e.g. `exportStrategyMemo({ ... })`) with
// loading/result state so consumers don't reinvent it. The hook is
// generic over the export function — callers pass an `() => Promise<…>`
// and the hook handles the state machine.

interface UsePDFExportReturn {
  isExporting: boolean;
  lastResult: PDFExportResult | null;
  error: string | null;
  /** Run the export. Returns the same `PDFExportResult` the export
   *  function produces, so callers can branch immediately if needed. */
  exportPDF: (
    exportFn: () => Promise<PDFExportResult>,
  ) => Promise<PDFExportResult>;
  /** Reset error/last-result. Useful before re-running after a failure. */
  reset: () => void;
}

export function usePDFExport(): UsePDFExportReturn {
  const [isExporting, setIsExporting] = useState(false);
  const [lastResult, setLastResult] = useState<PDFExportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const exportPDF = useCallback(
    async (
      exportFn: () => Promise<PDFExportResult>,
    ): Promise<PDFExportResult> => {
      setIsExporting(true);
      setError(null);
      let result: PDFExportResult;
      try {
        result = await exportFn();
      } catch (e) {
        result = {
          success: false,
          error: e instanceof Error ? e.message : 'Unexpected error',
        };
      }
      setLastResult(result);
      if (!result.success) setError(result.error ?? 'Export failed');
      setIsExporting(false);
      return result;
    },
    [],
  );

  const reset = useCallback(() => {
    setLastResult(null);
    setError(null);
  }, []);

  return { isExporting, lastResult, error, exportPDF, reset };
}
