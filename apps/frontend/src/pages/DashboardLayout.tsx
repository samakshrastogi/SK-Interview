import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';
import { api } from '../services/api';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { GlassCard, Button } from '@sk-careerhub/ui';
import { 
  FiLogOut, FiUser, FiInfo, FiSearch, FiCalendar, 
  FiBookOpen, FiBriefcase, FiVideo, FiUsers, FiBell,
  FiMenu, FiX
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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Get active tab based on route
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/dashboard/private-jobs')) return 'private';
    if (path.includes('/dashboard/mock-interview')) return 'interview';
    if (path.includes('/dashboard/mentors')) return 'mentors';
    if (path.includes('/dashboard/profile')) return 'profile';
    return 'exams';
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

  const navItems = [
    { id: 'exams', label: 'Government Exams', path: '/dashboard/exams', icon: <FiBookOpen /> },
    { id: 'private', label: 'Private Jobs', path: '/dashboard/private-jobs', icon: <FiBriefcase /> },
    { id: 'interview', label: 'Prepare your interview', path: '/dashboard/mock-interview', icon: <FiVideo /> },
    { id: 'mentors', label: 'Mentors', path: '/dashboard/mentors', icon: <FiUsers /> },
    { id: 'profile', label: 'Profile', path: '/dashboard/profile', icon: <FiUser /> }
  ];

  const getInitials = (name?: string) => {
    if (!name) return '👤';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    return parts[0].charAt(0).toUpperCase();
  };

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-800 font-sans flex">
      <div className="mesh-bg" />

      {/* 1. DESKTOP SIDEBAR PANEL */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200/80 sticky top-0 h-screen shrink-0 z-30">
        {/* Brand Logo */}
        <div className="p-6 border-b border-slate-200/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-600 flex items-center justify-center text-white shadow-md">
            <FiBookOpen className="text-xl" />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">
              SK CareerHub AI
            </h1>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Government Careers</p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((tab) => (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold w-full text-left transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="text-sm">{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Footer Logout Button */}
        <div className="p-4 border-t border-slate-200/80">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold w-full text-left text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
          >
            <FiLogOut className="text-lg" />
            <span className="text-sm">Logout Session</span>
          </button>
        </div>
      </aside>

      {/* 2. MOBILE DRAWER SIDEBAR PANEL */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            {/* Backdrop Overlay */}
            <div 
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            {/* Slide-over menu */}
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 bottom-0 left-0 w-72 bg-white border-r border-slate-200 z-50 lg:hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-600 flex items-center justify-center text-white shadow-md">
                    <FiBookOpen className="text-xl" />
                  </div>
                  <div>
                    <h1 className="text-base font-bold text-slate-800">SK CareerHub AI</h1>
                    <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Government Careers</span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600"
                >
                  <FiX className="text-lg" />
                </button>
              </div>

              <nav className="flex-1 px-4 py-6 space-y-2">
                {navItems.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      navigate(tab.path);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold w-full text-left transition-all ${
                      activeTab === tab.id
                        ? 'bg-brand-600 text-white shadow-md'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span className="text-sm">{tab.label}</span>
                  </button>
                ))}
              </nav>

              <div className="p-4 border-t border-slate-200">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold w-full text-left text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                >
                  <FiLogOut className="text-lg" />
                  <span className="text-sm">Logout Session</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* 3. MAIN CONTENT CONTAINER AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Controls bar */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Hamburger Toggle for Mobile */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/60 rounded-xl text-slate-600 transition-colors"
            >
              <FiMenu className="text-lg" />
            </button>
            <div className="hidden lg:block">
              <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">User Center</span>
              <h2 className="text-lg font-bold text-slate-800">Welcome, {user?.fullName}!</h2>
            </div>
            {/* Mobile Logo fallback */}
            <div className="flex lg:hidden items-center gap-2">
              <FiBookOpen className="text-brand-600 text-xl" />
              <span className="font-bold text-slate-800 text-sm">SK CareerHub</span>
            </div>
          </div>

          <div className="flex items-center gap-4 relative">
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

            {/* Notification Dropdown */}
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

            {/* Profile Avatar */}
            <button 
              onClick={() => navigate('/dashboard/profile')}
              className="flex items-center gap-2 p-1 bg-slate-100 border border-slate-200/60 rounded-full hover:bg-slate-200/80 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center overflow-hidden shadow-inner shrink-0">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-extrabold text-slate-600">{getInitials(user?.fullName)}</span>
                )}
              </div>
            </button>
          </div>
        </header>

        {/* Nested Subpage Outlet Container (Full Width Centered) */}
        <div className="max-w-4xl w-full mx-auto px-6 py-8">
          <div className="space-y-6">
            <Outlet />
          </div>
        </div>

      </div>
    </div>
  );
};
export default DashboardLayout;
