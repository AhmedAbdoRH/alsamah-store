import React, { useEffect, useRef, useState } from 'react';
import {
  getSupabaseFullImageUrl,
  getSupabaseImageVariantUrl,
  type SupabaseImageVariant,
} from '../utils/supabaseImage';

interface OptimizedImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  wrapperClassName?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'auto' | 'sync';
  variant?: SupabaseImageVariant;
  placeholder?: string;
  rootMargin?: string;
  fetchPriority?: 'high' | 'low' | 'auto';
  sizes?: string;
  style?: React.CSSProperties;
  draggable?: boolean;
}

const TRANSPARENT_PIXEL =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

export default function OptimizedImage({
  src,
  alt,
  className = '',
  wrapperClassName = '',
  width,
  height,
  loading = 'lazy',
  decoding = 'async',
  variant = 'full',
  placeholder = '/placeholder-product.jpg',
  rootMargin = '400px 0px',
  fetchPriority = 'auto',
  sizes,
  style,
  draggable,
}: OptimizedImageProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const eagerLoad = loading === 'eager';
  const fallbackSrc = getSupabaseFullImageUrl(src) || src || placeholder || TRANSPARENT_PIXEL;
  const preferredSrc = getSupabaseImageVariantUrl(fallbackSrc, variant) || fallbackSrc;
  const [shouldLoad, setShouldLoad] = useState(eagerLoad);
  const [displaySrc, setDisplaySrc] = useState(eagerLoad ? preferredSrc : placeholder || TRANSPARENT_PIXEL);

  useEffect(() => {
    if (eagerLoad) {
      setShouldLoad(true);
      return;
    }

    const node = containerRef.current;

    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [eagerLoad, rootMargin]);

  useEffect(() => {
    setDisplaySrc(shouldLoad ? preferredSrc : placeholder || TRANSPARENT_PIXEL);
  }, [placeholder, preferredSrc, shouldLoad]);

  const handleError = () => {
    if (displaySrc !== fallbackSrc) {
      setDisplaySrc(fallbackSrc);
      return;
    }

    if (displaySrc !== placeholder && placeholder) {
      setDisplaySrc(placeholder);
      return;
    }

    if (displaySrc !== TRANSPARENT_PIXEL) {
      setDisplaySrc(TRANSPARENT_PIXEL);
    }
  };

  return (
    <div ref={containerRef} className={wrapperClassName}>
      <img
        src={displaySrc}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        decoding={decoding}
        fetchPriority={fetchPriority}
        sizes={sizes}
        onError={handleError}
        className={className}
        style={style}
        draggable={draggable}
      />
    </div>
  );
}
