import React, { useState, useEffect } from 'react';
import { 
  Languages, 
  Download, 
  ChevronDown, 
  Plus, 
  Check, 
  QrCode,
  LogIn,
  UserPlus,
  Globe,
  Heart,
  Stethoscope,
  LogOut,
  User,
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import DocCareLogo from './DocCareLogo';

export default function Navbar({ onOpenQR, onNavigate, onOpenAuth }) {
  const { 
    user, 
    role, 
    isAuthenticated, 
    isDoctor, 
    isPatient, 
    currentDoctor, 
    currentPatient, 
    doctors, 
    switchDoctor, 
    logout 
  } = useAuth();
  
  const { lang, toggleLang, t } = useLanguage();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    });
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setCanInstall(false);
      }
      setDeferredPrompt(null);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Title */}
        <div 
          className="flex items-center cursor-pointer hover:opacity-95 transition-opacity" 
          onClick={() => {
            if (isPatient) {
              onNavigate('patient-dashboard');
            } else {
              onNavigate('dashboard');
            }
          }}
        >
          <DocCareLogo variant="horizontal" size="md" showTagline={true} />
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* PWA Install Button */}
          {canInstall && (
            <button
              onClick={handleInstallClick}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:text-teal-300 rounded-lg border border-teal-200 dark:border-teal-800 transition-all shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>
          )}

          {/* Find a Doctor Public Directory Button */}
          <button
            onClick={() => onNavigate('public-directory')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-teal-800 dark:text-teal-200 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 rounded-xl border border-teal-200 dark:border-teal-800 transition-all shadow-xs"
            title="Browse Patient Discovery Directory"
          >
            <Globe className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span className="hidden sm:inline">Find a Doctor</span>
          </button>

          {/* Urdu / English Toggle */}
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-all border border-slate-200 dark:border-slate-700"
            title="Toggle English / Urdu Language"
          >
            <Languages className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>{lang === 'en' ? 'اردو' : 'English'}</span>
          </button>

          {/* USER ACCOUNT DROPDOWN / AUTH BUTTONS */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border transition-all shadow-xs ${
                  isDoctor
                    ? 'border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/40 hover:bg-teal-100/60'
                    : 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/40 hover:bg-blue-100/60'
                }`}
              >
                <img
                  src={
                    isDoctor 
                      ? (currentDoctor?.profileImage || "/brand/doccare-icon.png")
                      : (user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.name || 'patient')}`)
                  }
                  alt={user?.name}
                  className={`w-8 h-8 rounded-full object-cover ring-2 ${
                    isDoctor ? 'ring-teal-500/40' : 'ring-blue-500/40'
                  }`}
                />
                <div className="text-left hidden lg:block">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-none flex items-center gap-1">
                    <span>{user?.name || (isDoctor ? currentDoctor?.name : 'Patient')}</span>
                    {isDoctor ? (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 uppercase font-black">DR</span>
                    ) : (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 uppercase font-black">PATIENT</span>
                    )}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[140px] mt-0.5">
                    {isDoctor ? (currentDoctor?.specialization || 'Clinical Practice') : (user?.email || 'Patient Record')}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 p-2.5 animate-fade-in">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700 mb-2 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {user?.name}
                        </p>
                        <p className="text-[11px] text-slate-400">{user?.email}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${
                        isDoctor ? 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}>
                        {role}
                      </span>
                    </div>

                    {isDoctor && (
                      <>
                        <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Switch Active Doctor Account
                        </div>
                        <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar mb-2">
                          {doctors.map((doc) => {
                            const isActive = currentDoctor?.id === doc.id;
                            return (
                              <button
                                key={doc.id}
                                onClick={() => {
                                  switchDoctor(doc.id);
                                  setDropdownOpen(false);
                                }}
                                className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                                  isActive
                                    ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-950 dark:text-teal-200 font-semibold'
                                    : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <img
                                    src={doc.profileImage}
                                    alt={doc.name}
                                    className="w-7 h-7 rounded-full object-cover"
                                  />
                                  <div>
                                    <p className="text-xs font-bold leading-snug">{doc.name}</p>
                                    <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{doc.specialization}</p>
                                  </div>
                                </div>
                                {isActive && <Check className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}

                    {/* Navigation Buttons */}
                    <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-700">
                      {isDoctor ? (
                        <>
                          <button
                            onClick={() => {
                              setDropdownOpen(false);
                              onNavigate('profile');
                            }}
                            className="w-full py-2 px-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-xl transition-colors flex items-center gap-2"
                          >
                            <User className="w-4 h-4 text-teal-600" />
                            <span>Doctor Profile & Settings</span>
                          </button>
                          <button
                            onClick={() => {
                              setDropdownOpen(false);
                              onOpenQR();
                            }}
                            className="w-full py-2 px-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-xl transition-colors flex items-center gap-2"
                          >
                            <QrCode className="w-4 h-4 text-teal-600" />
                            <span>Clinic Desk QR Stand</span>
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            onNavigate('patient-dashboard');
                          }}
                          className="w-full py-2 px-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-xl transition-colors flex items-center gap-2"
                        >
                          <Heart className="w-4 h-4 text-blue-600" />
                          <span>My Patient Portal</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          logout();
                        }}
                        className="w-full py-2 px-3 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => onOpenAuth('login', 'doctor')}
                className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Doctor Login</span>
                <span className="sm:hidden">Doctor</span>
              </button>
              <button
                onClick={() => onOpenAuth('login', 'patient')}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Heart className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Patient Login</span>
                <span className="sm:hidden">Patient</span>
              </button>
            </div>
          )}

        </div>

      </div>
    </header>
  );
}
