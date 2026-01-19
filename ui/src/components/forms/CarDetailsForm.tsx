"use client";

import { useState } from "react";
import { CarDetails, CarDetailsFormErrors, FuelType, TransmissionType } from "@/types/car";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface CarDetailsFormProps {
  onSubmit: (data: CarDetails) => void;
  initialData?: Partial<CarDetails>;
  isLoading?: boolean;
}

const FUEL_TYPES: { value: FuelType; label: string }[] = [
  { value: "petrol", label: "Petrol" },
  { value: "diesel", label: "Diesel" },
  { value: "electric", label: "Electric" },
  { value: "hybrid", label: "Hybrid" },
  { value: "cng", label: "CNG" },
  { value: "lpg", label: "LPG" },
];

const TRANSMISSION_TYPES: { value: TransmissionType; label: string }[] = [
  { value: "manual", label: "Manual" },
  { value: "automatic", label: "Automatic" },
  { value: "cvt", label: "CVT" },
  { value: "amt", label: "AMT" },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 30 }, (_, i) => CURRENT_YEAR - i);

export default function CarDetailsForm({
  onSubmit,
  initialData,
  isLoading = false,
}: CarDetailsFormProps) {
  const [formData, setFormData] = useState<CarDetails>({
    make: initialData?.make || "",
    model: initialData?.model || "",
    manufacturingYear: initialData?.manufacturingYear || CURRENT_YEAR,
    fuelType: initialData?.fuelType || "petrol",
    transmission: initialData?.transmission || "manual",
    kilometersDriven: initialData?.kilometersDriven || 0,
    ownershipCount: initialData?.ownershipCount || 1,
    city: initialData?.city || "",
    state: initialData?.state || "",
  });

  const [errors, setErrors] = useState<CarDetailsFormErrors>({});

  const validate = (): boolean => {
    const newErrors: CarDetailsFormErrors = {};

    if (!formData.make.trim()) {
      newErrors.make = "Car make is required";
    }

    if (!formData.model.trim()) {
      newErrors.model = "Car model is required";
    }

    if (
      !formData.manufacturingYear ||
      formData.manufacturingYear < 1990 ||
      formData.manufacturingYear > CURRENT_YEAR
    ) {
      newErrors.manufacturingYear = `Please enter a valid year between 1990 and ${CURRENT_YEAR}`;
    }

    if (!formData.fuelType) {
      newErrors.fuelType = "Please select fuel type";
    }

    if (!formData.transmission) {
      newErrors.transmission = "Please select transmission type";
    }

    if (formData.kilometersDriven < 0) {
      newErrors.kilometersDriven = "Kilometers driven cannot be negative";
    }

    if (formData.ownershipCount < 1 || formData.ownershipCount > 10) {
      newErrors.ownershipCount = "Ownership count must be between 1 and 10";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleChange = (
    field: keyof CarDetails,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Make and Model */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="make"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Car Make <span className="text-red-500">*</span>
          </label>
          <input
            id="make"
            type="text"
            value={formData.make}
            onChange={(e) => handleChange("make", e.target.value)}
            placeholder="e.g., Toyota, Honda, Maruti"
            className={`w-full rounded-lg border bg-white py-3 px-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 ${
              errors.make
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 dark:border-gray-600"
            }`}
          />
          {errors.make && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.make}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="model"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Car Model <span className="text-red-500">*</span>
          </label>
          <input
            id="model"
            type="text"
            value={formData.model}
            onChange={(e) => handleChange("model", e.target.value)}
            placeholder="e.g., Camry, Civic, Swift"
            className={`w-full rounded-lg border bg-white py-3 px-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 ${
              errors.model
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 dark:border-gray-600"
            }`}
          />
          {errors.model && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.model}
            </p>
          )}
        </div>
      </div>

      {/* Manufacturing Year and Fuel Type */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="manufacturingYear"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Manufacturing Year <span className="text-red-500">*</span>
          </label>
          <select
            id="manufacturingYear"
            value={formData.manufacturingYear}
            onChange={(e) =>
              handleChange("manufacturingYear", parseInt(e.target.value))
            }
            className={`w-full rounded-lg border bg-white py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-white ${
              errors.manufacturingYear
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 dark:border-gray-600"
            }`}
          >
            <option value="">Select Year</option>
            {YEARS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          {errors.manufacturingYear && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.manufacturingYear}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="fuelType"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Fuel Type <span className="text-red-500">*</span>
          </label>
          <select
            id="fuelType"
            value={formData.fuelType}
            onChange={(e) => handleChange("fuelType", e.target.value as FuelType)}
            className={`w-full rounded-lg border bg-white py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-white ${
              errors.fuelType
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 dark:border-gray-600"
            }`}
          >
            {FUEL_TYPES.map((fuel) => (
              <option key={fuel.value} value={fuel.value}>
                {fuel.label}
              </option>
            ))}
          </select>
          {errors.fuelType && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.fuelType}
            </p>
          )}
        </div>
      </div>

      {/* Transmission and Kilometers Driven */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="transmission"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Transmission <span className="text-red-500">*</span>
          </label>
          <select
            id="transmission"
            value={formData.transmission}
            onChange={(e) =>
              handleChange("transmission", e.target.value as TransmissionType)
            }
            className={`w-full rounded-lg border bg-white py-3 px-4 text-gray-900 focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-white ${
              errors.transmission
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 dark:border-gray-600"
            }`}
          >
            {TRANSMISSION_TYPES.map((trans) => (
              <option key={trans.value} value={trans.value}>
                {trans.label}
              </option>
            ))}
          </select>
          {errors.transmission && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.transmission}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="kilometersDriven"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Kilometers Driven <span className="text-red-500">*</span>
          </label>
          <input
            id="kilometersDriven"
            type="number"
            min="0"
            value={formData.kilometersDriven || ""}
            onChange={(e) =>
              handleChange("kilometersDriven", parseInt(e.target.value) || 0)
            }
            placeholder="e.g., 50000"
            className={`w-full rounded-lg border bg-white py-3 px-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 ${
              errors.kilometersDriven
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 dark:border-gray-600"
            }`}
          />
          {errors.kilometersDriven && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.kilometersDriven}
            </p>
          )}
        </div>
      </div>

      {/* Ownership Count */}
      <div>
        <label
          htmlFor="ownershipCount"
          className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Ownership Count <span className="text-red-500">*</span>
        </label>
        <input
          id="ownershipCount"
          type="number"
          min="1"
          max="10"
          value={formData.ownershipCount || ""}
          onChange={(e) =>
            handleChange("ownershipCount", parseInt(e.target.value) || 1)
          }
          placeholder="e.g., 1, 2, 3"
          className={`w-full rounded-lg border bg-white py-3 px-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 ${
            errors.ownershipCount
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 dark:border-gray-600"
          }`}
        />
        {errors.ownershipCount && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.ownershipCount}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Number of previous owners (1-10)
        </p>
      </div>

      {/* Location - City and State */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="city"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            City <span className="text-red-500">*</span>
          </label>
          <input
            id="city"
            type="text"
            value={formData.city}
            onChange={(e) => handleChange("city", e.target.value)}
            placeholder="e.g., Mumbai, Delhi, Bangalore"
            className={`w-full rounded-lg border bg-white py-3 px-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 ${
              errors.city
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 dark:border-gray-600"
            }`}
          />
          {errors.city && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.city}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="state"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            State <span className="text-red-500">*</span>
          </label>
          <input
            id="state"
            type="text"
            value={formData.state}
            onChange={(e) => handleChange("state", e.target.value)}
            placeholder="e.g., Maharashtra, Delhi, Karnataka"
            className={`w-full rounded-lg border bg-white py-3 px-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 ${
              errors.state
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 dark:border-gray-600"
            }`}
          />
          {errors.state && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.state}
            </p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-base font-semibold text-white transition-all hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" />
              Saving...
            </>
          ) : (
            "Save & Continue"
          )}
        </button>
      </div>
    </form>
  );
}
