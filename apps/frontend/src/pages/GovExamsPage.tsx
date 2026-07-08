import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { GlassCard, Button } from '@sk-careerhub/ui';
import { 
  FiSearch, FiInfo, FiCheckCircle, FiAlertCircle, 
  FiCalendar, FiAward, FiBookOpen 
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

export const GovExamsPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const [exams, setExams] = useState<IExam[]>([]);
  const [matches, setMatches] = useState<IEligibilityMatch[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMatch, setSelectedMatch] = useState<{ exam: IExam; match: IEligibilityMatch } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchExams = async () => {
    setIsLoading(true);
    try {
      const examsRes = await api.get('/exams');
      setExams(examsRes.data.data.exams || []);

      const eligibilityRes = await api.get('/exams/eligibility');
      if (eligibilityRes.data.code !== 'PROFILE_INCOMPLETE') {
        setMatches(eligibilityRes.data.data.eligibilityMatches || []);
      }
    } catch (error) {
      console.error('Failed to load exams', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, [user]);

  const getMatchForExam = (examId: string): IEligibilityMatch | undefined => {
    return matches.find((m) => m.examId === examId);
  };

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
        return 'bg-green-100 text-green-700 border border-green-200';
      case 'Partially Eligible':
        return 'bg-amber-100 text-amber-700 border border-amber-200';
      case 'Not Eligible':
        return 'bg-red-100 text-red-700 border border-red-200';
      default:
        return 'bg-slate-100 text-slate-600 border border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Mobile Search Widget */}
      <div className="flex md:hidden items-center gap-2.5 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm">
        <FiSearch className="text-slate-400 text-base" />
        <input 
          type="text" 
          placeholder="Search exams..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent border-0 outline-none text-xs w-full text-slate-800"
        />
      </div>

      {/* Desktop Search Widget */}
      <div className="hidden md:flex items-center gap-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <FiSearch className="text-slate-400 text-lg shrink-0" />
        <input
          type="text"
          placeholder="Search active government recruitment exams (e.g. UPSC, SSC)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent border-0 outline-none text-sm text-slate-850 w-full placeholder-slate-400"
        />
      </div>

      {!user?.profileCompleted && (
        <GlassCard className="p-4 border-amber-300 bg-amber-50" hoverEffect={false}>
          <div className="flex gap-3 items-start text-xs text-amber-800">
            <FiAlertCircle className="text-lg text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold uppercase tracking-wider">Profile Incomplete</span>
              <p className="mt-1">
                Configure your details in the **Profile** page to unlock matching diagnostics and check eligibility ratios.
              </p>
            </div>
          </div>
        </GlassCard>
      )}

      <GlassCard className="p-6 bg-white border border-slate-200/80 shadow-sm" hoverEffect={false}>
        <div className="flex items-center gap-2.5 mb-6 border-b border-slate-100 pb-4">
          <div className="p-2 bg-brand-500/10 border border-brand-500/20 text-brand-600 rounded-xl">
            <FiBookOpen className="text-lg" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Government Exams Directory</h3>
            <p className="text-xs text-slate-500 mt-0.5">Active notifications only showing central & state openings</p>
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
                          navigate('/dashboard/profile');
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

      {/* Eligibility Breakdown Modal */}
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
                
                {/* Match Score Gauge */}
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
export default GovExamsPage;
