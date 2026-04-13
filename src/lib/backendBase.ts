/** Default V2 API host when env is unset (production builds). */
export const DEFAULT_BACKEND_HOST = 'https://gridalpha-v2-production.up.railway.app';

/**
 * In dev, return `` so requests use same-origin `/api/...` and Vite proxies to V2.
 * In production, full URL from env (no trailing slash).
 */
export function getBackendBase(): string {
  if (import.meta.env.DEV) return '';
  const u = (import.meta.env.VITE_BACKEND_URL as string | undefined)?.replace(/\/$/, '');
  return u || DEFAULT_BACKEND_HOST;
}

/** News/article routes: VITE_NEWS_API_URL → VITE_BACKEND_URL → VITE_API_URL (legacy). */
export function getNewsApiBase(): string {
  if (import.meta.env.DEV) return '';
  const raw =
    (import.meta.env.VITE_NEWS_API_URL as string | undefined) ||
    (import.meta.env.VITE_BACKEND_URL as string | undefined) ||
    (import.meta.env.VITE_API_URL as string | undefined);
  return raw?.replace(/\/$/, '') || DEFAULT_BACKEND_HOST;
}
