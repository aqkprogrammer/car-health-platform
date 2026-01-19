"use client";

import { useState, useRef, useEffect } from "react";

interface OTPInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  isLoading?: boolean;
}

export default function OTPInput({
  length = 6,
  onComplete,
  isLoading = false,
}: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(""));
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    setTimeout(() => {
      inputRefs.current[0]?.focus();
      setFocusedIndex(0);
    }, 100);
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take last character
    setOtp(newOtp);

    // Move to next input if value entered
    if (value && index < length - 1) {
      setTimeout(() => {
        inputRefs.current[index + 1]?.focus();
        setFocusedIndex(index + 1);
      }, 10);
    }

    // Check if OTP is complete
    if (newOtp.every((digit) => digit !== "") && newOtp.join("").length === length) {
      onComplete(newOtp.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setFocusedIndex(index - 1);
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setFocusedIndex(index - 1);
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }
  };

  const handleFocus = (index: number) => {
    setFocusedIndex(index);
    // Select all text when focusing
    inputRefs.current[index]?.select();
  };

  const handleBlur = () => {
    setFocusedIndex(null);
  };

  const handleClick = (index: number) => {
    inputRefs.current[index]?.focus();
    setFocusedIndex(index);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, length);
    const pastedArray = pastedData.split("").filter((char) => /^\d$/.test(char));

    if (pastedArray.length > 0) {
      const newOtp = [...otp];
      pastedArray.forEach((digit, i) => {
        if (i < length) {
          newOtp[i] = digit;
        }
      });
      setOtp(newOtp);

      // Focus the next empty input or the last one
      const nextIndex = Math.min(pastedArray.length, length - 1);
      setTimeout(() => {
        inputRefs.current[nextIndex]?.focus();
        setFocusedIndex(nextIndex);
      }, 10);

      // Check if OTP is complete
      if (newOtp.every((digit) => digit !== "") && newOtp.join("").length === length) {
        onComplete(newOtp.join(""));
      }
    }
  };

  return (
    <div className="w-full">
      {/* Title */}
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Enter OTP
        </h2>
        <div className="mx-auto mt-2 h-0.5 w-12 rounded-full bg-blue-600 dark:bg-blue-400" />
      </div>

      {/* OTP Input Boxes */}
      <div className="flex justify-center gap-2.5 sm:gap-3" role="group" aria-label="OTP input fields">
        {otp.map((digit, index) => {
          const isFocused = focusedIndex === index;
          const hasValue = digit !== "";
          const inputId = `otp-input-${index}`;
          
          return (
            <div
              key={index}
              className="relative"
              onClick={() => handleClick(index)}
            >
              <label htmlFor={inputId} className="sr-only">
                OTP digit {index + 1}
              </label>
              <input
                id={inputId}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onFocus={() => handleFocus(index)}
                onBlur={handleBlur}
                onPaste={handlePaste}
                disabled={isLoading}
                aria-label={`OTP digit ${index + 1} of ${length}`}
                placeholder="•"
                className={`
                  h-12 w-12 rounded-lg border text-center text-2xl font-semibold text-gray-900 
                  transition-all duration-200 cursor-pointer
                  ${isFocused 
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20 dark:bg-blue-950/30 dark:border-blue-400 caret-blue-500' 
                    : hasValue
                    ? 'border-blue-300 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-600 caret-transparent'
                    : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800 caret-transparent'
                  }
                  focus:outline-none
                  hover:border-blue-400
                  disabled:cursor-not-allowed disabled:opacity-50
                  dark:text-white
                `}
              />
              
              {/* Cursor indicator when focused and empty */}
              {isFocused && !hasValue && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="h-6 w-0.5 bg-blue-500 animate-pulse" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Helper Text */}
      <div className="mt-8 text-center">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-sm font-medium">Verifying...</span>
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter the 6-digit code sent to your phone
          </p>
        )}
      </div>
    </div>
  );
}
