import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMail, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { GlassCard, Button, Input } from '@sk-careerhub/ui';
import { api } from '../../services/api';
import { motion } from 'framer-motion';

const otpFormSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  otp: z.string().length(6, 'OTP must be exactly 6 characters'),
  type: z.enum(['verify-email', 'reset-password']),
});

type OTPFields = z.infer<typeof otpFormSchema>;

export const VerifyOtpPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Read email & type from router state navigation
  const stateEmail = location.state?.email || '';
  const stateType = location.state?.type || 'verify-email';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OTPFields>({
    resolver: zodResolver(otpFormSchema),
    defaultValues: {
      email: stateEmail,
      type: stateType,
    },
  });

  const onSubmit = async (data: OTPFields) => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await api.post('/auth/verify-otp', data);
      setSuccessMsg('OTP verified successfully! Redirecting...');
      
      setTimeout(() => {
        if (data.type === 'verify-email') {
          navigate('/login');
        } else {
          // If reset-password, redirect to the reset screen passing email and otp
          navigate('/reset-password', { 
            state: { 
              email: data.email, 
              otp: data.otp 
            } 
          });
        }
      }, 1500);
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!stateEmail) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      if (stateType === 'verify-email') {
        // Logging in triggers a new verification OTP
        await api.post('/auth/login', { email: stateEmail, password: 'dummy_trigger_resend' });
      } else {
        await api.post('/auth/forgot-password', { email: stateEmail });
      }
      setSuccessMsg('A new OTP has been sent to your email.');
    } catch (error: any) {
      // Login throws EMAIL_NOT_VERIFIED which is expected and means a new code was sent
      if (error.response?.data?.code === 'EMAIL_NOT_VERIFIED') {
        setSuccessMsg('A new OTP has been sent to your email.');
      } else {
        setErrorMsg('Failed to resend OTP. Please try again.');
      }
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
          <p className="text-slate-400 mt-2">Verify your authentication code</p>
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {!stateEmail ? (
              <Input
                {...register('email')}
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                icon={<FiMail />}
                error={errors.email?.message}
              />
            ) : (
              <div className="text-sm text-slate-300 mb-4 bg-white/5 border border-white/5 p-4 rounded-xl">
                Code sent to: <span className="font-semibold text-white">{stateEmail}</span>
              </div>
            )}

            <Input
              {...register('otp')}
              label="6-Digit Verification Code"
              type="text"
              placeholder="123456"
              maxLength={6}
              className="text-center tracking-widest text-lg font-bold"
              error={errors.otp?.message}
            />

            <Button type="submit" variant="premium" className="w-full justify-center" isLoading={isLoading}>
              Confirm Verification
            </Button>
          </form>

          {stateEmail ? (
            <div className="text-center mt-6 text-sm text-slate-400">
              Didn't receive the email?{' '}
              <button onClick={handleResend} className="text-brand-400 font-semibold hover:underline">
                Resend OTP
              </button>
            </div>
          ) : null}
        </GlassCard>
      </motion.div>
    </div>
  );
};
