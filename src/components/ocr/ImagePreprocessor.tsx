import React from 'react';
import { Sliders, RefreshCw } from 'lucide-react';
import { DEFAULT_PREPROCESS_OPTIONS, PreprocessingOptions } from '../../services/ocrService';

interface ImagePreprocessorProps {
  options: PreprocessingOptions;
  onChange: (options: PreprocessingOptions) => void;
  onReset: () => void;
  disabled?: boolean;
}

export const ImagePreprocessor: React.FC<ImagePreprocessorProps> = ({
  options,
  onChange,
  onReset,
  disabled = false,
}) => {
  const handleChange = <K extends keyof PreprocessingOptions>(
    key: K,
    val: PreprocessingOptions[K]
  ) => {
    onChange({ ...options, [key]: val });
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Image Preprocessing Filters
          </h4>
        </div>
        <button
          type="button"
          onClick={onReset}
          disabled={disabled}
          className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1 disabled:opacity-40"
        >
          <RefreshCw className="w-3 h-3" />
          Reset Filters
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        {/* Grayscale Toggle */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800">
          <label className="font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none">
            Grayscale
          </label>
          <input
            type="checkbox"
            checked={options.grayscale}
            disabled={disabled}
            onChange={(e) => handleChange('grayscale', e.target.checked)}
            className="h-4 w-4 rounded-sm text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
          />
        </div>

        {/* Contrast Slider */}
        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 space-y-1">
          <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300">
            <span>Contrast</span>
            <span className="text-slate-400 font-mono">{options.contrast}</span>
          </div>
          <input
            type="range"
            min="-50"
            max="100"
            value={options.contrast}
            disabled={disabled}
            onChange={(e) => handleChange('contrast', Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* Brightness Slider */}
        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 space-y-1">
          <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300">
            <span>Brightness</span>
            <span className="text-slate-400 font-mono">{options.brightness}</span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            value={options.brightness}
            disabled={disabled}
            onChange={(e) => handleChange('brightness', Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* Binarization / Threshold Slider */}
        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 space-y-1">
          <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300">
            <span>Binarize / Threshold</span>
            <span className="text-slate-400 font-mono">{options.threshold}</span>
          </div>
          <input
            type="range"
            min="0"
            max="255"
            value={options.threshold}
            disabled={disabled}
            onChange={(e) => handleChange('threshold', Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>
      </div>
    </div>
  );
};
