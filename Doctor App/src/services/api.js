// API Client for DocCare (Dual-Role Authentication, Doctor Practice & Patient Portal)

const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const currentDoctorId = localStorage.getItem('doccare_active_doctor_id') || 'doc-1';
  const token = localStorage.getItem('doccare_auth_token');
  
  const headers = {
    'Content-Type': 'application/json',
    'x-doctor-id': currentDoctorId,
    ...(token ? { 'Authorization': `Bearer ${token}`, 'x-auth-token': token } : {}),
    ...(options.headers || {})
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const err = new Error(data.error || `HTTP error! status: ${res.status}`);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (err) {
    console.warn(`API Request failed for ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  // --- DUAL-ROLE AUTHENTICATION (DOCTOR & PATIENT) ---
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  googleAuth: (data) => request('/auth/google', { method: 'POST', body: JSON.stringify(data) }),
  forgotPassword: (data) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify(data) }),
  resetPassword: (data) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request('/auth/me'),
  logout: () => request('/auth/logout', { method: 'POST' }),

  // --- PATIENT PORTAL (ROLE: PATIENT) ---
  getPatientDashboard: () => request('/patient/dashboard-data'),
  cancelPatientAppointment: (id, reason) => request(`/patient/appointments/${id}/cancel`, { method: 'PATCH', body: JSON.stringify({ reason }) }),
  updatePatientProfile: (data) => request('/patient/profile', { method: 'PUT', body: JSON.stringify(data) }),

  // --- DOCTOR PROFILES & PRACTICE (STEP 1) ---
  getDoctors: () => request('/doctors'),
  getDoctor: (id) => request(`/doctors/${id}`),
  updateDoctor: (id, data) => request(`/doctors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  
  // --- PUBLIC BOOKING (STEP 2) ---
  getPublicDoctor: (slugOrId) => request(`/public/doctors/${slugOrId}`),
  getAvailableSlots: (slugOrId, date) => request(`/public/doctors/${slugOrId}/available-slots?date=${encodeURIComponent(date)}`),
  bookPublicAppointment: (data) => request('/public/appointments/book', { method: 'POST', body: JSON.stringify(data) }),

  // --- DOCTOR DASHBOARD & APPOINTMENTS (STEP 2) ---
  getAppointments: (tab = 'today', q = '') => {
    let url = `/appointments?tab=${encodeURIComponent(tab)}`;
    if (q) url += `&q=${encodeURIComponent(q)}`;
    return request(url);
  },
  getAppointmentCounts: () => request('/appointments/counts'),
  createManualAppointment: (data) => request('/appointments/manual', { method: 'POST', body: JSON.stringify(data) }),
  updateAppointmentStatus: (id, status, notes = null) => request(`/appointments/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, notes }) }),
  rescheduleAppointment: (id, date, start_time, end_time = null) => request(`/appointments/${id}/reschedule`, { method: 'POST', body: JSON.stringify({ date, start_time, end_time }) }),

  // --- PATIENTS & HEALTH TIMELINES (STEP 2 & 3) ---
  getPatients: (q = '') => request(`/patients${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  getPatientDetail: (id) => request(`/patients/${id}`),
  updatePatient: (id, data) => request(`/patients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // --- PAKISTAN FORMULARY & MEDICINE DATABASE (CONTINUOUS LIVE UPDATE) ---
  getMedicines: (params = {}) => {
    if (typeof params === 'string') {
      return request(`/medicines?limit=50&q=${encodeURIComponent(params)}`);
    }
    const query = new URLSearchParams(params).toString();
    return request(`/medicines${query ? `?${query}` : ''}`);
  },
  searchMedicines: (q = '', options = {}) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (options.limit) params.set('limit', options.limit);
    if (options.form || options.dosage_form) params.set('form', options.form || options.dosage_form);
    if (options.route) params.set('route', options.route);
    if (options.category || options.therapeutic_class) params.set('category', options.category || options.therapeutic_class);
    if (options.manufacturer) params.set('manufacturer', options.manufacturer);
    if (options.status) params.set('status', options.status);
    return request(`/medicines/search?${params.toString()}`);
  },
  getMedicinesMeta: () => request('/medicines/meta'),
  getFormularySyncStatus: () => request('/medicines/sync-status'),
  getMedicineById: (id) => request(`/medicines/${id}`),
  addMedicine: (data) => request('/medicines', { method: 'POST', body: JSON.stringify(data) }),
  createCustomMedicine: (data) => request('/medicines', { method: 'POST', body: JSON.stringify(data) }),
  updateMedicine: (id, data) => request(`/medicines/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  toggleMedicineStatus: (id, status) => request(`/medicines/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  deleteMedicine: (id) => request(`/medicines/${id}`, { method: 'DELETE' }),
  syncPakistanFormulary: (source = null, incomingData = null) => request('/medicines/sync', { method: 'POST', body: JSON.stringify({ source, incomingData }) }),
  getMedicineSyncLogs: (limit = 30) => request(`/medicines/sync-logs?limit=${limit}`),
  importMedicines: (medicines, source = null) => request('/medicines/import', { method: 'POST', body: JSON.stringify({ medicines, source }) }),
  getExportMedicinesUrl: () => '/api/medicines/export',
  getFavoriteMedicines: () => request('/medicines/favorites'),
  toggleFavoriteMedicine: (medicine_id) => request('/medicines/favorites/toggle', { method: 'POST', body: JSON.stringify({ medicine_id }) }),

  // --- PRESCRIPTIONS CRUD & LIFECYCLE (STEP 3 & 4) ---
  getPrescriptions: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/prescriptions${query ? `?${query}` : ''}`);
  },
  getPrescription: (id) => request(`/prescriptions/${id}`),
  savePrescriptionDraft: (data) => request('/prescriptions', { method: 'POST', body: JSON.stringify(data) }),
  finalizePrescription: (id, data = {}) => request(`/prescriptions/${id}/finalize`, { method: 'POST', body: JSON.stringify(data) }),
  duplicatePrescription: (id) => request(`/prescriptions/${id}/duplicate`, { method: 'POST' }),
  logPrescriptionAuditEvent: (id, event, details = '') => request(`/prescriptions/${id}/audit-event`, { method: 'POST', body: JSON.stringify({ event, details }) }),

  // --- PATIENT PORTAL (ROLE: PATIENT ONLY) ---
  getPatientDashboard: () => request('/patient/dashboard-data'),
  getPatientPrescriptions: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/patient/prescriptions${query ? `?${query}` : ''}`);
  },
  getPatientPrescription: (id) => request(`/patient/prescriptions/${id}`),
  logPatientPrescriptionAuditEvent: (id, event, details = '') => request(`/patient/prescriptions/${id}/audit-event`, { method: 'POST', body: JSON.stringify({ event, details }) }),
  cancelPatientAppointment: (id, reason) => request(`/patient/appointments/${id}/cancel`, { method: 'PATCH', body: JSON.stringify({ reason }) }),
  updatePatientProfile: (data) => request('/patient/profile', { method: 'PUT', body: JSON.stringify(data) }),

  // --- PRESCRIPTION TEMPLATES (STEP 3) ---
  getTemplates: () => request('/templates'),
  createTemplate: (data) => request('/templates', { method: 'POST', body: JSON.stringify(data) }),
  updateTemplate: (id, data) => request(`/templates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTemplate: (id) => request(`/templates/${id}`, { method: 'DELETE' }),

  // --- CLINICAL SAFETY CHECKS & AI SUGGEST (STEP 3) ---
  checkPrescriptionSafety: (data) => request('/prescriptions/safety-check', { method: 'POST', body: JSON.stringify(data) }),
  getAISuggestions: (data) => request('/ai/suggest', { method: 'POST', body: JSON.stringify(data) }),

  // --- STEP 4: DOCTOR PDF SETTINGS & SERVER-SIDE PDFS ---
  getPdfSettings: () => request('/pdf-settings'),
  updatePdfSettings: (data) => request('/pdf-settings', { method: 'PUT', body: JSON.stringify(data) }),
  resetPdfSettings: () => request('/pdf-settings/reset', { method: 'POST' }),
  generatePrescriptionPDF: (id) => request(`/prescriptions/${id}/generate-pdf`, { method: 'POST' }),
  getPrescriptionPdfUrl: (id, download = false) => `/api/prescriptions/${id}/pdf${download ? '?download=true' : ''}`,

  // --- STEP 4: PUBLIC VERIFICATION ---
  verifyPublicPrescription: (token) => request(`/public/verify/${token}`),

  // --- STEP 5: PRESCRIPTION SHARES & EXPIRING SECURE LINKS ---
  createPrescriptionShare: (prescriptionId, data = {}) => request(`/prescriptions/${prescriptionId}/share`, { method: 'POST', body: JSON.stringify(data) }),
  getPrescriptionShares: (prescriptionId) => request(`/prescriptions/${prescriptionId}/shares`),
  revokePrescriptionShare: (shareId) => request(`/shares/${shareId}/revoke`, { method: 'POST' }),

  // --- STEP 5: PUBLIC SECURE RX VIEWER ---
  getPublicRxInfo: (token) => request(`/public/rx-info/${token}`),
  getPublicRxPdfUrl: (token, download = false) => `/api/public/rx/${token}${download ? '?download=true' : ''}`,

  // --- STEP 5: WHATSAPP SEND & CONFIG ---
  getWhatsAppConfig: () => request('/whatsapp/config'),
  sendWhatsAppLink: (data) => request('/whatsapp/send-link', { method: 'POST', body: JSON.stringify(data) }),
  sendWhatsAppCloud: (data) => request('/whatsapp/send-cloud', { method: 'POST', body: JSON.stringify(data) }),
  updateDoctorWhatsAppSettings: (data) => request('/doctor/whatsapp-settings', { method: 'PUT', body: JSON.stringify(data) }),

  // --- STEP 5: MESSAGES LOGS & AUDIT ---
  getMessageLogs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/messages${query ? `?${query}` : ''}`);
  },
  getMessageStats: () => request('/messages/stats'),

  // --- TWO-SIDED PLATFORM: PUBLIC PATIENT DISCOVERY & TRACKING ---
  getPublicDoctors: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/public/doctors${query ? `?${query}` : ''}`);
  },
  getPublicSpecialties: () => request('/public/specialties'),
  getPublicCities: () => request('/public/cities'),
  getPublicAppointmentStatus: (appointmentId) => request(`/public/appointments/${appointmentId}`),

  // --- TWO-SIDED PLATFORM: DOCTOR WORKSPACE & ANALYTICS ---
  getDoctorDashboardStats: () => request('/doctor/dashboard-stats'),
  getDoctorReportsAnalytics: () => request('/doctor/reports/analytics'),
  getDoctorPublicSettings: () => request('/doctor/public-settings'),
  updateDoctorPublicSettings: (data) => request('/doctor/public-settings', { method: 'PUT', body: JSON.stringify(data) }),

  // --- STEP 6: DOCTOR LEDGER & PATIENT ACCOUNTING ---
  getLedgerEntries: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/ledger${query ? `?${query}` : ''}`);
  },
  getLedgerSummary: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/ledger/summary${query ? `?${query}` : ''}`);
  },
  getLedgerEntry: (id) => request(`/ledger/${id}`),
  createLedgerEntry: (data) => request('/ledger', { method: 'POST', body: JSON.stringify(data) }),
  updateLedgerEntry: (id, data) => request(`/ledger/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteLedgerEntry: (id) => request(`/ledger/${id}`, { method: 'DELETE' }),
  getPatientFinancialHistory: (patientId) => request(`/ledger/patient/${patientId}`),
  getLedgerCsvUrl: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return `/api/ledger/export/csv${query ? `?${query}` : ''}`;
  }
};

