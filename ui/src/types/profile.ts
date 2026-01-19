export interface UserProfile {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  role: "buyer" | "seller" | "dealer";
  verified: boolean;
  joinedDate: string;
  avatar?: string;
}

export interface UploadedCar {
  id: string;
  make: string;
  model: string;
  year: number;
  uploadedAt: string;
  reportId?: string | null;
  carId?: string;
  status: "pending" | "completed" | "failed" | "draft" | "in_progress" | "analyzing";
  trustScore?: number;
}

export interface PurchasedReport {
  id: string;
  carDetails: {
    make: string;
    model: string;
    year: number;
  };
  purchasedAt: string;
  reportId: string;
  price: number;
  currency: "INR" | "EUR";
}

export interface SavedCar {
  id: string;
  listingId: string;
  carDetails: {
    make: string;
    model: string;
    year: number;
  };
  price: number;
  currency: "INR" | "EUR";
  trustScore: number;
  savedAt: string;
}
