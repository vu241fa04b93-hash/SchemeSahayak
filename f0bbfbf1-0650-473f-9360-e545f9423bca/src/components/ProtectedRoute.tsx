import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AppShell } from './AppShell';

/** Unauthenticated visitors bounce to sign-in and return here afterwards. */
export function ProtectedRoute({ children }: {children: React.ReactNode;}) {
  const { user, initialising } = useAuth();
  const location = useLocation();

  if (initialising) {
    return (
      <div className="flex min-h-full w-full items-center justify-center bg-slate-50 p-10 text-slate-500">
        Loading…
      </div>);

  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ returnTo: `${location.pathname}${location.search}` }} />);


  }

  return <AppShell>{children}</AppShell>;
}