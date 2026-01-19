"use client";

import { ChatMessage, ChatParticipant } from "@/types/chat";
import Link from "next/link";
import { DEFAULT_IMAGE, handleImageError } from "@/lib/utils/media";

interface MessageBubbleProps {
  message: ChatMessage;
  sender: ChatParticipant;
  isOwnMessage: boolean;
}

export default function MessageBubble({
  message,
  sender,
  isOwnMessage,
}: MessageBubbleProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sending":
        return "⏳";
      case "sent":
        return "✓";
      case "delivered":
        return "✓✓";
      case "read":
        return "✓✓";
      default:
        return "";
    }
  };

  const getStatusColor = (status: string) => {
    if (status === "read") return "text-blue-600 dark:text-blue-400";
    return "text-gray-500 dark:text-gray-400";
  };

  return (
    <div
      className={`flex gap-2 ${isOwnMessage ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      {!isOwnMessage && (
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
          {sender.name.charAt(0).toUpperCase()}
        </div>
      )}

      {/* Message Content */}
      <div className={`flex max-w-[70%] flex-col ${isOwnMessage ? "items-end" : "items-start"}`}>
        {/* Sender Name (for received messages) */}
        {!isOwnMessage && (
          <span className="mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">
            {sender.name}
          </span>
        )}

        {/* Message Bubble */}
        <div
          className={`rounded-2xl px-4 py-2 ${
            isOwnMessage
              ? "bg-blue-600 text-white dark:bg-blue-500"
              : "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
          }`}
        >
          {/* Text Message */}
          {message.type === "text" && (
            <p className="break-words text-sm">{message.content}</p>
          )}

          {/* Image Message */}
          {message.type === "image" && (
            <div className="space-y-2">
              <img
                src={message.content || DEFAULT_IMAGE}
                alt="Shared image"
                className="max-w-full rounded-lg"
                onError={(e) => handleImageError(e, DEFAULT_IMAGE)}
              />
              {message.imagePreview && message.imagePreview !== message.content && (
                <p className="text-xs opacity-75">{message.content}</p>
              )}
            </div>
          )}

          {/* Report Reference */}
          {message.type === "report" && message.reportReference && (
            <div className="space-y-2">
              <div className="rounded-lg border-2 border-white/30 bg-white/10 p-3">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-lg">📊</span>
                  <span className="font-semibold">Car Health Report</span>
                </div>
                <p className="text-sm opacity-90">
                  {message.reportReference.carMake}{" "}
                  {message.reportReference.carModel}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs opacity-75">Trust Score:</span>
                  <span className="font-semibold">
                    {message.reportReference.trustScore}%
                  </span>
                </div>
              </div>
              <Link
                href={`/reports/${message.reportReference.reportId}`}
                className="block text-xs underline opacity-75"
              >
                View Full Report →
              </Link>
            </div>
          )}
        </div>

        {/* Timestamp and Status */}
        <div
          className={`mt-1 flex items-center gap-2 text-xs ${isOwnMessage ? "flex-row-reverse" : ""}`}
        >
          <span className="text-gray-500 dark:text-gray-400">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {isOwnMessage && (
            <span className={getStatusColor(message.status)}>
              {getStatusIcon(message.status)}
            </span>
          )}
          {message.readAt && isOwnMessage && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Read {new Date(message.readAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
