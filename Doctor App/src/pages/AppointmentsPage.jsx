import React, { useState, useEffect } from 'react';
import { 
  CalendarClock, 
  Plus, 
  Search, 
  Filter, 
  Check, 
  X, 
  Clock, 
  Phone, 
  User, 
  AlertCircle, 
  Calendar, 
  AlertTriangle, 
  Loader2, 
  Trash2,
  CheckCircle2,
  MessageCircle,
  MessageSquare,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import SendWhatsAppModal from '../components/SendWhatsAppModal';

export default function AppointmentsPage({ onNavigateToPatient, onWritePrescription }) {
  const { currentDoctor } = useAuth();
  const { t } = useLanguage();

  const [appointments, setAppointments] = useState([]);
  const [counts, setCounts] = useState({ todaysTotal: 0, pendingCount: 0, completedToday: 0, upcomingCount: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('today'); // 'today' | 'upcoming' | 'history' | 'cancelled'
  const [searchQuery, setSearchQuery] = useState('');
  const [whatsappModalData, setWhatsappModalData] = useState(null);

  // Manual Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualAge, setManualAge] = useState('');
  const [manualGender, setManualGender] = useState('Male');
  const [manualPhone, setManualPhone] = useState('');
  const [manualDate, setManualDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [manualStartTime, setManualStartTime] = useState('');
  const [manualReason, setManualReason] = useState('');
  const [manualAllergies, setManualAllergies] = useState('');
  const [manualChronic, setManualChronic] = useState('');
  const [manualCurrentMeds, setManualCurrentMeds] = useState('');
  const [manualNotes, setManualNotes] = useState('');
  const [availableSlotsData, setAvailableSlotsData] = useState([]);
  const [submittingManual, setSubmittingManual] = useState(false);
  const [manualError, setManualError] = useState('');

  // Reschedule Modal State
  const [rescheduleApt, setRescheduleApt] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleSlot, setRescheduleSlot] = useState('');
  const [rescheduleSlotsData, setRescheduleSlotsData] = useState([]);
  const [rescheduling, setRescheduling] = useState(false);
  const [rescheduleError, setRescheduleError] = useState('');

  const loadAppointmentsAndCounts = async () => {
    if (!currentDoctor) return;
    try {
      setLoading(true);
      const [aptRes, countRes] = await Promise.all([
        api.getAppointments(activeTab, searchQuery),
        api.getAppointmentCounts()
      ]);
      setAppointments(aptRes.appointments || []);
      setCounts(countRes || {});
    } catch (err) {
      console.error("Failed to load appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointmentsAndCounts();
  }, [currentDoctor, activeTab, searchQuery]);

  // Load available slots when manual date changes
  useEffect(() => {
    if (isAddModalOpen && currentDoctor && manualDate) {
      api.getAvailableSlots(currentDoctor.slug || currentDoctor.id, manualDate)
        .then(res => setAvailableSlotsData(res.slots || []))
        .catch(err => console.error(err));
    }
  }, [isAddModalOpen, manualDate, currentDoctor]);

  // Load available slots when reschedule date changes
  useEffect(() => {
    if (rescheduleApt && currentDoctor && rescheduleDate) {
      api.getAvailableSlots(currentDoctor.slug || currentDoctor.id, rescheduleDate)
        .then(res => setRescheduleSlotsData(res.slots || []))
        .catch(err => console.error(err));
    }
  }, [rescheduleApt, rescheduleDate, currentDoctor]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.updateAppointmentStatus(id, status);
      loadAppointmentsAndCounts();
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  const handleCreateManual = async (e) => {
    e.preventDefault();
    if (!manualName.trim() || !manualDate || !manualStartTime) {
      setManualError("Please enter patient name, date, and select an available time slot.");
      return;
    }

    try {
      setSubmittingManual(true);
      setManualError('');

      const res = await api.createManualAppointment({
        name: manualName.trim(),
        age: Number(manualAge) || 30,
        gender: manualGender,
        phone: manualPhone.trim(),
        whatsapp: manualPhone.trim(),
        allergies: manualAllergies.trim() || 'None',
        chronic_conditions: manualChronic.trim() || 'None',
        current_medicines: manualCurrentMeds.trim() || 'None',
        reason_for_visit: manualReason.trim() || 'Walk-in Consultation',
        date: manualDate,
        start_time: manualStartTime,
        status: "confirmed",
        notes: manualNotes.trim()
      });

      if (res.success) {
        setIsAddModalOpen(false);
        // Reset form
        setManualName('');
        setManualAge('');
        setManualPhone('');
        setManualReason('');
        setManualAllergies('');
        setManualChronic('');
        setManualCurrentMeds('');
        setManualNotes('');
        loadAppointmentsAndCounts();
      }
    } catch (err) {
      setManualError(err.message || "Slot conflict or booking error.");
    } finally {
      setSubmittingManual(false);
    }
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!rescheduleDate || !rescheduleSlot) {
      setRescheduleError("Please choose a new date and an available slot.");
      return;
    }

    try {
      setRescheduling(true);
      setRescheduleError('');

      const res = await api.rescheduleAppointment(
        rescheduleApt.id,
        rescheduleDate,
        rescheduleSlot
      );

      if (res.success) {
        setRescheduleApt(null);
        loadAppointmentsAndCounts();
      }
    } catch (err) {
      setRescheduleError(err.message || "Failed to reschedule.");
    } finally {
      setRescheduling(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 pb-16">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CalendarClock className="w-6 h-6 text-teal-600" />
            <span>Appointment Management & Scheduling</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage daily queues, confirm bookings, handle walk-ins, and prevent double-booking
          </p>
        </div>

        <button
          onClick={() => {
            setManualError('');
            setIsAddModalOpen(true);
          }}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Appointment (Walk-in / Phone)</span>
        </button>
      </div>

      {/* Top Summary Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Today's Total</span>
            <Calendar className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {counts.todaysTotal || 0}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Pending Confirmations</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">
            {counts.pendingCount || 0}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Completed Today</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {counts.completedToday || 0}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Upcoming (Future)</span>
            <TrendingUp className="w-4 h-4 text-medblue-600" />
          </div>
          <div className="text-2xl font-black text-medblue-600">
            {counts.upcomingCount || 0}
          </div>
        </div>

      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white dark:bg-slate-850 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-full md:w-auto overflow-x-auto">
          {[
            { id: 'today', label: `Today's Queue (${counts.todaysTotal || 0})` },
            { id: 'upcoming', label: `Upcoming (${counts.upcomingCount || 0})` },
            { id: 'history', label: 'History / Completed' },
            { id: 'cancelled', label: 'Cancelled' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by patient name, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-teal-500 outline-none"
          />
        </div>
      </div>

      {/* Appointment Cards List */}
      <div className="bg-white dark:bg-slate-850 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-card overflow-hidden">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {appointments.length > 0 ? (
            appointments.map((apt) => {
              const hasAllergies = apt.patient_allergies && apt.patient_allergies !== 'None' && apt.patient_allergies !== 'None reported';
              const cleanPhone = (apt.patient_phone || '').replace(/[^0-9]/g, '');

              return (
                <div
                  key={apt.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  {/* Left: Patient Details & Schedule */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-black text-sm flex items-center justify-center shrink-0 border border-teal-200 dark:border-teal-800">
                      {apt.patient_name.charAt(0)}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {apt.patient_name}
                        </h3>
                        <span className="text-xs text-slate-500 font-medium">
                          ({apt.patient_age} Yrs, {apt.patient_gender})
                        </span>
                        
                        {/* Status Badge */}
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          apt.status === 'confirmed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                            : apt.status === 'completed'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300'
                            : apt.status === 'cancelled'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {apt.status}
                        </span>

                        <span className="text-[10px] text-slate-400 font-mono">
                          Source: {apt.source}
                        </span>

                        {hasAllergies && (
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                            ⚠️ Allergic: {apt.patient_allergies}
                          </span>
                        )}
                      </div>

                      {/* Schedule Bar */}
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                        <span className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                          <Calendar className="w-3.5 h-3.5 text-teal-600" />
                          {apt.date}
                        </span>
                        <span className="font-mono text-teal-700 dark:text-teal-400 font-bold bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded">
                          {apt.start_time} - {apt.end_time}
                        </span>
                        <span className="flex items-center gap-1 font-mono">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {apt.patient_phone || 'No phone'}
                        </span>
                      </div>

                      {/* Reason & Notes */}
                      {apt.notes && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5">
                          <strong>Details:</strong> {apt.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Quick Action Controls */}
                  <div className="flex items-center gap-2 self-end lg:self-center flex-wrap">
                    
                    {/* Call & WhatsApp Buttons */}
                    {cleanPhone && (
                      <a
                        href={`tel:${cleanPhone}`}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
                        title="Call Patient"
                      >
                        <Phone className="w-3.5 h-3.5 text-slate-600" />
                      </a>
                    )}

                    {/* Step 5: Send Reminder via WhatsApp */}
                    {apt.status !== 'cancelled' && apt.status !== 'completed' && (
                      <button
                        onClick={() => setWhatsappModalData({ isOpen: true, appointment: apt, type: 'reminder' })}
                        className="px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                        title="Send WhatsApp appointment reminder"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Reminder</span>
                      </button>
                    )}

                    {/* Step 5: Send Confirmation via WhatsApp */}
                    {apt.status === 'confirmed' && (
                      <button
                        onClick={() => setWhatsappModalData({ isOpen: true, appointment: apt, type: 'confirmation' })}
                        className="px-2.5 py-1.5 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-800 dark:text-blue-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                        title="Send WhatsApp confirmation message"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                        <span>Confirm msg</span>
                      </button>
                    )}

                    {/* Status Action Buttons */}
                    {onWritePrescription && apt.status !== 'cancelled' && (
                      <button
                        onClick={() => onWritePrescription({
                          id: apt.id,
                          patientId: apt.patient_id,
                          patientName: apt.patient_name,
                          patientAge: apt.patient_age,
                          patientGender: apt.patient_gender,
                          patientPhone: apt.patient_phone,
                          patientAllergies: apt.patient_allergies,
                          patientChronic: apt.patient_chronic,
                          notes: apt.notes
                        })}
                        className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1"
                        title="Write Prescription for this appointment"
                      >
                        <span className="font-serif font-black text-sm">℞</span>
                        <span>Write Rx</span>
                      </button>
                    )}

                    {apt.status === 'pending' && (
                      <button
                        onClick={() => handleUpdateStatus(apt.id, 'confirmed')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Confirm</span>
                      </button>
                    )}

                    {apt.status !== 'completed' && apt.status !== 'cancelled' && (
                      <button
                        onClick={() => handleUpdateStatus(apt.id, 'completed')}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Complete</span>
                      </button>
                    )}

                    {/* Reschedule Button */}
                    {apt.status !== 'cancelled' && (
                      <button
                        onClick={() => {
                          setRescheduleApt(apt);
                          setRescheduleDate(apt.date);
                          setRescheduleSlot(apt.start_time);
                          setRescheduleError('');
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                        <span>Reschedule</span>
                      </button>
                    )}

                    {/* Cancel Button */}
                    {apt.status !== 'cancelled' && (
                      <button
                        onClick={() => handleUpdateStatus(apt.id, 'cancelled')}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Cancel Appointment"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center text-slate-400">
              <CalendarClock className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No appointments in this category
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Appointments booked online or entered manually will appear here.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: MANUAL ADD APPOINTMENT (WALK-IN / PHONE) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 overflow-hidden">
            
            <div className="bg-gradient-to-r from-teal-700 to-medblue-700 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarClock className="w-5 h-5 text-teal-200" />
                <h3 className="text-base font-bold">Manual Appointment (Walk-in / Phone)</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-white/80 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManual} className="p-5 sm:p-6 space-y-4 max-h-[82vh] overflow-y-auto">
              
              {manualError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{manualError}</span>
                </div>
              )}

              {/* Patient Details */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Patient Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kamran Ali"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                      Age
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 42"
                      value={manualAge}
                      onChange={(e) => setManualAge(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                      Gender
                    </label>
                    <select
                      value={manualGender}
                      onChange={(e) => setManualGender(e.target.value)}
                      className="w-full px-2 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Mobile / WhatsApp (03XX-XXXXXXX)
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 0300-1234567"
                    value={manualPhone}
                    onChange={(e) => setManualPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono outline-none"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    * If phone matches an existing patient, their profile will be linked automatically.
                  </span>
                </div>
              </div>

              {/* Date & Time Slot Selection */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase">
                  Schedule Date & Time Slot *
                </label>
                
                <input
                  type="date"
                  min={todayStr}
                  value={manualDate}
                  onChange={(e) => setManualDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold outline-none"
                />

                <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pt-1">
                  {availableSlotsData.map((slot) => (
                    <button
                      key={slot.startTime}
                      type="button"
                      disabled={slot.isBooked}
                      onClick={() => setManualStartTime(slot.startTime)}
                      className={`p-2 rounded-xl text-xs font-mono font-bold transition-all text-left ${
                        slot.isBooked
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed line-through'
                          : manualStartTime === slot.startTime
                          ? 'bg-teal-600 text-white shadow'
                          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {slot.startTime} {slot.isBooked ? '(Booked)' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clinical Notes & History */}
              <div className="space-y-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Reason for Visit / Symptoms
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Severe throat pain, fever"
                    value={manualReason}
                    onChange={(e) => setManualReason(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-rose-600 mb-1">
                      Known Allergies
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Penicillin"
                      value={manualAllergies}
                      onChange={(e) => setManualAllergies(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                      Chronic Conditions
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Diabetes"
                      value={manualChronic}
                      onChange={(e) => setManualChronic(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Internal Staff Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Patient is in waiting room"
                    value={manualNotes}
                    onChange={(e) => setManualNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingManual}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submittingManual ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Add Appointment</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL 2: RESCHEDULE APPOINTMENT */}
      {rescheduleApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 overflow-hidden">
            
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-teal-400" />
                <h3 className="text-sm font-bold">Reschedule: {rescheduleApt.patient_name}</h3>
              </div>
              <button onClick={() => setRescheduleApt(null)} className="text-white/80 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRescheduleSubmit} className="p-5 space-y-4">
              {rescheduleError && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{rescheduleError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Select New Date
                </label>
                <input
                  type="date"
                  min={todayStr}
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Choose New Time Slot
                </label>
                <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto">
                  {rescheduleSlotsData.map((slot) => (
                    <button
                      key={slot.startTime}
                      type="button"
                      disabled={slot.isBooked}
                      onClick={() => setRescheduleSlot(slot.startTime)}
                      className={`p-2 rounded-xl text-xs font-mono font-bold transition-all text-left ${
                        slot.isBooked
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed line-through'
                          : rescheduleSlot === slot.startTime
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {slot.startTime}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRescheduleApt(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rescheduling}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5"
                >
                  {rescheduling ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Confirm Reschedule</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Step 5: WhatsApp Reminder & Confirmation Modal */}
      {whatsappModalData && (
        <SendWhatsAppModal
          isOpen={Boolean(whatsappModalData?.isOpen)}
          onClose={() => setWhatsappModalData(null)}
          appointment={whatsappModalData.appointment}
          patient={{
            id: whatsappModalData.appointment?.patient_id,
            name: whatsappModalData.appointment?.patient_name,
            phone: whatsappModalData.appointment?.patient_phone,
            consent_given: true
          }}
          type={whatsappModalData.type}
          onSentSuccess={() => {
            setWhatsappModalData(null);
            loadAppointmentsAndCounts();
          }}
        />
      )}

    </div>
  );
}

