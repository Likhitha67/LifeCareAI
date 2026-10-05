import React, { useState } from 'react';
import { Mail, CheckCircle2, AlertCircle, ArrowLeft, KeyRound } from 'lucide-react';
import { Logo } from '../common/Logo';
import { requestPasswordReset, resetPasswordWithToken } from '../../services/authService';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateLogin: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onNavigateLogin,
}) => {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<'request' | 'reset' | 'success'>('request');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please provide your registered email address.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const generatedToken = await requestPasswordReset(email);
      setToken(generatedToken);
      setStep('reset');
    } catch (err: any) {
      setError(err?.message || 'Failed to request reset. Please verify your email.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setError('New password must contain at least 6 characters.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await resetPasswordWithToken(token, newPassword);
      setStep('success');
    } catch (err: any) {
      setError(err?.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
        {/* Requirement 3: Small/medium logo above the form */}
        <div className="flex flex-col items-center text-center mb-6">
          <Logo size="md" className="mb-2" />
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
            {step === 'request'
              ? 'Reset Your Password'
              : step === 'reset'
              ? 'Create New Password'
              : 'Password Updated'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {step === 'request'
              ? 'Enter your account email to receive security verification'
              : step === 'reset'
              ? 'Set your new secure password below'
              : 'Your password has been successfully updated.'}
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {step === 'request' && (
          <form onSubmit={handleRequest} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Account Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="e.g. likhithakonda25@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-all disabled:opacity-50"
            >
              {loading ? 'Verifying email...' : 'Send Verification Code'}
            </button>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs">
              <p className="font-semibold">Reset verification confirmed for:</p>
              <p className="font-mono text-[11px] truncate">{email}</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                New Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-all disabled:opacity-50"
            >
              {loading ? 'Updating password...' : 'Update & Save Password'}
            </button>
          </form>
        )}

        {step === 'success' && (
          <div className="text-center py-4 space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Your password has been reset successfully. You can now log in.
            </p>
            <button
              onClick={() => {
                onClose();
                onNavigateLogin();
              }}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all"
            >
              Return to Sign In
            </button>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Cancel and Back
          </button>
        </div>
      </div>
    </div>
  );
};
