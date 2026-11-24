'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import CollegeLogo from '@/components/common/CollegeLogo';
import { Mail, Lock, Eye, EyeOff, Loader2, CheckCircle2, X, LogIn, QrCode, Sparkles, UploadCloud } from 'lucide-react';
import { sendResetPassword } from '@/services/authService';
import { UserRole } from '@/types';

export const LoginScreen: React.FC = () => {
  const { login, loginWithGoogleAuth, authLoading, authError } = useApp();
  const [portalRole, setPortalRole] = useState<UserRole>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // QR Login State
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrTokenInput, setQrTokenInput] = useState('');
  const [qrLoginLoading, setQrLoginLoading] = useState(false);
  const [qrLocalError, setQrLocalError] = useState<string | null>(null);

  // Forgot password state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    await login(email.trim(), password, portalRole);
  };

  const handleGoogleSignIn = async () => {
    await loginWithGoogleAuth(portalRole);
  };

  const handleQrLogin = async (tokenOrUrl: string) => {
    setQrLocalError(null);
    let token = tokenOrUrl.trim();
    if (!token) return;
    setQrLoginLoading(true);
    try {
      if (token.includes('auth_qr=')) {
        token = token.split('auth_qr=')[1].split('&')[0];
      }
      const decodedJson = atob(decodeURIComponent(token));
      const payload = JSON.parse(decodedJson);
      if (payload && payload.email && payload.pass) {
        await login(payload.email, payload.pass, payload.role || 'student');
        setShowQrModal(false);
      } else {
        setQrLocalError('Invalid QR Pass structure: Missing credentials.');
      }
    } catch (e: any) {
      setQrLocalError('Could not decode QR Pass. Please check the token or scan with phone camera.');
    } finally {
      setQrLoginLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setResetLoading(true);
    await sendResetPassword(forgotEmail);
    setResetLoading(false);
    setResetSent(true);
    setTimeout(() => {
      setResetSent(false);
      setShowForgotModal(false);
      setForgotEmail('');
    }, 2000);
  };

  return (
    <div className="w-full min-h-full flex flex-col justify-between bg-white p-6 font-sans">
      {/* College Logo & Header */}
      <div className="flex flex-col items-center pt-4">
        <CollegeLogo size={68} />
        <h2 className="mt-3 text-lg font-bold text-slate-900">Smart Campus</h2>
        <p className="text-xs text-slate-500">Sign in with your institutional credentials</p>
      </div>

      {/* Auth Error Banner */}
      {authError && (
        <div className="my-2 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
          <span>{authError}</span>
        </div>
      )}

      {/* Select Portal: Student vs Teacher vs Admin */}
      <div className="my-2 bg-slate-100 p-1 rounded-2xl flex items-center justify-between text-xs font-bold border border-slate-200">
        <button
          type="button"
          onClick={() => setPortalRole('student')}
          className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center space-x-1 ${
            portalRole === 'student'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>🎓 Student</span>
        </button>

        <button
          type="button"
          onClick={() => setPortalRole('faculty')}
          className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center space-x-1 ${
            portalRole === 'faculty'
              ? 'bg-blue-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>👨‍🏫 Teacher</span>
        </button>

        <button
          type="button"
          onClick={() => setPortalRole('admin')}
          className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center space-x-1 ${
            portalRole === 'admin'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>💻 Admin</span>
        </button>
      </div>

      {/* Form Fields */}
      <form onSubmit={handleLogin} className="space-y-3.5 my-3">
        {/* Email Field */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Mail className="w-4 h-4" />
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Institutional / Registered Email"
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-800 focus:bg-white transition-colors"
            required
          />
        </div>

        {/* Password Field */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Lock className="w-4 h-4" />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-800 focus:bg-white transition-colors"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <div className="text-right">
          <button
            type="button"
            onClick={() => setShowForgotModal(true)}
            className="text-[11px] font-semibold text-blue-800 hover:underline"
          >
            Forgot Password?
          </button>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={authLoading}
          className="w-full py-3.5 bg-blue-900 hover:bg-blue-950 text-white rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-75 flex items-center justify-center space-x-2"
        >
          {authLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying &amp; Signing In...</span>
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>Sign In to Smart Campus</span>
            </>
          )}
        </button>

        {/* 1-Tap Admission QR Pass Quick Login Button */}
        <button
          type="button"
          onClick={() => setShowQrModal(true)}
          className="w-full py-3 bg-gradient-to-r from-slate-100 to-blue-50/70 hover:from-blue-50 hover:to-indigo-50 text-blue-900 rounded-xl font-bold text-xs border border-blue-200/80 shadow-xs flex items-center justify-center space-x-2 transition-all active:scale-95"
        >
          <QrCode className="w-4 h-4 text-blue-700" />
          <span>📷 Digital QR Pass द्वारे लॉगिन करा</span>
        </button>
      </form>

      {/* Social / Google Login */}
      <div className="pt-2 text-center">
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-200" />
          <span className="flex-shrink mx-2 text-[10px] text-slate-400 font-medium uppercase tracking-wider">
            Or Login with
          </span>
          <div className="flex-grow border-t border-slate-200" />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={authLoading}
          className="w-12 h-12 mx-auto rounded-full border border-slate-200 shadow-sm flex items-center justify-center hover:bg-slate-50 transition-all active:scale-95"
          title="Sign in with Google"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        </button>

        <div className="mt-3 flex items-center justify-center space-x-1.5 text-[11px] text-slate-500">
          <span>Don&apos;t have an account?</span>
          <span className="text-blue-900 font-semibold cursor-pointer hover:underline">
            Contact Admin Desk
          </span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h4 className="font-bold text-sm text-slate-900">Reset Password</h4>
              <button
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {resetSent ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="text-xs font-bold text-slate-800">Password reset link sent!</p>
                <p className="text-[11px] text-slate-500">Please check your inbox.</p>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="mt-4 space-y-3">
                <p className="text-[11px] text-slate-500">
                  Enter your registered college email address to receive reset instructions.
                </p>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@modernclg.edu.in"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-700 focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-blue-900 hover:bg-blue-950 flex items-center justify-center space-x-1"
                >
                  {resetLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Send Reset Link</span>}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* QR Pass Instant Login Modal */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">QR Pass Login</h4>
                  <p className="text-[10px] text-slate-500">Scan or paste Admission Pass</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowQrModal(false);
                  setQrLocalError(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3 bg-blue-50/70 border border-blue-200/60 rounded-2xl text-[11px] text-blue-900 space-y-1">
                <p className="font-bold flex items-center space-x-1">
                  <span>💡 How it works:</span>
                </p>
                <p className="text-slate-600 leading-relaxed">
                  You can scan the QR code received in your admission email directly using your phone&apos;s camera app, or paste the link / token below.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Paste QR Token / 1-Tap Login Link:
                </label>
                <textarea
                  rows={3}
                  value={qrTokenInput}
                  onChange={(e) => setQrTokenInput(e.target.value)}
                  placeholder="Paste login link (e.g. http://localhost:3000/?auth_qr=...) or token"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-mono focus:ring-2 focus:ring-blue-700 focus:outline-none resize-none"
                />
              </div>

              {qrLocalError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-[11px] font-medium">
                  {qrLocalError}
                </div>
              )}

              <button
                type="button"
                disabled={qrLoginLoading || !qrTokenInput.trim()}
                onClick={() => handleQrLogin(qrTokenInput)}
                className="w-full py-2.5 rounded-xl font-bold text-white bg-blue-900 hover:bg-blue-950 flex items-center justify-center space-x-1.5 shadow-sm active:scale-95 disabled:opacity-50"
              >
                {qrLoginLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying QR Pass...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Login via QR Token</span>
                  </>
                )}
              </button>

              <div className="pt-2 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={() => setShowQrModal(false)}
                  className="text-[11px] text-slate-500 hover:text-slate-700 font-semibold"
                >
                  Back to standard password login
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
