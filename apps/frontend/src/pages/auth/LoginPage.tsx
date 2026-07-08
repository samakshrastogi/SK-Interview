import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiAlertCircle } from 'react-icons/fi';
import { GlassCard, Button, Input } from '@sk-careerhub/ui';
import { useAuthStore } from '../../store/auth.store';
import { api } from '../../services/api';
import { motion } from 'framer-motion';

const loginFormSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFields = z.infer<typeof loginFormSchema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFields>({
    resolver: zodResolver(loginFormSchema),
  });

  const onSubmit = async (data: LoginFields) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await api.post('/auth/login', data);
      const { user, accessToken } = response.data.data;
      
      setAuth(user, accessToken);
      
      if (!user.profileCompleted) {
        navigate('/complete-profile');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      const respData = error.response?.data;
      if (respData?.code === 'EMAIL_NOT_VERIFIED') {
        // Redirect to OTP verify screen
        navigate('/verify-otp', { state: { email: data.email, type: 'verify-email' } });
      } else {
        setErrorMsg(respData?.message || 'Login failed. Please check credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 py-12">
      <div className="mesh-bg" />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-extrabold bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-transparent">
            SK CareerHub AI
          </Link>
          <p className="text-slate-400 mt-2">Sign in to your account to prepare</p>
        </div>

        <GlassCard className="p-8" hoverEffect={false}>
          {errorMsg ? (
            <div className="flex items-center gap-2 p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              <FiAlertCircle className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          ) : null}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              {...register('email')}
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              icon={<FiMail />}
              error={errors.email?.message}
            />

            <div className="space-y-1">
              <Input
                {...register('password')}
                label="Password"
                type="password"
                placeholder="••••••••"
                icon={<FiLock />}
                error={errors.password?.message}
              />
              <div className="text-right">
                <Link to="/forgot-password" className="text-xs text-brand-400 hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button type="submit" variant="premium" className="w-full justify-center" isLoading={isLoading}>
              Sign In
            </Button>
          </form>

          <div className="text-center mt-6 text-sm text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-400 font-semibold hover:underline">
              Create one for free
            </Link>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

