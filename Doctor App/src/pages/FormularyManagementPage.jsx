import React, { useState, useEffect, useRef } from 'react';
import { 
  Pill, 
  Search, 
  Plus, 
  RefreshCw, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Download, 
  Upload, 
  History, 
  Edit3, 
  Trash2, 
  Power, 
  PowerOff, 
  Building2, 
  Layers, 
  ShieldCheck, 
  FileSpreadsheet, 
  Activity, 
  ChevronRight, 
  ChevronLeft,
  X,
  Loader2,
  Sparkles,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import AddMedicineModal from '../components/AddMedicineModal';
import SyncLogsModal from '../components/SyncLogsModal';

const DOSAGE_FORMS = [
  "All Forms",
  "Tablet",
  "Capsule",
  "Syrup / Suspension",
  "Injection (IV/IM)",
  "Cream / Ointment",
  "Eye Drops",
  "Inhaler / Respules",
  "Sachet / Powder"
];

const THERAPEUTIC_CLASSES = [
  "All Classes",
  "Analgesics & Antipyretics",
  "Antibiotics & Anti-Infectives",
  "Cardiovascular & Antihypertensives",
  "Gastrointestinal & PPI",
  "Endocrine & Antidiabetic",
  "Respiratory & Antiasthmatics",
  "Antihistamines & Allergy Relief"
];

export default function FormularyManagementPage() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState(null);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [formFilter, setFormFilter] = useState('All Forms');
  const [classFilter, setClassFilter] = useState('All Classes');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive'
  const [manufacturerFilter, setManufacturerFilter] = useState('');

  // Modals & Triggers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [isSyncLogsOpen, setIsSyncLogsOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [notification, setNotification] = useState(null);

  // Import file ref
  const importFileRef = useRef(null);

  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

  const fetchFormularyData = async () => {
    try {
      setLoading(true);
      const [medsRes, metaRes] = await Promise.all([
        api.searchMedicines(searchQuery, {
          form: formFilter === 'All Forms' ? '' : formFilter,
          category: classFilter === 'All Classes' ? '' : classFilter,
          status: statusFilter,
          manufacturer: manufacturerFilter,
          limit: 200
        }),
        api.getFormularySyncStatus().catch(() => ({ meta: null }))
      ]);

      setMedicines(medsRes.medicines || []);
      if (metaRes?.meta) {
        setMeta(metaRes.meta);
      }
    } catch (err) {
      console.error("Failed to load Pakistan Formulary:", err);
      showNotification("Failed to load medicine database", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFormularyData();
  }, [searchQuery, formFilter, classFilter, statusFilter, manufacturerFilter]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4500);
  };

  const handleRunSync = async () => {
    try {
      setSyncing(true);
      const res = await api.syncPakistanFormulary("DRAP / Pakistan National Formulary Live Sync");
      showNotification(`Synchronization complete: +${res.syncLog?.records_added || 0} added, ~${res.syncLog?.records_updated || 0} updated.`, "success");
      await fetchFormularyData();
    } catch (err) {
      showNotification("Sync failed: " + err.message, "error");
    } finally {
      setSyncing(false);
    }
  };

  const handleToggleStatus = async (med) => {
    try {
      const nextStatus = med.status === 'active' ? 'inactive' : 'active';
      await api.toggleMedicineStatus(med.id, nextStatus);
      showNotification(`Marked '${med.brand_name}' as ${nextStatus}`, "success");
      setMedicines(prev => prev.map(m => m.id === med.id ? { ...m, status: nextStatus } : m));
    } catch (err) {
      showNotification("Failed to update status: " + err.message, "error");
    }
  };

  const handleDeleteMedicine = async (med) => {
    if (!window.confirm(`Are you sure you want to remove '${med.brand_name}' from the formulary? If referenced in clinical history, it will be safely deactivated.`)) {
      return;
    }
    try {
      const res = await api.deleteMedicine(med.id);
      if (res.deactivated) {
        showNotification(res.message || "Preserved historical records: medicine marked as inactive.", "warning");
      } else {
        showNotification(`Removed '${med.brand_name}' successfully.`, "success");
      }
      fetchFormularyData();
    } catch (err) {
      showNotification("Delete failed: " + err.message, "error");
    }
  };

  const handleExport = () => {
    window.open(api.getExportMedicinesUrl(), '_blank');
  };

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const parsed = JSON.parse(evt.target.result);
        const records = Array.isArray(parsed) ? parsed : (parsed.medicines || []);
        if (records.length === 0) {
          showNotification("Invalid file format: No medicines array found.", "error");
          return;
        }

        setSyncing(true);
        const res = await api.importMedicines(records, `Batch Import (${file.name})`);
        showNotification(res.message || `Successfully imported ${records.length} records.`, "success");
        fetchFormularyData();
      } catch (parseErr) {
        showNotification("Failed to parse JSON file: " + parseErr.message, "error");
      } finally {
        setSyncing(false);
        if (importFileRef.current) importFileRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  // Pagination calculation
  const totalPages = Math.ceil(medicines.length / itemsPerPage) || 1;
  const paginatedMedicines = medicines.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const isUpToDate = meta?.status === 'up_to_date';

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-2.5 animate-slide-in ${
          notification.type === 'error' 
            ? 'bg-rose-50 dark:bg-rose-950 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200' 
            : notification.type === 'warning'
            ? 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200'
            : 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
        }`}>
          {notification.type === 'error' ? (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Top Banner: Pakistan Formulary Live Status */}
      <div className="rounded-3xl bg-gradient-to-br from-teal-900 via-slate-900 to-medblue-950 text-white p-6 sm:p-7 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-12 bottom-0 w-64 h-64 bg-medblue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Pakistan Formulary
              </span>
              
              {/* Dynamic Live Status Badge */}
              {isUpToDate ? (
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-bold text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Status: ✓ Up to date
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 font-bold text-xs flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Status: ⚠ Update unavailable
                </span>
              )}

              <span className="text-xs text-slate-300 font-mono">
                Version: {meta?.version || '2026.4.1-PK-DRAP'}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight">
              Prescribed Medications (Pakistan Formulary)
            </h1>

            <div className="flex items-center gap-4 text-xs text-teal-100/80 pt-1 flex-wrap">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-teal-300" />
                Last Updated: {meta?.last_updated ? new Date(meta.last_updated).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' }) : '01 Oct 2026, 02:00 AM'}
              </span>
              <span>•</span>
              <span>Automated 24h Daily Sync: <strong>Active</strong></span>
              <span>•</span>
              <span>Active Medicines: <strong>{meta?.active_medicines || medicines.length}</strong></span>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => {
                setEditingMedicine(null);
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white text-xs font-black rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Medicine</span>
            </button>

            <button
              onClick={handleRunSync}
              disabled={syncing}
              className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-xs font-bold rounded-2xl border border-white/15 transition-all flex items-center gap-2 disabled:opacity-50"
              title="Run 24-hour daily Pakistan Formulary update"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin text-teal-300' : ''}`} />
              <span>{syncing ? 'Syncing...' : 'Daily Sync'}</span>
            </button>

            <button
              onClick={() => setIsSyncLogsOpen(true)}
              className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-2xl border border-white/15 transition-all flex items-center gap-2"
            >
              <History className="w-4 h-4 text-teal-300" />
              <span>Sync Logs</span>
            </button>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Multi-Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        
        {/* Main Search */}
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-teal-600 dark:text-teal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Brand Name, Generic Name, Active Ingredient, Strength, Manufacturer (e.g. 'Panadol', 'Paracetamol', '500 mg', 'GSK')..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-10 py-2.5 text-xs font-semibold rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 focus:bg-white dark:focus:bg-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Import / Export Controls */}
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
            <input
              type="file"
              ref={importFileRef}
              onChange={handleImportFile}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => importFileRef.current?.click()}
              className="px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
              title="Import formulary JSON data"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Import</span>
            </button>
            <button
              onClick={handleExport}
              className="px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
              title="Export formulary JSON database"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
          
          {/* Form Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Dosage Form
            </label>
            <select
              value={formFilter}
              onChange={(e) => {
                setFormFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-xs font-medium outline-none focus:border-teal-500"
            >
              {DOSAGE_FORMS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          {/* Therapeutic Class */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Therapeutic Class
            </label>
            <select
              value={classFilter}
              onChange={(e) => {
                setClassFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-xs font-medium outline-none focus:border-teal-500"
            >
              {THERAPEUTIC_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-xs font-medium outline-none focus:border-teal-500"
            >
              <option value="all">All (Active & Inactive)</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>

          {/* Manufacturer Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Manufacturer
            </label>
            <input
              type="text"
              placeholder="e.g. GSK, Getz, Searle..."
              value={manufacturerFilter}
              onChange={(e) => {
                setManufacturerFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-xs font-medium outline-none focus:border-teal-500"
            />
          </div>
        </div>
      </div>

      {/* Main Medicine List Table / Cards */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        
        {/* Table Header Info */}
        <div className="px-6 py-4 bg-slate-50/80 dark:bg-slate-850/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Pill className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-black text-slate-800 dark:text-slate-100">
              Formulary Catalog ({medicines.length} items found)
            </span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Page {page} of {totalPages}
          </span>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Searching Pakistan Formulary...</p>
          </div>
        ) : paginatedMedicines.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/60 dark:bg-slate-800/60 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4">Brand & Strength</th>
                  <th className="py-3 px-4">Generic Salt & Active Ingredient</th>
                  <th className="py-3 px-4">Dosage Form & Route</th>
                  <th className="py-3 px-4">Manufacturer</th>
                  <th className="py-3 px-4">Class & Regulatory</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {paginatedMedicines.map((med) => {
                  const isActive = med.status !== 'inactive';
                  return (
                    <tr 
                      key={med.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                        !isActive ? 'opacity-60 bg-slate-50/40 dark:bg-slate-900/40' : ''
                      }`}
                    >
                      {/* Brand & Strength */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-slate-900 dark:text-white text-xs">
                              {med.brand_name}
                            </span>
                            <span className="px-2 py-0.2 rounded-md bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 font-bold font-mono text-[10px]">
                              {med.strength}
                            </span>
                          </div>
                          {med.pack_size && (
                            <p className="text-[10px] text-slate-400">{med.pack_size}</p>
                          )}
                        </div>
                      </td>

                      {/* Generic & Active Ingredient */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-700 dark:text-slate-200">
                            {med.generic_name}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 italic truncate max-w-[200px]">
                            Salt: {med.active_ingredient || med.generic_name}
                          </p>
                        </div>
                      </td>

                      {/* Dosage Form & Route */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[10px]">
                            {med.dosage_form || med.form || 'Tablet'}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-medblue-50 dark:bg-medblue-950/40 text-medblue-700 dark:text-medblue-300 text-[10px]">
                            {med.route || 'Oral'}
                          </span>
                        </div>
                      </td>

                      {/* Manufacturer */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-semibold">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[150px]">{med.manufacturer || 'Pakistan Pharma'}</span>
                        </div>
                      </td>

                      {/* Class & Regulatory */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="text-[10.5px] text-teal-700 dark:text-teal-400 font-semibold truncate block max-w-[170px]">
                            {med.therapeutic_class || med.category || 'General Formulary'}
                          </span>
                          <span className="text-[9.5px] font-mono text-slate-400">
                            {med.registration_reference || med.prescription_status || 'Rx Only'}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isActive 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300' 
                            : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Toggle Active / Inactive */}
                          <button
                            onClick={() => handleToggleStatus(med)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isActive
                                ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50'
                                : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
                            }`}
                            title={isActive ? "Deactivate medicine" : "Reactivate medicine"}
                          >
                            {isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => {
                              setEditingMedicine(med);
                              setIsAddModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/50 transition-colors"
                            title="Edit medicine details"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Delete / Graceful soft delete */}
                          <button
                            onClick={() => handleDeleteMedicine(med)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                            title="Remove or safely deactivate"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <Pill className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No matching medicines found
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Try refining your search keyword, dosage form, or therapeutic class filter.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingMedicine(null);
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-teal-600/20 inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add as New Medicine</span>
            </button>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
            <span>Showing {(page - 1) * itemsPerPage + 1} - {Math.min(page * itemsPerPage, medicines.length)} of {medicines.length}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-750 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span>Page {page} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-750 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Add / Edit Medicine Modal */}
      <AddMedicineModal
        isOpen={isAddModalOpen}
        editMedicine={editingMedicine}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingMedicine(null);
        }}
        onMedicineAdded={(newMed) => {
          showNotification(`Formulary updated: '${newMed.brand_name}' saved successfully.`, "success");
          fetchFormularyData();
        }}
      />

      {/* Sync Logs Modal */}
      <SyncLogsModal
        isOpen={isSyncLogsOpen}
        onClose={() => setIsSyncLogsOpen(false)}
        onTriggerSync={() => {
          fetchFormularyData();
        }}
      />

    </div>
  );
}
