"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { mediaApi, carsApi, reportsApi, aiJobsApi } from "@/lib/api";
import StepIndicator from "@/components/ui/StepIndicator";
import StepCompletionStatus from "@/components/ui/StepCompletionStatus";
import CarDetailsSummary from "@/components/review/CarDetailsSummary";
import MediaPreviewGrid from "@/components/review/MediaPreviewGrid";
import AIProcessingScreen from "@/components/processing/AIProcessingScreen";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { CarDetails } from "@/types/car";
import Link from "next/link";
import Nav from "@/components/ui/Nav";

export default function ReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const [carDetails, setCarDetails] = useState<CarDetails | null>(null);
  const [carId, setCarId] = useState<string | null>(null);
  const [media, setMedia] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [canEdit, setCanEdit] = useState(true);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Load full submission summary from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get carId from URL or localStorage
        const urlCarId = searchParams.get("carId");
        const storedCarId = localStorage.getItem("currentCarId");
        const id = urlCarId || storedCarId;
        
        if (!id) {
          router.push("/reports/new");
          return;
        }
        
        setCarId(id);
        
        // Fetch full submission summary (car + media)
        const summary = await carsApi.getSubmissionSummary(id);
        
        // Set car details
        setCarDetails({
          make: summary.car.make,
          model: summary.car.model,
          manufacturingYear: summary.car.year,
          fuelType: summary.car.fuelType,
          transmission: summary.car.transmission,
          kilometersDriven: summary.car.kilometersDriven,
          ownershipCount: summary.car.ownershipCount,
          city: summary.car.city,
          state: summary.car.state,
        });
        
        // Set media - ensure proper format and filter only uploaded media
        console.log("ReviewPage - Raw media from API:", summary.media);
        const formattedMedia = summary.media
          .filter((m: any) => m.isUploaded && m.storageUrl) // Only show uploaded media with URLs
          .map((m: any) => {
            // Convert relative URLs to absolute if needed
            let storageUrl = m.storageUrl;
            if (storageUrl && !storageUrl.startsWith('http')) {
              // If relative URL, prepend API base URL
              const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
              storageUrl = storageUrl.startsWith('/') 
                ? `${apiBaseUrl}${storageUrl}` 
                : `${apiBaseUrl}/${storageUrl}`;
            }
            
            return {
              id: m.id,
              type: m.type?.toLowerCase() || m.type, // Normalize to lowercase
              photoType: m.photoType?.toLowerCase() || m.photoType,
              storageUrl,
              thumbnailUrl: m.thumbnailUrl,
              fileName: m.fileName,
              isUploaded: m.isUploaded,
            };
          });
        console.log("ReviewPage - Formatted media:", formattedMedia);
        setMedia(formattedMedia);
        
        // Set lock status
        setIsLocked(summary.isLocked);
        setCanEdit(summary.canEdit);
      } catch (err: any) {
        console.error("Error loading data:", err);
        setError(err.message || "Failed to load car data");
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, router, searchParams]);

  const handleEditDetails = () => {
    router.push("/reports/new");
  };

  const handleEditMedia = () => {
    router.push("/reports/new/photos");
  };

  const handleSubmit = async () => {
    if (!carDetails || !carId) {
      setError("Missing car details or car ID. Please go back and complete the previous steps.");
      return;
    }

    // Prevent double submission
    if (isLocked || isProcessing) {
      return;
    }

    setIsLoading(true);
    setIsProcessing(true);
    setError(null);

    try {
      // Submit car for AI analysis (validates, locks, creates job)
      const result = await carsApi.submit(carId);
      
      setJobId(result.jobId);
      setJobStatus(result.status);

      // Refresh submission summary to get updated locked status
      try {
        const updatedSummary = await carsApi.getSubmissionSummary(carId);
        setIsLocked(updatedSummary.isLocked);
        setCanEdit(updatedSummary.canEdit);
      } catch (refreshError) {
        // Fallback to local state if refresh fails
        console.warn("Failed to refresh submission summary:", refreshError);
        setIsLocked(true);
        setCanEdit(false);
      }

      setIsLoading(false);
      // Polling will be handled by useEffect
    } catch (error: any) {
      console.error("Error submitting report:", error);
      setIsLoading(false);
      setIsProcessing(false);
      setError(error.message || "Failed to submit report. Please try again.");
    }
  };

  // Poll job status when jobId is set
  useEffect(() => {
    if (!jobId || !isProcessing) return;

    const pollInterval = setInterval(async () => {
      try {
        const job = await aiJobsApi.getJob(jobId);
        setJobStatus(job.status);

        if (job.status === 'COMPLETED') {
          clearInterval(pollInterval);
          setIsProcessing(false);
          
          // Fetch report by carId
          try {
            const report = await reportsApi.getByCarId(carId!);
            
            // Clear localStorage
            localStorage.removeItem("currentCarId");
            
            // Redirect to report view page
            router.push(`/reports/${report.id}`);
          } catch (error: any) {
            console.error("Error fetching report:", error);
            setError("Report completed but could not be retrieved. Please check your reports.");
            setIsProcessing(false);
          }
        } else if (job.status === 'FAILED') {
          clearInterval(pollInterval);
          setIsProcessing(false);
          setError(job.errorReason || "AI processing failed. Please try again.");
        }
      } catch (error: any) {
        console.error("Error polling job status:", error);
        // Continue polling on error
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [jobId, isProcessing, carId, router]);

  const handleProcessingComplete = () => {
    // This is called by AIProcessingScreen, but we handle completion via polling
    // Keep for backward compatibility
  };

  if (!isAuthenticated || isLoading || !carDetails) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-6xl">⚠️</div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
            Error Loading Data
          </h1>
          <p className="mb-4 text-gray-600 dark:text-gray-400">{error}</p>
          <button
            onClick={() => router.push("/reports/new")}
            className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="mb-4 text-6xl">✅</div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
            Report Submitted Successfully!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your car health report is being generated. You'll receive it shortly.
          </p>
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
          href="/reports/new/photos"
          className="inline-flex items-center gap-2 rounded-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-md px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 transition-all hover:bg-gray-100 dark:hover:bg-slate-700 hover:scale-105 shadow-md border border-gray-200 dark:border-slate-700"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Photos
        </Link>
      </div>

      {/* Main Content */}
      <main className="relative container mx-auto px-4 py-8 sm:py-12 z-10">
        <div className="mx-auto max-w-4xl">
          {/* Progress Indicator */}
          <div className="mb-8">
            <StepIndicator
              currentStep={3}
              totalSteps={3}
              stepLabels={["Car Details", "Upload Photos", "Review & Submit"]}
            />
          </div>

          {/* Step Completion Status */}
          {carId && (
            <StepCompletionStatus carId={carId} currentStep={3} />
          )}

          {/* AI Processing Screen */}
          {isProcessing && jobId && (
            <AIProcessingScreen
              onComplete={handleProcessingComplete}
              estimatedTime={60}
              jobId={jobId}
              jobStatus={jobStatus}
            />
          )}

          {/* Review Content */}
          <div className="space-y-6">
            {/* Locked Warning */}
            {isLocked && (
              <div className="rounded-2xl border-2 border-yellow-200/50 bg-yellow-50/90 p-6 shadow-lg dark:border-yellow-800/50 dark:bg-yellow-900/20">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🔒</div>
                  <div>
                    <h3 className="mb-1 text-lg font-bold text-yellow-900 dark:text-yellow-200">
                      Car Data Locked
                    </h3>
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                      This car has been submitted for analysis. Editing is disabled to ensure data integrity during AI processing.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Car Details Summary */}
            <CarDetailsSummary
              details={carDetails}
              onEdit={canEdit ? handleEditDetails : undefined}
              isLocked={isLocked}
            />

            {/* Media Preview */}
            <MediaPreviewGrid 
              media={media} 
              onEdit={canEdit ? handleEditMedia : undefined}
              isLocked={isLocked}
            />

            {/* Pricing Info */}
            <div className="rounded-2xl border-2 border-blue-200/50 bg-gradient-to-br from-blue-50 to-indigo-50 p-8 shadow-xl dark:border-blue-800/50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
                    Report Pricing
                  </h3>
                  <p className="text-base text-gray-600 dark:text-gray-400">
                    You will be charged ₹999 for this comprehensive AI-powered health report.
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                    ₹999
                  </p>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    per report
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
              <button
                onClick={() => router.push("/reports/new/photos")}
                disabled={isLocked}
                className="rounded-2xl border-2 border-gray-300 px-8 py-4 text-base font-bold text-gray-700 transition-all hover:bg-gray-50 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                ← Back to Photos
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading || isProcessing || isLocked}
                className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-8 py-4 text-base font-bold text-white shadow-xl transition-all hover:shadow-blue-500/50 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:from-blue-500 dark:via-indigo-500 dark:to-purple-500"
              >
                {isLoading || isProcessing ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="relative z-10">{isProcessing ? "Processing..." : "Submitting..."}</span>
                  </>
                ) : isLocked ? (
                  <span className="relative z-10">Already Submitted</span>
                ) : (
                  <>
                    <span className="relative z-10">Submit & Generate Report</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 opacity-0 transition-opacity group-hover:opacity-100"></div>
                  </>
                )}
              </button>
            </div>

            {/* Terms & Conditions */}
            <div className="rounded-2xl border border-gray-200/50 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-6 shadow-lg dark:border-gray-700/50">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                By submitting, you agree to our Terms of Service and Privacy
                Policy. The report will be generated using AI analysis of your
                provided information and media.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
