import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Users, 
  Receipt, 
  Layers, 
  Sparkles,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

/**
 * Summary cards for Doctor Ledger (Dynamic calculation based on active filters)
 */
export default function LedgerSummaryCards({ summary, loading = false }) {
  const {
    totalCashIn = 0,
    totalCashOut = 0,
    netBalance = 0,
    patientPayments = 0,
    otherIncome = 0,
    totalExpenses = 0
  } = summary || {};

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      
      {/* 1. Total Cash In */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-teal-200/80 dark:border-teal-900/50 shadow-sm relative overflow-hidden group hover:border-teal-400 transition-all">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] sm:text-[11px] font-bold text-teal-700 dark:text-teal-300 uppercase tracking-wider">
            Total Cash In
          </span>
          <div className="w-6 h-6 rounded-lg bg-teal-50 dark:bg-teal-950/80 flex items-center justify-center text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800">
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>
        <p className="text-base sm:text-lg font-black text-teal-800 dark:text-teal-200 truncate">
          + PKR {totalCashIn.toLocaleString()}
        </p>
        <div className="mt-1 text-[10px] text-teal-600/80 dark:text-teal-400/80 font-medium">
          All collected revenue
        </div>
      </div>

      {/* 2. Total Cash Out */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-rose-200/80 dark:border-rose-900/50 shadow-sm relative overflow-hidden group hover:border-rose-400 transition-all">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] sm:text-[11px] font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider">
            Total Cash Out
          </span>
          <div className="w-6 h-6 rounded-lg bg-rose-50 dark:bg-rose-950/80 flex items-center justify-center text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
            <ArrowDownRight className="w-3.5 h-3.5" />
          </div>
        </div>
        <p className="text-base sm:text-lg font-black text-rose-800 dark:text-rose-200 truncate">
          − PKR {totalCashOut.toLocaleString()}
        </p>
        <div className="mt-1 text-[10px] text-rose-600/80 dark:text-rose-400/80 font-medium">
          Expenses & refunds
        </div>
      </div>

      {/* 3. Net Balance */}
      <div className={`p-4 rounded-2xl border shadow-sm relative overflow-hidden group transition-all ${
        netBalance >= 0 
          ? 'bg-teal-50/50 dark:bg-teal-950/30 border-teal-300 dark:border-teal-800' 
          : 'bg-rose-50/50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'
      }`}>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Net Balance
          </span>
          <div className="w-6 h-6 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <Wallet className="w-3.5 h-3.5 text-teal-600" />
          </div>
        </div>
        <p className={`text-base sm:text-lg font-black truncate ${
          netBalance >= 0 ? 'text-teal-900 dark:text-teal-100' : 'text-rose-900 dark:text-rose-100'
        }`}>
          PKR {netBalance.toLocaleString()}
        </p>
        <div className="mt-1 text-[10px] text-slate-500 font-medium">
          Cash In minus Out
        </div>
      </div>

      {/* 4. Patient Payments */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Patient Payments
          </span>
          <div className="w-6 h-6 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500">
            <Users className="w-3.5 h-3.5 text-medblue-600" />
          </div>
        </div>
        <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
          PKR {patientPayments.toLocaleString()}
        </p>
        <div className="mt-1 text-[10px] text-slate-400 font-medium">
          Fees & clinical services
        </div>
      </div>

      {/* 5. Other Income */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Other Income
          </span>
          <div className="w-6 h-6 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          </div>
        </div>
        <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
          PKR {otherIncome.toLocaleString()}
        </p>
        <div className="mt-1 text-[10px] text-slate-400 font-medium">
          Non-patient adjustments
        </div>
      </div>

      {/* 6. Expenses */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Expenses
          </span>
          <div className="w-6 h-6 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500">
            <Receipt className="w-3.5 h-3.5 text-rose-500" />
          </div>
        </div>
        <p className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
          PKR {totalExpenses.toLocaleString()}
        </p>
        <div className="mt-1 text-[10px] text-slate-400 font-medium">
          Clinic operational costs
        </div>
      </div>

    </div>
  );
}
