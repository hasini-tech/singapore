export function normalizeApiBaseUrl(baseUrl: string) {
  try {
    const url = new URL(baseUrl);

    if (process.env.NODE_ENV !== 'production' && url.hostname === 'localhost') {
      url.hostname = '127.0.0.1';
    }

    return url.toString().replace(/\/$/, '');
  } catch {
    return baseUrl
      .replace('http://localhost', 'http://127.0.0.1')
      .replace('https://localhost', 'https://127.0.0.1')
      .replace(/\/$/, '');
  }
}

export function getApiBaseUrl(fallback = 'http://127.0.0.1:8000') {
  return normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL || fallback);
}
