import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import { GraduationCap, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import SignInForm from './auth/components/SignInForm';
import RegisterStudentForm from './auth/components/RegisterStudentForm';
import ForgotPasswordForm from './auth/components/ForgotPasswordForm';

export default function Login() {
  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'register' | 'forgot_password'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [regStep, setRegStep] = useState('EMAIL');
  const [otp, setOtp] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [devOtpNotice, setDevOtpNotice] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // Forgot Password States
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState('EMAIL');
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

  React.useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => setResendTimer((t) => t - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [resendTimer]);

  React.useEffect(() => {
    if (forgotResendTimer > 0) {
      const timer = setInterval(() => setForgotResendTimer((t) => t - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [forgotResendTimer]);

  const handleQuickFill = (role) => {
    setActiveQuickRole(role);
    setError('');
    setSuccessMsg('');
    if (role === 'STUDENT') {
      setEmail('s210018@rguktsklm.ac.in');
      setPassword('Student@123');
    } else if (role === 'OFFICER') {
      setEmail('officer@college.edu');
      setPassword('Officer@123');
    } else if (role === 'COMPANY') {
      setEmail('hr@techcorp.com');
      setPassword('Company@123');
    } else if (role === 'ADMIN') {
      setEmail('admin@system.com');
      setPassword('Admin@123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await api.post('/auth/login', { email: email.trim(), password });
      login(res.data.token, res.data.role);
      const role = res.data.role;
      if (role === 'ADMIN') navigate('/admin');
      else if (role === 'PLACEMENT_OFFICER') navigate('/officer');
      else if (role === 'COMPANY') navigate('/company');
      else navigate('/student');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Invalid institutional credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setSendingOtp(true);
    try {
      const res = await api.post('/auth/send-otp', { email: email.trim().toLowerCase() });
      setRegStep('OTP');
      setResendTimer(60);
      setSuccessMsg('A 6-digit verification code has been dispatched to your email.');
      if (res.data?.devOtp) setDevOtpNotice(res.data.devOtp);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to dispatch verification code');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await api.post('/auth/register', {
        name,
        email: email.trim().toLowerCase(),
        password,
        confirmPassword,
        department,
        role: 'STUDENT',
        otp
      });
      login(res.data.token, res.data.role);
      navigate('/student');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setForgotSending(true);
    try {
      const res = await api.post('/auth/forgot-password/send-otp', { email: forgotEmail.trim().toLowerCase() });
      setForgotStep('OTP');
      setForgotResendTimer(60);
      setSuccessMsg('Verification OTP dispatched to your registered email.');
      if (res.data?.devOtp) setForgotDevOtp(res.data.devOtp);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reset code');
    } finally {
      setForgotSending(false);
    }
  };

  const handleForgotResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match');
      return;
    }
    setForgotResetting(true);
    try {
      await api.post('/auth/forgot-password/reset', {
        email: forgotEmail.trim().toLowerCase(),
        otp: forgotOtp.trim(),
        newPassword,
        confirmPassword: confirmNewPassword
      });
      setSuccessMsg('Password reset successful! Please sign in with your new password.');
      setAuthMode('signin');
      setEmail(forgotEmail);
      setPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Password reset failed');
    } finally {
      setForgotResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950 pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">Ascend</span>
          </Link>
        </div>
        <h2 className="mt-4 text-center text-xl font-bold tracking-tight text-white">
          {authMode === 'signin' && 'RGUKT Institutional Portal Sign In'}
          {authMode === 'register' && 'Create RGUKT Student Account'}
          {authMode === 'forgot_password' && 'Reset Institutional Password'}
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400">
          Campus Recruitment & AI Placement Readiness Ecosystem
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-slate-900/90 border border-slate-800/80 backdrop-blur-xl py-6 px-6 sm:px-8 shadow-2xl rounded-2xl">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2.5 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-2.5 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {authMode === 'signin' && (
            <SignInForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              loading={loading}
              activeQuickRole={activeQuickRole}
              handleSubmit={handleSubmit}
              handleQuickFill={handleQuickFill}
              onSwitchToRegister={() => {
                setAuthMode('register');
                setError('');
                setSuccessMsg('');
              }}
              onSwitchToForgotPassword={() => {
                setAuthMode('forgot_password');
                setForgotStep('EMAIL');
                setError('');
                setSuccessMsg('');
              }}
            />
          )}

          {authMode === 'register' && (
            <RegisterStudentForm
              name={name}
              setName={setName}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              department={department}
              setDepartment={setDepartment}
              regStep={regStep}
              setRegStep={setRegStep}
              otp={otp}
              setOtp={setOtp}
              sendingOtp={sendingOtp}
              loading={loading}
              devOtpNotice={devOtpNotice}
              resendTimer={resendTimer}
              handleSendOtp={handleSendOtp}
              handleRegister={handleRegister}
              onSwitchToSignIn={() => {
                setAuthMode('signin');
                setError('');
                setSuccessMsg('');
              }}
            />
          )}

          {authMode === 'forgot_password' && (
            <ForgotPasswordForm
              forgotEmail={forgotEmail}
              setForgotEmail={setForgotEmail}
              forgotOtp={forgotOtp}
              setForgotOtp={setForgotOtp}
              newPassword={newPassword}
              setNewPassword={setNewPassword}
              confirmNewPassword={confirmNewPassword}
              setConfirmNewPassword={setConfirmNewPassword}
              forgotStep={forgotStep}
              setForgotStep={setForgotStep}
              forgotSending={forgotSending}
              forgotResetting={forgotResetting}
              forgotDevOtp={forgotDevOtp}
              forgotResendTimer={forgotResendTimer}
              handleForgotSendOtp={handleForgotSendOtp}
              handleForgotResetPassword={handleForgotResetPassword}
              onBackToSignIn={() => {
                setAuthMode('signin');
                setError('');
                setSuccessMsg('');
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
