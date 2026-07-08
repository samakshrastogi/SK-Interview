import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiLock, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { GlassCard, Button, Input } from '@sk-careerhub/ui';
import { api } from '../../services/api';
import { motion } from 'framer-motion';

const resetPasswordFormSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  otp: z.string().length(6, 'OTP must be exactly 6 characters'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters long'),
  confirmPassword: z.string().min(1, 'Confirm password is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ResetPasswordFields = z.infer<typeof resetPasswordFormSchema>;

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const stateEmail = location.state?.email || '';
  const stateOtp = location.state?.otp || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFields>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      email: stateEmail,
      otp: stateOtp,
    },
  });

  const onSubmit = async (data: ResetPasswordFields) => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await api.post('/auth/reset-password', {
        email: data.email,
        otp: data.otp,
        newPassword: data.newPassword,
      });

      setSuccessMsg('Password reset successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Failed to reset password. Please request a new code.');
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
          <p className="text-slate-400 mt-2">Choose your new secure password</p>
        </div>

        <GlassCard className="p-8" hoverEffect={false}>
          {errorMsg ? (
            <div className="flex items-center gap-2 p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              <FiAlertCircle className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          ) : null}

          {successMsg ? (
            <div className="flex items-center gap-2 p-4 mb-6 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
              <FiCheck className="shrink-0" />
              <span>{successMsg}</span>
            </div>
          ) : null}

          {(!stateEmail || !stateOtp) ? (
            <div className="p-4 mb-6 text-sm text-yellow-500 bg-yellow-500/15 border border-yellow-500/20 rounded-xl">
              ⚠️ Warning: Missing email validation session. Return to <Link to="/forgot-password" className="underline font-semibold">Forgot Password</Link> to initiate.
            </div>
          ) : null}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Hidden fields initialized from state */}
            <input type="hidden" {...register('email')} />
            <input type="hidden" {...register('otp')} />

            <Input
              {...register('newPassword')}
              label="New Password"
              type="password"
              placeholder="••••••••"
              icon={<FiLock />}
              error={errors.newPassword?.message}
            />

            <Input
              {...register('confirmPassword')}
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              icon={<FiLock />}
              error={errors.confirmPassword?.message}
            />

            <Button
              type="submit"
              variant="premium"
              className="w-full justify-center"
              isLoading={isLoading}
              disabled={!stateEmail || !stateOtp}
            >
              Update Password
            </Button>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
};
