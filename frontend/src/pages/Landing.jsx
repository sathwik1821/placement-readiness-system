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
  Play
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [quickLoginLoading, setQuickLoginLoading] = useState(false);

  // Interactive Live Calculator Sandbox States
  const [calcCgpa, setCalcCgpa] = useState(8.2);
  const [calcDsa, setCalcDsa] = useState(78);
  const [calcCore, setCalcCore] = useState(74);
  const [calcAptitude, setCalcAptitude] = useState(82);
  const [calcInterview, setCalcInterview] = useState(75);

  // Active Portal Tab in Showcase
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

  const computedSandboxScore = Math.round(
    ((calcCgpa / 10.0) * 100 * 0.20) +
    (calcDsa * 0.25) +
    (calcCore * 0.20) +
    (calcAptitude * 0.15) +
    (calcInterview * 0.20)
  );

  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference - (computedSandboxScore / 100) * circumference;

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm ring-1 ring-blue-400">
              <GraduationCap className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white block leading-none">
                PlacementAI
              </span>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider mt-0.5 block">
                Academic & Recruitment OS
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-slate-300">
            <a href="#features" className="hover:text-blue-400 transition-colors">Key Features</a>
            <a href="#calculator" className="hover:text-blue-400 transition-colors">Readiness Sandbox</a>
            <a href="#interview" className="hover:text-blue-400 transition-colors">AI Mock Interview</a>
            <a href="#portals" className="hover:text-blue-400 transition-colors">4 Role Portals</a>
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
            Bridge University Learning with <br className="hidden sm:inline" />
            <span className="text-blue-400">Industry Hiring Benchmarks</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-xl mx-auto leading-relaxed">
            An explainable institutional platform combining calibrated multi-factor readiness scoring, real-time voice AI mock interviews, mathematical skill deficit prioritization, and end-to-end campus drive operations.
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
              Try Readiness Sandbox
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
                Curated CS Items
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

      {/* Interactive Readiness Sandbox Section */}
      <section id="calculator" className="py-20 px-6 border-b border-slate-800 bg-slate-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Interactive Placement Readiness Calculator
            </h2>
            <p className="text-sm text-slate-300 mt-3 leading-relaxed">
              Experience the multi-factor scoring engine in real-time. Adjust candidate metrics to see how academic standing, technical proficiency, and interview composure combine into an actionable placement rating.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-sm">
            {/* Sliders Controls Column */}
            <div className="lg:col-span-7 space-y-5">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Cumulative Grade Point Average (CGPA)
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
                <span className="text-xs text-slate-400 block mt-0.5">Weight: 20% of Placement Composite</span>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Data Structures & Algorithms Score
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
                <span className="text-xs text-slate-400 block mt-0.5">Weight: 25% • Tree, Graph, DP & Hash Optimizations</span>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Core CS Fundamentals (DBMS, OS, Networks)
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
                <span className="text-xs text-slate-400 block mt-0.5">Weight: 20% • Transaction Isolation, Memory & Protocols</span>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Foundational Aptitude (Quantitative & Logical)
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
                <span className="text-xs text-slate-400 block mt-0.5">Weight: 15% • Analytical Reasoning Speed</span>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    AI Mock Interview Verbal & Depth Score
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
                <span className="text-xs text-slate-400 block mt-0.5">Weight: 20% • Technical Conviction & STAR Communication</span>
              </div>
            </div>

            {/* Gauge Output Column */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 lg:pl-10 lg:border-l border-slate-800 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 block">
                Calibrated Placement Index
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
                  ? 'Strong candidate profile. Qualifies for high-tier campus recruitment drives and priority recruiter review.'
                  : computedSandboxScore >= 55
                  ? 'Moderate readiness. Remedial curriculum recommended in algorithm optimization and mock drills.'
                  : 'High-risk deficit identified. System automatically assigns fundamental practice tracks.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Abstract Core Features Grid */}
      <section id="features" className="py-20 px-6 border-b border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Designed for Campus Recruitment Excellence
            </h2>
            <p className="text-sm text-slate-300 mt-3 leading-relaxed">
              Every workflow from the engineering abstract implemented with enterprise rigor — zero black boxes, zero hallucinations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-3 text-blue-400">
                  <TrendingUp className="w-5 h-5 stroke-[2.2]" />
                  <h3 className="text-base font-black text-white">
                    Calibrated Readiness Index
                  </h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Synthesizes academic CGPA, multi-category assessments, and mock interview performance into an explainable 0–100% composite index.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 text-xs font-bold text-blue-400">
                Multi-Factor Synthesis
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-3 text-rose-400">
                  <BarChart3 className="w-5 h-5 stroke-[2.2]" />
                  <h3 className="text-base font-black text-white">
                    Mathematical Deficit Ranking
                  </h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Calculates exact competency gaps using <code className="text-rose-300 font-mono">Deficit = Benchmark - Observed</code>. Prioritizes critical bottlenecks for urgent remediation.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 text-xs font-bold text-rose-400">
                Deterministic Gaps
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-3 text-emerald-400">
                  <Bot className="w-5 h-5 stroke-[2.2]" />
                  <h3 className="text-base font-black text-white">
                    Voice-Enabled Mock Interview
                  </h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Interactive technical & behavioral simulations with Web Speech voice input, question readout, webcam preview, and automated NLP rubric evaluation.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 text-xs font-bold text-emerald-400">
                Real-Time Speech & Text
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-3 text-purple-400">
                  <BookOpen className="w-5 h-5 stroke-[2.2]" />
                  <h3 className="text-base font-black text-white">
                    Curated Remedial Pathways
                  </h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Content-based recommendation mapping specific skill gaps directly to algorithmic practice, system design architectures, and interactive tutorials.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 text-xs font-bold text-purple-400">
                Targeted Learning
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-3 text-amber-400">
                  <Building2 className="w-5 h-5 stroke-[2.2]" />
                  <h3 className="text-base font-black text-white">
                    Eligibility Pre-Validation
                  </h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Automated pre-validation against recruitment criteria (minimum CGPA, department restrictions, backlog limits) with transparent qualification feedback.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 text-xs font-bold text-amber-400">
                Fair Campus Recruitment
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-3 text-cyan-400">
                  <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
                  <h3 className="text-base font-black text-white">
                    Accreditation Compliance
                  </h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Aggregated institutional statistics, batch placement funnels, and recruiter export sheets providing defensible records for accreditation audits.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 text-xs font-bold text-cyan-400">
                Governance Ready
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Mock Interview Spotlight */}
      <section id="interview" className="py-20 px-6 border-b border-slate-800 bg-slate-950">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                Practice High-Stakes Tech & Behavioral Interviews
              </h2>
              <p className="text-sm text-slate-300 mt-4 leading-relaxed max-w-lg">
                Don't let your first interview experience happen in front of a hiring manager. Our AI interview simulator adapts questions dynamically, listens via voice speech recognition, and breaks down your response into actionable rubric scores.
              </p>

              <div className="space-y-4 mt-6">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Dynamic Contextual Follow-ups</h3>
                    <p className="text-xs text-slate-300 mt-0.5">The evaluator probes deeper into your answer, challenging cache invalidations, distributed transactions, or complexity tradeoffs.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Web Speech Voice Interaction</h3>
                    <p className="text-xs text-slate-300 mt-0.5">Speak directly using your microphone with real-time speech-to-text, paired with automated audio question readout.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Granular NLP Rubric Evaluation</h3>
                    <p className="text-xs text-slate-300 mt-0.5">Scores Technical Depth and Communication Clarity separately, providing exact keyword tips to reach senior competency.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => handleQuickLogin('arjun@student.edu', 'Student@123', 'STUDENT')}
                  className="btn-primary bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 px-6 rounded-xl shadow-sm flex items-center gap-2"
                >
                  <Bot className="w-4 h-4" />
                  <span>Start a Mock Interview Session</span>
                </button>
              </div>
            </div>

            {/* Visual Preview Box */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-slate-200">Live AI Evaluation Session</span>
                </div>
                <span className="text-xs font-mono text-blue-400 font-bold">Turn 2 of 4</span>
              </div>

              <div className="border-l-2 border-blue-500 pl-4 py-1">
                <span className="text-xs font-black uppercase tracking-wider text-blue-400 block mb-1">
                  AI Interviewer (Software Developer Track):
                </span>
                <p className="text-xs font-bold text-slate-100 leading-snug">
                  "How would you address cache stampede and thundering herd when hundreds of concurrent requests request an expired cache key?"
                </p>
              </div>

              <div className="border-l-2 border-emerald-500 pl-4 py-1">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400 block mb-1">
                  Candidate Verbal Answer:
                </span>
                <p className="text-xs text-slate-300 leading-relaxed font-mono">
                  "I would implement mutex locking on cache misses so only one thread computes the value while others wait, paired with probabilistic early expiration..."
                </p>
              </div>

              <div className="border-l-2 border-slate-700 pl-4 py-1 text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-emerald-300 text-xs uppercase tracking-wider">
                    Rubric Scoring
                  </span>
                  <span className="font-mono font-bold text-emerald-400">
                    Tech: 92% • Comm: 88%
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Exceptional answer; correctly identified lock synchronization and probabilistic refresh techniques.
                </p>
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
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-200 block text-sm">PlacementAI</span>
              <span className="text-xs text-slate-400">Student Success & Placement Readiness System</span>
            </div>
          </div>

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
