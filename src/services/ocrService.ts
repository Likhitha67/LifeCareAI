import { createWorker } from 'tesseract.js';
import { DocumentType } from '../types';

export interface PreprocessingOptions {
  grayscale: boolean;
  contrast: number; // -100 to 100
  brightness: number; // -100 to 100
  threshold: number; // 0 = off, 255 = maximum
  invert: boolean;
}

export const DEFAULT_PREPROCESS_OPTIONS: PreprocessingOptions = {
  grayscale: true,
  contrast: 20,
  brightness: 5,
  threshold: 135,
  invert: false,
};

/**
 * Preprocess an image using Canvas.
 *
 * The original image is kept untouched.
 * This processed version is used as an alternative OCR input
 * when the original image does not give a good result.
 */
export async function preprocessImage(
  imageSource: string | HTMLImageElement,
  options: PreprocessingOptions = DEFAULT_PREPROCESS_OPTIONS
): Promise<{
  processedDataUrl: string;
  width: number;
  height: number;
}> {
  return new Promise((resolve, reject) => {
    const img = typeof imageSource === 'string' ? new Image() : imageSource;

    if (typeof imageSource === 'string') {
      img.crossOrigin = 'anonymous';
      img.src = imageSource;
    }

    const process = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Canvas 2D context not available'));
          return;
        }

        const sourceWidth = img.naturalWidth || img.width;
        const sourceHeight = img.naturalHeight || img.height;

        if (!sourceWidth || !sourceHeight) {
          reject(new Error('Unable to determine image dimensions'));
          return;
        }

        /*
         * Keep enough resolution for OCR.
         *
         * Very small images are enlarged because Tesseract performs
         * better when characters have enough pixels.
         */
        const MIN_WIDTH = 1400;
        const scale =
          sourceWidth < MIN_WIDTH ? MIN_WIDTH / sourceWidth : 1;

        canvas.width = Math.round(sourceWidth * scale);
        canvas.height = Math.round(sourceHeight * scale);

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(
          img,
          0,
          0,
          canvas.width,
          canvas.height
        );

        const imageData = ctx.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );

        const data = imageData.data;

        const contrastFactor =
          (259 * (options.contrast + 255)) /
          (255 * (259 - options.contrast));

        for (let i = 0; i < data.length; i += 4) {
          let r = data[i];
          let g = data[i + 1];
          let b = data[i + 2];

          if (options.grayscale) {
            const gray =
              0.299 * r +
              0.587 * g +
              0.114 * b;

            r = gray;
            g = gray;
            b = gray;
          }

          r += options.brightness;
          g += options.brightness;
          b += options.brightness;

          r =
            contrastFactor * (r - 128) + 128;
          g =
            contrastFactor * (g - 128) + 128;
          b =
            contrastFactor * (b - 128) + 128;

          /*
           * Thresholding is useful for documents with clear
           * dark text on a light background.
           *
           * It can hurt photographs or medicine strips, so the
           * OCR engine will not rely on this version alone.
           */
          if (options.threshold > 0) {
            const average = (r + g + b) / 3;
            const value =
              average >= options.threshold ? 255 : 0;

            r = value;
            g = value;
            b = value;
          }

          if (options.invert) {
            r = 255 - r;
            g = 255 - g;
            b = 255 - b;
          }

          data[i] = Math.min(255, Math.max(0, r));
          data[i + 1] = Math.min(255, Math.max(0, g));
          data[i + 2] = Math.min(255, Math.max(0, b));
        }

        ctx.putImageData(imageData, 0, 0);

        resolve({
          processedDataUrl: canvas.toDataURL('image/png'),
          width: canvas.width,
          height: canvas.height,
        });
      } catch (error) {
        reject(error);
      }
    };

    if (img.complete && img.naturalWidth !== 0) {
      process();
    } else {
      img.onload = process;
      img.onerror = () =>
        reject(new Error('Unable to load image'));
    }
  });
}

/**
 * Detect the document type from OCR text.
 *
 * This is classification only. It does not validate the
 * authenticity of a document.
 */
export function detectDocumentType(
  extractedText: string
): DocumentType | 'Unknown Document' {
  const upper = extractedText.toUpperCase();

  if (
    upper.includes('AADHAAR') ||
    upper.includes('UNIQUE IDENTIFICATION AUTHORITY') ||
    upper.includes('MERA AADHAAR') ||
    upper.includes('UIDAI')
  ) {
    return 'Aadhaar Card';
  }

  if (
    upper.includes('INCOME TAX') ||
    upper.includes('PERMANENT ACCOUNT NUMBER') ||
    (
      upper.includes('GOVT. OF INDIA') &&
      upper.includes('PAN')
    ) ||
    /[A-Z]{5}[0-9]{4}[A-Z]/.test(upper)
  ) {
    return 'PAN Card';
  }

  if (
    upper.includes('PASSPORT') ||
    upper.includes('REPUBLIC OF INDIA') ||
    upper.includes('TYPE P') ||
    upper.includes('PASSPORT NO')
  ) {
    return 'Passport';
  }

  if (
    upper.includes('DRIVING LICENCE') ||
    upper.includes('DRIVING LICENSE') ||
    upper.includes('DL NO') ||
    upper.includes('UNION OF INDIA DRIVING') ||
    upper.includes('MOTOR VEHICLES ACT')
  ) {
    return 'Driving License';
  }

  if (
    upper.includes('PRESCRIPTION') ||
    upper.includes('DOSAGE') ||
    upper.includes('PHARMACY') ||
    /\bRX\b/.test(upper)
  ) {
    return 'Prescription';
  }

  if (
    upper.includes('DIAGNOSIS') ||
    upper.includes('LABORATORY REPORT') ||
    upper.includes('BLOOD TEST') ||
    upper.includes('PATHOLOGY') ||
    upper.includes('PATIENT NAME')
  ) {
    return 'Medical Report';
  }

  if (
    upper.includes('INSURANCE') ||
    upper.includes('POLICY NUMBER') ||
    upper.includes('SUM INSURED') ||
    upper.includes('HEALTH INSURANCE')
  ) {
    return 'Insurance';
  }

  return 'Unknown Document';
}

export interface OCRResultData {
  text: string;
  detectedType: DocumentType | 'Unknown Document';
  wordCount: number;
  characterCount: number;
  confidence: number;
  durationMs: number;
}

/**
 * Normalize OCR text slightly before comparing results.
 */
function normalizeOcrText(text: string): string {
  return text
    .replace(/\r/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Decide whether an OCR result is reasonably useful.
 */
function calculateResultQuality(
  text: string,
  confidence: number
): number {
  const normalized = normalizeOcrText(text);

  if (!normalized) {
    return 0;
  }

  const words = normalized
    .split(/\s+/)
    .filter(Boolean);

  /*
   * Confidence is the main signal.
   * Text length and word count provide small additional signals.
   */
  const confidenceScore = Math.max(
    0,
    Math.min(100, confidence)
  );

  const textScore = Math.min(
    20,
    normalized.length / 20
  );

  const wordScore = Math.min(
    10,
    words.length / 5
  );

  return (
    confidenceScore * 0.7 +
    textScore * 0.2 +
    wordScore * 0.1
  );
}

/**
 * Runs Tesseract OCR.
 *
 * Important improvement:
 * 1. Try the original image first.
 * 2. If the result is weak, try a processed version.
 * 3. Return whichever result is better.
 *
 * This prevents the application from blindly applying
 * thresholding to every image.
 */
export async function runOcr(
  imageSource: string,
  onProgress?: (
    progress: number,
    status: string
  ) => void,
  processedImageSource?: string
): Promise<OCRResultData> {
  const startTime = Date.now();

  onProgress?.(
    0.05,
    'Initializing OCR engine...'
  );

  const worker = await createWorker('eng');

  try {
    /*
     * First attempt: original image.
     */
    onProgress?.(
      0.15,
      'Reading original image...'
    );

    const originalResult =
      await worker.recognize(imageSource);

    const originalText =
      normalizeOcrText(originalResult.data.text);

    const originalConfidence =
      Number(originalResult.data.confidence) || 0;

    const originalQuality =
      calculateResultQuality(
        originalText,
        originalConfidence
      );

    /*
     * If original OCR is already reasonably strong,
     * avoid another expensive OCR pass.
     */
    if (
      !processedImageSource ||
      (
        originalConfidence >= 70 &&
        originalText.length >= 15
      )
    ) {
      const durationMs =
        Date.now() - startTime;

      const words = originalText
        ? originalText
            .split(/\s+/)
            .filter(Boolean)
        : [];

      onProgress?.(
        1,
        'Extraction complete'
      );

      return {
        text: originalText,
        detectedType:
          detectDocumentType(originalText),
        wordCount: words.length,
        characterCount: originalText.length,
        confidence: originalConfidence,
        durationMs,
      };
    }

    /*
     * Second attempt: processed image.
     */
    onProgress?.(
      0.55,
      'Trying enhanced image processing...'
    );

    const processedResult =
      await worker.recognize(
        processedImageSource
      );

    const processedText =
      normalizeOcrText(
        processedResult.data.text
      );

    const processedConfidence =
      Number(
        processedResult.data.confidence
      ) || 0;

    const processedQuality =
      calculateResultQuality(
        processedText,
        processedConfidence
      );

    const useProcessed =
      processedQuality > originalQuality;

    const finalText = useProcessed
      ? processedText
      : originalText;

    const finalConfidence =
      useProcessed
        ? processedConfidence
        : originalConfidence;

    const durationMs =
      Date.now() - startTime;

    const words = finalText
      ? finalText
          .split(/\s+/)
          .filter(Boolean)
      : [];

    onProgress?.(
      1,
      'Extraction complete'
    );

    return {
      text: finalText,
      detectedType:
        detectDocumentType(finalText),
      wordCount: words.length,
      characterCount: finalText.length,
      confidence: finalConfidence,
      durationMs,
    };
  } finally {
    await worker.terminate();
  }
}