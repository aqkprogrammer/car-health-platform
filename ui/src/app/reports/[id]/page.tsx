"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { reportsApi } from "@/lib/api";
import TrustScoreCard from "@/components/report/TrustScoreCard";
import SectionBreakdown from "@/components/report/SectionBreakdown";
import RiskFlagsSection from "@/components/report/RiskFlagsSection";
import ReportActions from "@/components/report/ReportActions";
import ReportValidityBadge from "@/components/report/ReportValidityBadge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { CarHealthReport } from "@/types/report";
import Link from "next/link";
import Nav from "@/components/ui/Nav";

export default function ReportViewPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [report, setReport] = useState<CarHealthReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Wait for auth to finish loading before checking authentication
    if (authLoading) {
      return;
    }

    // Only redirect if auth has finished loading and user is not authenticated
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const loadReport = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const reportId = params.id as string;
        const reportData = await reportsApi.getById(reportId);
        
        // Transform API data to match CarHealthReport type
        const transformedReport: CarHealthReport = {
          id: reportData.id,
          carDetails: {
            make: reportData.make || reportData.carDetails?.make,
            model: reportData.model || reportData.carDetails?.model,
            year: reportData.year || reportData.carDetails?.year,
          },
          trustScore: reportData.trustScore != null ? Number(reportData.trustScore) : 0,
          verdict: reportData.verdict,
          generatedAt: reportData.createdAt || reportData.generatedAt,
          validUntil: reportData.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          sections: reportData.sections || reportData.aiAnalysis?.sections || {
            exterior: {
              score: reportData.aiAnalysis?.sections?.exterior?.score || 0,
              maxScore: 100,
              label: "Exterior Condition",
              details: reportData.aiAnalysis?.sections?.exterior?.details || [],
              issues: reportData.aiAnalysis?.sections?.exterior?.issues || [],
            },
            engine: {
              score: reportData.aiAnalysis?.sections?.engine?.score || 0,
              maxScore: 100,
              label: "Engine Health",
              details: reportData.aiAnalysis?.sections?.engine?.details || [],
              issues: reportData.aiAnalysis?.sections?.engine?.issues || [],
            },
            interior: reportData.aiAnalysis?.sections?.interior ? {
              score: reportData.aiAnalysis.sections.interior.score || 0,
              maxScore: 100,
              label: "Interior Condition",
              details: reportData.aiAnalysis.sections.interior.details || [],
              issues: reportData.aiAnalysis.sections.interior.issues || [],
            } : undefined,
            transmission: reportData.aiAnalysis?.sections?.transmission ? {
              score: reportData.aiAnalysis.sections.transmission.score || 0,
              maxScore: 100,
              label: "Transmission",
              details: reportData.aiAnalysis.sections.transmission.details || [],
              issues: reportData.aiAnalysis.sections.transmission.issues || [],
            } : undefined,
            suspension: reportData.aiAnalysis?.sections?.suspension ? {
              score: reportData.aiAnalysis.sections.suspension.score || 0,
              maxScore: 100,
              label: "Suspension",
              details: reportData.aiAnalysis.sections.suspension.details || [],
              issues: reportData.aiAnalysis.sections.suspension.issues || [],
            } : undefined,
            brakes: reportData.aiAnalysis?.sections?.brakes ? {
              score: reportData.aiAnalysis.sections.brakes.score || 0,
              maxScore: 100,
              label: "Brakes",
              details: reportData.aiAnalysis.sections.brakes.details || [],
              issues: reportData.aiAnalysis.sections.brakes.issues || [],
            } : undefined,
          },
          riskFlags: reportData.riskFlags || reportData.aiAnalysis?.issues || [],
          summary: reportData.summary || reportData.aiAnalysis?.summary || "No summary available.",
        };
        
        setReport(transformedReport);
      } catch (err: any) {
        console.error("Error loading report:", err);
        setError(err.message || "Failed to load report");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      loadReport();
    }
  }, [isAuthenticated, authLoading, router, params.id]);

  // Show loading spinner while auth is loading or report is loading
  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Only check authentication after auth has finished loading
  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  if (error || !report) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
            {error || "Report Not Found"}
          </h1>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            {error || "The report you're looking for doesn't exist or you don't have access to it."}
          </p>
          <Link
            href="/profile"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            View All Reports
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Navigation */}
      <Nav />
      {/* Back Button */}
      <div className="relative container mx-auto px-4 pt-4 z-10">
        <Link
          href="/reports"
          className="inline-flex items-center gap-2 rounded-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-md px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 transition-all hover:bg-gray-100 dark:hover:bg-slate-700 hover:scale-105 shadow-md border border-gray-200 dark:border-slate-700"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Reports
        </Link>
      </div>

      {/* Main Content */}
      <main className="relative container mx-auto px-4 py-8 sm:py-12 z-10">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-6 shadow-xl border border-white/20 dark:border-slate-700/50">
                <h1 className="mb-2 text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl">
                  Car Health{" "}
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                    Report
                  </span>
                </h1>
                <p className="mb-2 text-lg font-semibold text-gray-700 dark:text-gray-300">
                  {report.carDetails.make} {report.carDetails.model} ({report.carDetails.year})
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Generated on {new Date(report.generatedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="sm:mt-0">
                <ReportValidityBadge report={report} />
              </div>
            </div>
          </div>

          {/* Trust Score Card */}
          <div className="mb-8">
            <TrustScoreCard score={report.trustScore} verdict={report.verdict} />
          </div>

          {/* Summary */}
          <div className="mb-8 rounded-2xl border-2 border-blue-200/50 bg-gradient-to-br from-blue-50 to-indigo-50 p-8 shadow-xl dark:border-blue-800/50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              Executive Summary
            </h2>
            <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">{report.summary}</p>
          </div>

          {/* Section Breakdowns */}
          <div className="mb-8 grid gap-6 md:grid-cols-2">
            <SectionBreakdown
              section={report.sections.exterior}
              icon="🚗"
            />
            <SectionBreakdown
              section={report.sections.engine}
              icon="⚙️"
            />
          </div>

          {/* Risk Flags */}
          <div className="mb-8">
            <RiskFlagsSection flags={report.riskFlags} />
          </div>

          {/* Report Actions */}
          <div className="mb-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Report Actions
            </h3>
            <ReportActions report={report} />
          </div>

          {/* Additional Actions */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-end">
            <Link
              href={`/reports/${params.id}/condition`}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 px-8 py-4 text-center font-bold text-white shadow-xl transition-all hover:shadow-green-500/50 hover:scale-105 dark:from-green-500 dark:via-emerald-500 dark:to-teal-500"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                View Condition Report
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-teal-600 via-emerald-600 to-green-600 opacity-0 transition-opacity group-hover:opacity-100"></div>
            </Link>
            <Link
              href="/reports/new"
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-8 py-4 text-center font-bold text-white shadow-xl transition-all hover:shadow-blue-500/50 hover:scale-105 dark:from-blue-500 dark:via-indigo-500 dark:to-purple-500"
            >
              <span className="relative z-10">Generate New Report</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 opacity-0 transition-opacity group-hover:opacity-100"></div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
