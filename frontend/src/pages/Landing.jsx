import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  ArrowRight,
  Sparkles,
  Code2,
  Server,
  Database,
  Bot,
  Mail,
  Building2,
  Cpu,
  Layers,
  ShieldCheck,
  Users,
  ChevronDown,
  CheckCircle2
} from 'lucide-react';
import PortalSelectionModal from './auth/components/PortalSelectionModal';

export default function Landing() {
  const navigate = useNavigate();
  const [showPortalModal, setShowPortalModal] = useState(false);

  const stakeholders = [
    {
      role: 'RGUKT Students',
      audience: 'E1 to E4 Engineering Cohorts',
      badge: 'Prep & Applications',
      badgeColor: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
      icon: GraduationCap,
      gradient: 'from-blue-600 to-indigo-600',
      description: 'Practice dynamic technical interviews with Gemini AI feedback, apply to on-campus placement drives with verified resumes, and track recruitment progress in real time.',
      highlights: [
        'AI Mock Interview Simulator with scorecards',
        'One-click verified resume drive applications',
        'Email confirmation receipts with application IDs'
      ],
      portalPath: '/login/student'
    },
    {
      role: 'Placement Office (TPO)',
      audience: 'Training & Placement Officers',
      badge: 'Drive Publishing & Cutoffs',
      badgeColor: 'border-indigo-500/30 text-indigo-400 bg-indigo-500/10',
      icon: Users,
      gradient: 'from-indigo-600 to-violet-600',
      description: 'Review corporate requisition submissions, configure institutional branch & CGPA eligibility cutoffs, schedule selection rounds, and review consolidated daily digests.',
      highlights: [
        'Configurable academic thresholds & backlogs filter',
        'Asynchronous notifications to eligible students only',
        'Consolidated daily placement activity summary'
      ],
      portalPath: '/login/tpo'
    },
    {
      role: 'Corporate Recruiters',
      audience: 'HR & Campus Hiring Teams',
      badge: 'Public Opportunity Intake',
      badgeColor: 'border-purple-500/30 text-purple-400 bg-purple-500/10',
      icon: Building2,
      gradient: 'from-purple-600 to-pink-600',
      description: 'Submit campus hiring opportunities directly without mandatory account sign-up. Receive instant reference tracking IDs and review candidate submissions securely.',
      highlights: [
        'Zero-friction Job Announcement Form (JAF) intake',
        'Expiring single-use tokens for clarifications',
        'Direct applicant resume review & round tracking'
      ],
      portalPath: '/login/recruiter'
    },
    {
      role: 'System Administrators',
      audience: 'University IT & Governance',
      badge: 'Platform Security & Audit',
      badgeColor: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
      icon: ShieldCheck,
      gradient: 'from-emerald-600 to-teal-600',
      description: 'Screen external recruiter submissions before TPO dispatch, manage curated question banks across 4 industry career tracks, and audit centralized email delivery logs.',
      highlights: [
        'Pre-screening workflow for external submissions',
        'Question bank governance across 4 core career tracks',
        'Audit trail logging with delivery status verification'
      ],
      portalPath: '/login/admin'
    }
  ];

  const techStack = [
    {
      category: 'Frontend Architecture',
      icon: Code2,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      items: [
        { name: 'React 18 & Vite', desc: 'Modular Single-Page Application (SPA) architecture with fast HMR bundling.' },
        { name: 'Tailwind CSS 4', desc: 'Utility-first modern responsive styling, dark theme, and fluid typography.' },
        { name: 'Zustand & Axios', desc: 'Stateless client JWT storage and automated authorization interceptors.' },
        { name: 'Lucide React', desc: 'Crisp, accessible iconography across all dashboards and student test consoles.' }
      ]
    },
    {
      category: 'Backend & Enterprise Security',
      icon: Server,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      items: [
        { name: 'Spring Boot 3.3.4 (Java 21/25)', desc: 'Robust enterprise RESTful backend with isolated domain service layers.' },
        { name: 'Spring Security 6.x & JWT', desc: 'Stateless OncePerRequestFilter, BCrypt password hashing, and server-side RBAC.' },
        { name: 'Strict DTO Contracts', desc: 'Encapsulated request/response data transfer objects ensuring zero entity leaking.' },
        { name: 'Dual-Mode Authentication', desc: 'Instant backward compatibility with automated security upgrades to BCrypt.' }
      ]
    },
    {
      category: 'Relational Database & Migrations',
      icon: Database,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
      items: [
        { name: 'PostgreSQL Relational DB', desc: 'ACID-compliant storage for student cohorts, test attempts, drives, and logs.' },
        { name: 'Spring Data JPA & Hibernate', desc: 'Declarative query derivation, entity relationships, and transactional boundaries.' },
        { name: 'Flyway Schema Migrations', desc: 'Version-controlled database schema scripts (V1__initial_schema.sql) with baselines.' },
        { name: 'Connection Pooling', desc: 'High-concurrency HikariCP connection pooling for concurrent assessment traffic.' }
      ]
    },
    {
      category: 'Generative AI & Mock Interviews',
      icon: Bot,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/20',
      items: [
        { name: 'Google Gemini 1.5 Pro / Flash', desc: 'Dynamic technical interview prompt orchestration with context memory.' },
        { name: 'Real-Time Adaptive Dialogue', desc: 'Multi-turn candidate conversational evaluation and follow-up questioning.' },
        { name: 'Objective Rubric Scoring', desc: 'Algorithmic assessment of technical depth, communication, and problem-solving.' },
        { name: 'Diagnostic Feedback Transcripts', desc: 'Pinpoint strengths, identified deficit areas, and targeted improvement roadmaps.' }
      ]
    },
    {
      category: 'Centralized Notification Engine',
      icon: Mail,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
      items: [
        { name: 'JavaMailSender & Async Pool', desc: 'Non-blocking ThreadPoolTaskExecutor for high-throughput transactional emails.' },
        { name: 'Branded HTML Templates', desc: 'Mobile-responsive email templates for drive alerts, receipts, and daily digests.' },
        { name: 'Deduplication Guard', desc: 'Unique event hashing to prevent duplicate notifications for repeated operations.' },
        { name: 'Audit Trail Logging', desc: 'Delivery logging with delivery status (SENT, FAILED, RETRYING) in PostgreSQL.' }
      ]
    },
    {
      category: 'Placement Drive Governance',
      icon: Building2,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/20',
      items: [
        { name: 'Public Recruiter Ingestion', desc: 'Recruiters submit opportunities without accounts; unique reference ID generated.' },
        { name: 'Single-Use Clarification Tokens', desc: 'Cryptographically expiring tokens for secure recruiter response links.' },
        { name: 'Institutional Cutoffs', desc: 'Automated filtering by student CGPA, backlogs, branch, and graduation year.' },
        { name: 'TPO Verification Pipeline', desc: 'Admin screening and TPO approval gates before opportunities publish to students.' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-blue-600 selection:text-white">
      {/* 4-Portal Selection Modal */}
      <PortalSelectionModal
        isOpen={showPortalModal}
        onClose={() => setShowPortalModal(false)}
      />

      {/* Navigation Header */}
      <nav className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white block leading-none">
                Ascend
              </span>
              <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase block mt-0.5">
                RGUKT Placement Ecosystem
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <a href="#stakeholders" className="hover:text-blue-400 transition-colors">
              Stakeholders
            </a>
            <a href="#technologies" className="hover:text-blue-400 transition-colors">
              Technology Stack
            </a>
            <a href="#architecture" className="hover:text-blue-400 transition-colors">
              Placement Pipeline
            </a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPortalModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
            >
              <span>Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section: Full viewport height, strictly hero text & CTAs only */}
      <section className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-between items-center px-4 sm:px-6 lg:px-8 overflow-hidden text-center">
        {/* Ambient gradient glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/25 via-slate-950 to-slate-950 pointer-events-none" />

        {/* Top spacer for perfect vertical balance */}
        <div className="h-4 sm:h-8" />

        {/* Hero Core Content */}
        <div className="max-w-4xl mx-auto space-y-7 relative z-10 my-auto py-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Exclusively Designed for Rajiv Gandhi University of Knowledge Technologies</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.12]">
            Integrated Campus Placement <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              &amp; AI Readiness Platform
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Ascend unifies students, training and placement officers, corporate recruiters, and administrators into a high-performance, secure ecosystem powered by Spring Boot, PostgreSQL, and Google Gemini AI.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setShowPortalModal(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold shadow-xl shadow-blue-500/30 transition-all cursor-pointer group"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <a
              href="#stakeholders"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-slate-800 bg-slate-900/70 hover:bg-slate-800 text-slate-200 text-sm font-semibold transition-colors cursor-pointer"
            >
              <Users className="w-4 h-4 text-blue-400" />
              <span>Explore Stakeholders &amp; Tech</span>
            </a>
          </div>
        </div>

        {/* Subtle scroll cue at bottom of hero screen */}
        <div className="relative z-10 pb-6 pt-2">
          <a
            href="#stakeholders"
            className="inline-flex flex-col items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            <span className="text-[11px] uppercase tracking-wider font-semibold">Scroll to explore</span>
            <ChevronDown className="w-4 h-4 animate-bounce text-slate-400" />
          </a>
        </div>
      </section>

      {/* 4 Stakeholders Section: Exists below hero when scrolling */}
      <section id="stakeholders" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 bg-slate-950">
        <div className="max-w-7xl mx-auto space-y-14">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Users className="w-3.5 h-3.5" />
              <span>Placement Ecosystem</span>
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Built for All 4 Key Stakeholders
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Dedicated workflows tailored specifically for students, university placement teams, corporate hiring partners, and administrators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stakeholders.map((sh, idx) => {
              const Icon = sh.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all shadow-xl flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${sh.gradient} flex items-center justify-center text-white shadow-lg`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${sh.badgeColor}`}>
                        {sh.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                        {sh.role}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {sh.description}
                      </p>
                    </div>

                    <div className="pt-2 space-y-2 border-t border-slate-800/80">
                      {sh.highlights.map((hl, hlIdx) => (
                        <div key={hlIdx} className="flex items-start gap-2 text-xs text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                          <span className="leading-tight">{hl}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6">
                    <button
                      type="button"
                      onClick={() => navigate(sh.portalPath)}
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500 hover:bg-blue-600/10 text-xs font-semibold text-slate-200 hover:text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span>Access {sh.role}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Technologies Section: Exists below stakeholders when scrolling */}
      <section id="technologies" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 bg-slate-900/40">
        <div className="max-w-7xl mx-auto space-y-14">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Code2 className="w-3.5 h-3.5" />
              <span>Full-Stack Modern Architecture</span>
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Technologies Used in Ascend
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Engineered with industrial software standards: Spring Boot, Spring Security, PostgreSQL, React 18, and Google Gemini AI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {techStack.map((tier, idx) => {
              const Icon = tier.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-10 h-10 rounded-xl ${tier.bgColor} ${tier.borderColor} border ${tier.color} flex items-center justify-center shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-base font-bold text-white">
                        {tier.category}
                      </h3>
                    </div>

                    <div className="space-y-3">
                      {tier.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/70 text-xs">
                          <span className="font-bold text-slate-200 block">
                            {item.name}
                          </span>
                          <span className="text-slate-400 leading-relaxed block mt-0.5">
                            {item.desc}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Placement Workflow Overview */}
      <section id="architecture" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 bg-slate-950">
        <div className="max-w-7xl mx-auto space-y-14">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Layers className="w-3.5 h-3.5" />
              <span>End-to-End Placement Pipeline</span>
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              How the Placement Engine Operates
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              From corporate requisition intake to student shortlisting, every stage is verified and tracked.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {[
              {
                step: '01',
                title: 'Recruiter Submits JAF',
                desc: 'Corporate recruiters submit job descriptions and criteria publicly without mandatory sign-up. A unique reference ID is generated.'
              },
              {
                step: '02',
                title: 'Admin Verification',
                desc: 'System admin screens the opportunity, requests clarification via single-use expiring token if needed, and approves for TPO review.'
              },
              {
                step: '03',
                title: 'TPO Publishes Drive',
                desc: 'The Training & Placement Officer verifies academic cutoffs and publishes the drive. Asynchronous broadcast emails notify eligible students.'
              },
              {
                step: '04',
                title: 'Student Applies & Preps',
                desc: 'Eligible students apply with verified resumes, receive application confirmation with tracking IDs, and prep via AI mock interviews.'
              }
            ].map((st, i) => (
              <div key={i} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs">
                <span className="text-2xl font-black font-mono text-blue-500 block mb-2">
                  {st.step}
                </span>
                <h4 className="text-sm font-bold text-white mb-1.5">
                  {st.title}
                </h4>
                <p className="text-slate-400 leading-relaxed">
                  {st.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800 bg-slate-950 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-300">Ascend</span>
              <span className="text-slate-500 ml-2">— Rajiv Gandhi University of Knowledge Technologies</span>
            </div>
          </div>

          <div className="flex items-center gap-5 text-slate-400">
            <a href="#stakeholders" className="hover:text-white transition-colors">Stakeholders</a>
            <a href="#technologies" className="hover:text-white transition-colors">Technologies</a>
            <a href="#architecture" className="hover:text-white transition-colors">Pipeline</a>
            <button onClick={() => setShowPortalModal(true)} className="hover:text-white transition-colors cursor-pointer">
              Sign In
            </button>
          </div>

          <div className="text-slate-500">
            © 2026 RGUKT. Placement System v2.0 • Spring Boot &amp; React
          </div>
        </div>
      </footer>
    </div>
  );
}
