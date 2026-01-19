"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { usersApi, carsApi } from "@/lib/api";
import UserProfileInfo from "@/components/profile/UserProfileInfo";
import UploadedCarsSection from "@/components/profile/UploadedCarsSection";
import PurchasedReportsSection from "@/components/profile/PurchasedReportsSection";
import SavedCarsSection from "@/components/profile/SavedCarsSection";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  UserProfile,
  UploadedCar,
  PurchasedReport,
  SavedCar,
} from "@/types/profile";
import Link from "next/link";
import Nav from "@/components/ui/Nav";

type TabType = "overview" | "reports" | "purchases" | "saved";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [uploadedCars, setUploadedCars] = useState<UploadedCar[]>([]);
  const [purchasedReports, setPurchasedReports] = useState<PurchasedReport[]>(
    []
  );
  const [savedCars, setSavedCars] = useState<SavedCar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const loadProfileData = async () => {
      try {
        setIsLoading(true);
        // Load all profile data in parallel
        const [profileData, uploadedCarsData, purchasedReportsData, savedCarsData, draftCarsData] =
          await Promise.all([
            usersApi.getProfile(),
            usersApi.getUploadedCars(),
            usersApi.getPurchasedReports(),
            usersApi.getSavedCars(),
            carsApi.getMyCars().catch(() => []), // Fetch draft/in-progress cars
          ]);

        // Transform profile data
        setProfile({
          id: profileData.id,
          name: profileData.firstName || profileData.phone || profileData.email || "User",
          phone: profileData.phone,
          email: profileData.email,
          role: profileData.role as any,
          verified: true,
          joinedDate: profileData.createdAt,
        });

        // Transform completed reports
        const completedReports = uploadedCarsData.map((report: any) => ({
          id: report.id,
          make: report.make,
          model: report.model,
          year: report.year,
          uploadedAt: report.createdAt,
          reportId: report.id,
          status: report.status || "completed",
          trustScore: report.trustScore,
          carId: report.carDetails?.carId,
        }));

        // Transform draft/in-progress cars (Cars that haven't been converted to Reports yet)
        const draftCars = draftCarsData
          .filter((car: any) => {
            // Only include cars that don't have a completed report
            // Status: draft, media_uploaded, submitted, analyzing
            const hasCompletedReport = completedReports.some(
              (report: any) => report.carId === car.id
            );
            return !hasCompletedReport;
          })
          .map((car: any) => ({
            id: car.id,
            make: car.make,
            model: car.model,
            year: car.year,
            uploadedAt: car.createdAt,
            reportId: null, // No report yet
            status: car.status === "draft" ? "draft" : 
                   car.status === "media_uploaded" ? "in_progress" :
                   car.status === "submitted" || car.status === "analyzing" ? "analyzing" : "draft",
            trustScore: undefined,
            carId: car.id,
          }));

        // Combine completed reports and draft cars, sorted by date
        const allCars = [...completedReports, ...draftCars].sort(
          (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        );

        setUploadedCars(allCars);

        // Transform purchased reports
        setPurchasedReports(
          purchasedReportsData.map((purchase: any) => ({
            id: purchase.id,
            carDetails: {
              make: purchase.report?.make || purchase.report?.carDetails?.make,
              model: purchase.report?.model || purchase.report?.carDetails?.model,
              year: purchase.report?.year || purchase.report?.carDetails?.year,
            },
            purchasedAt: purchase.purchasedAt,
            reportId: purchase.reportId,
            price: purchase.amountPaid,
            currency: purchase.currency,
          }))
        );

        // Transform saved cars
        setSavedCars(
          savedCarsData.map((saved: any) => ({
            id: saved.id,
            listingId: saved.listingId,
            carDetails: {
              make: saved.listing?.report?.make || saved.listing?.report?.carDetails?.make,
              model: saved.listing?.report?.model || saved.listing?.report?.carDetails?.model,
              year: saved.listing?.report?.year || saved.listing?.report?.carDetails?.year,
            },
            price: saved.listing?.price,
            currency: saved.listing?.currency,
            trustScore: saved.listing?.report?.trustScore,
            savedAt: saved.createdAt,
          }))
        );
      } catch (err: any) {
        console.error("Error loading profile data:", err);
        setError(err.message || "Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, [isAuthenticated, router, user]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const handleRemoveSavedCar = async (id: string) => {
    try {
      const savedCar = savedCars.find((car) => car.id === id);
      if (savedCar?.listingId) {
        await usersApi.unsaveCar(savedCar.listingId);
        setSavedCars((prev) => prev.filter((car) => car.id !== id));
      }
    } catch (err: any) {
      console.error("Error removing saved car:", err);
    }
  };

  if (!isAuthenticated || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const tabs: { id: TabType; label: string; icon: string; count?: number }[] = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "reports", label: "My Reports", icon: "📋", count: uploadedCars.length },
    { id: "purchases", label: "Purchases", icon: "🛒", count: purchasedReports.length },
    { id: "saved", label: "Saved", icon: "❤️", count: savedCars.length },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-100/50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 relative overflow-hidden">
      {/* Sophisticated animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/30 via-indigo-400/20 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-br from-indigo-400/30 via-purple-400/20 to-pink-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute -bottom-40 right-1/3 w-96 h-96 bg-gradient-to-br from-purple-400/30 via-pink-400/20 to-blue-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-40"></div>
      </div>

      {/* Navigation */}
      <Nav />

      {/* Main Content */}
      <main className="relative container mx-auto px-4 py-8 sm:py-12 z-10">
        <div className="mx-auto max-w-6xl">
          {/* Profile Header Card */}
          <div className="mb-8 transform transition-all duration-700 ease-out animate-fade-in">
            <UserProfileInfo profile={profile} />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 animate-fade-in rounded-2xl border-2 border-red-200/50 bg-gradient-to-r from-red-50/90 to-pink-50/90 dark:from-red-900/20 dark:to-pink-900/20 backdrop-blur-xl p-4 text-sm text-red-800 shadow-2xl dark:border-red-800/50 dark:text-red-300">
              <div className="flex items-center gap-3">
                <span className="text-xl">⚠️</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Enhanced Tabs Navigation */}
          <div className="mb-8 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
            <div className="relative rounded-3xl border border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-2 shadow-2xl">
              <div className="flex flex-wrap gap-2">
                {tabs.map((tab, index) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-2.5 rounded-xl px-6 py-3.5 text-sm font-semibold transition-all duration-300 ease-out transform ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl scale-105 ring-2 ring-blue-500/50"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-slate-700/80 hover:scale-[1.02]"
                    }`}
                    style={{ transitionDelay: `${index * 50}ms` }}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span className="font-bold">{tab.label}</span>
                    {tab.count !== undefined && tab.count > 0 && (
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold transition-all ${
                          activeTab === tab.id
                            ? "bg-white/30 text-white backdrop-blur-sm"
                            : "bg-blue-100/80 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                    {activeTab === tab.id && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/20 to-transparent pointer-events-none"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Enhanced Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="group relative overflow-hidden rounded-3xl border border-blue-200/50 dark:border-blue-800/50 bg-gradient-to-br from-blue-50/90 via-indigo-50/90 to-blue-100/90 dark:from-slate-800/90 dark:via-slate-700/90 dark:to-slate-800/90 backdrop-blur-xl p-6 shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-blue-500/20 dark:border-gray-700/50">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl"></div>
                    <div className="relative flex items-center justify-between mb-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-3xl shadow-lg ring-2 ring-blue-400/30">
                        📋
                      </div>
                      <div className="rounded-full bg-blue-500/20 p-2 backdrop-blur-sm">
                        <span className="text-2xl">📋</span>
                      </div>
                    </div>
                    <h3 className="relative text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-2">
                      {uploadedCars.length}
                    </h3>
                    <p className="relative text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      My Reports
                    </p>
                  </div>

                  <div className="group relative overflow-hidden rounded-3xl border border-green-200/50 dark:border-green-800/50 bg-gradient-to-br from-green-50/90 via-emerald-50/90 to-green-100/90 dark:from-slate-800/90 dark:via-slate-700/90 dark:to-slate-800/90 backdrop-blur-xl p-6 shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-green-500/20 dark:border-gray-700/50">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-400/20 rounded-full blur-2xl"></div>
                    <div className="relative flex items-center justify-between mb-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-3xl shadow-lg ring-2 ring-green-400/30">
                        🛒
                      </div>
                      <div className="rounded-full bg-green-500/20 p-2 backdrop-blur-sm">
                        <span className="text-2xl">🛒</span>
                      </div>
                    </div>
                    <h3 className="relative text-4xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent mb-2">
                      {purchasedReports.length}
                    </h3>
                    <p className="relative text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Purchased Reports
                    </p>
                  </div>

                  <div className="group relative overflow-hidden rounded-3xl border border-pink-200/50 dark:border-pink-800/50 bg-gradient-to-br from-pink-50/90 via-rose-50/90 to-pink-100/90 dark:from-slate-800/90 dark:via-slate-700/90 dark:to-slate-800/90 backdrop-blur-xl p-6 shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-pink-500/20 dark:border-gray-700/50">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-pink-400/20 rounded-full blur-2xl"></div>
                    <div className="relative flex items-center justify-between mb-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 text-3xl shadow-lg ring-2 ring-pink-400/30">
                        ❤️
                      </div>
                      <div className="rounded-full bg-pink-500/20 p-2 backdrop-blur-sm">
                        <span className="text-2xl">❤️</span>
                      </div>
                    </div>
                    <h3 className="relative text-4xl font-extrabold bg-gradient-to-r from-pink-600 to-rose-600 dark:from-pink-400 dark:to-rose-400 bg-clip-text text-transparent mb-2">
                      {savedCars.length}
                    </h3>
                    <p className="relative text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Saved Cars
                    </p>
                  </div>
                </div>

                {/* Enhanced Quick Actions */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-indigo-600/5 to-purple-600/5 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative rounded-3xl border border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-8 shadow-2xl">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-xl shadow-lg">
                        ⚡
                      </div>
                      <h3 className="text-2xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        Quick Actions
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <Link
                        href="/reports/new"
                        className="group/link relative overflow-hidden flex items-center gap-5 rounded-2xl border-2 border-blue-200/50 dark:border-blue-800/50 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-slate-700/50 dark:to-slate-600/50 p-5 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-blue-400 dark:hover:border-blue-600"
                      >
                        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-2xl shadow-lg ring-2 ring-blue-400/30 group-hover/link:scale-110 transition-transform">
                          ➕
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                            Create New Report
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Upload a car for analysis
                          </p>
                        </div>
                        <div className="absolute top-0 right-0 w-20 h-20 bg-blue-400/10 rounded-full blur-2xl group-hover/link:bg-blue-400/20 transition-all"></div>
                      </Link>
                      <Link
                        href="/marketplace"
                        className="group/link relative overflow-hidden flex items-center gap-5 rounded-2xl border-2 border-green-200/50 dark:border-green-800/50 bg-gradient-to-br from-green-50/80 to-emerald-50/80 dark:from-slate-700/50 dark:to-slate-600/50 p-5 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-green-400 dark:hover:border-green-600"
                      >
                        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-2xl shadow-lg ring-2 ring-green-400/30 group-hover/link:scale-110 transition-transform">
                          🔍
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                            Browse Marketplace
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Find cars to purchase
                          </p>
                        </div>
                        <div className="absolute top-0 right-0 w-20 h-20 bg-green-400/10 rounded-full blur-2xl group-hover/link:bg-green-400/20 transition-all"></div>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Recent Activity Preview */}
                {(uploadedCars.length > 0 ||
                  purchasedReports.length > 0 ||
                  savedCars.length > 0) && (
                  <div className="rounded-2xl border border-gray-200/50 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-6 shadow-xl dark:border-gray-700/50">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      Recent Activity
                    </h3>
                    <div className="space-y-3">
                      {uploadedCars.slice(0, 2).map((car) => (
                        <div
                          key={car.id}
                          className="flex items-center gap-4 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50/50 dark:from-slate-700/50 dark:to-slate-600/50 p-4"
                        >
                          <span className="text-2xl">🚗</span>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {car.make} {car.model} ({car.year})
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Uploaded {new Date(car.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      {uploadedCars.length === 0 &&
                        purchasedReports.slice(0, 2).map((report) => (
                          <div
                            key={report.id}
                            className="flex items-center gap-4 rounded-xl bg-gradient-to-r from-gray-50 to-green-50/50 dark:from-slate-700/50 dark:to-slate-600/50 p-4"
                          >
                            <span className="text-2xl">📊</span>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {report.carDetails.make} {report.carDetails.model} (
                                {report.carDetails.year})
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Purchased{" "}
                                {new Date(report.purchasedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "reports" && (
              <UploadedCarsSection cars={uploadedCars} />
            )}

            {activeTab === "purchases" && (
              <PurchasedReportsSection reports={purchasedReports} />
            )}

            {activeTab === "saved" && (
              <SavedCarsSection
                savedCars={savedCars}
                onRemove={handleRemoveSavedCar}
              />
            )}
          </div>

          {/* Enhanced Logout Button */}
          <div className="mt-10 border-t border-gray-200/50 dark:border-gray-700/50 pt-8">
            <button
              onClick={handleLogout}
              className="group relative w-full sm:w-auto overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 via-pink-600 to-rose-600 px-10 py-4 font-bold text-white shadow-2xl transition-all duration-300 hover:shadow-red-500/50 hover:scale-105 dark:from-red-500 dark:via-pink-500 dark:to-rose-500"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
              <span className="relative z-10 flex items-center justify-center gap-3">
                <span className="text-xl">🚪</span>
                <span>Logout</span>
                <span className="transform transition-transform group-hover:translate-x-1">→</span>
              </span>
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
