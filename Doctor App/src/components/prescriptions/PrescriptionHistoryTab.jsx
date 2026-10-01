import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Printer, 
  Download, 
  Eye, 
  Copy, 
  Calendar, 
  User, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Edit3, 
  ExternalLink, 
  History, 
  Pill, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  MessageSquare,
  ShieldCheck,
  RefreshCw,
  Layers,
  Activity,
  ArrowUpDown,
  Share2
} from 'lucide-react';
import { api } from '../../services/api';
import PrescriptionPreviewModal from '../PrescriptionPreviewModal';

export default function PrescriptionHistoryTab({ onEditPrescription, onWriteNew }) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'final' | 'draft'
  const [patientFilter, setPatientFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all'); // 'all' | 'today' | 'week' | 'month'
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' | 'oldest'

  // Selected for Preview Modal
  const [selectedRx, setSelectedRx] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 15;

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);

      let startDate = '';
      const now = new Date();
      if (dateFilter === 'today') {
        startDate = now.toISOString().split('T')[0];
      } else if (dateFilter === 'week') {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        startDate = d.toISOString().split('T')[0];
      } else if (dateFilter === 'month') {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        startDate = d.toISOString().split('T')[0];
      }

      const res = await api.getPrescriptions({
        q: searchQuery,
        status: statusFilter === 'all' ? '' : statusFilter,
        patient_id: patientFilter === 'all' ? '' : patientFilter,
        startDate,
        sort: sortOrder
      });

      setPrescriptions(res.prescriptions || []);
    } catch (err) {
      console.error("Failed to fetch prescriptions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load patients list for filter
    api.getPatients().then(res => {
      setPatients(res.patients || []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    fetchPrescriptions();
  }, [searchQuery, statusFilter, patientFilter, dateFilter, sortOrder]);

  const handlePrintRx = async (rx) => {
    try {
      await api.logPrescriptionAuditEvent(rx.id, 'printed', 'Triggered direct print from history table');
    } catch (e) {}
    setSelectedRx(rx);
    setIsPreviewOpen(true);
    setTimeout(() => {
      window.print();
    }, 400);
  };

  const handleDownloadPdf = async (rx) => {
    try {
      await api.logPrescriptionAuditEvent(rx.id, 'downloaded', 'Downloaded A4 PDF from history table');
      const downloadUrl = api.getPrescriptionPdfUrl(rx.id, true);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${rx.prescription_no || 'Prescription'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.warn("Download failed:", err);
    }
  };

  const handleDuplicate = async (rx) => {
    try {
      const res = await api.duplicatePrescription(rx.id);
      if (res.prescription && onEditPrescription) {
        onEditPrescription(res.prescription);
      } else {
        fetchPrescriptions();
      }
    } catch (err) {
      console.error("Failed to duplicate:", err);
    }
  };

  // Pagination calculation
  const totalPages = Math.ceil(prescriptions.length / itemsPerPage) || 1;
  const paginatedList = prescriptions.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="space-y-5 animate-fade-in">
      
      {/* Header Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-200 dark:border-teal-800">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>Prescription History & Medical Archive</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200">
                {prescriptions.length} Records
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Permanent clinical archive • Immutable snapshots & audit tracking
            </p>
          </div>
        </div>

        <button
          onClick={onWriteNew}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-bold rounded-2xl transition-all shadow-md shadow-teal-600/20 flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          <span>+ Write New Prescription</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5">
        
        {/* Search Field */}
        <div className="relative">
          <Search className="w-4 h-4 text-teal-600 dark:text-teal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Prescription ID (DC-RX-...), Patient Name, Diagnosis, or Medicine (e.g. 'Panadol', 'Kamran Ali')..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 focus:bg-white dark:focus:bg-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
          />
        </div>

        {/* Multi-Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          
          {/* Status Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Prescription Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-xs font-semibold outline-none focus:border-teal-500"
            >
              <option value="all">All Prescriptions</option>
              <option value="final">Finalized (Locked)</option>
              <option value="draft">Drafts</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Time Range
            </label>
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-xs font-semibold outline-none focus:border-teal-500"
            >
              <option value="all">All Dates</option>
              <option value="today">Today's Visits</option>
              <option value="week">Past 7 Days</option>
              <option value="month">Past 30 Days</option>
            </select>
          </div>

          {/* Patient Filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Filter by Patient
            </label>
            <select
              value={patientFilter}
              onChange={(e) => {
                setPatientFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-xs font-semibold outline-none focus:border-teal-500"
            >
              <option value="all">All Patients</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.phone})</option>
              ))}
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Sort Order
            </label>
            <select
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-xs font-semibold outline-none focus:border-teal-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

        </div>

      </div>

      {/* Prescriptions Table (Desktop) / Cards (Mobile) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
            <RefreshCw className="w-8 h-8 animate-spin text-teal-600" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Loading prescription archives...</p>
          </div>
        ) : paginatedList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/60 dark:bg-slate-800/60 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4">Prescription ID & Date</th>
                  <th className="py-3 px-4">Patient Information</th>
                  <th className="py-3 px-4">Diagnosis</th>
                  <th className="py-3 px-4">Prescribed Medicines</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {paginatedList.map((rx) => {
                  const isFinal = rx.status === 'final';
                  const dateStr = rx.created_at ? new Date(rx.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : rx.date;

                  return (
                    <tr key={rx.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      
                      {/* Prescription ID & Date */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-mono font-bold text-teal-700 dark:text-teal-400 block text-xs">
                            {rx.prescription_no || 'DC-RX-XXXX'}
                          </span>
                          <span className="text-[10.5px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {dateStr}
                          </span>
                        </div>
                      </td>

                      {/* Patient Info */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="font-black text-slate-900 dark:text-white text-xs block">
                            {rx.patient_name}
                          </span>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                            <span>{rx.patient_age}y / {rx.patient_gender}</span>
                            <span>•</span>
                            <span className="font-mono">{rx.patient_phone}</span>
                          </div>
                        </div>
                      </td>

                      {/* Diagnosis */}
                      <td className="py-3.5 px-4">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block max-w-[180px] truncate">
                          {rx.diagnosis || 'Clinical Consultation'}
                        </span>
                        {rx.follow_up_date && (
                          <span className="text-[10px] text-teal-700 dark:text-teal-400">
                            Follow-up: {new Date(rx.follow_up_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                          </span>
                        )}
                      </td>

                      {/* Medicines Pills Preview */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                            <Pill className="w-3 h-3 text-teal-600" />
                            <span>{rx.items?.length || 0} Medicines</span>
                          </span>
                          <div className="flex flex-wrap gap-1 max-w-[240px]">
                            {(rx.items || []).slice(0, 3).map((med, mi) => (
                              <span
                                key={mi}
                                className="px-2 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[9.5px] font-semibold truncate max-w-[110px]"
                                title={`${med.medicine_name || med.brand_name} ${med.strength}`}
                              >
                                {med.medicine_name || med.brand_name || 'Medicine'}
                              </span>
                            ))}
                            {(rx.items || []).length > 3 && (
                              <span className="px-1.5 py-0.2 rounded-md bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-[9px] font-bold">
                                +{(rx.items || []).length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          isFinal
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                        }`}>
                          {rx.status || 'draft'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* View Modal */}
                          <button
                            onClick={() => {
                              setSelectedRx(rx);
                              setIsPreviewOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/50 transition-colors"
                            title="View Prescription Details & Verification"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Print */}
                          <button
                            onClick={() => handlePrintRx(rx)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/50 transition-colors"
                            title="Print Prescription (A4)"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* Download PDF */}
                          <button
                            onClick={() => handleDownloadPdf(rx)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/50 transition-colors"
                            title="Download A4 PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>

                          {/* Duplicate / Reprint */}
                          <button
                            onClick={() => handleDuplicate(rx)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/50 transition-colors"
                            title="Duplicate into New Prescription Draft"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          {/* Edit (if draft) */}
                          {!isFinal && onEditPrescription && (
                            <button
                              onClick={() => onEditPrescription(rx)}
                              className="p-1.5 rounded-lg text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/50 transition-colors"
                              title="Resume editing draft"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}
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
            <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No matching prescriptions in archive
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Try adjusting your search query, status, or date range filters.
              </p>
            </div>
            <button
              onClick={onWriteNew}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-teal-600/20 inline-flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4" />
              <span>Write a New Prescription</span>
            </button>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
            <span>Showing {(page - 1) * itemsPerPage + 1} - {Math.min(page * itemsPerPage, prescriptions.length)} of {prescriptions.length}</span>
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

      {/* Prescription Preview Modal */}
      {selectedRx && (
        <PrescriptionPreviewModal
          isOpen={isPreviewOpen}
          onClose={() => {
            setIsPreviewOpen(false);
            setSelectedRx(null);
          }}
          prescription={selectedRx}
        />
      )}

    </div>
  );
}
