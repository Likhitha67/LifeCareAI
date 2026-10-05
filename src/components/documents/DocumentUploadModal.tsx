import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import { DocumentType } from '../../types';

const DOCUMENT_TYPES: DocumentType[] = [
  'Aadhaar Card',
  'PAN Card',
  'Passport',
  'Driving License',
  'Insurance',
  'Medical Report',
  'Prescription',
  'Resume',
  'Other',
];

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (data: {
    documentName: string;
    documentType: DocumentType;
    expiryDate?: string;
    notes?: string;
    fileData: string;
    fileName: string;
    fileType: string;
    fileSize: number;
  }) => Promise<void>;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
}) => {
  const [documentName, setDocumentName] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>('Aadhaar Card');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File) => {
    setError(null);
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid PDF, JPG, JPEG, or PNG document.');
      return;
    }

    // Validate size (10 MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10 MB limit.');
      return;
    }

    setSelectedFile(file);

    // Auto-fill document name if empty
    if (!documentName) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setDocumentName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFileDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentName.trim()) {
      setError('Please enter a document name.');
      return;
    }
    if (!selectedFile || !fileDataUrl) {
      setError('Please select a file to upload.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onUpload({
        documentName: documentName.trim(),
        documentType,
        expiryDate: expiryDate || undefined,
        notes: notes.trim() || undefined,
        fileData: fileDataUrl,
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        fileSize: selectedFile.size,
      });

      // Reset form
      setDocumentName('');
      setDocumentType('Aadhaar Card');
      setExpiryDate('');
      setNotes('');
      setSelectedFile(null);
      setFileDataUrl('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Unable to upload document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Document"
      subtitle="Save your health cards, IDs, and certificates securely in your encrypted vault."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Drag and Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFileChange(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30'
              : selectedFile
              ? 'border-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20'
              : 'border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 bg-slate-50/50 dark:bg-slate-800/40'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileChange(e.target.files[0]);
              }
            }}
            accept=".pdf,.png,.jpg,.jpeg"
            className="hidden"
          />

          {selectedFile ? (
            <div className="flex flex-col items-center">
              <CheckCircle2 className="w-9 h-9 text-emerald-500 mb-2" />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate max-w-xs">
                {selectedFile.name}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {(selectedFile.size / 1024).toFixed(1)} KB &bull; Click to change
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mb-2">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Click to browse or drag and drop file
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Supported formats: PDF, JPG, JPEG, PNG (Up to 10 MB)
              </p>
            </div>
          )}
        </div>

        {/* Document Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Document Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g., Passport International, Health Insurance Policy"
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Document Type & Expiry Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Document Type <span className="text-rose-500">*</span>
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value as DocumentType)}
              className="w-full px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              {DOCUMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Expiry Date <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Notes / Tags <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Annual renewal, cashless hospital network"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Action Buttons */}
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
            disabled={loading || !selectedFile}
            className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Uploading document...</span>
              </>
            ) : (
              <span>Upload Document</span>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
