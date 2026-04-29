// CONDUIT-2 — stub template, not yet implemented.
//
// Future agents wiring the Developer Site Report can follow the same
// path as the Analyst Report stub (build the component on top of
// shared primitives, add an `exportDeveloperSiteReport(...)` in
// `services/pdfExport.ts`, register in `PDF_TEMPLATES`).
//
// Throws on render so missed integrations fail loudly during dev.

export function DeveloperSiteReportTemplate(): never {
  throw new Error(
    'DeveloperSiteReportTemplate not yet implemented. See backlog for the Developer Site Report signature feature sprint.',
  );
}
