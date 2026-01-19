"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  PhotoType,
  UploadedFile,
  MediaUploadData,
} from "@/types/car";
import { validateFile } from "@/lib/utils/validation";
import { getVideoMetadata, DEFAULT_CAR_IMAGE, handleImageError } from "@/lib/utils/media";
import { useMediaValidation, getChecklistFromValidation } from "@/hooks/useMediaValidation";
import { MediaChecklistResponse } from "@/lib/api/media";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import UploadGuidance from "@/components/ui/UploadGuidance";
import MediaChecklist from "./MediaChecklist";

interface MediaUploadFormProps {
  onSubmit: (data: MediaUploadData) => void;
  initialData?: MediaUploadData;
  isLoading?: boolean;
  checklist?: MediaChecklistResponse | null;
}

const PHOTO_TYPES: { type: PhotoType; label: string; icon: string }[] = [
  { type: "front", label: "Front View", icon: "🚗" },
  { type: "rear", label: "Rear View", icon: "🚙" },
  { type: "left", label: "Left Side", icon: "🚘" },
  { type: "right", label: "Right Side", icon: "🚖" },
  { type: "interior", label: "Interior", icon: "🪑" },
  { type: "engineBay", label: "Engine Bay", icon: "⚙️" },
];

export default function MediaUploadForm({
  onSubmit,
  initialData,
  isLoading = false,
  checklist: apiChecklist,
}: MediaUploadFormProps) {
  const [uploads, setUploads] = useState<MediaUploadData>(
    initialData || {
      photos: {
        front: null,
        rear: null,
        left: null,
        right: null,
        interior: null,
        engineBay: null,
      },
      video: null,
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const { checkRequiredMedia } = useMediaValidation();

  // Update validation when uploads change
  const validation = checkRequiredMedia(
    Object.values(uploads.photos)
      .filter((p): p is UploadedFile => p !== null)
      .map((p) => ({ type: 'photo' as const, photoType: p.type as PhotoType }))
      .concat(uploads.video ? [{ type: 'video' as const }] : [])
  );

  // Use API checklist if available, otherwise generate from validation
  // Note: The checklist tracks what's uploaded, not what's required
  // So we need to check uploaded media against the API checklist
  const checklist = apiChecklist 
    ? {
        photos: {
          front: !validation.missingPhotos.includes('front'),
          rear: !validation.missingPhotos.includes('rear'),
          left: !validation.missingPhotos.includes('left'),
          right: !validation.missingPhotos.includes('right'),
          interior: !validation.missingPhotos.includes('interior'),
          engineBay: !validation.missingPhotos.includes('engineBay'),
        },
        video: validation.hasVideo || false,
      }
    : getChecklistFromValidation(validation);

  const handleFileSelect = useCallback(
    async (
      type: PhotoType | "video",
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const isVideo = type === "video";

      // Validate file using comprehensive validation
      let duration: number | undefined;
      if (isVideo) {
        try {
          const metadata = await getVideoMetadata(file);
          duration = metadata.duration;
        } catch (err) {
          setErrors((prev) => ({
            ...prev,
            [type]: "Error reading video file",
          }));
          return;
        }
      }

      const validation = validateFile({
        file,
        isVideo,
        checkDuration: isVideo,
        duration,
      });

      if (!validation.valid) {
        setErrors((prev) => ({ ...prev, [type]: validation.error || "Invalid file" }));
        return;
      }

      // Clear error
      setErrors((prev => {
        const newErrors = { ...prev };
        delete newErrors[type];
        return newErrors;
      }));

      // Create preview
      const preview = URL.createObjectURL(file);

      const uploadedFile: UploadedFile = {
        id: `${type}-${Date.now()}`,
        file,
        preview,
        type,
        progress: 0,
      };

      // Update state immediately (file is selected, not uploaded yet)
      // Actual upload happens when form is submitted
      if (isVideo) {
        setUploads((prev) => ({ ...prev, video: uploadedFile }));
      } else {
        setUploads((prev) => ({
          ...prev,
          photos: { ...prev.photos, [type]: uploadedFile },
        }));
      }
    },
    []
  );

  const handleRemove = (type: PhotoType | "video") => {
    if (type === "video") {
      if (uploads.video?.preview) {
        URL.revokeObjectURL(uploads.video.preview);
      }
      setUploads((prev) => ({ ...prev, video: null }));
    } else {
      if (uploads.photos[type]?.preview) {
        URL.revokeObjectURL(uploads.photos[type]!.preview);
      }
      setUploads((prev) => ({
        ...prev,
        photos: { ...prev.photos, [type]: null },
      }));
    }
    // Clear error
    setErrors((prev => {
      const newErrors = { ...prev };
      delete newErrors[type];
      return newErrors;
    }));
    // Reset file input
    if (fileInputRefs.current[type]) {
      fileInputRefs.current[type]!.value = "";
    }
  };

  const handleReplace = (type: PhotoType | "video") => {
    fileInputRefs.current[type]?.click();
  };

  const getMissingPhotos = (): PhotoType[] => {
    return (Object.keys(uploads.photos) as PhotoType[]).filter(
      (type) => uploads.photos[type] === null
    );
  };

  const missingPhotos = getMissingPhotos();
  const uploadedPhotosCount = 6 - missingPhotos.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate using validation hook
    if (!validation.canSubmit) {
      setErrors((prev) => ({
        ...prev,
        general: "Please upload at least one car photo to continue",
      }));
      return;
    }

    setErrors({});
    onSubmit(uploads);
  };

  const renderPhotoUpload = (photoType: PhotoType) => {
    const photo = uploads.photos[photoType];
    const error = errors[photoType];

    return (
      <div key={photoType} className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {PHOTO_TYPES.find((p) => p.type === photoType)?.label}
        </label>
        <div className="relative">
          <input
            ref={(el) => {
              fileInputRefs.current[photoType] = el;
            }}
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={(e) => handleFileSelect(photoType, e)}
            className="hidden"
            disabled={isLoading}
          />
          {photo ? (
            <div className="group relative overflow-hidden rounded-lg border-2 border-gray-300 dark:border-gray-600">
              <img
                src={photo.preview || DEFAULT_CAR_IMAGE}
                alt={PHOTO_TYPES.find((p) => p.type === photoType)?.label}
                className="h-48 w-full object-cover"
                onError={(e) => handleImageError(e, DEFAULT_CAR_IMAGE)}
              />
              {/* Overlay buttons */}
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => handleReplace(photoType)}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                  disabled={isLoading}
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(photoType)}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
                  disabled={isLoading}
                >
                  Remove
                </button>
              </div>
              {/* File info badge */}
              <div className="absolute top-2 right-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
                {photo.file.name.length > 20 
                  ? `${photo.file.name.substring(0, 20)}...` 
                  : photo.file.name}
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRefs.current[photoType]?.click()}
              disabled={isLoading}
              className="flex h-48 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-blue-500 hover:bg-blue-50/50 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-blue-400"
            >
              <span className="mb-2 text-4xl">
                {PHOTO_TYPES.find((p) => p.type === photoType)?.icon}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Click to upload
              </span>
              <span className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                JPG or PNG (max 10MB)
              </span>
            </button>
          )}
        </div>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        <UploadGuidance photoType={photoType} isUploaded={!!photo} />
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Media Checklist */}
      <MediaChecklist 
        checklist={checklist} 
        validation={validation} 
        showProgress={true}
        apiChecklist={apiChecklist}
      />

      {/* Photos Section */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Car Photos
          </h2>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {uploadedPhotosCount} of 6 uploaded
          </span>
        </div>

        {/* Missing Photos Warning */}
        {missingPhotos.length > 0 && (
          <div className="mb-4 rounded-lg border border-yellow-300 bg-yellow-50 p-4 dark:border-yellow-700 dark:bg-yellow-900/20">
            <div className="flex items-start gap-3">
              <span className="text-xl">⚠️</span>
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-300">
                  Missing Required Photos
                </h3>
                <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-400">
                  Please upload the following photos for a complete report:
                </p>
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-yellow-700 dark:text-yellow-400">
                  {missingPhotos.map((type) => (
                    <li key={type}>
                      {PHOTO_TYPES.find((p) => p.type === type)?.label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PHOTO_TYPES.map((photoType) => renderPhotoUpload(photoType.type))}
        </div>
        {errors.general && (
          <p className="mt-4 text-sm text-red-600 dark:text-red-400">
            {errors.general}
          </p>
        )}
      </div>

      {/* Video Section */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          Engine Sound Video
        </h2>
        <div className="space-y-2">
          <input
            ref={(el) => {
              fileInputRefs.current.video = el;
            }}
            type="file"
            accept="video/mp4"
            onChange={(e) => handleFileSelect("video", e)}
            className="hidden"
            disabled={isLoading}
          />
          {uploads.video ? (
            <div className="group relative overflow-hidden rounded-lg border-2 border-gray-300 dark:border-gray-600">
              <video
                src={uploads.video.preview}
                controls
                className="h-64 w-full object-cover"
              />
              {/* Overlay buttons */}
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => handleReplace("video")}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                  disabled={isLoading}
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove("video")}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
                  disabled={isLoading}
                >
                  Remove
                </button>
              </div>
              {/* File info badge */}
              <div className="absolute top-2 right-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
                {uploads.video.file.name.length > 20 
                  ? `${uploads.video.file.name.substring(0, 20)}...` 
                  : uploads.video.file.name}
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRefs.current.video?.click()}
              disabled={isLoading}
              className="flex h-64 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-blue-500 hover:bg-blue-50/50 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-blue-400"
            >
              <span className="mb-2 text-4xl">🎥</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Click to upload video
              </span>
              <span className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                MP4 (10-20 seconds, max 50MB)
              </span>
            </button>
          )}
        </div>
        {errors.video && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {errors.video}
          </p>
        )}
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Record the engine sound for 10-20 seconds to help assess the
          vehicle's condition
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-base font-semibold text-white transition-all hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" />
              Uploading...
            </>
          ) : (
            "Save & Continue"
          )}
        </button>
      </div>
    </form>
  );
}
