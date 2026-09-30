import React, { useState } from 'react';
import { 
  FileText, 
  X, 
  Printer, 
  Trash2, 
  Edit3, 
  Calendar, 
  Clock, 
  CreditCard, 
  User, 
  Building2, 
  AlertTriangle,
  History,
  Check,
  Loader2,
  DollarSign
} from 'lucide-react';
import { api } from '../../services/api';

export default function TransactionDetailModal({
  isOpen,
  onClose,
  transaction,
  onPrintReceipt,
  onDeleteSuccess,
  onUpdateSuccess
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editForm, setEditForm] = useState(null);

  if (!isOpen || !transaction) return null;

  const handleStartEdit = () => {
    setEditForm({
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      payment_method: transaction.payment_method,
      remarks: transaction.remarks || transaction.description || '',
      reference: transaction.reference || '',
      transaction_date: transaction.transaction_date,
      transaction_time: transaction.transaction_time
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.updateLedgerEntry(transaction.id, editForm);
      if (res.success) {
        setIsEditing(false);
        onUpdateSuccess(res.entry);
      }
    } catch (err) {
      alert("Failed to update transaction: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      const res = await api.deleteLedgerEntry(transaction.id);
      if (res.success) {
        onDeleteSuccess(transaction.id);
        onClose();
      }
    } catch (err) {
      alert("Failed to delete transaction: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const isCashIn = transaction.entry_type === 'cash_in';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
              isCashIn ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
            }`}>
              {isCashIn ? '+' : '−'}
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Transaction Details
              </h3>
              <p className="text-xs text-slate-500 font-mono font-bold">
                {transaction.transaction_id}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {!isEditing ? (
            <>
              {/* Highlight Amount Banner */}
              <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                isCashIn 
                  ? 'bg-teal-50/70 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800' 
                  : 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'
              }`}>
                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                    isCashIn ? 'text-teal-700 dark:text-teal-300' : 'text-rose-700 dark:text-rose-300'
                  }`}>
                    {isCashIn ? 'Cash In (Revenue)' : 'Cash Out (Expense)'}
                  </span>
                  <p className={`text-xl font-black mt-0.5 font-mono ${
                    isCashIn ? 'text-teal-900 dark:text-teal-100' : 'text-rose-900 dark:text-rose-100'
                  }`}>
                    {isCashIn ? '+' : '−'} PKR {Number(transaction.amount).toLocaleString()}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Running Balance
                  </span>
                  <p className="text-sm font-black text-slate-800 dark:text-slate-200 font-mono">
                    PKR {(transaction.running_balance || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Patient & Particulars Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Patient</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{transaction.patient_name || 'Non-patient expense'}</p>
                  {transaction.patient_code && (
                    <p className="text-[11px] text-teal-700 font-mono font-bold">{transaction.patient_code}</p>
                  )}
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Payment Method</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{transaction.payment_method}</p>
                  {transaction.reference && (
                    <p className="text-[11px] text-slate-500 font-mono">Ref: {transaction.reference}</p>
                  )}
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Transaction Type</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{transaction.type}</p>
                  <p className="text-[11px] text-slate-500">Category: {transaction.category}</p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Timestamp</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{transaction.transaction_date}</p>
                  <p className="text-[11px] text-slate-500">{transaction.transaction_time || '10:30 AM'}</p>
                </div>
              </div>

              {/* Remarks / Notes */}
              {transaction.remarks && (
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Remarks / Clinical Notes</span>
                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">{transaction.remarks}</p>
                </div>
              )}

              {/* Audit History if edited */}
              {transaction.audit_history && transaction.audit_history.length > 0 && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                    <History className="w-3.5 h-3.5 text-teal-600" />
                    <span>Audit History ({transaction.audit_history.length} revisions)</span>
                  </div>
                  <div className="text-[10px] text-slate-400 space-y-1">
                    {transaction.audit_history.map((h, i) => (
                      <p key={i}>• Modified at {new Date(h.modified_at).toLocaleString()} (Prior Amount: PKR {h.amount})</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Deletion confirmation notice */}
              {isDeleting ? (
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-300 dark:border-rose-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-800 dark:text-rose-200">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Are you sure you want to permanently delete this financial record?</span>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsDeleting(false)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={loading}
                      className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
                    >
                      {loading ? 'Deleting...' : 'Confirm Delete'}
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onPrintReceipt(transaction)}
                    className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs border border-teal-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Receipt</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                </div>

                {!isDeleting && (
                  <button
                    type="button"
                    onClick={() => setIsDeleting(true)}
                    className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                    title="Delete Transaction"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </>
          ) : (
            /* Edit Form */
            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">Amount (PKR) *</label>
                <input
                  type="number"
                  required
                  value={editForm.amount}
                  onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                  className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">Transaction Type</label>
                  <input
                    type="text"
                    value={editForm.type}
                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block">Payment Method</label>
                  <select
                    value={editForm.payment_method}
                    onChange={(e) => setEditForm({ ...editForm, payment_method: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
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
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">Remarks / Notes</label>
                <input
                  type="text"
                  value={editForm.remarks}
                  onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl shadow-md flex items-center gap-1"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
