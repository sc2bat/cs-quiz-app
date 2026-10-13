/**
 * Pick the SPA origin for OAuth redirect.
 * Prefer explicit CLIENT_APP_URL, then prod CORS origins, then local.
 */
export function resolveClientAppUrl(): string {
  const candidates = [
    process.env.CLIENT_APP_URL,
    process.env.CORS_ORIGIN_PROD,
    process.env.CORS_ORIGIN_PROD_WWW,
    process.env.CORS_ORIGIN_DEV,
    process.env.CORS_ORIGIN_DEV_WWW,
    process.env.CORS_ORIGIN_LOCAL,
  ].filter((v): v is string => !!v && v.length > 0);

  return candidates[0] || 'http://localhost:5173';
}
