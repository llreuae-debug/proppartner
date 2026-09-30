import React, { useState, useEffect } from 'react';
import { 
  Search, MapPin, Stethoscope, Star, Calendar, Clock, ArrowRight, ArrowLeft,
  CheckCircle2, Shield, Phone, Sparkles, Building2, User, ChevronRight, ChevronLeft,
  Filter, HeartPulse, Baby, Activity, Ear, Brain, Smile, Eye, Crosshair, 
  Flame, Wind, X, ExternalLink, CalendarCheck, Check, Languages
} from 'lucide-react';
import { api } from '../services/api';
import { usePatientLanguage } from '../context/PatientLanguageContext';
import { transliterateRomanUrdu, expandSearchTerms } from '../utils/romanUrduTranslator';
import RomanUrduInputAssist from '../components/RomanUrduInputAssist';
import DocCareLogo from '../components/DocCareLogo';
import SEOHead from '../components/SEOHead';
import SEOFAQSection from '../components/SEOFAQSection';

const SPECIALTY_ICONS = {
  "General Physician": Stethoscope,
  "Cardiologist": HeartPulse,
  "Pediatrician": Baby,
  "Dermatologist": Sparkles,
  "Gynecologist": User,
  "Orthopedic": Activity,
  "ENT Specialist": Ear,
  "Neurologist": Brain,
  "Psychiatrist": Smile,
  "Dentist": Smile,
  "Ophthalmologist": Eye,
  "Gastroenterologist": Shield,
  "Urologist": Crosshair,
  "Endocrinologist": Flame,
  "Pulmonologist": Wind
};

const CITY_URDU_MAP = {
  "Lahore": "لاہور",
  "Karachi": "کراچی",
  "Islamabad": "اسلام آباد",
  "Rawalpindi": "راولپنڈی",
  "Faisalabad": "فیصل آباد",
  "Multan": "ملتان",
  "Peshawar": "پشاور",
  "Quetta": "کوئٹہ",
  "Sialkot": "سیالکوٹ",
  "Gujranwala": "گوجرانوالہ"
};

const SPECIALTY_URDU_MAP = {
  "General Physician": "جنرل فزیشن (معالجِ عمومی)",
  "Cardiologist": "ماہر امراض قلب (کارڈیالوجسٹ)",
  "Pediatrician": "ماہر امراض اطفال (بچوں کے ڈاکٹر)",
  "Dermatologist": "ماہر امراض جلد (ڈرماٹالوجسٹ)",
  "Gynecologist": "ماہر امراض نسواں (گائناکالوجسٹ)",
  "Orthopedic": "ماہر امراض ہڈی و جوڑ (آرتھوپیڈک)",
  "ENT Specialist": "ماہر امراض کان، ناک، گلا (ای این ٹی)",
  "Neurologist": "ماہر امراض اعصاب و دماغ",
  "Psychiatrist": "ماہر نفسیات (سائیکاٹرسٹ)",
  "Dentist": "ماہر امراض دندان (ڈینٹسٹ)",
  "Ophthalmologist": "ماہر امراض چشم (آنکھوں کے ڈاکٹر)",
  "Gastroenterologist": "ماہر امراض معدہ و جگر",
  "Urologist": "ماہر امراض گردہ و مثانہ",
  "Endocrinologist": "ماہر غدود و شوگر",
  "Pulmonologist": "ماہر امراض سینہ و پھیپھڑے"
};

export default function FindDoctorPage({ onSelectDoctor, onNavigateDoctorLogin, onTrackAppointment }) {
  const { patientLang, togglePatientLanguage, tPatient, isPatientRTL } = usePatientLanguage();

  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Appointment Tracking Quick State
  const [trackingId, setTrackingId] = useState('');
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [trackedAppointment, setTrackedAppointment] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState(null);

  useEffect(() => {
    loadPublicData();
  }, [selectedCity, selectedSpecialty]);

  const loadPublicData = async () => {
    try {
      setLoading(true);
      const [docsRes, specsRes, citiesRes] = await Promise.all([
        api.getPublicDoctors({ 
          city: selectedCity !== 'All' ? selectedCity : '', 
          specialty: selectedSpecialty !== 'All' ? selectedSpecialty : '',
          search: searchQuery 
        }),
        api.getPublicSpecialties().catch(() => ({ specialties: [] })),
        api.getPublicCities().catch(() => ({ cities: [] }))
      ]);

      setDoctors(docsRes.doctors || []);
      if (specsRes.specialties?.length) setSpecialties(specsRes.specialties);
      if (citiesRes.cities?.length) setCities(citiesRes.cities);
    } catch (err) {
      console.error("Failed to load public discovery catalog:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadPublicData();
  };

  const handleTrackSubmit = async (e) => {
    e.preventDefault();
    if (!trackingId.trim()) return;
    try {
      setTrackingLoading(true);
      setTrackingError(null);
      const res = await api.getPublicAppointmentStatus(trackingId.trim());
      setTrackedAppointment(res.appointment);
    } catch (err) {
      setTrackingError(err.message || (isPatientRTL ? "اپائنٹمنٹ نہیں ملی۔ براہ کرم اپائنٹمنٹ کوڈ چیک کریں (مثلاً DC-APT-...)" : "Appointment not found. Please verify your Appointment ID (e.g. DC-APT-...)"));
      setTrackedAppointment(null);
    } finally {
      setTrackingLoading(false);
    }
  };

  return (
    <div 
      dir={isPatientRTL ? "rtl" : "ltr"} 
      className={`min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors ${
        isPatientRTL ? 'urdu-text' : 'font-sans'
      }`}
    >
      <SEOHead
        title={isPatientRTL ? 'DocCare | پاکستان میں ڈاکٹرز تلاش کریں اور اپائنٹمنٹ بک کریں' : 'DocCare | Find Doctors & Book Appointments in Pakistan'}
        description={isPatientRTL ? 'پاکستان میں شہر اور اسپیشلٹی کے مطابق تصدیق شدہ ڈاکٹرز تلاش کریں، فیس اور دستیاب وقت دیکھ کر فوری اپائنٹمنٹ بک کریں۔' : 'Find doctors in Pakistan by city and specialty. View profiles, fees and availability, then book your doctor appointment with DocCare.'}
        canonicalUrl="https://doccare.pk/find-doctors"
        breadcrumbs={[
          { name: 'Home', url: 'https://doccare.pk' },
          { name: 'Find Doctors', url: 'https://doccare.pk/find-doctors' }
        ]}
        lang={patientLang}
      />
      
      {/* Top Patient Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <div 
            className="flex items-center gap-2 sm:gap-3 cursor-pointer select-none" 
            onClick={() => { setSelectedCity('All'); setSelectedSpecialty('All'); setSearchQuery(''); }}
          >
            <DocCareLogo variant="compact" size="sm" animated={true} />
            <span className="px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-[10px] font-bold border border-teal-200/60 dark:border-teal-800 uppercase tracking-wide">
              {tPatient('patientPortal')}
            </span>
          </div>

          {/* Right Controls: Language Switcher, Track Booking, Doctor Portal */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher Pill */}
            <button
              onClick={togglePatientLanguage}
              className="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800 font-bold text-xs hover:bg-teal-100 transition-all flex items-center gap-1.5"
              title="Switch English / اردو"
            >
              <Languages className="w-3.5 h-3.5 text-teal-600" />
              <span>{patientLang === 'en' ? 'اردو' : 'English'}</span>
            </button>

            {/* Track Booking Button */}
            <button
              onClick={() => setTrackingModalOpen(true)}
              className="px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-teal-700 hover:bg-teal-50/60 rounded-xl transition-colors flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
            >
              <CalendarCheck className="w-4 h-4 text-teal-600" />
              <span className="hidden sm:inline">{tPatient('trackAppointment')}</span>
              <span className="sm:hidden">{tPatient('trackBtn')}</span>
            </button>

            {/* Doctor Portal Link */}
            <button
              onClick={onNavigateDoctorLogin}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              <span>{tPatient('doctorLogin')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Search Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-800 via-teal-900 to-slate-900 text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-200 text-xs font-semibold backdrop-blur-md">
            <Shield className="w-3.5 h-3.5 text-teal-300" />
            <span>{tPatient('verifiedBadge')}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            {tPatient('findHeader')}
          </h1>
          <p className="text-xs sm:text-sm text-teal-100 max-w-2xl mx-auto font-normal">
            {tPatient('findSubtitle')}
          </p>

          {/* Search Box Bar */}
          <form onSubmit={handleSearchSubmit} className="mt-8 bg-white dark:bg-slate-800 p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 flex flex-col sm:flex-row items-center gap-2 text-slate-800 dark:text-white">
            
            {/* City Selector */}
            <div className={`w-full sm:w-1/3 flex items-center gap-2 px-3 py-2 ${isPatientRTL ? 'sm:border-l' : 'sm:border-r'} border-slate-200 dark:border-slate-700`}>
              <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-800 dark:text-white focus:outline-none cursor-pointer"
              >
                <option value="All">{tPatient('allCities')}</option>
                {cities.map(c => (
                  <option key={c.name} value={c.name}>
                    {isPatientRTL ? (CITY_URDU_MAP[c.name] || c.name) : c.name} ({c.doctorCount})
                  </option>
                ))}
              </select>
            </div>

            {/* Specialty Selector */}
            <div className={`w-full sm:w-1/3 flex items-center gap-2 px-3 py-2 ${isPatientRTL ? 'sm:border-l' : 'sm:border-r'} border-slate-200 dark:border-slate-700`}>
              <Stethoscope className="w-4 h-4 text-teal-600 shrink-0" />
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-800 dark:text-white focus:outline-none cursor-pointer"
              >
                <option value="All">{tPatient('allSpecialties')}</option>
                {specialties.map(s => (
                  <option key={s.name} value={s.name}>
                    {isPatientRTL ? (SPECIALTY_URDU_MAP[s.name] || s.name) : s.name} ({s.doctorCount})
                  </option>
                ))}
              </select>
            </div>

            {/* Keyword Search with Roman Urdu Assisted Transliteration */}
            <div className="w-full sm:w-1/3 flex flex-col justify-center px-3 py-2">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={tPatient('searchPlaceholder')}
                  className="w-full bg-transparent text-xs sm:text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold rounded-xl sm:rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>{isPatientRTL ? "تلاش کریں" : "Search"}</span>
            </button>
          </form>

          {/* Roman Urdu Transliteration Assistant Box */}
          <div className="max-w-xl mx-auto">
            <RomanUrduInputAssist
              value={searchQuery}
              onApply={(suggested) => {
                setSearchQuery(suggested);
              }}
              isUrduMode={isPatientRTL}
            />
          </div>

          {/* Quick City Pills */}
          <div className="flex items-center justify-center flex-wrap gap-1.5 pt-3">
            <span className="text-[11px] text-teal-200 font-medium mr-1">
              {isPatientRTL ? "مشہور شہر:" : "Popular Cities:"}
            </span>
            {["Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar"].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedCity(c)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                  selectedCity === c 
                    ? 'bg-white text-teal-900 shadow-sm font-bold' 
                    : 'bg-teal-700/40 text-teal-100 hover:bg-teal-700/70 border border-teal-500/30'
                }`}
              >
                {isPatientRTL ? (CITY_URDU_MAP[c] || c) : c}
              </button>
            ))}
            {selectedCity !== 'All' && (
              <button
                type="button"
                onClick={() => setSelectedCity('All')}
                className="px-2 py-1 rounded-full text-xs text-teal-300 hover:text-white flex items-center gap-1"
              >
                <X className="w-3 h-3" /> {isPatientRTL ? "صاف کریں" : "Clear"}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Specialties Browse Strip */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>{isPatientRTL ? "شعبہ جات و اسپیشلٹیز" : "Browse by Medical Specialty"}</span>
            </h2>
            {selectedSpecialty !== 'All' && (
              <button
                onClick={() => setSelectedSpecialty('All')}
                className="text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline"
              >
                {isPatientRTL ? "تمام شعبہ جات دیکھیں" : "Show All Specialties"}
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2.5">
            {specialties.slice(0, 12).map((s) => {
              const IconComponent = SPECIALTY_ICONS[s.name] || Stethoscope;
              const isSelected = selectedSpecialty.toLowerCase() === s.name.toLowerCase();

              return (
                <button
                  key={s.name}
                  onClick={() => setSelectedSpecialty(isSelected ? 'All' : s.name)}
                  className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between gap-2 group ${
                    isSelected
                      ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-600 shadow-sm ring-1 ring-teal-600'
                      : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 hover:border-teal-200 border-slate-200/80 dark:border-slate-700'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-teal-600 text-white' : 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs group-hover:bg-teal-50'
                  }`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-white leading-tight line-clamp-1">
                      {isPatientRTL ? (SPECIALTY_URDU_MAP[s.name] || s.name) : s.name}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      <bdi>{s.doctorCount}</bdi> {isPatientRTL ? "ڈاکٹرز" : "Doctors"}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Doctor Search Results Main Feed */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Results Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>{isPatientRTL ? "دستیاب ڈاکٹرز" : "Available Doctors"}</span>
              <span className="px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-xs font-bold border border-teal-200/60 dark:border-teal-800 font-mono">
                <bdi>{doctors.length}</bdi> {isPatientRTL ? "مستند معالج" : "Verified"}
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isPatientRTL ? "کلینک اوقات، معائنہ فیس اور فوری آن لائن اپائنٹمنٹ بکنگ" : "Instant appointment booking with transparent fee schedule and live slots"}
            </p>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 rounded-full border-3 border-teal-600 border-t-transparent animate-spin mb-3"></div>
            <p className="text-xs text-slate-500 font-semibold">{isPatientRTL ? "ڈاکٹرز کی فہرست لوڈ ہو رہی ہے..." : "Loading doctor directory..."}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && doctors.length === 0 && (
          <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center max-w-md mx-auto">
            <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {isPatientRTL ? "کوئی معالج نہیں ملا" : "No Doctors Found"}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {isPatientRTL ? "براہ کرم تلاش کا معیار، شہر یا اسپیشلٹی کا فلٹر تبدیل کر کے دوبارہ کوشش کریں۔" : "Please try clearing filters or searching for another city or specialty."}
            </p>
            <button
              onClick={() => { setSelectedCity('All'); setSelectedSpecialty('All'); setSearchQuery(''); }}
              className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-teal-700"
            >
              {isPatientRTL ? "تمام ڈاکٹرز دکھائیں" : "Reset All Filters"}
            </button>
          </div>
        )}

        {/* Doctor Cards Grid */}
        {!loading && doctors.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {doctors.map((doc) => (
              <div 
                key={doc.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm hover:shadow-xl hover:border-teal-300 dark:hover:border-teal-700 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Doctor Row */}
                  <div className="flex items-start gap-3.5 mb-4">
                    <img
                      src={doc.profileImage}
                      alt={doc.name}
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-teal-500/20 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
                          {doc.name}
                        </h3>
                        <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" title={tPatient('verifiedPmdc')} />
                      </div>
                      
                      <p className="text-xs font-semibold text-teal-700 dark:text-teal-400 truncate mt-0.5">
                        {isPatientRTL ? (SPECIALTY_URDU_MAP[doc.specialization] || doc.specialization) : doc.specialization}
                      </p>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {doc.qualifications}
                      </p>

                      <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1 font-bold text-amber-600">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <bdi>{doc.rating || 4.9}</bdi>
                        </span>
                        <span>•</span>
                        <span>
                          <bdi>{doc.experienceYears || 5}</bdi> {tPatient('experienceYears')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Clinic Location & Fee Row */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl space-y-1.5 mb-4 text-xs">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-semibold truncate">{doc.clinicName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{doc.address}, {isPatientRTL ? (CITY_URDU_MAP[doc.city] || doc.city) : doc.city}</span>
                    </div>
                  </div>

                  {/* Consultation Fee & Next Slot Badge */}
                  <div className="flex items-center justify-between gap-2 mb-4 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">{tPatient('feeLabel')}</span>
                      <span className="text-sm font-black text-slate-900 dark:text-white">
                        <bdi>Rs. {doc.consultationFee || 2000}</bdi>
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-teal-600 dark:text-teal-400 block">{tPatient('nextAvailable')}</span>
                      <span className="text-xs font-bold text-teal-800 dark:text-teal-200">
                        {isPatientRTL ? "آج شام کے اوقات" : "Today Evening"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action CTAs */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => onSelectDoctor(doc.slug || doc.id, false)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors text-center"
                  >
                    {tPatient('viewProfile')}
                  </button>

                  <button
                    onClick={() => onSelectDoctor(doc.slug || doc.id, true)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <span>{tPatient('bookNow')}</span>
                    {isPatientRTL ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* SEO Section: City Matrix Directory */}
      <section className="bg-white dark:bg-slate-900/60 border-t border-b border-slate-200/80 dark:border-slate-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          
          {/* Find Doctors by City */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-teal-600" />
                <span>{isPatientRTL ? 'شہر کے لحاظ سے ڈاکٹرز تلاش کریں' : 'Find Doctors by City'}</span>
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {[
                { city: 'Lahore', urdu: 'لاہور', slug: 'lahore', doctors: '250+' },
                { city: 'Karachi', urdu: 'کراچی', slug: 'karachi', doctors: '320+' },
                { city: 'Islamabad', urdu: 'اسلام آباد', slug: 'islamabad', doctors: '180+' },
                { city: 'Rawalpindi', urdu: 'راولپنڈی', slug: 'rawalpindi', doctors: '140+' },
                { city: 'Faisalabad', urdu: 'فیصل آباد', slug: 'faisalabad', doctors: '110+' },
                { city: 'Multan', urdu: 'ملتان', slug: 'multan', doctors: '95+' },
                { city: 'Peshawar', urdu: 'پشاور', slug: 'peshawar', doctors: '85+' },
                { city: 'Gujranwala', urdu: 'گوجرانوالہ', slug: 'gujranwala', doctors: '70+' },
                { city: 'Sialkot', urdu: 'سیالکوٹ', slug: 'sialkot', doctors: '60+' },
                { city: 'Quetta', urdu: 'کوئٹہ', slug: 'quetta', doctors: '45+' }
              ].map((item) => (
                <a
                  key={item.slug}
                  href={`/doctors/${item.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    window.history.pushState({}, '', `/doctors/${item.slug}`);
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 hover:border-teal-500 transition-all block group"
                >
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-teal-600 block">
                    {isPatientRTL ? `ڈاکٹرز ${item.urdu}` : `Doctors in ${item.city}`}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {item.doctors} {isPatientRTL ? 'ماہرین' : 'Specialists'}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Find Doctors by Specialty */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-teal-600" />
                <span>{isPatientRTL ? 'اسپیشلٹی کے لحاظ سے ڈاکٹرز تلاش کریں' : 'Find Doctors by Specialty'}</span>
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {[
                { name: 'Cardiologists', urdu: 'ماہر امراضِ قلب', slug: 'cardiologist' },
                { name: 'Dermatologists', urdu: 'ماہر امراضِ جلد', slug: 'dermatologist' },
                { name: 'Gynecologists', urdu: 'ماہر امراضِ نسواں', slug: 'gynecologist' },
                { name: 'Pediatricians', urdu: 'ماہر امراضِ اطفال', slug: 'pediatrician' },
                { name: 'Neurologists', urdu: 'ماہر امراض دماغ و اعصاب', slug: 'neurologist' },
                { name: 'Psychiatrists', urdu: 'ماہر نفسیات', slug: 'psychiatrist' },
                { name: 'Orthopedic Surgeons', urdu: 'ماہر امراض ہڈی و جوڑ', slug: 'orthopedic' },
                { name: 'General Physicians', urdu: 'معالجِ عمومی', slug: 'general-physician' }
              ].map((sp) => (
                <a
                  key={sp.slug}
                  href={`/specialists/${sp.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    window.history.pushState({}, '', `/specialists/${sp.slug}`);
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 hover:border-teal-500 transition-all block group"
                >
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-teal-600 block">
                    {isPatientRTL ? sp.urdu : sp.name}
                  </span>
                  <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">
                    {isPatientRTL ? 'آن لائن بکنگ' : 'Instant Booking'}
                  </span>
                </a>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* How DocCare Works Section */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {isPatientRTL ? 'DocCare کیسے کام کرتا ہے؟' : 'How DocCare Works'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            {isPatientRTL ? '5 آسان مراحل میں اپنے ڈاکٹر کے ساتھ اپائنٹمنٹ بک کریں' : '5 simple steps to discover doctors and book your confirmed clinic appointment'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 text-center">
          {[
            { step: '1', title: isPatientRTL ? 'شہر منتخب کریں' : 'Search City', desc: isPatientRTL ? 'لاہور، کراچی، اسلام آباد یا دیگر شہر' : 'Filter by your city & neighborhood' },
            { step: '2', title: isPatientRTL ? 'اسپیشلٹی چنیں' : 'Select Specialty', desc: isPatientRTL ? 'امراض قلب، جلد، نسواں یا فزیشن' : 'Cardiologist, Skin, or Physician' },
            { step: '3', title: isPatientRTL ? 'پروفائل دیکھیں' : 'View Profiles', desc: isPatientRTL ? 'فیس، کلینک اور تعلیمی قابلیت' : 'Check consultation fees & credentials' },
            { step: '4', title: isPatientRTL ? 'وقت کا انتخاب' : 'Pick Open Slot', desc: isPatientRTL ? 'لائیو کلینک کیلنڈر سے وقت منتخب کریں' : 'Real-time 15-min calendar slots' },
            { step: '5', title: isPatientRTL ? 'اپائنٹمنٹ تصدیق' : 'Instant Booking', desc: isPatientRTL ? 'موبائل پر فوری ڈیجیٹل ٹوکن حاصل کریں' : 'Receive your confirmed appointment token' }
          ].map((item) => (
            <div key={item.step} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col items-center">
              <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white font-black text-base flex items-center justify-center mb-3 shadow-md shadow-teal-600/20">
                {item.step}
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                {item.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Use DocCare Section */}
      <section className="bg-slate-900 text-white py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {isPatientRTL ? 'DocCare کیوں منتخب کریں؟' : 'Why Patients & Doctors Choose DocCare'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              {isPatientRTL ? 'شفافیت، سہولت اور پاکستان کا جدید ترین ڈیجیٹل پریکٹس پلیٹ فارم' : 'Transparent fees, live practice sync, and seamless English + Urdu experience'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: isPatientRTL ? 'شہر کے مطابق تلاش' : 'City-Based Discovery', desc: isPatientRTL ? 'پاکستان کے تمام بڑے شہروں اور علاقوں کے ماہرین' : 'Quick access to top doctors across major Pakistani cities.' },
              { title: isPatientRTL ? 'شفاف فیس' : 'Transparent Fees', desc: isPatientRTL ? 'ہر ڈاکٹر کی فیس پہلے سے واضح، صفر اضافی چارجز' : '100% upfront consultation charges with zero booking platform fee.' },
              { title: isPatientRTL ? 'حقیقی وقت کی دستیابی' : 'Live Practice Availability', desc: isPatientRTL ? 'ڈاکٹر کے کلینک کیلنڈر کے ساتھ لائیو شیڈول' : 'Direct calendar sync with doctor appointments and no double-booking.' },
              { title: isPatientRTL ? 'اردو اور موبائل فرینڈلی' : 'Bilingual & Mobile-First', desc: isPatientRTL ? 'مکمل اردو، RTL اور رومن اردو ٹائپنگ سپورٹ' : 'Native Urdu, RTL navigation, and Roman Urdu typing assistance.' }
            ].map((feature, idx) => (
              <div key={idx} className="p-5 rounded-3xl bg-slate-800/80 border border-slate-700/80">
                <CheckCircle2 className="w-6 h-6 text-teal-400 mb-3" />
                <h3 className="text-base font-bold text-white mb-1.5">{feature.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEO FAQ Section */}
      <SEOFAQSection />

      {/* Comprehensive SEO Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <DocCareLogo variant="horizontal" size="sm" showTagline={true} />
            <p className="text-slate-500 text-center md:text-right">
              DocCare Pakistan • Find Doctors, Check Fees, and Book Confirmed Appointments.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-slate-400">
            <div>
              <h4 className="font-bold text-white mb-2.5">Top Cities</h4>
              <ul className="space-y-1.5">
                {[
                  { label: 'Doctors in Lahore', slug: 'lahore' },
                  { label: 'Doctors in Karachi', slug: 'karachi' },
                  { label: 'Doctors in Islamabad', slug: 'islamabad' },
                  { label: 'Doctors in Faisalabad', slug: 'faisalabad' },
                  { label: 'Doctors in Rawalpindi', slug: 'rawalpindi' }
                ].map(c => (
                  <li key={c.slug}>
                    <a
                      href={`/doctors/${c.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        window.history.pushState({}, '', `/doctors/${c.slug}`);
                        window.dispatchEvent(new PopStateEvent('popstate'));
                      }}
                      className="hover:text-teal-400 cursor-pointer"
                    >
                      {c.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-2.5">Specialties</h4>
              <ul className="space-y-1.5">
                {[
                  { label: 'Cardiologists', slug: 'cardiologist' },
                  { label: 'Dermatologists', slug: 'dermatologist' },
                  { label: 'Gynecologists', slug: 'gynecologist' },
                  { label: 'Pediatricians', slug: 'pediatrician' },
                  { label: 'General Physicians', slug: 'general-physician' }
                ].map(s => (
                  <li key={s.slug}>
                    <a
                      href={`/specialists/${s.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        window.history.pushState({}, '', `/specialists/${s.slug}`);
                        window.dispatchEvent(new PopStateEvent('popstate'));
                      }}
                      className="hover:text-teal-400 cursor-pointer"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-2.5">For Doctors</h4>
              <ul className="space-y-1.5">
                <li><button onClick={onNavigateDoctorLogin} className="hover:text-teal-400">Doctor Portal Login</button></li>
                <li><button onClick={onNavigateDoctorLogin} className="hover:text-teal-400">Doctor Practice Management</button></li>
                <li><button onClick={onNavigateDoctorLogin} className="hover:text-teal-400">Digital Prescription Writer</button></li>
                <li><button onClick={onNavigateDoctorLogin} className="hover:text-teal-400">Doctor Ledger & Accounting</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-2.5">DocCare Platform</h4>
              <ul className="space-y-1.5">
                <li><span className="text-slate-500">256-Bit Encrypted Healthcare</span></li>
                <li><span className="text-slate-500">PMDC Registration Verified</span></li>
                <li><span className="text-slate-500">WhatsApp Prescription Links</span></li>
                <li><span className="text-slate-500">English + Urdu RTL Support</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-900 text-center text-slate-600 text-[11px]">
            © {new Date().getFullYear()} DocCare Pakistan. All Rights Reserved. Not a substitute for emergency medical care.
          </div>
        </div>
      </footer>

      {/* Appointment Tracking Modal */}
      {trackingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div 
            dir={isPatientRTL ? "rtl" : "ltr"} 
            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative"
          >
            <button
              onClick={() => { setTrackingModalOpen(false); setTrackedAppointment(null); setTrackingError(null); }}
              className={`absolute top-4 ${isPatientRTL ? 'left-4' : 'right-4'} p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors`}
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-teal-600" />
              <span>{tPatient('trackAppointment')}</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {tPatient('enterTrackingCode')}
            </p>

            <form onSubmit={handleTrackSubmit} className="space-y-3">
              <input
                type="text"
                required
                placeholder="e.g. DC-APT-849201"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                className="w-full px-3 py-2.5 text-xs font-mono font-bold uppercase rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />

              <button
                type="submit"
                disabled={trackingLoading}
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                {trackingLoading ? "..." : tPatient('trackBtn')}
              </button>
            </form>

            {trackingError && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs border border-rose-200 dark:border-rose-900">
                {trackingError}
              </div>
            )}

            {trackedAppointment && (
              <div className="mt-4 p-4 rounded-2xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs space-y-2">
                <div className="flex justify-between items-center pb-2 border-b border-teal-200/60">
                  <span className="font-bold text-teal-950 dark:text-teal-200">
                    <bdi>#{trackedAppointment.id}</bdi>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-teal-600 text-white font-bold text-[10px] uppercase">
                    {trackedAppointment.status}
                  </span>
                </div>

                <div className="space-y-1 text-slate-700 dark:text-slate-300">
                  <p><strong>{tPatient('patientName')}:</strong> {trackedAppointment.patient_name || trackedAppointment.patient?.name}</p>
                  <p><strong>{isPatientRTL ? "تاریخ و وقت:" : "Date & Time:"}</strong> {trackedAppointment.date} • {trackedAppointment.start_time}</p>
                  <p><strong>{isPatientRTL ? "کلینک:" : "Clinic:"}</strong> {trackedAppointment.doctor?.clinicName || "Medical Clinic"}</p>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
