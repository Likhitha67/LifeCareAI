import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  AlertTriangle,
  CheckCircle,
  Pill,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Edit3,
} from 'lucide-react';
import { parseMedicineStripText } from '../../services/medicineScanner';
import { runOcr } from '../../services/ocrService';
import { MedicineFrequency, MedicineItem } from '../../types';

interface StripScannerProps {
  onSaveToMedicines: (
    data: Omit<MedicineItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  onLogScan?: (scan: {
    imagePreview: string;
    extractedText: string;
    detectedMedicineName?: string;
    detectedDosage?: string;
    confidenceScore?: number;
    savedToMedicines?: boolean;
  }) => Promise<void>;
}

export const StripScanner: React.FC<StripScannerProps> = ({
  onSaveToMedicines,
  onLogScan,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [extractedRawText, setExtractedRawText] = useState('');
  const [detectedName, setDetectedName] = useState('');
  const [detectedDosage, setDetectedDosage] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [disclaimer, setDisclaimer] = useState('');
  const [isConfident, setIsConfident] = useState(false);

  // Form fields for saving to reminders
  const [frequency, setFrequency] = useState<MedicineFrequency>('Twice Daily');
  const [reminderTime, setReminderTime] = useState('09:00 AM');
  const [notes, setNotes] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageFile = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setSelectedImage(dataUrl);
      await processStrip(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const processStrip = async (imageSrc: string) => {
    setIsProcessing(true);
    setSavedSuccess(false);
    setProgressMsg('Scanning medicine strip with optical engine...');

    try {
      const ocrResult = await runOcr(imageSrc, (_, status) => {
        setProgressMsg(status);
      });

      const parsed = parseMedicineStripText(ocrResult.text);
      setExtractedRawText(parsed.extractedRawText);
      setDetectedName(parsed.medicineName || '');
      setDetectedDosage(parsed.dosage || '');
      setConfidence(parsed.confidenceScore);
      setDisclaimer(parsed.disclaimer);
      setIsConfident(parsed.isConfident);

      // Log scan to database
      if (onLogScan) {
        await onLogScan({
          imagePreview: imageSrc,
          extractedText: parsed.extractedRawText,
          detectedMedicineName: parsed.medicineName,
          detectedDosage: parsed.dosage,
          confidenceScore: parsed.confidenceScore,
          savedToMedicines: false,
        });
      }
    } catch (e: any) {
      setDisclaimer('Unable to extract text from this image. Please ensure good lighting and text clarity.');
      setIsConfident(false);
    } finally {
      setIsProcessing(false);
      setProgressMsg('');
    }
  };

  const handleSaveToReminders = async () => {
    if (!detectedName.trim()) {
      alert('Please provide a valid medicine name.');
      return;
    }
    setSaving(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      await onSaveToMedicines({
        medicineName: detectedName.trim(),
        dosage: detectedDosage.trim() || '',
        frequency,
        reminderTimes: [reminderTime],
        startDate: today,
        instructions: 'After food',
        notes: notes.trim() || `Scanned from strip via LifeCare AI OCR Scanner.`,
        active: true,
      });
      setSavedSuccess(true);
    } catch (err: any) {
      alert('Failed to save to reminders: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Mandatory Medical Disclaimer Banner */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
          <p className="font-bold">Important Medical &amp; Safety Disclaimer</p>
          <p>
            The LifeCare Strip Scanner is an organization and transcription tool. It does <strong>not</strong> provide medical diagnosis or prescribing advice. If the information on the strip is unclear, verify the medicine name and dosage directly with the pharmaceutical packaging or your licensed pharmacist.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Upload & Strip Camera View */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Camera className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Capture or Upload Medicine Strip
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Hold your medicine blister pack or foil strip flat in bright light.
            </p>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-400 rounded-2xl p-6 text-center cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-800/40 min-h-[220px] flex flex-col items-center justify-center"
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/png,image/jpg"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleImageFile(e.target.files[0]);
                  }
                }}
                className="hidden"
              />

              {selectedImage ? (
                <div className="space-y-2">
                  <img
                    src={selectedImage}
                    alt="Medicine Strip Preview"
                    className="max-h-56 w-auto object-contain mx-auto rounded-lg shadow-xs"
                    referrerPolicy="no-referrer"
                  />
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                    Click to choose a different photo
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-2xl inline-block">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                    Upload or take photo of strip
                  </p>
                  <p className="text-xs text-slate-400">
                    Supports JPG, PNG (foil strips, blister packaging, pill boxes)
                  </p>
                </div>
              )}
            </div>

            {/* Processing Indicator */}
            {isProcessing && (
              <div className="mt-4 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 flex items-center gap-3">
                <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-semibold text-blue-800 dark:text-blue-200">
                  {progressMsg || 'Processing image...'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Detected Information & Verification Form */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Pill className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Detected Information &amp; Verification
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Review and manually correct detected information before adding to reminders.
            </p>

            {/* Status Feedback */}
            {disclaimer && (
              <div
                className={`p-3 rounded-xl text-xs mb-4 flex items-start gap-2.5 ${
                  isConfident
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                    : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                }`}
              >
                {isConfident ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                )}
                <span>{disclaimer}</span>
              </div>
            )}

            {/* Editable Fields */}
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Medicine Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. Paracetamol, Amoxicillin"
                    value={detectedName}
                    onChange={(e) => setDetectedName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold"
                  />
                  <Edit3 className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Detected Dosage
                </label>
                <input
                  type="text"
                  placeholder="e.g. 500 mg, 10 mg"
                  value={detectedDosage}
                  onChange={(e) => setDetectedDosage(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Frequency
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as MedicineFrequency)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option value="Once Daily">Once Daily</option>
                    <option value="Twice Daily">Twice Daily</option>
                    <option value="Three Times Daily">Three Times Daily</option>
                    <option value="Weekly">Weekly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Reminder Time
                  </label>
                  <input
                    type="text"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    placeholder="e.g. 09:00 AM"
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl text-center font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Notes / Instructions
                </label>
                <input
                  type="text"
                  placeholder="e.g. Take after breakfast with warm water"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              {/* Extracted Raw OCR Snippet */}
              {extractedRawText && (
                <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">
                    Raw Extracted Text:
                  </p>
                  <p className="text-xs font-mono text-slate-600 dark:text-slate-300 line-clamp-3">
                    {extractedRawText}
                  </p>
                </div>
              )}

              {/* Save Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSaveToReminders}
                  disabled={saving || !detectedName.trim()}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>
                    {savedSuccess
                      ? 'Saved to Medicine Reminders!'
                      : 'Confirm & Save to Medicine Reminders'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
