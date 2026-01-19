"use client";

import { UserRole } from "@/contexts/AuthContext";

interface RoleSelectionProps {
  selectedRole: UserRole | null;
  onSelect: (role: UserRole) => void;
  isLoading?: boolean;
}

const roles = [
  {
    id: "buyer" as UserRole,
    title: "Buyer",
    icon: "🛒",
    description: "Looking to buy a verified car",
  },
  {
    id: "seller" as UserRole,
    title: "Seller",
    icon: "🚗",
    description: "Sell your car with a health report",
  },
  {
    id: "dealer" as UserRole,
    title: "Dealer",
    icon: "🏢",
    description: "Manage multiple listings",
  },
];

export default function RoleSelection({
  selectedRole,
  onSelect,
  isLoading = false,
}: RoleSelectionProps) {
  return (
    <div className="w-full">
      <label className="mb-6 block text-center text-lg font-bold text-gray-900 dark:text-white">
        Select Your Role
      </label>
      <div className="grid gap-4 sm:grid-cols-3">
        {roles.map((role) => (
          <button
            key={role.id}
            type="button"
            onClick={() => !isLoading && onSelect(role.id)}
            disabled={isLoading}
            className={`group relative flex flex-col items-center rounded-2xl border-2 p-6 transition-all duration-300 ${
              selectedRole === role.id
                ? "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg shadow-blue-500/20 dark:border-blue-400 dark:from-blue-950/40 dark:to-indigo-950/40"
                : "border-gray-200 bg-white hover:scale-105 hover:border-blue-300 hover:bg-gradient-to-br hover:from-blue-50/50 hover:to-indigo-50/50 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-gray-600"
            } ${isLoading ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
          >
            {selectedRole === role.id && (
              <div className="absolute right-3 top-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
            <div className={`mb-4 text-5xl transition-transform duration-300 ${selectedRole === role.id ? "scale-110" : "group-hover:scale-110"}`}>
              {role.icon}
            </div>
            <h3 className={`mb-2 text-lg font-bold text-gray-900 dark:text-white ${selectedRole === role.id ? "text-blue-600 dark:text-blue-400" : ""}`}>
              {role.title}
            </h3>
            <p className="text-center text-sm font-medium text-gray-600 dark:text-gray-400">
              {role.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
