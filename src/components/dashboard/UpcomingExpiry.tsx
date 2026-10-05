import React from 'react';
import { ClockAlert, ChevronRight, FileText } from 'lucide-react';
import { DocumentItem } from '../../types';
import { StatusBadge } from '../common/Badge';
import { getDaysUntilExpiry } from '../../services/dbService';

interface UpcomingExpiryProps {
  documents: DocumentItem[];
  onNavigateExpiry: () => void;
  onSelectDoc: (doc: DocumentItem) => void;
}

export const UpcomingExpiry: React.FC<UpcomingExpiryProps> = ({
  documents,
  onNavigateExpiry,
  onSelectDoc,
}) => {
  // Filter for docs with expiry date that are Expiring Soon or Expired
  const expiringDocs = documents
    .filter((d) => d.expiryDate && (d.status === 'Expiring Soon' || d.status === 'Expired'))
    .sort((a, b) => {
      const daysA = getDaysUntilExpiry(a.expiryDate) ?? 999;
      const daysB = getDaysUntilExpiry(b.expiryDate) ?? 999;
      return daysA - daysB;
    })
    .slice(0, 4);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
            <ClockAlert className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Upcoming Expiry &amp; Renewals
          </h3>
          {expiringDocs.length > 0 && (
            <span className="text-xs bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-semibold px-2 py-0.5 rounded-full">
              {expiringDocs.length}
            </span>
          )}
        </div>
        <button
          onClick={onNavigateExpiry}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
        >
          View All &rarr;
        </button>
      </div>

      {expiringDocs.length === 0 ? (
        <div className="py-8 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            All documents are up-to-date!
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            No documents expiring within the next 30 days.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {expiringDocs.map((doc) => {
            const days = getDaysUntilExpiry(doc.expiryDate);
            const isExpired = days !== null && days < 0;

            return (
              <div
                key={doc.id}
                onClick={() => onSelectDoc(doc)}
                className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 bg-white dark:bg-slate-850 hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-all cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-2 rounded-xl flex-shrink-0 ${
                      isExpired
                        ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50'
                        : 'bg-amber-50 text-amber-600 dark:bg-amber-950/50'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                      {doc.documentName}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-slate-400">
                        {doc.documentType}
                      </span>
                      <span className="text-[11px] text-slate-400">&bull;</span>
                      <span
                        className={`text-[11px] font-medium ${
                          isExpired
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {isExpired
                          ? `Expired ${Math.abs(days!)}d ago`
                          : `Expires in ${days} days`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <StatusBadge status={doc.status} />
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
