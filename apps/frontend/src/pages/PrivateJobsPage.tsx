import React, { useState } from 'react';
import { GlassCard, Button } from '@sk-careerhub/ui';
import { FiBriefcase, FiSearch, FiSliders, FiCheckCircle } from 'react-icons/fi';

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
    salary: '₹8,0,000 - ₹12,0,000 / year',
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

export const PrivateJobsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [appliedJob, setAppliedJob] = useState<string | null>(null);

  const filteredJobs = mockPrivateJobs.filter((job) => {
    const q = search.toLowerCase();
    return (
      job.title.toLowerCase().includes(q) ||
      job.company.toLowerCase().includes(q) ||
      job.qualification.toLowerCase().includes(q) ||
      job.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const handleApply = (job: IPrivateJob) => {
    setAppliedJob(job.title);
    setTimeout(() => {
      setAppliedJob(null);
      alert(`Application sent successfully to ${job.company} for ${job.title}!`);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      
      {/* Search Input */}
      <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <FiSearch className="text-slate-400 text-lg shrink-0" />
        <input
          type="text"
          placeholder="Search private tech & corporate openings (e.g. React, Node, TCS)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-0 outline-none text-sm text-slate-850 w-full placeholder-slate-400"
        />
      </div>

      <GlassCard className="p-6 bg-white border border-slate-200/80 shadow-sm" hoverEffect={false}>
        <div className="flex items-center gap-2.5 mb-6 border-b border-slate-100 pb-4">
          <div className="p-2 bg-brand-500/10 border border-brand-500/20 text-brand-600 rounded-xl">
            <FiBriefcase className="text-lg" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Private Sector Job Portal</h3>
            <p className="text-xs text-slate-500 mt-0.5">Corporate jobs mapped to qualifying educational backgrounds</p>
          </div>
        </div>

        {filteredJobs.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <span>No private openings matched your search parameters.</span>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <div 
                key={job.id} 
                className="p-5 bg-slate-50/50 hover:bg-slate-100/50 border border-slate-200/80 rounded-2xl transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-brand-600 bg-brand-50 border border-brand-100 px-2 py-0.5 rounded-md">
                      {job.type}
                    </span>
                    <h4 className="font-bold text-slate-800 text-base mt-2">{job.title}</h4>
                    <p className="text-xs text-slate-500 font-semibold">{job.company} • {job.location}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-slate-900">{job.salary}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {job.tags.map((tag, i) => (
                    <span key={i} className="text-[10px] font-semibold bg-slate-200/60 text-slate-600 px-2.5 py-1 rounded-lg">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex justify-between items-center mt-5 pt-4 border-t border-slate-200/60">
                  <span className="text-xs text-slate-500 font-semibold">Min Qualification: {job.qualification}</span>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={() => handleApply(job)}
                    isLoading={appliedJob === job.title}
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
  );
};
export default PrivateJobsPage;
