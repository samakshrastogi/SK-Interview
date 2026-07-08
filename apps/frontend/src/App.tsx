import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/auth.store';
import { api } from './services/api';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { VerifyOtpPage } from './pages/auth/VerifyOtpPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { ProfileCompletion } from './pages/ProfileCompletion';
import { Dashboard } from './pages/Dashboard';
import { FiSun, FiMoon } from 'react-icons/fi';

const queryClient = new QueryClient();

// Route Guard: Protect authenticated views
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user } = useAuthStore();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Force incomplete profile users to the onboarding builder
  if (user && !user.profileCompleted && window.location.pathname !== '/complete-profile') {
    return <Navigate to="/complete-profile" replace />;
  }

  return <>{children}</>;
};

// Route Guard: Prevent signed-in users from seeing authentication forms
const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = useAuthStore((state) => state.token);

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  const { initTheme, toggleTheme, theme, setAuth, clearAuth } = useAuthStore();
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Initialize theme and perform auto-login checks (using HTTP-Only cookies) on mount
  useEffect(() => {
    initTheme();

    const verifySession = async () => {
      try {
        const response = await api.get('/auth/me');
        const { user } = response.data.data;
        
        // Since cookies are validated, perform token refresh to fetch the access token
        const refreshResponse = await api.post('/auth/refresh');
        const { accessToken } = refreshResponse.data.data;

        setAuth(user, accessToken);
      } catch (err) {
        clearAuth();
      } finally {
        setCheckingAuth(false);
      }
    };

    verifySession();
  }, [initTheme, setAuth, clearAuth]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-darkbg-base flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-brand-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {/* Floating global theme toggler */}
        <button
          onClick={toggleTheme}
          className="fixed top-6 right-6 z-50 p-3 rounded-full bg-white/10 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-md text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all shadow-lg"
          aria-label="Toggle Theme"
        >
          {theme === 'light' ? <FiMoon className="text-lg" /> : <FiSun className="text-lg" />}
        </button>

        <Routes>
          {/* Public Views */}
          <Route path="/" element={<LandingPage />} />

          {/* Guest Auth Views */}
          <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
          <Route path="/register" element={<AuthRoute><RegisterPage /></AuthRoute>} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Guarded Views */}
          <Route path="/complete-profile" element={<ProtectedRoute><ProfileCompletion /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};
export default App;
