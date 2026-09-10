import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { AuthUser, ConnectionMode } from '../types';
import { authService } from '../services';
import { ServiceError, getMode, subscribeMode } from '../services/apiClient';

export type AuthErrorCode =
'not_found' |
'wrong_password' |
'exists' |
'network' |
'validation';

interface AuthValue {
  user: AuthUser | null;
  initialising: boolean;
  mode: ConnectionMode;
  register: (input: {
    full_name: string;
    email: string;
    password: string;
    phone?: string;
  }) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);

function toAuthError(e: unknown): AuthErrorCode {
  if (e instanceof ServiceError) {
    if (e.code === 'not_found') return 'not_found';
    if (e.code === 'unauthorized') return 'wrong_password';
    if (e.code === 'conflict') return 'exists';
    if (e.code === 'network') return 'network';
    return 'validation';
  }
  return 'network';
}

export class AuthError extends Error {
  code: AuthErrorCode;
  constructor(code: AuthErrorCode) {
    super(code);
    this.name = 'AuthError';
    this.code = code;
  }
}

export function AuthProvider({ children }: {children: React.ReactNode;}) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [initialising, setInitialising] = useState(true);
  const [mode, setModeState] = useState<ConnectionMode>(getMode());

  useEffect(() => {
    setUser(authService.getCurrentUser());
    setInitialising(false);
    return subscribeMode(setModeState);
  }, []);

  const register = useCallback<AuthValue['register']>(async (input) => {
    try {
      setUser(await authService.register(input));
    } catch (e) {
      throw new AuthError(toAuthError(e));
    }
  }, []);

  const login = useCallback<AuthValue['login']>(async (email, password) => {
    try {
      setUser(await authService.login(email, password));
    } catch (e) {
      throw new AuthError(toAuthError(e));
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const value = useMemo<AuthValue>(
    () => ({ user, initialising, mode, register, login, logout }),
    [user, initialising, mode, register, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}