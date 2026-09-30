import puppeteer from 'puppeteer';
import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure PDFs directory exists
const pdfsDir = path.join(__dirname, '..', 'uploads', 'pdfs');
if (!fs.existsSync(pdfsDir)) {
  fs.mkdirSync(pdfsDir, { recursive: true });
}

// Load Brand Assets into Base64 for Offline Puppeteer Rendering
const brandDir = path.resolve(__dirname, '../../public/brand');
function getBase64Image(filename) {
  try {
    const fullPath = path.join(brandDir, filename);
    if (fs.existsSync(fullPath)) {
      const bitmap = fs.readFileSync(fullPath);
      return `data:image/png;base64,${bitmap.toString('base64')}`;
    }
  } catch (e) {
    console.error('Failed to load brand asset for PDF:', filename, e);
  }
  return '';
}

const doccareIconB64 = getBase64Image('doccare-icon.png');
const doccareWordmarkB64 = getBase64Image('doccare-wordmark.png');
const doccareHorizontalB64 = getBase64Image('doccare-logo-horizontal.png');
const doccareWatermarkB64 = getBase64Image('doccare-watermark.png');

/**
 * Mask patient name for privacy-safe verification (e.g. "Kamran Ali" -> "K*** A***")
 */
export function maskPatientName(name) {
  if (!name) return "P***";
  return name.split(' ').map(part => {
    if (!part) return '';
    return part[0].toUpperCase() + '***';
  }).join(' ');
}

/**
 * Generate server-side A4 Prescription PDF using Puppeteer
 */
export async function generatePrescriptionPDF({
  prescription,
  doctor,
  settings,
  baseUrl = 'http://localhost:5173'
}) {
  const isDraft = prescription.status === 'draft';
  const verificationToken = prescription.verification_token || `vtok_${Math.random().toString(36).substr(2, 10)}`;
  const verifyUrl = `${baseUrl}/verify/${verificationToken}`;

  // Generate QR Code as Data URL
  let qrDataUrl = '';
  try {
    qrDataUrl = await QRCode.toDataURL(verifyUrl, {
      width: 140,
      margin: 1,
      color: {
        dark: settings?.primary_color || '#009688',
        light: '#FFFFFF'
      }
    });
  } catch (err) {
    console.error("Error generating QR code for PDF:", err);
  }

  // Formatting & Settings Normalization
  const primaryColor = settings?.primary_color || '#009688';
  const secondaryColor = settings?.secondary_color || '#3898ec';
  const headerLayout = settings?.header_layout || 'left-logo'; // 'left-logo' | 'centered' | 'right-logo'
  const fontChoice = settings?.font || 'Helvetica';
  const language = settings?.language || 'en'; // 'en' | 'ur' | 'both'
  const isUrdu = language === 'ur' || language === 'both';
  const paperMargin = settings?.paper_margin || 'normal'; // 'normal' | 'wide'
  const showQR = settings?.show_qr !== false;
  const showPhoto = settings?.show_photo !== false;
  const footerCustomText = settings?.footer_text || doctor?.disclaimerText || 'This digital prescription is generated electronically and verified by the attending physician.';

  const patientName = prescription.patient?.name || prescription.patient_name || prescription.patientName || 'Patient Record';
  const patientAge = prescription.patient?.age || prescription.patient_age || prescription.patientAge || 30;
  const patientGender = prescription.patient?.gender || prescription.patient_gender || prescription.patientGender || 'Male';
  const patientPhone = prescription.patient?.phone || prescription.patient_phone || prescription.patientPhone || 'N/A';
  const patientAllergies = prescription.patient?.allergies || prescription.patient_allergies || prescription.patientAllergies || 'None';
  const rxNumber = prescription.prescription_no || prescription.rxNumber || 'RX-2026-00001';
  const rxDate = prescription.created_at ? new Date(prescription.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-GB');
  const followUpDate = prescription.follow_up_date || prescription.followUpDate || '';

  const items = prescription.items || prescription.medicines || [];
  let labTests = [];
  if (Array.isArray(prescription.labTests)) {
    labTests = prescription.labTests;
  } else if (typeof prescription.tests_advised === 'string' && prescription.tests_advised.trim()) {
    labTests = prescription.tests_advised.split(',').map(s => s.trim()).filter(Boolean);
  }

  // Build Doctor Header Content HTML
  const doctorPhotoImg = (showPhoto && doctor.profileImage) 
    ? `<img src="${doctor.profileImage}" class="doc-photo" alt="${doctor.name}" />` 
    : (settings?.logo_url ? `<img src="${settings.logo_url}" class="doc-logo" alt="Clinic Logo" />` : '');

  let headerContentHtml = '';
  if (headerLayout === 'centered') {
    headerContentHtml = `
      <div class="header-centered">
        ${doctorPhotoImg ? `<div class="center-photo">${doctorPhotoImg}</div>` : ''}
        <h1 class="doc-name" style="color: ${primaryColor}">${doctor.name}</h1>
        <p class="doc-qual">${doctor.qualifications}</p>
        <p class="doc-spec" style="color: ${secondaryColor}">${doctor.specialization}</p>
        <div class="meta-pills">
          <span class="pill">PMDC Reg #: <strong>${doctor.pmdcNumber || 'Verified'}</strong></span>
          <span class="pill">${doctor.experienceYears}+ Years Experience</span>
        </div>
        <div class="clinic-subline">
          <strong>${doctor.clinicName}</strong> • ${doctor.address}, ${doctor.city} • Tel: ${doctor.phone} ${doctor.email ? `• ${doctor.email}` : ''}
        </div>
      </div>
    `;
  } else if (headerLayout === 'right-logo') {
    headerContentHtml = `
      <div class="header-split">
        <div class="header-left">
          <h1 class="doc-name" style="color: ${primaryColor}">${doctor.name}</h1>
          <p class="doc-qual">${doctor.qualifications}</p>
          <p class="doc-spec" style="color: ${secondaryColor}">${doctor.specialization}</p>
          <div class="meta-pills">
            <span class="pill">PMDC #: <strong>${doctor.pmdcNumber || 'Verified'}</strong></span>
            <span class="pill">${doctor.experienceYears}+ Yrs Exp</span>
          </div>
        </div>
        <div class="header-right">
          ${doctorPhotoImg}
          <div class="clinic-box">
            <strong class="clinic-name">${doctor.clinicName}</strong>
            <p>${doctor.address}, ${doctor.city}</p>
            <p>Tel: ${doctor.phone}</p>
            ${doctor.email ? `<p>${doctor.email}</p>` : ''}
          </div>
        </div>
      </div>
    `;
  } else {
    // left-logo (Default)
    headerContentHtml = `
      <div class="header-split">
        <div class="header-left-with-logo">
          ${doctorPhotoImg}
          <div>
            <h1 class="doc-name" style="color: ${primaryColor}">${doctor.name}</h1>
            <p class="doc-qual">${doctor.qualifications}</p>
            <p class="doc-spec" style="color: ${secondaryColor}">${doctor.specialization}</p>
            <div class="meta-pills">
              <span class="pill">PMDC #: <strong>${doctor.pmdcNumber || 'Verified'}</strong></span>
              <span class="pill">${doctor.experienceYears}+ Yrs Exp</span>
            </div>
          </div>
        </div>
        <div class="header-right-clinic">
          <strong class="clinic-name">${doctor.clinicName}</strong>
          <p>${doctor.address}, ${doctor.city}</p>
          <p>Tel: ${doctor.phone}</p>
          ${doctor.email ? `<p>${doctor.email}</p>` : ''}
        </div>
      </div>
    `;
  }

  // HTML Template for Full Print-Ready A4 Document with DocCare Branding
  const html = `
<!DOCTYPE html>
<html lang="${language === 'ur' ? 'ur' : 'en'}">
<head>
  <meta charset="UTF-8">
  <title>${rxNumber}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Noto+Nastaliq+Urdu:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: ${paperMargin === 'wide' ? '18mm 14mm 18mm 14mm' : '10mm 12mm 12mm 12mm'};
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    body {
      font-family: ${fontChoice === 'Noto Nastaliq Urdu' ? "'Noto Nastaliq Urdu', 'Plus Jakarta Sans', sans-serif" : "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"};
      color: #1e293b;
      background: #ffffff;
      font-size: 11px;
      line-height: 1.45;
      position: relative;
      min-height: 100%;
    }

    .urdu-text {
      font-family: 'Noto Nastaliq Urdu', serif;
      direction: rtl;
      text-align: right;
      line-height: 1.9;
    }

    /* 5. Extremely subtle DocCare watermark in background */
    .doccare-watermark-bg {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-10deg);
      width: 440px;
      height: 440px;
      opacity: 0.04;
      pointer-events: none;
      z-index: 0;
    }

    /* Watermark for drafts */
    .draft-watermark {
      position: fixed;
      top: 38%;
      left: 10%;
      right: 10%;
      text-align: center;
      transform: rotate(-35deg);
      font-size: 64px;
      font-weight: 900;
      color: rgba(225, 29, 72, 0.12);
      letter-spacing: 10px;
      border: 5px dashed rgba(225, 29, 72, 0.15);
      padding: 16px 36px;
      border-radius: 20px;
      z-index: 1000;
      pointer-events: none;
      text-transform: uppercase;
    }

    /* Top Accent Banner */
    .top-color-bar {
      height: 6px;
      background: linear-gradient(90deg, #009688, #3898ec);
      border-radius: 3px;
      margin-bottom: 10px;
    }

    /* DocCare Brand Header Bar */
    .doccare-brand-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 8px;
      margin-bottom: 10px;
      border-bottom: 1px solid #e2e8f0;
      position: relative;
      z-index: 1;
    }

    .doccare-header-logo {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .doccare-header-icon {
      width: 28px;
      height: 28px;
      object-fit: contain;
    }

    .doccare-header-wordmark {
      height: 18px;
      object-fit: contain;
    }

    .doccare-header-tagline {
      font-size: 8.5px;
      font-weight: 600;
      color: #64748b;
      letter-spacing: -0.1px;
    }

    .doccare-header-rxid {
      text-align: right;
    }

    .doccare-header-rxid-label {
      font-size: 8.5px;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
    }

    .doccare-header-rxid-val {
      font-family: monospace;
      font-size: 11px;
      font-weight: 800;
      color: #0f766e;
    }

    /* Doctor Header Styles */
    .header-container {
      padding-bottom: 10px;
      border-bottom: 2px solid #f1f5f9;
      margin-bottom: 10px;
      position: relative;
      z-index: 1;
    }

    .doc-photo {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      object-fit: cover;
      box-shadow: 0 2px 5px rgba(0,0,0,0.06);
      border: 2px solid #f8fafc;
    }

    .doc-logo {
      max-height: 50px;
      max-width: 130px;
      object-fit: contain;
    }

    .doc-name {
      font-size: 17px;
      font-weight: 900;
      letter-spacing: -0.3px;
      line-height: 1.15;
    }

    .doc-qual {
      font-size: 10px;
      font-weight: 700;
      color: #334155;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      margin-top: 1px;
    }

    .doc-spec {
      font-size: 11px;
      font-weight: 600;
      margin-top: 1px;
    }

    .meta-pills {
      display: flex;
      gap: 6px;
      margin-top: 4px;
      flex-wrap: wrap;
    }

    .pill {
      font-size: 9px;
      background: #f0fdfa;
      color: #0f766e;
      border: 1px solid #ccfbf1;
      padding: 1.5px 6px;
      border-radius: 4px;
      font-family: monospace;
    }

    .header-split {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 14px;
    }

    .header-left-with-logo {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .header-right-clinic {
      text-align: right;
      font-size: 9.5px;
      color: #64748b;
      max-width: 240px;
      line-height: 1.35;
    }

    .clinic-name {
      font-size: 11px;
      font-weight: 800;
      color: #0f172a;
      display: block;
      margin-bottom: 2px;
      text-transform: uppercase;
    }

    .header-centered {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .center-photo {
      margin-bottom: 6px;
    }

    .clinic-subline {
      margin-top: 4px;
      font-size: 9.5px;
      color: #64748b;
    }

    /* Patient Bar */
    .patient-bar {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 9px;
      padding: 8px 11px;
      margin-bottom: 10px;
      display: grid;
      grid-template-columns: 2.2fr 1.2fr 1.5fr 1.5fr;
      gap: 8px;
      position: relative;
      z-index: 1;
    }

    .info-cell span {
      display: block;
      font-size: 8.5px;
      text-transform: uppercase;
      font-weight: 700;
      color: #94a3b8;
      letter-spacing: 0.4px;
    }

    .info-cell strong {
      font-size: 11px;
      color: #0f172a;
      font-weight: 800;
    }

    .allergy-tag {
      grid-column: 1 / -1;
      margin-top: 3px;
      padding-top: 3px;
      border-top: 1px dashed #cbd5e1;
      color: #b91c1c;
      font-weight: 700;
      font-size: 9.5px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    /* Diagnosis Section */
    .diagnosis-box {
      margin-bottom: 10px;
      padding: 7px 11px;
      border-radius: 7px;
      background: #f0fdfa;
      border-left: 3.5px solid ${primaryColor};
      position: relative;
      z-index: 1;
    }

    .diagnosis-label {
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      color: ${primaryColor};
      letter-spacing: 0.4px;
      margin-bottom: 1px;
    }

    .diagnosis-text {
      font-size: 11.5px;
      font-weight: 800;
      color: #0f172a;
    }

    .symptoms-text {
      font-size: 10px;
      color: #475569;
      margin-top: 2px;
    }

    /* Rx Table */
    .rx-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 5px;
      position: relative;
      z-index: 1;
    }

    .rx-title-box {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .section-doccare-icon {
      width: 14px;
      height: 14px;
      object-fit: contain;
    }

    .rx-symbol {
      font-size: 18px;
      font-weight: 900;
      font-family: serif;
      color: ${primaryColor};
      line-height: 1;
    }

    .rx-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
      position: relative;
      z-index: 1;
      page-break-inside: auto;
    }

    .rx-table th {
      background: #f1f5f9;
      color: #475569;
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      padding: 6px 7px;
      border-top: 1px solid #cbd5e1;
      border-bottom: 1px solid #cbd5e1;
      text-align: left;
    }

    .rx-table td {
      padding: 7px 7px;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: top;
      font-size: 10px;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .rx-table tr:nth-child(even) {
      background: #fafafa;
    }

    .med-name {
      font-size: 11px;
      font-weight: 800;
      color: #0f172a;
      display: block;
    }

    .med-generic {
      font-size: 9px;
      color: #64748b;
      font-style: italic;
      display: block;
    }

    .med-form {
      font-size: 8.5px;
      font-weight: 700;
      color: ${primaryColor};
      text-transform: uppercase;
    }

    .med-freq {
      font-weight: 800;
      color: ${primaryColor};
    }

    /* Clinical Details Grid (Tests & Advice) */
    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1.2fr;
      gap: 10px;
      margin-bottom: 12px;
      position: relative;
      z-index: 1;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .card-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 8px 10px;
    }

    .card-title {
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      color: #475569;
      margin-bottom: 5px;
      letter-spacing: 0.4px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .test-list {
      list-style-type: square;
      padding-left: 12px;
      font-size: 9.5px;
      color: #334155;
    }

    .test-list li {
      margin-bottom: 2px;
    }

    .advice-text {
      font-size: 10px;
      color: #334155;
      line-height: 1.4;
    }

    .follow-up-pill {
      margin-top: 6px;
      padding-top: 5px;
      border-top: 1px dashed #cbd5e1;
      font-weight: 800;
      color: ${primaryColor};
      font-size: 9.5px;
    }

    /* Bilingual Get Well Wish */
    .well-wish {
      text-align: center;
      padding: 5px;
      background: #f0fdf4;
      border-radius: 6px;
      border: 1px solid #bbf7d0;
      color: #166534;
      font-size: 9.5px;
      font-weight: 700;
      margin-bottom: 10px;
      display: flex;
      justify-content: center;
      gap: 14px;
      align-items: center;
      position: relative;
      z-index: 1;
    }

    /* Footer Section */
    .footer-section {
      margin-top: auto;
      padding-top: 8px;
      border-top: 2px solid #f1f5f9;
      position: relative;
      z-index: 1;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .footer-split {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 14px;
      margin-bottom: 6px;
    }

    .qr-container {
      display: flex;
      align-items: center;
      gap: 7px;
    }

    .qr-img {
      width: 52px;
      height: 52px;
      border: 1px solid #e2e8f0;
      padding: 2px;
      border-radius: 5px;
      background: #fff;
    }

    .qr-meta {
      font-size: 8px;
      color: #64748b;
      line-height: 1.25;
    }

    .qr-meta strong {
      color: #0f172a;
      display: block;
      font-size: 8.5px;
      text-transform: uppercase;
    }

    .signatures-block {
      display: flex;
      align-items: flex-end;
      gap: 14px;
    }

    .stamp-img {
      height: 56px;
      object-fit: contain;
      opacity: 0.85;
      transform: rotate(-3deg);
    }

    .signature-box {
      text-align: center;
      min-width: 120px;
      border-bottom: 1.5px solid #94a3b8;
      padding-bottom: 2px;
    }

    .sig-img {
      height: 34px;
      max-width: 120px;
      object-fit: contain;
      margin: 0 auto;
      display: block;
    }

    .sig-text {
      font-family: serif;
      font-style: italic;
      font-size: 13px;
      color: #334155;
      line-height: 34px;
    }

    .sig-title {
      font-size: 8px;
      font-weight: 800;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      margin-top: 2px;
    }

    /* 4. Professional Powered by DocCare Footer Bar */
    .doccare-footer-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #f8fafc;
      padding: 4px 8px;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
      font-size: 8px;
      color: #64748b;
      margin-top: 4px;
    }

    .doccare-footer-powered {
      display: flex;
      align-items: center;
      gap: 4px;
      font-weight: 700;
      color: #334155;
    }

    .doccare-footer-icon {
      height: 12px;
      object-fit: contain;
    }

    .doccare-footer-wordmark {
      height: 10px;
      object-fit: contain;
    }
  </style>
</head>
<body>

  <!-- 5. Watermark Background -->
  ${doccareWatermarkB64 ? `<img src="${doccareWatermarkB64}" class="doccare-watermark-bg" alt="" />` : ''}

  ${isDraft ? `<div class="draft-watermark">DRAFT PREVIEW</div>` : ''}

  <!-- Color Band -->
  <div class="top-color-bar"></div>

  <!-- 4. PDF Header Prominent DocCare Branding -->
  <div class="doccare-brand-bar">
    <div class="doccare-header-logo">
      ${doccareIconB64 ? `<img src="${doccareIconB64}" class="doccare-header-icon" alt="DocCare" />` : ''}
      <div>
        ${doccareWordmarkB64 ? `<img src="${doccareWordmarkB64}" class="doccare-header-wordmark" alt="DocCare" />` : '<strong style="color: #009688; font-size: 14px;">DocCare</strong>'}
        <div class="doccare-header-tagline">Your Practice. Your Patients. One Simple Record.</div>
      </div>
    </div>
    <div class="doccare-header-rxid">
      <div class="doccare-header-rxid-label">Digital Medical Record</div>
      <div class="doccare-header-rxid-val">${rxNumber}</div>
    </div>
  </div>

  <!-- DOCTOR HEADER -->
  <div class="header-container">
    ${headerContentHtml}
  </div>

  <!-- PATIENT DEMOGRAPHICS -->
  <div class="patient-bar">
    <div class="info-cell">
      <span>Patient Name</span>
      <strong>${patientName}</strong>
    </div>
    <div class="info-cell">
      <span>Age / Gender</span>
      <strong>${patientAge} Yrs / ${patientGender}</strong>
    </div>
    <div class="info-cell">
      <span>Date / Prescription ID</span>
      <strong>${rxDate}</strong>
      <div style="font-family: monospace; font-size: 9px; color: ${primaryColor}; font-weight: 700;">${rxNumber}</div>
    </div>
    <div class="info-cell">
      <span>Contact</span>
      <strong style="font-family: monospace;">${patientPhone}</strong>
    </div>

    ${patientAllergies && patientAllergies.toLowerCase() !== 'none' ? `
      <div class="allergy-tag">
        ⚠️ <strong>Known Drug Allergies:</strong> ${patientAllergies}
      </div>
    ` : ''}
  </div>

  <!-- CLINICAL DIAGNOSIS -->
  ${prescription.diagnosis ? `
    <div class="diagnosis-box">
      <div class="diagnosis-label">Clinical Diagnosis:</div>
      <div class="diagnosis-text">${prescription.diagnosis}</div>
      ${prescription.symptoms ? `<div class="symptoms-text"><strong>Complaints:</strong> ${prescription.symptoms}</div>` : ''}
    </div>
  ` : ''}

  <!-- MEDICATIONS TABLE -->
  <div class="rx-header">
    <div class="rx-title-box">
      ${doccareIconB64 ? `<img src="${doccareIconB64}" class="section-doccare-icon" alt="" />` : ''}
      <span class="rx-symbol">℞</span>
      <strong style="font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.4px; color: #334155;">Prescribed Medications</strong>
    </div>
    <span style="font-size: 8.5px; color: #94a3b8;">Take strictly as prescribed</span>
  </div>

  <table class="rx-table">
    <thead>
      <tr>
        <th style="width: 22px;">#</th>
        <th>Medicine & Generic</th>
        <th style="width: 75px;">Strength / Form</th>
        <th style="width: 70px;">Dose</th>
        <th style="width: 85px;">Frequency</th>
        <th style="width: 60px;">Duration</th>
        <th>Instructions</th>
      </tr>
    </thead>
    <tbody>
      ${items.map((med, idx) => `
        <tr>
          <td style="color: #94a3b8; font-weight: 700;">${idx + 1}</td>
          <td>
            <span class="med-name">${med.medicine_name || med.name}</span>
            ${(med.generic_name || med.generic) ? `<span class="med-generic">${med.generic_name || med.generic}</span>` : ''}
          </td>
          <td>
            <span class="med-form">${med.form || 'tablet'}</span>
            <div style="font-size: 9.5px; font-weight: 600; color: #475569;">${med.strength || ''}</div>
          </td>
          <td style="font-weight: 700;">${med.dose || '1 tab'}</td>
          <td class="med-freq">${med.frequency || '1+0+1'}</td>
          <td style="font-weight: 600;">${med.duration || '5 Days'}</td>
          <td style="color: #475569;">${med.instructions || 'After meals'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <!-- TESTS & ADVICE GRID -->
  <div class="details-grid">
    <div class="card-box">
      <div class="card-title">
        ${doccareIconB64 ? `<img src="${doccareIconB64}" class="section-doccare-icon" alt="" />` : ''}
        🔬 Diagnostic Tests Advised
      </div>
      ${labTests.length > 0 ? `
        <ul class="test-list">
          ${labTests.map(t => `<li>${t}</li>`).join('')}
        </ul>
      ` : `
        <p style="color: #94a3b8; font-style: italic; font-size: 9.5px;">No diagnostic tests required at this stage.</p>
      `}
    </div>

    <div class="card-box">
      <div class="card-title">
        ${doccareIconB64 ? `<img src="${doccareIconB64}" class="section-doccare-icon" alt="" />` : ''}
        💡 Advice & Dietary Instructions
      </div>
      <p class="advice-text">${prescription.advice || 'Drink plenty of water, get adequate rest, and complete prescribed courses.'}</p>
      ${followUpDate ? `
        <div class="follow-up-pill">
          📅 Next Follow-up Date: ${new Date(followUpDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
        </div>
      ` : ''}
    </div>
  </div>

  <!-- BILINGUAL GET WELL WISH -->
  <div class="well-wish">
    <span>Wishing you a rapid & complete recovery!</span>
    <span class="urdu-text" style="font-size: 11px; font-weight: 700;">اللہ تعالیٰ آپ کو مکمل صحت و تندرستی عطا فرمائے</span>
  </div>

  <!-- FOOTER -->
  <div class="footer-section">
    <div class="footer-split">
      <!-- QR Verification -->
      ${showQR && qrDataUrl ? `
        <div class="qr-container">
          <img src="${qrDataUrl}" class="qr-img" alt="Verification QR" />
          <div class="qr-meta">
            <strong>Scan to Verify Rx</strong>
            <span>Digital Token: ${verificationToken.slice(0, 12)}...</span>
            <span style="display: block; color: ${primaryColor}; font-weight: 700;">${baseUrl}/verify</span>
          </div>
        </div>
      ` : '<div></div>'}

      <!-- Signature & Stamp -->
      <div class="signatures-block">
        ${doctor.stampImage ? `
          <img src="${doctor.stampImage}" class="stamp-img" alt="Official Seal" />
        ` : ''}

        <div class="signature-box">
          ${doctor.signatureImage ? `
            <img src="${doctor.signatureImage}" class="sig-img" alt="Doctor Signature" />
          ` : `
            <div class="sig-text">${doctor.name}</div>
          `}
          <div class="sig-title">Attending Physician</div>
        </div>
      </div>
    </div>

    <!-- 4. Footer Branding: Powered by DocCare -->
    <div class="doccare-footer-bar">
      <div>
        ${footerCustomText} • Verified under Pakistan PMDC standards.
      </div>
      <div class="doccare-footer-powered">
        <span>Powered by</span>
        ${doccareIconB64 ? `<img src="${doccareIconB64}" class="doccare-footer-icon" alt="" />` : ''}
        ${doccareWordmarkB64 ? `<img src="${doccareWordmarkB64}" class="doccare-footer-wordmark" alt="DocCare" />` : '<span>DocCare</span>'}
      </div>
    </div>
  </div>

</body>
</html>
  `;

  // Launch Puppeteer and render PDF buffer
  let browser = null;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--font-render-hinting=none'
      ]
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfFileName = `prescription_${rxNumber.replace(/[^a-zA-Z0-9_-]/g, '_')}_${Date.now()}.pdf`;
    const pdfFilePath = path.join(pdfsDir, pdfFileName);

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: false,
      margin: {
        top: '0mm',
        bottom: '0mm',
        left: '0mm',
        right: '0mm'
      }
    });

    // Write to disk
    fs.writeFileSync(pdfFilePath, pdfBuffer);

    return {
      success: true,
      fileName: pdfFileName,
      filePath: pdfFilePath,
      pdfUrl: `/api/prescriptions/${prescription.id}/pdf`,
      verificationToken,
      buffer: pdfBuffer
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
