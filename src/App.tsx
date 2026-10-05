import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider, useNotifications } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import { Sidebar, NavigationTab } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { LoadingSpinner } from './components/common/LoadingSpinner';

// Pages
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { OcrPage } from './pages/OcrPage';
import { ExpiryPage } from './pages/ExpiryPage';
import { MedicinesPage } from './pages/MedicinesPage';
import { ScannerPage } from './pages/ScannerPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';

// Auth Components
import { LoginForm } from './components/auth/LoginForm';
import { SignupForm } from './components/auth/SignupForm';
import { ForgotPasswordModal } from './components/auth/ForgotPasswordModal';

// Modals
import { DocumentUploadModal } from './components/documents/DocumentUploadModal';
import { DocumentDetailsModal } from './components/documents/DocumentDetailsModal';
import { MedicineModal } from './components/medicines/MedicineModal';
import { AIAssistantModal } from './components/assistant/AIAssistantModal';

// Services
import {
  deleteDocument,
  getDashboardStats,
  getUserDocuments,
  getUserMedicines,
  getUserMedicineScans,
  saveDocument,
  saveMedicine,
  deleteMedicine,
  toggleMedicineTaken,
  saveMedicineScan,
  saveOCRResult,
  DashboardStats,
} from './services/dbService';
import { DocumentItem, MedicineItem, MedicineScanResult } from './types';
import { getDocumentBlob } from './services/storage';

type PublicView = 'landing' | 'login' | 'signup';

const AuthenticatedApp: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { refreshNotifications } = useNotifications();

  // Navigation tab
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  // Data State
  const [stats, setStats] = useState<DashboardStats>({
    documentsCount: 0,
    medicinesCount: 0,
    dueTodayCount: 0,
    scansCount: 0,
    validDocsCount: 0,
    expiringDocsCount: 0,
    expiredDocsCount: 0,
  });
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [medicines, setMedicines] = useState<MedicineItem[]>([]);
  const [scans, setScans] = useState<MedicineScanResult[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Modals
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [ocrPreselectedDoc, setOcrPreselectedDoc] = useState<DocumentItem | null>(null);
  const [medicineModalOpen, setMedicineModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<MedicineItem | null>(null);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [aiAssistantContext, setAiAssistantContext] = useState<string>('');

  // Fetch user-isolated data
  const loadUserData = useCallback(async () => {
    if (!user) return;
    try {
      setDataLoading(true);
      const [userDocs, userMeds, userScans, userStats] = await Promise.all([
        getUserDocuments(user.id),
        getUserMedicines(user.id),
        getUserMedicineScans(user.id),
        getDashboardStats(user.id),
      ]);
      setDocuments(userDocs);
      setMedicines(userMeds);
      setScans(userScans);
      setStats(userStats);
      await refreshNotifications();
    } catch (e) {
      console.error('Failed to load user data:', e);
    } finally {
      setDataLoading(false);
    }
  }, [user, refreshNotifications]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Handle Document Upload
  const handleUploadDocument = async (data: any) => {
    if (!user) return;
    await saveDocument(user.id, data);
    await loadUserData();
  };

  // Handle Document Delete
  const handleDeleteDocument = async (id: string) => {
    if (!user) return;
    await deleteDocument(id, user.id);
    await loadUserData();
  };

  // Handle Document Download
  const handleDownloadDocument = async (doc: DocumentItem) => {
    try {
      let dataUrl = doc.fileData;
      if (!dataUrl || !dataUrl.startsWith('data:')) {
        const fullBlob = await getDocumentBlob(doc.id);
        if (fullBlob) dataUrl = fullBlob;
      }

      if (dataUrl && dataUrl.startsWith('data:')) {
        const link = window.document.createElement('a');
        link.href = dataUrl;
        link.download = doc.fileName || `${doc.documentName}.${doc.fileType.split('/')[1] || 'pdf'}`;
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
      } else {
        // Fallback text receipt if file isn't binary
        const blob = new Blob(
          [
            `LIFECARE AI - DOCUMENT RECORD\n\nDocument Name: ${doc.documentName}\nType: ${doc.documentType}\nUploaded: ${doc.uploadDate}\nExpiry: ${doc.expiryDate || 'Permanent'}\nStatus: ${doc.status}\n\n[EXTRACTED OCR TEXT]:\n${doc.extractedText || 'No OCR extracted yet.'}`,
          ],
          { type: 'text/plain;charset=utf-8' }
        );
        const url = URL.createObjectURL(blob);
        const link = window.document.createElement('a');
        link.href = url;
        link.download = `${doc.documentName}_LifeCare.txt`;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  // Handle Run OCR on specific document
  const handleRunOcrOnDoc = async (doc: DocumentItem) => {
    let fullDoc = doc;
    if (!fullDoc.fileData || !fullDoc.fileData.startsWith('data:')) {
      const blob = await getDocumentBlob(doc.id);
      if (blob) fullDoc = { ...doc, fileData: blob };
    }
    setOcrPreselectedDoc(fullDoc);
    setCurrentTab('ocr');
  };

  // Handle Medicine Save
  const handleSaveMedicine = async (medData: any) => {
    if (!user) return;
    await saveMedicine(user.id, medData);
    await loadUserData();
    setEditingMedicine(null);
  };

  // Handle Medicine Delete
  const handleDeleteMedicine = async (id: string) => {
    if (!user) return;
    await deleteMedicine(id, user.id);
    await loadUserData();
  };

  // Handle Medicine Taken/Skipped Toggle
  const handleToggleMedStatus = async (id: string, status: 'taken' | 'skipped') => {
    if (!user) return;
    const todayStr = new Date().toISOString().split('T')[0];
    await toggleMedicineTaken(id, user.id, todayStr, status);
    await loadUserData();
  };

  // Handle Medicine Scan Logging
  const handleLogScan = async (scanData: any) => {
    if (!user) return;
    await saveMedicineScan(user.id, scanData);
    await loadUserData();
  };

  // Handle OCR Result Saving
  const handleSaveOcrResult = async (ocrData: any) => {
    if (!user) return;
    await saveOCRResult(user.id, ocrData);
    await loadUserData();
  };

  // Open AI Assistant with custom context
  const handleOpenAssistantWithText = (text: string) => {
    setAiAssistantContext(text);
    setAiAssistantOpen(true);
  };

  if (authLoading || (dataLoading && documents.length === 0)) {
    return <LoadingSpinner fullScreen message="Loading your LifeCare AI vault..." />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        onOpenAssistant={() => {
          setAiAssistantContext('');
          setAiAssistantOpen(true);
        }}
      />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <Header
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onNavigate={setCurrentTab}
          onOpenUpload={() => setUploadModalOpen(true)}
          onOpenAddMed={() => {
            setEditingMedicine(null);
            setMedicineModalOpen(true);
          }}
          onOpenAssistant={() => {
            setAiAssistantContext('');
            setAiAssistantOpen(true);
          }}
          searchQuery={globalSearch}
          onSearchChange={setGlobalSearch}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardPage
              stats={stats}
              documents={documents}
              medicines={medicines}
              onNavigate={setCurrentTab}
              onOpenUpload={() => setUploadModalOpen(true)}
              onOpenAddMed={() => {
                setEditingMedicine(null);
                setMedicineModalOpen(true);
              }}
              onSelectDoc={setSelectedDoc}
              onDownloadDoc={handleDownloadDocument}
              onToggleMedStatus={handleToggleMedStatus}
              onOpenAssistant={() => {
                setAiAssistantContext('');
                setAiAssistantOpen(true);
              }}
            />
          )}

          {currentTab === 'documents' && (
            <DocumentsPage
              documents={documents}
              onOpenUpload={() => setUploadModalOpen(true)}
              onSelectDoc={setSelectedDoc}
              onDownloadDoc={handleDownloadDocument}
              onDeleteDoc={handleDeleteDocument}
              onRunOcr={handleRunOcrOnDoc}
            />
          )}

          {currentTab === 'ocr' && (
            <OcrPage
              documents={documents}
              preselectedDoc={ocrPreselectedDoc}
              onSaveOcrResult={handleSaveOcrResult}
              onAskAI={handleOpenAssistantWithText}
            />
          )}

          {currentTab === 'expiry' && (
            <ExpiryPage
              documents={documents}
              onSelectDoc={setSelectedDoc}
            />
          )}

          {currentTab === 'medicines' && (
            <MedicinesPage
              medicines={medicines}
              onOpenAddMed={() => {
                setEditingMedicine(null);
                setMedicineModalOpen(true);
              }}
              onEditMed={(med) => {
                setEditingMedicine(med);
                setMedicineModalOpen(true);
              }}
              onDeleteMed={handleDeleteMedicine}
              onToggleStatus={handleToggleMedStatus}
            />
          )}

          {currentTab === 'scanner' && (
            <ScannerPage
              scans={scans}
              onSaveToMedicines={handleSaveMedicine}
              onLogScan={handleLogScan}
            />
          )}

          {currentTab === 'profile' && <ProfilePage />}

          {currentTab === 'settings' && <SettingsPage />}
        </main>

        {/* Global Footer */}
        <Footer />
      </div>

      {/* Global Modals */}
      <DocumentUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUpload={handleUploadDocument}
      />

      <DocumentDetailsModal
        isOpen={!!selectedDoc}
        document={selectedDoc}
        onClose={() => setSelectedDoc(null)}
        onDelete={handleDeleteDocument}
        onDownload={handleDownloadDocument}
        onRunOcr={handleRunOcrOnDoc}
        onAskAI={handleOpenAssistantWithText}
      />

      <MedicineModal
        isOpen={medicineModalOpen}
        onClose={() => {
          setMedicineModalOpen(false);
          setEditingMedicine(null);
        }}
        onSave={handleSaveMedicine}
        initialData={editingMedicine}
      />

      <AIAssistantModal
        isOpen={aiAssistantOpen}
        onClose={() => setAiAssistantOpen(false)}
        initialContextText={aiAssistantContext}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  const { user, loading } = useAuth();
  const [publicView, setPublicView] = useState<PublicView>('landing');
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  // Splash Screen while restoring session (Section 6)
  if (loading) {
    return <LoadingSpinner fullScreen message="Initializing LifeCare AI..." />;
  }

  // If user is authenticated, route to Authenticated App
  if (user) {
    return (
      <NotificationProvider>
        <AuthenticatedApp />
      </NotificationProvider>
    );
  }

  // Public views: Landing, Login, Signup
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {publicView === 'landing' && (
        <LandingPage
          onNavigateLogin={() => setPublicView('login')}
          onNavigateSignup={() => setPublicView('signup')}
        />
      )}

      {publicView === 'login' && (
        <LoginForm
          onNavigateSignup={() => setPublicView('signup')}
          onNavigateForgotPassword={() => setForgotPasswordOpen(true)}
        />
      )}

      {publicView === 'signup' && (
        <SignupForm
          onNavigateLogin={() => setPublicView('login')}
        />
      )}

      {/* Forgot Password Modal with Small/Medium Logo (Section 3) */}
      <ForgotPasswordModal
        isOpen={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
        onNavigateLogin={() => {
          setForgotPasswordOpen(false);
          setPublicView('login');
        }}
      />
    </div>
  );
}
