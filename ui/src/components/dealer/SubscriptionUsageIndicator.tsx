"use client";

import { SubscriptionUsage } from "@/types/dealer";
import Link from "next/link";

interface SubscriptionUsageIndicatorProps {
  usage: SubscriptionUsage;
}

export default function SubscriptionUsageIndicator({
  usage,
}: SubscriptionUsageIndicatorProps) {
  const reportsPercentage = usage.plan.maxReports > 0
    ? Math.round((usage.reportsUsed / usage.plan.maxReports) * 100)
    : 0;
  const listingsPercentage = usage.plan.maxListings > 0
    ? Math.round((usage.listingsUsed / usage.plan.maxListings) * 100)
    : 0;

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500 dark:bg-red-600";
    if (percentage >= 75) return "bg-yellow-500 dark:bg-yellow-600";
    return "bg-green-500 dark:bg-green-600";
  };

  const getProgressBgColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-50 dark:bg-red-900/20";
    if (percentage >= 75) return "bg-yellow-50 dark:bg-yellow-900/20";
    return "bg-green-50 dark:bg-green-900/20";
  };

  const priceFormatted = new Intl.NumberFormat(
    usage.plan.currency === "INR" ? "en-IN" : "en-EU",
    {
      style: "currency",
      currency: usage.plan.currency,
      maximumFractionDigits: 0,
    }
  ).format(usage.plan.price);

  return (
    <div className="rounded-2xl border border-gray-200/50 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-6 shadow-xl dark:border-gray-700/50">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Subscription
        </h3>
        <span className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-1.5 text-xs font-bold text-white shadow-md dark:from-blue-500 dark:to-indigo-500">
          {usage.plan.name}
        </span>
      </div>

      {/* Plan Details */}
      <div className="mb-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-5 dark:from-slate-700/50 dark:to-slate-600/50 shadow-md">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
            Plan Price
          </span>
          <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
            {priceFormatted}/{usage.plan.period === "monthly" ? "mo" : "yr"}
          </span>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-white/50 dark:bg-slate-800/50 px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
          <span>Renews on</span>
          <span className="font-bold">
            {new Date(usage.renewalDate).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Reports Usage */}
      <div
        className={`mb-4 rounded-lg border p-3 ${getProgressBgColor(reportsPercentage)}`}
      >
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300">
            <span>📊</span>
            <span>Reports</span>
          </span>
          <span className="font-bold text-gray-900 dark:text-white">
            {usage.reportsUsed} / {usage.plan.maxReports}
          </span>
        </div>
        <div className="mb-2 h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className={`h-full transition-all duration-500 ${getProgressColor(reportsPercentage)}`}
            style={{ width: `${Math.min(reportsPercentage, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {usage.reportsRemaining} remaining
          </p>
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {reportsPercentage}% used
          </p>
        </div>
      </div>

      {/* Listings Usage */}
      <div
        className={`mb-4 rounded-lg border p-3 ${getProgressBgColor(listingsPercentage)}`}
      >
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300">
            <span>🚗</span>
            <span>Listings</span>
          </span>
          <span className="font-bold text-gray-900 dark:text-white">
            {usage.listingsUsed} / {usage.plan.maxListings}
          </span>
        </div>
        <div className="mb-2 h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className={`h-full transition-all duration-500 ${getProgressColor(listingsPercentage)}`}
            style={{ width: `${Math.min(listingsPercentage, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {usage.listingsRemaining} remaining
          </p>
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {listingsPercentage}% used
          </p>
        </div>
      </div>

      {/* Upgrade CTA */}
      {(reportsPercentage >= 75 || listingsPercentage >= 75) && (
        <Link
          href="/dealer/subscription"
          className="group relative block w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-4 py-3 text-center text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 dark:from-blue-500 dark:via-indigo-500 dark:to-purple-500"
        >
          <span className="relative z-10">
            {reportsPercentage >= 90 || listingsPercentage >= 90
              ? "⚠️ Upgrade Plan (Critical)"
              : "Upgrade Plan"}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 opacity-0 transition-opacity group-hover:opacity-100"></div>
        </Link>
      )}
    </div>
  );
}
