# Production stabilization runbook

## Browser API routing

Browser code calls same-origin `/api/*` paths in both production and local
development. In production, `vercel.json` rewrites those requests to the V2
Railway service. Locally, `vite.config.ts` proxies them to `VITE_BACKEND_URL`
(defaulting to the V2 Railway service).

`VITE_BACKEND_URL` is therefore a development-server setting, not a browser
runtime base URL. `VITE_API_URL` and the dead GridAlpha V1 Railway service are
not used by the application runtime.

## Railway configuration

Set this server-side variable manually in the Railway service:

```dotenv
CORS_ORIGINS=https://nivar.com.br,https://www.nivar.com.br
```

Do not use `*` with credentialed CORS. Normal browser traffic now uses the
same-origin Vercel rewrite, reducing its dependence on CORS; the explicit
origins remain useful for direct diagnostics and controlled clients.

`ANTHROPIC_API_KEY` must remain server-side and must never use a `VITE_`
prefix.

## AI proxy controls

`POST /api/ai/complete` requires the existing NIVAR session authentication.
The server accepts only the model used by current clients, caps output at
2,000 tokens, rejects unknown fields, limits message counts and text sizes,
and rejects request bodies over 64 KiB. A per-account, per-process burst limit
allows 20 requests per 60 seconds.

The rate limit is intentionally lightweight. It is not shared across Railway
replicas and resets on process restart. A distributed limiter backed by shared
infrastructure remains technical debt if abuse levels require stronger global
enforcement.

## Regression commands

```text
npm run test:stabilization
py -3 -m pytest tests/production-stabilization/test_ai_route.py -q
```

The backend suite replaces the Anthropic HTTP client with a mock and never
uses real Anthropic credits.
