"use client";

import { useState } from "react";

interface Highlight {
  id: string;
  type: "positive" | "warning" | "negative" | "info";
  title: string;
  description: string;
  icon: string;
}

interface AIHighlightsProps {
  highlights: Highlight[];
}

export default function AIHighlights({ highlights }: AIHighlightsProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!highlights || highlights.length === 0) {
    return null;
  }

  const getHighlightConfig = (type: string) => {
    switch (type) {
      case "positive":
        return {
          bg: "bg-green-50 dark:bg-green-950/20",
          border: "border-green-200 dark:border-green-800",
          iconBg: "bg-green-100 dark:bg-green-900/30",
          iconColor: "text-green-600 dark:text-green-400",
          badgeBg: "bg-green-500",
          badgeText: "Positive",
        };
      case "warning":
        return {
          bg: "bg-yellow-50 dark:bg-yellow-950/20",
          border: "border-yellow-200 dark:border-yellow-800",
          iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
          iconColor: "text-yellow-600 dark:text-yellow-400",
          badgeBg: "bg-yellow-500",
          badgeText: "Attention",
        };
      case "negative":
        return {
          bg: "bg-red-50 dark:bg-red-950/20",
          border: "border-red-200 dark:border-red-800",
          iconBg: "bg-red-100 dark:bg-red-900/30",
          iconColor: "text-red-600 dark:text-red-400",
          badgeBg: "bg-red-500",
          badgeText: "Issue",
        };
      default:
        return {
          bg: "bg-blue-50 dark:bg-blue-950/20",
          border: "border-blue-200 dark:border-blue-800",
          iconBg: "bg-blue-100 dark:bg-blue-900/30",
          iconColor: "text-blue-600 dark:text-blue-400",
          badgeBg: "bg-blue-500",
          badgeText: "Info",
        };
    }
  };

  const positiveHighlights = highlights.filter((h) => h.type === "positive");
  const warningHighlights = highlights.filter((h) => h.type === "warning" || h.type === "negative");
  const positiveCount = positiveHighlights.length;
  const warningCount = warningHighlights.length;
  const [showAllPositives, setShowAllPositives] = useState(false);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:bg-slate-800 dark:border-gray-700 shadow-sm">
      <div className="p-6">
        {/* Header */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="mb-4 flex w-full items-center justify-between transition-colors hover:opacity-80"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30">
              <span className="text-xl">🤖</span>
            </div>
            <div className="text-left">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                AI Vehicle Health Summary
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Comprehensive AI-powered analysis
              </p>
            </div>
            <div className="flex items-center gap-2">
              {positiveCount > 0 && (
                <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                  {positiveCount} positive
                </span>
              )}
              {warningCount > 0 && (
                <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                  {warningCount} attention
                </span>
              )}
            </div>
          </div>
          <div className={`flex h-6 w-6 items-center justify-center rounded transition-transform ${isOpen ? "rotate-180" : ""}`}>
            <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {/* Highlights List */}
        {isOpen && (
          <div className="space-y-3">
            {/* Compressed Positive Highlights Summary */}
            {positiveCount > 0 && (
              <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                      <svg className="h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                        {positiveCount} Positive Finding{positiveCount !== 1 ? 's' : ''}
                      </h4>
                      {!showAllPositives && positiveHighlights.length > 0 && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                          {positiveHighlights[0].title}: {positiveHighlights[0].description}
                        </p>
                      )}
                      {showAllPositives && (
                        <div className="space-y-2 mt-2">
                          {positiveHighlights.map((highlight) => (
                            <div key={highlight.id} className="text-xs text-gray-600 dark:text-gray-400">
                              <span className="font-semibold">{highlight.title}:</span> {highlight.description}
                            </div>
                          ))}
                        </div>
                      )}
                      {positiveCount > 1 && (
                        <button
                          onClick={() => setShowAllPositives(!showAllPositives)}
                          className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                        >
                          {showAllPositives ? 'Show less' : `View all ${positiveCount} positives`}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Warning/Negative Highlights - Full Display */}
            {warningHighlights.map((highlight) => {
              const config = getHighlightConfig(highlight.type);
              const isExpanded = expandedId === highlight.id;
              
              return (
                <div
                  key={highlight.id}
                  className={`rounded-xl border ${config.border} ${config.bg} p-4 transition-all hover:shadow-sm`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${config.iconBg}`}>
                      <span className="text-base">{highlight.icon}</span>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="mb-1.5 flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                          {highlight.title}
                        </h4>
                        <span className={`rounded-full ${config.badgeBg} px-2.5 py-0.5 text-xs font-semibold text-white`}>
                          {config.badgeText}
                        </span>
                      </div>
                      <p className={`text-xs leading-relaxed text-gray-600 dark:text-gray-400 ${
                        isExpanded ? "" : "line-clamp-2"
                      }`}>
                        {highlight.description}
                      </p>
                      
                      {/* Expand/Collapse Button */}
                      {highlight.description.length > 100 && (
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : highlight.id)}
                          className="mt-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                        >
                          {isExpanded ? "Show less" : "Read more"}
                        </button>
                      )}
                    </div>
                    
                    {/* Status Indicator */}
                    <div className="flex-shrink-0">
                      {highlight.type === "warning" && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500">
                          <svg className="h-3.5 w-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      {highlight.type === "negative" && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500">
                          <svg className="h-3.5 w-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
