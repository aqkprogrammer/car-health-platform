"use client";

import { PaymentStatus, PaymentDetails } from "@/types/payment";
import Link from "next/link";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface PaymentStatusScreenProps {
  payment: PaymentDetails;
  onRetry?: () => void;
}

export default function PaymentStatusScreen({
  payment,
  onRetry,
}: PaymentStatusScreenProps) {
  const formatCurrency = (amount: number, currency: "INR" | "EUR") => {
    return new Intl.NumberFormat(
      currency === "INR" ? "en-IN" : "en-EU",
      {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }
    ).format(amount);
  };

  const getStatusConfig = (status: PaymentStatus) => {
    switch (status) {
      case "completed":
        return {
          icon: "✅",
          title: "Payment Successful",
          description: "Your payment has been processed successfully.",
          color: "text-green-600 dark:text-green-400",
          bgColor: "bg-green-50 dark:bg-green-900/20",
          borderColor: "border-green-200 dark:border-green-800",
        };
      case "processing":
        return {
          icon: "⏳",
          title: "Payment Processing",
          description: "Your payment is being processed. Please wait...",
          color: "text-blue-600 dark:text-blue-400",
          bgColor: "bg-blue-50 dark:bg-blue-900/20",
          borderColor: "border-blue-200 dark:border-blue-800",
        };
      case "pending":
        return {
          icon: "⏸️",
          title: "Payment Pending",
          description: "Your payment is pending confirmation.",
          color: "text-yellow-600 dark:text-yellow-400",
          bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
          borderColor: "border-yellow-200 dark:border-yellow-800",
        };
      case "failed":
        return {
          icon: "❌",
          title: "Payment Failed",
          description: "Your payment could not be processed. Please try again.",
          color: "text-red-600 dark:text-red-400",
          bgColor: "bg-red-50 dark:bg-red-900/20",
          borderColor: "border-red-200 dark:border-red-800",
        };
      case "refunded":
        return {
          icon: "↩️",
          title: "Payment Refunded",
          description: "Your payment has been refunded successfully.",
          color: "text-purple-600 dark:text-purple-400",
          bgColor: "bg-purple-50 dark:bg-purple-900/20",
          borderColor: "border-purple-200 dark:border-purple-800",
        };
      case "refunding":
        return {
          icon: "🔄",
          title: "Refund Processing",
          description: "Your refund is being processed.",
          color: "text-blue-600 dark:text-blue-400",
          bgColor: "bg-blue-50 dark:bg-blue-900/20",
          borderColor: "border-blue-200 dark:border-blue-800",
        };
      default:
        return {
          icon: "❓",
          title: "Unknown Status",
          description: "Payment status is unknown.",
          color: "text-gray-600 dark:text-gray-400",
          bgColor: "bg-gray-50 dark:bg-gray-900/20",
          borderColor: "border-gray-200 dark:border-gray-800",
        };
    }
  };

  const statusConfig = getStatusConfig(payment.status);
  const isProcessing = payment.status === "processing" || payment.status === "refunding";

  return (
    <div className="mx-auto max-w-2xl">
      <div
        className={`rounded-xl border-2 p-8 text-center ${statusConfig.borderColor} ${statusConfig.bgColor}`}
      >
        {/* Status Icon */}
        <div className="mb-4 flex justify-center">
          {isProcessing ? (
            <LoadingSpinner size="lg" />
          ) : (
            <span className="text-6xl">{statusConfig.icon}</span>
          )}
        </div>

        {/* Status Title */}
        <h2
          className={`mb-2 text-3xl font-bold ${statusConfig.color} dark:text-white`}
        >
          {statusConfig.title}
        </h2>

        {/* Status Description */}
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          {statusConfig.description}
        </p>

        {/* Payment Details */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Payment ID</span>
              <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                {payment.id}
              </span>
            </div>
            {payment.transactionId && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Transaction ID
                </span>
                <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                  {payment.transactionId}
                </span>
              </div>
            )}
            {payment.paymentMethod && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Payment Method
                </span>
                <span className="font-semibold capitalize text-gray-900 dark:text-white">
                  {payment.paymentMethod === "card" && "Credit/Debit Card"}
                  {payment.paymentMethod === "upi" && "UPI"}
                  {payment.paymentMethod === "netbanking" && "Net Banking"}
                  {payment.paymentMethod === "wallet" && "Wallet"}
                </span>
              </div>
            )}
            <div className="border-t border-gray-200 pt-3 dark:border-gray-700">
              <div className="flex justify-between">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  Amount Paid
                </span>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(payment.total, payment.currency)}
                </span>
              </div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Paid on{" "}
              {new Date(payment.completedAt || payment.createdAt).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          {payment.status === "failed" && onRetry && (
            <button
              onClick={onRetry}
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Retry Payment
            </button>
          )}
          {payment.status === "completed" && (
            <Link
              href={`/payments/invoice/${payment.id}`}
              className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              View Invoice
            </Link>
          )}
          <Link
            href="/profile"
            className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Go to Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
