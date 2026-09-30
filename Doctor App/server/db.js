import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import {
  SEED_DOCTORS,
  SEED_PATIENTS,
  SEED_APPOINTMENTS,
  SEED_TEMPLATES,
  SEED_PRESCRIPTIONS,
  SEED_DOCTOR_PDF_SETTINGS,
  SEED_PRESCRIPTION_SHARES,
  SEED_MESSAGE_LOGS,
  SEED_LEDGER
} from './data/seeds.js';
import { PAKISTAN_FORMULARY, LAST_UPDATED, FORMULARY_VERSION } from './data/pakistanFormulary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'data', 'doccare.json');

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

function generateSalt() {
  return crypto.randomBytes(16).toString('hex');
}

function generateSecureToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Pre-seeded default users for doctors and patients
function buildSeedUsers() {
  const users = [];

  // Seed all doctors
  SEED_DOCTORS.forEach(doc => {
    const salt = generateSalt();
    users.push({
      id: `user-${doc.id}`,
      email: doc.email.toLowerCase(),
      phone: doc.phone,
      name: doc.name,
      passwordHash: hashPassword('doctor123', salt),
      salt: salt,
      role: 'doctor',
      doctorId: doc.id,
      patientId: null,
      city: doc.city,
      specialty: doc.specialization,
      pmdcNumber: doc.pmdcNumber,
      clinicName: doc.clinicName,
      avatarUrl: doc.profileImage,
      googleId: null,
      createdAt: new Date().toISOString()
    });
  });

  // Seed sample patients
  const samplePatients = [
    {
      id: "user-pat-1",
      email: "kamran.ali@gmail.com",
      phone: "0300-4829103",
      name: "Kamran Ali",
      patientId: "pat-1",
      city: "Lahore",
      age: 48,
      gender: "Male"
    },
    {
      id: "user-pat-2",
      email: "zainab.bibi@gmail.com",
      phone: "0322-7183904",
      name: "Zainab Bibi",
      patientId: "pat-2",
      city: "Lahore",
      age: 29,
      gender: "Female"
    },
    {
      id: "user-pat-demo",
      email: "patient@doccare.pk",
      phone: "0300-4829103",
      name: "Demo Patient (Kamran Ali)",
      patientId: "pat-1",
      city: "Lahore",
      age: 48,
      gender: "Male"
    }
  ];

  samplePatients.forEach(p => {
    const salt = generateSalt();
    users.push({
      id: p.id,
      email: p.email.toLowerCase(),
      phone: p.phone,
      name: p.name,
      passwordHash: hashPassword('patient123', salt),
      salt: salt,
      role: 'patient',
      doctorId: null,
      patientId: p.patientId,
      city: p.city,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(p.name)}`,
      googleId: null,
      createdAt: new Date().toISOString()
    });
  });

  return users;
}

class Database {
  constructor() {
    this.data = {
      users: [],
      sessions: [],
      passwordResets: [],
      doctors: [],
      patients: [],
      appointments: [],
      medicines: [],
      prescriptions: [],
      prescriptionTemplates: [],
      doctorPdfSettings: [],
      prescriptionShares: [],
      messageLogs: [],
      ledgerEntries: [],
      auditLogs: []
    };
    this.init();
  }

  init() {
    try {
      const dataDir = path.join(__dirname, 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // Initialize with full seeds, users, sessions, formulary
      this.data = {
        users: buildSeedUsers(),
        sessions: [],
        passwordResets: [],
        doctors: SEED_DOCTORS,
        patients: SEED_PATIENTS,
        appointments: SEED_APPOINTMENTS,
        medicines: PAKISTAN_FORMULARY,
        favoriteMedicines: [
          { id: "fav-1", doctor_id: "doc-1", medicine_id: "med-pan-01" }, // Panadol
          { id: "fav-2", doctor_id: "doc-1", medicine_id: "med-aug-01" }, // Augmentin
          { id: "fav-3", doctor_id: "doc-1", medicine_id: "med-ris-01" }, // Risek
          { id: "fav-4", doctor_id: "doc-1", medicine_id: "med-dak-01" }, // Daktarin Cream
          { id: "fav-5", doctor_id: "doc-1", medicine_id: "med-ven-01" }  // Ventolin
        ],
        prescriptions: SEED_PRESCRIPTIONS,
        prescriptionTemplates: SEED_TEMPLATES,
        doctorPdfSettings: SEED_DOCTOR_PDF_SETTINGS,
        prescriptionShares: SEED_PRESCRIPTION_SHARES,
        messageLogs: SEED_MESSAGE_LOGS,
        ledgerEntries: SEED_LEDGER,
        auditLogs: [
          {
            id: "audit-1",
            doctor_id: "doc-1",
            action: "PRACTICE_SYSTEM_INITIALIZED",
            details: "DocCare clinical practice suite initialized with Pakistan Formulary Live Medicine Database & Dual-Role Auth",
            timestamp: new Date().toISOString()
          }
        ]
      };
      this.save();
    } catch (err) {
      console.error("Database initialization error:", err);
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error("Error saving database to file:", err);
    }
  }

  // ==========================================
  // PATIENTS METHODS (DOCTOR ISOLATED)
  // ==========================================
  getPatientsByDoctor(doctorId) {
    return this.data.patients.filter(p => p.doctor_id === doctorId);
  }

  getPatientById(doctorId, patientId) {
    return this.data.patients.find(p => p.id === patientId && p.doctor_id === doctorId);
  }

  findPatientByPhone(doctorId, phone) {
    if (!phone) return null;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    return this.data.patients.find(p => {
      if (p.doctor_id !== doctorId) return false;
      const curClean = (p.phone || '').replace(/[^0-9]/g, '');
      return curClean === cleanPhone || (curClean.endsWith(cleanPhone.slice(-10)) && cleanPhone.length >= 10);
    });
  }

  createPatient(patientData) {
    const newPatient = {
      id: `pat-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      doctor_id: patientData.doctor_id,
      name: patientData.name,
      age: Number(patientData.age) || 30,
      gender: patientData.gender || "Male",
      phone: patientData.phone || "",
      whatsapp: patientData.whatsapp || patientData.phone || "",
      allergies: patientData.allergies || "None",
      chronic_conditions: patientData.chronic_conditions || "None",
      current_medicines: patientData.current_medicines || "None",
      reason_for_visit: patientData.reason_for_visit || "General Consultation",
      consent_given: Boolean(patientData.consent_given),
      private_notes: patientData.private_notes || "",
      created_at: new Date().toISOString()
    };
    this.data.patients.unshift(newPatient);
    this.save();
    return newPatient;
  }

  updatePatient(doctorId, patientId, updates) {
    const idx = this.data.patients.findIndex(p => p.id === patientId && p.doctor_id === doctorId);
    if (idx === -1) return null;
    this.data.patients[idx] = {
      ...this.data.patients[idx],
      ...updates,
      id: patientId,
      doctor_id: doctorId
    };
    this.save();
    return this.data.patients[idx];
  }

  // ==========================================
  // APPOINTMENTS METHODS (DOUBLE-BOOKING ENGINE)
  // ==========================================
  getAppointmentsByDoctor(doctorId) {
    return this.data.appointments
      .filter(a => a.doctor_id === doctorId)
      .sort((a, b) => new Date(`${b.date} ${b.start_time}`) - new Date(`${a.date} ${a.start_time}`));
  }

  getAppointmentsByPatient(doctorId, patientId) {
    return this.data.appointments
      .filter(a => a.doctor_id === doctorId && a.patient_id === patientId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  isSlotConflict(doctorId, date, startTime, excludeAppointmentId = null) {
    return this.data.appointments.some(a => 
      a.doctor_id === doctorId &&
      a.date === date &&
      a.start_time.toLowerCase().trim() === startTime.toLowerCase().trim() &&
      a.status !== 'cancelled' &&
      (excludeAppointmentId ? a.id !== excludeAppointmentId : true)
    );
  }

  createAppointment(aptData) {
    if (this.isSlotConflict(aptData.doctor_id, aptData.date, aptData.start_time)) {
      const err = new Error(`Slot '${aptData.start_time}' on ${aptData.date} is already booked. Double-booking prevented.`);
      err.statusCode = 409;
      throw err;
    }

    const dateCompact = (aptData.date || new Date().toISOString().split('T')[0]).replace(/-/g, '');
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const appointment_no = aptData.appointment_no || `DC-APT-${dateCompact}-${randNum}`;

    const newApt = {
      id: `apt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      appointment_no,
      doctor_id: aptData.doctor_id,
      patient_id: aptData.patient_id,
      date: aptData.date,
      start_time: aptData.start_time,
      end_time: aptData.end_time || aptData.start_time,
      status: aptData.status || "pending",
      source: aptData.source || "online",
      notes: aptData.notes || "",
      created_at: new Date().toISOString()
    };

    this.data.appointments.unshift(newApt);
    this.save();
    this.logAudit(aptData.doctor_id, "APPOINTMENT_BOOKED", `Appointment booked for date ${aptData.date} at ${aptData.start_time}`);
    return newApt;
  }

  updateAppointmentStatus(doctorId, appointmentId, status, notes = null) {
    const apt = this.data.appointments.find(a => a.id === appointmentId && a.doctor_id === doctorId);
    if (!apt) return null;
    apt.status = status;
    if (notes !== null) apt.notes = notes;
    this.save();
    this.logAudit(doctorId, "APPOINTMENT_STATUS_UPDATED", `Appointment ${appointmentId} status changed to ${status}`);
    return apt;
  }

  rescheduleAppointment(doctorId, appointmentId, newDate, newStartTime, newEndTime = null) {
    const apt = this.data.appointments.find(a => a.id === appointmentId && a.doctor_id === doctorId);
    if (!apt) return null;

    if (this.isSlotConflict(doctorId, newDate, newStartTime, appointmentId)) {
      const err = new Error(`Slot '${newStartTime}' on ${newDate} is already booked. Choose another slot.`);
      err.statusCode = 409;
      throw err;
    }

    apt.date = newDate;
    apt.start_time = newStartTime;
    if (newEndTime) apt.end_time = newEndTime;
    if (apt.status === 'cancelled') apt.status = 'confirmed';
    this.save();
    this.logAudit(doctorId, "APPOINTMENT_RESCHEDULED", `Appointment ${appointmentId} rescheduled to ${newDate} at ${newStartTime}`);
    return apt;
  }

  // ==========================================
  // MEDICINES DATABASE & AUTOCOMPLETE (PAKISTAN FORMULARY)
  // ==========================================
  getAllMedicines(doctorId = null) {
    const customMeds = (this.data.medicines || []).filter(m => m.doctor_id && (doctorId ? m.doctor_id === doctorId : true));
    const formularyMeds = Array.isArray(PAKISTAN_FORMULARY) ? PAKISTAN_FORMULARY : [];
    
    // Combine standard formulary with custom doctor meds (deduping by ID)
    const map = new Map();
    formularyMeds.forEach(m => map.set(m.id, { ...m, is_custom: false }));
    customMeds.forEach(m => map.set(m.id, { ...m, is_custom: true }));
    return Array.from(map.values());
  }

  getMedicinesMeta() {
    const all = this.getAllMedicines();
    return {
      source: "Pakistan National Formulary & DRAP Registered Database",
      last_updated: LAST_UPDATED || "2026-09-30",
      version: FORMULARY_VERSION || "2026.3-DRAP-PK",
      total_medicines: all.length,
      coverage: "Primary Care, Pediatric, Dermatology, Cardiology, Antibiotics, ENT, Ophthalmology, Respiratory"
    };
  }

  searchMedicines(queryOrOptions = '', options = {}) {
    let query = '';
    let opts = {};

    if (typeof queryOrOptions === 'object' && queryOrOptions !== null) {
      opts = queryOrOptions;
      query = opts.q || opts.query || '';
    } else if (typeof queryOrOptions === 'string') {
      query = queryOrOptions;
      opts = typeof options === 'object' && options !== null ? options : {};
    } else {
      opts = typeof options === 'object' && options !== null ? options : {};
    }

    const doctorId = opts.doctorId || null;
    const limit = parseInt(opts.limit, 10) || 30;
    const formFilter = opts.form || null;
    const routeFilter = opts.route || null;
    const categoryFilter = opts.category || null;

    const q = (query || '').toLowerCase().trim();
    const allMeds = this.getAllMedicines(doctorId);
    const favIds = new Set(
      (this.data.favoriteMedicines || [])
        .filter(f => !doctorId || f.doctor_id === doctorId)
        .map(f => f.medicine_id)
    );

    let filtered = allMeds.map(m => ({
      ...m,
      is_favorite: favIds.has(m.id)
    }));

    if (formFilter) {
      const fLower = formFilter.toLowerCase();
      filtered = filtered.filter(m => (m.dosage_form || m.form || '').toLowerCase().includes(fLower));
    }
    if (routeFilter) {
      const rLower = routeFilter.toLowerCase();
      filtered = filtered.filter(m => (m.route || '').toLowerCase().includes(rLower));
    }
    if (categoryFilter) {
      const cLower = categoryFilter.toLowerCase();
      filtered = filtered.filter(m => (m.category || m.therapeutic_class || '').toLowerCase().includes(cLower));
    }

    if (!q) {
      return filtered.slice(0, limit);
    }

    const matches = filtered.filter(m => {
      const brand = (m.brand_name || m.name || '').toLowerCase();
      const generic = (m.generic_name || m.generic || '').toLowerCase();
      const cat = (m.category || m.therapeutic_class || '').toLowerCase();
      const drugClass = (m.drug_class || '').toLowerCase();
      const form = (m.dosage_form || m.form || '').toLowerCase();
      const route = (m.route || '').toLowerCase();
      const strength = (m.strength || '').toLowerCase();
      const mfg = (m.manufacturer || '').toLowerCase();
      
      const activeIngredientsMatch = Array.isArray(m.active_ingredients) 
        ? m.active_ingredients.some(ai => ai.toLowerCase().includes(q))
        : false;

      return (
        brand.includes(q) ||
        generic.includes(q) ||
        strength.includes(q) ||
        form.includes(q) ||
        route.includes(q) ||
        cat.includes(q) ||
        drugClass.includes(q) ||
        mfg.includes(q) ||
        activeIngredientsMatch
      );
    });

    matches.sort((a, b) => {
      // Prioritize exact or prefix brand matches
      const aBrand = (a.brand_name || '').toLowerCase();
      const bBrand = (b.brand_name || '').toLowerCase();
      const aBrandStart = aBrand.startsWith(q);
      const bBrandStart = bBrand.startsWith(q);
      if (aBrandStart && !bBrandStart) return -1;
      if (!aBrandStart && bBrandStart) return 1;

      // Prioritize generic prefix matches
      const aGen = (a.generic_name || '').toLowerCase();
      const bGen = (b.generic_name || '').toLowerCase();
      const aGenStart = aGen.startsWith(q);
      const bGenStart = bGen.startsWith(q);
      if (aGenStart && !bGenStart) return -1;
      if (!aGenStart && bGenStart) return 1;

      // Prioritize favorites
      if (a.is_favorite && !b.is_favorite) return -1;
      if (!a.is_favorite && b.is_favorite) return 1;

      return aBrand.localeCompare(bBrand);
    });

    return matches.slice(0, limit);
  }

  getMedicineById(id) {
    const all = this.getAllMedicines();
    return all.find(m => m.id === id) || null;
  }

  getFavoriteMedicines(doctorId) {
    const favIds = new Set(
      (this.data.favoriteMedicines || [])
        .filter(f => f.doctor_id === doctorId)
        .map(f => f.medicine_id)
    );
    const allMeds = this.getAllMedicines(doctorId);
    return allMeds.filter(m => favIds.has(m.id)).map(m => ({ ...m, is_favorite: true }));
  }

  toggleFavoriteMedicine(doctorId, medicineId) {
    if (!this.data.favoriteMedicines) this.data.favoriteMedicines = [];
    const existingIdx = this.data.favoriteMedicines.findIndex(f => f.doctor_id === doctorId && f.medicine_id === medicineId);
    let is_favorite = false;
    if (existingIdx >= 0) {
      this.data.favoriteMedicines.splice(existingIdx, 1);
      is_favorite = false;
    } else {
      this.data.favoriteMedicines.push({
        id: `fav-${Date.now()}`,
        doctor_id: doctorId,
        medicine_id: medicineId,
        created_at: new Date().toISOString()
      });
      is_favorite = true;
    }
    this.save();
    return { is_favorite, medicine_id: medicineId };
  }

  createCustomMedicine(doctorId, medData) {
    const newMed = {
      id: `med-cust-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      doctor_id: doctorId,
      brand_name: medData.brand_name,
      generic_name: medData.generic_name || medData.brand_name,
      active_ingredients: [medData.generic_name || medData.brand_name],
      strength: medData.strength || "Standard",
      available_strengths: [medData.strength || "Standard"],
      form: medData.dosage_form || medData.form || "Tablet",
      dosage_form: medData.dosage_form || medData.form || "Tablet",
      default_dose: medData.default_dose || "1 tab",
      default_frequency: medData.default_frequency || "BD — Twice daily",
      route: medData.route || "Oral",
      manufacturer: medData.manufacturer || "Custom / Local Pharma",
      therapeutic_class: medData.therapeutic_class || "Custom Formulation",
      source: "Doctor Custom Entry",
      last_updated: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    };
    if (!this.data.medicines) this.data.medicines = [];
    this.data.medicines.unshift(newMed);
    this.save();
    this.logAudit(doctorId, "CUSTOM_MEDICINE_CREATED", `Added custom medicine: ${newMed.brand_name} (${newMed.strength})`);
    return newMed;
  }

  // ==========================================
  // PRESCRIPTIONS ENGINE (STEPS 3 & 4)
  // ==========================================
  generatePrescriptionNumber() {
    const year = new Date().getFullYear();
    const count = this.data.prescriptions.length + 1;
    const padded = String(count).padStart(5, '0');
    return `RX-${year}-${padded}`;
  }

  generateVerificationToken() {
    return `vtok_${Math.random().toString(36).substr(2, 6)}_${Math.random().toString(36).substr(2, 6)}`;
  }

  getPrescriptionsByDoctor(doctorId, options = {}) {
    let list = this.data.prescriptions.filter(p => p.doctor_id === doctorId);

    if (options.patient_id) {
      list = list.filter(p => p.patient_id === options.patient_id);
    }
    if (options.status) {
      list = list.filter(p => p.status === options.status);
    }
    if (options.q) {
      const query = options.q.toLowerCase().trim();
      list = list.filter(p => {
        const pat = this.data.patients.find(pt => pt.id === p.patient_id);
        const patName = pat?.name?.toLowerCase() || '';
        const diag = (p.diagnosis || '').toLowerCase();
        const rxNo = (p.prescription_no || '').toLowerCase();
        return patName.includes(query) || diag.includes(query) || rxNo.includes(query);
      });
    }

    return list.map(rx => {
      const patient = this.data.patients.find(pt => pt.id === rx.patient_id);
      return {
        ...rx,
        patient_name: patient?.name || "Patient Record",
        patient_phone: patient?.phone || "",
        patient_age: patient?.age || 30,
        patient_gender: patient?.gender || "Male",
        patient_allergies: patient?.allergies || "None",
        items_count: Array.isArray(rx.items) ? rx.items.length : 0
      };
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  getPrescriptionById(doctorId, prescriptionId) {
    const rx = this.data.prescriptions.find(p => (p.id === prescriptionId || p.prescription_no === prescriptionId) && (doctorId ? p.doctor_id === doctorId : true));
    if (!rx) return null;

    const patient = this.data.patients.find(pt => pt.id === rx.patient_id);
    const doctor = this.data.doctors.find(d => d.id === rx.doctor_id);

    return {
      ...rx,
      patient: patient || null,
      doctor: doctor || null
    };
  }

  findPrescriptionByVerificationToken(token) {
    if (!token) return null;
    const cleanToken = token.trim();
    const rx = this.data.prescriptions.find(p => p.verification_token === cleanToken || p.id === cleanToken);
    if (!rx) return null;

    const patient = this.data.patients.find(pt => pt.id === rx.patient_id);
    const doctor = this.data.doctors.find(d => d.id === rx.doctor_id);

    return {
      ...rx,
      patient: patient || null,
      doctor: doctor || null
    };
  }

  savePrescriptionDraft(doctorId, data) {
    let rx = null;
    if (data.id) {
      rx = this.data.prescriptions.find(p => p.id === data.id && p.doctor_id === doctorId);
      if (rx && rx.status === 'final') {
        const err = new Error("Finalized prescriptions are permanently locked and cannot be edited. Duplicate it to create a new draft.");
        err.statusCode = 403;
        throw err;
      }
    }

    const normalizedItems = (data.items || []).map((item, idx) => ({
      id: item.id || `item-${Date.now()}-${idx}`,
      medicine_id: item.medicine_id || null,
      medicine_name: item.medicine_name || item.name || '',
      strength: item.strength || '',
      form: item.form || 'tablet',
      dose: item.dose || '1 tab',
      frequency: item.frequency || '1+0+1',
      duration: item.duration || '5 Days',
      instructions: item.instructions || 'After meals',
      sort_order: idx + 1
    }));

    if (rx) {
      rx.patient_id = data.patient_id || rx.patient_id;
      rx.appointment_id = data.appointment_id !== undefined ? data.appointment_id : rx.appointment_id;
      rx.diagnosis = data.diagnosis !== undefined ? data.diagnosis : rx.diagnosis;
      rx.symptoms = data.symptoms !== undefined ? data.symptoms : rx.symptoms;
      rx.items = normalizedItems;
      rx.tests_advised = data.tests_advised !== undefined ? data.tests_advised : rx.tests_advised;
      rx.advice = data.advice !== undefined ? data.advice : rx.advice;
      rx.follow_up_date = data.follow_up_date !== undefined ? data.follow_up_date : rx.follow_up_date;
      rx.updated_at = new Date().toISOString();
      if (!rx.verification_token) rx.verification_token = this.generateVerificationToken();
      this.save();
      return rx;
    } else {
      const newDraft = {
        id: `rx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        doctor_id: doctorId,
        patient_id: data.patient_id,
        appointment_id: data.appointment_id || null,
        prescription_no: this.generatePrescriptionNumber(),
        diagnosis: data.diagnosis || '',
        symptoms: data.symptoms || '',
        items: normalizedItems,
        tests_advised: data.tests_advised || '',
        advice: data.advice || '',
        follow_up_date: data.follow_up_date || null,
        status: 'draft',
        verification_token: this.generateVerificationToken(),
        pdf_url: null,
        pdf_generated_at: null,
        created_at: new Date().toISOString(),
        finalized_at: null
      };

      this.data.prescriptions.unshift(newDraft);
      this.save();
      return newDraft;
    }
  }

  finalizePrescription(doctorId, prescriptionId, finalData = {}) {
    let rx = this.data.prescriptions.find(p => p.id === prescriptionId && p.doctor_id === doctorId);
    if (!rx) {
      rx = this.savePrescriptionDraft(doctorId, { ...finalData, id: prescriptionId });
    }

    if (rx.status === 'final') {
      return this.getPrescriptionById(doctorId, rx.id);
    }

    if (finalData.diagnosis !== undefined) rx.diagnosis = finalData.diagnosis;
    if (finalData.symptoms !== undefined) rx.symptoms = finalData.symptoms;
    if (finalData.items) {
      rx.items = finalData.items.map((item, idx) => ({
        id: item.id || `item-${Date.now()}-${idx}`,
        medicine_id: item.medicine_id || null,
        medicine_name: item.medicine_name || item.name || '',
        strength: item.strength || '',
        form: item.form || 'tablet',
        dose: item.dose || '1 tab',
        frequency: item.frequency || '1+0+1',
        duration: item.duration || '5 Days',
        instructions: item.instructions || 'After meals',
        sort_order: idx + 1
      }));
    }
    if (finalData.tests_advised !== undefined) rx.tests_advised = finalData.tests_advised;
    if (finalData.advice !== undefined) rx.advice = finalData.advice;
    if (finalData.follow_up_date !== undefined) rx.follow_up_date = finalData.follow_up_date;

    rx.status = 'final';
    rx.finalized_at = new Date().toISOString();
    if (!rx.verification_token) rx.verification_token = this.generateVerificationToken();
    rx.pdf_url = `/api/prescriptions/${rx.id}/pdf`;
    rx.pdf_generated_at = new Date().toISOString();

    this.save();
    this.logAudit(doctorId, "PRESCRIPTION_FINALIZED", `Finalized prescription ${rx.prescription_no} with verification token ${rx.verification_token}`);

    if (rx.appointment_id && finalData.completeAppointment) {
      this.updateAppointmentStatus(doctorId, rx.appointment_id, 'completed', `Completed with prescription ${rx.prescription_no}`);
    }

    return this.getPrescriptionById(doctorId, rx.id);
  }

  updatePrescriptionPdfMetadata(prescriptionId, pdfUrl) {
    const rx = this.data.prescriptions.find(p => p.id === prescriptionId);
    if (!rx) return null;
    rx.pdf_url = pdfUrl;
    rx.pdf_generated_at = new Date().toISOString();
    this.save();
    return rx;
  }

  duplicatePrescription(doctorId, prescriptionId) {
    const original = this.data.prescriptions.find(p => p.id === prescriptionId && p.doctor_id === doctorId);
    if (!original) return null;

    const duplicatedDraft = {
      id: `rx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      doctor_id: doctorId,
      patient_id: original.patient_id,
      appointment_id: null,
      prescription_no: this.generatePrescriptionNumber(),
      diagnosis: original.diagnosis,
      symptoms: original.symptoms || '',
      items: (original.items || []).map((item, idx) => ({
        ...item,
        id: `item-${Date.now()}-${idx}`,
        sort_order: idx + 1
      })),
      tests_advised: original.tests_advised || '',
      advice: original.advice || '',
      follow_up_date: null,
      status: 'draft',
      verification_token: this.generateVerificationToken(),
      pdf_url: null,
      pdf_generated_at: null,
      created_at: new Date().toISOString(),
      finalized_at: null,
      duplicated_from: original.prescription_no
    };

    this.data.prescriptions.unshift(duplicatedDraft);
    this.save();
    this.logAudit(doctorId, "PRESCRIPTION_DUPLICATED", `Duplicated past Rx ${original.prescription_no} into new draft ${duplicatedDraft.prescription_no}`);
    return duplicatedDraft;
  }

  // ==========================================
  // TEMPLATES CRUD (STEP 3)
  // ==========================================
  getTemplatesByDoctor(doctorId) {
    return this.data.prescriptionTemplates.filter(t => t.doctor_id === null || t.doctor_id === doctorId);
  }

  createTemplate(doctorId, tplData) {
    const newTemplate = {
      id: `tpl-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      doctor_id: doctorId,
      name: tplData.name,
      diagnosis: tplData.diagnosis || '',
      items: tplData.items || [],
      tests_advised: tplData.tests_advised || '',
      advice: tplData.advice || '',
      created_at: new Date().toISOString()
    };
    this.data.prescriptionTemplates.unshift(newTemplate);
    this.save();
    this.logAudit(doctorId, "TEMPLATE_CREATED", `Created prescription template: ${newTemplate.name}`);
    return newTemplate;
  }

  updateTemplate(doctorId, templateId, updates) {
    const idx = this.data.prescriptionTemplates.findIndex(t => t.id === templateId && (t.doctor_id === doctorId || t.doctor_id === null));
    if (idx === -1) return null;
    
    if (this.data.prescriptionTemplates[idx].doctor_id === null) {
      const doctorCopy = {
        ...this.data.prescriptionTemplates[idx],
        ...updates,
        id: `tpl-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        doctor_id: doctorId
      };
      this.data.prescriptionTemplates.unshift(doctorCopy);
      this.save();
      return doctorCopy;
    }

    this.data.prescriptionTemplates[idx] = {
      ...this.data.prescriptionTemplates[idx],
      ...updates,
      id: templateId,
      doctor_id: doctorId
    };
    this.save();
    return this.data.prescriptionTemplates[idx];
  }

  deleteTemplate(doctorId, templateId) {
    const idx = this.data.prescriptionTemplates.findIndex(t => t.id === templateId && t.doctor_id === doctorId);
    if (idx === -1) return false;
    this.data.prescriptionTemplates.splice(idx, 1);
    this.save();
    this.logAudit(doctorId, "TEMPLATE_DELETED", `Deleted template ${templateId}`);
    return true;
  }

  // ==========================================
  // STEP 4: DOCTOR PDF SETTINGS (ISOLATED)
  // ==========================================
  getDoctorPdfSettings(doctorId) {
    let settings = this.data.doctorPdfSettings.find(s => s.doctor_id === doctorId);
    if (!settings) {
      // Create default settings if not exists
      const doc = this.data.doctors.find(d => d.id === doctorId);
      settings = {
        id: `pdf-set-${doctorId}`,
        doctor_id: doctorId,
        header_layout: 'left-logo',
        primary_color: doc?.headerColor || '#0F766E',
        secondary_color: doc?.accentColor || '#0284C7',
        font: 'Helvetica',
        logo_url: '',
        signature_url: doc?.signatureImage || '',
        stamp_url: doc?.stampImage || '',
        footer_text: doc?.disclaimerText || 'This digital prescription is generated electronically and verified by the attending physician.',
        show_qr: true,
        show_photo: true,
        paper_margin: 'normal',
        language: 'both',
        updated_at: new Date().toISOString()
      };
      this.data.doctorPdfSettings.push(settings);
      this.save();
    }
    return settings;
  }

  updateDoctorPdfSettings(doctorId, updates) {
    const idx = this.data.doctorPdfSettings.findIndex(s => s.doctor_id === doctorId);
    if (idx === -1) {
      const newSettings = {
        id: `pdf-set-${doctorId}`,
        doctor_id: doctorId,
        ...updates,
        updated_at: new Date().toISOString()
      };
      this.data.doctorPdfSettings.push(newSettings);
      this.save();
      this.logAudit(doctorId, "PDF_SETTINGS_UPDATED", `Created custom PDF layout settings`);
      return newSettings;
    }

    this.data.doctorPdfSettings[idx] = {
      ...this.data.doctorPdfSettings[idx],
      ...updates,
      doctor_id: doctorId,
      updated_at: new Date().toISOString()
    };
    this.save();
    this.logAudit(doctorId, "PDF_SETTINGS_UPDATED", `Updated PDF layout settings: layout=${this.data.doctorPdfSettings[idx].header_layout}, color=${this.data.doctorPdfSettings[idx].primary_color}`);
    return this.data.doctorPdfSettings[idx];
  }

  resetDoctorPdfSettings(doctorId) {
    const doc = this.data.doctors.find(d => d.id === doctorId);
    const defaultSettings = {
      id: `pdf-set-${doctorId}`,
      doctor_id: doctorId,
      header_layout: 'left-logo',
      primary_color: '#0F766E',
      secondary_color: '#0284C7',
      font: 'Helvetica',
      logo_url: '',
      signature_url: doc?.signatureImage || '',
      stamp_url: doc?.stampImage || '',
      footer_text: 'This digital prescription is generated electronically and verified by the attending physician.',
      show_qr: true,
      show_photo: true,
      paper_margin: 'normal',
      language: 'both',
      updated_at: new Date().toISOString()
    };

    const idx = this.data.doctorPdfSettings.findIndex(s => s.doctor_id === doctorId);
    if (idx !== -1) {
      this.data.doctorPdfSettings[idx] = defaultSettings;
    } else {
      this.data.doctorPdfSettings.push(defaultSettings);
    }
    this.save();
    this.logAudit(doctorId, "PDF_SETTINGS_RESET", `Reset PDF layout settings to system defaults`);
    return defaultSettings;
  }

  // ==========================================
  // STEP 5: PRESCRIPTION SHARES METHODS
  // ==========================================
  createPrescriptionShare(doctorId, { prescription_id, patient_id, expiry_days, max_downloads }) {
    const rx = this.getPrescriptionById(doctorId, prescription_id);
    if (!rx) {
      throw new Error("Prescription not found or unauthorized");
    }

    const doctor = this.getDoctorById(doctorId);
    const days = Number(expiry_days) || Number(doctor?.default_link_expiry_days) || 7;
    const expiresAt = new Date(Date.now() + days * 86400000).toISOString();
    
    // 32+ bytes cryptographic random hex token (64 hex characters)
    const shareToken = crypto.randomBytes(32).toString('hex');

    const newShare = {
      id: `share-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      prescription_id,
      doctor_id: doctorId,
      patient_id: patient_id || rx.patient_id,
      share_token: shareToken,
      expires_at: expiresAt,
      max_downloads: max_downloads ? Number(max_downloads) : null,
      download_count: 0,
      revoked: false,
      created_at: new Date().toISOString(),
      last_downloaded_at: null
    };

    if (!this.data.prescriptionShares) {
      this.data.prescriptionShares = [];
    }

    this.data.prescriptionShares.push(newShare);
    this.save();

    this.logAudit(
      doctorId,
      "PRESCRIPTION_SHARE_CREATED",
      `Created secure expiring share link for ${rx.prescription_no || prescription_id}, valid for ${days} days (token: ${shareToken.slice(0, 10)}...)`
    );

    return newShare;
  }

  getShareByToken(token) {
    if (!token) return null;
    const share = (this.data.prescriptionShares || []).find(s => s.share_token === token);
    if (!share) return null;

    const now = Date.now();
    const expiryTime = new Date(share.expires_at).getTime();
    const isExpired = isNaN(expiryTime) || now > expiryTime;
    const isRevoked = Boolean(share.revoked);
    const isLimitReached = Boolean(share.max_downloads && share.download_count >= share.max_downloads);

    const isValid = !isExpired && !isRevoked && !isLimitReached;

    const rx = (this.data.prescriptions || []).find(p => p.id === share.prescription_id);
    const doctor = rx ? (this.data.doctors || []).find(d => d.id === rx.doctor_id) : null;
    const patient = (this.data.patients || []).find(p => p.id === share.patient_id);

    return {
      share,
      rx,
      doctor,
      patient,
      isExpired,
      isRevoked,
      isLimitReached,
      isValid
    };
  }

  incrementShareDownload(token) {
    const shareIndex = (this.data.prescriptionShares || []).findIndex(s => s.share_token === token);
    if (shareIndex === -1) return null;

    this.data.prescriptionShares[shareIndex].download_count = (this.data.prescriptionShares[shareIndex].download_count || 0) + 1;
    this.data.prescriptionShares[shareIndex].last_downloaded_at = new Date().toISOString();
    this.save();

    const share = this.data.prescriptionShares[shareIndex];
    this.logAudit(
      share.doctor_id,
      "PRESCRIPTION_DOWNLOADED",
      `Prescription PDF downloaded via share link (download #${share.download_count}) for Rx #${share.prescription_id}`
    );

    return share;
  }

  revokePrescriptionShare(doctorId, shareId) {
    const share = (this.data.prescriptionShares || []).find(s => s.id === shareId && s.doctor_id === doctorId);
    if (!share) {
      throw new Error("Share link not found or unauthorized");
    }

    share.revoked = true;
    share.updated_at = new Date().toISOString();
    this.save();

    this.logAudit(
      doctorId,
      "PRESCRIPTION_SHARE_REVOKED",
      `Revoked public share link #${share.id} for Prescription #${share.prescription_id}`
    );

    return share;
  }

  getSharesByPrescription(doctorId, prescriptionId) {
    return (this.data.prescriptionShares || [])
      .filter(s => s.prescription_id === prescriptionId && s.doctor_id === doctorId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  getActiveShareForPrescription(doctorId, prescriptionId) {
    const shares = this.getSharesByPrescription(doctorId, prescriptionId);
    const now = Date.now();
    return shares.find(s => {
      if (s.revoked) return false;
      const expiryTime = new Date(s.expires_at).getTime();
      if (now > expiryTime) return false;
      if (s.max_downloads && s.download_count >= s.max_downloads) return false;
      return true;
    }) || null;
  }

  // ==========================================
  // STEP 5: MESSAGE LOGS & DISPATCH AUDIT
  // ==========================================
  createMessageLog(doctorId, logData) {
    const newLog = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      prescription_id: logData.prescription_id || null,
      share_id: logData.share_id || null,
      appointment_id: logData.appointment_id || null,
      doctor_id: doctorId,
      patient_id: logData.patient_id,
      type: logData.type || 'prescription', // 'prescription' | 'reminder' | 'confirmation'
      channel: logData.channel || 'wa_link', // 'wa_link' | 'wa_cloud_api' | 'sms'
      to_number: logData.to_number,
      message_text: logData.message_text || '',
      status: logData.status || 'opened', // 'opened' | 'queued' | 'sent' | 'delivered' | 'read' | 'failed'
      provider_message_id: logData.provider_message_id || null,
      error: logData.error || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (!this.data.messageLogs) {
      this.data.messageLogs = [];
    }

    this.data.messageLogs.unshift(newLog);
    this.save();

    this.logAudit(
      doctorId,
      "WHATSAPP_MESSAGE_SENT",
      `Dispatched WhatsApp [${newLog.type.toUpperCase()}] to ${newLog.to_number} via ${newLog.channel} (Status: ${newLog.status})`
    );

    return newLog;
  }

  updateMessageLogStatus(messageId, status, provider_message_id = null, error = null) {
    const log = (this.data.messageLogs || []).find(m => m.id === messageId);
    if (!log) return null;

    log.status = status;
    if (provider_message_id) log.provider_message_id = provider_message_id;
    if (error !== undefined) log.error = error;
    log.updated_at = new Date().toISOString();
    this.save();
    return log;
  }

  updateMessageLogByProviderId(providerMessageId, status, error = null) {
    if (!providerMessageId) return null;
    const log = (this.data.messageLogs || []).find(m => m.provider_message_id === providerMessageId);
    if (!log) return null;

    log.status = status;
    if (error) log.error = error;
    log.updated_at = new Date().toISOString();
    this.save();
    return log;
  }

  getMessageLogsByDoctor(doctorId, filters = {}) {
    let logs = (this.data.messageLogs || []).filter(m => m.doctor_id === doctorId);

    if (filters.status && filters.status !== 'all') {
      logs = logs.filter(m => m.status === filters.status);
    }

    if (filters.type && filters.type !== 'all') {
      logs = logs.filter(m => m.type === filters.type);
    }

    if (filters.patient_id) {
      logs = logs.filter(m => m.patient_id === filters.patient_id);
    }

    if (filters.date) {
      logs = logs.filter(m => m.created_at && m.created_at.startsWith(filters.date));
    }

    if (filters.q) {
      const q = filters.q.toLowerCase();
      logs = logs.filter(m => {
        const pat = (this.data.patients || []).find(p => p.id === m.patient_id);
        return (
          (m.to_number && m.to_number.includes(q)) ||
          (m.message_text && m.message_text.toLowerCase().includes(q)) ||
          (pat && pat.name.toLowerCase().includes(q))
        );
      });
    }

    // Enrich with patient and prescription info
    return logs.map(m => {
      const patient = (this.data.patients || []).find(p => p.id === m.patient_id);
      const rx = m.prescription_id ? (this.data.prescriptions || []).find(p => p.id === m.prescription_id) : null;
      const share = m.share_id ? (this.data.prescriptionShares || []).find(s => s.id === m.share_id) : null;
      return {
        ...m,
        patient_name: patient?.name || 'Unknown Patient',
        patient_phone: patient?.phone || m.to_number,
        prescription_no: rx?.prescription_no || null,
        share_token: share?.share_token || null,
        share_expires_at: share?.expires_at || null,
        share_download_count: share?.download_count || 0,
        share_last_downloaded_at: share?.last_downloaded_at || null,
        share_revoked: share?.revoked || false
      };
    });
  }

  getMessageLogsByPrescription(doctorId, prescriptionId) {
    return this.getMessageLogsByDoctor(doctorId).filter(m => m.prescription_id === prescriptionId);
  }

  getMessageLogsByPatient(doctorId, patientId) {
    return this.getMessageLogsByDoctor(doctorId, { patient_id: patientId });
  }

  getTodaysSentCount(doctorId) {
    const today = new Date().toISOString().split('T')[0];
    return (this.data.messageLogs || []).filter(
      m => m.doctor_id === doctorId && m.type === 'prescription' && m.created_at.startsWith(today)
    ).length;
  }

  getFailedMessagesCount(doctorId) {
    return (this.data.messageLogs || []).filter(
      m => m.doctor_id === doctorId && m.status === 'failed'
    ).length;
  }

  getDoctorById(doctorId) {
    return (this.data.doctors || []).find(d => d.id === doctorId) || null;
  }

  updateDoctorWhatsAppSettings(doctorId, { whatsapp_message_template, default_link_expiry_days }) {
    const doc = (this.data.doctors || []).find(d => d.id === doctorId);
    if (!doc) throw new Error("Doctor not found");

    if (whatsapp_message_template !== undefined) {
      doc.whatsapp_message_template = whatsapp_message_template;
    }
    if (default_link_expiry_days !== undefined) {
      doc.default_link_expiry_days = Number(default_link_expiry_days);
    }
    this.save();
    this.logAudit(doctorId, "WHATSAPP_SETTINGS_UPDATED", `Updated WhatsApp template & default expiry (${doc.default_link_expiry_days} days)`);
    return doc;
  }

  // ==========================================
  // PAKISTAN FORMULARY & LIVE MEDICINE ENGINE
  // ==========================================
  getMedicinesMeta() {
    const totalCount = (this.data.medicines || []).length;
    const categories = Array.from(new Set((this.data.medicines || []).map(m => m.therapeutic_class || m.category).filter(Boolean)));
    const forms = Array.from(new Set((this.data.medicines || []).map(m => m.dosage_form || m.form).filter(Boolean)));
    const manufacturers = Array.from(new Set((this.data.medicines || []).map(m => m.manufacturer).filter(Boolean)));

    return {
      totalCount,
      version: FORMULARY_VERSION,
      lastUpdated: LAST_UPDATED,
      source: "DRAP Pakistan / National Essential Formulary",
      categoriesCount: categories.length,
      formsCount: forms.length,
      manufacturersCount: manufacturers.length,
      categories,
      forms
    };
  }

  // ==========================================
  // DOCTOR LEDGER & PATIENT ACCOUNTING ENGINE
  // ==========================================
  generateTransactionId() {
    const year = new Date().getFullYear();
    const count = ((this.data.ledgerEntries || []).length + 1).toString().padStart(4, '0');
    return `TXN-${year}-${count}`;
  }

  getLedgerEntries(doctorId, filters = {}) {
    if (!this.data.ledgerEntries) this.data.ledgerEntries = [];
    
    // 1. Get all entries for this doctor
    let allDoctorEntries = this.data.ledgerEntries.filter(e => e.doctor_id === doctorId);

    // 2. Sort chronologically (oldest to newest) to calculate cumulative running balance
    allDoctorEntries.sort((a, b) => {
      const dateA = `${a.transaction_date || '2026-01-01'}T${a.transaction_time || '00:00'}`;
      const dateB = `${b.transaction_date || '2026-01-01'}T${b.transaction_time || '00:00'}`;
      return new Date(dateA) - new Date(dateB);
    });

    let currentBalance = 0;
    const computedEntries = allDoctorEntries.map(entry => {
      const amt = Number(entry.amount) || 0;
      if (entry.entry_type === 'cash_in') {
        currentBalance += amt;
      } else {
        currentBalance -= amt;
      }
      return {
        ...entry,
        running_balance: currentBalance
      };
    });

    // 3. Apply active filters
    let filtered = [...computedEntries];

    // Search query 'q'
    if (filters.q && filters.q.trim()) {
      const q = filters.q.toLowerCase().trim();
      filtered = filtered.filter(e => 
        (e.patient_name && e.patient_name.toLowerCase().includes(q)) ||
        (e.patient_code && e.patient_code.toLowerCase().includes(q)) ||
        (e.patient_phone && e.patient_phone.includes(q)) ||
        (e.description && e.description.toLowerCase().includes(q)) ||
        (e.remarks && e.remarks.toLowerCase().includes(q)) ||
        (e.reference && e.reference.toLowerCase().includes(q)) ||
        (e.transaction_id && e.transaction_id.toLowerCase().includes(q)) ||
        (e.type && e.type.toLowerCase().includes(q)) ||
        (e.category && e.category.toLowerCase().includes(q)) ||
        (e.payment_method && e.payment_method.toLowerCase().includes(q)) ||
        (e.amount && e.amount.toString().includes(q))
      );
    }

    // Patient filter
    if (filters.patient_id && filters.patient_id !== 'all') {
      filtered = filtered.filter(e => e.patient_id === filters.patient_id);
    }

    // Type filter
    if (filters.type && filters.type !== 'all') {
      const tLower = filters.type.toLowerCase();
      if (tLower === 'cash_in' || tLower === 'cash_out') {
        filtered = filtered.filter(e => e.entry_type === tLower);
      } else {
        filtered = filtered.filter(e => (e.type || '').toLowerCase().includes(tLower));
      }
    }

    // Category filter
    if (filters.category && filters.category !== 'all') {
      const cLower = filters.category.toLowerCase();
      filtered = filtered.filter(e => (e.category || '').toLowerCase().includes(cLower));
    }

    // Payment Method filter
    if (filters.payment_method && filters.payment_method !== 'all') {
      const pLower = filters.payment_method.toLowerCase();
      filtered = filtered.filter(e => (e.payment_method || '').toLowerCase() === pLower);
    }

    // Date / Duration filter
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (filters.duration && filters.duration !== 'all') {
      if (filters.duration === 'today') {
        filtered = filtered.filter(e => e.transaction_date === todayStr);
      } else if (filters.duration === 'yesterday') {
        const y = new Date(now);
        y.setDate(y.getDate() - 1);
        const yStr = y.toISOString().split('T')[0];
        filtered = filtered.filter(e => e.transaction_date === yStr);
      } else if (filters.duration === 'this_week') {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const wStr = weekAgo.toISOString().split('T')[0];
        filtered = filtered.filter(e => e.transaction_date >= wStr && e.transaction_date <= todayStr);
      } else if (filters.duration === 'this_month') {
        const monthPrefix = todayStr.substring(0, 7);
        filtered = filtered.filter(e => e.transaction_date && e.transaction_date.startsWith(monthPrefix));
      } else if (filters.duration === 'last_month') {
        const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lmPrefix = lm.toISOString().substring(0, 7);
        filtered = filtered.filter(e => e.transaction_date && e.transaction_date.startsWith(lmPrefix));
      } else if (filters.duration === 'custom') {
        if (filters.start_date) {
          filtered = filtered.filter(e => e.transaction_date >= filters.start_date);
        }
        if (filters.end_date) {
          filtered = filtered.filter(e => e.transaction_date <= filters.end_date);
        }
      }
    } else if (filters.start_date || filters.end_date) {
      if (filters.start_date) {
        filtered = filtered.filter(e => e.transaction_date >= filters.start_date);
      }
      if (filters.end_date) {
        filtered = filtered.filter(e => e.transaction_date <= filters.end_date);
      }
    }

    // 4. Return in reverse chronological order (newest first) for doctor display
    return filtered.reverse();
  }

  getLedgerSummary(doctorId, filters = {}) {
    const entries = this.getLedgerEntries(doctorId, filters);
    const todayStr = new Date().toISOString().split('T')[0];

    let totalCashIn = 0;
    let totalCashOut = 0;
    let patientPayments = 0;
    let otherIncome = 0;
    let totalExpenses = 0;
    let todayIncome = 0;
    let todayExpense = 0;

    entries.forEach(e => {
      const amt = Number(e.amount) || 0;
      if (e.entry_type === 'cash_in') {
        totalCashIn += amt;
        if (e.patient_id) {
          patientPayments += amt;
        } else {
          otherIncome += amt;
        }
        if (e.transaction_date === todayStr) {
          todayIncome += amt;
        }
      } else {
        totalCashOut += amt;
        totalExpenses += amt;
        if (e.transaction_date === todayStr) {
          todayExpense += amt;
        }
      }
    });

    const netBalance = totalCashIn - totalCashOut;
    const todayNet = todayIncome - todayExpense;

    // Calculate outstanding count from appointments/prescriptions
    const doctorPatients = this.data.patients.filter(p => p.doctor_id === doctorId);
    const outstandingPatients = doctorPatients.length;

    return {
      totalCashIn,
      totalCashOut,
      netBalance,
      patientPayments,
      otherIncome,
      totalExpenses,
      todayIncome,
      todayExpense,
      todayNet,
      totalEntries: entries.length,
      outstandingPatients
    };
  }

  getLedgerEntryById(doctorId, id) {
    if (!this.data.ledgerEntries) this.data.ledgerEntries = [];
    const entry = this.data.ledgerEntries.find(e => e.id === id && e.doctor_id === doctorId);
    if (!entry) return null;

    let patient = null;
    if (entry.patient_id) {
      patient = this.data.patients.find(p => p.id === entry.patient_id) || null;
    }
    return {
      ...entry,
      patient
    };
  }

  createLedgerEntry(doctorId, data) {
    if (!this.data.ledgerEntries) this.data.ledgerEntries = [];
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let patientName = data.patient_name || 'General Expense / Non-Patient';
    let patientCode = data.patient_code || null;
    let patientPhone = data.patient_phone || null;

    if (data.patient_id) {
      const pat = this.data.patients.find(p => p.id === data.patient_id);
      if (pat) {
        patientName = pat.name;
        patientCode = `PAT-${pat.id.replace('pat-', '').padStart(5, '0')}`;
        patientPhone = pat.phone;
      }
    }

    const doctor = this.data.doctors.find(d => d.id === doctorId);

    const newEntry = {
      id: `led-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      doctor_id: doctorId,
      patient_id: data.patient_id || null,
      patient_name: patientName,
      patient_code: patientCode,
      patient_phone: patientPhone,
      visit_id: data.visit_id || null,
      appointment_id: data.appointment_id || null,
      transaction_id: data.transaction_id || this.generateTransactionId(),
      entry_type: data.entry_type || (data.type?.includes('Expense') || data.type?.includes('Salary') || data.type?.includes('Rent') || data.type === 'Refund' ? 'cash_out' : 'cash_in'),
      type: data.type || (data.entry_type === 'cash_in' ? 'Consultation Fee' : 'Medical Supplies'),
      category: data.category || (data.entry_type === 'cash_in' ? 'Consultation' : 'Supplies'),
      description: data.description || data.remarks || 'Clinic financial transaction',
      amount: Number(data.amount) || 0,
      payment_method: data.payment_method || 'Cash',
      reference: data.reference || `REF-${Math.floor(1000 + Math.random() * 9000)}`,
      remarks: data.remarks || data.description || '',
      transaction_date: data.transaction_date || todayStr,
      transaction_time: data.transaction_time || timeStr,
      status: data.status || 'completed',
      created_by: doctor?.name || 'Practicing Physician',
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      audit_history: []
    };

    this.data.ledgerEntries.unshift(newEntry);
    this.save();
    this.logAudit(doctorId, "LEDGER_ENTRY_CREATED", `Recorded ${newEntry.entry_type.toUpperCase()} of PKR ${newEntry.amount.toLocaleString()} for ${newEntry.patient_name} (${newEntry.type})`);
    return newEntry;
  }

  updateLedgerEntry(doctorId, id, data) {
    if (!this.data.ledgerEntries) this.data.ledgerEntries = [];
    const entry = this.data.ledgerEntries.find(e => e.id === id && e.doctor_id === doctorId);
    if (!entry) return null;

    const previousSnapshot = {
      amount: entry.amount,
      type: entry.type,
      category: entry.category,
      payment_method: entry.payment_method,
      description: entry.description,
      remarks: entry.remarks,
      modified_at: new Date().toISOString()
    };

    if (!entry.audit_history) entry.audit_history = [];
    entry.audit_history.push(previousSnapshot);

    if (data.amount !== undefined) entry.amount = Number(data.amount);
    if (data.type !== undefined) entry.type = data.type;
    if (data.category !== undefined) entry.category = data.category;
    if (data.description !== undefined) entry.description = data.description;
    if (data.remarks !== undefined) entry.remarks = data.remarks;
    if (data.payment_method !== undefined) entry.payment_method = data.payment_method;
    if (data.reference !== undefined) entry.reference = data.reference;
    if (data.transaction_date !== undefined) entry.transaction_date = data.transaction_date;
    if (data.transaction_time !== undefined) entry.transaction_time = data.transaction_time;
    if (data.status !== undefined) entry.status = data.status;
    
    if (data.patient_id !== undefined) {
      entry.patient_id = data.patient_id || null;
      if (data.patient_id) {
        const pat = this.data.patients.find(p => p.id === data.patient_id);
        if (pat) {
          entry.patient_name = pat.name;
          entry.patient_code = `PAT-${pat.id.replace('pat-', '').padStart(5, '0')}`;
          entry.patient_phone = pat.phone;
        }
      } else if (data.patient_name) {
        entry.patient_name = data.patient_name;
      }
    }

    entry.updated_at = new Date().toISOString();
    this.save();
    this.logAudit(doctorId, "LEDGER_ENTRY_UPDATED", `Updated transaction ${entry.transaction_id} (${entry.type}) - Amount: PKR ${entry.amount}`);
    return entry;
  }

  deleteLedgerEntry(doctorId, id) {
    if (!this.data.ledgerEntries) this.data.ledgerEntries = [];
    const index = this.data.ledgerEntries.findIndex(e => e.id === id && e.doctor_id === doctorId);
    if (index === -1) return false;

    const removed = this.data.ledgerEntries.splice(index, 1)[0];
    this.save();
    this.logAudit(doctorId, "LEDGER_ENTRY_DELETED", `Deleted ledger transaction ${removed.transaction_id} (PKR ${removed.amount})`);
    return true;
  }

  getPatientFinancialHistory(doctorId, patientId) {
    if (!this.data.ledgerEntries) this.data.ledgerEntries = [];
    const list = this.data.ledgerEntries
      .filter(e => e.doctor_id === doctorId && e.patient_id === patientId)
      .sort((a, b) => new Date(`${b.transaction_date}T${b.transaction_time}`) - new Date(`${a.transaction_date}T${a.transaction_time}`));

    let totalPaid = 0;
    let totalRefunded = 0;

    list.forEach(item => {
      const amt = Number(item.amount) || 0;
      if (item.entry_type === 'cash_in') {
        totalPaid += amt;
      } else {
        totalRefunded += amt;
      }
    });

    const netPaid = totalPaid - totalRefunded;

    return {
      patient_id: patientId,
      totalPaid: netPaid,
      totalGross: totalPaid,
      totalRefunded,
      totalTransactions: list.length,
      lastPaymentDate: list[0]?.transaction_date || null,
      history: list
    };
  }

  // ==========================================
  // TWO-SIDED PLATFORM: PUBLIC DOCTOR DISCOVERY & BOOKING HELPERS
  // ==========================================
  getPublicDoctors(filters = {}) {
    const { city, specialty, search } = filters;
    const now = new Date();
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const todayName = days[now.getDay()];
    const tomorrowName = days[(now.getDay() + 1) % 7];

    return (this.data.doctors || [])
      .filter(doc => {
        const settings = doc.public_profile_settings || {};
        if (settings.show_profile_publicly === false) return false;

        if (city && city.toLowerCase() !== 'all') {
          if ((doc.city || '').toLowerCase() !== city.toLowerCase()) return false;
        }

        if (specialty && specialty.toLowerCase() !== 'all') {
          const docSpec = (doc.specialization || '').toLowerCase();
          if (!docSpec.includes(specialty.toLowerCase())) return false;
        }

        if (search && search.trim()) {
          const q = search.toLowerCase().trim();
          const matchName = (doc.name || '').toLowerCase().includes(q);
          const matchSpec = (doc.specialization || '').toLowerCase().includes(q);
          const matchClinic = (doc.clinicName || '').toLowerCase().includes(q);
          const matchCity = (doc.city || '').toLowerCase().includes(q);
          const matchServices = (doc.services || []).some(s => s.toLowerCase().includes(q));
          if (!matchName && !matchSpec && !matchClinic && !matchCity && !matchServices) return false;
        }

        return true;
      })
      .map(doc => {
        const settings = doc.public_profile_settings || {};
        
        // Calculate dynamic Next Available slot
        let nextAvailable = "By Appointment";
        const availableDays = doc.availableDays || [];
        const slots = doc.timeSlots || [];
        const firstSlotTime = slots[0] ? slots[0].split('-')[0].trim() : '05:00 PM';

        if (availableDays.includes(todayName)) {
          nextAvailable = `Today • ${firstSlotTime}`;
        } else if (availableDays.includes(tomorrowName)) {
          nextAvailable = `Tomorrow • ${firstSlotTime}`;
        } else if (availableDays.length > 0) {
          nextAvailable = `${availableDays[0]} • ${firstSlotTime}`;
        }

        return {
          id: doc.id,
          slug: doc.slug,
          name: doc.name,
          specialization: settings.show_specialty !== false ? doc.specialization : 'Specialist Physician',
          qualifications: settings.show_qualifications !== false ? doc.qualifications : '',
          pmdcNumber: settings.show_pmdc ? doc.pmdcNumber : null,
          experienceYears: settings.show_experience !== false ? doc.experienceYears : null,
          languages: doc.languages || ["English", "Urdu"],
          services: doc.services || [],
          consultationFee: settings.show_fee !== false ? doc.consultationFee : null,
          followUpFee: settings.show_fee !== false ? (doc.followUpFee || Math.round(doc.consultationFee * 0.6)) : null,
          onlineFee: settings.show_fee !== false ? (doc.onlineFee || Math.round(doc.consultationFee * 0.8)) : null,
          rating: doc.rating || 4.9,
          reviewCount: doc.reviewCount || 95,
          clinicName: settings.show_clinic !== false ? doc.clinicName : 'Private Medical Practice',
          address: settings.show_address !== false ? doc.address : doc.city,
          city: doc.city,
          province: doc.province,
          country: doc.country || 'Pakistan',
          mapLink: settings.show_address !== false ? doc.mapLink : null,
          coordinates: doc.coordinates || null,
          profileImage: settings.show_photo !== false ? doc.profileImage : null,
          bio: doc.bio,
          availableDays: doc.availableDays || [],
          timeSlots: doc.timeSlots || [],
          slotDurationMinutes: doc.slotDurationMinutes || 15,
          nextAvailable,
          allowOnlineBooking: settings.allow_online_booking !== false,
          publicPhone: settings.show_public_contact ? doc.phone : null,
          publicEmail: settings.show_public_contact ? doc.email : null
        };
      });
  }

  getPublicSpecialties() {
    const list = [
      { name: "General Physician", icon: "Stethoscope", description: "Fever, diabetes, hypertension, general checkups" },
      { name: "Cardiologist", icon: "HeartPulse", description: "Heart disease, ECG, chest pain, blood pressure" },
      { name: "Pediatrician", icon: "Baby", description: "Child health, newborn care, vaccination, growth" },
      { name: "Dermatologist", icon: "Sparkles", description: "Skin, acne, hair fall, eczema, aesthetics" },
      { name: "Gynecologist", icon: "UserCheck", description: "Women's health, pregnancy, PCOS, fertility" },
      { name: "Orthopedic", icon: "Activity", description: "Joint pain, spine, fractures, arthritis" },
      { name: "ENT Specialist", icon: "Ear", description: "Ear, nose, throat, sinusitis, hearing" },
      { name: "Neurologist", icon: "Brain", description: "Headache, stroke, epilepsy, nerve disorders" },
      { name: "Psychiatrist", icon: "Smile", description: "Anxiety, depression, mental wellness" },
      { name: "Dentist", icon: "SmilePlus", description: "Teeth cleaning, root canal, dental implants" },
      { name: "Ophthalmologist", icon: "Eye", description: "Eye checkups, vision tests, cataracts" },
      { name: "Gastroenterologist", icon: "Shield", description: "Stomach, liver, acid reflux, endoscopy" },
      { name: "Urologist", icon: "Crosshair", description: "Kidney stones, urinary infections, prostate" },
      { name: "Endocrinologist", icon: "Flame", description: "Thyroid, hormonal imbalance, metabolic care" },
      { name: "Pulmonologist", icon: "Wind", description: "Lungs, asthma, chronic bronchitis, allergy" }
    ];

    const docs = this.data.doctors || [];
    return list.map(item => {
      const count = docs.filter(d => (d.specialization || '').toLowerCase().includes(item.name.toLowerCase())).length;
      return {
        ...item,
        doctorCount: count || 1
      };
    });
  }

  getPublicCities() {
    const defaultCities = [
      "Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad", 
      "Multan", "Peshawar", "Quetta", "Gujranwala", "Sialkot"
    ];

    const docs = this.data.doctors || [];
    return defaultCities.map(cityName => {
      const count = docs.filter(d => (d.city || '').toLowerCase() === cityName.toLowerCase()).length;
      return {
        name: cityName,
        doctorCount: count
      };
    });
  }

  getPublicAppointmentById(appointmentId) {
    const apt = (this.data.appointments || []).find(a => a.id === appointmentId || a.appointment_no === appointmentId);
    if (!apt) return null;

    const doc = (this.data.doctors || []).find(d => d.id === apt.doctor_id);
    const pat = (this.data.patients || []).find(p => p.id === apt.patient_id);

    // Mask patient name for privacy (e.g., M***** A**)
    const rawName = pat ? pat.name : (apt.patient_name || 'Patient');
    const parts = rawName.split(' ');
    const maskedName = parts.map(p => p.length > 2 ? p[0] + '*'.repeat(p.length - 2) + p[p.length - 1] : p[0] + '*').join(' ');

    return {
      appointment_id: apt.id,
      appointment_no: apt.appointment_no || apt.id,
      doctor_name: doc ? doc.name : 'Attending Physician',
      doctor_specialization: doc ? doc.specialization : '',
      clinic_name: doc ? doc.clinicName : 'Clinic',
      clinic_address: doc ? doc.address : '',
      city: doc ? doc.city : 'Pakistan',
      clinic_phone: doc ? doc.phone : '',
      map_link: doc ? doc.mapLink : null,
      date: apt.date,
      start_time: apt.start_time,
      end_time: apt.end_time,
      status: apt.status, // 'pending' | 'confirmed' | 'completed' | 'cancelled'
      masked_patient_name: maskedName,
      created_at: apt.created_at
    };
  }

  // ==========================================
  // DOCTOR WORKSPACE: DASHBOARD STATS & ANALYTICS
  // ==========================================
  getDoctorDashboardStats(doctorId) {
    const today = new Date().toISOString().split('T')[0];
    
    // Total Patients
    const patients = (this.data.patients || []).filter(p => p.doctor_id === doctorId);
    
    // Today's Appointments
    const todaysApts = (this.data.appointments || []).filter(a => a.doctor_id === doctorId && a.date === today && a.status !== 'cancelled');
    
    // Today's Finalized Prescriptions / Visits
    const todaysVisits = (this.data.prescriptions || []).filter(p => p.doctor_id === doctorId && p.created_at.startsWith(today) && p.status === 'final');
    
    // Pending Appointments
    const pendingApts = (this.data.appointments || [])
      .filter(a => a.doctor_id === doctorId && a.status === 'pending')
      .sort((a, b) => new Date(`${a.date}T${a.start_time}`) - new Date(`${b.date}T${b.start_time}`));

    // Follow-ups due in the next 7 days
    const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    const followUps = (this.data.prescriptions || []).filter(p => {
      if (p.doctor_id !== doctorId || !p.follow_up_date) return false;
      return p.follow_up_date >= today && p.follow_up_date <= nextWeek;
    });

    // Today's Income from Ledger
    let todaysIncome = 0;
    const ledgerEntries = (this.data.ledgerEntries || []).filter(e => e.doctor_id === doctorId && e.transaction_date === today);
    ledgerEntries.forEach(e => {
      if (e.entry_type === 'cash_in') {
        todaysIncome += Number(e.amount) || 0;
      } else {
        todaysIncome -= Number(e.amount) || 0;
      }
    });

    // If ledger is empty for today, calculate from completed consultations
    if (todaysIncome === 0 && todaysApts.length > 0) {
      const doc = (this.data.doctors || []).find(d => d.id === doctorId);
      const fee = doc?.consultationFee || 2500;
      todaysIncome = todaysApts.filter(a => a.status === 'completed').length * fee;
    }

    // Recent Patients
    const recentPatients = [...patients]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);

    return {
      totalPatients: patients.length,
      todaysVisits: todaysVisits.length,
      todaysAppointments: todaysApts.length,
      followUpsCount: followUps.length,
      todaysIncome,
      pendingAppointmentRequests: pendingApts.length,
      pendingAppointmentsList: pendingApts.slice(0, 5),
      recentPatients
    };
  }

  getDoctorAnalytics(doctorId) {
    const rxList = (this.data.prescriptions || []).filter(p => p.doctor_id === doctorId);
    const aptList = (this.data.appointments || []).filter(a => a.doctor_id === doctorId);
    const ledgerList = (this.data.ledgerEntries || []).filter(e => e.doctor_id === doctorId);

    // Top Diagnoses
    const diagCount = {};
    rxList.forEach(rx => {
      if (rx.diagnosis) {
        const diag = rx.diagnosis.trim();
        diagCount[diag] = (diagCount[diag] || 0) + 1;
      }
    });
    const topDiagnoses = Object.entries(diagCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Top Prescribed Medicines
    const medCount = {};
    rxList.forEach(rx => {
      (rx.items || []).forEach(item => {
        const name = item.medicine_name || item.name || 'Medicine';
        medCount[name] = (medCount[name] || 0) + 1;
      });
    });
    const topMedicines = Object.entries(medCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Payment Methods Breakdown
    const paymentMethods = { Cash: 0, EasyPaisa: 0, JazzCash: 0, "Bank Transfer": 0, Card: 0 };
    ledgerList.forEach(e => {
      if (e.entry_type === 'cash_in') {
        const method = e.payment_method || 'Cash';
        const key = method.includes('easy') ? 'EasyPaisa' :
                    method.includes('jazz') ? 'JazzCash' :
                    method.includes('bank') ? 'Bank Transfer' :
                    method.includes('card') ? 'Card' : 'Cash';
        paymentMethods[key] = (paymentMethods[key] || 0) + (Number(e.amount) || 0);
      }
    });

    // Appointment Completion Stats
    const totalApts = aptList.length;
    const completedApts = aptList.filter(a => a.status === 'completed').length;
    const cancelledApts = aptList.filter(a => a.status === 'cancelled').length;
    const confirmedApts = aptList.filter(a => a.status === 'confirmed').length;
    const pendingApts = aptList.filter(a => a.status === 'pending').length;

    return {
      totalPrescriptions: rxList.length,
      totalAppointments: totalApts,
      completedAppointments: completedApts,
      cancelledAppointments: cancelledApts,
      confirmedAppointments: confirmedApts,
      pendingAppointments: pendingApts,
      completionRate: totalApts > 0 ? Math.round((completedApts / totalApts) * 100) : 100,
      topDiagnoses,
      topMedicines,
      paymentMethods
    };
  }

  updateDoctorPublicSettings(doctorId, { public_profile_settings, auto_confirm_appointments, working_sessions, consultationFee, followUpFee, onlineFee, emergencyFee }) {
    const doc = (this.data.doctors || []).find(d => d.id === doctorId);
    if (!doc) throw new Error("Doctor not found");

    if (public_profile_settings) {
      doc.public_profile_settings = {
        ...(doc.public_profile_settings || {}),
        ...public_profile_settings
      };
    }

    if (auto_confirm_appointments !== undefined) {
      doc.auto_confirm_appointments = Boolean(auto_confirm_appointments);
    }

    if (working_sessions) {
      doc.working_sessions = working_sessions;
    }

    if (consultationFee !== undefined) doc.consultationFee = Number(consultationFee);
    if (followUpFee !== undefined) doc.followUpFee = Number(followUpFee);
    if (onlineFee !== undefined) doc.onlineFee = Number(onlineFee);
    if (emergencyFee !== undefined) doc.emergencyFee = Number(emergencyFee);

    this.save();
    this.logAudit(doctorId, "PUBLIC_SETTINGS_UPDATED", "Updated public profile privacy toggles & appointment rules");
    return doc;
  }

  logAudit(doctorId, action, details) {
    const entry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      doctor_id: doctorId,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    this.data.auditLogs.unshift(entry);
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 500);
    }
    this.save();
    return entry;
  }

  // ==========================================
  // AUTHENTICATION & ROLE-BASED ACCESS CONTROL
  // ==========================================

  findUserByEmailOrPhone(identifier, role = null) {
    if (!identifier) return null;
    const cleanId = identifier.trim().toLowerCase();
    const cleanDigits = identifier.replace(/[^0-9]/g, '');

    return (this.data.users || []).find(u => {
      const matchRole = role ? u.role === role : true;
      if (!matchRole) return false;
      const matchEmail = u.email && u.email.toLowerCase() === cleanId;
      const userCleanPhone = (u.phone || '').replace(/[^0-9]/g, '');
      const matchPhone = cleanDigits.length >= 7 && (
        userCleanPhone === cleanDigits || 
        userCleanPhone.endsWith(cleanDigits.slice(-10))
      );
      return matchEmail || matchPhone;
    });
  }

  findUserById(userId) {
    return (this.data.users || []).find(u => u.id === userId);
  }

  findUserByGoogleId(googleId) {
    return (this.data.users || []).find(u => u.googleId === googleId);
  }

  authenticateUser({ identifier, password, role }) {
    if (!identifier || !password) {
      throw new Error("Email/Phone and Password are required");
    }

    const user = this.findUserByEmailOrPhone(identifier, role);
    if (!user) {
      // Check if user exists under the other role to give a helpful security error
      const otherRoleUser = this.findUserByEmailOrPhone(identifier, role === 'doctor' ? 'patient' : 'doctor');
      if (otherRoleUser) {
        throw new Error(`This account is registered as a ${otherRoleUser.role.toUpperCase()}. Please use the ${otherRoleUser.role === 'doctor' ? 'Doctor' : 'Patient'} Login tab.`);
      }
      throw new Error("Invalid credentials. Please verify your email/phone and password.");
    }

    // Verify Password Hash
    const calculatedHash = hashPassword(password, user.salt);
    if (calculatedHash !== user.passwordHash) {
      throw new Error("Invalid credentials. Please verify your email/phone and password.");
    }

    // Session Token Generation
    const session = this.createSession(user);
    
    // Log audit
    if (user.role === 'doctor' && user.doctorId) {
      this.logAudit(user.doctorId, "AUTH_LOGIN_SUCCESS", `Doctor ${user.name} logged in securely`);
    }

    return {
      sessionToken: session.token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        doctorId: user.doctorId,
        patientId: user.patientId,
        city: user.city,
        avatarUrl: user.avatarUrl
      },
      doctor: user.doctorId ? this.data.doctors.find(d => d.id === user.doctorId) : null,
      patient: user.patientId ? this.data.patients.find(p => p.id === user.patientId) : null
    };
  }

  authenticateGoogle({ googleId, email, name, avatar, role, extraData = {} }) {
    if (!email) throw new Error("Google account email is required");
    const cleanEmail = email.trim().toLowerCase();

    // Check if account already exists with this email or googleId
    let user = (this.data.users || []).find(u => 
      (u.googleId && u.googleId === googleId) || 
      (u.email && u.email.toLowerCase() === cleanEmail)
    );

    if (user) {
      // Role enforcement: Do NOT silently convert roles
      if (role && user.role !== role) {
        throw new Error(`This Google account is already registered as a ${user.role.toUpperCase()}. Please sign in through the ${user.role === 'doctor' ? 'Doctor' : 'Patient'} portal.`);
      }

      // Link googleId and avatar if not linked
      if (!user.googleId && googleId) user.googleId = googleId;
      if (avatar && (!user.avatarUrl || user.avatarUrl.includes('dicebear'))) user.avatarUrl = avatar;
      this.save();
    } else {
      // Create new user account with selected role
      const effectiveRole = role || 'patient';
      const userId = `user-g-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      const salt = generateSalt();

      if (effectiveRole === 'doctor') {
        // Create corresponding doctor profile
        const docId = `doc-${Date.now()}`;
        const newDoctor = {
          id: docId,
          slug: (name || 'dr-profile').toLowerCase().replace(/[^a-z0-9]/g, '-'),
          name: name?.startsWith('Dr.') ? name : `Dr. ${name || 'Doctor'}`,
          email: cleanEmail,
          phone: extraData.phone || "+92 300 0000000",
          whatsapp: extraData.phone || "+92 300 0000000",
          specialization: extraData.specialization || "General Physician",
          qualifications: extraData.qualifications || "MBBS",
          pmdcNumber: extraData.pmdcNumber || `${Math.floor(10000 + Math.random() * 90000)}-P`,
          experienceYears: Number(extraData.experienceYears) || 5,
          languages: ["English", "Urdu"],
          services: ["General Medical Consultation", "Preventive Care"],
          consultationFee: 2000,
          followUpFee: 1000,
          onlineFee: 1500,
          emergencyFee: 3000,
          rating: 5.0,
          reviewCount: 1,
          slotDurationMinutes: 15,
          clinicName: extraData.clinicName || "DocCare Executive Medical Clinic",
          address: extraData.address || "Medical Complex, Main Boulevard",
          city: extraData.city || "Lahore",
          province: "Punjab",
          country: "Pakistan",
          mapLink: "https://maps.google.com/?q=31.5204,74.3587",
          profileImage: avatar || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
          signatureImage: "",
          stampImage: "",
          bio: "Consultant physician providing evidence-based healthcare.",
          availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          timeSlots: [
            "05:00 PM - 05:15 PM", "05:15 PM - 05:30 PM", "05:30 PM - 05:45 PM", "05:45 PM - 06:00 PM",
            "06:00 PM - 06:15 PM", "06:15 PM - 06:30 PM", "06:30 PM - 06:45 PM", "06:45 PM - 07:00 PM"
          ],
          working_sessions: {
            morning: { enabled: false, start: "09:00 AM", end: "01:00 PM" },
            evening: { enabled: true, start: "05:00 PM", end: "07:00 PM" }
          },
          public_profile_settings: {
            show_profile_publicly: true,
            show_photo: true,
            show_specialty: true,
            show_qualifications: true,
            show_experience: true,
            show_pmdc: true,
            show_clinic: true,
            show_address: true,
            show_fee: true,
            show_public_contact: true,
            allow_online_booking: true
          },
          auto_confirm_appointments: false,
          headerColor: "#0f766e",
          accentColor: "#0284c7",
          disclaimerText: "Consultation is valid for 7 days.",
          whatsappEnabled: true,
          whatsapp_message_template: "Hello [Patient Name], your prescription from Dr. [Doctor Name] is ready: [Link]",
          default_link_expiry_days: 7
        };
        this.data.doctors.push(newDoctor);

        user = {
          id: userId,
          email: cleanEmail,
          phone: newDoctor.phone,
          name: newDoctor.name,
          passwordHash: hashPassword(generateSecureToken(), salt),
          salt,
          role: 'doctor',
          doctorId: docId,
          patientId: null,
          city: newDoctor.city,
          specialty: newDoctor.specialization,
          pmdcNumber: newDoctor.pmdcNumber,
          clinicName: newDoctor.clinicName,
          avatarUrl: avatar || newDoctor.profileImage,
          googleId: googleId || `g-${Date.now()}`,
          createdAt: new Date().toISOString()
        };
      } else {
        // Create patient record
        const patId = `pat-${Date.now()}`;
        const newPat = {
          id: patId,
          doctor_id: "doc-1",
          name: name || "Google User",
          age: 30,
          gender: "Male",
          phone: extraData.phone || "",
          whatsapp: extraData.phone || "",
          allergies: "None",
          chronic_conditions: "None",
          current_medicines: "None",
          reason_for_visit: "General Consultation",
          consent_given: true,
          created_at: new Date().toISOString()
        };
        this.data.patients.push(newPat);

        user = {
          id: userId,
          email: cleanEmail,
          phone: newPat.phone,
          name: newPat.name,
          passwordHash: hashPassword(generateSecureToken(), salt),
          salt,
          role: 'patient',
          doctorId: null,
          patientId: patId,
          city: extraData.city || "Lahore",
          avatarUrl: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || 'patient')}`,
          googleId: googleId || `g-${Date.now()}`,
          createdAt: new Date().toISOString()
        };
      }

      this.data.users.push(user);
      this.save();
    }

    const session = this.createSession(user);

    return {
      sessionToken: session.token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        doctorId: user.doctorId,
        patientId: user.patientId,
        city: user.city,
        avatarUrl: user.avatarUrl
      },
      doctor: user.doctorId ? this.data.doctors.find(d => d.id === user.doctorId) : null,
      patient: user.patientId ? this.data.patients.find(p => p.id === user.patientId) : null
    };
  }

  registerDoctor(data) {
    const { name, email, phone, password, pmdcNumber, specialization, clinicName, city } = data;
    if (!name || !email || !password) {
      throw new Error("Doctor Full Name, Email, and Password are required");
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = (this.data.users || []).find(u => u.email && u.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error("An account with this email already exists. Please login instead.");
    }

    const docId = `doc-${Date.now()}`;
    const newDoc = {
      id: docId,
      slug: (name || 'dr').toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name: name.startsWith('Dr.') ? name : `Dr. ${name}`,
      email: cleanEmail,
      phone: phone || "+92 300 1234567",
      whatsapp: phone || "+92 300 1234567",
      specialization: specialization || "General Physician",
      qualifications: "MBBS",
      pmdcNumber: pmdcNumber || `${Math.floor(10000 + Math.random() * 90000)}-P`,
      experienceYears: 5,
      languages: ["English", "Urdu"],
      services: ["General Medical Consultation", "Clinical Checkup"],
      consultationFee: 2000,
      followUpFee: 1000,
      onlineFee: 1500,
      emergencyFee: 3000,
      rating: 5.0,
      reviewCount: 1,
      slotDurationMinutes: 15,
      clinicName: clinicName || "Private Medical Practice",
      address: "Main Medical Complex",
      city: city || "Lahore",
      province: "Punjab",
      country: "Pakistan",
      mapLink: "https://maps.google.com/?q=31.5204,74.3587",
      profileImage: `https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400`,
      signatureImage: "",
      stampImage: "",
      bio: "Medical specialist offering comprehensive clinical consultations.",
      availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      timeSlots: [
        "05:00 PM - 05:15 PM", "05:15 PM - 05:30 PM", "05:30 PM - 05:45 PM", "05:45 PM - 06:00 PM",
        "06:00 PM - 06:15 PM", "06:15 PM - 06:30 PM", "06:30 PM - 06:45 PM", "06:45 PM - 07:00 PM"
      ],
      working_sessions: {
        morning: { enabled: false, start: "09:00 AM", end: "01:00 PM" },
        evening: { enabled: true, start: "05:00 PM", end: "07:00 PM" }
      },
      public_profile_settings: {
        show_profile_publicly: true,
        show_photo: true,
        show_specialty: true,
        show_qualifications: true,
        show_experience: true,
        show_pmdc: true,
        show_clinic: true,
        show_address: true,
        show_fee: true,
        show_public_contact: true,
        allow_online_booking: true
      },
      auto_confirm_appointments: false,
      headerColor: "#0f766e",
      accentColor: "#0284c7",
      disclaimerText: "Take medicines strictly as prescribed.",
      whatsappEnabled: true,
      whatsapp_message_template: "Hello [Patient Name], your prescription from Dr. [Doctor Name] is ready: [Link]",
      default_link_expiry_days: 7
    };
    this.data.doctors.push(newDoc);

    const salt = generateSalt();
    const user = {
      id: `user-${docId}`,
      email: cleanEmail,
      phone: newDoc.phone,
      name: newDoc.name,
      passwordHash: hashPassword(password, salt),
      salt,
      role: 'doctor',
      doctorId: docId,
      patientId: null,
      city: newDoc.city,
      specialty: newDoc.specialization,
      pmdcNumber: newDoc.pmdcNumber,
      clinicName: newDoc.clinicName,
      avatarUrl: newDoc.profileImage,
      googleId: null,
      createdAt: new Date().toISOString()
    };
    this.data.users.push(user);
    this.save();

    const session = this.createSession(user);
    this.logAudit(docId, "DOCTOR_REGISTERED", `New doctor practice registered: ${newDoc.name}`);

    return {
      sessionToken: session.token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        doctorId: user.doctorId,
        city: user.city,
        avatarUrl: user.avatarUrl
      },
      doctor: newDoc
    };
  }

  registerPatient(data) {
    const { name, email, phone, password, city } = data;
    if (!name || !email || !password) {
      throw new Error("Patient Full Name, Email, and Password are required");
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = (this.data.users || []).find(u => u.email && u.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error("An account with this email already exists. Please login instead.");
    }

    const patId = `pat-${Date.now()}`;
    const newPat = {
      id: patId,
      doctor_id: "doc-1",
      name: name.trim(),
      age: Number(data.age) || 30,
      gender: data.gender || "Male",
      phone: phone || "",
      whatsapp: phone || "",
      allergies: data.allergies || "None",
      chronic_conditions: data.chronic_conditions || "None",
      current_medicines: data.current_medicines || "None",
      reason_for_visit: "General Consultation",
      consent_given: true,
      created_at: new Date().toISOString()
    };
    this.data.patients.push(newPat);

    const salt = generateSalt();
    const user = {
      id: `user-${patId}`,
      email: cleanEmail,
      phone: newPat.phone,
      name: newPat.name,
      passwordHash: hashPassword(password, salt),
      salt,
      role: 'patient',
      doctorId: null,
      patientId: patId,
      city: city || "Lahore",
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      googleId: null,
      createdAt: new Date().toISOString()
    };
    this.data.users.push(user);
    this.save();

    const session = this.createSession(user);

    return {
      sessionToken: session.token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        patientId: user.patientId,
        city: user.city,
        avatarUrl: user.avatarUrl
      },
      patient: newPat
    };
  }

  createSession(user) {
    const token = `dck_${generateSecureToken()}`;
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
    const session = {
      token,
      userId: user.id,
      role: user.role,
      doctorId: user.doctorId,
      patientId: user.patientId,
      createdAt: new Date().toISOString(),
      expiresAt
    };
    if (!this.data.sessions) this.data.sessions = [];
    this.data.sessions.push(session);
    this.save();
    return session;
  }

  verifySession(token) {
    if (!token) return null;
    const cleanToken = token.replace('Bearer ', '').trim();
    
    // Check legacy tokens for backwards compatibility
    if (cleanToken.startsWith('jwt-doccare-')) {
      const docId = cleanToken.replace('jwt-doccare-', '');
      const doc = this.data.doctors.find(d => d.id === docId);
      const user = (this.data.users || []).find(u => u.doctorId === docId) || {
        id: `user-${docId}`,
        name: doc?.name || "Doctor",
        email: doc?.email || "doctor@doccare.pk",
        role: "doctor",
        doctorId: docId
      };
      return {
        session: { token: cleanToken, role: 'doctor', doctorId: docId },
        user,
        doctor: doc,
        patient: null
      };
    }

    const session = (this.data.sessions || []).find(s => s.token === cleanToken);
    if (!session) return null;

    if (new Date(session.expiresAt) < new Date()) {
      this.invalidateSession(cleanToken);
      return null;
    }

    const user = this.findUserById(session.userId);
    if (!user) return null;

    const doctor = user.doctorId ? this.data.doctors.find(d => d.id === user.doctorId) : null;
    const patient = user.patientId ? this.data.patients.find(p => p.id === user.patientId) : null;

    return {
      session,
      user,
      doctor,
      patient
    };
  }

  invalidateSession(token) {
    if (!token) return;
    const cleanToken = token.replace('Bearer ', '').trim();
    this.data.sessions = (this.data.sessions || []).filter(s => s.token !== cleanToken);
    this.save();
  }

  createPasswordReset(email, role) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const user = (this.data.users || []).find(u => 
      u.email && u.email.toLowerCase() === cleanEmail && (role ? u.role === role : true)
    );

    if (!user) {
      // Return success without revealing email existence
      return { 
        success: true, 
        message: "If your email is registered with DocCare, you will receive password reset instructions shortly." 
      };
    }

    const token = generateSecureToken();
    const resetEntry = {
      token,
      email: cleanEmail,
      userId: user.id,
      role: user.role,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 mins expiry
      used: false,
      createdAt: new Date().toISOString()
    };

    if (!this.data.passwordResets) this.data.passwordResets = [];
    this.data.passwordResets.push(resetEntry);
    this.save();

    return {
      success: true,
      resetToken: token, // Sent to email / client for direct completion
      message: "Password reset instructions have been generated."
    };
  }

  resetPassword(token, newPassword) {
    if (!token || !newPassword) throw new Error("Reset token and new password are required");
    if (newPassword.length < 6) throw new Error("Password must be at least 6 characters");

    const reset = (this.data.passwordResets || []).find(r => r.token === token && !r.used);
    if (!reset) {
      throw new Error("Invalid or expired password reset link. Please request a new one.");
    }

    if (new Date(reset.expiresAt) < new Date()) {
      throw new Error("Password reset link has expired. Please request a new one.");
    }

    const user = this.findUserById(reset.userId);
    if (!user) throw new Error("User account not found");

    const salt = generateSalt();
    user.passwordHash = hashPassword(newPassword, salt);
    user.salt = salt;
    reset.used = true;

    // Invalidate old sessions for security
    this.data.sessions = (this.data.sessions || []).filter(s => s.userId !== user.id);
    this.save();

    return { success: true, message: "Password updated successfully. You can now log in with your new password." };
  }

  // ==========================================
  // PATIENT PORTAL QUERIES (PATIENT ISOLATED)
  // ==========================================

  getPatientDashboardData(patientId, userEmail, userPhone) {
    const cleanPhone = (userPhone || '').replace(/[^0-9]/g, '');

    // Find all patient records matching this patientId or phone number
    const matchingPatients = (this.data.patients || []).filter(p => {
      if (p.id === patientId) return true;
      if (cleanPhone && cleanPhone.length >= 7) {
        const pPhone = (p.phone || '').replace(/[^0-9]/g, '');
        return pPhone === cleanPhone || pPhone.endsWith(cleanPhone.slice(-10));
      }
      return false;
    });

    const patientIds = matchingPatients.map(p => p.id);
    if (patientId && !patientIds.includes(patientId)) patientIds.push(patientId);

    // Primary patient profile
    const patientProfile = matchingPatients[0] || (this.data.patients || []).find(p => p.id === patientId) || {
      id: patientId,
      name: "Patient",
      phone: userPhone,
      email: userEmail,
      allergies: "None reported",
      chronic_conditions: "None reported",
      current_medicines: "None"
    };

    // Get all appointments across doctors for this patient
    const appointments = (this.data.appointments || [])
      .filter(a => patientIds.includes(a.patient_id) || (cleanPhone && a.patient_phone && a.patient_phone.replace(/[^0-9]/g, '').endsWith(cleanPhone.slice(-10))))
      .map(a => {
        const doc = (this.data.doctors || []).find(d => d.id === a.doctor_id);
        return {
          ...a,
          doctor_name: doc?.name || "Attending Specialist",
          doctor_specialty: doc?.specialization || "Physician",
          doctor_avatar: doc?.profileImage || "",
          clinic_name: doc?.clinicName || "Medical Clinic",
          doctor_phone: doc?.phone || "",
          city: doc?.city || "Lahore"
        };
      })
      .sort((a, b) => new Date(b.date + ' ' + (b.start_time || '00:00')) - new Date(a.date + ' ' + (a.start_time || '00:00')));

    // Get all prescriptions for this patient
    const prescriptions = (this.data.prescriptions || [])
      .filter(p => patientIds.includes(p.patient_id) && p.status === 'final')
      .map(p => {
        const doc = (this.data.doctors || []).find(d => d.id === p.doctor_id);
        const share = (this.data.prescriptionShares || []).find(s => s.prescription_id === p.id && !s.revoked);
        return {
          ...p,
          doctor_name: doc?.name || "Consultant Doctor",
          doctor_specialty: doc?.specialization || "Specialist",
          clinic_name: doc?.clinicName || "Medical Practice",
          pdf_download_url: `/api/prescriptions/${p.id}/pdf`,
          public_share_url: share ? `/rx/${share.share_token}` : null
        };
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Unique Doctors Consulted
    const doctorIdSet = new Set(appointments.map(a => a.doctor_id).concat(prescriptions.map(p => p.doctor_id)));
    const doctorsVisited = (this.data.doctors || []).filter(d => doctorIdSet.has(d.id));

    return {
      patient: patientProfile,
      appointments,
      prescriptions,
      doctorsVisited,
      stats: {
        totalAppointments: appointments.length,
        upcomingAppointments: appointments.filter(a => a.status === 'confirmed' || a.status === 'pending').length,
        totalPrescriptions: prescriptions.length,
        doctorsConsulted: doctorIdSet.size
      }
    };
  }

  cancelPatientAppointment(patientId, appointmentId, reason) {
    const apt = (this.data.appointments || []).find(a => a.id === appointmentId);
    if (!apt) throw new Error("Appointment not found");

    apt.status = 'cancelled';
    apt.notes = `Cancelled by patient: ${reason || 'Patient requested cancellation'}`;
    apt.updated_at = new Date().toISOString();
    this.save();

    if (apt.doctor_id) {
      this.logAudit(apt.doctor_id, "PATIENT_CANCELLED_APPOINTMENT", `Patient cancelled appointment #${appointmentId}`);
    }

    return apt;
  }

  updatePatientProfile(patientId, updates) {
    const pat = (this.data.patients || []).find(p => p.id === patientId);
    if (!pat) throw new Error("Patient record not found");

    if (updates.name) pat.name = updates.name.trim();
    if (updates.age) pat.age = Number(updates.age);
    if (updates.gender) pat.gender = updates.gender;
    if (updates.phone) pat.phone = updates.phone;
    if (updates.whatsapp) pat.whatsapp = updates.whatsapp;
    if (updates.allergies !== undefined) pat.allergies = updates.allergies;
    if (updates.chronic_conditions !== undefined) pat.chronic_conditions = updates.chronic_conditions;
    if (updates.current_medicines !== undefined) pat.current_medicines = updates.current_medicines;

    // Update user record if exists
    const user = (this.data.users || []).find(u => u.patientId === patientId);
    if (user) {
      if (updates.name) user.name = updates.name.trim();
      if (updates.phone) user.phone = updates.phone;
      if (updates.city) user.city = updates.city;
    }

    this.save();
    return pat;
  }
}

export const db = new Database();

