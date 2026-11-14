import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  LayoutDashboard,
  ClipboardList,
  LineChart,
  Bot,
  Briefcase,
  GraduationCap,
  User,
  LogOut,
  Building2,
  Users,
  Settings,
  HelpCircle
} from 'lucide-react';

export default function AppLayout({ children }) {
  const { role, logout, user } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const studentLinks = [
    { to: '/student', icon: LayoutDashboard, label: 'Overview Dashboard' },
    { to: '/student/tests', icon: ClipboardList, label: 'Assessments & Tests' },
    { to: '/student/analysis', icon: LineChart, label: 'My Analysis Hub' },
    { to: '/student/interview', icon: Bot, label: 'AI Mock Interview' },
    { to: '/student/jobs', icon: Briefcase, label: 'Job Recommendations' },
    { to: '/student/placement', icon: GraduationCap, label: 'Campus Placement Drives' },
    { to: '/student/profile', icon: User, label: 'Student Profile & Goals' }
  ];

  const officerLinks = [
    { to: '/officer', icon: LayoutDashboard, label: 'Placement Console' },
    { to: '/officer/drives', icon: Building2, label: 'Manage Drives' },
    { to: '/officer/drives/new', icon: GraduationCap, label: 'Publish New Drive' },
    { to: '/officer/applications', icon: Users, label: 'Application Pipelines' }
  ];

  const adminLinks = [
    { to: '/admin', icon: LayoutDashboard, label: 'System Analytics' },
    { to: '/admin/users', icon: Users, label: 'User Governance' },
    { to: '/admin/questions', icon: ClipboardList, label: 'Question Bank Curation' }
  ];

  const companyLinks = [
    { to: '/company', icon: LayoutDashboard, label: 'Recruiter Dashboard' },
    { to: '/company/drives', icon: Building2, label: 'Active Placement Drives' }
  ];

  let currentLinks = studentLinks;
  let portalBadge = 'Student Success Portal';

  if (role === 'PLACEMENT_OFFICER') {
    currentLinks = officerLinks;
    portalBadge = 'Placement Officer Console';
  } else if (role === 'ADMIN') {
    currentLinks = adminLinks;
    portalBadge = 'Administration Portal';
  } else if (role === 'COMPANY') {
    currentLinks = companyLinks;
    portalBadge = 'Recruiter Interaction Hub';
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shrink-0 shadow-sm z-20">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm ring-4 ring-blue-50">
            <GraduationCap className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-base font-black text-slate-900 tracking-tight leading-tight">PlacementAI</h1>
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block mt-0.5">
              {portalBadge}
            </span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
          {currentLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/student' || item.to === '/officer' || item.to === '/admin' || item.to === '/company'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-600 text-white font-bold shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0 stroke-[2.2]" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 bg-slate-50/70">
          <div className="mb-3 px-2">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Signed in role</p>
            <p className="text-xs font-black text-slate-900 capitalize mt-0.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {role?.replace('_', ' ').toLowerCase()}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2.5 w-full px-3.5 py-2.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4 stroke-[2.2]" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-slate-50/60">
        <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-8 py-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5 bg-emerald-50 text-emerald-900 border border-emerald-200 px-3 py-1 rounded-full">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider">
              AI Readiness Engine Active
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-medium text-slate-600">
              Active Session: <strong className="text-slate-900 font-bold">{user?.email || 'User'}</strong>
            </span>
          </div>
        </header>

        <div className="flex-1 p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
