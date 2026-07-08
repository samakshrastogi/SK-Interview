import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { GlassCard, Button, Input } from '@sk-careerhub/ui';
import { api } from '../services/api';
import { useAuthStore } from '../store/auth.store';
import { FiCheck, FiAlertCircle, FiUser, FiSliders, FiFileText } from 'react-icons/fi';
import { motion } from 'framer-motion';

const profileFormSchema = z.object({
  age: z.coerce.number().int().min(16, 'Age must be at least 16').max(60, 'Age must be under 60'),
  qualification: z.string().min(2, 'Qualification is required'),
  category: z.enum(['General', 'OBC', 'SC', 'ST', 'EWS']),
  gender: z.enum(['Male', 'Female', 'Other']),
  experienceYears: z.coerce.number().nonnegative().default(0),
  state: z.string().min(2, 'State is required'),
  isPWD: z.boolean().default(false),
  sportsQuota: z.boolean().default(false),
  nccCertificate: z.enum(['None', 'A', 'B', 'C']).default('None'),
  annualIncome: z.coerce.number().nonnegative().optional(),
  languages: z.string().transform((val) => val.split(',').map(s => s.trim()).filter(Boolean)),
  typingSpeed: z.coerce.number().nonnegative().default(0),
  hasComputerCertificate: z.boolean().default(false),
  drivingLicense: z.enum(['None', 'Two-Wheeler', 'Four-Wheeler', 'Heavy-Vehicle', 'Both']).default('None'),
  skills: z.string().transform((val) => val.split(',').map(s => s.trim()).filter(Boolean)),
});

type ProfileFields = z.input<typeof profileFormSchema>;

export const ProfileCompletion: React.FC = () => {
  const navigate = useNavigate();
  const updateUser = useAuthStore((state) => state.updateUser);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<ProfileFields>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      category: 'General',
      gender: 'Male',
      nccCertificate: 'None',
      drivingLicense: 'None',
      isPWD: false,
      sportsQuota: false,
      hasComputerCertificate: false,
      experienceYears: 0,
      typingSpeed: 0,
    }
  });

  const nextStep = async () => {
    // Validate current step fields before progressing
    let fieldsToValidate: any[] = [];
    if (activeStep === 0) {
      fieldsToValidate = ['age', 'gender', 'category', 'state', 'annualIncome'];
    } else if (activeStep === 1) {
      fieldsToValidate = ['qualification', 'experienceYears', 'typingSpeed', 'languages', 'skills'];
    }
    
    const isValid = await trigger(fieldsToValidate as any);
    if (isValid) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setActiveStep((prev) => prev - 1);
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await api.post('/auth/complete-profile', data);
      const { user } = response.data.data;
      updateUser(user);
      navigate('/dashboard');
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Failed to complete profile. Please verify your fields.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen py-24 px-6 flex flex-col items-center justify-center">
      <div className="mesh-bg" />
      
      <div className="w-full max-w-2xl relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-transparent">
            Complete Your Profile
          </h1>
          <p className="text-slate-400 mt-2">SK CareerHub AI matches your eligibility profiles dynamically</p>
        </div>

        {/* Form stepper indicators */}
        <div className="flex justify-between items-center mb-8 max-w-md mx-auto">
          {['Personal Details', 'Education & Work', 'Certifications & Quotas'].map((stepName, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border ${
                activeStep === i 
                  ? 'bg-brand-600 border-brand-500 text-white' 
                  : activeStep > i 
                    ? 'bg-green-600 border-green-500 text-white' 
                    : 'bg-white/5 border-white/10 text-slate-500'
              }`}>
                {activeStep > i ? <FiCheck /> : i + 1}
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">{stepName}</span>
            </div>
          ))}
        </div>

        <GlassCard className="p-8" hoverEffect={false}>
          {errorMsg ? (
            <div className="flex items-center gap-2 p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              <FiAlertCircle className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          ) : null}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {activeStep === 0 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    {...register('age')}
                    label="Age"
                    type="number"
                    placeholder="25"
                    error={errors.age?.message}
                  />
                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-xs font-semibold tracking-wide text-slate-300 uppercase">Gender</label>
                    <select
                      {...register('gender')}
                      className="w-full rounded-xl text-sm bg-darkbg-card/50 backdrop-blur-md border border-white/10 text-slate-300 px-4 py-3 outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/20"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-xs font-semibold tracking-wide text-slate-300 uppercase">Category</label>
                    <select
                      {...register('category')}
                      className="w-full rounded-xl text-sm bg-darkbg-card/50 backdrop-blur-md border border-white/10 text-slate-300 px-4 py-3 outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/20"
                    >
                      <option value="General">General</option>
                      <option value="OBC">OBC (Other Backward Classes)</option>
                      <option value="SC">SC (Scheduled Caste)</option>
                      <option value="ST">ST (Scheduled Tribe)</option>
                      <option value="EWS">EWS (Economically Weaker Section)</option>
                    </select>
                  </div>

                  <Input
                    {...register('state')}
                    label="State of Residence"
                    type="text"
                    placeholder="Maharashtra"
                    error={errors.state?.message}
                  />
                </div>

                <Input
                  {...register('annualIncome')}
                  label="Annual Family Income (in INR)"
                  type="number"
                  placeholder="600000"
                  error={errors.annualIncome?.message}
                />
              </motion.div>
            )}

            {activeStep === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <Input
                  {...register('qualification')}
                  label="Highest Qualification / Degree"
                  type="text"
                  placeholder="B.Tech Computer Science / HSC / 10th Standard"
                  error={errors.qualification?.message}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    {...register('experienceYears')}
                    label="Years of Work Experience"
                    type="number"
                    placeholder="0"
                    error={errors.experienceYears?.message}
                  />

                  <Input
                    {...register('typingSpeed')}
                    label="Typing Speed (WPM)"
                    type="number"
                    placeholder="40"
                    error={errors.typingSpeed?.message}
                  />
                </div>

                <Input
                  {...register('languages')}
                  label="Languages (comma separated)"
                  type="text"
                  placeholder="English, Hindi, Marathi"
                  helperText="Enter languages you can speak, read or write."
                />

                <Input
                  {...register('skills')}
                  label="Skills (comma separated)"
                  type="text"
                  placeholder="Python, C++, SQL, Word, Excel"
                />
              </motion.div>
            )}

            {activeStep === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                
                <div className="grid grid-cols-2 gap-4 bg-white/5 border border-white/5 p-4 rounded-xl">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isPWD"
                      {...register('isPWD')}
                      className="rounded border-white/10 text-brand-600 focus:ring-brand-500/20 bg-darkbg-card/50"
                    />
                    <label htmlFor="isPWD" className="text-xs font-semibold text-slate-300 uppercase cursor-pointer">
                      PWD Candidate (Disability)
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="sportsQuota"
                      {...register('sportsQuota')}
                      className="rounded border-white/10 text-brand-600 focus:ring-brand-500/20 bg-darkbg-card/50"
                    />
                    <label htmlFor="sportsQuota" className="text-xs font-semibold text-slate-300 uppercase cursor-pointer">
                      Sports Quota Eligible
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-xs font-semibold tracking-wide text-slate-300 uppercase">NCC Certificate</label>
                    <select
                      {...register('nccCertificate')}
                      className="w-full rounded-xl text-sm bg-darkbg-card/50 backdrop-blur-md border border-white/10 text-slate-300 px-4 py-3 outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/20"
                    >
                      <option value="None">None</option>
                      <option value="A">A Certificate</option>
                      <option value="B">B Certificate</option>
                      <option value="C">C Certificate</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-xs font-semibold tracking-wide text-slate-300 uppercase">Driving License Type</label>
                    <select
                      {...register('drivingLicense')}
                      className="w-full rounded-xl text-sm bg-darkbg-card/50 backdrop-blur-md border border-white/10 text-slate-300 px-4 py-3 outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-500/20"
                    >
                      <option value="None">None</option>
                      <option value="Two-Wheeler">Two-Wheeler</option>
                      <option value="Four-Wheeler">Four-Wheeler</option>
                      <option value="Heavy-Vehicle">Heavy-Vehicle</option>
                      <option value="Both">Both (Two & Four-Wheeler)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-4 bg-brand-500/10 border border-brand-500/20 rounded-xl text-slate-300">
                  <FiFileText className="text-2xl text-brand-400 shrink-0" />
                  <span className="text-xs leading-relaxed">
                    Resume parser and details analysis will be available in Phase 4. For now, complete your profile configurations to begin eligibility matching.
                  </span>
                </div>
              </motion.div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-white/5">
              {activeStep > 0 ? (
                <Button type="button" variant="outline" onClick={prevStep}>
                  Previous
                </Button>
              ) : (
                <div />
              )}

              {activeStep < 2 ? (
                <Button type="button" variant="primary" onClick={nextStep}>
                  Next
                </Button>
              ) : (
                <Button type="submit" variant="premium" isLoading={isLoading}>
                  Finish Setup
                </Button>
              )}
            </div>

          </form>
        </GlassCard>
      </div>
    </div>
  );
};
