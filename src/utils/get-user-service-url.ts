import { normalizeApiBaseUrl } from '@/utils/api-base-url';

export function getUserServiceUrl(fallback = 'http://127.0.0.1:8001') {
  return normalizeApiBaseUrl(
    process.env.USER_SERVICE_URL ||
      process.env.NEXT_PUBLIC_USER_API_URL ||
      fallback
  );
}
