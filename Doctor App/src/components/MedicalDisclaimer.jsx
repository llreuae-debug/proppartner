import React, { useState } from 'react';
import { AlertCircle, X, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function MedicalDisclaimer() {
  const { t, isRTL } = useLanguage();
  const [dismissed, setDismissed] = useState(() => {
    return sessionStorage.getItem('doccare_disclaimer_dismissed') === 'true';
  });

  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-teal-50 px-4 py-2.5 shadow-md flex items-center justify-between text-xs sm:text-sm border-b border-teal-700/50">
      <div className="flex items-center gap-2.5 max-w-5xl mx-auto flex-1">
        <span className="p-1 rounded-full bg-teal-500/20 text-teal-300 shrink-0">
          <ShieldCheck className="w-4 h-4" />
        </span>
        <p className="leading-snug">
          <strong className="font-semibold text-teal-200">Clinical Decision Support:</strong>{' '}
          {t('aiDisclaimer')}
        </p>
      </div>
      <button 
        onClick={() => {
          setDismissed(true);
          sessionStorage.setItem('doccare_disclaimer_dismissed', 'true');
        }}
        className="text-teal-300 hover:text-white p-1 rounded transition-colors shrink-0 ml-2"
        title="Dismiss notice"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
