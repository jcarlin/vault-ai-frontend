'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { AuthUser } from '@/types/api';
import { login as apiLogin, getAuthMe } from '@/lib/api/auth';

interface AuthContextValue {
  apiKey: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authType: 'jwt' | 'key' | null;
  user: AuthUser | null;
  setApiKey: (key: string) => void;
  clearApiKey: () => void;
  loginWithCredentials: (username: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = 'vault_api_key';
const USER_STORAGE_KEY = 'vault_auth_user';

function detectAuthType(token: string | null): 'jwt' | 'key' | null {
  if (!token) return null;
  if (token.startsWith('eyJ')) return 'jwt';
  return 'key';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authType, setAuthType] = useState<'jwt' | 'key' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Read from localStorage after mount to avoid hydration mismatch
  useEffect(() => {
    const storedToken = localStorage.getItem(STORAGE_KEY);
    setApiKeyState(storedToken);
    setAuthType(detectAuthType(storedToken));

    // Fast restore cached user for JWT tokens
    const cachedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (cachedUser) {
      try {
        setUser(JSON.parse(cachedUser));
      } catch { /* ignore corrupt data */ }
    }

    // If JWT, validate it asynchronously
    if (storedToken && storedToken.startsWith('eyJ')) {
      getAuthMe()
        .then((me) => {
          setUser(me.user);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(me.user));
        })
        .catch(() => {
          // JWT expired or invalid — clear auth
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(USER_STORAGE_KEY);
          setApiKeyState(null);
          setUser(null);
          setAuthType(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const setApiKey = useCallback((key: string) => {
    localStorage.setItem(STORAGE_KEY, key);
    setApiKeyState(key);
    setAuthType(detectAuthType(key));
    // API key users don't have user profiles
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
  }, []);

  const clearApiKey = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setApiKeyState(null);
    setUser(null);
    setAuthType(null);
  }, []);

  const loginWithCredentials = useCallback(async (username: string, password: string) => {
    const response = await apiLogin({ username, password });
    localStorage.setItem(STORAGE_KEY, response.token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.user));
    setApiKeyState(response.token);
    setUser(response.user);
    setAuthType('jwt');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        apiKey,
        isAuthenticated: !!apiKey,
        isLoading,
        authType,
        user,
        setApiKey,
        clearApiKey,
        loginWithCredentials,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
