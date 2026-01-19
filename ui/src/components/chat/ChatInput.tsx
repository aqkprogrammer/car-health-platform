"use client";

import { useState, useRef } from "react";
import { MessageType } from "@/types/chat";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface ChatInputProps {
  onSendMessage: (content: string, type: MessageType) => void;
  onSendImage: (file: File) => void;
  onSendReport: (reportId: string) => void;
  isLoading?: boolean;
  availableReports?: Array<{ id: string; carMake: string; carModel: string }>;
}

export default function ChatInput({
  onSendMessage,
  onSendImage,
  onSendReport,
  isLoading = false,
  availableReports = [],
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [showReportMenu, setShowReportMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim(), "text");
      setMessage("");
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      onSendImage(file);
    }
    // Reset input
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const handleReportSelect = (reportId: string) => {
    onSendReport(reportId);
    setShowReportMenu(false);
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      {/* Report Menu */}
      {showReportMenu && availableReports.length > 0 && (
        <div className="mb-3 max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="p-2">
            <p className="mb-2 text-xs font-medium text-gray-600 dark:text-gray-400">
              Select a report to share:
            </p>
            {availableReports.map((report) => (
              <button
                key={report.id}
                onClick={() => handleReportSelect(report.id)}
                className="w-full rounded-lg p-2 text-left text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <div className="flex items-center gap-2">
                  <span>📊</span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {report.carMake} {report.carModel}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Report ID: {report.id.slice(-8)}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        {/* Image Input */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />

        {/* Report Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
        />

        {/* Message Input */}
        <div className="flex-1">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            rows={1}
            className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            disabled={isLoading}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* Image Button */}
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            disabled={isLoading}
            className="rounded-lg bg-gray-100 p-2 text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            aria-label="Attach image"
          >
            📷
          </button>

          {/* Report Button */}
          {availableReports.length > 0 && (
            <button
              type="button"
              onClick={() => setShowReportMenu(!showReportMenu)}
              disabled={isLoading}
              className="rounded-lg bg-gray-100 p-2 text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              aria-label="Share report"
            >
              📊
            </button>
          )}

          {/* Send Button */}
          <button
            type="submit"
            disabled={!message.trim() || isLoading}
            className="rounded-lg bg-blue-600 p-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
            aria-label="Send message"
          >
            {isLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <span>➤</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
