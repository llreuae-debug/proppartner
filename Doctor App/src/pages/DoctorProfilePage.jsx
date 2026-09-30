import React, { useState, useEffect } from 'react';
import { 
  UserSquare2, 
  Camera, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Calendar, 
  Check, 
  Share2, 
  QrCode, 
  Stethoscope, 
  Sparkles, 
  ExternalLink,
  Plus,
  Trash2,
  Image as ImageIcon,
  ShieldCheck,
  FileSignature
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import PhotoCropModal from '../components/PhotoCropModal';

export default function DoctorProfilePage({ onOpenQR }) {
  const { currentDoctor, updateCurrentDoctor } = useAuth();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    qualifications: '',
    pmdcNumber: '',
    experienceYears: 5,
    consultationFee: 2000,
    clinicName: '',
    address: '',
    city: 'Lahore',
    mapLink: '',
    phone: '',
    whatsapp: '',
    email: '',
    bio: '',
    availableDays: [],
    timeSlots: [],
    headerColor: '#0f766e',
    disclaimerText: '',
    profileImage: '',
    signatureImage: '',
    stampImage: '',
    whatsapp_message_template: "Hello [Patient Name], your prescription from Dr. [Doctor Name] ([Clinic Name]) is ready. View or download it here: [Link]. This link expires on [Expiry Date]. Get well soon.",
    default_link_expiry_days: 7
  });

  const [newSlotInput, setNewSlotInput] = useState('');
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [photoModalTarget, setPhotoModalTarget] = useState('profile'); // 'profile' | 'stamp' | 'signature'
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentDoctor) {
      setFormData({
        name: currentDoctor.name || '',
        specialization: currentDoctor.specialization || '',
        qualifications: currentDoctor.qualifications || '',
        pmdcNumber: currentDoctor.pmdcNumber || '',
        experienceYears: currentDoctor.experienceYears || 5,
        consultationFee: currentDoctor.consultationFee || 2000,
        clinicName: currentDoctor.clinicName || '',
        address: currentDoctor.address || '',
        city: currentDoctor.city || 'Lahore',
        mapLink: currentDoctor.mapLink || `https://maps.google.com/?q=${currentDoctor.clinicName || 'Clinic'}`,
        phone: currentDoctor.phone || '',
        whatsapp: currentDoctor.whatsapp || '',
        email: currentDoctor.email || '',
        bio: currentDoctor.bio || '',
        availableDays: currentDoctor.availableDays || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        timeSlots: currentDoctor.timeSlots || ["05:00 PM - 05:30 PM", "05:30 PM - 06:00 PM", "06:00 PM - 06:30 PM", "06:30 PM - 07:00 PM"],
        headerColor: currentDoctor.headerColor || '#0f766e',
        disclaimerText: currentDoctor.disclaimerText || '',
        profileImage: currentDoctor.profileImage || '',
        signatureImage: currentDoctor.signatureImage || '',
        stampImage: currentDoctor.stampImage || '',
        whatsapp_message_template: currentDoctor.whatsapp_message_template || "Hello [Patient Name], your prescription from Dr. [Doctor Name] ([Clinic Name]) is ready. View or download it here: [Link]. This link expires on [Expiry Date]. Get well soon.",
        default_link_expiry_days: currentDoctor.default_link_expiry_days || 7
      });
    }
  }, [currentDoctor]);

  const allDaysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const toggleDay = (day) => {
    setFormData(prev => {
      const days = prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day];
      return { ...prev, availableDays: days };
    });
  };

  const handleAddSlot = () => {
    if (newSlotInput.trim() && !formData.timeSlots.includes(newSlotInput.trim())) {
      setFormData(prev => ({
        ...prev,
        timeSlots: [...prev.timeSlots, newSlotInput.trim()]
      }));
      setNewSlotInput('');
    }
  };

  const handleRemoveSlot = (slot) => {
    setFormData(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.filter(s => s !== slot)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await updateCurrentDoctor(formData);
      if (res.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      alert("Failed to save profile: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCroppedPhoto = (base64) => {
    if (photoModalTarget === 'profile') {
      setFormData(prev => ({ ...prev, profileImage: base64 }));
    } else if (photoModalTarget === 'stamp') {
      setFormData(prev => ({ ...prev, stampImage: `<img src="${base64}" style="width:100px; height:100px; object-fit:contain;" />` }));
    } else if (photoModalTarget === 'signature') {
      setFormData(prev => ({ ...prev, signatureImage: `<img src="${base64}" style="width:140px; height:60px; object-fit:contain;" />` }));
    }
  };

  const publicUrl = `${window.location.origin}/doctor/${currentDoctor?.slug || currentDoctor?.id}`;

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-850 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <UserSquare2 className="w-6 h-6 text-teal-600" />
            <span>Doctor Profile & Practice Setup</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your credentials, clinic hours, location pins, and digital prescription branding
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenQR}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <QrCode className="w-4 h-4 text-teal-600" />
            <span>Clinic QR Code</span>
          </button>
          
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <ExternalLink className="w-4 h-4" />
            <span>View Public Page</span>
          </a>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Profile changes saved and synchronized across public booking and prescriptions!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Photo & Professional Credentials */}
        <div className="bg-white dark:bg-slate-850 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              1. Doctor Credentials & Profile Picture
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row items-start gap-6">
            
            {/* Avatar with Crop Trigger */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative group">
                <img
                  src={formData.profileImage || "https://images.unsplash.com/photo-1594824813590-78c0053e16b9?auto=format&fit=crop&q=80&w=300"}
                  alt={formData.name}
                  className="w-28 h-28 rounded-3xl object-cover ring-4 ring-teal-500/20 shadow-md"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPhotoModalTarget('profile');
                    setIsPhotoModalOpen(true);
                  }}
                  className="absolute inset-0 bg-slate-900/40 rounded-3xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs"
                >
                  <Camera className="w-6 h-6" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPhotoModalTarget('profile');
                  setIsPhotoModalOpen(true);
                }}
                className="text-xs text-teal-600 hover:underline font-bold"
              >
                Change Photo
              </button>
            </div>

            {/* Input Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-1 w-full">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Full Name with Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Specialization *
                </label>
                <input
                  type="text"
                  required
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Qualifications (e.g. MBBS, FCPS) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.qualifications}
                  onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  PMDC Registration Number *
                </label>
                <input
                  type="text"
                  required
                  value={formData.pmdcNumber}
                  onChange={(e) => setFormData({ ...formData, pmdcNumber: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Years of Experience
                </label>
                <input
                  type="number"
                  value={formData.experienceYears}
                  onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Consultation Fee (PKR) *
                </label>
                <input
                  type="number"
                  required
                  value={formData.consultationFee}
                  onChange={(e) => setFormData({ ...formData, consultationFee: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none font-bold text-teal-700 dark:text-teal-400"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Clinic Location & Contacts */}
        <div className="bg-white dark:bg-slate-850 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="w-2.5 h-2.5 rounded-full bg-medblue-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              2. Clinic Location & Contact Info
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Clinic / Hospital Name *
              </label>
              <input
                type="text"
                required
                value={formData.clinicName}
                onChange={(e) => setFormData({ ...formData, clinicName: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                City *
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Google Maps Link Pin
              </label>
              <input
                type="url"
                value={formData.mapLink}
                onChange={(e) => setFormData({ ...formData, mapLink: e.target.value })}
                placeholder="https://maps.google.com/?q=..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none font-mono text-[11px]"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Full Physical Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Clinic Phone Number *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                WhatsApp Dispatch Number
              </label>
              <input
                type="tel"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Schedule & Consultation Slots */}
        <div className="bg-white dark:bg-slate-850 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              3. Weekly Availability Days & Time Slots
            </h3>
          </div>

          {/* Days of week selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
              Available Days:
            </label>
            <div className="flex flex-wrap gap-2">
              {allDaysOfWeek.map((day) => {
                const isSelected = formData.availableDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Slots builder */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
              Consultation Time Slots:
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.timeSlots.map((slot) => (
                <span
                  key={slot}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-xs font-bold font-mono border border-teal-200 dark:border-teal-800"
                >
                  <span>{slot}</span>
                  <button type="button" onClick={() => handleRemoveSlot(slot)} className="text-slate-400 hover:text-rose-600">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 max-w-sm">
              <input
                type="text"
                placeholder="e.g. 08:00 PM - 08:30 PM"
                value={newSlotInput}
                onChange={(e) => setNewSlotInput(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono outline-none"
              />
              <button
                type="button"
                onClick={handleAddSlot}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors"
              >
                Add Slot
              </button>
            </div>
          </div>
        </div>

        {/* Digital Signature & Stamp */}
        <div className="bg-white dark:bg-slate-850 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              4. Digital Signature & Official Stamp
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Signature */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                Doctor's Digital Signature
              </label>
              <div className="h-20 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center p-2">
                {formData.signatureImage ? (
                  <div dangerouslySetInnerHTML={{ __html: formData.signatureImage }} />
                ) : (
                  <span className="text-xs text-slate-400 italic">No signature uploaded</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setPhotoModalTarget('signature');
                  setIsPhotoModalOpen(true);
                }}
                className="w-full py-1.5 text-xs font-bold text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
              >
                Upload Signature Image
              </button>
            </div>

            {/* Stamp */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                Clinic Official Stamp
              </label>
              <div className="h-20 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center p-2">
                {formData.stampImage ? (
                  <div dangerouslySetInnerHTML={{ __html: formData.stampImage }} />
                ) : (
                  <span className="text-xs text-slate-400 italic">No stamp uploaded</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setPhotoModalTarget('stamp');
                  setIsPhotoModalOpen(true);
                }}
                className="w-full py-1.5 text-xs font-bold text-teal-600 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
              >
                Upload Stamp Image
              </button>
            </div>

          </div>
        </div>

        {/* STEP 5: WhatsApp Messaging & Secure Link Settings */}
        <div className="bg-white dark:bg-slate-850 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              5. WhatsApp Messaging & Secure Prescription Link Expiry
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Default Link Expiration Duration
              </label>
              <select
                value={formData.default_link_expiry_days}
                onChange={(e) => setFormData({ ...formData, default_link_expiry_days: Number(e.target.value) })}
                className="w-full max-w-xs px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200 outline-none"
              >
                <option value={1}>1 Day (Emergency / Acute Care)</option>
                <option value={3}>3 Days</option>
                <option value={7}>7 Days (Standard Recommended)</option>
                <option value={30}>30 Days (Chronic Disease Care)</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Prescription links expire automatically after this duration. Expired links prompt the patient to contact the clinic.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Default WhatsApp Message Template
                </label>
                <span className="text-[11px] text-slate-400">Click placeholder tags below to insert</span>
              </div>

              {/* Tag inserters */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {['[Patient Name]', '[Doctor Name]', '[Clinic Name]', '[Link]', '[Expiry Date]'].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        whatsapp_message_template: prev.whatsapp_message_template + ' ' + tag
                      }));
                    }}
                    className="px-2 py-0.5 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-mono text-[10px] font-bold hover:bg-teal-100"
                  >
                    +{tag}
                  </button>
                ))}
              </div>

              <textarea
                rows={4}
                value={formData.whatsapp_message_template}
                onChange={(e) => setFormData({ ...formData, whatsapp_message_template: e.target.value })}
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 leading-relaxed font-sans outline-none focus:ring-2 focus:ring-teal-500"
              />
              <p className="text-[10px] text-slate-400 italic mt-1">
                * Note: Diagnosis and medicine names are omitted for patient medical privacy.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 6: Public Profile & Patient Discovery Privacy Controls */}
        <div className="bg-white dark:bg-slate-850 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              6. Public Profile & Patient Discovery Privacy Controls
            </h3>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Control exactly what information is visible to public patients on the <strong>DocCare Patient Discovery Directory</strong>. Sensitive clinical records, patient histories, and internal ledgers are always private and never exposed.
          </p>

          {/* Granular Visibility Checkboxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { key: 'show_profile_publicly', label: 'Publish Profile in Patient Directory', desc: 'Allow patients to discover your profile on the homepage' },
              { key: 'allow_online_booking', label: 'Allow Online Appointment Booking', desc: 'Patients can request appointment slots online' },
              { key: 'show_photo', label: 'Display Doctor Photo', desc: 'Show your verified profile photo' },
              { key: 'show_specialty', label: 'Display Medical Specialty', desc: 'Show clinical specialization badge' },
              { key: 'show_qualifications', label: 'Display Medical Qualifications', desc: 'Show MBBS, FCPS, MRCP degrees' },
              { key: 'show_experience', label: 'Display Years of Experience', desc: 'Show clinical experience counter' },
              { key: 'show_pmdc', label: 'Display PMDC Registration Number', desc: 'Show verified PMDC registration number' },
              { key: 'show_clinic', label: 'Display Clinic / Hospital Name', desc: 'Show primary practice facility' },
              { key: 'show_address', label: 'Display Full Physical Address & Map', desc: 'Show street address and Google map pin' },
              { key: 'show_fee', label: 'Display Consultation Fees Publicly', desc: 'Show fee schedule on public profile' },
              { key: 'show_public_contact', label: 'Display Public Contact Numbers', desc: 'Show clinic phone/email to patients' }
            ].map(item => (
              <label 
                key={item.key} 
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-start gap-3 cursor-pointer hover:border-teal-400 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={formData.public_profile_settings?.[item.key] !== false}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    public_profile_settings: {
                      ...(prev.public_profile_settings || {}),
                      [item.key]: e.target.checked
                    }
                  }))}
                  className="mt-0.5 w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">{item.label}</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">{item.desc}</span>
                </div>
              </label>
            ))}
          </div>

          {/* Appointment Approval Mode */}
          <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 space-y-2">
            <label className="block text-xs font-bold text-teal-900 dark:text-teal-200">
              Online Appointment Booking Approval Rule:
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="auto_confirm"
                  checked={!formData.auto_confirm_appointments}
                  onChange={() => setFormData({ ...formData, auto_confirm_appointments: false })}
                  className="text-teal-600 focus:ring-teal-500"
                />
                <span><strong>Require Doctor Approval</strong> (Requests appear as Pending in your dashboard)</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="auto_confirm"
                  checked={Boolean(formData.auto_confirm_appointments)}
                  onChange={() => setFormData({ ...formData, auto_confirm_appointments: true })}
                  className="text-teal-600 focus:ring-teal-500"
                />
                <span><strong>Automatically Confirm</strong> (Instant booking without manual confirmation)</span>
              </label>
            </div>
          </div>

          {/* Detailed Fee Schedule Configuration */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Comprehensive Fee Schedule (PKR)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Initial Consultation *</label>
                <input
                  type="number"
                  value={formData.consultationFee || 2500}
                  onChange={(e) => setFormData({ ...formData, consultationFee: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Follow-up Consultation</label>
                <input
                  type="number"
                  value={formData.followUpFee || 1500}
                  onChange={(e) => setFormData({ ...formData, followUpFee: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Online Video Session</label>
                <input
                  type="number"
                  value={formData.onlineFee || 2000}
                  onChange={(e) => setFormData({ ...formData, onlineFee: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Emergency Consultation</label>
                <input
                  type="number"
                  value={formData.emergencyFee || 4000}
                  onChange={(e) => setFormData({ ...formData, emergencyFee: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-teal-600/30 transition-all flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save & Publish Profile'}</span>
          </button>
        </div>

      </form>

      {/* Cropper Modal */}
      <PhotoCropModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        onSave={handleSaveCroppedPhoto}
        title={photoModalTarget === 'profile' ? "Crop Profile Picture" : photoModalTarget === 'stamp' ? "Upload Clinic Stamp" : "Upload Signature"}
        aspectRatio={photoModalTarget === 'signature' ? 2.5 : 1}
      />

    </div>
  );
}
