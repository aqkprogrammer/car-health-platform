"use client";

import { useState, useEffect } from "react";
import { VERDICT_CONFIG } from "@/types/report";

interface TrustScoreBreakdownProps {
  trustScore: number;
  breakdown?: {
    exterior: number;
    engine: number;
    interior?: number;
    transmission?: number;
  };
}

export default function TrustScoreBreakdown({
  trustScore,
  breakdown,
}: TrustScoreBreakdownProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Animate score from 0 to trustScore
    const duration = 1500;
    const steps = 60;
    const increment = trustScore / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= trustScore) {
        setAnimatedScore(trustScore);
        clearInterval(timer);
      } else {
        setAnimatedScore(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [trustScore]);

  const getVerdict = (score: number) => {
    if (score >= 80) return "excellent";
    if (score >= 60) return "good";
    return "risky";
  };

  const verdict = getVerdict(trustScore);
  const verdictConfig = VERDICT_CONFIG[verdict];

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-blue-600 dark:text-blue-400";
    if (score >= 40) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-blue-500";
    if (score >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getCircleColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-blue-500";
    if (score >= 40) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200/50 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 dark:from-slate-800 dark:via-slate-800/50 dark:to-indigo-950/30 backdrop-blur-xl p-6 shadow-lg dark:border-gray-700/50">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-2xl"></div>
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-purple-400/10 to-pink-400/10 rounded-full blur-2xl"></div>
      
      <div className="relative z-10">
        <div className="mb-6 text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Trust Score
            </h3>
          </div>
          <div className="mb-4">
            <div className="relative inline-block">
              <div 
                className="relative cursor-help"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <svg className="h-28 w-28 -rotate-90 transform drop-shadow-lg">
                  <circle
                    cx="56"
                    cy="56"
                    r="48"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r="48"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={`${(animatedScore / 100) * 301.59} 301.59`}
                    strokeLinecap="round"
                    className={`${getCircleColor(trustScore)} transition-all duration-300 drop-shadow-lg`}
                    style={{ 
                      filter: 'drop-shadow(0 0 6px currentColor)',
                      transition: 'stroke-dasharray 0.1s ease-out'
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-3xl font-black ${getScoreColor(trustScore)}`}>
                    {Math.round(animatedScore)}
                  </span>
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">/ 100</span>
                </div>
                
                {/* Tooltip */}
                {showTooltip && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 w-64 rounded-lg bg-gray-900 dark:bg-gray-800 px-3 py-2 text-xs text-white shadow-xl border border-gray-700">
                    <p className="font-semibold mb-1">AI-Powered Trust Score</p>
                    <p className="text-gray-300">Based on comprehensive vehicle inspection including exterior, engine, interior, and transmission analysis.</p>
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-gray-900 dark:bg-gray-800 border-l border-t border-gray-700"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 shadow-md ${verdictConfig.bgColor}`}
          >
            <span className="text-lg">{verdictConfig.icon}</span>
            <span className={`font-bold text-xs ${verdictConfig.color}`}>
              {verdictConfig.label}
            </span>
          </div>
        </div>

        {/* Breakdown */}
        {breakdown && (
          <div className="space-y-4 border-t border-gray-200/50 pt-5 dark:border-gray-700/50">
            <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Score Breakdown
            </h4>
            {Object.entries(breakdown).map(([key, score]) => (
              <div key={key} className="group">
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 capitalize font-semibold text-gray-700 dark:text-gray-300">
                    <div className={`h-1.5 w-1.5 rounded-full ${getProgressColor(score)}`}></div>
                    {key}
                  </span>
                  <span className={`font-bold text-sm ${getScoreColor(score)}`}>
                    {Math.round(score)}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200/50 dark:bg-gray-700/50 shadow-inner">
                  <div
                    className={`h-full transition-all duration-700 ease-out rounded-full shadow-sm ${getProgressColor(score)}`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
