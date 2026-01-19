"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { carsApi } from "@/lib/api";
import CarDetailsForm from "@/components/forms/CarDetailsForm";
import StepIndicator from "@/components/ui/StepIndicator";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { CarDetails } from "@/types/car";
import Link from "next/link";
import Nav from "@/components/ui/Nav";

export default function NewReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingLock, setIsCheckingLock] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Check if car is locked when carId is present (editing existing car)
  useEffect(() => {
    const checkLockStatus = async () => {
      // Only check lock status if carId is explicitly in URL (editing mode)
      // If no carId in URL, clear localStorage to start fresh
      const urlCarId = searchParams.get("carId");
      const storedCarId = localStorage.getItem("currentCarId");
      
      if (!isAuthenticated) return;

      // If no carId in URL, this is a new report - clear stored carId if it's locked
      if (!urlCarId) {
        if (storedCarId) {
          setIsCheckingLock(true);
          try {
            const summary = await carsApi.getSubmissionSummary(storedCarId);
            if (summary.isLocked) {
              // Clear the locked carId from localStorage to allow creating new report
              localStorage.removeItem("currentCarId");
              console.log("Cleared locked carId from localStorage");
            }
          } catch (err: any) {
            // If car doesn't exist or other error, clear it anyway
            localStorage.removeItem("currentCarId");
            console.warn("Cleared invalid carId from localStorage:", err);
          } finally {
            setIsCheckingLock(false);
          }
        }
        return; // Don't show locked screen for new reports
      }

      // If carId is in URL, check if it's locked (editing mode)
      setIsCheckingLock(true);
      try {
        const summary = await carsApi.getSubmissionSummary(urlCarId);
        if (summary.isLocked) {
          setIsLocked(true);
          setError("This car has been submitted for analysis and cannot be edited. Please create a new report.");
        }
      } catch (err: any) {
        // If car doesn't exist or other error, allow creating new
        console.warn("Could not check lock status:", err);
      } finally {
        setIsCheckingLock(false);
      }
    };

    if (isAuthenticated) {
      checkLockStatus();
    }
  }, [isAuthenticated, searchParams]);

  if (!isAuthenticated || isCheckingLock) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const handleSubmit = async (data: CarDetails) => {
    if (isLocked) {
      setError("Cannot edit locked car. Please create a new report.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const carId = searchParams.get("carId") || localStorage.getItem("currentCarId");
      
      let car;
      if (carId && !isLocked) {
        try {
          // Try to update existing car
          car = await carsApi.update(carId, {
            make: data.make,
            model: data.model,
            year: data.manufacturingYear,
            fuelType: data.fuelType,
            transmission: data.transmission,
            kilometersDriven: data.kilometersDriven,
            ownershipCount: data.ownershipCount,
            city: data.city,
            state: data.state,
          });
        } catch (updateError: any) {
          // If car doesn't exist (404), create a new one instead
          const isNotFound = updateError.status === 404 || 
                            updateError.message?.toLowerCase().includes('not found') ||
                            updateError.message?.includes('404');
          
          if (isNotFound) {
            console.log("Car not found (404), creating new car instead");
            car = await carsApi.create({
              make: data.make,
              model: data.model,
              year: data.manufacturingYear,
              fuelType: data.fuelType,
              transmission: data.transmission,
              kilometersDriven: data.kilometersDriven,
              ownershipCount: data.ownershipCount,
              city: data.city,
              state: data.state,
              country: "India", // Default or from data
              status: "draft",
            });
            // Clear the invalid carId from localStorage
            localStorage.removeItem("currentCarId");
          } else {
            // Re-throw other errors
            throw updateError;
          }
        }
      } else {
        // Create new car
        car = await carsApi.create({
          make: data.make,
          model: data.model,
          year: data.manufacturingYear,
          fuelType: data.fuelType,
          transmission: data.transmission,
          kilometersDriven: data.kilometersDriven,
          ownershipCount: data.ownershipCount,
          city: data.city,
          state: data.state,
          country: "India", // Default or from data
          status: "draft",
        });
      }
      
      // Store car ID for next steps
      localStorage.setItem("currentCarId", car.id);
      
      // Navigate to next step (Step 2 - Photo Upload)
      router.push(`/reports/new/photos?carId=${car.id}`);
    } catch (err: any) {
      console.error("Error saving car details:", err);
      setError(err.message || "Failed to save car details. Please try again.");
      setIsLoading(false);
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

      {/* Main Content */}
      <main className="relative container mx-auto px-4 py-8 sm:py-12 z-10">
        <div className="mx-auto max-w-3xl">
          {/* Progress Indicator */}
          <div className="mb-8">
            <StepIndicator
              currentStep={1}
              totalSteps={3}
              stepLabels={["Car Details", "Upload Photos", "Review & Submit"]}
            />
          </div>

          {/* Form Card */}
          <div className="rounded-2xl border border-gray-200/50 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-8 shadow-2xl dark:border-gray-700/50">
            {error && (
              <div className="mb-6 rounded-xl border-2 border-red-200/50 bg-red-50/90 dark:bg-red-900/20 dark:border-red-800/50 p-4 text-sm text-red-800 dark:text-red-300">
                {error}
              </div>
            )}
            <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              Car Details
            </h2>
            <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">
              Please provide the basic details about your car. This information
              will help us generate an accurate health report.
            </p>

            {isLocked ? (
              <div className="rounded-xl border-2 border-yellow-200/50 bg-yellow-50/90 p-6 dark:bg-yellow-900/20 dark:border-yellow-800/50">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🔒</div>
                  <div className="flex-1">
                    <h3 className="mb-1 text-lg font-bold text-yellow-900 dark:text-yellow-200">
                      Car Data Locked
                    </h3>
                    <p className="mb-4 text-sm text-yellow-800 dark:text-yellow-300">
                      This car has been submitted for analysis. Editing is disabled to ensure data integrity during AI processing.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Link
                        href="/reports/new/review"
                        className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                      >
                        View Review Page
                      </Link>
                      <button
                        onClick={() => {
                          localStorage.removeItem("currentCarId");
                          setIsLocked(false);
                          setError(null);
                          router.push("/reports/new");
                        }}
                        className="inline-block rounded-lg bg-gray-600 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700"
                      >
                        Start Fresh Report
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <CarDetailsForm onSubmit={handleSubmit} isLoading={isLoading} />
            )}
          </div>

          {/* Help Text */}
          <div className="mt-6 rounded-2xl border border-blue-200/50 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-lg dark:border-blue-800/50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              <span className="font-bold">💡 Tip:</span> Make sure all
              information is accurate. You can find the manufacturing year and
              other details in your car's registration certificate or owner's
              manual.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
