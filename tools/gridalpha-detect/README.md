# gridalpha-detect

Static auditor for the GridAlpha terminal anti-patterns. Encodes the
detectable subset of `.claude/skills/gridalpha-terminal/references/`
(FOUNDRY's design vocabulary) into a CLI gate that runs on a
developer's machine, in a pre-commit hook, and in CI.

This is GridAlpha's analog to impeccable's `detect` CLI (referenced in
the "Designing with Claude Code" guide) — same enforcement pattern,
different rule set. Where impeccable's gate is tuned for Western
minimalism, ours is tuned for institutional terminal aesthetic
(Palantir Gotham × Bloomberg × ISA-101 industrial HMI).

The auditor exists to catch what slips past three other layers:

1. **The skill itself** — FOUNDRY's `gridalpha-terminal` skill primes
   the model at write-time.
2. **CHROMA hand-passes** — each wave reviews surfaces for cohesion.
3. **Screenshot verification** — CONDUIT's Playwright loop catches
   visual regressions.

Three layers of defense. The auditor catches what slips past all of
them.

---

## Quick start

```sh
# Audit the entire src/ tree
node tools/gridalpha-detect/bin/gridalpha-detect.mjs src

# Audit specific files
node tools/gridalpha-detect/bin/gridalpha-detect.mjs \
  src/components/nest/trader/TraderNest.tsx

# JSON output for CI integration
node tools/gridalpha-detect/bin/gridalpha-detect.mjs src --json > audit.json

# List every rule with severity and description
node tools/gridalpha-detect/bin/gridalpha-detect.mjs --list-rules

# Run a single rule (used by tests + targeted sweeps)
node tools/gridalpha-detect/bin/gridalpha-detect.mjs src \
  --only no-tailwind-on-layout

# Don't block on P0 (rare; useful for measurement)
node tools/gridalpha-detect/bin/gridalpha-detect.mjs src --no-fail-on-p0
```

Exit codes:

| Code | Meaning |
| --- | --- |
| `0` | clean run, or only sub-P0 findings (P1/P2/P3) |
| `1` | at least one P0 finding |
| `2` | invocation error (bad args, unreadable root) |

---

## Severity

| Severity | Behavior | Examples |
| --- | --- | --- |
| **P0 BLOCK** | Blocks the pre-commit hook + CI check. | Default Inter, pure #000/#FFF, gradient text, Tailwind on layout-critical, easeOutBounce easing, sine-wave decorative SVG. |
| **P1 WARN** | Surfaces in output, requires acknowledgment but does NOT block. | Numeric data missing tabular-nums, box-shadow on a data card, pill chip on a metadata role. |
| **P2 INFO** | Worth fixing but doesn't immediately break the surface. | Grid with 3+ children and no dominant focal marker. |
| **P3 NOTE** | Informational. Surfaced in `--json` reports for trend tracking; suppressed by default in console output. (No P3 rules ship today.) |

---

## The rule catalogue

All 10 rules. The "Source" column points at the FOUNDRY skill reference
that authorizes the rule.

### P0 (blocks merge)

#### 1. `no-tailwind-on-layout`

**Catches:** Tailwind utility classes for height/width/padding/margin/
gap/grid-cols/flex-direction/positioning on elements inside terminal
surfaces.

```tsx
// ✗
<div className="grid grid-cols-3 gap-4 p-6">…</div>

// ✓
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: S.lg, padding: S.lg }}>…</div>
```

**Source:** `terminal-antipatterns.md` → "Tailwind on layout-critical
elements". Historical failure: Generation Mix bar's Tailwind `h-X`
utilities broke on resize inside the established grid pattern.

**Exemptions:** `/components/editorial/`, `/components/landing/`,
`/components/ui/` (shadcn), `/components/figma-reference/`,
`/pages/auth/` + `GlobalShell.tsx`, `FalconLogo.tsx`, `LMPCard.tsx`,
`LandingPage.tsx`.

---

#### 2. `no-decorative-svg`

**Catches:** Inline SVG `<path d="…">` whose path signature looks like
a hand-drawn sine wave (3+ cubic-bezier segments, no straight-line
commands, Y coordinates alternating above/below a baseline).

```tsx
// ✗ (a fake hero "chart")
<svg viewBox="0 0 100 50">
  <path d="M0 25 C20 0 30 50 50 25 C70 0 80 50 100 25" stroke="…"/>
</svg>

// ✓
<ResponsiveContainer width="100%" height={140}>
  <LineChart data={liveLmp24h}>…</LineChart>
</ResponsiveContainer>
```

**Source:** `terminal-antipatterns.md` → "Sine-wave decorative SVGs
masquerading as data". The operator sees real data on every other
surface; a fake sine wave breaks the trust contract.

**Exemptions:** `/components/terminal/` (FOUNDRY's icon primitives),
`/components/ui/`, editorial paths, `FalconLogo.tsx`.

---

#### 3. `no-inter-no-system`

**Catches:** `fontFamily` / `font-family` declarations on the
terminal layer that:
- Name Inter, system-ui, -apple-system, SF Pro, Segoe UI, or
  Roboto AND don't put Geist Mono first in the stack.
- Use bare `monospace` without `Geist Mono` as the primary.

```tsx
// ✗
fontFamily: 'Inter, system-ui, sans-serif'

// ✗ (bare monospace)
fontFamily: 'monospace'

// ✓
fontFamily: F.mono  // resolves to "'Geist Mono', 'Fira Code', monospace"
```

**Source:** `terminal-typography.md` → font lock.

**Exemptions:** editorial / landing / auth + `LandingPage.tsx`,
`design/editorial.ts`.

---

#### 4. `no-pure-black-white`

**Catches:** `#000`, `#000000`, `#FFF`, `#FFFFFF`, `rgb(0,0,0)`,
`rgb(255,255,255)` in TSX inline styles, TS files, or CSS.

```tsx
// ✗
color: '#FFFFFF'

// ✓
color: C.textPrimary  // #F1F1F3
```

**Source:** `terminal-color.md` → "No pure black `#000000`",
"No pure white `#FFFFFF`".

**Exemptions:** editorial / landing / auth / figma-reference /
shadcn ui + `LandingPage.tsx` + `design/editorial.ts` +
`/components/atlas/layers/` (Mapbox layer expressions need hex) +
`/services/pdfTemplates/` + `services/pdfExport.ts` (printed paper).

---

#### 5. `no-gradient-text`

**Catches:** `background-clip: text` (or `-webkit-background-clip:
text` / TSX `backgroundClip: 'text'` / Tailwind `bg-clip-text`) AND
a gradient fill in the same style declaration.

```tsx
// ✗
<h1 style={{
  backgroundImage: 'linear-gradient(90deg, …)',
  WebkitBackgroundClip: 'text',
  color: 'transparent',
}}>…</h1>

// ✓
<h1 style={{ color: C.textPrimary, fontSize: 32 }}>…</h1>
```

**Source:** `terminal-antipatterns.md` → "Gradient text for emphasis".

**Exemptions:** editorial / landing / auth + `LandingPage.tsx`.

---

#### 6. `no-easeOutBounce`

**Catches:**
- `easeOutBounce`, `bounceIn`, `bounceOut`, `bounceInOut`
- `easeOutElastic`, `easeInElastic`, `easeInOutElastic`
- GSAP `Bounce.easeOut` / `Bounce.easeIn`
- GSAP `Elastic.easeOut` / `Elastic.easeIn`
- GSAP `Back.easeOut` / `Back.easeIn` (overshoot)
- Framer Motion `type: 'spring'`
- Framer Motion `bounce: <number>`

```tsx
// ✗
transition={{ type: 'spring', bounce: 0.4 }}

// ✓
transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)'
```

**Source:** `terminal-motion.md` → "Forbidden easings: spring, bounce,
elastic".

**Exemptions:** editorial paths.

---

### P1 (warns)

#### 7. `require-tabular-nums`

**Catches:** Elements opt-marked as numeric (via `className`
containing `"numeric"`, `data-numeric` attribute, or
`data-display="metric"`) that don't also declare
`fontVariantNumeric: 'tabular-nums'` (or spread `T.dataValue` /
`T.displayValue` which include it).

```tsx
// ✗
<span data-numeric>{price.toFixed(2)}</span>

// ✓
<span data-numeric style={{ ...T.dataValue }}>{price.toFixed(2)}</span>

// or
<span data-numeric style={{ fontVariantNumeric: 'tabular-nums', fontFamily: F.mono }}>
  {price.toFixed(2)}
</span>
```

**Source:** `terminal-typography.md` → "A numeric value rendered
without tabular-nums is a defect, not a preference."

**Exemptions:** editorial / landing / auth.

---

#### 8. `no-pill-chip-default`

**Catches:** JSX elements with `data-role="metadata" | "chip" | "tag"`
that also carry a pill-shape signal (`rounded-full`, `borderRadius:
9999`, `'50%'`, `'100%'`).

`role="status"` is INTENTIONALLY excluded — that's the canonical
small-circle pattern (`StatusDot`, `ConnectionStatusDot`,
`RegimeBadge` dot), not the antipattern.

```tsx
// ✗
<span data-role="metadata" className="rounded-full bg-blue-100 px-3 py-1">
  WEST_HUB
</span>

// ✓ (the platform's badge pattern)
<RegimeBadge regime="burning" />
// or
<span data-role="metadata" style={{
  display: 'inline-flex', alignItems: 'center', gap: 6,
  fontFamily: F.mono, fontSize: 11, textTransform: 'uppercase',
  letterSpacing: '0.12em', color: C.textMuted,
}}>
  <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.alertNormal }} />
  WEST_HUB
</span>
```

**Source:** `terminal-antipatterns.md` → "Pill-shaped chips with full
border-radius for metadata".

**Exemptions:** editorial / landing / auth.

---

#### 9. `no-box-shadow-on-cards`

**Catches:** Card elements (FOUNDRY components by name —
`ContainedCard`, `MetricTile`, etc. — or anything with
`data-component="Card"` / `data-elevation="card"` / `className`
containing `"Card"`) that declare a `boxShadow` other than
`none` / `inset`.

Escape hatch: add `data-elevation-override` to the card if it's a
raised overlay that legitimately needs a shadow.

```tsx
// ✗
<ContainedCard style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.20)' }}>…</ContainedCard>

// ✓ (elevation lives in the bg-token tier)
<ContainedCard>…</ContainedCard>

// ✓ (raised overlay opting in)
<ContainedCard data-elevation-override style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.20)' }}>…</ContainedCard>
```

**Source:** `terminal-color.md` → "No drop shadows on data cards.
Elevation shifts via surface hex."

**Exemptions:** editorial / landing / auth.

---

### P2 (info)

#### 10. `equal-weight-grid`

**Catches:** Grid containers (`display: grid` or Tailwind
`grid-cols-N`) with 3+ direct children and no child marked as the
dominant focal element via `data-hero`, `data-focal`, or `className`
containing `"hero"`, `"primary"`, `"dominant"`, `"focal"`.

```tsx
// ⚠ (auditor surfaces; reviewer decides)
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: S.md }}>
  <Card>…</Card>
  <Card>…</Card>
  <Card>…</Card>
</div>

// ✓
<div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: S.md }}>
  <Card data-hero>…</Card>
  <Card>…</Card>
  <Card>…</Card>
</div>

// ✓ (legitimately equal-weight — suppress)
// gridalpha-detect-disable-next-line equal-weight-grid
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>…</div>
```

**Source:** `terminal-composition.md` → "Every screen, every region,
must have one element whose visual weight is at least 2× the
next-highest element. This is non-negotiable."

**Exemptions:** editorial / landing / auth.

---

## Suppression

### Line-level

```tsx
// gridalpha-detect-disable-next-line no-pure-black-white
const PRINT_BG = '#FFFFFF'; // PDF needs literal white
```

Without a rule id, suppresses every rule on the next line.

### File-level

```ts
// gridalpha-detect-disable file
// reason: generated Mapbox style config; literal hex is required
```

Top-of-file. The walker skips the file entirely. Use sparingly — a
file-wide bypass usually means the rule's path-config should be
updated instead.

### Bypass-the-hook

```sh
git commit --no-verify -m "…"
```

Three legitimate cases (everything else fixes the violation or uses
a directive):

1. Merge conflict resolution.
2. Mass refactor with a follow-up cleanup commit.
3. CI hot-fix.

---

## Reading the JSON report

```sh
node tools/gridalpha-detect/bin/gridalpha-detect.mjs src --json
```

```json
{
  "version": 1,
  "tool": "gridalpha-detect",
  "scannedFiles": 477,
  "durationMs": 293,
  "bySeverity": { "P0": 40, "P1": 0, "P2": 22, "P3": 0 },
  "findings": [
    {
      "rule": "no-pure-black-white",
      "severity": "P0",
      "message": "Pure white (#FFFFFF) — use C.textPrimary (or another four-tier token).",
      "file": "src/components/LMPCard.tsx",
      "line": 37,
      "column": 89,
      "snippet": "<span style={{ fontFamily: F.mono, fontSize: '72px', fontWeight: 'bold', color: '#FFFFFF', lineHeight: 1 }}>",
      "reference": "Pure black #000000 or pure white #FFFFFF"
    }
  ]
}
```

The CI workflow consumes this shape. Field stability is part of the
contract — additive changes are fine; renaming or removing fields is
a breaking change requiring a version bump.

---

## Adding a new rule

When a new anti-pattern emerges (FOUNDRY adds a new section to
`terminal-antipatterns.md`, CHROMA spots a new failure mode in a
wave audit), wire it as a rule in three steps.

### 1. Decide severity

Use the severity table at the top of this file.

### 2. Write the rule file

`src/rules/<rule-id>.ts` exports a default `Rule`:

```ts
import type { Rule, Finding, SourceFile } from '../types.js';
import { isLineSuppressed } from '../walker.js';

const RULE_ID = 'rule-id';

const ALLOWED_DIRS = [
  '/components/editorial/',
  '/components/landing/',
  // …editorial-layer exemptions
];

function isAllowedPath(relPath: string): boolean {
  const norm = relPath.replace(/\\/g, '/');
  return ALLOWED_DIRS.some((dir) => norm.includes(dir));
}

function indexToLineCol(s: string, idx: number): { line: number; column: number } {
  let line = 1;
  let col = 1;
  for (let i = 0; i < idx && i < s.length; i++) {
    if (s[i] === '\n') { line += 1; col = 1; } else { col += 1; }
  }
  return { line, column: col };
}

const rule: Rule = {
  id: RULE_ID,
  severity: 'P1',  // or P0 / P2 / P3
  description: 'One-line description.',
  reference: 'Section title in terminal-antipatterns.md',

  appliesTo(file: SourceFile): boolean {
    if (file.ext !== 'tsx') return false;
    if (isAllowedPath(file.relPath)) return false;
    return true;
  },

  check(file: SourceFile): Finding[] {
    const findings: Finding[] = [];
    // …regex / AST walk against file.contents
    //   on a match, compute { line, column } via indexToLineCol
    //   check isLineSuppressed(file.contents, line, RULE_ID)
    //   push a Finding
    return findings;
  },
};

export default rule;
```

### 3. Register in the rule index

Add the import + the export to `src/rules/index.ts`:

```ts
import myNewRule from './my-new-rule.js';
export const ALL_RULES: Rule[] = [
  // …
  myNewRule,
];
```

### Checklist before shipping the rule

- [ ] Rule passes `npm run typecheck`.
- [ ] Rule fires on at least one synthetic violation (write a quick
      `tests/`-style test or run `--only <rule-id>` against a file
      you've added a violation to).
- [ ] Rule produces zero false-positives on the existing src/ (or
      every false-positive is documented in the rule's exemptions).
- [ ] Rule entry added to this README's catalogue.
- [ ] Commit message references the FOUNDRY skill section that
      authorizes the rule.

---

## Pre-commit hook

`.husky/pre-commit` ships with the repo and runs the auditor on
staged TSX/TS/CSS files before each commit. Blocks on P0, warns on
P1+.

### Installation

```sh
# With husky (recommended)
npm install -D husky
npx husky init

# Manual
cp .husky/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

See "Suppression → Bypass-the-hook" above for legitimate bypass
cases.

---

## CI integration

Documented at [`ci-integration.md`](./ci-integration.md). The GitHub
Actions workflow is ready to deploy — Aquiles activates it when ready
by copying the YAML to `.github/workflows/gridalpha-detect.yml`.

---

## What the auditor does NOT do

- **Doesn't run a browser.** Visual / runtime rules (atmospheric
  vignette intensity, focus-ring contrast, motion timing) need
  Playwright. Future: integrate with CONDUIT's screenshot loop.
- **Doesn't auto-fix violations.** Authors fix or suppress.
- **Doesn't enforce ownership boundaries between agents.** Tokens
  are FOUNDRY's; rule files are CHROMA's. The auditor itself
  doesn't police "who owns what file" — git history does.
- **Doesn't reach the editorial layer.** Editorial / landing / auth
  surfaces have their own (looser) rules; the auditor exempts those
  paths by default.

---

## Roadmap

- **Runtime rules** via Playwright (post-CONDUIT Wave 4 stabilization).
- **Auto-fix mode** (`--auto-fix`) for mechanical P0 violations
  (`'#fff'` → `C.textPrimary`, default `Inter` → `F.mono` import,
  etc.).
- **Skill-sourced rule descriptions.** Today the rule's `reference`
  field is a string; a future iteration parses
  `.claude/skills/gridalpha-terminal/references/` at rule-build time
  so changes to the skill flow through automatically.
- **TypeScript AST mode** for the rules that currently regex —
  trades a small perf hit for false-positive reduction on complex
  JSX.
