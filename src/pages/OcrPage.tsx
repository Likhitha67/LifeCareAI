import React, { useState, useEffect, useRef } from 'react';
import {
  ScanText,
  Upload,
  Play,
  RotateCcw,
  Sparkles,
  FileCheck2,
  Image as ImageIcon,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import {
  DEFAULT_PREPROCESS_OPTIONS,
  PreprocessingOptions,
  preprocessImage,
  runOcr,
} from '../services/ocrService';
import { ImagePreprocessor } from '../components/ocr/ImagePreprocessor';
import { OcrResultViewer } from '../components/ocr/OcrResultViewer';
import { DocumentItem } from '../types';

interface OcrPageProps {
  documents: DocumentItem[];
  preselectedDoc?: DocumentItem | null;
  onSaveOcrResult: (result: {
    documentId?: string;
    imagePreview: string;
    processedImagePreview?: string;
    extractedText: string;
    detectedDocumentType: string;
    wordCount: number;
    characterCount: number;
    processingTimeMs: number;
  }) => Promise<void>;
  onAskAI: (text: string) => void;
}

export const OcrPage: React.FC<OcrPageProps> = ({
  documents,
  preselectedDoc,
  onSaveOcrResult,
  onAskAI,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [filters, setFilters] = useState<PreprocessingOptions>(DEFAULT_PREPROCESS_OPTIONS);
  const [activeTab, setActiveTab] = useState<'original' | 'processed'>('original');

  const [ocrRunning, setOcrRunning] = useState(false);
  const [ocrProgress, setOcrProgress] = useState({ percent: 0, status: '' });

  const [extractedText, setExtractedText] = useState<string>('');
  const [detectedType, setDetectedType] = useState<string>('Unknown Document');
  const [wordCount, setWordCount] = useState<number>(0);
  const [characterCount, setCharacterCount] = useState<number>(0);
  const [processingTime, setProcessingTime] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Available image docs in vault
  const imageDocs = documents.filter((d) => d.fileType.startsWith('image/'));

  useEffect(() => {
    if (preselectedDoc && preselectedDoc.fileData) {
      loadNewImage(preselectedDoc.fileData);
    }
  }, [preselectedDoc]);

  const loadNewImage = async (dataUrl: string) => {
    setSelectedImage(dataUrl);
    setExtractedText('');
    setWordCount(0);
    setCharacterCount(0);
    // Apply default filters
    try {
      const res = await preprocessImage(dataUrl, filters);
      setProcessedImage(res.processedDataUrl);
    } catch {
      setProcessedImage(dataUrl);
    }
  };

  const handleFilterChange = async (newFilters: PreprocessingOptions) => {
    setFilters(newFilters);
    if (selectedImage) {
      try {
        const res = await preprocessImage(selectedImage, newFilters);
        setProcessedImage(res.processedDataUrl);
      } catch (e) {
        console.error('Filter processing error:', e);
      }
    }
  };

  const handleResetFilters = async () => {
    setFilters(DEFAULT_PREPROCESS_OPTIONS);
    if (selectedImage) {
      const res = await preprocessImage(selectedImage, DEFAULT_PREPROCESS_OPTIONS);
      setProcessedImage(res.processedDataUrl);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        loadNewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRunOcr = async () => {
    if (!selectedImage) return;

    setOcrRunning(true);
    setOcrProgress({ percent: 0.1, status: 'Initializing Tesseract OCR engine...' });

    // Use processed image if filters are enabled for higher accuracy, or original
    const targetSource = processedImage || selectedImage;

      try {
    const result = await runOcr(
      selectedImage,
      (percent, status) => {
        setOcrProgress({ percent, status });
      },
      processedImage || undefined
    );

      setExtractedText(result.text);
      setDetectedType(result.detectedType);
      setWordCount(result.wordCount);
      setCharacterCount(result.characterCount);
      setProcessingTime(result.durationMs);

      // Automatically save scan log
      await onSaveOcrResult({
        documentId: preselectedDoc?.id,
        imagePreview: selectedImage,
        processedImagePreview: processedImage || undefined,
        extractedText: result.text,
        detectedDocumentType: result.detectedType,
        wordCount: result.wordCount,
        characterCount: result.characterCount,
        processingTimeMs: result.durationMs,
      });
    } catch (err) {
      alert('Unable to extract text from this image. Please ensure text clarity.');
    } finally {
      setOcrRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300">
              <ScanText className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              OCR Document Reader
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Client-side Optical Character Recognition with live image filtering and transparent document classification.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/jpeg,image/png,image/jpg"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 shadow-2xs transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Upload New Image</span>
          </button>

          <button
            onClick={handleRunOcr}
            disabled={!selectedImage || ocrRunning}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{ocrRunning ? 'Extracting Text...' : 'Run OCR Pipeline'}</span>
          </button>
        </div>
      </div>

      {/* Select from Vault Dropdown if user has uploaded docs */}
      {imageDocs.length > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-xs">
          <span className="font-bold text-blue-900 dark:text-blue-300 flex-shrink-0">
            Quick Select from Vault:
          </span>
          <select
            onChange={(e) => {
              const doc = imageDocs.find((d) => d.id === e.target.value);
              if (doc && doc.fileData) loadNewImage(doc.fileData);
            }}
            defaultValue=""
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-800 dark:text-slate-200"
          >
            <option value="" disabled>
              -- Choose an existing document image --
            </option>
            {imageDocs.map((d) => (
              <option key={d.id} value={d.id}>
                {d.documentName} ({d.documentType})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Main OCR Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Preprocessing & Dual Viewer */}
        <div className="lg:col-span-6 space-y-4">
          {/* Preprocessing Controls Component (Section 9) */}
          <ImagePreprocessor
            options={filters}
            onChange={handleFilterChange}
            onReset={handleResetFilters}
            disabled={!selectedImage || ocrRunning}
          />

          {/* Dual Image Preview: Original vs Processed Tabs */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('original')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    activeTab === 'original'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Original Image
                </button>
                <button
                  onClick={() => setActiveTab('processed')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    activeTab === 'processed'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Processed (Filtered)
                </button>
              </div>

              {selectedImage && (
                <span className="text-[11px] text-slate-400 font-mono">
                  {activeTab === 'processed' ? 'Grayscale + Thresholded' : 'RGB Camera'}
                </span>
              )}
            </div>

            {/* Canvas / Image Display Frame */}
            <div className="relative rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 min-h-[300px] max-h-[420px] flex items-center justify-center overflow-hidden">
              {selectedImage ? (
                <img
                  src={activeTab === 'processed' && processedImage ? processedImage : selectedImage}
                  alt="OCR Target Document"
                  className="max-h-[400px] w-auto object-contain mx-auto transition-all"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="py-12 text-center px-4">
                  <ImageIcon className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    No image document selected
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Upload an image or pick a document from your vault to begin.
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Browse Image
                  </button>
                </div>
              )}

              {/* Live OCR Progress Overlay */}
              {ocrRunning && (
                <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white space-y-3">
                  <div className="h-8 w-8 border-3 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm font-bold">{ocrProgress.status}</p>
                  <div className="w-48 bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-full transition-all duration-200"
                      style={{ width: `${Math.round(ocrProgress.percent * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Extracted Text & Detection Result */}
        <div className="lg:col-span-6">
          {extractedText ? (
            <OcrResultViewer
              extractedText={extractedText}
              detectedType={detectedType}
              wordCount={wordCount}
              characterCount={characterCount}
              onSaveToDocuments={() => {
                alert('OCR text saved successfully to your document records.');
              }}
              onAskAI={onAskAI}
            />
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-8 text-center shadow-xs min-h-[380px] flex flex-col items-center justify-center">
              <ScanText className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                OCR Pipeline Ready
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1 mb-4 leading-relaxed">
                Click <strong>"Run OCR Pipeline"</strong> to convert image text into machine-readable characters, detect document types (Aadhaar, PAN, Passport, DL), and perform in-text keyword search.
              </p>
              <button
                onClick={handleRunOcr}
                disabled={!selectedImage || ocrRunning}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="w-4 h-4 fill-current" />
                Run OCR Pipeline
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
