import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Package } from 'lucide-react';

export default function ProductGallery({ images = [], productName = 'Product' }) {
  // Extract only genuine uploaded images
  const rawImages = Array.isArray(images) ? images : images ? [images] : [];
  const cleanImages = rawImages.filter(
    (img) => img && typeof img === 'string' && img.trim().length > 0
  );

  // If absolutely no images exist, show a clean fallback
  const displayImages =
    cleanImages.length > 0
      ? cleanImages
      : ['/originallogo.png'];

  const [activeIndex, setActiveIndex] = useState(0);

  // Guard activeIndex within bounds
  const currentIndex = activeIndex >= displayImages.length ? 0 : activeIndex;

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1));
  };

  const total = displayImages.length;
  const hasMultiple = total > 1;

  return (
    <div className="flex flex-col gap-3">
      {/* Main Viewport Card */}
      <div className="relative aspect-[16/10] sm:aspect-[4/3] rounded-2xl overflow-hidden bg-white border border-[#d6e8dd] shadow-xs flex items-center justify-center group">
        <img
          src={displayImages[currentIndex]}
          alt={`${productName} - Image ${currentIndex + 1} of ${total}`}
          className="w-full h-full object-contain p-2 sm:p-4 transition-all duration-300"
          loading="eager"
        />

        {/* Gallery navigation controls - Only shown if multiple photos exist */}
        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/95 hover:bg-white text-[#0a2e1e] shadow-md flex items-center justify-center border border-[#d6e8dd] opacity-80 group-hover:opacity-100 transition-opacity"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/95 hover:bg-white text-[#0a2e1e] shadow-md flex items-center justify-center border border-[#d6e8dd] opacity-80 group-hover:opacity-100 transition-opacity"
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Photo Counter Badge */}
            <div className="absolute bottom-2.5 right-2.5 bg-[#0a2e1e]/85 text-white text-[11px] font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
              <span className="text-emerald-300 font-mono">
                {currentIndex + 1} / {total}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Thumbnail Strip - Only shown if there are 2 or more photos */}
      {hasMultiple && (
        <div className="flex flex-wrap gap-2 pt-1">
          {displayImages.map((imgSrc, idx) => {
            const isSelected = currentIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 bg-white transition-all ${
                  isSelected
                    ? 'border-[#0a2e1e] ring-2 ring-[#0a2e1e]/30 shadow-sm'
                    : 'border-[#d6e8dd] opacity-75 hover:opacity-100 hover:border-emerald-700'
                }`}
                aria-label={`View photo ${idx + 1}`}
              >
                <img
                  src={imgSrc}
                  alt={`${productName} thumbnail ${idx + 1}`}
                  className="w-full h-full object-contain p-1"
                  loading="lazy"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
