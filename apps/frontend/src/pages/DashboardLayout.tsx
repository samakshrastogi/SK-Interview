import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';
import { api } from '../services/api';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { GlassCard, Button } from '@sk-careerhub/ui';
import { 
  FiLogOut, FiUser, FiInfo, FiSearch, FiCalendar, 
  FiBookOpen, FiBriefcase, FiVideo, FiUsers, FiBell 
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

interface IExam {
  _id: string;
  examName: string;
  department: string;
  importantDates: { applicationEndDate?: string };
}

export const DashboardLayout: React.FC = () => {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [exams, setExams] = useState<IExam[]>([]);
  const [notifications, setNotifications] = useState<string[]>([
    'UPSC CSE application deadline is in 25 days. Complete your matching configurations.',
    'Mock Interview slot with Dr. Priya Patel booked successfully.'
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Get active subpath to highlight active nav tab
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/dashboard/private-jobs')) return 'private';
    if (path.includes('/dashboard/mock-interview')) return 'interview';
    if (path.includes('/dashboard/mentors')) return 'mentors';
    if (path.includes('/dashboard/profile')) return 'profile';
    return 'exams'; // default
  };

  const activeTab = getActiveTab();

  useEffect(() => {
    const fetchTimelines = async () => {
      try {
        const examsRes = await api.get('/exams');
        setExams(examsRes.data.data.exams || []);
      } catch (error) {
        console.error('Failed to load timeline widget', error);
      }
    };
    fetchTimelines();
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

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      <div className="mesh-bg" />

      {/* Responsive Global Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer shrink-0" onClick={() => navigate('/dashboard/exams')}>
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

            {/* Notification Panel */}
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

            {/* Profile Avatar Button */}
            <button 
              onClick={() => navigate('/dashboard/profile')}
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

      {/* Tabs Subheader Navigation */}
      <div className="bg-white border-b border-slate-200/80 px-6 py-2 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 md:gap-3 text-xs md:text-sm">
          {[
            { id: 'exams', label: 'Government Exams', path: '/dashboard/exams', icon: <FiBookOpen /> },
            { id: 'private', label: 'Private Jobs', path: '/dashboard/private-jobs', icon: <FiBriefcase /> },
            { id: 'interview', label: 'Prepare your interview', path: '/dashboard/mock-interview', icon: <FiVideo /> },
            { id: 'mentors', label: 'Mentors', path: '/dashboard/mentors', icon: <FiUsers /> },
            { id: 'profile', label: 'Profile', path: '/dashboard/profile', icon: <FiUser /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
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

      {/* Page Body Grid Layout */}
      <main className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Active Subpage (Left 2 Columns) */}
          <div className="lg:col-span-2 space-y-6">
            <Outlet />
          </div>

          {/* Right Sidebar Widgets (1 Column) */}
          <div className="space-y-6">
            
            {/* Quick Profile Summary */}
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
                <p className="text-xs text-slate-400 italic">No credentials matching, complete your profile configurations under the Profile page.</p>
              )}
            </GlassCard>

            {/* Timelines Widget */}
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
    </div>
  );
};
export default DashboardLayout;
