import React from 'react';
import confetti from 'canvas-confetti';
import {
  Pill,
  Clock,
  Calendar,
  Check,
  X,
  Edit2,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { MedicineItem } from '../../types';
import { isMedicineDueToday } from '../../services/dbService';

interface MedicineCardProps {
  medicine: MedicineItem;
  onToggleStatus: (id: string, status: 'taken' | 'skipped') => void;
  onEdit: (med: MedicineItem) => void;
  onDelete: (id: string) => void;
}

export const MedicineCard: React.FC<MedicineCardProps> = ({
  medicine,
  onToggleStatus,
  onEdit,
  onDelete,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const todayStatus = medicine.takenDates ? medicine.takenDates[todayStr] : undefined;
  const isTaken = todayStatus === 'taken';
  const isSkipped = todayStatus === 'skipped';
  const isDue = isMedicineDueToday(medicine);

  const handleTake = () => {
    try {
      confetti({ particleCount: 40, spread: 50 });
    } catch {
      // Ignored
    }
    onToggleStatus(medicine.id, 'taken');
  };

  return (
    <div
      className={`rounded-2xl border transition-all p-5 shadow-xs hover:shadow-md ${
        isTaken
          ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
          : isDue
          ? 'bg-white dark:bg-slate-900 border-blue-200/80 dark:border-blue-900/60 ring-1 ring-blue-500/10'
          : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={`p-3 rounded-xl flex-shrink-0 ${
              isTaken
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                : 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400'
            }`}
          >
            <Pill className="w-5 h-5" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h4
                className={`text-base font-extrabold truncate ${
                  isTaken ? 'line-through text-slate-500' : 'text-slate-900 dark:text-white'
                }`}
              >
                {medicine.medicineName}
              </h4>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200">
                {medicine.dosage}
              </span>
              {isDue && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  Due Today
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {medicine.frequency}
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {medicine.reminderTimes?.join(', ') || 'Scheduled'}
              </span>
              {medicine.instructions && (
                <>
                  <span>&bull;</span>
                  <span className="text-slate-600 dark:text-slate-300 font-medium">
                    {medicine.instructions}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Edit and Delete Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(medicine)}
            title="Edit schedule"
            className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(medicine.id)}
            title="Delete medicine"
            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Prescription Notes */}
      {medicine.notes && (
        <div className="mt-3 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-850 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
          <p className="line-clamp-2">{medicine.notes}</p>
        </div>
      )}

      {/* Date Range & Daily Action Bar */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
          <Calendar className="w-3.5 h-3.5" />
          <span>
            {new Date(medicine.startDate).toLocaleDateString()}
            {medicine.endDate ? ` — ${new Date(medicine.endDate).toLocaleDateString()}` : ' (Ongoing)'}
          </span>
        </div>

        {/* Due Today Action Buttons */}
        {isDue && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleTake}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                isTaken
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{isTaken ? 'Taken Today' : 'Mark Taken'}</span>
            </button>

            <button
              onClick={() => onToggleStatus(medicine.id, 'skipped')}
              className={`px-2.5 py-1.5 rounded-xl font-semibold flex items-center gap-1 transition-all ${
                isSkipped
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              <X className="w-4 h-4" />
              <span>{isSkipped ? 'Skipped' : 'Skip'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
