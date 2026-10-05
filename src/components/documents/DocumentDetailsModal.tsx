import React, { useState } from 'react';
import {
  Download,
  Trash2,
  FileText,
  Calendar,
  Sparkles,
  Copy,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/Badge';
import { DocumentItem } from '../../types';
import { getDaysUntilExpiry } from '../../services/dbService';

interface DocumentDetailsModalProps {
  document: DocumentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => Promise<void>;
  onDownload: (doc: DocumentItem) => void;
  onRunOcr?: (doc: DocumentItem) => void;
  onAskAI?: (text: string) => void;
}

export const DocumentDetailsModal: React.FC<DocumentDetailsModalProps> = ({
  document,
  isOpen,
  onClose,
  onDelete,
  onDownload,
  onRunOcr,
  onAskAI,
}) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!document) return null;

  const daysLeft = getDaysUntilExpiry(document.expiryDate);
  const isImage = document.fileType.startsWith('image/');
  const isPdf = document.fileType === 'application/pdf';

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(document.id);
      setConfirmDelete(false);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyText = () => {
    if (document.extractedText) {
      navigator.clipboard.writeText(document.extractedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setConfirmDelete(false);
        onClose();
      }}
      title={document.documentName}
      subtitle={`${document.documentType} • ${(document.fileSize / 1024).toFixed(1)} KB`}
      maxWidth="2xl"
    >
      <div className="space-y-5">
        {/* Top Badges & Expiry Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
          <div className="flex items-center gap-2.5">
            <StatusBadge status={document.status} />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {document.expiryDate ? (
                <>
                  Expiry: <strong className="text-slate-800 dark:text-slate-200">{document.expiryDate}</strong>
                  {daysLeft !== null && (
                    <span className="ml-1 text-[11px]">
                      ({daysLeft < 0 ? `Expired ${Math.abs(daysLeft)}d ago` : `${daysLeft} days remaining`})
                    </span>
                  )}
                </>
              ) : (
                'No expiry date specified (Permanent validity)'
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onDownload(document)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 shadow-2xs hover:bg-slate-50 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </button>

            {isImage && onRunOcr && (
              <button
                onClick={() => {
                  onClose();
                  onRunOcr(document);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                OCR Reader
              </button>
            )}
          </div>
        </div>

        {/* File Preview Container */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center min-h-[160px] max-h-[300px]">
          {isImage && document.fileData ? (
            <img
              src={document.fileData}
              alt={document.documentName}
              className="max-h-[300px] w-auto object-contain mx-auto"
              referrerPolicy="no-referrer"
            />
          ) : isPdf ? (
            <div className="py-8 text-center px-4">
              <FileText className="w-12 h-12 text-rose-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                PDF Document File
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {document.fileName} ({(document.fileSize / 1024).toFixed(1)} KB)
              </p>
              <button
                onClick={() => onDownload(document)}
                className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-2xs hover:bg-slate-50"
              >
                <Download className="w-3.5 h-3.5" />
                Open / Download PDF
              </button>
            </div>
          ) : (
            <div className="py-8 text-center">
              <FileText className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-xs text-slate-500">Document preview unavailable</p>
            </div>
          )}
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <p className="text-slate-400 font-semibold uppercase text-[10px]">Type</p>
            <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{document.documentType}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <p className="text-slate-400 font-semibold uppercase text-[10px]">Uploaded</p>
            <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
              {new Date(document.uploadDate).toLocaleDateString()}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <p className="text-slate-400 font-semibold uppercase text-[10px]">File Size</p>
            <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
              {(document.fileSize / 1024).toFixed(1)} KB
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <p className="text-slate-400 font-semibold uppercase text-[10px]">Security</p>
            <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">Encrypted Vault</p>
          </div>
        </div>

        {/* Notes if present */}
        {document.notes && (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
            <p className="text-slate-400 font-semibold uppercase text-[10px] mb-1">Notes</p>
            <p className="text-slate-700 dark:text-slate-300">{document.notes}</p>
          </div>
        )}

        {/* Extracted OCR Text */}
        {document.extractedText && (
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-slate-50/70 dark:bg-slate-850/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                Extracted OCR Text
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyText}
                  className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 font-medium hover:underline"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied!' : 'Copy Text'}
                </button>
                {onAskAI && (
                  <button
                    onClick={() => {
                      onClose();
                      onAskAI(document.extractedText!);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium hover:underline ml-2"
                  >
                    Explain with AI
                  </button>
                )}
              </div>
            </div>
            <pre className="text-xs font-mono bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200/80 dark:border-slate-800 max-h-36 overflow-y-auto whitespace-pre-wrap text-slate-700 dark:text-slate-300">
              {document.extractedText}
            </pre>
          </div>
        )}

        {/* Bottom Delete Confirmation & Close */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 px-3 py-2 rounded-xl transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete Document
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Confirm deletion?
              </span>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-3 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors shadow-2xs"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                Cancel
              </button>
            </div>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
