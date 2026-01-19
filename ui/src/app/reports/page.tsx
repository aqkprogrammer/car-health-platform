"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { reportsApi } from "@/lib/api";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { VERDICT_CONFIG, VerdictType } from "@/types/report";
import Link from "next/link";
import Nav from "@/components/ui/Nav";

interface Report {
  id: string;
  make: string;
  model: string;
  year: number;
  trustScore?: number | null;
  verdict?: VerdictType | string;
  status?: string;
  createdAt: string;
  validUntil?: string;
}

export default function ReportsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const loadReports = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const reportsData = await reportsApi.getAll();
        setReports(reportsData || []);
      } catch (err: any) {
        console.error("Error loading reports:", err);
        setError(err.message || "Failed to load reports");
      } finally {
        setIsLoading(false);
      }
    };

    loadReports();
  }, [isAuthenticated, router]);

  if (!isAuthenticated || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const getVerdictConfig = (verdict: VerdictType | string | undefined) => {
    if (!verdict) return VERDICT_CONFIG.good;
    const normalized = verdict.toLowerCase() as VerdictType;
    return VERDICT_CONFIG[normalized] || VERDICT_CONFIG.good;
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    const statusConfig = {
      completed: {
        label: "Completed",
        bg: "bg-green-100 dark:bg-green-900/30",
        text: "text-green-700 dark:text-green-300",
        icon: "✓",
      },
      pending: {
        label: "Pending",
        bg: "bg-yellow-100 dark:bg-yellow-900/30",
        text: "text-yellow-700 dark:text-yellow-300",
        icon: "⏳",
      },
      failed: {
        label: "Failed",
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-700 dark:text-red-300",
        icon: "✗",
      },
    };

    const config = statusConfig[status.toLowerCase() as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${config.bg} ${config.text}`}>
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <Nav />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
                My Reports
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                View and manage all your car health reports
              </p>
            </div>
            <Link
              href="/reports/new"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              <span>+</span>
              <span>Generate New Report</span>
            </Link>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && reports.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 text-6xl">📊</div>
              <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                No Reports Yet
              </h2>
              <p className="mb-6 text-gray-600 dark:text-gray-400">
                Get started by generating your first car health report
              </p>
              <Link
                href="/reports/new"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                <span>+</span>
                <span>Create Your First Report</span>
              </Link>
            </div>
          )}

          {/* Reports Grid */}
          {!isLoading && !error && reports.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {reports.map((report) => {
                const verdictConfig = getVerdictConfig(report.verdict);
                const trustScore = report.trustScore != null ? Number(report.trustScore) : null;
                const generatedDate = new Date(report.createdAt);

                return (
                  <Link
                    key={report.id}
                    href={`/reports/${report.id}`}
                    className="group block overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all hover:border-blue-400 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-500"
                  >
                    <div className="p-6">
                      {/* Header */}
                      <div className="mb-4 flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="mb-1 text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {report.make} {report.model}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {report.year}
                          </p>
                        </div>
                        {getStatusBadge(report.status)}
                      </div>

                      {/* Trust Score */}
                      {trustScore !== null && (
                        <div className="mb-4">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              Trust Score
                            </span>
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                              {Math.round(trustScore)}%
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                            <div
                              className={`h-full transition-all ${
                                trustScore >= 80
                                  ? "bg-green-500"
                                  : trustScore >= 60
                                  ? "bg-blue-500"
                                  : trustScore >= 40
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${trustScore}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Verdict Badge */}
                      {report.verdict && (
                        <div className="mb-4">
                          <div
                            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 ${verdictConfig.bgColor}`}
                          >
                            <span className="text-lg">{verdictConfig.icon}</span>
                            <span className={`text-sm font-semibold ${verdictConfig.color}`}>
                              {verdictConfig.label}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Generated {generatedDate.toLocaleDateString()}
                        </span>
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 group-hover:underline">
                          View Report →
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Stats Summary */}
          {!isLoading && !error && reports.length > 0 && (
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {reports.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Reports
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {reports.filter((r) => r.status === "completed").length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Completed
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {reports.length > 0
                    ? Math.round(
                        reports.reduce((sum, r) => {
                          const score = r.trustScore != null ? Number(r.trustScore) : 0;
                          return sum + score;
                        }, 0) / reports.length
                      )
                    : 0}
                  %
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Average Trust Score
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
