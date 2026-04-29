// CONDUIT-2 — PDF export pipeline entry point.
//
// Public API: one function per template, plus a couple of utility
// helpers (filename builder, SVG → PNG rasterizer). New templates
// expose a sibling `exportXxx()` function and register themselves in
// the `PDF_TEMPLATES` map.

import { pdf } from '@react-pdf/renderer';
import { createElement } from 'react';
import { StrategyMemoTemplate } from './pdfTemplates/StrategyMemoTemplate';
import type {
  FacilityProfile,
  ScenarioName,
  StrategyResult,
} from '@/lib/types/simulator';
import type {
  PDFDocumentMeta,
  PDFExportOptions,
  PDFExportResult,
} from './pdfTemplates/types';

// ─── Utilities ─────────────────────────────────────────────────────

/** ISO date string (YYYY-MM-DD) for the page-header date stamp. */
function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Sanitize an arbitrary string into a filename-safe slug. */
function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'gridalpha';
}

/** Trigger a browser download for a Blob. Returns the filename used. */
function downloadBlob(blob: Blob, filename: string): string {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Defer revoke so iOS Safari has time to start the download.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return filename;
}

/**
 * Rasterize an SVG markup string into a PNG data URL using the browser
 * canvas. Templates accept PNG data URLs (not SVG) because
 * `@react-pdf/renderer`'s `<Image>` rasterizes raster formats reliably
 * but doesn't natively render arbitrary SVG. Caller picks `width` and
 * `height` in pixels; result is a data URL that can be passed straight
 * into a `PDFChartImage` `src` prop.
 *
 * No-ops in non-browser environments (returns `null`); callers should
 * branch on the null case and let the template fall back to its
 * text-only substitute.
 */
export async function svgStringToPngDataUrl(
  svg: string,
  width: number,
  height: number,
): Promise<string | null> {
  if (typeof document === 'undefined' || typeof Image === 'undefined') {
    return null;
  }
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('Failed to load SVG into Image'));
      i.src = url;
    });
    const canvas = document.createElement('canvas');
    // 2× pixel ratio for crisp rasterization at print scale.
    const scale = 2;
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.scale(scale, scale);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    return canvas.toDataURL('image/png');
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

// ─── Strategy memo ─────────────────────────────────────────────────

interface ExportStrategyMemoArgs {
  facilityProfile: FacilityProfile;
  results: StrategyResult[];
  scenario?: ScenarioName;
  /** Optional pre-rasterized chart PNGs. Templates fall back to text
   *  when these aren't provided. */
  chartImages?: { sensitivity?: string; dispatch?: string };
  options?: PDFExportOptions;
}

export async function exportStrategyMemo({
  facilityProfile,
  results,
  scenario = 'base',
  chartImages,
  options,
}: ExportStrategyMemoArgs): Promise<PDFExportResult> {
  try {
    const meta: PDFDocumentMeta = {
      documentType: 'STRATEGY MEMO',
      documentTitle: `${facilityProfile.name} · Strategy Analysis`,
      authorName: 'GridAlpha',
      generatedDate: todayIso(),
      facilityName: facilityProfile.name,
      zone: facilityProfile.zone,
      brandLine: 'GridAlpha · PJM Market Intelligence',
      ...options?.meta,
    };

    const element = createElement(StrategyMemoTemplate, {
      facilityProfile,
      results,
      scenarioForCharts: scenario,
      chartImages,
      meta,
    });

    const blob = await pdf(element).toBlob();
    const filename =
      options?.filename ??
      `gridalpha-strategy-memo-${slug(facilityProfile.name)}-${todayIso()}.pdf`;

    downloadBlob(blob, filename);

    return { success: true, blob, filename };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Unknown PDF export error';
    // Console-log preserves the stack for debugging without surfacing
    // it to end-users; the result.error is the human-readable form.
    if (typeof console !== 'undefined') {
      // eslint-disable-next-line no-console
      console.error('[CONDUIT-2] PDF export failed:', err);
    }
    return { success: false, error: message };
  }
}

// ─── Template registry ─────────────────────────────────────────────

/**
 * Map of available template export functions. New templates register
 * here so dev tooling and future "export from anywhere" UI can list
 * them without each caller knowing the function names.
 */
export const PDF_TEMPLATES = {
  strategyMemo: exportStrategyMemo,
  // Future:
  //   analystReport: exportAnalystReport,
  //   traderBrief: exportTraderBrief,
  //   developerSiteReport: exportDeveloperSiteReport,
} as const;

export type PDFTemplateKey = keyof typeof PDF_TEMPLATES;
