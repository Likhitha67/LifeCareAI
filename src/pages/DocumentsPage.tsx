import React, { useState, useMemo } from 'react';
import {
  FolderLock,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Trash2,
  ExternalLink,
  Sparkles,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { DocumentItem, DocumentType, DocumentStatus } from '../types';
import { StatusBadge } from '../components/common/Badge';
import { getDaysUntilExpiry } from '../services/dbService';

interface DocumentsPageProps {
  documents: DocumentItem[];
  onOpenUpload: () => void;
  onSelectDoc: (doc: DocumentItem) => void;
  onDownloadDoc: (doc: DocumentItem) => void;
  onDeleteDoc: (id: string) => Promise<void>;
  onRunOcr: (doc: DocumentItem) => void;
}

type SortField = 'newest' | 'oldest' | 'name' | 'expiry';

export const DocumentsPage: React.FC<DocumentsPageProps> = ({
  documents,
  onOpenUpload,
  onSelectDoc,
  onDownloadDoc,
  onDeleteDoc,
  onRunOcr,
}) => {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [sortBy, setSortBy] = useState<SortField>('newest');
  const [docToDelete, setDocToDelete] = useState<string | null>(null);

  const documentTypes: (DocumentType | 'All')[] = [
    'All',
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

  // Filtering & Sorting
  const filteredDocs = useMemo(() => {
    return documents
      .filter((doc) => {
        // Search filter
        const matchSearch =
          doc.documentName.toLowerCase().includes(search.toLowerCase()) ||
          doc.documentType.toLowerCase().includes(search.toLowerCase()) ||
          (doc.notes && doc.notes.toLowerCase().includes(search.toLowerCase())) ||
          (doc.extractedText && doc.extractedText.toLowerCase().includes(search.toLowerCase()));

        // Type filter
        const matchType = selectedType === 'All' || doc.documentType === selectedType;

        // Status filter
        const matchStatus = selectedStatus === 'All' || doc.status === selectedStatus;

        return matchSearch && matchType && matchStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
        }
        if (sortBy === 'name') {
          return a.documentName.localeCompare(b.documentName);
        }
        if (sortBy === 'expiry') {
          const daysA = getDaysUntilExpiry(a.expiryDate) ?? 9999;
          const daysB = getDaysUntilExpiry(b.expiryDate) ?? 9999;
          return daysA - daysB;
        }
        return 0;
      });
  }, [documents, search, selectedType, selectedStatus, sortBy]);

  const confirmDelete = async (id: string) => {
    await onDeleteDoc(id);
    setDocToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300">
              <FolderLock className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Smart Document Vault
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Encrypted personal vault for ID cards, medical certificates, and insurance policies.
          </p>
        </div>

        <button
          onClick={onOpenUpload}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Search, Filter, and Sort Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Search bar */}
          <div className="lg:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, type, or extracted text..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Type Filter */}
          <div className="lg:col-span-3">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl"
            >
              {documentTypes.map((t) => (
                <option key={t} value={t}>
                  {t === 'All' ? 'All Document Types' : t}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="lg:col-span-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl"
            >
              <option value="All">All Statuses</option>
              <option value="Valid">🟢 Valid</option>
              <option value="Expiring Soon">🟡 Expiring Soon</option>
              <option value="Expired">🔴 Expired</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="lg:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortField)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="name">Sort: Document Name</option>
              <option value="expiry">Sort: Expiry Date</option>
            </select>
          </div>
        </div>
      </div>

      {/* Document List / Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
        {filteredDocs.length === 0 ? (
          <div className="py-16 text-center px-4">
            <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No documents found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {search || selectedType !== 'All' || selectedStatus !== 'All'
                ? 'No documents match your active filters. Try resetting the search or filter options.'
                : 'Upload your first personal document to get started.'}
            </p>
            <button
              onClick={onOpenUpload}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Upload Document
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-800/70 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
                  <th className="py-3.5 px-4 sm:px-6">Document Name</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Upload Date</th>
                  <th className="py-3.5 px-4">Expiry Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredDocs.map((doc) => {
                  const isImage = doc.fileType.startsWith('image/');
                  const daysLeft = getDaysUntilExpiry(doc.expiryDate);

                  return (
                    <tr
                      key={doc.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group"
                    >
                      {/* Document Name */}
                      <td className="py-4 px-4 sm:px-6">
                        <div
                          onClick={() => onSelectDoc(doc)}
                          className="flex items-center gap-3 cursor-pointer"
                        >
                          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform flex-shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <p className="font-bold text-slate-900 dark:text-white truncate hover:text-blue-600 transition-colors">
                              {doc.documentName}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">
                              {doc.fileName} &bull; {(doc.fileSize / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="py-4 px-4 font-medium text-slate-700 dark:text-slate-300">
                        {doc.documentType}
                      </td>

                      {/* Upload Date */}
                      <td className="py-4 px-4 text-slate-500 dark:text-slate-400">
                        {new Date(doc.uploadDate).toLocaleDateString()}
                      </td>

                      {/* Expiry Date */}
                      <td className="py-4 px-4">
                        {doc.expiryDate ? (
                          <div>
                            <span className="font-medium text-slate-800 dark:text-slate-200">
                              {doc.expiryDate}
                            </span>
                            {daysLeft !== null && (
                              <span className="block text-[10px] text-slate-400">
                                {daysLeft < 0
                                  ? `${Math.abs(daysLeft)}d ago`
                                  : `${daysLeft} days left`}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono text-[11px]">
                            Permanent
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <StatusBadge status={doc.status} />
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          {isImage && (
                            <button
                              onClick={() => onRunOcr(doc)}
                              title="Run OCR on document"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                            >
                              <Sparkles className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => onDownloadDoc(doc)}
                            title="Download document file"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onSelectDoc(doc)}
                            title="View details"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>

                          {docToDelete === doc.id ? (
                            <div className="inline-flex items-center gap-1 bg-rose-50 dark:bg-rose-950/60 p-1 rounded-lg">
                              <button
                                onClick={() => confirmDelete(doc.id)}
                                className="px-2 py-0.5 text-[10px] font-bold bg-rose-600 text-white rounded-md"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => setDocToDelete(null)}
                                className="px-1 text-[10px] text-slate-500"
                              >
                                &times;
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDocToDelete(doc.id)}
                              title="Delete document"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
