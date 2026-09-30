import React, { createContext, useContext, useState, useEffect } from 'react';

const PATIENT_TRANSLATIONS = {
  en: {
    // Brand & Top Header
    appName: "DocCare",
    tagline: "Your practice. Your patients. One simple record.",
    verifiedBadge: "Verified Patient Account • Private Health Record",
    patientPortal: "Patient Portal",
    findDoctor: "Find a Doctor",
    findDoctorBtn: "Find & Book Doctor",
    bookConsultation: "Book New Consultation",
    switchLanguage: "اردو میں دیکھیں",
    currentLangName: "English",
    signOut: "Sign Out",
    doctorLogin: "Doctor Login",
    patientLogin: "Patient Login",

    // Discovery & Search Filters
    findHeader: "Find & Book Top Doctors in Pakistan",
    findSubtitle: "Search by city or specialty, view verified qualifications, check consultation fees, and schedule clinic visits instantly.",
    searchPlaceholder: "Search doctor name, specialty, or condition (e.g. Cardiologist, Lahore)...",
    searchLabel: "Search Doctors & Specialties",
    cityLabel: "City",
    allCities: "All Cities",
    specialtyLabel: "Specialty",
    allSpecialties: "All Specialties",
    viewProfile: "View Profile",
    bookNow: "Book Appointment",
    experienceYears: "years experience",
    feeLabel: "Fee",
    pkr: "PKR",
    rating: "Rating",
    verifiedPmdc: "PMDC Verified",
    clinicAddress: "Clinic Address",
    nextAvailable: "Next Available",
    trackAppointment: "Track Appointment Status",
    enterTrackingCode: "Enter your 8-digit booking code (e.g. DC-APT-849201)",
    trackBtn: "Track",

    // Doctor Profile & Booking Flow
    aboutDoctor: "About Doctor & Services",
    qualifications: "Qualifications",
    pmdcNumber: "PMDC Reg #",
    servicesOffered: "Clinical Services & Expertise",
    languagesSpoken: "Languages",
    clinicSchedule: "Clinic Hours & Location",
    step1: "1. Select Date",
    step2: "2. Choose Time Slot",
    step3: "3. Patient Information",
    availableDates: "Available Dates",
    availableTimes: "Available Times",
    morningSlot: "Morning Session",
    eveningSlot: "Evening Session",
    patientName: "Patient Full Name",
    patientNameUrdu: "Urdu Name (Optional)",
    mobileNumber: "WhatsApp / Mobile Number",
    patientAge: "Patient Age",
    patientGender: "Gender",
    male: "Male",
    female: "Female",
    other: "Other",
    reasonForVisit: "Reason for Visit / Main Complaints",
    allergies: "Known Drug Allergies",
    chronicConditions: "Chronic Health Conditions",
    currentMedicines: "Current Medications",
    confirmBooking: "Confirm Appointment Booking",
    bookingSuccess: "Appointment Booked Successfully!",
    bookingSubtitle: "Your consultation request has been registered. You can view its real-time status in your Patient Portal.",
    trackingCodeLabel: "Appointment Tracking Code",
    returnToDashboard: "Return to My Patient Portal",
    bookAnother: "Book Another Doctor",

    // Patient Dashboard Tabs & Cards
    welcomePatient: "Welcome,",
    patientOverview: "Access your digital prescriptions, track appointment statuses, and review your Pakistani clinical history anytime.",
    upcomingVisits: "Upcoming Visits",
    digitalPrescriptions: "Digital Prescriptions",
    doctorsConsulted: "Doctors Consulted",
    totalBookings: "Total Bookings",
    myAppointmentsTab: "My Appointments",
    myPrescriptionsTab: "Digital Prescriptions",
    myHealthProfileTab: "My Health Profile",
    noAppointmentsTitle: "No Appointments Yet",
    noAppointmentsDesc: "You haven't scheduled any doctor consultations yet. Browse verified doctors across Pakistan to book your first visit.",
    noPrescriptionsTitle: "No Prescriptions Available",
    noPrescriptionsDesc: "When your attending doctor finalizes a prescription for your consultation, it will appear here automatically with secure PDF download and QR verification.",
    viewPdf: "View PDF",
    downloadPdf: "Download A4 PDF",
    cancelAppointment: "Cancel Appointment",
    cancelModalTitle: "Cancel Appointment",
    cancelModalDesc: "Are you sure you want to cancel this appointment? The doctor's clinic schedule will be notified.",
    cancelReasonPlaceholder: "Reason for cancellation (optional)",
    confirmCancellation: "Confirm Cancellation",
    keepAppointment: "Keep",
    editProfile: "Edit Profile",
    saveHealthProfile: "Save Health Profile",
    cancel: "Cancel",

    // Appointment Status Badges
    statusPending: "Pending Confirmation",
    statusConfirmed: "Confirmed",
    statusCompleted: "Completed",
    statusCancelled: "Cancelled",

    // Auth Strings
    welcomeAuthTitle: "Welcome to DocCare",
    welcomeAuthSubtitle: "Your practice. Your patients. One simple record.",
    doctorTab: "Doctor Login",
    patientTab: "Patient Login",
    emailOrPhone: "Email or Mobile Number",
    password: "Password",
    forgotPassword: "Forgot Password?",
    signInBtn: "Sign In",
    continueWithGoogle: "Continue with Google",
    dontHaveAccount: "Don't have an account?",
    createAccount: "Create Account",
    alreadyHaveAccount: "Already have an account?",
    logInLink: "Log In",
    sendResetLink: "Send Secure Reset Link",
    backToLogin: "← Back to Login",

    // Roman Urdu Input Assist
    suggestedUrdu: "Suggested Urdu:",
    useSuggestion: "Use Urdu",
    dismiss: "Dismiss"
  },
  ur: {
    // Brand & Top Header
    appName: "ڈاک کئیر",
    tagline: "آپ کی صحت۔ آپ کا معالج۔ ایک محفوظ ڈیجیٹل ریکارڈ۔",
    verifiedBadge: "مستند مریض اکاؤنٹ • مکمل محفوظ طبی ریکارڈ",
    patientPortal: "مریض کا پورٹل",
    findDoctor: "ڈاکٹر تلاش کریں",
    findDoctorBtn: "ڈاکٹر تلاش اور بک کریں",
    bookConsultation: "نیا معائنہ / اپائنٹمنٹ بک کریں",
    switchLanguage: "View in English",
    currentLangName: "اردو",
    signOut: "لاگ آؤٹ",
    doctorLogin: "ڈاکٹر لاگ اِن",
    patientLogin: "مریض لاگ اِن",

    // Discovery & Search Filters
    findHeader: "پاکستان کے مستند ڈاکٹرز تلاش اور اپائنٹمنٹ بک کریں",
    findSubtitle: "شہر یا اسپیشلٹی کے ذریعے تلاش کریں، تصدیق شدہ اسناد اور فیس کی تفصیلات دیکھیں، اور فوری کلینک اپائنٹمنٹ شیڈول کریں۔",
    searchPlaceholder: "شہر، ڈاکٹر کا نام یا اسپیشلٹی تلاش کریں (مثلاً کارڈیالوجسٹ، لاہور)...",
    searchLabel: "ڈاکٹر یا اسپیشلٹی تلاش کریں",
    cityLabel: "شہر منتخب کریں",
    allCities: "تمام شہر",
    specialtyLabel: "اسپیشلٹی منتخب کریں",
    allSpecialties: "تمام اسپیشلٹیز",
    viewProfile: "پروفائل دیکھیں",
    bookNow: "اپائنٹمنٹ بک کریں",
    experienceYears: "سالہ طبی تجربہ",
    feeLabel: "فیس",
    pkr: "روپے",
    rating: "ریٹنگ",
    verifiedPmdc: "پی ایم ڈی سی سے تصدیق شدہ",
    clinicAddress: "کلینک کا پتہ",
    nextAvailable: "اگلا دستیاب وقت",
    trackAppointment: "اپائنٹمنٹ کا اسٹیٹس ٹریک کریں",
    enterTrackingCode: "اپنا ۸ ہندسوں کا ٹریکنگ کوڈ درج کریں (مثلاً DC-APT-849201)",
    trackBtn: "ٹریک کریں",

    // Doctor Profile & Booking Flow
    aboutDoctor: "ڈاکٹر کی تفصیلات اور خدمات",
    qualifications: "تعلیمی قابلیت و اسناد",
    pmdcNumber: "پی ایم ڈی سی نمبر",
    servicesOffered: "طبی خدمات اور علاج کی مہارت",
    languagesSpoken: "زبانیں",
    clinicSchedule: "کلینک کا پتہ اور اوقات",
    step1: "۱. تاریخ منتخب کریں",
    step2: "۲. وقت کا سلاٹ منتخب کریں",
    step3: "۳. مریض کی تفصیلات",
    availableDates: "دستیاب تاریخیں",
    availableTimes: "دستیاب اوقات",
    morningSlot: "صبح کا سیشن",
    eveningSlot: "شام کا سیشن",
    patientName: "مریض کا مکمل نام (انگریزی)",
    patientNameUrdu: "مریض کا اردو نام",
    mobileNumber: "موبائل یا واٹس ایپ نمبر",
    patientAge: "مریض کی عمر",
    patientGender: "جنس",
    male: "مرد",
    female: "عورت",
    other: "دیگر",
    reasonForVisit: "معائنے کی وجہ / شکایات کی تفصیل",
    allergies: "معلوم ادویاتی الرجی",
    chronicConditions: "دائمی بیماریاں (شوگر، بلڈ پریشر وغیرہ)",
    currentMedicines: "موجودہ ادویات",
    confirmBooking: "اپائنٹمنٹ کی حتمی تصدیق کریں",
    bookingSuccess: "اپائنٹمنٹ کامیابی سے بک ہو گئی ہے!",
    bookingSubtitle: "آپ کی معائنے کی درخواست کلینک کو موصول ہو گئی ہے۔ آپ اپنے مریض پورٹل میں اس کا براہِ راست اسٹیٹس دیکھ سکتے ہیں۔",
    trackingCodeLabel: "اپائنٹمنٹ ٹریکنگ کوڈ",
    returnToDashboard: "میرے مریض پورٹل پر جائیں",
    bookAnother: "کسی اور معالج کی بکنگ کریں",

    // Patient Dashboard Tabs & Cards
    welcomePatient: "خوش آمدید،",
    patientOverview: "اپنے ڈیجیٹل نسخے دیکھیں، اپائنٹمنٹ کے اوقات جانچیں، اور اپنی طبی تاریخ ہر وقت محفوظ رکھیں۔",
    upcomingVisits: "آنے والی ملاقاتیں",
    digitalPrescriptions: "ڈیجیٹل نسخہ جات",
    doctorsConsulted: "طبی معالجین",
    totalBookings: "کل بکنگز",
    myAppointmentsTab: "میری ملاقاتیں (اپائنٹمنٹس)",
    myPrescriptionsTab: "ڈیجیٹل نسخے (Rx)",
    myHealthProfileTab: "میرا طبی پروفائل",
    noAppointmentsTitle: "فی الوقت کوئی ملاقات نہیں ہے",
    noAppointmentsDesc: "آپ نے ابھی تک کسی ڈاکٹر سے اپائنٹمنٹ شیڈول نہیں کی۔ پاکستان کے بہترین ڈاکٹرز تلاش کریں اور پہلی ملاقات بک کریں۔",
    noPrescriptionsTitle: "کوئی نسخہ موجود نہیں",
    noPrescriptionsDesc: "جب آپ کا ڈاکٹر معائنے کا نسخہ فائنل کرے گا، وہ خودکار طور پر یہاں پی ڈی ایف ڈاؤن لوڈ اور کیو آر تصدیق کے ساتھ ظاہر ہو جائے گا۔",
    viewPdf: "پی ڈی ایف دیکھیں",
    downloadPdf: "پی ڈی ایف ڈاؤن لوڈ کریں",
    cancelAppointment: "اپائنٹمنٹ منسوخ کریں",
    cancelModalTitle: "اپائنٹمنٹ کی منسوخی",
    cancelModalDesc: "کیا آپ واقعی یہ اپائنٹمنٹ منسوخ کرنا چاہتے ہیں؟ کلینک کو مطلع کر دیا جائے گا۔",
    cancelReasonPlaceholder: "منسوخی کی وجہ (اختیاری)",
    confirmCancellation: "منسوخی کی تصدیق کریں",
    keepAppointment: "برقرار رکھیں",
    editProfile: "پروفائل میں ترمیم کریں",
    saveHealthProfile: "طبی پروفائل محفوظ کریں",
    cancel: "منسوخ",

    // Appointment Status Badges
    statusPending: "زیرِ تصدیق (منتظر)",
    statusConfirmed: "تصدیق شدہ",
    statusCompleted: "مکمل",
    statusCancelled: "منسوخ",

    // Auth Strings
    welcomeAuthTitle: "ڈاک کئیر میں خوش آمدید",
    welcomeAuthSubtitle: "آپ کی صحت۔ آپ کا معالج۔ ایک محفوظ ریکارڈ۔",
    doctorTab: "ڈاکٹر لاگ اِن",
    patientTab: "مریض لاگ اِن",
    emailOrPhone: "ای میل یا موبائل نمبر",
    password: "پاس ورڈ",
    forgotPassword: "پاس ورڈ بھول گئے؟",
    signInBtn: "لاگ اِن کریں",
    continueWithGoogle: "گوگل کے ذریعے جاری رکھیں",
    dontHaveAccount: "اکاؤنٹ نہیں ہے؟",
    createAccount: "نیا اکاؤنٹ بنائیں",
    alreadyHaveAccount: "پہلے سے اکاؤنٹ موجود ہے؟",
    logInLink: "لاگ اِن کریں",
    sendResetLink: "پاس ورڈ ری سیٹ لنک بھیجیں",
    backToLogin: "← لاگ اِن پر واپس جائیں",

    // Roman Urdu Input Assist
    suggestedUrdu: "تجویز کردہ اردو:",
    useSuggestion: "استعمال کریں",
    dismiss: "رد کریں"
  }
};

const PatientLanguageContext = createContext();

export function PatientLanguageProvider({ children }) {
  const [patientLang, setPatientLang] = useState(() => {
    return localStorage.getItem('doccare_patient_language') || 'en';
  });

  const isPatientRTL = patientLang === 'ur';

  useEffect(() => {
    localStorage.setItem('doccare_patient_language', patientLang);
  }, [patientLang]);

  const togglePatientLanguage = () => {
    setPatientLang(prev => (prev === 'en' ? 'ur' : 'en'));
  };

  const tPatient = (key) => {
    return PATIENT_TRANSLATIONS[patientLang]?.[key] || PATIENT_TRANSLATIONS['en']?.[key] || key;
  };

  return (
    <PatientLanguageContext.Provider value={{
      patientLang,
      setPatientLang,
      togglePatientLanguage,
      tPatient,
      isPatientRTL
    }}>
      {children}
    </PatientLanguageContext.Provider>
  );
}

export function usePatientLanguage() {
  const context = useContext(PatientLanguageContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      patientLang: 'en',
      setPatientLang: () => {},
      togglePatientLanguage: () => {},
      tPatient: (key) => key,
      isPatientRTL: false
    };
  }
  return context;
}
