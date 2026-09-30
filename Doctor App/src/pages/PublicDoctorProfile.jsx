import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Calendar, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  ExternalLink, 
  AlertTriangle, 
  Loader2, 
  CalendarCheck, 
  Activity, 
  Heart, 
  ArrowRight, 
  ArrowLeft, 
  MessageCircle, 
  Download, 
  Share2, 
  CheckCircle2,
  Languages
} from 'lucide-react';
import { api } from '../services/api';
import { usePatientLanguage } from '../context/PatientLanguageContext';
import RomanUrduInputAssist from '../components/RomanUrduInputAssist';
import DocCareLogo from '../components/DocCareLogo';
import SEOHead from '../components/SEOHead';

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

export default function PublicDoctorProfile({ slug, onBackToApp, autoOpenBooking = false }) {
  const { patientLang, togglePatientLanguage, tPatient, isPatientRTL } = usePatientLanguage();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // 3-Step Wizard State: 1 = Date, 2 = Slot, 3 = Patient Info
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [slotsData, setSlotsData] = useState({ available: true, slots: [] });
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Step 3 Patient Form State (With English + Urdu Name fields)
  const [patientName, setPatientName] = useState('');
  const [patientNameUrdu, setPatientNameUrdu] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('Male');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientWhatsapp, setPatientWhatsapp] = useState('');
  const [allergies, setAllergies] = useState('');
  const [chronic, setChronic] = useState('');
  const [currentMeds, setCurrentMeds] = useState('');
  const [reason, setReason] = useState('');
  const [consentAgreed, setConsentAgreed] = useState(false);

  // Booking Result & State
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Load Doctor Details
  useEffect(() => {
    const fetchDoc = async () => {
      try {
        setLoading(true);
        const res = await api.getPublicDoctor(slug || 'dr-ayesha-siddiqui');
        setDoctor(res.doctor);
      } catch (err) {
        console.error("Failed to load doctor profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [slug]);

  // Load Available Slots for Selected Date
  useEffect(() => {
    if (doctor && selectedDate) {
      setLoadingSlots(true);
      api.getAvailableSlots(doctor.slug || doctor.id, selectedDate)
        .then(res => {
          setSlotsData(res);
          setSelectedSlot(null);
        })
        .catch(err => {
          console.error("Failed to load slots:", err);
          setSlotsData({ available: false, reason: err.message, slots: [] });
        })
        .finally(() => setLoadingSlots(false));
    }
  }, [doctor, selectedDate]);

  const handleNextToStep2 = () => {
    if (!selectedDate) {
      setErrorMessage(isPatientRTL ? "براہ کرم معائنے کی تاریخ منتخب کریں۔" : "Please select a consultation date.");
      return;
    }
    if (!slotsData.available) {
      setErrorMessage(slotsData.reason || (isPatientRTL ? "ڈاکٹر اس تاریخ کو دستیاب نہیں ہیں۔" : "Doctor is not available on this date."));
      return;
    }
    setErrorMessage('');
    setStep(2);
  };

  const handleNextToStep3 = (slot) => {
    setSelectedSlot(slot);
    setErrorMessage('');
    setStep(3);
  };

  const validatePakPhone = (phone) => {
    const cleaned = phone.replace(/[\s\-()]/g, '');
    const regex = /^((\+92)|(0092)|(92)|(0))?3[0-9]{9}$/;
    return regex.test(cleaned);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!consentAgreed) {
      setErrorMessage(isPatientRTL ? "براہ کرم طبی معلومات کے اشتراک کی رضامندی کو منتخب کریں۔" : "Please agree to the medical information sharing consent.");
      return;
    }
    if (!patientName.trim()) {
      setErrorMessage(isPatientRTL ? "براہ کرم مریض کا نام درج کریں۔" : "Please enter patient name.");
      return;
    }
    if (!validatePakPhone(patientPhone)) {
      setErrorMessage(isPatientRTL ? "براہ کرم درست پاکستانی موبائل نمبر درج کریں (مثلاً 0300-1234567)" : "Please enter a valid Pakistani mobile number (e.g. 0300-1234567 or +923001234567).");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');

      const res = await api.bookPublicAppointment({
        doctorId: doctor.id,
        patientName: patientName.trim(),
        patientNameUrdu: patientNameUrdu.trim(),
        patientAge: Number(patientAge) || 30,
        patientGender,
        patientPhone: patientPhone.trim(),
        patientWhatsapp: patientWhatsapp.trim() || patientPhone.trim(),
        allergies: allergies.trim() || 'None',
        chronicConditions: chronic.trim() || 'None',
        currentMedicines: currentMeds.trim() || 'None',
        reasonForVisit: reason.trim() || 'General Consultation',
        date: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        consentGiven: consentAgreed
      });

      if (res.success) {
        setBookingSuccess(res.appointment);
      }
    } catch (err) {
      setErrorMessage(err.message || (isPatientRTL ? "اپائنٹمنٹ بک نہیں ہو سکی۔ براہ کرم دوبارہ کوشش کریں۔" : "Failed to book slot. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 text-center bg-slate-50 dark:bg-slate-950">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl max-w-md border border-slate-200 dark:border-slate-800">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {isPatientRTL ? "ڈاکٹر پروفائل نہیں ملا" : "Doctor Profile Not Found"}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isPatientRTL ? "براہ کرم لنک چیک کریں یا مرکزی صفحے پر واپس جائیں۔" : "Please verify the link or return to the main directory."}
          </p>
        </div>
      </div>
    );
  }

  const doctorSchema = doctor ? {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    'name': doctor.name,
    'medicalSpecialty': doctor.specialization,
    'description': `${doctor.name} is a verified ${doctor.specialization} practicing in ${doctor.city}, Pakistan.`,
    'telephone': doctor.phone || '+92 300 0000000',
    'address': {
      '@type': 'PostalAddress',
      'addressLocality': doctor.city,
      'addressCountry': 'PK'
    },
    'priceRange': `PKR ${doctor.consultationFee || 1500}`
  } : null;

  return (
    <div 
      dir={isPatientRTL ? "rtl" : "ltr"} 
      className={`min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-200 py-8 px-4 sm:px-6 ${
        isPatientRTL ? 'urdu-text' : 'font-sans'
      }`}
    >
      {doctor && (
        <SEOHead
          title={`${doctor.name} - ${doctor.specialization} in ${doctor.city} | DocCare`}
          description={`Book an appointment with ${doctor.name} (${doctor.specialization}) in ${doctor.city}. View consultation fees, clinic address, and available time slots on DocCare.`}
          canonicalUrl={`https://doccare.pk/dr/${doctor.slug || slug}`}
          schemaData={doctorSchema}
          breadcrumbs={[
            { name: 'Home', url: 'https://doccare.pk' },
            { name: 'Doctors', url: 'https://doccare.pk/find-doctors' },
            { name: doctor.city, url: `https://doccare.pk/doctors/${(doctor.city || 'lahore').toLowerCase()}` },
            { name: doctor.name, url: `https://doccare.pk/dr/${doctor.slug || slug}` }
          ]}
          lang={patientLang}
        />
      )}
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Top Navbar with Language Switcher */}
        <div className="flex items-center justify-between">
          <DocCareLogo variant="horizontal" size="sm" showTagline={false} />

          <div className="flex items-center gap-2">
            <button
              onClick={togglePatientLanguage}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-teal-800 dark:text-teal-200 text-xs font-bold shadow-xs hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <Languages className="w-3.5 h-3.5 text-teal-600" />
              <span>{patientLang === 'en' ? 'اردو' : 'English'}</span>
            </button>

            {onBackToApp && (
              <button
                onClick={onBackToApp}
                className="px-3.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl shadow-xs hover:bg-slate-50 transition-colors flex items-center gap-1"
              >
                {isPatientRTL ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
                <span>{isPatientRTL ? "ڈائرکٹری پر واپس جائیں" : "Back to Directory"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Doctor Header Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 relative z-10">
            <img
              src={doctor.profileImage || "https://images.unsplash.com/photo-1594824813590-78c0053e16b9?auto=format&fit=crop&q=80&w=300"}
              alt={doctor.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover ring-4 ring-teal-500/20 shadow-md shrink-0"
            />
            
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {doctor.name}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-[11px] font-bold font-mono border border-teal-200 dark:border-teal-800">
                  <bdi>PMDC #{doctor.pmdcNumber}</bdi>
                </span>
              </div>

              <p className="text-xs sm:text-sm font-bold text-teal-700 dark:text-teal-400">
                {isPatientRTL ? (SPECIALTY_URDU_MAP[doctor.specialization] || doctor.specialization) : doctor.specialization}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                {doctor.qualifications} • <bdi>{doctor.experienceYears}</bdi>+ {tPatient('experienceYears')}
              </p>

              <div className="pt-2 flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
                <a
                  href={doctor.mapLink || `https://maps.google.com/?q=${encodeURIComponent(doctor.clinicName)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300 hover:text-teal-600 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-teal-600" />
                  <span>{doctor.clinicName}, {isPatientRTL ? (CITY_URDU_MAP[doctor.city] || doctor.city) : doctor.city}</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </div>
            </div>

            {/* Fee Badge */}
            <div className="bg-teal-50 dark:bg-teal-950/60 p-3.5 rounded-2xl border border-teal-100 dark:border-teal-900 text-center shrink-0 w-full sm:w-auto">
              <span className="text-[10px] uppercase font-bold text-teal-700 dark:text-teal-300 block">{tPatient('feeLabel')}</span>
              <strong className="text-lg font-black text-teal-900 dark:text-white">
                <bdi>PKR {doctor.consultationFee?.toLocaleString()}</bdi>
              </strong>
            </div>
          </div>

          {doctor.bio && (
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <p>{doctor.bio}</p>
            </div>
          )}
        </div>

        {/* 3-STEP BOOKING WIZARD OR CONFIRMATION */}
        {bookingSuccess ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-emerald-200 dark:border-emerald-800 shadow-xl text-center space-y-5 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                {tPatient('statusConfirmed')}
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {tPatient('bookingSuccess')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                {tPatient('bookingSubtitle')}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl max-w-md mx-auto text-left space-y-2 text-xs border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500">{tPatient('trackingCodeLabel')}:</span>
                <span className="font-mono font-bold text-teal-700 dark:text-teal-400"><bdi>#{bookingSuccess.id}</bdi></span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500">{tPatient('patientName')}:</span>
                <span className="font-bold">{bookingSuccess.patient_name || patientName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700/60">
                <span className="text-slate-500">{isPatientRTL ? "تاریخ اور وقت:" : "Date & Time:"}</span>
                <span className="font-bold">{bookingSuccess.date} • {bookingSuccess.start_time}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">{isPatientRTL ? "کلینک کا پتہ:" : "Clinic Location:"}</span>
                <span className="font-bold text-right truncate max-w-[200px]">{doctor.clinicName}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 justify-center max-w-md mx-auto pt-2">
              <button
                onClick={() => {
                  setBookingSuccess(null);
                  setStep(1);
                  if (onBackToApp) onBackToApp();
                }}
                className="py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors"
              >
                {tPatient('returnToDashboard')}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            
            {/* Step Indicators */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 text-xs font-bold">
              <button
                type="button"
                onClick={() => setStep(1)}
                className={`flex items-center gap-1.5 transition-colors ${
                  step === 1 ? 'text-teal-700 dark:text-teal-400 font-extrabold' : 'text-slate-400'
                }`}
              >
                <span>{tPatient('step1')}</span>
              </button>

              <span className="text-slate-300">→</span>

              <button
                type="button"
                onClick={() => selectedDate && setStep(2)}
                disabled={!selectedDate}
                className={`flex items-center gap-1.5 transition-colors ${
                  step === 2 ? 'text-teal-700 dark:text-teal-400 font-extrabold' : 'text-slate-400'
                }`}
              >
                <span>{tPatient('step2')}</span>
              </button>

              <span className="text-slate-300">→</span>

              <button
                type="button"
                disabled={!selectedSlot}
                className={`flex items-center gap-1.5 transition-colors ${
                  step === 3 ? 'text-teal-700 dark:text-teal-400 font-extrabold' : 'text-slate-400'
                }`}
              >
                <span>{tPatient('step3')}</span>
              </button>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* STEP 1: DATE SELECTION */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {tPatient('availableDates')}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isPatientRTL ? "اپنی سہولت کے مطابق معائنے کی تاریخ کا انتخاب کریں" : "Select an upcoming clinic consultation date"}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="p-3 text-xs font-bold rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <button
                    type="button"
                    onClick={handleNextToStep2}
                    className="py-3 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
                  >
                    <span>{isPatientRTL ? "اوقات دیکھیں" : "View Time Slots"}</span>
                    {isPatientRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: TIME SLOT SELECTION */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {tPatient('availableTimes')} ({selectedDate})
                    </h3>
                    <p className="text-xs text-slate-500">
                      {isPatientRTL ? "کلینک میں چیک اپ کے لیے دستیاب وقت منتخب کریں" : "Pick your preferred time slot for clinic visit"}
                    </p>
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    {isPatientRTL ? "← تاریخ تبدیل کریں" : "← Change Date"}
                  </button>
                </div>

                {loadingSlots ? (
                  <div className="py-12 flex justify-center">
                    <Loader2 className="w-6 h-6 text-teal-600 animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                    {slotsData.slots?.map((slot, idx) => (
                      <button
                        key={idx}
                        type="button"
                        disabled={!slot.available}
                        onClick={() => handleNextToStep3(slot)}
                        className={`p-3 rounded-2xl border text-xs font-bold transition-all ${
                          !slot.available 
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 cursor-not-allowed line-through'
                            : 'bg-teal-50/60 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 border-teal-200 dark:border-teal-800 hover:bg-teal-600 hover:text-white hover:border-teal-600 shadow-xs'
                        }`}
                      >
                        {slot.startTime}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: PATIENT FORM WITH ASSISTED ROMAN URDU */}
            {step === 3 && (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {tPatient('step3')}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {selectedDate} • {selectedSlot?.startTime}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    {isPatientRTL ? "← وقت تبدیل کریں" : "← Change Slot"}
                  </button>
                </div>

                {/* Patient Name Fields: English Name + Urdu Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {tPatient('patientName')} *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Muhammad Ali"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                    />
                    <RomanUrduInputAssist
                      value={patientName}
                      onApply={(val) => setPatientNameUrdu(val)}
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
                      value={patientNameUrdu}
                      onChange={(e) => setPatientNameUrdu(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white urdu-text focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                    />
                  </div>
                </div>

                {/* Age, Gender & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {tPatient('patientAge')}
                    </label>
                    <input
                      type="number"
                      placeholder="35"
                      value={patientAge}
                      onChange={(e) => setPatientAge(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {tPatient('patientGender')}
                    </label>
                    <select
                      value={patientGender}
                      onChange={(e) => setPatientGender(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="Male">{tPatient('male')}</option>
                      <option value="Female">{tPatient('female')}</option>
                      <option value="Other">{tPatient('other')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {tPatient('mobileNumber')} *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="0300-1234567"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                {/* Reason for Visit with Roman Urdu Transliteration */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {tPatient('reasonForVisit')}
                  </label>
                  <textarea
                    rows={2}
                    placeholder={isPatientRTL ? "مثلاً مجھے بخار ہے یا شوگر کا چیک اپ کروانا ہے..." : "e.g. Fever for 3 days, routine diabetes checkup..."}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
                  />
                  <RomanUrduInputAssist
                    value={reason}
                    onApply={(val) => setReason(val)}
                    isUrduMode={isPatientRTL}
                  />
                </div>

                {/* Allergies with Roman Urdu Transliteration */}
                <div>
                  <label className="block text-xs font-bold text-rose-700 dark:text-rose-400 mb-1">
                    {tPatient('allergies')}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Penicillin, Sulfa, Dust"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200"
                  />
                  <RomanUrduInputAssist
                    value={allergies}
                    onApply={(val) => setAllergies(val)}
                    isUrduMode={isPatientRTL}
                  />
                </div>

                {/* Consent Checkbox */}
                <div className="pt-2">
                  <label className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentAgreed}
                      onChange={(e) => setConsentAgreed(e.target.checked)}
                      className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span>
                      {isPatientRTL
                        ? "میں ڈاکٹر اور کلینک عملے کے ساتھ اپنی طبی علامات کے اشتراک کی تصدیق کرتا ہوں۔"
                        : "I consent to sharing my clinical reason with the attending physician and clinic staff."}
                    </span>
                  </label>
                </div>

                {/* Submit Booking Button */}
                <button
                  type="submit"
                  disabled={submitting || !consentAgreed}
                  className={`w-full py-3 px-4 rounded-2xl text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 ${
                    submitting || !consentAgreed
                      ? 'bg-slate-400 cursor-not-allowed opacity-70'
                      : 'bg-teal-600 hover:bg-teal-700 active:scale-98'
                  }`}
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>{tPatient('confirmBooking')}</span>
                      {isPatientRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                    </>
                  )}
                </button>
              </form>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
