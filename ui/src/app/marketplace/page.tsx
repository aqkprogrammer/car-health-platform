"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { marketplaceApi } from "@/lib/api";
import EnhancedCarCard from "@/components/marketplace/EnhancedCarCard";
import EnhancedFilters from "@/components/marketplace/EnhancedFilters";
import Nav from "@/components/ui/Nav";
import BodyTypeFilter, { BodyType } from "@/components/marketplace/BodyTypeFilter";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  MarketplaceListing,
  MarketplaceFilters as FiltersType,
  SortOption,
} from "@/types/marketplace";

export default function MarketplacePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [filters, setFilters] = useState<FiltersType>({});
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [selectedBodyType, setSelectedBodyType] = useState<BodyType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Load listings from API
  useEffect(() => {
    const loadListings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await marketplaceApi.getAll(filters);
        
        // Helper function to extract images from listing
        const extractImages = (listing: any): string[] => {
          // Priority 1: Use structured media.photos if available (new enhanced format)
          if (listing.media?.photos && Array.isArray(listing.media.photos) && listing.media.photos.length > 0) {
            const photoUrls = listing.media.photos
              .map((photo: any) => photo.thumbnailUrl || photo.url)
              .filter((url: string) => url);
            if (photoUrls.length > 0) {
              return photoUrls;
            }
          }
          
          // Priority 2: If images are already provided as an array (from backend)
          if (Array.isArray(listing.images) && listing.images.length > 0) {
            return listing.images;
          }
          
          // Try to extract from report.media
          if (listing.report?.media) {
            let media = listing.report.media;
            
            // Handle JSONB field - might be a string that needs parsing
            if (typeof media === 'string') {
              try {
                media = JSON.parse(media);
              } catch (e) {
                console.warn('Failed to parse report.media as JSON:', e);
              }
            }
            
            if (Array.isArray(media)) {
              const urls = media
                .filter((m: any) => m.type === 'photo' || !m.type)
                .filter((m: any) => m.storageUrl || m.url)
                .map((m: any) => m.thumbnailUrl || m.storageUrl || m.url);
              if (urls.length > 0) {
                return urls;
              }
            } else if (typeof media === 'object' && media !== null && media.images) {
              if (Array.isArray(media.images) && media.images.length > 0) {
                const imageUrls = media.images.filter((img: any) => typeof img === 'string');
                if (imageUrls.length > 0) {
                  return imageUrls;
                }
              }
            }
          }
          
          // Fallback: Generate placeholder images
          return [
            `https://images.unsplash.com/photo-1492144534655-ae79c2c034d7?w=800&h=600&fit=crop`,
            `https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop`,
            `https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=600&fit=crop`,
            `https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&h=600&fit=crop`,
            `https://images.unsplash.com/photo-1549317661-bd32c8b0c2a3?w=800&h=600&fit=crop`,
            `https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop`,
            `https://images.unsplash.com/photo-1606664515524-9f283c033ba2?w=800&h=600&fit=crop`,
            `https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=600&fit=crop`,
          ];
        };

        // Transform API data to match MarketplaceListing type
        const transformedListings: MarketplaceListing[] = data.map((listing: any) => ({
          id: listing.id,
          carDetails: {
            make: listing.make || listing.carSpecs?.make || listing.report?.make || listing.carDetails?.make,
            model: listing.model || listing.carSpecs?.model || listing.report?.model || listing.carDetails?.model,
            year: listing.year || listing.carSpecs?.year || listing.report?.year || listing.carDetails?.year,
            fuelType: listing.carSpecs?.fuelType || listing.carDetails?.fuelType || listing.report?.carDetails?.fuelType || listing.report?.fuelType,
            transmission: listing.carSpecs?.transmission || listing.carDetails?.transmission || listing.report?.carDetails?.transmission || listing.report?.transmission,
            kilometersDriven: listing.carSpecs?.kilometersDriven || listing.carDetails?.kilometersDriven || listing.report?.carDetails?.kilometersDriven || listing.report?.kilometersDriven || 0,
          },
          price: listing.price || listing.priceInfo?.amount,
          currency: listing.currency || listing.priceInfo?.currency || 'INR',
          trustScore: listing.report?.trustScore || listing.trustScore || 0,
          location: {
            city: listing.location?.city || listing.city,
            state: listing.location?.state || listing.state,
          },
          images: extractImages(listing),
          verified: listing.seller?.verified || listing.verified !== false,
          reportId: listing.reportId || listing.report?.id,
          listedAt: listing.listedAt || listing.createdAt,
          // Store additional enhanced data for detail page
          _enhanced: {
            priceInfo: listing.priceInfo,
            carSpecs: listing.carSpecs,
            media: listing.media,
            aiInsights: listing.report?.aiInsights || listing.aiInsights,
            seller: listing.seller,
            location: listing.location,
          },
        }));
        
        setListings(transformedListings);
      } catch (err: any) {
        console.error("Error loading marketplace listings:", err);
        setError(err.message || "Failed to load marketplace listings");
      } finally {
        setIsLoading(false);
      }
    };

    loadListings();
  }, [filters]);

  // Filter and sort listings
  const filteredAndSortedListings = useMemo(() => {
    let filtered = [...listings];

    // Apply filters
    if (filters.budgetMin !== undefined) {
      filtered = filtered.filter((l) => l.price >= filters.budgetMin!);
    }
    if (filters.budgetMax !== undefined) {
      filtered = filtered.filter((l) => l.price <= filters.budgetMax!);
    }
    if (filters.city) {
      filtered = filtered.filter((l) => l.location.city === filters.city);
    }
    if (filters.trustScoreMin !== undefined) {
      filtered = filtered.filter((l) => l.trustScore >= filters.trustScoreMin!);
    }
    if (filters.trustScoreMax !== undefined) {
      filtered = filtered.filter((l) => l.trustScore <= filters.trustScoreMax!);
    }

    // Apply make/model filters
    if (filters.makes && filters.makes.length > 0) {
      filtered = filtered.filter((l) => {
        const make = l.carDetails?.make || l._enhanced?.carSpecs?.make;
        const model = l.carDetails?.model || l._enhanced?.carSpecs?.model;
        
        // Check if make is selected
        if (!filters.makes!.includes(make)) {
          return false;
        }
        
        // If models are specified for this make, check if model matches
        if (filters.models && filters.models[make] && filters.models[make].length > 0) {
          return filters.models[make].includes(model);
        }
        
        return true;
      });
    } else if (filters.make) {
      // Legacy support for single make/model
      filtered = filtered.filter((l) => {
        const make = l.carDetails?.make || l._enhanced?.carSpecs?.make;
        if (make !== filters.make) return false;
        if (filters.model) {
          const model = l.carDetails?.model || l._enhanced?.carSpecs?.model;
          return model === filters.model;
        }
        return true;
      });
    }

    // Apply body type filter (simplified - you can enhance this with actual body type data)
    // For now, we'll skip this filter as body type isn't in the data model yet

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "trust-high":
          return b.trustScore - a.trustScore;
        case "trust-low":
          return a.trustScore - b.trustScore;
        case "newest":
          return (
            new Date(b.listedAt).getTime() - new Date(a.listedAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.listedAt).getTime() - new Date(b.listedAt).getTime()
          );
        default:
          return 0;
      }
    });

    return filtered;
  }, [listings, filters, sortBy, selectedBodyType]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Navigation */}
      <Nav />

      {/* Main Content */}
      <main className="relative container mx-auto px-4 py-8 z-10">
          {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Buy a car</h1>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-semibold shadow-lg dark:from-blue-500 dark:to-indigo-500">
              {filteredAndSortedListings.length}
            </div>
          </div>

          {/* Body Type Filters */}
          <BodyTypeFilter
            selectedType={selectedBodyType}
            onTypeChange={setSelectedBodyType}
          />
        </div>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <span className="font-medium text-gray-900">Filters</span>
            <svg
              className={`w-5 h-5 text-gray-600 transition-transform ${showMobileFilters ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Mobile Filters Backdrop */}
        {showMobileFilters && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setShowMobileFilters(false)}
          />
        )}

        {/* Content Layout */}
        <div className="flex gap-6 relative">
          {/* Left Sidebar - Filters */}
          <aside className={`${showMobileFilters ? "block" : "hidden"} lg:block flex-shrink-0 ${showMobileFilters ? "fixed left-0 top-0 h-full overflow-y-auto z-50 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-xl" : "lg:sticky lg:top-[calc(4rem+2rem)] lg:self-start lg:max-h-[calc(100vh-4rem-2rem-2rem)] lg:overflow-y-auto"}`}>
            <EnhancedFilters
              filters={filters}
              onFiltersChange={setFilters}
              listings={listings}
            />
            {showMobileFilters && (
              <button
                onClick={() => setShowMobileFilters(false)}
                className="lg:hidden mt-4 w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg transition-all hover:scale-105 dark:from-blue-500 dark:to-indigo-500"
              >
                Apply Filters
              </button>
            )}
          </aside>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Loading State */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <LoadingSpinner size="lg" />
              </div>
            ) : error ? (
              <div className="rounded-2xl border-2 border-red-200 bg-white p-12 text-center shadow-xl">
                <div className="mb-6 text-7xl">⚠️</div>
                <h3 className="mb-3 text-2xl font-bold text-red-900">
                  Error loading listings
                </h3>
                <p className="mb-6 text-red-700">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="rounded-xl bg-gradient-to-r from-red-600 to-pink-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
                >
                  Retry
                </button>
              </div>
            ) : (
              <>
                {/* Listings Grid */}
                {filteredAndSortedListings.length > 0 ? (
                  <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                    {filteredAndSortedListings.map((listing) => (
                      <EnhancedCarCard key={listing.id} listing={listing} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border-2 border-gray-200 bg-white p-16 text-center shadow-xl">
                    <div className="mb-6 text-7xl">🔍</div>
                    <h3 className="mb-3 text-2xl font-bold text-gray-900">
                      No cars found
                    </h3>
                    <p className="mb-6 text-gray-600">
                      Try adjusting your filters to see more results.
                    </p>
                    <button
                      onClick={() => {
                        setFilters({});
                        setSelectedBodyType(null);
                      }}
                      className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 dark:from-blue-500 dark:to-indigo-500"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
