// CONDUIT-2 — stub template, not yet implemented.
//
// Future agents wiring the Analyst Report can:
//   1. Build out this component using the same primitives the
//      `StrategyMemoTemplate` uses (BasePDFTemplate, PDFEyebrow, etc.).
//   2. Add an `exportAnalystReport(...)` function in
//      `src/services/pdfExport.ts` that constructs the meta block and
//      calls `pdf(...)` on this template.
//   3. Register the export function in `PDF_TEMPLATES`.
//
// Throws on render so missed integrations fail loudly during dev.

export function AnalystReportTemplate(): never {
  throw new Error(
    'AnalystReportTemplate not yet implemented. See FORGE backlog for the Analyst signature feature sprint.',
  );
}
