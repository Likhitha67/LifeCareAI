export type DocumentType =
  | 'Aadhaar Card'
  | 'PAN Card'
  | 'Passport'
  | 'Driving License'
  | 'Insurance'
  | 'Medical Report'
  | 'Prescription'
  | 'Resume'
  | 'Other';

export type DocumentStatus = 'Valid' | 'Expiring Soon' | 'Expired';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  profilePhoto?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentItem {
  id: string;
  userId: string;
  documentName: string;
  documentType: DocumentType;
  fileData?: string; // Base64 data URL for images or PDF preview/download
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadDate: string;
  expiryDate?: string;
  extractedText?: string;
  detectedType?: string;
  status: DocumentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type MedicineFrequency =
  | 'Once Daily'
  | 'Twice Daily'
  | 'Three Times Daily'
  | 'Weekly'
  | 'Custom';

export interface MedicineItem {
  id: string;
  userId: string;
  medicineName: string;
  dosage: string;
  frequency: MedicineFrequency;
  reminderTimes: string[]; // e.g. ["08:00", "20:00"]
  startDate: string;
  endDate?: string;
  instructions?: 'Before food' | 'After food' | 'With food' | 'Anytime';
  notes?: string;
  active: boolean;
  takenDates?: { [dateStr: string]: 'taken' | 'skipped' }; // e.g. "2026-10-05": "taken"
  createdAt: string;
  updatedAt: string;
}

export interface MedicineScanResult {
  id: string;
  userId: string;
  imagePreview: string;
  extractedText: string;
  detectedMedicineName?: string;
  detectedDosage?: string;
  confidenceScore?: number;
  timestamp: string;
  savedToMedicines?: boolean;
}

export interface OCRResultItem {
  id: string;
  userId: string;
  documentId?: string;
  imagePreview: string;
  processedImagePreview?: string;
  extractedText: string;
  detectedDocumentType: string;
  wordCount: number;
  characterCount: number;
  processingTimeMs: number;
  createdAt: string;
}

export type NotificationType = 'expiry' | 'medicine' | 'system';

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  referenceId?: string;
  read: boolean;
  createdAt: string;
}

export interface UserSettings {
  medicineReminders: boolean;
  expiryNotifications: boolean;
  emailAlerts: boolean;
  darkMode: boolean;
  soundAlerts: boolean;
  ocrAutoEnhance: boolean;
}
