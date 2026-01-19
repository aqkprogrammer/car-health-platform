"use client";

import { useState } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

export default function PhoneInput({
  value,
  onChange,
  onSubmit,
  isLoading = false,
}: PhoneInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, ""); // Only numbers
    // Allow up to 10 digits for Indian phone numbers
    if (input.length <= 10) {
      onChange(input);
    }
  };

  const handleSendOTP = () => {
    console.log("handleSendOTP called", { value, valueLength: value.length, isLoading, hasOnSubmit: !!onSubmit });
    if (value.length === 10 && !isLoading && onSubmit) {
      console.log("Calling onSubmit");
      try {
        onSubmit();
      } catch (error) {
        console.error("Error calling onSubmit:", error);
      }
    } else {
      console.log("Cannot send OTP", { valueLength: value.length, isLoading, hasOnSubmit: !!onSubmit });
    }
  };
  
  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log("Button clicked!", { value, valueLength: value.length, isLoading, disabled: value.length !== 10 || isLoading });
    e.preventDefault();
    e.stopPropagation();
    handleSendOTP();
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.length === 10 && !isLoading) {
      e.preventDefault();
      handleSendOTP();
    }
  };

  return (
    <div className="w-full">
      <div className="space-y-4">
        <div>
          <label
            htmlFor="phone"
            className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white"
          >
            Phone Number
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">+91</span>
              <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
            </div>
            <input
              id="phone"
              type="tel"
              inputMode="numeric"
              value={value}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              placeholder="9876543210"
              className="w-full rounded-xl border-2 border-gray-200 bg-white py-3.5 pl-16 pr-4 text-lg text-gray-900 placeholder-gray-400 transition-all focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:border-blue-400"
              maxLength={10}
              autoComplete="tel"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={value.length !== 10 || isLoading}
          className="relative z-10 w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 active:scale-95"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <LoadingSpinner size="sm" />
              Sending OTP...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Send OTP
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          )}
        </button>
      </div>
      {value.length > 0 && value.length < 10 && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
          <svg className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-sm font-medium text-red-600 dark:text-red-400">
            Please enter a valid 10-digit phone number
          </p>
        </div>
      )}
    </div>
  );
}
