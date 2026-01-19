export interface MarketplaceListing {
  id: string;
  carDetails: {
    make: string;
    model: string;
    year: number;
    fuelType: string;
    transmission: string;
    kilometersDriven: number;
  };
  price: number;
  currency: "INR" | "EUR";
  trustScore: number;
  location: {
    city: string;
    state: string;
  };
  images: string[];
  verified: boolean;
  reportId: string;
  listedAt: string;
  // Enhanced data from backend
  _enhanced?: {
    priceInfo?: {
      amount: number;
      currency: string;
      formatted: string;
      pricePerKm?: number;
    };
    carSpecs?: {
      make: string;
      model: string;
      year: number;
      fuelType?: string;
      transmission?: string;
      kilometersDriven?: number;
      ownershipCount?: number;
      color?: string;
      fullName?: string;
    };
    media?: {
      photos: Array<{
        id: string;
        type: string;
        photoType?: string;
        url: string;
        thumbnailUrl?: string;
        fileName?: string;
      }>;
      videos: Array<{
        id: string;
        type: string;
        url: string;
        thumbnailUrl?: string;
        fileName?: string;
        duration?: number;
      }>;
    };
    aiInsights?: {
      status?: string;
      highlights?: any[];
      issues?: any[];
      recommendations?: any[];
      summary?: string;
    };
    seller?: {
      id: string;
      name: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      verified?: boolean;
      location?: {
        city?: string;
        state?: string;
      };
    };
    location?: {
      city?: string;
      state?: string;
      fullAddress?: string;
    };
  };
}

export type SortOption =
  | "price-low"
  | "price-high"
  | "trust-high"
  | "trust-low"
  | "newest"
  | "oldest";

export interface MarketplaceFilters {
  budgetMin?: number;
  budgetMax?: number;
  city?: string;
  trustScoreMin?: number;
  trustScoreMax?: number;
  makes?: string[]; // Multiple makes
  models?: Record<string, string[]>; // { make: [model1, model2, ...] }
  // Legacy support
  make?: string;
  model?: string;
}
