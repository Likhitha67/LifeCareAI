import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Menu,
  Moon,
  Sun,
  Search,
  CheckCheck,
  Trash2,
  Calendar,
  Pill,
  ClockAlert,
  Plus,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import { Logo } from './Logo';
import { NavigationTab } from './Sidebar';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onNavigate: (tab: NavigationTab) => void;
  onOpenUpload: () => void;
  onOpenAddMed: () => void;
  onOpenAssistant: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  onNavigate,
  onOpenUpload,
  onOpenAddMed,
  onOpenAssistant,
  searchQuery,
  onSearchChange,
}) => {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const { theme, toggleTheme } = useTheme();

  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const quickRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifDropdown(false);
      }
      if (quickRef.current && !quickRef.current.contains(e.target as Node)) {
        setShowQuickActions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Time of day greeting
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good morning';
    if (hours < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.fullName?.split(' ')[0] || 'there';

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Left Side: Mobile toggle + Header Small Logo & Greeting */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenMobileMenu}
            aria-label="Open sidebar menu"
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Small official logo in header as required in Section 5 */}
          <div className="hidden sm:flex items-center gap-3">
            <Logo size="sm" className="h-9 w-auto" />
            <div className="h-7 w-px bg-slate-200 dark:bg-slate-700 mx-1" />
          </div>

          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
              {getGreeting()}, <span className="text-blue-600 dark:text-blue-400">{firstName}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate hidden sm:block">
              Here's your LifeCare overview.
            </p>
          </div>
        </div>

        {/* Center: Quick Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search documents, medicines, or extracted text..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Quick Actions Dropdown Button */}
          <div className="relative" ref={quickRef}>
            <button
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Quick Action</span>
            </button>

            {showQuickActions && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95">
                <button
                  onClick={() => {
                    setShowQuickActions(false);
                    onOpenUpload();
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2.5"
                >
                  <span className="p-1 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-600">📄</span>
                  Upload Document
                </button>
                <button
                  onClick={() => {
                    setShowQuickActions(false);
                    onOpenAddMed();
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2.5"
                >
                  <span className="p-1 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600">💊</span>
                  Add Medicine
                </button>
                <button
                  onClick={() => {
                    setShowQuickActions(false);
                    onNavigate('scanner');
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2.5"
                >
                  <span className="p-1 rounded-md bg-purple-100 dark:bg-purple-900/60 text-purple-600">📷</span>
                  Scan Medicine Strip
                </button>
                <button
                  onClick={() => {
                    setShowQuickActions(false);
                    onNavigate('ocr');
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2.5"
                >
                  <span className="p-1 rounded-md bg-amber-100 dark:bg-amber-900/60 text-amber-600">📝</span>
                  Open OCR Reader
                </button>
                <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                <button
                  onClick={() => {
                    setShowQuickActions(false);
                    onOpenAssistant();
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center gap-2.5 font-semibold"
                >
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  Ask LifeCare AI
                </button>
              </div>
            )}
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Notification Bell Dropdown (Section 14) */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              aria-label="View notifications"
              className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-xs animate-bounce">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-3 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span className="bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markAllAsRead()}
                        className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        Mark all read
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button
                        onClick={() => clearAll()}
                        className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                        title="Clear all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto px-2 py-2 space-y-1 scrollbar-thin">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                      <p className="font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        You're all caught up.
                      </p>
                      <p>No new notifications at this time.</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          if (!n.read) markAsRead(n.id);
                          if (n.type === 'expiry') onNavigate('expiry');
                          if (n.type === 'medicine') onNavigate('medicines');
                          setShowNotifDropdown(false);
                        }}
                        className={`p-3 rounded-xl transition-all cursor-pointer flex items-start gap-3 ${
                          n.read
                            ? 'bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-500'
                            : 'bg-blue-50/70 dark:bg-blue-950/40 hover:bg-blue-100/70 border border-blue-100 dark:border-blue-900/50 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div className="mt-0.5 p-1.5 rounded-lg flex-shrink-0">
                          {n.type === 'expiry' ? (
                            <ClockAlert className="w-4 h-4 text-amber-500" />
                          ) : n.type === 'medicine' ? (
                            <Pill className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Calendar className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold leading-snug">{n.title}</p>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">
                            {n.message}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {new Date(n.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Avatar Mini Profile */}
          <button
            onClick={() => onNavigate('profile')}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-linear-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {user?.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
