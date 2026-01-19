export type PaymentMethod = "card" | "upi" | "netbanking" | "wallet";
export type PaymentStatus = "pending" | "processing" | "completed" | "failed" | "refunded" | "refunding";
export type RefundStatus = "pending" | "processing" | "completed" | "failed";

export interface PaymentItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  currency: "INR" | "EUR";
}

export interface PaymentDetails {
  id: string;
  amount: number;
  currency: "INR" | "EUR";
  items: PaymentItem[];
  subtotal: number;
  tax: number;
  discount?: number;
  total: number;
  paymentMethod?: PaymentMethod;
  status: PaymentStatus;
  createdAt: string;
  completedAt?: string;
  transactionId?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  paymentId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  items: PaymentItem[];
  subtotal: number;
  tax: number;
  discount?: number;
  total: number;
  currency: "INR" | "EUR";
  status: PaymentStatus;
  issuedAt: string;
  dueDate?: string;
  paidAt?: string;
}

export interface RefundDetails {
  id: string;
  paymentId: string;
  invoiceId: string;
  amount: number;
  currency: "INR" | "EUR";
  reason: string;
  status: RefundStatus;
  requestedAt: string;
  processedAt?: string;
  refundMethod: "original" | "bank_transfer";
  transactionId?: string;
}

export interface CardDetails {
  number: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  name: string;
}

export interface UPIDetails {
  upiId: string;
}

export interface BillingAddress {
  name: string;
  email: string;
  phone?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}
