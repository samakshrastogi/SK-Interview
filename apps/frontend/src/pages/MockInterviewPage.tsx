import React, { useState } from 'react';
import { GlassCard, Button } from '@sk-careerhub/ui';
import { FiVideo, FiPlay, FiCheckCircle } from 'react-icons/fi';

export const MockInterviewPage: React.FC = () => {
  const [interviewDomain, setInterviewDomain] = useState('technical');
  const [interviewStatus, setInterviewStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const interviewQuestions = [
    'Tell me about a challenging project you built recently and how you resolved its blockages.',
    'Explain the differences between SQL and NoSQL database structures and when to prioritize each.'
  ];

  const startInterview = () => {
    setInterviewStatus('running');
    setActiveQuestionIndex(0);
    setCurrentAnswer('');
    setFeedback(null);
  };

  const handleNext = () => {
    if (activeQuestionIndex < interviewQuestions.length - 1) {
      setActiveQuestionIndex(activeQuestionIndex + 1);
      setCurrentAnswer('');
    } else {
      setIsEvaluating(true);
      setTimeout(() => {
        setIsEvaluating(false);
        setInterviewStatus('completed');
        setFeedback(
          'Excellent answers. Your communication is clear. Your explanation of DBMS features is solid (8.5/10 score). Focus slightly more on the difference between CAP theorem guarantees next time.'
        );
      }, 2000);
    }
  };

  return (
    <div className="space-y-6">
      
      <GlassCard className="p-6 bg-white border border-slate-200/80 shadow-sm" hoverEffect={false}>
        <div className="flex items-center gap-2.5 mb-6 border-b border-slate-100 pb-4">
          <div className="p-2 bg-brand-500/10 border border-brand-500/20 text-brand-600 rounded-xl">
            <FiVideo className="text-lg" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">AI Mock Interview Prep Center</h3>
            <p className="text-xs text-slate-500 mt-0.5">Prepare with adaptive audio feedback generated based on your match syllabus</p>
          </div>
        </div>

        {interviewStatus === 'idle' && (
          <div className="text-center py-8 space-y-5 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-brand-600 text-2xl animate-pulse">
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
                className="w-full rounded-xl text-sm bg-slate-100 border border-slate-200/60 text-slate-850 px-4 py-3 outline-none focus:border-brand-500 focus:bg-white"
              >
                <option value="technical">Technical / Software Systems</option>
                <option value="civil">UPSC Civil Services HR Mock</option>
                <option value="banking">IBPS / Banking Aptitude Mock</option>
              </select>

              <div className="border border-dashed border-slate-350 rounded-xl p-4 text-center cursor-pointer hover:bg-slate-50">
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
                onClick={handleNext} 
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
              {feedback}
            </div>

            <Button variant="outline" onClick={() => setInterviewStatus('idle')}>
              Start New Interview
            </Button>
          </div>
        )}
      </GlassCard>

    </div>
  );
};
export default MockInterviewPage;
