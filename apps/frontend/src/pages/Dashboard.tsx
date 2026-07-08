import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { GlassCard, Button, Input } from '@sk-careerhub/ui';
import { 
  FiLogOut, FiUser, FiInfo, FiSearch, FiSliders, 
  FiCalendar, FiAward, FiAlertCircle, FiCheckCircle, FiBookOpen,
  FiBriefcase, FiVideo, FiUsers, FiBell, FiSettings, FiCheck,
  FiChevronRight, FiChevronLeft, FiPlay, FiPlus, FiStar
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

interface IExam {
  _id: string;
  examName: string;
  department: string;
  notificationTitle: string;
  officialWebsite?: string;
  applicationLink?: string;
  vacancies?: number;
  salaryRange?: { min: number; max: number; payLevel?: string };
  importantDates: { applicationEndDate?: string; examDate?: string };
  eligibility: { minAge: number; maxAge: number; qualifications: string[] };
}

interface IEligibilityMatch {
  examId: string;
  examName: string;
  status: 'Eligible' | 'Partially Eligible' | 'Not Eligible';
  reasons: string[];
  recommendations: string[];
  matchScore: number;
}

// Active Mock Listings for Private Jobs Tab
interface IPrivateJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  qualification: string;
  tags: string[];
  type: string;
}

const mockPrivateJobs: IPrivateJob[] = [
  {
    id: 'pj-1',
    title: 'Software Development Engineer (SDE-1)',
    company: 'Paytm India',
    location: 'Noida, UP (Hybrid)',
    salary: '₹8,00,000 - ₹12,00,000 / year',
    qualification: 'Graduate (B.Tech/BCA/B.Sc)',
    tags: ['React', 'Node.js', 'MongoDB'],
    type: 'Full-Time'
  },
  {
    id: 'pj-2',
    title: 'Junior Data Analyst',
    company: 'TCS Enterprise',
    location: 'Bengaluru, KA',
    salary: '₹4,50,000 - ₹6,00,000 / year',
    qualification: 'Graduate (Any stream)',
    tags: ['Excel', 'SQL', 'Python'],
    type: 'Full-Time'
  },
  {
    id: 'pj-3',
    title: 'Operations Manager',
    company: 'Flipkart Logistics',
    location: 'Mumbai, MH (On-site)',
    salary: '₹6,00,000 - ₹9,00,000 / year',
    qualification: 'Graduate',
    tags: ['Logistics', 'Operations', 'Excel'],
    type: 'Full-Time'
  },
  {
    id: 'pj-4',
    title: 'Technical Support Representative',
    company: 'Infosys BPM',
    location: 'Pune, MH (Remote)',
    salary: '₹3,50,000 - ₹4,80,000 / year',
    qualification: 'HSC / Graduate',
    tags: ['Customer Support', 'ITIL', 'Communication'],
    type: 'Full-Time'
  }
];

// Active Mock Advisors for Mentors Tab
interface IMentor {
  id: string;
  name: string;
  designation: string;
  rating: number;
  domain: string;
  charge: string;
  avatar: string;
}

const mockMentors: IMentor[] = [
  {
    id: 'm-1',
    name: 'Sh. Arjun Sharma',
    designation: 'Ex-IAS Officer (Batch 2012)',
    rating: 4.9,
    domain: 'UPSC CSE Strategy & Personality Prep',
    charge: '₹1,500 / 30m',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'm-2',
    name: 'Dr. Priya Patel',
    designation: 'Staff SDE & Tech Coach',
    rating: 4.8,
    domain: 'Software Engineering & System Design Mock',
    charge: '₹1,200 / 30m',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'm-3',
    name: 'Rohan Gupta',
    designation: 'SSC CGL Topper (Rank 42, 2024)',
    rating: 4.9,
    domain: 'Quantitative Aptitude & Reasoning Prep',
    charge: '₹500 / 30m',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  }
];

export const Dashboard: React.FC = () => {
  const { user, clearAuth, updateUser } = useAuthStore();
  const navigate = useNavigate();
  
  // Tab Controller: 'exams' | 'private' | 'interview' | 'mentors' | 'profile'
  const [activeTab, setActiveTab] = useState<'exams' | 'private' | 'interview' | 'mentors' | 'profile'>('exams');
  
  // Database States
  const [exams, setExams] = useState<IExam[]>([]);
  const [matches, setMatches] = useState<IEligibilityMatch[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMatch, setSelectedMatch] = useState<{ exam: IExam; match: IEligibilityMatch } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Private Job Filter
  const [privateSearch, setPrivateSearch] = useState('');
  
  // Notification Indicator
  const [notifications, setNotifications] = useState<string[]>([
    'UPSC CSE application deadline is in 25 days. Complete your matching configurations.',
    'Mock Interview slot with Dr. Priya Patel booked successfully.'
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  // AI Interview State
  const [interviewDomain, setInterviewDomain] = useState('technical');
  const [interviewStatus, setInterviewStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const [interviewQuestions, setInterviewQuestions] = useState<string[]>([
    'Tell me about a challenging project you built recently and how you resolved its blockages.',
    'Explain the differences between SQL and NoSQL database structures and when to prioritize each.'
  ]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [interviewAnswers, setInterviewAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [interviewFeedback, setInterviewFeedback] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Mentor Booking Success state
  const [bookingSuccessMentor, setBookingSuccessMentor] = useState<IMentor | null>(null);

  // Onboarding Setup Wizard States
  const [profileStep, setProfileStep] = useState(0);
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

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

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch all active exams
      const examsRes = await api.get('/exams');
      setExams(examsRes.data.data.exams || []);

      // Fetch user eligibility mapping
      const eligibilityRes = await api.get('/exams/eligibility');
      if (eligibilityRes.data.code !== 'PROFILE_INCOMPLETE') {
        setMatches(eligibilityRes.data.data.eligibilityMatches || []);
      }
    } catch (error) {
      console.error('Failed to load dashboard data', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // ignore
    } finally {
      clearAuth();
      navigate('/login');
    }
  };

  const getMatchForExam = (examId: string): IEligibilityMatch | undefined => {
    return matches.find((m) => m.examId === examId);
  };

  // Filter exams based on query search
  const filteredExams = exams.filter((exam) => {
    const query = searchQuery.toLowerCase();
    return (
      exam.examName.toLowerCase().includes(query) ||
      exam.department.toLowerCase().includes(query)
    );
  });

  // Filter private jobs
  const filteredPrivateJobs = mockPrivateJobs.filter((job) => {
    const q = privateSearch.toLowerCase();
    return (
      job.title.toLowerCase().includes(q) ||
      job.company.toLowerCase().includes(q) ||
      job.qualification.toLowerCase().includes(q) ||
      job.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Eligible':
        return 'bg-green-100 text-green-700 border border-green-200';
      case 'Partially Eligible':
        return 'bg-amber-100 text-amber-700 border border-amber-200';
      case 'Not Eligible':
        return 'bg-red-100 text-red-700 border border-red-200';
      default:
        return 'bg-slate-100 text-slate-600 border border-slate-200';
    }
  };

  // Handle saving profile from within Tab
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileErrorMsg(null);
    setProfileSuccessMsg(null);

    // Format list inputs
    const formattedData = {
      ...formData,
      languages: formData.languages.split(',').map(s => s.trim()).filter(Boolean),
      skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean)
    };

    try {
      const response = await api.post('/auth/complete-profile', formattedData);
      const { user: updatedUser } = response.data.data;
      updateUser(updatedUser);
      setProfileSuccessMsg('Profile updated successfully! Match scores have been recalculated.');
      setProfileStep(0);
      
      // Automatically refresh matches
      await fetchDashboardData();
    } catch (error: any) {
      setProfileErrorMsg(error.response?.data?.message || 'Failed to complete profile. Please check validation rules.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Start AI Mock Interview
  const startInterview = () => {
    setInterviewStatus('running');
    setActiveQuestionIndex(0);
    setInterviewAnswers([]);
    setCurrentAnswer('');
    setInterviewFeedback(null);
  };

  // Submit Answer
  const submitAnswer = () => {
    const updatedAnswers = [...interviewAnswers, currentAnswer];
    setInterviewAnswers(updatedAnswers);
    setCurrentAnswer('');

    if (activeQuestionIndex < interviewQuestions.length - 1) {
      setActiveQuestionIndex(activeQuestionIndex + 1);
    } else {
      setIsEvaluating(true);
      setTimeout(() => {
        setIsEvaluating(false);
        setInterviewStatus('completed');
        setInterviewFeedback(
          'Excellent answers. Your communication is clear. Your explanation of DBMS features is solid (8.5/10 score). Focus slightly more on the difference between CAP theorem guarantees next time.'
        );
      }, 2000);
    }
  };

  // Book Advisor Session
  const bookMentor = (mentor: IMentor) => {
    setBookingSuccessMentor(mentor);
  };

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      <div className="mesh-bg" />

      {/* Global Responsive Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer shrink-0" onClick={() => setActiveTab('exams')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-600 flex items-center justify-center text-white shadow-md">
              <FiBookOpen className="text-xl" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">
                SK CareerHub AI
              </h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Government & Career Portal</p>
            </div>
          </div>

          {/* Center Search Bar */}
          <div className="hidden md:flex items-center gap-2.5 bg-slate-100 border border-slate-200/60 rounded-xl px-4 py-2 w-full max-w-md focus-within:border-brand-500 focus-within:bg-white transition-all">
            <FiSearch className="text-slate-400 text-base" />
            <input 
              type="text" 
              placeholder="Search centralized databases or opportunities..." 
              value={activeTab === 'exams' ? searchQuery : (activeTab === 'private' ? privateSearch : '')}
              onChange={(e) => {
                if (activeTab === 'exams') setSearchQuery(e.target.value);
                else if (activeTab === 'private') setPrivateSearch(e.target.value);
              }}
              className="bg-transparent border-0 outline-none text-xs w-full text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-4 relative shrink-0">
            {/* Notification Bell */}
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/60 rounded-xl text-slate-600 transition-colors"
            >
              <FiBell className="text-lg" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full" />
              )}
            </button>

            {/* Notification Panel Modal */}
            <AnimatePresence>
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-12 z-50 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-4"
                  >
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
                      <span className="font-bold text-sm text-slate-800">Notifications</span>
                      <button 
                        onClick={() => setNotifications([])}
                        className="text-[10px] font-semibold text-brand-600 hover:underline"
                      >
                        Clear All
                      </button>
                    </div>
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-6">No new notifications.</p>
                    ) : (
                      <div className="space-y-3">
                        {notifications.map((notif, index) => (
                          <div key={index} className="flex gap-2.5 items-start text-xs text-slate-600 border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                            <FiInfo className="text-brand-500 mt-0.5 shrink-0" />
                            <span>{notif}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Profile Avatar Icon */}
            <button 
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-2 p-1 bg-slate-100 border border-slate-200/60 rounded-full hover:bg-slate-200/80 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-sm">
                {user?.fullName?.charAt(0).toUpperCase()}
              </div>
            </button>

            <button 
              onClick={handleLogout}
              className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 ml-2"
            >
              <FiLogOut /> Logout
            </button>
          </div>

        </div>
      </header>

      {/* Tab Navigation Menu */}
      <div className="bg-white border-b border-slate-200/80 px-6 py-2 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 md:gap-3 text-xs md:text-sm">
          {[
            { id: 'exams', label: 'Government Exams', icon: <FiBookOpen /> },
            { id: 'private', label: 'Private Jobs', icon: <FiBriefcase /> },
            { id: 'interview', label: 'Prepare your interview', icon: <FiVideo /> },
            { id: 'mentors', label: 'Mentors', icon: <FiUsers /> },
            { id: 'profile', label: 'Profile', icon: <FiUser /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSelectedMatch(null);
                setProfileErrorMsg(null);
                setProfileSuccessMsg(null);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold tracking-wide transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        
        {/* Mobile Search Fallback */}
        <div className="flex md:hidden mb-6 items-center gap-2.5 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm">
          <FiSearch className="text-slate-400 text-base" />
          <input 
            type="text" 
            placeholder="Search matching opportunities..." 
            value={activeTab === 'exams' ? searchQuery : (activeTab === 'private' ? privateSearch : '')}
            onChange={(e) => {
              if (activeTab === 'exams') setSearchQuery(e.target.value);
              else if (activeTab === 'private') setPrivateSearch(e.target.value);
            }}
            className="bg-transparent border-0 outline-none text-xs w-full text-slate-800 placeholder-slate-400"
          />
        </div>

        {/* Tab views conditional mapping */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* CENTRAL CONTENT PANEL (Left 2 Columns) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* VIEW 1: GOVERNMENT EXAMS */}
            {activeTab === 'exams' && (
              <div className="space-y-6">
                
                {/* Warning if profile is incomplete */}
                {!user?.profileCompleted && (
                  <GlassCard className="p-4 border-amber-300 bg-amber-50" hoverEffect={false}>
                    <div className="flex gap-3 items-start text-xs text-amber-800">
                      <FiAlertCircle className="text-lg text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold uppercase tracking-wider">Profile Incomplete</span>
                        <p className="mt-1">
                          You have not filled in your academic qualifications or age details. Match statuses are disabled. Go to the **Profile** tab to complete configurations and unlock matching.
                        </p>
                      </div>
                    </div>
                  </GlassCard>
                )}

                {/* Exam listings */}
                <GlassCard className="p-6 bg-white border border-slate-200/80 shadow-sm" hoverEffect={false}>
                  <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-brand-500/10 border border-brand-500/20 text-brand-600 rounded-xl">
                        <FiBookOpen className="text-lg" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg">Government Exams Directory</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Active notifications only showing central & state openings</p>
                      </div>
                    </div>
                  </div>

                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <svg className="animate-spin h-8 w-8 text-brand-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    </div>
                  ) : filteredExams.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <FiInfo className="text-3xl mx-auto mb-2 text-slate-300" />
                      <span>No active government exams matched in database.</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredExams.map((exam) => {
                        const match = getMatchForExam(exam._id);
                        return (
                          <div 
                            key={exam._id} 
                            className="p-5 bg-slate-50/50 hover:bg-slate-100/50 border border-slate-200/80 rounded-2xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                          >
                            <div className="space-y-1">
                              <h4 className="font-bold text-slate-800 text-base">{exam.examName}</h4>
                              <p className="text-xs text-slate-500 font-semibold">{exam.department}</p>
                              
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-2 font-medium">
                                <span className="flex items-center gap-1">
                                  <FiCalendar className="text-slate-400" /> End: {exam.importantDates.applicationEndDate ? new Date(exam.importantDates.applicationEndDate).toLocaleDateString() : 'N/A'}
                                </span>
                                <span>•</span>
                                <span>Vacancies: {exam.vacancies?.toLocaleString() || 'N/A'}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-200/60">
                              {user?.profileCompleted && match ? (
                                <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(match.status)}`}>
                                  <span>{match.status} ({match.matchScore}%)</span>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-400 font-semibold italic">Complete profile for match</span>
                              )}

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (user?.profileCompleted && match) {
                                    setSelectedMatch({ exam, match });
                                  } else {
                                    setActiveTab('profile');
                                  }
                                }}
                                className="text-brand-600 hover:text-brand-700 bg-white"
                              >
                                Check Details
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </GlassCard>

              </div>
            )}

            {/* VIEW 2: PRIVATE JOBS */}
            {activeTab === 'private' && (
              <div className="space-y-6">
                <GlassCard className="p-6 bg-white border border-slate-200/80 shadow-sm" hoverEffect={false}>
                  <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-brand-500/10 border border-brand-500/20 text-brand-600 rounded-xl">
                        <FiBriefcase className="text-lg" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg">Private Tech & Corporate Openings</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Aggregated listings with automatic qualification validation</p>
                      </div>
                    </div>
                  </div>

                  {filteredPrivateJobs.length === 0 ? (
                    <p className="text-center py-12 text-slate-400 text-xs">No private openings matched search.</p>
                  ) : (
                    <div className="space-y-4">
                      {filteredPrivateJobs.map((job) => (
                        <div key={job.id} className="p-5 bg-slate-50/50 hover:bg-slate-100/50 border border-slate-200/80 rounded-2xl transition-all">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <span className="text-[10px] uppercase font-bold tracking-wider text-brand-600 bg-brand-50 border border-brand-100 px-2 py-0.5 rounded-md">
                                {job.type}
                              </span>
                              <h4 className="font-bold text-slate-800 text-base mt-2">{job.title}</h4>
                              <p className="text-xs text-slate-500 font-semibold">{job.company} • {job.location}</p>
                            </div>
                            <span className="text-sm font-bold text-slate-900">{job.salary}</span>
                          </div>

                          <div className="flex flex-wrap gap-2 mt-4">
                            {job.tags.map((tag, i) => (
                              <span key={i} className="text-[10px] font-semibold bg-slate-200/50 text-slate-600 px-2.5 py-1 rounded-lg">
                                {tag}
                              </span>
                            ))}
                          </div>

                          <div className="flex justify-between items-center mt-5 pt-4 border-t border-slate-200/60">
                            <span className="text-xs text-slate-500 font-medium">Req: {job.qualification}</span>
                            <Button 
                              variant="primary" 
                              size="sm" 
                              onClick={() => alert(`Redirecting to apply portal at ${job.company}`)}
                            >
                              Apply Now
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </GlassCard>
              </div>
            )}

            {/* VIEW 3: PREPARE INTERVIEW */}
            {activeTab === 'interview' && (
              <div className="space-y-6">
                <GlassCard className="p-6 bg-white border border-slate-200/80 shadow-sm" hoverEffect={false}>
                  <div className="flex items-center gap-2.5 mb-6 border-b border-slate-100 pb-4">
                    <div className="p-2 bg-brand-500/10 border border-brand-500/20 text-brand-600 rounded-xl">
                      <FiVideo className="text-lg" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">AI Mock Interview Platform</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Prepare with adaptive audio feedback generated based on your match syllabus</p>
                    </div>
                  </div>

                  {interviewStatus === 'idle' && (
                    <div className="text-center py-8 space-y-5 max-w-md mx-auto">
                      <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-brand-600 text-2xl">
                        <FiVideo />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-base">Select Interview Category</h4>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          We will evaluate your profile details and ask adaptive questions.
                        </p>
                      </div>

                      <div className="flex flex-col gap-3 w-full">
                        <select
                          value={interviewDomain}
                          onChange={(e) => setInterviewDomain(e.target.value)}
                          className="w-full rounded-xl text-sm bg-slate-100 border border-slate-200/60 text-slate-800 px-4 py-3 outline-none focus:border-brand-500"
                        >
                          <option value="technical">Technical / Software Systems</option>
                          <option value="civil">UPSC Civil Services HR Mock</option>
                          <option value="banking">IBPS / Banking Aptitude Mock</option>
                        </select>

                        <div className="border border-dashed border-slate-300 rounded-xl p-4 text-center cursor-pointer hover:bg-slate-50">
                          <span className="text-xs text-slate-500 font-semibold block">Optional: Click to upload Resume (PDF)</span>
                          <span className="text-[10px] text-slate-400 mt-0.5 block">Used to customize questions</span>
                        </div>

                        <Button variant="premium" className="gap-2 justify-center py-3" onClick={startInterview}>
                          <FiPlay className="fill-current" /> Start AI Interview Session
                        </Button>
                      </div>
                    </div>
                  )}

                  {interviewStatus === 'running' && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        <span>Question {activeQuestionIndex + 1} of {interviewQuestions.length}</span>
                        <span>Evaluation Active</span>
                      </div>

                      <div className="p-5 bg-brand-50 border border-brand-100 rounded-2xl">
                        <p className="text-sm font-bold text-slate-800 leading-relaxed">
                          {interviewQuestions[activeQuestionIndex]}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Your Response</label>
                        <textarea
                          rows={4}
                          value={currentAnswer}
                          onChange={(e) => setCurrentAnswer(e.target.value)}
                          placeholder="Type or speak your answer clearly here..."
                          className="w-full rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 outline-none focus:border-brand-500 focus:bg-white resize-none"
                        />
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                        <Button variant="outline" size="sm" onClick={() => setInterviewStatus('idle')}>
                          Quit Interview
                        </Button>
                        <Button 
                          variant="primary" 
                          size="sm" 
                          onClick={submitAnswer} 
                          disabled={!currentAnswer.trim()}
                          isLoading={isEvaluating}
                        >
                          {activeQuestionIndex < interviewQuestions.length - 1 ? 'Next Question' : 'Finish & Evaluate'}
                        </Button>
                      </div>
                    </div>
                  )}

                  {interviewStatus === 'completed' && (
                    <div className="space-y-6 text-center max-w-lg mx-auto py-4">
                      <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto text-xl">
                        <FiCheckCircle />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-lg">Interview Assessment Complete</h4>
                        <p className="text-xs text-slate-400 mt-1">Generated by SK Interview Engine</p>
                      </div>

                      <div className="text-left bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs text-slate-600 leading-relaxed">
                        <span className="font-bold text-slate-800 block mb-2 text-sm">AI Coach Feedback:</span>
                        {interviewFeedback}
                      </div>

                      <Button variant="outline" onClick={() => setInterviewStatus('idle')}>
                        Start New Interview
                      </Button>
                    </div>
                  )}
                </GlassCard>
              </div>
            )}

            {/* VIEW 4: MENTORS */}
            {activeTab === 'mentors' && (
              <div className="space-y-6">
                <GlassCard className="p-6 bg-white border border-slate-200/80 shadow-sm" hoverEffect={false}>
                  <div className="flex items-center gap-2.5 mb-6 border-b border-slate-100 pb-4">
                    <div className="p-2 bg-brand-500/10 border border-brand-500/20 text-brand-600 rounded-xl">
                      <FiUsers className="text-lg" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">Book Verified Mentors & Strategy Advisors</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Schedule standard 1-on-1 calls to clear preparation blocks</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {mockMentors.map((mentor) => (
                      <div key={mentor.id} className="p-5 border border-slate-200/80 bg-slate-50/50 rounded-2xl flex flex-col justify-between gap-4">
                        <div className="flex gap-4">
                          <img 
                            src={mentor.avatar} 
                            alt={mentor.name} 
                            className="w-14 h-14 rounded-full object-cover border border-slate-200"
                          />
                          <div className="space-y-1">
                            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                              {mentor.name}
                              <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                <FiStar className="fill-current" /> {mentor.rating}
                              </span>
                            </h4>
                            <p className="text-xs text-slate-500 font-semibold">{mentor.designation}</p>
                            <p className="text-[10px] text-brand-600 font-bold uppercase tracking-wider">{mentor.domain}</p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-slate-200/60">
                          <span className="text-xs font-bold text-slate-900">{mentor.charge}</span>
                          <Button variant="outline" size="sm" onClick={() => bookMentor(mentor)}>
                            Book slot
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                {/* Booking confirmation modal */}
                <AnimatePresence>
                  {bookingSuccessMentor && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/70 backdrop-blur-sm">
                      <motion.div 
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-white border border-slate-200 p-6 rounded-2xl w-full max-w-sm text-center space-y-4"
                      >
                        <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto text-xl">
                          <FiCheck />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-base">Session Booked!</h4>
                          <p className="text-xs text-slate-400 mt-1">
                            Slot confirmation email dispatched to your inbox. Scheduled with {bookingSuccessMentor.name}.
                          </p>
                        </div>
                        <Button variant="primary" className="w-full" onClick={() => setBookingSuccessMentor(null)}>
                          Okay, Thanks
                        </Button>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* VIEW 5: PROFILE SETUP WIZARD */}
            {activeTab === 'profile' && (
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

                  {profileSuccessMsg && (
                    <div className="flex items-center gap-2.5 p-4 mb-6 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs">
                      <FiCheckCircle className="shrink-0 text-green-600 text-base" />
                      <span>{profileSuccessMsg}</span>
                    </div>
                  )}

                  {profileErrorMsg && (
                    <div className="flex items-center gap-2.5 p-4 mb-6 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs">
                      <FiAlertCircle className="shrink-0 text-red-600 text-base" />
                      <span>{profileErrorMsg}</span>
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
                              onChange={(e) => setFormData({...formData, gender: e.target.value as 'Male' | 'Female' | 'Other'})}
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
                              onChange={(e) => setFormData({...formData, category: e.target.value as 'General' | 'OBC' | 'SC' | 'ST' | 'EWS'})}
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
                              onChange={(e) => setFormData({...formData, nccCertificate: e.target.value as 'None' | 'A' | 'B' | 'C'})}
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
                              onChange={(e) => setFormData({...formData, drivingLicense: e.target.value as 'None' | 'Two-Wheeler' | 'Four-Wheeler' | 'Heavy-Vehicle' | 'Both'})}
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
                          <Button type="submit" variant="premium" isLoading={isSavingProfile}>
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

          {/* RIGHT SIDEBAR PANEL (1 Column) */}
          <div className="space-y-6">
            
            {/* User details card */}
            <GlassCard className="p-6 bg-white border border-slate-200 shadow-sm" hoverEffect={false}>
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
                <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold">
                  {user?.fullName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{user?.fullName}</h3>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">{user?.role} Account</span>
                </div>
              </div>

              {user?.profileCompleted ? (
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-500 font-medium">Age & Category:</span>
                    <span className="font-bold text-slate-800">{user?.profile?.age} yrs • {user?.profile?.category}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-500 font-medium">Degree:</span>
                    <span className="font-bold text-slate-800 truncate max-w-[120px]">{user?.profile?.qualification}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-500 font-medium">State:</span>
                    <span className="font-bold text-slate-800">{user?.profile?.state}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Typing Speed:</span>
                    <span className="font-bold text-slate-800">{user?.profile?.typingSpeed || 0} WPM</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No credentials matching, complete your profile configurations under the Profile tab.</p>
              )}
            </GlassCard>

            {/* Upcoming Deadlines Widget */}
            <GlassCard className="p-6 bg-white border border-slate-200 shadow-sm" hoverEffect={false}>
              <div className="flex items-center gap-2.5 mb-4 border-b border-slate-100 pb-3">
                <div className="p-2 bg-accent-500/10 border border-accent-500/20 text-accent-600 rounded-xl">
                  <FiCalendar className="text-base" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Upcoming Timelines</h3>
              </div>

              <div className="space-y-4">
                {exams.slice(0, 3).map((ex) => (
                  <div key={ex._id} className="flex flex-col gap-1 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                    <span className="font-bold text-slate-800 text-xs truncate">{ex.examName}</span>
                    <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                      <span>Deadline:</span>
                      <span className="text-brand-600 font-bold">
                        {ex.importantDates.applicationEndDate ? new Date(ex.importantDates.applicationEndDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

          </div>

        </div>

      </main>

      {/* Premium Glassmorphic Modal for Eligibility match breakdown */}
      <AnimatePresence>
        {selectedMatch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl relative z-50 p-8"
            >
              <h3 className="text-xl font-extrabold text-slate-900 mb-1">
                Eligibility Matching Breakdown
              </h3>
              <p className="text-xs text-brand-600 font-bold uppercase tracking-wider mb-6">
                {selectedMatch.exam.examName}
              </p>

              <div className="space-y-5">
                
                {/* Match Score */}
                <div className="flex items-center gap-4 bg-slate-50 border border-slate-200/80 p-4 rounded-2xl">
                  <div className="text-3xl font-extrabold text-brand-600 shrink-0">
                    {selectedMatch.match.matchScore}%
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Match Probability</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      Determined dynamically checking qualifications level, age relaxes, typing metric, and disability quotas.
                    </p>
                  </div>
                </div>

                {/* Reasons check */}
                <div>
                  <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wide mb-2">
                    Analysis Reasons
                  </h4>
                  {selectedMatch.match.reasons.length === 0 ? (
                    <div className="flex gap-2.5 items-center text-xs text-green-700 bg-green-100/50 p-3 rounded-xl border border-green-200">
                      <FiCheckCircle className="shrink-0 text-base" />
                      <span>Full eligibility verified. You satisfy all required thresholds.</span>
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {selectedMatch.match.reasons.map((reason, i) => (
                        <li key={i} className="flex gap-2.5 items-start text-xs text-red-700 bg-red-50 p-3 rounded-xl border border-red-200">
                          <FiAlertCircle className="shrink-0 text-base mt-0.5" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Recommendations check */}
                {selectedMatch.match.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wide mb-2">
                      AI Strategy Guidelines
                    </h4>
                    <ul className="space-y-2">
                      {selectedMatch.match.recommendations.map((rec, i) => (
                        <li key={i} className="flex gap-2.5 items-start text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                          <FiAward className="shrink-0 text-brand-600 text-base mt-0.5" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              </div>

              <div className="flex justify-between items-center mt-8 border-t border-slate-100 pt-6">
                {selectedMatch.exam.applicationLink && selectedMatch.match.status !== 'Not Eligible' ? (
                  <a
                    href={selectedMatch.exam.applicationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="premium">Apply Officially</Button>
                  </a>
                ) : (
                  <div />
                )}
                <Button variant="outline" onClick={() => setSelectedMatch(null)}>
                  Close Details
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default Dashboard;
