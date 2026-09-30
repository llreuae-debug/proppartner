import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Eye, 
  Download, 
  Smartphone, 
  RefreshCw, 
  Share2, 
  Calendar, 
  FileText, 
  User, 
  ExternalLink,
  ShieldAlert,
  SlidersHorizontal,
  ChevronDown,
  RotateCcw,
  Lock,
  Trash2
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SendWhatsAppModal from '../components/SendWhatsAppModal';

export default function WhatsAppAuditPage() {
  const { currentDoctor } = useAuth();

  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ sentToday: 0, failedCount: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Resend / Modal state
  const [selectedForResend, setSelectedForResend] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [messagesRes, statsRes] = await Promise.all([
        api.getMessageLogs({
          status: statusFilter,
          type: typeFilter,
          date: dateFilter,
          q: searchQuery
        }),
        api.getMessageStats()
      ]);

      setLogs(messagesRes.messages || []);
      setStats(statsRes || { sentToday: 0, failedCount: 0, total: 0 });
    } catch (err) {
      console.error("Failed to load message audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, typeFilter, dateFilter, currentDoctor]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleRevokeShare = async (shareId) => {
    if (!confirm("Are you sure you want to revoke this public link? Patients visiting it will see an expired link notice.")) {
      return;
    }
    try {
      await api.revokePrescriptionShare(shareId);
      loadData();
    } catch (err) {
      alert("Failed to revoke share link: " + err.message);
    }
  };

  const handleOpenResend = (log) => {
    setSelectedForResend(log);
    setIsModalOpen(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'read':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
            <CheckCircle2 className="w-3 h-3 text-blue-600" />
            <span>Read</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Delivered</span>
          </span>
        );
      case 'sent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-900">
            <Send className="w-3 h-3 text-teal-600" />
            <span>Sent</span>
          </span>
        );
      case 'opened':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900">
            <ExternalLink className="w-3 h-3 text-purple-600" />
            <span>App Opened</span>
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            <span>Failed</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
            <Clock className="w-3 h-3" />
            <span>{status}</span>
          </span>
        );
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'prescription':
        return (
          <span className="px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 font-bold text-[10px]">
            Prescription
          </span>
        );
      case 'reminder':
        return (
          <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-bold text-[10px]">
            Reminder
          </span>
        );
      case 'confirmation':
        return (
          <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-bold text-[10px]">
            Confirmation
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Top Banner & Stats */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-teal-700 via-teal-600 to-medblue-700 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-teal-100 mb-3 border border-white/20">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Step 5 Active • WhatsApp Dispatch & Delivery Registry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Messages & WhatsApp Audit
          </h1>
          <p className="text-xs sm:text-sm text-teal-100 mt-1">
            Real-time delivery log, expiring link tracking, and doctor dispatch histories
          </p>
        </div>

        {/* Quick Summary Cards */}
        <div className="grid grid-cols-3 gap-2.5 w-full md:w-auto shrink-0">
          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3 text-center border border-white/20">
            <span className="text-[10px] text-teal-100 uppercase font-bold tracking-wider block">Today</span>
            <span className="text-xl font-black">{stats.sentToday}</span>
            <span className="text-[10px] text-teal-200 block">Sent</span>
          </div>
          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3 text-center border border-white/20">
            <span className="text-[10px] text-teal-100 uppercase font-bold tracking-wider block">Total</span>
            <span className="text-xl font-black">{stats.total}</span>
            <span className="text-[10px] text-teal-200 block">Dispatches</span>
          </div>
          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3 text-center border border-white/20">
            <span className="text-[10px] text-teal-100 uppercase font-bold tracking-wider block">Failed</span>
            <span className="text-xl font-black text-rose-200">{stats.failedCount}</span>
            <span className="text-[10px] text-teal-200 block">Issues</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[240px]">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by patient name, phone (0300...), or text..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </form>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="opened">App Opened</option>
            <option value="sent">Sent</option>
            <option value="delivered">Delivered</option>
            <option value="read">Read</option>
            <option value="failed">Failed</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="prescription">Prescription</option>
            <option value="reminder">Reminder</option>
            <option value="confirmation">Confirmation</option>
          </select>

          {/* Date Picker */}
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
          />

          {/* Refresh */}
          <button
            onClick={loadData}
            className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors"
            title="Refresh logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-teal-600' : ''}`} />
          </button>
        </div>

      </div>

      {/* Message Logs Table / List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-teal-600 mb-2" />
            <span>Loading message delivery log...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs space-y-2">
            <MessageSquare className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
            <p className="font-bold text-slate-600 dark:text-slate-300">No message logs found</p>
            <p className="text-slate-400">Send prescriptions or reminders to view dispatch records here.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {logs.map((log) => {
              const formattedDate = new Date(log.created_at).toLocaleString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div key={log.id} className="p-4 sm:p-5 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  
                  {/* Left: Patient & Message info */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                        {log.patient_name}
                      </span>
                      <span className="font-mono text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        {log.to_number}
                      </span>
                      {getTypeBadge(log.type)}
                      {getStatusBadge(log.status)}
                      <span className="text-[10px] text-slate-400 font-mono">
                        {log.channel === 'wa_link' ? 'WhatsApp Direct' : log.channel === 'wa_cloud_api' ? 'Meta Cloud API' : 'SMS'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {log.message_text}
                    </p>

                    {/* Prescription Link Download Stats */}
                    {log.prescription_id && (
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                        {log.prescription_no && (
                          <span className="font-bold text-teal-700 dark:text-teal-400 flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            <span>{log.prescription_no}</span>
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Download className="w-3 h-3 text-slate-400" />
                          <span>Downloads: <strong>{log.share_download_count || 0}</strong></span>
                        </span>
                        {log.share_last_downloaded_at && (
                          <span className="text-slate-400">
                            Last accessed: {new Date(log.share_last_downloaded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                        {log.share_revoked && (
                          <span className="text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded">
                            Link Revoked
                          </span>
                        )}
                      </div>
                    )}

                    {log.error && (
                      <p className="text-xs text-rose-600 font-medium">
                        Error: {log.error}
                      </p>
                    )}
                  </div>

                  {/* Right: Date & Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <span className="text-[11px] text-slate-400 mr-2">
                      {formattedDate}
                    </span>

                    {/* Resend button */}
                    <button
                      onClick={() => handleOpenResend(log)}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 hover:text-teal-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                      title="Resend or share fresh link"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Resend</span>
                    </button>

                    {/* Revoke share link if active */}
                    {log.share_id && !log.share_revoked && (
                      <button
                        onClick={() => handleRevokeShare(log.share_id)}
                        className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                        title="Revoke active prescription link"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Resend Modal */}
      {selectedForResend && (
        <SendWhatsAppModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedForResend(null);
          }}
          prescription={selectedForResend.prescription_id ? { id: selectedForResend.prescription_id, prescription_no: selectedForResend.prescription_no } : null}
          patient={{ id: selectedForResend.patient_id, name: selectedForResend.patient_name, phone: selectedForResend.to_number, consent_given: true }}
          type={selectedForResend.type}
          onSentSuccess={() => {
            setIsModalOpen(false);
            loadData();
          }}
        />
      )}

    </div>
  );
}
