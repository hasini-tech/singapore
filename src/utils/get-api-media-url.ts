import { normalizeApiBaseUrl } from '@/utils/api-base-url';

// Base domain for media should not include the /api/v1 suffix
const BASE_URL = normalizeApiBaseUrl(
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.growthlab.sg/api/v1'
).replace(/\/api\/v1\/?$/, '');

/**
 * Prefixes media/file URLs with the API domain root if they are relative paths.
 */
export function getApiMediaUrl(path: string | null | undefined): string {
  if (!path) return '';
  
  // If it's already an absolute URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }

  // Handle paths that might start with / or not
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  // Return the domain root + path
  return `${BASE_URL}${cleanPath}`;
}
