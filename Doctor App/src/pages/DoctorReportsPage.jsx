import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, DollarSign, Users, Calendar, Activity, 
  FileText, Pill, Stethoscope, Download, Printer, CheckCircle2, 
  Clock, CreditCard, Wallet, Landmark, RefreshCw, AlertCircle
} from 'lucide-react';
import { api } from '../services/api';

export default function DoctorReportsPage() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [ledgerSummary, setLedgerSummary] = useState(null);
  const [dateRange, setDateRange] = useState('all'); // 'today', 'month', 'all'

  useEffect(() => {
    loadReportsData();
  }, [dateRange]);

  const loadReportsData = async () => {
    try {
      setLoading(true);
      const res = await api.getDoctorReportsAnalytics();
      setAnalytics(res.analytics || {});
      setLedgerSummary(res.ledgerSummary || {});
    } catch (err) {
      console.error("Failed to load reports data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-4 sm:p-8">
        <div className="h-8 bg-slate-200 rounded-lg w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-28 bg-slate-100 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-100 rounded-3xl"></div>
          <div className="h-64 bg-slate-100 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in p-2 sm:p-6 pb-24">
      
      {/* Page Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-850 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 text-xs font-bold uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Practice Performance & Clinical Insights</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
            Reports & Practice Analytics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time financial summaries, patient visit metrics, top diagnoses, and prescription logs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadReportsData}
            className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            title="Refresh Data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-700/20 transition-all flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Top 4 Financial & Operational KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Total Revenue */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-teal-700 dark:text-teal-400 text-xs font-bold">
            <span>Net Collected Revenue</span>
            <DollarSign className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
            PKR {(ledgerSummary?.netIncome || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400">
            Gross Cash In: PKR {(ledgerSummary?.totalIncome || 0).toLocaleString()}
          </div>
        </div>

        {/* Total Prescriptions */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-blue-700 dark:text-blue-400 text-xs font-bold">
            <span>Prescriptions Issued</span>
            <FileText className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
            {analytics?.totalPrescriptions || 0}
          </div>
          <div className="text-[11px] text-slate-400">
            Clinical digital prescriptions generated
          </div>
        </div>

        {/* Completed Consultations */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 text-xs font-bold">
            <span>Appointments Completed</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {analytics?.completedAppointments || 0}
          </div>
          <div className="text-[11px] text-slate-400">
            Out of {analytics?.totalAppointments || 0} total bookings
          </div>
        </div>

        {/* Completion Rate */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-purple-700 dark:text-purple-400 text-xs font-bold">
            <span>Consultation Rate</span>
            <Activity className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-700 dark:text-purple-400">
            {analytics?.completionRate || 100}%
          </div>
          <div className="text-[11px] text-slate-400">
            Completed vs Cancelled appointment ratio
          </div>
        </div>

      </div>

      {/* Two Column Grid: Clinical Insights + Financial Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Diagnoses Card */}
        <div className="bg-white dark:bg-slate-850 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-teal-600" />
            <span>Top Clinical Diagnoses Treated</span>
          </h3>

          <div className="space-y-3">
            {(!analytics?.topDiagnoses || analytics.topDiagnoses.length === 0) ? (
              <p className="text-xs text-slate-400 italic py-4">No prescription diagnoses logged yet.</p>
            ) : (
              analytics.topDiagnoses.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-800 dark:text-slate-200">{item.name}</span>
                    <span className="text-teal-700 dark:text-teal-400">{item.count} patients</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-teal-500 to-teal-700 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (item.count / (analytics.totalPrescriptions || 1)) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Most Prescribed Medications */}
        <div className="bg-white dark:bg-slate-850 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Pill className="w-4 h-4 text-blue-600" />
            <span>Most Prescribed Medicines</span>
          </h3>

          <div className="space-y-2.5">
            {(!analytics?.topMedicines || analytics.topMedicines.length === 0) ? (
              <p className="text-xs text-slate-400 italic py-4">No medication items recorded yet.</p>
            ) : (
              analytics.topMedicines.map((med, idx) => (
                <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 font-bold font-mono text-[11px] flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{med.name}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-100/80 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-bold font-mono text-[11px]">
                    {med.count} Rx
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Payment Methods Distribution */}
      <div className="bg-white dark:bg-slate-850 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-emerald-600" />
          <span>Income by Payment Channel</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {Object.entries(analytics?.paymentMethods || {}).map(([method, amount]) => (
            <div key={method} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">{method}</span>
              <span className="text-base font-black text-slate-900 dark:text-slate-100 block">
                PKR {amount.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
