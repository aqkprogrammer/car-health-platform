"use client";

export type BodyType = "sedan" | "suv" | "hatchback" | "coupe" | "sport";

interface BodyTypeFilterProps {
  selectedType: BodyType | null;
  onTypeChange: (type: BodyType | null) => void;
}

const BODY_TYPES: { type: BodyType; label: string; icon: string }[] = [
  { type: "sedan", label: "Sedan", icon: "🚗" },
  { type: "suv", label: "SUV", icon: "🚙" },
  { type: "hatchback", label: "Hatchback", icon: "🚐" },
  { type: "coupe", label: "Coupe", icon: "🏎️" },
  { type: "sport", label: "Sport cars", icon: "💨" },
];

export default function BodyTypeFilter({
  selectedType,
  onTypeChange,
}: BodyTypeFilterProps) {
  return (
    <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
      {BODY_TYPES.map(({ type, label, icon }) => (
        <button
          key={type}
          onClick={() => onTypeChange(selectedType === type ? null : type)}
            className={`
            flex items-center gap-2 px-4 py-3 rounded-xl transition-all flex-shrink-0
            ${
              selectedType === type
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-2 border-blue-600 shadow-lg dark:from-blue-500 dark:to-indigo-500"
                : "bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md"
            }
          `}
        >
          <span className="text-xl">{icon}</span>
          <span className="font-medium text-sm whitespace-nowrap">{label}</span>
        </button>
      ))}
    </div>
  );
}
