import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  FileText, 
  Download, 
  Printer, 
  Phone, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  Building2, 
  CheckCircle2, 
  Loader2, 
  ExternalLink,
  Lock,
  ArrowLeft,
  Share2
} from 'lucide-react';
import { api } from '../services/api';
import DocCareLogo from '../components/DocCareLogo';

export default function PublicSecureRxViewer({ shareToken, onBackToApp }) {
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState(null);
  const [errorInfo, setErrorInfo] = useState(null);

  useEffect(() => {
    if (!shareToken) return;

    let isMounted = true;
    setLoading(true);
    setErrorInfo(null);

    api.getPublicRxInfo(shareToken)
      .then((data) => {
        if (!isMounted) return;
        if (data.valid) {
          setInfo(data);
        } else {
          setErrorInfo(data);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setErrorInfo({
          valid: false,
          message: "This prescription link has expired or is invalid. Please contact your doctor.",
          reason: err.message || "Link Expired",
          doctor_name: "Doctor's Clinic",
          clinic_name: "DocCare Practice"
        });
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [shareToken]);

  const pdfViewUrl = `/api/public/rx/${shareToken}`;
  const pdfDownloadUrl = `/api/public/rx/${shareToken}?download=true`;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = pdfDownloadUrl;
    a.download = `${info?.prescription_no || 'Prescription'}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 }
    });
  };

  const handlePrint = () => {
    const iframe = document.getElementById('rx-pdf-frame');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.print();
    } else {
      window.open(pdfViewUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 text-center max-w-sm w-full space-y-4">
          <Loader2 className="w-10 h-10 text-teal-600 animate-spin mx-auto" />
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Verifying Secure Link...</h2>
            <p className="text-xs text-slate-400 mt-1">Decrypting prescription token from DocCare clinical registry</p>
          </div>
        </div>
      </div>
    );
  }

  // Expired / Revoked / Limit Reached State
  if (errorInfo || !info) {
    const docName = errorInfo?.doctor_name || "Your Doctor";
    const clinic = errorInfo?.clinic_name || "DocCare Medical Center";
    const phone = errorInfo?.clinic_phone || "";
    const cleanPhone = phone.replace(/[^0-9+]/g, '');

    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 text-center space-y-5">
          
          <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-slate-50 tracking-tight">
              Prescription Link Expired
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              This secure prescription download link is no longer accessible. For patient privacy and medical record safety, prescription links expire after a set duration.
            </p>
          </div>

          {/* Doctor Contact Box */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700 text-left space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Contact Attending Physician
            </span>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{docName}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">{clinic}</p>
            {errorInfo?.clinic_address && (
              <p className="text-[11px] text-slate-500">{errorInfo.clinic_address}</p>
            )}
            {phone && (
              <p className="text-xs font-semibold text-teal-700 dark:text-teal-400 pt-1">
                Clinic Phone: {phone}
              </p>
            )}
          </div>

          {/* Call & WhatsApp CTAs */}
          <div className="space-y-2">
            {phone && (
              <a
                href={`tel:${cleanPhone}`}
                className="w-full py-3 px-4 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold text-xs shadow-md shadow-teal-700/20 flex items-center justify-center gap-2 transition-all"
              >
                <Phone className="w-4 h-4" />
                <span>Call Clinic Now ({phone})</span>
              </a>
            )}

            {phone && (
              <a
                href={`https://wa.me/${cleanPhone.replace('+', '')}?text=Hello%20Dr.%20I%20need%20a%20new%20link%20for%20my%20prescription.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Share2 className="w-4 h-4 text-emerald-600" />
                <span>Message Clinic on WhatsApp</span>
              </a>
            )}
          </div>

          {onBackToApp && (
            <button
              onClick={onBackToApp}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 inline-flex items-center gap-1 font-medium pt-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to DocCare Portal</span>
            </button>
          )}

        </div>
      </div>
    );
  }

  const expiryDate = info?.expires_at ? new Date(info.expires_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }) : '7 Days';

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col">
      
      {/* Top Navigation Bar */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3.5 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            {onBackToApp && (
              <button
                onClick={onBackToApp}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 transition-colors"
                title="Back to DocCare"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}

            <DocCareLogo variant="icon" size="sm" />

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-50">
                  Digital Prescription: {info.prescription_no || 'Official Record'}
                </h1>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {info.doctor_name} • {info.clinic_name}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-md shadow-teal-700/20"
            >
              <Download className="w-4 h-4" />
              <span>Download A4 PDF</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl w-full mx-auto p-4 sm:p-6 flex-1 flex flex-col space-y-4">
        
        {/* Security & Expiration Banner */}
        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-900 dark:text-emerald-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600 text-white rounded-xl">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold block">Verified Cryptographic Prescription Link</span>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-300">
                Authorized by {info.doctor_name} ({info.doctor_specialization || 'Consultant'})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block tracking-wider">
                Expires On
              </span>
              <span className="font-bold">{expiryDate}</span>
            </div>
            {info.max_downloads && (
              <div className="text-right pl-3 border-l border-emerald-200 dark:border-emerald-800">
                <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block tracking-wider">
                  Downloads
                </span>
                <span className="font-bold">{info.download_count} / {info.max_downloads}</span>
              </div>
            )}
          </div>
        </div>

        {/* Embedded PDF Viewer */}
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden min-h-[680px] flex flex-col">
          <iframe
            id="rx-pdf-frame"
            src={pdfViewUrl}
            title={`Prescription ${info.prescription_no}`}
            className="w-full flex-1 border-0 min-h-[680px]"
          />
        </div>

        {/* Doctor Contact Footer Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div>
            <p className="font-bold text-slate-800 dark:text-slate-100">{info.clinic_name}</p>
            <p className="text-slate-500">{info.clinic_address}</p>
          </div>

          {info.clinic_phone && (
            <a
              href={`tel:${info.clinic_phone.replace(/[^0-9+]/g, '')}`}
              className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 hover:text-teal-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold flex items-center gap-2 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-teal-600" />
              <span>{info.clinic_phone}</span>
            </a>
          )}
        </div>

      </main>

    </div>
  );
}
