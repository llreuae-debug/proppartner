import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  Calendar, 
  FileText, 
  AlertCircle, 
  Activity, 
  Clock, 
  X, 
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  HeartPulse,
  Lock,
  Edit3,
  Check,
  Loader2,
  CalendarCheck,
  Eye,
  Printer,
  MessageSquare,
  History,
  Wallet,
  Receipt,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import PrescriptionPreviewModal from '../components/PrescriptionPreviewModal';
import SendWhatsAppModal from '../components/SendWhatsAppModal';
import PatientReceiptModal from '../components/ledger/PatientReceiptModal';

export default function PatientsDirectoryPage({ onWritePrescription }) {
  const { currentDoctor } = useAuth();
  const { t } = useLanguage();

  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [patientDetail, setPatientDetail] = useState(null);
  const [patientFinancial, setPatientFinancial] = useState(null);
  const [patientMessageLogs, setPatientMessageLogs] = useState([]);
  const [modalTab, setModalTab] = useState('clinical'); // 'clinical' | 'financial'
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [selectedRxForPreview, setSelectedRxForPreview] = useState(null);
  const [selectedRxForWhatsApp, setSelectedRxForWhatsApp] = useState(null);
  const [receiptEntry, setReceiptEntry] = useState(null);

  // Edit Form State
  const [editForm, setEditForm] = useState({
    name: '',
    age: '',
    gender: 'Male',
    phone: '',
    whatsapp: '',
    allergies: '',
    chronic_conditions: '',
    current_medicines: '',
    reason_for_visit: '',
    private_notes: ''
  });

  const loadPatients = async () => {
    if (!currentDoctor) return;
    try {
      const res = await api.getPatients(searchQuery);
      setPatients(res.patients || []);
    } catch (err) {
      console.error("Failed to load patients:", err);
    }
  };

  useEffect(() => {
    loadPatients();
  }, [currentDoctor, searchQuery]);

  const handleOpenPatient = async (patientId) => {
    setSelectedPatientId(patientId);
    setModalTab('clinical');
    try {
      setLoadingTimeline(true);
      const [res, msgRes, finRes] = await Promise.all([
        api.getPatientDetail(patientId),
        api.getMessageLogs({ patient_id: patientId }).catch(() => ({ messages: [] })),
        api.getPatientFinancialHistory(patientId).catch(() => null)
      ]);
      setPatientDetail(res);
      setPatientMessageLogs(msgRes.messages || []);
      setPatientFinancial(finRes || null);
      setEditForm({
        name: res.patient.name || '',
        age: res.patient.age || '',
        gender: res.patient.gender || 'Male',
        phone: res.patient.phone || '',
        whatsapp: res.patient.whatsapp || '',
        allergies: res.patient.allergies || '',
        chronic_conditions: res.patient.chronic_conditions || '',
        current_medicines: res.patient.current_medicines || '',
        reason_for_visit: res.patient.reason_for_visit || '',
        private_notes: res.patient.private_notes || ''
      });
    } catch (err) {
      console.error("Failed to load patient detail:", err);
    } finally {
      setLoadingTimeline(false);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!selectedPatientId) return;

    try {
      setSavingEdit(true);
      const res = await api.updatePatient(selectedPatientId, editForm);
      if (res.success) {
        setIsEditModalOpen(false);
        handleOpenPatient(selectedPatientId);
        loadPatients();
      }
    } catch (err) {
      alert("Failed to update patient: " + err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  const handlePreviewPrescription = async (rxId) => {
    try {
      const res = await api.getPrescription(rxId);
      if (res.prescription) {
        setSelectedRxForPreview(res.prescription);
      }
    } catch (err) {
      alert("Error loading prescription details: " + err.message);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-teal-600" />
            <span>Patient Records & Clinical Encounters</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Doctor-isolated records, longitudinal visit histories, and digital prescriptions timeline
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search your patients by name, mobile number, or allergy..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 outline-none"
          />
        </div>
      </div>

      {/* Patient Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {patients.map((patient) => {
          const hasAllergies = patient.allergies && patient.allergies !== 'None' && patient.allergies !== 'None reported';
          
          return (
            <div
              key={patient.id}
              onClick={() => handleOpenPatient(patient.id)}
              className="bg-white dark:bg-slate-850 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-teal-500/50 transition-all cursor-pointer space-y-4 group relative"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center font-bold text-teal-700 dark:text-teal-300 text-sm border border-teal-200 dark:border-teal-800/80 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                    {patient.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      {patient.name}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {patient.age} yrs • {patient.gender}
                    </p>
                  </div>
                </div>

                <div className="p-1 rounded-lg text-slate-300 group-hover:text-teal-600 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>

              {/* Allergy Warning Pill if patient has allergies */}
              {hasAllergies ? (
                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-200 font-medium">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="truncate">Allergies: <strong>{patient.allergies}</strong></span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Activity className="w-3.5 h-3.5" />
                  <span>No drug allergies reported</span>
                </div>
              )}

              {/* Patient Contact & Conditions info */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Phone:</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{patient.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Conditions:</span>
                  <span className="truncate max-w-[170px] font-medium text-slate-800 dark:text-slate-200">{patient.chronic_conditions || 'None'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* PATIENT DETAIL & LONGITUDINAL TIMELINE DRAWER / MODAL */}
      {selectedPatientId && patientDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Header */}
            <div className="bg-teal-700 p-5 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-lg font-bold border border-white/20">
                  {patientDetail.patient.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold flex items-center gap-2">
                    <span>{patientDetail.patient.name}</span>
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-mono font-normal">
                      {patientDetail.patient.patient_code || 'PAT-00' + patientDetail.patient.id} • {patientDetail.patient.age} yrs • {patientDetail.patient.gender}
                    </span>
                  </h3>
                  <p className="text-xs text-teal-100 font-mono mt-0.5">
                    Phone: {patientDetail.patient.phone} • WhatsApp: {patientDetail.patient.whatsapp || patientDetail.patient.phone}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Record</span>
                </button>
                <button
                  onClick={() => setSelectedPatientId(null)}
                  className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Tabs: Clinical vs Financial */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 px-5 pt-2 gap-2">
              <button
                onClick={() => setModalTab('clinical')}
                className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 ${
                  modalTab === 'clinical'
                    ? 'border-teal-600 text-teal-700 dark:text-teal-400 bg-white dark:bg-slate-900 shadow-sm'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Clinical & Prescriptions</span>
              </button>
              <button
                onClick={() => setModalTab('financial')}
                className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 ${
                  modalTab === 'financial'
                    ? 'border-teal-600 text-teal-700 dark:text-teal-400 bg-white dark:bg-slate-900 shadow-sm'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <Wallet className="w-4 h-4" />
                <span>Financial History</span>
                {patientFinancial && patientFinancial.entries && patientFinancial.entries.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 text-[10px]">
                    {patientFinancial.entries.length}
                  </span>
                )}
              </button>
            </div>

            {/* Content Section */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
              
              {modalTab === 'clinical' ? (
                <>
                  {/* Quick Action: Write Prescription */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        const pat = patientDetail.patient;
                        setSelectedPatientId(null);
                        if (onWritePrescription) {
                          onWritePrescription({
                            patientId: pat.id,
                            patientName: pat.name,
                            patientAge: pat.age,
                            patientGender: pat.gender,
                            patientPhone: pat.phone,
                            patientAllergies: pat.allergies,
                            patientChronic: pat.chronic_conditions,
                            notes: pat.reason_for_visit
                          });
                        }
                      }}
                      className="btn-primary text-xs flex items-center gap-1.5 py-2 px-4 shadow-sm bg-teal-700 hover:bg-teal-800"
                    >
                      <FileText className="w-4 h-4" /> + Write New Prescription
                    </button>
                  </div>

                  {/* Medical Overview Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    
                    {/* Allergies Box */}
                    <div className={`p-4 rounded-2xl border ${
                      patientDetail.patient.allergies && patientDetail.patient.allergies !== 'None'
                        ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-100'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <ShieldAlert className={`w-4 h-4 ${
                          patientDetail.patient.allergies && patientDetail.patient.allergies !== 'None' ? 'text-rose-600' : 'text-slate-400'
                        }`} />
                        <span className="text-xs font-bold uppercase tracking-wider">Documented Drug Allergies</span>
                      </div>
                      <p className="text-xs font-bold mt-1">
                        {patientDetail.patient.allergies || 'None reported'}
                      </p>
                    </div>

                    {/* Chronic Conditions Box */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                      <div className="flex items-center gap-2 mb-1">
                        <HeartPulse className="w-4 h-4 text-teal-600" />
                        <span className="text-xs font-bold uppercase tracking-wider">Chronic Conditions</span>
                      </div>
                      <p className="text-xs font-semibold mt-1">
                        {patientDetail.patient.chronic_conditions || 'None'}
                      </p>
                    </div>
                  </div>

                  {/* Current Active Medicines */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="w-4 h-4 text-medblue-600" />
                      <span className="text-xs font-bold uppercase tracking-wider">Active Current Medications</span>
                    </div>
                    <p className="text-xs font-semibold mt-1">
                      {patientDetail.patient.current_medicines || 'None'}
                    </p>
                  </div>

                  {/* Doctor's Confidential Private Notes */}
                  <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
                    <div className="flex items-center gap-2 mb-1 text-xs font-bold text-amber-900 dark:text-amber-200">
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Private Clinical Notes (Confidential to Physician)</span>
                    </div>
                    <p className="text-xs text-amber-950 dark:text-amber-100 italic leading-relaxed">
                      {patientDetail.patient.private_notes || "No private notes added yet. Click 'Edit Record' to add confidential clinical notes."}
                    </p>
                  </div>

                  {/* REAL PRESCRIPTIONS TIMELINE (STEP 3 INTEGRATION - NEWEST FIRST) */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                        <FileText className="w-4 h-4 text-teal-600" />
                        Prescriptions History ({patientDetail.timeline.prescriptions?.length || 0})
                      </span>
                      <span className="text-[11px] text-teal-700 font-semibold font-mono">Newest First</span>
                    </h4>

                    {patientDetail.timeline.prescriptions && patientDetail.timeline.prescriptions.length > 0 ? (
                      <div className="space-y-3 border-l-2 border-teal-500 pl-4 ml-2">
                        {patientDetail.timeline.prescriptions.map((rx) => (
                          <div
                            key={rx.id}
                            className="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2 hover:border-teal-500/50 transition-all"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded border border-teal-200">
                                  {rx.prescription_no || 'RX-LIVE'}
                                </span>
                                <span className="text-xs text-slate-500">
                                  {rx.created_at ? new Date(rx.created_at).toLocaleDateString() : 'Recent'}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                                  rx.status === 'final' 
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                                }`}>
                                  {rx.status === 'final' ? 'Locked & Final' : 'Draft'}
                                </span>

                                {rx.status === 'final' && (
                                  <button
                                    onClick={() => setSelectedRxForWhatsApp(rx)}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1 border border-emerald-200"
                                    title="Send secure expiring link to patient via WhatsApp"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>WhatsApp</span>
                                  </button>
                                )}

                                <button
                                  onClick={() => handlePreviewPrescription(rx.id)}
                                  className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 text-xs font-bold flex items-center gap-1"
                                >
                                  <Eye className="w-3.5 h-3.5" /> View Rx
                                </button>
                              </div>
                            </div>

                            <div>
                              <p className="text-xs font-bold text-slate-900 dark:text-white">
                                Diagnosis: {rx.diagnosis || 'Clinical Review'}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {Array.isArray(rx.items) ? rx.items.length : 0} Medicines Prescribed
                                {rx.tests_advised ? ` • Tests: ${rx.tests_advised}` : ''}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center text-xs text-slate-400 italic">
                        No past prescriptions issued for this patient yet.
                      </div>
                    )}
                  </div>

                  {/* WhatsApp Sent History */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
                        <MessageSquare className="w-4 h-4 text-emerald-600" />
                        WhatsApp Dispatches & Delivery Logs ({patientMessageLogs.length})
                      </span>
                      <span className="text-[11px] text-emerald-700 font-semibold font-mono">Live Tracking</span>
                    </h4>

                    {patientMessageLogs.length > 0 ? (
                      <div className="space-y-2.5">
                        {patientMessageLogs.map((log) => (
                          <div
                            key={log.id}
                            className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-700 text-xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-800 dark:text-slate-100">{log.to_number}</span>
                                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-teal-100 text-teal-800">
                                  {log.type}
                                </span>
                              </div>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                log.status === 'read' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                log.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                log.status === 'failed' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                                'bg-purple-50 text-purple-700 border border-purple-200'
                              }`}>
                                {log.status}
                              </span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 line-clamp-1">{log.message_text}</p>
                            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                              <span>{new Date(log.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                              {log.prescription_id && (
                                <span>Downloads: <strong>{log.share_download_count || 0}</strong></span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">
                        No WhatsApp dispatches recorded for this patient yet.
                      </p>
                    )}
                  </div>

                  {/* Encounters Timeline */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                      <span>Visit Encounters Timeline ({patientDetail.timeline.appointments.length} Total Visits)</span>
                      <span className="text-[11px] text-teal-700 font-semibold font-mono">Newest First</span>
                    </h4>

                    {patientDetail.timeline.appointments.length > 0 ? (
                      <div className="space-y-3 border-l-2 border-slate-300 dark:border-slate-700 pl-4 ml-2">
                        {patientDetail.timeline.appointments.map((apt) => (
                          <div
                            key={apt.id}
                            className="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 shadow-sm space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                {apt.date} • {apt.start_time} - {apt.end_time}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                apt.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700' :
                                apt.status === 'completed' ? 'bg-blue-50 text-blue-700' :
                                apt.status === 'cancelled' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                              }`}>
                                {apt.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-700 dark:text-slate-300">
                              <strong>Encounter Notes:</strong> {apt.notes || 'Routine consultation encounter'}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No past clinical visits recorded.</p>
                    )}
                  </div>
                </>
              ) : (
                /* FINANCIAL HISTORY TAB */
                <div className="space-y-5">
                  {/* Financial Summary Cards */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                      <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider block mb-1">
                        Total Paid
                      </span>
                      <span className="text-lg sm:text-xl font-black text-emerald-800 dark:text-emerald-200">
                        PKR {(patientFinancial?.summary?.total_paid || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800">
                      <span className="text-[11px] font-bold text-teal-700 dark:text-teal-300 uppercase tracking-wider block mb-1">
                        Total Charges
                      </span>
                      <span className="text-lg sm:text-xl font-black text-teal-800 dark:text-teal-200">
                        PKR {(patientFinancial?.summary?.total_charges || patientFinancial?.summary?.total_paid || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                      <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider block mb-1">
                        Balance Due
                      </span>
                      <span className="text-lg sm:text-xl font-black text-amber-800 dark:text-amber-200">
                        PKR {(patientFinancial?.summary?.balance_due || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {patientFinancial?.summary?.last_payment && (
                    <div className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <span>Last Payment: <strong>{new Date(patientFinancial.summary.last_payment.date).toLocaleDateString()}</strong> ({patientFinancial.summary.last_payment.payment_method})</span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">PKR {patientFinancial.summary.last_payment.amount?.toLocaleString()}</span>
                    </div>
                  )}

                  {/* Transactions List */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                      <span>Financial Ledger Transactions ({patientFinancial?.entries?.length || 0})</span>
                      <span className="text-[11px] text-teal-700 font-semibold font-mono">Newest First</span>
                    </h4>

                    {patientFinancial?.entries && patientFinancial.entries.length > 0 ? (
                      <div className="space-y-2.5">
                        {patientFinancial.entries.map((entry) => (
                          <div
                            key={entry.id}
                            className="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between gap-3 hover:border-teal-500/40 transition-all"
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                                entry.type === 'cash_in'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300'
                              }`}>
                                {entry.type === 'cash_in' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                    {entry.category || entry.type}
                                  </h5>
                                  <span className="text-[10px] font-mono text-slate-400">
                                    {entry.transaction_id}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5">{entry.description || 'Medical fee transaction'}</p>
                                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                                  <span>{entry.date} {entry.time ? `• ${entry.time}` : ''}</span>
                                  <span>•</span>
                                  <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                                    {entry.payment_method}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="text-right flex flex-col items-end gap-1.5 shrink-0">
                              <span className={`text-sm font-black ${
                                entry.type === 'cash_in' ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
                              }`}>
                                {entry.type === 'cash_in' ? '+' : '−'} PKR {(entry.amount || 0).toLocaleString()}
                              </span>
                              
                              {entry.type === 'cash_in' && (
                                <button
                                  onClick={() => setReceiptEntry(entry)}
                                  className="px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300 font-bold text-[11px] rounded-lg border border-teal-200 dark:border-teal-800 flex items-center gap-1 transition-colors"
                                >
                                  <Receipt className="w-3 h-3" />
                                  <span>Receipt</span>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 text-center text-xs text-slate-400 italic">
                        No financial entries recorded for this patient yet. Patient payments added via Doctor Ledger or Consultation will appear here.
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

      {/* EDIT PATIENT MEDICAL HISTORY & PRIVATE NOTES MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 overflow-hidden">
            
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-teal-400" />
                <span>Edit Medical History & Notes</span>
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-white/80 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    value={editForm.age}
                    onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Phone (Pakistani)
                  </label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-rose-600 mb-1">
                  Known Drug Allergies
                </label>
                <input
                  type="text"
                  placeholder="e.g. Penicillin, Sulfa, NSAIDs (or None)"
                  value={editForm.allergies}
                  onChange={(e) => setEditForm({ ...editForm, allergies: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20 text-rose-900 dark:text-rose-100 outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Chronic Medical Conditions
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hypertension, Diabetes, Asthma..."
                  value={editForm.chronic_conditions}
                  onChange={(e) => setEditForm({ ...editForm, chronic_conditions: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Active Current Medications
                </label>
                <input
                  type="text"
                  placeholder="e.g. Glucophage 500mg, Norvasc 5mg..."
                  value={editForm.current_medicines}
                  onChange={(e) => setEditForm({ ...editForm, current_medicines: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-700 dark:text-amber-400 mb-1">
                  Private Physician Notes (Confidential)
                </label>
                <textarea
                  rows={3}
                  placeholder="Clinical observations, pending lab reviews, differential diagnosis notes..."
                  value={editForm.private_notes}
                  onChange={(e) => setEditForm({ ...editForm, private_notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-100 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="btn-primary text-xs py-2 px-5 bg-teal-700 hover:bg-teal-800"
                >
                  {savingEdit ? 'Saving...' : 'Save Patient Profile'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Read-only Prescription Preview Modal */}
      {selectedRxForPreview && (
        <PrescriptionPreviewModal
          isOpen={!!selectedRxForPreview}
          onClose={() => setSelectedRxForPreview(null)}
          prescription={selectedRxForPreview}
          doctor={currentDoctor}
        />
      )}

      {/* Step 5: Send via WhatsApp Modal */}
      {selectedRxForWhatsApp && (
        <SendWhatsAppModal
          isOpen={Boolean(selectedRxForWhatsApp)}
          onClose={() => setSelectedRxForWhatsApp(null)}
          prescription={selectedRxForWhatsApp}
          patient={patientDetail?.patient || { name: selectedRxForWhatsApp.patient_name, phone: selectedRxForWhatsApp.patient_phone, consent_given: true }}
          type="prescription"
          onSentSuccess={() => {
            setSelectedRxForWhatsApp(null);
            if (selectedPatientId) {
              handleOpenPatient(selectedPatientId);
            }
          }}
        />
      )}

      {/* Patient Receipt Modal */}
      {receiptEntry && (
        <PatientReceiptModal
          isOpen={Boolean(receiptEntry)}
          onClose={() => setReceiptEntry(null)}
          entry={receiptEntry}
        />
      )}

    </div>
  );
}

