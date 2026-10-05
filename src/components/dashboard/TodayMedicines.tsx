import React from 'react';
import confetti from 'canvas-confetti';
import { Check, X, Clock, Pill } from 'lucide-react';
import { MedicineItem } from '../../types';

interface TodayMedicinesProps {
  medicines: MedicineItem[];
  onToggleStatus: (medId: string, status: 'taken' | 'skipped') => void;
  onNavigateMedicines: () => void;
  onAddMedicine: () => void;
}

export const TodayMedicines: React.FC<TodayMedicinesProps> = ({
  medicines,
  onToggleStatus,
  onNavigateMedicines,
  onAddMedicine,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const handleTake = (medId: string) => {
    // Confetti celebration
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {
      // Ignored if confetti fails
    }
    onToggleStatus(medId, 'taken');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
            <Pill className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Today's Medicines
          </h3>
          <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold px-2 py-0.5 rounded-full">
            {medicines.length}
          </span>
        </div>
        <button
          onClick={onNavigateMedicines}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
        >
          View All &rarr;
        </button>
      </div>

      {medicines.length === 0 ? (
        <div className="py-8 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            No medicines due today
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Add a prescription to track daily reminders.
          </p>
          <button
            onClick={onAddMedicine}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 rounded-lg hover:bg-blue-100 transition-colors"
          >
            + Add Medicine
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {medicines.map((med) => {
            const status = med.takenDates ? med.takenDates[todayStr] : undefined;
            const isTaken = status === 'taken';
            const isSkipped = status === 'skipped';

            return (
              <div
                key={med.id}
                className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                  isTaken
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
                    : isSkipped
                    ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 opacity-60'
                    : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 shadow-xs'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p
                      className={`text-xs sm:text-sm font-bold truncate ${
                        isTaken
                          ? 'line-through text-emerald-800 dark:text-emerald-300'
                          : isSkipped
                          ? 'line-through text-slate-500'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {med.medicineName}
                    </p>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                      {med.dosage}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {med.reminderTimes && med.reminderTimes[0]
                        ? med.reminderTimes[0]
                        : 'Scheduled'}
                    </span>
                    {med.instructions && (
                      <span className="text-slate-400">&bull; {med.instructions}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => handleTake(med.id)}
                    title={isTaken ? 'Mark as pending' : 'Mark as taken'}
                    className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                      isTaken
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/60 dark:text-emerald-300'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {isTaken ? 'Taken' : 'Take'}
                    </span>
                  </button>

                  <button
                    onClick={() => onToggleStatus(med.id, 'skipped')}
                    title={isSkipped ? 'Mark as pending' : 'Skip dose'}
                    className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                      isSkipped
                        ? 'bg-slate-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    <X className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {isSkipped ? 'Skipped' : 'Skip'}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
