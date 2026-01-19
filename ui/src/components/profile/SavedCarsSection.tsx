"use client";

import Link from "next/link";
import { SavedCar } from "@/types/profile";

interface SavedCarsSectionProps {
  savedCars: SavedCar[];
  onRemove?: (id: string) => void;
}

export default function SavedCarsSection({
  savedCars,
  onRemove,
}: SavedCarsSectionProps) {
  if (savedCars.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200/50 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-8 shadow-xl dark:border-gray-700/50">
        <h3 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
          Saved Cars
        </h3>
        <div className="rounded-xl border-2 border-dashed border-gray-300/50 bg-gradient-to-br from-gray-50 to-pink-50/50 dark:from-slate-700/50 dark:to-slate-600/50 p-12 text-center">
          <span className="mb-4 block text-6xl">❤️</span>
          <p className="mb-6 text-lg font-medium text-gray-600 dark:text-gray-400">
            No saved cars yet
          </p>
          <Link
            href="/marketplace"
            className="inline-block rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 dark:from-blue-500 dark:to-indigo-500"
          >
            Browse Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-pink-600/5 via-rose-600/5 to-red-600/5 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative rounded-3xl border border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-6 md:p-8 shadow-2xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 text-2xl shadow-lg ring-2 ring-pink-400/30">
              ❤️
            </div>
            <h3 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Saved Cars
            </h3>
          </div>
          <span className="rounded-full bg-gradient-to-r from-pink-100 to-rose-100 dark:from-pink-900/40 dark:to-rose-900/40 px-5 py-2 text-sm font-bold text-pink-700 dark:text-pink-300 shadow-lg ring-2 ring-pink-400/20 backdrop-blur-sm">
            {savedCars.length} {savedCars.length === 1 ? "car" : "cars"}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-5 md:gap-6">
          {savedCars.map((car, index) => {
            const priceFormatted = new Intl.NumberFormat(
              car.currency === "INR" ? "en-IN" : "en-EU",
              {
                style: "currency",
                currency: car.currency,
                maximumFractionDigits: 0,
              }
            ).format(car.price);

            return (
              <div
                key={car.id}
                className="group/card relative overflow-hidden rounded-2xl border border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-br from-white/90 to-pink-50/40 dark:from-slate-700/60 dark:to-slate-600/40 p-6 shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:border-pink-400/50 dark:hover:border-pink-600/50"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-pink-400/10 rounded-full blur-2xl group-hover/card:bg-pink-400/20 transition-all"></div>
                <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                  <div className="flex items-start gap-5 flex-1">
                    <div className="flex h-18 w-18 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 via-rose-600 to-red-600 text-3xl shadow-xl ring-2 ring-pink-400/30 group-hover/card:scale-110 transition-transform duration-300">
                      🚗
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="mb-3 text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white">
                        {car.carDetails.make} {car.carDetails.model}
                      </h4>
                      <div className="mb-4 flex flex-wrap items-center gap-2">
                        <span className="rounded-xl bg-gray-100 dark:bg-slate-700 px-4 py-1.5 text-sm font-bold text-gray-700 dark:text-gray-300 shadow-md">
                          {car.carDetails.year}
                        </span>
                        <span className="rounded-xl bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 px-4 py-1.5 text-sm font-bold text-green-700 dark:text-green-300 shadow-md ring-1 ring-green-400/30">
                          💰 {priceFormatted}
                        </span>
                        <span className="rounded-xl bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 px-4 py-1.5 text-sm font-bold text-blue-700 dark:text-blue-300 shadow-md ring-1 ring-blue-400/30">
                          ⭐ {car.trustScore}% Trust
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                        <span>📅</span>
                        <span>
                          Saved {new Date(car.savedAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <Link
                      href={`/marketplace/${car.listingId}`}
                      className="group/link inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-2.5 text-sm font-bold text-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 ring-2 ring-blue-400/30"
                    >
                      <span>View Details</span>
                      <span className="transform transition-transform group-hover/link:translate-x-1">→</span>
                    </Link>
                    {onRemove && (
                      <button
                        onClick={() => onRemove(car.id)}
                        className="group/remove inline-flex items-center justify-center gap-2 rounded-xl border-2 border-red-300 dark:border-red-600 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/30 dark:to-pink-900/30 px-5 py-2.5 text-sm font-bold text-red-700 dark:text-red-300 transition-all duration-300 hover:bg-red-100 dark:hover:bg-red-900/40 hover:scale-105 hover:shadow-lg ring-2 ring-red-400/20"
                        aria-label="Remove saved car"
                      >
                        <span>❤️</span>
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
