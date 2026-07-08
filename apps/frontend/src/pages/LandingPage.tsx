import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FiArrowRight, FiCheck, FiCpu, FiAward, FiMessageSquare, 
  FiFileText, FiShield, FiTrendingUp, FiSearch, FiLayers, FiUsers 
} from 'react-icons/fi';
import { GlassCard, Button } from '@sk-careerhub/ui';

// Custom CountUp Component for stats
const CountUp: React.FC<{ end: number; duration?: number; suffix?: string }> = ({ end, duration = 2, suffix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration * 60);
    const handle = setInterval(() => {
      start += increment;
      if (start >= end) {
        clearInterval(handle);
        setCount(end);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);

    return () => clearInterval(handle);
  }, [end, duration]);

  return <span>{count.toLocaleString()}{suffix}</span>;
};

export const LandingPage: React.FC = () => {
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const stats = [
    { label: 'Exams Tracked', value: 450, suffix: '+' },
    { label: 'Government Jobs Listed', value: 125000, suffix: '+' },
    { label: 'AI Mock Interviews Run', value: 89000, suffix: '+' },
    { label: 'Placement Success Rate', value: 94, suffix: '%' },
  ];

  const features = [
    {
      icon: <FiSearch className="text-3xl text-brand-400" />,
      title: 'Automatic Crawler & Aggregator',
      description: 'Automatically crawls official Indian recruitment portals (UPSC, SSC, PSU, Bank) and extracts details, qualifications, notifications, and application URLs.',
    },
    {
      icon: <FiCpu className="text-3xl text-accent-400" />,
      title: 'AI Eligibility Matcher',
      description: 'Enter your category, qualifications, state, typing speed, and driving license, and get instantly analyzed eligibility scores for central & state jobs.',
    },
    {
      icon: <FiMessageSquare className="text-3xl text-brand-400" />,
      title: 'AI Career Mentor & Voice Chat',
      description: 'Engage with an AI mentor equipped with memory, document upload capabilities, and real-time audio voice analysis to plan your preparation roadmaps.',
    },
    {
      icon: <FiAward className="text-3xl text-accent-400" />,
      title: 'AI Mock Video Interviews',
      description: 'Upload your resume and prepare with dynamic, role-adaptive questions. Includes live camera streams, real-time transcripts, and audio-visual feedback.',
    },
    {
      icon: <FiShield className="text-3xl text-brand-400" />,
      title: 'AI Anti-Cheating System',
      description: 'Advanced computer vision monitors phone usage, secondary displays, eye contact, and surrounding voice details, generating comprehensive trust ratings.',
    },
    {
      icon: <FiFileText className="text-3xl text-accent-400" />,
      title: 'ATS Resume Review',
      description: 'Score your resume against government exams or private sectors. Instantly identify missing skills, key phrases, and export templates to PDF/DOCX.',
    },
  ];

  const testimonials = [
    {
      quote: "SK CareerHub completely changed how I prepare. The AI mock interview predicted exactly the stress questions asked in my bank PO interview.",
      author: "Aditya Sharma",
      role: "IBPS PO Selected, 2025",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
    },
    {
      quote: "Knowing exactly which exams I am eligible for based on my driving license and sports quota saved me months of manual hunting across websites.",
      author: "Priya Patel",
      role: "State PSC Aspirant",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
    },
  ];

  const faqs = [
    {
      q: "Does this platform track state-level government examinations?",
      a: "Yes. SK CareerHub AI monitors all major state recruitment portals (State PSCs, Police, High Courts, and Education Boards) across all Indian states and Union Territories."
    },
    {
      q: "How does the AI Mock Interview system grade candidates?",
      a: "Our AI processes your audio transcript, grammar, confidence metrics, problem-solving structure, eye contact, and facial expressions to generate a multi-dimensional PDF report."
    },
    {
      q: "Is my personal data and resume upload secure?",
      a: "Yes. All uploads are saved in encrypted, enterprise-grade S3 storages, and AI processing complies with strictly audited privacy and compliance standard practices."
    }
  ];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setSubscribed(true);
      setEmailInput('');
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Animated Mesh Background */}
      <div className="mesh-bg" />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center justify-center text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 text-xs font-semibold uppercase tracking-wider mb-6"
        >
          <FiCpu className="animate-spin-slow" /> Next-Gen Career Technology
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl md:text-7xl font-extrabold tracking-tight text-white max-w-5xl leading-tight"
        >
          India's AI-Powered <br />
          <span className="bg-gradient-to-r from-brand-400 via-accent-400 to-brand-300 bg-clip-text text-transparent">
            Government Career Platform
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-6 text-lg md:text-xl text-slate-400 max-w-3xl"
        >
          Automatically discover recruitment boards, match qualifications, generate mock interviews, analyze resumes, and study notifications summarized by AI.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link to="/register">
            <Button variant="premium" size="lg" className="w-full sm:w-auto">
              Get Started for Free <FiArrowRight className="ml-2" />
            </Button>
          </Link>
          <a href="#features">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Explore AI Features
            </Button>
          </a>
        </motion.div>
      </section>

      {/* Stats Counter Section */}
      <section className="relative py-12 px-6 max-w-7xl mx-auto z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <GlassCard key={i} className="p-6 text-center" hoverEffect={true}>
              <h3 className="text-3xl md:text-4xl font-extrabold text-white">
                <CountUp end={stat.value} suffix={stat.suffix} />
              </h3>
              <p className="text-xs md:text-sm text-slate-400 mt-2 font-medium uppercase tracking-wide">
                {stat.label}
              </p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="relative py-20 px-6 max-w-7xl mx-auto z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white">
            Built for High-Scale Aspirations
          </h2>
          <p className="text-slate-400 mt-4 text-lg">
            Say goodbye to tracking multiple government notifications manually. Let our platform parse details and build your roadmap automatically.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <GlassCard key={i} className="p-8 flex flex-col items-start text-left" hoverEffect={true}>
              <div className="p-3.5 bg-white/5 dark:bg-white/5 border border-white/10 rounded-xl mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* How it Works (Stepper) */}
      <section className="relative py-20 px-6 max-w-7xl mx-auto z-10 border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white">
            How It Works
          </h2>
          <p className="text-slate-400 mt-4">
            Four simple steps to match, practice, and secure your government career.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-500/20 to-accent-500/20 hidden md:block z-0" />
          {[
            { step: '01', title: 'Create Account', desc: 'Sign up and configure your age, category, qualifications, and state.' },
            { step: '02', title: 'Eligibility Matching', desc: 'Instantly view eligible central & state-level recruitments.' },
            { step: '03', title: 'Prepare & Interview', desc: 'Practice mock exams and adaptive voice interviews.' },
            { step: '04', title: 'Get Hired', desc: 'Secure recruitment with verified performance reports.' }
          ].map((item, i) => (
            <GlassCard key={i} className="p-6 relative z-10 flex flex-col text-left" hoverEffect={false}>
              <span className="text-4xl font-extrabold text-brand-400 mb-4">{item.step}</span>
              <h4 className="text-lg font-bold text-white mb-2">{item.title}</h4>
              <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative py-20 px-6 max-w-7xl mx-auto z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((test, i) => (
            <GlassCard key={i} className="p-8 flex flex-col justify-between" hoverEffect={true}>
              <p className="text-slate-300 italic text-base md:text-lg leading-relaxed">
                "{test.quote}"
              </p>
              <div className="flex items-center gap-4 mt-8">
                <img src={test.avatar} alt={test.author} className="w-12 h-12 rounded-full border border-white/10" />
                <div>
                  <h5 className="font-bold text-white text-sm">{test.author}</h5>
                  <p className="text-xs text-brand-400">{test.role}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative py-20 px-6 max-w-7xl mx-auto z-10 border-t border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white">
            Transparent Pricing
          </h2>
          <p className="text-slate-400 mt-4">
            Upgrade your preparation with our premium AI mentor features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Tier */}
          <GlassCard className="p-8 flex flex-col justify-between border-slate-200 dark:border-white/10" hoverEffect={true}>
            <div>
              <h3 className="text-2xl font-bold text-white">Aspirant Free</h3>
              <p className="text-sm text-slate-400 mt-2">Perfect for checking and tracking jobs.</p>
              <div className="text-4xl font-extrabold text-white mt-6">
                ₹0 <span className="text-sm font-normal text-slate-400">/ forever</span>
              </div>
              <ul className="mt-8 space-y-4">
                {['Unlimited Job & Exam Search', 'Eligibility Analysis Check', 'Basic Notification Summaries', 'Email Alerts'].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3 text-sm text-slate-300">
                    <FiCheck className="text-brand-400 shrink-0" /> {feature}
                  </li>
                ))}
              </ul>
            </div>
            <Link to="/register" className="mt-8">
              <Button variant="outline" className="w-full">Sign Up Free</Button>
            </Link>
          </GlassCard>

          {/* Premium Tier */}
          <GlassCard className="p-8 flex flex-col justify-between border-brand-500/30 bg-brand-950/20" hoverEffect={true}>
            <div>
              <div className="inline-block px-3 py-1 bg-brand-500/20 text-brand-400 text-xs rounded-full border border-brand-500/30 uppercase font-semibold tracking-wider mb-2">Most Popular</div>
              <h3 className="text-2xl font-bold text-white">AI Pro Prep</h3>
              <p className="text-sm text-slate-400 mt-2">Comprehensive AI mentor tools.</p>
              <div className="text-4xl font-extrabold text-white mt-6">
                ₹499 <span className="text-sm font-normal text-slate-400">/ month</span>
              </div>
              <ul className="mt-8 space-y-4">
                {['Everything in Free Tier', 'Unlimited AI Mock Video Interviews', 'Interactive Voice Career Mentor', 'ATS Resume Parser & ATS Optimization', 'Mind Maps & PDF Revision Summarizers', 'Detailed AI Performance Analytics'].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3 text-sm text-slate-300">
                    <FiCheck className="text-brand-400 shrink-0" /> {feature}
                  </li>
                ))}
              </ul>
            </div>
            <Link to="/register" className="mt-8">
              <Button variant="premium" className="w-full">Unlock Pro Features</Button>
            </Link>
          </GlassCard>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="relative py-20 px-6 max-w-4xl mx-auto z-10 border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <GlassCard key={index} className="overflow-hidden" hoverEffect={false}>
              <button
                onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                className="w-full p-6 text-left flex items-center justify-between font-semibold text-white"
              >
                <span>{faq.q}</span>
                <span className="text-xl">{activeFaq === index ? '−' : '+'}</span>
              </button>
              
              <AnimatePresence>
                {activeFaq === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="px-6 pb-6 text-slate-400 text-sm leading-relaxed border-t border-white/5 pt-4">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Footer / Newsletter */}
      <footer className="relative py-16 px-6 max-w-7xl mx-auto z-10 border-t border-white/5 text-center md:text-left">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-transparent">SK CareerHub AI</h3>
            <p className="text-slate-400 mt-4 text-sm leading-relaxed">
              India's premier AI platform dedicated to crawling notifications, scoring resumes, matching exam eligibility, and running mock audio-visual interviews.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white uppercase tracking-wider text-sm">Quick Links</h4>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              <li><Link to="/login" className="hover:text-brand-400">Login</Link></li>
              <li><Link to="/register" className="hover:text-brand-400">Register</Link></li>
              <li><a href="#features" className="hover:text-brand-400">Features</a></li>
              <li><a href="#pricing" className="hover:text-brand-400">Pricing</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white uppercase tracking-wider text-sm">Stay Updated</h4>
            <p className="text-slate-400 text-sm mt-4">Subscribe to our newsletter for daily exam alerts.</p>
            {subscribed ? (
              <p className="text-brand-400 text-sm font-medium mt-4">🎉 Subscribed successfully!</p>
            ) : (
              <form onSubmit={handleSubscribe} className="mt-4 flex gap-2">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Enter email address"
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-500 w-full"
                  required
                />
                <Button type="submit" variant="primary" size="sm">Subscribe</Button>
              </form>
            )}
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} SK CareerHub AI. Built with ❤️ for Indian Aspirants.
        </div>
      </footer>
    </div>
  );
};
