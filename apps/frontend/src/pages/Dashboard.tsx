import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { GlassCard, Button } from '@sk-careerhub/ui';
import { 
  FiLogOut, FiUser, FiInfo, FiSearch, FiSliders, 
  FiCalendar, FiAward, FiAlertCircle, FiCheckCircle, FiBookOpen 
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

export const Dashboard: React.FC = () => {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  
  // Dashboard UI states
  const [exams, setExams] = useState<IExam[]>([]);
  const [matches, setMatches] = useState<IEligibilityMatch[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMatch, setSelectedMatch] = useState<{ exam: IExam; match: IEligibilityMatch } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
        console.error('Failed to load dashboard statistics', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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

  // Find match payload for a specific exam ID
  const getMatchForExam = (examId: string): IEligibilityMatch | undefined => {
    return matches.find((m) => m.examId === examId);
  };

  // Filter exams based on search query
  const filteredExams = exams.filter((exam) => {
    const query = searchQuery.toLowerCase();
    return (
      exam.examName.toLowerCase().includes(query) ||
      exam.department.toLowerCase().includes(query)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Eligible':
        return 'bg-green-500/10 text-green-400 border border-green-500/20';
      case 'Partially Eligible':
        return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
      case 'Not Eligible':
        return 'bg-red-500/10 text-red-500 border border-red-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  return (
    <div className="relative min-h-screen py-16 px-6">
      <div className="mesh-bg" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header Section */}
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-transparent">
              SK CareerHub AI
            </h1>
            <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">India's AI Career Platform</span>
          </div>

          <div className="flex gap-4">
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
              <FiLogOut /> Logout
            </Button>
          </div>
        </header>

        {/* Welcome card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <GlassCard className="p-8 bg-gradient-to-r from-brand-600/10 to-accent-600/10" hoverEffect={false}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-3xl font-extrabold text-white">Welcome back, {user?.fullName}!</h2>
                <p className="text-slate-400 mt-2">
                  We have mapped your credentials. You can now view matching notifications below.
                </p>
              </div>
              <div>
                <Button variant="premium" onClick={() => navigate('/complete-profile')}>
                  Update Match Profile
                </Button>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Main Grid: User Profile (Left), Matches & Directory (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Profile Sidebar */}
          <div className="flex flex-col gap-6">
            <GlassCard className="p-6" hoverEffect={false}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded-xl">
                  <FiUser className="text-xl" />
                </div>
                <h3 className="font-bold text-white">Match Profile</h3>
              </div>
              
              <div className="space-y-3.5 text-sm text-slate-400 border-t border-white/5 pt-4">
                <div className="flex justify-between">
                  <span>Age:</span>
                  <span className="text-white font-medium">{user?.profile?.age} years</span>
                </div>
                <div className="flex justify-between">
                  <span>Category:</span>
                  <span className="text-white font-medium">{user?.profile?.category}</span>
                </div>
                <div className="flex justify-between">
                  <span>Qualification:</span>
                  <span className="text-white font-medium truncate max-w-[150px]">{user?.profile?.qualification}</span>
                </div>
                <div className="flex justify-between">
                  <span>State:</span>
                  <span className="text-white font-medium">{user?.profile?.state}</span>
                </div>
                <div className="flex justify-between">
                  <span>Typing Speed:</span>
                  <span className="text-white font-medium">{user?.profile?.typingSpeed || 0} WPM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sports Quota:</span>
                  <span className="text-white font-medium">{user?.profile?.sportsQuota ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6" hoverEffect={false}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-accent-500/10 border border-accent-500/20 text-accent-400 rounded-xl">
                  <FiCalendar className="text-xl" />
                </div>
                <h3 className="font-bold text-white">Upcoming Timelines</h3>
              </div>
              <div className="space-y-4 text-xs">
                {exams.slice(0, 3).map((ex) => (
                  <div key={ex._id} className="flex flex-col gap-1 border-b border-white/5 pb-3 last:border-0 last:pb-0">
                    <span className="font-semibold text-white truncate">{ex.examName}</span>
                    <div className="flex justify-between text-slate-500">
                      <span>End Date:</span>
                      <span className="text-brand-400 font-medium">
                        {ex.importantDates.applicationEndDate ? new Date(ex.importantDates.applicationEndDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Matches & Directory */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Search and Filters Header */}
            <div className="flex items-center gap-4 bg-white/5 border border-white/5 p-4 rounded-2xl backdrop-blur-md">
              <FiSearch className="text-slate-400 text-lg shrink-0" />
              <input
                type="text"
                placeholder="Search by exam name or department (e.g. UPSC, SSC)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-0 outline-none text-sm text-white w-full placeholder-slate-500"
              />
            </div>

            {/* Exams Table list */}
            <GlassCard className="p-6" hoverEffect={false}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded-xl">
                  <FiBookOpen className="text-xl" />
                </div>
                <h3 className="font-bold text-white">Government Exams Directory</h3>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <svg className="animate-spin h-8 w-8 text-brand-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              ) : filteredExams.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <FiInfo className="text-3xl mx-auto mb-2 text-slate-400" />
                  <span>No matching exams found in database.</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-xs text-slate-400 font-bold uppercase tracking-wider">
                        <th className="pb-3 pr-4">Exam / Agency</th>
                        <th className="pb-3 px-4">Vacancies</th>
                        <th className="pb-3 px-4">Match Status</th>
                        <th className="pb-3 pl-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                      {filteredExams.map((exam) => {
                        const match = getMatchForExam(exam._id);
                        return (
                          <tr key={exam._id} className="hover:bg-white/5 transition-colors">
                            <td className="py-4 pr-4">
                              <div className="font-semibold text-white">{exam.examName}</div>
                              <div className="text-xs text-slate-500 mt-0.5">{exam.department}</div>
                            </td>
                            <td className="py-4 px-4 text-slate-300 font-medium">
                              {exam.vacancies?.toLocaleString() || 'N/A'}
                            </td>
                            <td className="py-4 px-4">
                              {match ? (
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(match.status)}`}>
                                  {match.status === 'Eligible' ? (
                                    <FiCheckCircle className="shrink-0" />
                                  ) : (
                                    <FiAlertCircle className="shrink-0" />
                                  )}
                                  <span>{match.status} ({match.matchScore}%)</span>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-500 font-medium">N/A</span>
                              )}
                            </td>
                            <td className="py-4 pl-4 text-right">
                              {match ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-brand-400 hover:text-brand-300"
                                  onClick={() => setSelectedMatch({ exam, match })}
                                >
                                  Check Eligibility
                                </Button>
                              ) : (
                                <span className="text-xs text-slate-500">Incomplete Profile</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </GlassCard>

          </div>
        </div>

      </div>

      {/* Premium Glassmorphic Modal for Eligibility match breakdown */}
      <AnimatePresence>
        {selectedMatch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg overflow-hidden border border-white/10 rounded-2xl bg-darkbg-card shadow-2xl relative z-50 p-8"
            >
              <h3 className="text-2xl font-extrabold text-white mb-2">
                Eligibility Breakdown
              </h3>
              <p className="text-sm text-slate-400 mb-6 uppercase tracking-wider font-bold">
                {selectedMatch.exam.examName}
              </p>

              <div className="space-y-6">
                
                {/* Match Score Gauge */}
                <div className="flex items-center gap-4 bg-white/5 border border-white/5 p-4 rounded-xl">
                  <div className="text-3xl font-extrabold text-brand-400 shrink-0">
                    {selectedMatch.match.matchScore}%
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Match Probability Score</h4>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                      Determined based on structural criteria (Age relaxes, qualification levels, and special categories).
                    </p>
                  </div>
                </div>

                {/* Reasons check */}
                <div>
                  <h4 className="font-bold text-white text-xs uppercase tracking-wide text-slate-300 mb-2">
                    Analysis Reasons
                  </h4>
                  {selectedMatch.match.reasons.length === 0 ? (
                    <div className="flex gap-2.5 items-center text-sm text-green-400 bg-green-500/10 p-3 rounded-xl border border-green-500/20">
                      <FiCheckCircle className="shrink-0 text-lg" />
                      <span>Matches all requirements! You qualify for full application submissions.</span>
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {selectedMatch.match.reasons.map((reason, i) => (
                        <li key={i} className="flex gap-2.5 items-start text-xs text-red-400 bg-red-500/5 p-3 rounded-xl border border-red-500/10">
                          <FiAlertCircle className="shrink-0 text-sm mt-0.5" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Recommendations check */}
                {selectedMatch.match.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-bold text-white text-xs uppercase tracking-wide text-slate-300 mb-2">
                      AI Preparation Guidelines
                    </h4>
                    <ul className="space-y-2">
                      {selectedMatch.match.recommendations.map((rec, i) => (
                        <li key={i} className="flex gap-2.5 items-start text-xs text-slate-300 bg-white/5 p-3 rounded-xl border border-white/5">
                          <FiAward className="shrink-0 text-brand-400 text-sm mt-0.5" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              </div>

              <div className="flex justify-between items-center mt-8 border-t border-white/5 pt-6">
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
