// CONDUIT-2 — stub template, not yet implemented.
//
// Future agents wiring the Trader Position Brief can follow the same
// path as the Analyst Report stub (build the component on top of
// shared primitives, add an `exportTraderBrief(...)` in
// `services/pdfExport.ts`, register in `PDF_TEMPLATES`).
//
// Throws on render so missed integrations fail loudly during dev.

export function TraderBriefTemplate(): never {
  throw new Error(
    'TraderBriefTemplate not yet implemented. See backlog for the Trader Position Brief signature feature sprint.',
  );
}
