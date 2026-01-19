"use client";

import { useMemo } from "react";

interface CarSpecificationsProps {
  make: string;
  model: string;
  year: number;
  fuelType: string;
  transmission: string;
  kilometersDriven: number | null;
  location: {
    city: string;
    state: string;
  };
}

export default function CarSpecifications({
  make,
  model,
  year,
  fuelType,
  transmission,
  kilometersDriven,
  location,
}: CarSpecificationsProps) {
  const carAge = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return currentYear - year;
  }, [year]);

  const avgKmPerYear = useMemo(() => {
    if (!kilometersDriven || carAge === 0) return null;
    return Math.round(kilometersDriven / carAge);
  }, [kilometersDriven, carAge]);

  const specs = [
    {
      id: "make-model",
      label: "Make & Model",
      value: `${make} ${model}`,
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
    },
    {
      id: "year",
      label: "Year",
      value: year.toString(),
      subValue: `${carAge} ${carAge === 1 ? "yr" : "yrs"} old`,
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: "fuel",
      label: "Fuel Type",
      value: fuelType,
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      id: "transmission",
      label: "Transmission",
      value: transmission,
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      id: "mileage",
      label: "Kilometers",
      value: kilometersDriven != null ? `${kilometersDriven.toLocaleString()} km` : "N/A",
      subValue: avgKmPerYear ? `${avgKmPerYear.toLocaleString()} km/yr` : undefined,
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      id: "location",
      label: "Location",
      value: `${location.city}, ${location.state}`,
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:bg-slate-800 dark:border-gray-700 shadow-sm">
      <div className="p-6">
        {/* Header */}
        <div className="mb-5 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
            <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Specifications
          </h2>
        </div>

        {/* Specifications - Pill Style Cards */}
        <div className="flex flex-wrap gap-2">
          {specs.map((spec) => (
            <div
              key={spec.id}
              className="group inline-flex items-center gap-2 rounded-full bg-gray-100 dark:bg-slate-700/50 px-4 py-2.5 min-w-[120px] transition-all hover:bg-gray-200 dark:hover:bg-slate-700 hover:shadow-sm"
            >
              <div className="text-gray-600 dark:text-gray-400 flex-shrink-0">
                {spec.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">
                  {spec.label}
                </p>
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                  {spec.value}
                </p>
                {spec.subValue && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {spec.subValue}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
