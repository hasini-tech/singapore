const DEVELOPMENT_NEXTAUTH_URL = 'http://localhost:3000';

function normalizeAbsoluteUrl(value?: string | null) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }

  try {
    return new URL(trimmed).toString().replace(/\/$/, '');
  } catch {
    return null;
  }
}

export function getResolvedNextAuthUrl() {
  const explicitUrl = normalizeAbsoluteUrl(process.env.NEXTAUTH_URL);
  if (explicitUrl) {
    return explicitUrl;
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    return normalizeAbsoluteUrl(`https://${vercelUrl}`) || DEVELOPMENT_NEXTAUTH_URL;
  }

  return DEVELOPMENT_NEXTAUTH_URL;
}

export function ensureNextAuthUrl() {
  const resolvedUrl = getResolvedNextAuthUrl();
  process.env.NEXTAUTH_URL = resolvedUrl;
  return resolvedUrl;
}
