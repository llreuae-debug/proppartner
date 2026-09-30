import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Download, 
  Upload, 
  Lock, 
  Key, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  RefreshCw,
  Database,
  Eye,
  Server
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function SecuritySettingsPage() {
  const { currentDoctor } = useAuth();
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [restoring, setRestoring] = useState(false);
  const [restoreSuccess, setRestoreSuccess] = useState(false);

  const loadAuditLogs = async () => {
    if (!currentDoctor) return;
    try {
      setLoadingLogs(true);
      const res = await api.getAuditLogs(currentDoctor.id);
      setAuditLogs(res.logs || []);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, [currentDoctor]);

  const handleExportBackup = () => {
    window.location.href = api.exportBackup();
  };

  const handleRestoreFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        setRestoring(true);
        const parsed = JSON.parse(evt.target.result);
        const res = await api.restoreBackup(parsed);
        if (res.success) {
          setRestoreSuccess(true);
          setTimeout(() => setRestoreSuccess(false), 4000);
          loadAuditLogs();
        }
      } catch (err) {
        alert("Failed to restore backup: " + err.message);
      } finally {
        setRestoring(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-850 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-teal-600" />
            <span>Security, Compliance & Practice Backup</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Role-based encryption, audit logs, and one-click clinical database backup/restore
          </p>
        </div>

        <button
          onClick={handleExportBackup}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>Export Full JSON Backup</span>
        </button>
      </div>

      {restoreSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Practice records and past prescriptions successfully restored!</span>
        </div>
      )}

      {/* Compliance Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-2">
          <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400">
            <Lock className="w-5 h-5" />
            <h3 className="text-xs font-black uppercase tracking-wider">Role-Based Isolation</h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Each physician's clinical records, patients, and digital prescriptions are strictly isolated. No cross-doctor patient data access is permitted.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-2">
          <div className="flex items-center gap-2 text-medblue-600 dark:text-medblue-400">
            <Key className="w-5 h-5" />
            <h3 className="text-xs font-black uppercase tracking-wider">Cryptographic Verification</h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Prescriptions generate tamper-evident unique verification tokens and QR codes allowing pharmacies to verify authentic signatures.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-2">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
            <Server className="w-5 h-5" />
            <h3 className="text-xs font-black uppercase tracking-wider">PMDC / Digital Health Ready</h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Includes mandatory patient consent tracking, allergy detection alerts, and digital timestamps adhering to healthcare IT standards.
          </p>
        </div>

      </div>

      {/* Backup & Restore Action Panel */}
      <div className="bg-white dark:bg-slate-850 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Database className="w-5 h-5 text-teal-600" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Practice Data Backup & Import
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
            <strong className="text-slate-800 dark:text-slate-200 block text-xs font-bold">
              Export Encrypted Practice Archive
            </strong>
            <p className="text-slate-500">
              Download your complete clinical database including all patient records, prescription histories, custom templates, and appointment schedules.
            </p>
            <button
              onClick={handleExportBackup}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Download Backup JSON</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
            <strong className="text-slate-800 dark:text-slate-200 block text-xs font-bold">
              Restore Practice Archive
            </strong>
            <p className="text-slate-500">
              Upload a previously exported DocCare JSON backup to restore historical clinical data and patient timelines.
            </p>
            <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors">
              <Upload className="w-4 h-4" />
              <span>{restoring ? 'Restoring Archive...' : 'Select Backup File'}</span>
              <input
                type="file"
                accept=".json"
                onChange={handleRestoreFile}
                className="hidden"
              />
            </label>
          </div>

        </div>
      </div>

      {/* Audit Trail Logs */}
      <div className="bg-white dark:bg-slate-850 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-card overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 uppercase tracking-wider">
              <Clock className="w-4 h-4 text-teal-600" />
              <span>Clinical Audit Trail Logs</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Immutable activity log tracking logins, appointments, and prescription issuances
            </p>
          </div>

          <button
            onClick={loadAuditLogs}
            className="p-2 text-slate-400 hover:text-teal-600 rounded-xl hover:bg-slate-100 transition-colors"
            title="Refresh logs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-80 overflow-y-auto font-mono text-xs">
          {auditLogs.length > 0 ? (
            auditLogs.map((log) => (
              <div key={log.id} className="p-3.5 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold text-[10px]">
                      {log.action}
                    </span>
                    <span className="text-slate-700 dark:text-slate-300 font-sans text-xs">
                      {log.details}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleTimeString()} • {new Date(log.timestamp).toLocaleDateString()}
                </span>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-400 italic">No audit logs recorded yet.</div>
          )}
        </div>
      </div>

    </div>
  );
}
