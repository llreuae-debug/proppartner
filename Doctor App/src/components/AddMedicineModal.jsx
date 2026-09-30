import React, { useState, useEffect } from 'react';
import { 
  X, 
  Pill, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  Layers, 
  Activity, 
  FileText, 
  ShieldCheck, 
  PlusCircle, 
  Sparkles,
  Loader2,
  HelpCircle
} from 'lucide-react';
import { api } from '../services/api';

const DOSAGE_FORMS = [
  "Tablet",
  "Capsule",
  "Syrup / Suspension",
  "Injection (IV/IM)",
  "Cream / Ointment",
  "Eye Drops",
  "Ear Drops",
  "Inhaler / Respules",
  "Oral Drops",
  "Sachet / Powder",
  "Suppository",
  "Lotion / Gel",
  "Infusion"
];

const ROUTES = [
  "Oral",
  "Intravenous (IV)",
  "Intramuscular (IM)",
  "Subcutaneous (SC)",
  "Topical",
  "Ophthalmic",
  "Otic",
  "Inhalation",
  "Nasal",
  "Rectal",
  "Sublingual"
];

const POPULAR_MANUFACTURERS = [
  "GlaxoSmithKline (GSK) Pakistan",
  "Getz Pharma",
  "Abbott Laboratories Pakistan",
  "The Searle Company Ltd",
  "Sami Pharmaceuticals",
  "Hilton Pharma",
  "Highnoon Laboratories",
  "Ferozsons Laboratories",
  "Martin Dow",
  "Sanofi-Aventis Pakistan",
  "PharmEvo",
  "Atco Laboratories",
  "Bosch Pharmaceuticals",
  "Novartis Pakistan",
  "Pfizer Pakistan",
  "CCL Pharmaceuticals",
  "Genix Pharma",
  "Indus Pharma",
  "Other Pakistan DRAP Registered"
];

const THERAPEUTIC_CLASSES = [
  "Analgesics & Antipyretics (Pain & Fever)",
  "Antibiotics & Anti-Infectives",
  "Cardiovascular & Antihypertensives",
  "Gastrointestinal & Proton Pump Inhibitors (PPI)",
  "Endocrine & Antidiabetic Agents",
  "Respiratory & Antiasthmatics",
  "Antihistamines & Allergy Relief",
  "Neurology & Psychiatric Agents",
  "Dermatological Agents",
  "Vitamins, Minerals & Supplements",
  "Ophthalmic & ENT Preparations",
  "Musculoskeletal & Anti-Inflammatory",
  "Pediatric Formulations",
  "General Formulary"
];

export default function AddMedicineModal({ isOpen, onClose, onMedicineAdded, editMedicine = null }) {
  const [formData, setFormData] = useState({
    brand_name: '',
    generic_name: '',
    active_ingredient: '',
    strength: '',
    dosage_form: 'Tablet',
    route: 'Oral',
    manufacturer: 'Getz Pharma',
    pack_size: '20 Tablets (2 x 10s Blister)',
    therapeutic_class: 'General Formulary',
    indication: '',
    prescription_status: 'Rx Only',
    registration_reference: '',
    status: 'active',
    source: 'DocCare Clinical Formulary (Doctor / Admin Entry)',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(null);

  useEffect(() => {
    if (editMedicine) {
      setFormData({
        brand_name: editMedicine.brand_name || editMedicine.name || '',
        generic_name: editMedicine.generic_name || editMedicine.generic || '',
        active_ingredient: editMedicine.active_ingredient || (Array.isArray(editMedicine.active_ingredients) ? editMedicine.active_ingredients.join(', ') : editMedicine.generic_name) || '',
        strength: editMedicine.strength || '',
        dosage_form: editMedicine.dosage_form || editMedicine.form || 'Tablet',
        route: editMedicine.route || 'Oral',
        manufacturer: editMedicine.manufacturer || 'Getz Pharma',
        pack_size: editMedicine.pack_size || '',
        therapeutic_class: editMedicine.therapeutic_class || editMedicine.category || 'General Formulary',
        indication: editMedicine.indication || '',
        prescription_status: editMedicine.prescription_status || 'Rx Only',
        registration_reference: editMedicine.registration_reference || '',
        status: editMedicine.status || 'active',
        source: editMedicine.source || 'DocCare Clinical Formulary',
        notes: editMedicine.notes || ''
      });
    } else {
      setFormData({
        brand_name: '',
        generic_name: '',
        active_ingredient: '',
        strength: '',
        dosage_form: 'Tablet',
        route: 'Oral',
        manufacturer: 'Getz Pharma',
        pack_size: '',
        therapeutic_class: 'General Formulary',
        indication: '',
        prescription_status: 'Rx Only',
        registration_reference: `DRAP-PK-${Math.floor(100000 + Math.random() * 900000)}`,
        status: 'active',
        source: 'DocCare Clinical Formulary (Doctor Entry)',
        notes: ''
      });
    }
    setError(null);
    setDuplicateWarning(null);
  }, [isOpen, editMedicine]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      // Autofill active_ingredient from generic if empty
      if (field === 'generic_name' && !prev.active_ingredient) {
        updated.active_ingredient = value;
      }
      return updated;
    });
    setError(null);
    setDuplicateWarning(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setDuplicateWarning(null);

    // Validate Required Fields
    if (!formData.brand_name.trim()) {
      setError("Brand Name is required.");
      return;
    }
    if (!formData.generic_name.trim()) {
      setError("Generic Name is required.");
      return;
    }
    if (!formData.active_ingredient.trim()) {
      setError("Active Ingredient is required.");
      return;
    }
    if (!formData.strength.trim()) {
      setError("Strength is required (e.g. '500 mg', '10 mg/5ml', '20 mg').");
      return;
    }
    if (!formData.dosage_form) {
      setError("Dosage Form is required.");
      return;
    }

    try {
      setLoading(true);
      let response;
      if (editMedicine) {
        response = await api.updateMedicine(editMedicine.id, formData);
      } else {
        response = await api.addMedicine(formData);
      }

      if (onMedicineAdded) {
        onMedicineAdded(response.medicine || response);
      }
      onClose();
    } catch (err) {
      if (err.status === 409 || (err.message && err.message.includes('already exists'))) {
        setDuplicateWarning(err.message || "A medicine with identical Brand, Strength, Dosage Form and Manufacturer already exists.");
      } else {
        setError(err.message || "Failed to save medicine record.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden my-auto">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-teal-800 via-teal-700 to-medblue-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shadow-inner">
              <Pill className="w-5 h-5 text-teal-200" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                {editMedicine ? 'Edit Formulary Medicine' : 'Add Pakistan Formulary Medicine'}
              </h2>
              <p className="text-xs text-teal-100/90 font-medium">
                Normalized DRAP-standard pharmaceutical record
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-slate-800 dark:text-slate-100">
          
          {/* Alerts */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {duplicateWarning && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-semibold flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <p className="font-bold">Duplicate Prevention Triggered</p>
                <p className="text-[11px] font-normal">{duplicateWarning}</p>
              </div>
            </div>
          )}

          {/* Section 1: Required Clinical Identifiers */}
          <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                Required Clinical Identifiers
              </span>
              <span className="text-[10px] bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 px-2 py-0.5 rounded-full font-bold">
                Mandatory
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Brand Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Brand Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Panadol, Augmentin, Risek"
                  value={formData.brand_name}
                  onChange={(e) => handleChange('brand_name', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
                />
              </div>

              {/* Generic Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Generic Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Paracetamol, Co-Amoxiclav, Omeprazole"
                  value={formData.generic_name}
                  onChange={(e) => handleChange('generic_name', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
                />
              </div>

              {/* Active Ingredient */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Active Ingredient (Salt) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acetaminophen, Amoxicillin Trihydrate + Clavulanate Potassium"
                  value={formData.active_ingredient}
                  onChange={(e) => handleChange('active_ingredient', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
                />
              </div>

              {/* Strength */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Strength <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 500 mg, 625 mg, 40 mg, 10 mg/5ml"
                  value={formData.strength}
                  onChange={(e) => handleChange('strength', e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Formulation & Route */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Dosage Form */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Dosage Form <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.dosage_form}
                onChange={(e) => handleChange('dosage_form', e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-teal-500 outline-none"
              >
                {DOSAGE_FORMS.map((form) => (
                  <option key={form} value={form}>{form}</option>
                ))}
              </select>
            </div>

            {/* Route */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Route of Administration
              </label>
              <select
                value={formData.route}
                onChange={(e) => handleChange('route', e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-teal-500 outline-none"
              >
                {ROUTES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Manufacturer */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                Manufacturer / Pharma Company
              </label>
              <input
                type="text"
                list="manufacturers-list"
                placeholder="e.g. GSK, Getz, Searle, Abbott"
                value={formData.manufacturer}
                onChange={(e) => handleChange('manufacturer', e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-teal-500 outline-none"
              />
              <datalist id="manufacturers-list">
                {POPULAR_MANUFACTURERS.map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
            </div>

            {/* Pack Size */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Pack Size / Packaging
              </label>
              <input
                type="text"
                placeholder="e.g. 20 Tablets (2x10s), 60ml Suspension"
                value={formData.pack_size}
                onChange={(e) => handleChange('pack_size', e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-teal-500 outline-none"
              />
            </div>
          </div>

          {/* Section 3: Classification & Regulatory */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Therapeutic Class */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Therapeutic Class
              </label>
              <select
                value={formData.therapeutic_class}
                onChange={(e) => handleChange('therapeutic_class', e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-teal-500 outline-none"
              >
                {THERAPEUTIC_CLASSES.map((cls) => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            {/* Prescription Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Prescription Status
              </label>
              <select
                value={formData.prescription_status}
                onChange={(e) => handleChange('prescription_status', e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-teal-500 outline-none"
              >
                <option value="Rx Only">Rx Only (Prescription Required)</option>
                <option value="OTC">OTC (Over The Counter)</option>
                <option value="Controlled (Schedule IV)">Controlled Substance (Schedule IV)</option>
              </select>
            </div>

            {/* DRAP Reference */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                DRAP Registration / Reference #
              </label>
              <input
                type="text"
                placeholder="e.g. DRAP-002341, PK-01928"
                value={formData.registration_reference}
                onChange={(e) => handleChange('registration_reference', e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-teal-500 outline-none"
              />
            </div>

            {/* Medicine Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Medicine Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-teal-500 outline-none"
              >
                <option value="active">Active (Available for Prescribing)</option>
                <option value="inactive">Inactive / Deactivated</option>
              </select>
            </div>
          </div>

          {/* Clinical Indication & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Clinical Indication
              </label>
              <input
                type="text"
                placeholder="e.g. Mild to moderate pain and pyrexia"
                value={formData.indication}
                onChange={(e) => handleChange('indication', e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-teal-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Formulary Source / Origin
              </label>
              <input
                type="text"
                value={formData.source}
                onChange={(e) => handleChange('source', e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-teal-500 outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Clinical Warnings & Formulary Notes
            </label>
            <textarea
              rows="2"
              placeholder="e.g. Monitor liver function with prolonged use. Maximum 4000 mg in 24 hours."
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-teal-500 outline-none resize-none"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            <span className="font-bold text-teal-700 dark:text-teal-400">Safe Integrity:</span> Historical prescriptions remain intact.
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-xl transition-all shadow-md shadow-teal-600/20 flex items-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{editMedicine ? 'Save Changes' : '+ Add to Formulary'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
