"use client";

import { CarDetails } from "@/types/car";
import { capitalize } from "@/lib/utils";

interface CarDetailsSummaryProps {
  details: CarDetails;
  onEdit?: () => void;
  isLocked?: boolean;
}

export default function CarDetailsSummary({
  details,
  onEdit,
  isLocked = false,
}: CarDetailsSummaryProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Car Details
        </h3>
        {onEdit && !isLocked && (
          <button
            onClick={onEdit}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Edit
          </button>
        )}
        {isLocked && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            🔒 Locked
          </span>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Make & Model</p>
          <p className="mt-1 font-medium text-gray-900 dark:text-white">
            {details.make} {details.model}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Year</p>
          <p className="mt-1 font-medium text-gray-900 dark:text-white">
            {details.manufacturingYear}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Fuel Type</p>
          <p className="mt-1 font-medium text-gray-900 dark:text-white">
            {capitalize(details.fuelType)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Transmission</p>
          <p className="mt-1 font-medium text-gray-900 dark:text-white">
            {capitalize(details.transmission)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Kilometers Driven
          </p>
          <p className="mt-1 font-medium text-gray-900 dark:text-white">
            {details.kilometersDriven.toLocaleString()} km
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Ownership Count
          </p>
          <p className="mt-1 font-medium text-gray-900 dark:text-white">
            {details.ownershipCount} {details.ownershipCount === 1 ? "owner" : "owners"}
          </p>
        </div>
        <div className="sm:col-span-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
          <p className="mt-1 font-medium text-gray-900 dark:text-white">
            {details.city}, {details.state}
          </p>
        </div>
      </div>
    </div>
  );
}
