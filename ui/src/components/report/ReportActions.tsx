"use client";

import { useState } from "react";
import { CarHealthReport } from "@/types/report";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface ReportActionsProps {
  report: CarHealthReport;
}

export default function ReportActions({ report }: ReportActionsProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isListing, setIsListing] = useState(false);

  const reportUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/reports/${report.id}`
    : "";

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      // In production, this would call an API endpoint to generate PDF
      // For now, we'll use the browser's print functionality
      await new Promise((resolve) => setTimeout(resolve, 1000));
      window.print();
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Failed to download PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Car Health Report - ${report.carDetails.make} ${report.carDetails.model}`,
          text: `Check out this car health report for ${report.carDetails.make} ${report.carDetails.model} (${report.carDetails.year})`,
          url: reportUrl,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(reportUrl);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    } catch (error) {
      // User cancelled or error occurred
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Error sharing:", error);
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(reportUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Error copying URL:", error);
      alert("Failed to copy URL. Please try again.");
    }
  };

  const handleListForSale = () => {
    setIsListing(true);
    // In production, this would navigate to marketplace listing page
    setTimeout(() => {
      setIsListing(false);
      // For now, show alert
      alert("This feature will redirect to the marketplace listing page.");
    }, 500);
  };

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Download PDF */}
        <button
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className="flex items-center justify-center gap-2 rounded-xl border-2 border-gray-300 bg-white px-4 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          {isDownloading ? (
            <>
              <LoadingSpinner size="sm" />
              <span>Downloading...</span>
            </>
          ) : (
            <>
              <span>📄</span>
              <span>Download PDF</span>
            </>
          )}
        </button>

        {/* Share Report */}
        <button
          onClick={handleShare}
          disabled={isSharing}
          className="flex items-center justify-center gap-2 rounded-xl border-2 border-gray-300 bg-white px-4 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          {isSharing ? (
            <>
              <LoadingSpinner size="sm" />
              <span>Sharing...</span>
            </>
          ) : (
            <>
              <span>🔗</span>
              <span>Share Report</span>
            </>
          )}
        </button>

        {/* Copy URL */}
        <button
          onClick={handleCopyUrl}
          disabled={isCopied}
          className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 font-semibold transition-all hover:shadow-md ${
            isCopied
              ? "border-green-500 bg-green-50 text-green-700 dark:border-green-400 dark:bg-green-900/20 dark:text-green-300"
              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          }`}
        >
          {isCopied ? (
            <>
              <span>✓</span>
              <span>Copied!</span>
            </>
          ) : (
            <>
              <span>📋</span>
              <span>Copy URL</span>
            </>
          )}
        </button>

        {/* List for Sale */}
        <button
          onClick={handleListForSale}
          disabled={isListing}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition-all hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          {isListing ? (
            <>
              <LoadingSpinner size="sm" />
              <span>Loading...</span>
            </>
          ) : (
            <>
              <span>🚗</span>
              <span>List Car for Sale</span>
            </>
          )}
        </button>
      </div>

      {/* Report URL Display */}
      {isCopied && (
        <div className="rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
          <p className="text-sm text-green-800 dark:text-green-200">
            ✓ Report URL copied to clipboard!
          </p>
        </div>
      )}
    </div>
  );
}
