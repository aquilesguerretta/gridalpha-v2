#!/usr/bin/env node
// gridalpha-detect — the GridAlpha terminal anti-pattern auditor.
//
// Invokes the TypeScript entry through tsx so the bin works straight
// from the repo without a build step. Uses tsx's CLI rather than its
// node loader so this works on Node 18+ regardless of platform.

import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { existsSync } from 'node:fs';

const here  = dirname(fileURLToPath(import.meta.url));
const root  = resolve(here, '..');
const entry = resolve(root, 'src', 'index.ts');

// Prefer the local copy of tsx; fall back to the package entry so
// hosted environments without a binary stub still work.
const localTsxJs = resolve(root, 'node_modules', 'tsx', 'dist', 'cli.mjs');

const cliArgs = [entry, ...process.argv.slice(2)];

const child = existsSync(localTsxJs)
  ? spawn(process.execPath, [localTsxJs, ...cliArgs], { stdio: 'inherit' })
  : spawn('npx', ['tsx', ...cliArgs], { stdio: 'inherit', shell: true });

child.on('exit', (code) => process.exit(code ?? 1));
child.on('error', (err) => {
  process.stderr.write(`gridalpha-detect: failed to launch tsx: ${err.message}\n`);
  process.exit(2);
});
