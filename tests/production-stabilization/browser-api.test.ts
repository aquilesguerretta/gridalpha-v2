import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import {
  browserApiUrl,
  getBackendBase,
  getNewsApiBase,
} from '../../src/lib/backendBase.ts';

const root = fileURLToPath(new URL('../..', import.meta.url));

async function source(path: string): Promise<string> {
  return readFile(`${root}/${path}`, 'utf8');
}

test('browser API resolution is same-origin in production and development', () => {
  assert.equal(browserApiUrl('/api/lmp/current?zone=WEST_HUB'), '/api/lmp/current?zone=WEST_HUB');
  assert.equal(getBackendBase(), '');
  assert.equal(getNewsApiBase(), '');
  assert.throws(() => browserApiUrl('https://example.com/api/lmp/current'));
});

test('local development retains the /api proxy and configurable target', async () => {
  const viteConfig = await source('vite.config.ts');
  assert.match(viteConfig, /env\.VITE_BACKEND_URL/);
  assert.match(viteConfig, /['"]\/api['"]:\s*\{\s*target/);
});

test('Alexandria world Atlas uses a same-origin browser API path', async () => {
  const atlas = await source('src/lib/atlas/worldApi.ts');
  assert.match(atlas, /browserApiUrl\(['"]\/api\/atlas\/world\/countries/);
  assert.doesNotMatch(atlas, /railway\.app/);
});

test('/us live operations uses V2 same-origin endpoints and no V1 runtime', async () => {
  const liveOps = await source('src/hooks/data/useLiveOpsData.ts');
  const globalShell = await source('src/components/GlobalShell.tsx');
  const everyoneNest = await source('src/components/nest/everyone/EveryoneNest.tsx');
  assert.match(liveOps, /\/api\/lmp\/current/);
  assert.match(liveOps, /\/api\/lmp\/24h/);
  assert.match(liveOps, /\/api\/weather\/current/);
  assert.doesNotMatch(liveOps, /VITE_API_URL|gridalpha-production\.up\.railway\.app/);
  assert.doesNotMatch(globalShell, /WESTERN_HUB/);
  assert.doesNotMatch(everyoneNest, /id: 'WESTERN_HUB'|id: 'MET_ED'|id: 'DOM'/);
});

test('SSE builds a valid same-origin EventSource URL', async () => {
  const stream = await source('src/services/api/stream.ts');
  assert.match(stream, /new EventSource\(browserApiUrl\(['"]\/api\/stream['"]\)/);
  assert.doesNotMatch(stream, /railway\.app/);
});
