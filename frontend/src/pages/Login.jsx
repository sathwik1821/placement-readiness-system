import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import {
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Building2,
  Users,
  Lock,
  Mail,
  User,
  Loader2,
  CheckCircle2,
  UserPlus,
  AlertCircle,
  School,
  KeyRound,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';

export default function Login() {
  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'register' | 'forgot_password'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [regStep, setRegStep] = useState('EMAIL'); // 'EMAIL' | 'OTP'
  const [otp, setOtp] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [devOtpNotice, setDevOtpNotice] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // Forgot Password States
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState('EMAIL'); // 'EMAIL' | 'OTP'
  const [forgotSending, setForgotSending] = useState(false);
  const [forgotResetting, setForgotResetting] = useState(false);
  const [forgotDevOtp, setForgotDevOtp] = useState('');
  const [forgotResendTimer, setForgotResendTimer] = useState(0);

  const [loading, setLoading] = useState(false);
  const [activeQuickRole, setActiveQuickRole] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const { login } = useAuthStore();
  const navigate = useNavigate();

  // Registration Resend countdown timer
  React.useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => setResendTimer((t) => t - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [resendTimer]);

  // Forgot Password Resend countdown timer
  React.useEffect(() => {
    if (forgotResendTimer > 0) {
      const timer = setInterval(() => setForgotResendTimer((t) => t - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [forgotResendTimer]);

  const redirectRoutes = {
    STUDENT: '/student',
    PLACEMENT_OFFICER: '/officer',
    COMPANY: '/company',
    ADMIN: '/admin'
  };

  // Helper to parse RGUKT student ID & graduating batch in real time
  const parseRguktEmail = (val) => {
    if (!val) return null;
    const match = val.trim().match(/^[sS](\d{2})(\d{4,6})@((?:[a-zA-Z0-9-]+\.)?rgukt(?:[a-zA-Z0-9-]*)?\.ac\.in)$/i);
    if (!match) return null;
    const yearShort = parseInt(match[1], 10);
    const admissionYear = 2000 + yearShort;
    const graduationYear = admissionYear + 6;
    const rollNumber = `S${match[1]}${match[2]}`.toUpperCase();
    const campus = match[3].toLowerCase().includes('sklm') ? 'RGUKT Srikakulam' : 'RGUKT';
    const yearPhase = graduationYear === 2027
      ? 'B.Tech E4 (Final Year)'
      : graduationYear === 2028
      ? 'B.Tech E3 (Pre-Final Year)'
      : `B.Tech Class of ${graduationYear}`;
    return { rollNumber, admissionYear, graduationYear, campus, yearPhase };
  };

  const detectedStudentInfo = parseRguktEmail(email);

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email: email.trim(), password });
      login(res.data.token, res.data.role, { email: email.trim() });
      navigate(redirectRoutes[res.data.role] || '/student');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!detectedStudentInfo) {
      setError('Student registration is strictly restricted to RGUKT institutional email addresses (e.g. s210018@rguktsklm.ac.in).');
      return;
    }

    setSendingOtp(true);
    try {
      const res = await api.post('/auth/send-otp', { email: email.trim() });
      setRegStep('OTP');
      setSuccessMsg(`A 6-digit verification code was sent to ${email.trim()}.`);
      if (res.data?.devOtp) {
        setDevOtpNotice(res.data.devOtp);
      }
      setResendTimer(60);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to dispatch verification OTP. Please try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!detectedStudentInfo) {
      setError('Student registration is strictly restricted to RGUKT institutional email addresses (e.g., s210018@rguktsklm.ac.in).');
      return;
    }

    if (!otp || otp.trim().length !== 6) {
      setError('Please enter the 6-digit verification OTP code received on your RGUKT email.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    if (!confirmPassword) {
      setError('Please confirm your password.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please ensure both password entries are identical.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        email: email.trim(),
        password,
        confirmPassword,
        name: name.trim() || `Student (${detectedStudentInfo.rollNumber})`,
        role: 'STUDENT',
        otp: otp.trim(),
        department
      });

      setSuccessMsg('Email ownership verified! RGUKT Student profile activated. Redirecting...');
      login(res.data.token, res.data.role, { email: email.trim() });
      setTimeout(() => {
        navigate('/student');
      }, 800);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. The OTP may be expired or invalid.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSendOtp = async (e) => {
    e?.preventDefault();
    setError('');
    setSuccessMsg('');
    const target = (forgotEmail || email).trim();
    if (!target) {
      setError('Please enter your registered email address.');
      return;
    }
    setForgotSending(true);
    try {
      const res = await api.post('/auth/forgot-password/send-otp', { email: target });
      setForgotStep('OTP');
      setSuccessMsg(`A 6-digit password reset code was dispatched to ${target}.`);
      if (res.data?.devOtp) {
        setForgotDevOtp(res.data.devOtp);
      }
      setForgotResendTimer(60);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to dispatch reset code. Please check email address.');
    } finally {
      setForgotSending(false);
    }
  };

  const handleResetPassword = async (e) => {
    e?.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!forgotOtp || forgotOtp.trim().length !== 6) {
      setError('Please enter the 6-digit verification code received on your email.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('New password must contain at least 6 characters.');
      return;
    }

    if (!confirmNewPassword) {
      setError('Please confirm your new password.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match. Please verify both password entries.');
      return;
    }

    setForgotResetting(true);
    try {
      const res = await api.post('/auth/reset-password', {
        email: (forgotEmail || email).trim(),
        otp: forgotOtp.trim(),
        newPassword,
        confirmPassword: confirmNewPassword
      });

      setSuccessMsg(res.data?.message || 'Password reset successfully! Please sign in with your new password.');
      setEmail((forgotEmail || email).trim());
      setPassword(newPassword);
      setAuthMode('signin');
      setForgotStep('EMAIL');
      setForgotOtp('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Password reset failed. Code may be invalid or expired.');
    } finally {
      setForgotResetting(false);
    }
  };

  const handleDirectAccess = async (targetEmail, targetPassword, targetRole) => {
    setError('');
    setActiveQuickRole(targetRole);
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email: targetEmail, password: targetPassword });
      login(res.data.token, res.data.role, { email: targetEmail });
      navigate(redirectRoutes[res.data.role] || '/student');
    } catch (err) {
      console.warn('API authentication error, applying fallback session:', err);
      const fallbackToken = 'demo-token-' + Date.now();
      login(fallbackToken, targetRole, { email: targetEmail });
      navigate(redirectRoutes[targetRole] || '/student');
    } finally {
      setLoading(false);
      setActiveQuickRole(null);
    }
  };

  const quickRoles = [
    {
      role: 'STUDENT',
      name: 'Sathwik (S210018)',
      email: 's210018@rguktsklm.ac.in',
      password: 'Student@123',
      label: 'RGUKT Student Portal',
      badge: 'RGUKT SKLM • 2027 Batch (E4)',
      desc: 'Final-year B.Tech placement candidate (ID: S210018) • Java Full Stack Track',
      icon: GraduationCap,
      colorClass: 'border-blue-500/40 hover:border-blue-400 bg-blue-950/20 hover:bg-blue-900/30 text-blue-400',
      btnClass: 'bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold'
    },
    {
      role: 'PLACEMENT_OFFICER',
      name: 'Dr. Suresh Varma',
      email: 'officer@college.edu',
      password: 'Officer@123',
      label: 'Placement Officer (TPO)',
      badge: 'Officer Console',
      desc: 'Coordinate campus drives, review student cohorts, and verify applicants',
      icon: Users,
      colorClass: 'border-emerald-500/40 hover:border-emerald-400 bg-emerald-950/20 hover:bg-emerald-900/30 text-emerald-400',
      btnClass: 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold'
    },
    {
      role: 'COMPANY',
      name: 'HR TechCorp',
      email: 'hr@techcorp.com',
      password: 'Company@123',
      label: 'Corporate Recruiter',
      badge: 'TechCorp Recruiter',
      desc: 'Publish hiring drives, shortlist filtered candidates, and review talent',
      icon: Building2,
      colorClass: 'border-purple-500/40 hover:border-purple-400 bg-purple-950/20 hover:bg-purple-900/30 text-purple-400',
      btnClass: 'bg-purple-400 hover:bg-purple-300 text-slate-950 font-bold'
    },
    {
      role: 'ADMIN',
      name: 'System Admin',
      email: 'admin@system.com',
      password: 'Admin@123',
      label: 'System Administrator',
      badge: 'Governance & Audits',
      desc: 'Curate question banks, manage user accounts, and oversee system logs',
      icon: ShieldCheck,
      colorClass: 'border-amber-500/40 hover:border-amber-400 bg-amber-950/20 hover:bg-amber-900/30 text-amber-400',
      btnClass: 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold'
    }
  ];

  const secondaryQuickAccounts = [
    { name: 'Priya Patel (S220145 - 2028 Batch • E3)', email: 's220145@rguktsklm.ac.in', password: 'Student@123', role: 'STUDENT' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-4xl">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center gap-3.5 mb-3 group hover:opacity-95 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg ring-4 ring-blue-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-7 h-7 stroke-[2.2]" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-black tracking-tight text-white leading-none">
                Ascend
              </h1>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest block mt-1">
                RGUKT Institutional Placement Platform
              </span>
            </div>
          </Link>
          <p className="text-sm text-slate-300 max-w-lg mx-auto">
            Select a verified role below for direct evaluation access, or authenticate with your RGUKT institutional credentials.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-3 max-w-xl mx-auto">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-3 max-w-xl mx-auto">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Section 1: 1-Click Direct Role Access Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Direct 1-Click Role Access</span>
            </h2>
            <span className="text-xs font-medium text-slate-400">
              Instant evaluation access with pre-configured accounts
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickRoles.map((item) => {
              const Icon = item.icon;
              const isCurrentLoading = loading && activeQuickRole === item.role;

              return (
                <div
                  key={item.role}
                  className={`p-5 rounded-2xl border transition-all text-left flex flex-col justify-between ${item.colorClass}`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700/60 flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white tracking-tight">
                            {item.label}
                          </h3>
                          <p className="text-xs font-medium text-slate-300">
                            {item.name}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-900/80 border border-slate-700 text-slate-300 whitespace-nowrap">
                        {item.badge}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed mb-4">
                      {item.desc}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                    <span className="text-xs font-mono text-slate-400 truncate max-w-[200px]" title={item.email}>
                      {item.email}
                    </span>

                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleDirectAccess(item.email, item.password, item.role)}
                      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer ${item.btnClass}`}
                    >
                      {isCurrentLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Entering...</span>
                        </>
                      ) : (
                        <>
                          <span>Direct Access</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Secondary Student Track Link */}
          <div className="mt-3 flex items-center justify-end gap-3 px-1">
            <span className="text-xs text-slate-400">Also test with:</span>
            {secondaryQuickAccounts.map((sec) => (
              <button
                key={sec.email}
                type="button"
                disabled={loading}
                onClick={() => handleDirectAccess(sec.email, sec.password, sec.role)}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 underline underline-offset-4 disabled:opacity-50 transition-colors"
              >
                {sec.name} →
              </button>
            ))}
          </div>
        </div>

        {/* Section 2: Sign In / Register Tabs & Form */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl max-w-xl mx-auto">
          {/* Tabs */}
          <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => { setAuthMode('signin'); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                authMode === 'signin'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Institutional Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('register'); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                authMode === 'register'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>RGUKT Student Registration</span>
            </button>
            {authMode === 'forgot_password' && (
              <button
                type="button"
                className="flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 bg-amber-500 text-slate-950 shadow-sm"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Reset Password</span>
              </button>
            )}
          </div>

          {authMode === 'signin' ? (
            /* Sign In Form */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Institutional Email ID
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. s210018@rguktsklm.ac.in"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  RGUKT Students: Use your student ID mail (<span className="text-blue-400 font-mono">s21...</span> for 2027 batch, <span className="text-blue-400 font-mono">s22...</span> for 2028 batch)
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Account Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('forgot_password');
                      setForgotEmail(email);
                      setError('');
                      setSuccessMsg('');
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-4 cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading && !activeQuickRole ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Authenticating Session...</span>
                  </>
                ) : (
                  <>
                    <span className="text-sm">Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : authMode === 'register' ? (
            /* Student Self-Registration 2-Step Form */
            <div className="space-y-4">
              <div className="p-3 bg-blue-950/40 border border-blue-800/60 rounded-xl text-xs text-blue-200 flex items-start gap-2.5">
                <School className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold text-white block mb-0.5">RGUKT Student Institutional Gate</strong>
                  To ensure account security, registration requires email ownership verification via a 6-digit one-time code (OTP).
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    regStep === 'EMAIL' ? 'bg-blue-600 text-white ring-2 ring-blue-500/30' : 'bg-emerald-600 text-white'
                  }`}>
                    {regStep === 'OTP' ? '✓' : '1'}
                  </span>
                  <span className={`text-xs font-bold ${regStep === 'EMAIL' ? 'text-white' : 'text-slate-400'}`}>
                    1. Identity & Email
                  </span>
                </div>
                <div className="w-8 h-0.5 bg-slate-800" />
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    regStep === 'OTP' ? 'bg-blue-600 text-white ring-2 ring-blue-500/30' : 'bg-slate-800 text-slate-400'
                  }`}>
                    2
                  </span>
                  <span className={`text-xs font-bold ${regStep === 'OTP' ? 'text-white' : 'text-slate-400'}`}>
                    2. Email OTP & Password
                  </span>
                </div>
              </div>

              {regStep === 'EMAIL' ? (
                /* Step 1: Candidate Name, Department, RGUKT Email */
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Candidate Full Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Sathwik V"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Academic Department
                      </label>
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Computer Science & Engineering">Computer Science & Engineering (CSE)</option>
                        <option value="Electronics & Communication Engineering">Electronics & Communication (ECE)</option>
                        <option value="Mechanical Engineering">Mechanical Engineering (ME)</option>
                        <option value="Civil Engineering">Civil Engineering (CE)</option>
                        <option value="Chemical Engineering">Chemical Engineering (CHE)</option>
                        <option value="Metallurgical & Materials Engineering">Metallurgical & Materials (MME)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Official RGUKT Student Email
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. s210018@rguktsklm.ac.in"
                          className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      </div>
                    </div>
                  </div>

                  {/* Real-time batch detector chip */}
                  {detectedStudentInfo ? (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div>
                        <strong className="text-white block font-semibold">{detectedStudentInfo.campus} Verified Candidate</strong>
                        Roll: <code className="bg-emerald-950 px-1.5 py-0.5 rounded font-mono font-bold text-emerald-200">{detectedStudentInfo.rollNumber}</code> • {detectedStudentInfo.graduationYear} Graduating Batch ({detectedStudentInfo.yearPhase})
                      </div>
                    </div>
                  ) : email.length > 5 ? (
                    <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                      <span>Institutional email required: <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-200">s21XXXX@rguktsklm.ac.in</code></span>
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={sendingOtp || !detectedStudentInfo}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {sendingOtp ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Dispatching Verification Code...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        <span className="text-sm">Send Verification OTP to Email</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Step 2: Enter OTP & Set Password */
                <form onSubmit={handleRegister} className="space-y-4">
                  {/* Verified Email Banner */}
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Verification code dispatched to:</span>
                      <span className="text-xs font-mono font-bold text-blue-400">{email}</span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {detectedStudentInfo?.rollNumber} • {detectedStudentInfo?.yearPhase}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setRegStep('EMAIL'); setOtp(''); setError(''); }}
                      className="text-xs font-semibold text-slate-400 hover:text-white underline underline-offset-4 flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3 h-3" /> Change
                    </button>
                  </div>

                  {/* Dev Helper Notice */}
                  {devOtpNotice && (
                    <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Dev Test Code: <code className="bg-blue-950 px-1.5 py-0.5 rounded font-mono font-bold text-white tracking-widest">{devOtpNotice}</code></span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setOtp(devOtpNotice)}
                        className="text-[11px] font-bold text-blue-400 hover:text-blue-200 underline"
                      >
                        Auto-fill
                      </button>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                        6-Digit Email Verification Code (OTP)
                      </label>
                      <span className="text-[11px] text-slate-400">
                        {resendTimer > 0 ? (
                          `Resend in ${resendTimer}s`
                        ) : (
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={sendingOtp}
                            className="text-blue-400 hover:text-blue-300 underline font-semibold flex items-center gap-1"
                          >
                            <RefreshCw className="w-3 h-3" /> Resend OTP
                          </button>
                        )}
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="123456"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-lg font-mono tracking-widest text-center text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                      />
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Enter Password
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Min. 6 chars"
                          className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repeat password"
                          className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      </div>
                    </div>
                  </div>

                  {/* Real-time match indicator */}
                  {password && confirmPassword && (
                    <div className="text-xs font-semibold">
                      {password === confirmPassword ? (
                        <span className="text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Passwords match
                        </span>
                      ) : (
                        <span className="text-amber-400 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5" /> Passwords do not match
                        </span>
                      )}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6 || password.length < 6 || password !== confirmPassword}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Verifying OTP & Activating Profile...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-sm">Verify OTP & Complete Registration</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* Forgot Password 2-Step Form */
            <div className="space-y-4">
              <div className="p-3 bg-amber-950/30 border border-amber-800/50 rounded-xl text-xs text-amber-200 flex items-start gap-2.5">
                <KeyRound className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold text-white block mb-0.5">Password Recovery via Email OTP</strong>
                  Enter your registered institutional email to receive a secure 6-digit verification code and reset your password.
                </div>
              </div>

              {/* Progress Stepper for Forgot Password */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    forgotStep === 'EMAIL' ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400/30' : 'bg-emerald-600 text-white'
                  }`}>
                    {forgotStep === 'OTP' ? '✓' : '1'}
                  </span>
                  <span className={`text-xs font-bold ${forgotStep === 'EMAIL' ? 'text-white' : 'text-slate-400'}`}>
                    1. Send Reset Code
                  </span>
                </div>
                <div className="w-8 h-0.5 bg-slate-800" />
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    forgotStep === 'OTP' ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400/30' : 'bg-slate-800 text-slate-400'
                  }`}>
                    2
                  </span>
                  <span className={`text-xs font-bold ${forgotStep === 'OTP' ? 'text-white' : 'text-slate-400'}`}>
                    2. Verify OTP & Set Password
                  </span>
                </div>
              </div>

              {forgotStep === 'EMAIL' ? (
                /* Forgot Password Step 1: Email */
                <form onSubmit={handleForgotSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Registered Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="e.g. s210018@rguktsklm.ac.in"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      We will dispatch a secure 6-digit one-time code (OTP) to this registered mailbox.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => { setAuthMode('signin'); setError(''); setSuccessMsg(''); }}
                      className="py-2.5 px-4 rounded-xl border border-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Return to Sign In
                    </button>
                    <button
                      type="submit"
                      disabled={forgotSending || !forgotEmail}
                      className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {forgotSending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">Dispatching Reset Code...</span>
                        </>
                      ) : (
                        <>
                          <KeyRound className="w-4 h-4" />
                          <span className="text-sm">Send Password Reset OTP</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                /* Forgot Password Step 2: OTP + New Password + Confirm Password */
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Password reset code dispatched to:</span>
                      <span className="text-xs font-mono font-bold text-amber-400">{forgotEmail}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setForgotStep('EMAIL'); setForgotOtp(''); setError(''); }}
                      className="text-xs font-semibold text-slate-400 hover:text-white underline underline-offset-4 flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-3 h-3" /> Change
                    </button>
                  </div>

                  {/* Dev Helper Notice if active */}
                  {forgotDevOtp && (
                    <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Dev Reset Code: <code className="bg-amber-950 px-1.5 py-0.5 rounded font-mono font-bold text-white tracking-widest">{forgotDevOtp}</code></span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setForgotOtp(forgotDevOtp)}
                        className="text-[11px] font-bold text-amber-400 hover:text-amber-200 underline cursor-pointer"
                      >
                        Auto-fill
                      </button>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                        6-Digit Verification Code (OTP)
                      </label>
                      <span className="text-[11px] text-slate-400">
                        {forgotResendTimer > 0 ? (
                          `Resend in ${forgotResendTimer}s`
                        ) : (
                          <button
                            type="button"
                            onClick={handleForgotSendOtp}
                            disabled={forgotSending}
                            className="text-amber-400 hover:text-amber-300 underline font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <RefreshCw className="w-3 h-3" /> Resend Code
                          </button>
                        )}
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={forgotOtp}
                        onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="123456"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-lg font-mono tracking-widest text-center text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                      />
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Enter New Password
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Min. 6 chars"
                          className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          required
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          placeholder="Repeat new password"
                          className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      </div>
                    </div>
                  </div>

                  {/* Real-time match indicator */}
                  {newPassword && confirmNewPassword && (
                    <div className="text-xs font-semibold">
                      {newPassword === confirmNewPassword ? (
                        <span className="text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Passwords match
                        </span>
                      ) : (
                        <span className="text-amber-400 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5" /> Passwords do not match
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => { setAuthMode('signin'); setError(''); setSuccessMsg(''); }}
                      className="py-2.5 px-4 rounded-xl border border-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={forgotResetting || forgotOtp.length !== 6 || newPassword.length < 6 || newPassword !== confirmNewPassword}
                      className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {forgotResetting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">Updating Password...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-sm">Reset Password & Sign In</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="text-center mt-6">
          <p className="text-xs text-slate-400">
            Protected by Spring Security JWT & 4-Tier Institutional RBAC. Return to{' '}
            <Link to="/" className="text-blue-400 hover:text-blue-300 font-bold underline underline-offset-4">
              Home Landing Page
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
