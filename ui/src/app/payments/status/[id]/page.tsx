"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import PaymentStatusScreen from "@/components/payment/PaymentStatusScreen";
import { PaymentDetails } from "@/types/payment";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Link from "next/link";

export default function PaymentStatusPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [payment, setPayment] = useState<PaymentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // Load payment details (in production, this would be an API call)
    const loadPayment = () => {
      const paymentId = params.id as string;
      const storedPayment = localStorage.getItem(`payment_${paymentId}`);

      if (storedPayment) {
        try {
          setPayment(JSON.parse(storedPayment));
        } catch (error) {
          console.error("Error parsing payment:", error);
          // Set mock payment on error
          setPayment({
            id: paymentId,
            amount: 999,
            currency: "INR",
            items: [
              {
                id: "report_1",
                name: "Car Health Report",
                description: "Comprehensive AI-powered health report",
                quantity: 1,
                price: 999,
                currency: "INR",
              },
            ],
            subtotal: 999,
            tax: 179.82,
            total: 1178.82,
            paymentMethod: "card",
            status: "completed",
            createdAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
            transactionId: `txn_${Date.now()}`,
          });
        }
      } else {
        // Mock payment for demo
        setPayment({
          id: paymentId,
          amount: 999,
          currency: "INR",
          items: [
            {
              id: "report_1",
              name: "Car Health Report",
              description: "Comprehensive AI-powered health report",
              quantity: 1,
              price: 999,
              currency: "INR",
            },
          ],
          subtotal: 999,
          tax: 179.82,
          total: 1178.82,
          paymentMethod: "card",
          status: "completed",
          createdAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          transactionId: `txn_${Date.now()}`,
        });
      }

      setIsLoading(false);
    };

    loadPayment();
  }, [params.id, isAuthenticated, router]);

  const handleRetry = () => {
    router.push("/checkout");
  };

  if (!isAuthenticated || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
            Payment Not Found
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
        <PaymentStatusScreen payment={payment} onRetry={handleRetry} />
      </main>
    </div>
  );
}
