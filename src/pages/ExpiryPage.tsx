import React, { useState, useMemo } from 'react';
import {
  ClockAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  ArrowUpDown,
  FileText,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { DocumentItem } from '../types';
import { StatusBadge } from '../components/common/Badge';
import { getDaysUntilExpiry } from '../services/dbService';

interface ExpiryPageProps {
  documents: DocumentItem[];
  onSelectDoc: (doc: DocumentItem) => void;
}

export const ExpiryPage: React.FC<ExpiryPageProps> = ({
  documents,
  onSelectDoc,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Valid' | 'Expiring Soon' | 'Expired'>('All');
  const [sortOrder, setSortOrder] = useState<'soonest' | 'latest'>('soonest');

  // Filter docs with expiry dates
  const docsWithExpiry = useMemo(() => {
    return documents.filter((d) => !!d.expiryDate);
  }, [documents]);

  // Statistics
  const validCount = docsWithExpiry.filter((d) => d.status === 'Valid').length;
  const expiringCount = docsWithExpiry.filter((d) => d.status === 'Expiring Soon').length;
  const expiredCount = docsWithExpiry.filter((d) => d.status === 'Expired').length;

  // Filter & Sort
  const filteredDocs = useMemo(() => {
    return docsWithExpiry
      .filter((doc) => {
        const matchesSearch =
          doc.documentName.toLowerCase().includes(search.toLowerCase()) ||
          doc.documentType.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'All' || doc.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const daysA = getDaysUntilExpiry(a.expiryDate) ?? 9999;
        const daysB = getDaysUntilExpiry(b.expiryDate) ?? 9999;
        return sortOrder === 'soonest' ? daysA - daysB : daysB - daysA;
      });
  }, [docsWithExpiry, search, statusFilter, sortOrder]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400">
              <ClockAlert className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Document Expiry Reminder
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Proactive validity monitoring to prevent renewal lapses on passports, visas, licenses, and insurance.
          </p>
        </div>
      </div>

      {/* Summary Cards: 🟢 Valid, 🟡 Expiring Soon, 🔴 Expired (Section 11) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Valid Documents */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'Valid' ? 'All' : 'Valid')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'Valid'
              ? 'ring-2 ring-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300'
              : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                🟢 Valid Documents
              </p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                {validCount}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">More than 30 days remaining</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Expiring Soon */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'Expiring Soon' ? 'All' : 'Expiring Soon')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'Expiring Soon'
              ? 'ring-2 ring-amber-500 bg-amber-50/70 dark:bg-amber-950/40 border-amber-300'
              : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                🟡 Expiring Soon
              </p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                {expiringCount}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">Expires within next 30 days</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Expired Documents */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'Expired' ? 'All' : 'Expired')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'Expired'
              ? 'ring-2 ring-rose-500 bg-rose-50/70 dark:bg-rose-950/40 border-rose-300'
              : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                🔴 Expired Documents
              </p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                {expiredCount}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">Renewal required immediately</p>
            </div>
            <div className="p-3 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-300">
              <XCircle className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Critical Expiry Alerts Callouts (Section 11) */}
      {(expiringCount > 0 || expiredCount > 0) && (
        <div className="space-y-2">
          {docsWithExpiry
            .filter((d) => d.status === 'Expired' || d.status === 'Expiring Soon')
            .map((doc) => {
              const days = getDaysUntilExpiry(doc.expiryDate);
              const isExpired = days !== null && days < 0;

              return (
                <div
                  key={doc.id}
                  onClick={() => onSelectDoc(doc)}
                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                    isExpired
                      ? 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 hover:bg-rose-100/60'
                      : 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 hover:bg-amber-100/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {isExpired ? (
                      <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                        {isExpired
                          ? `Your ${doc.documentName} (${doc.documentType}) has expired.`
                          : `Your ${doc.documentName} (${doc.documentType}) expires in ${days} days.`}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Expiry Date: {doc.expiryDate} &bull; Click to open document details
                      </p>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 flex-shrink-0" />
                </div>
              );
            })}
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search expiring documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl flex-1 sm:flex-initial"
          >
            <option value="All">All Statuses ({docsWithExpiry.length})</option>
            <option value="Valid">🟢 Valid ({validCount})</option>
            <option value="Expiring Soon">🟡 Expiring Soon ({expiringCount})</option>
            <option value="Expired">🔴 Expired ({expiredCount})</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'soonest' ? 'latest' : 'soonest')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>{sortOrder === 'soonest' ? 'Soonest Expiry' : 'Latest Expiry'}</span>
          </button>
        </div>
      </div>

      {/* Expiry Documents List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
        {filteredDocs.length === 0 ? (
          <div className="py-16 text-center px-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No matching expiring documents
            </p>
            <p className="text-xs text-slate-500 mt-1">
              All documents with expiry dates are either up-to-date or match different filter terms.
            </p>
          </div>
        ) : (
          filteredDocs.map((doc) => {
            const days = getDaysUntilExpiry(doc.expiryDate);
            const isExpired = days !== null && days < 0;

            return (
              <div
                key={doc.id}
                onClick={() => onSelectDoc(doc)}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div
                    className={`p-3 rounded-2xl flex-shrink-0 ${
                      isExpired
                        ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60'
                        : days !== null && days <= 30
                        ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/60'
                        : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60'
                    }`}
                  >
                    <FileText className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                      {doc.documentName}
                    </p>
                    <div className="flex flex-wrap items-center gap-2.5 mt-1 text-xs text-slate-500 dark:text-slate-400">
                      <span>{doc.documentType}</span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Expiry: <strong className="text-slate-800 dark:text-slate-200">{doc.expiryDate}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right hidden sm:block">
                    <p
                      className={`text-xs font-bold ${
                        isExpired
                          ? 'text-rose-600 dark:text-rose-400'
                          : days !== null && days <= 30
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {days !== null && days < 0
                        ? `Expired ${Math.abs(days)}d ago`
                        : `${days} days left`}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {days !== null && days < 0 ? 'Action required' : 'Current status'}
                    </p>
                  </div>
                  <StatusBadge status={doc.status} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
