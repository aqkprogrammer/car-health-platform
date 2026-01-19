"use client";

import { useState } from "react";
import { PhotoType } from "@/types/car";

interface UploadGuidanceProps {
  photoType: PhotoType;
  isUploaded: boolean;
}

const GUIDANCE: Record<PhotoType, { title: string; instructions: string[]; tips: string[] }> = {
  front: {
    title: "Front View",
    instructions: [
      "Stand directly in front of the car",
      "Ensure the entire front bumper and grille are visible",
      "Include both headlights in the frame",
      "Take photo in good lighting",
    ],
    tips: [
      "Avoid shadows covering the front",
      "Make sure license plate is visible",
      "Keep camera level with the car",
    ],
  },
  rear: {
    title: "Rear View",
    instructions: [
      "Stand directly behind the car",
      "Capture the entire rear bumper and tail lights",
      "Include the rear windshield",
      "Ensure good visibility of the rear",
    ],
    tips: [
      "Check that brake lights are visible",
      "Include the rear license plate",
      "Avoid reflections on windows",
    ],
  },
  left: {
    title: "Left Side",
    instructions: [
      "Stand parallel to the left side of the car",
      "Capture the entire side profile",
      "Include both front and rear wheels",
      "Show the full length of the vehicle",
    ],
    tips: [
      "Keep the car centered in frame",
      "Show door panels clearly",
      "Include side mirrors if visible",
    ],
  },
  right: {
    title: "Right Side",
    instructions: [
      "Stand parallel to the right side of the car",
      "Capture the entire side profile",
      "Include both front and rear wheels",
      "Show the full length of the vehicle",
    ],
    tips: [
      "Keep the car centered in frame",
      "Show door panels clearly",
      "Include side mirrors if visible",
    ],
  },
  interior: {
    title: "Interior",
    instructions: [
      "Open all doors for better lighting",
      "Capture the dashboard and seats",
      "Show the steering wheel and center console",
      "Include front and rear seats if possible",
    ],
    tips: [
      "Clean the interior before photographing",
      "Remove personal items for better view",
      "Show the condition of seats and upholstery",
    ],
  },
  engineBay: {
    title: "Engine Bay",
    instructions: [
      "Open the hood completely",
      "Ensure good lighting inside the engine bay",
      "Capture the entire engine area",
      "Show all visible components clearly",
    ],
    tips: [
      "Clean visible areas before photographing",
      "Show battery, belts, and hoses",
      "Avoid shadows on important components",
    ],
  },
};

export default function UploadGuidance({ photoType, isUploaded }: UploadGuidanceProps) {
  const [isOpen, setIsOpen] = useState(false);
  const guidance = GUIDANCE[photoType];

  if (isUploaded) {
    return null;
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg bg-blue-50 px-3 py-2 text-left text-sm text-blue-700 transition-colors hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30"
      >
        <span className="flex items-center gap-2">
          <span>ℹ️</span>
          <span className="font-medium">How to take a good {guidance.title} photo</span>
        </span>
        <span className={isOpen ? "rotate-180" : ""}>▼</span>
      </button>
      {isOpen && (
        <div className="mt-2 rounded-lg border border-blue-200 bg-white p-4 dark:border-blue-800 dark:bg-gray-800">
          <h4 className="mb-3 font-semibold text-gray-900 dark:text-white">
            Instructions:
          </h4>
          <ul className="mb-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
            {guidance.instructions.map((instruction, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="mt-0.5 text-blue-600 dark:text-blue-400">•</span>
                <span>{instruction}</span>
              </li>
            ))}
          </ul>
          <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">
            Tips:
          </h4>
          <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
            {guidance.tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="mt-0.5">✓</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
