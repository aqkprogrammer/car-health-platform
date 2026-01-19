// Shared TypeScript types for the application

export type { UserRole, User } from "@/contexts/AuthContext";
export type {
  CarDetails,
  CarDetailsFormErrors,
  FuelType,
  TransmissionType,
} from "@/types/car";
export type {
  PaymentMethod,
  PaymentStatus,
  RefundStatus,
  PaymentItem,
  PaymentDetails,
  Invoice,
  RefundDetails,
  CardDetails,
  UPIDetails,
  BillingAddress,
} from "@/types/payment";

// Add more shared types here as the application grows
