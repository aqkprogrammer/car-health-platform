"use client";

import { VerdictType, VERDICT_CONFIG } from "@/types/report";

interface TrustScoreCardProps {
  score?: number | null;
  verdict?: VerdictType | string;
}

// Helper function to safely get verdict config
function getVerdictConfig(verdict: VerdictType | string | undefined) {
  if (!verdict) return VERDICT_CONFIG.good;
  
  const normalized = verdict.toLowerCase() as VerdictType;
  return VERDICT_CONFIG[normalized] || VERDICT_CONFIG.good;
}

export default function TrustScoreCard({ score, verdict }: TrustScoreCardProps) {
  // Handle undefined/null score with default value
  const safeScore = score != null ? Number(score) : 0;
  const config = getVerdictConfig(verdict);
  const percentage = Math.round(safeScore);

  // Calculate color based on score
  const getScoreColor = () => {
    if (safeScore >= 80) return "text-green-600 dark:text-green-400";
    if (safeScore >= 60) return "text-blue-600 dark:text-blue-400";
    if (safeScore >= 40) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getProgressColor = () => {
    if (safeScore >= 80) return "bg-green-500";
    if (safeScore >= 60) return "bg-blue-500";
    if (safeScore >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="rounded-2xl border-2 border-gray-200/50 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-8 shadow-2xl dark:border-gray-700/50">
      <div className="text-center">
        <h2 className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
          Overall Trust Score
        </h2>
        <div className="mb-4">
          <div className="relative inline-block">
            <svg className="h-32 w-32 -rotate-90 transform">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-200 dark:text-gray-700"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${(percentage / 100) * 351.86} 351.86`}
                strokeLinecap="round"
                className={getScoreColor()}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-4xl font-bold ${getScoreColor()}`}>
                {percentage}
              </span>
            </div>
          </div>
        </div>

        {/* Verdict Badge */}
        <div
          className={`inline-flex items-center gap-2 rounded-full px-6 py-3 ${config.bgColor}`}
        >
          <span className="text-2xl">{config.icon}</span>
          <span className={`text-lg font-semibold ${config.color}`}>
            {config.label}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className={`h-full transition-all duration-1000 ${getProgressColor()}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Score: {safeScore.toFixed(1)} / 100
          </p>
        </div>
      </div>
    </div>
  );
}
