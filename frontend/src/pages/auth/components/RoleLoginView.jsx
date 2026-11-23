import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowRight, AlertCircle, ArrowLeft, Building2, ExternalLink } from 'lucide-react';
import { PORTAL_OPTIONS } from './PortalSelector';

export const validateRoleEmail = (roleId, email) => {
  if (!email || !email.trim()) {
    return { valid: false, error: 'Email address is required.' };
  }

  const clean = email.trim().toLowerCase();
  const parts = clean.split('@');
  if (parts.length !== 2 || !parts[0] || !parts[1] || !parts[1].includes('.')) {
    return { valid: false, error: 'Please enter a well-formed email address (e.g. user@domain.com).' };
  }

  const localPart = parts[0];
  const domain = parts[1];

  switch (roleId) {
    case 'student': {
      // Must be RGUKT student email format: sYYXXXX@...rgukt...ac.in
      const isStudentPattern = /^[sS]\d{2}\d{4,6}@/i.test(clean) && domain.includes('rgukt');
      const isRGUKTDomain = domain.endsWith('ac.in') || domain.includes('rgukt');
      if (!isStudentPattern && !isRGUKTDomain && !clean.startsWith('s210018')) {
        return {
          valid: false,
          error: 'Student login requires an RGUKT student institutional email (e.g., s210018@rguktsklm.ac.in).'
        };
      }
      return { valid: true };
    }

    case 'tpo':
    case 'officer': {
      // Must end with "tpo" in local part (e.g., name.tpo@..., placementstpo@..., tpo@...) or contain tpo, or match demo officer@college.edu
      const endsWithTpo = localPart.endsWith('tpo');
      const containsTpo = localPart.includes('tpo');
      const isLegacyDemo = clean === 'officer@college.edu';
      if (!endsWithTpo && !containsTpo && !isLegacyDemo) {
        return {
          valid: false,
          error: 'TPO login requires an email ending with "tpo" in the username format (e.g., placement.tpo@rguktsklm.ac.in, tpo@rgukt.ac.in).'
        };
      }
      return { valid: true };
    }

    case 'admin': {
      // Must contain "admin" in email
      const isAdmin = localPart.includes('admin') || clean.includes('admin');
      if (!isAdmin) {
        return {
          valid: false,
          error: 'Administrator login requires an authorized administrative email address (e.g., admin@system.com).'
        };
      }
      return { valid: true };
    }

    case 'recruiter':
    case 'company': {
      // No restriction on HR as they are outsiders; any valid email is accepted
      return { valid: true };
    }

    default:
      return { valid: true };
  }
};

export default function RoleLoginView({
  portalConfig,
  email,
  setEmail,
  password,
  setPassword,
  loading,
  error,
  setError,
  onSubmit,
  onSwitchToRegister,
  onSwitchToForgotPassword
}) {
  const navigate = useNavigate();
  const Icon = portalConfig.icon;

  const handleDemoFill = () => {
    setError('');
    if (portalConfig.roleId === 'student') {
      setEmail('s210018@rguktsklm.ac.in');
      setPassword('Student@123');
    } else if (portalConfig.roleId === 'tpo' || portalConfig.roleId === 'officer') {
      setEmail('officer@college.edu');
      setPassword('Officer@123');
    } else if (portalConfig.roleId === 'recruiter' || portalConfig.roleId === 'company') {
      setEmail('hr@techcorp.com');
      setPassword('Company@123');
    } else if (portalConfig.roleId === 'admin') {
      setEmail('admin@system.com');
      setPassword('Admin@123');
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Pre-flight client email validation according to role constraints
    const validation = validateRoleEmail(portalConfig.roleId, email);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    onSubmit(e);
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Switcher */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Portals</span>
        </button>

        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${portalConfig.badgeColor}`}
        >
          {portalConfig.badge}
        </span>
      </div>

      {/* Role Banner */}
      <div className="flex items-center gap-3.5">
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${portalConfig.gradient} flex items-center justify-center text-white shadow-lg shrink-0`}
        >
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-black text-white tracking-tight">
            {portalConfig.title}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {portalConfig.subtitle}
          </p>
        </div>
      </div>

      {/* Email Requirement Callout */}
      <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-start gap-2">
        <Mail className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-200">Email Format Requirement: </span>
          <span>{portalConfig.emailRule}</span>
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            {portalConfig.roleId === 'student'
              ? 'RGUKT Institutional Email'
              : portalConfig.roleId === 'tpo'
              ? 'Authorized TPO Email'
              : portalConfig.roleId === 'admin'
              ? 'Administrator Email'
              : 'Corporate Email Address'}
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              placeholder={
                portalConfig.roleId === 'student'
                  ? 'e.g. s210018@rguktsklm.ac.in'
                  : portalConfig.roleId === 'tpo'
                  ? 'e.g. placement.tpo@rguktsklm.ac.in'
                  : portalConfig.roleId === 'admin'
                  ? 'e.g. admin@system.com'
                  : 'e.g. hr@company.com'
              }
              required
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
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
              className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors cursor-pointer"
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
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r ${portalConfig.gradient} hover:opacity-95 text-white font-semibold rounded-xl text-sm shadow-lg disabled:opacity-50 transition-all cursor-pointer`}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Authenticating {portalConfig.title}...</span>
            </>
          ) : (
            <>
              <span>Sign In to {portalConfig.title}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Demo Fast Fill Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleDemoFill}
            className="w-full py-2 px-3 rounded-xl border border-slate-800 bg-slate-950/70 hover:bg-slate-800/60 text-slate-300 text-xs font-medium flex items-center justify-between transition-colors cursor-pointer"
          >
            <span>Fill Demo Credentials ({portalConfig.demoUser})</span>
            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">
              Auto-Fill
            </span>
          </button>
        </div>

        {/* Recruiter-specific opportunity submission shortcut */}
        {(portalConfig.roleId === 'recruiter' || portalConfig.roleId === 'company') && (
          <div className="pt-3 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              Visiting Recruiter without an account?
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Recruiters can submit campus hiring opportunities directly without prior account registration.
            </p>
          </div>
        )}

        {/* Student-specific registration shortcut */}
        {portalConfig.roleId === 'student' && (
          <div className="pt-3 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              New RGUKT Student?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer underline"
              >
                Register Student Account
              </button>
            </p>
          </div>
        )}
      </form>
    </div>
  );
}
