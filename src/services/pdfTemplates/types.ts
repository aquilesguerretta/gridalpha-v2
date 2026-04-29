// CONDUIT-2 — type system for the PDF export pipeline.
//
// Every template consumes a `PDFDocumentMeta` that defines the chrome
// (header text, footer brand line, document type) and produces a
// `PDFExportResult` so callers can branch on success/error without
// catching exceptions.

export interface PDFDocumentMeta {
  /** Document type label shown in the page header, e.g. "STRATEGY MEMO". */
  documentType: string;
  /** Long-form title used in the file metadata. */
  documentTitle: string;
  /** Author name for PDF metadata. Default: "GridAlpha". */
  authorName: string;
  /** Date string shown in the header (YYYY-MM-DD). */
  generatedDate: string;
  /** Optional facility name shown on the hero page. */
  facilityName?: string;
  /** Optional zone label shown on the hero page. */
  zone?: string;
  /** Footer brand line. Default: "GridAlpha · PJM Market Intelligence". */
  brandLine?: string;
}

export interface PDFExportOptions {
  /** Override the auto-generated filename. */
  filename?: string;
  /** Override fields on the default meta block. */
  meta?: Partial<PDFDocumentMeta>;
}

export interface PDFExportResult {
  success: boolean;
  /** The generated PDF blob (always present on success). */
  blob?: Blob;
  /** The filename the PDF was downloaded as. */
  filename?: string;
  /** Human-readable error message on failure. */
  error?: string;
}
