import React, { useState, useRef } from 'react';
import { useAuthStore } from '../store/auth.store';
import { api } from '../services/api';
import { GlassCard, Button } from '@sk-careerhub/ui';
import { 
  FiUser, FiCheckCircle, FiAlertCircle, FiCheck, FiEdit2, 
  FiUploadCloud, FiAward, FiBook, FiBriefcase, FiGlobe, FiCamera,
  FiBookOpen, FiFileText, FiMapPin, FiTrendingUp, FiActivity, FiDollarSign
} from 'react-icons/fi';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [profileStep, setProfileStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const getInitials = (name?: string) => {
    if (!name) return '👤';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    return parts[0].charAt(0).toUpperCase();
  };

  // Profile Form States
  const [formData, setFormData] = useState<{
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    category: 'General' | 'OBC' | 'SC' | 'ST' | 'EWS';
    state: string;
    annualIncome: number;
    qualification: string;
    experienceYears: number;
    typingSpeed: number;
    languages: string;
    skills: string;
    isPWD: boolean;
    sportsQuota: boolean;
    nccCertificate: 'None' | 'A' | 'B' | 'C';
    drivingLicense: 'None' | 'Two-Wheeler' | 'Four-Wheeler' | 'Heavy-Vehicle' | 'Both';
  }>({
    age: user?.profile?.age || 25,
    gender: (user?.profile?.gender as any) || 'Male',
    category: (user?.profile?.category as any) || 'General',
    state: user?.profile?.state || 'Delhi',
    annualIncome: user?.profile?.annualIncome || 600000,
    qualification: user?.profile?.qualification || 'Graduate',
    experienceYears: user?.profile?.experienceYears || 0,
    typingSpeed: user?.profile?.typingSpeed || 0,
    languages: user?.profile?.languages?.join(', ') || 'English, Hindi',
    skills: user?.profile?.skills?.join(', ') || 'Word, Excel',
    isPWD: user?.profile?.isPWD || false,
    sportsQuota: user?.profile?.sportsQuota || false,
    nccCertificate: (user?.profile?.nccCertificate as any) || 'None',
    drivingLicense: (user?.profile?.drivingLicense as any) || 'None'
  });

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const uploadData = new FormData();
    uploadData.append('avatar', file);

    try {
      const response = await api.post('/auth/upload-avatar', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      updateUser(response.data.data.user);
      setSuccessMsg('Profile picture uploaded successfully!');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to upload image. Verify file format.');
    } finally {
      setIsUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const uploadData = new FormData();
    uploadData.append('resume', file);

    try {
      const response = await api.post('/auth/parse-resume', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const parsed = response.data.data.parsedData;
      
      setFormData({
        age: parsed.age !== undefined ? parsed.age : formData.age,
        gender: parsed.gender || formData.gender,
        category: parsed.category || formData.category,
        state: parsed.state || formData.state,
        annualIncome: parsed.annualIncome || formData.annualIncome,
        qualification: parsed.qualification || formData.qualification,
        experienceYears: parsed.experienceYears !== undefined ? parsed.experienceYears : formData.experienceYears,
        typingSpeed: parsed.typingSpeed !== undefined ? parsed.typingSpeed : formData.typingSpeed,
        languages: parsed.languages?.length > 0 ? parsed.languages.join(', ') : formData.languages,
        skills: parsed.skills?.length > 0 ? parsed.skills.join(', ') : formData.skills,
        isPWD: parsed.isPWD !== undefined ? parsed.isPWD : formData.isPWD,
        sportsQuota: parsed.sportsQuota !== undefined ? parsed.sportsQuota : formData.sportsQuota,
        nccCertificate: parsed.nccCertificate || formData.nccCertificate,
        drivingLicense: parsed.drivingLicense || formData.drivingLicense
      });

      setSuccessMsg('Resume parsed successfully! Parsed credentials have been filled in the fields below. Review and save.');
      setProfileStep(0);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to parse resume. Verify it is a valid PDF.');
    } finally {
      setIsParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const formattedData = {
      ...formData,
      languages: formData.languages.split(',').map(s => s.trim()).filter(Boolean),
      skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean)
    };

    try {
      const response = await api.put('/auth/update-profile', { profile: formattedData });
      updateUser(response.data.data.user);
      setSuccessMsg('Profile updated successfully! Match eligibility has been recalculated.');
      setIsEditing(false);
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Failed to save profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Basic Info header card with Premium Gradient and Avatar Uploader */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 to-accent-600 p-8 text-white shadow-lg">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-white/5 skew-x-12 translate-x-1/2 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          
          {/* Avatar frame */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur border-2 border-white/30 overflow-hidden flex items-center justify-center shadow-inner relative">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-extrabold tracking-wide text-white">{getInitials(user?.fullName)}</span>
              )}

              {isUploadingAvatar && (
                <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              )}
            </div>
            
            <input 
              type="file" 
              ref={avatarInputRef} 
              onChange={handleAvatarUpload} 
              accept="image/*" 
              className="hidden" 
            />

            <button 
              onClick={() => avatarInputRef.current?.click()}
              className="absolute -bottom-1.5 -right-1.5 bg-white text-slate-800 p-2 rounded-full border border-slate-200 shadow-md hover:bg-slate-50 transition-all scale-95 group-hover:scale-100"
            >
              <FiCamera className="text-xs" />
            </button>
          </div>

          <div className="text-center md:text-left space-y-2 flex-1">
            <h3 className="text-2xl font-extrabold tracking-tight">{user?.fullName}</h3>
            <p className="text-xs text-brand-100 font-semibold">{user?.email}</p>
            <div className="flex justify-center md:justify-start pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
                {user?.role} Account
              </span>
            </div>
          </div>

          <div className="shrink-0 pt-4 md:pt-0">
            {!isEditing && (
              <Button 
                variant="premium" 
                onClick={() => setIsEditing(true)} 
                className="gap-2 bg-white text-brand-600 hover:bg-slate-50 font-bold border border-white/20 py-2.5 shadow-md"
              >
                <FiEdit2 /> Update Profile
              </Button>
            )}
          </div>

        </div>
      </div>

      {/* Alert Messages */}
      {successMsg && (
        <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-green-50 border border-green-200 text-green-800 text-xs">
          <FiCheckCircle className="shrink-0 text-green-600 text-base" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2.5 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs">
          <FiAlertCircle className="shrink-0 text-red-600 text-base" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Conditional Rendering flow: View Credentials or Wizard Forms */}
      {!isEditing ? (
        /* A. View Profile Mode (Highly attractive details overview) */
        user?.profileCompleted ? (
          <div className="space-y-6">
            
            {/* 1. Dashboard summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <GlassCard className="p-4 bg-white border border-slate-200 flex items-center gap-3.5 shadow-sm" hoverEffect={false}>
                <div className="p-2.5 bg-brand-50 border border-brand-100 text-brand-600 rounded-xl">
                  <FiBook className="text-lg" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Qualification</span>
                  <span className="text-xs font-bold text-slate-800 block truncate max-w-[120px]">{user.profile?.qualification}</span>
                </div>
              </GlassCard>

              <GlassCard className="p-4 bg-white border border-slate-200 flex items-center gap-3.5 shadow-sm" hoverEffect={false}>
                <div className="p-2.5 bg-accent-50 border border-accent-100 text-accent-600 rounded-xl">
                  <FiBriefcase className="text-lg" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Experience</span>
                  <span className="text-xs font-bold text-slate-800 block">{user.profile?.experienceYears} Years</span>
                </div>
              </GlassCard>

              <GlassCard className="p-4 bg-white border border-slate-200 flex items-center gap-3.5 shadow-sm" hoverEffect={false}>
                <div className="p-2.5 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl">
                  <FiMapPin className="text-lg" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Residency</span>
                  <span className="text-xs font-bold text-slate-800 block">{user.profile?.state}</span>
                </div>
              </GlassCard>

              <GlassCard className="p-4 bg-white border border-slate-200 flex items-center gap-3.5 shadow-sm" hoverEffect={false}>
                <div className="p-2.5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl">
                  <FiDollarSign className="text-lg" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Annual Income</span>
                  <span className="text-xs font-bold text-slate-800 block">₹{user.profile?.annualIncome?.toLocaleString()}</span>
                </div>
              </GlassCard>
            </div>

            {/* 2. Structured credentials table cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <GlassCard className="p-6 bg-white border border-slate-200 shadow-sm space-y-4" hoverEffect={false}>
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <FiUser className="text-brand-600 text-base" />
                  <h4 className="font-extrabold text-slate-800 text-sm">Personal Profiles</h4>
                </div>

                <div className="space-y-3.5 text-xs text-slate-650">
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-400 font-semibold">Age threshold:</span>
                    <span className="font-bold text-slate-800">{user.profile?.age} Years</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-400 font-semibold">Gender group:</span>
                    <span className="font-bold text-slate-800">{user.profile?.gender}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-400 font-semibold">Category caste:</span>
                    <span className="font-bold text-slate-800">{user.profile?.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold">Typing matrix:</span>
                    <span className="font-bold text-slate-800">{user.profile?.typingSpeed || 0} WPM</span>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-6 bg-white border border-slate-200 shadow-sm space-y-4" hoverEffect={false}>
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <FiAward className="text-brand-600 text-base" />
                  <h4 className="font-extrabold text-slate-800 text-sm">Reservations & Quotas</h4>
                </div>

                <div className="space-y-3.5 text-xs text-slate-650">
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-400 font-semibold">Physically Disabled (PWD):</span>
                    <span className={`font-bold ${user.profile?.isPWD ? 'text-green-600' : 'text-slate-700'}`}>{user.profile?.isPWD ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-400 font-semibold">Sports Quota candidate:</span>
                    <span className={`font-bold ${user.profile?.sportsQuota ? 'text-green-600' : 'text-slate-700'}`}>{user.profile?.sportsQuota ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-400 font-semibold">NCC Cadet Certificate:</span>
                    <span className="font-bold text-slate-850">{user.profile?.nccCertificate || 'None'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold">Driving License:</span>
                    <span className="font-bold text-slate-850">{user.profile?.drivingLicense || 'None'}</span>
                  </div>
                </div>
              </GlassCard>

            </div>

            {/* 3. Skills and Languages tags cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <GlassCard className="p-6 bg-white border border-slate-200 shadow-sm space-y-4" hoverEffect={false}>
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <FiActivity className="text-brand-600 text-base animate-pulse" />
                  <h4 className="font-extrabold text-slate-800 text-sm">Extracted Profile Skills</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {user.profile?.skills?.map((s, i) => (
                    <span key={i} className="text-[10px] font-bold bg-slate-100 text-slate-650 px-3 py-1.5 rounded-xl border border-slate-200/60 shadow-sm">
                      {s}
                    </span>
                  )) || <span className="text-xs text-slate-400 italic">No skills added</span>}
                </div>
              </GlassCard>

              <GlassCard className="p-6 bg-white border border-slate-200 shadow-sm space-y-4" hoverEffect={false}>
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <FiGlobe className="text-brand-600 text-base" />
                  <h4 className="font-extrabold text-slate-800 text-sm">Spoken Languages</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {user.profile?.languages?.map((s, i) => (
                    <span key={i} className="text-[10px] font-bold bg-slate-100 text-slate-650 px-3 py-1.5 rounded-xl border border-slate-200/60 shadow-sm">
                      {s}
                    </span>
                  )) || <span className="text-xs text-slate-400 italic">No languages added</span>}
                </div>
              </GlassCard>

            </div>

          </div>
        ) : (
          <GlassCard className="p-8 text-center bg-white border border-slate-200 shadow-sm space-y-4" hoverEffect={false}>
            <FiAlertCircle className="text-4xl text-amber-500 mx-auto" />
            <div>
              <h4 className="text-lg font-bold text-slate-800">Your profile is incomplete</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                Unlock government matching indices and AI diagnostics by completing your details dashboard.
              </p>
            </div>
            <Button variant="primary" onClick={() => setIsEditing(true)}>
              Setup Credentials
            </Button>
          </GlassCard>
        )
      ) : (
        /* B. Edit Mode (Only display upload and forms when "Update Profile" is active) */
        <div className="space-y-6">
          
          {/* 1. Resume upload parser widget */}
          <GlassCard className="p-6 bg-white border border-slate-200 shadow-sm" hoverEffect={false}>
            <div className="flex items-center gap-2.5 mb-4 border-b border-slate-100 pb-3">
              <div className="p-2 bg-brand-500/10 border border-brand-500/20 text-brand-600 rounded-xl">
                <FiUploadCloud className="text-base" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Resume Upload & Auto-Fill</h4>
            </div>

            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleResumeUpload} 
              accept=".pdf" 
              className="hidden" 
            />

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-brand-500 hover:bg-slate-50/50 rounded-2xl p-6 text-center cursor-pointer transition-all space-y-2"
            >
              <FiUploadCloud className="text-3xl text-slate-400 mx-auto" />
              <div>
                <span className="text-xs font-bold text-slate-800 block">Click to upload your PDF Resume</span>
                <span className="text-[10px] text-slate-400 mt-1 block">Our AI engine will parse details, auto-fill all steps, and leave optional fields blank</span>
              </div>
              {isParsing && (
                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-brand-600">
                  <svg className="animate-spin h-4 w-4 text-brand-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Parsing resume text nodes...</span>
                </div>
              )}
            </div>
          </GlassCard>

          {/* 2. Step Form Wizard */}
          <GlassCard className="p-6 bg-white border border-slate-200 shadow-sm" hoverEffect={false}>
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-100">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Personal Info Update Wizard</h4>
                <p className="text-[10px] text-slate-400">Review details parsed from resume or edit them</p>
              </div>
              {user?.profileCompleted && (
                <button 
                  onClick={() => setIsEditing(false)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <div className="flex justify-between items-center mb-8 max-w-md mx-auto">
              {['Personal Info', 'Education & Work', 'Quota Details'].map((stepName, i) => (
                <div key={i} className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => setProfileStep(i)}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border ${
                    profileStep === i 
                      ? 'bg-brand-600 border-brand-500 text-white' 
                      : profileStep > i 
                        ? 'bg-green-600 border-green-500 text-white' 
                        : 'bg-slate-100 border-slate-200 text-slate-500'
                  }`}>
                    {profileStep > i ? <FiCheck /> : i + 1}
                  </div>
                  <span className="text-[8px] sm:text-[9px] uppercase font-bold tracking-wider text-slate-400 text-center max-w-[80px] sm:max-w-none">{stepName}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              {profileStep === 0 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5 w-full">
                      <label className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Age</label>
                      <input 
                        type="number"
                        required
                        min={16}
                        max={60}
                        value={formData.age}
                        onChange={(e) => setFormData({...formData, age: parseInt(e.target.value, 10)})}
                        className="w-full rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 outline-none focus:border-brand-500"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5 w-full">
                      <label className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Gender</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({...formData, gender: e.target.value as any})}
                        className="w-full rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 outline-none focus:border-brand-500"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5 w-full">
                      <label className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                        className="w-full rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 outline-none focus:border-brand-500"
                      >
                        <option value="General">General</option>
                        <option value="OBC">OBC (Other Backward Classes)</option>
                        <option value="SC">SC (Scheduled Caste)</option>
                        <option value="ST">ST (Scheduled Tribe)</option>
                        <option value="EWS">EWS (Economically Weaker Section)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5 w-full">
                      <label className="text-xs font-semibold tracking-wide text-slate-500 uppercase">State of Residence</label>
                      <input 
                        type="text"
                        required
                        value={formData.state}
                        onChange={(e) => setFormData({...formData, state: e.target.value})}
                        placeholder="Uttar Pradesh"
                        className="w-full rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Annual Income (INR)</label>
                    <input 
                      type="number"
                      required
                      value={formData.annualIncome}
                      onChange={(e) => setFormData({...formData, annualIncome: parseInt(e.target.value, 10)})}
                      className="w-full rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <Button type="button" variant="primary" onClick={() => setProfileStep(1)}>
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {profileStep === 1 && (
                <div className="space-y-6">
                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Highest Qualification</label>
                    <input 
                      type="text"
                      required
                      value={formData.qualification}
                      onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                      placeholder="Graduate (e.g. B.Tech Computer Science)"
                      className="w-full rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5 w-full">
                      <label className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Experience (Years)</label>
                      <input 
                        type="number"
                        required
                        value={formData.experienceYears}
                        onChange={(e) => setFormData({...formData, experienceYears: parseInt(e.target.value, 10)})}
                        className="w-full rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 outline-none focus:border-brand-500"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5 w-full">
                      <label className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Typing Speed (WPM)</label>
                      <input 
                        type="number"
                        required
                        value={formData.typingSpeed}
                        onChange={(e) => setFormData({...formData, typingSpeed: parseInt(e.target.value, 10)})}
                        className="w-full rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Languages (comma separated)</label>
                    <input 
                      type="text"
                      value={formData.languages}
                      onChange={(e) => setFormData({...formData, languages: e.target.value})}
                      className="w-full rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Skills (comma separated)</label>
                    <input 
                      type="text"
                      value={formData.skills}
                      onChange={(e) => setFormData({...formData, skills: e.target.value})}
                      className="w-full rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="flex justify-between pt-4 border-t border-slate-100">
                    <Button type="button" variant="outline" onClick={() => setProfileStep(0)}>
                      Previous
                    </Button>
                    <Button type="button" variant="primary" onClick={() => setProfileStep(2)}>
                      Next Step
                    </Button>
                  </div>
                </div>
              )}

              {profileStep === 2 && (
                <div className="space-y-6">
                  <div className="flex flex-col gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox"
                        id="isPWD"
                        checked={formData.isPWD}
                        onChange={(e) => setFormData({...formData, isPWD: e.target.checked})}
                        className="rounded border-slate-300 text-brand-600 focus:ring-brand-500/20 w-4.5 h-4.5"
                      />
                      <label htmlFor="isPWD" className="text-xs font-bold text-slate-700 uppercase cursor-pointer">
                        PWD Candidate (Physically Disabled)
                      </label>
                    </div>

                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox"
                        id="sportsQuota"
                        checked={formData.sportsQuota}
                        onChange={(e) => setFormData({...formData, sportsQuota: e.target.checked})}
                        className="rounded border-slate-300 text-brand-600 focus:ring-brand-500/20 w-4.5 h-4.5"
                      />
                      <label htmlFor="sportsQuota" className="text-xs font-bold text-slate-700 uppercase cursor-pointer">
                        Sports Quota Merit
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5 w-full">
                      <label className="text-xs font-semibold tracking-wide text-slate-500 uppercase">NCC Certificate</label>
                      <select
                        value={formData.nccCertificate}
                        onChange={(e) => setFormData({...formData, nccCertificate: e.target.value as any})}
                        className="w-full rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 outline-none focus:border-brand-500"
                      >
                        <option value="None">None</option>
                        <option value="A">A Certificate</option>
                        <option value="B">B Certificate</option>
                        <option value="C">C Certificate</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5 w-full">
                      <label className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Driving License</label>
                      <select
                        value={formData.drivingLicense}
                        onChange={(e) => setFormData({...formData, drivingLicense: e.target.value as any})}
                        className="w-full rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 outline-none focus:border-brand-500"
                      >
                        <option value="None">None</option>
                        <option value="Two-Wheeler">Two-Wheeler</option>
                        <option value="Four-Wheeler">Four-Wheeler</option>
                        <option value="Heavy-Vehicle">Heavy-Vehicle</option>
                        <option value="Both">Both (Two & Four-Wheeler)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4 border-t border-slate-100">
                    <Button type="button" variant="outline" onClick={() => setProfileStep(1)}>
                      Previous
                    </Button>
                    <Button type="submit" variant="premium" isLoading={isSaving}>
                      Save Changes
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </GlassCard>
        </div>
      )}

    </div>
  );
};
export default ProfilePage;
