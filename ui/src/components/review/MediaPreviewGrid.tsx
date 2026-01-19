"use client";

import { PhotoType } from "@/types/car";
import { DEFAULT_CAR_IMAGE } from "@/lib/utils/media";

interface MediaItem {
  id: string;
  type: "photo" | "video";
  photoType?: PhotoType;
  storageUrl: string;
  thumbnailUrl?: string;
  fileName?: string;
}

interface MediaPreviewGridProps {
  media: MediaItem[];
  onEdit?: () => void;
  isLocked?: boolean;
}

const PHOTO_LABELS: Record<PhotoType, string> = {
  front: "Front View",
  rear: "Rear View",
  left: "Left Side",
  right: "Right Side",
  interior: "Interior",
  engineBay: "Engine Bay",
};

export default function MediaPreviewGrid({
  media,
  onEdit,
  isLocked = false,
}: MediaPreviewGridProps) {
  // Debug: Log media data
  console.log("MediaPreviewGrid - media array:", media);
  
  // Filter photos - handle both enum and string types
  const photos = media.filter((m) => {
    const type = m.type?.toLowerCase?.() || m.type;
    return type === "photo" || type === "PHOTO";
  }) as Array<MediaItem & { photoType: PhotoType }>;
  
  // Find video - handle both enum and string types
  const video = media.find((m) => {
    const type = m.type?.toLowerCase?.() || m.type;
    return type === "video" || type === "VIDEO";
  });
  
  console.log("MediaPreviewGrid - photos:", photos);
  console.log("MediaPreviewGrid - video:", video);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Photos & Video
        </h3>
        {onEdit && !isLocked && (
          <button
            onClick={onEdit}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Edit
          </button>
        )}
        {isLocked && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            🔒 Locked
          </span>
        )}
      </div>

      {/* Photos Grid */}
      {photos.length > 0 && (
        <div className="mb-6">
          <h4 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
            Photos ({photos.length})
          </h4>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="group relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <img
                  src={photo.thumbnailUrl || photo.storageUrl || DEFAULT_CAR_IMAGE}
                  alt={photo.photoType ? PHOTO_LABELS[photo.photoType] : "Car photo"}
                  className="h-32 w-full object-cover"
                  onError={(e) => {
                    const img = e.currentTarget;
                    const currentSrc = img.src;
                    
                    // Log error with proper serialization
                    console.error("Image load error:", {
                      photoId: photo.id,
                      photoType: photo.photoType,
                      thumbnailUrl: photo.thumbnailUrl || null,
                      storageUrl: photo.storageUrl || null,
                      currentSrc: currentSrc,
                      attemptedUrl: photo.thumbnailUrl || photo.storageUrl || "none",
                    });
                    
                    // Fallback to storageUrl if thumbnail fails, then to default image
                    if (photo.thumbnailUrl && currentSrc === photo.thumbnailUrl && photo.storageUrl) {
                      img.src = photo.storageUrl;
                    } else if (currentSrc !== DEFAULT_CAR_IMAGE) {
                      img.src = DEFAULT_CAR_IMAGE;
                    }
                  }}
                  onLoad={() => {
                    console.log("Image loaded successfully:", {
                      photoId: photo.id,
                      photoType: photo.photoType,
                      src: photo.thumbnailUrl || photo.storageUrl,
                    });
                  }}
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="flex h-full items-center justify-center">
                    <span className="text-xs font-medium text-white">
                      {photo.photoType ? PHOTO_LABELS[photo.photoType] : "Photo"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Video */}
      {video && (
        <div>
          <h4 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
            Engine Sound Video
          </h4>
          <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
            <video
              src={video.storageUrl}
              controls
              className="h-48 w-full object-cover sm:h-64"
            />
          </div>
        </div>
      )}

      {photos.length === 0 && !video && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No media uploaded
        </p>
      )}
    </div>
  );
}
