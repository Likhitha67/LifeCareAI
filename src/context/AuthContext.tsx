import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  getCurrentUser,
  initializeAuthDefaults,
  loginWithEmail,
  logoutUser,
  signUpWithEmail,
  updateProfile as updateProfileService,
} from '../services/authService';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check session on mount
    try {
      initializeAuthDefaults();
      const existing = getCurrentUser();
      setUser(existing);
    } catch (e) {
      console.error('Failed to restore auth session:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const u = await loginWithEmail(email, pass);
      setUser(u);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, pass: string) => {
    setLoading(true);
    try {
      const u = await signUpWithEmail(name, email, pass);
      setUser(u);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  const refreshUser = () => {
    const u = getCurrentUser();
    setUser(u);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in');
    const updated = await updateProfileService(user.id, updates);
    setUser(updated);
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        refreshUser,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
