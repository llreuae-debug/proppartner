import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  AlertTriangle, 
  Check, 
  Plus, 
  Loader2, 
  ShieldCheck, 
  Stethoscope, 
  Info,
  CheckCircle2,
  RefreshCw,
  Pill,
  ShieldAlert
} from 'lucide-react';
import { api } from '../services/api';

export default function AIClinicalAssistantModal({
  isOpen,
  onClose,
  initialDiagnosis = '',
  initialSymptoms = '',
  patientAllergies = '',
  chronicConditions = '',
  currentMedicines = '',
  patientAge = 30,
  patientGender = 'Male',
  onApplySuggestions
}) {
  const [diagnosis, setDiagnosis] = useState(initialDiagnosis);
  const [symptoms, setSymptoms] = useState(initialSymptoms);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [selectedMeds, setSelectedMeds] = useState({});
  const [selectedTests, setSelectedTests] = useState({});

  if (!isOpen) return null;

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // PRIVACY SAFE: Only send clinical parameters (Never send patient name or phone number)
      const res = await api.getAISuggestions({
        diagnosis,
        symptoms,
        age: patientAge,
        gender: patientGender,
        allergies: patientAllergies,
        chronic_conditions: chronicConditions,
        current_medicines: currentMedicines
      });

      setResult(res);

      // Select all safe medicines by default
      const initialSelectedMeds = {};
      (res.suggestedMedicines || []).forEach((med, i) => {
        initialSelectedMeds[i] = !med.hasWarning;
      });
      setSelectedMeds(initialSelectedMeds);

      const initialSelectedTests = {};
      (res.labTests || []).forEach((test, i) => {
        initialSelectedTests[i] = true;
      });
      setSelectedTests(initialSelectedTests);

    } catch (err) {
      console.error("AI Assistant error:", err);
      setError(err.message || "Failed to generate AI clinical suggestions. Please check your network or try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleMed = (index) => {
    setSelectedMeds(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const toggleTest = (index) => {
    setSelectedTests(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleApply = () => {
    if (!result) return;
    
    const approvedMedicines = (result.suggestedMedicines || []).filter((_, idx) => selectedMeds[idx]).map(m => ({
      name: `${m.brandName} (${m.strength})`,
      generic: m.genericName,
      form: m.form || 'tablet',
      strength: m.strength || '',
      dose: m.dose || '1 tab',
      frequency: m.frequency || '1+0+1',
      duration: m.duration || '5 Days',
      instructions: m.instructions || 'After meals'
    }));

    const approvedTests = (result.labTests || []).filter((_, idx) => selectedTests[idx]);

    onApplySuggestions({
      diagnosis: result.matchedDiagnosis || diagnosis,
      medicines: approvedMedicines,
      labTests: approvedTests,
      advice: result.advice || '',
      followUpDays: result.followUpDays || 7
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-medblue-700 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Sparkles className="w-5 h-5 text-teal-200" />
            </div>
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                AI Clinical Prescription Assistant
                <span className="text-[10px] bg-teal-400/20 text-teal-100 px-2 py-0.5 rounded-full uppercase font-mono tracking-wider border border-teal-300/30">
                  Decision Support
                </span>
              </h3>
              <p className="text-xs text-teal-100 font-normal">
                Generates Pakistani formulary medication suggestions & safety analysis
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* Patient Context Indicators (Demographics & Allergies) */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                Patient: {patientAge} yrs • {patientGender}
              </span>
              {patientAllergies && patientAllergies.toLowerCase() !== 'none' && (
                <span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 font-bold border border-rose-200">
                  Allergies: {patientAllergies}
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400">
              🔒 Privacy Protected: No PII transmitted
            </span>
          </div>

          {/* Inputs Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Clinical Diagnosis / Suspected Condition
              </label>
              <input
                type="text"
                placeholder="e.g. Acute Gastroenteritis, URTI, Enteric Fever"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Presenting Complaints / Symptoms
              </label>
              <input
                type="text"
                placeholder="e.g. High fever, watery diarrhea, vomiting, cough"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex justify-end">
            <button
              onClick={handleGenerate}
              disabled={loading || (!diagnosis && !symptoms)}
              className="btn-primary text-xs flex items-center gap-2 py-2 px-4 shadow-md bg-gradient-to-r from-teal-600 to-medblue-600 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Analyzing Clinical Protocols...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Generate Decision Support
                </>
              )}
            </button>
          </div>

          {/* Error Banner with Retry */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 flex items-center justify-between text-xs text-rose-800 dark:text-rose-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>{error}</span>
              </div>
              <button
                onClick={handleGenerate}
                className="px-3 py-1 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700 flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retry
              </button>
            </div>
          )}

          {/* Suggestions Review Panel */}
          {result && (
            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800 animate-fade-in">
              
              {/* Matched Diagnosis */}
              <div className="p-3 rounded-xl bg-teal-50/80 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 text-xs">
                <span className="font-bold text-teal-900 dark:text-teal-200">Matched Protocol: </span>
                <span className="font-semibold text-teal-800 dark:text-teal-300">{result.matchedDiagnosis}</span>
              </div>

              {/* Suggested Medicines with Review Checkboxes */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-2">
                  Select Medicines to Insert ({Object.values(selectedMeds).filter(Boolean).length} of {result.suggestedMedicines?.length || 0} selected):
                </label>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {(result.suggestedMedicines || []).map((med, idx) => (
                    <div
                      key={idx}
                      onClick={() => toggleMed(idx)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-start justify-between gap-3 ${
                        selectedMeds[idx]
                          ? 'bg-teal-50/50 dark:bg-teal-950/30 border-teal-300 dark:border-teal-700'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          checked={!!selectedMeds[idx]}
                          onChange={() => {}} // Handled by parent container click
                          className="mt-0.5 rounded text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
                        />
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                            {med.brandName}
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                              {med.strength} • {med.form}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Generic: {med.genericName} • Dose: {med.dose} • {med.frequency} • {med.duration}
                          </div>
                          {med.instructions && (
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              Inst: {med.instructions}
                            </div>
                          )}
                        </div>
                      </div>

                      {med.hasWarning && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                          Allergy Flag
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Lab Tests */}
              {result.labTests && result.labTests.length > 0 && (
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-1.5">
                    Suggested Diagnostic Tests:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {result.labTests.map((test, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toggleTest(idx)}
                        className={`text-xs px-2.5 py-1 rounded-lg border font-medium flex items-center gap-1 transition-colors ${
                          selectedTests[idx]
                            ? 'bg-medblue-50 dark:bg-medblue-950/40 border-medblue-300 text-medblue-800 dark:text-medblue-200 font-bold'
                            : 'bg-white dark:bg-slate-800 border-slate-200 text-slate-500'
                        }`}
                      >
                        {selectedTests[idx] ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                        {test}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Advice */}
              {result.advice && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300">
                  <span className="font-bold block mb-0.5">Diet & Lifestyle Advice:</span>
                  {result.advice}
                </div>
              )}

              {/* Mandatory Clinical Disclaimer */}
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Clinical Notice:</strong> AI suggestions support but do not replace your clinical judgment. Verify all medicines and doses before prescribing.
                </p>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/50"
          >
            Cancel
          </button>

          {result && (
            <button
              onClick={handleApply}
              className="btn-primary text-xs flex items-center gap-1.5 py-2 px-5 shadow-md bg-teal-700 hover:bg-teal-800"
            >
              <CheckCircle2 className="w-4 h-4" /> Apply Selected to Prescription
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
