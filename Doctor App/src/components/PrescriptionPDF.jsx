import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Stethoscope, HeartPulse, Activity, AlertTriangle, Calendar, Phone, Mail, MapPin } from 'lucide-react';
import DocCareLogo from './DocCareLogo';

export default function PrescriptionPDF({
  prescription,
  doctor,
  headerColor = '#0f766e',
  accentColor = '#0284c7',
  showStamp = true,
  showSignature = true,
  qrUrl = ''
}) {
  if (!prescription) return null;

  // Normalized Patient and Doctor fields
  const doc = doctor || prescription.doctor || {
    name: "Dr. Ayesha Siddiqui",
    qualifications: "MBBS, FCPS",
    specialization: "Consultant Physician",
    pmdcNumber: "49821-P",
    experienceYears: 12,
    clinicName: "Shifa Executive Clinic",
    address: "Gulberg III",
    city: "Lahore",
    phone: "+92 300 8472910"
  };

  const patient = prescription.patient || {
    name: prescription.patientName || prescription.patient_name || "Patient Record",
    age: prescription.patientAge || prescription.patient_age || 30,
    gender: prescription.patientGender || prescription.patient_gender || "Male",
    phone: prescription.patientPhone || prescription.patient_phone || "N/A",
    allergies: prescription.patientAllergies || prescription.patient_allergies || "None"
  };

  const rxNumber = prescription.prescription_no || prescription.rxNumber || 'RX-LIVE';
  const rxDate = prescription.created_at ? new Date(prescription.created_at).toLocaleDateString() : (prescription.date || new Date().toISOString().split('T')[0]);
  const followUp = prescription.follow_up_date || prescription.followUpDate || '';

  // Normalized items
  const medItems = prescription.items || prescription.medicines || [];

  // Normalized Lab tests
  let labList = [];
  if (Array.isArray(prescription.labTests)) {
    labList = prescription.labTests;
  } else if (typeof prescription.tests_advised === 'string' && prescription.tests_advised.trim()) {
    labList = prescription.tests_advised.split(',').map(s => s.trim()).filter(Boolean);
  }

  const verifyUrl = qrUrl || `${window.location.origin}/verify/${prescription.id || prescription.verifyToken || 'rx-sample'}`;

  return (
    <div
      id="printable-prescription"
      className="bg-white text-slate-800 p-8 sm:p-10 max-w-[850px] mx-auto min-h-[1120px] relative flex flex-col justify-between shadow-2xl border border-slate-200 print:border-none print:shadow-none font-prescription overflow-hidden"
      style={{
        boxSizing: 'border-box',
        backgroundColor: '#ffffff'
      }}
    >
      {/* 5. Extremely Subtle DocCare Watermark in Document Background */}
      <div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden"
        style={{ opacity: 0.035 }}
      >
        <img
          src="/brand/doccare-watermark.png"
          alt="DocCare Watermark"
          className="w-[480px] h-[480px] object-contain transform -rotate-12"
        />
      </div>

      {/* Top Brand Accent Bar */}
      <div 
        className="h-2 w-full rounded-t-sm mb-5 relative z-10"
        style={{ 
          background: `linear-gradient(90deg, ${headerColor || '#009688'}, #3898ec)` 
        }}
      />

      {/* 4. PDF HEADER WITH PROMINENT DOCCARE BRANDING */}
      <div className="relative z-10">
        
        {/* Top DocCare Brand Bar */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <DocCareLogo variant="horizontal" size="sm" showTagline={true} />
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Digital Medical Record
            </span>
            <span className="font-mono text-xs font-bold text-teal-700">
              {rxNumber}
            </span>
          </div>
        </div>

        {/* Doctor & Clinic Identity Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start pb-5 border-b-2 border-slate-100 gap-4">
          {/* Doctor Info */}
          <div className="flex items-start gap-4">
            {doc.profileImage && (
              <img
                src={doc.profileImage}
                alt={doc.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-slate-100 shadow-sm shrink-0"
              />
            )}
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900" style={{ color: headerColor }}>
                {doc.name}
              </h1>
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wide mt-0.5">
                {doc.qualifications}
              </p>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-0.5">
                {doc.specialization}
              </p>
              <div className="flex items-center gap-2 sm:gap-3 mt-1.5 text-[11px] text-slate-500 flex-wrap">
                <span className="font-mono font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200/60">
                  PMDC Reg #: {doc.pmdcNumber || 'Verified'}
                </span>
                {doc.experienceYears && <span className="font-medium text-slate-600">• {doc.experienceYears}+ Yrs Experience</span>}
              </div>
            </div>
          </div>

          {/* Clinic Details */}
          <div className="sm:text-right text-xs text-slate-600 space-y-1 sm:max-w-[280px]">
            <div className="text-sm font-black text-slate-900 uppercase tracking-tight">
              {doc.clinicName}
            </div>
            <div className="flex items-center sm:justify-end gap-1.5 text-slate-500">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-teal-600" style={{ color: headerColor }} />
              <span>{doc.address}, {doc.city}</span>
            </div>
            <div className="flex items-center sm:justify-end gap-1.5 text-slate-500">
              <Phone className="w-3.5 h-3.5 shrink-0 text-teal-600" style={{ color: headerColor }} />
              <span>{doc.phone}</span>
            </div>
            {doc.email && (
              <div className="flex items-center sm:justify-end gap-1.5 text-slate-500">
                <Mail className="w-3.5 h-3.5 shrink-0 text-teal-600" style={{ color: headerColor }} />
                <span>{doc.email}</span>
              </div>
            )}
          </div>
        </div>

        {/* PATIENT DEMOGRAPHICS & VITALS BAR */}
        <div className="my-4 p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/80 text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-2.5 gap-x-4">
            <div>
              <span className="text-slate-400 font-medium block uppercase text-[10px]">Patient Name</span>
              <strong className="text-sm font-bold text-slate-900">{patient.name}</strong>
            </div>
            <div>
              <span className="text-slate-400 font-medium block uppercase text-[10px]">Age / Gender</span>
              <span className="font-semibold text-slate-800">{patient.age} Yrs / {patient.gender}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block uppercase text-[10px]">Date / Rx No.</span>
              <span className="font-semibold text-slate-800">{rxDate} <span className="text-slate-500 font-mono">({rxNumber})</span></span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block uppercase text-[10px]">Contact</span>
              <span className="font-mono text-slate-700">{patient.phone || 'N/A'}</span>
            </div>
          </div>

          {/* Vitals & Allergies Row */}
          <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <div className="flex items-center gap-3 text-slate-600">
              {prescription.vitals?.bp && <span><strong>BP:</strong> {prescription.vitals.bp}</span>}
              {prescription.vitals?.pulse && <span><strong>Pulse:</strong> {prescription.vitals.pulse}</span>}
              {prescription.vitals?.temperature && <span><strong>Temp:</strong> {prescription.vitals.temperature}</span>}
              {prescription.vitals?.weight && <span><strong>Weight:</strong> {prescription.vitals.weight}</span>}
              {prescription.vitals?.spo2 && <span><strong>SpO2:</strong> {prescription.vitals.spo2}</span>}
            </div>

            {patient.allergies && patient.allergies !== 'None' && patient.allergies !== 'None reported' && (
              <div className="flex items-center gap-1 text-rose-700 font-bold bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                <AlertTriangle className="w-3 h-3" />
                <span>Allergies: {patient.allergies}</span>
              </div>
            )}
          </div>
        </div>

        {/* CLINICAL DIAGNOSIS */}
        {prescription.diagnosis && (
          <div className="mb-4 px-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Clinical Diagnosis:
              </span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-900 bg-teal-50/40 p-2.5 rounded-lg border-l-4" style={{ borderColor: headerColor }}>
              {prescription.diagnosis}
            </p>
          </div>
        )}

        {/* MEDICINES TABLE (Rx) */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <img
                src="/brand/doccare-icon.png"
                alt="DocCare"
                className="w-4 h-4 object-contain shrink-0"
              />
              <span className="text-xl font-serif font-black text-teal-800" style={{ color: headerColor }}>
                ℞
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Prescribed Medications
              </span>
            </div>
            <span className="text-[10px] text-slate-400">
              Take strictly according to schedule
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/90 text-slate-700 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Medicine & Strength</th>
                  <th className="py-2.5 px-3">Dosage</th>
                  <th className="py-2.5 px-3">Frequency</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3">Instructions / Route</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {medItems.length > 0 ? (
                  medItems.map((med, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}>
                      <td className="py-2 px-3 font-bold text-slate-400">{index + 1}</td>
                      <td className="py-2 px-3">
                        <strong className="text-slate-900 block text-xs">{med.medicine_name || med.name || med.brandName}</strong>
                        {(med.generic_name || med.generic) && (
                          <span className="text-[10px] text-slate-500 italic block">{med.generic_name || med.generic}</span>
                        )}
                        {med.form && <span className="text-[10px] text-teal-700 font-medium capitalize">({med.form})</span>}
                      </td>
                      <td className="py-2 px-3 font-semibold text-slate-800">{med.dose || '1 Tab'}</td>
                      <td className="py-2 px-3 font-bold text-teal-900" style={{ color: headerColor }}>
                        {med.frequency}
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-700">{med.duration}</td>
                      <td className="py-2 px-3 text-slate-600 text-[11px]">{med.instructions || 'After meals with water'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-6 text-center text-slate-400 italic">
                      No medicines prescribed yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* LAB INVESTIGATIONS & ADVICE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-5">
          
          {/* Lab Tests */}
          <div className="p-3 rounded-xl bg-slate-50/90 border border-slate-200">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
              <img src="/brand/doccare-icon.png" alt="" className="w-3 h-3 object-contain shrink-0" />
              <Activity className="w-3 h-3 text-teal-600" style={{ color: headerColor }} />
              Lab Investigations Advised
            </h4>
            {labList.length > 0 ? (
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-700 font-medium">
                {labList.map((test, i) => (
                  <li key={i} className="leading-snug">{test}</li>
                ))}
              </ul>
            ) : (
              <p className="text-[11px] text-slate-400 italic">No special lab tests requested.</p>
            )}
          </div>

          {/* Clinical Advice & Diet */}
          <div className="p-3 rounded-xl bg-slate-50/90 border border-slate-200">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
              <img src="/brand/doccare-icon.png" alt="" className="w-3 h-3 object-contain shrink-0" />
              <HeartPulse className="w-3 h-3 text-teal-600" style={{ color: headerColor }} />
              Advice & Dietary Guidelines
            </h4>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              {prescription.advice || "Drink plenty of water, take adequate bed rest, and complete the medication course."}
            </p>
            {followUp && (
              <div className="mt-2 pt-1.5 border-t border-slate-200/80 flex items-center gap-1.5 text-[11px] font-bold text-teal-800" style={{ color: headerColor }}>
                <Calendar className="w-3 h-3" />
                <span>Next Follow-up Visit: {followUp}</span>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* FOOTER SECTION: SIGNATURE, STAMP, VERIFICATION QR, & DOCCARE BRANDING */}
      <div className="pt-3 border-t-2 border-slate-100 relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-end gap-4 mb-3">
          
          {/* QR Code for Verification */}
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-white border border-slate-200 rounded-xl shadow-xs">
              <QRCodeSVG value={verifyUrl} size={64} level="M" />
            </div>
            <div className="text-[9.5px] text-slate-500 max-w-[200px]">
              <strong className="block text-slate-800 font-bold text-[10px] uppercase">Scan to Verify Rx</strong>
              <span>Digital integrity token:</span>
              <p className="font-mono font-bold text-teal-700">{rxNumber}</p>
            </div>
          </div>

          {/* Official Stamp & Physician Signature */}
          <div className="flex items-center gap-5">
            {showStamp && doc.stampImage && (
              <div className="text-center">
                <img
                  src={doc.stampImage}
                  alt="Official Clinic Stamp"
                  className="w-16 h-16 object-contain opacity-90 rotate-[-4deg]"
                />
                <span className="text-[8.5px] uppercase tracking-wider text-slate-400 block mt-0.5">Official Seal</span>
              </div>
            )}

            {showSignature && (
              <div className="text-center min-w-[130px] border-b-2 border-slate-300 pb-1">
                {doc.signatureImage ? (
                  <img
                    src={doc.signatureImage}
                    alt="Doctor's Signature"
                    className="h-10 mx-auto object-contain"
                  />
                ) : (
                  <div className="h-9 flex items-center justify-center font-serif italic text-sm text-slate-600">
                    {doc.name}
                  </div>
                )}
                <span className="text-[9.5px] font-bold text-slate-700 uppercase block tracking-wider mt-0.5">
                  Physician's Signature
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 4. Professional Footer Branding: Powered by DocCare */}
        <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-[9.5px] text-slate-500">
          <div className="text-left">
            {doc.disclaimerText || "This digital prescription is generated electronically and verified by the attending physician."}
          </div>
          <div className="flex items-center gap-1.5 shrink-0 text-slate-600 font-semibold">
            <span className="text-slate-400 font-normal">Powered by</span>
            <DocCareLogo variant="compact" size="xs" />
          </div>
        </div>
      </div>
    </div>
  );
}
