"use client";

import Link from "next/link";
import { MarketplaceListing } from "@/types/marketplace";
import { VERDICT_CONFIG } from "@/types/report";
import { DEFAULT_CAR_IMAGE, handleImageError } from "@/lib/utils/media";

interface CarCardProps {
  listing: MarketplaceListing;
}

export default function CarCard({ listing }: CarCardProps) {
  const getVerdict = (score: number) => {
    if (score >= 80) return "excellent";
    if (score >= 60) return "good";
    return "risky";
  };

  const verdict = getVerdict(listing.trustScore);
  const verdictConfig = VERDICT_CONFIG[verdict];
  const priceFormatted = new Intl.NumberFormat(
    listing.currency === "INR" ? "en-IN" : "en-EU",
    {
      style: "currency",
      currency: listing.currency,
      maximumFractionDigits: 0,
    }
  ).format(listing.price);

  return (
    <Link
      href={`/marketplace/${listing.id}`}
      className="group block overflow-hidden rounded-2xl border border-gray-200/50 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm transition-all hover:border-blue-400/50 hover:shadow-2xl hover:scale-[1.02] dark:border-slate-700/50"
    >
      {/* Image */}
      <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-800">
        <img
          src={listing.images && listing.images.length > 0 ? listing.images[0] : DEFAULT_CAR_IMAGE}
          alt={`${listing.carDetails.make} ${listing.carDetails.model}`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => handleImageError(e, DEFAULT_CAR_IMAGE)}
        />
        
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
        
        {/* Verified Badge */}
        {listing.verified && (
          <div className="absolute right-3 top-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur-sm">
            ✓ Verified
          </div>
        )}

        {/* Trust Score Badge */}
        <div className="absolute left-3 top-3">
          <div
            className={`rounded-full px-3 py-1.5 text-xs font-bold shadow-lg backdrop-blur-sm ${verdictConfig.bgColor} ${verdictConfig.color}`}
          >
            {listing.trustScore}% Trust
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {listing.carDetails.make} {listing.carDetails.model}
        </h3>
        <p className="mb-4 text-sm font-medium text-gray-600 dark:text-gray-400">
          {listing.carDetails.year} • {listing.carDetails.kilometersDriven != null ? listing.carDetails.kilometersDriven.toLocaleString() : 'N/A'} km
        </p>

        {/* Price */}
        <div className="mb-4">
          <p className="text-3xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            {priceFormatted}
          </p>
        </div>

        {/* Details */}
        <div className="mb-4 flex flex-wrap gap-3 text-sm font-medium">
          <span className="rounded-lg bg-blue-50 px-3 py-1 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            {listing.carDetails.fuelType}
          </span>
          <span className="rounded-lg bg-indigo-50 px-3 py-1 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
            {listing.carDetails.transmission}
          </span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
          <span className="text-lg">📍</span>
          <span>
            {listing.location.city}, {listing.location.state}
          </span>
        </div>
      </div>
    </Link>
  );
}
