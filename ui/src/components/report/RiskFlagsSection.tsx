"use client";

import { RiskFlag, SeverityType, SEVERITY_CONFIG } from "@/types/report";

interface RiskFlagsSectionProps {
  flags: RiskFlag[];
}

export default function RiskFlagsSection({ flags }: RiskFlagsSectionProps) {
  if (flags.length === 0) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-900/20">
        <div className="flex items-center gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <h3 className="font-semibold text-green-900 dark:text-green-100">
              No Major Risk Flags
            </h3>
            <p className="mt-1 text-sm text-green-800 dark:text-green-200">
              No significant risk factors were identified in the analysis.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Group flags by severity
  const groupedFlags = flags.reduce(
    (acc, flag) => {
      if (!acc[flag.severity]) {
        acc[flag.severity] = [];
      }
      acc[flag.severity].push(flag);
      return acc;
    },
    {} as Record<SeverityType, RiskFlag[]>
  );

  const severityOrder: SeverityType[] = [
    "critical",
    "high",
    "medium",
    "low",
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
        Risk Flags
      </h3>
      {severityOrder.map((severity) => {
        const flagsForSeverity = groupedFlags[severity] || [];
        if (flagsForSeverity.length === 0) return null;

        const severityConfig = SEVERITY_CONFIG[severity];
        return (
          <div key={severity} className="space-y-2">
            <h4
              className={`text-sm font-semibold ${severityConfig.color}`}
            >
              {severityConfig.label} Priority ({flagsForSeverity.length})
            </h4>
            {flagsForSeverity.map((flag) => (
              <div
                key={flag.id}
                className={`rounded-lg border p-4 ${severityConfig.bgColor} border-current/20`}
              >
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {flag.title}
                      </span>
                      <span className="rounded-full bg-white/50 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                        {flag.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {flag.description}
                    </p>
                  </div>
                </div>
                {flag.recommendation && (
                  <div className="mt-3 rounded-lg bg-white/50 p-3 dark:bg-gray-800/50">
                    <p className="text-xs font-medium text-gray-900 dark:text-white">
                      💡 Recommendation:
                    </p>
                    <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                      {flag.recommendation}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
