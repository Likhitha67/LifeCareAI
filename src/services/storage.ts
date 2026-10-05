/**
 * IndexedDB persistence layer for LifeCare AI
 * Handles large binary attachments (PDFs, images) safely in browser storage.
 */

const DB_NAME = 'LifeCareAI_DB';
const DB_VERSION = 1;
const STORE_NAME = 'documents_blob_store';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveDocumentBlob(id: string, userId: string, dataUrl: string): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const record = { id, userId, dataUrl, updatedAt: new Date().toISOString() };
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Fallback to local storage due to IndexedDB issue:', err);
    try {
      localStorage.setItem(`doc_blob_${id}`, dataUrl);
    } catch (e) {
      console.error('Storage limit reached:', e);
    }
  }
}

export async function getDocumentBlob(id: string): Promise<string | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => {
        if (req.result && req.result.dataUrl) {
          resolve(req.result.dataUrl);
        } else {
          // Check localStorage fallback
          const fallback = localStorage.getItem(`doc_blob_${id}`);
          resolve(fallback || null);
        }
      };
      req.onerror = () => {
        const fallback = localStorage.getItem(`doc_blob_${id}`);
        resolve(fallback || null);
      };
    });
  } catch {
    const fallback = localStorage.getItem(`doc_blob_${id}`);
    return fallback || null;
  }
}

export async function deleteDocumentBlob(id: string): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => {
        localStorage.removeItem(`doc_blob_${id}`);
        resolve();
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    localStorage.removeItem(`doc_blob_${id}`);
  }
}
