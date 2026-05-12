# gridalpha-detect

Static auditor for the GridAlpha terminal anti-patterns. Encodes the
detectable subset of `.claude/skills/gridalpha-terminal/references/
terminal-antipatterns.md` (and siblings) into a CLI gate that runs
on a developer's machine, in a pre-commit hook, and in CI.

This is GridAlpha's analog to impeccable's `detect` CLI (referenced in
the "Designing with Claude Code" guide) — same pattern, different rule
set because GridAlpha's aesthetic is institutional terminal (Palantir
Gotham, Bloomberg, ISA-101 industrial HMI), not Western minimalism.

> The full Phase 10 documentation lands when the auditor finishes
> Wave 5. This README covers usage + the pre-commit hook integration
> shipped in Phase 8.

---

## Usage

```sh
# Audit the entire src/ tree
node tools/gridalpha-detect/bin/gridalpha-detect.mjs src

# Audit a single file
node tools/gridalpha-detect/bin/gridalpha-detect.mjs src/components/nest/trader/TraderNest.tsx

# JSON output for CI
node tools/gridalpha-detect/bin/gridalpha-detect.mjs src --json

# List every rule
node tools/gridalpha-detect/bin/gridalpha-detect.mjs --list-rules

# Run a single rule (used by tests + targeted audits)
node tools/gridalpha-detect/bin/gridalpha-detect.mjs src --only no-tailwind-on-layout
```

Exit codes:

- `0` — clean run, or only sub-P0 findings (P1/P2/P3)
- `1` — at least one P0 finding
- `2` — invocation error

---

## Pre-commit hook

`.husky/pre-commit` ships with the repo and runs the auditor on
**staged files only** (cheap; runs in ~150ms on a typical commit).

The hook blocks commits on any P0 finding and prints P1+ warnings to
stderr.

### Installation

Two paths.

**With husky (recommended):**

```sh
npm install -D husky
npx husky init
# `npm install` from now on activates the hook automatically.
```

**Without husky (manual):**

```sh
cp .husky/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

### Bypassing

Only for emergencies. `git commit --no-verify` skips the hook.

Routine bypass is a code-smell. Three legitimate cases:

1. **Merge conflict resolution commits** — the violation isn't yours
   to fix; resolve the conflict and the next normal commit catches it.
2. **Mass refactor where a follow-up commit cleans up** — open a
   tracking issue and reference it in the bypass commit message.
3. **CI hot-fix** — production is broken, a P0 will be cleaned up in
   the next commit.

For a single-line legitimate exception, use the disable directive
instead of `--no-verify`:

```tsx
// gridalpha-detect-disable-next-line no-pure-black-white
const PRINT_BG = '#FFFFFF'; // PDF needs literal white
```

To suppress an entire file (rare — usually a sign the file should be
exempted in the rule's path config instead):

```ts
// gridalpha-detect-disable file
// reason: file is a generated Mapbox style config that requires hex literals
```

---

## What the auditor does NOT do

- Doesn't run a browser. Visual / runtime rules (atmospheric vignette
  intensity, focus-ring contrast, motion timing) need Playwright;
  those land in a future wave when CONDUIT's screenshot loop is
  stable.
- Doesn't auto-fix violations. Authors fix or suppress.
- Doesn't enforce ownership boundaries between agents. Tokens and
  primitives still belong to FOUNDRY; rule files belong to CHROMA.

The full rule catalogue, examples, and "how to add a new rule"
template land in Phase 10's README expansion.
