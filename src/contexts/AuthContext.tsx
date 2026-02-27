import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const SESSION_KEY = 'admin_session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check session on mount
  useEffect(() => {
    const checkSession = () => {
      try {
        const session = localStorage.getItem(SESSION_KEY);
        if (session) {
          const { timestamp } = JSON.parse(session);
          const isValid = Date.now() - timestamp < SESSION_DURATION;
          setIsAuthenticated(isValid);
          if (!isValid) {
            localStorage.removeItem(SESSION_KEY);
          }
        }
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
      setIsLoading(false);
    };

    checkSession();
  }, []);

  const login = useCallback(async (password: string): Promise<boolean> => {
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;

    if (!adminPassword) {
      console.error('VITE_ADMIN_PASSWORD is not set');
      return false;
    }

    // Simple password check
    if (password === adminPassword) {
      const session = {
        timestamp: Date.now(),
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      setIsAuthenticated(true);
      return true;
    }

    return false;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
