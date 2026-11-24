import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, KeyRound, Loader2, RefreshCw, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordForm({
  forgotEmail,
  setForgotEmail,
  forgotOtp,
  setForgotOtp,
  newPassword,
  setNewPassword,
  confirmNewPassword,
  setConfirmNewPassword,
  forgotStep,
  setForgotStep,
  forgotSending,
  forgotResetting,
  forgotDevOtp,
  forgotResendTimer,
  handleForgotSendOtp,
  handleForgotResetPassword,
  onBackToSignIn
}) {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  return (
    <div>
      {forgotStep === 'EMAIL' ? (
        <form onSubmit={handleForgotSendOtp} className="space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            Enter your registered RGUKT institutional email address. We will dispatch a 6-digit one-time password code to verify ownership.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Registered Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="e.g. s210018@rguktsklm.ac.in"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={forgotSending}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition-all"
          >
            {forgotSending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending Reset OTP...</span>
              </>
            ) : (
              <>
                <span>Send Reset Verification Code</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleForgotResetPassword} className="space-y-4">
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-center">
            <p className="text-xs text-blue-300 font-medium">Reset verification code sent to:</p>
            <p className="text-xs font-bold text-white mt-0.5">{forgotEmail}</p>
          </div>

          {forgotDevOtp && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center">
              <p className="text-xs text-emerald-300 font-medium">
                ✓ Password reset code sent to your email inbox.
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Check your inbox and spam folder. Valid for 10 minutes.</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 text-center">
              Enter 6-Digit Reset Code
            </label>
            <div className="relative max-w-[200px] mx-auto">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                maxLength={6}
                value={forgotOtp}
                onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                required
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-blue-500/50 rounded-xl text-white text-center font-mono text-lg tracking-widest focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                className="w-full pl-10 pr-10 py-2 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                aria-label={showNewPassword ? 'Hide password' : 'View password'}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1 cursor-pointer focus:outline-none"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showConfirmNewPassword ? 'text' : 'password'}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Repeat new password"
                required
                className="w-full pl-10 pr-10 py-2 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                aria-label={showConfirmNewPassword ? 'Hide password' : 'View password'}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1 cursor-pointer focus:outline-none"
              >
                {showConfirmNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={forgotResetting || forgotOtp.length !== 6}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition-all disabled:opacity-50"
          >
            {forgotResetting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Resetting Password...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Save New Password & Sign In</span>
              </>
            )}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              disabled={forgotResendTimer > 0 || forgotSending}
              onClick={handleForgotSendOtp}
              className="text-xs text-slate-400 hover:text-white disabled:opacity-50 inline-flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              {forgotResendTimer > 0 ? `Resend Code in ${forgotResendTimer}s` : 'Resend Code'}
            </button>
          </div>
        </form>
      )}

      <div className="text-center pt-4 border-t border-slate-800 mt-4">
        <button
          type="button"
          onClick={onBackToSignIn}
          className="text-xs text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </button>
      </div>
    </div>
  );
}
