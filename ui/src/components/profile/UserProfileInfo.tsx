"use client";

import { UserProfile } from "@/types/profile";
import { useAuth } from "@/contexts/AuthContext";

interface UserProfileInfoProps {
  profile: UserProfile;
}

export default function UserProfileInfo({ profile }: UserProfileInfoProps) {
  const { user } = useAuth();

  const getRoleDisplay = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const getInitials = () => {
    if (profile.name) {
      const names = profile.name.split(" ");
      if (names.length > 1) {
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
      }
      return profile.name.charAt(0).toUpperCase();
    }
    if (profile.phone) {
      return profile.phone.slice(-1);
    }
    if (profile.email) {
      return profile.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-br from-white/90 via-blue-50/40 to-indigo-50/40 dark:from-slate-800/90 dark:via-slate-800/90 dark:to-slate-900/90 backdrop-blur-xl shadow-2xl group">
      {/* Sophisticated decorative background elements */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-400/20 via-indigo-400/15 to-purple-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-indigo-400/20 via-purple-400/15 to-pink-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/10 via-pink-400/5 to-blue-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 opacity-50"></div>
      
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] opacity-30"></div>
      
      <div className="relative p-8 md:p-10">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8 mb-8">
          {/* Enhanced Avatar */}
          <div className="relative group/avatar">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-2xl blur-xl opacity-50 group-hover/avatar:opacity-75 transition-opacity duration-300"></div>
            <div className="relative flex h-28 w-28 md:h-36 md:w-36 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 text-4xl md:text-5xl font-extrabold text-white shadow-2xl ring-4 ring-white/60 dark:ring-slate-800/60 transition-all duration-300 group-hover/avatar:scale-105 group-hover/avatar:ring-blue-400/50">
              {getInitials()}
            </div>
            {profile.verified && (
              <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-500 p-1.5 shadow-xl ring-4 ring-white dark:ring-slate-800 animate-pulse">
                <span className="text-xs font-bold">✓</span>
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h2 className="mb-4 text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
              {profile.name || profile.phone || profile.email || "User"}
            </h2>
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-xl ring-2 ring-blue-400/30 backdrop-blur-sm">
                <span className="text-sm">👤</span>
                <span>{getRoleDisplay(profile.role)}</span>
              </span>
              {profile.verified && (
                <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 px-5 py-2.5 text-xs font-bold text-white shadow-xl ring-2 ring-green-400/30 backdrop-blur-sm">
                  <span className="text-sm">✓</span>
                  <span>Verified Account</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              <span className="text-lg">📅</span>
              <span>
                Member since {new Date(profile.joinedDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Enhanced Profile Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-200/50 dark:border-gray-700/50 pt-8">
          {profile.phone && (
            <div className="group relative overflow-hidden flex items-center gap-4 rounded-2xl bg-white/70 dark:bg-slate-700/50 backdrop-blur-xl border border-gray-200/50 dark:border-gray-600/50 p-5 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-blue-400/50 dark:hover:border-blue-600/50">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-2xl shadow-lg ring-2 ring-blue-400/30 group-hover:scale-110 transition-transform">
                📱
              </div>
              <div className="relative flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                  Phone Number
                </p>
                <p className="text-base font-bold text-gray-900 dark:text-white truncate">
                  {profile.phone}
                </p>
              </div>
            </div>
          )}
          {profile.email && (
            <div className="group relative overflow-hidden flex items-center gap-4 rounded-2xl bg-white/70 dark:bg-slate-700/50 backdrop-blur-xl border border-gray-200/50 dark:border-gray-600/50 p-5 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-purple-400/50 dark:hover:border-purple-600/50">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-2xl shadow-lg ring-2 ring-purple-400/30 group-hover:scale-110 transition-transform">
                ✉️
              </div>
              <div className="relative flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                  Email Address
                </p>
                <p className="text-base font-bold text-gray-900 dark:text-white break-all">
                  {profile.email}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
