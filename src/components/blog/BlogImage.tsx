import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';

interface BlogImageProps {
  src?: string;
  alt?: string;
  className?: string;
  priority?: boolean;
  aspectRatio?: '16/9' | '4/3' | 'auto';
}

/**
 * Responsive, optimized image component for blog posts and cards.
 * Uses <picture> with WebP srcset (640w, 1024w, 1600w) when an upload path is provided.
 * Gracefully falls back to original src or an elegant branded placeholder if src is missing or fails to load.
 */
export const BlogImage: React.FC<BlogImageProps> = ({
  src,
  alt = 'ব্লগ আর্টিকেল ছবি',
  className = '',
  priority = false,
  aspectRatio = '16/9',
}) => {
  const [hasError, setHasError] = useState(false);

  // If no image is provided or load failed, show branded fallback card
  if (!src || hasError) {
    const aspectClass =
      aspectRatio === '16/9' ? 'aspect-[16/9]' : aspectRatio === '4/3' ? 'aspect-[4/3]' : 'min-h-[180px]';

    return (
      <div
        className={`w-full ${aspectClass} rounded-2xl bg-gradient-to-br from-[#E6F4EC] via-[#F0F4F2] to-[#D5E4DB]/50 border border-[#D5E4DB]/80 flex flex-col items-center justify-center text-[#0B5D3B] p-4 text-center select-none ${className}`}
        aria-hidden="true"
      >
        <div className="w-12 h-12 rounded-full bg-white shadow-xs border border-[#0B5D3B]/10 flex items-center justify-center text-[#0B5D3B] mb-2">
          <BookOpen className="w-6 h-6 text-[#0B5D3B]" />
        </div>
        <span className="text-xs font-semibold text-[#084A2E] tracking-wide">Utools.bd ব্লগ</span>
      </div>
    );
  }

  // Check if it's an uploaded local file in /uploads/
  const isUpload = src.startsWith('/uploads/') || src.startsWith('uploads/');
  const cleanPath = src.startsWith('/') ? src : `/${src}`;

  if (isUpload) {
    // Generate optimized WebP srcset paths
    // e.g. /uploads/banner.jpg -> /uploads/optimized/banner-640.webp
    const filenameWithExt = cleanPath.replace(/^\/?uploads\//, '');
    const lastDotIdx = filenameWithExt.lastIndexOf('.');
    const baseName = lastDotIdx !== -1 ? filenameWithExt.slice(0, lastDotIdx) : filenameWithExt;

    const webpSrcSet = `/uploads/optimized/${baseName}-640.webp 640w, /uploads/optimized/${baseName}-1024.webp 1024w, /uploads/optimized/${baseName}-1600.webp 1600w`;
    const fallbackSrc = `/uploads/optimized/${baseName}-fallback${lastDotIdx !== -1 ? filenameWithExt.slice(lastDotIdx) : '.jpg'}`;

    return (
      <picture className="block w-full h-full overflow-hidden">
        <source type="image/webp" srcSet={webpSrcSet} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px" />
        <img
          src={cleanPath}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          width={aspectRatio === '4/3' ? 640 : 640}
          height={aspectRatio === '4/3' ? 480 : 360}
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover transition-transform duration-300 ${className}`}
        />
      </picture>
    );
  }

  // External or other static paths
  return (
    <img
      src={cleanPath}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      width={aspectRatio === '4/3' ? 640 : 640}
      height={aspectRatio === '4/3' ? 480 : 360}
      onError={() => setHasError(true)}
      className={`w-full h-full object-cover transition-transform duration-300 ${className}`}
    />
  );
};
