"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  const getRoleDisplay = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 dark:from-blue-500 dark:to-indigo-500 sm:hidden"
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        {isOpen ? "✕" : "☰"}
      </button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm sm:hidden animate-fade-in"
            onClick={() => setIsOpen(false)}
          />
          {/* Menu */}
          <div className="fixed right-4 top-16 z-50 w-72 rounded-2xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-6 shadow-2xl border border-white/20 dark:border-slate-700/50 sm:hidden animate-fade-in">
            <nav className="flex flex-col gap-2">
              <Link
                href="/marketplace"
                onClick={() => setIsOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium text-gray-700 transition-all hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-slate-700 dark:hover:text-blue-400"
              >
                Marketplace
              </Link>
              <a
                href="#how-it-works"
                onClick={() => setIsOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium text-gray-700 transition-all hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-slate-700 dark:hover:text-blue-400"
              >
                How It Works
              </a>
              <a
                href="#pricing"
                onClick={() => setIsOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium text-gray-700 transition-all hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-slate-700 dark:hover:text-blue-400"
              >
                Pricing
              </a>
              {isAuthenticated ? (
                <>
                  <div className="my-3 border-t border-gray-200/50 dark:border-gray-700/50" />
                  <Link
                    href="/profile"
                    onClick={() => setIsOpen(false)}
                    className="rounded-xl bg-gradient-to-r from-gray-100 to-gray-50 px-4 py-3 dark:from-slate-700 dark:to-slate-600 shadow-sm"
                  >
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {user?.phone || user?.email}
                    </p>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">
                      {getRoleDisplay(user?.role || "")}
                    </p>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="rounded-xl px-4 py-3 text-left text-sm font-medium text-gray-700 transition-all hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-600 dark:text-gray-300 dark:hover:bg-slate-700 dark:hover:text-red-400"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    router.push("/login");
                    setIsOpen(false);
                  }}
                  className="mt-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 dark:from-blue-500 dark:to-indigo-500"
                >
                  Get Started
                </button>
              )}
            </nav>
          </div>
        </>
      )}
    </>
  );
}
