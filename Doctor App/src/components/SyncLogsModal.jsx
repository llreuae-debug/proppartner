import React, { useState, useEffect } from 'react';
import { 
  X, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Database, 
  Calendar, 
  FileText,
  Loader2,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';

export default function SyncLogsModal({ isOpen, onClose, onTriggerSync }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.getMedicineSyncLogs(30);
      setLogs(res.logs || []);
    } catch (err) {
      console.error("Failed to fetch sync logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleManualSync = async () => {
    try {
      setSyncing(true);
      await api.syncPakistanFormulary("DRAP / Pakistan National Formulary Manual Trigger");
      await fetchLogs();
      if (onTriggerSync) onTriggerSync();
    } catch (err) {
      console.error("Sync failed:", err);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden my-auto">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-teal-900 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                Daily Synchronization & Formulary Audit Logs
              </h2>
              <p className="text-xs text-teal-200/80 font-medium">
                24-Hour automated data pipeline history & DRAP feed verifications
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

        {/* Sync Summary Bar */}
        <div className="px-6 py-3 bg-teal-50 dark:bg-teal-950/40 border-b border-teal-100 dark:border-teal-900/40 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-teal-900 dark:text-teal-200">
            <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Automated Daily Interval: <strong>Every 24 Hours</strong></span>
          </div>
          <button
            onClick={handleManualSync}
            disabled={syncing}
            className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Synchronizing...' : 'Run Sync Now'}</span>
          </button>
        </div>

        {/* Log Entries */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3.5 divide-y divide-slate-100 dark:divide-slate-800">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
              <p className="text-xs font-medium">Loading synchronization audit records...</p>
            </div>
          ) : logs.length > 0 ? (
            logs.map((log, index) => {
              const isSuccess = log.status === 'success';
              const isPartial = log.status === 'partial';
              const isFailed = log.status === 'failed';

              return (
                <div key={log.id || index} className="pt-3.5 first:pt-0 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      {isSuccess ? (
                        <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      ) : isPartial ? (
                        <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                          <XCircle className="w-4 h-4" />
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-900 dark:text-white">
                            {log.source || "Pakistan National Formulary Feed"}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            isSuccess ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300' :
                            isPartial ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300' :
                            'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300'
                          }`}>
                            {log.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>Started: {new Date(log.started_at).toLocaleString()}</span>
                          <span>•</span>
                          <span>Completed: {new Date(log.completed_at).toLocaleTimeString()}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                        {log.records_processed} Records Processed
                      </div>
                    </div>
                  </div>

                  {/* Record Metrics */}
                  <div className="grid grid-cols-4 gap-2 bg-slate-50 dark:bg-slate-850 p-2.5 rounded-xl text-center border border-slate-200/60 dark:border-slate-800">
                    <div>
                      <div className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">Added</div>
                      <div className="text-xs font-black font-mono text-emerald-800 dark:text-emerald-300">+{log.records_added || 0}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold text-teal-700 dark:text-teal-400">Updated</div>
                      <div className="text-xs font-black font-mono text-teal-800 dark:text-teal-300">~{log.records_updated || 0}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Deactivated</div>
                      <div className="text-xs font-black font-mono text-slate-700 dark:text-slate-300">{log.records_deactivated || 0}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">Failed / Errors</div>
                      <div className="text-xs font-black font-mono text-rose-700 dark:text-rose-300">{log.records_failed || 0}</div>
                    </div>
                  </div>

                  {/* Errors if any */}
                  {Array.isArray(log.error_log) && log.error_log.length > 0 && (
                    <div className="bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200/60 dark:border-rose-900/40 text-[11px] text-rose-800 dark:text-rose-300 font-mono space-y-1">
                      <p className="font-bold text-[10px] uppercase text-rose-900 dark:text-rose-200">Errors Logged:</p>
                      {log.error_log.map((errStr, ei) => (
                        <p key={ei} className="truncate">• {errStr}</p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Database className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No synchronization logs recorded yet</p>
              <p className="text-[11px]">Run a synchronization to generate the first audit entry.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Retaining up to 50 latest 24-hour sync checkpoints.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors shadow-xs"
          >
            Close Logs
          </button>
        </div>

      </div>
    </div>
  );
}
