/**
 * Roman Urdu -> Urdu Transliteration and Translation Engine
 * Specially tailored for DocCare Patient Portal health inquiries,
 * city searches, symptoms, and appointment requests.
 */

// Phrase & Idiomatic mappings (checked first)
const PHRASE_DICTIONARY = [
  // Appointment & Doctor Requests
  { roman: "mujhe doctor chahiye", urdu: "مجھے ڈاکٹر چاہیے" },
  { roman: "doctor chahiye", urdu: "ڈاکٹر چاہیے" },
  { roman: "mujhe faisalabad mein skin doctor chahiye", urdu: "مجھے فیصل آباد میں سکن ڈاکٹر چاہیے" },
  { roman: "faisalabad mein skin doctor chahiye", urdu: "فیصل آباد میں سکن ڈاکٹر چاہیے" },
  { roman: "lahore mein cardiologist chahiye", urdu: "لاہور میں کارڈیالوجسٹ چاہیے" },
  { roman: "karachi mein child specialist chahiye", urdu: "کراچی میں بچوں کے ڈاکٹر چاہیے" },
  { roman: "islamabad mein gynecologist chahiye", urdu: "اسلام آباد میں گائناکالوجسٹ چاہیے" },
  { roman: "kal appointment chahiye", urdu: "کل اپائنٹمنٹ چاہیے" },
  { roman: "aaj appointment chahiye", urdu: "آج اپائنٹمنٹ چاہیے" },
  { roman: "appointment book karni hai", urdu: "اپائنٹمنٹ بک کرنی ہے" },
  { roman: "appointment chahiye", urdu: "اپائنٹمنٹ چاہیے" },
  { roman: "checkup karwana hai", urdu: "طبی معائنہ کروانا ہے" },
  { roman: "routine checkup", urdu: "معمول کا چیک اپ" },
  { roman: "online mashwara chahiye", urdu: "آن لائن طبی مشورہ چاہیے" },
  { roman: "report dikhani hai", urdu: "میڈیکل رپورٹ دکھانی ہے" },
  { roman: "emergency checkup", urdu: "ہنگامی طبی معائنہ" },
  
  // Symptoms & Complaints
  { roman: "mujhe bukhar hai", urdu: "مجھے بخار ہے" },
  { roman: "tez bukhar hai", urdu: "تیز بخار ہے" },
  { roman: "sar mein dard hai", urdu: "سر میں درد ہے" },
  { roman: "sar dard hai", urdu: "سر درد ہے" },
  { roman: "sar dard", urdu: "سر درد" },
  { roman: "pait mein dard hai", urdu: "پیٹ میں درد ہے" },
  { roman: "pait dard", urdu: "پیٹ درد" },
  { roman: "gale mein dard hai", urdu: "گلے میں درد اور خراش ہے" },
  { roman: "khansi aur nazla hai", urdu: "کھانسی اور نزلہ ہے" },
  { roman: "khansi hai", urdu: "کھانسی ہے" },
  { roman: "nazla zukam", urdu: "نزلہ و زکام" },
  { roman: "sugar ka masla hai", urdu: "شوگر کا مسئلہ ہے" },
  { roman: "sugar checkup", urdu: "شوگر کا چیک اپ" },
  { roman: "blood pressure high hai", urdu: "بلڈ پریشر زیادہ ہے" },
  { roman: "bp checkup", urdu: "بلڈ پریشر چیک اپ" },
  { roman: "dil ki dharkan tez hai", urdu: "دل کی دھڑکن تیز ہے" },
  { roman: "dil ka dard", urdu: "سینے اور دل میں درد" },
  { roman: "sine mein jalan", urdu: "سینے میں جلن (تیزابیت)" },
  { roman: "sans lene mein dushwari", urdu: "سانس لینے میں دشواری" },
  { roman: "jild par kharish", urdu: "جلد پر خارش اور الرجی" },
  { roman: "hadiyon mein dard", urdu: "ہڈیوں اور جوڑوں میں درد" },
  { roman: "ghutno ka dard", urdu: "گھٹنوں کا درد" },
  { roman: "dant mein dard", urdu: "دانت میں درد" },
  { roman: "aankhon mein jalan", urdu: "آنکھوں میں جلن اور دھندلا پن" },
  { roman: "kamzori mehsoos ho rahi hai", urdu: "کمزوری اور چکر محسوس ہو رہے ہیں" },
  { roman: "chakkar aana", urdu: "چکر آنا اور متلی" },
  { roman: "vomiting aur ulti", urdu: "قے اور الٹی" }
];

// Word dictionary for instant lookup
const WORD_DICTIONARY = {
  // Cities
  "lahore": "لاہور",
  "karachi": "کراچی",
  "islamabad": "اسلام آباد",
  "rawalpindi": "راولپنڈی",
  "faisalabad": "فیصل آباد",
  "multan": "ملتان",
  "peshawar": "پشاور",
  "quetta": "کوئٹہ",
  "sialkot": "سیالکوٹ",
  "gujranwala": "گوجرانوالہ",
  "hyderabad": "حیدرآباد",
  "bahawalpur": "بہاولپور",
  "sargodha": "سرگودھا",
  "gujrat": "گجرات",

  // Specialties & Medical Terms
  "doctor": "ڈاکٹر",
  "doctors": "ڈاکٹرز",
  "cardiologist": "کارڈیالوجسٹ",
  "cardiology": "کارڈیالوجی",
  "dermatologist": "ڈرماٹالوجسٹ",
  "dermatology": "ڈرماٹالوجی",
  "skin": "جلد (سکن)",
  "pediatrician": "ماہر اطفال (بچوں کے ڈاکٹر)",
  "child": "بچوں کا",
  "gynecologist": "گائناکالوجسٹ",
  "orthopedic": "آرتھوپیڈک (ہڈی و جوڑ)",
  "physician": "فزیشن",
  "general": "جنرل",
  "ent": "ای این ٹی (کان، ناک، گلا)",
  "neurologist": "نیورالوجسٹ",
  "psychiatrist": "سائیکاٹرسٹ",
  "dentist": "ڈینٹسٹ (دانتوں کے ڈاکٹر)",
  "dental": "دانتوں کا",
  "ophthalmologist": "ماہر امراض چشم (آنکھوں کے ڈاکٹر)",
  "eye": "آنکھ",
  "gastroenterologist": "ماہر معدہ و جگر",
  "urologist": "یورالوجسٹ",
  "pulmonologist": "ماہر امراض سینہ و پھیپھڑے",
  "chest": "سینہ",
  "specialist": "اسپیشلسٹ",
  "consultant": "کنسلٹنٹ",
  "clinic": "کلینک",
  "hospital": "ہسپتال",
  "pharmacy": "فارمیسی",
  "appointment": "اپائنٹمنٹ",
  "booking": "بکنگ",
  "prescription": "نسخہ (Rx)",
  "test": "ٹیسٹ",
  "lab": "لیب",
  "fee": "فیس",
  "fees": "فیس",

  // Common Pakistani Roman Urdu Words
  "mujhe": "مجھے",
  "aap": "آپ",
  "hum": "ہم",
  "mera": "میرا",
  "meri": "میری",
  "mere": "میرے",
  "chahiye": "چاہیے",
  "hai": "ہے",
  "hain": "ہیں",
  "tha": "تھا",
  "thi": "تھی",
  "the": "تھے",
  "mein": "میں",
  "me": "میں",
  "se": "سے",
  "ka": "کا",
  "ki": "کی",
  "ke": "کے",
  "ko": "کو",
  "aur": "اور",
  "ya": "یا",
  "bhi": "بھی",
  "par": "پر",
  "pe": "پر",
  "tak": "تک",
  "karna": "کرنا",
  "karni": "کرنی",
  "karne": "کرنے",
  "karwana": "کروانا",
  "dikhana": "دکھانا",
  "batana": "بتانا",
  "aaj": "آج",
  "kal": "کل",
  "parson": "پرسوں",
  "subah": "صبح",
  "dopahar": "دوپہر",
  "shaam": "شام",
  "raat": "رات",
  "waqt": "وقت",
  "time": "وقت",
  "date": "تاریخ",
  "din": "دن",
  "jaldi": "جلدی",
  "emergency": "ہنگامی",
  "tez": "تیز",
  "kam": "کم",
  "zyada": "زیادہ",
  "bukhar": "بخار",
  "fever": "بخار",
  "dard": "درد",
  "pain": "درد",
  "sar": "سر",
  "headache": "سر درد",
  "pait": "پیٹ",
  "gala": "گلا",
  "throat": "گلا",
  "khansi": "کھانسی",
  "cough": "کھانسی",
  "nazla": "نزلہ",
  "zukam": "زکام",
  "sugar": "شوگر",
  "diabetes": "شوگر (ذیابیطس)",
  "blood": "بلڈ",
  "pressure": "پریشر",
  "dil": "دل",
  "heart": "دل",
  "jild": "جلد",
  "kharish": "خارش",
  "allergy": "الرجی",
  "allergies": "الرجی",
  "dawa": "دوا",
  "dawaii": "دوائی",
  "medicine": "دوا",
  "medicines": "ادویات",
  "tablets": "گولیاں",
  "syrup": "شربت",
  "checkup": "چیک اپ",
  "mashwara": "مشورہ",
  "consultation": "معائنہ و مشورہ",
  "ilaaj": "علاج",
  "sehat": "صحت",
  "mariiz": "مریض",
  "patient": "مریض",
  "naam": "نام",
  "name": "نام",
  "phone": "فون",
  "mobile": "موبائل",
  "number": "نمبر",
  "pata": "پتہ",
  "address": "پتہ",
  "shehar": "شہر",
  "city": "شہر",
  "umr": "عمر",
  "age": "عمر",
  "jins": "جنس",
  "gender": "جنس",
  "male": "مرد",
  "female": "عورت",
  "shukriya": "شکریہ",
  "madad": "مدد"
};

// Common Pakistani Names (English to Urdu)
const NAME_DICTIONARY = {
  "muhammad": "محمد",
  "mohammad": "محمد",
  "mohammed": "محمد",
  "ali": "علی",
  "ahmed": "احمد",
  "ahmad": "احمد",
  "usman": "عثمان",
  "tariq": "طارق",
  "ayesha": "عائشہ",
  "fatima": "فاطمہ",
  "zainab": "زینب",
  "kamran": "کامران",
  "farhan": "فرحان",
  "saeed": "سعید",
  "hassan": "حسن",
  "hussain": "حسین",
  "bilal": "بلال",
  "hamza": "حمزہ",
  "umar": "عمر",
  "omar": "عمر",
  "siddiqui": "صدیقی",
  "khan": "خان",
  "malik": "ملک",
  "chaudhry": "چوہدری",
  "chaudhary": "چوہدری",
  "shah": "شاہ",
  "iqbal": "اقبال",
  "zafar": "ظفر",
  "nawaz": "نواز",
  "nawazish": "نوازش",
  "bibi": "بی بی",
  "maryam": "مریم",
  "sana": "ثنا",
  "amna": "آمنہ",
  "hira": "حرا",
  "zubair": "زبیر",
  "khalid": "خالد",
  "rashid": "راشد",
  "asif": "آصف",
  "imran": "عمران"
};

/**
 * Transliterates Roman Urdu string to clean Urdu script
 * @param {string} input 
 * @returns {string|null} Transliterated Urdu string or null if no mapping
 */
export function transliterateRomanUrdu(input) {
  if (!input || typeof input !== 'string') return null;
  const clean = input.trim().toLowerCase();
  if (clean.length < 2) return null;

  // 1. Check exact phrase matches
  for (const phrase of PHRASE_DICTIONARY) {
    if (clean === phrase.roman || clean === phrase.roman.replace(/\s+/g, ' ')) {
      return phrase.urdu;
    }
  }

  // 2. Check multi-word phrase containment
  for (const phrase of PHRASE_DICTIONARY) {
    if (clean.includes(phrase.roman)) {
      // Replace phrase match inside text
      const regex = new RegExp(phrase.roman, 'gi');
      const replaced = clean.replace(regex, phrase.urdu);
      return transliterateWordByWord(replaced);
    }
  }

  // 3. Word-by-word transliteration
  return transliterateWordByWord(clean);
}

function transliterateWordByWord(text) {
  const words = text.split(/\s+/);
  let translatedCount = 0;

  const translatedWords = words.map(w => {
    const cleanWord = w.replace(/[^a-z0-9]/gi, '').toLowerCase();
    if (!cleanWord) return w;

    // Check Names
    if (NAME_DICTIONARY[cleanWord]) {
      translatedCount++;
      return NAME_DICTIONARY[cleanWord];
    }

    // Check General & Medical Words
    if (WORD_DICTIONARY[cleanWord]) {
      translatedCount++;
      return WORD_DICTIONARY[cleanWord];
    }

    return w;
  });

  // Only return suggestion if at least one word was matched
  if (translatedCount > 0) {
    return translatedWords.join(' ');
  }

  return null;
}

/**
 * Normalizes multi-lingual search queries across English, Urdu, and Roman Urdu
 * @param {string} query 
 * @returns {Array<string>} Matching tokens in English and Urdu
 */
export function expandSearchTerms(query) {
  if (!query) return [];
  const q = query.trim().toLowerCase();
  const terms = [q];

  // If Roman Urdu, add Urdu expansion
  const urdu = transliterateRomanUrdu(q);
  if (urdu && !terms.includes(urdu)) {
    terms.push(urdu);
  }

  // City aliases
  for (const [romanCity, urduCity] of Object.entries(WORD_DICTIONARY)) {
    if (q.includes(romanCity) || q.includes(urduCity)) {
      terms.push(romanCity, urduCity);
    }
  }

  return Array.from(new Set(terms));
}
