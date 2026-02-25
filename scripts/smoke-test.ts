/**
 * GridAlpha V2 — Sprint 0 smoke test.
 *
 * Hits every production endpoint with ?demo=true and asserts the
 * ApiEnvelope shape: { meta, data (non-empty array), summary }.
 *
 * Exit code 1 on any failure.
 *
 * Usage:  npx tsx scripts/smoke-test.ts
 */

const BASE_URL = "https://gridalpha-production.up.railway.app";

const ENDPOINTS = [
  "/generation",
  "/lmp",
  "/spark-spread",
  "/battery-arbitrage",
  "/sync-status",
] as const;

interface EnvelopeShape {
  meta: unknown;
  data: unknown[];
  summary: unknown;
}

let failures = 0;

async function assertEndpoint(path: string): Promise<void> {
  const url = `${BASE_URL}${path}?demo=true`;
  const tag = `[${path}]`;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      console.error(`${tag} HTTP ${res.status} ${res.statusText}`);
      failures++;
      return;
    }

    const body = (await res.json()) as Partial<EnvelopeShape>;

    // meta exists
    if (!body.meta || typeof body.meta !== "object") {
      console.error(`${tag} FAIL — missing or invalid "meta" field`);
      failures++;
      return;
    }

    // data exists and is a non-empty array
    if (!Array.isArray(body.data)) {
      console.error(`${tag} FAIL — "data" is not an array`);
      failures++;
      return;
    }
    if (body.data.length === 0) {
      console.error(`${tag} FAIL — "data" array is empty`);
      failures++;
      return;
    }

    // summary exists
    if (!body.summary || typeof body.summary !== "object") {
      console.error(`${tag} FAIL — missing or invalid "summary" field`);
      failures++;
      return;
    }

    console.log(
      `${tag} OK — ${body.data.length} row(s), meta.api_version=${(body.meta as Record<string, unknown>).api_version ?? "?"}`,
    );
  } catch (err) {
    console.error(`${tag} NETWORK ERROR —`, (err as Error).message);
    failures++;
  }
}

async function main(): Promise<void> {
  console.log(`\nGridAlpha smoke test — ${BASE_URL}\n`);

  await Promise.all(ENDPOINTS.map(assertEndpoint));

  console.log(
    `\n${ENDPOINTS.length - failures}/${ENDPOINTS.length} passed\n`,
  );

  if (failures > 0) {
    process.exit(1);
  }
}

main();
