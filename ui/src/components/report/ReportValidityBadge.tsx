"use client";

import { CarHealthReport } from "@/types/report";

interface ReportValidityBadgeProps {
  report: CarHealthReport;
}

export default function ReportValidityBadge({ report }: ReportValidityBadgeProps) {
  // Default validity: 30 days from generation
  const validUntil = report.validUntil
    ? new Date(report.validUntil)
    : new Date(new Date(report.generatedAt).getTime() + 30 * 24 * 60 * 60 * 1000);
  
  const now = new Date();
  const daysRemaining = Math.ceil(
    (validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  const isValid = daysRemaining > 0;

  const getStatusColor = () => {
    if (daysRemaining > 15) {
      return {
        bg: "bg-green-100 dark:bg-green-900/30",
        text: "text-green-700 dark:text-green-300",
        border: "border-green-300 dark:border-green-700",
        icon: "✅",
      };
    } else if (daysRemaining > 7) {
      return {
        bg: "bg-yellow-100 dark:bg-yellow-900/30",
        text: "text-yellow-700 dark:text-yellow-300",
        border: "border-yellow-300 dark:border-yellow-700",
        icon: "⏰",
      };
    } else if (daysRemaining > 0) {
      return {
        bg: "bg-orange-100 dark:bg-orange-900/30",
        text: "text-orange-700 dark:text-orange-300",
        border: "border-orange-300 dark:border-orange-700",
        icon: "⚠️",
      };
    } else {
      return {
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-700 dark:text-red-300",
        border: "border-red-300 dark:border-red-700",
        icon: "❌",
      };
    }
  };

  const status = getStatusColor();

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 ${status.bg} ${status.border} ${status.text}`}
    >
      <span className="text-lg">{status.icon}</span>
      <div className="flex flex-col">
        <span className="text-xs font-medium">Report Validity</span>
        {isValid ? (
          <span className="text-sm font-semibold">
            Valid for {daysRemaining} {daysRemaining === 1 ? "day" : "days"}
          </span>
        ) : (
          <span className="text-sm font-semibold">Expired</span>
        )}
      </div>
      <span className="text-xs opacity-75">
        (Expires: {validUntil.toLocaleDateString()})
      </span>
    </div>
  );
}
