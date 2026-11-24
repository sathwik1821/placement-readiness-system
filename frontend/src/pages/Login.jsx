import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import { GraduationCap, AlertCircle, CheckCircle2 } from 'lucide-react';
import PortalSelector, { PORTAL_OPTIONS } from './auth/components/PortalSelector';
import RoleLoginView from './auth/components/RoleLoginView';
import RegisterStudentForm from './auth/components/RegisterStudentForm';
import ForgotPasswordForm from './auth/components/ForgotPasswordForm';

export default function Login() {
  const { role: rawRole } = useParams();
  const navigate = useNavigate();
  const { login } = useAuthStore();

  // Normalize role parameter (e.g. officer -> tpo, company -> recruiter)
  const role = (() => {
    if (!rawRole) return null;
    const lower = rawRole.toLowerCase();
    if (lower === 'officer') return 'tpo';
    if (lower === 'company') return 'recruiter';
    return lower;
  })();

  const portalConfig = PORTAL_OPTIONS.find((p) => p.roleId === role) || null;

  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'register' | 'forgot_password'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Student Registration States
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

  // Reset inputs when role changes
  useEffect(() => {
    setEmail('');
    setPassword('');
    setError('');
    setSuccessMsg('');
    setAuthMode('signin');
  }, [role]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => setResendTimer((t) => t - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [resendTimer]);

  useEffect(() => {
    if (forgotResendTimer > 0) {
      const timer = setInterval(() => setForgotResendTimer((t) => t - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [forgotResendTimer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const roleMap = {
        student: 'STUDENT',
        tpo: 'PLACEMENT_OFFICER',
        recruiter: 'COMPANY',
        admin: 'ADMIN'
      };

      const payload = {
        email: email.trim().toLowerCase(),
        password,
        expectedRole: portalConfig ? roleMap[portalConfig.roleId] : undefined
      };

      const res = await api.post('/auth/login', payload);
      login(res.data.token, res.data.role);

      const userRole = res.data.role;
      if (userRole === 'ADMIN') navigate('/admin');
      else if (userRole === 'PLACEMENT_OFFICER') navigate('/officer');
      else if (userRole === 'COMPANY') navigate('/company');
      else navigate('/student');
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Authentication failed. Please verify your credentials.'
      );
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
      setSuccessMsg('A 6-digit verification code has been dispatched.');
      if (res.data?.devOtp) {
        setDevOtpNotice(res.data.devOtp);
        setOtp(res.data.devOtp);
      }
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
      setError(err.response?.data?.error || 'Student registration failed');
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
      const res = await api.post('/auth/forgot-password/send-otp', {
        email: forgotEmail.trim().toLowerCase()
      });
      setForgotStep('OTP');
      setForgotResendTimer(60);
      setSuccessMsg('Verification OTP dispatched to your registered email.');
      if (res.data?.devOtp) {
        setForgotDevOtp(res.data.devOtp);
        setForgotOtp(res.data.devOtp);
      }
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
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/15 via-slate-950 to-slate-950 pointer-events-none" />

      {/* Top Ascend Branding */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 mb-2">
        <div className="flex justify-center">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">Ascend</span>
          </Link>
        </div>
      </div>

      <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-lg relative z-10 px-4 sm:px-0">
        <div className="bg-slate-900/90 border border-slate-800/90 backdrop-blur-xl py-7 px-6 sm:px-8 shadow-2xl rounded-3xl">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2.5 text-xs text-red-300 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-2.5 text-xs text-emerald-300 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* View 1: 4-Option Portal Selector when visiting /login without role parameter */}
          {!portalConfig && authMode === 'signin' && (
            <PortalSelector />
          )}

          {/* View 2: Dedicated Role Login when visiting /login/:role */}
          {portalConfig && authMode === 'signin' && (
            <RoleLoginView
              portalConfig={portalConfig}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              loading={loading}
              error={error}
              setError={setError}
              onSubmit={handleSubmit}
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

          {/* View 3: Student Registration */}
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
              otp={otp}
              setOtp={setOtp}
              sendingOtp={sendingOtp}
              resendTimer={resendTimer}
              devOtpNotice={devOtpNotice}
              loading={loading}
              handleSendOtp={handleSendOtp}
              handleRegister={handleRegister}
              onSwitchToSignIn={() => {
                setAuthMode('signin');
                setError('');
                setSuccessMsg('');
              }}
            />
          )}

          {/* View 4: Forgot Password */}
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
              forgotSending={forgotSending}
              forgotResetting={forgotResetting}
              forgotDevOtp={forgotDevOtp}
              forgotResendTimer={forgotResendTimer}
              handleForgotSendOtp={handleForgotSendOtp}
              handleForgotResetPassword={handleForgotResetPassword}
              onSwitchToSignIn={() => {
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
