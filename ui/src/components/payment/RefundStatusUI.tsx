"use client";

import { RefundDetails, RefundStatus } from "@/types/payment";
import Link from "next/link";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface RefundStatusUIProps {
  refund: RefundDetails;
}

export default function RefundStatusUI({ refund }: RefundStatusUIProps) {
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

  const getStatusConfig = (status: RefundStatus) => {
    switch (status) {
      case "completed":
        return {
          icon: "✅",
          title: "Refund Completed",
          description: "Your refund has been processed successfully.",
          color: "text-green-600 dark:text-green-400",
          bgColor: "bg-green-50 dark:bg-green-900/20",
          borderColor: "border-green-200 dark:border-green-800",
        };
      case "processing":
        return {
          icon: "⏳",
          title: "Refund Processing",
          description:
            "Your refund is being processed. It may take 5-7 business days to reflect in your account.",
          color: "text-blue-600 dark:text-blue-400",
          bgColor: "bg-blue-50 dark:bg-blue-900/20",
          borderColor: "border-blue-200 dark:border-blue-800",
        };
      case "pending":
        return {
          icon: "⏸️",
          title: "Refund Pending",
          description:
            "Your refund request is pending approval. We'll notify you once it's processed.",
          color: "text-yellow-600 dark:text-yellow-400",
          bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
          borderColor: "border-yellow-200 dark:border-yellow-800",
        };
      case "failed":
        return {
          icon: "❌",
          title: "Refund Failed",
          description:
            "Your refund could not be processed. Please contact support for assistance.",
          color: "text-red-600 dark:text-red-400",
          bgColor: "bg-red-50 dark:bg-red-900/20",
          borderColor: "border-red-200 dark:border-red-800",
        };
      default:
        return {
          icon: "❓",
          title: "Unknown Status",
          description: "Refund status is unknown.",
          color: "text-gray-600 dark:text-gray-400",
          bgColor: "bg-gray-50 dark:bg-gray-900/20",
          borderColor: "border-gray-200 dark:border-gray-800",
        };
    }
  };

  const statusConfig = getStatusConfig(refund.status);
  const isProcessing = refund.status === "processing";

  return (
    <div className="mx-auto max-w-2xl">
      <div
        className={`rounded-xl border-2 p-8 ${statusConfig.borderColor} ${statusConfig.bgColor}`}
      >
        {/* Status Header */}
        <div className="mb-6 text-center">
          {isProcessing ? (
            <div className="mb-4 flex justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="mb-4 text-6xl">{statusConfig.icon}</div>
          )}
          <h2
            className={`mb-2 text-3xl font-bold ${statusConfig.color} dark:text-white`}
          >
            {statusConfig.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {statusConfig.description}
          </p>
        </div>

        {/* Refund Details */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Refund Details
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Refund ID</span>
              <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                {refund.id}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Payment ID</span>
              <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                {refund.paymentId}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Invoice ID</span>
              <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                {refund.invoiceId}
              </span>
            </div>
            {refund.transactionId && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Transaction ID
                </span>
                <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                  {refund.transactionId}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Refund Method
              </span>
              <span className="font-semibold capitalize text-gray-900 dark:text-white">
                {refund.refundMethod === "original"
                  ? "Original Payment Method"
                  : "Bank Transfer"}
              </span>
            </div>
            <div className="border-t border-gray-200 pt-3 dark:border-gray-700">
              <div className="flex justify-between">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  Refund Amount
                </span>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(refund.amount, refund.currency)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Refund Reason */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
            Refund Reason
          </h3>
          <p className="text-gray-600 dark:text-gray-400">{refund.reason}</p>
        </div>

        {/* Timeline */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Timeline
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <span className="text-sm">1</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white">
                  Refund Requested
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(refund.requestedAt).toLocaleString()}
                </p>
              </div>
            </div>
            {refund.status !== "pending" && (
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <span className="text-sm">2</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Refund {refund.status === "processing" ? "Processing" : refund.status === "completed" ? "Completed" : "Failed"}
                  </p>
                  {refund.processedAt && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(refund.processedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href={`/payments/invoice/${refund.invoiceId}`}
            className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            View Invoice
          </Link>
          <Link
            href="/profile"
            className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Go to Profile
          </Link>
          {refund.status === "failed" && (
            <Link
              href="/support"
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Contact Support
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
