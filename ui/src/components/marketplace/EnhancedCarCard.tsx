"use client";

import Link from "next/link";
import { MarketplaceListing } from "@/types/marketplace";
import { DEFAULT_CAR_IMAGE, handleImageError } from "@/lib/utils/media";

interface EnhancedCarCardProps {
  listing: MarketplaceListing;
}

export default function EnhancedCarCard({ listing }: EnhancedCarCardProps) {
  const priceFormatted = new Intl.NumberFormat(
    listing.currency === "INR" ? "en-IN" : "en-EU",
    {
      style: "currency",
      currency: listing.currency,
      maximumFractionDigits: 0,
    }
  ).format(listing.price);

  // Get car specifications
  const mileage = listing.carDetails?.kilometersDriven || listing._enhanced?.carSpecs?.kilometersDriven || 0;
  const fuelType = listing.carDetails?.fuelType || listing._enhanced?.carSpecs?.fuelType || "N/A";
  const transmission = listing.carDetails?.transmission || listing._enhanced?.carSpecs?.transmission || "N/A";
  
  // Calculate power (placeholder - you might need to add this to your data model)
  // For now, we'll use a placeholder value
  const power = "390"; // kW - This should come from your data model
  
  // Determine drivetrain (placeholder)
  // This could be inferred from model or added to data model
  const drivetrain = transmission && (transmission.toLowerCase().includes("4wd") || transmission.toLowerCase().includes("awd")) ? "4WD" : "FWD";

  // Get location
  const location = listing.location?.city 
    ? `${listing.location.city}, ${listing.location.state || ""}`.trim()
    : "Location not available";

  // Generate description preview
  const description = `A dream car for true connoisseurs of automotive art! The ${listing.carDetails.make} ${listing.carDetails.model} is the epitome of luxury, style and power. The combination of advanced technology and elegant design makes this vehicle a perfect choice for discerning drivers.`;

  return (
    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-slate-700 hover:shadow-xl transition-all hover:scale-[1.02]">
      {/* Image */}
      <div className="relative w-full h-64 overflow-hidden bg-gray-100">
        <img
          src={listing.images && listing.images.length > 0 ? listing.images[0] : DEFAULT_CAR_IMAGE}
          alt={`${listing.carDetails.make} ${listing.carDetails.model}`}
          className="w-full h-full object-cover"
          onError={(e) => handleImageError(e, DEFAULT_CAR_IMAGE)}
        />
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title and Price */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex-1">
            {listing.carDetails.make} {listing.carDetails.model}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900 dark:text-white">{priceFormatted}</span>
            {listing.trustScore >= 80 && (
              <span className="text-blue-600 dark:text-blue-400">🔥</span>
            )}
          </div>
        </div>

        {/* Specifications */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{mileage.toLocaleString()} km</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>{fuelType}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>{power} kW</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{drivetrain}</span>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mb-3">
          <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{location}</span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{description}</p>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            href={`/marketplace/${listing.id}`}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:shadow-lg transition-all hover:scale-105 dark:from-blue-500 dark:to-indigo-500"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Buy now
          </Link>
          <button className="p-2.5 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
