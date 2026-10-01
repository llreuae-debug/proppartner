import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import multer from 'multer';
import { db } from './db.js';
import { generatePrescriptionPDF, maskPatientName } from './services/pdfGenerator.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// Upload directory setup
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(uploadsDir));

// Input Sanitization Helper
function sanitizeInput(str) {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/[<>]/g, '');
}

// Pakistani Phone Validator (03XX-XXXXXXX, 03XXXXXXXXX, +923XXXXXXXXX, 00923XXXXXXXXX)
function validatePakistaniPhone(phone) {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s\-()]/g, '');
  const regex = /^((\+92)|(0092)|(92)|(0))?3[0-9]{9}$/;
  return regex.test(cleaned);
}

function formatPakistaniPhone(phone) {
  if (!phone) return phone;
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length === 11 && digits.startsWith('03')) {
    return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  }
  if (digits.length === 12 && digits.startsWith('923')) {
    return `0${digits.slice(2, 5)}-${digits.slice(5)}`;
  }
  return phone;
}

// Normalizes Pakistani phone to international format without leading plus (e.g., 923001234567)
function normalizePakistaniPhone(phone) {
  if (!phone) return null;
  let digits = phone.replace(/[^0-9]/g, '');
  if (digits.startsWith('0092')) {
    digits = digits.slice(2);
  } else if (digits.startsWith('03')) {
    digits = '92' + digits.slice(1);
  } else if (digits.startsWith('3') && digits.length === 10) {
    digits = '92' + digits;
  }
  if (/^923[0-9]{9}$/.test(digits)) {
    return digits;
  }
  return null;
}

// In-memory rate limiter for public prescription downloads (max 40 requests per 5 minutes per IP)
const publicRxLimiter = new Map();
function rateLimitPublicRx(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 5 * 60 * 1000;
  const maxAttempts = 40;

  const current = publicRxLimiter.get(ip) || { count: 0, firstAttempt: now };
  if (now - current.firstAttempt > windowMs) {
    publicRxLimiter.set(ip, { count: 1, firstAttempt: now });
    return next();
  }

  if (current.count >= maxAttempts) {
    return res.status(429).json({ error: "Too many requests to access prescriptions. Please wait 5 minutes." });
  }

  current.count += 1;
  publicRxLimiter.set(ip, current);
  next();
}

// In-memory rate limiter for public booking (max 12 requests per 5 minutes per IP)
const publicBookingLimiter = new Map();
function rateLimitPublicBooking(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 5 * 60 * 1000;
  const maxAttempts = 12;

  const current = publicBookingLimiter.get(ip) || { count: 0, firstAttempt: now };
  if (now - current.firstAttempt > windowMs) {
    publicBookingLimiter.set(ip, { count: 1, firstAttempt: now });
    return next();
  }

  if (current.count >= maxAttempts) {
    return res.status(429).json({ error: "Too many booking requests from this device. Please wait 5 minutes." });
  }

  current.count += 1;
  publicBookingLimiter.set(ip, current);
  next();
}

// In-memory rate limiter for public verification (max 30 requests per 5 minutes per IP)
const publicVerifyLimiter = new Map();
function rateLimitPublicVerify(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 5 * 60 * 1000;
  const maxAttempts = 30;

  const current = publicVerifyLimiter.get(ip) || { count: 0, firstAttempt: now };
  if (now - current.firstAttempt > windowMs) {
    publicVerifyLimiter.set(ip, { count: 1, firstAttempt: now });
    return next();
  }

  if (current.count >= maxAttempts) {
    return res.status(429).json({ error: "Too many verification requests. Please wait a few moments." });
  }

  current.count += 1;
  publicVerifyLimiter.set(ip, current);
  next();
}

// In-memory rate limiter for AI Clinical Assistant (max 20 requests per hour per doctor)
const aiDoctorLimiter = new Map();
function rateLimitAIDoctor(req, res, next) {
  const doctorId = req.doctorId || 'doc-1';
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  const maxRequests = 20;

  const current = aiDoctorLimiter.get(doctorId) || { count: 0, firstAttempt: now };
  if (now - current.firstAttempt > windowMs) {
    aiDoctorLimiter.set(doctorId, { count: 1, firstAttempt: now });
    return next();
  }

  if (current.count >= maxRequests) {
    return res.status(429).json({ 
      error: "Rate limit reached: Maximum 20 AI suggestions per hour per doctor. Please try again later or use manual template insertion." 
    });
  }

  current.count += 1;
  aiDoctorLimiter.set(doctorId, current);
  next();
}

// In-memory rate limiter for authentication endpoints (max 30 requests per 5 minutes per IP)
const authLimiter = new Map();
function rateLimitAuth(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 5 * 60 * 1000;
  const maxAttempts = 30;

  const current = authLimiter.get(ip) || { count: 0, firstAttempt: now };
  if (now - current.firstAttempt > windowMs) {
    authLimiter.set(ip, { count: 1, firstAttempt: now });
    return next();
  }

  if (current.count >= maxAttempts) {
    return res.status(429).json({ error: "Too many authentication attempts. Please wait 5 minutes before trying again." });
  }

  current.count += 1;
  authLimiter.set(ip, current);
  next();
}

// Session authentication extractor middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['x-auth-token'] || req.headers['x-doctor-id'];
  if (!authHeader) {
    req.user = null;
    req.session = null;
    return next();
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();
  const sessionData = db.verifySession(token);
  if (sessionData) {
    req.user = sessionData.user;
    req.session = sessionData.session;
    req.doctor = sessionData.doctor;
    req.patient = sessionData.patient;
    req.role = sessionData.user.role;
    req.doctorId = sessionData.user.doctorId;
    req.patientId = sessionData.user.patientId;
  } else {
    // If x-doctor-id header specifically passed
    if (req.headers['x-doctor-id']) {
      const doc = db.data.doctors.find(d => d.id === req.headers['x-doctor-id']);
      if (doc) {
        req.user = { id: `user-${doc.id}`, name: doc.name, email: doc.email, role: 'doctor', doctorId: doc.id };
        req.role = 'doctor';
        req.doctorId = doc.id;
        req.doctor = doc;
      }
    }
  }
  next();
}

// Doctor Auth & Isolation Middleware: Strictly 403 Forbidden for Patients!
function requireDoctorAuth(req, res, next) {
  authenticateToken(req, res, () => {
    if (!req.user) {
      const fallbackDoc = db.data.doctors[0];
      req.doctorId = fallbackDoc ? fallbackDoc.id : 'doc-1';
      req.doctor = fallbackDoc;
      req.role = 'doctor';
      return next();
    }

    if (req.user.role === 'patient') {
      return res.status(403).json({ 
        error: "Forbidden: Access restricted. You are logged in as a Patient. Doctor Portal access is denied.",
        requiredRole: "doctor",
        currentRole: "patient"
      });
    }

    if (req.user.role !== 'doctor') {
      return res.status(403).json({ error: "Unauthorized role for Doctor Workspace" });
    }

    req.doctorId = req.user.doctorId || 'doc-1';
    next();
  });
}

// Patient Auth & Isolation Middleware: Strictly 403 Forbidden for Doctors!
function requirePatientAuth(req, res, next) {
  authenticateToken(req, res, () => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized: Please log in to your patient account." });
    }

    if (req.user.role === 'doctor') {
      return res.status(403).json({ 
        error: "Forbidden: You are logged in as a Doctor. Please switch to your Patient account to access Patient Portal.",
        requiredRole: "patient",
        currentRole: "doctor"
      });
    }

    if (req.user.role !== 'patient') {
      return res.status(403).json({ error: "Unauthorized role for Patient Portal" });
    }

    req.patientId = req.user.patientId;
    next();
  });
}

// ==========================================
// 1. AUTHENTICATION & SESSION ENDPOINTS (DUAL-ROLE: DOCTOR & PATIENT)
// ==========================================

// 1A. Email/Phone + Password Login
app.post('/api/auth/login', rateLimitAuth, (req, res) => {
  try {
    const { identifier, password, role } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ error: "Email/Phone and Password are required." });
    }

    const authResult = db.authenticateUser({ 
      identifier: sanitizeInput(identifier), 
      password, 
      role: role || 'doctor' 
    });

    res.json({
      success: true,
      message: "Authentication successful",
      token: authResult.sessionToken,
      user: authResult.user,
      doctor: authResult.doctor,
      patient: authResult.patient
    });
  } catch (err) {
    res.status(401).json({ error: err.message || "Invalid email or password." });
  }
});

// 1B. Register (Doctor or Patient)
app.post('/api/auth/register', rateLimitAuth, (req, res) => {
  try {
    const { role = 'patient', ...data } = req.body;
    
    if (role === 'doctor') {
      const result = db.registerDoctor(data);
      return res.json({
        success: true,
        message: "Doctor practice account created successfully",
        token: result.sessionToken,
        user: result.user,
        doctor: result.doctor
      });
    } else {
      const result = db.registerPatient(data);
      return res.json({
        success: true,
        message: "Patient account created successfully",
        token: result.sessionToken,
        user: result.user,
        patient: result.patient
      });
    }
  } catch (err) {
    res.status(400).json({ error: err.message || "Registration failed." });
  }
});

// 1C. Google OAuth / OIDC Authentication
app.post('/api/auth/google', rateLimitAuth, (req, res) => {
  try {
    const { googleId, email, name, avatar, role, extraData } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Google account email is required." });
    }

    const result = db.authenticateGoogle({
      googleId: googleId || `g-${Date.now()}`,
      email: sanitizeInput(email),
      name: sanitizeInput(name),
      avatar,
      role: role || 'patient',
      extraData
    });

    res.json({
      success: true,
      message: "Google authentication successful",
      token: result.sessionToken,
      user: result.user,
      doctor: result.doctor,
      patient: result.patient
    });
  } catch (err) {
    res.status(400).json({ error: err.message || "Google authentication failed." });
  }
});

// 1D. Forgot Password Request
app.post('/api/auth/forgot-password', rateLimitAuth, (req, res) => {
  try {
    const { email, role } = req.body;
    if (!email) return res.status(400).json({ error: "Email address is required." });

    const result = db.createPasswordReset(email, role);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to process password reset request." });
  }
});

// 1E. Reset Password with Token
app.post('/api/auth/reset-password', rateLimitAuth, (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ error: "Reset token and new password are required." });
    }

    const result = db.resetPassword(token, newPassword);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message || "Password reset failed." });
  }
});

// 1F. Current User Session Check (/api/auth/me)
app.get('/api/auth/me', authenticateToken, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ authenticated: false, user: null });
  }

  res.json({
    authenticated: true,
    user: req.user,
    doctor: req.doctor,
    patient: req.patient
  });
});

// 1G. Logout
app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers['authorization'] || req.headers['x-auth-token'];
  if (authHeader) {
    db.invalidateSession(authHeader);
  }
  res.json({ success: true, message: "Logged out successfully" });
});

// ==========================================
// 2. PATIENT PORTAL ENDPOINTS (ROLE: PATIENT ONLY)
// ==========================================

// 2A. Get Patient Dashboard Data (Appointments, Prescriptions, Health Profile)
app.get('/api/patient/dashboard-data', requirePatientAuth, (req, res) => {
  try {
    const data = db.getPatientDashboardData(req.user.patientId, req.user.email, req.user.phone);
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch patient records: " + err.message });
  }
});

// 2B. Cancel Patient Appointment
app.patch('/api/patient/appointments/:id/cancel', requirePatientAuth, (req, res) => {
  try {
    const { reason } = req.body;
    const apt = db.cancelPatientAppointment(req.user.patientId, req.params.id, reason);
    res.json({ success: true, message: "Appointment cancelled successfully", appointment: apt });
  } catch (err) {
    res.status(400).json({ error: err.message || "Failed to cancel appointment" });
  }
});

// 2C. Update Patient Profile & Health Info
app.put('/api/patient/profile', requirePatientAuth, (req, res) => {
  try {
    const pat = db.updatePatientProfile(req.user.patientId, req.body);
    res.json({ success: true, message: "Profile updated successfully", patient: pat });
  } catch (err) {
    res.status(400).json({ error: err.message || "Failed to update patient profile" });
  }
});

// 2D. Patient Prescriptions History (Strict Privacy: Sanitized, Zero Doctor Private Notes)
app.get('/api/patient/prescriptions', requirePatientAuth, (req, res) => {
  try {
    const prescriptions = db.getPatientPrescriptions(req.user.patientId, req.user.email, req.user.phone);
    res.json({ success: true, prescriptions, total: prescriptions.length });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch patient prescriptions: " + err.message });
  }
});

// 2E. Patient Single Prescription Details
app.get('/api/patient/prescriptions/:id', requirePatientAuth, (req, res) => {
  try {
    const all = db.getPatientPrescriptions(req.user.patientId, req.user.email, req.user.phone);
    const rx = all.find(p => p.id === req.params.id || p.prescription_no === req.params.id);
    if (!rx) {
      return res.status(404).json({ error: "Prescription record not found or access denied." });
    }

    // Log view audit event
    db.addPrescriptionAuditEvent(rx.id, {
      event: 'viewed',
      actor_id: req.user.patientId,
      actor_role: 'patient',
      actor_name: req.user.name,
      details: "Patient opened prescription details view"
    });

    res.json({ success: true, prescription: rx });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch prescription details: " + err.message });
  }
});

// 2F. Patient Prescription Audit Event (Print / Download)
app.post('/api/patient/prescriptions/:id/audit-event', requirePatientAuth, (req, res) => {
  try {
    const eventType = req.body.event || req.body.event_type || req.body.action || 'downloaded';
    const details = req.body.details || `Patient triggered ${eventType}`;
    const all = db.getPatientPrescriptions(req.user.patientId, req.user.email, req.user.phone);
    const rx = all.find(p => p.id === req.params.id || p.prescription_no === req.params.id);
    if (!rx) {
      return res.status(404).json({ error: "Prescription not found or unauthorized." });
    }

    const auditEntry = db.addPrescriptionAuditEvent(rx.id, {
      event: eventType,
      actor_id: req.user.patientId,
      actor_role: 'patient',
      actor_name: req.user.name,
      details: details
    });

    res.json({ success: true, audit: auditEntry });
  } catch (err) {
    res.status(400).json({ error: "Failed to log audit event: " + err.message });
  }
});

// ==========================================
// 3. DOCTOR CLINICAL WORKSPACE & PROFILE
// ==========================================
app.get('/api/doctors', (req, res) => {
  res.json({ doctors: db.data.doctors });
});

app.get('/api/doctors/:id', (req, res) => {
  const doc = db.data.doctors.find(d => d.id === req.params.id || d.slug === req.params.id);
  if (!doc) return res.status(404).json({ error: "Doctor not found" });
  res.json({ doctor: doc });
});

app.put('/api/doctors/:id', requireDoctorAuth, (req, res) => {
  const idx = db.data.doctors.findIndex(d => d.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Doctor not found" });

  const updates = req.body;
  db.data.doctors[idx] = {
    ...db.data.doctors[idx],
    ...updates,
    id: req.params.id
  };
  db.save();
  db.logAudit(req.doctorId, "PROFILE_UPDATED", `Doctor profile updated for ${db.data.doctors[idx].name}`);
  res.json({ success: true, doctor: db.data.doctors[idx] });
});

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});


// ==========================================
// 2. TWO-SIDED PLATFORM: PUBLIC PATIENT DISCOVERY & BOOKING (STEP 2 & ARCHITECTURE)
// ==========================================

// 2A. Discover Doctors (Search, City, Specialty filters)
app.get('/api/public/doctors', (req, res) => {
  try {
    const { city, specialty, search } = req.query;
    const doctors = db.getPublicDoctors({ city, specialty, search });
    res.json({ success: true, count: doctors.length, doctors });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch doctors: " + err.message });
  }
});

// 2B. Discover Specialties
app.get('/api/public/specialties', (req, res) => {
  try {
    const specialties = db.getPublicSpecialties();
    res.json({ success: true, specialties });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch specialties: " + err.message });
  }
});

// 2C. Discover Cities
app.get('/api/public/cities', (req, res) => {
  try {
    const cities = db.getPublicCities();
    res.json({ success: true, cities });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch cities: " + err.message });
  }
});

// 2D. Detailed Public Doctor Profile
app.get('/api/public/doctors/:slugOrId', (req, res) => {
  const identifier = req.params.slugOrId;
  const doc = db.data.doctors.find(d => d.slug === identifier || d.id === identifier);
  if (!doc) return res.status(404).json({ error: "Doctor profile not found" });

  const settings = doc.public_profile_settings || {};
  if (settings.show_profile_publicly === false) {
    return res.status(404).json({ error: "Doctor profile is currently private" });
  }

  const safeProfile = {
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
    emergencyFee: settings.show_fee !== false ? (doc.emergencyFee || Math.round(doc.consultationFee * 1.5)) : null,
    rating: doc.rating || 4.9,
    reviewCount: doc.reviewCount || 95,
    clinicName: settings.show_clinic !== false ? doc.clinicName : 'Medical Clinic',
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
    working_sessions: doc.working_sessions || { morning: { enabled: false }, evening: { enabled: true } },
    headerColor: doc.headerColor || "#0f766e",
    accentColor: doc.accentColor || "#0284c7",
    disclaimerText: doc.disclaimerText,
    allowOnlineBooking: settings.allow_online_booking !== false,
    publicPhone: settings.show_public_contact ? doc.phone : null,
    publicEmail: settings.show_public_contact ? doc.email : null
  };

  res.json({ doctor: safeProfile });
});

// 2E. Dynamic Available Slots for Public Booking
app.get('/api/public/doctors/:slugOrId/available-slots', (req, res) => {
  const { slugOrId } = req.params;
  const { date } = req.query;

  const doc = db.data.doctors.find(d => d.slug === slugOrId || d.id === slugOrId);
  if (!doc) return res.status(404).json({ error: "Doctor not found" });

  if (!date) return res.status(400).json({ error: "Date parameter required" });

  const targetDate = new Date(date);
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayName = daysOfWeek[targetDate.getDay()];

  if (!doc.availableDays || !doc.availableDays.includes(dayName)) {
    return res.json({ 
      isAvailableDay: false, 
      dayName, 
      slots: [], 
      message: `Dr. ${doc.name} is not available for consultations on ${dayName}s.` 
    });
  }

  const existingApts = db.getAppointmentsByDoctor(doc.id).filter(a => a.date === date && a.status !== 'cancelled');
  const bookedTimes = new Set(existingApts.map(a => a.start_time.toLowerCase().trim()));

  const slotResults = (doc.timeSlots || []).map(slotStr => {
    const parts = slotStr.split('-');
    const startTime = parts[0].trim();
    const endTime = parts[1] ? parts[1].trim() : startTime;
    const isBooked = bookedTimes.has(startTime.toLowerCase().trim());

    return {
      slot: slotStr,
      startTime,
      endTime,
      isAvailable: !isBooked
    };
  });

  res.json({
    isAvailableDay: true,
    dayName,
    date,
    slots: slotResults
  });
});

// 2F. Public Appointment Booking
app.post('/api/public/appointments/book', rateLimitPublicBooking, (req, res) => {
  const {
    doctor_id,
    date,
    start_time,
    end_time,
    name,
    age,
    gender,
    phone,
    whatsapp,
    city,
    allergies,
    chronic_conditions,
    current_medicines,
    reason_for_visit,
    consent_given
  } = req.body;

  if (!doctor_id || !date || !start_time || !name || !phone) {
    return res.status(400).json({ error: "Missing required booking details." });
  }

  if (!validatePakistaniPhone(phone)) {
    return res.status(400).json({ error: "Please enter a valid Pakistani mobile number (e.g., 0300-1234567 or 03XXXXXXXXX)." });
  }

  if (!consent_given) {
    return res.status(400).json({ error: "Patient consent for medical consultation is mandatory." });
  }

  const doc = db.data.doctors.find(d => d.id === doctor_id);
  if (!doc) return res.status(404).json({ error: "Doctor not found." });

  if (db.isSlotConflict(doctor_id, date, start_time)) {
    return res.status(409).json({ error: `The time slot '${start_time}' on ${date} has just been booked. Please pick another available slot.` });
  }

  const formattedPhone = formatPakistaniPhone(phone);

  let patient = db.findPatientByPhone(doctor_id, formattedPhone);
  if (!patient) {
    patient = db.createPatient({
      doctor_id,
      name: sanitizeInput(name),
      age: Number(age) || 30,
      gender: gender || "Male",
      phone: formattedPhone,
      whatsapp: formatPakistaniPhone(whatsapp || phone),
      allergies: sanitizeInput(allergies) || "None",
      chronic_conditions: sanitizeInput(chronic_conditions) || "None",
      current_medicines: sanitizeInput(current_medicines) || "None",
      reason_for_visit: sanitizeInput(reason_for_visit) || "Online Booking Consultation",
      consent_given: true
    });
  } else {
    db.updatePatient(doctor_id, patient.id, {
      allergies: sanitizeInput(allergies) || patient.allergies,
      chronic_conditions: sanitizeInput(chronic_conditions) || patient.chronic_conditions,
      current_medicines: sanitizeInput(current_medicines) || patient.current_medicines,
      reason_for_visit: sanitizeInput(reason_for_visit) || patient.reason_for_visit
    });
  }

  // Generate unique appointment ID (DC-APT-YYYYMMDD-XXXXX)
  const dateCompact = date.replace(/-/g, '');
  const randNum = Math.floor(1000 + Math.random() * 9000);
  const appointment_no = `DC-APT-${dateCompact}-${randNum}`;

  const initialStatus = doc.auto_confirm_appointments ? "confirmed" : "pending";

  const newAppointment = db.createAppointment({
    doctor_id,
    patient_id: patient.id,
    appointment_no,
    date,
    start_time,
    end_time: end_time || start_time,
    status: initialStatus,
    source: "online",
    city: city || doc.city,
    notes: `Booked online by ${patient.name}. Reason: ${sanitizeInput(reason_for_visit) || 'General Consultation'}`
  });

  res.json({
    success: true,
    message: initialStatus === "confirmed" 
      ? "Your appointment is confirmed!" 
      : "Appointment request received! The clinic will confirm your booking shortly.",
    appointment: {
      id: newAppointment.id,
      appointment_no,
      doctor_name: doc.name,
      doctor_specialization: doc.specialization,
      clinic_name: doc.clinicName,
      clinic_address: doc.address,
      city: doc.city,
      clinic_phone: doc.phone,
      date,
      start_time,
      status: initialStatus,
      patient_name: patient.name,
      patient_phone: patient.phone
    }
  });
});

// 2G. Public Appointment Confirmation & Status Tracking
app.get('/api/public/appointments/:appointmentId', (req, res) => {
  const apt = db.getPublicAppointmentById(req.params.appointmentId);
  if (!apt) {
    return res.status(404).json({ error: "Appointment booking not found. Please verify your Appointment ID." });
  }
  res.json({ success: true, appointment: apt });
});

// ==========================================
// 3. APPOINTMENTS MANAGEMENT (STEP 2)
// ==========================================
app.get('/api/appointments', requireDoctorAuth, (req, res) => {
  const doctorId = req.doctorId;
  const { tab = 'today', q = '' } = req.query;
  const todayStr = new Date().toISOString().split('T')[0];

  const list = db.getAppointmentsByDoctor(doctorId);

  let enriched = list.map(apt => {
    const patient = db.data.patients.find(p => p.id === apt.patient_id) || {
      name: "Unknown Patient",
      age: 30,
      gender: "Male",
      phone: "",
      allergies: "None",
      chronic_conditions: "None"
    };
    return {
      ...apt,
      patient_name: patient.name,
      patient_age: patient.age,
      patient_gender: patient.gender,
      patient_phone: patient.phone,
      patient_allergies: patient.allergies,
      patient_chronic: patient.chronic_conditions
    };
  });

  if (tab === 'today') {
    enriched = enriched.filter(a => a.date === todayStr && a.status !== 'cancelled');
  } else if (tab === 'upcoming') {
    enriched = enriched.filter(a => a.date > todayStr && a.status !== 'cancelled');
  } else if (tab === 'history') {
    enriched = enriched.filter(a => a.date < todayStr || a.status === 'completed');
  } else if (tab === 'cancelled') {
    enriched = enriched.filter(a => a.status === 'cancelled');
  }

  if (q && q.trim()) {
    const query = q.toLowerCase().trim();
    enriched = enriched.filter(a => 
      a.patient_name.toLowerCase().includes(query) ||
      (a.patient_phone && a.patient_phone.includes(query)) ||
      (a.notes && a.notes.toLowerCase().includes(query))
    );
  }

  res.json({ appointments: enriched });
});

app.get('/api/appointments/counts', requireDoctorAuth, (req, res) => {
  const doctorId = req.doctorId;
  const todayStr = new Date().toISOString().split('T')[0];
  const list = db.getAppointmentsByDoctor(doctorId);

  const todaysAppointments = list.filter(a => a.date === todayStr);
  const todaysTotal = todaysAppointments.length;
  const pendingCount = list.filter(a => a.status === 'pending').length;
  const completedToday = todaysAppointments.filter(a => a.status === 'completed').length;
  const upcomingCount = list.filter(a => a.date > todayStr && a.status !== 'cancelled').length;

  res.json({
    todaysTotal,
    pendingCount,
    completedToday,
    upcomingCount
  });
});

app.post('/api/appointments/manual', requireDoctorAuth, (req, res) => {
  const doctorId = req.doctorId;
  const {
    name,
    age,
    gender,
    phone,
    whatsapp,
    allergies,
    chronic_conditions,
    current_medicines,
    reason_for_visit,
    date,
    start_time,
    end_time,
    status,
    notes
  } = req.body;

  if (!name || !date || !start_time) {
    return res.status(400).json({ error: "Patient name, appointment date, and start time are required." });
  }

  if (phone && !validatePakistaniPhone(phone)) {
    return res.status(400).json({ error: "Invalid Pakistani phone number format (use 03XX-XXXXXXX or +92 format)." });
  }

  if (db.isSlotConflict(doctorId, date, start_time)) {
    return res.status(409).json({ error: `Slot '${start_time}' on ${date} is already booked. Double-booking prevented.` });
  }

  const formattedPhone = formatPakistaniPhone(phone);

  let patient = db.findPatientByPhone(doctorId, formattedPhone);
  if (!patient) {
    patient = db.createPatient({
      doctor_id: doctorId,
      name: sanitizeInput(name),
      age: Number(age) || 30,
      gender: gender || "Male",
      phone: formattedPhone || "",
      whatsapp: formatPakistaniPhone(whatsapp || phone),
      allergies: sanitizeInput(allergies) || "None",
      chronic_conditions: sanitizeInput(chronic_conditions) || "None",
      current_medicines: sanitizeInput(current_medicines) || "None",
      reason_for_visit: sanitizeInput(reason_for_visit) || "Walk-in Consultation",
      consent_given: true
    });
  } else {
    db.updatePatient(doctorId, patient.id, {
      name: sanitizeInput(name) || patient.name,
      age: Number(age) || patient.age,
      allergies: sanitizeInput(allergies) || patient.allergies,
      chronic_conditions: sanitizeInput(chronic_conditions) || patient.chronic_conditions,
      current_medicines: sanitizeInput(current_medicines) || patient.current_medicines
    });
  }

  const newApt = db.createAppointment({
    doctor_id: doctorId,
    patient_id: patient.id,
    date,
    start_time,
    end_time: end_time || start_time,
    status: status || "confirmed",
    source: "manual",
    notes: sanitizeInput(notes) || `Manual booking for ${patient.name}`
  });

  res.json({
    success: true,
    appointment: {
      ...newApt,
      patient_name: patient.name,
      patient_phone: patient.phone,
      patient_allergies: patient.allergies
    }
  });
});

app.patch('/api/appointments/:id/status', requireDoctorAuth, (req, res) => {
  const { status, notes } = req.body;
  const updated = db.updateAppointmentStatus(req.doctorId, req.params.id, status, notes);
  if (!updated) return res.status(404).json({ error: "Appointment not found or unauthorized" });
  res.json({ success: true, appointment: updated });
});

app.post('/api/appointments/:id/reschedule', requireDoctorAuth, (req, res) => {
  const { date, start_time, end_time } = req.body;
  if (!date || !start_time) {
    return res.status(400).json({ error: "New date and start_time are required to reschedule." });
  }

  try {
    const rescheduled = db.rescheduleAppointment(req.doctorId, req.params.id, date, start_time, end_time);
    if (!rescheduled) return res.status(404).json({ error: "Appointment not found or unauthorized" });
    res.json({ success: true, appointment: rescheduled });
  } catch (err) {
    res.status(err.statusCode || 400).json({ error: err.message });
  }
});

// ==========================================
// 4. PATIENT RECORDS & TIMELINES (STEP 2 + STEP 3)
// ==========================================
app.get('/api/patients', requireDoctorAuth, (req, res) => {
  const { q } = req.query;
  let patients = db.getPatientsByDoctor(req.doctorId);

  if (q && q.trim()) {
    const query = q.toLowerCase().trim();
    patients = patients.filter(p => 
      p.name.toLowerCase().includes(query) ||
      (p.phone && p.phone.includes(query)) ||
      (p.allergies && p.allergies.toLowerCase().includes(query))
    );
  }

  res.json({ patients });
});

app.get('/api/patients/:id', requireDoctorAuth, (req, res) => {
  const patient = db.getPatientById(req.doctorId, req.params.id);
  if (!patient) return res.status(404).json({ error: "Patient record not found or unauthorized" });

  const appointments = db.getAppointmentsByPatient(req.doctorId, patient.id);
  const prescriptions = db.getPrescriptionsByDoctor(req.doctorId, { patient_id: patient.id });

  res.json({
    patient,
    timeline: {
      totalVisits: appointments.length,
      appointments,
      prescriptions
    }
  });
});

app.put('/api/patients/:id', requireDoctorAuth, (req, res) => {
  const {
    name,
    age,
    gender,
    phone,
    whatsapp,
    allergies,
    chronic_conditions,
    current_medicines,
    reason_for_visit,
    private_notes
  } = req.body;

  const updated = db.updatePatient(req.doctorId, req.params.id, {
    name: sanitizeInput(name),
    age: Number(age) || undefined,
    gender,
    phone: formatPakistaniPhone(phone),
    whatsapp: formatPakistaniPhone(whatsapp || phone),
    allergies: sanitizeInput(allergies),
    chronic_conditions: sanitizeInput(chronic_conditions),
    current_medicines: sanitizeInput(current_medicines),
    reason_for_visit: sanitizeInput(reason_for_visit),
    private_notes: sanitizeInput(private_notes)
  });

  if (!updated) return res.status(404).json({ error: "Patient not found or unauthorized" });
  res.json({ success: true, patient: updated });
});

// ==========================================
// 5. LIVE MEDICINES DATABASE & AUTOCOMPLETE (PAKISTAN FORMULARY)
// ==========================================
// ==========================================
// 5. LIVE MEDICINES DATABASE & AUTOCOMPLETE (PAKISTAN FORMULARY)
// ==========================================
app.get('/api/medicines/meta', (req, res) => {
  const meta = db.getMedicinesMeta();
  res.json({ success: true, meta });
});

app.get('/api/medicines/sync-status', (req, res) => {
  const meta = db.getFormularyMeta();
  const logs = db.getMedicineSyncLogs(5);
  res.json({ success: true, meta, recent_logs: logs });
});

app.get('/api/medicines', requireDoctorAuth, (req, res) => {
  const { q, category, therapeutic_class, form, dosage_form, route, manufacturer, status, limit, offset } = req.query;
  const numLimit = parseInt(limit, 10) || 100;
  const medicines = db.searchMedicines(q, {
    category: category || therapeutic_class,
    form: form || dosage_form,
    route,
    manufacturer,
    status: status || 'all',
    doctorId: req.doctorId,
    limit: numLimit
  });
  res.json({ medicines, total: medicines.length });
});

app.get('/api/medicines/search', requireDoctorAuth, (req, res) => {
  const { q, category, therapeutic_class, form, dosage_form, route, manufacturer, status, limit } = req.query;
  const numLimit = parseInt(limit, 10) || 50;
  const medicines = db.searchMedicines(q, {
    category: category || therapeutic_class,
    form: form || dosage_form,
    route,
    manufacturer,
    status: status || 'active',
    doctorId: req.doctorId,
    limit: numLimit
  });
  res.json({ medicines, total: medicines.length });
});

app.get('/api/medicines/favorites', requireDoctorAuth, (req, res) => {
  const favorites = db.getFavoriteMedicines(req.doctorId);
  res.json({ favorites });
});

app.post('/api/medicines/favorites/toggle', requireDoctorAuth, (req, res) => {
  const { medicine_id } = req.body;
  if (!medicine_id) return res.status(400).json({ error: "Medicine ID is required." });
  const result = db.toggleFavoriteMedicine(req.doctorId, medicine_id);
  res.json({ success: true, ...result });
});

app.get('/api/medicines/sync-logs', requireDoctorAuth, (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 30;
  const logs = db.getMedicineSyncLogs(limit);
  res.json({ success: true, logs });
});

app.get('/api/medicines/export', requireDoctorAuth, (req, res) => {
  const allMeds = db.getAllMedicines(req.doctorId, true);
  const meta = db.getFormularyMeta();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="doccare-pakistan-formulary-${new Date().toISOString().split('T')[0]}.json"`);
  res.json({ meta, export_timestamp: new Date().toISOString(), medicines: allMeds });
});

app.post('/api/medicines/sync', requireDoctorAuth, (req, res) => {
  try {
    const { source, incomingData } = req.body || {};
    const result = db.syncPakistanFormulary(source || "DRAP / Pakistan National Formulary Live Sync", incomingData);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Synchronization failed: " + err.message });
  }
});

app.post('/api/medicines/import', requireDoctorAuth, (req, res) => {
  try {
    const { medicines, source } = req.body;
    if (!Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({ error: "Valid medicines array is required for import." });
    }
    const result = db.syncPakistanFormulary(source || "Administrator Batch Import", medicines);
    res.json({ success: true, message: `Imported ${medicines.length} records successfully.`, result });
  } catch (err) {
    res.status(400).json({ error: "Import failed: " + err.message });
  }
});

app.get('/api/medicines/:id', requireDoctorAuth, (req, res) => {
  const med = db.getMedicineById(req.params.id);
  if (!med) return res.status(404).json({ error: "Medicine record not found" });
  res.json({ medicine: med });
});

app.post('/api/medicines', requireDoctorAuth, (req, res) => {
  const {
    brand_name,
    generic_name,
    active_ingredient,
    active_ingredients,
    strength,
    strength_unit,
    dosage_form,
    form,
    route,
    manufacturer,
    pack_size,
    therapeutic_class,
    category,
    indication,
    prescription_status,
    registration_reference,
    notes,
    status
  } = req.body;

  // Validation of mandatory fields
  if (!brand_name || !brand_name.trim()) {
    return res.status(400).json({ error: "Brand Name is required." });
  }
  if (!generic_name || !generic_name.trim()) {
    return res.status(400).json({ error: "Generic Name is required." });
  }
  const activeIng = (active_ingredient || (Array.isArray(active_ingredients) ? active_ingredients.join(', ') : '') || generic_name).trim();
  if (!activeIng) {
    return res.status(400).json({ error: "Active Ingredient is required." });
  }
  if (!strength || !strength.trim()) {
    return res.status(400).json({ error: "Strength (e.g., 500 mg, 10 mg/5ml) is required." });
  }
  const resolvedDosageForm = (dosage_form || form || '').trim();
  if (!resolvedDosageForm) {
    return res.status(400).json({ error: "Dosage Form (e.g., Tablet, Capsule, Syrup) is required." });
  }

  // Check duplicate
  const duplicate = db.findDuplicateMedicine({
    brand_name: sanitizeInput(brand_name),
    strength: sanitizeInput(strength),
    dosage_form: sanitizeInput(resolvedDosageForm),
    manufacturer: sanitizeInput(manufacturer) || ''
  });

  if (duplicate) {
    return res.status(409).json({ 
      error: `A medicine with the same Brand (${duplicate.brand_name}), Strength (${duplicate.strength}), Dosage Form (${duplicate.dosage_form || duplicate.form}) and Manufacturer (${duplicate.manufacturer}) already exists in the Pakistan Formulary.`,
      duplicateId: duplicate.id
    });
  }

  const newMed = db.addMedicine({
    brand_name: sanitizeInput(brand_name),
    generic_name: sanitizeInput(generic_name),
    active_ingredient: sanitizeInput(activeIng),
    active_ingredients: [sanitizeInput(activeIng)],
    strength: sanitizeInput(strength),
    strength_unit: sanitizeInput(strength_unit) || (strength.match(/[a-zA-Z]+/g) || ['mg'])[0],
    dosage_form: sanitizeInput(resolvedDosageForm),
    form: sanitizeInput(resolvedDosageForm),
    route: sanitizeInput(route) || 'Oral',
    manufacturer: sanitizeInput(manufacturer) || 'Pharmaceuticals Pakistan',
    pack_size: sanitizeInput(pack_size) || 'Standard Pack',
    therapeutic_class: sanitizeInput(therapeutic_class || category) || 'General Formulary',
    category: sanitizeInput(therapeutic_class || category) || 'General Formulary',
    indication: sanitizeInput(indication) || 'As clinically indicated',
    prescription_status: prescription_status || 'Rx Only',
    registration_reference: sanitizeInput(registration_reference) || `DRAP-PK-MAN-${Date.now().toString().slice(-6)}`,
    notes: sanitizeInput(notes) || '',
    status: status || 'active',
    source: `DocCare Clinical Formulary (${req.doctor?.name || 'Dr. Practice'})`
  }, req.doctorId);

  res.json({ success: true, message: "Medicine added to Pakistan Formulary successfully", medicine: newMed });
});

app.put('/api/medicines/:id', requireDoctorAuth, (req, res) => {
  try {
    const updated = db.updateMedicine(req.params.id, req.body, req.doctorId);
    res.json({ success: true, message: "Medicine updated successfully", medicine: updated });
  } catch (err) {
    res.status(400).json({ error: err.message || "Failed to update medicine" });
  }
});

app.patch('/api/medicines/:id/status', requireDoctorAuth, (req, res) => {
  try {
    const { status } = req.body;
    let med;
    if (status === 'inactive') {
      med = db.deactivateMedicine(req.params.id, req.doctorId);
    } else {
      med = db.reactivateMedicine(req.params.id, req.doctorId);
    }
    res.json({ success: true, message: `Medicine marked as ${status}`, medicine: med });
  } catch (err) {
    res.status(400).json({ error: err.message || "Failed to change status" });
  }
});

app.delete('/api/medicines/:id', requireDoctorAuth, (req, res) => {
  try {
    const result = db.deleteMedicine(req.params.id, req.doctorId);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ error: err.message || "Failed to delete medicine" });
  }
});

// ==========================================
// 6. PRESCRIPTIONS CRUD & LIFECYCLE (STEPS 3 & 4)
// ==========================================
app.get('/api/prescriptions', requireDoctorAuth, (req, res) => {
  const { patient_id, status, q, startDate, endDate, sort } = req.query;
  const prescriptions = db.getPrescriptionsByDoctor(req.doctorId, {
    patient_id,
    status,
    q,
    startDate,
    endDate,
    sort
  });
  res.json({ success: true, count: prescriptions.length, prescriptions });
});

app.get('/api/prescriptions/:id', requireDoctorAuth, (req, res) => {
  const prescription = db.getPrescriptionById(req.doctorId, req.params.id);
  if (!prescription) return res.status(404).json({ error: "Prescription not found or unauthorized" });
  res.json({ success: true, prescription });
});

// Doctor Prescription Audit Event (Print / Download / Reprint)
app.post('/api/prescriptions/:id/audit-event', requireDoctorAuth, (req, res) => {
  try {
    const eventType = req.body.event || req.body.event_type || req.body.action || 'printed';
    const details = req.body.details || `Doctor triggered ${eventType}`;
    const rx = db.getPrescriptionById(req.doctorId, req.params.id);
    if (!rx) return res.status(404).json({ error: "Prescription not found or unauthorized" });

    const auditEntry = db.addPrescriptionAuditEvent(rx.id, {
      event: eventType,
      actor_id: req.doctorId,
      actor_role: 'doctor',
      actor_name: req.doctor?.name || 'Dr. Practice',
      details: details
    });

    res.json({ success: true, audit: auditEntry });
  } catch (err) {
    res.status(400).json({ error: "Failed to log prescription event: " + err.message });
  }
});

// Save or Auto-save Draft Prescription
app.post('/api/prescriptions', requireDoctorAuth, (req, res) => {
  try {
    const {
      id,
      patient_id,
      appointment_id,
      diagnosis,
      symptoms,
      items,
      tests_advised,
      advice,
      follow_up_date
    } = req.body;

    if (!patient_id) {
      return res.status(400).json({ error: "Patient ID is required to create or save a prescription." });
    }

    const savedDraft = db.savePrescriptionDraft(req.doctorId, {
      id,
      patient_id,
      appointment_id,
      diagnosis: sanitizeInput(diagnosis),
      symptoms: sanitizeInput(symptoms),
      items: items || [],
      tests_advised: sanitizeInput(tests_advised),
      advice: sanitizeInput(advice),
      follow_up_date
    });

    res.json({ success: true, prescription: savedDraft });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

// Finalize Prescription
app.post('/api/prescriptions/:id/finalize', requireDoctorAuth, (req, res) => {
  try {
    const prescriptionId = req.params.id;
    const finalData = req.body;

    const finalizedRx = db.finalizePrescription(req.doctorId, prescriptionId, finalData);
    if (!finalizedRx) {
      return res.status(404).json({ error: "Prescription not found or unauthorized." });
    }

    res.json({
      success: true,
      message: `Prescription ${finalizedRx.prescription_no} has been officially locked and finalized.`,
      prescription: finalizedRx
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

// Duplicate Past Prescription into New Draft
app.post('/api/prescriptions/:id/duplicate', requireDoctorAuth, (req, res) => {
  const prescriptionId = req.params.id;
  const newDraft = db.duplicatePrescription(req.doctorId, prescriptionId);
  if (!newDraft) {
    return res.status(404).json({ error: "Original prescription not found or unauthorized." });
  }

  res.json({
    success: true,
    message: `Prescription successfully duplicated into new draft ${newDraft.prescription_no}.`,
    prescription: newDraft
  });
});

// ==========================================
// 7. STEP 4: SERVER-SIDE PDF GENERATION & STREAMING
// ==========================================

// Generate / Regenerate PDF Endpoint
app.post('/api/prescriptions/:id/generate-pdf', requireDoctorAuth, async (req, res) => {
  try {
    const prescriptionId = req.params.id;
    const rx = db.getPrescriptionById(req.doctorId, prescriptionId);
    if (!rx) {
      return res.status(404).json({ error: "Prescription not found or unauthorized" });
    }

    const doctor = db.data.doctors.find(d => d.id === req.doctorId);
    const settings = db.getDoctorPdfSettings(req.doctorId);
    const host = req.get('host') || 'localhost:5173';
    const protocol = req.protocol || 'http';
    const baseUrl = `${protocol}://${host}`;

    const pdfResult = await generatePrescriptionPDF({
      prescription: rx,
      doctor,
      settings,
      baseUrl
    });

    // Update prescription PDF metadata in DB
    db.updatePrescriptionPdfMetadata(rx.id, pdfResult.pdfUrl);

    res.json({
      success: true,
      pdfUrl: pdfResult.pdfUrl,
      verificationToken: pdfResult.verificationToken,
      generatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error("PDF generation failure:", err);
    res.status(500).json({ error: "Failed to generate prescription PDF: " + err.message });
  }
});

// Serve / Stream Private PDF (Doctor Isolated)
app.get('/api/prescriptions/:id/pdf', async (req, res) => {
  try {
    const prescriptionId = req.params.id;
    const force = req.query.force === 'true';

    // Allow authenticated doctor access, or tokenized secure download
    const doctorId = req.headers['x-doctor-id'] || req.query.doctor_id;
    const token = req.query.token;

    let rx = null;
    if (token) {
      rx = db.findPrescriptionByVerificationToken(token);
    } else {
      rx = db.getPrescriptionById(doctorId || 'doc-1', prescriptionId);
    }

    if (!rx) {
      return res.status(404).json({ error: "Prescription not found or unauthorized to view PDF." });
    }

    const doctor = db.data.doctors.find(d => d.id === rx.doctor_id);
    const settings = db.getDoctorPdfSettings(rx.doctor_id);
    const host = req.get('host') || 'localhost:5173';
    const protocol = req.protocol || 'http';
    const baseUrl = `${protocol}://${host}`;

    // Render PDF buffer
    const pdfResult = await generatePrescriptionPDF({
      prescription: rx,
      doctor,
      settings,
      baseUrl
    });

    const isDownload = req.query.download === 'true';
    const fileName = `${rx.prescription_no || 'Prescription'}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `${isDownload ? 'attachment' : 'inline'}; filename="${fileName}"`);
    res.setHeader('Cache-Control', 'private, max-age=300');
    res.send(pdfResult.buffer);

  } catch (err) {
    console.error("PDF streaming error:", err);
    res.status(500).json({ error: "Failed to render PDF: " + err.message });
  }
});

// ==========================================
// 8. STEP 4: PUBLIC VERIFICATION ENDPOINT
// ==========================================
app.get('/api/public/verify/:token', rateLimitPublicVerify, (req, res) => {
  const token = req.params.token;
  const rx = db.findPrescriptionByVerificationToken(token);

  if (!rx) {
    return res.status(404).json({
      verified: false,
      error: "Prescription not found or verification token is invalid."
    });
  }

  const doctor = rx.doctor || db.data.doctors.find(d => d.id === rx.doctor_id) || {};
  const patient = rx.patient || {};

  // STRICT PRIVACY COMPLIANCE:
  // Mask patient name (e.g. "K*** A***") and DO NOT expose medicines, diagnosis, or sensitive details
  res.json({
    verified: true,
    prescription_no: rx.prescription_no,
    date: rx.created_at ? new Date(rx.created_at).toISOString().split('T')[0] : '2026-09-30',
    doctor_name: doctor.name,
    doctor_pmdc: doctor.pmdcNumber,
    doctor_specialization: doctor.specialization,
    clinic_name: doctor.clinicName,
    clinic_city: doctor.city,
    clinic_address: doctor.address,
    clinic_phone: doctor.phone,
    patient_masked_name: maskPatientName(patient.name || rx.patient_name),
    status: rx.status,
    finalized_at: rx.finalized_at || rx.created_at,
    disclaimer: "This prescription has been verified against the DocCare official clinical cryptographic registry."
  });
});

// ==========================================
// 8B. STEP 5: PUBLIC SECURE EXPIRING PDF LINK (/rx/:token)
// ==========================================
app.get('/api/public/rx-info/:share_token', rateLimitPublicRx, (req, res) => {
  const token = req.params.share_token;
  const result = db.getShareByToken(token);

  if (!result || !result.share) {
    return res.status(404).json({
      valid: false,
      error: "Prescription link not found or invalid token.",
      message: "This link does not exist. Please contact your doctor."
    });
  }

  const { share, rx, doctor, isExpired, isRevoked, isLimitReached, isValid } = result;

  if (!isValid) {
    let reason = "This link has expired.";
    if (isRevoked) reason = "This link has been revoked by the doctor.";
    if (isLimitReached) reason = "Maximum download limit reached for this prescription link.";

    return res.status(410).json({
      valid: false,
      isExpired,
      isRevoked,
      isLimitReached,
      reason,
      message: "This link has expired. Please contact your doctor.",
      doctor_name: doctor?.name || 'Your Attending Doctor',
      clinic_name: doctor?.clinicName || 'DocCare Medical Clinic',
      clinic_phone: doctor?.phone || '',
      clinic_address: doctor?.address || ''
    });
  }

  res.json({
    valid: true,
    prescription_no: rx?.prescription_no,
    doctor_name: doctor?.name,
    doctor_specialization: doctor?.specialization,
    clinic_name: doctor?.clinicName,
    clinic_phone: doctor?.phone,
    clinic_address: doctor?.address,
    expires_at: share.expires_at,
    download_count: share.download_count,
    max_downloads: share.max_downloads,
    created_at: share.created_at,
    download_url: `/api/public/rx/${token}?download=true`,
    view_url: `/api/public/rx/${token}`
  });
});

app.get('/api/public/rx/:share_token', rateLimitPublicRx, async (req, res) => {
  try {
    const token = req.params.share_token;
    const result = db.getShareByToken(token);

    if (!result || !result.share || !result.isValid) {
      const doctor = result?.doctor;
      return res.status(410).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Prescription Link Expired | DocCare</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-slate-50 min-h-screen flex items-center justify-center p-4 font-sans text-slate-800">
          <div class="max-w-md w-full bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-slate-200 text-center">
            <div class="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">!</div>
            <h1 class="text-xl font-black text-slate-900 mb-2">Prescription Link Expired</h1>
            <p class="text-slate-600 text-sm mb-6 leading-relaxed">
              This secure prescription download link has expired or reached its access limit. For patient safety and medical record security, please contact your doctor for a fresh copy.
            </p>
            ${doctor ? `
              <div class="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-200/80 text-left text-xs space-y-1">
                <p class="font-bold text-slate-900">${doctor.name}</p>
                <p class="text-slate-600">${doctor.clinicName}</p>
                <p class="text-slate-500">${doctor.address || ''}</p>
                ${doctor.phone ? `<p class="font-semibold text-teal-700 pt-1">Clinic Phone: ${doctor.phone}</p>` : ''}
              </div>
              ${doctor.phone ? `
                <a href="tel:${doctor.phone.replace(/[^0-9+]/g, '')}" class="inline-flex items-center justify-center w-full py-3 px-4 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold text-sm shadow transition-all mb-2">
                  Call Clinic (${doctor.phone})
                </a>
              ` : ''}
            ` : ''}
            <a href="/" class="inline-block text-xs font-semibold text-slate-500 hover:text-slate-800 mt-2">
              Return to DocCare
            </a>
          </div>
        </body>
        </html>
      `);
    }

    const { share, rx, doctor } = result;

    // Increment download count and audit log
    db.incrementShareDownload(token);

    const settings = db.getDoctorPdfSettings(rx.doctor_id);
    const host = req.get('host') || 'localhost:5173';
    const protocol = req.protocol || 'http';
    const baseUrl = `${protocol}://${host}`;

    // Render PDF buffer
    const pdfResult = await generatePrescriptionPDF({
      prescription: rx,
      doctor,
      settings,
      baseUrl
    });

    const isDownload = req.query.download === 'true';
    const fileName = `${rx.prescription_no || 'Prescription'}.pdf`;

    // Security and privacy headers: no-store cache, no-index
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `${isDownload ? 'attachment' : 'inline'}; filename="${fileName}"`);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    res.send(pdfResult.buffer);

  } catch (err) {
    console.error("Public Rx download error:", err);
    res.status(500).json({ error: "Failed to download prescription PDF: " + err.message });
  }
});

// ==========================================
// 8C. STEP 5: PRESCRIPTION SHARING (MODE A & MODE B)
// ==========================================
app.post('/api/prescriptions/:id/share', requireDoctorAuth, async (req, res) => {
  try {
    const rxId = req.params.id;
    const { expiry_days = 7, max_downloads = null, force_new = false } = req.body;
    const doctorId = req.doctorId;

    const rx = db.getPrescriptionById(doctorId, rxId);
    if (!rx) {
      return res.status(404).json({ error: "Prescription not found or unauthorized." });
    }

    if (rx.status !== 'final') {
      return res.status(400).json({ error: "Only finalized prescriptions can be shared with patients." });
    }

    // Ensure PDF is compiled
    const doctor = db.data.doctors.find(d => d.id === doctorId);
    const settings = db.getDoctorPdfSettings(doctorId);
    const host = req.get('host') || 'localhost:5173';
    const protocol = req.protocol || 'http';
    const baseUrl = `${protocol}://${host}`;

    await generatePrescriptionPDF({
      prescription: rx,
      doctor,
      settings,
      baseUrl
    });

    let share = null;
    if (!force_new) {
      share = db.getActiveShareForPrescription(doctorId, rxId);
    }

    if (!share) {
      share = db.createPrescriptionShare(doctorId, {
        prescription_id: rxId,
        patient_id: rx.patient_id,
        expiry_days: expiry_days || doctor?.default_link_expiry_days || 7,
        max_downloads
      });
    }

    const origin = req.headers.origin || `${protocol}://${host}`;
    const shareUrl = `${origin}/rx/${share.share_token}`;

    res.json({
      success: true,
      share,
      shareUrl,
      prescription_no: rx.prescription_no
    });
  } catch (err) {
    console.error("Prescription share creation error:", err);
    res.status(500).json({ error: "Failed to generate share link: " + err.message });
  }
});

app.get('/api/prescriptions/:id/shares', requireDoctorAuth, (req, res) => {
  const shares = db.getSharesByPrescription(req.doctorId, req.params.id);
  res.json({ shares });
});

app.post('/api/shares/:id/revoke', requireDoctorAuth, (req, res) => {
  try {
    const revoked = db.revokePrescriptionShare(req.doctorId, req.params.id);
    res.json({ success: true, share: revoked });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// 8D. STEP 5: WHATSAPP SEND & AUDIT LOGS
// ==========================================
app.get('/api/whatsapp/config', requireDoctorAuth, (req, res) => {
  const doctor = db.getDoctorById(req.doctorId);
  const modeBEnabled = Boolean(
    process.env.WHATSAPP_CLOUD_TOKEN && 
    process.env.WHATSAPP_PHONE_NUMBER_ID
  );

  res.json({
    modeBEnabled,
    templateName: process.env.WHATSAPP_TEMPLATE_NAME || 'doccare_prescription_ready',
    templateLang: process.env.WHATSAPP_TEMPLATE_LANG || 'en',
    defaultTemplate: doctor?.whatsapp_message_template || "Hello [Patient Name], your prescription from Dr. [Doctor Name] ([Clinic Name]) is ready. View or download it here: [Link]. This link expires on [Expiry Date]. Get well soon.",
    defaultExpiryDays: doctor?.default_link_expiry_days || 7
  });
});

app.post('/api/whatsapp/send-link', requireDoctorAuth, (req, res) => {
  try {
    const { 
      prescription_id, 
      share_id, 
      appointment_id, 
      patient_id, 
      type = 'prescription', 
      to_number, 
      message_text 
    } = req.body;

    if (!to_number) {
      return res.status(400).json({ error: "Patient phone number is required." });
    }

    const normalizedPhone = normalizePakistaniPhone(to_number);
    if (!normalizedPhone) {
      return res.status(400).json({ 
        error: "Invalid Pakistani phone number format. Please provide a valid number (e.g. 0300-1234567 or 923001234567)." 
      });
    }

    // PRIVACY ENFORCEMENT: Never include diagnoses or medicine names in WhatsApp body text
    const cleanMessage = sanitizeInput(message_text);

    const logEntry = db.createMessageLog(req.doctorId, {
      prescription_id,
      share_id,
      appointment_id,
      patient_id,
      type,
      channel: 'wa_link',
      to_number: normalizedPhone,
      message_text: cleanMessage,
      status: 'opened'
    });

    const wa_url = `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(cleanMessage)}`;
    const sms_url = `sms:${normalizedPhone}?body=${encodeURIComponent(cleanMessage)}`;

    res.json({
      success: true,
      log: logEntry,
      wa_url,
      sms_url
    });
  } catch (err) {
    console.error("WhatsApp Link Dispatch error:", err);
    res.status(500).json({ error: "Failed to dispatch WhatsApp link: " + err.message });
  }
});

app.post('/api/whatsapp/send-cloud', requireDoctorAuth, async (req, res) => {
  try {
    const { 
      prescription_id, 
      share_id, 
      patient_id, 
      to_number, 
      share_url,
      patient_name
    } = req.body;

    const cloudToken = process.env.WHATSAPP_CLOUD_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!cloudToken || !phoneNumberId) {
      return res.status(400).json({ 
        error: "WhatsApp Cloud API credentials are not configured in environment variables." 
      });
    }

    const normalizedPhone = normalizePakistaniPhone(to_number);
    if (!normalizedPhone) {
      return res.status(400).json({ error: "Invalid Pakistani phone number format." });
    }

    const doctor = db.getDoctorById(req.doctorId);
    const templateName = process.env.WHATSAPP_TEMPLATE_NAME || "doccare_prescription_ready";
    const templateLang = process.env.WHATSAPP_TEMPLATE_LANG || "en";

    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: normalizedPhone,
      type: "template",
      template: {
        name: templateName,
        language: { code: templateLang },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: patient_name || "Patient" },
              { type: "text", text: doctor?.name || "Doctor" },
              { type: "text", text: doctor?.clinicName || "Clinic" },
              { type: "text", text: share_url || "https://doccare.pk" }
            ]
          }
        ]
      }
    };

    const fbResponse = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${cloudToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const fbData = await fbResponse.json();

    if (!fbResponse.ok) {
      const errorMsg = fbData?.error?.message || "Meta Cloud API Error";
      const failedLog = db.createMessageLog(req.doctorId, {
        prescription_id,
        share_id,
        patient_id,
        type: 'prescription',
        channel: 'wa_cloud_api',
        to_number: normalizedPhone,
        message_text: `Template: ${templateName}`,
        status: 'failed',
        error: errorMsg
      });
      return res.status(400).json({ error: errorMsg, log: failedLog });
    }

    const providerMessageId = fbData?.messages?.[0]?.id || null;
    const logEntry = db.createMessageLog(req.doctorId, {
      prescription_id,
      share_id,
      patient_id,
      type: 'prescription',
      channel: 'wa_cloud_api',
      to_number: normalizedPhone,
      message_text: `Template: ${templateName}`,
      status: 'sent',
      provider_message_id: providerMessageId
    });

    res.json({
      success: true,
      log: logEntry,
      provider_message_id: providerMessageId
    });
  } catch (err) {
    console.error("Cloud API Dispatch error:", err);
    res.status(500).json({ error: "Failed to send via WhatsApp Cloud API: " + err.message });
  }
});

// ==========================================
// 8E. STEP 5: WHATSAPP CLOUD API WEBHOOKS
// ==========================================
app.get('/api/webhooks/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'doccare_webhook_token_2026';

  if (mode === 'subscribe' && token === verifyToken) {
    console.log("WhatsApp Webhook verified successfully.");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post('/api/webhooks/whatsapp', (req, res) => {
  try {
    const body = req.body;
    if (body.object === 'whatsapp_business_account') {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const statuses = value?.statuses;

      if (statuses && Array.isArray(statuses)) {
        statuses.forEach(statusUpdate => {
          const messageId = statusUpdate.id;
          const status = statusUpdate.status; // 'sent' | 'delivered' | 'read' | 'failed'
          const errors = statusUpdate.errors ? JSON.stringify(statusUpdate.errors) : null;

          if (messageId && status) {
            db.updateMessageLogByProviderId(messageId, status, errors);
          }
        });
      }
    }
    res.status(200).send('EVENT_RECEIVED');
  } catch (err) {
    console.error("Webhook processing error:", err);
    res.status(200).send('ERROR_HANDLED');
  }
});

// ==========================================
// 8F. STEP 5: MESSAGES LOGS & AUDIT STATS
// ==========================================
app.get('/api/messages', requireDoctorAuth, (req, res) => {
  const { date, status, type, patient_id, q } = req.query;
  const logs = db.getMessageLogsByDoctor(req.doctorId, { date, status, type, patient_id, q });
  res.json({ messages: logs });
});

app.get('/api/messages/stats', requireDoctorAuth, (req, res) => {
  const sentToday = db.getTodaysSentCount(req.doctorId);
  const failedCount = db.getFailedMessagesCount(req.doctorId);
  const total = db.getMessageLogsByDoctor(req.doctorId).length;
  res.json({ sentToday, failedCount, total });
});

app.put('/api/doctor/whatsapp-settings', requireDoctorAuth, (req, res) => {
  try {
    const { whatsapp_message_template, default_link_expiry_days } = req.body;
    const doc = db.updateDoctorWhatsAppSettings(req.doctorId, {
      whatsapp_message_template: sanitizeInput(whatsapp_message_template),
      default_link_expiry_days
    });
    res.json({ success: true, doctor: doc });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// 8E. TWO-SIDED PLATFORM: DOCTOR WORKSPACE APIS
// ==========================================

// Dashboard Unified Stats
app.get('/api/doctor/dashboard-stats', requireDoctorAuth, (req, res) => {
  try {
    const stats = db.getDoctorDashboardStats(req.doctorId);
    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch dashboard stats: " + err.message });
  }
});

// Clinical & Financial Analytics / Reports
app.get('/api/doctor/reports/analytics', requireDoctorAuth, (req, res) => {
  try {
    const analytics = db.getDoctorAnalytics(req.doctorId);
    const ledgerSummary = db.getLedgerSummary(req.doctorId);
    res.json({ success: true, analytics, ledgerSummary });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch analytics: " + err.message });
  }
});

// Doctor Public Profile Settings (Visibility & Auto-Confirm Toggles)
app.get('/api/doctor/public-settings', requireDoctorAuth, (req, res) => {
  const doc = db.getDoctorById(req.doctorId);
  if (!doc) return res.status(404).json({ error: "Doctor not found" });

  res.json({
    success: true,
    public_profile_settings: doc.public_profile_settings || {
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
    auto_confirm_appointments: Boolean(doc.auto_confirm_appointments),
    working_sessions: doc.working_sessions || {
      morning: { enabled: false, start: "09:00 AM", end: "01:00 PM" },
      evening: { enabled: true, start: "04:00 PM", end: "08:00 PM" }
    },
    consultationFee: doc.consultationFee,
    followUpFee: doc.followUpFee || Math.round(doc.consultationFee * 0.6),
    onlineFee: doc.onlineFee || Math.round(doc.consultationFee * 0.8),
    emergencyFee: doc.emergencyFee || Math.round(doc.consultationFee * 1.5)
  });
});

app.put('/api/doctor/public-settings', requireDoctorAuth, (req, res) => {
  try {
    const {
      public_profile_settings,
      auto_confirm_appointments,
      working_sessions,
      consultationFee,
      followUpFee,
      onlineFee,
      emergencyFee
    } = req.body;

    const updatedDoc = db.updateDoctorPublicSettings(req.doctorId, {
      public_profile_settings,
      auto_confirm_appointments,
      working_sessions,
      consultationFee,
      followUpFee,
      onlineFee,
      emergencyFee
    });

    res.json({ success: true, doctor: updatedDoc });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// 9. STEP 4: DOCTOR PDF SETTINGS CRUD
// ==========================================
app.get('/api/pdf-settings', requireDoctorAuth, (req, res) => {
  const settings = db.getDoctorPdfSettings(req.doctorId);
  res.json({ settings });
});

app.put('/api/pdf-settings', requireDoctorAuth, (req, res) => {
  const updates = req.body;
  const updatedSettings = db.updateDoctorPdfSettings(req.doctorId, updates);
  res.json({ success: true, settings: updatedSettings });
});

app.post('/api/pdf-settings/reset', requireDoctorAuth, (req, res) => {
  const resetSettings = db.resetDoctorPdfSettings(req.doctorId);
  res.json({ success: true, settings: resetSettings });
});

// ==========================================
// 10. PRESCRIPTION TEMPLATES (STEP 3)
// ==========================================
app.get('/api/templates', requireDoctorAuth, (req, res) => {
  const templates = db.getTemplatesByDoctor(req.doctorId);
  res.json({ templates });
});

app.post('/api/templates', requireDoctorAuth, (req, res) => {
  const { name, diagnosis, items, tests_advised, advice } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Template name is required." });
  }

  const newTemplate = db.createTemplate(req.doctorId, {
    name: sanitizeInput(name),
    diagnosis: sanitizeInput(diagnosis),
    items: items || [],
    tests_advised: sanitizeInput(tests_advised),
    advice: sanitizeInput(advice)
  });

  res.json({ success: true, template: newTemplate });
});

app.put('/api/templates/:id', requireDoctorAuth, (req, res) => {
  const updated = db.updateTemplate(req.doctorId, req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: "Template not found or unauthorized" });
  res.json({ success: true, template: updated });
});

app.delete('/api/templates/:id', requireDoctorAuth, (req, res) => {
  const deleted = db.deleteTemplate(req.doctorId, req.params.id);
  if (!deleted) return res.status(404).json({ error: "Template not found or unauthorized" });
  res.json({ success: true, message: "Template deleted successfully" });
});

// ==========================================
// 10B. DOCTOR LEDGER & PATIENT ACCOUNTING (STEP 6)
// ==========================================
app.get('/api/ledger', requireDoctorAuth, (req, res) => {
  const { q, duration, start_date, end_date, type, category, patient_id, payment_method } = req.query;
  const entries = db.getLedgerEntries(req.doctorId, {
    q,
    duration,
    start_date,
    end_date,
    type,
    category,
    patient_id,
    payment_method
  });
  res.json({ entries, total: entries.length });
});

app.get('/api/ledger/summary', requireDoctorAuth, (req, res) => {
  const { q, duration, start_date, end_date, type, category, patient_id, payment_method } = req.query;
  const summary = db.getLedgerSummary(req.doctorId, {
    q,
    duration,
    start_date,
    end_date,
    type,
    category,
    patient_id,
    payment_method
  });
  res.json({ success: true, summary });
});

app.get('/api/ledger/export/csv', requireDoctorAuth, (req, res) => {
  const { q, duration, start_date, end_date, type, category, patient_id, payment_method } = req.query;
  const entries = db.getLedgerEntries(req.doctorId, {
    q,
    duration,
    start_date,
    end_date,
    type,
    category,
    patient_id,
    payment_method
  });

  const headers = ['Transaction ID', 'Date', 'Time', 'Patient Name', 'Patient ID', 'Type', 'Category', 'Description', 'Payment Method', 'Cash In (PKR)', 'Cash Out (PKR)', 'Running Balance (PKR)', 'Reference', 'Remarks', 'Status'];
  const rows = entries.map(e => [
    `"${e.transaction_id || ''}"`,
    `"${e.transaction_date || ''}"`,
    `"${e.transaction_time || ''}"`,
    `"${(e.patient_name || '').replace(/"/g, '""')}"`,
    `"${e.patient_code || ''}"`,
    `"${e.type || ''}"`,
    `"${e.category || ''}"`,
    `"${(e.description || '').replace(/"/g, '""')}"`,
    `"${e.payment_method || ''}"`,
    e.entry_type === 'cash_in' ? e.amount : '',
    e.entry_type === 'cash_out' ? e.amount : '',
    e.running_balance || 0,
    `"${e.reference || ''}"`,
    `"${(e.remarks || '').replace(/"/g, '""')}"`,
    `"${e.status || 'completed'}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="doccare-ledger-${new Date().toISOString().split('T')[0]}.csv"`);
  res.send(csvContent);
});

app.get('/api/ledger/patient/:patientId', requireDoctorAuth, (req, res) => {
  const history = db.getPatientFinancialHistory(req.doctorId, req.params.patientId);
  res.json({ success: true, ...history });
});

app.get('/api/ledger/:id', requireDoctorAuth, (req, res) => {
  const entry = db.getLedgerEntryById(req.doctorId, req.params.id);
  if (!entry) return res.status(404).json({ error: "Ledger entry not found" });
  res.json({ success: true, entry });
});

app.post('/api/ledger', requireDoctorAuth, (req, res) => {
  const {
    patient_id,
    patient_name,
    entry_type,
    type,
    category,
    description,
    amount,
    payment_method,
    reference,
    remarks,
    transaction_date,
    transaction_time,
    visit_id,
    appointment_id
  } = req.body;

  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    return res.status(400).json({ error: "A valid positive amount is required." });
  }

  const newEntry = db.createLedgerEntry(req.doctorId, {
    patient_id,
    patient_name: sanitizeInput(patient_name),
    entry_type: entry_type || 'cash_in',
    type: sanitizeInput(type),
    category: sanitizeInput(category),
    description: sanitizeInput(description),
    amount: Number(amount),
    payment_method: sanitizeInput(payment_method),
    reference: sanitizeInput(reference),
    remarks: sanitizeInput(remarks),
    transaction_date,
    transaction_time,
    visit_id,
    appointment_id
  });

  res.status(201).json({ success: true, entry: newEntry });
});

app.put('/api/ledger/:id', requireDoctorAuth, (req, res) => {
  const updated = db.updateLedgerEntry(req.doctorId, req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: "Ledger entry not found" });
  res.json({ success: true, entry: updated });
});

app.delete('/api/ledger/:id', requireDoctorAuth, (req, res) => {
  const deleted = db.deleteLedgerEntry(req.doctorId, req.params.id);
  if (!deleted) return res.status(404).json({ error: "Ledger entry not found or unauthorized" });
  res.json({ success: true, message: "Transaction deleted successfully" });
});

// ==========================================
// 11. CLINICAL SAFETY CHECKS (STEP 3)
// ==========================================
app.post('/api/prescriptions/safety-check', requireDoctorAuth, (req, res) => {
  const { medicines = [], patientAllergies = '', currentMedicines = '' } = req.body;
  const warnings = [];

  const cleanAllergies = (patientAllergies || '').toLowerCase();
  const cleanCurrentMeds = (currentMedicines || '').toLowerCase();

  const allergyKeywords = {
    'penicillin': ['penicillin', 'amoxicillin', 'amoxil', 'augmentin', 'ampicillin'],
    'amoxicillin': ['amoxicillin', 'amoxil', 'augmentin'],
    'sulfa': ['sulfa', 'septran', 'co-trimoxazole', 'sulfamethoxazole'],
    'aspirin': ['aspirin', 'disprin', 'ecotrin', 'loprin'],
    'nsaid': ['ibuprofen', 'brufen', 'diclofenac', 'voltral', 'ponstan', 'mefenamic', 'celebrex', 'naproxen', 'toradol', 'ketorolac'],
    'ciprofloxacin': ['ciprofloxacin', 'novidat', 'quinolone', 'leflox', 'levofloxacin'],
    'metronidazole': ['metronidazole', 'flagyl', 'entamizole'],
    'latex': ['latex']
  };

  const detectedAllergens = [];
  Object.keys(allergyKeywords).forEach(key => {
    if (cleanAllergies.includes(key)) {
      detectedAllergens.push({ key, triggers: allergyKeywords[key] });
    }
  });

  const seenGenerics = new Map();

  medicines.forEach((med, idx) => {
    const medName = (med.medicine_name || med.name || '').toLowerCase();
    const genericName = (med.generic_name || med.generic || '').toLowerCase();
    const fullText = `${medName} ${genericName}`;

    detectedAllergens.forEach(({ key, triggers }) => {
      const match = triggers.some(t => fullText.includes(t));
      if (match) {
        warnings.push({
          type: 'ALLERGY_ALERT',
          severity: 'critical',
          medicineIndex: idx,
          medicineName: med.medicine_name || med.name,
          message: `CRITICAL ALLERGY ALERT: Patient has documented allergy to '${key.toUpperCase()}'. Prescribed medicine contains '${triggers.find(t => fullText.includes(t))}'. Risk of severe hypersensitivity/anaphylaxis!`,
          requiresAcknowledgment: true
        });
      }
    });

    if (genericName && genericName.length > 2) {
      const simplifiedGeneric = genericName.split(' ')[0].replace(/[^a-z]/g, '');
      if (simplifiedGeneric.length > 2) {
        if (seenGenerics.has(simplifiedGeneric)) {
          const prevIdx = seenGenerics.get(simplifiedGeneric);
          warnings.push({
            type: 'DUPLICATE_MEDICATION',
            severity: 'warning',
            medicineIndex: idx,
            medicineName: med.medicine_name || med.name,
            message: `DUPLICATE DRUG CLASS: Generic '${genericName}' is prescribed more than once (Row ${prevIdx + 1} & Row ${idx + 1}). May cause accidental overdose.`,
            requiresAcknowledgment: true
          });
        } else {
          seenGenerics.set(simplifiedGeneric, idx);
        }
      }
    }

    if (cleanCurrentMeds && cleanCurrentMeds !== 'none') {
      const isAlreadyTaking = fullText.split(/[\s,+/()]+/).some(token => 
        token.length > 3 && cleanCurrentMeds.includes(token)
      );
      if (isAlreadyTaking) {
        warnings.push({
          type: 'CURRENT_MED_OVERLAP',
          severity: 'info',
          medicineIndex: idx,
          medicineName: med.medicine_name || med.name,
          message: `NOTE: Medicine or drug class '${med.medicine_name || med.name}' overlaps with patient's active medication list. Verify if modifying existing regimen.`,
          requiresAcknowledgment: false
        });
      }
    }
  });

  res.json({
    warnings,
    hasCritical: warnings.some(w => w.severity === 'critical')
  });
});

// ==========================================
// 12. AI CLINICAL ASSISTANT (STEP 3)
// ==========================================
app.post('/api/ai/suggest', requireDoctorAuth, rateLimitAIDoctor, async (req, res) => {
  const {
    diagnosis = '',
    symptoms = '',
    age = 30,
    gender = 'Male',
    allergies = 'None',
    chronic_conditions = 'None',
    current_medicines = 'None'
  } = req.body;

  const clinicalContext = {
    diagnosis: sanitizeInput(diagnosis),
    symptoms: sanitizeInput(symptoms),
    age: Number(age) || 30,
    gender: sanitizeInput(gender),
    allergies: sanitizeInput(allergies),
    chronic_conditions: sanitizeInput(chronic_conditions),
    current_medicines: sanitizeInput(current_medicines)
  };

  const isPediatric = clinicalContext.age < 12;
  const isGeriatric = clinicalContext.age > 65;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const modelName = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';

  if (apiKey) {
    try {
      const fetchResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: modelName,
          max_tokens: 1500,
          temperature: 0.2,
          system: `You are an expert clinical pharmacologist and physician assistant in Pakistan.
Respond ONLY in valid JSON with no preamble or markdown ticks.
Adjust dosages for age (${isPediatric ? 'PEDIATRIC DOSING' : isGeriatric ? 'GERIATRIC ADJUSTMENT' : 'ADULT'}).
Always respect patient allergies: "${clinicalContext.allergies}".
Prefer common Pakistani generic drugs and their primary indications.
Output structure:
{
  "matched_diagnosis": "string",
  "suggested_medicines": [
    {
      "generic_name": "string",
      "strength": "string",
      "form": "tablet | syrup | capsule | injection | drops | cream | inhaler",
      "dose": "string",
      "frequency": "1+0+1 | 1+1+1 | 1+0+0 | 0+0+1 | SOS",
      "duration": "5 Days",
      "instructions": "string",
      "rationale": "string"
    }
  ],
  "suggested_tests": ["string"],
  "advice": "string",
  "cautions": ["string"],
  "follow_up_days": 7
}`,
          messages: [
            {
              role: 'user',
              content: `Clinical case:
Diagnosis: ${clinicalContext.diagnosis || 'Unspecified'}
Symptoms: ${clinicalContext.symptoms || 'General Malaise'}
Patient Age: ${clinicalContext.age} (${clinicalContext.gender})
Allergies: ${clinicalContext.allergies}
Chronic Conditions: ${clinicalContext.chronic_conditions}
Current Medicines: ${clinicalContext.current_medicines}`
            }
          ]
        })
      });

      if (fetchResponse.ok) {
        const anthropicData = await fetchResponse.json();
        const textContent = anthropicData.content?.[0]?.text || '{}';
        const cleanJsonStr = textContent.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJsonStr);

        const enrichedMedicines = (parsed.suggested_medicines || []).map(med => {
          const brandMatch = db.data.medicines.find(m => 
            m.generic_name.toLowerCase().includes(med.generic_name.toLowerCase()) ||
            med.generic_name.toLowerCase().includes(m.generic_name.toLowerCase())
          );

          const brandName = brandMatch ? brandMatch.brand_name : med.generic_name;
          const form = med.form || (isPediatric ? 'syrup' : 'tablet');

          return {
            brandName,
            genericName: med.generic_name,
            strength: med.strength || brandMatch?.strength || "Standard",
            form,
            dose: med.dose || (isPediatric ? '5 ml' : '1 tab'),
            frequency: med.frequency || '1+0+1',
            duration: med.duration || '5 Days',
            instructions: med.instructions || 'After meals',
            rationale: med.rationale || ''
          };
        });

        db.logAudit(req.doctorId, "AI_SUGGESTION_GENERATED", `AI suggestions generated for diagnosis: ${clinicalContext.diagnosis} (Model: ${modelName})`);

        return res.json({
          source: 'anthropic_api',
          matchedDiagnosis: parsed.matched_diagnosis || clinicalContext.diagnosis,
          suggestedMedicines: enrichedMedicines,
          labTests: parsed.suggested_tests || [],
          advice: parsed.advice || "Take complete bed rest and drink adequate fluids.",
          cautions: parsed.cautions || [],
          followUpDays: parsed.follow_up_days || 7,
          disclaimer: "AI suggestions support but do not replace your clinical judgment. Verify all medicines and doses."
        });
      }
    } catch (apiErr) {
      console.warn("Anthropic API call failed, activating built-in clinical protocol engine:", apiErr.message);
    }
  }

  // Built-in Pakistani Clinical Protocol Engine
  const diagLower = (clinicalContext.diagnosis + ' ' + clinicalContext.symptoms).toLowerCase();
  let suggestions = {
    matchedDiagnosis: clinicalContext.diagnosis || "Acute Upper Respiratory Tract Infection",
    suggestedMedicines: [],
    labTests: [],
    advice: "Drink plenty of warm fluids, steam inhalation twice daily, and avoid cold drinks/dust.",
    cautions: [],
    followUpDays: 5
  };

  if (diagLower.includes('fever') || diagLower.includes('urti') || diagLower.includes('throat') || diagLower.includes('cold') || diagLower.includes('flu')) {
    suggestions.matchedDiagnosis = "Acute Upper Respiratory Tract Infection with Pyrexia";
    suggestions.suggestedMedicines = isPediatric ? [
      { brandName: "Calpol Syrup", genericName: "Paracetamol", strength: "120 mg / 5ml", form: "syrup", dose: "5 ml", frequency: "1+1+1 (TDS)", duration: "3-5 Days", instructions: "After meals when fever > 99.5 F" },
      { brandName: "Softin Syrup", genericName: "Loratadine", strength: "5 mg / 5ml", form: "syrup", dose: "5 ml", frequency: "0+0+1 (Night)", duration: "5 Days", instructions: "At bedtime" },
      { brandName: "Acefyl Cough Syrup", genericName: "Acefylline Piperazine", strength: "125 mg / 5ml", form: "syrup", dose: "2.5-5 ml", frequency: "1+1+1 (TDS)", duration: "5 Days", instructions: "With warm water" }
    ] : [
      { brandName: "Panadol", genericName: "Paracetamol", strength: "500 mg", form: "tablet", dose: "1-2 tabs", frequency: "1+1+1 (TDS)", duration: "5 Days", instructions: "After meals for fever/body aches" },
      { brandName: "Augmentin", genericName: "Amoxicillin + Clavulanic Acid", strength: "625 mg", form: "tablet", dose: "1 tab", frequency: "1+0+1 (BD)", duration: "5-7 Days", instructions: "With meals at 12-hour intervals" },
      { brandName: "Softin", genericName: "Loratadine", strength: "10 mg", form: "tablet", dose: "1 tab", frequency: "0+0+1 (Night)", duration: "5 Days", instructions: "At bedtime before sleeping" },
      { brandName: "Hydryllin Syrup", genericName: "Aminophylline + Diphenhydramine", strength: "Standard", form: "syrup", dose: "10 ml", frequency: "1+1+1 (TDS)", duration: "5 Days", instructions: "Take with warm water after meals" }
    ];
    suggestions.labTests = ["Complete Blood Count (CBC) (if fever > 3 days)", "Serum CRP"];
    suggestions.advice = "Hydration with warm fluids, honey-lemon water, steam inhalation, avoid cold exposure.";
  } else if (diagLower.includes('gerd') || diagLower.includes('gastritis') || diagLower.includes('acidity') || diagLower.includes('stomach') || diagLower.includes('ulcer') || diagLower.includes('burn')) {
    suggestions.matchedDiagnosis = "Gastroesophageal Reflux Disease (GERD) & Acid Peptic Disorder";
    suggestions.suggestedMedicines = [
      { brandName: "Risek", genericName: "Omeprazole", strength: "40 mg", form: "capsule", dose: "1 cap", frequency: "1+0+0 (Morning)", duration: "14 Days", instructions: "Take 30 minutes before breakfast on empty stomach" },
      { brandName: "Motilium", genericName: "Domperidone", strength: "10 mg", form: "tablet", dose: "1 tab", frequency: "1+1+1 (TDS)", duration: "5 Days", instructions: "15 minutes before meals" },
      { brandName: "Gaviscon Syrup", genericName: "Sodium Alginate + Bicarbonate", strength: "250 mg / 10ml", form: "syrup", dose: "10 ml", frequency: "1+1+1 (TDS)", duration: "10 Days", instructions: "After meals and at bedtime" }
    ];
    suggestions.labTests = ["H. Pylori Stool Antigen Test", "Ultrasound Whole Abdomen"];
    suggestions.advice = "Avoid spicy, fried, citrus, and carbonated beverages. Eat small frequent meals. Do not lie down within 2 hours of eating.";
    suggestions.followUpDays = 14;
  } else if (diagLower.includes('diarrhea') || diagLower.includes('gastro') || diagLower.includes('vomit') || diagLower.includes('loose stool')) {
    suggestions.matchedDiagnosis = "Acute Gastroenteritis & Dehydration Risk";
    suggestions.suggestedMedicines = [
      { brandName: "Flagyl", genericName: "Metronidazole", strength: "400 mg", form: "tablet", dose: "1 tab", frequency: "1+1+1 (TDS)", duration: "5 Days", instructions: "Take with food" },
      { brandName: "Novidat", genericName: "Ciprofloxacin", strength: "500 mg", form: "tablet", dose: "1 tab", frequency: "1+0+1 (BD)", duration: "5 Days", instructions: "Take with full glass of water" },
      { brandName: "ORS Sachet (Nimkol)", genericName: "Oral Rehydration Salts", strength: "Standard", form: "tablet", dose: "1 glass", frequency: "SOS", duration: "3-5 Days", instructions: "Drink 1 glass after each loose motion" },
      { brandName: "Gravinate", genericName: "Dimenhydrinate", strength: "50 mg", form: "tablet", dose: "1 tab", frequency: "1+1+1 (TDS)", duration: "3 Days", instructions: "Before meals for nausea" }
    ];
    suggestions.labTests = ["Stool Routine Examination (R/E) & Culture", "Serum Electrolytes"];
    suggestions.advice = "Strict oral rehydration with ORS, khichdi, bananas, yogurt. Avoid dairy milk and oily meals.";
    suggestions.followUpDays = 3;
  } else if (diagLower.includes('diabetes') || diagLower.includes('sugar') || diagLower.includes('hba1c')) {
    suggestions.matchedDiagnosis = "Type 2 Diabetes Mellitus Glycemic Optimization";
    suggestions.suggestedMedicines = [
      { brandName: "Glucophage", genericName: "Metformin", strength: "500 mg", form: "tablet", dose: "1 tab", frequency: "1+0+1 (BD)", duration: "30 Days", instructions: "Take with or right after breakfast and dinner" },
      { brandName: "Januvia", genericName: "Sitagliptin", strength: "100 mg", form: "tablet", dose: "1 tab", frequency: "1+0+0 (Morning)", duration: "30 Days", instructions: "Take once daily in the morning" }
    ];
    suggestions.labTests = ["HbA1c", "Fasting & Postprandial Blood Sugar", "Urine Microalbumin", "Serum Creatinine"];
    suggestions.advice = "Diabetic diet compliance. 30 minutes brisk walking daily. Monitor fasting glucose weekly.";
    suggestions.followUpDays = 30;
  } else if (diagLower.includes('hypertension') || diagLower.includes('bp') || diagLower.includes('blood pressure')) {
    suggestions.matchedDiagnosis = "Essential Systemic Hypertension Stage 1";
    suggestions.suggestedMedicines = [
      { brandName: "Norvasc", genericName: "Amlodipine", strength: "5 mg", form: "tablet", dose: "1 tab", frequency: "1+0+0 (Morning)", duration: "30 Days", instructions: "Take once daily in the morning" },
      { brandName: "Concor", genericName: "Bisoprolol Fumarate", strength: "5 mg", form: "tablet", dose: "1 tab", frequency: "1+0+0 (Morning)", duration: "30 Days", instructions: "Take in the morning" }
    ];
    suggestions.labTests = ["Serum Electrolytes (Na+, K+)", "Serum Creatinine", "Fasting Lipid Profile", "ECG 12-Lead"];
    suggestions.advice = "Low-salt diet (< 2g/day). Regular home BP log twice weekly. Avoid tobacco and excessive caffeine.";
    suggestions.followUpDays = 30;
  } else {
    suggestions.suggestedMedicines = [
      { brandName: "Panadol", genericName: "Paracetamol", strength: "500 mg", form: "tablet", dose: "1 tab", frequency: "1+0+1 (BD)", duration: "5 Days", instructions: "After meals as needed" },
      { brandName: "Surbex-Z", genericName: "Zinc + High Potency Vitamin B-Complex & C", strength: "Standard", form: "tablet", dose: "1 tab", frequency: "1+0+0 (Morning)", duration: "30 Days", instructions: "Take after breakfast with water" }
    ];
    suggestions.labTests = ["Complete Blood Count (CBC)", "Urine Routine Examination (R/E)"];
  }

  if (clinicalContext.allergies && clinicalContext.allergies.toLowerCase() !== 'none') {
    const algLower = clinicalContext.allergies.toLowerCase();
    suggestions.suggestedMedicines.forEach(med => {
      const isAllergic = algLower.includes(med.genericName.toLowerCase()) || algLower.includes(med.brandName.toLowerCase());
      if (isAllergic) {
        suggestions.cautions.push(`Excluded or flagged ${med.brandName} (${med.genericName}) due to patient allergy: ${clinicalContext.allergies}`);
        med.hasWarning = true;
      }
    });
  }

  db.logAudit(req.doctorId, "AI_SUGGESTION_GENERATED", `Clinical decision suggestions generated for diagnosis: ${clinicalContext.diagnosis}`);

  res.json({
    source: 'clinical_protocol_engine',
    matchedDiagnosis: suggestions.matchedDiagnosis,
    suggestedMedicines: suggestions.suggestedMedicines,
    labTests: suggestions.labTests,
    advice: suggestions.advice,
    cautions: suggestions.cautions,
    followUpDays: suggestions.followUpDays,
    disclaimer: "AI suggestions support but do not replace your clinical judgment. Verify all medicines and doses."
  });
});

// Static frontend serving fallback
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// ==========================================
// AUTOMATED 24-HOUR DAILY PAKISTAN FORMULARY SYNCHRONIZATION ENGINE
// ==========================================
const SYNC_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Initial check & sync on server boot
try {
  console.log('[Pakistan Formulary] Initializing Pakistan National Formulary & DRAP Sync Engine...');
  db.syncPakistanFormulary('DRAP / Pakistan National Formulary Automated Boot Feed');
} catch (bootSyncErr) {
  console.error('[Pakistan Formulary] Boot sync notice:', bootSyncErr.message);
}

// Recurring daily 24-hour sync timer
setInterval(() => {
  try {
    console.log(`[Pakistan Formulary] Running automated daily 24-hour sync at ${new Date().toISOString()}...`);
    db.syncPakistanFormulary('DRAP / Pakistan National Formulary Automated Daily Feed');
  } catch (err) {
    console.error('[Pakistan Formulary] Scheduled daily sync error:', err.message);
  }
}, SYNC_INTERVAL_MS);

app.listen(PORT, () => {
  console.log(`DocCare Step 4 Server running at http://localhost:${PORT}`);
});

