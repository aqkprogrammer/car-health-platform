"use client";

import { RequiredMediaChecklist, MediaValidationResult } from "@/hooks/useMediaValidation";
import { MediaChecklistResponse } from "@/lib/api/media";
import { PhotoType } from "@/types/car";

interface MediaChecklistProps {
  checklist?: RequiredMediaChecklist;
  validation?: MediaValidationResult;
  showProgress?: boolean;
  apiChecklist?: MediaChecklistResponse | null;
}

const PHOTO_LABELS: Record<PhotoType, string> = {
  front: "Front View",
  rear: "Rear View",
  left: "Left Side",
  right: "Right Side",
  interior: "Interior",
  engineBay: "Engine Bay",
};

export default function MediaChecklist({
  checklist,
  validation,
  showProgress = true,
  apiChecklist,
}: MediaChecklistProps) {
  if (!checklist && !validation) {
    return null;
  }

  // Generate checklist from validation if not provided
  const finalChecklist: RequiredMediaChecklist = checklist || {
    photos: {
      front: !validation?.missingPhotos.includes("front"),
      rear: !validation?.missingPhotos.includes("rear"),
      left: !validation?.missingPhotos.includes("left"),
      right: !validation?.missingPhotos.includes("right"),
      interior: !validation?.missingPhotos.includes("interior"),
      engineBay: !validation?.missingPhotos.includes("engineBay"),
    },
    video: validation?.hasVideo || false,
  };

  const completionPercentage = validation?.completionPercentage || 0;
  const allPhotosComplete = Object.values(finalChecklist.photos).every((v) => v);
  const allComplete = allPhotosComplete && finalChecklist.video;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Required Media Checklist
        </h3>
        {showProgress && validation && (
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            {completionPercentage}% Complete
          </span>
        )}
      </div>

      {/* Progress Bar */}
      {showProgress && validation && (
        <div className="mb-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full bg-blue-600 transition-all duration-300 dark:bg-blue-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Photos Checklist */}
      <div className="mb-3">
        <h4 className="mb-2 text-xs font-medium text-gray-700 dark:text-gray-300">
          Photos ({Object.values(finalChecklist.photos).filter(Boolean).length}/6)
        </h4>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {(Object.entries(finalChecklist.photos) as [PhotoType, boolean][]).map(
            ([type, uploaded]) => {
              const apiPhoto = apiChecklist?.requiredPhotos.find(p => p.type === type);
              return (
                <div
                  key={type}
                  className={`flex flex-col gap-1 rounded px-2 py-1 text-xs ${
                    uploaded
                      ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                      : "bg-gray-50 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400"
                  }`}
                  title={apiPhoto?.description}
                >
                  <div className="flex items-center gap-2">
                    <span>{uploaded ? "✓" : "○"}</span>
                    <span className="font-medium">{apiPhoto?.label || PHOTO_LABELS[type]}</span>
                  </div>
                  {apiPhoto?.description && (
                    <span className="text-[10px] opacity-75 line-clamp-1">
                      {apiPhoto.description}
                    </span>
                  )}
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* Video Checklist */}
      <div>
        <div
          className={`flex flex-col gap-1 rounded px-2 py-1 text-xs ${
            finalChecklist.video
              ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
              : "bg-gray-50 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400"
          }`}
          title={apiChecklist?.requiredVideo.description}
        >
          <div className="flex items-center gap-2">
            <span>{finalChecklist.video ? "✓" : "○"}</span>
            <span className="font-medium">
              Engine Sound Video {apiChecklist?.requiredVideo.isRequired ? "(Required)" : "(Optional)"}
            </span>
          </div>
          {apiChecklist?.requiredVideo.description && (
            <span className="text-[10px] opacity-75">
              {apiChecklist.requiredVideo.description}
            </span>
          )}
        </div>
      </div>

      {/* Guidance Tips */}
      {apiChecklist?.guidance && (
        <div className="mt-4 space-y-2 border-t border-gray-200 pt-3 dark:border-gray-700">
          {apiChecklist.guidance.photoTips && apiChecklist.guidance.photoTips.length > 0 && (
            <div>
              <h5 className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                Photo Tips:
              </h5>
              <ul className="space-y-1 text-[10px] text-gray-600 dark:text-gray-400">
                {apiChecklist.guidance.photoTips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-1">
                    <span>•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {apiChecklist.guidance.videoTips && apiChecklist.guidance.videoTips.length > 0 && (
            <div>
              <h5 className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                Video Tips:
              </h5>
              <ul className="space-y-1 text-[10px] text-gray-600 dark:text-gray-400">
                {apiChecklist.guidance.videoTips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-1">
                    <span>•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Status Message */}
      {validation && (
        <div className="mt-4">
          {allComplete ? (
            <p className="text-xs font-medium text-green-700 dark:text-green-400">
              ✓ All required media uploaded
            </p>
          ) : validation.canSubmit ? (
            <p className="text-xs font-medium text-yellow-700 dark:text-yellow-400">
              ⚠ You can proceed, but uploading all photos is recommended
            </p>
          ) : (
            <p className="text-xs font-medium text-red-700 dark:text-red-400">
              ✗ Please upload at least one photo to continue
            </p>
          )}
        </div>
      )}
    </div>
  );
}
