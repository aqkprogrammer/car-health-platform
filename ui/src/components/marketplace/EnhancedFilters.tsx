"use client";

import { useState, useMemo } from "react";
import { MarketplaceFilters as FiltersType } from "@/types/marketplace";
import MakeModelSelector from "./MakeModelSelector";

interface EnhancedFiltersProps {
  filters: FiltersType;
  onFiltersChange: (filters: FiltersType) => void;
  listings: any[];
}

interface MakeModelFilter {
  make: string;
  models: string[];
}

export default function EnhancedFilters({
  filters,
  onFiltersChange,
  listings,
}: EnhancedFiltersProps) {
  // Extract unique makes and models from listings
  const makeModelData = useMemo(() => {
    const makeMap = new Map<string, Set<string>>();
    
    listings.forEach((listing) => {
      const make = listing.carDetails?.make || listing._enhanced?.carSpecs?.make;
      const model = listing.carDetails?.model || listing._enhanced?.carSpecs?.model;
      
      if (make && model) {
        if (!makeMap.has(make)) {
          makeMap.set(make, new Set());
        }
        makeMap.get(make)!.add(model);
      }
    });

    const result: MakeModelFilter[] = [];
    makeMap.forEach((models, make) => {
      result.push({
        make,
        models: Array.from(models).sort(),
      });
    });

    return result.sort((a, b) => a.make.localeCompare(b.make));
  }, [listings]);

  // Get selected makes and models
  const selectedMakes = filters.makes || (filters.make ? [filters.make] : []);
  const selectedModels = filters.models || (filters.make && filters.model ? { [filters.make]: [filters.model] } : {});

  // Price range calculation
  const priceRange = useMemo(() => {
    if (listings.length === 0) return { min: 0, max: 100000 };
    const prices = listings.map((l) => l.price).filter((p) => p > 0);
    if (prices.length === 0) return { min: 0, max: 100000 };
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [listings]);

  // Mileage range calculation
  const mileageRange = useMemo(() => {
    if (listings.length === 0) return { min: 0, max: 200000 };
    const mileages = listings
      .map((l) => l.carDetails?.kilometersDriven || l._enhanced?.carSpecs?.kilometersDriven)
      .filter((m) => m && m > 0);
    if (mileages.length === 0) return { min: 0, max: 200000 };
    return {
      min: Math.min(...mileages),
      max: Math.max(...mileages),
    };
  }, [listings]);

  const updateFilter = (key: keyof FiltersType, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const resetSection = (section: "make" | "price" | "mileage") => {
    if (section === "make") {
      const { makes, models, make, model, ...rest } = filters;
      onFiltersChange(rest);
    } else if (section === "price") {
      const { budgetMin, budgetMax, ...rest } = filters;
      onFiltersChange(rest);
    } else if (section === "mileage") {
      // Add mileage filters if needed
      onFiltersChange(filters);
    }
  };

  const handleMakeModelChange = (makes: string[], models: Record<string, string[]>) => {
    const newFilters = { ...filters };
    
    // Remove legacy make/model if exists
    delete newFilters.make;
    delete newFilters.model;
    
    // Set new makes/models
    if (makes.length > 0) {
      newFilters.makes = makes;
      newFilters.models = models;
    } else {
      delete newFilters.makes;
      delete newFilters.models;
    }
    
    onFiltersChange(newFilters);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const hasMakeModelFilters = selectedMakes.length > 0;

  return (
    <div className="w-80 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-lg shadow-lg border border-white/20 dark:border-slate-700/50 p-6 space-y-6 pb-8">
      {/* Make and Model Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Make and model</h3>
          {hasMakeModelFilters && (
            <button
              onClick={() => resetSection("make")}
              className="text-xs text-blue-600 hover:text-indigo-600 dark:text-blue-400 dark:hover:text-indigo-400 font-medium"
            >
              Reset
            </button>
          )}
        </div>

        {/* Make Model Selector */}
        <MakeModelSelector
          availableMakes={makeModelData}
          selectedMakes={selectedMakes}
          selectedModels={selectedModels}
          onSelectionChange={handleMakeModelChange}
        />
      </div>

      {/* Price Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Price</h3>
          {(filters.budgetMin || filters.budgetMax) && (
            <button
              onClick={() => resetSection("price")}
              className="text-xs text-blue-600 hover:text-indigo-600 dark:text-blue-400 dark:hover:text-indigo-400 font-medium"
            >
              Reset
            </button>
          )}
        </div>

        {/* Price Histogram Placeholder */}
        <div className="h-16 bg-gray-100 rounded mb-4 flex items-end justify-between px-2 pb-2">
          {Array.from({ length: 10 }).map((_, i) => {
            // Calculate height based on price distribution
            const priceStep = (priceRange.max - priceRange.min) / 10;
            const stepMin = priceRange.min + priceStep * i;
            const stepMax = stepMin + priceStep;
            const count = listings.filter(
              (l) => l.price >= stepMin && l.price < stepMax
            ).length;
            const maxCount = Math.max(...Array.from({ length: 10 }, (_, j) => {
              const sMin = priceRange.min + priceStep * j;
              const sMax = sMin + priceStep;
              return listings.filter((l) => l.price >= sMin && l.price < sMax).length;
            }));
            const height = maxCount > 0 ? (count / maxCount) * 100 : 20;
            
            return (
              <div
                key={i}
                className="flex-1 bg-gradient-to-t from-blue-500 to-indigo-500 rounded-t transition-all"
                style={{
                  height: `${Math.max(height, 10)}%`,
                  margin: "0 1px",
                }}
              />
            );
          })}
        </div>

        {/* Price Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            placeholder="Min"
            value={filters.budgetMin || ""}
            onChange={(e) =>
              updateFilter("budgetMin", e.target.value ? parseInt(e.target.value) : undefined)
            }
            className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.budgetMax || ""}
            onChange={(e) =>
              updateFilter("budgetMax", e.target.value ? parseInt(e.target.value) : undefined)
            }
            className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="text-xs text-gray-500 mt-2">
          Range: {formatPrice(priceRange.min)} - {formatPrice(priceRange.max)}
        </div>
      </div>

      {/* Mileage Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Mileage, km</h3>
          <button
            onClick={() => resetSection("mileage")}
            className="text-xs text-blue-600 hover:text-indigo-600 dark:text-blue-400 dark:hover:text-indigo-400 font-medium"
          >
            Reset
          </button>
        </div>

        {/* Mileage Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            placeholder="Min"
            className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="number"
            placeholder="Max"
            className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="text-xs text-gray-500 mt-2">
          Range: {mileageRange.min.toLocaleString()} - {mileageRange.max.toLocaleString()} km
        </div>
      </div>
    </div>
  );
}
