import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  X, 
  Search, 
  User, 
  DollarSign, 
  CreditCard, 
  Calendar, 
  Clock, 
  FileText, 
  CheckCircle2, 
  Loader2,
  Building2,
  ChevronDown
} from 'lucide-react';
import { api } from '../../services/api';

export default function CashInModal({
  isOpen,
  onClose,
  onSuccess,
  patients = [],
  prefillPatientId = null
}) {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false);

  const [form, setForm] = useState({
    type: 'Consultation Fee',
    category: 'Consultation',
    amount: '',
    payment_method: 'Cash',
    transaction_date: todayStr,
    transaction_time: timeStr,
    reference: '',
    remarks: '',
    description: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (prefillPatientId) {
      const found = patients.find(p => p.id === prefillPatientId);
      if (found) {
        setSelectedPatient(found);
        setPatientSearch(found.name);
      }
    }
  }, [prefillPatientId, patients]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsPatientDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const filteredPatients = patients.filter(p => {
    const q = patientSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      (p.phone && p.phone.includes(q)) ||
      (p.id && p.id.toLowerCase().includes(q))
    );
  });

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setPatientSearch(patient.name);
    setIsPatientDropdownOpen(false);
  };

  const handleTypeChange = (newType) => {
    let cat = 'Consultation';
    if (newType.includes('Procedure') || newType.includes('Injection')) cat = 'Procedure';
    else if (newType.includes('Lab') || newType.includes('Test')) cat = 'Laboratory';
    else if (newType.includes('Income')) cat = 'Other';

    setForm(prev => ({
      ...prev,
      type: newType,
      category: cat
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) {
      setError("Please enter a valid positive amount.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        entry_type: 'cash_in',
        patient_id: selectedPatient?.id || null,
        patient_name: selectedPatient ? selectedPatient.name : (patientSearch.trim() || 'Direct Cash In Patient'),
        type: form.type,
        category: form.category,
        amount: Number(form.amount),
        payment_method: form.payment_method,
        transaction_date: form.transaction_date || todayStr,
        transaction_time: form.transaction_time || timeStr,
        reference: form.reference || `REC-${Math.floor(1000 + Math.random() * 9000)}`,
        remarks: form.remarks || form.description || `${form.type} collected`,
        description: form.description || form.remarks || `${form.type} - ${selectedPatient?.name || 'General Patient'}`
      };

      const res = await api.createLedgerEntry(payload);
      if (res.success) {
        onSuccess(res.entry);
        onClose();
      }
    } catch (err) {
      setError(err.message || "Failed to record Cash In transaction.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header (Teal) */}
        <div className="bg-gradient-to-r from-teal-700 to-emerald-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Plus className="w-5 h-5 stroke-[3]" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">Record Cash In</h3>
              <p className="text-[11px] text-teal-100 font-medium">Patient payment & clinical income</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs font-bold text-rose-800 dark:text-rose-200">
              {error}
            </div>
          )}

          {/* 1. PATIENT SELECTION AUTOCOMPLETE */}
          <div className="space-y-1.5 relative" ref={dropdownRef}>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Patient Name / ID *</span>
              {selectedPatient && (
                <span className="text-[10px] text-teal-600 font-bold">
                  ID: PAT-{selectedPatient.id.replace('pat-', '').padStart(5, '0')}
                </span>
              )}
            </label>
            
            <div className="relative">
              <input
                type="text"
                value={patientSearch}
                onChange={(e) => {
                  setPatientSearch(e.target.value);
                  setSelectedPatient(null);
                  setIsPatientDropdownOpen(true);
                }}
                onFocus={() => setIsPatientDropdownOpen(true)}
                placeholder="Type patient name, phone (0300...), or ID..."
                className="w-full px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-teal-500 pr-9"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>

            {/* Patient Suggestions Dropdown */}
            {isPatientDropdownOpen && filteredPatients.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 animate-fade-in">
                {filteredPatients.map(p => (
                  <div
                    key={p.id}
                    onClick={() => handleSelectPatient(p)}
                    className="p-3 hover:bg-teal-50 dark:hover:bg-teal-950/40 cursor-pointer flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">{p.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        PAT-{p.id.replace('pat-', '').padStart(5, '0')} • {p.phone || 'No phone'}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-50 dark:bg-teal-900/40 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
                      Select
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. TRANSACTION TYPE & CATEGORY */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Transaction Type *
              </label>
              <select
                value={form.type}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
              >
                <option value="Consultation Fee">Consultation Fee</option>
                <option value="Follow-up Fee">Follow-up Fee</option>
                <option value="Procedure Fee">Procedure Fee</option>
                <option value="Injection Fee">Injection Fee</option>
                <option value="Lab/Test Fee">Lab/Test Fee</option>
                <option value="Other Medical Service">Other Medical Service</option>
                <option value="Package Fee">Package Fee</option>
                <option value="Other Income">Other Income</option>
                <option value="Refund Received">Refund Received</option>
                <option value="Adjustment">Adjustment</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 text-xs font-semibold rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
              >
                <option value="Consultation">Consultation</option>
                <option value="Procedure">Procedure</option>
                <option value="Medication">Medication</option>
                <option value="Laboratory">Laboratory</option>
                <option value="Supplies">Supplies</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* 3. AMOUNT (PKR) & PAYMENT METHOD */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Amount (PKR) *
              </label>
              <div className="relative">
                <span className="text-xs font-black text-slate-400 absolute left-3.5 top-2.5">
                  PKR
                </span>
                <input
                  type="number"
                  required
                  min="1"
                  step="1"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="2000"
                  className="w-full pl-13 pr-3 py-2.5 text-sm font-black text-teal-800 dark:text-teal-200 bg-teal-50/50 dark:bg-teal-950/30 rounded-2xl border border-teal-300 dark:border-teal-700 outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Payment Method *
              </label>
              <select
                value={form.payment_method}
                onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                className="w-full px-3 py-2.5 text-xs font-bold rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
              >
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer (IBFT)</option>
                <option value="JazzCash">JazzCash</option>
                <option value="Easypaisa">Easypaisa</option>
                <option value="Card">Credit / Debit Card (POS)</option>
                <option value="Cheque">Cheque</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* 4. DATE, TIME & REFERENCE */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 block">Date</label>
              <input
                type="date"
                value={form.transaction_date}
                onChange={(e) => setForm({ ...form, transaction_date: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 block">Time</label>
              <input
                type="text"
                value={form.transaction_time}
                onChange={(e) => setForm({ ...form, transaction_time: e.target.value })}
                placeholder="10:30 AM"
                className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 block">Reference / Receipt #</label>
              <input
                type="text"
                value={form.reference}
                onChange={(e) => setForm({ ...form, reference: e.target.value })}
                placeholder="e.g. REC-1001"
                className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
              />
            </div>
          </div>

          {/* 5. REMARKS / DESCRIPTION */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Remarks / Clinical Notes
            </label>
            <input
              type="text"
              value={form.remarks}
              onChange={(e) => setForm({ ...form, remarks: e.target.value })}
              placeholder="e.g. General consultation & sugar checkup, paid at front desk..."
              className="w-full px-3.5 py-2 text-xs rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-[#00875a] hover:bg-[#00744e] active:scale-95 text-white font-bold text-xs rounded-2xl shadow-md flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 stroke-[3]" />}
              <span>Add Cash In</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
