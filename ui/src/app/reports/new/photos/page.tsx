"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { mediaApi, carsApi } from "@/lib/api";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import MediaUploadForm from "@/components/forms/MediaUploadForm";
import SampleImages from "@/components/ui/SampleImages";
import StepIndicator from "@/components/ui/StepIndicator";
import StepCompletionStatus from "@/components/ui/StepCompletionStatus";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { MediaUploadData, PhotoType } from "@/types/car";
import Link from "next/link";
import Nav from "@/components/ui/Nav";

export default function PhotosUploadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const [carId, setCarId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [checklist, setChecklist] = useState<any>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isCheckingLock, setIsCheckingLock] = useState(false);
  const { uploadMedia, isUploading, uploads } = useMediaUpload();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Get carId from URL or localStorage
  useEffect(() => {
    const urlCarId = searchParams.get("carId");
    const storedCarId = localStorage.getItem("currentCarId");
    const id = urlCarId || storedCarId;
    
    if (!id) {
      router.push("/reports/new");
      return;
    }
    
    setCarId(id);
  }, [searchParams, router]);

  // Check if car is locked
  useEffect(() => {
    const checkLockStatus = async () => {
      if (!carId || !isAuthenticated) return;

      setIsCheckingLock(true);
      try {
        const summary = await carsApi.getSubmissionSummary(carId);
        if (summary.isLocked) {
          setIsLocked(true);
          setError("This car has been submitted for analysis and cannot be edited. Please create a new report.");
        }
      } catch (err: any) {
        // If car doesn't exist or other error, allow continuing
        console.warn("Could not check lock status:", err);
      } finally {
        setIsCheckingLock(false);
      }
    };

    if (carId && isAuthenticated) {
      checkLockStatus();
    }
  }, [carId, isAuthenticated]);

  // Fetch required media checklist on mount
  useEffect(() => {
    if (!carId || !isAuthenticated || isLocked) return;

    const fetchChecklist = async () => {
      try {
        const checklistData = await mediaApi.getRequiredMediaChecklist(carId);
        setChecklist(checklistData);
      } catch (err) {
        console.error("Error fetching checklist:", err);
      }
    };

    fetchChecklist();
  }, [carId, isAuthenticated, isLocked]);

  // Fetch validation warnings on mount and periodically
  useEffect(() => {
    if (!carId || !isAuthenticated) return;

    const fetchValidation = async () => {
      try {
        const validation = await mediaApi.validateRequiredMedia(carId);
        if (validation.warnings && validation.warnings.length > 0) {
          setValidationWarnings(validation.warnings);
        } else {
          setValidationWarnings([]);
        }
      } catch (err) {
        console.error("Error fetching validation:", err);
      }
    };

    fetchValidation();
    // Refresh validation every 5 seconds
    const interval = setInterval(fetchValidation, 5000);
    return () => clearInterval(interval);
  }, [carId, isAuthenticated]);

  if (!isAuthenticated || !carId || isCheckingLock) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const handleSubmit = async (data: MediaUploadData) => {
    if (!carId) return;

    if (isLocked) {
      setError("Cannot edit locked car. Please create a new report.");
      return;
    }

    setError(null);
    try {
      // Upload all photos and video using upload hook with progress tracking
      const uploadPromises: Promise<void>[] = [];

      // Upload photos
      for (const [photoType, photo] of Object.entries(data.photos)) {
        if (photo && photo.file) {
          uploadPromises.push(
            uploadMedia(carId, photo.file, "photo", photoType as PhotoType)
          );
        }
      }

      // Upload video if present
      if (data.video && data.video.file) {
        uploadPromises.push(
          uploadMedia(carId, data.video.file, "video")
        );
      }

      await Promise.all(uploadPromises);
      
      // Validate that all required media is uploaded
      const validation = await mediaApi.validateRequiredMedia(carId);
      
      if (!validation.isValid) {
        console.warn("Some required photos are missing:", validation.missingPhotos);
        // Still allow to proceed, but show warning
      }
      
      // Navigate to next step (Step 3 - Review & Submit)
      router.push(`/reports/new/review?carId=${carId}`);
    } catch (err: any) {
      console.error("Error uploading media:", err);
      setError(err.message || "Failed to upload media. Please try again.");
    }
  };

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
          href="/reports/new"
          className="inline-flex items-center gap-2 rounded-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-md px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 transition-all hover:bg-gray-100 dark:hover:bg-slate-700 hover:scale-105 shadow-md border border-gray-200 dark:border-slate-700"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Details
        </Link>
      </div>

      {/* Main Content */}
      <main className="relative container mx-auto px-4 py-8 sm:py-12 z-10">
        <div className="mx-auto max-w-5xl">
          {/* Progress Indicator */}
          <div className="mb-8">
            <StepIndicator
              currentStep={2}
              totalSteps={3}
              stepLabels={["Car Details", "Upload Photos", "Review & Submit"]}
            />
          </div>

          {/* Step Completion Status */}
          {carId && (
            <StepCompletionStatus carId={carId} currentStep={2} />
          )}

          {/* Validation Warnings */}
          {validationWarnings.length > 0 && (
            <div className="mb-6 rounded-2xl border-2 border-yellow-200/50 bg-yellow-50/90 dark:bg-yellow-900/20 dark:border-yellow-800/50 p-6 shadow-lg">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div className="flex-1">
                  <h3 className="mb-2 text-lg font-bold text-yellow-800 dark:text-yellow-300">
                    Upload Warnings
                  </h3>
                  <ul className="space-y-2">
                    {validationWarnings.map((warning, index) => (
                      <li key={index} className="text-sm text-yellow-700 dark:text-yellow-400">
                        • {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Sample Images Section */}
          <div className="mb-6">
            <SampleImages />
          </div>

          {/* Form Card */}
          <div className="rounded-2xl border border-gray-200/50 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-8 shadow-2xl dark:border-gray-700/50">
            {error && (
              <div className="mb-6 rounded-xl border-2 border-red-200/50 bg-red-50/90 dark:bg-red-900/20 dark:border-red-800/50 p-4 text-sm text-red-800 dark:text-red-300">
                {error}
              </div>
            )}
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              Upload Photos & Video
            </h2>
            <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">
              Upload clear photos of your car from different angles and a video
              of the engine sound. This helps our AI generate a more accurate
              health report.
            </p>

            {isLocked ? (
              <div className="rounded-xl border-2 border-yellow-200/50 bg-yellow-50/90 p-6 dark:bg-yellow-900/20 dark:border-yellow-800/50">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🔒</div>
                  <div>
                    <h3 className="mb-1 text-lg font-bold text-yellow-900 dark:text-yellow-200">
                      Car Data Locked
                    </h3>
                    <p className="mb-4 text-sm text-yellow-800 dark:text-yellow-300">
                      This car has been submitted for analysis. Editing is disabled to ensure data integrity during AI processing.
                    </p>
                    <Link
                      href={`/reports/new/review?carId=${carId}`}
                      className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      View Review Page
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <MediaUploadForm 
                onSubmit={handleSubmit} 
                isLoading={isUploading}
                checklist={checklist}
              />
            )}
            
            {/* Upload Progress Display */}
            {uploads.size > 0 && (
              <div className="mt-6 space-y-2">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Upload Progress
                </h3>
                {Array.from(uploads.values()).map((upload) => (
                  <div key={upload.mediaId} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">
                        {upload.fileName}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {upload.progress}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className={`h-full transition-all duration-300 ${
                          upload.status === 'error'
                            ? 'bg-red-600'
                            : upload.status === 'completed'
                            ? 'bg-green-600'
                            : 'bg-blue-600'
                        }`}
                        style={{ width: `${upload.progress}%` }}
                      />
                    </div>
                    {upload.status === 'error' && upload.error && (
                      <p className="text-xs text-red-600 dark:text-red-400">
                        {upload.error}
                      </p>
                    )}
                    {upload.status === 'completed' && (
                      <p className="text-xs text-green-600 dark:text-green-400">
                        ✓ Upload complete
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Help Text */}
          <div className="mt-6 rounded-2xl border border-blue-200/50 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-lg dark:border-blue-800/50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <p className="mb-3 text-sm font-bold text-gray-700 dark:text-gray-300">
              💡 Tips:
            </p>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Take photos in good lighting conditions</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Ensure photos are clear and not blurry</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>For the engine video, record with the hood open</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>Make sure the video captures the engine sound clearly</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
