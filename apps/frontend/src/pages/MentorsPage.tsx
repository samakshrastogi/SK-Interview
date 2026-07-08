import React, { useState } from 'react';
import { GlassCard, Button } from '@sk-careerhub/ui';
import { FiUsers, FiStar, FiCheck } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

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

export const MentorsPage: React.FC = () => {
  const [selectedMentor, setSelectedMentor] = useState<IMentor | null>(null);

  return (
    <div className="space-y-6">
      
      <GlassCard className="p-6 bg-white border border-slate-200/80 shadow-sm" hoverEffect={false}>
        <div className="flex items-center gap-2.5 mb-6 border-b border-slate-100 pb-4">
          <div className="p-2 bg-brand-500/10 border border-brand-500/20 text-brand-600 rounded-xl">
            <FiUsers className="text-lg" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Book verified 1-on-1 Advising Sessions</h3>
            <p className="text-xs text-slate-500 mt-0.5">Learn strategy from toppers, civil services officers, and tech leaders</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockMentors.map((mentor) => (
            <div 
              key={mentor.id} 
              className="p-5 border border-slate-200/80 bg-slate-50/50 rounded-2xl flex flex-col justify-between gap-4"
            >
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
                <Button variant="outline" size="sm" onClick={() => setSelectedMentor(mentor)}>
                  Book slot
                </Button>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Booking confirmation modal */}
      <AnimatePresence>
        {selectedMentor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/70 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 p-6 rounded-2xl w-full max-w-sm text-center space-y-4 shadow-2xl relative z-50"
            >
              <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto text-xl">
                <FiCheck />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">Session Booked!</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Slot confirmation email dispatched to your inbox. Scheduled with {selectedMentor.name}.
                </p>
              </div>
              <Button variant="primary" className="w-full" onClick={() => setSelectedMentor(null)}>
                Okay, Thanks
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
export default MentorsPage;
