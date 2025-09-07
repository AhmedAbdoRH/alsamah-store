import React from 'react';
import type { Banner } from '../types/database';

interface BannerStripProps {
  banners: Banner[];
}

export default function BannerStrip({ banners }: BannerStripProps) {
  // Filter only strip banners that are active and positioned below main
  const stripBanners = banners.filter(banner => 
    banner.type === 'strip' && 
    banner.is_active && 
    banner.title?.trim() &&
    (banner as any).strip_position === 'below_main'
  );

  if (stripBanners.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      {stripBanners.map((banner) => (
        <div
          key={banner.id}
          className="w-full py-4 px-4 text-center"
          style={{
            backgroundColor: (banner as any).strip_background_color || '#2a2a2a',
            color: (banner as any).strip_text_color || '#ffffff',
          }}
        >
          <div className="container mx-auto">
            <h2 className="text-lg md:text-xl font-bold">
              {banner.title}
            </h2>
            {banner.description && (
              <p className="text-sm md:text-base mt-1 opacity-90">
                {banner.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
