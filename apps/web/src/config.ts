/**
 * Base URL for the Nexus backend (Fastify on Render).
 *
 * Dev: the Vite dev server proxies `/api` → the local backend (see
 * vite.config.ts), so an empty base keeps calls same-origin and the proxy
 * forwards them.
 *
 * Production: the Cloudflare Pages deploy is static — there is no proxy — so
 * calls must go straight to the Render service. The server replies with
 * permissive CORS (`origin: true`), so cross-origin is fine.
 *
 * Override at build time with `VITE_API_BASE` if the backend URL changes.
 */
export const API_BASE =
  (import.meta.env.VITE_API_BASE as string | undefined) ??
  (import.meta.env.DEV ? '' : 'https://nexus-oracle-u6ra.onrender.com');
