import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import MedicalDisclaimer from './components/MedicalDisclaimer';
import QRModal from './components/QRModal';
import DocCareSplash from './components/DocCareSplash';
import AuthModal from './components/AuthModal';

import Dashboard from './pages/Dashboard';
import AppointmentsPage from './pages/AppointmentsPage';
import PrescriptionWriterPage from './pages/PrescriptionWriterPage';
import PatientsDirectoryPage from './pages/PatientsDirectoryPage';
import DoctorLedgerPage from './pages/DoctorLedgerPage';
import DoctorReportsPage from './pages/DoctorReportsPage';
import PDFSettingsPage from './pages/PDFSettingsPage';
import DoctorProfilePage from './pages/DoctorProfilePage';
import WhatsAppAuditPage from './pages/WhatsAppAuditPage';
import FormularyManagementPage from './pages/FormularyManagementPage';
import FindDoctorPage from './pages/FindDoctorPage';
import PublicDoctorProfile from './pages/PublicDoctorProfile';
import PublicVerifyPrescription from './pages/PublicVerifyPrescription';
import PublicSecureRxViewer from './pages/PublicSecureRxViewer';
import PatientDashboardPage from './pages/PatientDashboardPage';
import SEOCitySpecialtyLandingPage from './pages/SEOCitySpecialtyLandingPage';

import MedicalAtmosphereBackground from './components/MedicalAtmosphereBackground';
import { useLanguage } from './context/LanguageContext';
import { useAuth } from './context/AuthContext';
import { Globe, ArrowLeft, Shield, Heart, Stethoscope } from 'lucide-react';

function parsePublicRoute(path) {
  if (path.startsWith('/dr/') || path.startsWith('/doctor/')) {
    const slug = path.replace('/dr/', '').replace('/doctor/', '');
    return { type: 'doctor', slug };
  }
  if (path.startsWith('/verify-rx/') || path.startsWith('/verify/')) {
    const token = path.replace('/verify-rx/', '').replace('/verify/', '');
    return { type: 'verify', token };
  }
  if (path.startsWith('/rx/')) {
    const token = path.replace('/rx/', '');
    return { type: 'rx', token };
  }
  if (path.startsWith('/doctors/')) {
    const parts = path.replace('/doctors/', '').split('/').filter(Boolean);
    if (parts.length >= 2) {
      return { type: 'seo-matrix', city: parts[0], specialty: parts[1] };
    }
    if (parts.length === 1) {
      return { type: 'seo-matrix', city: parts[0] };
    }
  }
  if (path.startsWith('/specialists/')) {
    const specialty = path.replace('/specialists/', '').replace('/', '');
    return { type: 'seo-matrix', specialty };
  }
  if (path === '/find-doctors' || path === '/find') {
    return { type: 'discovery' };
  }
  return null;
}

export default function App() {
  const { isRTL } = useLanguage();
  const { currentDoctor, isAuthenticated, isDoctor, isPatient, role } = useAuth();
  
  // Animated Startup Splash Screen
  const [showSplash, setShowSplash] = useState(true);

  // Auth Modal State (Login, Register, Forgot Password)
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login', role: 'doctor' });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [prefillAppointment, setPrefillAppointment] = useState(null);

  // URL Path Detection for Public Links
  const [publicRoute, setPublicRoute] = useState(() => parsePublicRoute(window.location.pathname));

  useEffect(() => {
    const handlePopState = () => {
      setPublicRoute(parsePublicRoute(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleBackToApp = () => {
    window.history.pushState({}, '', '/');
    setPublicRoute(null);
    if (isPatient) {
      setActiveTab('patient-dashboard');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleSelectDoctorFromDirectory = (slug, bookNow = false) => {
    window.history.pushState({}, '', `/dr/${slug}`);
    setPublicRoute({ type: 'doctor', slug, bookNow });
  };

  const handleWritePrescriptionFromExternal = (prefillData) => {
    setPrefillAppointment(prefillData);
    setActiveTab('prescriptions');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If visiting a public secure prescription link (/rx/:share_token)
  if (publicRoute?.type === 'rx') {
    return (
      <PublicSecureRxViewer
        shareToken={publicRoute.token}
        onBackToApp={handleBackToApp}
      />
    );
  }

  // If visiting a public verification link (/verify/:token)
  if (publicRoute?.type === 'verify') {
    return (
      <PublicVerifyPrescription
        verifyToken={publicRoute.token}
        onBackToApp={handleBackToApp}
      />
    );
  }

  // If visiting a public doctor profile page (/dr/:slug)
  if (publicRoute?.type === 'doctor') {
    return (
      <PublicDoctorProfile
        slug={publicRoute.slug}
        autoOpenBooking={publicRoute.bookNow}
        onBackToApp={() => {
          setPublicRoute({ type: 'discovery' });
        }}
      />
    );
  }

  // If visiting an SEO Matrix Landing Page (/doctors/:city, /doctors/:city/:specialty, /specialists/:specialty)
  if (publicRoute?.type === 'seo-matrix') {
    return (
      <SEOCitySpecialtyLandingPage
        cityParam={publicRoute.city}
        specialtyParam={publicRoute.specialty}
        onSelectDoctor={handleSelectDoctorFromDirectory}
        onNavigateHome={() => {
          window.history.pushState({}, '', '/find-doctors');
          setPublicRoute({ type: 'discovery' });
        }}
        onNavigateDoctorLogin={() => setAuthModal({ isOpen: true, mode: 'login', role: 'doctor' })}
      />
    );
  }

  // Determine contextual background atmosphere intensity
  const getBackgroundVariant = () => {
    if (publicRoute?.type === 'discovery' || activeTab === 'public-directory' || authModal.isOpen) {
      return 'prominent';
    }
    if (['prescriptions', 'ledger', 'patients', 'messages', 'pdf-settings'].includes(activeTab)) {
      return 'minimal';
    }
    return 'standard';
  };

  // If visiting the public discovery directory directly (/find-doctors)
  if (publicRoute?.type === 'discovery' || activeTab === 'public-directory') {
    return (
      <div className="min-h-screen bg-slate-50 relative">
        <MedicalAtmosphereBackground variant="prominent" />
        {/* Banner if authenticated user is previewing public directory */}
        {isAuthenticated && (
          <div className="bg-slate-900 text-white px-4 py-2.5 text-xs flex items-center justify-between shadow-md relative z-10">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-teal-400" />
              <span className="font-bold">Public Doctor Discovery Mode</span>
              <span className="text-slate-400 hidden sm:inline">
                • Logged in as {isDoctor ? 'Doctor' : 'Patient'}
              </span>
            </div>
            <button
              onClick={() => {
                setPublicRoute(null);
                setActiveTab(isPatient ? 'patient-dashboard' : 'dashboard');
              }}
              className={`px-3 py-1 text-white rounded-lg font-bold text-xs flex items-center gap-1 transition-colors ${
                isDoctor ? 'bg-teal-600 hover:bg-teal-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to {isDoctor ? 'Doctor Portal' : 'Patient Portal'}</span>
            </button>
          </div>
        )}

        <div className="relative z-10">
          <FindDoctorPage
            onSelectDoctor={handleSelectDoctorFromDirectory}
            onNavigateDoctorLogin={() => setAuthModal({ isOpen: true, mode: 'login', role: 'doctor' })}
          />
        </div>

        {/* Dual-Role Authentication Modal */}
        <AuthModal
          isOpen={authModal.isOpen}
          initialMode={authModal.mode}
          initialRole={authModal.role}
          onClose={() => setAuthModal({ isOpen: false, mode: 'login', role: 'doctor' })}
        />
      </div>
    );
  }

  // ==========================================
  // PATIENT PORTAL ROUTE (When logged in as a Patient)
  // ==========================================
  if (isPatient || (isAuthenticated && role === 'patient')) {
    return (
      <>
        {showSplash && (
          <DocCareSplash onComplete={() => setShowSplash(false)} />
        )}
        <div className="relative min-h-screen">
          <MedicalAtmosphereBackground variant="standard" />
          <div className="relative z-10">
            <PatientDashboardPage
              onNavigateToDirectory={() => {
                window.history.pushState({}, '', '/find-doctors');
                setPublicRoute({ type: 'discovery' });
              }}
              onSelectDoctor={handleSelectDoctorFromDirectory}
            />
          </div>
        </div>
        <AuthModal
          isOpen={authModal.isOpen}
          initialMode={authModal.mode}
          initialRole={authModal.role}
          onClose={() => setAuthModal({ isOpen: false, mode: 'login', role: 'doctor' })}
        />
      </>
    );
  }

  // ==========================================
  // DOCTOR PORTAL & DEFAULT CLINICAL WORKSPACE
  // ==========================================
  return (
    <>
      {/* 1. Startup Animated Splash Screen */}
      {showSplash && (
        <DocCareSplash onComplete={() => setShowSplash(false)} />
      )}

      <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col relative ${isRTL ? 'urdu-text' : ''}`}>
        
        {/* Subtle Background Atmosphere */}
        <MedicalAtmosphereBackground variant={getBackgroundVariant()} />

        {/* Top Clinical Safety Disclaimer */}
        <div className="relative z-20">
          <MedicalDisclaimer />
        </div>

        {/* Main Header Navigation */}
        <div className="relative z-20">
          <Navbar
            onOpenQR={() => setIsQRModalOpen(true)}
            onOpenAuth={(mode, roleType) => setAuthModal({ isOpen: true, mode: mode || 'login', role: roleType || 'doctor' })}
            onNavigate={(tab) => {
              if (tab === 'patient-dashboard') {
                if (isPatient) {
                  setActiveTab('patient-dashboard');
                } else {
                  setAuthModal({ isOpen: true, mode: 'login', role: 'patient' });
                }
                return;
              }
              setActiveTab(tab);
              if (tab !== 'prescriptions') setPrefillAppointment(null);
            }}
          />
        </div>

        {/* Main Viewport Container */}
        <div className="flex-1 flex max-w-7xl w-full mx-auto relative z-10">

          
          {/* Responsive Sidebar */}
          <Sidebar
            activeTab={activeTab}
            onSelectTab={(tab) => {
              setActiveTab(tab);
              if (tab !== 'prescriptions') setPrefillAppointment(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenQR={() => setIsQRModalOpen(true)}
          />

          {/* Dynamic Page Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl w-full overflow-x-hidden">
            {activeTab === 'dashboard' && (
              <Dashboard
                onNavigate={(tab) => setActiveTab(tab)}
                onOpenQR={() => setIsQRModalOpen(true)}
                onReplaySplash={() => setShowSplash(true)}
              />
            )}

            {activeTab === 'appointments' && (
              <AppointmentsPage
                onNavigateToPatient={() => setActiveTab('patients')}
                onWritePrescription={handleWritePrescriptionFromExternal}
              />
            )}

            {activeTab === 'prescriptions' && (
              <PrescriptionWriterPage
                prefillAppointment={prefillAppointment}
                onResetPrefill={() => setPrefillAppointment(null)}
              />
            )}

            {activeTab === 'ledger' && (
              <DoctorLedgerPage
                onNavigateToPatient={(patientId) => {
                  setActiveTab('patients');
                }}
              />
            )}

            {activeTab === 'reports' && (
              <DoctorReportsPage />
            )}

            {activeTab === 'patients' && (
              <PatientsDirectoryPage
                onWritePrescription={handleWritePrescriptionFromExternal}
              />
            )}

            {activeTab === 'formulary' && (
              <FormularyManagementPage />
            )}

            {activeTab === 'messages' && (
              <WhatsAppAuditPage />
            )}

            {activeTab === 'pdf-settings' && (
              <PDFSettingsPage />
            )}

            {activeTab === 'profile' && (
              <DoctorProfilePage
                onOpenQR={() => setIsQRModalOpen(true)}
              />
            )}
          </main>
        </div>

        {/* QR Code Modal for Public Link & Desk Stands */}
        <QRModal
          isOpen={isQRModalOpen}
          onClose={() => setIsQRModalOpen(false)}
        />

        {/* Dual-Role Authentication Modal */}
        <AuthModal
          isOpen={authModal.isOpen}
          initialMode={authModal.mode}
          initialRole={authModal.role}
          onClose={() => setAuthModal({ isOpen: false, mode: 'login', role: 'doctor' })}
        />

      </div>
    </>
  );
}
