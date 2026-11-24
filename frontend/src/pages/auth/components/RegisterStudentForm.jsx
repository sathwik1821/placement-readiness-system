import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User, KeyRound, Loader2, RefreshCw, ArrowLeft, ArrowRight, School } from 'lucide-react';

export default function RegisterStudentForm({
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  department,
  setDepartment,
  regStep,
  setRegStep,
  otp,
  setOtp,
  sendingOtp,
  loading,
  devOtpNotice,
  resendTimer,
  handleSendOtp,
  handleRegister,
  onSwitchToSignIn
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  return (
    <div>
      {regStep === 'EMAIL' ? (
        <form onSubmit={handleSendOtp} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Full Legal Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sathwik Katam"
                required
                className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              RGUKT Institutional Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="s21XXXX@rguktsklm.ac.in"
                required
                className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Engineering Department
            </label>
            <div className="relative">
              <School className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="Computer Science & Engineering">Computer Science & Engineering (CSE)</option>
                <option value="Electronics & Communication Engineering">Electronics & Communication (ECE)</option>
                <option value="Mechanical Engineering">Mechanical Engineering (ME)</option>
                <option value="Civil Engineering">Civil Engineering (CE)</option>
                <option value="Chemical Engineering">Chemical Engineering (CHE)</option>
                <option value="Metallurgical & Materials Engineering">Metallurgical & Materials (MME)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 chars"
                  required
                  className="w-full pl-3 pr-8 py-2 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'View password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-0.5 cursor-pointer focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Confirm
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Match password"
                  required
                  className="w-full pl-3 pr-8 py-2 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'View password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-0.5 cursor-pointer focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={sendingOtp}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition-all mt-3"
          >
            {sendingOtp ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending 6-Digit OTP...</span>
              </>
            ) : (
              <>
                <span>Verify Email & Send OTP</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-center">
            <p className="text-xs text-blue-300 font-medium">
              A 6-digit verification code has been dispatched to:
            </p>
            <p className="text-xs font-bold text-white mt-0.5">{email}</p>
          </div>

          {devOtpNotice && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center">
              <p className="text-xs text-emerald-300 font-medium">
                ✓ Verification code sent to your email inbox.
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Check your inbox and spam folder. Valid for 10 minutes.</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 text-center">
              Enter 6-Digit One-Time Verification Code
            </label>
            <div className="relative max-w-[220px] mx-auto">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-blue-500/50 rounded-xl text-white text-center font-mono text-lg tracking-widest focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setRegStep('EMAIL')}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
            >
              Change Details
            </button>
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Complete Registration</span>}
            </button>
          </div>

          <div className="text-center pt-2">
            <button
              type="button"
              disabled={resendTimer > 0 || sendingOtp}
              onClick={handleSendOtp}
              className="text-xs text-slate-400 hover:text-white disabled:opacity-50 inline-flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend Code'}
            </button>
          </div>
        </form>
      )}

      <div className="text-center pt-4 border-t border-slate-800 mt-4">
        <p className="text-xs text-slate-400">
          Already registered?{' '}
          <button
            type="button"
            onClick={onSwitchToSignIn}
            className="text-blue-400 hover:text-blue-300 font-semibold"
          >
            Back to Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
