import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, 
  Send, 
  MessageSquare, 
  Share2, 
  Copy, 
  Check, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  Smartphone, 
  ExternalLink,
  Loader2,
  RefreshCw,
  Phone,
  Calendar,
  FileText,
  CheckCircle2,
  AlertCircle,
  Lock
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function SendWhatsAppModal({
  isOpen,
  onClose,
  prescription,
  patient,
  appointment,
  type = 'prescription', // 'prescription' | 'reminder' | 'confirmation'
  onSentSuccess
}) {
  const { currentDoctor } = useAuth();

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [activeShare, setActiveShare] = useState(null);
  const [config, setConfig] = useState({ modeBEnabled: false, defaultExpiryDays: 7, defaultTemplate: '' });
  
  // Form State
  const [patientPhone, setPatientPhone] = useState('');
  const [expiryDays, setExpiryDays] = useState(7);
  const [maxDownloads, setMaxDownloads] = useState('');
  const [messageText, setMessageText] = useState('');
  const [consentAcknowledged, setConsentAcknowledged] = useState(false);
  const [sendError, setSendError] = useState('');
  const [sendSuccess, setSendSuccess] = useState(false);
  const [lastDispatchedLog, setLastDispatchedLog] = useState(null);

  const activePatient = patient || prescription?.patient || appointment?.patient;
  const hasConsent = Boolean(activePatient?.consent_given);

  // Initialize or fetch share & template
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);
    setSendError('');
    setSendSuccess(false);
    setConsentAcknowledged(hasConsent);

    const initialPhone = activePatient?.whatsapp || activePatient?.phone || appointment?.patient_phone || '';
    setPatientPhone(initialPhone);

    const initData = async () => {
      try {
        const cfg = await api.getWhatsAppConfig();
        if (!isMounted) return;
        setConfig(cfg);
        const days = cfg.defaultExpiryDays || 7;
        setExpiryDays(days);

        if (type === 'prescription' && prescription?.id) {
          // Generate or get existing share
          const shareRes = await api.createPrescriptionShare(prescription.id, { expiry_days: days });
          if (!isMounted) return;
          setActiveShare(shareRes.share);

          const shareUrl = shareRes.shareUrl || `${window.location.origin}/rx/${shareRes.share.share_token}`;
          const expiryDateStr = new Date(shareRes.share.expires_at).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          });

          // Render default template with placeholders
          const rawTemplate = currentDoctor?.whatsapp_message_template || cfg.defaultTemplate || 
            "Hello [Patient Name], your prescription from Dr. [Doctor Name] ([Clinic Name]) is ready. View or download it here: [Link]. This link expires on [Expiry Date]. Get well soon.";
          
          const rendered = rawTemplate
            .replace(/\[Patient Name\]/gi, activePatient?.name || 'Patient')
            .replace(/\[Doctor Name\]/gi, currentDoctor?.name || 'your Doctor')
            .replace(/\[Clinic Name\]/gi, currentDoctor?.clinicName || 'DocCare Clinic')
            .replace(/\[Link\]/gi, shareUrl)
            .replace(/\[Expiry Date\]/gi, expiryDateStr);

          setMessageText(rendered);

        } else if (type === 'reminder' && appointment) {
          const aptDate = appointment.date || 'today';
          const aptTime = appointment.start_time || 'scheduled time';
          const clinicAddr = currentDoctor?.address ? `${currentDoctor.clinicName}, ${currentDoctor.address}` : currentDoctor?.clinicName || 'our clinic';
          
          const reminderMsg = `Hello ${activePatient?.name || 'Patient'}, this is a reminder of your appointment with Dr. ${currentDoctor?.name || 'Doctor'} on ${aptDate} at ${aptTime}, ${clinicAddr}. Please arrive 10 minutes early.`;
          setMessageText(reminderMsg);

        } else if (type === 'confirmation' && appointment) {
          const aptDate = appointment.date || 'the requested date';
          const aptTime = appointment.start_time || 'the requested slot';
          const confirmMsg = `Hello ${activePatient?.name || 'Patient'}, your appointment with Dr. ${currentDoctor?.name || 'Doctor'} at ${currentDoctor?.clinicName || 'Clinic'} has been confirmed for ${aptDate} at ${aptTime}.`;
          setMessageText(confirmMsg);
        }

      } catch (err) {
        if (!isMounted) return;
        console.error("Failed to prepare WhatsApp share:", err);
        setSendError(err.message || "Could not generate secure prescription link.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initData();

    return () => { isMounted = false; };
  }, [isOpen, prescription?.id, appointment?.id, type]);

  if (!isOpen) return null;

  // Handle regenerating a new link with new expiry
  const handleRegenerateLink = async (newDays) => {
    if (!prescription?.id) return;
    try {
      setLoading(true);
      setSendError('');
      const shareRes = await api.createPrescriptionShare(prescription.id, { 
        expiry_days: newDays || expiryDays,
        max_downloads: maxDownloads ? Number(maxDownloads) : null,
        force_new: true 
      });
      setActiveShare(shareRes.share);
      setExpiryDays(newDays || expiryDays);

      const shareUrl = shareRes.shareUrl || `${window.location.origin}/rx/${shareRes.share.share_token}`;
      const expiryDateStr = new Date(shareRes.share.expires_at).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

      const rawTemplate = currentDoctor?.whatsapp_message_template || config.defaultTemplate || 
        "Hello [Patient Name], your prescription from Dr. [Doctor Name] ([Clinic Name]) is ready. View or download it here: [Link]. This link expires on [Expiry Date]. Get well soon.";
      
      const rendered = rawTemplate
        .replace(/\[Patient Name\]/gi, activePatient?.name || 'Patient')
        .replace(/\[Doctor Name\]/gi, currentDoctor?.name || 'your Doctor')
        .replace(/\[Clinic Name\]/gi, currentDoctor?.clinicName || 'DocCare Clinic')
        .replace(/\[Link\]/gi, shareUrl)
        .replace(/\[Expiry Date\]/gi, expiryDateStr);

      setMessageText(rendered);
    } catch (err) {
      setSendError("Failed to generate fresh link: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // MODE A: Direct wa.me Dispatch (Default)
  const handleSendModeA = async () => {
    if (!consentAcknowledged) {
      setSendError("Patient consent confirmation is required before dispatching communications.");
      return;
    }

    try {
      setSending(true);
      setSendError('');

      const res = await api.sendWhatsAppLink({
        prescription_id: prescription?.id || null,
        share_id: activeShare?.id || null,
        appointment_id: appointment?.id || null,
        patient_id: activePatient?.id,
        type,
        to_number: patientPhone,
        message_text: messageText
      });

      if (res.success && res.wa_url) {
        setSendSuccess(true);
        setLastDispatchedLog(res.log);

        // Open WhatsApp in new tab (desktop app, mobile, or web)
        window.open(res.wa_url, '_blank', 'noopener,noreferrer');

        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.7 }
        });

        if (onSentSuccess) {
          onSentSuccess(res.log);
        }
      }
    } catch (err) {
      setSendError(err.message || "Failed to dispatch WhatsApp link.");
    } finally {
      setSending(false);
    }
  };

  // MODE B: Meta WhatsApp Business Cloud API
  const handleSendModeB = async () => {
    if (!consentAcknowledged) {
      setSendError("Patient consent confirmation is required before dispatching communications.");
      return;
    }

    try {
      setSending(true);
      setSendError('');

      const shareUrl = activeShare ? `${window.location.origin}/rx/${activeShare.share_token}` : '';

      const res = await api.sendWhatsAppCloud({
        prescription_id: prescription?.id || null,
        share_id: activeShare?.id || null,
        patient_id: activePatient?.id,
        to_number: patientPhone,
        share_url: shareUrl,
        patient_name: activePatient?.name
      });

      if (res.success) {
        setSendSuccess(true);
        setLastDispatchedLog(res.log);

        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.6 }
        });

        if (onSentSuccess) {
          onSentSuccess(res.log);
        }
      }
    } catch (err) {
      setSendError(err.message || "Failed to dispatch via WhatsApp Cloud API.");
    } finally {
      setSending(false);
    }
  };

  const handleCopyLink = () => {
    if (!activeShare) return;
    const shareUrl = `${window.location.origin}/rx/${activeShare.share_token}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(messageText);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2500);
  };

  const smsFallbackUrl = `sms:${patientPhone.replace(/[^0-9+]/g, '')}?body=${encodeURIComponent(messageText)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Top Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-teal-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight">
                Send via WhatsApp
              </h2>
              <p className="text-xs text-teal-100 font-normal">
                {type === 'prescription' ? 'Expiring Secure PDF Share' : type === 'reminder' ? 'Appointment Reminder' : 'Appointment Confirmation'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-slate-800 dark:text-slate-100">
          
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
              <p className="text-xs text-slate-500 font-medium">Generating secure cryptographic link...</p>
            </div>
          ) : (
            <>
              {/* Patient & Prescription Info Ribbon */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200/80 dark:border-slate-750 flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Patient</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">{activePatient?.name || 'Patient'}</span>
                  <span className="text-slate-500 block text-[11px]">{activePatient?.gender}, {activePatient?.age} yrs</span>
                </div>

                {prescription && (
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Prescription</span>
                    <span className="font-mono font-bold text-teal-700 dark:text-teal-400">{prescription.prescription_no || 'RX-READY'}</span>
                    <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full font-semibold inline-block mt-0.5">
                      Finalized
                    </span>
                  </div>
                )}
              </div>

              {/* Patient Phone Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>WhatsApp / Mobile Number (Pakistan)</span>
                  <span className="text-[11px] text-slate-400 font-normal">Auto-normalizes to 923XXXXXXXXX</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder="0300-1234567 or +923001234567"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Link Expiry & Security Controls (For Prescriptions) */}
              {type === 'prescription' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-teal-50/70 dark:bg-teal-950/40 rounded-2xl border border-teal-100 dark:border-teal-900">
                  <div>
                    <label className="text-[11px] font-bold text-teal-900 dark:text-teal-200 block mb-1">
                      Link Expiration
                    </label>
                    <select
                      value={expiryDays}
                      onChange={(e) => {
                        const days = Number(e.target.value);
                        setExpiryDays(days);
                        handleRegenerateLink(days);
                      }}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-teal-200 dark:border-teal-800 rounded-lg text-xs font-semibold text-teal-900 dark:text-teal-200 focus:outline-none"
                    >
                      <option value={1}>1 Day (Emergency / Acute)</option>
                      <option value={3}>3 Days</option>
                      <option value={7}>7 Days (Recommended Standard)</option>
                      <option value={30}>30 Days (Chronic Care)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-teal-900 dark:text-teal-200 block mb-1">
                      Max Downloads (Optional)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={maxDownloads}
                      onChange={(e) => setMaxDownloads(e.target.value)}
                      placeholder="Unlimited (default)"
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-teal-200 dark:border-teal-800 rounded-lg text-xs font-semibold text-teal-900 dark:text-teal-200 focus:outline-none placeholder:text-slate-400"
                    />
                  </div>

                  <div className="sm:col-span-2 flex items-center justify-between text-[11px] text-teal-800 dark:text-teal-300 pt-1">
                    <span className="flex items-center gap-1">
                      <Lock className="w-3 h-3 text-teal-600" />
                      <span>Token: {activeShare?.share_token?.slice(0, 12)}...</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRegenerateLink(expiryDays)}
                      className="text-teal-700 hover:text-teal-900 font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Generate New Token</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Message Preview Textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    WhatsApp Message Text (Editable)
                  </label>
                  <button
                    type="button"
                    onClick={handleCopyMessage}
                    className="text-[11px] text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1"
                  >
                    {copiedMessage ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedMessage ? 'Copied' : 'Copy Message'}</span>
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-teal-500 font-sans"
                />
                <p className="text-[10px] text-slate-400 italic">
                  * Clinical Privacy Notice: Diagnosis and medication names are strictly omitted from WhatsApp text for confidentiality.
                </p>
              </div>

              {/* Consent Warning Checkbox if not consented */}
              {!hasConsent && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-900 space-y-2">
                  <div className="flex items-start gap-2 text-amber-800 dark:text-amber-300 text-xs">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                    <div>
                      <span className="font-bold block">Patient Consent Unverified</span>
                      <p className="text-[11px] text-amber-700 dark:text-amber-400">
                        This patient did not have the WhatsApp consent box checked during intake. Please confirm clinical consent before messaging.
                      </p>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={consentAcknowledged}
                      onChange={(e) => setConsentAcknowledged(e.target.checked)}
                      className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
                    />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      I confirm patient gave verbal / written consent to receive prescription on this number.
                    </span>
                  </label>
                </div>
              )}

              {/* Error Message */}
              {sendError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/50 rounded-xl border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{sendError}</span>
                </div>
              )}

              {/* Success Banner */}
              {sendSuccess && (
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/50 rounded-2xl border border-emerald-200 text-emerald-800 text-xs space-y-1">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>WhatsApp Link Dispatched & Logged!</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    Status logged as: <strong>{lastDispatchedLog?.status?.toUpperCase()}</strong>. Check the Messages audit tab for download activity.
                  </p>
                </div>
              )}
            </>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
          
          {/* Secondary Fallback Buttons */}
          <div className="flex items-center gap-2">
            {type === 'prescription' && activeShare && (
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                title="Copy secure link to clipboard"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
              </button>
            )}

            <a
              href={smsFallbackUrl}
              className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              title="Fallback to SMS if patient has no WhatsApp"
            >
              <Smartphone className="w-3.5 h-3.5 text-slate-400" />
              <span>SMS Fallback</span>
            </a>
          </div>

          {/* Primary Send Buttons */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Mode B Cloud API (if configured) */}
            {config.modeBEnabled && (
              <button
                type="button"
                onClick={handleSendModeB}
                disabled={sending || loading || (!hasConsent && !consentAcknowledged)}
                className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow shadow-blue-600/20 disabled:opacity-50"
              >
                {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Cloud API Send</span>
              </button>
            )}

            {/* Mode A: Default wa.me Send */}
            <button
              type="button"
              onClick={handleSendModeA}
              disabled={sending || loading || (!hasConsent && !consentAcknowledged)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-emerald-600/25 disabled:opacity-50"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
              <span>Open in WhatsApp (Mode A)</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
