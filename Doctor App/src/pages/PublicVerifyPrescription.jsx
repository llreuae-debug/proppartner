import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Activity, 
  AlertTriangle, 
  Phone, 
  Calendar, 
  MapPin, 
  Loader2,
  FileText,
  Lock,
  ExternalLink,
  ArrowLeft,
  Building2,
  UserCheck,
  Stethoscope
} from 'lucide-react';
import { api } from '../services/api';
import DocCareLogo from '../components/DocCareLogo';

export default function PublicVerifyPrescription({ verifyToken, onBackToApp }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVerification = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.verifyPublicPrescription(verifyToken);
        setData(res);
      } catch (err) {
        setError(err.message || "Prescription record not found or invalid token.");
      } finally {
        setLoading(false);
      }
    };

    if (verifyToken) {
      fetchVerification();
    } else {
      setError("No verification token provided.");
      setLoading(false);
    }
  }, [verifyToken]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <Loader2 className="w-6 h-6 text-teal-600 animate-spin" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Verifying digital prescription record...</span>
        </div>
      </div>
    );
  }

  if (error || !data || !data.verified) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl max-w-md w-full border border-rose-200 dark:border-rose-900/60 text-center space-y-4">
          <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950 text-rose-600 rounded-3xl flex items-center justify-center mx-auto border border-rose-200 dark:border-rose-800">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Prescription Not Found</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            The verification token is invalid, expired, or has been revoked. If you believe this is an error, please contact the clinic directly.
          </p>
          <div className="pt-2">
            <button
              onClick={onBackToApp || (() => window.location.href = '/')}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all"
            >
              Back to DocCare Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/20 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-10 px-4 font-sans flex flex-col justify-between">
      <div className="max-w-xl mx-auto w-full space-y-6">
        
        {/* Brand Top Bar */}
        <div className="flex items-center justify-between">
          <DocCareLogo variant="horizontal" size="sm" showTagline={false} />

          {onBackToApp && (
            <button
              onClick={onBackToApp}
              className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-400 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> <span>DocCare Home</span>
            </button>
          )}
        </div>

        {/* Verification Success Hero Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-emerald-200 dark:border-emerald-900/60 overflow-hidden">
          
          {/* Green Status Banner */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white text-center space-y-2">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto shadow-inner border border-white/30">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <div className="flex items-center justify-center gap-1.5 pt-1">
              <h1 className="text-lg font-black tracking-tight">Prescription Verified</h1>
              <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            </div>
            <p className="text-xs text-emerald-100 font-medium">
              Official Electronic Record Authenticated & Digitally Signed
            </p>
          </div>

          {/* Verified Metadata Grid */}
          <div className="p-6 space-y-5">
            
            {/* Prescription No & Date Badge */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Prescription ID</span>
                <span className="font-mono text-sm font-black text-teal-800 dark:text-teal-300">{data.prescription_no}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Issue Date</span>
                <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">{data.date}</span>
              </div>
            </div>

            {/* Attending Physician Section */}
            <div className="p-4 rounded-2xl bg-teal-50/50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-teal-900 dark:text-teal-200 uppercase tracking-wider">
                <Stethoscope className="w-4 h-4 text-teal-600" />
                <span>Attending Physician</span>
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{data.doctor_name}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">{data.doctor_specialization}</p>
                <div className="mt-2 inline-block px-2.5 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-teal-300 dark:border-teal-700 font-mono text-xs font-bold text-teal-800 dark:text-teal-300">
                  PMDC Reg #: {data.doctor_pmdc}
                </div>
              </div>
            </div>

            {/* Clinic & Facility Section */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span>Clinic / Medical Facility</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">{data.clinic_name}</h4>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>{data.clinic_address}, {data.clinic_city}</span>
              </p>
              {data.clinic_phone && (
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  <span>{data.clinic_phone}</span>
                </p>
              )}
            </div>

            {/* Masked Patient Record (Privacy Compliance) */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Patient Name (Masked for Privacy)</span>
                <span className="font-mono text-sm font-black text-slate-800 dark:text-slate-200 tracking-wider">
                  {data.patient_masked_name}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-1 rounded-full">
                <Lock className="w-3 h-3" />
                <span>Privacy Protected</span>
              </div>
            </div>

            {/* Privacy Compliance Notice */}
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-850 text-slate-500 dark:text-slate-400 text-[10px] leading-relaxed text-center">
              🔒 <strong>Patient Confidentiality Note:</strong> Under healthcare privacy regulations, medical prescriptions, clinical diagnoses, and medication regimens are confidential and only accessible directly by the patient and attending physician.
            </div>

          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="text-center text-[11px] text-slate-400 mt-8">
        DocCare Medical Operating System • Electronic Verification Registry
      </div>
    </div>
  );
}
