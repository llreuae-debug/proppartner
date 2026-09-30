import React, { useState, useEffect, useRef } from 'react';
import { 
  Minus, 
  X, 
  Search, 
  User, 
  DollarSign, 
  CreditCard, 
  Calendar, 
  Clock, 
  FileText, 
  Building2, 
  Loader2,
  Receipt
} from 'lucide-react';
import { api } from '../../services/api';

export default function CashOutModal({
  isOpen,
  onClose,
  onSuccess,
  patients = []
}) {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const [includePatient, setIncludePatient] = useState(false);
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false);

  const [form, setForm] = useState({
    category: 'Supplies',
    type: 'Medical Supplies',
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
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsPatientDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const handleCategoryChange = (newCat) => {
    let defaultType = 'Other Expense';
    if (newCat === 'Supplies') defaultType = 'Medical Supplies';
    else if (newCat === 'Salary') defaultType = 'Staff Salary';
    else if (newCat === 'Rent') defaultType = 'Clinic Rent';
    else if (newCat === 'Utilities') defaultType = 'Electricity';
    else if (newCat === 'Refund') {
      defaultType = 'Refund';
      setIncludePatient(true);
    }

    setForm(prev => ({
      ...prev,
      category: newCat,
      type: defaultType
    }));
  };

  const filteredPatients = patients.filter(p => {
    const q = patientSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      (p.phone && p.phone.includes(q)) ||
      (p.id && p.id.toLowerCase().includes(q))
    );
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) {
      setError("Please enter a valid positive expense amount.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        entry_type: 'cash_out',
        patient_id: includePatient && selectedPatient ? selectedPatient.id : null,
        patient_name: includePatient && selectedPatient ? selectedPatient.name : (form.description || form.type),
        type: form.type,
        category: form.category,
        amount: Number(form.amount),
        payment_method: form.payment_method,
        transaction_date: form.transaction_date || todayStr,
        transaction_time: form.transaction_time || timeStr,
        reference: form.reference || `EXP-${Math.floor(1000 + Math.random() * 9000)}`,
        remarks: form.remarks || form.description || `${form.type} expense recorded`,
        description: form.description || form.remarks || `${form.type} payment`
      };

      const res = await api.createLedgerEntry(payload);
      if (res.success) {
        onSuccess(res.entry);
        onClose();
      }
    } catch (err) {
      setError(err.message || "Failed to record Cash Out transaction.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header (Red/Rose for Cash Out) */}
        <div className="bg-gradient-to-r from-rose-700 to-red-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Minus className="w-5 h-5 stroke-[3]" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">Record Cash Out</h3>
              <p className="text-[11px] text-rose-100 font-medium">Practice expenses, utilities, supplies & refunds</p>
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

          {/* 1. EXPENSE CATEGORY & SPECIFIC TYPE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Expense Category *
              </label>
              <select
                value={form.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
              >
                <option value="Supplies">Medical Supplies</option>
                <option value="Salary">Staff Salary</option>
                <option value="Rent">Clinic Rent</option>
                <option value="Utilities">Electricity / Utilities</option>
                <option value="Equipment">Equipment / Maintenance</option>
                <option value="Marketing">Marketing / Printing</option>
                <option value="Transport">Transport / Delivery</option>
                <option value="Refund">Patient Refund</option>
                <option value="Other">Other Expense</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Transaction Type / Title *
              </label>
              <input
                type="text"
                required
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                placeholder="e.g. LESCO Bill, Sterile Gloves, Assistant Salary"
                className="w-full px-3.5 py-2 text-xs font-bold rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* 2. AMOUNT (PKR) & PAYMENT METHOD */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Expense Amount (PKR) *
              </label>
              <div className="relative">
                <span className="text-xs font-black text-rose-500 absolute left-3.5 top-2.5">
                  PKR
                </span>
                <input
                  type="number"
                  required
                  min="1"
                  step="1"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="5000"
                  className="w-full pl-13 pr-3 py-2.5 text-sm font-black text-rose-800 dark:text-rose-200 bg-rose-50/50 dark:bg-rose-950/30 rounded-2xl border border-rose-300 dark:border-rose-700 outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Paid Via / Payment Mode *
              </label>
              <select
                value={form.payment_method}
                onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                className="w-full px-3 py-2.5 text-xs font-bold rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
              >
                <option value="Cash">Cash Drawer</option>
                <option value="Bank Transfer">Bank Transfer (IBFT)</option>
                <option value="JazzCash">JazzCash</option>
                <option value="Easypaisa">Easypaisa</option>
                <option value="Card">Credit / Debit Card</option>
                <option value="Cheque">Cheque</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* 3. OPTIONAL PATIENT ATTACHMENT (FOR REFUNDS / DISCOUNTS) */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includePatient}
                  onChange={(e) => setIncludePatient(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                />
                <span>Relates to a specific Patient (Refund / Discount / Fee Return)</span>
              </label>
            </div>

            {includePatient && (
              <div className="space-y-1.5 relative pt-1" ref={dropdownRef}>
                <input
                  type="text"
                  value={patientSearch}
                  onChange={(e) => {
                    setPatientSearch(e.target.value);
                    setSelectedPatient(null);
                    setIsPatientDropdownOpen(true);
                  }}
                  onFocus={() => setIsPatientDropdownOpen(true)}
                  placeholder="Search patient name, phone or ID for refund..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500"
                />

                {isPatientDropdownOpen && filteredPatients.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 max-h-40 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredPatients.map(p => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setSelectedPatient(p);
                          setPatientSearch(p.name);
                          setIsPatientDropdownOpen(false);
                        }}
                        className="p-2.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer text-xs flex justify-between items-center"
                      >
                        <span className="font-bold">{p.name}</span>
                        <span className="text-[10px] text-slate-500">PAT-{p.id.slice(0, 5)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
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
                placeholder="12:00 PM"
                className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 block">Bill / Voucher #</label>
              <input
                type="text"
                value={form.reference}
                onChange={(e) => setForm({ ...form, reference: e.target.value })}
                placeholder="e.g. VOU-4019"
                className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
              />
            </div>
          </div>

          {/* 5. REMARKS / DESCRIPTION */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
              Expense Description & Notes
            </label>
            <input
              type="text"
              value={form.remarks}
              onChange={(e) => setForm({ ...form, remarks: e.target.value, description: e.target.value })}
              placeholder="e.g. Purchased sterile disposable syringes and gloves from Al-Razi Surgical..."
              className="w-full px-3.5 py-2 text-xs rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-rose-500"
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
              className="px-6 py-2.5 bg-[#c92a2a] hover:bg-[#b02525] active:scale-95 text-white font-bold text-xs rounded-2xl shadow-md flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Minus className="w-4 h-4 stroke-[3]" />}
              <span>Add Cash Out</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
