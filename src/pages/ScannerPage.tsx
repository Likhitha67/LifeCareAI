import React from 'react';
import { Camera, Clock, Pill, CheckCircle2 } from 'lucide-react';
import { StripScanner } from '../components/scanner/StripScanner';
import { MedicineItem, MedicineScanResult } from '../types';

interface ScannerPageProps {
  scans: MedicineScanResult[];
  onSaveToMedicines: (
    data: Omit<MedicineItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  onLogScan: (scan: {
    imagePreview: string;
    extractedText: string;
    detectedMedicineName?: string;
    detectedDosage?: string;
    confidenceScore?: number;
    savedToMedicines?: boolean;
  }) => Promise<void>;
}

export const ScannerPage: React.FC<ScannerPageProps> = ({
  scans,
  onSaveToMedicines,
  onLogScan,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300">
            <Camera className="w-5 h-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Medicine Strip Scanner
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Optical character recognition for blister packs and prescription labels with automated dosage extraction.
        </p>
      </div>

      {/* Main Strip Scanner Component */}
      <StripScanner onSaveToMedicines={onSaveToMedicines} onLogScan={onLogScan} />

      {/* Recent Scans History Section */}
      {scans.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Recent Scans History
            </h3>
            <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-600 dark:text-slate-300 font-semibold">
              {scans.length}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {scans.slice(0, 6).map((scan) => (
              <div
                key={scan.id}
                className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 flex items-start gap-3"
              >
                <img
                  src={scan.imagePreview}
                  alt="Scanned Strip"
                  className="w-12 h-12 rounded-lg object-cover bg-slate-200 flex-shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {scan.detectedMedicineName || 'Unknown packaging'}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Dosage: <strong className="text-blue-600">{scan.detectedDosage || 'N/A'}</strong>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {new Date(scan.timestamp).toLocaleDateString()} &bull;{' '}
                    {new Date(scan.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
