"use client";

import { useState } from "react";
import { MarketplaceFilters as FiltersType } from "@/types/marketplace";

interface MarketplaceFiltersProps {
  filters: FiltersType;
  onFiltersChange: (filters: FiltersType) => void;
  cities: string[];
}

export default function MarketplaceFilters({
  filters,
  onFiltersChange,
  cities,
}: MarketplaceFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = (key: keyof FiltersType, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className="rounded-2xl border border-gray-200/50 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md shadow-lg dark:border-gray-700/50">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-5 transition-all hover:bg-gray-50/50 dark:hover:bg-slate-700/50 rounded-t-2xl"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔍</span>
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            Filters
          </span>
          {hasActiveFilters && (
            <span className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1 text-xs font-bold text-white shadow-md">
              {Object.keys(filters).length}
            </span>
          )}
        </div>
        <span className={`text-xl transition-transform ${isOpen ? "rotate-180" : ""}`}>▼</span>
      </button>

      {/* Filter Content */}
      {isOpen && (
        <div className="border-t border-gray-200/50 p-5 dark:border-gray-700/50">
          <div className="space-y-4">
            {/* Budget Range */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Budget Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.budgetMin || ""}
                  onChange={(e) =>
                    updateFilter(
                      "budgetMin",
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.budgetMax || ""}
                  onChange={(e) =>
                    updateFilter(
                      "budgetMax",
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                />
              </div>
            </div>

            {/* City */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                City
              </label>
              <select
                value={filters.city || ""}
                onChange={(e) =>
                  updateFilter("city", e.target.value || undefined)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >
                <option value="">All Cities</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Trust Score Range */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Trust Score Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Min"
                  value={filters.trustScoreMin || ""}
                  onChange={(e) =>
                    updateFilter(
                      "trustScoreMin",
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Max"
                  value={filters.trustScoreMax || ""}
                  onChange={(e) =>
                    updateFilter(
                      "trustScoreMax",
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                />
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 hover:scale-105 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-slate-700"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
