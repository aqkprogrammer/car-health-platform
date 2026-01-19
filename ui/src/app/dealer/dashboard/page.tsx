"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { dealerApi } from "@/lib/api";
import SubscriptionUsageIndicator from "@/components/dealer/SubscriptionUsageIndicator";
import InventoryHealthOverview from "@/components/dealer/InventoryHealthOverview";
import BulkUploadUI from "@/components/dealer/BulkUploadUI";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  InventoryHealth,
  SubscriptionUsage,
  BulkUploadResult,
} from "@/types/dealer";
import Link from "next/link";
import Nav from "@/components/ui/Nav";

export default function DealerDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [inventoryHealth, setInventoryHealth] =
    useState<InventoryHealth | null>(null);
  const [subscriptionUsage, setSubscriptionUsage] =
    useState<SubscriptionUsage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // Check if user is a dealer
    if (user?.role !== "dealer") {
      router.push("/");
      return;
    }

    // Load data from API
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const [dashboardData, subscriptionData] = await Promise.all([
          dealerApi.getDashboard(),
          dealerApi.getSubscription(),
        ]);

        // Transform dashboard data to InventoryHealth
        // Handle both direct data and nested structure
        const dashboardInfo = dashboardData?.inventoryHealth || dashboardData;
        if (dashboardInfo) {
          setInventoryHealth({
            totalCars: dashboardInfo.totalCars ?? 0,
            activeListings: dashboardInfo.activeListings ?? 0,
            pendingReports: dashboardInfo.pendingReports ?? 0,
            averageTrustScore: dashboardInfo.averageTrustScore ?? 0,
            totalValue: dashboardInfo.totalValue ?? 0,
            currency: dashboardInfo.currency || "INR",
          });
        } else {
          // Set default values if no data
          setInventoryHealth({
            totalCars: 0,
            activeListings: 0,
            pendingReports: 0,
            averageTrustScore: 0,
            totalValue: 0,
            currency: "INR",
          });
        }

        // Transform subscription data
        // Handle both direct data and nested structure
        const subscriptionInfo = subscriptionData?.subscriptionUsage || subscriptionData;
        if (subscriptionInfo) {
          setSubscriptionUsage({
            plan: {
              id: subscriptionInfo.plan?.id || "",
              name: subscriptionInfo.plan?.name || "Free Plan",
              maxReports: subscriptionInfo.plan?.maxReports ?? 5,
              maxListings: subscriptionInfo.plan?.maxListings ?? 10,
              price: subscriptionInfo.plan?.price ?? 0,
              currency: subscriptionInfo.plan?.currency || "INR",
              period: subscriptionInfo.plan?.period || "monthly",
            },
            reportsUsed: subscriptionInfo.reportsUsed ?? 0,
            reportsRemaining: subscriptionInfo.reportsRemaining ?? 0,
            listingsUsed: subscriptionInfo.listingsUsed ?? 0,
            listingsRemaining: subscriptionInfo.listingsRemaining ?? 0,
            renewalDate: subscriptionInfo.renewalDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          });
        } else {
          // Set default values if no subscription data
          setSubscriptionUsage({
            plan: {
              id: "",
              name: "Free Plan",
              maxReports: 5,
              maxListings: 10,
              price: 0,
              currency: "INR",
              period: "monthly",
            },
            reportsUsed: 0,
            reportsRemaining: 5,
            listingsUsed: 0,
            listingsRemaining: 10,
            renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          });
        }
      } catch (err: any) {
        console.error("Error loading dealer dashboard:", err);
        setError(err.message || "Failed to load dashboard data");
        // Set default values on error so UI can still render
        setInventoryHealth({
          totalCars: 0,
          activeListings: 0,
          pendingReports: 0,
          averageTrustScore: 0,
          totalValue: 0,
          currency: "INR",
        });
        setSubscriptionUsage({
          plan: {
            id: "",
            name: "Free Plan",
            maxReports: 5,
            maxListings: 10,
            price: 0,
            currency: "INR",
            period: "monthly",
          },
          reportsUsed: 0,
          reportsRemaining: 5,
          listingsUsed: 0,
          listingsRemaining: 10,
          renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, router, user]);

  const handleBulkUpload = async (file: File): Promise<BulkUploadResult> => {
    try {
      const result = await dealerApi.bulkUpload(file);
      return {
        success: result.success || 0,
        failed: result.failed || 0,
        errors: result.errors || [],
      };
    } catch (err: any) {
      throw new Error(err.message || "Failed to upload file");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
        <div className="rounded-2xl border border-gray-200/50 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-12 text-center shadow-2xl dark:border-gray-700/50">
          <div className="mb-6 text-7xl">🔒</div>
          <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
            Authentication Required
          </h2>
          <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">
            Please login to access the dealer dashboard
          </p>
          <Link
            href="/login"
            className="inline-block rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 dark:from-blue-500 dark:to-indigo-500"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (user?.role !== "dealer") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
        <div className="rounded-2xl border border-gray-200/50 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-12 text-center shadow-2xl dark:border-gray-700/50">
          <div className="mb-6 text-7xl">🚫</div>
          <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
            Access Denied
          </h2>
          <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">
            This dashboard is only available for dealers. Your current role is:{" "}
            <span className="font-bold capitalize text-blue-600 dark:text-blue-400">{user?.role}</span>
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/"
              className="inline-block rounded-xl border-2 border-gray-300 px-6 py-3 font-bold text-gray-700 transition-all hover:bg-gray-50 hover:scale-105 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Go Home
            </Link>
            <Link
              href="/login"
              className="inline-block rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 dark:from-blue-500 dark:to-indigo-500"
            >
              Login as Dealer
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!inventoryHealth || !subscriptionUsage) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Navigation */}
      <Nav />

      {/* Main Content */}
      <main className="relative container mx-auto px-4 py-8 sm:py-12 z-10">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between animate-fade-in">
            <div>
              <h1 className="mb-3 text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
                Dealer{" "}
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Dashboard
                </span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 sm:text-xl">
                Manage your inventory, upload cars in bulk, and track your
                subscription usage
              </p>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="mt-4 rounded-2xl border-2 border-red-200/50 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-4 text-sm text-red-800 shadow-xl dark:border-red-800/50 dark:text-red-300">
                {error}
              </div>
            )}
            <div className="mt-4 sm:mt-0">
              <Link
                href="/reports/new"
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 dark:from-blue-500 dark:to-indigo-500"
              >
                <span className="relative z-10">+</span>
                <span className="relative z-10">New Report</span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 opacity-0 transition-opacity group-hover:opacity-100"></div>
              </Link>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mb-8 grid gap-6 lg:grid-cols-3">
            {/* Subscription Usage */}
            <div className="lg:col-span-1">
              <SubscriptionUsageIndicator usage={subscriptionUsage} />
            </div>

            {/* Inventory Health */}
            <div className="lg:col-span-2">
              <InventoryHealthOverview health={inventoryHealth} />
            </div>
          </div>

          {/* Bulk Upload */}
          <div className="mb-8">
            <BulkUploadUI onUpload={handleBulkUpload} />
          </div>

          {/* Quick Actions */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/reports/new"
              className="group rounded-2xl border border-gray-200/50 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-6 text-center shadow-lg transition-all hover:scale-105 hover:shadow-xl dark:border-gray-700/50"
            >
              <span className="mb-3 block text-5xl transition-transform group-hover:scale-110">📊</span>
              <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                Generate Report
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Create a new car health report
              </p>
            </Link>

            <Link
              href="/dealer/inventory"
              className="group rounded-2xl border border-gray-200/50 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-6 text-center shadow-lg transition-all hover:scale-105 hover:shadow-xl dark:border-gray-700/50"
            >
              <span className="mb-3 block text-5xl transition-transform group-hover:scale-110">🚗</span>
              <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                View Inventory
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage all your listings
              </p>
            </Link>

            <Link
              href="/dealer/analytics"
              className="group rounded-2xl border border-gray-200/50 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-6 text-center shadow-lg transition-all hover:scale-105 hover:shadow-xl dark:border-gray-700/50"
            >
              <span className="mb-3 block text-5xl transition-transform group-hover:scale-110">📈</span>
              <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                Analytics
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                View performance metrics
              </p>
            </Link>

            <Link
              href="/dealer/subscription"
              className="group rounded-2xl border border-gray-200/50 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-6 text-center shadow-lg transition-all hover:scale-105 hover:shadow-xl dark:border-gray-700/50"
            >
              <span className="mb-3 block text-5xl transition-transform group-hover:scale-110">💳</span>
              <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                Subscription
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage your plan
              </p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
