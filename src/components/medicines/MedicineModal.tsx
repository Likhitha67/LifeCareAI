import React, { useState, useEffect } from 'react';
import { Pill, Plus, Trash2, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { MedicineFrequency, MedicineItem } from '../../types';

interface MedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<MedicineItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'> & { id?: string }) => Promise<void>;
  initialData?: MedicineItem | null;
}

const FREQUENCIES: MedicineFrequency[] = [
  'Once Daily',
  'Twice Daily',
  'Three Times Daily',
  'Weekly',
  'Custom',
];

export const MedicineModal: React.FC<MedicineModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [medicineName, setMedicineName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState<MedicineFrequency>('Once Daily');
  const [reminderTimes, setReminderTimes] = useState<string[]>(['09:00 AM']);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [instructions, setInstructions] = useState<'Before food' | 'After food' | 'With food' | 'Anytime'>('After food');
  const [notes, setNotes] = useState('');
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setMedicineName(initialData.medicineName);
      setDosage(initialData.dosage);
      setFrequency(initialData.frequency);
      setReminderTimes(initialData.reminderTimes || ['09:00 AM']);
      setStartDate(initialData.startDate);
      setEndDate(initialData.endDate || '');
      setInstructions(initialData.instructions || 'After food');
      setNotes(initialData.notes || '');
      setActive(initialData.active);
    } else {
      setMedicineName('');
      setDosage('');
      setFrequency('Once Daily');
      setReminderTimes(['09:00 AM']);
      setStartDate(new Date().toISOString().split('T')[0]);
      setEndDate('');
      setInstructions('After food');
      setNotes('');
      setActive(true);
    }
    setError(null);
  }, [initialData, isOpen]);

  // Adjust default reminder times when frequency changes
  const handleFrequencyChange = (f: MedicineFrequency) => {
    setFrequency(f);
    if (f === 'Once Daily') {
      setReminderTimes(['09:00 AM']);
    } else if (f === 'Twice Daily') {
      setReminderTimes(['09:00 AM', '09:00 PM']);
    } else if (f === 'Three Times Daily') {
      setReminderTimes(['08:00 AM', '02:00 PM', '08:00 PM']);
    } else if (f === 'Weekly') {
      setReminderTimes(['10:00 AM']);
    }
  };

  const addTimeSlot = () => {
    setReminderTimes([...reminderTimes, '12:00 PM']);
  };

  const removeTimeSlot = (idx: number) => {
    setReminderTimes(reminderTimes.filter((_, i) => i !== idx));
  };

  const updateTimeSlot = (idx: number, val: string) => {
    const updated = [...reminderTimes];
    updated[idx] = val;
    setReminderTimes(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicineName.trim()) {
      setError('Please enter a medicine name.');
      return;
    }
    if (!dosage.trim()) {
      setError('Please specify the dosage (e.g., 500 mg, 1 tablet).');
      return;
    }
    if (!startDate) {
      setError('Please choose a start date.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onSave({
        id: initialData?.id,
        medicineName: medicineName.trim(),
        dosage: dosage.trim(),
        frequency,
        reminderTimes: reminderTimes.length > 0 ? reminderTimes : ['09:00 AM'],
        startDate,
        endDate: endDate || undefined,
        instructions,
        notes: notes.trim() || undefined,
        active,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save medicine schedule.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Medicine Reminder' : 'Add Medicine Reminder'}
      subtitle="Track your prescriptions, schedules, and daily dosages."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Medicine Name & Dosage Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Medicine Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Paracetamol, Metformin"
              value={medicineName}
              onChange={(e) => setMedicineName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Dosage <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 500 mg, 1 tab"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Frequency & Instructions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Frequency <span className="text-rose-500">*</span>
            </label>
            <select
              value={frequency}
              onChange={(e) => handleFrequencyChange(e.target.value as MedicineFrequency)}
              className="w-full px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              {FREQUENCIES.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Meal Instruction
            </label>
            <select
              value={instructions}
              onChange={(e) => setInstructions(e.target.value as any)}
              className="w-full px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="After food">After food</option>
              <option value="Before food">Before food</option>
              <option value="With food">With food</option>
              <option value="Anytime">Anytime</option>
            </select>
          </div>
        </div>

        {/* Reminder Times */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Reminder Times
            </label>
            <button
              type="button"
              onClick={addTimeSlot}
              className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Add Time
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {reminderTimes.map((time, idx) => (
              <div key={idx} className="flex items-center gap-1">
                <input
                  type="text"
                  value={time}
                  onChange={(e) => updateTimeSlot(idx, e.target.value)}
                  placeholder="e.g. 08:30 AM"
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg text-center font-mono"
                />
                {reminderTimes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTimeSlot(idx)}
                    className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Start Date & End Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Start Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              End Date <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Prescription Notes <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Prescribed by Dr. Sharma for seasonal bronchitis"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Active Toggle */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="med-active-toggle"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="h-4 w-4 rounded-sm text-blue-600 focus:ring-blue-500 border-slate-300"
          />
          <label htmlFor="med-active-toggle" className="text-xs text-slate-700 dark:text-slate-300 font-medium">
            Active prescription (generate daily reminders)
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs hover:shadow transition-all flex items-center gap-2"
          >
            <Pill className="w-4 h-4" />
            <span>{loading ? 'Saving...' : initialData ? 'Save Changes' : 'Add Medicine'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
