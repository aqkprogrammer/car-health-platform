"use client";

import { useState } from "react";

interface SampleImage {
  type: string;
  label: string;
  description: string;
  example: string; // Emoji or icon representation
}

const SAMPLE_IMAGES: SampleImage[] = [
  {
    type: "front",
    label: "Front View",
    description: "Full front bumper, grille, and headlights visible",
    example: "🚗",
  },
  {
    type: "rear",
    label: "Rear View",
    description: "Complete rear with tail lights and bumper",
    example: "🚙",
  },
  {
    type: "side",
    label: "Side View",
    description: "Full side profile showing entire car length",
    example: "🚘",
  },
  {
    type: "interior",
    label: "Interior",
    description: "Dashboard, seats, and console clearly visible",
    example: "🪑",
  },
  {
    type: "engine",
    label: "Engine Bay",
    description: "Well-lit engine bay with all components visible",
    example: "⚙️",
  },
];

export default function SampleImages() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">📸</span>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Sample Photos - What Good Looks Like
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              See examples of well-captured car photos
            </p>
          </div>
        </div>
        <span className={`transition-transform ${isOpen ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="border-t border-gray-200 p-4 dark:border-gray-700">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SAMPLE_IMAGES.map((sample) => (
              <div
                key={sample.type}
                className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-2xl">{sample.example}</span>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {sample.label}
                  </h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {sample.description}
                </p>
                {/* Placeholder for actual sample images */}
                <div className="mt-3 flex h-24 items-center justify-center rounded bg-gray-100 dark:bg-gray-700">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Sample image placeholder
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-semibold">💡 Remember:</span> Good photos
              are clear, well-lit, and show the entire area without obstructions.
              Avoid blurry images, shadows, or partial views.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
