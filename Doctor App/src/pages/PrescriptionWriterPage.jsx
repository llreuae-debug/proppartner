import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Sparkles, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  Search, 
  Check, 
  Calendar, 
  HeartPulse, 
  Activity, 
  Printer, 
  Send, 
  BookmarkPlus, 
  FolderOpen, 
  AlertCircle,
  Stethoscope,
  ChevronDown,
  ChevronUp,
  X,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  Copy,
  Lock,
  Save,
  Clock,
  ArrowUpDown,
  GripVertical,
  Pill,
  HelpCircle,
  RefreshCw,
  Database,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import PrescriptionPreviewModal from '../components/PrescriptionPreviewModal';
import AIClinicalAssistantModal from '../components/AIClinicalAssistantModal';
import MedicineRowCard from '../components/prescriptions/MedicineRowCard';
import FavoritesAndTemplatesBar from '../components/prescriptions/FavoritesAndTemplatesBar';
import PrescriptionSafetyAlerts from '../components/prescriptions/PrescriptionSafetyAlerts';

export default function PrescriptionWriterPage({ prefillAppointment, onResetPrefill, initialPrescriptionId = null }) {
  const { currentDoctor } = useAuth();
  const { t } = useLanguage();

  // Patients & Templates & Meta Data
  const [patients, setPatients] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [dbMeta, setDbMeta] = useState({
    source: 'Pakistan National Formulary & DRAP Registered Database',
    last_updated: '2026-09-30',
    total_medicines: 35
  });
  
  // Selected Patient Context
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('Male');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAllergies, setPatientAllergies] = useState('None documented');
  const [chronicConditions, setChronicConditions] = useState('None');
  const [currentMedicines, setCurrentMedicines] = useState('None');
  const [appointmentId, setAppointmentId] = useState(null);

  // Prescription State
  const [prescriptionId, setPrescriptionId] = useState(initialPrescriptionId);
  const [prescriptionNo, setPrescriptionNo] = useState('');
  const [status, setStatus] = useState('draft'); // 'draft' | 'final'
  const [finalizedAt, setFinalizedAt] = useState(null);
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // Clinical Details
  const [diagnosis, setDiagnosis] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [medicines, setMedicines] = useState([
    {
      id: 'med-row-1',
      medicine_id: 'med-pak-1',
      medicine_name: 'Daktarin',
      name: 'Daktarin',
      generic_name: 'Miconazole Nitrate',
      generic: 'Miconazole Nitrate',
      strength: '2%',
      available_strengths: ['2%'],
      form: 'Cream',
      dosage_form: 'Cream',
      route: 'Topical',
      dose: 'Apply thin layer',
      dose_amount: 1,
      dose_unit: 'application',
      frequency: 'BD — Twice daily',
      duration: '5 Days',
      duration_amount: 5,
      duration_unit: 'Days',
      quantity: 1,
      quantity_unit: 'tube',
      instructions: 'After meals',
      manufacturer: 'Janssen / Johnson & Johnson Pakistan',
      therapeutic_class: 'Topical Antifungal',
      drug_class: 'Imidazoles'
    }
  ]);

  // Lab Tests & Advice
  const [labTests, setLabTests] = useState([]);
  const [customLabInput, setCustomLabInput] = useState('');
  const [advice, setAdvice] = useState('Take medications strictly on time. Drink plenty of water and get adequate rest.');
  const [followUpDate, setFollowUpDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });

  // Modals & Warnings
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isCustomMedModalOpen, setIsCustomMedModalOpen] = useState(false);
  const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState(false);
  const [finalizeAcknowledged, setFinalizeAcknowledged] = useState(false);
  const [markAppointmentCompleted, setMarkAppointmentCompleted] = useState(true);
  const [consultationFee, setConsultationFee] = useState(2000);
  const [paymentStatus, setPaymentStatus] = useState('Paid'); // 'Paid', 'Partially Paid', 'Unpaid', 'Waived'
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [savedPrescription, setSavedPrescription] = useState(null);
  const [savingRx, setSavingRx] = useState(false);

  // Custom Medicine Form State
  const [customMed, setCustomMed] = useState({
    brand_name: '',
    generic_name: '',
    strength: '500 mg',
    dosage_form: 'Tablet',
    default_dose: '1 tab',
    default_frequency: 'BD — Twice daily',
    route: 'Oral',
    manufacturer: 'Local Pharma',
    therapeutic_class: 'Custom Prescription'
  });

  // Load initial data (Patients, Templates, Formulary Meta)
  useEffect(() => {
    Promise.all([
      api.getPatients().catch(() => ({ patients: [] })),
      api.getTemplates().catch(() => ({ templates: [] })),
      api.getMedicinesMeta().catch(() => null)
    ]).then(([patRes, tplRes, metaRes]) => {
      if (patRes?.patients) setPatients(patRes.patients);
      if (tplRes?.templates) setTemplates(tplRes.templates);
      if (metaRes?.success) {
        setDbMeta({
          source: metaRes.source || 'Pakistan National Formulary & DRAP Registered Database',
          last_updated: metaRes.last_updated || '2026-09-30',
          total_medicines: metaRes.total_medicines || 35
        });
      }
    });
  }, [currentDoctor]);

  // Handle prefill from Appointment
  useEffect(() => {
    if (prefillAppointment) {
      setAppointmentId(prefillAppointment.id);
      setPatientName(prefillAppointment.patientName || '');
      setPatientAge(prefillAppointment.patientAge || '');
      setPatientGender(prefillAppointment.patientGender || 'Male');
      setPatientPhone(prefillAppointment.patientPhone || '');
      setSymptoms(prefillAppointment.notes || prefillAppointment.medicalHistory?.reasonForVisit || '');
      setPatientAllergies(prefillAppointment.patientAllergies || prefillAppointment.medicalHistory?.allergies || 'None documented');
      setChronicConditions(prefillAppointment.patientChronic || prefillAppointment.medicalHistory?.chronicConditions || 'None');
      setCurrentMedicines(prefillAppointment.medicalHistory?.currentMedicines || 'None');
      if (prefillAppointment.patientId) {
        setSelectedPatientId(prefillAppointment.patientId);
      }
    }
  }, [prefillAppointment]);

  // Fetch initial prescription if provided
  useEffect(() => {
    if (initialPrescriptionId) {
      api.getPrescription(initialPrescriptionId).then(res => {
        if (res.prescription) {
          const rx = res.prescription;
          setPrescriptionId(rx.id);
          setPrescriptionNo(rx.prescription_no);
          setStatus(rx.status);
          setFinalizedAt(rx.finalized_at);
          setSelectedPatientId(rx.patient_id);
          setAppointmentId(rx.appointment_id);
          setDiagnosis(rx.diagnosis || '');
          setSymptoms(rx.symptoms || '');
          setMedicines((rx.items || []).map((item, idx) => ({
            id: item.id || `rx-med-${idx}`,
            medicine_id: item.medicine_id || null,
            medicine_name: item.medicine_name || item.name,
            name: item.medicine_name || item.name,
            generic_name: item.generic_name || item.generic || '',
            generic: item.generic_name || item.generic || '',
            strength: item.strength || '500 mg',
            available_strengths: item.available_strengths || [item.strength || '500 mg'],
            form: item.form || item.dosage_form || 'Tablet',
            dosage_form: item.dosage_form || item.form || 'Tablet',
            route: item.route || 'Oral',
            dose: item.dose || '1 tab',
            frequency: item.frequency || 'BD — Twice daily',
            duration: item.duration || '5 Days',
            quantity: item.quantity || null,
            instructions: item.instructions || 'After meals'
          })));
          setTestsFromText(rx.tests_advised || '');
          setAdvice(rx.advice || '');
          if (rx.follow_up_date) setFollowUpDate(rx.follow_up_date);

          if (rx.patient) {
            setSelectedPatient(rx.patient);
            setPatientName(rx.patient.name);
            setPatientAge(rx.patient.age);
            setPatientGender(rx.patient.gender);
            setPatientPhone(rx.patient.phone);
            setPatientAllergies(rx.patient.allergies || 'None documented');
            setChronicConditions(rx.patient.chronic_conditions || 'None');
            setCurrentMedicines(rx.patient.current_medicines || 'None');
          }
        }
      }).catch(err => console.error("Error loading prescription:", err));
    }
  }, [initialPrescriptionId]);

  function setTestsFromText(text) {
    if (!text) return;
    const items = text.split(',').map(s => s.trim()).filter(Boolean);
    setLabTests(items);
  }

  // Handle Patient selection from dropdown
  const handlePatientSelect = (patientId) => {
    setSelectedPatientId(patientId);
    if (!patientId) {
      setSelectedPatient(null);
      setPatientName('');
      setPatientAge('');
      setPatientGender('Male');
      setPatientPhone('');
      setPatientAllergies('None documented');
      setChronicConditions('None');
      setCurrentMedicines('None');
      return;
    }
    const found = patients.find(p => p.id === patientId);
    if (found) {
      setSelectedPatient(found);
      setPatientName(found.name);
      setPatientAge(found.age);
      setPatientGender(found.gender);
      setPatientPhone(found.phone);
      setPatientAllergies(found.allergies || 'None documented');
      setChronicConditions(found.chronic_conditions || 'None');
      setCurrentMedicines(found.current_medicines || 'None');
    }
  };

  // Medicine Row State Actions
  const handleAddMedicineRow = () => {
    const newId = `med-row-${Date.now()}`;
    setMedicines(prev => [
      ...prev,
      {
        id: newId,
        medicine_name: '',
        name: '',
        generic_name: '',
        generic: '',
        strength: '',
        available_strengths: [],
        form: 'Tablet',
        dosage_form: 'Tablet',
        route: 'Oral',
        dose: '1 tab',
        frequency: 'BD — Twice daily',
        duration: '5 Days',
        quantity: 10,
        instructions: 'After meals'
      }
    ]);
  };

  const handleMedicineChange = (index, updatedItem) => {
    setMedicines(prev => {
      const next = [...prev];
      next[index] = updatedItem;
      return next;
    });
  };

  const handleDuplicateMedicineRow = (index) => {
    const itemToClone = medicines[index];
    const cloned = {
      ...itemToClone,
      id: `med-row-${Date.now()}`
    };
    setMedicines(prev => {
      const next = [...prev];
      next.splice(index + 1, 0, cloned);
      return next;
    });
  };

  const handleRemoveMedicineRow = (index) => {
    if (medicines.length <= 1) {
      setMedicines([{
        id: `med-row-${Date.now()}`,
        medicine_name: '',
        name: '',
        generic_name: '',
        generic: '',
        strength: '',
        available_strengths: [],
        form: 'Tablet',
        dosage_form: 'Tablet',
        route: 'Oral',
        dose: '1 tab',
        frequency: 'BD — Twice daily',
        duration: '5 Days',
        quantity: 10,
        instructions: 'After meals'
      }]);
      return;
    }
    setMedicines(prev => prev.filter((_, i) => i !== index));
  };

  const handleMoveMedicineRow = (index, delta) => {
    const newIndex = index + delta;
    if (newIndex < 0 || newIndex >= medicines.length) return;
    setMedicines(prev => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[newIndex];
      next[newIndex] = temp;
      return next;
    });
  };

  // Select Favorite medicine directly into row
  const handleSelectFavorite = (fav) => {
    // If only 1 empty row, replace it. Otherwise append.
    if (medicines.length === 1 && !medicines[0].medicine_name && !medicines[0].name) {
      handleMedicineChange(0, {
        id: medicines[0].id,
        medicine_id: fav.id,
        medicine_name: fav.brand_name,
        name: fav.brand_name,
        generic_name: fav.generic_name,
        generic: fav.generic_name,
        strength: fav.strength,
        available_strengths: fav.available_strengths || [fav.strength],
        form: fav.dosage_form || 'Tablet',
        dosage_form: fav.dosage_form || 'Tablet',
        route: fav.route || 'Oral',
        dose: fav.default_dose || '1 tab',
        frequency: fav.default_frequency || 'BD — Twice daily',
        duration: fav.default_duration || '5 Days',
        quantity: 10,
        instructions: 'After meals',
        manufacturer: fav.manufacturer,
        therapeutic_class: fav.therapeutic_class
      });
    } else {
      setMedicines(prev => [
        ...prev,
        {
          id: `med-row-${Date.now()}`,
          medicine_id: fav.id,
          medicine_name: fav.brand_name,
          name: fav.brand_name,
          generic_name: fav.generic_name,
          generic: fav.generic_name,
          strength: fav.strength,
          available_strengths: fav.available_strengths || [fav.strength],
          form: fav.dosage_form || 'Tablet',
          dosage_form: fav.dosage_form || 'Tablet',
          route: fav.route || 'Oral',
          dose: fav.default_dose || '1 tab',
          frequency: fav.default_frequency || 'BD — Twice daily',
          duration: fav.default_duration || '5 Days',
          quantity: 10,
          instructions: 'After meals',
          manufacturer: fav.manufacturer,
          therapeutic_class: fav.therapeutic_class
        }
      ]);
    }
  };

  // Apply Template
  const handleApplyTemplate = (tpl) => {
    if (tpl.diagnosis) setDiagnosis(tpl.diagnosis);
    if (tpl.advice) setAdvice(tpl.advice);
    if (tpl.tests_advised) setTestsFromText(tpl.tests_advised);
    if (Array.isArray(tpl.items) && tpl.items.length > 0) {
      setMedicines(tpl.items.map((it, idx) => ({
        id: `med-tpl-${Date.now()}-${idx}`,
        medicine_name: it.medicine_name || it.name,
        name: it.medicine_name || it.name,
        generic_name: it.generic_name || it.generic || '',
        generic: it.generic_name || it.generic || '',
        strength: it.strength || '500 mg',
        available_strengths: [it.strength || '500 mg'],
        form: it.form || it.dosage_form || 'Tablet',
        dosage_form: it.dosage_form || it.form || 'Tablet',
        route: it.route || 'Oral',
        dose: it.dose || '1 tab',
        frequency: it.frequency || 'BD — Twice daily',
        duration: it.duration || '5 Days',
        quantity: it.quantity || null,
        instructions: it.instructions || 'After meals'
      })));
    }
  };

  // Save current prescription as reusable template
  const handleSaveCurrentAsTemplate = async (tplName) => {
    const templateData = {
      name: tplName,
      diagnosis: diagnosis || 'General Consultation',
      items: medicines.map(m => ({
        medicine_name: m.medicine_name || m.name,
        generic_name: m.generic_name || m.generic,
        strength: m.strength,
        form: m.form || m.dosage_form,
        dosage_form: m.dosage_form || m.form,
        route: m.route,
        dose: m.dose,
        frequency: m.frequency,
        duration: m.duration,
        quantity: m.quantity,
        instructions: m.instructions
      })),
      tests_advised: labTests.join(', '),
      advice
    };
    const res = await api.createTemplate(templateData);
    if (res.success) {
      const updated = await api.getTemplates();
      setTemplates(updated.templates || []);
    }
  };

  // AI Suggestions Handler
  const handleApplyAISuggestions = (suggestions) => {
    if (suggestions.diagnosis) setDiagnosis(suggestions.diagnosis);
    if (suggestions.symptoms) setSymptoms(suggestions.symptoms);
    if (suggestions.advice) setAdvice(suggestions.advice);
    if (Array.isArray(suggestions.medicines) && suggestions.medicines.length > 0) {
      setMedicines(suggestions.medicines.map((m, idx) => ({
        id: `ai-med-${idx}`,
        medicine_name: m.medicine_name || m.name,
        name: m.medicine_name || m.name,
        generic_name: m.generic_name || '',
        generic: m.generic_name || '',
        strength: m.strength || 'Standard',
        available_strengths: [m.strength || 'Standard'],
        form: m.form || 'Tablet',
        dosage_form: m.form || 'Tablet',
        route: m.route || 'Oral',
        dose: m.dose || '1 tab',
        frequency: m.frequency || 'BD — Twice daily',
        duration: m.duration || '5 Days',
        instructions: m.instructions || 'After meals'
      })));
    }
    if (Array.isArray(suggestions.tests) && suggestions.tests.length > 0) {
      setLabTests(suggestions.tests);
    }
  };

  // Add & Remove Lab Tests
  const handleAddLabTest = (testName) => {
    if (!testName || labTests.includes(testName)) return;
    setLabTests(prev => [...prev, testName]);
  };

  const handleRemoveLabTest = (testName) => {
    setLabTests(prev => prev.filter(t => t !== testName));
  };

  // Save Draft Silently / Auto-save
  const saveDraftSilently = async () => {
    if (!selectedPatientId) return;
    try {
      setIsAutoSaving(true);
      const res = await api.savePrescriptionDraft({
        id: prescriptionId,
        patient_id: selectedPatientId,
        appointment_id: appointmentId,
        diagnosis,
        symptoms,
        items: medicines.map((m, idx) => ({
          medicine_name: m.medicine_name || m.name,
          generic_name: m.generic_name || m.generic,
          strength: m.strength,
          form: m.form || m.dosage_form,
          dosage_form: m.dosage_form || m.form,
          route: m.route,
          dose: m.dose,
          frequency: m.frequency,
          duration: m.duration,
          quantity: m.quantity,
          instructions: m.instructions,
          sort_order: idx + 1
        })),
        tests_advised: labTests.join(', '),
        advice,
        follow_up_date: followUpDate
      });
      if (res.success) {
        setPrescriptionId(res.prescription.id);
        setPrescriptionNo(res.prescription.prescription_no);
        setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    } catch (err) {
      console.warn("Silent auto-save notice:", err.message);
    } finally {
      setIsAutoSaving(false);
    }
  };

  const handleManualSaveDraft = async () => {
    if (!selectedPatientId) {
      alert("Please select or assign a patient before saving draft.");
      return;
    }
    setSavingRx(true);
    await saveDraftSilently();
    setSavingRx(false);
    alert("Prescription draft saved successfully.");
  };

  // Finalize Prescription
  const handleFinalizeClick = () => {
    if (!selectedPatientId) {
      alert("Please select a patient before finalizing.");
      return;
    }
    if (medicines.length === 0 || !(medicines[0].medicine_name || medicines[0].name).trim()) {
      alert("Please prescribe at least one valid medication before finalizing.");
      return;
    }
    setIsFinalizeModalOpen(true);
  };

  const executeFinalize = async () => {
    try {
      setSavingRx(true);
      const res = await api.finalizePrescription(prescriptionId || `rx-${Date.now()}`, {
        patient_id: selectedPatientId,
        appointment_id: appointmentId,
        completeAppointment: markAppointmentCompleted,
        diagnosis: diagnosis || 'General Clinical Consultation',
        symptoms,
        items: medicines.map((m, idx) => ({
          medicine_name: m.medicine_name || m.name,
          generic_name: m.generic_name || m.generic,
          strength: m.strength,
          form: m.form || m.dosage_form,
          dosage_form: m.dosage_form || m.form,
          route: m.route,
          dose: m.dose,
          frequency: m.frequency,
          duration: m.duration,
          quantity: m.quantity,
          instructions: m.instructions,
          sort_order: idx + 1
        })),
        tests_advised: labTests.join(', '),
        advice,
        follow_up_date: followUpDate
      });

      if (res.success) {
        setStatus('final');
        setPrescriptionId(res.prescription.id);
        setPrescriptionNo(res.prescription.prescription_no);
        setFinalizedAt(res.prescription.finalized_at);
        setSavedPrescription(res.prescription);

        // Connect consultation fee with Doctor Ledger if Paid or Partially Paid
        if ((paymentStatus === 'Paid' || paymentStatus === 'Partially Paid') && Number(consultationFee) > 0) {
          try {
            await api.createLedgerEntry({
              patient_id: selectedPatientId,
              patient_name: selectedPatient?.name || patientName,
              patient_code: selectedPatient?.patient_code || 'PAT-00' + selectedPatientId,
              patient_phone: selectedPatient?.phone || patientPhone,
              visit_id: appointmentId || res.prescription.id,
              type: 'cash_in',
              category: 'Consultation',
              description: `Consultation Fee (${paymentStatus}) - Rx #${res.prescription.prescription_no || prescriptionNo}`,
              amount: Number(consultationFee),
              payment_method: paymentMethod,
              reference: res.prescription.prescription_no,
              remarks: `Consultation billing for ${selectedPatient?.name || patientName} (${diagnosis || 'Consultation'})`
            });
          } catch (finErr) {
            console.warn("Ledger entry creation notice:", finErr);
          }
        }

        setIsFinalizeModalOpen(false);
        setIsPreviewOpen(true);
      }
    } catch (err) {
      alert("Failed to finalize prescription: " + err.message);
    } finally {
      setSavingRx(false);
    }
  };

  // Duplicate Past / Finalized Prescription into New Draft
  const handleDuplicatePrescription = async () => {
    if (!prescriptionId) return;
    try {
      setSavingRx(true);
      const res = await api.duplicatePrescription(prescriptionId);
      if (res.success) {
        const newRx = res.prescription;
        setPrescriptionId(newRx.id);
        setPrescriptionNo(newRx.prescription_no);
        setStatus('draft');
        setFinalizedAt(null);
        alert(`Created new editable draft (${newRx.prescription_no}) from previous prescription.`);
      }
    } catch (err) {
      alert("Error duplicating prescription: " + err.message);
    } finally {
      setSavingRx(false);
    }
  };

  // Custom Medicine Submission
  const handleCreateCustomMedicine = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createCustomMedicine(customMed);
      if (res.success) {
        setIsCustomMedModalOpen(false);
        handleSelectFavorite(res.medicine);
        alert(`Added "${customMed.brand_name}" to doctor formulary!`);
      }
    } catch (err) {
      alert("Failed to add custom medicine: " + err.message);
    }
  };

  const commonLabPresets = [
    "Complete Blood Count (CBC)",
    "Urine Routine Examination (R/E)",
    "HbA1c (Glycated Hemoglobin)",
    "Fasting Blood Sugar (FBS)",
    "Serum Creatinine & eGFR",
    "Lipid Profile (Fasting)",
    "Liver Function Tests (LFTs)",
    "Serum Uric Acid",
    "Thyroid Profile (TSH, FT4)",
    "Chest X-Ray PA View",
    "Ultrasound Whole Abdomen",
    "ECG 12-Lead"
  ];

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      
      {/* Top Header & Workstation Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800 shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Prescription Workstation
                </h1>
                {prescriptionNo && (
                  <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {prescriptionNo}
                  </span>
                )}
                {status === 'final' ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                    <Lock className="w-3 h-3" /> Locked & Finalized
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                    <Clock className="w-3 h-3" /> Draft
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                <span>Practicing Physician: <strong className="text-slate-700 dark:text-slate-200">{currentDoctor?.name}</strong></span>
                {lastSavedTime && (
                  <span className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">
                    • Auto-saved at {lastSavedTime}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto justify-end">
          {status === 'final' ? (
            <>
              <button
                onClick={handleDuplicatePrescription}
                className="btn-secondary text-xs flex items-center gap-1.5 py-2 px-3.5 bg-medblue-50 text-medblue-700 border-medblue-200 hover:bg-medblue-100"
              >
                <Copy className="w-4 h-4" /> Duplicate into New Draft
              </button>
              <button
                onClick={() => {
                  setSavedPrescription({
                    id: prescriptionId,
                    prescription_no: prescriptionNo,
                    status: 'final',
                    finalized_at: finalizedAt,
                    patient: selectedPatient || { name: patientName, age: patientAge, gender: patientGender, phone: patientPhone, allergies: patientAllergies },
                    doctor: currentDoctor,
                    diagnosis,
                    symptoms,
                    items: medicines,
                    tests_advised: labTests.join(', '),
                    advice,
                    follow_up_date: followUpDate
                  });
                  setIsPreviewOpen(true);
                }}
                className="btn-primary text-xs flex items-center gap-1.5 py-2 px-4 shadow-md bg-teal-700 hover:bg-teal-800"
              >
                <Printer className="w-4 h-4" /> Print / Share PDF
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsCustomMedModalOpen(true)}
                className="btn-secondary text-xs flex items-center gap-1.5 py-2 px-3"
              >
                <Pill className="w-4 h-4 text-indigo-600" /> + Custom Med
              </button>

              <button
                type="button"
                onClick={handleManualSaveDraft}
                disabled={savingRx}
                className="btn-secondary text-xs flex items-center gap-1.5 py-2 px-3"
              >
                <Save className="w-4 h-4 text-slate-600" /> {savingRx ? 'Saving...' : 'Save Draft'}
              </button>

              <button
                type="button"
                onClick={handleFinalizeClick}
                disabled={savingRx}
                className="btn-primary text-xs flex items-center gap-1.5 py-2 px-4 shadow-md bg-teal-700 hover:bg-teal-800"
              >
                <Lock className="w-4 h-4" /> Finalize Rx
              </button>
            </>
          )}
        </div>
      </div>

      {/* 1. COMPACT PATIENT SUMMARY & SELECTOR (Matches Screenshot) */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
            <Activity className="w-4 h-4 text-teal-600" /> Patient Medical Profile
          </div>
          
          {/* Patient Quick Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Select Registered Patient:</span>
            <select
              disabled={status === 'final'}
              value={selectedPatientId}
              onChange={(e) => handlePatientSelect(e.target.value)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 outline-none"
            >
              <option value="">-- Choose Patient --</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.age}y {p.gender}) - {p.phone}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Compact Patient Details Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60">
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">PATIENT NAME & DEMOGRAPHICS</label>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
              {patientName || "No Patient Selected"}
            </p>
            <p className="text-xs text-slate-500">
              {patientAge ? `${patientAge} yrs • ${patientGender}` : 'Age & Gender'}
            </p>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">CONTACT NUMBER</label>
            <p className="text-sm font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
              {patientPhone || "N/A"}
            </p>
            {appointmentId && (
              <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 mt-1">
                Linked to Appointment
              </span>
            )}
          </div>

          {/* Allergies Highlighted in Red */}
          <div className="p-2.5 rounded-xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50">
            <label className="text-[11px] font-black text-rose-700 dark:text-rose-300 uppercase tracking-wider flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" /> KNOWN ALLERGIES
            </label>
            <p className="text-xs font-bold text-rose-900 dark:text-rose-100 mt-0.5">
              {patientAllergies || "None documented"}
            </p>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">CHRONIC CONDITIONS & MEDS</label>
            <p className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-0.5 truncate" title={chronicConditions}>
              Conditions: {chronicConditions || "None"}
            </p>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate" title={currentMedicines}>
              Current Meds: {currentMedicines || "None"}
            </p>
          </div>
        </div>
      </div>

      {/* 2. CLINICAL DIAGNOSIS & PRESENTING SYMPTOMS */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-teal-600" /> Clinical Diagnosis
              </label>

              {/* AI Suggest Button */}
              <button
                type="button"
                disabled={status === 'final'}
                onClick={() => setIsAIModalOpen(true)}
                className="text-xs font-bold px-3 py-1 rounded-xl bg-gradient-to-r from-teal-600 to-medblue-600 hover:from-teal-700 hover:to-medblue-700 text-white shadow-sm flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-200" /> AI Suggest
              </button>
            </div>
            <input
              type="text"
              disabled={status === 'final'}
              placeholder="e.g. Acute Gastroenteritis, URTI with Pharyngitis, Type 2 Diabetes"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1.5">
              Presenting Symptoms & Clinical Complaints
            </label>
            <input
              type="text"
              disabled={status === 'final'}
              placeholder="e.g. Fever 102 F for 3 days, watery diarrhea, sore throat"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* 3. PRESCRIBED MEDICATIONS (PAKISTAN FORMULARY) */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        
        {/* Section Header with DRAP DB Status & Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center text-teal-700 dark:text-teal-300 font-bold text-xs border border-teal-200 dark:border-teal-800">
                Rx
              </div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white">
                Prescribed Medications (Pakistan Formulary)
              </h2>
            </div>
            
            {/* Live Database Architecture Badge & Timestamp */}
            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
              <span className="flex items-center gap-1 text-teal-700 dark:text-teal-400 font-semibold">
                <Database className="w-3 h-3" />
                <span>Medicine information last updated: {dbMeta.last_updated}</span>
              </span>
              <span>•</span>
              <span className="text-slate-400">DRAP Registered Database ({dbMeta.total_medicines}+ formulations)</span>
            </div>
          </div>

          {status !== 'final' && (
            <button
              type="button"
              onClick={handleAddMedicineRow}
              className="text-xs font-bold px-3.5 py-2 rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" /> Add Medicine
            </button>
          )}
        </div>

        {/* Favorites & Templates Quick Bar */}
        {status !== 'final' && (
          <FavoritesAndTemplatesBar
            onSelectFavorite={handleSelectFavorite}
            onApplyTemplate={handleApplyTemplate}
            onSaveCurrentAsTemplate={handleSaveCurrentAsTemplate}
            currentMedicinesCount={medicines.length}
          />
        )}

        {/* Clinical Safety Alert Banner (Allergies, Duplicates, Field Missing) */}
        <PrescriptionSafetyAlerts
          medicines={medicines}
          patientAllergies={patientAllergies}
          patientChronic={chronicConditions}
        />

        {/* Medicine Rows */}
        <div className="space-y-3.5">
          {medicines.map((med, index) => (
            <MedicineRowCard
              key={med.id || index}
              index={index}
              item={med}
              onChange={(updated) => handleMedicineChange(index, updated)}
              onDuplicate={() => handleDuplicateMedicineRow(index)}
              onDelete={() => handleRemoveMedicineRow(index)}
              onMoveUp={() => handleMoveMedicineRow(index, -1)}
              onMoveDown={() => handleMoveMedicineRow(index, 1)}
              isFirst={index === 0}
              isLast={index === medicines.length - 1}
              patientAllergies={patientAllergies}
              existingMedicines={medicines}
            />
          ))}
        </div>

        {/* Quick Bottom "+ Add Another Medicine" button */}
        {status !== 'final' && (
          <div className="pt-2 flex justify-center">
            <button
              type="button"
              onClick={handleAddMedicineRow}
              className="text-xs font-bold text-teal-700 dark:text-teal-300 hover:text-teal-800 bg-teal-50/70 dark:bg-teal-950/40 hover:bg-teal-100/80 px-4 py-2 rounded-xl border border-dashed border-teal-300 dark:border-teal-800 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add Another Medicine
            </button>
          </div>
        )}

      </div>

      {/* 4. LAB TESTS, ADVICE & FOLLOW-UP DATE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Diagnostic Tests Advised */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-medblue-600" /> Diagnostic Tests Advised
            </label>
            <span className="text-[11px] text-slate-400">{labTests.length} tests selected</span>
          </div>

          {/* Active Lab Badges */}
          <div className="flex flex-wrap gap-1.5 min-h-[44px] p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            {labTests.length === 0 ? (
              <span className="text-xs text-slate-400 italic">No diagnostic tests added. Click quick presets below or type custom test.</span>
            ) : (
              labTests.map((t, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800 shadow-2xs"
                >
                  {t}
                  {status !== 'final' && (
                    <button type="button" onClick={() => handleRemoveLabTest(t)} className="hover:text-rose-600 ml-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))
            )}
          </div>

          {/* Quick presets & custom input */}
          {status !== 'final' && (
            <div className="space-y-2 pt-1">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type custom test name..."
                  value={customLabInput}
                  onChange={(e) => setCustomLabInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddLabTest(customLabInput.trim());
                      setCustomLabInput('');
                    }
                  }}
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:ring-1 focus:ring-teal-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    handleAddLabTest(customLabInput.trim());
                    setCustomLabInput('');
                  }}
                  className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-1">
                {commonLabPresets.slice(0, 6).map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddLabTest(preset)}
                    className="text-[10.5px] font-medium px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 hover:text-teal-700 text-slate-600 dark:text-slate-300 transition-colors"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Patient Advice & Dietary Instructions */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
            <HeartPulse className="w-4 h-4 text-rose-600" /> Patient Advice & Dietary Instructions
          </label>

          <textarea
            rows={3}
            disabled={status === 'final'}
            placeholder="Dietary precautions, hydration advice, precautions, or exercise routine..."
            value={advice}
            onChange={(e) => setAdvice(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 outline-none resize-none font-medium leading-relaxed"
          />

          {/* Follow-up date */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Next Follow-Up Date:</span>
            </div>
            <input
              type="date"
              disabled={status === 'final'}
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none"
            />
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* MODALS */}
      {/* ==================================================== */}

      {/* 1. AI Clinical Assistant Modal */}
      <AIClinicalAssistantModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        initialDiagnosis={diagnosis}
        initialSymptoms={symptoms}
        patientAllergies={patientAllergies}
        chronicConditions={chronicConditions}
        currentMedicines={currentMedicines}
        patientAge={patientAge}
        patientGender={patientGender}
        onApplySuggestions={handleApplyAISuggestions}
      />

      {/* 2. Add Custom Medicine Modal */}
      {isCustomMedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Add Custom Medicine</h3>
              </div>
              <button onClick={() => setIsCustomMedModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomMedicine} className="p-5 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Brand Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MySpecialSyrup"
                  value={customMed.brand_name}
                  onChange={(e) => setCustomMed({ ...customMed, brand_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Generic Name / Active Molecule</label>
                <input
                  type="text"
                  placeholder="e.g. Dextromethorphan + Chlorpheniramine"
                  value={customMed.generic_name}
                  onChange={(e) => setCustomMed({ ...customMed, generic_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Strength</label>
                  <input
                    type="text"
                    value={customMed.strength}
                    onChange={(e) => setCustomMed({ ...customMed, strength: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Dosage Form</label>
                  <select
                    value={customMed.dosage_form}
                    onChange={(e) => setCustomMed({ ...customMed, dosage_form: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                  >
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Cream">Cream</option>
                    <option value="Gel">Gel</option>
                    <option value="Eye drops">Eye drops</option>
                    <option value="Inhaler">Inhaler</option>
                    <option value="Injection">Injection</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Route</label>
                  <select
                    value={customMed.route}
                    onChange={(e) => setCustomMed({ ...customMed, route: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                  >
                    <option value="Oral">Oral</option>
                    <option value="Topical">Topical</option>
                    <option value="Ophthalmic">Ophthalmic</option>
                    <option value="Inhaled">Inhaled</option>
                    <option value="IV">IV</option>
                    <option value="IM">IM</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Manufacturer</label>
                  <input
                    type="text"
                    value={customMed.manufacturer}
                    onChange={(e) => setCustomMed({ ...customMed, manufacturer: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCustomMedModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-700 text-white font-bold hover:bg-teal-800 shadow-md"
                >
                  Save to My Formulary
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Finalize & Safety Acknowledgment Modal */}
      {isFinalizeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Finalize & Lock Prescription</h3>
              </div>
              <button onClick={() => setIsFinalizeModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Finalizing this prescription assigns an official digital number, timestamps it, and permanently locks it against further edits.
              </p>

              {/* Doctor Ledger & Financial Consultation Fee Billing */}
              <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-900 dark:text-teal-200 flex items-center gap-1.5">
                    <span>Consultation Fee & Ledger Entry</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-200/60 dark:bg-teal-800 text-teal-800 dark:text-teal-200">
                    Patient Accounting
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                      Consultation Fee (PKR)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={consultationFee}
                      onChange={(e) => setConsultationFee(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-teal-300 dark:border-teal-700 font-bold text-slate-800 dark:text-slate-100 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                      Payment Status
                    </label>
                    <select
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-teal-300 dark:border-teal-700 font-bold text-slate-800 dark:text-slate-100 outline-none"
                    >
                      <option value="Paid">Paid (Cash In)</option>
                      <option value="Partially Paid">Partially Paid</option>
                      <option value="Unpaid">Unpaid</option>
                      <option value="Waived">Waived</option>
                    </select>
                  </div>
                </div>

                {(paymentStatus === 'Paid' || paymentStatus === 'Partially Paid') && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                      Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-teal-300 dark:border-teal-700 font-medium text-slate-800 dark:text-slate-100 outline-none"
                    >
                      <option value="Cash">Cash</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="JazzCash">JazzCash</option>
                      <option value="Easypaisa">Easypaisa</option>
                      <option value="Card">Card</option>
                      <option value="Cheque">Cheque</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Linked Appointment Action */}
              {appointmentId && (
                <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={markAppointmentCompleted}
                    onChange={(e) => setMarkAppointmentCompleted(e.target.checked)}
                    className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                  />
                  <span>Mark patient appointment as "Completed"</span>
                </label>
              )}

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFinalizeModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeFinalize}
                  className="px-4 py-2 rounded-xl bg-teal-700 text-white font-bold text-xs hover:bg-teal-800 flex items-center gap-1.5 shadow-md"
                >
                  <Lock className="w-4 h-4" /> Confirm & Finalize
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Prescription PDF Preview Modal */}
      {isPreviewOpen && (
        <PrescriptionPreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          prescription={savedPrescription || {
            prescription_no: prescriptionNo,
            patient: selectedPatient || { name: patientName, age: patientAge, gender: patientGender, phone: patientPhone, allergies: patientAllergies },
            doctor: currentDoctor,
            diagnosis,
            symptoms,
            items: medicines,
            tests_advised: labTests.join(', '),
            advice,
            follow_up_date: followUpDate
          }}
        />
      )}

    </div>
  );
}
