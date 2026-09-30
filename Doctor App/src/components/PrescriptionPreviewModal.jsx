import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, 
  Printer, 
  Download, 
  Send, 
  Palette, 
  Share2, 
  Check, 
  Loader2, 
  Sliders, 
  ExternalLink, 
  Sparkles,
  RefreshCw,
  Copy,
  CheckCircle2,
  FileText,
  AlertCircle,
  MessageSquare,
  History
} from 'lucide-react';
import PrescriptionPDF from './PrescriptionPDF';
import SendWhatsAppModal from './SendWhatsAppModal';
import { api } from '../services/api';

export default function PrescriptionPreviewModal({
  isOpen,
  onClose,
  prescription,
  doctor
}) {
  const [docSettings, setDocSettings] = useState(null);
  const [pdfStatus, setPdfStatus] = useState('idle'); // 'idle' | 'generating' | 'ready' | 'failed'
  const [copiedLink, setCopiedLink] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [showSentHistory, setShowSentHistory] = useState(false);
  const [sentLogs, setSentLogs] = useState([]);

  const doc = doctor || prescription?.doctor;

  const loadSentLogs = () => {
    if (!prescription?.id) return;
    api.getMessageLogs()
      .then(res => {
        const matching = (res.messages || []).filter(m => m.prescription_id === prescription.id);
        setSentLogs(matching);
      })
      .catch(err => console.warn(err));
  };

  useEffect(() => {
    if (isOpen && prescription) {
      // Load doctor's active PDF settings
      api.getPdfSettings().then(res => {
        if (res.settings) setDocSettings(res.settings);
      }).catch(err => console.warn(err));

      // Load sent history
      loadSentLogs();

      // Trigger server-side PDF compilation
      if (prescription.id) {
        generateBackendPdf();
      }
    }
  }, [isOpen, prescription]);

  const generateBackendPdf = async () => {
    if (!prescription?.id) return;
    try {
      setPdfStatus('generating');
      setErrorMessage('');
      const res = await api.generatePrescriptionPDF(prescription.id);
      if (res.success) {
        setPdfStatus('ready');
      }
    } catch (err) {
      console.warn("Backend PDF generation notice:", err.message);
      setPdfStatus('ready'); // Fallback to direct client stream
    }
  };

  if (!isOpen || !prescription) return null;

  const rxNumber = prescription.prescription_no || prescription.rxNumber || 'RX-2026-00001';
  const verificationToken = prescription.verification_token || 'vtok_sample';
  const verifyLink = `${window.location.origin}/verify/${verificationToken}`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    if (prescription.id) {
      const downloadUrl = api.getPrescriptionPdfUrl(prescription.id, true);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${rxNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 }
      });
    } else {
      window.print();
    }
  };

  const handleCopyVerificationLink = () => {
    navigator.clipboard.writeText(verifyLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-slate-100 dark:bg-slate-900 rounded-3xl shadow-2xl max-w-5xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Top Header & Toolbar */}
        <div className="bg-white dark:bg-slate-850 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">
                  Prescription: {prescription.patient?.name || prescription.patient_name || prescription.patientName || 'Patient Record'}
                </h3>
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  {rxNumber}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Print-ready A4 Server Generated • Verification Token: {verificationToken.slice(0, 10)}...
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Send via WhatsApp Button (Step 5) */}
            <button
              onClick={() => setIsWhatsAppModalOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20"
              title="Send secure expiring PDF link to patient via WhatsApp"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Send via WhatsApp</span>
            </button>

            {/* Sent History Drawer Toggle */}
            <button
              onClick={() => setShowSentHistory(!showSentHistory)}
              className={`px-3 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors ${
                showSentHistory
                  ? 'bg-teal-700 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200'
              }`}
              title="View WhatsApp dispatch and download history"
            >
              <History className="w-3.5 h-3.5" />
              <span>Sent History {sentLogs.length > 0 && `(${sentLogs.length})`}</span>
            </button>

            {/* Copy Verification Link */}
            <button
              onClick={handleCopyVerificationLink}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
              title="Copy public verification link"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
              <span>{copiedLink ? 'Copied!' : 'Verify Link'}</span>
            </button>

            {/* Regenerate PDF */}
            <button
              onClick={generateBackendPdf}
              disabled={pdfStatus === 'generating'}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50"
              title="Regenerate PDF with latest layout settings"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${pdfStatus === 'generating' ? 'animate-spin text-teal-600' : 'text-slate-500'}`} />
              <span>{pdfStatus === 'generating' ? 'Rendering...' : 'Regenerate'}</span>
            </button>

            {/* Print button */}
            <button
              onClick={handlePrint}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Print</span>
            </button>

            {/* PDF Download */}
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-teal-700/20"
            >
              <Download className="w-4 h-4" />
              <span>Download A4 PDF</span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sent History Drawer Panel (if toggled) */}
        {showSentHistory && (
          <div className="bg-slate-50 dark:bg-slate-850 p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <History className="w-4 h-4 text-teal-600" />
                <span>WhatsApp Dispatch History & Access Tracking</span>
              </h4>
              <span className="text-[11px] text-slate-400">
                {sentLogs.length} total dispatches
              </span>
            </div>

            {sentLogs.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">
                No WhatsApp messages dispatched yet for this prescription. Click "Send via WhatsApp" above to share.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-40 overflow-y-auto">
                {sentLogs.map((log) => (
                  <div key={log.id} className="p-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-100">{log.to_number}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        log.status === 'read' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        log.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        log.status === 'failed' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{new Date(log.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                      <span>Downloads: <strong>{log.share_download_count || 0}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PDF Status Indicator */}
        {pdfStatus === 'generating' && (
          <div className="bg-teal-50 dark:bg-teal-950/60 px-6 py-2 text-xs text-teal-800 dark:text-teal-200 border-b border-teal-200 dark:border-teal-800 flex items-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />
            <span>Compiling server-side high-resolution A4 PDF...</span>
          </div>
        )}

        {/* Prescription A4 Document Canvas */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex justify-center bg-slate-200/70 dark:bg-slate-950">
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-[850px] w-full my-auto">
            <PrescriptionPDF
              prescription={prescription}
              doctor={doc}
              headerColor={docSettings?.primary_color || doc?.headerColor || '#0F766E'}
              accentColor={docSettings?.secondary_color || doc?.accentColor || '#0284C7'}
              showStamp={docSettings ? !!docSettings.stamp_url : true}
              showSignature={docSettings ? !!docSettings.signature_url : true}
            />
          </div>
        </div>

      </div>

      {/* Step 5: Send via WhatsApp Modal */}
      {isWhatsAppModalOpen && (
        <SendWhatsAppModal
          isOpen={isWhatsAppModalOpen}
          onClose={() => setIsWhatsAppModalOpen(false)}
          prescription={prescription}
          patient={prescription.patient || { name: prescription.patient_name, phone: prescription.patient_phone, consent_given: true }}
          type="prescription"
          onSentSuccess={() => {
            loadSentLogs();
          }}
        />
      )}

    </div>
  );
}

