"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi, usersApi, getAuthToken } from "@/lib/api";

export type UserRole = "buyer" | "seller" | "dealer";

export interface User {
  id: string;
  phone?: string;
  email?: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  isVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from token on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          const userData = await usersApi.getProfile();
          setUser({
            id: userData.id,
            email: userData.email,
            phone: userData.phone,
            role: userData.role as UserRole,
            firstName: userData.firstName,
            lastName: userData.lastName,
          });
        } catch (error) {
          console.error("Error loading user:", error);
          // Token might be invalid, clear it
          localStorage.removeItem("carHealthToken");
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("carHealthToken");
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await usersApi.getProfile();
      setUser({
        id: userData.id,
        email: userData.email,
        phone: userData.phone,
        role: userData.role as UserRole,
        firstName: userData.firstName,
        lastName: userData.lastName,
      });
    } catch (error) {
      console.error("Error refreshing user:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateUser,
        refreshUser,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
