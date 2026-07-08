import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiUser, FiAlertCircle } from 'react-icons/fi';
import { GlassCard, Button, Input } from '@sk-careerhub/ui';
import { api } from '../../services/api';
import { motion } from 'framer-motion';

const registerFormSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['user', 'mentor']).default('user'),
});

type RegisterFields = z.infer<typeof registerFormSchema>;

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'user' | 'mentor'>('user');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFields>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      role: 'user',
    },
  });

  const onSubmit = async (data: RegisterFields) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await api.post('/auth/register', data);
      
      // Navigate to OTP verification screen
      navigate('/verify-otp', { 
        state: { 
          email: data.email, 
          type: 'verify-email' 
        } 
      });
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Registration failed. Please check details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSelect = (role: 'user' | 'mentor') => {
    setSelectedRole(role);
    setValue('role', role);
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
          <p className="text-slate-400 mt-2">Create an account to begin your journey</p>
        </div>

        <GlassCard className="p-8" hoverEffect={false}>
          {errorMsg ? (
            <div className="flex items-center gap-2 p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              <FiAlertCircle className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          ) : null}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Custom Role Selector tabs */}
            <div className="flex gap-4 p-1.5 bg-slate-200/50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl">
              <button
                type="button"
                onClick={() => handleRoleSelect('user')}
                className={`flex-1 py-2 text-center text-xs font-semibold rounded-lg transition-all ${
                  selectedRole === 'user'
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                Aspirant
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect('mentor')}
                className={`flex-1 py-2 text-center text-xs font-semibold rounded-lg transition-all ${
                  selectedRole === 'mentor'
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                Mentor
              </button>
            </div>

            <Input
              {...register('fullName')}
              label="Full Name"
              type="text"
              placeholder="Samaksh Rastogi"
              icon={<FiUser />}
              error={errors.fullName?.message}
            />

            <Input
              {...register('email')}
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              icon={<FiMail />}
              error={errors.email?.message}
            />

            <Input
              {...register('password')}
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={<FiLock />}
              error={errors.password?.message}
            />

            <Button type="submit" variant="premium" className="w-full justify-center" isLoading={isLoading}>
              Sign Up
            </Button>
          </form>

          <div className="text-center mt-6 text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};
