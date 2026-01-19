"use client";

import { SortOption } from "@/types/marketplace";

interface SortOptionsProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "trust-high", label: "Trust Score: High to Low" },
  { value: "trust-low", label: "Trust Score: Low to High" },
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
];

export default function SortOptions({
  sortBy,
  onSortChange,
}: SortOptionsProps) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        Sort by:
      </label>
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value as SortOption)}
        className="rounded-xl border-2 border-gray-200/50 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md px-4 py-2.5 text-sm font-medium text-gray-900 shadow-md transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 hover:shadow-lg dark:border-gray-700/50 dark:text-white"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
