export function getSafeRedirectPath(
  target: string | null | undefined,
  fallback: string
): string {
  if (!target) {
    return fallback;
  }

  try {
    const baseOrigin =
      typeof window === 'undefined' ? 'http://localhost' : window.location.origin;
    const url = new URL(target, baseOrigin);

    if (
      typeof window !== 'undefined' &&
      url.origin !== window.location.origin
    ) {
      return fallback;
    }

    return `${url.pathname}${url.search}${url.hash}` || fallback;
  } catch {
    return fallback;
  }
}
