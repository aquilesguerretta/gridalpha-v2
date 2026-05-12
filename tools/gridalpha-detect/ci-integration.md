# gridalpha-detect — CI integration

Documented integration pattern for running the auditor on GitHub Actions.
**Not deployed yet.** Aquiles activates this by copying the workflow
file from this doc to `.github/workflows/gridalpha-detect.yml` and
pushing to `feature/full-shell-buildout`.

The local equivalent (what to run on your machine before pushing) is
documented at the bottom of this file.

---

## Why "documented but not deployed"

`gh auth login` isn't configured in the agent harness right now, so
shipping a workflow file that depends on `GITHUB_TOKEN` for PR-comment
posting would land code that an agent can't validate end-to-end. The
workflow itself is straightforward and well-formed — it's just
parked here until Aquiles green-lights deployment.

When activated, the workflow runs on every PR opened against any base
branch and on every push to `feature/full-shell-buildout`. It scopes
the audit to the diff against the merge base (or the prior push,
for direct pushes) so the report stays focused on what changed.

---

## The workflow file

Copy the YAML below into `.github/workflows/gridalpha-detect.yml`.

```yaml
name: gridalpha-detect

on:
  pull_request:
    types: [opened, synchronize, reopened]
  push:
    branches:
      - feature/full-shell-buildout

permissions:
  contents: read
  pull-requests: write   # for the PR-comment posting step

concurrency:
  group: gridalpha-detect-${{ github.ref }}
  cancel-in-progress: true

jobs:
  audit:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          # Need history to diff against the merge base on PRs.
          fetch-depth: 0

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: |
            package-lock.json
            tools/gridalpha-detect/package-lock.json

      - name: Install root dependencies
        run: npm ci --no-audit --no-fund --prefer-offline

      - name: Install auditor dependencies
        working-directory: tools/gridalpha-detect
        run: npm ci --no-audit --no-fund --prefer-offline

      - name: Compute changed file set
        id: changes
        shell: bash
        run: |
          set -euo pipefail
          if [ "${{ github.event_name }}" = "pull_request" ]; then
            BASE_SHA="${{ github.event.pull_request.base.sha }}"
            HEAD_SHA="${{ github.event.pull_request.head.sha }}"
          else
            BASE_SHA="${{ github.event.before }}"
            HEAD_SHA="${{ github.event.after }}"
          fi
          # Diff and filter to file extensions the auditor scans,
          # excluding the auditor's own source so it doesn't audit
          # itself during normal CI runs.
          CHANGED=$(git diff --name-only --diff-filter=ACMR \
            "$BASE_SHA" "$HEAD_SHA" \
            | grep -E '\.(tsx|ts|css)$' \
            | grep -v '^tools/gridalpha-detect/' \
            || true)
          {
            echo "files<<EOF"
            echo "$CHANGED"
            echo "EOF"
          } >> "$GITHUB_OUTPUT"
          if [ -z "$CHANGED" ]; then
            echo "No TSX/TS/CSS changes in this diff."
            echo "skip=true" >> "$GITHUB_OUTPUT"
          else
            echo "skip=false" >> "$GITHUB_OUTPUT"
          fi

      - name: Run gridalpha-detect
        if: steps.changes.outputs.skip != 'true'
        id: audit
        shell: bash
        run: |
          set +e
          mapfile -t FILES <<< "${{ steps.changes.outputs.files }}"
          node tools/gridalpha-detect/bin/gridalpha-detect.mjs \
            "${FILES[@]}" --json > audit.json
          AUDIT_EXIT=$?
          echo "exit=$AUDIT_EXIT" >> "$GITHUB_OUTPUT"
          # Also produce a human-readable copy for the workflow logs.
          node tools/gridalpha-detect/bin/gridalpha-detect.mjs \
            "${FILES[@]}" || true

      - name: Upload audit report
        if: steps.changes.outputs.skip != 'true'
        uses: actions/upload-artifact@v4
        with:
          name: gridalpha-detect-report
          path: audit.json
          retention-days: 30

      - name: Post PR comment
        if: github.event_name == 'pull_request' && steps.changes.outputs.skip != 'true'
        uses: actions/github-script@v7
        env:
          AUDIT_PATH: audit.json
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          script: |
            const fs = require('fs');
            const report = JSON.parse(fs.readFileSync(process.env.AUDIT_PATH, 'utf8'));
            const counts = report.bySeverity || { P0: 0, P1: 0, P2: 0, P3: 0 };
            const total = report.findings.length;
            const status = counts.P0 > 0 ? '✗ BLOCKED' : (total > 0 ? '⚠ WARNINGS' : '✓ CLEAN');
            const body = [
              `### gridalpha-detect · ${status}`,
              '',
              `Scanned **${report.scannedFiles}** changed files in ${report.durationMs}ms.`,
              '',
              `| Severity | Count |`,
              `| --- | --- |`,
              `| P0 BLOCK | ${counts.P0} |`,
              `| P1 WARN  | ${counts.P1} |`,
              `| P2 INFO  | ${counts.P2} |`,
              `| P3 NOTE  | ${counts.P3} |`,
              '',
            ].join('\n');
            // Top 10 findings inline for quick review.
            const findings = report.findings.slice(0, 10).map(f =>
              `- **${f.severity}** \`${f.file}:${f.line}\` — ${f.message}`,
            ).join('\n');
            const extra = report.findings.length > 10
              ? `\n_…and ${report.findings.length - 10} more. Full report attached as workflow artifact._`
              : '';
            const fullBody = body + (findings ? '\n' + findings + extra : '');
            const { owner, repo } = context.repo;
            const issue_number = context.payload.pull_request.number;
            // Replace the previous comment if one exists from this bot.
            const { data: comments } = await github.rest.issues.listComments({ owner, repo, issue_number });
            const existing = comments.find(c =>
              c.user?.type === 'Bot' && c.body?.startsWith('### gridalpha-detect ·'),
            );
            if (existing) {
              await github.rest.issues.updateComment({ owner, repo, comment_id: existing.id, body: fullBody });
            } else {
              await github.rest.issues.createComment({ owner, repo, issue_number, body: fullBody });
            }

      - name: Fail on P0
        if: steps.changes.outputs.skip != 'true' && steps.audit.outputs.exit != '0'
        run: |
          echo "gridalpha-detect found P0 violations. Failing the check."
          exit 1
```

### Required secrets / permissions

- **`GITHUB_TOKEN`** — provided automatically by Actions. Used by the
  PR-comment step. The `permissions:` block above already requests
  the `pull-requests: write` scope.
- **No external secrets.** The auditor runs entirely on staged code;
  it doesn't talk to any third-party service.

### Check status mapping

| Auditor exit | GitHub check status | When |
| --- | --- | --- |
| `0` with no findings | success | clean run |
| `0` with P1/P2 findings | success + PR comment | warnings only |
| `1` (any P0) | failure + PR comment | blocks merge |
| `2` | failure | invocation error (rare; means CI is misconfigured) |

The `Fail on P0` step is the gate. The PR-comment step always runs
(when there are changes) so reviewers see the breakdown regardless
of pass/fail.

---

## How to enable

1. Copy the YAML above into `.github/workflows/gridalpha-detect.yml`
   on `feature/full-shell-buildout`.
2. Push.
3. GitHub Actions activates on the next PR opened against any base
   branch and on the next push to `feature/full-shell-buildout`.
4. The first run will probably surface the existing P0 backlog
   (LMPCard hex literals, EveryoneNest Tailwind, etc.). Decide
   per-finding whether to fix or suppress with a disable
   directive. Bypassing with `--no-verify` doesn't apply to CI
   (CI doesn't honor local hook bypass) — fixes have to land in
   the codebase.

---

## Local equivalent

Run the same check on your machine before pushing:

```sh
# What the CI runs — audit the diff against main.
node tools/gridalpha-detect/bin/gridalpha-detect.mjs \
  $(git diff --name-only --diff-filter=ACMR main feature/full-shell-buildout \
    | grep -E '\.(tsx|ts|css)$' \
    | grep -v '^tools/gridalpha-detect/')
```

For a tighter loop (just the files you have staged right now), the
pre-commit hook (`.husky/pre-commit`) does this automatically.

---

## Roadmap

- **Runtime rules.** Once CONDUIT's Playwright screenshot loop is
  stable, additional rules ship that load the rendered page and
  check atmospheric vignette intensity, focus-ring contrast, and
  motion timing. The CI job here grows a second `runtime-audit`
  job that runs after the static audit.
- **Auto-fix mode.** Mechanical P0 violations (`#FFFFFF` → `C.textPrimary`,
  `'#fff'` → `C.textPrimary`, etc.) get an `--auto-fix` flag that
  writes the changes back. Authors review the diff and commit.
- **Rule sourcing from the skill.** Today rule descriptions reference
  FOUNDRY's terminal-*.md by string. A future iteration parses the
  references at rule-build time so updates to the skill flow
  through automatically.
