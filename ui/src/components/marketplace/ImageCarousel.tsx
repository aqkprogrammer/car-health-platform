"use client";

import { useState } from "react";
import { DEFAULT_CAR_IMAGE, handleImageError } from "@/lib/utils/media";
import FullScreenImageSlider from "./FullScreenImageSlider";

interface ImageCarouselProps {
  images: string[];
  carName: string;
}

export default function ImageCarousel({ images, carName }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // If no images, show placeholder
  if (!images || images.length === 0) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-700">
        <div className="flex h-full items-center justify-center">
          <span className="text-6xl">🚗</span>
        </div>
      </div>
    );
  }

  const openFullScreen = () => {
    setIsFullScreenOpen(true);
  };

  const closeFullScreen = () => {
    setIsFullScreenOpen(false);
  };

  return (
    <div className={`relative w-full ${isFullScreenOpen ? '' : 'group'}`}>
      {/* Main Image */}
      <div 
        className={`relative aspect-video w-full overflow-hidden rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 cursor-pointer shadow-lg transition-all duration-300 ${
          isFullScreenOpen ? '' : 'hover:shadow-xl'
        }`}
        onClick={openFullScreen}
      >
        {/* Subtle gradient overlay - always visible */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-10 pointer-events-none"></div>
        
        {/* Enhanced overlay gradient on hover */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/0 via-black/0 to-black/0 transition-all duration-300 z-10 pointer-events-none ${
          isFullScreenOpen ? '' : 'group-hover:from-black/40 group-hover:via-black/20 group-hover:to-black/10'
        }`}></div>
        
        <img
          src={images[currentIndex] || DEFAULT_CAR_IMAGE}
          alt={`${carName} - Image ${currentIndex + 1}`}
          className={`h-full w-full object-cover transition-transform duration-500 ${
            isFullScreenOpen ? '' : 'group-hover:scale-110'
          }`}
          onError={(e) => handleImageError(e, DEFAULT_CAR_IMAGE)}
        />

        {/* Click hint overlay */}
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 z-20 pointer-events-none ${
          isFullScreenOpen ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
        }`}>
          <div className="rounded-full bg-white/20 backdrop-blur-md px-6 py-3 border border-white/30 shadow-lg">
            <span className="text-white font-semibold text-sm flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
              Click to view fullscreen
            </span>
          </div>
        </div>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 rounded-full bg-black/50 backdrop-blur-md p-3 text-white transition-all duration-200 hover:bg-black/70 hover:scale-110 active:scale-95 shadow-lg border border-white/20"
              aria-label="Previous image"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 rounded-full bg-black/50 backdrop-blur-md p-3 text-white transition-all duration-200 hover:bg-black/70 hover:scale-110 active:scale-95 shadow-lg border border-white/20"
              aria-label="Next image"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Floating Image Counter with Glassmorphism */}
        {images.length > 1 && (
          <div className="absolute top-4 right-4 z-30 rounded-full bg-white/10 backdrop-blur-xl px-4 py-2 text-sm text-white shadow-xl border border-white/20">
            <span className="font-semibold">
              {currentIndex + 1} <span className="opacity-60">/</span> {images.length}
            </span>
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                goToSlide(index);
              }}
              className={`relative h-20 w-20 md:h-24 md:w-24 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-300 cursor-pointer transform ${
                index === currentIndex
                  ? "border-blue-500 ring-2 ring-blue-500/40 scale-105 shadow-lg"
                  : "border-gray-200 dark:border-gray-700 opacity-60 hover:opacity-100 hover:scale-105 hover:border-blue-400 dark:hover:border-blue-500"
              }`}
            >
              <img
                src={image || DEFAULT_CAR_IMAGE}
                alt={`Thumbnail ${index + 1}`}
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                onError={(e) => handleImageError(e, DEFAULT_CAR_IMAGE)}
              />
              {index === currentIndex && (
                <div className="absolute inset-0 bg-gradient-to-t from-blue-500/40 to-transparent"></div>
              )}
              {/* Active indicator */}
              {index === currentIndex && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500"></div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Full Screen Image Slider */}
      <FullScreenImageSlider
        images={images}
        currentIndex={currentIndex}
        isOpen={isFullScreenOpen}
        onClose={closeFullScreen}
        onNavigate={setCurrentIndex}
        carName={carName}
      />
    </div>
  );
}
