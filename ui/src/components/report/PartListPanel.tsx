"use client";

import React, { useState } from "react";

export interface PartItem {
  id: string;
  name: string;
  score?: number;
  hasSubParts?: boolean;
  side?: "left" | "right" | "center";
  subParts?: PartItem[];
}

interface PartListPanelProps {
  parts: PartItem[];
  side: "left" | "right";
  selectedPart?: string | null;
  onPartClick?: (partId: string) => void;
  onExpand?: (partId: string) => void;
  expandedParts?: Set<string>;
}

export default function PartListPanel({
  parts,
  side,
  selectedPart,
  onPartClick,
  onExpand,
  expandedParts = new Set(),
}: PartListPanelProps) {
  const [localExpanded, setLocalExpanded] = useState<Set<string>>(new Set());

  const isExpanded = (partId: string) => {
    return expandedParts?.has(partId) || localExpanded.has(partId);
  };

  const toggleExpand = (partId: string) => {
    if (onExpand) {
      onExpand(partId);
    } else {
      setLocalExpanded((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(partId)) {
          newSet.delete(partId);
        } else {
          newSet.add(partId);
        }
        return newSet;
      });
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score) return "";
    if (score >= 4.0) return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
    if (score >= 3.0) return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
    if (score >= 2.0) return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300";
    return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
  };

  const renderPart = (part: PartItem, level = 0) => {
    const isSelected = selectedPart === part.id;
    const expanded = isExpanded(part.id);
    
    return (
      <div key={part.id}>
        <div
          className={`group flex items-center justify-between p-2 rounded-md cursor-pointer transition-all ${
            isSelected
              ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700"
              : level === 0
              ? "hover:bg-gray-50 dark:hover:bg-gray-800/50"
              : "hover:bg-gray-50/50 dark:hover:bg-gray-800/30"
          }`}
          onClick={() => onPartClick?.(part.id)}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {part.hasSubParts && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(part.id);
                }}
                className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400"
              >
                {expanded ? (
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 12H4"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                )}
              </button>
            )}
            {!part.hasSubParts && level > 0 && <div className="w-5" />}
            <span className={`text-sm font-medium text-gray-900 dark:text-white truncate ${level > 0 ? 'text-xs' : ''}`}>
              {level === 0 && part.hasSubParts ? `+ ${part.name}` : part.name}
            </span>
          </div>
          {part.score !== undefined && (
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap ml-2 ${getScoreColor(
                part.score
              )}`}
            >
              {part.score.toFixed(1)}
            </span>
          )}
        </div>
        {part.hasSubParts && expanded && part.subParts && (
          <div className="ml-4">
            {part.subParts.map((subPart) => renderPart(subPart, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`flex flex-col h-full ${side === "left" ? "pr-2" : "pl-2"}`}>
      <div className="space-y-0.5 overflow-y-auto max-h-[600px]">
        {parts.map((part) => renderPart(part))}
      </div>
    </div>
  );
}
