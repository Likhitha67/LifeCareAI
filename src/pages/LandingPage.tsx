import React from 'react';
import {
  FolderLock,
  ScanText,
  ClockAlert,
  Pill,
  Camera,
  ShieldCheck,
  Lock,
  ArrowRight,
  HeartPulse,
} from 'lucide-react';
import { Logo } from '../components/common/Logo';
import { Footer } from '../components/common/Footer';

interface LandingPageProps {
  onNavigateLogin: () => void;
  onNavigateSignup: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateLogin,
  onNavigateSignup,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Navigation */}
      <header className="border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <div className="hidden sm:block">
              <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                LifeCare AI
              </span>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Personal Health &amp; Document Assistant
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateLogin}
              className="px-4 py-2 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={onNavigateSignup}
              className="px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs hover:shadow transition-all flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center flex-1 flex flex-col justify-center">
        {/* Official Logo Centered in Hero */}
        <div className="flex justify-center mb-6">
          <Logo size="xl" />
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-bold mx-auto mb-6">
          <HeartPulse className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
          <span>Next-Generation Health &amp; Document Intelligence</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight">
          Your Private Health Vault &amp; Medicine Assistant
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Securely store identity documents, track passport and insurance expiry dates, run on-device optical character recognition (OCR), and scan medicine strips for daily dosage reminders.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onNavigateSignup}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <span>Create Your Vault Free</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onNavigateLogin}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-sm border border-slate-200 dark:border-slate-800 shadow-xs transition-all"
          >
            Sign In with Demo Account
          </button>
        </div>

        {/* Security Trust Indicators */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-emerald-500" /> Isolated User Records
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-500" /> Client-Side OCR Engine
          </span>
          <span className="flex items-center gap-1.5">
            <ClockAlert className="w-4 h-4 text-amber-500" /> Automatic Expiry Reminders
          </span>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Built for Modern Health &amp; Identity Management
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Everything you need to organize your medical history and vital family records in one intuitive interface.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 rounded-xl w-fit mb-4">
                <FolderLock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
                Smart Document Vault
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Store Aadhaar cards, PAN cards, passports, insurance policies, and clinical reports with encrypted browser storage.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 rounded-xl w-fit mb-4">
                <ScanText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
                OCR Text Extractor
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Run high-precision optical character recognition on document images with image filters and instant keyword search.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-300 rounded-xl w-fit mb-4">
                <ClockAlert className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
                Document Expiry Alerts
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Receive proactive alerts 30 days before passport, license, or insurance renewal deadlines to prevent lapses.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300 rounded-xl w-fit mb-4">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
                Medicine Strip Scanner
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Snap photos of medicine foil packaging to transcribe dosage and establish custom reminder times effortlessly.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
