import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { I18nProvider } from './contexts/I18nContext';
import { UserDataProvider } from './contexts/UserDataContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Landing } from './pages/Landing';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { ProfileForm } from './pages/ProfileForm';
import { Assistant } from './pages/Assistant';
import { Results } from './pages/Results';
import { SchemeDetail } from './pages/SchemeDetail';
import { Financing } from './pages/Financing';
import { Readiness } from './pages/Readiness';

export function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <UserDataProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Auth mode="login" />} />
              <Route path="/register" element={<Auth mode="register" />} />
              <Route
                path="/dashboard"
                element={
                <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
              
              <Route
                path="/profile"
                element={
                <ProtectedRoute>
                    <ProfileForm />
                  </ProtectedRoute>
                } />
              
              <Route
                path="/assistant"
                element={
                <ProtectedRoute>
                    <Assistant />
                  </ProtectedRoute>
                } />
              
              <Route
                path="/results"
                element={
                <ProtectedRoute>
                    <Results />
                  </ProtectedRoute>
                } />
              
              <Route
                path="/scheme/:schemeId"
                element={
                <ProtectedRoute>
                    <SchemeDetail />
                  </ProtectedRoute>
                } />
              
              <Route
                path="/financing"
                element={
                <ProtectedRoute>
                    <Financing />
                  </ProtectedRoute>
                } />
              
              <Route
                path="/readiness"
                element={
                <ProtectedRoute>
                    <Readiness />
                  </ProtectedRoute>
                } />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </UserDataProvider>
      </AuthProvider>
    </I18nProvider>);

}