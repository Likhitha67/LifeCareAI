import {
  DocumentItem,
  DocumentStatus,
  MedicineItem,
  MedicineScanResult,
  NotificationItem,
  OCRResultItem,
  UserSettings,
} from '../types';
import { deleteDocumentBlob, getDocumentBlob, saveDocumentBlob } from './storage';

// Helper to determine expiry status
export function calculateDocumentStatus(expiryDate?: string): DocumentStatus {
  if (!expiryDate) return 'Valid';
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const exp = new Date(expiryDate);
  exp.setHours(0, 0, 0, 0);

  const diffTime = exp.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return 'Expired';
  } else if (diffDays <= 30) {
    return 'Expiring Soon';
  } else {
    return 'Valid';
  }
}

export function getDaysUntilExpiry(expiryDate?: string): number | null {
  if (!expiryDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(expiryDate);
  exp.setHours(0, 0, 0, 0);
  const diffTime = exp.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Storage keys
const DOCS_KEY = 'lifecare_documents';
const MEDS_KEY = 'lifecare_medicines';
const SCANS_KEY = 'lifecare_scans';
const OCR_KEY = 'lifecare_ocr_results';
const NOTIFS_KEY = 'lifecare_notifications';
const SETTINGS_KEY = 'lifecare_settings';

function getStoredArray<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error(`Error reading ${key}:`, e);
    return [];
  }
}

function setStoredArray<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key}:`, e);
  }
}

/* =========================================================
   DOCUMENTS (Smart Document Vault)
   ========================================================= */

export async function getUserDocuments(userId: string): Promise<DocumentItem[]> {
  const all = getStoredArray<DocumentItem>(DOCS_KEY);
  const userDocs = all.filter((d) => d.userId === userId);
  // Recalculate status dynamically based on current date
  return userDocs.map((doc) => ({
    ...doc,
    status: calculateDocumentStatus(doc.expiryDate),
  }));
}

export async function getDocumentById(id: string, userId: string): Promise<DocumentItem | null> {
  const all = getStoredArray<DocumentItem>(DOCS_KEY);
  const found = all.find((d) => d.id === id && d.userId === userId);
  if (!found) return null;

  // Retrieve blob data if needed
  if (!found.fileData) {
    const blob = await getDocumentBlob(id);
    if (blob) found.fileData = blob;
  }
  return {
    ...found,
    status: calculateDocumentStatus(found.expiryDate),
  };
}

export async function saveDocument(
  userId: string,
  docData: Omit<DocumentItem, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'status'> & {
    id?: string;
  }
): Promise<DocumentItem> {
  const all = getStoredArray<DocumentItem>(DOCS_KEY);
  const now = new Date().toISOString();
  const id = docData.id || `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  // Store large binary payload in IndexedDB
  if (docData.fileData) {
    await saveDocumentBlob(id, userId, docData.fileData);
  }

  const status = calculateDocumentStatus(docData.expiryDate);

  const newDoc: DocumentItem = {
    ...docData,
    id,
    userId,
    status,
    fileData: docData.fileData ? docData.fileData.substring(0, 250) + '...' : undefined, // Keep thumbnail/metadata light in localStorage
    createdAt: now,
    updatedAt: now,
  };

  const existingIdx = all.findIndex((d) => d.id === id && d.userId === userId);
  if (existingIdx >= 0) {
    all[existingIdx] = { ...all[existingIdx], ...newDoc, updatedAt: now };
  } else {
    all.unshift(newDoc);
  }

  setStoredArray(DOCS_KEY, all);

  // Trigger notification check for this doc
  await checkAndGenerateExpiryNotifications(userId);

  return newDoc;
}

export async function deleteDocument(id: string, userId: string): Promise<boolean> {
  const all = getStoredArray<DocumentItem>(DOCS_KEY);
  const filtered = all.filter((d) => !(d.id === id && d.userId === userId));
  if (filtered.length === all.length) return false;

  setStoredArray(DOCS_KEY, filtered);
  await deleteDocumentBlob(id);
  return true;
}

/* =========================================================
   MEDICINES (Medicine Reminder)
   ========================================================= */

export async function getUserMedicines(userId: string): Promise<MedicineItem[]> {
  const all = getStoredArray<MedicineItem>(MEDS_KEY);
  return all.filter((m) => m.userId === userId);
}

export async function saveMedicine(
  userId: string,
  medicineData: Omit<MedicineItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'> & {
    id?: string;
  }
): Promise<MedicineItem> {
  const all = getStoredArray<MedicineItem>(MEDS_KEY);
  const now = new Date().toISOString();
  const id =
    medicineData.id || `med_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const newMed: MedicineItem = {
    ...medicineData,
    id,
    userId,
    createdAt: now,
    updatedAt: now,
  };

  const existingIdx = all.findIndex((m) => m.id === id && m.userId === userId);
  if (existingIdx >= 0) {
    all[existingIdx] = { ...all[existingIdx], ...newMed, updatedAt: now };
  } else {
    all.unshift(newMed);
  }

  setStoredArray(MEDS_KEY, all);
  return newMed;
}

export async function deleteMedicine(id: string, userId: string): Promise<boolean> {
  const all = getStoredArray<MedicineItem>(MEDS_KEY);
  const filtered = all.filter((m) => !(m.id === id && m.userId === userId));
  if (filtered.length === all.length) return false;

  setStoredArray(MEDS_KEY, filtered);
  return true;
}

export async function toggleMedicineTaken(
  id: string,
  userId: string,
  dateStr: string,
  status: 'taken' | 'skipped'
): Promise<MedicineItem | null> {
  const all = getStoredArray<MedicineItem>(MEDS_KEY);
  const idx = all.findIndex((m) => m.id === id && m.userId === userId);
  if (idx < 0) return null;

  const med = all[idx];
  const takenDates = { ...(med.takenDates || {}) };
  if (takenDates[dateStr] === status) {
    delete takenDates[dateStr];
  } else {
    takenDates[dateStr] = status;
  }

  all[idx] = {
    ...med,
    takenDates,
    updatedAt: new Date().toISOString(),
  };

  setStoredArray(MEDS_KEY, all);
  return all[idx];
}

export function isMedicineDueToday(med: MedicineItem): boolean {
  if (!med.active) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(med.startDate);
  start.setHours(0, 0, 0, 0);

  if (today < start) return false;

  if (med.endDate) {
    const end = new Date(med.endDate);
    end.setHours(23, 59, 59, 999);
    if (today > end) return false;
  }

  if (med.frequency === 'Weekly') {
    // Due on same day of week as startDate
    return today.getDay() === start.getDay();
  }

  return true;
}

/* =========================================================
   MEDICINE SCANS & OCR RESULTS
   ========================================================= */

export async function getUserMedicineScans(userId: string): Promise<MedicineScanResult[]> {
  const all = getStoredArray<MedicineScanResult>(SCANS_KEY);
  return all.filter((s) => s.userId === userId);
}

export async function saveMedicineScan(
  userId: string,
  scan: Omit<MedicineScanResult, 'id' | 'userId' | 'timestamp'>
): Promise<MedicineScanResult> {
  const all = getStoredArray<MedicineScanResult>(SCANS_KEY);
  const newScan: MedicineScanResult = {
    ...scan,
    id: `scan_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId,
    timestamp: new Date().toISOString(),
  };
  all.unshift(newScan);
  setStoredArray(SCANS_KEY, all);
  return newScan;
}

export async function getUserOCRResults(userId: string): Promise<OCRResultItem[]> {
  const all = getStoredArray<OCRResultItem>(OCR_KEY);
  return all.filter((o) => o.userId === userId);
}

export async function saveOCRResult(
  userId: string,
  ocr: Omit<OCRResultItem, 'id' | 'userId' | 'createdAt'>
): Promise<OCRResultItem> {
  const all = getStoredArray<OCRResultItem>(OCR_KEY);
  const newOCR: OCRResultItem = {
    ...ocr,
    id: `ocr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId,
    createdAt: new Date().toISOString(),
  };
  all.unshift(newOCR);
  setStoredArray(OCR_KEY, all);
  return newOCR;
}

/* =========================================================
   NOTIFICATIONS
   ========================================================= */

export async function getUserNotifications(userId: string): Promise<NotificationItem[]> {
  await checkAndGenerateExpiryNotifications(userId);
  await checkAndGenerateMedicineNotifications(userId);
  const all = getStoredArray<NotificationItem>(NOTIFS_KEY);
  return all.filter((n) => n.userId === userId);
}

export async function markNotificationAsRead(id: string, userId: string): Promise<void> {
  const all = getStoredArray<NotificationItem>(NOTIFS_KEY);
  const idx = all.findIndex((n) => n.id === id && n.userId === userId);
  if (idx >= 0) {
    all[idx].read = true;
    setStoredArray(NOTIFS_KEY, all);
  }
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  const all = getStoredArray<NotificationItem>(NOTIFS_KEY);
  const updated = all.map((n) => (n.userId === userId ? { ...n, read: true } : n));
  setStoredArray(NOTIFS_KEY, updated);
}

export async function clearAllNotifications(userId: string): Promise<void> {
  const all = getStoredArray<NotificationItem>(NOTIFS_KEY);
  const filtered = all.filter((n) => n.userId !== userId);
  setStoredArray(NOTIFS_KEY, filtered);
}

async function checkAndGenerateExpiryNotifications(userId: string): Promise<void> {
  const docs = await getUserDocuments(userId);
  const notifs = getStoredArray<NotificationItem>(NOTIFS_KEY);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const doc of docs) {
    if (!doc.expiryDate) continue;
    const days = getDaysUntilExpiry(doc.expiryDate);
    if (days === null) continue;

    let title = '';
    let message = '';

    if (days < 0) {
      title = 'Document Expired';
      message = `Your ${doc.documentName} (${doc.documentType}) expired ${Math.abs(days)} day${Math.abs(days) > 1 ? 's' : ''} ago. Please renew it promptly.`;
    } else if (days <= 30) {
      title = 'Document Expiring Soon';
      message = `Your ${doc.documentName} (${doc.documentType}) expires in ${days} day${days > 1 ? 's' : ''}.`;
    }

    if (title) {
      const exists = notifs.some(
        (n) => n.userId === userId && n.referenceId === doc.id && n.title === title
      );
      if (!exists) {
        notifs.unshift({
          id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          userId,
          title,
          message,
          type: 'expiry',
          referenceId: doc.id,
          read: false,
          createdAt: new Date().toISOString(),
        });
      }
    }
  }

  setStoredArray(NOTIFS_KEY, notifs);
}

async function checkAndGenerateMedicineNotifications(userId: string): Promise<void> {
  const meds = await getUserMedicines(userId);
  const notifs = getStoredArray<NotificationItem>(NOTIFS_KEY);
  const todayStr = new Date().toISOString().split('T')[0];

  for (const med of meds) {
    if (isMedicineDueToday(med)) {
      const isTaken = med.takenDates && med.takenDates[todayStr] === 'taken';
      if (!isTaken) {
        const timeStr = med.reminderTimes && med.reminderTimes[0] ? med.reminderTimes[0] : 'scheduled time';
        const exists = notifs.some(
          (n) =>
            n.userId === userId &&
            n.referenceId === med.id &&
            n.createdAt.startsWith(todayStr)
        );
        if (!exists) {
          notifs.unshift({
            id: `notif_med_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            userId,
            title: 'Medicine Due Today',
            message: `💊 ${med.medicineName} (${med.dosage}) is due today at ${timeStr}.`,
            type: 'medicine',
            referenceId: med.id,
            read: false,
            createdAt: new Date().toISOString(),
          });
        }
      }
    }
  }

  setStoredArray(NOTIFS_KEY, notifs);
}

/* =========================================================
   USER SETTINGS
   ========================================================= */

const DEFAULT_SETTINGS: UserSettings = {
  medicineReminders: true,
  expiryNotifications: true,
  emailAlerts: true,
  darkMode: false,
  soundAlerts: true,
  ocrAutoEnhance: true,
};

export function getUserSettings(userId: string): UserSettings {
  try {
    const raw = localStorage.getItem(`${SETTINGS_KEY}_${userId}`);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveUserSettings(userId: string, settings: Partial<UserSettings>): UserSettings {
  const current = getUserSettings(userId);
  const updated = { ...current, ...settings };
  localStorage.setItem(`${SETTINGS_KEY}_${userId}`, JSON.stringify(updated));
  return updated;
}

/* =========================================================
   DASHBOARD STATS
   ========================================================= */

export interface DashboardStats {
  documentsCount: number;
  medicinesCount: number;
  dueTodayCount: number;
  scansCount: number;
  validDocsCount: number;
  expiringDocsCount: number;
  expiredDocsCount: number;
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const docs = await getUserDocuments(userId);
  const meds = await getUserMedicines(userId);
  const scans = await getUserMedicineScans(userId);
  const ocrResults = await getUserOCRResults(userId);

  const dueToday = meds.filter((m) => isMedicineDueToday(m));

  let valid = 0;
  let expiring = 0;
  let expired = 0;

  for (const doc of docs) {
    if (doc.status === 'Valid') valid++;
    else if (doc.status === 'Expiring Soon') expiring++;
    else if (doc.status === 'Expired') expired++;
  }

  return {
    documentsCount: docs.length,
    medicinesCount: meds.length,
    dueTodayCount: dueToday.length,
    scansCount: scans.length + ocrResults.length,
    validDocsCount: valid,
    expiringDocsCount: expiring,
    expiredDocsCount: expired,
  };
}

/* =========================================================
   DEMO SEEDING FOR NEW / DEFAULT USERS
   ========================================================= */

export async function seedInitialUserData(userId: string, userName = 'Likhitha Konda'): Promise<void> {
  const existingDocs = await getUserDocuments(userId);
  if (existingDocs.length > 0) return; // Already initialized

  // Seed sample documents with realistic expiry dates
  const today = new Date();
  
  // 1. Passport expiring in 18 days (demonstrates "Expiring Soon")
  const passportExp = new Date(today);
  passportExp.setDate(passportExp.getDate() + 18);

  // 2. Health Insurance expiring in 120 days (demonstrates "Valid")
  const insuranceExp = new Date(today);
  insuranceExp.setDate(insuranceExp.getDate() + 120);

  // 3. Driving License expired 10 days ago (demonstrates "Expired")
  const dlExp = new Date(today);
  dlExp.setDate(dlExp.getDate() - 10);

  // 4. Aadhaar Card (No expiry / Valid)
  const aadhaarExp = new Date(today);
  aadhaarExp.setFullYear(aadhaarExp.getFullYear() + 10);

  await saveDocument(userId, {
    documentName: 'Government Passport',
    documentType: 'Passport',
    fileName: 'passport_likhitha.pdf',
    fileType: 'application/pdf',
    fileSize: 1024 * 720,
    uploadDate: new Date(Date.now() - 86400000 * 5).toISOString(),
    expiryDate: passportExp.toISOString().split('T')[0],
    extractedText: 'REPUBLIC OF INDIA PASSPORT TYPE P COUNTRY CODE IND PASSPORT NO Z9843210 NAME LIKHITHA KONDA NATIONALITY INDIAN DATE OF EXPIRY ' + passportExp.toISOString().split('T')[0],
    detectedType: 'Passport',
    notes: 'Personal international travel document',
  });

  await saveDocument(userId, {
    documentName: 'Aadhaar Identification Card',
    documentType: 'Aadhaar Card',
    fileName: 'aadhaar_card.png',
    fileType: 'image/png',
    fileSize: 1024 * 450,
    uploadDate: new Date(Date.now() - 86400000 * 12).toISOString(),
    expiryDate: aadhaarExp.toISOString().split('T')[0],
    extractedText: 'GOVERNMENT OF INDIA UNIQUE IDENTIFICATION AUTHORITY OF INDIA AADHAAR CARD 9876 5432 1098 LIKHITHA KONDA DOB: 12/08/1995 FEMALE',
    detectedType: 'Aadhaar Card',
    notes: 'National identity verification',
  });

  await saveDocument(userId, {
    documentName: 'Star Health Family Insurance',
    documentType: 'Insurance',
    fileName: 'health_insurance_policy.pdf',
    fileType: 'application/pdf',
    fileSize: 1024 * 1200,
    uploadDate: new Date(Date.now() - 86400000 * 20).toISOString(),
    expiryDate: insuranceExp.toISOString().split('T')[0],
    extractedText: 'STAR HEALTH AND ALLIED INSURANCE CO POLICY NUMBER POL-99201948 SUM INSURED: INR 1,000,000 PRIMARY INSURED: LIKHITHA KONDA VALID THRU: ' + insuranceExp.toISOString().split('T')[0],
    detectedType: 'Insurance',
    notes: 'Cashless hospitalization coverage',
  });

  await saveDocument(userId, {
    documentName: 'Motor Vehicle Driving License',
    documentType: 'Driving License',
    fileName: 'driving_license.jpg',
    fileType: 'image/jpeg',
    fileSize: 1024 * 380,
    uploadDate: new Date(Date.now() - 86400000 * 45).toISOString(),
    expiryDate: dlExp.toISOString().split('T')[0],
    extractedText: 'UNION OF INDIA DRIVING LICENSE DL NO TS09-20180049210 AUTHORISED TO DRIVE LMV MOTOR CAB HOLDER LIKHITHA KONDA EXPIRED ON: ' + dlExp.toISOString().split('T')[0],
    detectedType: 'Driving License',
    notes: 'Renewal appointment needed at RTO',
  });

  // Seed sample medicines
  await saveMedicine(userId, {
    medicineName: 'Paracetamol',
    dosage: '500 mg',
    frequency: 'Twice Daily',
    reminderTimes: ['08:30 AM', '08:30 PM'],
    startDate: today.toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    instructions: 'After food',
    notes: 'Take with warm water if mild fever persists.',
    active: true,
  });

  await saveMedicine(userId, {
    medicineName: 'Vitamin D3 & Calcium',
    dosage: '60,000 IU',
    frequency: 'Weekly',
    reminderTimes: ['10:00 AM'],
    startDate: today.toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000 * 60).toISOString().split('T')[0],
    instructions: 'With food',
    notes: 'Weekly Sunday supplement.',
    active: true,
  });

  await saveMedicine(userId, {
    medicineName: 'Cetirizine Hydrochloride',
    dosage: '10 mg',
    frequency: 'Once Daily',
    reminderTimes: ['09:30 PM'],
    startDate: today.toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    instructions: 'Before food',
    notes: 'For seasonal dust allergies.',
    active: true,
  });

  // Generate initial notifications
  await checkAndGenerateExpiryNotifications(userId);
  await checkAndGenerateMedicineNotifications(userId);
}
