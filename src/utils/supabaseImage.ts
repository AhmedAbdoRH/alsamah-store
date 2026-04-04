export type SupabaseImageVariant = 'full' | 'detail' | 'card' | 'thumb';

const OPTIMIZED_FULL_MARKER = '__full.webp';
const CLOUDFLARE_IMAGE_PATH = '/cdn-cgi/image/';
const CLOUDFLARE_IMAGE_OPTIONS: Record<SupabaseImageVariant, string> = {
  full: 'width=1600,quality=82,fit=scale-down,format=auto,metadata=none',
  detail: 'width=1080,quality=78,fit=scale-down,format=auto,metadata=none',
  card: 'width=480,quality=72,fit=scale-down,format=auto,metadata=none',
  thumb: 'width=160,quality=65,fit=scale-down,format=auto,metadata=none',
};

const CLOUDFLARE_IMAGE_PROXY_ENABLED =
  import.meta.env.VITE_CLOUDFLARE_IMAGE_PROXY_ENABLED !== 'false';
const CLOUDFLARE_IMAGE_PROXY_BASE_URL = trimTrailingSlash(
  import.meta.env.VITE_CLOUDFLARE_IMAGE_PROXY_BASE_URL || ''
);

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

function unwrapCloudflareImageUrl(src: string) {
  const match = src.match(/\/cdn-cgi\/image\/[^/]+\/(https?:\/\/.+)$/);
  return match ? decodeURI(match[1]) : src;
}

function isHttpUrl(src: string) {
  try {
    const url = new URL(src);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function isSupabaseStorageUrl(src: string) {
  if (!isHttpUrl(src)) {
    return false;
  }

  const url = new URL(src);
  return url.hostname.includes('.supabase.') && url.pathname.includes('/storage/');
}

function resolveCloudflareProxyOrigin() {
  if (CLOUDFLARE_IMAGE_PROXY_BASE_URL) {
    return CLOUDFLARE_IMAGE_PROXY_BASE_URL;
  }

  if (typeof window === 'undefined') {
    return '';
  }

  const { origin, hostname } = window.location;
  const isLocalHost =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]';

  if (isLocalHost || hostname.endsWith('.pages.dev')) {
    return '';
  }

  return trimTrailingSlash(origin);
}

function buildCloudflareImageUrl(src: string, variant: SupabaseImageVariant) {
  if (!CLOUDFLARE_IMAGE_PROXY_ENABLED || !isSupabaseStorageUrl(src) || src.includes(CLOUDFLARE_IMAGE_PATH)) {
    return src;
  }

  const proxyOrigin = resolveCloudflareProxyOrigin();

  if (!proxyOrigin) {
    return src;
  }

  return `${proxyOrigin}${CLOUDFLARE_IMAGE_PATH}${CLOUDFLARE_IMAGE_OPTIONS[variant]}/${encodeURI(src)}`;
}

export function getSupabaseImageVariantUrl(
  src: string | null | undefined,
  variant: SupabaseImageVariant = 'full'
) {
  if (!src) {
    return '';
  }

  const directSrc = unwrapCloudflareImageUrl(src);
  const variantSrc = directSrc.includes(OPTIMIZED_FULL_MARKER)
    ? directSrc.replace(OPTIMIZED_FULL_MARKER, `__${variant}.webp`)
    : directSrc;

  return buildCloudflareImageUrl(variantSrc, variant);
}

export function getSupabaseFullImageUrl(src: string | null | undefined) {
  if (!src) {
    return '';
  }

  const directSrc = unwrapCloudflareImageUrl(src);
  return directSrc.replace(/__(card|detail|thumb)\.webp(?=($|\?))/, OPTIMIZED_FULL_MARKER);
}

export function hasGeneratedSupabaseVariants(src: string | null | undefined) {
  return Boolean(src && unwrapCloudflareImageUrl(src).includes(OPTIMIZED_FULL_MARKER));
}
