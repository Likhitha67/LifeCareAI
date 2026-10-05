import React, { useState } from 'react';
import {
  Settings,
  Bell,
  Eye,
  Shield,
  Moon,
  Sun,
  Lock,
  Volume2,
  Trash2,
  FileCheck2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getUserSettings, saveUserSettings } from '../services/dbService';
import { UserSettings } from '../types';

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [settings, setSettings] = useState<UserSettings>(() => {
    return user ? getUserSettings(user.id) : {
      medicineReminders: true,
      expiryNotifications: true,
      emailAlerts: true,
      darkMode: false,
      soundAlerts: true,
      ocrAutoEnhance: true,
    };
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleToggle = (key: keyof UserSettings) => {
    if (!user) return;
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    saveUserSettings(user.id, updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <Settings className="w-5 h-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Settings &amp; Preferences
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Customize notifications, privacy controls, appearance theme, and personal application preferences.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs font-semibold text-emerald-800 dark:text-emerald-200 animate-fade-in">
          Preferences saved successfully!
        </div>
      )}

      {/* 1. Notifications Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
          <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Notification Preferences
            </h3>
            <p className="text-xs text-slate-400">
              Control which alerts are triggered inside your application header.
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {/* Medicine Reminders Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                Medicine Reminders
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Receive scheduled dosage alerts based on your active prescriptions.
              </p>
            </div>
            <button
              onClick={() => handleToggle('medicineReminders')}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                settings.medicineReminders ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  settings.medicineReminders ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Expiry Notifications Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                Document Expiry Notifications
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Send 30-day proactive warnings before passport, license, or insurance lapse.
              </p>
            </div>
            <button
              onClick={() => handleToggle('expiryNotifications')}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                settings.expiryNotifications ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  settings.expiryNotifications ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Sound Alerts Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                Audio Chimes for Dose Completion
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Play subtle celebratory chimes when marking medicines as taken.
              </p>
            </div>
            <button
              onClick={() => handleToggle('soundAlerts')}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                settings.soundAlerts ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  settings.soundAlerts ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Appearance Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
          <Eye className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Appearance &amp; Theme
            </h3>
            <p className="text-xs text-slate-400">
              Select between light and dark display modes.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div
            onClick={() => theme === 'dark' && toggleTheme()}
            className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
              theme === 'light'
                ? 'border-blue-600 bg-blue-50/50'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <Sun className="w-5 h-5 text-amber-500" />
              <div>
                <p className="text-xs font-bold text-slate-900">Light Mode</p>
                <p className="text-[11px] text-slate-500">Clean healthcare white</p>
              </div>
            </div>
            {theme === 'light' && (
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            )}
          </div>

          <div
            onClick={() => theme === 'light' && toggleTheme()}
            className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
              theme === 'dark'
                ? 'border-blue-500 bg-blue-950/40'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-indigo-400" />
              <div>
                <p className="text-xs font-bold text-slate-100">Dark Mode</p>
                <p className="text-[11px] text-slate-400">High contrast navy</p>
              </div>
            </div>
            {theme === 'dark' && (
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
            )}
          </div>
        </div>
      </div>

      {/* 3. Mandatory Privacy Notice (Section 23) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
          <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Privacy Notice &amp; Medical Disclaimer
            </h3>
            <p className="text-xs text-slate-400">
              Our transparent commitment to data isolation and clinical safety.
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-600 dark:text-slate-300 space-y-3 leading-relaxed">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2">
            <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-500" />
              Strict Data Isolation:
            </p>
            <p>
              Documents and health records are completely private to your authenticated user account. Records belonging to you can never be accessed or viewed by any other user.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 space-y-1.5">
            <p className="font-bold flex items-center gap-1.5">
              ⚠️ Medical Disclaimer:
            </p>
            <p>
              LifeCare AI is an electronic personal organization and document management assistant. It does <strong>not</strong> provide medical diagnoses, prescribe prescription medications, alter dosages, or substitute for the professional judgment of qualified healthcare physicians, pharmacists, or licensed clinics.
            </p>
            <p className="pt-1">
              For acute symptoms or emergencies, always seek immediate medical evaluation from qualified healthcare professionals.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
