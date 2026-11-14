import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import { GraduationCap, ArrowRight, ShieldCheck, Sparkles, Building2, UserCircle2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

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
      setError(err.response?.data?.error || 'Invalid email or password credentials');
    } finally {
      setLoading(false);
    }
  };

  const quickLogins = [
    { label: 'Student (Arjun)', email: 'arjun@student.edu', password: 'Student@123', roleBadge: 'Student', badgeStyle: 'bg-blue-500/20 text-blue-300 border-blue-400/30' },
    { label: 'Student (Priya)', email: 'priya@student.edu', password: 'Student@123', roleBadge: 'Student', badgeStyle: 'bg-blue-500/20 text-blue-300 border-blue-400/30' },
    { label: 'Placement Officer', email: 'officer@college.edu', password: 'Officer@123', roleBadge: 'Placement Officer', badgeStyle: 'bg-amber-500/20 text-amber-300 border-amber-400/30' },
    { label: 'Corporate Recruiter', email: 'hr@techcorp.com', password: 'Company@123', roleBadge: 'Recruiter', badgeStyle: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' },
    { label: 'System Admin', email: 'admin@system.com', password: 'Admin@123', roleBadge: 'Administrator', badgeStyle: 'bg-purple-500/20 text-purple-300 border-purple-400/30' }
  ];

  const fillQuick = (qEmail, qPass) => {
    setEmail(qEmail);
    setPassword(qPass);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 text-gray-100">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center gap-3 mb-2 hover:opacity-90 transition-opacity">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm ring-4 ring-blue-500/20">
              <GraduationCap className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white">
              Ascend
            </h1>
          </Link>
          <p className="text-sm font-bold text-slate-300">
            Campus Placement & Career Readiness Platform
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Explainable Skill Analytics, AI Mock Interviews & Placement Operations
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-200 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Institutional Email ID
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. arjun@student.edu"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Account Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="text-sm">Authenticating...</span>
              ) : (
                <>
                  <span className="text-sm">Sign In to Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Selection */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>One-Click Evaluation Logins</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {quickLogins.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => fillQuick(item.email, item.password)}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-left transition-colors group"
                >
                  <div>
                    <p className="text-xs font-semibold text-white group-hover:text-blue-300 transition-colors">
                      {item.label}
                    </p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{item.email}</p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${item.badgeStyle}`}>
                    {item.roleBadge}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Secured with JWT authentication and strict Role-Based Access Control (RBAC).
        </p>
      </div>
    </div>
  );
}
