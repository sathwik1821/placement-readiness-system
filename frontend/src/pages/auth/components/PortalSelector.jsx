import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Users, Building2, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

export const PORTAL_OPTIONS = [
  {
    roleId: 'student',
    title: 'Student Portal',
    subtitle: 'RGUKT Engineering Undergraduates',
    description: 'Practice adaptive assessments, participate in Gemini AI mock interviews, track readiness scores, and apply to campus placement drives.',
    icon: GraduationCap,
    gradient: 'from-blue-600 to-indigo-600',
    hoverBorder: 'hover:border-blue-500',
    shadowColor: 'hover:shadow-blue-500/10',
    badge: 'RGUKT Students Only',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    emailRule: 'Format: sYYXXXX@rguktsklm.ac.in',
    demoUser: 's210018@rguktsklm.ac.in',
    path: '/login/student'
  },
  {
    roleId: 'tpo',
    title: 'Placement Officer (TPO)',
    subtitle: 'Institutional Training & Placement Cell',
    description: 'Publish placement schedules, review candidate eligibility cohorts, schedule interview rounds, and monitor campus recruitment progress.',
    icon: Users,
    gradient: 'from-indigo-600 to-purple-600',
    hoverBorder: 'hover:border-indigo-500',
    shadowColor: 'hover:shadow-indigo-500/10',
    badge: 'TPO Authority',
    badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    emailRule: 'Format: Must end with tpo (e.g. *.tpo@...)',
    demoUser: 'officer@college.edu',
    path: '/login/tpo'
  },
  {
    roleId: 'recruiter',
    title: 'Corporate Recruiter / HR',
    subtitle: 'Industry Hiring Partners',
    description: 'Submit campus hiring requisitions (JAF), evaluate candidate portfolios and verified resumes, and manage applicant evaluation stages.',
    icon: Building2,
    gradient: 'from-emerald-600 to-teal-600',
    hoverBorder: 'hover:border-emerald-500',
    shadowColor: 'hover:shadow-emerald-500/10',
    badge: 'External Enterprise Partner',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    emailRule: 'Open: Any Corporate / Business Email',
    demoUser: 'hr@techcorp.com',
    path: '/login/recruiter'
  },
  {
    roleId: 'admin',
    title: 'System Administrator',
    subtitle: 'Platform Governance & Tech Ops',
    description: 'Curate question repositories across 13 engineering domains, oversee system health, manage RBAC accounts, and inspect audit logs.',
    icon: ShieldCheck,
    gradient: 'from-amber-600 to-orange-600',
    hoverBorder: 'hover:border-amber-500',
    shadowColor: 'hover:shadow-amber-500/10',
    badge: 'System Governance',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    emailRule: 'Format: Authorized Admin Email (*admin*@...)',
    demoUser: 'admin@system.com',
    path: '/login/admin'
  }
];

export default function PortalSelector() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Role-Based Access Control</span>
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Select Your Sign-In Portal
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          Choose your stakeholder persona to access the customized authentication portal.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PORTAL_OPTIONS.map((portal) => {
          const Icon = portal.icon;
          return (
            <div
              key={portal.roleId}
              onClick={() => navigate(portal.path)}
              className={`group p-5 rounded-2xl bg-slate-900/80 border border-slate-800 transition-all duration-200 cursor-pointer flex flex-col justify-between ${portal.hoverBorder} hover:bg-slate-900 shadow-lg ${portal.shadowColor}`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${portal.gradient} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${portal.badgeColor}`}
                  >
                    {portal.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                  {portal.title}
                </h3>
                <p className="text-xs font-medium text-slate-400 mt-0.5">
                  {portal.subtitle}
                </p>

                <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">
                  {portal.description}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">
                  {portal.emailRule}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-400 group-hover:translate-x-1 transition-transform">
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center pt-2">
        <Link
          to="/"
          className="text-xs text-slate-400 hover:text-slate-200 font-medium transition-colors"
        >
          ← Return to Landing Page
        </Link>
      </div>
    </div>
  );
}
