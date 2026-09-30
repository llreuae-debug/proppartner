import React, { useState, useEffect } from 'react';
import { 
  Trash2, 
  Copy, 
  ChevronUp, 
  ChevronDown, 
  Layers, 
  Activity, 
  Info, 
  Sparkles, 
  Building2, 
  ShieldAlert, 
  AlertTriangle,
  Clock,
  Compass,
  Calculator,
  Pill,
  Check
} from 'lucide-react';
import MedicineSearchBar from './MedicineSearchBar';
import MedicineFormSelector from './MedicineFormSelector';
import { FREQUENCIES, DURATION_UNITS, DOSE_UNITS, calculateEstimatedQuantity } from '../../data/frequencies';
import { ROUTE_OPTIONS, suggestRouteByForm } from '../../data/routes';
import { GENERAL_INSTRUCTION_PRESETS, getFormPresets } from '../../data/instructions';

/**
 * Advanced Expandable Medicine Row Card matching Prescription Workstation Layout
 */
export default function MedicineRowCard({
  index,
  item,
  onChange,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst = false,
  isLast = false,
  patientAllergies = '',
  existingMedicines = []
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [customStrengthMode, setCustomStrengthMode] = useState(false);

  // Derive form-specific instructions
  const formPresets = getFormPresets(item.form || item.dosage_form || 'Tablet');

  // Auto-calculate quantity when dose, frequency, or duration changes
  const handleCalculateQuantity = (updates) => {
    const nextItem = { ...item, ...updates };
    const est = calculateEstimatedQuantity({
      doseAmount: nextItem.dose_amount || (parseFloat(nextItem.dose) || 1),
      doseUnit: nextItem.dose_unit || 'Tablet',
      frequencyCode: nextItem.frequency || '1+0+1',
      durationAmount: nextItem.duration_amount || (parseFloat(nextItem.duration) || 5),
      durationUnit: nextItem.duration_unit || 'Days'
    });

    if (!nextItem.quantity_manual_override) {
      nextItem.quantity = est.quantity;
      nextItem.quantity_unit = est.unit;
    }
    return nextItem;
  };

  const handleSelectMedicineFromSearch = (med) => {
    const suggestedRoute = med.route || suggestRouteByForm(med.dosage_form || med.form || 'Tablet');
    const availableStrengths = Array.isArray(med.available_strengths) && med.available_strengths.length > 0 
      ? med.available_strengths 
      : [med.strength || '500 mg'];

    const chosenStrength = med.strength || availableStrengths[0] || 'Standard';

    const updated = handleCalculateQuantity({
      medicine_id: med.id || null,
      medicine_name: med.brand_name || med.name,
      name: med.brand_name || med.name,
      generic_name: med.generic_name || '',
      generic: med.generic_name || '',
      active_ingredients: med.active_ingredients || [med.generic_name || med.brand_name],
      strength: chosenStrength,
      available_strengths: availableStrengths,
      form: med.dosage_form || med.form || 'Tablet',
      dosage_form: med.dosage_form || med.form || 'Tablet',
      route: suggestedRoute,
      manufacturer: med.manufacturer || '',
      pack_size: med.pack_size || '',
      therapeutic_class: med.therapeutic_class || '',
      drug_class: med.drug_class || '',
      dose: med.default_dose || '1 tab',
      dose_amount: parseFloat(med.default_dose) || 1,
      dose_unit: (med.dosage_form || 'Tablet').includes('syrup') ? 'mL' : 'Tablet',
      frequency: med.default_frequency || 'BD — Twice daily',
      duration: med.default_duration || '5 Days',
      duration_amount: parseFloat(med.default_duration) || 5,
      duration_unit: 'Days',
      instructions: (med.form_instructions && med.form_instructions[0]) || 'After meals'
    });

    onChange(updated);
  };

  const handleFormChange = (newForm, suggestedRoute) => {
    const updated = handleCalculateQuantity({
      form: newForm,
      dosage_form: newForm,
      route: suggestedRoute || item.route || 'Oral'
    });
    onChange(updated);
  };

  const handleStrengthChange = (newStrength) => {
    if (newStrength === '__CUSTOM__') {
      setCustomStrengthMode(true);
      return;
    }
    setCustomStrengthMode(false);
    onChange({ ...item, strength: newStrength });
  };

  // Safety checks
  const warnings = [];
  if (patientAllergies && patientAllergies.toLowerCase() !== 'none') {
    const patLower = patientAllergies.toLowerCase();
    const genLower = (item.generic_name || item.generic || '').toLowerCase();
    const brandLower = (item.medicine_name || item.name || '').toLowerCase();

    if (
      (patLower.includes('penicillin') && (genLower.includes('amox') || genLower.includes('penicillin') || brandLower.includes('augmentin'))) ||
      (patLower.includes('sulfa') && (genLower.includes('sulfa') || genLower.includes('septran') || genLower.includes('bactrim'))) ||
      (patLower.includes('nsaid') && (genLower.includes('ibuprofen') || genLower.includes('diclofenac') || genLower.includes('naproxen') || brandLower.includes('brufen') || brandLower.includes('voltral'))) ||
      (patLower.includes('metronidazole') && (genLower.includes('metronidazole') || brandLower.includes('flagyl')))
    ) {
      warnings.push(`Potential allergy conflict: Patient has documented ${patientAllergies} allergy.`);
    }
  }

  // Duplicate active ingredients check
  const duplicates = existingMedicines.filter((m, idx) => 
    idx !== index && 
    (m.generic_name || m.generic) && 
    (m.generic_name || m.generic).toLowerCase() === (item.generic_name || item.generic || '').toLowerCase()
  );
  if (duplicates.length > 0) {
    warnings.push(`Duplicate active ingredient (${item.generic_name || item.generic}) already in prescription.`);
  }

  const currentAvailableStrengths = item.available_strengths || (item.strength ? [item.strength] : ['Standard', '500 mg']);

  return (
    <div className="bg-slate-50/70 dark:bg-slate-850/70 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-3.5 sm:p-4 transition-all hover:border-teal-500/40 space-y-3 relative group">
      
      {/* Top Clinical Safety Alerts on this row */}
      {warnings.length > 0 && (
        <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-900/60 flex items-center gap-2 text-xs text-amber-900 dark:text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <div className="flex-1 font-semibold">{warnings.join(' ')}</div>
        </div>
      )}

      {/* Main Responsive Grid Row Matching Prescription Workstation Layout */}
      <div className="flex items-start gap-3">
        
        {/* Number Badge & Vertical Reorder Controls */}
        <div className="flex flex-col items-center shrink-0 pt-1">
          <div className="w-7 h-7 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-900 dark:text-teal-200 font-black text-xs flex items-center justify-center border border-teal-200 dark:border-teal-800 shadow-xs">
            {index + 1}
          </div>
          <div className="flex flex-col mt-1 space-y-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              disabled={isFirst}
              onClick={onMoveUp}
              className={`p-0.5 rounded text-slate-400 hover:text-teal-600 ${isFirst ? 'invisible' : ''}`}
              title="Move Up"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              disabled={isLast}
              onClick={onMoveDown}
              className={`p-0.5 rounded text-slate-400 hover:text-teal-600 ${isLast ? 'invisible' : ''}`}
              title="Move Down"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Prescription Fields Columns */}
        <div className="flex-1 space-y-3">
          
          {/* Main Top Row: Brand Search, Form, Dose, Frequency, Duration */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-start">
            
            {/* 1. BRAND NAME / GENERIC (Cols 4) */}
            <div className="md:col-span-4 space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Brand Name / Generic
              </label>
              <MedicineSearchBar
                value={item.medicine_name || item.name || ''}
                onSelect={handleSelectMedicineFromSearch}
                placeholder="Type brand / salt (e.g. Daktarin, Panadol, Risek)..."
              />
            </div>

            {/* 2. FORM (Cols 2) */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Form
              </label>
              <MedicineFormSelector
                value={item.form || item.dosage_form || 'Tablet'}
                onChange={handleFormChange}
              />
            </div>

            {/* 3. DOSE (Cols 2) */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Dose
              </label>
              <input
                type="text"
                value={item.dose || ''}
                onChange={(e) => onChange({ ...item, dose: e.target.value })}
                placeholder="e.g. 1 tab, 5 mL"
                className="w-full px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>

            {/* 4. FREQUENCY (Cols 2) */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Frequency
              </label>
              <select
                value={item.frequency || '1+0+1 (Twice daily)'}
                onChange={(e) => onChange({ ...item, frequency: e.target.value })}
                className="w-full px-2.5 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-teal-500 cursor-pointer"
              >
                {FREQUENCIES.map((freq) => (
                  <option key={freq.id} value={freq.label}>
                    {freq.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 5. DURATION (Cols 2) */}
            <div className="md:col-span-2 space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Duration
                </label>
                {item.quantity && (
                  <span className="text-[9.5px] font-bold text-teal-700 dark:text-teal-400">
                    Qty: {item.quantity}
                  </span>
                )}
              </div>
              <input
                type="text"
                value={item.duration || ''}
                onChange={(e) => onChange({ ...item, duration: e.target.value })}
                placeholder="e.g. 5 Days"
                className="w-full px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-teal-500"
              />
            </div>

          </div>

          {/* INSTRUCTIONS ROW WITH QUICK PRESETS */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Special Instructions
              </span>
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-[11px] font-bold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isExpanded ? 'Hide Advanced Details' : 'Detailed Builder & Strength / Route'}</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                value={item.instructions || ''}
                onChange={(e) => onChange({ ...item, instructions: e.target.value })}
                placeholder="e.g. After meals with plenty of water..."
                className="flex-1 px-3 py-2 text-xs text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-teal-500"
              />

              {/* Quick Instruction Preset Chips */}
              <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
                {['After meals', '30 min before breakfast (Empty stomach)', 'Before meals', 'At bedtime'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => onChange({ ...item, instructions: preset })}
                    className={`px-2 py-1 rounded-lg text-[10.5px] font-medium whitespace-nowrap transition-colors ${
                      item.instructions === preset
                        ? 'bg-teal-600 text-white font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* EXPANDED SECTION: STRENGTH, ROUTE, QUANTITY, DETAILED INGREDIENTS */}
          {isExpanded && (
            <div className="pt-3 border-t border-slate-200/80 dark:border-slate-700/80 space-y-3 animate-fade-in">
              
              {/* Medicine Metadata Badge if selected */}
              {(item.generic_name || item.generic || item.manufacturer || item.therapeutic_class) && (
                <div className="p-3 rounded-xl bg-teal-50/50 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-900/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {item.medicine_name || item.name}
                      </span>
                      <span className="font-mono text-teal-800 dark:text-teal-300 font-bold">
                        {item.strength}
                      </span>
                      <span className="text-slate-500 italic">
                        (Generic: {item.generic_name || item.generic})
                      </span>
                    </div>
                    {item.manufacturer && (
                      <p className="text-[11px] text-slate-500">
                        Manufacturer: <strong>{item.manufacturer}</strong> {item.pack_size ? `• Pack: ${item.pack_size}` : ''}
                      </p>
                    )}
                  </div>

                  {item.therapeutic_class && (
                    <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-teal-800 dark:text-teal-300 text-[10px] font-bold border border-teal-200">
                      {item.therapeutic_class}
                    </span>
                  )}
                </div>
              )}

              {/* Grid for Strength, Route, Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* Dynamic Strength Selector */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Formulary Strength
                  </label>
                  {!customStrengthMode ? (
                    <select
                      value={item.strength || currentAvailableStrengths[0] || ''}
                      onChange={(e) => handleStrengthChange(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-teal-500"
                    >
                      {currentAvailableStrengths.map((str) => (
                        <option key={str} value={str}>
                          {str}
                        </option>
                      ))}
                      <option value="__CUSTOM__">+ Custom Strength...</option>
                    </select>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={item.strength || ''}
                        onChange={(e) => onChange({ ...item, strength: e.target.value })}
                        placeholder="e.g. 625 mg, 2%"
                        className="flex-1 px-3 py-2 text-xs font-bold bg-white dark:bg-slate-800 rounded-xl border border-teal-500 outline-none"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setCustomStrengthMode(false)}
                        className="p-2 text-xs text-slate-400 hover:text-slate-600"
                        title="Back to formulary list"
                      >
                        Reset
                      </button>
                    </div>
                  )}
                </div>

                {/* Route Selector */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Administration Route
                  </label>
                  <select
                    value={item.route || 'Oral'}
                    onChange={(e) => onChange({ ...item, route: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-teal-500"
                  >
                    {ROUTE_OPTIONS.map((r) => (
                      <option key={r.id} value={r.label}>
                        {r.label} — {r.desc}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Total Dispense Quantity */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                    <span>Dispense Quantity</span>
                    <span className="text-teal-600 font-normal">Calculated</span>
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={item.quantity || ''}
                      onChange={(e) => onChange({ 
                        ...item, 
                        quantity: Number(e.target.value),
                        quantity_manual_override: true 
                      })}
                      placeholder="e.g. 15"
                      className="w-full px-3 py-2 text-xs font-bold bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:border-teal-500 font-mono"
                    />
                    <span className="text-xs font-medium text-slate-400 shrink-0">
                      {item.quantity_unit || (item.form || 'units')}
                    </span>
                  </div>
                </div>

              </div>

              {/* Form-Specific Intelligent Instruction Suggestions */}
              {formPresets && formPresets.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Recommended for {item.form || 'this dosage form'}:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {formPresets.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => onChange({ ...item, instructions: preset })}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-medium text-left transition-colors ${
                          item.instructions === preset
                            ? 'bg-teal-600 text-white font-bold'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Row Actions (Duplicate, Delete) */}
        <div className="flex items-center gap-1 shrink-0 pt-1">
          <button
            type="button"
            onClick={onDuplicate}
            className="p-2 rounded-xl text-slate-400 hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Duplicate this medicine"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Delete this medicine"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
}
