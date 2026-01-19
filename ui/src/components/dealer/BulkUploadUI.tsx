"use client";

import { useState, useRef } from "react";
import { BulkUploadResult } from "@/types/dealer";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface BulkUploadUIProps {
  onUpload: (file: File) => Promise<BulkUploadResult>;
}

interface CSVPreview {
  headers: string[];
  rows: string[][];
  rowCount: number;
}

export default function BulkUploadUI({ onUpload }: BulkUploadUIProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(
    null
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<CSVPreview | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const parseCSV = (text: string): CSVPreview | null => {
    const lines = text.split("\n").filter((line) => line.trim());
    if (lines.length < 2) return null;

    const headers = lines[0].split(",").map((h) => h.trim());
    const rows = lines.slice(1, 6).map((line) =>
      line.split(",").map((cell) => cell.trim())
    );

    return {
      headers,
      rows,
      rowCount: lines.length - 1,
    };
  };

  const validateCSV = (preview: CSVPreview): string[] => {
    const errors: string[] = [];
    const requiredColumns = ["Make", "Model", "Year", "FuelType", "Transmission"];

    // Check required columns
    const missingColumns = requiredColumns.filter(
      (col) => !preview.headers.includes(col)
    );
    if (missingColumns.length > 0) {
      errors.push(`Missing required columns: ${missingColumns.join(", ")}`);
    }

    // Check row count
    if (preview.rowCount > 100) {
      errors.push("CSV contains more than 100 rows. Maximum allowed is 100.");
    }

    if (preview.rowCount === 0) {
      errors.push("CSV file is empty or has no data rows.");
    }

    return errors;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileSelectInternal(file);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && (file.type === "text/csv" || file.name.endsWith(".csv"))) {
      await handleFileSelectInternal(file);
    } else {
      alert("Please upload a CSV file");
    }
  };

  const handleFileSelectInternal = async (file: File) => {
    setSelectedFile(file);
    setUploadResult(null);
    setValidationErrors([]);
    setCsvPreview(null);

    // Read and preview CSV
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const preview = parseCSV(text);
      if (preview) {
        setCsvPreview(preview);
        const errors = validateCSV(preview);
        setValidationErrors(errors);
      } else {
        setValidationErrors(["Invalid CSV format"]);
      }
    };
    reader.readAsText(file);
  };

  const handleFileUpload = async () => {
    if (!selectedFile || validationErrors.length > 0) {
      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    try {
      const result = await onUpload(selectedFile);
      setUploadResult(result);
      // Reset after successful upload
      if (result.failed === 0) {
        setTimeout(() => {
          setSelectedFile(null);
          setCsvPreview(null);
          setValidationErrors([]);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }, 3000);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    // Create CSV template
    const csvContent =
      "Make,Model,Year,FuelType,Transmission,KilometersDriven,OwnershipCount,City,State,Price\n" +
      "Toyota,Camry,2020,Petrol,Automatic,35000,1,Mumbai,Maharashtra,1500000\n" +
      "Honda,Civic,2019,Petrol,Manual,45000,2,Delhi,Delhi,850000";

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bulk_upload_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl border border-gray-200/50 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-6 shadow-xl dark:border-gray-700/50">
      <h3 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
        Bulk Upload Cars
      </h3>

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !selectedFile && fileInputRef.current?.click()}
        className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          selectedFile
            ? "border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20"
            : isDragging
            ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20"
            : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/50 dark:border-gray-600 dark:bg-gray-700/50 dark:hover:border-blue-500"
        } ${isUploading ? "pointer-events-none opacity-50" : selectedFile ? "" : "cursor-pointer"}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-4">
            <LoadingSpinner size="lg" />
            <p className="text-gray-600 dark:text-gray-400">Uploading...</p>
          </div>
        ) : selectedFile ? (
          <div className="flex flex-col items-center gap-2">
            <span className="text-4xl">✅</span>
            <p className="font-semibold text-gray-900 dark:text-white">
              {selectedFile.name}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {csvPreview?.rowCount || 0} cars ready to upload
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFile(null);
                setCsvPreview(null);
                setValidationErrors([]);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              className="mt-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400"
            >
              Remove file
            </button>
          </div>
        ) : (
          <>
            <span className="mb-4 block text-5xl">📤</span>
            <p className="mb-2 font-semibold text-gray-900 dark:text-white">
              Drop CSV file here or click to browse
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Supports CSV format with car details
            </p>
          </>
        )}
      </div>

      {/* CSV Preview */}
      {csvPreview && !isUploading && (
        <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
          <h4 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
            CSV Preview ({csvPreview.rowCount} rows)
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-300 dark:border-gray-600">
                  {csvPreview.headers.map((header, idx) => (
                    <th
                      key={idx}
                      className="px-2 py-2 text-left font-semibold text-gray-700 dark:text-gray-300"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {csvPreview.rows.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className="border-b border-gray-200 dark:border-gray-700"
                  >
                    {row.map((cell, cellIdx) => (
                      <td
                        key={cellIdx}
                        className="px-2 py-1.5 text-gray-600 dark:text-gray-400"
                      >
                        {cell || "-"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {csvPreview.rowCount > 5 && (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Showing first 5 rows of {csvPreview.rowCount} total
              </p>
            )}
          </div>
        </div>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <h4 className="mb-2 text-sm font-semibold text-red-900 dark:text-red-300">
            ⚠️ Validation Errors
          </h4>
          <ul className="list-disc space-y-1 pl-5 text-sm text-red-700 dark:text-red-400">
            {validationErrors.map((error, idx) => (
              <li key={idx}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Upload Button */}
      {selectedFile && validationErrors.length === 0 && !isUploading && (
        <div className="mt-4">
          <button
            onClick={handleFileUpload}
            className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-4 py-3 font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 dark:from-blue-500 dark:via-indigo-500 dark:to-purple-500"
          >
            <span className="relative z-10">Upload {csvPreview?.rowCount || 0} Cars</span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 opacity-0 transition-opacity group-hover:opacity-100"></div>
          </button>
        </div>
      )}

      {/* Template Download */}
      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={downloadTemplate}
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          📥 Download CSV Template
        </button>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Max 100 cars per upload
        </p>
      </div>

      {/* Upload Results */}
      {uploadResult && (
        <div
          className={`mt-6 rounded-lg border-2 p-5 ${
            uploadResult.failed === 0
              ? "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-900/30"
              : "border-yellow-300 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/30"
          }`}
        >
          <div className="mb-3 flex items-center gap-2">
            <span className="text-2xl">
              {uploadResult.failed === 0 ? "✅" : "⚠️"}
            </span>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">
              Upload Results
            </h4>
          </div>
          <div className="mb-3 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-white/60 p-3 dark:bg-gray-800/60">
              <p className="text-xs text-gray-600 dark:text-gray-400">Successful</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                {uploadResult.success}
              </p>
            </div>
            {uploadResult.failed > 0 && (
              <div className="rounded-lg bg-white/60 p-3 dark:bg-gray-800/60">
                <p className="text-xs text-gray-600 dark:text-gray-400">Failed</p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                  {uploadResult.failed}
                </p>
              </div>
            )}
            <div className="rounded-lg bg-white/60 p-3 dark:bg-gray-800/60">
              <p className="text-xs text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {uploadResult.success + uploadResult.failed}
              </p>
            </div>
          </div>

          {/* Errors */}
          {uploadResult.errors.length > 0 && (
            <div className="mt-4 rounded-lg border border-red-200 bg-white p-3 dark:border-red-800 dark:bg-gray-800">
              <p className="mb-2 text-sm font-semibold text-red-900 dark:text-red-300">
                Error Details:
              </p>
              <div className="max-h-40 space-y-1 overflow-y-auto">
                {uploadResult.errors.map((error, index) => (
                  <div
                    key={index}
                    className="rounded bg-red-50 px-2 py-1 text-xs text-red-700 dark:bg-red-900/20 dark:text-red-400"
                  >
                    <span className="font-medium">Row {error.row}:</span>{" "}
                    {error.error}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
        <p className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
          📋 CSV Format Requirements:
        </p>
        <ul className="space-y-1 text-xs text-gray-700 dark:text-gray-300">
          <li>• Required columns: Make, Model, Year, FuelType, Transmission</li>
          <li>• Optional columns: KilometersDriven, OwnershipCount, City, State, Price</li>
          <li>• First row should contain column headers</li>
          <li>• Each subsequent row represents one car</li>
        </ul>
      </div>
    </div>
  );
}
