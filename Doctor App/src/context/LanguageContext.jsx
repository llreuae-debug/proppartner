import React, { createContext, useContext, useState, useEffect } from 'react';

const TRANSLATIONS = {
  en: {
    appName: "DocCare",
    tagline: "Clinical Management & Digital Prescriptions",
    dashboard: "Dashboard",
    appointments: "Appointments",
    prescriptions: "Prescription Writer",
    patients: "Patient Records",
    myProfile: "Doctor Profile",
    publicPage: "Public Link & QR",
    whatsappLogs: "WhatsApp Logs",
    securityAudit: "Security & Backup",
    settings: "Settings",
    switchDoctor: "Switch Demo Doctor",
    todaysAppointments: "Today's Appointments",
    totalPatients: "Total Patients",
    prescriptionsWritten: "Prescriptions Written",
    revenue: "Estimated Earnings",
    newAppointment: "Book Appointment",
    newPrescription: "Write Prescription",
    aiAssistant: "AI Clinical Assistant",
    aiDisclaimer: "AI suggestions support clinical decisions and require physician verification.",
    searchPlaceholder: "Search patient name, phone, or MR number...",
    patientName: "Patient Name",
    age: "Age",
    gender: "Gender",
    phone: "Phone / WhatsApp",
    reason: "Reason for Visit",
    allergies: "Known Allergies",
    chronicConditions: "Chronic Conditions",
    currentMedicines: "Current Medications",
    timeSlot: "Time Slot",
    date: "Date",
    status: "Status",
    actions: "Actions",
    all: "All",
    today: "Today",
    upcoming: "Upcoming",
    history: "History",
    pending: "Pending",
    confirmed: "Confirmed",
    completed: "Completed",
    cancelled: "Cancelled",
    noShow: "No-show",
    diagnosis: "Clinical Diagnosis",
    symptoms: "Presenting Complaints / Symptoms",
    addMedicine: "Add Medicine",
    medicineName: "Medicine Name & Strength",
    dose: "Dose",
    frequency: "Frequency",
    duration: "Duration",
    instructions: "Instructions / Timings",
    labTests: "Lab Investigations Advised",
    advice: "Clinical Advice & Diet",
    followUp: "Follow-up Date",
    saveTemplate: "Save Template",
    loadTemplate: "Load Template",
    previewPrint: "Preview & Print PDF",
    sendWhatsApp: "Send via WhatsApp",
    exportData: "Export Full Backup",
    language: "Language",
    english: "English",
    urdu: "اردو (Urdu)",
    saveChanges: "Save Changes",
    consultationFee: "Consultation Fee",
    pmdcReg: "PMDC / Registration No.",
    specialization: "Specialization",
    qualifications: "Qualifications",
    clinicAddress: "Clinic Address",
    experience: "Years Experience"
  },
  ur: {
    appName: "ڈاک کئیر",
    tagline: "ڈاکٹرز کے لیے جدید کلینکل و ڈیجیٹل نسخہ جات پلیٹ فارم",
    dashboard: "ڈیش بورڈ",
    appointments: "ملاقاتیں (اپوائنٹمنٹس)",
    prescriptions: "نسخہ تحریر کریں (Rx)",
    patients: "مریضوں کا ریکارڈ",
    myProfile: "ڈاکٹر پروفائل",
    publicPage: "عوامی لنک اور کیو آر",
    whatsappLogs: "واٹس ایپ لاگز",
    securityAudit: "سیکیورٹی و بیک اپ",
    settings: "ترتیبات",
    switchDoctor: "ڈیمو ڈاکٹر تبدیل کریں",
    todaysAppointments: "آج کی ملاقاتیں",
    totalPatients: "کل مریض",
    prescriptionsWritten: "جاری کردہ نسخے",
    revenue: "کلینکل آمدن",
    newAppointment: "نئی اپوائنٹمنٹ",
    newPrescription: "نیا نسخہ بنائیں",
    aiAssistant: "اے آئی کلینکل اسسٹنٹ",
    aiDisclaimer: "اے آئی کی تجاویز صرف رہنمائی کے لیے ہیں۔ حتمی فیصلہ اور تصدیق معالج کی ذمہ داری ہے۔",
    searchPlaceholder: "مریض کا نام، فون یا فائل نمبر تلاش کریں...",
    patientName: "مریض کا نام",
    age: "عمر",
    gender: "جنس",
    phone: "فون / واٹس ایپ نمبر",
    reason: "معائنے کی وجہ",
    allergies: "الرجی کی تفصیل",
    chronicConditions: "دائمی بیماریاں (شوگر/بلڈ پریشر)",
    currentMedicines: "موجودہ ادویات",
    timeSlot: "وقت کا سلاٹ",
    date: "تاریخ",
    status: "حالت",
    actions: "اقدامات",
    all: "تمام",
    today: "آج",
    upcoming: "آنے والی",
    history: "سابقہ ریکارڈ",
    pending: "زیر التواء",
    confirmed: "تصدیق شدہ",
    completed: "مکمل",
    cancelled: "منسوخ",
    noShow: "غیر حاضر",
    diagnosis: "تشخیص (مرض)",
    symptoms: "علامات و شکایات",
    addMedicine: "دوا شامل کریں",
    medicineName: "دوا کا نام اور مقدار",
    dose: "خوراک",
    frequency: "تعداد (اوقات)",
    duration: "مدت",
    instructions: "ہدایات / استعمال کا طریقہ",
    labTests: "تجویز کردہ ٹیسٹ",
    advice: "پرہیز و طبی مشورہ",
    followUp: "دوبارہ چیک اپ کی تاریخ",
    saveTemplate: "ٹیمپلیٹ محفوظ کریں",
    loadTemplate: "ٹیمپلیٹ لوڈ کریں",
    previewPrint: "پی ڈی ایف دیکھیں اور پرنٹ کریں",
    sendWhatsApp: "واٹس ایپ پر بھیجیں",
    exportData: "مکمل ڈیٹا بیک اپ ایکسپورٹ کریں",
    language: "زبان",
    english: "English",
    urdu: "اردو",
    saveChanges: "محفوظ کریں",
    consultationFee: "معائنہ فیس",
    pmdcReg: "پی ایم ڈی سی نمبر",
    specialization: "تخصص (سپیشلٹی)",
    qualifications: "تعلیمی اسناد",
    clinicAddress: "کلینک کا پتہ",
    experience: "طبی تجربہ (سال)"
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('doccare_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('doccare_lang', lang);
    if (lang === 'ur') {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.lang = 'ur';
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.lang = 'en';
    }
  }, [lang]);

  const toggleLang = () => {
    setLang(prev => (prev === 'en' ? 'ur' : 'en'));
  };

  const t = (key) => {
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t, isRTL: lang === 'ur' }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
