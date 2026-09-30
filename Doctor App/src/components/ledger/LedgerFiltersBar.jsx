import React, { useRef, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  ChevronDown, 
  X, 
  Calendar,
  Filter,
  RefreshCw,
  Users
} from 'lucide-react';

/**
 * Filter Bar matching the reference screenshot layout with DocCare design
 */
export default function LedgerFiltersBar({
  filters,
  onChangeFilters,
  onResetFilters,
  onOpenCashIn,
  onOpenCashOut,
  patients = [],
  currentDoctor = null,
  totalEntries = 0
}) {
  const searchInputRef = useRef(null);

  // Keyboard shortcut '/' to focus search input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const hasActiveFilters = 
    filters.duration !== 'all' ||
    filters.type !== 'all' ||
    filters.patient_id !== 'all' ||
    filters.payment_method !== 'all' ||
    filters.category !== 'all' ||
    Boolean(filters.q) ||
    Boolean(filters.start_date) ||
    Boolean(filters.end_date);

  return (
    <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      
      {/* Row 1: Duration, Types, Contacts/Patients, Members, Payment Modes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        
        {/* 1. Duration */}
        <div className="relative">
          <select
            value={filters.duration || 'all'}
            onChange={(e) => onChangeFilters({ duration: e.target.value })}
            className="w-full appearance-none px-3.5 py-2.5 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-2xl border border-slate-200/90 dark:border-slate-700 outline-none focus:ring-2 focus:ring-teal-500 pr-8 cursor-pointer transition-colors shadow-2xs"
          >
            <option value="all">Duration: All Time</option>
            <option value="today">Duration: Today</option>
            <option value="yesterday">Duration: Yesterday</option>
            <option value="this_week">Duration: This Week</option>
            <option value="this_month">Duration: This Month</option>
            <option value="last_month">Duration: Last Month</option>
            <option value="custom">Duration: Custom Range</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
        </div>

        {/* 2. Types */}
        <div className="relative">
          <select
            value={filters.type || 'all'}
            onChange={(e) => onChangeFilters({ type: e.target.value })}
            className="w-full appearance-none px-3.5 py-2.5 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-2xl border border-slate-200/90 dark:border-slate-700 outline-none focus:ring-2 focus:ring-teal-500 pr-8 cursor-pointer transition-colors shadow-2xs"
          >
            <option value="all">Types: All</option>
            <option value="cash_in">Types: Cash In (Income)</option>
            <option value="cash_out">Types: Cash Out (Expense)</option>
            <option value="Consultation Fee">Types: Consultation Fee</option>
            <option value="Follow-up Fee">Types: Follow-up Fee</option>
            <option value="Procedure Fee">Types: Procedure Fee</option>
            <option value="Injection Fee">Types: Injection Fee</option>
            <option value="Staff Salary">Types: Staff Salary</option>
            <option value="Rent">Types: Rent</option>
            <option value="Electricity">Types: Electricity</option>
            <option value="Medical Supplies">Types: Medical Supplies</option>
            <option value="Refund">Types: Refund</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
        </div>

        {/* 3. Contacts / Patients */}
        <div className="relative">
          <select
            value={filters.patient_id || 'all'}
            onChange={(e) => onChangeFilters({ patient_id: e.target.value })}
            className="w-full appearance-none px-3.5 py-2.5 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-2xl border border-slate-200/90 dark:border-slate-700 outline-none focus:ring-2 focus:ring-teal-500 pr-8 cursor-pointer transition-colors shadow-2xs"
          >
            <option value="all">Contacts: All</option>
            {patients.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.phone || 'PAT-' + p.id.slice(0, 5)})
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
        </div>

        {/* 4. Members / Doctor Isolation */}
        <div className="relative">
          <select
            value={filters.member || 'all'}
            onChange={(e) => onChangeFilters({ member: e.target.value })}
            className="w-full appearance-none px-3.5 py-2.5 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-2xl border border-slate-200/90 dark:border-slate-700 outline-none focus:ring-2 focus:ring-teal-500 pr-8 cursor-pointer transition-colors shadow-2xs"
          >
            <option value="all">Members: All</option>
            <option value={currentDoctor?.id || 'doc-1'}>
              {currentDoctor?.name || 'Dr. Ayesha Siddiqui'}
            </option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
        </div>

        {/* 5. Payment Modes */}
        <div className="relative col-span-2 sm:col-span-1">
          <select
            value={filters.payment_method || 'all'}
            onChange={(e) => onChangeFilters({ payment_method: e.target.value })}
            className="w-full appearance-none px-3.5 py-2.5 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-2xl border border-slate-200/90 dark:border-slate-700 outline-none focus:ring-2 focus:ring-teal-500 pr-8 cursor-pointer transition-colors shadow-2xs"
          >
            <option value="all">Payment Modes: All</option>
            <option value="Cash">Mode: Cash</option>
            <option value="Bank Transfer">Mode: Bank Transfer</option>
            <option value="JazzCash">Mode: JazzCash</option>
            <option value="Easypaisa">Mode: Easypaisa</option>
            <option value="Card">Mode: Card / POS</option>
            <option value="Cheque">Mode: Cheque</option>
            <option value="Other">Mode: Other</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
        </div>

      </div>

      {/* Row 2: Categories Dropdown & Custom Date Range Pickers (if custom) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[200px]">
            <select
              value={filters.category || 'all'}
              onChange={(e) => onChangeFilters({ category: e.target.value })}
              className="w-full appearance-none px-3.5 py-2.5 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-2xl border border-slate-200/90 dark:border-slate-700 outline-none focus:ring-2 focus:ring-teal-500 pr-8 cursor-pointer transition-colors shadow-2xs"
            >
              <option value="all">Categories: All</option>
              <option value="Consultation">Category: Consultation</option>
              <option value="Procedure">Category: Procedure</option>
              <option value="Medication">Category: Medication</option>
              <option value="Laboratory">Category: Laboratory</option>
              <option value="Supplies">Category: Supplies</option>
              <option value="Rent">Category: Rent</option>
              <option value="Salary">Category: Salary</option>
              <option value="Utilities">Category: Utilities</option>
              <option value="Marketing">Category: Marketing</option>
              <option value="Refund">Category: Refund</option>
              <option value="Other">Category: Other</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
          </div>

          {/* Custom Date Pickers when 'custom' selected */}
          {filters.duration === 'custom' && (
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-850 px-3 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs animate-fade-in">
              <span className="text-slate-400 font-medium">From:</span>
              <input
                type="date"
                value={filters.start_date || ''}
                onChange={(e) => onChangeFilters({ start_date: e.target.value })}
                className="bg-white dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none"
              />
              <span className="text-slate-400 font-medium">To:</span>
              <input
                type="date"
                value={filters.end_date || ''}
                onChange={(e) => onChangeFilters({ end_date: e.target.value })}
                className="bg-white dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold outline-none"
              />
            </div>
          )}

          {/* Reset Filters chip if active */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="text-[11px] font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Showing <strong>{totalEntries}</strong> {totalEntries === 1 ? 'entry' : 'entries'}
        </div>
      </div>

      {/* Row 3: Search Bar with '/' shortcut + Cash In (Teal) + Cash Out (Red) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1 border-t border-slate-100 dark:border-slate-800/80">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={filters.q || ''}
            onChange={(e) => onChangeFilters({ q: e.target.value })}
            placeholder="Search patient, remark, transaction or amount..."
            className="w-full pl-11 pr-12 py-2.5 text-xs font-medium text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-700 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/15 transition-all shadow-2xs"
          />
          {filters.q ? (
            <button
              type="button"
              onClick={() => onChangeFilters({ q: '' })}
              className="p-1 text-slate-400 hover:text-slate-600 absolute right-3 top-2.5"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-lg absolute right-3 top-2.5 pointer-events-none">
              /
            </span>
          )}
        </div>

        {/* Action Buttons: Cash In & Cash Out */}
        <div className="flex items-center gap-2.5 shrink-0">
          
          {/* Primary Teal + Cash In button */}
          <button
            type="button"
            onClick={onOpenCashIn}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-2xl bg-[#00875a] hover:bg-[#00744e] active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Cash In</span>
          </button>

          {/* Red Danger − Cash Out button */}
          <button
            type="button"
            onClick={onOpenCashOut}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-2xl bg-[#c92a2a] hover:bg-[#b02525] active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-rose-700/20 transition-all cursor-pointer"
          >
            <Minus className="w-4 h-4 stroke-[3]" />
            <span>Cash Out</span>
          </button>

        </div>

      </div>

    </div>
  );
}
