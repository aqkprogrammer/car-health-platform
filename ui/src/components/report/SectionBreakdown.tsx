"use client";

import { SectionScore, SeverityType, SEVERITY_CONFIG } from "@/types/report";

interface SectionBreakdownProps {
  section: SectionScore;
  icon?: string;
}

export default function SectionBreakdown({
  section,
  icon = "📊",
}: SectionBreakdownProps) {
  const percentage = Math.round((section.score / section.maxScore) * 100);
  const hasIssues = section.issues && section.issues.length > 0;

  const getScoreColor = () => {
    if (percentage >= 80) return "text-green-600 dark:text-green-400";
    if (percentage >= 60) return "text-blue-600 dark:text-blue-400";
    if (percentage >= 40) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getProgressColor = () => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-blue-500";
    if (percentage >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {section.label}
          </h3>
        </div>
        <span className={`text-2xl font-bold ${getScoreColor()}`}>
          {percentage}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className={`h-full transition-all duration-1000 ${getProgressColor()}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
          {section.score.toFixed(1)} / {section.maxScore} points
        </p>
      </div>

      {/* Details */}
      {section.details.length > 0 && (
        <div className="mb-4">
          <h4 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Assessment:
          </h4>
          <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            {section.details.map((detail, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="mt-0.5 text-blue-600 dark:text-blue-400">•</span>
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Issues */}
      {hasIssues && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Issues Found:
          </h4>
          {section.issues!.map((issue) => {
            const severityConfig = SEVERITY_CONFIG[issue.severity];
            return (
              <div
                key={issue.id}
                className={`rounded-lg border p-3 ${severityConfig.bgColor} border-current/20`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold ${severityConfig.color}`}
                      >
                        {severityConfig.label}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {issue.title}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                      {issue.description}
                    </p>
                    {issue.recommendation && (
                      <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Recommendation:</span>{" "}
                        {issue.recommendation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* No Issues Message */}
      {!hasIssues && percentage >= 80 && (
        <div className="mt-4 rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
          <p className="text-sm text-green-800 dark:text-green-200">
            ✓ No significant issues detected in this section
          </p>
        </div>
      )}
    </div>
  );
}
