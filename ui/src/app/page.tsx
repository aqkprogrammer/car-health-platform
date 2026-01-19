"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Nav from "@/components/ui/Nav";
import Footer from "@/components/ui/Footer";

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  const getRoleDisplay = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

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

      {/* Hero Section */}
      <main className="relative container mx-auto px-4 pt-6 pb-12 sm:pt-8 sm:pb-16 md:pt-12 md:pb-20 z-10">
        <div className="mx-auto max-w-6xl">
          {/* Value Proposition */}
          <div className="mb-12 text-center animate-fade-in">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/40 dark:via-indigo-950/40 dark:to-purple-950/40 px-5 py-2.5 border border-blue-200/60 dark:border-blue-800/50 shadow-sm hover:shadow-md transition-shadow duration-300">
              <span className="text-xl animate-pulse">✨</span>
              <span className="text-sm font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                AI-Powered Vehicle Health Analysis
              </span>
            </div>

            <h1 className="mb-5 text-5xl font-black leading-[1.1] tracking-tight text-gray-900 dark:text-white sm:text-6xl md:text-7xl lg:text-8xl">
              Know Your Car&apos;s{" "}
              <span className="block mt-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent animate-gradient">
                True Health
              </span>
            </h1>
            <h2 className="mb-8 text-2xl font-bold text-gray-800 dark:text-gray-200 sm:text-3xl md:text-4xl">
              Before You Buy or Sell
            </h2>
            <p className="mx-auto mb-12 max-w-3xl text-lg leading-relaxed text-gray-600 dark:text-gray-400 sm:text-xl md:text-2xl">
              Get instant, AI-powered health reports for any used car.{" "}
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                Make informed decisions with comprehensive vehicle analysis.
              </span>
            </p>

            {/* Trust Indicators */}
            <div className="mb-10 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-400 sm:gap-8 sm:text-base">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚡</span>
                <span className="font-medium">Instant Reports</span>
              </div>
              <div className="hidden h-4 w-px bg-gray-300 dark:bg-gray-600 sm:block"></div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🤖</span>
                <span className="font-medium">AI-Powered</span>
              </div>
              <div className="hidden h-4 w-px bg-gray-300 dark:bg-gray-600 sm:block"></div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🔒</span>
                <span className="font-medium">Secure & Private</span>
              </div>
            </div>
          </div>

          {/* CTA and Pricing Container */}
          <div className="mb-16 flex flex-col items-stretch gap-4 sm:mb-20 sm:flex-row sm:items-center sm:justify-center sm:gap-4">
            {/* Primary CTA */}
            <div className="w-full sm:w-auto">
              {isAuthenticated ? (
                <button
                  onClick={() => router.push("/reports/new")}
                  className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 sm:w-auto"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Get Your Car Verified
                    <svg className="w-4 h-4 text-white transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                </button>
              ) : (
                <button
                  onClick={() => router.push("/login")}
                  className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 sm:w-auto"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Get Your Car Verified
                    <svg className="w-4 h-4 text-white transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                </button>
              )}
            </div>

            {/* Pricing Display */}
            <div className="group relative rounded-xl bg-white px-6 py-4 shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-gray-900 tracking-tight">
                  ₹999
                </span>
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold text-gray-700">
                    per report
                  </span>
                  <span className="text-xs font-medium text-gray-500">
                    one-time payment
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Features */}
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
            <div className="flex flex-col items-center gap-2 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-4 border border-white/40 dark:border-slate-700/40 transition-all hover:scale-105 hover:bg-white/80 dark:hover:bg-slate-800/80">
              <span className="text-3xl">📊</span>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 sm:text-sm">Comprehensive</span>
            </div>
            <div className="flex flex-col items-center gap-2 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-4 border border-white/40 dark:border-slate-700/40 transition-all hover:scale-105 hover:bg-white/80 dark:hover:bg-slate-800/80">
              <span className="text-3xl">⚡</span>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 sm:text-sm">Instant</span>
            </div>
            <div className="flex flex-col items-center gap-2 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-4 border border-white/40 dark:border-slate-700/40 transition-all hover:scale-105 hover:bg-white/80 dark:hover:bg-slate-800/80">
              <span className="text-3xl">💯</span>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 sm:text-sm">Accurate</span>
            </div>
            <div className="flex flex-col items-center gap-2 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-4 border border-white/40 dark:border-slate-700/40 transition-all hover:scale-105 hover:bg-white/80 dark:hover:bg-slate-800/80">
              <span className="text-3xl">📱</span>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 sm:text-sm">Shareable</span>
            </div>
          </div>

          {/* Simple Explanation: Upload → AI → Report */}
          <div id="how-it-works" className="mb-16 sm:mb-24">
            <h2 className="mb-12 text-center text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl md:text-5xl">
              How It Works
            </h2>
            <div className="flex flex-col items-center gap-8 sm:flex-row sm:justify-center sm:gap-6 md:gap-10">
              {/* Step 1: Upload */}
              <div className="group relative flex w-full max-w-xs flex-col items-center rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-8 shadow-xl border border-white/20 dark:border-slate-700/50 transition-all hover:scale-105 hover:shadow-2xl sm:w-auto sm:max-w-none sm:flex-1">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xl font-bold text-white shadow-lg sm:h-14 sm:w-14 sm:text-2xl">
                  1
                </div>
                <div className="mb-4 mt-4 text-5xl transition-transform group-hover:scale-110 sm:text-6xl">📤</div>
                <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                  Upload
                </h3>
                <p className="text-center text-sm leading-relaxed text-gray-600 dark:text-gray-300 sm:text-base">
                  Upload your car&apos;s VIN, photos, or basic details
                </p>
              </div>

              {/* Arrow */}
              <div className="flex items-center justify-center sm:flex-col">
                <div className="hidden h-1 w-16 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 sm:block md:w-20 rounded-full"></div>
                <div className="text-3xl text-blue-600 dark:text-blue-400 sm:text-4xl animate-pulse">→</div>
                <div className="block h-16 w-1 bg-gradient-to-b from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 sm:hidden rounded-full"></div>
              </div>

              {/* Step 2: AI */}
              <div className="group relative flex w-full max-w-xs flex-col items-center rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-8 shadow-xl border border-white/20 dark:border-slate-700/50 transition-all hover:scale-105 hover:shadow-2xl sm:w-auto sm:max-w-none sm:flex-1">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xl font-bold text-white shadow-lg sm:h-14 sm:w-14 sm:text-2xl">
                  2
                </div>
                <div className="mb-4 mt-4 text-5xl transition-transform group-hover:scale-110 sm:text-6xl">🤖</div>
                <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                  AI Analysis
                </h3>
                <p className="text-center text-sm leading-relaxed text-gray-600 dark:text-gray-300 sm:text-base">
                  Our AI analyzes history, condition, and market data
                </p>
              </div>

              {/* Arrow */}
              <div className="flex items-center justify-center sm:flex-col">
                <div className="hidden h-1 w-16 bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-400 sm:block md:w-20 rounded-full"></div>
                <div className="text-3xl text-indigo-600 dark:text-indigo-400 sm:text-4xl animate-pulse">→</div>
                <div className="block h-16 w-1 bg-gradient-to-b from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-400 sm:hidden rounded-full"></div>
              </div>

              {/* Step 3: Report */}
              <div className="group relative flex w-full max-w-xs flex-col items-center rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-8 shadow-xl border border-white/20 dark:border-slate-700/50 transition-all hover:scale-105 hover:shadow-2xl sm:w-auto sm:max-w-none sm:flex-1">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-xl font-bold text-white shadow-lg sm:h-14 sm:w-14 sm:text-2xl">
                  3
                </div>
                <div className="mb-4 mt-4 text-5xl transition-transform group-hover:scale-110 sm:text-6xl">📊</div>
                <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                  Report
                </h3>
                <p className="text-center text-sm leading-relaxed text-gray-600 dark:text-gray-300 sm:text-base">
                  Receive a comprehensive health report in minutes
                </p>
              </div>
            </div>
          </div>

          {/* What's Included Section */}
          <div className="mb-16 sm:mb-24">
            <h2 className="mb-12 text-center text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl md:text-5xl">
              What&apos;s Included in Your Report
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="group rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-6 shadow-xl border border-white/20 dark:border-slate-700/50 transition-all hover:scale-105 hover:shadow-2xl">
                <div className="mb-4 text-4xl transition-transform group-hover:scale-110">🔍</div>
                <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">Vehicle Condition Analysis</h3>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  Comprehensive assessment of exterior, interior, and mechanical condition based on photos and vehicle details
                </p>
              </div>
              <div className="group rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-6 shadow-xl border border-white/20 dark:border-slate-700/50 transition-all hover:scale-105 hover:shadow-2xl">
                <div className="mb-4 text-4xl transition-transform group-hover:scale-110">📈</div>
                <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">Market Value Estimate</h3>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  AI-powered valuation based on make, model, year, condition, and current market trends
                </p>
              </div>
              <div className="group rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-6 shadow-xl border border-white/20 dark:border-slate-700/50 transition-all hover:scale-105 hover:shadow-2xl">
                <div className="mb-4 text-4xl transition-transform group-hover:scale-110">⚠️</div>
                <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">Risk Assessment</h3>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  Identify potential issues, maintenance needs, and areas that require attention before purchase
                </p>
              </div>
              <div className="group rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-6 shadow-xl border border-white/20 dark:border-slate-700/50 transition-all hover:scale-105 hover:shadow-2xl">
                <div className="mb-4 text-4xl transition-transform group-hover:scale-110">📋</div>
                <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">Detailed Inspection Report</h3>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  Professional-grade report covering all major components, systems, and visual inspection findings
                </p>
              </div>
              <div className="group rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-6 shadow-xl border border-white/20 dark:border-slate-700/50 transition-all hover:scale-105 hover:shadow-2xl">
                <div className="mb-4 text-4xl transition-transform group-hover:scale-110">💯</div>
                <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">Trust Score</h3>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  Overall reliability score that helps buyers and sellers understand vehicle quality at a glance
                </p>
              </div>
              <div className="group rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-6 shadow-xl border border-white/20 dark:border-slate-700/50 transition-all hover:scale-105 hover:shadow-2xl">
                <div className="mb-4 text-4xl transition-transform group-hover:scale-110">📱</div>
                <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">Shareable Report</h3>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  Easy-to-share digital report perfect for marketplace listings, negotiations, and documentation
                </p>
              </div>
            </div>
          </div>

          {/* Use Cases Section */}
          <div className="mb-16 sm:mb-24">
            <h2 className="mb-12 text-center text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl md:text-5xl">
              Perfect For Everyone
            </h2>
            <div className="grid gap-8 sm:grid-cols-3">
              <div className="group rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 p-8 shadow-xl border border-blue-100 dark:border-slate-600 transition-all hover:scale-105 hover:shadow-2xl">
                <div className="mb-4 text-5xl transition-transform group-hover:scale-110">🛒</div>
                <h3 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">Car Buyers</h3>
                <p className="mb-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  Make informed purchase decisions with detailed vehicle health reports. Avoid hidden problems and negotiate with confidence.
                </p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400">✓</span>
                    <span>Verify vehicle condition before buying</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400">✓</span>
                    <span>Get fair market value estimates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400">✓</span>
                    <span>Identify potential issues early</span>
                  </li>
                </ul>
              </div>
              <div className="group rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-800 dark:to-slate-700 p-8 shadow-xl border border-purple-100 dark:border-slate-600 transition-all hover:scale-105 hover:shadow-2xl">
                <div className="mb-4 text-5xl transition-transform group-hover:scale-110">🚗</div>
                <h3 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">Car Sellers</h3>
                <p className="mb-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  Build trust with potential buyers by providing professional health reports. Sell faster and at better prices.
                </p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 dark:text-purple-400">✓</span>
                    <span>Increase buyer confidence</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 dark:text-purple-400">✓</span>
                    <span>Justify your asking price</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 dark:text-purple-400">✓</span>
                    <span>Stand out in the marketplace</span>
                  </li>
                </ul>
              </div>
              <div className="group rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-800 dark:to-slate-700 p-8 shadow-xl border border-green-100 dark:border-slate-600 transition-all hover:scale-105 hover:shadow-2xl">
                <div className="mb-4 text-5xl transition-transform group-hover:scale-110">🏢</div>
                <h3 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">Dealers</h3>
                <p className="mb-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  Streamline your inventory management with bulk reporting tools. Build credibility and close deals faster.
                </p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 dark:text-green-400">✓</span>
                    <span>Bulk upload and reporting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 dark:text-green-400">✓</span>
                    <span>Professional inventory management</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 dark:text-green-400">✓</span>
                    <span>Enhanced buyer trust</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Key Features Section */}
          <div className="mb-16 sm:mb-24">
            <h2 className="mb-12 text-center text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl md:text-5xl">
              Why Choose CarHealth?
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="group flex gap-4 rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-6 shadow-lg border border-white/20 dark:border-slate-700/50 transition-all hover:scale-105 hover:shadow-xl">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-2xl shadow-lg">
                  ⚡
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">Fast & Instant</h3>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                    Get comprehensive reports in minutes, not days. Our AI-powered analysis delivers results instantly.
                  </p>
                </div>
              </div>
              <div className="group flex gap-4 rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-6 shadow-lg border border-white/20 dark:border-slate-700/50 transition-all hover:scale-105 hover:shadow-xl">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-2xl shadow-lg">
                  🤖
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">AI-Powered Analysis</h3>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                    Advanced machine learning algorithms analyze vehicle condition, market data, and historical patterns.
                  </p>
                </div>
              </div>
              <div className="group flex gap-4 rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-6 shadow-lg border border-white/20 dark:border-slate-700/50 transition-all hover:scale-105 hover:shadow-xl">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-2xl shadow-lg">
                  💰
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">Affordable Pricing</h3>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                    Professional-grade reports at just ₹999. No hidden fees, no subscriptions - pay only when you need it.
                  </p>
                </div>
              </div>
              <div className="group flex gap-4 rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-6 shadow-lg border border-white/20 dark:border-slate-700/50 transition-all hover:scale-105 hover:shadow-xl">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600 text-2xl shadow-lg">
                  🔒
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">Secure & Private</h3>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                    Your data is encrypted and secure. Reports are only accessible to you and those you choose to share with.
                  </p>
                </div>
              </div>
              <div className="group flex gap-4 rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-6 shadow-lg border border-white/20 dark:border-slate-700/50 transition-all hover:scale-105 hover:shadow-xl">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-2xl shadow-lg">
                  📱
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">Easy to Use</h3>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                    Simple 3-step process: upload photos, AI analyzes, get your report. No technical knowledge required.
                  </p>
                </div>
              </div>
              <div className="group flex gap-4 rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-6 shadow-lg border border-white/20 dark:border-slate-700/50 transition-all hover:scale-105 hover:shadow-xl">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-2xl shadow-lg">
                  📊
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">Comprehensive Reports</h3>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                    Detailed analysis covering condition, value, risks, and recommendations - everything you need to know.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-16 sm:mb-24">
            <h2 className="mb-12 text-center text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl md:text-5xl">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              <div className="rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-6 shadow-lg border border-white/20 dark:border-slate-700/50">
                <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                  What information do I need to provide?
                </h3>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  You&apos;ll need basic car details (make, model, year) and photos of your vehicle. We recommend photos from multiple angles including front, rear, sides, interior, and engine bay for the most accurate analysis.
                </p>
              </div>
              <div className="rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-6 shadow-lg border border-white/20 dark:border-slate-700/50">
                <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                  How accurate are the reports?
                </h3>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  Our AI-powered analysis uses advanced algorithms trained on thousands of vehicle inspections. While we provide comprehensive analysis based on available data, we recommend professional inspection for major purchases.
                </p>
              </div>
              <div className="rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-6 shadow-lg border border-white/20 dark:border-slate-700/50">
                <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                  Can I use the report for insurance or legal purposes?
                </h3>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  Our reports are designed to help with buying and selling decisions. For insurance or legal documentation, please consult with certified inspectors or relevant authorities.
                </p>
              </div>
              <div className="rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-6 shadow-lg border border-white/20 dark:border-slate-700/50">
                <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                  How long does it take to get a report?
                </h3>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  Once you submit your car details and photos, our AI analysis typically completes within minutes. You&apos;ll receive your comprehensive report immediately after processing.
                </p>
              </div>
              <div className="rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-6 shadow-lg border border-white/20 dark:border-slate-700/50">
                <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                  Can I share my report with others?
                </h3>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  Yes! Your reports are shareable and perfect for marketplace listings, negotiations, or documentation. You control who can access your reports.
                </p>
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div id="pricing" className="mb-12 rounded-3xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-8 shadow-2xl border border-white/20 dark:border-slate-700/50 sm:mb-16 sm:p-12">
            <h2 className="mb-4 text-center text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl md:text-5xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mb-10 text-center text-lg text-gray-600 dark:text-gray-400 sm:text-xl">
              Professional-grade vehicle health reports at an affordable price
            </p>
            
            <div className="mb-10 flex flex-col items-center justify-center">
              <div className="group text-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-700/50 dark:to-slate-600/50 p-8 transition-all hover:scale-105 hover:shadow-lg border border-blue-100 dark:border-slate-600 w-full max-w-md">
                <div className="mb-2 text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent sm:text-6xl">
                  ₹999
                </div>
                <div className="text-base font-medium text-gray-600 dark:text-gray-400">
                  per report
                </div>
                <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  One-time payment • No subscriptions • No hidden fees
                </div>
              </div>
            </div>

            {/* What's Included */}
            <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-start gap-3 rounded-xl bg-white/60 dark:bg-slate-700/40 p-4 border border-gray-200/50 dark:border-slate-600/50">
                <span className="text-2xl shrink-0">✓</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Complete Health Analysis</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Comprehensive vehicle condition assessment</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl bg-white/60 dark:bg-slate-700/40 p-4 border border-gray-200/50 dark:border-slate-600/50">
                <span className="text-2xl shrink-0">✓</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Market Value Estimate</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">AI-powered fair market valuation</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl bg-white/60 dark:bg-slate-700/40 p-4 border border-gray-200/50 dark:border-slate-600/50">
                <span className="text-2xl shrink-0">✓</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Risk Assessment</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Identify potential issues & concerns</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl bg-white/60 dark:bg-slate-700/40 p-4 border border-gray-200/50 dark:border-slate-600/50">
                <span className="text-2xl shrink-0">✓</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Trust Score</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Overall reliability rating</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl bg-white/60 dark:bg-slate-700/40 p-4 border border-gray-200/50 dark:border-slate-600/50">
                <span className="text-2xl shrink-0">✓</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Shareable Report</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Digital report for easy sharing</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl bg-white/60 dark:bg-slate-700/40 p-4 border border-gray-200/50 dark:border-slate-600/50">
                <span className="text-2xl shrink-0">✓</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Instant Delivery</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Get your report within minutes</p>
                </div>
              </div>
            </div>

            {/* Value Proposition */}
            <div className="mb-10 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-6 border border-blue-100 dark:border-blue-800/50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    Why Choose Our Reports?
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Save thousands by avoiding bad purchases. Professional inspections cost ₹2,000-5,000+ and take days. 
                    Get instant, AI-powered insights for just ₹999.
                  </p>
                </div>
                <div className="flex flex-col items-center sm:items-end gap-2 shrink-0">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">80%</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Cost Savings</div>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="mb-10 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <span className="text-lg">🔒</span>
                <span>Secure Payment</span>
              </div>
              <div className="hidden h-4 w-px bg-gray-300 dark:bg-gray-600 sm:block"></div>
              <div className="flex items-center gap-2">
                <span className="text-lg">⚡</span>
                <span>Instant Results</span>
              </div>
              <div className="hidden h-4 w-px bg-gray-300 dark:bg-gray-600 sm:block"></div>
              <div className="flex items-center gap-2">
                <span className="text-lg">💯</span>
                <span>Money-Back Guarantee</span>
              </div>
            </div>

            <div className="text-center">
              {isAuthenticated ? (
                <button
                  onClick={() => router.push("/reports/new")}
                  className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-10 py-5 text-lg font-bold text-white shadow-2xl transition-all hover:shadow-blue-500/50 hover:scale-105 active:scale-95 sm:w-auto sm:px-14 sm:py-6 sm:text-xl"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Get Your Car Verified
                    <span className="text-xl transition-transform group-hover:translate-x-1">→</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 opacity-0 transition-opacity group-hover:opacity-100"></div>
                </button>
              ) : (
                <button
                  onClick={() => router.push("/login")}
                  className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-10 py-5 text-lg font-bold text-white shadow-2xl transition-all hover:shadow-blue-500/50 hover:scale-105 active:scale-95 sm:w-auto sm:px-14 sm:py-6 sm:text-xl"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Get Your Car Verified
                    <span className="text-xl transition-transform group-hover:translate-x-1">→</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 opacity-0 transition-opacity group-hover:opacity-100"></div>
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
