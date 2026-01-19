"use client";

import { useState, useEffect } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface ProcessingStep {
  id: string;
  label: string;
  duration: number; // in milliseconds
}

const PROCESSING_STEPS: ProcessingStep[] = [
  {
    id: "analyzing-exterior",
    label: "Analyzing exterior",
    duration: 4000,
  },
  {
    id: "analyzing-engine",
    label: "Analyzing engine sound",
    duration: 3500,
  },
  {
    id: "calculating-trust",
    label: "Calculating trust score",
    duration: 3000,
  },
];

interface AIProcessingScreenProps {
  onComplete?: () => void;
  estimatedTime?: number; // in seconds
}

export default function AIProcessingScreen({
  onComplete,
  estimatedTime = 60,
}: AIProcessingScreenProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(estimatedTime);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let stepStartTime = Date.now();
    let progressInterval: NodeJS.Timeout;
    let timeInterval: NodeJS.Timeout;

    const processStep = (stepIndex: number) => {
      if (stepIndex >= PROCESSING_STEPS.length) {
        setIsComplete(true);
        setOverallProgress(100);
        setTimeout(() => {
          onComplete?.();
        }, 1000);
        return;
      }

      const step = PROCESSING_STEPS[stepIndex];
      setCurrentStepIndex(stepIndex);
      stepStartTime = Date.now();

      // Calculate progress for current step
      const stepProgress = (stepIndex / PROCESSING_STEPS.length) * 100;
      setOverallProgress(stepProgress);

      // Update progress during step
      progressInterval = setInterval(() => {
        const elapsed = Date.now() - stepStartTime;
        const stepProgressPercent = Math.min(
          (elapsed / step.duration) * 100,
          100
        );
        const totalProgress =
          (stepIndex / PROCESSING_STEPS.length) * 100 +
          (stepProgressPercent / PROCESSING_STEPS.length);
        setOverallProgress(Math.min(totalProgress, 99));
      }, 50);

      // Move to next step after duration
      setTimeout(() => {
        clearInterval(progressInterval);
        processStep(stepIndex + 1);
      }, step.duration);
    };

    // Start processing
    processStep(0);

    // Update time remaining
    timeInterval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timeInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(timeInterval);
    };
  }, [onComplete, estimatedTime]);

  const currentStep = PROCESSING_STEPS[currentStepIndex];
  const completedSteps = PROCESSING_STEPS.slice(0, currentStepIndex);
  const remainingSteps = PROCESSING_STEPS.slice(currentStepIndex + 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl dark:bg-gray-800 sm:p-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            AI Processing Your Report
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Our AI is analyzing your car details and generating a comprehensive
            health report
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Progress</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {Math.round(overallProgress)}%
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 ease-out"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        {/* Current Step */}
        {currentStep && !isComplete && (
          <div className="mb-6 rounded-lg border-2 border-blue-500 bg-blue-50 p-4 dark:border-blue-400 dark:bg-blue-900/20">
            <div className="flex items-center gap-3">
              <LoadingSpinner size="sm" className="text-blue-600 dark:text-blue-400" />
              <div className="flex-1">
                <p className="font-semibold text-blue-900 dark:text-blue-100">
                  {currentStep.label}
                </p>
                <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">
                  Please wait while we process this step...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Completed Steps */}
        {completedSteps.length > 0 && (
          <div className="mb-4">
            <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              Completed Steps
            </h3>
            <div className="space-y-2">
              {completedSteps.map((step, index) => (
                <div
                  key={step.id}
                  className="flex items-center gap-3 rounded-lg bg-green-50 p-3 dark:bg-green-900/20"
                >
                  <span className="text-green-600 dark:text-green-400">✓</span>
                  <span className="text-sm text-green-900 dark:text-green-100">
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Remaining Steps */}
        {remainingSteps.length > 0 && !isComplete && (
          <div className="mb-6">
            <h3 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              Upcoming Steps
            </h3>
            <div className="space-y-2">
              {remainingSteps.map((step) => (
                <div
                  key={step.id}
                  className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50"
                >
                  <span className="text-gray-400 dark:text-gray-500">○</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Success State */}
        {isComplete && (
          <div className="mb-6 rounded-lg border-2 border-green-500 bg-green-50 p-4 dark:border-green-400 dark:bg-green-900/20">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-semibold text-green-900 dark:text-green-100">
                  Processing Complete!
                </p>
                <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                  Your report is being finalized...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Estimated Time */}
        <div className="mb-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">⏱️</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Estimated Time Remaining
              </span>
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {Math.floor(timeRemaining / 60)}:
              {(timeRemaining % 60).toString().padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* Warning */}
        <div className="rounded-lg border-2 border-yellow-400 bg-yellow-50 p-4 dark:border-yellow-600 dark:bg-yellow-900/20">
          <div className="flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-semibold text-yellow-900 dark:text-yellow-100">
                Do Not Close This Window
              </p>
              <p className="mt-1 text-sm text-yellow-800 dark:text-yellow-200">
                Closing this window may interrupt the report generation process.
                Please wait until processing is complete.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
