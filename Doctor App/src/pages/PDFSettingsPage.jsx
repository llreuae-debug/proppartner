import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Palette, 
  Layout, 
  Upload, 
  RotateCcw, 
  Save, 
  Check, 
  Eye, 
  Sliders, 
  Sparkles, 
  QrCode, 
  Image, 
  PenTool, 
  Stamp, 
  Languages, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import PrescriptionPDF from '../components/PrescriptionPDF';

export default function PDFSettingsPage() {
  const { currentDoctor } = useAuth();

  const [settings, setSettings] = useState({
    header_layout: 'left-logo',
    primary_color: '#0F766E',
    secondary_color: '#0284C7',
    font: 'Helvetica',
    language: 'both',
    paper_margin: 'normal',
    show_qr: true,
    show_photo: true,
    footer_text: 'This digital prescription is generated electronically and verified by the attending physician.',
    logo_url: '',
    signature_url: '',
    stamp_url: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadingField, setUploadingField] = useState(null);

  useEffect(() => {
    if (!currentDoctor) return;
    api.getPdfSettings().then(res => {
      if (res.settings) {
        setSettings({
          header_layout: res.settings.header_layout || 'left-logo',
          primary_color: res.settings.primary_color || currentDoctor.headerColor || '#0F766E',
          secondary_color: res.settings.secondary_color || currentDoctor.accentColor || '#0284C7',
          font: res.settings.font || 'Helvetica',
          language: res.settings.language || 'both',
          paper_margin: res.settings.paper_margin || 'normal',
          show_qr: res.settings.show_qr !== false,
          show_photo: res.settings.show_photo !== false,
          footer_text: res.settings.footer_text || currentDoctor.disclaimerText || 'This digital prescription is generated electronically and verified by the attending physician.',
          logo_url: res.settings.logo_url || '',
          signature_url: res.settings.signature_url || currentDoctor.signatureImage || '',
          stamp_url: res.settings.stamp_url || currentDoctor.stampImage || ''
        });
      }
    }).catch(err => console.error("Error loading PDF settings:", err))
      .finally(() => setLoading(false));
  }, [currentDoctor]);

  const handleFileUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("File size exceeds 2 MB limit. Please choose a smaller image.");
      return;
    }

    try {
      setUploadingField(field);
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'x-doctor-id': currentDoctor?.id || 'doc-1'
        },
        body: formData
      });

      const data = await res.json();
      if (data.url) {
        setSettings(prev => ({ ...prev, [field]: data.url }));
      }
    } catch (err) {
      alert("Failed to upload image: " + err.message);
    } finally {
      setUploadingField(null);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.updatePdfSettings(settings);
      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      alert("Failed to save PDF settings: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Reset all PDF prescription layout settings to defaults?")) return;
    try {
      setSaving(true);
      const res = await api.resetPdfSettings();
      if (res.settings) {
        setSettings(res.settings);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      alert("Failed to reset settings: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Sample Mock Prescription for Live Preview Pane
  const samplePrescription = {
    prescription_no: "RX-2026-00001",
    created_at: new Date().toISOString(),
    patient: {
      name: "Kamran Ali",
      age: 42,
      gender: "Male",
      phone: "0301-4458921",
      allergies: "Penicillin, Amoxicillin"
    },
    diagnosis: "Acute Gastritis & Acid Peptic Disorder (GERD)",
    symptoms: "Retrosternal chest burning, acid regurgitation, nausea after food",
    items: [
      {
        medicine_name: "Nexum (Esomeprazole 40mg)",
        generic_name: "Esomeprazole",
        strength: "40 mg",
        form: "tablet",
        dose: "1 tab",
        frequency: "1+0+0 (Morning before breakfast)",
        duration: "14 Days",
        instructions: "Take 30 minutes before breakfast on empty stomach"
      },
      {
        medicine_name: "Motilium (Domperidone 10mg)",
        generic_name: "Domperidone",
        strength: "10 mg",
        form: "tablet",
        dose: "1 tab",
        frequency: "1+1+1 (TDS before meals)",
        duration: "5 Days",
        instructions: "Take 15-20 minutes before meals"
      },
      {
        medicine_name: "Gaviscon Syrup",
        generic_name: "Sodium Alginate + Bicarbonate",
        strength: "250 mg / 10ml",
        form: "syrup",
        dose: "10 ml",
        frequency: "1+1+1 (TDS after meals)",
        duration: "10 Days",
        instructions: "Take after meals and at bedtime"
      }
    ],
    tests_advised: "H. Pylori Stool Antigen Test, Ultrasound Abdomen",
    advice: "Strict avoidance of spicy/fried foods, tea, and citrus fruits. Elevate bed head 6 inches. Avoid NSAID painkillers.",
    follow_up_date: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
    verification_token: "vtok_sample_demo"
  };

  const colorPresets = [
    { name: 'Teal Emerald', primary: '#0F766E', secondary: '#0284C7' },
    { name: 'Medical Navy', primary: '#0369A1', secondary: '#059669' },
    { name: 'Royal Purple', primary: '#7C3AED', secondary: '#0D9488' },
    { name: 'Classic Slate', primary: '#334155', secondary: '#0284C7' },
    { name: 'Crimson Rose', primary: '#BE123C', secondary: '#0F766E' }
  ];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              PDF Prescription Layout & Branding
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Customize header styles, color themes, Urdu typography, margins, stamps, and signatures
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            disabled={saving}
            className="btn-secondary text-xs flex items-center gap-1.5 py-2 px-3"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" /> Reset Default
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn-primary text-xs flex items-center gap-1.5 py-2 px-4 shadow-md bg-teal-700 hover:bg-teal-800"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2 animate-fade-in font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>PDF layout & letterhead settings saved successfully!</span>
        </div>
      )}

      {/* Main 2-Column Grid: Controls on Left, Live Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT PANE: Controls (7 cols) */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* 1. Header Layout Selector */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <Layout className="w-4 h-4 text-teal-600" /> Header Layout Format
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'left-logo', label: 'Left Logo / Photo', desc: 'Doctor photo left, clinic right' },
                { id: 'centered', label: 'Centered Minimal', desc: 'Centered name & credentials' },
                { id: 'right-logo', label: 'Right Logo / Photo', desc: 'Doctor info left, clinic logo right' }
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSettings({ ...settings, header_layout: opt.id })}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    settings.header_layout === opt.id
                      ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 ring-2 ring-teal-500/20 text-teal-900 dark:text-teal-200'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="text-xs font-bold">{opt.label}</div>
                  <div className="text-[10px] text-slate-400 mt-1">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Color Palette & Typography */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-teal-600" /> Color Palette & Styling
            </label>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Primary Color (Hex)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.primary_color}
                    onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                    className="w-9 h-9 rounded-lg cursor-pointer border border-slate-200"
                  />
                  <input
                    type="text"
                    value={settings.primary_color}
                    onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                    className="flex-1 px-3 py-1.5 text-xs font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Secondary Accent (Hex)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.secondary_color}
                    onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                    className="w-9 h-9 rounded-lg cursor-pointer border border-slate-200"
                  />
                  <input
                    type="text"
                    value={settings.secondary_color}
                    onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                    className="flex-1 px-3 py-1.5 text-xs font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Quick Color Presets */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Presets:</span>
              {colorPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSettings({ ...settings, primary_color: preset.primary, secondary_color: preset.secondary })}
                  className="text-[10px] px-2.5 py-1 rounded-lg border font-bold flex items-center gap-1.5 hover:opacity-90"
                  style={{ borderColor: preset.primary, color: preset.primary }}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: preset.primary }}></span>
                  {preset.name}
                </button>
              ))}
            </div>

            {/* Typography Font & Language */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Typography Font</label>
                <select
                  value={settings.font}
                  onChange={(e) => setSettings({ ...settings, font: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold outline-none"
                >
                  <option value="Helvetica">Helvetica (Standard Clean)</option>
                  <option value="Noto Sans">Noto Sans (Modern Clinical)</option>
                  <option value="Noto Nastaliq Urdu">Noto Nastaliq Urdu (Urdu Script)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Prescription Language</label>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold outline-none"
                >
                  <option value="en">English Only</option>
                  <option value="ur">Urdu (اردو)</option>
                  <option value="both">Bilingual (English + Urdu)</option>
                </select>
              </div>
            </div>

            {/* Paper Margin */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-[11px] font-bold text-slate-500 block mb-1">Paper Margin Mode</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, paper_margin: 'normal' })}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-left ${
                    settings.paper_margin === 'normal'
                      ? 'bg-teal-50 border-teal-500 text-teal-800'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <div>Standard A4 Margin (12mm)</div>
                  <div className="text-[10px] text-slate-400 font-normal">For blank white paper printing</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, paper_margin: 'wide' })}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-left ${
                    settings.paper_margin === 'wide'
                      ? 'bg-teal-50 border-teal-500 text-teal-800'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <div>Wide Margin (24mm)</div>
                  <div className="text-[10px] text-slate-400 font-normal">Fits pre-printed letterhead pads</div>
                </button>
              </div>
            </div>
          </div>

          {/* 3. Assets: Signature, Stamp, and Clinic Logo */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-teal-600" /> Digital Signature, Stamp & Logo
            </label>

            <div className="grid grid-cols-3 gap-3">
              
              {/* Signature Upload */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Digital Signature</span>
                <div className="h-16 flex items-center justify-center bg-white dark:bg-slate-900 rounded-lg border border-dashed border-slate-300 p-1">
                  {settings.signature_url ? (
                    <img src={settings.signature_url} alt="Signature" className="max-h-full object-contain" />
                  ) : (
                    <PenTool className="w-6 h-6 text-slate-300" />
                  )}
                </div>
                <label className="inline-block px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 text-[10px] font-bold cursor-pointer transition-colors">
                  {uploadingField === 'signature_url' ? 'Uploading...' : 'Upload PNG'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'signature_url')}
                  />
                </label>
              </div>

              {/* Stamp Upload */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Clinic Stamp</span>
                <div className="h-16 flex items-center justify-center bg-white dark:bg-slate-900 rounded-lg border border-dashed border-slate-300 p-1">
                  {settings.stamp_url ? (
                    <img src={settings.stamp_url} alt="Stamp" className="max-h-full object-contain" />
                  ) : (
                    <Stamp className="w-6 h-6 text-slate-300" />
                  )}
                </div>
                <label className="inline-block px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 text-[10px] font-bold cursor-pointer transition-colors">
                  {uploadingField === 'stamp_url' ? 'Uploading...' : 'Upload Stamp'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'stamp_url')}
                  />
                </label>
              </div>

              {/* Clinic Logo Upload */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Clinic Logo</span>
                <div className="h-16 flex items-center justify-center bg-white dark:bg-slate-900 rounded-lg border border-dashed border-slate-300 p-1">
                  {settings.logo_url ? (
                    <img src={settings.logo_url} alt="Logo" className="max-h-full object-contain" />
                  ) : (
                    <Image className="w-6 h-6 text-slate-300" />
                  )}
                </div>
                <label className="inline-block px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 text-[10px] font-bold cursor-pointer transition-colors">
                  {uploadingField === 'logo_url' ? 'Uploading...' : 'Upload Logo'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'logo_url')}
                  />
                </label>
              </div>

            </div>
          </div>

          {/* 4. Footer & Toggles */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block">
              Custom Footer Disclaimer / Emergency Notice
            </label>
            <textarea
              rows={2}
              value={settings.footer_text}
              onChange={(e) => setSettings({ ...settings, footer_text: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none resize-none"
            />

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.show_qr}
                  onChange={(e) => setSettings({ ...settings, show_qr: e.target.checked })}
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                />
                <span>Show Verification QR Code</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.show_photo}
                  onChange={(e) => setSettings({ ...settings, show_photo: e.target.checked })}
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                />
                <span>Show Doctor Photo</span>
              </label>
            </div>
          </div>

        </div>

        {/* RIGHT PANE: Live Dynamic Preview (6 cols) */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-teal-600" /> Live Letterhead Preview
            </span>
            <span className="text-[11px] font-mono text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded">
              A4 Print Preview
            </span>
          </div>

          {/* Scaled Preview Box */}
          <div className="bg-slate-200 dark:bg-slate-800/80 p-3 sm:p-4 rounded-3xl overflow-x-auto shadow-inner border border-slate-300 dark:border-slate-700 flex justify-center">
            <div className="scale-[0.85] sm:scale-[0.9] origin-top bg-white rounded-xl shadow-2xl overflow-hidden max-w-[850px] w-full">
              <PrescriptionPDF
                prescription={samplePrescription}
                doctor={{
                  ...currentDoctor,
                  stampImage: settings.stamp_url || currentDoctor.stampImage,
                  signatureImage: settings.signature_url || currentDoctor.signatureImage,
                  profileImage: settings.show_photo ? currentDoctor.profileImage : null,
                  disclaimerText: settings.footer_text
                }}
                headerColor={settings.primary_color}
                accentColor={settings.secondary_color}
                showStamp={!!settings.stamp_url || !!currentDoctor.stampImage}
                showSignature={!!settings.signature_url || !!currentDoctor.signatureImage}
              />
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
