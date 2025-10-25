'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface UserProfile {
  name: string;
  email?: string;
  hedraAccount?: string;
  preferredCurrencies?: string[];
  kycVerified?: boolean;
}

interface AuthContextValue {
  user: UserProfile | null;
  signIn: (profile: UserProfile) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('agentpay_user');
      if (raw) setUser(JSON.parse(raw));
    } catch (e) {
      // ignore
    }
  }, []);

  const signIn = (profile: UserProfile) => {
    setUser(profile);
    localStorage.setItem('agentpay_user', JSON.stringify(profile));
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('agentpay_user');
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
