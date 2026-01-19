"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

export default function PaymentTestPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Generate test IDs using useMemo to avoid calling Date.now() during render
  const { testPaymentId, testInvoiceId, testRefundId } = useMemo(() => {
    const timestamp = Date.now();
    return {
      testPaymentId: `pay_${timestamp}`,
      testInvoiceId: `inv_${timestamp}`,
      testRefundId: `refund_${timestamp}`,
    };
  }, []);

  if (!isAuthenticated) {
    return null;
  }

  // Test checkout items
  const testItems = [
    {
      id: "report_1",
      name: "Car Health Report",
      description: "Comprehensive AI-powered health report",
      quantity: 1,
      price: 999,
      currency: "INR",
    },
  ];

  const checkoutUrl = `/checkout?items=${encodeURIComponent(JSON.stringify(testItems))}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-8 text-4xl font-bold text-gray-900 dark:text-white">
            Payment Features Test Page
          </h1>

          <div className="space-y-6">
            {/* Checkout */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
                1. Checkout UI
              </h2>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                Complete checkout flow with billing address and payment method selection
              </p>
              <Link
                href={checkoutUrl}
                className="inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Go to Checkout →
              </Link>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Route: <code className="rounded bg-gray-100 px-2 py-1 dark:bg-gray-700">/checkout</code>
              </p>
            </div>

            {/* Payment Status */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
                2. Payment Status Screen
              </h2>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                View payment status with different states (completed, processing, failed, etc.)
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/payments/status/${testPaymentId}`}
                  className="inline-block rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                >
                  Completed Status →
                </Link>
                <Link
                  href="/payments/status/pay_test_failed"
                  className="inline-block rounded-lg bg-red-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                >
                  Failed Status →
                </Link>
                <Link
                  href="/payments/status/pay_test_processing"
                  className="inline-block rounded-lg bg-yellow-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600"
                >
                  Processing Status →
                </Link>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Route: <code className="rounded bg-gray-100 px-2 py-1 dark:bg-gray-700">/payments/status/[id]</code>
              </p>
            </div>

            {/* Invoice Preview */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
                3. Invoice Preview
              </h2>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                View and download invoice with itemized billing
              </p>
              <Link
                href={`/payments/invoice/${testInvoiceId}`}
                className="inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                View Invoice →
              </Link>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Route: <code className="rounded bg-gray-100 px-2 py-1 dark:bg-gray-700">/payments/invoice/[id]</code>
              </p>
            </div>

            {/* Refund Status */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
                4. Refund Status UI
              </h2>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                Track refund status with timeline and details
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/payments/refund/${testRefundId}`}
                  className="inline-block rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
                >
                  Processing Refund →
                </Link>
                <Link
                  href="/payments/refund/refund_test_completed"
                  className="inline-block rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                >
                  Completed Refund →
                </Link>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Route: <code className="rounded bg-gray-100 px-2 py-1 dark:bg-gray-700">/payments/refund/[id]</code>
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Quick Links
            </h3>
            <div className="grid gap-2 sm:grid-cols-2">
              <Link
                href="/"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                ← Home
              </Link>
              <Link
                href="/profile"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                Profile →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
