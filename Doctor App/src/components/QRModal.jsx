import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, ExternalLink, Download, Sparkles, Stethoscope, Share2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function QRModal({ isOpen, onClose }) {
  const { currentDoctor } = useAuth();
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !currentDoctor) return null;

  const publicUrl = `${window.location.origin}/doctor/${currentDoctor.slug || currentDoctor.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrintStand = () => {
    const printWin = window.open('', '', 'width=800,height=900');
    printWin.document.write(`
      <html>
        <head>
          <title>Clinic Desk QR - ${currentDoctor.name}</title>
          <style>
            body { font-family: sans-serif; text-align: center; padding: 40px; margin: 0; background: #fff; color: #1e293b; }
            .card { border: 2px solid #0f766e; border-radius: 24px; padding: 40px; max-width: 480px; margin: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
            h1 { color: #0f766e; margin: 0 0 5px 0; font-size: 24px; }
            h2 { font-size: 16px; color: #475569; margin: 0 0 15px 0; font-weight: normal; }
            .qr-box { padding: 20px; background: #f0fdfa; border-radius: 16px; display: inline-block; margin: 20px 0; }
            .instruction { font-size: 16px; font-weight: bold; color: #0f766e; margin-top: 15px; }
            .sub { font-size: 13px; color: #64748b; margin-top: 5px; }
            .footer { margin-top: 25px; font-size: 12px; color: #94a3b8; border-top: 1px dashed #cbd5e1; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>${currentDoctor.name}</h1>
            <h2>${currentDoctor.specialization} • ${currentDoctor.qualifications}</h2>
            <div style="font-size: 13px; font-weight: bold; color: #0f766e; text-transform: uppercase;">${currentDoctor.clinicName}</div>
            
            <div class="qr-box">
              <svg xmlns="http://www.w3.org/2000/svg" width="220" height="220" viewBox="0 0 220 220">
                ${document.getElementById('qr-svg-code')?.innerHTML || ''}
              </svg>
            </div>
            
            <div class="instruction">Scan with Phone Camera to Book Appointments</div>
            <div class="sub">View available consultation timings, clinic location, & digital prescriptions</div>
            
            <div class="footer">
              PMDC Reg: ${currentDoctor.pmdcNumber} • Helpline: ${currentDoctor.phone}<br/>
              Powered by DocCare Healthcare OS
            </div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-medblue-700 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Share2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Public Profile & Clinic QR</h3>
              <p className="text-xs text-teal-100 font-normal">
                Share with patients for 24/7 direct appointment booking
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          
          {/* QR Box */}
          <div className="inline-block p-4 bg-teal-50 dark:bg-slate-800 rounded-3xl border border-teal-100 dark:border-slate-700 shadow-inner mb-4">
            <div id="qr-svg-code" className="bg-white p-4 rounded-2xl shadow-sm">
              <QRCodeSVG
                value={publicUrl}
                size={200}
                level="H"
                includeMargin={false}
                imageSettings={{
                  src: "/brand/doccare-icon.png",
                  x: undefined,
                  y: undefined,
                  height: 40,
                  width: 40,
                  excavate: true,
                }}
              />
            </div>
          </div>

          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
            {currentDoctor.name}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            {currentDoctor.clinicName} • {currentDoctor.city}
          </p>

          {/* Shareable Link Bar */}
          <div className="flex items-center gap-2 p-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 mb-5">
            <input
              type="text"
              readOnly
              value={publicUrl}
              className="w-full bg-transparent text-xs text-slate-700 dark:text-slate-200 font-mono px-2 outline-none truncate"
            />
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-slate-500" />
              <span>Open Public Page</span>
            </a>

            <button
              onClick={handlePrintStand}
              className="py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-teal-600/20 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Print Desk Stand</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
