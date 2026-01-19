export interface DealerInventory {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  currency: "INR" | "EUR";
  trustScore: number;
  status: "active" | "pending" | "sold" | "draft";
  listedAt: string;
  reportId?: string;
}

export interface InventoryHealth {
  totalCars: number;
  activeListings: number;
  pendingReports: number;
  averageTrustScore: number;
  totalValue: number;
  currency: "INR" | "EUR";
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  maxReports: number;
  maxListings: number;
  price: number;
  currency: "INR" | "EUR";
  period: "monthly" | "yearly";
}

export interface SubscriptionUsage {
  plan: SubscriptionPlan;
  reportsUsed: number;
  reportsRemaining: number;
  listingsUsed: number;
  listingsRemaining: number;
  renewalDate: string;
}

export interface BulkUploadResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
}
