"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { reportsApi } from "@/lib/api";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Link from "next/link";
import Nav from "@/components/ui/Nav";
import CarDiagram, { CarPart } from "@/components/report/CarDiagram";
import PartListPanel, { PartItem } from "@/components/report/PartListPanel";

type CategoryType = "Exterior" | "Frame" | "Mechanics" | "Interior" | "Paint/Other" | "Tires";
type ViewMode = "list" | "left-right";

export default function VehicleConditionReportPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>("Exterior");
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("left-right");
  const [isMobile, setIsMobile] = useState(false);
  const [expandedParts, setExpandedParts] = useState<Set<string>>(new Set());

  // Mock data for demonstration - in production, this would come from the API
  // Positions are calculated for a 500x250 viewBox
  // Note: Some parts use special rendering (hood uses path, right side uses continuous strip)
  const mockParts: CarPart[] = [
    {
      id: "front-bumper",
      name: "Front Bumper",
      score: 4.5,
      position: { x: 60, y: 75, width: 380, height: 8 },
      side: "front",
    },
    {
      id: "hood",
      name: "Hood",
      score: 2.5,
      // Position not used - rendered as organic path shape
      position: { x: 70, y: 82, width: 360, height: 58 },
      side: "center",
    },
    {
      id: "right-fender",
      name: "Right Fender",
      score: 4.3,
      // Position calculated in component for continuous strip
      position: { x: 425, y: 82, width: 18, height: 20 },
      side: "right",
    },
    {
      id: "rf-door",
      name: "RF Door",
      score: 4.5,
      // Position calculated in component for continuous strip
      position: { x: 425, y: 102, width: 18, height: 25 },
      side: "right",
    },
    {
      id: "rr-door",
      name: "RR Door",
      score: 4.5,
      // Position calculated in component for continuous strip
      position: { x: 425, y: 127, width: 18, height: 25 },
      side: "right",
    },
    {
      id: "right-quarter",
      name: "Right Quarter",
      score: 4.2,
      // Position calculated in component for continuous strip
      position: { x: 425, y: 152, width: 18, height: 20 },
      side: "right",
    },
  ];

  const mockLeftParts: PartItem[] = [
    { id: "headlight", name: "HeadLight", side: "left" },
    { id: "grill", name: "Grill", side: "left" },
    { id: "hood", name: "Hood", score: 2.5, side: "center" },
    { id: "left-fender", name: "Left Fender", side: "left" },
    { id: "sensors", name: "Sensors", side: "left" },
    { id: "windshield", name: "Windshield", side: "center" },
    { id: "left-mirror", name: "Left Mirror", side: "left" },
    { id: "lf-door", name: "LF Door", hasSubParts: true, side: "left" },
    { id: "l-rocker-panel", name: "L Rocker Panel", hasSubParts: true, side: "left" },
    { id: "lr-door", name: "LR Door", hasSubParts: true, side: "left" },
    { id: "underbody-covers", name: "Underbody Covers", side: "left" },
    { id: "left-quarter", name: "Left Quarter", side: "left" },
    { id: "rear-window", name: "Rear Window", side: "center" },
    { id: "rear-bumper", name: "Rear Bumper", side: "rear" },
    { id: "trailer-hitch", name: "Trailer Hitch", side: "rear" },
    { id: "mud-guards", name: "Mud Guards", side: "left" },
    { id: "left-bed-side", name: "Left Bed Side", side: "left" },
    { id: "cargo-door", name: "Cargo Door", side: "rear" },
  ];

  const toggleExpand = (partId: string) => {
    setExpandedParts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(partId)) {
        newSet.delete(partId);
      } else {
        newSet.add(partId);
      }
      return newSet;
    });
  };

  const mockRightParts: PartItem[] = [
    { id: "wipers", name: "Wipers", side: "center" },
    { id: "right-fender", name: "Right Fender", score: 4.3, hasSubParts: true, side: "right" },
    { id: "r-rocker-panel", name: "R Rocker Panel", hasSubParts: true, side: "right" },
    { id: "convertible-top", name: "Convertible Top", side: "center" },
    { id: "right-mirror", name: "Right Mirror", side: "right" },
    { id: "rf-door", name: "RF Door", score: 4.5, hasSubParts: true, side: "right" },
    { id: "roof", name: "Roof", hasSubParts: true, side: "center" },
    { id: "rr-door", name: "RR Door", score: 4.5, hasSubParts: true, side: "right" },
    { id: "antenna", name: "Antenna", side: "center" },
    { id: "right-quarter", name: "Right Quarter", side: "right" },
    { id: "cab-corner", name: "Cab Corner", side: "right" },
    { id: "trunk", name: "Trunk", side: "rear" },
    { id: "bed", name: "Bed", side: "rear" },
    { id: "rear-body-panel", name: "Rear Body Panel", side: "rear" },
    { id: "right-bed-side", name: "Right Bed Side", side: "right" },
    { id: "rear-door", name: "Rear Door", side: "rear" },
  ];

  const categories: CategoryType[] = [
    "Exterior",
    "Frame",
    "Mechanics",
    "Interior",
    "Paint/Other",
    "Tires",
  ];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (authLoading) return;

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
        setReport(reportData);
      } catch (err: any) {
        console.error("Error loading report:", err);
        // Always show the condition report with demo data
        // Set a minimal report object so the page can still render
        setReport({
          id: params.id as string,
          trustScore: 90,
          sections: {
            exterior: { score: 84 },
          },
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      loadReport();
    }
  }, [isAuthenticated, authLoading, router, params.id]);

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Always use demo data if report is not available - this allows the page to always show
  const displayReport = report || {
    id: params.id as string,
    trustScore: 90,
    sections: {
      exterior: { score: 84 },
    },
  };

  // Calculate scores from report data or use defaults
  const overallScore = displayReport.trustScore ? (displayReport.trustScore / 20).toFixed(1) : "4.5";
  const exteriorGrading = displayReport.sections?.exterior?.score
    ? (displayReport.sections.exterior.score / 20).toFixed(1)
    : "4.2";
  const overallExterior = displayReport.sections?.exterior?.score
    ? (displayReport.sections.exterior.score / 20).toFixed(1)
    : "4.1";

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Nav />

      {/* Header */}
      <div className="relative container mx-auto px-4 pt-4 z-10">
        <div className="flex items-center justify-between mb-4">
          <Link
            href={`/reports/${params.id}`}
            className="inline-flex items-center gap-2 rounded-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-md px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 transition-all hover:bg-gray-100 dark:hover:bg-slate-700 hover:scale-105 shadow-md border border-gray-200 dark:border-slate-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Report
          </Link>
        </div>

        {/* Title Section */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Vehicle condition report
            </h1>
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-bold text-base">
              {overallScore}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Exterior Grading
              </span>
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-bold text-sm">
                {exteriorGrading}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Overall Exterior
              </span>
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 font-bold text-sm">
                {overallExterior}
              </span>
            </div>
          </div>
        </div>

        {/* Category Dropdown and View Toggle */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as CategoryType)}
              className="appearance-none bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-1.5 pr-7 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <svg
              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-500 dark:text-gray-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* View Mode Toggle - Mobile */}
          {isMobile && (
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-lg p-1 shadow-md border border-gray-300 dark:border-gray-700">
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                List View
              </button>
              <button
                onClick={() => setViewMode("left-right")}
                className={`px-3 py-1 text-xs font-medium rounded transition-all ${
                  viewMode === "left-right"
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                Left / Right
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="relative container mx-auto px-4 pb-8 z-10">
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 p-6">
          {/* Desktop View */}
          {!isMobile && (
            <div className="grid grid-cols-12 gap-6">
              {/* Left Panel */}
              <div className="col-span-2">
                <PartListPanel
                  parts={mockLeftParts}
                  side="left"
                  selectedPart={selectedPart}
                  onPartClick={setSelectedPart}
                  onExpand={toggleExpand}
                  expandedParts={expandedParts}
                />
              </div>

              {/* Center - Car Diagram */}
              <div className="col-span-8">
                <CarDiagram
                  parts={mockParts}
                  selectedPart={selectedPart}
                  onPartClick={setSelectedPart}
                />
              </div>

              {/* Right Panel */}
              <div className="col-span-2">
                <PartListPanel
                  parts={mockRightParts}
                  side="right"
                  selectedPart={selectedPart}
                  onPartClick={setSelectedPart}
                  onExpand={toggleExpand}
                  expandedParts={expandedParts}
                />
              </div>
            </div>
          )}

          {/* Mobile View */}
          {isMobile && (
            <div className="space-y-6">
              {viewMode === "list" ? (
                <div className="space-y-2">
                  {[...mockLeftParts, ...mockRightParts].map((part) => (
                    <div
                      key={part.id}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                        selectedPart === part.id
                          ? "bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-500"
                          : "bg-gray-50 dark:bg-gray-800/50"
                      }`}
                      onClick={() => setSelectedPart(part.id)}
                    >
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {part.name}
                      </span>
                      {part.score !== undefined && (
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded-full ${
                            part.score >= 4.0
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                              : part.score >= 3.0
                              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                          }`}
                        >
                          {part.score.toFixed(1)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <CarDiagram
                    parts={mockParts}
                    selectedPart={selectedPart}
                    onPartClick={setSelectedPart}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Left Side
                      </h3>
                      <PartListPanel
                        parts={mockLeftParts}
                        side="left"
                        selectedPart={selectedPart}
                        onPartClick={setSelectedPart}
                        onExpand={toggleExpand}
                        expandedParts={expandedParts}
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Right Side
                      </h3>
                      <PartListPanel
                        parts={mockRightParts}
                        side="right"
                        selectedPart={selectedPart}
                        onPartClick={setSelectedPart}
                        onExpand={toggleExpand}
                        expandedParts={expandedParts}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
