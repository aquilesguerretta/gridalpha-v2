// gridalpha-detect — CLI orchestrator.
//
// Usage:
//   gridalpha-detect <path>...           # human-readable report
//   gridalpha-detect <path>... --json    # JSON output for CI
//   gridalpha-detect <path>... --fast    # skip Playwright-dependent rules (none yet)
//   gridalpha-detect --list-rules        # print the rule catalogue
//   gridalpha-detect --only <rule-id>    # run a single rule (used by tests)
//   gridalpha-detect --no-fail-on-p0     # don't exit 1 on P0 findings
//
// Exit codes:
//   0 — clean run, or only sub-P0 findings (P1/P2/P3)
//   1 — at least one P0 finding (when --no-fail-on-p0 is not set)
//   2 — invocation error (bad args, unreadable root)

import { performance } from 'node:perf_hooks';
import { ALL_RULES, findRule } from './rules/index.js';
import { walk } from './walker.js';
import { printConsole, printJson, emptySeverityCounts } from './reporter.js';
import { SEVERITY_LABEL } from './severity.js';
import type { Finding, RunOptions, RunReport, SourceFile, Rule } from './types.js';

function parseArgs(argv: string[]): RunOptions | { listRules: true } | { invocationError: string } {
  const args = argv.slice();
  const roots: string[] = [];
  let fast = false;
  let json = false;
  let failOnP0 = true;
  let onlyRule: string | undefined;
  let listRules = false;

  while (args.length > 0) {
    const arg = args.shift()!;
    if (arg === '--fast') fast = true;
    else if (arg === '--json') json = true;
    else if (arg === '--no-fail-on-p0') failOnP0 = false;
    else if (arg === '--list-rules') listRules = true;
    else if (arg === '--only') {
      const v = args.shift();
      if (!v) return { invocationError: '--only requires a rule id' };
      onlyRule = v;
    }
    else if (arg.startsWith('--only=')) onlyRule = arg.slice('--only='.length);
    else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
    else if (arg.startsWith('--')) return { invocationError: `unknown flag: ${arg}` };
    else roots.push(arg);
  }

  if (listRules) return { listRules: true } as const;
  if (roots.length === 0) {
    return { invocationError: 'at least one path argument is required' };
  }

  return { roots, fast, json, failOnP0, onlyRule };
}

function printHelp(): void {
  const lines = [
    'gridalpha-detect — GridAlpha terminal anti-pattern auditor',
    '',
    'Usage:',
    '  gridalpha-detect <path>...           Audit one or more paths',
    '  gridalpha-detect <path> --json       Emit a JSON report',
    '  gridalpha-detect <path> --fast       Skip Playwright rules',
    '  gridalpha-detect <path> --only RULE  Run a single rule',
    '  gridalpha-detect --list-rules        Print the rule catalogue',
    '',
    'Exit codes:',
    '  0 — no P0 findings',
    '  1 — at least one P0 finding',
    '  2 — invocation error',
    '',
    'See tools/gridalpha-detect/README.md for the full rule reference.',
    '',
  ];
  process.stdout.write(lines.join('\n'));
}

function listRules(): void {
  const lines = ['Rule catalogue (id · severity · description):', ''];
  for (const r of ALL_RULES) {
    lines.push(`  ${SEVERITY_LABEL[r.severity].padEnd(8)}  ${r.id.padEnd(28)}  ${r.description}`);
  }
  lines.push('');
  process.stdout.write(lines.join('\n'));
}

function runRules(files: SourceFile[], rules: Rule[]): Finding[] {
  const out: Finding[] = [];
  for (const file of files) {
    for (const rule of rules) {
      if (!rule.appliesTo(file)) continue;
      try {
        const findings = rule.check(file);
        out.push(...findings);
      } catch (err) {
        // A rule throwing on a file shouldn't take the whole run down.
        const msg = (err as { message?: string }).message ?? String(err);
        process.stderr.write(
          `gridalpha-detect: rule "${rule.id}" failed on ${file.relPath}: ${msg}\n`,
        );
      }
    }
  }
  return out;
}

async function main(): Promise<number> {
  const parsed = parseArgs(process.argv.slice(2));

  if ('invocationError' in parsed) {
    process.stderr.write(`gridalpha-detect: ${parsed.invocationError}\n`);
    process.stderr.write('Run gridalpha-detect --help for usage.\n');
    return 2;
  }

  if ('listRules' in parsed) {
    listRules();
    return 0;
  }

  const options = parsed as RunOptions;

  // Decide which rules to run.
  let rules = ALL_RULES;
  if (options.onlyRule) {
    const r = findRule(options.onlyRule);
    if (!r) {
      process.stderr.write(`gridalpha-detect: no rule with id "${options.onlyRule}"\n`);
      return 2;
    }
    rules = [r];
  }
  // --fast: filter Playwright-dependent rules. None today; placeholder
  // for CONDUIT Wave 4 runtime rules.
  if (options.fast) {
    // No-op until runtime rules ship.
  }

  const t0 = performance.now();
  const files = await walk({ roots: options.roots });
  const findings = runRules(files, rules);
  const durationMs = Math.round(performance.now() - t0);

  const bySeverity = emptySeverityCounts();
  for (const f of findings) bySeverity[f.severity] += 1;

  const report: RunReport = {
    scannedFiles: files.length,
    findings,
    bySeverity,
    durationMs,
  };

  if (options.json) printJson(report);
  else printConsole(report);

  if (options.failOnP0 && bySeverity.P0 > 0) return 1;
  return 0;
}

main().then(
  (code) => process.exit(code),
  (err) => {
    process.stderr.write(`gridalpha-detect: unexpected error: ${String(err)}\n`);
    process.exit(2);
  },
);
