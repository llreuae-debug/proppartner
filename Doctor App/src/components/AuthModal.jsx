import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Building, 
  FileCheck, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2, 
  AlertCircle,
  Stethoscope,
  Heart,
  KeyRound,
  Shield,
  Sparkles,
  RefreshCw,
  Globe
} from 'lucide-react';
import DocCareLogo from './DocCareLogo';
import { useAuth } from '../context/AuthContext';
import { usePatientLanguage } from '../context/PatientLanguageContext';
import RomanUrduInputAssist from './RomanUrduInputAssist';

export default function AuthModal({ isOpen, onClose, initialMode = 'login', initialRole = 'doctor', onAuthSuccess }) {
  const { login, register, loginWithGoogle, forgotPassword, resetPassword } = useAuth();
  const { patientLanguage, setPatientLanguage, isPatientRTL, t } = usePatientLanguage();
  
  const [selectedRole, setSelectedRole] = useState(initialRole); // 'doctor' | 'patient'
  const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'forgot' | 'reset'
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Form State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  
  // Registration fields
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [city, setCity] = useState('Lahore');
  const [specialty, setSpecialty] = useState('General Physician & Consultant');
  const [pmdcNumber, setPmdcNumber] = useState('');
  const [clinicName, setClinicName] = useState('');
  
  // Reset Password fields
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Determine if Urdu mode should be active for this modal (only when role is patient and patientLanguage is ur)
  const isUrduPatient = selectedRole === 'patient' && patientLanguage === 'ur';

  // Sync initial parameters on open
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode || 'login');
      setSelectedRole(initialRole || 'doctor');
      setError(null);
      setMessage(null);
    }
  }, [isOpen, initialMode, initialRole]);

  if (!isOpen) return null;

  const handleQuickFill = (roleType) => {
    setError(null);
    setMessage(null);
    setSelectedRole(roleType);
    setMode('login');
    if (roleType === 'doctor') {
      setIdentifier('dr.ayesha@doccare.pk');
      setPassword('doctor123');
    } else {
      setIdentifier('kamran.ali@gmail.com');
      setPassword('patient123');
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const res = await login({
      identifier: identifier.trim(),
      password,
      role: selectedRole
    });

    setLoading(false);
    if (res.success) {
      setMessage(`Welcome back, ${res.user.name}! Accessing ${selectedRole === 'doctor' ? 'Doctor Portal' : 'Patient Portal'}...`);
      setTimeout(() => {
        if (onAuthSuccess) onAuthSuccess(res.role, res.user);
        onClose();
      }, 700);
    } else {
      setError(res.error || 'Authentication failed. Please verify your credentials.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const payload = {
      role: selectedRole,
      name: fullName.trim(),
      email: identifier.trim(),
      phone: mobileNumber.trim(),
      password,
      city,
      ...(selectedRole === 'doctor' ? {
        specialization: specialty,
        pmdcNumber: pmdcNumber.trim(),
        clinicName: clinicName.trim()
      } : {})
    };

    const res = await register(payload);
    setLoading(false);

    if (res.success) {
      setMessage(`${selectedRole === 'doctor' ? 'Doctor practice' : 'Patient account'} registered successfully!`);
      setTimeout(() => {
        if (onAuthSuccess) onAuthSuccess(res.role, res.user);
        onClose();
      }, 800);
    } else {
      setError(res.error || 'Registration failed. Please check your information.');
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    // Realistic Google OAuth simulation
    const mockEmail = selectedRole === 'doctor' 
      ? `dr.google.${Date.now().toString().slice(-4)}@gmail.com` 
      : `patient.google.${Date.now().toString().slice(-4)}@gmail.com`;
    const mockName = selectedRole === 'doctor' ? 'Dr. Tariq Google' : 'Zubair Google';

    const res = await loginWithGoogle({
      googleId: `google-uid-${Date.now()}`,
      email: mockEmail,
      name: mockName,
      avatar: selectedRole === 'doctor'
        ? "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400"
        : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(mockName)}`,
      role: selectedRole,
      extraData: {
        city: 'Lahore',
        phone: '+92 300 9876543',
        specialization: 'Consultant Specialist',
        clinicName: 'Google Health Partner Clinic'
      }
    });

    setLoading(false);
    if (res.success) {
      setMessage(`Authenticated with Google as ${res.user.name}! Redirecting...`);
      setTimeout(() => {
        if (onAuthSuccess) onAuthSuccess(res.role, res.user);
        onClose();
      }, 700);
    } else {
      setError(res.error || 'Google authentication failed.');
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const res = await forgotPassword({
      email: resetEmail.trim(),
      role: selectedRole
    });

    setLoading(false);
    if (res.success) {
      setMessage(res.message);
      if (res.resetToken) {
        setResetToken(res.resetToken);
        setMode('reset');
      }
    } else {
      setError(res.error || 'Failed to request password reset.');
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const res = await resetPassword({
      token: resetToken.trim(),
      newPassword
    });

    setLoading(false);
    if (res.success) {
      setMessage("Password updated! Please log in with your new password.");
      setTimeout(() => {
        setMode('login');
      }, 1200);
    } else {
      setError(res.error || 'Failed to reset password.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Ambient Background Inside Modal */}
        <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-teal-400/8 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-medblue-400/8 blur-2xl pointer-events-none" />
        <div className="absolute top-12 right-12 text-teal-600/10 pointer-events-none select-none">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 3H15V9H21V15H15V21H9V15H3V9H9V3Z" />
          </svg>
        </div>

        {/* Top Decorative Gradient */}
        <div className={`h-1.5 w-full bg-gradient-to-r ${
          selectedRole === 'doctor' 
            ? 'from-teal-600 via-teal-400 to-medblue-600' 
            : 'from-blue-600 via-cyan-400 to-teal-500'
        }`} />

        {/* Top Controls: Language Switcher for Patient + Close Button */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          {selectedRole === 'patient' && (
            <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setPatientLanguage('en')}
                className={`px-2 py-0.5 rounded-lg font-semibold transition-all ${
                  patientLanguage === 'en'
                    ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setPatientLanguage('ur')}
                className={`px-2 py-0.5 rounded-lg font-semibold transition-all ${
                  patientLanguage === 'ur'
                    ? 'bg-blue-600 text-white shadow-sm font-urdu'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white font-urdu'
                }`}
              >
                اردو
              </button>
            </div>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Container */}
        <div 
          className={`p-5 sm:p-7 overflow-y-auto custom-scrollbar relative z-10 ${
            isUrduPatient ? 'rtl font-urdu text-right' : 'ltr text-left'
          }`}
          dir={isUrduPatient ? 'rtl' : 'ltr'}
        >

          {/* Header Branding */}
          <div className="flex flex-col items-center text-center mb-5">
            <DocCareLogo variant="full" size="sm" showTagline={false} />
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-3 tracking-tight">
              {isUrduPatient ? 'DocCare میں خوش آمدید' : 'Welcome to DocCare'}
            </h2>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
              {isUrduPatient 
                ? 'آپ کی پریکٹس۔ آپ کے مریض۔ ایک محفوظ میڈیکل ریکارڈ۔' 
                : 'Your practice. Your patients. One simple record.'}
            </p>
          </div>

          {/* Account Role Selector Pills */}
          <div className="bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl flex items-center mb-5 shadow-inner">
            <button
              type="button"
              onClick={() => {
                setSelectedRole('doctor');
                setError(null);
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                selectedRole === 'doctor'
                  ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Stethoscope className="w-4 h-4 text-teal-600 shrink-0" />
              <span>{isUrduPatient ? 'ڈاکٹر پورٹل' : 'Doctor Login'}</span>
              {selectedRole === 'doctor' && (
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse shrink-0" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedRole('patient');
                setError(null);
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                selectedRole === 'patient'
                  ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Heart className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{isUrduPatient ? 'مریض لاگ اِن' : 'Patient Login'}</span>
              {selectedRole === 'patient' && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shrink-0" />
              )}
            </button>
          </div>

          {/* Quick Demo Accounts Helper */}
          <div className="mb-4 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-2 text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="font-semibold">{isUrduPatient ? 'ڈیمو اکاؤنٹ:' : 'Quick Demo:'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickFill('doctor')}
                className="px-2 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-medium hover:bg-teal-100 transition-colors"
              >
                {isUrduPatient ? 'ڈاکٹر عائشہ' : 'Dr. Ayesha'}
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('patient')}
                className="px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-medium hover:bg-blue-100 transition-colors"
              >
                {isUrduPatient ? 'مریض کامران' : 'Patient Kamran'}
              </button>
            </div>
          </div>

          {/* Alert Messages */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/50 flex items-start gap-2.5 text-xs text-teal-700 dark:text-teal-300 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-teal-600 mt-0.5" />
              <span>{message}</span>
            </div>
          )}

          {/* 1. LOGIN VIEW */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isUrduPatient 
                    ? 'ای میل ایڈریس یا موبائل نمبر' 
                    : selectedRole === 'doctor' ? 'Doctor Email or Mobile' : 'Patient Email or Mobile'}
                </label>
                <div className="relative">
                  <Mail className={`w-4 h-4 text-slate-400 absolute top-3 ${isUrduPatient ? 'right-3' : 'left-3'}`} />
                  <input
                    type="text"
                    required
                    placeholder={isUrduPatient ? 'kamran.ali@gmail.com یا 03001234567' : selectedRole === 'doctor' ? 'dr.ayesha@doccare.pk' : 'kamran.ali@gmail.com'}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    dir="ltr"
                    className={`w-full py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium ${
                      isUrduPatient ? 'pr-9 pl-3 text-right' : 'pl-9 pr-3 text-left'
                    }`}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    {isUrduPatient ? 'پاس ورڈ' : 'Password'}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(identifier);
                      setMode('forgot');
                    }}
                    className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {isUrduPatient ? 'پاس ورڈ بھول گئے؟' : 'Forgot Password?'}
                  </button>
                </div>
                <div className="relative">
                  <Lock className={`w-4 h-4 text-slate-400 absolute top-3 ${isUrduPatient ? 'right-3' : 'left-3'}`} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    dir="ltr"
                    className={`w-full py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium ${
                      isUrduPatient ? 'pr-9 pl-3' : 'pl-9 pr-3'
                    }`}
                  />
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 px-4 rounded-xl text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 ${
                  selectedRole === 'doctor'
                    ? 'bg-teal-600 hover:bg-teal-700 active:scale-[0.99]'
                    : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.99]'
                } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>
                      {isUrduPatient 
                        ? 'مریض پورٹل میں لاگ اِن کریں' 
                        : `Sign In to ${selectedRole === 'doctor' ? 'Doctor Portal' : 'Patient Portal'}`}
                    </span>
                    {isUrduPatient ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  </>
                )}
              </button>

              {/* OR Divider */}
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                <span className="flex-shrink mx-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {isUrduPatient ? 'یا' : 'OR'}
                </span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              </div>

              {/* Continue with Google */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2.5"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>{isUrduPatient ? 'گوگل کے ذریعے جاری رکھیں' : 'Continue with Google'}</span>
              </button>

              {/* Switch to Register */}
              <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400">
                <span>{isUrduPatient ? 'اکاؤنٹ موجود نہیں ہے؟ ' : `Don't have a ${selectedRole} account? `}</span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                    setMessage(null);
                  }}
                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline inline-block mr-1"
                >
                  {isUrduPatient ? 'نیا اکاؤنٹ بنائیں' : 'Create Account'}
                </button>
              </div>
            </form>
          )}

          {/* 2. REGISTRATION VIEW */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              {/* Account Type Selector Notice */}
              <div className="p-2 rounded-xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/40 text-[11px] flex items-center justify-between text-teal-800 dark:text-teal-200">
                <span className="font-semibold">{isUrduPatient ? 'اکاؤنٹ کی قسم:' : 'Registering as:'}</span>
                <div className="flex gap-3">
                  <label className="inline-flex items-center gap-1 cursor-pointer font-bold">
                    <input
                      type="radio"
                      name="regRole"
                      checked={selectedRole === 'doctor'}
                      onChange={() => setSelectedRole('doctor')}
                      className="text-teal-600"
                    />
                    <span>{isUrduPatient ? 'ڈاکٹر' : 'Doctor'}</span>
                  </label>
                  <label className="inline-flex items-center gap-1 cursor-pointer font-bold">
                    <input
                      type="radio"
                      name="regRole"
                      checked={selectedRole === 'patient'}
                      onChange={() => setSelectedRole('patient')}
                      className="text-blue-600"
                    />
                    <span>{isUrduPatient ? 'مریض' : 'Patient'}</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isUrduPatient ? 'مکمل نام' : 'Full Name'}
                </label>
                <div className="relative">
                  <User className={`w-4 h-4 text-slate-400 absolute top-3 ${isUrduPatient ? 'right-3' : 'left-3'}`} />
                  <input
                    type="text"
                    required
                    placeholder={isUrduPatient ? 'محمد علی / کامران' : selectedRole === 'doctor' ? 'Dr. Muhammad Usman' : 'Kamran Ali'}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={`w-full py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium ${
                      isUrduPatient ? 'pr-9 pl-3' : 'pl-9 pr-3'
                    }`}
                  />
                </div>
                {/* Roman Urdu Transliteration Suggestion for Registration Name */}
                {selectedRole === 'patient' && (
                  <RomanUrduInputAssist 
                    text={fullName} 
                    onSelectSuggestion={(urduVal) => setFullName(urduVal)} 
                  />
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isUrduPatient ? 'ای میل ایڈریس' : 'Email Address'}
                  </label>
                  <div className="relative">
                    <Mail className={`w-4 h-4 text-slate-400 absolute top-3 ${isUrduPatient ? 'right-3' : 'left-3'}`} />
                    <input
                      type="email"
                      required
                      placeholder="name@domain.com"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      dir="ltr"
                      className={`w-full py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium ${
                        isUrduPatient ? 'pr-9 pl-3' : 'pl-9 pr-3'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isUrduPatient ? 'موبائل نمبر' : 'Mobile Number'}
                  </label>
                  <div className="relative">
                    <Phone className={`w-4 h-4 text-slate-400 absolute top-3 ${isUrduPatient ? 'right-3' : 'left-3'}`} />
                    <input
                      type="text"
                      required
                      placeholder="0300-1234567"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      dir="ltr"
                      className={`w-full py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium ${
                        isUrduPatient ? 'pr-9 pl-3 text-right' : 'pl-9 pr-3'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isUrduPatient ? 'پاس ورڈ' : 'Password'}
                  </label>
                  <div className="relative">
                    <Lock className={`w-4 h-4 text-slate-400 absolute top-3 ${isUrduPatient ? 'right-3' : 'left-3'}`} />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      dir="ltr"
                      className={`w-full py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium ${
                        isUrduPatient ? 'pr-9 pl-3' : 'pl-9 pr-3'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isUrduPatient ? 'شہر' : 'City'}
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    <option value="Lahore">{isUrduPatient ? 'لاہور' : 'Lahore'}</option>
                    <option value="Karachi">{isUrduPatient ? 'کراچی' : 'Karachi'}</option>
                    <option value="Islamabad">{isUrduPatient ? 'اسلام آباد' : 'Islamabad'}</option>
                    <option value="Rawalpindi">{isUrduPatient ? 'راولپنڈی' : 'Rawalpindi'}</option>
                    <option value="Peshawar">{isUrduPatient ? 'پشاور' : 'Peshawar'}</option>
                    <option value="Faisalabad">{isUrduPatient ? 'فیصل آباد' : 'Faisalabad'}</option>
                    <option value="Multan">{isUrduPatient ? 'ملتان' : 'Multan'}</option>
                    <option value="Quetta">{isUrduPatient ? 'کوئٹہ' : 'Quetta'}</option>
                  </select>
                </div>
              </div>

              {/* Doctor-Specific Registration Fields */}
              {selectedRole === 'doctor' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        PMDC Registration No.
                      </label>
                      <div className="relative">
                        <FileCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. 54921-P"
                          value={pmdcNumber}
                          onChange={(e) => setPmdcNumber(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Specialty
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Consultant Cardiologist"
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Clinic / Hospital Name
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Shifa Executive Clinic"
                        value={clinicName}
                        onChange={(e) => setClinicName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full mt-2 py-2.5 px-4 rounded-xl text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 ${
                  selectedRole === 'doctor'
                    ? 'bg-teal-600 hover:bg-teal-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>
                      {isUrduPatient 
                        ? 'مریض کا اکاؤنٹ بنائیں' 
                        : `Create ${selectedRole === 'doctor' ? 'Doctor Practice' : 'Patient'} Account`}
                    </span>
                    {isUrduPatient ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  </>
                )}
              </button>

              {/* Switch to Login */}
              <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400">
                <span>{isUrduPatient ? 'پہلے سے اکاؤنٹ موجود ہے؟ ' : 'Already have an account? '}</span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                    setMessage(null);
                  }}
                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline inline-block mr-1"
                >
                  {isUrduPatient ? 'لاگ اِن کریں' : 'Log In'}
                </button>
              </div>
            </form>
          )}

          {/* 3. FORGOT PASSWORD VIEW */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-3.5">
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-200">
                {isUrduPatient 
                  ? 'اپنا رجسٹرڈ ای میل ایڈریس درج کریں۔ ہم پاس ورڈ تبدیل کرنے کا محفوظ لنک فراہم کریں گے۔'
                  : `Enter your registered ${selectedRole === 'doctor' ? 'medical email' : 'email'} address. We will generate a secure, expiring password reset authorization.`}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isUrduPatient ? 'رجسٹرڈ ای میل ایڈریس' : 'Registered Email Address'}
                </label>
                <div className="relative">
                  <Mail className={`w-4 h-4 text-slate-400 absolute top-3 ${isUrduPatient ? 'right-3' : 'left-3'}`} />
                  <input
                    type="email"
                    required
                    placeholder="name@domain.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    dir="ltr"
                    className={`w-full py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium ${
                      isUrduPatient ? 'pr-9 pl-3' : 'pl-9 pr-3'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>{isUrduPatient ? 'ری سیٹ لنک حاصل کریں' : 'Send Secure Reset Link'}</span>
                    {isUrduPatient ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-xs text-slate-500">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {isUrduPatient ? '← واپس لاگ اِن پر جائیں' : '← Back to Login'}
                </button>
              </div>
            </form>
          )}

          {/* 4. RESET PASSWORD WITH TOKEN VIEW */}
          {mode === 'reset' && (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isUrduPatient ? 'سیکیورٹی ری سیٹ ٹوکن' : 'Security Reset Token'}
                </label>
                <div className="relative">
                  <KeyRound className={`w-4 h-4 text-slate-400 absolute top-3 ${isUrduPatient ? 'right-3' : 'left-3'}`} />
                  <input
                    type="text"
                    required
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    dir="ltr"
                    className={`w-full py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isUrduPatient ? 'pr-9 pl-3' : 'pl-9 pr-3'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isUrduPatient ? 'نیا پاس ورڈ درج کریں' : 'Enter New Password'}
                </label>
                <div className="relative">
                  <Lock className={`w-4 h-4 text-slate-400 absolute top-3 ${isUrduPatient ? 'right-3' : 'left-3'}`} />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Minimum 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    dir="ltr"
                    className={`w-full py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium ${
                      isUrduPatient ? 'pr-9 pl-3' : 'pl-9 pr-3'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>{isUrduPatient ? 'پاس ورڈ محفوظ کریں اور لاگ اِن کریں' : 'Update Password & Return to Login'}</span>
                    {isUrduPatient ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  </>
                )}
              </button>
            </form>
          )}

          {/* Security Badge Footer */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <Shield className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
            <span>
              {isUrduPatient 
                ? '256-bit اینکرپٹڈ میڈیکل سیشن • پی ایم ڈی سی تصدیق شدہ' 
                : '256-bit Encrypted Medical Session • PMDC & Role Enforced'}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
