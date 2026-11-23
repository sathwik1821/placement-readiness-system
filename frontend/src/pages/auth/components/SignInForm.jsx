import React from 'react';
import { Mail, Lock, Loader2, ArrowRight, ShieldCheck, GraduationCap, Building2, Users } from 'lucide-react';

export default function SignInForm({
  email,
  setEmail,
  password,
  setPassword,
  loading,
  activeQuickRole,
  handleSubmit,
  handleQuickFill,
  onSwitchToRegister,
  onSwitchToForgotPassword
}) {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
          Institutional Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. s210018@rguktsklm.ac.in"
            required
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Password
          </label>
          <button
            type="button"
            onClick={onSwitchToForgotPassword}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            Forgot Password?
          </button>
        </div>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your account password"
            required
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all mt-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Authenticating...</span>
          </>
        ) : (
          <>
            <span>Sign In to Ascend</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      {/* Quick Fill Demo Access Persona Pills */}
      <div className="pt-4 border-t border-slate-800">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2.5 text-center">
          Instant Role Demo Access
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleQuickFill('STUDENT')}
            className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition-all ${
              activeQuickRole === 'STUDENT'
                ? 'border-blue-500 bg-blue-500/10 text-blue-300'
                : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:border-slate-700'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-blue-400 shrink-0" />
            <div className="truncate">
              <div className="font-semibold">Student (E4)</div>
              <div className="text-[10px] text-slate-500 truncate">s210018@rgukt</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickFill('OFFICER')}
            className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition-all ${
              activeQuickRole === 'OFFICER'
                ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:border-slate-700'
            }`}
          >
            <Users className="w-4 h-4 text-indigo-400 shrink-0" />
            <div className="truncate">
              <div className="font-semibold">TPO Office</div>
              <div className="text-[10px] text-slate-500 truncate">officer@college</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickFill('COMPANY')}
            className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition-all ${
              activeQuickRole === 'COMPANY'
                ? 'border-purple-500 bg-purple-500/10 text-purple-300'
                : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:border-slate-700'
            }`}
          >
            <Building2 className="w-4 h-4 text-purple-400 shrink-0" />
            <div className="truncate">
              <div className="font-semibold">Recruiter</div>
              <div className="text-[10px] text-slate-500 truncate">hr@techcorp.com</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickFill('ADMIN')}
            className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition-all ${
              activeQuickRole === 'ADMIN'
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                : 'border-slate-800 bg-slate-900/50 text-slate-300 hover:border-slate-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="truncate">
              <div className="font-semibold">Administrator</div>
              <div className="text-[10px] text-slate-500 truncate">admin@system.com</div>
            </div>
          </button>
        </div>
      </div>

      <div className="text-center pt-2">
        <p className="text-xs text-slate-400">
          New RGUKT Student?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-blue-400 hover:text-blue-300 font-semibold"
          >
            Register Student Account
          </button>
        </p>
      </div>
    </form>
  );
}
