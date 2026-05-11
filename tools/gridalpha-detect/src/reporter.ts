// Reporter — converts a RunReport into either ANSI-colored human output
// or a JSON document for CI integration.

import {
  ANSI_BOLD,
  ANSI_DIM,
  ANSI_HEADING,
  ANSI_MUTED,
  ANSI_RESET,
  SEVERITY_ANSI,
  SEVERITY_LABEL,
  SEVERITY_ORDER,
  type Severity,
} from './severity.js';
import type { Finding, RunReport } from './types.js';

export function printConsole(report: RunReport): void {
  const lines: string[] = [];
  lines.push('');
  lines.push(
    `${ANSI_BOLD}${ANSI_HEADING}gridalpha-detect${ANSI_RESET}${ANSI_MUTED}  ·  scanned ${report.scannedFiles} files in ${report.durationMs}ms${ANSI_RESET}`,
  );
  lines.push('');

  if (report.findings.length === 0) {
    lines.push(`  ${ANSI_DIM}No findings. Surface is clean.${ANSI_RESET}`);
    lines.push('');
    process.stdout.write(lines.join('\n'));
    return;
  }

  // Group findings by severity, then by file. Within a file, sort by
  // line number ascending.
  const grouped = groupByFile(report.findings);
  for (const sev of SEVERITY_ORDER) {
    const count = report.bySeverity[sev] ?? 0;
    if (count === 0) continue;
    const color = SEVERITY_ANSI[sev];
    lines.push(`  ${color}${ANSI_BOLD}${SEVERITY_LABEL[sev]}${ANSI_RESET}  ${ANSI_DIM}${count}${ANSI_RESET}`);
  }
  lines.push('');

  for (const [file, findings] of grouped) {
    lines.push(`  ${ANSI_HEADING}${file}${ANSI_RESET}`);
    for (const f of findings) {
      const color = SEVERITY_ANSI[f.severity];
      const loc = `${f.line}:${f.column}`;
      lines.push(
        `    ${color}${SEVERITY_LABEL[f.severity]}${ANSI_RESET}  ${ANSI_MUTED}${loc.padEnd(7)}${ANSI_RESET}  ${f.message}  ${ANSI_DIM}[${f.rule}]${ANSI_RESET}`,
      );
      if (f.snippet) {
        lines.push(`        ${ANSI_DIM}${f.snippet}${ANSI_RESET}`);
      }
    }
    lines.push('');
  }

  process.stdout.write(lines.join('\n'));
}

export function printJson(report: RunReport): void {
  const payload = {
    version: 1,
    tool: 'gridalpha-detect',
    scannedFiles: report.scannedFiles,
    durationMs: report.durationMs,
    bySeverity: report.bySeverity,
    findings: report.findings.map((f) => ({
      rule: f.rule,
      severity: f.severity,
      message: f.message,
      file: f.file,
      line: f.line,
      column: f.column,
      snippet: f.snippet,
      reference: f.reference,
    })),
  };
  process.stdout.write(JSON.stringify(payload, null, 2));
  process.stdout.write('\n');
}

function groupByFile(findings: Finding[]): Map<string, Finding[]> {
  const map = new Map<string, Finding[]>();
  for (const f of findings) {
    const arr = map.get(f.file);
    if (arr) arr.push(f);
    else map.set(f.file, [f]);
  }
  for (const arr of map.values()) {
    arr.sort((a, b) =>
      a.line - b.line || a.column - b.column || a.rule.localeCompare(b.rule),
    );
  }
  return map;
}

export function emptySeverityCounts(): Record<Severity, number> {
  return { P0: 0, P1: 0, P2: 0, P3: 0 };
}
