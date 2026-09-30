import React, { useState, useEffect } from 'react';
import { 
  MapPin, Stethoscope, Star, Calendar, Clock, ArrowRight, ArrowLeft,
  CheckCircle2, Shield, Phone, Sparkles, Building2, User, ChevronRight, ChevronLeft,
  Filter, HeartPulse, Baby, Activity, Ear, Brain, Smile, Eye, Crosshair, 
  Flame, Wind, X, CalendarCheck, Check, Languages, HelpCircle
} from 'lucide-react';
import { api } from '../services/api';
import { usePatientLanguage } from '../context/PatientLanguageContext';
import DocCareLogo from '../components/DocCareLogo';
import SEOHead from '../components/SEOHead';
import SEOFAQSection from '../components/SEOFAQSection';

const SPECIALTY_NAMES = {
  cardiologist: 'Cardiologist',
  dermatologist: 'Dermatologist',
  gynecologist: 'Gynecologist',
  pediatrician: 'Pediatrician',
  neurologist: 'Neurologist',
  psychiatrist: 'Psychiatrist',
  'general-physician': 'General Physician',
  'ent-specialist': 'ENT Specialist',
  orthopedic: 'Orthopedic Surgeon'
};

const CITY_NAMES = {
  lahore: 'Lahore',
  karachi: 'Karachi',
  islamabad: 'Islamabad',
  rawalpindi: 'Rawalpindi',
  faisalabad: 'Faisalabad',
  multan: 'Multan',
  peshawar: 'Peshawar',
  gujranwala: 'Gujranwala',
  sialkot: 'Sialkot',
  quetta: 'Quetta'
};

export default function SEOCitySpecialtyLandingPage({ 
  cityParam = null, 
  specialtyParam = null,
  onSelectDoctor,
  onNavigateHome,
  onNavigateDoctorLogin
}) {
  const { patientLanguage, togglePatientLanguage, isPatientRTL, t } = usePatientLanguage();
  const isUrdu = patientLanguage === 'ur';

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Normalize city & specialty names
  const cityName = cityParam ? (CITY_NAMES[cityParam.toLowerCase()] || cityParam.charAt(0).toUpperCase() + cityParam.slice(1)) : null;
  const specialtyName = specialtyParam ? (SPECIALTY_NAMES[specialtyParam.toLowerCase()] || specialtyParam.charAt(0).toUpperCase() + specialtyParam.slice(1)) : null;

  // Compute Page Title & SEO Headline
  let pageTitle = '';
  let pageH1 = '';
  let pageDescription = '';

  if (cityName && specialtyName) {
    pageTitle = `${specialtyName}s in ${cityName} | Find & Book Appointments | DocCare`;
    pageH1 = `Best ${specialtyName}s in ${cityName}`;
    pageDescription = `Find top-rated ${specialtyName}s in ${cityName}, Pakistan. Compare consultation fees, check real-time appointment availability, and book your visit on DocCare.`;
  } else if (cityName) {
    pageTitle = `Doctors in ${cityName} | Find & Book Appointments | DocCare`;
    pageH1 = `Find Doctors in ${cityName}`;
    pageDescription = `Discover PMDC-verified specialist doctors and general physicians in ${cityName}, Pakistan. View consultation charges, clinic addresses, and book appointment slots online.`;
  } else if (specialtyName) {
    pageTitle = `${specialtyName}s in Pakistan | Find & Book Specialists | DocCare`;
    pageH1 = `Find ${specialtyName}s in Pakistan`;
    pageDescription = `Browse top certified ${specialtyName}s across Pakistan. Check fees, qualifications, clinic locations, and book your medical appointment easily on DocCare.`;
  } else {
    pageTitle = 'Find Doctors & Book Appointments in Pakistan | DocCare';
    pageH1 = 'Find a Doctor in Pakistan';
    pageDescription = 'Search doctors by city and specialty, check consultation fees and availability, and book an appointment with DocCare.';
  }

  useEffect(() => {
    async function loadDoctors() {
      setLoading(true);
      try {
        const queryParams = {};
        if (cityName) queryParams.city = cityName;
        if (specialtyName) queryParams.specialty = specialtyName;

        const res = await api.getPublicDoctors(queryParams);
        if (res.success && Array.isArray(res.doctors)) {
          setDoctors(res.doctors);
        } else {
          setDoctors([]);
        }
      } catch (err) {
        console.error('Failed to load doctors for SEO landing page:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDoctors();
  }, [cityName, specialtyName]);

  // Breadcrumbs for SEO
  const breadcrumbs = [
    { name: 'Home', url: 'https://doccare.pk' },
    { name: 'Doctors', url: 'https://doccare.pk/find-doctors' }
  ];
  if (cityName) {
    breadcrumbs.push({ name: cityName, url: `https://doccare.pk/doctors/${cityParam.toLowerCase()}` });
  }
  if (specialtyName) {
    breadcrumbs.push({ 
      name: specialtyName, 
      url: cityName 
        ? `https://doccare.pk/doctors/${cityParam.toLowerCase()}/${specialtyParam.toLowerCase()}` 
        : `https://doccare.pk/specialists/${specialtyParam.toLowerCase()}` 
    });
  }

  // Physician Schema
  const doctorSchemas = doctors.map((doc) => ({
    '@context': 'https://schema.org',
    '@type': 'Physician',
    'name': doc.name,
    'medicalSpecialty': doc.specialization,
    'description': `${doc.specialization} at ${doc.clinicName || 'Clinic'}, ${doc.city}`,
    'telephone': doc.phone || '+92 300 0000000',
    'address': {
      '@type': 'PostalAddress',
      'addressLocality': doc.city,
      'addressCountry': 'PK'
    },
    'priceRange': `PKR ${doc.consultationFee || 1500}`
  }));

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white ${isPatientRTL ? 'urdu-text' : 'font-sans'}`}>
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        canonicalUrl={window.location.href}
        breadcrumbs={breadcrumbs}
        schemaData={doctorSchemas}
        lang={patientLanguage}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div 
            className="flex items-center gap-2 sm:gap-3 cursor-pointer select-none" 
            onClick={onNavigateHome}
          >
            <DocCareLogo variant="compact" size="sm" animated={true} />
            <span className="px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-[10px] font-bold border border-teal-200/60 dark:border-teal-800 uppercase tracking-wide">
              {isUrdu ? 'مریض پورٹل' : 'Patient Portal'}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={togglePatientLanguage}
              className="px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800 font-bold text-xs hover:bg-teal-100 transition-all flex items-center gap-1.5"
            >
              <Languages className="w-3.5 h-3.5 text-teal-600" />
              <span>{patientLanguage === 'en' ? 'اردو' : 'English'}</span>
            </button>
            <button
              onClick={onNavigateDoctorLogin}
              className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs hover:bg-slate-800 transition-all flex items-center gap-1"
            >
              <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
              <span>{isUrdu ? 'ڈاکٹر پورٹل' : 'Doctor Login'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Breadcrumbs Navigation */}
      <nav className="bg-white dark:bg-slate-900/50 border-b border-slate-200/60 dark:border-slate-800/60 py-2.5 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex items-center gap-2 flex-wrap">
          <button onClick={onNavigateHome} className="hover:text-teal-600 font-medium">Home</button>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <button onClick={onNavigateHome} className="hover:text-teal-600 font-medium">Doctors</button>
          {cityName && (
            <>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span className="text-slate-700 dark:text-slate-300 font-semibold">{cityName}</span>
            </>
          )}
          {specialtyName && (
            <>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span className="text-teal-600 dark:text-teal-400 font-bold">{specialtyName}</span>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-teal-500/10 via-slate-50 to-slate-50 dark:from-teal-950/20 dark:via-slate-950 dark:to-slate-950 py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-200/60 dark:border-slate-800">
        <div className="max-w-7xl mx-auto text-center max-w-3xl">
          <span className="px-3 py-1 rounded-full bg-teal-100/80 dark:bg-teal-900/50 text-teal-800 dark:text-teal-200 text-xs font-bold border border-teal-200 dark:border-teal-800 uppercase tracking-wider inline-flex items-center gap-1.5 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Verified PMDC Practitioners</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            {pageH1}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
            {pageDescription}
          </p>

          {/* Quick City Matrix Links */}
          <div className="mt-6 flex items-center justify-center gap-2 flex-wrap text-xs">
            <span className="text-slate-400 font-medium">Explore Cities:</span>
            {['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar'].map((c) => (
              <a
                key={c}
                href={`/doctors/${c.toLowerCase()}`}
                onClick={(e) => {
                  e.preventDefault();
                  window.history.pushState({}, '', `/doctors/${c.toLowerCase()}`);
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
                className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition-colors ${
                  cityName === c
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-teal-400'
                }`}
              >
                {c}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Main Results Directory */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Available Specialists ({doctors.length})
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Real-time practice sync
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
            ))}
          </div>
        ) : doctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/70 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-700 dark:text-teal-300 font-extrabold text-lg shrink-0">
                      {doctor.name.replace('Dr. ', '').charAt(0)}
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-400 block">Fee</span>
                      <span className="text-base font-extrabold text-teal-700 dark:text-teal-300">
                        PKR {doctor.consultationFee || 1500}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {doctor.name}
                  </h3>
                  <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 mt-0.5">
                    {doctor.specialization}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    {doctor.qualifications || 'MBBS, FCPS'}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{doctor.clinicName || 'Shifa Executive Clinic'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{doctor.city}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 flex items-center gap-2">
                  <button
                    onClick={() => onSelectDoctor(doctor.slug || doctor.id, false)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => onSelectDoctor(doctor.slug || doctor.id, true)}
                    className="flex-1 py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-sm"
                  >
                    <CalendarCheck className="w-3.5 h-3.5" />
                    <span>Book Now</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
            <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-white">No doctors listed in this specific filter</h3>
            <p className="text-xs text-slate-500 mt-1">Browse our complete Pakistan directory or switch your city.</p>
            <button
              onClick={onNavigateHome}
              className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 transition-colors"
            >
              Browse All Doctors
            </button>
          </div>
        )}
      </main>

      {/* SEO FAQ Section with Structured Data */}
      <SEOFAQSection className="bg-white dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 my-10" />

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <DocCareLogo variant="compact" size="sm" showTagline={false} />
          <p>© {new Date().getFullYear()} DocCare Pakistan. PMDC-Enforced Clinical Practice Platform.</p>
          <div className="flex items-center gap-4">
            <button onClick={onNavigateHome} className="hover:text-white">Find Doctors</button>
            <button onClick={onNavigateDoctorLogin} className="hover:text-white">Doctor Portal</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
