import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Plus, 
  Minus, 
  Search, 
  Printer, 
  Download, 
  FileSpreadsheet, 
  Calendar, 
  Clock, 
  User, 
  Building2, 
  ExternalLink, 
  ChevronRight, 
  Receipt, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight, 
  Loader2,
  Filter,
  CheckCircle2,
  DollarSign,
  Layers,
  Sparkles,
  Eye,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LedgerSummaryCards from '../components/ledger/LedgerSummaryCards';
import LedgerFiltersBar from '../components/ledger/LedgerFiltersBar';
import CashInModal from '../components/ledger/CashInModal';
import CashOutModal from '../components/ledger/CashOutModal';
import TransactionDetailModal from '../components/ledger/TransactionDetailModal';
import PatientReceiptModal from '../components/ledger/PatientReceiptModal';

export default function DoctorLedgerPage({ onNavigateToPatient }) {
  const { currentDoctor } = useAuth();
  const { t } = useLanguage();

  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State matching reference
  const [filters, setFilters] = useState({
    duration: 'all',
    type: 'all',
    patient_id: 'all',
    member: 'all',
    payment_method: 'all',
    category: 'all',
    q: '',
    start_date: '',
    end_date: ''
  });

  // Modals
  const [isCashInOpen, setIsCashInOpen] = useState(false);
  const [isCashOutOpen, setIsCashOutOpen] = useState(false);
  const [selectedTransactionForDetail, setSelectedTransactionForDetail] = useState(null);
  const [selectedTransactionForReceipt, setSelectedTransactionForReceipt] = useState(null);

  const loadLedgerData = async () => {
    if (!currentDoctor) return;
    try {
      setLoading(true);
      const [entriesRes, summaryRes, patientsRes] = await Promise.all([
        api.getLedgerEntries(filters),
        api.getLedgerSummary(filters),
        api.getPatients()
      ]);

      setEntries(entriesRes.entries || []);
      setSummary(summaryRes.summary || null);
      setPatients(patientsRes.patients || []);
    } catch (err) {
      console.error("Failed to load doctor ledger data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLedgerData();
  }, [currentDoctor, filters]);

  const handleUpdateFilters = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      duration: 'all',
      type: 'all',
      patient_id: 'all',
      member: 'all',
      payment_method: 'all',
      category: 'all',
      q: '',
      start_date: '',
      end_date: ''
    });
  };

  const handleCashInSuccess = (newEntry) => {
    loadLedgerData();
  };

  const handleCashOutSuccess = (newEntry) => {
    loadLedgerData();
  };

  const handleDeleteSuccess = (deletedId) => {
    loadLedgerData();
  };

  const handleUpdateSuccess = (updatedEntry) => {
    loadLedgerData();
    setSelectedTransactionForDetail(updatedEntry);
  };

  const handleExportCSV = () => {
    const url = api.getLedgerCsvUrl(filters);
    window.open(url, '_blank');
  };

  const handlePrintLedger = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      
      {/* Top Header & Export Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800 shadow-xs">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Doctor Ledger & Accounting
                </h1>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  {entries.length} {entries.length === 1 ? 'Record' : 'Records'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Practice: <strong className="text-slate-700 dark:text-slate-200">{currentDoctor?.name}</strong> • Real-time patient financials & cash flow
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls: Export CSV & Print */}
        <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto justify-end no-print">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={handlePrintLedger}
            className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Print Ledger</span>
          </button>
        </div>
      </div>

      {/* 1. DYNAMIC SUMMARY STATS CARDS */}
      <LedgerSummaryCards summary={summary} loading={loading} />

      {/* 2. FILTERS & SEARCH & CASH IN / CASH OUT BUTTONS (MATCHING ATTACHED SCREENSHOT) */}
      <LedgerFiltersBar
        filters={filters}
        onChangeFilters={handleUpdateFilters}
        onResetFilters={handleResetFilters}
        onOpenCashIn={() => setIsCashInOpen(true)}
        onOpenCashOut={() => setIsCashOutOpen(true)}
        patients={patients}
        currentDoctor={currentDoctor}
        totalEntries={entries.length}
      />

      {/* 3. LEDGER TRANSACTIONS LIST */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        
        {loading ? (
          <div className="p-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-500">Calculating running balances & transactions...</p>
          </div>
        ) : entries.length === 0 ? (
          /* Empty State (Matches the exact visual from screenshot) */
          <div className="py-20 px-4 text-center space-y-4 animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 mx-auto">
              <Receipt className="w-8 h-8 stroke-[1.5]" />
            </div>
            
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                No entries added Yet!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-center gap-1">
                <span>Use</span>
                <strong className="text-[#00875a]">Cash In</strong>
                <span>or</span>
                <strong className="text-[#c92a2a]">Cash Out</strong>
                <span>to add entries</span>
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCashInOpen(true)}
                className="px-5 py-2.5 rounded-2xl bg-[#00875a] hover:bg-[#00744e] active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ Cash In</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCashOutOpen(true)}
                className="px-5 py-2.5 rounded-2xl bg-[#c92a2a] hover:bg-[#b02525] active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-700/20 transition-all cursor-pointer"
              >
                <Minus className="w-4 h-4 stroke-[3]" />
                <span>− Cash Out</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-850/80 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Date & Time</th>
                    <th className="py-3.5 px-4">Patient</th>
                    <th className="py-3.5 px-4">Type & Category</th>
                    <th className="py-3.5 px-4">Description</th>
                    <th className="py-3.5 px-4">Payment Method</th>
                    <th className="py-3.5 px-4 text-right">Cash In</th>
                    <th className="py-3.5 px-4 text-right">Cash Out</th>
                    <th className="py-3.5 px-4 text-right">Balance</th>
                    <th className="py-3.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {entries.map((entry) => {
                    const isCashIn = entry.entry_type === 'cash_in';
                    return (
                      <tr 
                        key={entry.id} 
                        className="hover:bg-teal-50/40 dark:hover:bg-teal-950/20 transition-colors group cursor-pointer"
                        onClick={() => setSelectedTransactionForDetail(entry)}
                      >
                        {/* 1. Date & Time */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <p className="font-bold text-slate-900 dark:text-white">{entry.transaction_date}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{entry.transaction_time || '10:30 AM'}</p>
                        </td>

                        {/* 2. Patient */}
                        <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                          {entry.patient_id ? (
                            <button
                              type="button"
                              onClick={() => onNavigateToPatient && onNavigateToPatient(entry.patient_id)}
                              className="text-left group/p hover:underline flex flex-col"
                            >
                              <span className="font-bold text-teal-700 dark:text-teal-300 group-hover/p:text-teal-800 flex items-center gap-1">
                                {entry.patient_name}
                                <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover/p:opacity-100 transition-opacity" />
                              </span>
                              {entry.patient_code && (
                                <span className="text-[10px] text-slate-400 font-mono">{entry.patient_code}</span>
                              )}
                            </button>
                          ) : (
                            <div>
                              <span className="font-semibold text-slate-700 dark:text-slate-300">{entry.patient_name || 'Non-patient'}</span>
                              <span className="text-[10px] text-slate-400 block">General Expense</span>
                            </div>
                          )}
                        </td>

                        {/* 3. Type & Category */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`inline-block text-[10.5px] font-bold px-2 py-0.5 rounded-lg ${
                            isCashIn 
                              ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300' 
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}>
                            {entry.type}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {entry.category || 'General'}
                          </span>
                        </td>

                        {/* 4. Description / Remarks */}
                        <td className="py-3.5 px-4 max-w-[200px] truncate" title={entry.description || entry.remarks}>
                          <p className="text-slate-700 dark:text-slate-300 truncate">
                            {entry.description || entry.remarks || '—'}
                          </p>
                          {entry.reference && (
                            <span className="text-[10px] text-slate-400 font-mono">Ref: {entry.reference}</span>
                          )}
                        </td>

                        {/* 5. Payment Method */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10.5px] font-semibold border border-slate-200 dark:border-slate-700">
                            {entry.payment_method || 'Cash'}
                          </span>
                        </td>

                        {/* 6. Cash In */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          {isCashIn ? (
                            <span className="font-bold text-[#00875a] dark:text-emerald-400 font-mono text-xs">
                              PKR {Number(entry.amount).toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-600">—</span>
                          )}
                        </td>

                        {/* 7. Cash Out */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          {!isCashIn ? (
                            <span className="font-bold text-[#c92a2a] dark:text-rose-400 font-mono text-xs">
                              PKR {Number(entry.amount).toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-600">—</span>
                          )}
                        </td>

                        {/* 8. Running Balance */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono font-bold text-slate-900 dark:text-white">
                          PKR {(entry.running_balance || 0).toLocaleString()}
                        </td>

                        {/* 9. Actions */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => setSelectedTransactionForReceipt(entry)}
                              className="p-1.5 text-slate-400 hover:text-teal-700 dark:hover:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/50 rounded-lg transition-colors"
                              title="Print Receipt"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedTransactionForDetail(entry)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile-First Card View (No horizontal scrolling) */}
            <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {entries.map((entry) => {
                const isCashIn = entry.entry_type === 'cash_in';
                return (
                  <div
                    key={entry.id}
                    onClick={() => setSelectedTransactionForDetail(entry)}
                    className="p-4 hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors cursor-pointer space-y-2.5 active:bg-slate-100"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white">
                          {entry.patient_name || 'Clinic Expense'}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] font-bold px-2 py-0.2 rounded-md ${
                            isCashIn 
                              ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300' 
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}>
                            {entry.type}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {entry.payment_method || 'Cash'}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className={`text-sm font-black font-mono ${
                          isCashIn ? 'text-[#00875a]' : 'text-[#c92a2a]'
                        }`}>
                          {isCashIn ? '+' : '−'} PKR {Number(entry.amount).toLocaleString()}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 font-mono mt-0.5">
                          Bal: PKR {(entry.running_balance || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <span>{entry.transaction_date} • {entry.transaction_time || '10:30 AM'}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTransactionForReceipt(entry);
                        }}
                        className="text-teal-700 dark:text-teal-400 font-bold flex items-center gap-1"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Receipt</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

      </div>

      {/* ==================================================== */}
      {/* MODALS */}
      {/* ==================================================== */}

      {/* 1. Cash In Modal */}
      <CashInModal
        isOpen={isCashInOpen}
        onClose={() => setIsCashInOpen(false)}
        onSuccess={handleCashInSuccess}
        patients={patients}
      />

      {/* 2. Cash Out Modal */}
      <CashOutModal
        isOpen={isCashOutOpen}
        onClose={() => setIsCashOutOpen(false)}
        onSuccess={handleCashOutSuccess}
        patients={patients}
      />

      {/* 3. Transaction Detail Modal */}
      <TransactionDetailModal
        isOpen={Boolean(selectedTransactionForDetail)}
        onClose={() => setSelectedTransactionForDetail(null)}
        transaction={selectedTransactionForDetail}
        onPrintReceipt={(txn) => {
          setSelectedTransactionForDetail(null);
          setSelectedTransactionForReceipt(txn);
        }}
        onDeleteSuccess={handleDeleteSuccess}
        onUpdateSuccess={handleUpdateSuccess}
      />

      {/* 4. Patient Receipt & Invoice Modal */}
      <PatientReceiptModal
        isOpen={Boolean(selectedTransactionForReceipt)}
        onClose={() => setSelectedTransactionForReceipt(null)}
        transaction={selectedTransactionForReceipt}
        doctor={currentDoctor}
      />

    </div>
  );
}
