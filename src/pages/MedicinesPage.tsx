import React, { useState, useMemo } from 'react';
import {
  Pill,
  Plus,
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { MedicineItem } from '../types';
import { MedicineCard } from '../components/medicines/MedicineCard';
import { isMedicineDueToday } from '../services/dbService';

interface MedicinesPageProps {
  medicines: MedicineItem[];
  onOpenAddMed: () => void;
  onEditMed: (med: MedicineItem) => void;
  onDeleteMed: (id: string) => void;
  onToggleStatus: (id: string, status: 'taken' | 'skipped') => void;
}

type TabType = 'today' | 'active' | 'upcoming' | 'completed' | 'all';

export const MedicinesPage: React.FC<MedicinesPageProps> = ({
  medicines,
  onOpenAddMed,
  onEditMed,
  onDeleteMed,
  onToggleStatus,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [search, setSearch] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Categorize medicines
  const todayMeds = useMemo(() => {
    return medicines.filter((m) => isMedicineDueToday(m));
  }, [medicines]);

  const activeMeds = useMemo(() => {
    return medicines.filter((m) => m.active);
  }, [medicines]);

  const upcomingMeds = useMemo(() => {
    return medicines.filter((m) => {
      const start = new Date(m.startDate);
      start.setHours(0, 0, 0, 0);
      return start > today;
    });
  }, [medicines, today]);

  const completedMeds = useMemo(() => {
    return medicines.filter((m) => {
      if (!m.endDate) return false;
      const end = new Date(m.endDate);
      end.setHours(23, 59, 59, 999);
      return end < today;
    });
  }, [medicines, today]);

  const displayedMeds = useMemo(() => {
    let list: MedicineItem[] = [];
    if (activeTab === 'today') list = todayMeds;
    else if (activeTab === 'active') list = activeMeds;
    else if (activeTab === 'upcoming') list = upcomingMeds;
    else if (activeTab === 'completed') list = completedMeds;
    else list = medicines;

    if (!search.trim()) return list;
    return list.filter(
      (m) =>
        m.medicineName.toLowerCase().includes(search.toLowerCase()) ||
        m.dosage.toLowerCase().includes(search.toLowerCase()) ||
        (m.notes && m.notes.toLowerCase().includes(search.toLowerCase()))
    );
  }, [activeTab, medicines, todayMeds, activeMeds, upcomingMeds, completedMeds, search]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300">
              <Pill className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Medicine Reminder &amp; Schedules
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track daily medications, scheduled dosages, meal instructions, and adhere to prescription timelines.
          </p>
        </div>

        <button
          onClick={onOpenAddMed}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs hover:shadow transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Medicine</span>
        </button>
      </div>

      {/* Tabs & Search Controls */}
      <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Navigation Tabs (Section 12: Today's, Active, Upcoming, Completed) */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('today')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'today'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>Today's Medicines</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'today'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
              }`}
            >
              {todayMeds.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'active'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>Active</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'active'
                  ? 'bg-blue-700 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
              }`}
            >
              {activeMeds.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'upcoming'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Upcoming ({upcomingMeds.length})
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'completed'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Completed ({completedMeds.length})
          </button>
        </div>

        {/* Search Bar */}
        <div className="w-full sm:w-64 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search medicines..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl"
          />
        </div>
      </div>

      {/* Medicines Grid */}
      {displayedMeds.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-12 text-center shadow-xs">
          <Pill className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            {activeTab === 'today'
              ? 'No medicines scheduled for today'
              : 'No medicines found'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {activeTab === 'today'
              ? 'You have taken all scheduled medicines, or none are due today.'
              : 'Add a new prescription or adjust your search filter.'}
          </p>
          <button
            onClick={onOpenAddMed}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medicine</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedMeds.map((med) => (
            <MedicineCard
              key={med.id}
              medicine={med}
              onToggleStatus={onToggleStatus}
              onEdit={onEditMed}
              onDelete={onDeleteMed}
            />
          ))}
        </div>
      )}
    </div>
  );
};
