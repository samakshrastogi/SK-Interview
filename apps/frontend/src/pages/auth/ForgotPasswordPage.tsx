import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { GlassCard, Button, Input } from '@sk-careerhub/ui';
import { api } from '../../services/api';
import { motion } from 'framer-motion';

const forgotPasswordFormSchema = z.object({
  email: z.string().email('Enter a valid email address'),
});

type ForgotPasswordFields = z.infer<typeof forgotPasswordFormSchema>;

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFields>({
    resolver: zodResolver(forgotPasswordFormSchema),
  });

  const onSubmit = async (data: ForgotPasswordFields) => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await api.post('/auth/forgot-password', data);
      setSuccessMsg('If the email is registered, we have sent a reset code.');
      
      setTimeout(() => {
        navigate('/verify-otp', { 
          state: { 
            email: data.email, 
            type: 'reset-password' 
          } 
        });
      }, 2000);
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Something went wrong. Please try again.');
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
          <p className="text-slate-400 mt-2">Reset your account password</p>
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
            <Input
              {...register('email')}
              label="Registered Email Address"
              type="email"
              placeholder="you@example.com"
              icon={<FiMail />}
              error={errors.email?.message}
            />

            <Button type="submit" variant="premium" className="w-full justify-center" isLoading={isLoading}>
              Send Reset Code
            </Button>
          </form>

          <div className="text-center mt-6 text-sm text-slate-400">
            Remembered your password?{' '}
            <Link to="/login" className="text-brand-400 font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};
