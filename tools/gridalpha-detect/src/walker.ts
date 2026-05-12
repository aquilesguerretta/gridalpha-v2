// Filesystem walker. Collects TSX/TS/CSS files under the given roots,
// skipping node_modules, build output, the auditor's own source, and
// anything explicitly disabled by a top-of-file `gridalpha-detect-disable
// file` comment.

import { promises as fs } from 'node:fs';
import { join, relative, resolve, extname } from 'node:path';
import type { SourceFile } from './types.js';

const SCANNED_EXTENSIONS = new Set(['.tsx', '.ts', '.css']);

const DEFAULT_IGNORES = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  '.vercel',
  'coverage',
  '.cache',
]);

const FILE_LEVEL_DISABLE_RX =
  /\/\/\s*gridalpha-detect-disable\s+file/;

export interface WalkOptions {
  roots: string[];
  /** Working directory used to compute relPath. Defaults to process.cwd(). */
  cwd?: string;
  /** Extra directory names to skip. */
  extraIgnores?: string[];
}

export async function walk(options: WalkOptions): Promise<SourceFile[]> {
  const cwd = options.cwd ?? process.cwd();
  const ignores = new Set([
    ...DEFAULT_IGNORES,
    ...(options.extraIgnores ?? []),
  ]);
  const out: SourceFile[] = [];

  async function visit(absPath: string): Promise<void> {
    const stat = await fs.stat(absPath);
    if (stat.isDirectory()) {
      const entries = await fs.readdir(absPath);
      for (const name of entries) {
        if (ignores.has(name)) continue;
        if (name.startsWith('.') && !['.'].includes(name)) {
          // Skip dotfiles & dotdirs (e.g. .next, .cache).
          continue;
        }
        await visit(join(absPath, name));
      }
      return;
    }
    if (!stat.isFile()) return;
    const ext = extname(absPath).toLowerCase();
    if (!SCANNED_EXTENSIONS.has(ext)) return;
    const contents = await fs.readFile(absPath, 'utf8');
    if (FILE_LEVEL_DISABLE_RX.test(contents)) return;
    out.push({
      path: absPath,
      relPath: relative(cwd, absPath).replace(/\\/g, '/'),
      contents,
      ext: ext.slice(1),
    });
  }

  for (const root of options.roots) {
    const abs = resolve(cwd, root);
    try {
      await visit(abs);
    } catch (err) {
      // Skip unreadable roots — the runner reports the missing path.
      const msg = (err as { message?: string }).message ?? String(err);
      process.stderr.write(`gridalpha-detect: skipping ${root}: ${msg}\n`);
    }
  }

  return out;
}

/**
 * Per-line directive parser. Used by individual rules that respect
 * `// gridalpha-detect-disable-next-line <rule-id>` and
 * `// gridalpha-detect-disable-next-line` (suppress all rules).
 */
export function isLineSuppressed(
  contents: string,
  line1Based: number,
  ruleId: string,
): boolean {
  const lines = contents.split(/\r?\n/);
  if (line1Based < 2) return false;
  const prev = lines[line1Based - 2] ?? '';
  const directive = /\/\/\s*gridalpha-detect-disable-next-line(?:\s+([\w-]+))?/.exec(prev);
  if (!directive) return false;
  const target = directive[1];
  return !target || target === ruleId;
}
