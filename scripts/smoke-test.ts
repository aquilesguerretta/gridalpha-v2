/**
 * GridAlpha V2 backend smoke test.
 *
 * Hits every Wave-5 canonical endpoint and asserts the {meta, data,
 * summary} envelope shape. Verifies the SSE stream by reading a single
 * frame.
 *
 * Exit code 1 on any failure.
 *
 * Usage:
 *   npx tsx scripts/smoke-test.ts
 *   API_BASE=https://gridalpha-v2-production.up.railway.app npx tsx scripts/smoke-test.ts
 *   API_BASE=http://localhost:8000 npx tsx scripts/smoke-test.ts
 */

const BASE_URL =
  process.env.API_BASE || "https://gridalpha-v2-production.up.railway.app";

interface Envelope {
  meta: Record<string, unknown>;
  data: unknown;
  summary: string;
}

type Check = {
  label: string;
  path: string;
  /** Optional extra assertions on top of the standard envelope check. */
  extra?: (env: Envelope, raw: string) => string | null;
};

const tomorrow = (() => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
})();

const stormElliott = {
  start: "2022-12-23T00:00:00Z",
  end: "2022-12-26T23:55:00Z",
};

const CHECKS: Check[] = [
  {
    label: "Endpoint 1 - /api/lmp/current",
    path: "/api/lmp/current?zone=WEST_HUB",
    extra: (env) => {
      const d = env.data as Record<string, unknown>;
      if (typeof d.lmp_total !== "number") return "data.lmp_total missing";
      if (typeof d.delta_pct_5min !== "number")
        return "data.delta_pct_5min missing";
      return null;
    },
  },
  {
    label: "Endpoint 2 - /api/lmp/all-zones",
    path: "/api/lmp/all-zones",
    extra: (env) => {
      const d = env.data as Record<string, unknown>;
      const zones = Object.keys(d);
      if (zones.length < 18)
        return `expected ~20 zones, got ${zones.length}`;
      if (!("WEST_HUB" in d) || !("PSEG" in d))
        return "expected WEST_HUB and PSEG zones";
      return null;
    },
  },
  {
    label: "Endpoint 3 - /api/lmp/24h",
    path: "/api/lmp/24h?zone=WEST_HUB",
    extra: (env) => {
      if (!Array.isArray(env.data)) return "data is not an array";
      if (env.data.length < 200)
        return `expected ~288 rows, got ${env.data.length}`;
      return null;
    },
  },
  {
    label: "Endpoint 4 - /api/lmp/da-forecast",
    path: `/api/lmp/da-forecast?zone=PSEG&date=${tomorrow}`,
    extra: (env) => {
      if (!Array.isArray(env.data)) return "data is not an array";
      if (env.data.length < 22)
        return `expected ~24 hourly rows, got ${env.data.length}`;
      const first = env.data[0] as Record<string, unknown>;
      if (typeof first.hour !== "number" || typeof first.lmp !== "number")
        return "data row missing 'hour' or 'lmp'";
      return null;
    },
  },
  {
    label: "Endpoint 5 - /api/lmp/history (Storm Elliott)",
    path: `/api/lmp/history?zone=PSEG&start=${stormElliott.start}&end=${stormElliott.end}&interval=hourly`,
    extra: (env) => {
      if (!Array.isArray(env.data)) return "data is not an array";
      if (env.data.length < 80)
        return `expected ~96 hourly rows, got ${env.data.length}`;
      const peak = (env.data as Array<{ lmp_total: number }>)
        .map((r) => r.lmp_total)
        .reduce((m, v) => (v > m ? v : m), -Infinity);
      if (peak < 1000)
        return `Storm Elliott peak should be > $1000/MWh, saw $${peak.toFixed(2)}`;
      return null;
    },
  },
  {
    label: "Endpoint 6 - /api/spark-spread/current",
    path: "/api/spark-spread/current?zone=PSEG",
    extra: (env) => {
      const d = env.data as Record<string, unknown>;
      if (typeof d.spark_spread !== "number")
        return "data.spark_spread missing";
      const regime = String(d.regime || "");
      if (!["BURNING", "NORMAL", "SUPPRESSED"].includes(regime))
        return `unexpected regime ${regime}`;
      return null;
    },
  },
  {
    label: "Endpoint 7 - /api/fuel-mix/current",
    path: "/api/fuel-mix/current",
    extra: (env) => {
      const d = env.data as Record<string, unknown>;
      const fuels = d.fuels as Array<Record<string, unknown>> | undefined;
      if (!Array.isArray(fuels) || fuels.length < 8)
        return "data.fuels missing or short";
      if (typeof d.system_carbon_intensity_kg_per_mwh !== "number")
        return "system carbon intensity missing";
      return null;
    },
  },
  {
    label: "Endpoint 8 - /api/reserve-margin/current",
    path: "/api/reserve-margin/current",
    extra: (env) => {
      const d = env.data as Record<string, unknown>;
      if (typeof d.reserve_margin_pct !== "number")
        return "data.reserve_margin_pct missing";
      const regime = String(d.regime || "");
      if (!["TIGHT", "ADEQUATE", "COMFORTABLE"].includes(regime))
        return `unexpected regime ${regime}`;
      return null;
    },
  },
  {
    label: "Endpoint 9 - /api/outages/current",
    path: "/api/outages/current",
    extra: (env) => {
      if (!Array.isArray(env.data)) return "data is not an array";
      const meta = env.meta as Record<string, unknown>;
      if (typeof meta.outage_count !== "number")
        return "meta.outage_count missing";
      return null;
    },
  },
  {
    label: "Endpoint 10 - /api/ancillary/current",
    path: "/api/ancillary/current",
    extra: (env) => {
      const d = env.data as Record<string, unknown>;
      const required = [
        "regulation_d_mcp",
        "regulation_a_mcp",
        "spinning_reserve_mcp",
        "regulation_mileage_payment",
      ];
      for (const k of required) {
        if (typeof d[k] !== "number") return `data.${k} missing`;
      }
      return null;
    },
  },
  {
    label: "Endpoint 11 - /api/lmp/da-forecast/all-zones",
    path: `/api/lmp/da-forecast/all-zones?date=${tomorrow}`,
    extra: (env) => {
      const d = env.data as Record<string, unknown>;
      const zones = Object.keys(d);
      if (zones.length < 18)
        return `expected ~20 zones, got ${zones.length}`;
      const first = d[zones[0]] as Array<Record<string, unknown>>;
      if (!Array.isArray(first) || first.length < 22)
        return `expected ~24 hourly rows per zone`;
      return null;
    },
  },
];

let failures = 0;

async function checkEnvelope(check: Check): Promise<void> {
  const url = `${BASE_URL}${check.path}`;
  const tag = `[${check.label}]`;
  try {
    const res = await fetch(url);
    const raw = await res.text();
    if (!res.ok) {
      console.error(`${tag} HTTP ${res.status} ${res.statusText} - ${raw.slice(0, 240)}`);
      failures++;
      return;
    }
    let body: Partial<Envelope>;
    try {
      body = JSON.parse(raw) as Partial<Envelope>;
    } catch {
      console.error(`${tag} response is not JSON: ${raw.slice(0, 240)}`);
      failures++;
      return;
    }
    if (!body.meta || typeof body.meta !== "object") {
      console.error(`${tag} FAIL - missing or invalid 'meta'`);
      failures++;
      return;
    }
    if (body.data === undefined || body.data === null) {
      console.error(`${tag} FAIL - missing 'data'`);
      failures++;
      return;
    }
    if (typeof body.summary !== "string" || !body.summary) {
      console.error(`${tag} FAIL - missing or empty 'summary'`);
      failures++;
      return;
    }
    if (typeof body.meta.timestamp !== "string") {
      console.error(`${tag} FAIL - meta.timestamp missing`);
      failures++;
      return;
    }
    if (check.extra) {
      const reason = check.extra(body as Envelope, raw);
      if (reason) {
        console.error(`${tag} FAIL - ${reason}`);
        failures++;
        return;
      }
    }
    const degraded =
      (body.meta as Record<string, unknown>).degraded_mode === true
        ? " (degraded_mode)"
        : "";
    console.log(`${tag} OK${degraded}`);
  } catch (err) {
    console.error(`${tag} NETWORK ERROR -`, (err as Error).message);
    failures++;
  }
}

async function checkSse(): Promise<void> {
  const tag = `[Endpoint 12 - /api/stream]`;
  const url = `${BASE_URL}/api/stream`;
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 8_000);
  try {
    const res = await fetch(url, {
      headers: { Accept: "text/event-stream" },
      signal: ctl.signal,
    });
    if (!res.ok) {
      console.error(`${tag} HTTP ${res.status} ${res.statusText}`);
      failures++;
      return;
    }
    if (!res.body) {
      console.error(`${tag} FAIL - empty body`);
      failures++;
      return;
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    let sawEvent = false;
    while (!sawEvent) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      if (/^event:\s*(heartbeat|lmp-update|outage)/m.test(buf)) {
        sawEvent = true;
      }
    }
    clearTimeout(timer);
    ctl.abort();
    if (!sawEvent) {
      console.error(`${tag} FAIL - no event frames received within 8s`);
      failures++;
      return;
    }
    console.log(`${tag} OK - first frame received`);
  } catch (err) {
    clearTimeout(timer);
    if ((err as Error).name === "AbortError") {
      console.error(`${tag} TIMEOUT - no frames within 8s`);
    } else {
      console.error(`${tag} ERROR -`, (err as Error).message);
    }
    failures++;
  }
}

async function main(): Promise<void> {
  console.log(`\nGridAlpha V2 smoke test - ${BASE_URL}\n`);
  for (const check of CHECKS) {
    // Sequential to avoid PJM rate-limit; total ~12s on a warm cache.
    await checkEnvelope(check);
  }
  await checkSse();

  const total = CHECKS.length + 1;
  const passed = total - failures;
  console.log(`\n${passed}/${total} passed\n`);
  if (failures > 0) {
    process.exit(1);
  }
}

main();
