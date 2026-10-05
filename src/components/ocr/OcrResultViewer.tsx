import React, { useState } from 'react';
import {
  Copy,
  Check,
  Download,
  Search,
  Sparkles,
  FileCheck2,
  Bookmark,
} from 'lucide-react';
import { DocumentType } from '../../types';

interface OcrResultViewerProps {
  extractedText: string;
  detectedType: DocumentType | string;
  wordCount: number;
  characterCount: number;
  onSaveToDocuments?: () => void;
  onAskAI?: (text: string) => void;
}

export const OcrResultViewer: React.FC<OcrResultViewerProps> = ({
  extractedText,
  detectedType,
  wordCount,
  characterCount,
  onSaveToDocuments,
  onAskAI,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lifecare_ocr_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    onSaveToDocuments?.();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // Search logic as specified in Section 9:
  // "If matching text is found: 'Match found'. If not: 'No matching text found'"
  const searchStatus = React.useMemo(() => {
    if (!searchTerm.trim()) return null;
    const lowerText = extractedText.toLowerCase();
    const lowerQuery = searchTerm.trim().toLowerCase();
    const count = (lowerText.match(new RegExp(lowerQuery, 'g')) || []).length;
    return count > 0
      ? { found: true, message: `Match found (${count} occurrence${count > 1 ? 's' : ''})` }
      : { found: false, message: 'No matching text found' };
  }, [extractedText, searchTerm]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 space-y-4 shadow-xs">
      {/* Top Header: Detected Document Type & Counts */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Detected Document Type:
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
                {detectedType}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Rule-based transparent detection
            </p>
          </div>
        </div>

        {/* Word and Character Count Metrics (Section 9) */}
        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium border border-slate-200/70 dark:border-slate-700">
            Words: <strong className="text-slate-900 dark:text-white font-mono">{wordCount}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium border border-slate-200/70 dark:border-slate-700">
            Characters: <strong className="text-slate-900 dark:text-white font-mono">{characterCount}</strong>
          </div>
        </div>
      </div>

      {/* Search inside OCR Text (Section 9) */}
      <div className="space-y-1.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search inside extracted OCR text..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-32 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          {searchStatus && (
            <div
              className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold px-2 py-0.5 rounded-md ${
                searchStatus.found
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
              }`}
            >
              {searchStatus.message}
            </div>
          )}
        </div>
      </div>

      {/* Extracted Text Area */}
      <div className="relative">
        <textarea
          readOnly
          value={extractedText}
          rows={10}
          className="w-full p-4 text-xs sm:text-sm font-mono bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden leading-relaxed resize-y"
        />
      </div>

      {/* Actions: Copy Text, Download TXT, Save OCR Result */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 transition-all shadow-2xs"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Text'}</span>
          </button>

          <button
            onClick={handleDownloadTxt}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 transition-all shadow-2xs"
          >
            <Download className="w-4 h-4" />
            <span>Download TXT</span>
          </button>

          {onSaveToDocuments && (
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-all"
            >
              <Bookmark className="w-4 h-4" />
              <span>{saved ? 'Saved to Vault!' : 'Save OCR Result'}</span>
            </button>
          )}
        </div>

        {onAskAI && (
          <button
            onClick={() => onAskAI(extractedText)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-all"
          >
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Explain with AI</span>
          </button>
        )}
      </div>
    </div>
  );
};
