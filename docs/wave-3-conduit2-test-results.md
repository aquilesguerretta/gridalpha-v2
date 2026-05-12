# CONDUIT-2 — PDF Export Pipeline Test Results

End-to-end verification of `exportStrategyMemo()` against
`runSimulation()` output for an Industrial Strategy Simulator profile.
Generated PDFs were inspected programmatically (decompressed PDF content
streams, painted text extracted from `TJ` operators with hex-string
decoding) since the screenshot tool times out on heavy renderers.

## Configuration

- Profile: `manufacturing_ohio` ("Auto parts plant — Ohio (PJM AEP)")
- Simulator: 7 strategies evaluated, ranked by base-case NPV
- Top strategy: `Demand Response`, +$2.18M NPV (base), 3-month payback
- Generation date: 2026-04-29

## Performance

- `runSimulation(profile)` — 74 ms
- `exportStrategyMemo(profile, results, 'base')` — 292 ms
- Output blob — 15,341 bytes, MIME `application/pdf`, magic `%PDF-1.3`

## Document structure

Decoded the 5 page content streams via `DecompressionStream('deflate')`
and parsed each `[ ... ] TJ` array into painted text. 218 distinct text
strings recovered across 5 pages.

Verified content (substring checks against the painted-text concatenation):

| Section | Found |
| --- | --- |
| `GridAlpha` brand wordmark in header | ✓ (every page) |
| `STRATEGY MEMO` document type in header | ✓ |
| Generation date `2026-04-29` in header | ✓ |
| Footer brand line `GridAlpha · PJM Market Intelligence` | ✓ |
| Footer page numbers `Page X of Y` | ✓ |
| Hero zone marker `STRATEGY MEMO · AEP` | ✓ |
| Facility name `Auto parts plant — Ohio…` | ✓ |
| `EXECUTIVE SUMMARY` eyebrow | ✓ |
| Executive summary heading `The optimal energy strategy.` | ✓ |
| `STRATEGY RANKING` eyebrow | ✓ |
| Strategy ranking heading `All evaluated strategies.` | ✓ |
| Ranking table headers (`RANK`, `STRATEGY`, `10-`+`YR NPV`, `CAPEX`, `PAYBACK`, `RISK`) | ✓ |
| Top-strategy ranking row (`1`, `Demand Response`, `$2.18`+`M`, `$75.0`+`k`, `3 `+`mo`, `HIGH`) | ✓ |
| `SENSITIVITY` eyebrow | ✓ |
| Sensitivity heading `NPV under three scenarios.` | ✓ |
| `HOURLY DISPATCH` eyebrow | ✓ |
| Dispatch heading `How the day is served.` | ✓ |
| `CARBON REDUCTION` content (`TONS CO`+`2`+` AVOIDED · 10-YR`, `19.0`+`k t`) | ✓ |
| Carbon equivalence (`car-years off the road per year`) | ✓ |
| `METHODOLOGY` eyebrow | ✓ |
| Methodology heading `How this analysis was generated.` | ✓ |
| Methodology body prose | ✓ |
| Disclaimer (`informational purposes`, …) | ✓ |
| Pagination (5 pages from one call) | ✓ |
| `break` directive on ranking + dispatch sections (forces fresh page) | ✓ |

Some longer phrases (e.g. `10-YEAR NPV (BASE CASE)`) didn't match a
naive substring search because @react-pdf/renderer kerns adjacent
glyph runs into separate `TJ` arrays — the painted strings come back
as `["10-", "YEAR NPV "]` etc. The labels and values are present;
they're just split across painting operations. PDF readers concatenate
on display.

## Calling conventions verified

- **CONDUIT-2 native** — `exportStrategyMemo(profile, results, 'base', { filename })`
  with `results: StrategyResult[]` produces a 5-page memo with full ranking.
- **FORGE-compatible** — `exportStrategyMemo(profile, singleResult)` with
  a single `StrategyResult` produces a memo with a one-row ranking table.
  Matches the call site at `src/components/nest/industrial/StrategySimulator/ExportMemoButton.tsx:72`.
- **Object-args** — not supported in V1. The brief's example signature uses
  positional args; FORGE's button uses positional args; the exported
  function matches.

## Known issue — FORGE's runtime feature detection

`src/components/nest/industrial/StrategySimulator/ExportMemoButton.tsx`
attempts to detect this pipeline via:

```ts
const specifier = ['@', '/services/pdfExport'].join('');
const mod: unknown = await import(/* @vite-ignore */ specifier).catch(...)
```

The intent is to defer the import until runtime so the simulator
compiles before the pipeline ships. **In practice this does not
resolve in Vite dev or build:** `@vite-ignore` skips Vite's alias
processing, so the browser fetches the literal URL `@/services/pdfExport`
and gets a 404. `available` stays `false` indefinitely and the button
renders disabled with "PDF EXPORT — COMING SOON" — even though the
pipeline is now shipped and importable via the standard alias.

**This is not a CONDUIT-2 bug.** The pipeline itself is reachable
through ordinary static imports (`import { exportStrategyMemo } from
'@/services/pdfExport'`) and through dev-server raw paths
(`import('/src/services/pdfExport.ts')`). Verified end-to-end against
both.

**Suggested fix for FORGE** (out of CONDUIT-2 scope):

Replace the runtime-string-built specifier with a normal dynamic import.
The pipeline now exists, so deferred loading is no longer needed, and
the alias resolves correctly through Vite:

```ts
async function loadPdfExport(): Promise<PdfExportApi | null> {
  try {
    const mod = await import('@/services/pdfExport');
    if (typeof mod.exportStrategyMemo !== 'function') return null;
    return mod;
  } catch {
    return null;
  }
}
```

Or, simplest, drop the feature detection entirely and import statically
at the top of the file. Either change is one-line and self-contained.

## Constraints / limitations carried into V1

- **Fonts** — V1 uses @react-pdf/renderer's built-in PostScript fallbacks
  (Helvetica = sans, Times-Roman = serif, Courier = mono). The brief
  explicitly authorized system fallbacks. V2 should `Font.register()`
  Inter / Instrument Serif / Geist Mono once a stable URL strategy is
  picked (probably copying TTFs to `public/fonts/` and referencing by
  absolute URL).
- **Chart images** — `PDFChartImage` accepts only PNG/JPEG data URLs.
  `svgStringToPngDataUrl()` is the helper for callers that have an SVG
  string in hand. The template falls back to text-only digests of
  sensitivity scenarios and a 3-hour dispatch sample when chart images
  aren't supplied; this is the path exercised by all tests above.
- **macOS Preview cross-renderer pass** — not done. This host is Windows;
  verification was Chrome's PDF viewer + programmatic stream inspection.
  PDF spec compliance (1.3 magic, valid xref table, correctly-counted
  Pages object, parseable content streams) gives reasonable confidence
  the output renders identically across viewers, but this should be
  confirmed on a Mac before declaring full V1 readiness.

## Build status

- `npx tsc --noEmit` — clean
- `npm run build` — pending (final check after Phases 9–10).
