"use client";

import { InventoryHealth } from "@/types/dealer";
import Link from "next/link";

interface InventoryHealthOverviewProps {
  health: InventoryHealth;
}

export default function InventoryHealthOverview({
  health,
}: InventoryHealthOverviewProps) {
  const valueFormatted = new Intl.NumberFormat(
    health.currency === "INR" ? "en-IN" : "en-EU",
    {
      style: "currency",
      currency: health.currency,
      maximumFractionDigits: 0,
    }
  ).format(health.totalValue);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-blue-600 dark:text-blue-400";
    if (score >= 40) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const activePercentage = health.totalCars > 0
    ? Math.round((health.activeListings / health.totalCars) * 100)
    : 0;
  const pendingPercentage = health.totalCars > 0
    ? Math.round((health.pendingReports / health.totalCars) * 100)
    : 0;

  const stats = [
    {
      label: "Total Cars",
      value: health.totalCars,
      icon: "🚗",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      borderColor: "border-blue-200 dark:border-blue-800",
    },
    {
      label: "Active Listings",
      value: health.activeListings,
      icon: "✅",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      borderColor: "border-green-200 dark:border-green-800",
      percentage: activePercentage,
    },
    {
      label: "Pending Reports",
      value: health.pendingReports,
      icon: "⏳",
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      borderColor: "border-yellow-200 dark:border-yellow-800",
      percentage: pendingPercentage,
    },
    {
      label: "Avg Trust Score",
      value: `${health.averageTrustScore.toFixed(1)}%`,
      icon: "📊",
      color: getScoreColor(health.averageTrustScore),
      bgColor:
        health.averageTrustScore >= 80
          ? "bg-green-50 dark:bg-green-900/20"
          : health.averageTrustScore >= 60
          ? "bg-blue-50 dark:bg-blue-900/20"
          : health.averageTrustScore >= 40
          ? "bg-yellow-50 dark:bg-yellow-900/20"
          : "bg-red-50 dark:bg-red-900/20",
      borderColor:
        health.averageTrustScore >= 80
          ? "border-green-200 dark:border-green-800"
          : health.averageTrustScore >= 60
          ? "border-blue-200 dark:border-blue-800"
          : health.averageTrustScore >= 40
          ? "border-yellow-200 dark:border-yellow-800"
          : "border-red-200 dark:border-red-800",
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200/50 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-6 shadow-xl dark:border-gray-700/50">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Inventory Health Overview
        </h3>
        <Link
          href="/dealer/inventory"
          className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 px-4 py-2 text-sm font-bold text-blue-600 transition-all hover:scale-105 dark:text-blue-400"
        >
          View All →
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`rounded-lg border-2 p-4 transition-all hover:shadow-md ${stat.borderColor} ${stat.bgColor}`}
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xl">{stat.icon}</span>
              {stat.percentage !== undefined && (
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {stat.percentage}%
                </span>
              )}
            </div>
            <p className={`mb-1 text-sm font-medium ${stat.color}`}>
              {stat.label}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stat.value}
            </p>
            {stat.percentage !== undefined && (
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className={`h-full transition-all ${
                    stat.label === "Active Listings"
                      ? "bg-green-500"
                      : "bg-yellow-500"
                  }`}
                  style={{ width: `${stat.percentage}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Total Value */}
      <div className="rounded-xl border-2 border-blue-200/50 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 shadow-lg dark:border-blue-800/50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
              Total Inventory Value
            </p>
            <p className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              {valueFormatted}
            </p>
          </div>
          <span className="text-5xl">💰</span>
        </div>
      </div>
    </div>
  );
}
