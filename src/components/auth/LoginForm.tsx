import React, { useState } from 'react';
import { Mail, Lock, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { Logo } from '../common/Logo';
import { useAuth } from '../../context/AuthContext';

interface LoginFormProps {
  onNavigateSignup: () => void;
  onNavigateForgotPassword: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onNavigateSignup,
  onNavigateForgotPassword,
}) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('likhithakonda25@gmail.com');
  const [password, setPassword] = useState('LifeCare@2026');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please fill in both your email address and password.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Requirement 1: Logo centered above the login form, Medium/large size, Maintain original aspect ratio */}
        <div className="flex flex-col items-center text-center">
          <Logo size="lg" className="mb-2" />
          <h2 className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Sign In to LifeCare AI
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Secure personal health documents and medicine schedule manager
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-10 shadow-xl rounded-3xl border border-slate-200/80 dark:border-slate-800">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. likhithakonda25@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={onNavigateForgotPassword}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                />
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded-sm text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 dark:bg-slate-800 cursor-pointer"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
                >
                  Remember session
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/20 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Login Credentials Hint */}
          <div className="mt-5 p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 text-[11px] text-slate-600 dark:text-slate-300">
            <p className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              Demo Account Pre-configured:
            </p>
            <p>Email: <span className="font-mono text-slate-800 dark:text-white font-semibold">likhithakonda25@gmail.com</span></p>
            <p>Password: <span className="font-mono text-slate-800 dark:text-white font-semibold">LifeCare@2026</span></p>
          </div>

          {/* Switch to Signup */}
          <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            Don't have an account yet?{' '}
            <button
              onClick={onNavigateSignup}
              className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
