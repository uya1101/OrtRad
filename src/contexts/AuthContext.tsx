import React, { createContext, useContext } from 'react';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  userId: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, userId, signOut } = useClerkAuth();

  const login = () => {
    // Clerk handles login through their components
    // This is a placeholder for future custom login logic if needed
    console.log('Login should be handled by ClerkSignIn component');
  };

  const logout = () => {
    signOut();
  };

  const isAuthenticated = !!userId;
  const isLoading = !isLoaded;

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout, userId }}>
      {children}
    </AuthContext.Provider>
  );
}
