import React from 'react';
import {
  LayoutDashboard,
  FolderLock,
  ScanText,
  ClockAlert,
  Pill,
  Camera,
  User,
  Settings,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '../../context/AuthContext';

export type NavigationTab =
  | 'dashboard'
  | 'documents'
  | 'ocr'
  | 'expiry'
  | 'medicines'
  | 'scanner'
  | 'profile'
  | 'settings';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenAssistant: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  onOpenAssistant,
}) => {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'documents', label: 'Smart Document Vault', icon: FolderLock },
    { id: 'ocr', label: 'OCR Reader', icon: ScanText },
    { id: 'expiry', label: 'Document Expiry Reminder', icon: ClockAlert },
    { id: 'medicines', label: 'Medicine Reminder', icon: Pill },
    { id: 'scanner', label: 'Medicine Strip Scanner', icon: Camera },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  const handleTabClick = (tab: NavigationTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-white dark:bg-slate-900 border-r border-slate-200/90 dark:border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Top Header with official logo as required in section 4 & 17 */}
        <div className="pt-6 pb-5 px-6 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex flex-col items-center text-center">
            {/* Logo at the top of the sidebar */}
            <Logo size="md" className="cursor-pointer" onClick={() => handleTabClick('dashboard')} />
            {/* Below it display: "LifeCare AI" and "Personal Health & Document Assistant" */}
            <div className="mt-3 text-center">
              <h1 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                LifeCare AI
              </h1>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                Personal Health &amp; Document Assistant
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1.5 scrollbar-thin">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon
                  className={`w-5 h-5 flex-shrink-0 transition-colors ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-slate-400 dark:text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span className="truncate text-left">{item.label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-5 rounded-full bg-blue-600 dark:bg-blue-400" />
                )}
              </button>
            );
          })}

          {/* AI Assistant Quick Launcher */}
          <div className="pt-3">
            <button
              onClick={onOpenAssistant}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50/80 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 border border-indigo-200/60 dark:border-indigo-800/60 transition-all duration-150 group"
            >
              <div className="p-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-left flex-1">
                <span className="block font-bold">LifeCare AI Assistant</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                  Explain terms &amp; docs
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Bottom Profile & Logout */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-sm border border-blue-200 dark:border-blue-700">
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                {user?.fullName || 'User'}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {user?.email || ''}
              </p>
            </div>
          </div>

          <button
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-transparent hover:border-rose-200 dark:hover:border-rose-900 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};
