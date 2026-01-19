"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { DEFAULT_CAR_IMAGE, handleImageError } from "@/lib/utils/media";

interface FullScreenImageSliderProps {
  images: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
  carName?: string;
}

export default function FullScreenImageSlider({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
  carName = "Car",
}: FullScreenImageSliderProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before using portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Handle keyboard navigation and body scroll prevention
  useEffect(() => {
    if (!isOpen) {
      // Restore body scroll when closed
      document.body.style.overflow = "";
      return;
    }

    // Prevent body scroll when modal is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = "0px"; // Prevent layout shift from scrollbar

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
        onNavigate(prevIndex);
      } else if (e.key === "ArrowRight") {
        const nextIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
        onNavigate(nextIndex);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = "";
    };
  }, [isOpen, currentIndex, images.length, onClose, onNavigate]);

  // Reset image loaded state when image changes
  useEffect(() => {
    setImageLoaded(false);
  }, [currentIndex]);

  const goToPrevious = () => {
    const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    onNavigate(prevIndex);
  };

  const goToNext = () => {
    const nextIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    onNavigate(nextIndex);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Don't render if no images
  if (!images || images.length === 0) return null;

  // Don't render if not mounted or not open
  if (!mounted || !isOpen || typeof document === 'undefined') return null;

  const modalContent = (
    <div
      className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-black/95 via-gray-900/95 to-black/95 backdrop-blur-md"
      onClick={handleBackdropClick}
      onMouseEnter={(e) => {
        // Ensure modal stays visible on hover
        e.currentTarget.style.opacity = '1';
        e.currentTarget.style.visibility = 'visible';
        e.currentTarget.style.pointerEvents = 'auto';
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 99999,
        visibility: 'visible',
        opacity: 1,
        pointerEvents: 'auto',
        display: 'flex',
      }}
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      </div>

      {/* Close Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="group absolute right-6 top-6 z-[10000] flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-xl transition-all duration-200 hover:bg-white/20 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg hover:shadow-xl"
        aria-label="Close"
      >
        <svg
          className="h-6 w-6 text-white transition-transform duration-200 group-hover:rotate-90"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Main Image Container */}
      <div 
        className="relative flex h-full w-full items-center justify-center p-6 md:p-8 lg:p-12"
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={(e) => e.stopPropagation()}
        onMouseLeave={(e) => e.stopPropagation()}
        onMouseOver={(e) => e.stopPropagation()}
      >
        {/* Previous Button */}
        {images.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
            className="group absolute left-4 md:left-8 z-[10000] flex h-14 w-14 items-center justify-center rounded-full bg-white/10 backdrop-blur-xl text-white transition-all duration-200 hover:bg-white/20 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg hover:shadow-xl active:scale-95"
            aria-label="Previous image"
          >
            <svg
              className="h-7 w-7 transition-transform duration-200 group-hover:-translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}

        {/* Image with fade animation */}
        <div className="relative flex h-full max-h-[85vh] w-full max-w-[90vw] items-center justify-center">
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-white/20 border-t-white/60"></div>
            </div>
          )}
          <img
            src={images[currentIndex] || DEFAULT_CAR_IMAGE}
            alt={`${carName} - Image ${currentIndex + 1}`}
            className={`max-h-full max-w-full object-contain transition-all duration-500 ${
              imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
            } drop-shadow-2xl`}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              handleImageError(e, DEFAULT_CAR_IMAGE);
              setImageLoaded(true);
            }}
          />
        </div>

        {/* Next Button */}
        {images.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className="group absolute right-4 md:right-8 z-[10000] flex h-14 w-14 items-center justify-center rounded-full bg-white/10 backdrop-blur-xl text-white transition-all duration-200 hover:bg-white/20 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg hover:shadow-xl active:scale-95"
            aria-label="Next image"
          >
            <svg
              className="h-7 w-7 transition-transform duration-200 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}

        {/* Image Counter with glassmorphism */}
        {images.length > 1 && (
          <div className="absolute bottom-24 md:bottom-28 left-1/2 -translate-x-1/2 z-[10000] rounded-full bg-white/10 backdrop-blur-xl px-6 py-3 text-white shadow-xl border border-white/20">
            <span className="text-sm font-semibold tracking-wide">
              {currentIndex + 1} <span className="opacity-60">/</span> {images.length}
            </span>
          </div>
        )}

        {/* Thumbnail Strip with enhanced design */}
        {images.length > 1 && (
          <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-3 overflow-x-auto max-w-[95vw] px-4 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] z-[10000]">
            <div className="flex gap-3 px-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate(index);
                  }}
                  className={`group relative h-20 w-20 md:h-24 md:w-24 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-300 transform ${
                    index === currentIndex
                      ? "border-white ring-4 ring-white/30 scale-110 shadow-2xl"
                      : "border-white/30 opacity-70 hover:opacity-100 hover:border-white/60 hover:scale-105"
                  }`}
                >
                  <img
                    src={image || DEFAULT_CAR_IMAGE}
                    alt={`Thumbnail ${index + 1}`}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => handleImageError(e, DEFAULT_CAR_IMAGE)}
                  />
                  {index === currentIndex && (
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-500/20 to-transparent"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Render modal using portal to document body
  return createPortal(modalContent, document.body);
}
