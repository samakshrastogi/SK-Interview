import React, { useState } from 'react';
import { useAuthStore } from '../store/auth.store';
import { api } from '../services/api';
import { GlassCard, Button } from '@sk-careerhub/ui';
import { FiUser, FiCheckCircle, FiAlertCircle, FiCheck } from 'react-icons/fi';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const [profileStep, setProfileStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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
      const response = await api.post('/auth/complete-profile', formattedData);
      const { user: updatedUser } = response.data.data;
      updateUser(updatedUser);
      setSuccessMsg('Profile updated successfully! Match scores have been recalculated.');
      setProfileStep(0);
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || 'Failed to complete profile. Please verify fields.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      <GlassCard className="p-6 bg-white border border-slate-200/80 shadow-sm" hoverEffect={false}>
        <div className="flex items-center gap-2.5 mb-6 border-b border-slate-100 pb-4">
          <div className="p-2 bg-brand-500/10 border border-brand-500/20 text-brand-600 rounded-xl">
            <FiUser className="text-lg" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">AI Profile Configuration</h3>
            <p className="text-xs text-slate-500 mt-0.5">Fill in your data fields below to map eligibility scores</p>
          </div>
        </div>

        {successMsg && (
          <div className="flex items-center gap-2.5 p-4 mb-6 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs">
            <FiCheckCircle className="shrink-0 text-green-600 text-base" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="flex items-center gap-2.5 p-4 mb-6 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs">
            <FiAlertCircle className="shrink-0 text-red-600 text-base" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Wizard Step Indicators */}
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
              <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">{stepName}</span>
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
  );
};
export default ProfilePage;
