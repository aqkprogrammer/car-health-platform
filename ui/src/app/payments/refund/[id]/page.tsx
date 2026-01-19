"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import RefundStatusUI from "@/components/payment/RefundStatusUI";
import { RefundDetails } from "@/types/payment";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Link from "next/link";

export default function RefundStatusPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [refund, setRefund] = useState<RefundDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // Load refund details (in production, this would be an API call)
    const loadRefund = () => {
      const refundId = params.id as string;
      const storedRefund = localStorage.getItem(`refund_${refundId}`);

      if (storedRefund) {
        try {
          setRefund(JSON.parse(storedRefund));
        } catch (error) {
          console.error("Error parsing refund:", error);
          // Set mock refund on error
          setRefund({
            id: refundId,
            paymentId: `pay_${Date.now()}`,
            invoiceId: `inv_${Date.now()}`,
            amount: 1178.82,
            currency: "INR",
            reason: "Customer requested refund due to service issue",
            status: "processing",
            requestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            refundMethod: "original",
            transactionId: `refund_txn_${Date.now()}`,
          });
        }
      } else {
        // Mock refund for demo
        setRefund({
          id: refundId,
          paymentId: `pay_${Date.now()}`,
          invoiceId: `inv_${Date.now()}`,
          amount: 1178.82,
          currency: "INR",
          reason: "Customer requested refund due to service issue",
          status: "processing",
          requestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          refundMethod: "original",
          transactionId: `refund_txn_${Date.now()}`,
        });
      }

      setIsLoading(false);
    };

    loadRefund();
  }, [params.id, isAuthenticated, router]);

  if (!isAuthenticated || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!refund) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
            Refund Not Found
          </h2>
          <Link
            href="/profile"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            ← Back to Profile
          </Link>
        </div>
      </div>
    );
  }

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
            href="/profile"
            className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Profile
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 sm:py-12">
        <RefundStatusUI refund={refund} />
      </main>
    </div>
  );
}
