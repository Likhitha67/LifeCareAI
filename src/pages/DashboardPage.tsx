import React from 'react';
import {
  FileText,
  Pill,
  ClockAlert,
  Camera,
  Upload,
  Plus,
  ScanText,
  Sparkles,
} from 'lucide-react';
import { MetricCard } from '../components/dashboard/MetricCard';
import { RecentDocuments } from '../components/dashboard/RecentDocuments';
import { TodayMedicines } from '../components/dashboard/TodayMedicines';
import { UpcomingExpiry } from '../components/dashboard/UpcomingExpiry';
import { DocumentItem, MedicineItem } from '../types';
import { DashboardStats, isMedicineDueToday } from '../services/dbService';
import { NavigationTab } from '../components/common/Sidebar';

interface DashboardPageProps {
  stats: DashboardStats;
  documents: DocumentItem[];
  medicines: MedicineItem[];
  onNavigate: (tab: NavigationTab) => void;
  onOpenUpload: () => void;
  onOpenAddMed: () => void;
  onSelectDoc: (doc: DocumentItem) => void;
  onDownloadDoc: (doc: DocumentItem) => void;
  onToggleMedStatus: (id: string, status: 'taken' | 'skipped') => void;
  onOpenAssistant: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  stats,
  documents,
  medicines,
  onNavigate,
  onOpenUpload,
  onOpenAddMed,
  onSelectDoc,
  onDownloadDoc,
  onToggleMedStatus,
  onOpenAssistant,
}) => {
  const todayMeds = medicines.filter((m) => isMedicineDueToday(m));

  return (
    <div className="space-y-6">
      {/* 4 Primary Metric Cards (Section 7 & 28: DYNAMIC VALUES FROM DATABASE) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Documents"
          count={stats.documentsCount}
          icon={FileText}
          colorScheme="blue"
          subtext={`${stats.validDocsCount} valid, ${stats.expiringDocsCount} expiring`}
          onClick={() => onNavigate('documents')}
        />
        <MetricCard
          title="Medicines"
          count={stats.medicinesCount}
          icon={Pill}
          colorScheme="emerald"
          subtext={`${medicines.filter((m) => m.active).length} active prescriptions`}
          onClick={() => onNavigate('medicines')}
        />
        <MetricCard
          title="Due Today"
          count={stats.dueTodayCount}
          icon={ClockAlert}
          colorScheme="amber"
          subtext={`${todayMeds.length} schedules to take`}
          onClick={() => onNavigate('medicines')}
        />
        <MetricCard
          title="OCR Scans"
          count={stats.scansCount}
          icon={Camera}
          colorScheme="purple"
          subtext="Processed with optical engine"
          onClick={() => onNavigate('ocr')}
        />
      </div>

      {/* Quick Action Bar (Section 7) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Quick Actions:
            </span>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenUpload}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-blue-600 dark:hover:text-white transition-all shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>+ Upload Document</span>
            </button>

            <button
              onClick={onOpenAddMed}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-600 dark:hover:text-white transition-all shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Medicine</span>
            </button>

            <button
              onClick={() => onNavigate('scanner')}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white dark:bg-purple-950/60 dark:text-purple-300 dark:hover:bg-purple-600 dark:hover:text-white transition-all shadow-2xs"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>📷 Scan Medicine</span>
            </button>

            <button
              onClick={() => onNavigate('ocr')}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-600 dark:hover:text-white transition-all shadow-2xs"
            >
              <ScanText className="w-3.5 h-3.5" />
              <span>📝 Open OCR Reader</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Medicines & Upcoming Expiry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <TodayMedicines
            medicines={todayMeds}
            onToggleStatus={onToggleMedStatus}
            onNavigateMedicines={() => onNavigate('medicines')}
            onAddMedicine={onOpenAddMed}
          />
        </div>

        <div className="lg:col-span-5">
          <UpcomingExpiry
            documents={documents}
            onNavigateExpiry={() => onNavigate('expiry')}
            onSelectDoc={onSelectDoc}
          />
        </div>
      </div>

      {/* Recent Documents Table Section */}
      <div>
        <RecentDocuments
          documents={documents}
          onNavigateDocuments={() => onNavigate('documents')}
          onOpenUpload={onOpenUpload}
          onSelectDoc={onSelectDoc}
          onDownloadDoc={onDownloadDoc}
        />
      </div>
    </div>
  );
};
