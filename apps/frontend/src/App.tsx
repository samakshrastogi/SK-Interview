import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/auth.store';
import { api } from './services/api';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { VerifyOtpPage } from './pages/auth/VerifyOtpPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { DashboardLayout } from './pages/DashboardLayout';
import { GovExamsPage } from './pages/GovExamsPage';
import { PrivateJobsPage } from './pages/PrivateJobsPage';
import { MockInterviewPage } from './pages/MockInterviewPage';
import { MentorsPage } from './pages/MentorsPage';
import { ProfilePage } from './pages/ProfilePage';

const queryClient = new QueryClient();

// Route Guard: Protect authenticated views
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuthStore();

  if (!token) {
    return <Navigate to="/login" replace />;
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
  const { initTheme, setAuth, clearAuth } = useAuthStore();
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Initialize theme and perform session check on mount
  useEffect(() => {
    initTheme();

    const verifySession = async () => {
      try {
        const response = await api.get('/auth/me');
        const { user } = response.data.data;
        
        // Refresh session to fetch access token
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-brand-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
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
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="exams" replace />} />
            <Route path="exams" element={<GovExamsPage />} />
            <Route path="private-jobs" element={<PrivateJobsPage />} />
            <Route path="mock-interview" element={<MockInterviewPage />} />
            <Route path="mentors" element={<MentorsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};
export default App;
