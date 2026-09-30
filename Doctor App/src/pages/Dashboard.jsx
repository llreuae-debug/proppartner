import React, { useState, useEffect } from 'react';
import { 
  Users, CalendarCheck, Clock, TrendingUp, Plus, Search, Sparkles, 
  QrCode, Phone, Calendar, CheckCircle2, AlertCircle, MessageSquare, 
  ChevronRight, ArrowRight, DollarSign, FileText, UserPlus, RefreshCw,
  Wallet, Check, X, Bell, Stethoscope, ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import SendWhatsAppModal from '../components/SendWhatsAppModal';

export default function Dashboard({ onNavigate, onOpenQR }) {
  const { currentDoctor } = useAuth();
  const { t } = useLanguage();

  const [todaysAppointments, setTodaysAppointments] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalPatients: 0,
    todaysVisits: 0,
    todaysAppointments: 0,
    followUpsCount: 0,
    todaysIncome: 0,
    pendingAppointmentRequests: 0,
    pendingAppointmentsList: [],
    recentPatients: []
  });
  const [msgStats, setMsgStats] = useState({ sentToday: 0, total: 0, failedCount: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // WhatsApp Reminder Modal State
  const [whatsappModalApt, setWhatsappModalApt] = useState(null);

  const loadData = async () => {
    if (!currentDoctor) return;
    try {
      setLoading(true);
      const [aptRes, statsRes, msgRes] = await Promise.all([
        api.getAppointments('today'),
        api.getDoctorDashboardStats().catch(() => ({ stats: {} })),
        api.getMessageStats().catch(() => ({ sentToday: 0, total: 0, failedCount: 0 }))
      ]);

      setTodaysAppointments(aptRes.appointments || []);
      if (statsRes && statsRes.stats) {
        setDashboardStats(statsRes.stats);
      }
      setMsgStats(msgRes || { sentToday: 0, total: 0, failedCount: 0 });
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentDoctor]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.updateAppointmentStatus(id, status);
      loadData();
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  const filtered = todaysAppointments.filter(a => {
    const q = searchQuery.toLowerCase().trim();
    return (
      (a.patient_name || '').toLowerCase().includes(q) ||
      (a.patient_phone && a.patient_phone.includes(q)) ||
      (a.notes && a.notes.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-teal-800 via-teal-700 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#2dd4bf_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none"></div>

        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-teal-100 mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-teal-300" />
            <span>Private Doctor Portal • {currentDoctor?.specialization || 'Clinical Practice'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {currentDoctor?.name}
          </h1>
          <p className="text-xs sm:text-sm text-teal-100 mt-1 font-normal leading-relaxed">
            {currentDoctor?.clinicName} • PMDC #{currentDoctor?.pmdcNumber} • Consultation Fee: <strong>PKR {currentDoctor?.consultationFee?.toLocaleString()}</strong>
          </p>
        </div>

        {/* Quick Top Actions */}
        <div className="flex flex-wrap gap-2.5 relative z-10 w-full sm:w-auto">
          <button
            onClick={() => onNavigate('prescriptions')}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-white text-teal-900 hover:bg-teal-50 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-teal-700" />
            <span>New Prescription</span>
          </button>

          <button
            onClick={() => onNavigate('patients')}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Patient</span>
          </button>
          
          <button
            onClick={onOpenQR}
            className="p-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl border border-white/20 transition-all"
            title="Clinic QR Code"
          >
            <QrCode className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 6 Core Practice KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        
        {/* Total Patients */}
        <div 
          onClick={() => onNavigate('patients')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-sm cursor-pointer hover:border-teal-400 transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1">
            <span>Total Patients</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {dashboardStats.totalPatients || 0}
          </div>
          <span className="text-[10px] text-slate-400">Registered records</span>
        </div>

        {/* Today's Visits (Prescriptions finalized) */}
        <div 
          onClick={() => onNavigate('prescriptions')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-sm cursor-pointer hover:border-teal-400 transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1">
            <span>Today's Visits</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-700 dark:text-blue-400">
            {dashboardStats.todaysVisits || 0}
          </div>
          <span className="text-[10px] text-slate-400">Prescriptions finalized</span>
        </div>

        {/* Today's Appointments */}
        <div 
          onClick={() => onNavigate('appointments')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-sm cursor-pointer hover:border-teal-400 transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1">
            <span>Appointments</span>
            <Calendar className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {dashboardStats.todaysAppointments || 0}
          </div>
          <span className="text-[10px] text-slate-400">Scheduled today</span>
        </div>

        {/* Follow-ups Due */}
        <div 
          onClick={() => onNavigate('prescriptions')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-sm cursor-pointer hover:border-purple-400 transition-all"
        >
          <div className="flex items-center justify-between text-purple-700 dark:text-purple-400 text-xs font-semibold mb-1">
            <span>Follow-ups</span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-700 dark:text-purple-400">
            {dashboardStats.followUpsCount || 0}
          </div>
          <span className="text-[10px] text-slate-400">Next 7 days</span>
        </div>

        {/* Today's Income */}
        <div 
          onClick={() => onNavigate('ledger')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-teal-200/80 dark:border-teal-800/80 shadow-sm cursor-pointer hover:border-teal-500 transition-all"
        >
          <div className="flex items-center justify-between text-teal-700 dark:text-teal-300 text-xs font-semibold mb-1">
            <span>Today's Income</span>
            <DollarSign className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-teal-700 dark:text-teal-300">
            PKR {dashboardStats.todaysIncome?.toLocaleString() || '0'}
          </div>
          <span className="text-[10px] text-slate-400">Cash collected</span>
        </div>

        {/* Prescriptions Sent (WhatsApp) */}
        <div 
          onClick={() => onNavigate('messages')}
          className="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-emerald-200/80 dark:border-emerald-800/80 shadow-sm cursor-pointer hover:border-emerald-400 transition-all"
        >
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-1">
            <span>WhatsApp Rx</span>
            <MessageSquare className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
            {msgStats.sentToday || 0}
          </div>
          <span className="text-[10px] text-slate-400">Dispatched today</span>
        </div>

      </div>

      {/* Quick Action Navigation Bar */}
      <div className="p-4 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" /> Quick Practice Actions:
        </span>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('patients')}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1"
          >
            <UserPlus className="w-3.5 h-3.5 text-teal-600" />
            <span>+ New Patient</span>
          </button>

          <button
            onClick={() => onNavigate('prescriptions')}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1"
          >
            <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
            <span>+ Write Prescription</span>
          </button>

          <button
            onClick={() => onNavigate('appointments')}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1"
          >
            <CalendarCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>+ Book Slot</span>
          </button>

          <button
            onClick={() => onNavigate('ledger')}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1"
          >
            <DollarSign className="w-3.5 h-3.5 text-teal-600" />
            <span>+ Ledger Entry</span>
          </button>
        </div>
      </div>

      {/* Pending Appointment Requests Banner (If any) */}
      {dashboardStats.pendingAppointmentRequests > 0 && (
        <div className="p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
              <Bell className="w-4 h-4 animate-bounce" />
              <h3 className="text-sm font-black">
                {dashboardStats.pendingAppointmentRequests} Pending Online Appointment Request{dashboardStats.pendingAppointmentRequests > 1 ? 's' : ''}
              </h3>
            </div>
            <button
              onClick={() => onNavigate('appointments')}
              className="text-xs font-bold text-amber-800 dark:text-amber-300 hover:underline flex items-center gap-1"
            >
              <span>View All Requests</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {dashboardStats.pendingAppointmentsList?.map((apt) => (
              <div key={apt.id} className="p-3 bg-white dark:bg-slate-850 rounded-2xl border border-amber-200/80 dark:border-amber-800/80 flex items-center justify-between gap-3 text-xs shadow-xs">
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 dark:text-slate-100 truncate">{apt.patient_name}</div>
                  <div className="text-[11px] text-slate-500">{apt.date} • {apt.start_time}</div>
                  <div className="text-[10px] text-amber-700 font-mono truncate">{apt.patient_phone}</div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleUpdateStatus(apt.id, 'confirmed')}
                    className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                    title="Confirm Appointment"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(apt.id, 'cancelled')}
                    className="p-1.5 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded-lg transition-colors"
                    title="Decline"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Two-Column Layout: Today's Queue & Recent Patients */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Today's Active Consultation Queue */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-850 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-card overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Today's Consultation Queue</span>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-xs font-bold font-mono">
                  {todaysAppointments.length} Patients
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Active appointments and waiting list for {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}
              </p>
            </div>

            {/* Search filter in queue */}
            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient in queue..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Queue List Table */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800 overflow-x-auto">
            {filtered.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs space-y-2">
                <CalendarCheck className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
                <p>No consultations scheduled in today's active queue.</p>
              </div>
            ) : (
              filtered.map((apt) => (
                <div key={apt.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                  
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      {apt.start_time?.slice(0, 5)}
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{apt.patient_name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          apt.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                          apt.status === 'completed' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                          apt.status === 'cancelled' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                          'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {apt.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {apt.patient_phone || 'No phone'} • Reason: {apt.notes || 'Routine Checkup'}
                      </p>
                    </div>
                  </div>

                  {/* Actions for consultation row */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => setWhatsappModalApt(apt)}
                      className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold transition-colors"
                      title="Send WhatsApp Reminder"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onNavigate('prescriptions')}
                      className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
                    >
                      <Stethoscope className="w-3.5 h-3.5" />
                      <span>Consult</span>
                    </button>
                  </div>

                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 1 Col: Recent Patients & Quick Start */}
        <div className="space-y-6">
          
          <div className="bg-white dark:bg-slate-850 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-600" />
                <span>Recent Patients</span>
              </h3>
              <button
                onClick={() => onNavigate('patients')}
                className="text-xs font-bold text-teal-700 hover:underline"
              >
                View Directory
              </button>
            </div>

            <div className="space-y-2.5">
              {(!dashboardStats.recentPatients || dashboardStats.recentPatients.length === 0) ? (
                <p className="text-xs text-slate-400 italic py-4">No recent patient records found.</p>
              ) : (
                dashboardStats.recentPatients.map((pat) => (
                  <div
                    key={pat.id}
                    onClick={() => onNavigate('patients')}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-teal-50/60 border border-slate-100 dark:border-slate-700/60 cursor-pointer transition-all flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">{pat.name}</div>
                      <div className="text-[11px] text-slate-400">{pat.age} yrs • {pat.gender} • {pat.phone}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Practice Summary Widget */}
          <div className="p-5 rounded-3xl bg-gradient-to-tr from-teal-900 to-slate-900 text-white shadow-card space-y-3">
            <div className="flex items-center gap-2 text-teal-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Public Discovery Status</span>
            </div>
            <p className="text-xs text-teal-100 leading-relaxed">
              Your profile is published on DocCare. Patients can find your clinic in <strong>{currentDoctor?.city}</strong> and request appointments online.
            </p>
            <button
              onClick={() => onNavigate('profile')}
              className="w-full py-2.5 bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded-xl border border-white/20 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Manage Public Profile Settings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

      {/* WhatsApp Modal for Consultation reminders */}
      {whatsappModalApt && (
        <SendWhatsAppModal
          isOpen={!!whatsappModalApt}
          onClose={() => setWhatsappModalApt(null)}
          patient={{
            name: whatsappModalApt.patient_name,
            phone: whatsappModalApt.patient_phone,
            consent_given: true
          }}
          type="reminder"
          onSentSuccess={() => {
            setWhatsappModalApt(null);
            loadData();
          }}
        />
      )}

    </div>
  );
}
