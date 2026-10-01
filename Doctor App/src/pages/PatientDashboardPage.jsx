import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Calendar, 
  FileText, 
  User, 
  Stethoscope, 
  Clock, 
  MapPin, 
  Download, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  RefreshCw, 
  LogOut, 
  Shield, 
  Edit3, 
  Save, 
  Phone, 
  Pill, 
  Building,
  Search,
  Eye,
  Languages,
  Printer,
  FileCheck,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { usePatientLanguage } from '../context/PatientLanguageContext';
import RomanUrduInputAssist from '../components/RomanUrduInputAssist';
import DocCareLogo from '../components/DocCareLogo';

const CITY_URDU_MAP = {
  "Lahore": "لاہور",
  "Karachi": "کراچی",
  "Islamabad": "اسلام آباد",
  "Rawalpindi": "راولپنڈی",
  "Faisalabad": "فیصل آباد",
  "Multan": "ملتان",
  "Peshawar": "پشاور",
  "Quetta": "کوئٹہ"
};

const SPECIALTY_URDU_MAP = {
  "General Physician": "جنرل فزیشن (معالجِ عمومی)",
  "Cardiologist": "ماہر امراض قلب (کارڈیالوجسٹ)",
  "Consultant Physician & Diabetologist": "کنسلٹنٹ فزیشن و شوگر اسپیشلسٹ",
  "Consultant Cardiologist & Heart Specialist": "کنسلٹنٹ کارڈیالوجسٹ (ماہر امراض قلب)",
  "Consultant Pediatrician & Child Specialist": "کنسلٹنٹ ماہر امراض اطفال (بچوں کے ڈاکٹر)",
  "Consultant Dermatologist & Cosmetologist": "کنسلٹنٹ ماہر امراض جلد و ڈرماٹالوجسٹ",
  "Consultant Gynecologist & Obstetrician": "کنسلٹنٹ ماہر امراض نسواں و زچگی",
  "Consultant Orthopedic Surgeon": "کنسلٹنٹ آرتھوپیڈک سرجن (ہڈی و جوڑ)"
};

export default function PatientDashboardPage({ onNavigateToDirectory, onSelectDoctor }) {
  const { user, currentPatient, logout, updateCurrentPatient } = useAuth();
  const { patientLang, togglePatientLanguage, tPatient, isPatientRTL } = usePatientLanguage();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Active Tab in Patient Portal
  const [activeTab, setActiveTab] = useState('appointments'); // 'appointments' | 'prescriptions' | 'profile'

  // Edit Profile Modal / State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    nameUrdu: '',
    phone: '',
    age: 30,
    gender: 'Male',
    allergies: '',
    chronic_conditions: '',
    current_medicines: ''
  });

  // Cancel Appointment Modal State
  const [cancelModal, setCancelModal] = useState({ isOpen: false, appointmentId: null, reason: '' });
  const [cancelling, setCancelling] = useState(false);

  // Selected Prescription for in-app viewing & printing
  const [selectedRx, setSelectedRx] = useState(null);

  // Print Prescription
  const handlePrintRx = (rx) => {
    if (rx?.id) {
      api.logPatientPrescriptionAuditEvent(rx.id, 'printed').catch(e => console.warn(e));
    }
    window.print();
  };

  // Download PDF
  const handleDownloadRx = (rx) => {
    if (rx?.id) {
      api.logPatientPrescriptionAuditEvent(rx.id, 'downloaded').catch(e => console.warn(e));
      const downloadUrl = api.getPrescriptionPdfUrl(rx.id, true);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${rx.prescription_no || rx.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // Fetch Patient Dashboard Data
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getPatientDashboard();
      if (res && res.success) {
        setData(res);
        if (res.patient) {
          setProfileForm({
            name: res.patient.name || '',
            nameUrdu: res.patient.nameUrdu || '',
            phone: res.patient.phone || '',
            age: res.patient.age || 30,
            gender: res.patient.gender || 'Male',
            allergies: res.patient.allergies || (isPatientRTL ? 'کوئی الرجی نہیں' : 'None reported'),
            chronic_conditions: res.patient.chronic_conditions || (isPatientRTL ? 'کوئی نہیں' : 'None reported'),
            current_medicines: res.patient.current_medicines || (isPatientRTL ? 'کوئی نہیں' : 'None')
          });
        }
      }
    } catch (err) {
      setError(err.message || (isPatientRTL ? 'مریض کا ریکارڈ لوڈ کرنے میں مسئلہ پیش آیا۔' : 'Failed to load patient records.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleCancelAppointment = async () => {
    if (!cancelModal.appointmentId) return;
    setCancelling(true);
    try {
      const res = await api.cancelPatientAppointment(cancelModal.appointmentId, cancelModal.reason);
      if (res.success) {
        setSuccessMsg(isPatientRTL ? "اپائنٹمنٹ کامیابی سے منسوخ کر دی گئی ہے۔" : "Appointment cancelled successfully.");
        setCancelModal({ isOpen: false, appointmentId: null, reason: '' });
        await loadDashboardData();
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err) {
      setError(err.message || (isPatientRTL ? "اپائنٹمنٹ منسوخ نہیں ہو سکی۔" : "Failed to cancel appointment"));
    } finally {
      setCancelling(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await updateCurrentPatient(profileForm);
      if (res.success) {
        setSuccessMsg(isPatientRTL ? "طبی پروفائل کامیابی سے محفوظ ہو گئی ہے۔" : "Health profile updated successfully.");
        setIsEditingProfile(false);
        await loadDashboardData();
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err) {
      setError(err.message || (isPatientRTL ? "پروفائل محفوظ نہیں ہو سکی۔" : "Failed to save profile"));
    }
  };

  return (
    <div 
      dir={isPatientRTL ? "rtl" : "ltr"} 
      className={`min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col transition-colors ${
        isPatientRTL ? 'urdu-text' : 'font-sans'
      }`}
    >
      
      {/* Top Patient Portal Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DocCareLogo variant="compact" size="sm" showTagline={false} animated={true} />
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
              <span>{tPatient('patientPortal')}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher Pill */}
            <button
              onClick={togglePatientLanguage}
              className="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800 font-bold text-xs hover:bg-teal-100 transition-all flex items-center gap-1.5 shadow-xs"
              title="Switch English / اردو"
            >
              <Languages className="w-3.5 h-3.5 text-teal-600" />
              <span>{patientLang === 'en' ? 'اردو' : 'English'}</span>
            </button>

            <button
              onClick={() => onNavigateToDirectory && onNavigateToDirectory()}
              className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tPatient('findDoctorBtn')}</span>
              <span className="sm:hidden">{tPatient('findDoctor')}</span>
            </button>

            <button
              onClick={() => logout()}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 transition-colors flex items-center gap-1.5"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tPatient('signOut')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        
        {/* Welcome Banner & Health Overview */}
        <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-teal-700 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 transform skew-x-12 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-sm mb-3">
                <Shield className="w-3.5 h-3.5 text-teal-200" />
                <span>{tPatient('verifiedBadge')}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                {tPatient('welcomePatient')} {isPatientRTL && data?.patient?.nameUrdu ? data.patient.nameUrdu : (data?.patient?.name || user?.name || "Patient")}
              </h1>
              <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-xl">
                {tPatient('patientOverview')}
              </p>
            </div>

            {/* Quick Action */}
            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={() => onNavigateToDirectory && onNavigateToDirectory()}
                className="px-4 py-2.5 rounded-2xl bg-white text-blue-800 font-extrabold text-xs shadow-md hover:bg-blue-50 transition-all flex items-center gap-2 active:scale-[0.98]"
              >
                <Plus className="w-4 h-4 text-blue-700" />
                <span>{tPatient('bookConsultation')}</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/15 text-center">
            <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-sm">
              <p className="text-2xl font-black"><bdi>{data?.stats?.upcomingAppointments || 0}</bdi></p>
              <p className="text-[11px] text-blue-100 font-medium">{tPatient('upcomingVisits')}</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-sm">
              <p className="text-2xl font-black"><bdi>{data?.stats?.totalPrescriptions || 0}</bdi></p>
              <p className="text-[11px] text-blue-100 font-medium">{tPatient('digitalPrescriptions')}</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-sm">
              <p className="text-2xl font-black"><bdi>{data?.stats?.doctorsConsulted || 0}</bdi></p>
              <p className="text-[11px] text-blue-100 font-medium">{tPatient('doctorsConsulted')}</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-sm">
              <p className="text-2xl font-black"><bdi>{data?.stats?.totalAppointments || 0}</bdi></p>
              <p className="text-[11px] text-blue-100 font-medium">{tPatient('totalBookings')}</p>
            </div>
          </div>
        </div>

        {/* Notifications & Feedback */}
        {successMsg && (
          <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 text-xs text-teal-800 dark:text-teal-200 flex items-center gap-2 shadow-sm animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2 shadow-sm animate-fade-in">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 sm:gap-6 text-xs sm:text-sm font-bold">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`pb-3 px-2 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'appointments'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>{tPatient('myAppointmentsTab')} (<bdi>{data?.appointments?.length || 0}</bdi>)</span>
          </button>

          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`pb-3 px-2 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'prescriptions'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{tPatient('myPrescriptionsTab')} (<bdi>{data?.prescriptions?.length || 0}</bdi>)</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-2 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'profile'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{tPatient('myHealthProfileTab')}</span>
          </button>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mb-3" />
            <p className="text-xs text-slate-500">{isPatientRTL ? "آپ کا محفوظ طبی ریکارڈ لوڈ ہو رہا ہے..." : "Loading your private health record..."}</p>
          </div>
        )}

        {/* TAB 1: APPOINTMENTS */}
        {!loading && activeTab === 'appointments' && (
          <div className="space-y-4">
            {(!data?.appointments || data.appointments.length === 0) ? (
              <div className="p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold">{tPatient('noAppointmentsTitle')}</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {tPatient('noAppointmentsDesc')}
                </p>
                <button
                  onClick={() => onNavigateToDirectory && onNavigateToDirectory()}
                  className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>{tPatient('findDoctor')}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.appointments.map((apt) => {
                  const isUpcoming = apt.status === 'confirmed' || apt.status === 'pending';
                  const statusUrdu = 
                    apt.status === 'confirmed' ? tPatient('statusConfirmed') :
                    apt.status === 'pending' ? tPatient('statusPending') :
                    apt.status === 'completed' ? tPatient('statusCompleted') :
                    tPatient('statusCancelled');

                  return (
                    <div 
                      key={apt.id}
                      className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Header & Status */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={apt.doctor_avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(apt.doctor_name)}`}
                              alt={apt.doctor_name}
                              className="w-11 h-11 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                            />
                            <div>
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                {apt.doctor_name}
                              </h4>
                              <p className="text-xs text-teal-600 dark:text-teal-400 font-medium">
                                {isPatientRTL ? (SPECIALTY_URDU_MAP[apt.doctor_specialty] || apt.doctor_specialty) : apt.doctor_specialty}
                              </p>
                            </div>
                          </div>

                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                            apt.status === 'confirmed' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' :
                            apt.status === 'pending' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300' :
                            apt.status === 'completed' ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300' :
                            'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}>
                            {isPatientRTL ? statusUrdu : apt.status}
                          </span>
                        </div>

                        {/* Clinic & Appointment Details */}
                        <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl mb-3">
                          <div className="flex items-center gap-2">
                            <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{apt.clinic_name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{apt.date} • {apt.start_time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{isPatientRTL ? (CITY_URDU_MAP[apt.city] || apt.city) : (apt.city || 'Lahore')}</span>
                          </div>
                          {apt.notes && (
                            <div className="pt-1 text-[11px] text-slate-500 italic">
                              {isPatientRTL ? "تفصیلات: " : "Notes: "} {apt.notes}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                        <span className="font-mono text-[11px] text-slate-400">
                          <bdi>#{apt.id}</bdi>
                        </span>

                        {isUpcoming && (
                          <button
                            onClick={() => setCancelModal({ isOpen: true, appointmentId: apt.id, reason: '' })}
                            className="px-3 py-1 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 font-bold transition-colors"
                          >
                            {tPatient('cancelAppointment')}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DIGITAL PRESCRIPTIONS */}
        {!loading && activeTab === 'prescriptions' && (
          <div className="space-y-4">
            {(!data?.prescriptions || data.prescriptions.length === 0) ? (
              <div className="p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold">{tPatient('noPrescriptionsTitle')}</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {tPatient('noPrescriptionsDesc')}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.prescriptions.map((rx) => (
                  <div
                    key={rx.id}
                    className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <span className="px-2.5 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-mono text-xs font-bold border border-teal-200 dark:border-teal-800">
                            <bdi>{rx.prescription_no || rx.id}</bdi>
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5">
                            {rx.doctor_name}
                          </h4>
                          <p className="text-xs text-slate-500">
                            {rx.clinic_name} • {new Date(rx.created_at).toLocaleDateString()}
                          </p>
                        </div>

                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
                          {isPatientRTL ? "جاری شدہ" : "Finalized"}
                        </span>
                      </div>

                      {/* Clinical Summary */}
                      <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl space-y-2 mb-4 text-xs">
                        <div>
                          <span className="font-bold text-slate-700 dark:text-slate-300">{isPatientRTL ? "مرض کی تشخیص: " : "Diagnosis: "}</span>
                          <span className="text-slate-600 dark:text-slate-400">{rx.diagnosis || (isPatientRTL ? "طبی جائزہ" : "Clinical Review")}</span>
                        </div>

                        {rx.items && rx.items.length > 0 && (
                          <div>
                            <span className="font-bold text-slate-700 dark:text-slate-300">{isPatientRTL ? "تجویز کردہ ادویات: " : "Medicines: "} (<bdi>{rx.items.length}</bdi>)</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {rx.items.map((med, idx) => (
                                <span key={idx} className="px-2 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[11px] font-medium text-slate-800 dark:text-slate-200">
                                  {med.medicine_name} ({med.dose})
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {rx.tests_advised && (
                          <div>
                            <span className="font-bold text-slate-700 dark:text-slate-300">{isPatientRTL ? "لیب ٹیسٹ: " : "Tests: "}</span>
                            <span className="text-slate-600 dark:text-slate-400">{rx.tests_advised}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Prescription Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setSelectedRx(rx)}
                        className="flex-1 py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{isPatientRTL ? "نسخہ دیکھیں" : "View Prescription"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePrintRx(rx)}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center transition-colors"
                        title={isPatientRTL ? "پرنٹ کریں" : "Print"}
                      >
                        <Printer className="w-3.5 h-3.5 text-teal-600" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadRx(rx)}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center transition-colors"
                        title={tPatient('downloadPdf')}
                      >
                        <Download className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: HEALTH PROFILE (With Roman Urdu Assisted Inputs & English/Urdu Names) */}
        {!loading && activeTab === 'profile' && (
          <div className="max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {tPatient('myHealthProfileTab')}
                </h3>
                <p className="text-xs text-slate-500">
                  {isPatientRTL ? "آپ کے معالج ڈاکٹر کے ساتھ محفوظ طریقے سے منسلک تاکہ درست ادویات اور الرجی کی جانچ ہو سکے۔" : "Shared securely with your consulting doctors for accurate prescriptions and allergy safety checks."}
                </p>
              </div>

              {!isEditingProfile && (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-100 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{tPatient('editProfile')}</span>
                </button>
              )}
            </div>

            {isEditingProfile ? (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {tPatient('patientName')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                    <RomanUrduInputAssist
                      value={profileForm.name}
                      onApply={(val) => setProfileForm({ ...profileForm, nameUrdu: val })}
                      isUrduMode={isPatientRTL}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {tPatient('patientNameUrdu')}
                    </label>
                    <input
                      type="text"
                      placeholder="مثلاً محمد علی"
                      value={profileForm.nameUrdu}
                      onChange={(e) => setProfileForm({ ...profileForm, nameUrdu: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 urdu-text"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {tPatient('mobileNumber')}
                    </label>
                    <input
                      type="text"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {tPatient('patientAge')}
                    </label>
                    <input
                      type="number"
                      value={profileForm.age}
                      onChange={(e) => setProfileForm({ ...profileForm, age: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {tPatient('patientGender')}
                    </label>
                    <select
                      value={profileForm.gender}
                      onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    >
                      <option value="Male">{tPatient('male')}</option>
                      <option value="Female">{tPatient('female')}</option>
                      <option value="Other">{tPatient('other')}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-rose-700 dark:text-rose-400 mb-1">
                    {tPatient('allergies')}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Penicillin, Sulfa, Dust"
                    value={profileForm.allergies}
                    onChange={(e) => setProfileForm({ ...profileForm, allergies: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200"
                  />
                  <RomanUrduInputAssist
                    value={profileForm.allergies}
                    onApply={(val) => setProfileForm({ ...profileForm, allergies: val })}
                    isUrduMode={isPatientRTL}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {tPatient('chronicConditions')}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Type 2 Diabetes, Hypertension, Asthma"
                    value={profileForm.chronic_conditions}
                    onChange={(e) => setProfileForm({ ...profileForm, chronic_conditions: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                  <RomanUrduInputAssist
                    value={profileForm.chronic_conditions}
                    onApply={(val) => setProfileForm({ ...profileForm, chronic_conditions: val })}
                    isUrduMode={isPatientRTL}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {tPatient('currentMedicines')}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Glucophage 500mg, Panadol SOS"
                    value={profileForm.current_medicines}
                    onChange={(e) => setProfileForm({ ...profileForm, current_medicines: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                  <RomanUrduInputAssist
                    value={profileForm.current_medicines}
                    onApply={(val) => setProfileForm({ ...profileForm, current_medicines: val })}
                    isUrduMode={isPatientRTL}
                  />
                </div>

                <div className="flex gap-2 pt-3">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>{tPatient('saveHealthProfile')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                  >
                    {tPatient('cancel')}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-slate-500">{tPatient('patientName')}:</span>
                    <span className="font-bold">
                      {data?.patient?.name || user?.name}
                      {data?.patient?.nameUrdu && <span className="mr-2 text-teal-600 urdu-text">({data.patient.nameUrdu})</span>}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-slate-500">{isPatientRTL ? "ای میل ایڈریس:" : "Account Email:"}</span>
                    <span className="font-bold">{user?.email || "patient@doccare.pk"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-slate-500">{tPatient('mobileNumber')}:</span>
                    <span className="font-bold"><bdi>{data?.patient?.phone || user?.phone || "0300-4829103"}</bdi></span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">{isPatientRTL ? "عمر و جنس:" : "Age & Gender:"}</span>
                    <span className="font-bold"><bdi>{data?.patient?.age || 30}</bdi> {isPatientRTL ? "سال" : "yrs"} • {data?.patient?.gender === 'Female' ? tPatient('female') : tPatient('male')}</span>
                  </div>
                </div>

                {/* Critical Medical History */}
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40">
                  <span className="font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>{tPatient('allergies')}</span>
                  </span>
                  <p className="text-rose-900 dark:text-rose-200 font-medium">
                    {data?.patient?.allergies || (isPatientRTL ? "کوئی الرجی درج نہیں" : "None reported")}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40">
                  <span className="font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1.5 mb-1">
                    <Heart className="w-3.5 h-3.5 text-blue-600" />
                    <span>{tPatient('chronicConditions')}</span>
                  </span>
                  <p className="text-blue-900 dark:text-blue-200 font-medium">
                    {data?.patient?.chronic_conditions || (isPatientRTL ? "کوئی دائمی بیماری درج نہیں" : "None reported")}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/40">
                  <span className="font-bold text-teal-800 dark:text-teal-300 flex items-center gap-1.5 mb-1">
                    <Pill className="w-3.5 h-3.5 text-teal-600" />
                    <span>{tPatient('currentMedicines')}</span>
                  </span>
                  <p className="text-teal-900 dark:text-teal-200 font-medium">
                    {data?.patient?.current_medicines || (isPatientRTL ? "کوئی دوا درج نہیں" : "None")}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Cancel Appointment Modal with RTL and Urdu */}
      {cancelModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div 
            dir={isPatientRTL ? "rtl" : "ltr"}
            className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800"
          >
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              {tPatient('cancelModalTitle')}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {tPatient('cancelModalDesc')}
            </p>

            <textarea
              placeholder={tPatient('cancelReasonPlaceholder')}
              value={cancelModal.reason}
              onChange={(e) => setCancelModal({ ...cancelModal, reason: e.target.value })}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 mb-4 resize-none h-20"
            />

            <div className="flex gap-2">
              <button
                onClick={handleCancelAppointment}
                disabled={cancelling}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1"
              >
                {cancelling ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : tPatient('confirmCancellation')}
              </button>
              <button
                onClick={() => setCancelModal({ isOpen: false, appointmentId: null, reason: '' })}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                {tPatient('keepAppointment')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patient Prescription View & Print Modal */}
      {selectedRx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div 
            dir={isPatientRTL ? "rtl" : "ltr"}
            className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]"
          >
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400">
                  <FileText className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {isPatientRTL ? "ڈاکٹر کا سرکاری نسخہ" : "Official Medical Prescription"}
                  </h3>
                  <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400">
                    <bdi>{selectedRx.prescription_no || selectedRx.id}</bdi>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePrintRx(selectedRx)}
                  className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{isPatientRTL ? "پرنٹ کریں" : "Print"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadRx(selectedRx)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isPatientRTL ? "ڈاؤن لوڈ PDF" : "Download PDF"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRx(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body / Printable A4 Layout Container */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs text-slate-800 dark:text-slate-200">
              
              {/* Doctor / Clinic Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">
                    {selectedRx.doctor_name || "Doctor"}
                  </h2>
                  <p className="text-teal-600 dark:text-teal-400 font-semibold">
                    {selectedRx.doctor_specialty || "Medical Specialist"}
                  </p>
                  {selectedRx.doctor_pmdc && (
                    <p className="text-[11px] text-slate-500 font-mono">
                      PMDC / Reg: {selectedRx.doctor_pmdc}
                    </p>
                  )}
                  <p className="text-slate-500 mt-0.5">
                    {selectedRx.clinic_name || "DocCare Clinic"}
                  </p>
                </div>

                <div className="sm:text-right">
                  <div className="inline-block px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-mono text-xs font-bold border border-teal-200 dark:border-teal-800">
                    <bdi>{selectedRx.prescription_no || selectedRx.id}</bdi>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-1">
                    {isPatientRTL ? "تاریخ نسخہ: " : "Date: "} <bdi>{new Date(selectedRx.prescription_date || selectedRx.created_at).toLocaleDateString()}</bdi>
                  </p>
                </div>
              </div>

              {/* Patient Info Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">{isPatientRTL ? "مریض کا نام" : "Patient Name"}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedRx.patient_name || data?.patient?.name}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">{isPatientRTL ? "عمر / جنس" : "Age / Gender"}</span>
                  <span>{selectedRx.patient_age || data?.patient?.age || "—"} Yrs • {selectedRx.patient_gender || data?.patient?.gender || "—"}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">{isPatientRTL ? "تشخیص" : "Diagnosis"}</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{selectedRx.diagnosis || (isPatientRTL ? "طبی معائنہ" : "Clinical Review")}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">{isPatientRTL ? "فالو اپ" : "Follow-up"}</span>
                  <span className="font-medium text-teal-600 dark:text-teal-400">
                    {selectedRx.follow_up_date ? new Date(selectedRx.follow_up_date).toLocaleDateString() : (isPatientRTL ? "ضرورت پڑنے پر" : "As Needed")}
                  </span>
                </div>
              </div>

              {/* Prescribed Medicines (Rx) */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-teal-500/20 pb-1.5">
                  <span className="text-lg font-black text-teal-600 font-serif">℞</span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {isPatientRTL ? "تجویز کردہ ادویات اور ہدایات" : "Prescribed Medications & Dosages"}
                  </h4>
                </div>

                {selectedRx.items && selectedRx.items.length > 0 ? (
                  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                    {selectedRx.items.map((item, idx) => (
                      <div key={idx} className="p-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-[10px] font-bold flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white text-xs">
                              {item.brand_name_snapshot || item.brand_name || item.medicine_name || item.name}
                            </span>
                            {(item.strength_snapshot || item.strength) && (
                              <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300">
                                {item.strength_snapshot || item.strength}
                              </span>
                            )}
                          </div>
                          {(item.generic_name_snapshot || item.generic_name) && (
                            <p className="text-[11px] text-slate-400 ps-7">
                              Generic: {item.generic_name_snapshot || item.generic_name}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-[11px] ps-7 sm:ps-0">
                          <span className="px-2 py-0.5 rounded-lg bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 font-medium">
                            {item.dose || "1 Tab"}
                          </span>
                          <span className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 font-medium">
                            {item.frequency || "TDS (ہر 8 گھنٹے)"}
                          </span>
                          <span className="px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 font-medium">
                            {item.duration || "5 Days"}
                          </span>
                          {item.instructions && (
                            <span className="text-slate-500 italic text-[11px]">
                              ({item.instructions})
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    {isPatientRTL ? "کوئی ادویات درج نہیں کی گئیں" : "No specific medications listed."}
                  </p>
                )}
              </div>

              {/* Lab Tests & Doctor Advice */}
              {(selectedRx.tests_advised || selectedRx.doctor_instructions || selectedRx.advice) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {selectedRx.tests_advised && (
                    <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40">
                      <span className="font-bold text-amber-800 dark:text-amber-300 block mb-1">
                        {isPatientRTL ? "تجویز کردہ لیب ٹیسٹ" : "Advised Lab Tests"}
                      </span>
                      <p className="text-amber-900 dark:text-amber-200 text-xs">
                        {selectedRx.tests_advised}
                      </p>
                    </div>
                  )}

                  {(selectedRx.doctor_instructions || selectedRx.advice) && (
                    <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/40">
                      <span className="font-bold text-teal-800 dark:text-teal-300 block mb-1">
                        {isPatientRTL ? "ڈاکٹر کی عمومی ہدایات" : "Doctor's Advice"}
                      </span>
                      <p className="text-teal-900 dark:text-teal-200 text-xs">
                        {selectedRx.doctor_instructions || selectedRx.advice}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Footer Note */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400 text-center sm:text-left">
                <p>
                  {isPatientRTL ? "اللہ شفا دینے والا ہے • جلد صحت یابی کی دعا" : "DocCare Verified Electronic Prescription • Valid Across Pakistan"}
                </p>
                <p className="font-mono text-[10px]">
                  Generated via DocCare Cloud Healthcare OS
                </p>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
