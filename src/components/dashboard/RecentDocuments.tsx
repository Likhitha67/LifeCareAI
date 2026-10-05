import React from 'react';
import { FileText, Download, ExternalLink, Plus } from 'lucide-react';
import { DocumentItem } from '../../types';
import { StatusBadge } from '../common/Badge';

interface RecentDocumentsProps {
  documents: DocumentItem[];
  onNavigateDocuments: () => void;
  onOpenUpload: () => void;
  onSelectDoc: (doc: DocumentItem) => void;
  onDownloadDoc: (doc: DocumentItem) => void;
}

export const RecentDocuments: React.FC<RecentDocumentsProps> = ({
  documents,
  onNavigateDocuments,
  onOpenUpload,
  onSelectDoc,
  onDownloadDoc,
}) => {
  const recent = documents.slice(0, 5);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
            <FileText className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Recent Documents
          </h3>
          <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold px-2 py-0.5 rounded-full">
            {documents.length}
          </span>
        </div>
        <button
          onClick={onNavigateDocuments}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
        >
          View Vault &rarr;
        </button>
      </div>

      {recent.length === 0 ? (
        <div className="py-10 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            No documents yet
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Upload your first document to get started.
          </p>
          <button
            onClick={onOpenUpload}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Upload Document
          </button>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {recent.map((doc) => (
            <div
              key={doc.id}
              className="py-3 flex items-center justify-between gap-3 group hover:bg-slate-50/50 dark:hover:bg-slate-850/50 px-2 rounded-xl transition-colors"
            >
              <div
                onClick={() => onSelectDoc(doc)}
                className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
              >
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-600 dark:group-hover:bg-blue-950/60 dark:group-hover:text-blue-400 transition-colors flex-shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                    {doc.documentName}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {doc.documentType} &bull; Uploaded {new Date(doc.uploadDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <StatusBadge status={doc.status} />

                <button
                  onClick={() => onDownloadDoc(doc)}
                  aria-label="Download document"
                  title="Download file"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onSelectDoc(doc)}
                  aria-label="View document details"
                  title="View details"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
