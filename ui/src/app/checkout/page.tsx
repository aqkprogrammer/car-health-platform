"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { paymentsApi, PaymentType } from "@/lib/api";
import CheckoutUI from "@/components/payment/CheckoutUI";
import { PaymentItem, PaymentMethod, BillingAddress, CardDetails, UPIDetails } from "@/types/payment";
import Link from "next/link";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<PaymentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/checkout");
      return;
    }

    // Get items from query params or localStorage
    const loadItems = () => {
      const itemParam = searchParams.get("items");
      let loadedItems: PaymentItem[] = [];

      if (itemParam) {
        try {
          loadedItems = JSON.parse(decodeURIComponent(itemParam));
        } catch (error) {
          console.error("Error parsing items:", error);
          // Fallback to default if parsing fails
          loadedItems = [
            {
              id: "report_1",
              name: "Car Health Report",
              description: "Comprehensive AI-powered health report",
              quantity: 1,
              price: 999,
              currency: "INR",
            },
          ];
        }
      } else {
        // Fallback: get from localStorage or use default
        const storedItems = localStorage.getItem("checkoutItems");
        if (storedItems) {
          try {
            loadedItems = JSON.parse(storedItems);
          } catch (error) {
            console.error("Error parsing stored items:", error);
            // Fallback to default if parsing fails
            loadedItems = [
              {
                id: "report_1",
                name: "Car Health Report",
                description: "Comprehensive AI-powered health report",
                quantity: 1,
                price: 999,
                currency: "INR",
              },
            ];
          }
        } else {
          // Default: Single report purchase
          loadedItems = [
            {
              id: "report_1",
              name: "Car Health Report",
              description: "Comprehensive AI-powered health report",
              quantity: 1,
              price: 999,
              currency: "INR",
            },
          ];
        }
      }
      
      setItems(loadedItems);
      setIsLoading(false);
    };

    loadItems();
  }, [isAuthenticated, router, searchParams]);

  const handlePaymentComplete = async (
    paymentData: {
      method: PaymentMethod;
      billingAddress: BillingAddress;
      paymentDetails?: CardDetails | UPIDetails;
    },
    paymentItems: PaymentItem[]
  ) => {
    try {
      // Calculate totals
      const subtotal = paymentItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const tax = subtotal * 0.18;
      const total = subtotal + tax;
      const currency = paymentItems[0]?.currency || "INR";
      
      // Get report ID from first item (assuming single report purchase for now)
      const reportId = paymentItems[0]?.id;
      
      if (!reportId) {
        throw new Error("Report ID is required");
      }

      // Create checkout via API
      const checkoutResult = await paymentsApi.checkout({
        reportId,
        amount: total,
        currency,
        type: PaymentType.REPORT,
      });

      // Redirect to payment status page
      router.push(`/payments/status/${checkoutResult.id || checkoutResult.paymentId}`);
    } catch (err: any) {
      console.error("Error processing payment:", err);
      // Show error to user (you might want to add error state handling here)
      alert(err.message || "Failed to process payment. Please try again.");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Ensure we always have at least default items
  const displayItems = items.length > 0 ? items : [
    {
      id: "report_1",
      name: "Car Health Report",
      description: "Comprehensive AI-powered health report",
      quantity: 1,
      price: 999,
      currency: "INR" as const,
    },
  ];

  const handlePaymentCompleteWithItems = async (paymentData: {
    method: PaymentMethod;
    billingAddress: BillingAddress;
    paymentDetails?: CardDetails | UPIDetails;
  }) => {
    // Use displayItems instead of items to ensure we have valid items
    await handlePaymentComplete(paymentData, displayItems);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="container mx-auto border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80">
        <div className="flex items-center justify-between px-4 py-4">
          <Link
            href="/"
            className="text-xl font-bold text-blue-600 dark:text-blue-400 sm:text-2xl"
          >
            CarHealth
          </Link>
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Cancel
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            Checkout
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Complete your payment to proceed
          </p>
        </div>

        <CheckoutUI
          items={displayItems}
          onComplete={handlePaymentCompleteWithItems}
          onCancel={() => router.push("/")}
        />
      </main>
    </div>
  );
}
