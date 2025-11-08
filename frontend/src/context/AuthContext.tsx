import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { setAuthToken } from '../services/api';
import { AuthResponse, User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'finance-dashboard-auth';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const navigate = useNavigate();
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    loading: true,
  });

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as AuthResponse;
        setAuthToken(parsed.token);
        setState({ user: parsed.user, token: parsed.token, loading: false });
        return;
      } catch (error) {
        console.warn('Failed to parse stored auth state', error);
      }
    }
    setState((prev) => ({ ...prev, loading: false }));
  }, []);

  const persistAuth = useCallback((data: AuthResponse) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setAuthToken(data.token);
    setState({ user: data.user, token: data.token, loading: false });
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      setState((prev) => ({ ...prev, loading: true }));
      try {
        const response = await api.post<AuthResponse>('/auth/login', { email, password });
        persistAuth(response.data);
        navigate('/dashboard', { replace: true });
      } catch (error) {
        setState((prev) => ({ ...prev, loading: false }));
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('Unable to sign in. Please try again.');
      }
    },
    [navigate, persistAuth]
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      setState((prev) => ({ ...prev, loading: true }));
      try {
        const response = await api.post<AuthResponse>('/auth/register', { name, email, password });
        persistAuth(response.data);
        navigate('/dashboard', { replace: true });
      } catch (error) {
        setState((prev) => ({ ...prev, loading: false }));
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('Unable to register. Please try again.');
      }
    },
    [navigate, persistAuth]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setAuthToken(null);
    setState({ user: null, token: null, loading: false });
    navigate('/login', { replace: true });
  }, [navigate]);

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, login, register, logout }),
    [login, register, logout, state]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}
