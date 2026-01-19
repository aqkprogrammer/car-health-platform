"use client";

import Link from "next/link";
import { UploadedCar } from "@/types/profile";

interface UploadedCarsSectionProps {
  cars: UploadedCar[];
}

export default function UploadedCarsSection({ cars }: UploadedCarsSectionProps) {
  if (cars.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200/50 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-8 shadow-xl dark:border-gray-700/50">
        <h3 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
          Uploaded Cars
        </h3>
        <div className="rounded-xl border-2 border-dashed border-gray-300/50 bg-gradient-to-br from-gray-50 to-blue-50/50 dark:from-slate-700/50 dark:to-slate-600/50 p-12 text-center">
          <span className="mb-4 block text-6xl">🚗</span>
          <p className="mb-6 text-lg font-medium text-gray-600 dark:text-gray-400">
            No cars uploaded yet
          </p>
          <Link
            href="/reports/new"
            className="inline-block rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 dark:from-blue-500 dark:to-indigo-500"
          >
            Upload Your First Car
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-indigo-600/5 to-purple-600/5 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative rounded-3xl border border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-6 md:p-8 shadow-2xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-2xl shadow-lg ring-2 ring-blue-400/30">
              📋
            </div>
            <h3 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              My Reports
            </h3>
          </div>
          <span className="rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 px-5 py-2 text-sm font-bold text-blue-700 dark:text-blue-300 shadow-lg ring-2 ring-blue-400/20 backdrop-blur-sm">
            {cars.length} {cars.length === 1 ? "report" : "reports"}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-5 md:gap-6">
          {cars.map((car, index) => (
            <div
              key={car.id}
              className="group/card relative overflow-hidden rounded-2xl border border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-br from-white/90 to-blue-50/40 dark:from-slate-700/60 dark:to-slate-600/40 p-6 shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:border-blue-400/50 dark:hover:border-blue-600/50"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl group-hover/card:bg-blue-400/20 transition-all"></div>
              <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                <div className="flex items-start gap-5 flex-1">
                  <div className="flex h-18 w-18 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 text-3xl shadow-xl ring-2 ring-blue-400/30 group-hover/card:scale-110 transition-transform duration-300">
                    🚗
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="mb-3 text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white">
                      {car.make} {car.model}
                    </h4>
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      <span className="rounded-xl bg-gray-100 dark:bg-slate-700 px-4 py-1.5 text-sm font-bold text-gray-700 dark:text-gray-300 shadow-md">
                        {car.year}
                      </span>
                      {car.trustScore !== undefined && (
                        <span className="rounded-xl bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 px-4 py-1.5 text-sm font-bold text-blue-700 dark:text-blue-300 shadow-md ring-1 ring-blue-400/30">
                          ⭐ {car.trustScore}% Trust Score
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                      <span>📅</span>
                      <span>
                        Uploaded {new Date(car.uploadedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  {/* Enhanced Status Badge */}
                  <span
                    className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold shadow-lg ring-2 backdrop-blur-sm ${
                      car.status === "completed"
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white ring-green-400/30"
                        : car.status === "analyzing"
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white ring-blue-400/30"
                        : car.status === "in_progress" || car.status === "draft"
                        ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white ring-yellow-400/30"
                        : car.status === "pending"
                        ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white ring-yellow-400/30"
                        : "bg-gradient-to-r from-red-500 to-pink-500 text-white ring-red-400/30"
                    }`}
                  >
                    {car.status === "completed"
                      ? "✓ Completed"
                      : car.status === "analyzing"
                      ? "⏳ Analyzing"
                      : car.status === "in_progress"
                      ? "📝 In Progress"
                      : car.status === "draft"
                      ? "📝 Draft"
                      : car.status === "pending"
                      ? "⏳ Pending"
                      : "✗ Failed"}
                  </span>

                  {/* Action Buttons */}
                  {car.reportId ? (
                    // Completed report - show View Report
                    <Link
                      href={`/reports/${car.reportId}`}
                      className="group/link inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-2.5 text-sm font-bold text-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 ring-2 ring-blue-400/30"
                    >
                      <span>View Report</span>
                      <span className="transform transition-transform group-hover/link:translate-x-1">→</span>
                    </Link>
                  ) : car.carId ? (
                    // Draft/In-progress car - show Continue Report
                    car.status === "analyzing" ? (
                      <Link
                        href={`/reports/new/review?carId=${car.carId}`}
                        className="group/link inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-2.5 text-sm font-bold text-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 ring-2 ring-blue-400/30"
                      >
                        <span>View Status</span>
                        <span className="transform transition-transform group-hover/link:translate-x-1">→</span>
                      </Link>
                    ) : (
                      <Link
                        href={`/reports/new/photos?carId=${car.carId}`}
                        className="group/link inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 px-6 py-2.5 text-sm font-bold text-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 ring-2 ring-green-400/30"
                      >
                        <span>Continue Report</span>
                        <span className="transform transition-transform group-hover/link:translate-x-1">→</span>
                      </Link>
                    )
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
