export type SupabaseImageVariant = 'full' | 'detail' | 'card' | 'thumb';

const OPTIMIZED_FULL_MARKER = '__full.webp';

export function getSupabaseImageVariantUrl(
  src: string | null | undefined,
  variant: SupabaseImageVariant = 'full'
) {
  if (!src) {
    return '';
  }

  if (!src.includes(OPTIMIZED_FULL_MARKER)) {
    return src;
  }

  return src.replace(OPTIMIZED_FULL_MARKER, `__${variant}.webp`);
}

export function getSupabaseFullImageUrl(src: string | null | undefined) {
  if (!src) {
    return '';
  }

  return src.replace(/__(card|detail|thumb)\.webp(?=($|\?))/, OPTIMIZED_FULL_MARKER);
}

export function hasGeneratedSupabaseVariants(src: string | null | undefined) {
  return Boolean(src && src.includes(OPTIMIZED_FULL_MARKER));
}
