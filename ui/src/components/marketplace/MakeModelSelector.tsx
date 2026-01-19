"use client";

import { useState, useRef, useEffect } from "react";

interface MakeModel {
  make: string;
  models: string[];
}

interface MakeModelSelectorProps {
  availableMakes: MakeModel[];
  selectedMakes: string[];
  selectedModels: Record<string, string[]>; // { make: [model1, model2, ...] }
  onSelectionChange: (makes: string[], models: Record<string, string[]>) => void;
}

// Brand logo mapping - using text-based logos for common brands
const getBrandLogo = (make: string): { text: string; bgColor: string; textColor: string } => {
  const logos: Record<string, { text: string; bgColor: string; textColor: string }> = {
    "Mercedes-Benz": { text: "MB", bgColor: "bg-gray-800", textColor: "text-white" },
    "BMW": { text: "BMW", bgColor: "bg-blue-600", textColor: "text-white" },
    "Lexus": { text: "L", bgColor: "bg-gray-700", textColor: "text-white" },
    "Audi": { text: "A", bgColor: "bg-gray-900", textColor: "text-white" },
    "Toyota": { text: "T", bgColor: "bg-red-600", textColor: "text-white" },
    "Honda": { text: "H", bgColor: "bg-gray-800", textColor: "text-white" },
    "Ford": { text: "F", bgColor: "bg-blue-700", textColor: "text-white" },
    "Volkswagen": { text: "VW", bgColor: "bg-blue-800", textColor: "text-white" },
    "Porsche": { text: "P", bgColor: "bg-red-700", textColor: "text-white" },
    "Ferrari": { text: "F", bgColor: "bg-red-600", textColor: "text-white" },
    "Lamborghini": { text: "L", bgColor: "bg-yellow-500", textColor: "text-black" },
    "Tesla": { text: "T", bgColor: "bg-gray-900", textColor: "text-white" },
  };
  return logos[make] || { 
    text: make.substring(0, 2).toUpperCase(), 
    bgColor: "bg-gray-200", 
    textColor: "text-gray-700" 
  };
};

export default function MakeModelSelector({
  availableMakes,
  selectedMakes,
  selectedModels,
  onSelectionChange,
}: MakeModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredMakes = availableMakes.filter((item) =>
    item.make.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleMake = (make: string) => {
    if (selectedMakes.includes(make)) {
      // Remove make and all its models
      const newMakes = selectedMakes.filter((m) => m !== make);
      const newModels = { ...selectedModels };
      delete newModels[make];
      onSelectionChange(newMakes, newModels);
    } else {
      // Add make
      onSelectionChange([...selectedMakes, make], selectedModels);
    }
  };

  const toggleModel = (make: string, model: string) => {
    const makeModels = selectedModels[make] || [];
    if (makeModels.includes(model)) {
      // Remove model
      const newModels = { ...selectedModels };
      newModels[make] = makeModels.filter((m) => m !== model);
      if (newModels[make].length === 0) {
        delete newModels[make];
        // Also remove make if no models selected
        const newMakes = selectedMakes.filter((m) => m !== make);
        onSelectionChange(newMakes, newModels);
      } else {
        onSelectionChange(selectedMakes, newModels);
      }
    } else {
      // Add model (and make if not already selected)
      const newMakes = selectedMakes.includes(make) ? selectedMakes : [...selectedMakes, make];
      const newModels = {
        ...selectedModels,
        [make]: [...makeModels, model],
      };
      onSelectionChange(newMakes, newModels);
    }
  };

  const removeMake = (make: string) => {
    const newMakes = selectedMakes.filter((m) => m !== make);
    const newModels = { ...selectedModels };
    delete newModels[make];
    onSelectionChange(newMakes, newModels);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected Makes/Models Display */}
      {selectedMakes.length > 0 && (
        <div className="space-y-2 mb-4">
          {selectedMakes.map((make) => {
            const models = selectedModels[make] || [];
            const makeData = availableMakes.find((m) => m.make === make);
            if (!makeData) return null;

            return (
              <div
                key={make}
                className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-200 shadow-sm"
              >
                {/* Brand Logo */}
                {(() => {
                  const logo = getBrandLogo(make);
                  return (
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${logo.bgColor} shadow-sm`}>
                      <span className={`text-xs font-bold ${logo.textColor}`}>
                        {logo.text}
                      </span>
                    </div>
                  );
                })()}

                {/* Make and Models */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-gray-900">{make}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {models.slice(0, 3).map((model) => (
                      <span
                        key={model}
                        className="text-xs text-gray-700 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-200 font-medium"
                      >
                        {model}
                      </span>
                    ))}
                    {models.length > 3 && (
                      <span className="text-xs text-gray-500 px-2.5 py-1 font-medium">
                        +{models.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeMake(make)}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1"
                  aria-label={`Remove ${make}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Model Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2 dark:from-blue-500 dark:to-indigo-500"
      >
        <span>+</span>
        <span>Add model</span>
      </button>

      {/* Dropdown Modal */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden flex flex-col">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search make..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>

          {/* Makes List */}
          <div className="overflow-y-auto flex-1">
            {filteredMakes.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">No makes found</div>
            ) : (
              filteredMakes.map((makeData) => {
                const isMakeSelected = selectedMakes.includes(makeData.make);
                const selectedModelsForMake = selectedModels[makeData.make] || [];

                return (
                  <div key={makeData.make} className="border-b border-gray-100 last:border-b-0">
                    {/* Make Header */}
                    <button
                      onClick={() => toggleMake(makeData.make)}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {(() => {
                          const logo = getBrandLogo(makeData.make);
                          return (
                            <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${logo.bgColor}`}>
                              <span className={`text-xs font-bold ${logo.textColor}`}>
                                {logo.text}
                              </span>
                            </div>
                          );
                        })()}
                        <span className="text-sm font-medium text-gray-900">
                          {makeData.make}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedModelsForMake.length > 0 && (
                          <span className="text-xs text-gray-500">
                            {selectedModelsForMake.length} selected
                          </span>
                        )}
                        <svg
                          className={`w-5 h-5 text-gray-400 transition-transform ${
                            isMakeSelected ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </button>

                    {/* Models List (shown when make is selected) */}
                    {isMakeSelected && (
                      <div className="bg-gray-50 px-4 py-2 space-y-1 max-h-48 overflow-y-auto">
                        {makeData.models.map((model) => {
                          const isModelSelected = selectedModelsForMake.includes(model);
                          return (
                            <button
                              key={model}
                              onClick={() => toggleModel(makeData.make, model)}
                              className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                                isModelSelected
                                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-300 font-medium"
                                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {isModelSelected && (
                                  <svg
                                    className="w-4 h-4 text-blue-600 dark:text-blue-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                )}
                                <span>{model}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
