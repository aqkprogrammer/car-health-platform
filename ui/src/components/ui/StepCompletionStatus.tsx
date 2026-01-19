"use client";

import { useEffect, useState } from "react";
import { carsApi } from "@/lib/api";
import LoadingSpinner from "./LoadingSpinner";

interface StepCompletionStatusProps {
  carId: string;
  currentStep: number;
}

export default function StepCompletionStatus({
  carId,
  currentStep,
}: StepCompletionStatusProps) {
  const [stepStatus, setStepStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStepStatus = async () => {
      if (!carId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        const status = await carsApi.getStepCompletionStatus(carId);
        setStepStatus(status);
      } catch (err: any) {
        console.error("Error fetching step status:", err);
        setError(err.message || "Failed to load step status");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStepStatus();
  }, [carId]);

  if (isLoading || !stepStatus) {
    return (
      <div className="mb-6 flex items-center justify-center">
        <LoadingSpinner size="sm" />
      </div>
    );
  }

  if (error) {
    return null; // Fail silently
  }

  return (
    <div className="mb-8 rounded-2xl border border-gray-200/50 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-6 shadow-lg dark:border-gray-700/50">
      <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
        Step Completion Status
      </h3>
      
      <div className="space-y-4">
        {/* Step 1: Car Details */}
        <div className="flex items-start gap-4">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${
              stepStatus.step1Complete
                ? "border-green-500 bg-green-500 text-white"
                : currentStep === 1
                ? "border-blue-500 bg-blue-500 text-white"
                : "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800"
            }`}
          >
            {stepStatus.step1Complete ? "✓" : "1"}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                Step 1: Car Details
              </h4>
              {stepStatus.step1Complete && (
                <span className="text-xs font-bold text-green-600 dark:text-green-400">
                  Complete
                </span>
              )}
            </div>
            {!stepStatus.step1Complete && stepStatus.step1Details.missingFields.length > 0 && (
              <p className="mt-1 text-sm text-yellow-600 dark:text-yellow-400">
                Missing: {stepStatus.step1Details.missingFields.join(", ")}
              </p>
            )}
          </div>
        </div>

        {/* Step 2: Media Upload */}
        <div className="flex items-start gap-4">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${
              stepStatus.step2Complete
                ? "border-green-500 bg-green-500 text-white"
                : currentStep === 2
                ? "border-blue-500 bg-blue-500 text-white"
                : "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800"
            }`}
          >
            {stepStatus.step2Complete ? "✓" : "2"}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                Step 2: Media Upload
              </h4>
              {stepStatus.step2Complete && (
                <span className="text-xs font-bold text-green-600 dark:text-green-400">
                  Complete
                </span>
              )}
            </div>
            <div className="mt-2">
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Photos: {stepStatus.step2Details.uploadedPhotosCount} / {stepStatus.step2Details.requiredPhotosCount}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  Video: {stepStatus.step2Details.hasVideo ? "✓" : "✗"}
                </span>
              </div>
              {stepStatus.step2Details.missingPhotos.length > 0 && (
                <p className="mt-1 text-sm text-yellow-600 dark:text-yellow-400">
                  Missing: {stepStatus.step2Details.missingPhotos.join(", ")}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Ready for Submission */}
        {stepStatus.readyForSubmission && (
          <div className="mt-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 p-4 dark:from-green-900/20 dark:to-emerald-900/20">
            <div className="flex items-center gap-2">
              <span className="text-xl">✅</span>
              <p className="font-semibold text-green-800 dark:text-green-300">
                Ready for submission! You can proceed to review and submit.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
