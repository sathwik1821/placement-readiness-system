import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';
import {
  GraduationCap,
  TrendingUp,
  Bot,
  Building2,
  Users,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  BarChart3,
  BookOpen,
  Play,
  RotateCcw,
  Sliders,
  Award,
  HelpCircle,
  Briefcase
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [quickLoginLoading, setQuickLoginLoading] = useState(false);

  // Playable Element 1: Interactive Readiness Sandbox
  const [targetRole, setTargetRole] = useState('Java Full Stack Developer');
  const [calcCgpa, setCalcCgpa] = useState(8.2);
  const [calcDsa, setCalcDsa] = useState(78);
  const [calcCore, setCalcCore] = useState(74);
  const [calcAptitude, setCalcAptitude] = useState(82);
  const [calcInterview, setCalcInterview] = useState(75);

  // Playable Element 2: Interactive AI Interview Rubric Simulator
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(2); // default to Senior answer

  // Active Stakeholder Portal Tab
  const [activePortalTab, setActivePortalTab] = useState('STUDENT');

  const handleQuickLogin = async (email, password, role) => {
    setQuickLoginLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.role, { email });
      const redirectRoutes = {
        STUDENT: '/student',
        PLACEMENT_OFFICER: '/officer',
        COMPANY: '/company',
        ADMIN: '/admin'
      };
      navigate(redirectRoutes[res.data.role] || '/student');
    } catch (err) {
      alert('Login error: ' + (err.response?.data?.error || err.message));
    } finally {
      setQuickLoginLoading(false);
    }
  };

  // Role Benchmark multipliers
  const roleWeights = {
    'Java Full Stack Developer': { cgpa: 0.15, dsa: 0.20, core: 0.25, apt: 0.15, interview: 0.25 },
    'MERN Full Stack Developer': { cgpa: 0.15, dsa: 0.15, core: 0.30, apt: 0.15, interview: 0.25 },
    'AI / ML Engineer': { cgpa: 0.20, dsa: 0.25, core: 0.25, apt: 0.20, interview: 0.10 },
    'Data Analyst': { cgpa: 0.20, dsa: 0.15, core: 0.20, apt: 0.25, interview: 0.20 }
  };

  const currentW = roleWeights[targetRole] || roleWeights['Java Full Stack Developer'];

  const computedSandboxScore = Math.round(
    ((calcCgpa / 10.0) * 100 * currentW.cgpa) +
    (calcDsa * currentW.dsa) +
    (calcCore * currentW.core) +
    (calcAptitude * currentW.apt) +
    (calcInterview * currentW.interview)
  );

  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference - (computedSandboxScore / 100) * circumference;

  // Interactive Playable Mini-Drill Data
  const sampleAnswers = [
    {
      title: 'Vague / Naive Strategy',
      badge: 'HIGH OUTAGE RISK',
      badgeColor: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
      text: 'I would restart the Redis cache cluster whenever the flash sale starts, increase server RAM, and ask users to refresh if the query times out.',
      techScore: 38,
      commScore: 48,
      verdict: 'Lacks distributed synchronization. Re-querying without locks causes severe database stampede under concurrent traffic.'
    },
    {
      title: 'Intermediate Strategy',
      badge: 'MODERATE LATENCY',
      badgeColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
      text: 'I would extend cache TTL by 2 hours and set up an async background worker to re-fetch product stock from the relational database.',
      techScore: 68,
      commScore: 76,
      verdict: 'Reasonable caching intuition, but does not address thundering herd when an unexpected cold-cache miss occurs.'
    },
    {
      title: 'Senior Architectural Strategy',
      badge: 'TIER-1 ARCHITECTURE',
      badgeColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
      text: 'I would implement distributed mutex locks (e.g., Redlock) on cache misses so only a single thread recalculates the value while others await. Paired with probabilistic early refresh and stale-while-revalidate headers.',
      techScore: 96,
      commScore: 93,
      verdict: 'Outstanding mastery. Successfully protects backend persistence layer from concurrent thundering herd spikes.'
    }
  ];

  const currentAnswer = sampleAnswers[selectedAnswerIndex];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      {/* Top Navigation Bar with Home Redirect */}
      <nav className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          {/* Brand Logo with Home Redirect */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm ring-1 ring-blue-400">
              <GraduationCap className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white block leading-none">
                Ascend
              </span>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider mt-0.5 block">
                Campus Placement Platform
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-slate-300">
            <a href="#theme" className="hover:text-blue-400 transition-colors">Theme & Vision</a>
            <a href="#calculator" className="hover:text-blue-400 transition-colors">Readiness Lab</a>
            <a href="#simulator" className="hover:text-blue-400 transition-colors">AI Drill Simulator</a>
            <a href="#portals" className="hover:text-blue-400 transition-colors">Stakeholder Portals</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-bold text-slate-300 hover:text-white px-3.5 py-2 rounded-xl transition-colors"
            >
              Sign In
            </Link>
            <button
              onClick={() => handleQuickLogin('arjun@student.edu', 'Student@123', 'STUDENT')}
              disabled={quickLoginLoading}
              className="btn-primary bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
            >
              <span>{quickLoginLoading ? 'Entering...' : 'Demo Student'}</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-20 pb-24 px-6 border-b border-slate-800">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.12]">
            Empower Campus Careers with <br className="hidden sm:inline" />
            <span className="text-blue-400">Calibrated Placement Intelligence</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-xl mx-auto leading-relaxed">
            Ascend unifies explainable multi-factor readiness scoring, real-time voice AI mock interviews, mathematical skill deficit ranking, and institutional campus recruitment operations.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => handleQuickLogin('arjun@student.edu', 'Student@123', 'STUDENT')}
              className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-sm flex items-center gap-2 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Student Workspace</span>
            </button>

            <button
              onClick={() => handleQuickLogin('officer@college.edu', 'Officer@123', 'PLACEMENT_OFFICER')}
              className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-sm"
            >
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>TPO Operations Console</span>
            </button>

            <a
              href="#calculator"
              className="px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 font-bold text-xs sm:text-sm transition-all"
            >
              Try Readiness Lab
            </a>
          </div>

          {/* Key Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16 max-w-3xl mx-auto pt-8 border-t border-slate-800">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-2xl sm:text-3xl font-black font-mono text-white block">88.4%</span>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider mt-1 block">
                Cohort Readiness
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 block">450+</span>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider mt-1 block">
                Curated Problems
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-2xl sm:text-3xl font-black font-mono text-blue-400 block">4 Roles</span>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider mt-1 block">
                Strict RBAC Portals
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-2xl sm:text-3xl font-black font-mono text-amber-400 block">100%</span>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider mt-1 block">
                Explainable Deficits
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Project Theme & Academic Context Section */}
      <section id="theme" className="py-20 px-6 border-b border-slate-800 bg-slate-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Project Theme & Purpose
            </h2>
            <p className="text-sm text-slate-300 mt-3 leading-relaxed">
              Why traditional academic evaluation fails to reflect hiring readiness.
            </p>
          </div>

          <div className="p-8 sm:p-10 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
            <div className="space-y-4 text-sm sm:text-base text-slate-200 leading-relaxed font-normal max-w-xl">
              <p>
                University engineering curricula excel at teaching foundational theory, data structures, and discrete mathematics. However, competitive industry recruitment rounds prioritize high-throughput problem-solving speed, concurrency isolation trade-offs, system scalability, and structured verbal delivery.
              </p>
              <p className="text-slate-300">
                <strong className="text-white font-bold">Ascend</strong> bridges this critical institutional divide. It transforms subjective placement preparation into a deterministic, mathematical discipline:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-800">
              <div className="space-y-1.5">
                <span className="text-xs font-black text-blue-400 uppercase tracking-wider block">
                  1. Mathematical Deficit Modeling
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Computes exact skill gaps using <code className="text-blue-300 font-mono font-bold">Deficit = Benchmark - Observed</code>, ensuring students remediate high-impact bottlenecks first.
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-black text-emerald-400 uppercase tracking-wider block">
                  2. Voice AI Interview Simulation
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Real-time conversational evaluation combining speech-to-text input, dynamic context-aware follow-ups, and automated NLP rubric scoring.
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-black text-amber-400 uppercase tracking-wider block">
                  3. Recruitment Operations Lifecycle
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Automated drive publishing with deterministic eligibility boundaries (CGPA, branches, backlog caps) for transparent institutional hiring.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Playable Feature 1: The Interactive Placement Readiness Lab */}
      <section id="calculator" className="py-20 px-6 border-b border-slate-800 bg-slate-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Interactive Placement Readiness Lab
            </h2>
            <p className="text-sm text-slate-300 mt-3 leading-relaxed">
              Select a target role and drag the candidate competency sliders to observe the multi-factor scoring engine recalculate in real-time.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-sm space-y-8">
            {/* Playable Role Benchmark Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-400 stroke-[2.5]" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                  Target Career Benchmark:
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {['Java Full Stack Developer', 'MERN Full Stack Developer', 'AI / ML Engineer', 'Data Analyst'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setTargetRole(r)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      targetRole === r
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Sliders Controls Column */}
              <div className="lg:col-span-7 space-y-5">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Academic Standing (CGPA)
                    </span>
                    <span className="text-sm font-mono font-bold text-blue-400">{calcCgpa} / 10.0</span>
                  </div>
                  <input
                    type="range"
                    min="5.0"
                    max="10.0"
                    step="0.1"
                    value={calcCgpa}
                    onChange={(e) => setCalcCgpa(parseFloat(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                  <span className="text-xs text-slate-400 block mt-0.5">Weight: {Math.round(currentW.cgpa * 100)}% of Composite</span>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Data Structures & Algorithms
                    </span>
                    <span className="text-sm font-mono font-bold text-emerald-400">{calcDsa}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={calcDsa}
                    onChange={(e) => setCalcDsa(parseInt(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <span className="text-xs text-slate-400 block mt-0.5">Weight: {Math.round(currentW.dsa * 100)}% • Tree, Graph, DP & Hash Optimizations</span>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Core Computer Science Fundamentals
                    </span>
                    <span className="text-sm font-mono font-bold text-blue-400">{calcCore}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={calcCore}
                    onChange={(e) => setCalcCore(parseInt(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                  <span className="text-xs text-slate-400 block mt-0.5">Weight: {Math.round(currentW.core * 100)}% • DBMS, OS Kernel, Concurrency</span>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Foundational Quantitative Aptitude
                    </span>
                    <span className="text-sm font-mono font-bold text-amber-400">{calcAptitude}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={calcAptitude}
                    onChange={(e) => setCalcAptitude(parseInt(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <span className="text-xs text-slate-400 block mt-0.5">Weight: {Math.round(currentW.apt * 100)}% • Analytical Reasoning Speed</span>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      AI Mock Interview Verbal Composure
                    </span>
                    <span className="text-sm font-mono font-bold text-indigo-400">{calcInterview}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={calcInterview}
                    onChange={(e) => setCalcInterview(parseInt(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                  <span className="text-xs text-slate-400 block mt-0.5">Weight: {Math.round(currentW.interview * 100)}% • Technical Depth & STAR Delivery</span>
                </div>
              </div>

              {/* Gauge Output Column */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 lg:pl-10 lg:border-l border-slate-800 text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 block">
                  Calibrated {targetRole} Index
                </span>

                <div className="relative w-44 h-44 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                    <circle
                      cx="80"
                      cy="80"
                      r={radius}
                      fill="transparent"
                      stroke="#1e293b"
                      strokeWidth="14"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r={radius}
                      fill="transparent"
                      stroke={
                        computedSandboxScore >= 75
                          ? '#059669'
                          : computedSandboxScore >= 55
                          ? '#d97706'
                          : '#dc2626'
                      }
                      strokeWidth="14"
                      strokeDasharray={circumference}
                      strokeDashoffset={dashoffset}
                      strokeLinecap="round"
                      className="transition-all duration-300"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-4xl font-black font-mono text-white">
                      {computedSandboxScore}
                    </span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                      / 100 PTS
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <span
                    className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${
                      computedSandboxScore >= 75
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : computedSandboxScore >= 55
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                    }`}
                  >
                    {computedSandboxScore >= 75
                      ? 'Placement Ready (Tier-1)'
                      : computedSandboxScore >= 55
                      ? 'Developing Competency'
                      : 'Critical Skill Gap'}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mt-4 leading-relaxed max-w-xs">
                  {computedSandboxScore >= 75
                    ? `Candidate meets competitive benchmark requirements for ${targetRole} recruitment cycles.`
                    : computedSandboxScore >= 55
                    ? `Moderate readiness for ${targetRole}. Focus targeted drill hours on lower-scoring sections.`
                    : `High deficit identified for ${targetRole}. System automatically prioritizes remedial curriculum.`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Playable Feature 2: Interactive AI Interview Drill Simulator */}
      <section id="simulator" className="py-20 px-6 border-b border-slate-800 bg-slate-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Playable AI Mock Interview Evaluator
            </h2>
            <p className="text-sm text-slate-300 mt-3 leading-relaxed">
              Test how the AI rubric evaluator scores candidate verbal responses. Click an answer below to trigger instant evaluation feedback.
            </p>
          </div>

          <div className="space-y-6">
            {/* Live Question Bar */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-xs font-black uppercase tracking-wider text-blue-400 block mb-1">
                Interviewer Question (Software Architecture Round):
              </span>
              <p className="text-base sm:text-lg font-bold text-white">
                "How would you address cache stampede and thundering herd when thousands of concurrent requests query an expired cache key during peak traffic?"
              </p>
            </div>

            {/* Clickable Candidate Answer Scenarios */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-3">
                Select an answer to simulate real-time AI evaluation:
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {sampleAnswers.map((ans, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedAnswerIndex(idx)}
                    className={`p-5 rounded-2xl text-left border transition-all ${
                      selectedAnswerIndex === idx
                        ? 'border-blue-500 bg-slate-900 text-white shadow-sm ring-1 ring-blue-500'
                        : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black uppercase tracking-wider">
                        {ans.title}
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${ans.badgeColor}`}>
                        {ans.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-mono line-clamp-3">
                      "{ans.text}"
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Evaluation Feedback Output */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-8 space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400 block">
                  AI Rubric Diagnostic Synthesis:
                </span>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {currentAnswer.verdict}
                </p>
              </div>

              <div className="md:col-span-4 flex items-center justify-around border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6 text-center">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Technical Depth
                  </span>
                  <span className="text-3xl font-black font-mono text-emerald-400 mt-1 block">
                    {currentAnswer.techScore}%
                  </span>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Communication
                  </span>
                  <span className="text-3xl font-black font-mono text-blue-400 mt-1 block">
                    {currentAnswer.commScore}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Stakeholder Portals Showcase */}
      <section id="portals" className="py-20 px-6 border-b border-slate-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Dedicated Consoles for Every Placement Stakeholder
            </h2>
            <p className="text-sm text-slate-300 mt-3 leading-relaxed">
              Explore the dedicated interfaces customized for each institutional stakeholder.
            </p>
          </div>

          {/* Portal Switcher Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <button
              onClick={() => setActivePortalTab('STUDENT')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activePortalTab === 'STUDENT'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              Student Portal
            </button>
            <button
              onClick={() => setActivePortalTab('OFFICER')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activePortalTab === 'OFFICER'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              Placement Officer (TPO)
            </button>
            <button
              onClick={() => setActivePortalTab('COMPANY')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activePortalTab === 'COMPANY'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              Corporate Recruiter
            </button>
            <button
              onClick={() => setActivePortalTab('ADMIN')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activePortalTab === 'ADMIN'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              System Administrator
            </button>
          </div>

          {/* Portal Content View */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-sm">
            {activePortalTab === 'STUDENT' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="badge-blue text-xs font-bold mb-2">Student Experience</span>
                  <h3 className="text-2xl font-black text-white mt-1">Student Placement Readiness Hub</h3>
                  <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                    Students track multi-factor readiness ratings, take timed algorithmic & aptitude diagnostics, review mathematical deficit priorities, conduct AI mock interviews, and apply for campus drives with deterministic pre-validation.
                  </p>
                  <ul className="space-y-2 mt-5 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>Timed tests with question jump palette and instant scoring</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>Transparent qualification reasons on all placement drives</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>Curated video and coding practice mapped directly to gaps</span>
                    </li>
                  </ul>
                  <button
                    onClick={() => handleQuickLogin('arjun@student.edu', 'Student@123', 'STUDENT')}
                    className="mt-6 btn-primary bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl"
                  >
                    Launch Student Portal Demo
                  </button>
                </div>
                <div className="p-6 md:border-l border-slate-800 text-xs space-y-3 font-mono">
                  <div className="flex justify-between text-slate-400 pb-2 border-b border-slate-800">
                    <span>Student Profile</span>
                    <span className="text-blue-400 font-bold">Arjun Sharma • CSE</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">CGPA:</span>
                    <span className="text-white font-bold">8.75 / 10.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target Role:</span>
                    <span className="text-emerald-400 font-bold">Software Developer</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Readiness Score:</span>
                    <span className="text-blue-400 font-bold">78% (Placement Ready)</span>
                  </div>
                  <p className="text-xs text-slate-400 pt-2 border-t border-slate-800">
                    Active Drives: TechCorp India, Innovate Labs, CloudScale Global
                  </p>
                </div>
              </div>
            )}

            {activePortalTab === 'OFFICER' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="badge-green text-xs font-bold mb-2">TPO Administrative Control</span>
                  <h3 className="text-2xl font-black text-white mt-1">Placement Operations Console</h3>
                  <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                    Placement Officers configure campus recruitment drives with strict barriers (minimum CGPA, department filters, maximum backlog thresholds), monitor batch qualification pipelines, and export recruiter summary sheets.
                  </p>
                  <ul className="space-y-2 mt-5 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>One-click drive publishing with automated eligibility validation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Multi-stage candidate review (Applied → Shortlisted → Selected)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>One-click recruiter summary exports for corporate partners</span>
                    </li>
                  </ul>
                  <button
                    onClick={() => handleQuickLogin('officer@college.edu', 'Officer@123', 'PLACEMENT_OFFICER')}
                    className="mt-6 btn-primary bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl"
                  >
                    Launch TPO Console Demo
                  </button>
                </div>
                <div className="p-6 md:border-l border-slate-800 text-xs space-y-3 font-mono">
                  <div className="flex justify-between text-slate-400 pb-2 border-b border-slate-800">
                    <span>Placement Operations</span>
                    <span className="text-emerald-400 font-bold">TPO Admin Session</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Institutional Drives:</span>
                    <span className="text-white font-bold">3 Active Drives</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Applications in Pipeline:</span>
                    <span className="text-emerald-400 font-bold">14 Candidates</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Average Batch Readiness:</span>
                    <span className="text-blue-400 font-bold">81.4%</span>
                  </div>
                  <p className="text-xs text-slate-400 pt-2 border-t border-slate-800">
                    Status: All criteria deterministic; zero manual triage overhead.
                  </p>
                </div>
              </div>
            )}

            {activePortalTab === 'COMPANY' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="badge-purple text-xs font-bold mb-2">Recruiter Access</span>
                  <h3 className="text-2xl font-black text-white mt-1">Corporate Talent Acquisition Hub</h3>
                  <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                    Verified recruiters review verified applicant profiles, inspect aggregate performance metrics across technical domains, and confirm interview shortlists without wading through unqualified resumes.
                  </p>
                  <ul className="space-y-2 mt-5 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>Pre-filtered candidate pools meeting exact corporate cutoffs</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>Privacy-compliant verified candidate performance summaries</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>Integrated interview feedback logging</span>
                    </li>
                  </ul>
                  <button
                    onClick={() => handleQuickLogin('hr@techcorp.com', 'Company@123', 'COMPANY')}
                    className="mt-6 btn-primary bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl"
                  >
                    Launch Recruiter Portal Demo
                  </button>
                </div>
                <div className="p-6 md:border-l border-slate-800 text-xs space-y-3 font-mono">
                  <div className="flex justify-between text-slate-400 pb-2 border-b border-slate-800">
                    <span>Corporate Recruiter</span>
                    <span className="text-purple-400 font-bold">TechCorp Solutions</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Position:</span>
                    <span className="text-white font-bold">Associate SDE (14.5 LPA)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pre-Qualified Pool:</span>
                    <span className="text-emerald-400 font-bold">100% Eligible (CGPA &ge; 7.5)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Shortlisted Candidates:</span>
                    <span className="text-purple-400 font-bold">6 Students</span>
                  </div>
                </div>
              </div>
            )}

            {activePortalTab === 'ADMIN' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <span className="badge-yellow text-xs font-bold mb-2">Institutional Governance</span>
                  <h3 className="text-2xl font-black text-white mt-1">System Administration Console</h3>
                  <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                    Administrators curate the examination question bank across foundational aptitude and core CS domains, manage user credentials & role access, and monitor platform health.
                  </p>
                  <ul className="space-y-2 mt-5 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Full CRUD question repository with options and marking schemes</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>User account directory with search, filtering, and role elevation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>System health and persistent database infrastructure metrics</span>
                    </li>
                  </ul>
                  <button
                    onClick={() => handleQuickLogin('admin@system.com', 'Admin@123', 'ADMIN')}
                    className="mt-6 btn-primary bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl"
                  >
                    Launch Admin Console Demo
                  </button>
                </div>
                <div className="p-6 md:border-l border-slate-800 text-xs space-y-3 font-mono">
                  <div className="flex justify-between text-slate-400 pb-2 border-b border-slate-800">
                    <span>Infrastructure Status</span>
                    <span className="text-amber-400 font-bold">All Systems Operational</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Users:</span>
                    <span className="text-white font-bold">5 Managed Accounts</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Question Bank:</span>
                    <span className="text-emerald-400 font-bold">14 Curated Questions</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Database Engine:</span>
                    <span className="text-blue-400 font-bold">Persistent H2 File DB</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-slate-800 bg-slate-950 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-200 block text-sm">Ascend</span>
              <span className="text-xs text-slate-400">Campus Placement & Career Readiness Platform</span>
            </div>
          </Link>

          <div className="flex items-center gap-6 font-semibold text-slate-300">
            <span>Spring Boot 3.3.4 (Java 21)</span>
            <span>•</span>
            <span>React 18 + Vite</span>
            <span>•</span>
            <span>Tailwind CSS</span>
            <span>•</span>
            <span>H2 Persistent Database</span>
          </div>

          <p className="text-slate-400 text-xs">
            Academic Capstone System. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
