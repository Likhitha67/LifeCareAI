/**
 * LifeCare AI Medicine Strip Scanner
 *
 * This module performs text-based candidate identification from OCR output.
 *
 * IMPORTANT:
 * This is NOT a medical diagnosis or prescribing system.
 * Results are possible text matches and must be verified against
 * the physical medicine packaging or by a qualified pharmacist.
 */

interface MedicineEntry {
  genericName: string;
  aliases: string[];
}

const MEDICINE_DATABASE: MedicineEntry[] = [
  {
    genericName: 'Paracetamol',
    aliases: [
      'paracetamol',
      'acetaminophen',
      'dolo',
      'crocin',
      'calpol',
    ],
  },
  {
    genericName: 'Amoxicillin',
    aliases: ['amoxicillin', 'mox', 'novamox'],
  },
  {
    genericName: 'Ibuprofen',
    aliases: ['ibuprofen', 'brufen'],
  },
  {
    genericName: 'Cetirizine',
    aliases: ['cetirizine', 'cetirizine hydrochloride', 'cetirizine hcl'],
  },
  {
    genericName: 'Metformin',
    aliases: ['metformin', 'glycomet', 'glucophage'],
  },
  {
    genericName: 'Atorvastatin',
    aliases: ['atorvastatin', 'atorva', 'lipitor'],
  },
  {
    genericName: 'Omeprazole',
    aliases: ['omeprazole', 'omez'],
  },
  {
    genericName: 'Pantoprazole',
    aliases: ['pantoprazole', 'pantop', 'pantocid'],
  },
  {
    genericName: 'Azithromycin',
    aliases: ['azithromycin', 'azithral', 'azee'],
  },
  {
    genericName: 'Ciprofloxacin',
    aliases: ['ciprofloxacin', 'ciplox'],
  },
  {
    genericName: 'Levothyroxine',
    aliases: ['levothyroxine', 'thyroxine', 'thyronorm'],
  },
  {
    genericName: 'Amlodipine',
    aliases: ['amlodipine', 'amlodac', 'amlong'],
  },
  {
    genericName: 'Losartan',
    aliases: ['losartan', 'losar'],
  },
  {
    genericName: 'Diclofenac',
    aliases: ['diclofenac', 'voveran'],
  },
  {
    genericName: 'Montelukast',
    aliases: ['montelukast', 'montair'],
  },
  {
    genericName: 'Aspirin',
    aliases: ['aspirin', 'ecosprin'],
  },
  {
    genericName: 'Telmisartan',
    aliases: ['telmisartan', 'telmikind', 'telma'],
  },
  {
    genericName: 'Rabeprazole',
    aliases: ['rabeprazole', 'rablet', 'rabicip'],
  },
  {
    genericName: 'Vitamin C',
    aliases: ['vitamin c', 'ascorbic acid', 'limcee'],
  },
  {
    genericName: 'Vitamin D3',
    aliases: [
      'vitamin d3',
      'cholecalciferol',
      'vitamin d',
      'd3',
    ],
  },
  {
    genericName: 'Calcium Carbonate',
    aliases: [
      'calcium carbonate',
      'calcium',
    ],
  },
  {
    genericName: 'Zincovit',
    aliases: ['zincovit'],
  },
  {
    genericName: 'Becosules',
    aliases: ['becosules'],
  },
  {
    genericName: 'Combiflam',
    aliases: ['combiflam'],
  },
  {
    genericName: 'Augmentin',
    aliases: ['augmentin'],
  },
];

export interface DetectedMedicineInfo {
  medicineName?: string;
  dosage?: string;
  confidenceScore: number;
  extractedRawText: string;
  disclaimer: string;
  isConfident: boolean;
}

/**
 * Normalize OCR text for comparison.
 *
 * Example:
 * TELMIKIND-40 -> TELMIKIND 40
 * Telmikind®40 -> TELMIKIND 40
 */
function normalizeText(text: string): string {
  return text
    .toUpperCase()
    .replace(/[®™©]/g, '')
    .replace(/[^A-Z0-9.]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Create a compact version of text.
 *
 * This helps with OCR cases where:
 * TELMIKIND-40
 * TELMIKIND 40
 * TELMIKIND40
 *
 * become slightly different strings.
 */
function compactText(text: string): string {
  return text.replace(/[^A-Z0-9]/gi, '').toUpperCase();
}

/**
 * Escape text before creating a RegExp.
 */
function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Find a medicine name from OCR text.
 */
function findMedicine(
  cleanedText: string
): {
  name?: string;
  score: number;
} {
  const normalized = normalizeText(cleanedText);
  const compact = compactText(cleanedText);

  let bestName: string | undefined;
  let bestScore = 0;

  for (const medicine of MEDICINE_DATABASE) {
    for (const alias of medicine.aliases) {
      const normalizedAlias = normalizeText(alias);
      const compactAlias = compactText(alias);

      if (!normalizedAlias || !compactAlias) {
        continue;
      }

      /*
       * Exact word/phrase match.
       */
      const exactRegex = new RegExp(
        `\\b${escapeRegex(normalizedAlias)}\\b`,
        'i'
      );

      if (exactRegex.test(normalized)) {
        if (55 > bestScore) {
          bestName = medicine.genericName;
          bestScore = 55;
        }

        continue;
      }

      /*
       * Compact match.
       *
       * Useful for:
       * TELMIKIND40
       * TELMIKIND-40
       * TELMIKIND 40
       */
      if (
        compactAlias.length >= 5 &&
        compact.includes(compactAlias)
      ) {
        if (50 > bestScore) {
          bestName = medicine.genericName;
          bestScore = 50;
        }
      }
    }
  }

  return {
    name: bestName,
    score: bestScore,
  };
}

/**
 * Extract a likely dosage/strength from OCR text.
 *
 * Examples:
 * 500 mg
 * 650mg
 * 60,000 IU
 * 0.5 mg
 * 1 g
 * 5 ml
 */
function extractDosage(
  text: string
): string | undefined {
  const dosagePatterns = [
    /\b(\d+(?:,\d{3})*(?:\.\d+)?)\s*(mg|mcg|g|iu|ml)\b/i,

    /\b(\d+(?:\.\d+)?)\s*(milligram|milligrams|microgram|micrograms|gram|grams)\b/i,

    /\b(\d+(?:\.\d+)?)\s*(tablets?|capsules?)\b/i,
  ];

  for (const pattern of dosagePatterns) {
    const match = text.match(pattern);

    if (match) {
      const value = match[1].replace(/,/g, '');

      let unit = match[2].toLowerCase();

      const unitMap: Record<string, string> = {
        milligram: 'mg',
        milligrams: 'mg',
        microgram: 'mcg',
        micrograms: 'mcg',
        gram: 'g',
        grams: 'g',
        tablet: 'tablet',
        tablets: 'tablets',
        capsule: 'capsule',
        capsules: 'capsules',
      };

      unit = unitMap[unit] || unit;

      return `${value} ${unit}`;
    }
  }

  return undefined;
}

/**
 * Find a possible medicine name from common OCR structure.
 *
 * Example:
 * "Paracetamol Tablets IP"
 * "Pantoprazole Tablets"
 * "Amoxicillin Capsules"
 */
function findGenericMedicinePattern(
  text: string
): {
  name?: string;
  score: number;
} {
  const patterns = [
    /\b([A-Za-z][A-Za-z0-9-]{3,30})\s+(?:TABLETS?|CAPSULES?|SYRUP|SUSPENSION|INJECTION)\b/i,

    /\b([A-Za-z][A-Za-z0-9-]{3,30})\s+(?:IP|BP|USP)\b/i,
  ];

  const ignoredWords = new Set([
    'EACH',
    'FILM',
    'COATED',
    'STORE',
    'KEEP',
    'BATCH',
    'EXPIRY',
    'EXP',
    'MFG',
    'MANUFACTURED',
    'MARKETED',
    'TABLETS',
    'CAPSULES',
  ]);

  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match?.[1]) {
      const candidate = match[1].trim();

      if (
        candidate.length >= 4 &&
        !ignoredWords.has(candidate.toUpperCase())
      ) {
        return {
          name: candidate,
          score: 25,
        };
      }
    }
  }

  return {
    score: 0,
  };
}

/**
 * Parse OCR output and produce a possible medicine match.
 */
export function parseMedicineStripText(
  rawText: string
): DetectedMedicineInfo {
  const cleanedText = rawText
    .replace(/\r?\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanedText) {
    return {
      confidenceScore: 0,
      extractedRawText: rawText,
      disclaimer:
        'No readable medicine text was detected. Please use a clear, well-lit image of the medicine packaging.',
      isConfident: false,
    };
  }

  const knownMedicine = findMedicine(cleanedText);

  let medicineName = knownMedicine.name;
  let score = knownMedicine.score;

  /*
   * If the known medicine database did not find a match,
   * try the structural OCR pattern.
   */
  if (!medicineName) {
    const patternMatch =
      findGenericMedicinePattern(cleanedText);

    if (patternMatch.name) {
      medicineName = patternMatch.name;
      score = patternMatch.score;
    }
  }

  const dosage = extractDosage(cleanedText);

  if (dosage) {
    score += 25;
  }

  /*
   * Cap score at 100.
   */
  const confidenceScore = Math.min(
    100,
    Math.round(score)
  );

  /*
   * We consider a result "confident" only when the
   * medicine name itself has a strong known match.
   *
   * Dosage alone is never enough.
   */
  const isConfident =
    !!knownMedicine.name &&
    knownMedicine.score >= 50;

  let disclaimer: string;

  if (!medicineName) {
    disclaimer =
      'Unable to confidently identify a medicine from the OCR text. Please verify the medicine name directly from the packaging or ask a qualified pharmacist.';
  } else if (isConfident) {
    disclaimer =
      'Possible medicine match detected from the package text. Please verify the medicine name and dosage directly on the physical packaging or with a qualified pharmacist before taking it.';
  } else {
    disclaimer =
      'A possible medicine name was extracted from the package text, but the match is uncertain. Please verify the medicine name and dosage directly on the physical packaging or with a qualified pharmacist.';
  }

  return {
    medicineName,
    dosage,
    confidenceScore,
    extractedRawText: rawText,
    disclaimer,
    isConfident,
  };
}