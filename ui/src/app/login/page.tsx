"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { authApi, OTPVerifyDto } from "@/lib/api";
import PhoneInput from "@/components/auth/PhoneInput";
import OTPInput from "@/components/auth/OTPInput";
import EmailLogin from "@/components/auth/EmailLogin";
import RoleSelection from "@/components/auth/RoleSelection";

type AuthMethod = "phone" | "email";
type AuthStep = "method" | "role" | "verify" | "complete";

// SVG Icons
const PhoneIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const EmailIcon = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const BackIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [authMethod, setAuthMethod] = useState<AuthMethod | null>(null);
  const [step, setStep] = useState<AuthStep>("method");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);

  const handlePhoneSubmit = async () => {
    console.log("handlePhoneSubmit called", { phone, phoneLength: phone.length });
    
    if (phone.length < 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;
      console.log("Requesting OTP for:", formattedPhone);
      
      const response = await authApi.requestOTP({ phone: formattedPhone });
      console.log("OTP response:", response);
      
      setOtpSent(true);
      setStep("verify");
    } catch (err: any) {
      console.error("OTP request error:", err);
      setError(err.message || "Failed to send OTP. Please try again.");
      setOtpSent(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPComplete = async (otp: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;
      const requestData: OTPVerifyDto = {
        phone: formattedPhone,
        otp,
      };
      
      // Only include role if it's selected
      if (selectedRole) {
        requestData.role = selectedRole;
      }
      
      const response = await authApi.verifyOTP(requestData);
      
      login({
        id: response.user.id,
        phone: response.user.phone,
        email: response.user.email,
        role: response.user.role as UserRole,
        firstName: response.user.firstName,
        lastName: response.user.lastName,
        isVerified: true,
      });
      
      // Redirect based on role
      if (response.user.role === "dealer") {
        router.push("/dealer/dashboard");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message || "Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (emailValue: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.login({
        email: emailValue,
        password,
      });
      
      login({
        id: response.user.id,
        email: response.user.email,
        phone: response.user.phone,
        role: response.user.role as UserRole,
        firstName: response.user.firstName,
        lastName: response.user.lastName,
        isVerified: true,
      });
      
      // Redirect based on role
      if (response.user.role === "dealer") {
        router.push("/dealer/dashboard");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    if (authMethod === "phone") {
      setStep("verify");
    } else {
      // For email, role selection happens before login
      setStep("complete");
    }
  };

  const handleMethodSelect = (method: AuthMethod) => {
    setAuthMethod(method);
    setStep("role");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 py-12 dark:from-gray-950 dark:via-gray-900 dark:to-slate-950">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-400/20 blur-3xl animate-pulse" />
        <div className="absolute -right-1/4 -bottom-1/4 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-purple-400/20 to-pink-400/20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Header Section */}
        <div className="mb-10 text-center animate-fade-in">
          <div className="mb-4 inline-flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 blur-xl opacity-50 animate-pulse" />
              <h1 className="relative text-4xl font-black tracking-tight text-gray-900 dark:text-white sm:text-5xl">
                Welcome to{" "}
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  CarHealth
                </span>
              </h1>
            </div>
          </div>
          <p className="text-lg font-medium text-gray-600 dark:text-gray-300">
            Sign in to get started
          </p>
        </div>

        {/* Main Card */}
        <div className="relative rounded-3xl bg-white/80 backdrop-blur-xl p-8 shadow-2xl ring-1 ring-black/5 dark:bg-gray-900/80 dark:ring-white/10 sm:p-10">
          {/* Glow Effect */}
          <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-20 blur-xl pointer-events-none" />

          {/* Error Message */}
          {error && (
            <div className="mb-6 animate-fade-in rounded-xl bg-red-50/90 p-4 text-sm font-medium text-red-800 shadow-sm ring-1 ring-red-200 dark:bg-red-900/30 dark:text-red-200 dark:ring-red-800/50">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}

          {/* Step 1: Select Auth Method */}
          {step === "method" && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="mb-8 text-center text-2xl font-bold text-gray-900 dark:text-white">
                Choose Login Method
              </h2>
              
              {/* Phone Number Option */}
              <button
                onClick={() => handleMethodSelect("phone")}
                className="group relative w-full overflow-hidden rounded-2xl border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 px-6 py-5 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/20 dark:border-blue-400 dark:from-blue-950/40 dark:to-indigo-950/40"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:shadow-xl">
                    <PhoneIcon />
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 text-lg font-bold text-gray-900 dark:text-white">
                      Phone Number
                    </div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Login with OTP
                    </div>
                  </div>
                  <svg className="h-5 w-5 text-blue-600 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              {/* Email Option */}
              <button
                onClick={() => handleMethodSelect("email")}
                className="group relative w-full overflow-hidden rounded-2xl border-2 border-gray-200 bg-white px-6 py-5 text-left transition-all duration-300 hover:scale-[1.02] hover:border-gray-300 hover:shadow-xl hover:shadow-gray-500/10 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-gray-600"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-gray-50/50 to-gray-100/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-gray-700/20 dark:to-gray-600/20" />
                <div className="relative flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-gray-400 to-gray-500 text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:shadow-xl">
                    <EmailIcon />
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 text-lg font-bold text-gray-900 dark:text-white">
                      Email
                    </div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Login with Email
                    </div>
                  </div>
                  <svg className="h-5 w-5 text-gray-600 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </div>
          )}

          {/* Step 2: Role Selection */}
          {step === "role" && (
            <div className="space-y-6 animate-fade-in">
              <button
                type="button"
                onClick={() => {
                  setStep("method");
                  setAuthMethod(null);
                  setSelectedRole(null);
                  setError(null);
                }}
                className="group relative mb-4 flex items-center gap-2 text-sm font-medium text-gray-600 transition-all hover:text-gray-900 hover:scale-105 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <BackIcon />
                <span>Back</span>
              </button>
              <RoleSelection
                selectedRole={selectedRole}
                onSelect={handleRoleSelect}
                isLoading={isLoading}
              />
            </div>
          )}

          {/* Step 3: Phone Input & OTP Verification */}
          {step === "verify" && authMethod === "phone" && (
            <div className="space-y-6 animate-fade-in">
              <button
                type="button"
                onClick={() => {
                  setStep("role");
                  setPhone("");
                  setOtpSent(false);
                  setError(null);
                }}
                className="group relative mb-4 flex items-center gap-2 text-sm font-medium text-gray-600 transition-all hover:text-gray-900 hover:scale-105 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <BackIcon />
                <span>Back</span>
              </button>
              {!otpSent ? (
                <PhoneInput
                  value={phone}
                  onChange={setPhone}
                  onSubmit={handlePhoneSubmit}
                  isLoading={isLoading}
                />
              ) : (
                <div className="relative z-10 space-y-8">
                  {/* OTP Sent Confirmation Card */}
                  <div className="relative z-10 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200/50 dark:bg-gray-800 dark:ring-gray-700/50">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/50">
                        <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          OTP sent to
                        </p>
                        <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                          +91{phone}
                        </p>
                        <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                          Didn&apos;t receive? Check your messages or{" "}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setPhone("");
                              setOtpSent(false);
                              setStep("verify");
                            }}
                            className="relative z-20 font-semibold text-blue-600 underline transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                            style={{ pointerEvents: 'auto' }}
                          >
                            resend
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* OTP Input Container */}
                  <div className="relative z-10 rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-200/50 dark:bg-gray-800 dark:ring-gray-700/50">
                    <OTPInput
                      onComplete={handleOTPComplete}
                      isLoading={isLoading}
                    />
                  </div>

                  {/* Change Phone Number Link */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setPhone("");
                      setOtpSent(false);
                      setStep("verify");
                    }}
                    className="group relative z-20 mx-auto flex items-center justify-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    style={{ pointerEvents: 'auto' }}
                  >
                    <svg className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Change phone number
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Email Login */}
          {step === "complete" && authMethod === "email" && (
            <div className="space-y-6 animate-fade-in">
              <button
                type="button"
                onClick={() => {
                  setStep("role");
                  setEmail("");
                  setError(null);
                }}
                className="group relative mb-4 flex items-center gap-2 text-sm font-medium text-gray-600 transition-all hover:text-gray-900 hover:scale-105 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <BackIcon />
                <span>Back</span>
              </button>
              <EmailLogin onSubmit={handleEmailSubmit} isLoading={isLoading} />
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
          By continuing, you agree to our{" "}
          <a href="#" className="font-semibold text-blue-600 underline transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="font-semibold text-blue-600 underline transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
            Privacy Policy
          </a>
        </p>
      </div>

    </div>
  );
}
