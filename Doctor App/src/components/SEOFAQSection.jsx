import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';
import { usePatientLanguage } from '../context/PatientLanguageContext';

export const FAQS_DATA = [
  {
    id: 'faq-1',
    questionEn: 'How can I find a doctor in Pakistan?',
    questionUr: 'پاکستان میں ڈاکٹر کیسے تلاش کریں؟',
    answerEn: 'You can search for PMDC-verified doctors across Pakistan on DocCare by selecting your city (such as Lahore, Karachi, Islamabad, Faisalabad), choosing a medical specialty, or entering specific doctor names and symptoms.',
    answerUr: 'آپ DocCare پر اپنے شہر (جیسے لاہور، کراچی، اسلام آباد، فیصل آباد) کا انتخاب کرکے، طبی اسپیشلٹی منتخب کرکے یا ڈاکٹر کا نام اور علامات درج کرکے تصدیق شدہ ڈاکٹرز تلاش کر سکتے ہیں۔'
  },
  {
    id: 'faq-2',
    questionEn: 'How can I find a doctor near me?',
    questionUr: 'میرے قریب موجود ڈاکٹر کیسے تلاش کریں؟',
    answerEn: 'Use DocCare’s city and neighborhood filters to instantly discover available clinics and specialist consultants near your location, complete with clinic addresses and directions.',
    answerUr: 'اپنے قریبی کلینکس اور ماہر ڈاکٹرز کی فہرست دیکھنے کے لیے DocCare کے سٹی فلٹرز استعمال کریں جس میں کلینک کا مکمل پتہ اور رابطے کی تفصیلات موجود ہوتی ہیں۔'
  },
  {
    id: 'faq-3',
    questionEn: 'Can I search doctors by specialty?',
    questionUr: 'کیا میں اسپیشلٹی کے لحاظ سے ڈاکٹر تلاش کر سکتا ہوں؟',
    answerEn: 'Yes! DocCare lists top specialists across 20+ medical fields including Cardiologists, Dermatologists, Gynecologists, Pediatricians, Neurologists, Orthopedic Surgeons, and General Physicians.',
    answerUr: 'جی ہاں! DocCare پر آپ 20 سے زائد طبی شعبہ جات بشمول امراضِ قلب (کارڈیالوجسٹ)، ماہر امراض جلد، ماہر امراض نسواں، ماہر اطفال اور جنرل فزیشنز میں سے انتخاب کر سکتے ہیں۔'
  },
  {
    id: 'faq-4',
    questionEn: 'Can I search doctors by city?',
    questionUr: 'کیا میں شہر کے لحاظ سے ڈاکٹرز تلاش کر سکتا ہوں؟',
    answerEn: 'Yes, DocCare has dedicated directories for major Pakistani cities including Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, Gujranwala, Sialkot, and Quetta.',
    answerUr: 'جی ہاں، DocCare پر پاکستان کے تمام بڑے شہروں جیسے لاہور، کراچی، اسلام آباد، راولپنڈی، فیصل آباد، ملتان اور پشاور کے لیے مخصوص ڈائرکٹریز موجود ہیں۔'
  },
  {
    id: 'faq-5',
    questionEn: 'How can I book a doctor appointment online?',
    questionUr: 'ڈاکٹر کی آن لائن اپائنٹمنٹ کیسے بک کریں؟',
    answerEn: 'Booking is simple: (1) Select your doctor, (2) Pick an available date and 15-minute time slot from their live schedule, (3) Enter your name and mobile number. You will receive an instant digital confirmation token.',
    answerUr: 'اپائنٹمنٹ بک کرنا نہایت آسان ہے: (1) ڈاکٹر منتخب کریں، (2) دستیاب تاریخ اور وقت منتخب کریں، (3) نام اور موبائل نمبر درج کریں۔ آپ کو فوری ڈیجیٹل تصدیقی ٹوکن مل جائے گا۔'
  },
  {
    id: 'faq-6',
    questionEn: 'Can I see a doctor’s consultation fee before booking?',
    questionUr: 'کیا میں بکنگ سے پہلے ڈاکٹر کی فیس دیکھ سکتا ہوں؟',
    answerEn: 'Yes. Every public doctor profile on DocCare displays transparent, up-to-date consultation fees with zero hidden charges or booking platform fees.',
    answerUr: 'جی ہاں، ہر ڈاکٹر کے پبلک پروفائل پر چیک اپ کی فیس واضح طور پر درج ہوتی ہے اور مریض سے کوئی اضافی چارجز نہیں لیے جاتے۔'
  },
  {
    id: 'faq-7',
    questionEn: 'Can I check a doctor’s available appointment times?',
    questionUr: 'کیا میں ڈاکٹر کے دستیاب اوقات چیک کر سکتا ہوں؟',
    answerEn: 'Yes. DocCare syncs directly with the doctor’s real-time practice calendar so you only see verified open slots for today, tomorrow, and upcoming clinic days.',
    answerUr: 'جی ہاں، DocCare پر ڈاکٹر کے کلینک کے حقیقی شیڈول کے مطابق دستیاب اوقات (صبح و شام کے سلاٹ) ظاہر ہوتے ہیں۔'
  },
  {
    id: 'faq-8',
    questionEn: 'Can I find a specialist in Faisalabad?',
    questionUr: 'کیا میں فیصل آباد میں اسپیشلسٹ ڈاکٹر تلاش کر سکتا ہوں؟',
    answerEn: 'Yes! We feature top dermatologists, gynecologists, cardiologists, and pediatricians practicing in Faisalabad with clinic locations like Civil Lines and Susan Road.',
    answerUr: 'جی ہاں! فیصل آباد کے معروف میڈیکل سنٹرز اور کلینکس کے تجربہ کار اسپیشلسٹ ڈاکٹرز DocCare پر دستیاب ہیں۔'
  },
  {
    id: 'faq-9',
    questionEn: 'Can I find doctors in Lahore?',
    questionUr: 'کیا میں لاہور میں ڈاکٹر تلاش کر سکتا ہوں؟',
    answerEn: 'Yes. DocCare covers top verified doctors across Gulberg, DHA, Johar Town, Jail Road, and Shadman in Lahore.',
    answerUr: 'جی ہاں، لاہور کے تمام اہم علاقوں بشمول گلبرگ، ڈی ایچ اے، جوہر ٹاؤن اور جیل روڈ کے ماہر ڈاکٹرز موجود ہیں۔'
  },
  {
    id: 'faq-10',
    questionEn: 'Does DocCare support Urdu & Roman Urdu?',
    questionUr: 'کیا DocCare اردو اور رومن اردو کو سپورٹ کرتا ہے؟',
    answerEn: 'Yes! The DocCare Patient Portal offers 100% native Urdu with complete RTL layout and intelligent Roman Urdu-to-Urdu assisted transliteration for easy typing.',
    answerUr: 'جی ہاں! DocCare کا مریض پورٹل مکمل اردو، دائیں سے بائیں (RTL) لے آؤٹ اور رومن اردو سے اردو کنورژن کے ساتھ کام کرتا ہے۔'
  }
];

export default function SEOFAQSection({ className = '' }) {
  const { patientLanguage } = usePatientLanguage();
  const isUrdu = patientLanguage === 'ur';
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (id) => {
    setOpenFaq((prev) => (prev === id ? null : id));
  };

  // Generate FAQPage JSON-LD Schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': FAQS_DATA.map((faq) => ({
      '@type': 'Question',
      'name': isUrdu ? faq.questionUr : faq.questionEn,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': isUrdu ? faq.answerUr : faq.answerEn
      }
    }))
  };

  return (
    <section className={`py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto ${className}`}>
      {/* Dynamic Hidden Schema script for this section */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-bold border border-teal-200/80 dark:border-teal-800 mb-3">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{isUrdu ? 'اکثر پوچھے گئے سوالات' : 'Patient FAQs & Guide'}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {isUrdu ? 'ڈاکٹرز اور اپائنٹمنٹ کے بارے میں سوالات' : 'Frequently Asked Questions'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xl mx-auto">
          {isUrdu
            ? 'پاکستان میں ڈاکٹرز کی تلاش، فیس اور اپائنٹمنٹ بکنگ سے متعلق معلومات'
            : 'Everything you need to know about finding doctors, checking consultation fees, and booking clinic visits in Pakistan.'}
        </p>
      </div>

      <div className="space-y-3">
        {FAQS_DATA.map((faq) => {
          const isOpen = openFaq === faq.id;
          const qText = isUrdu ? faq.questionUr : faq.questionEn;
          const aText = isUrdu ? faq.answerUr : faq.answerEn;

          return (
            <div
              key={faq.id}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? 'bg-white dark:bg-slate-900 border-teal-300 dark:border-teal-800 shadow-md ring-1 ring-teal-500/20'
                  : 'bg-white/80 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleFaq(faq.id)}
                className={`w-full py-4 px-5 flex items-center justify-between gap-4 text-left transition-colors ${
                  isUrdu ? 'text-right' : 'text-left'
                }`}
                aria-expanded={isOpen}
              >
                <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  {qText}
                </span>
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 ${
                    isOpen
                      ? 'bg-teal-600 text-white rotate-180'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              {isOpen && (
                <div className={`px-5 pb-4 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 ${
                  isUrdu ? 'text-right font-urdu' : 'text-left'
                }`}>
                  {aText}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
