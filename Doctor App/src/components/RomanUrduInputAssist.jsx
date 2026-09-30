import React, { useState, useEffect } from 'react';
import { Sparkles, Check, Edit2, X } from 'lucide-react';
import { transliterateRomanUrdu } from '../utils/romanUrduTranslator';

export default function RomanUrduInputAssist({ value, onApply, isUrduMode = false }) {
  const [suggestion, setSuggestion] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [lastCheckedValue, setLastCheckedValue] = useState('');

  useEffect(() => {
    if (!value || typeof value !== 'string') {
      setSuggestion(null);
      return;
    }

    // Don't suggest if already in pure Urdu script
    const hasUrduCharacters = /[\u0600-\u06FF]/.test(value);
    const hasEnglishCharacters = /[a-zA-Z]/.test(value);

    if (hasEnglishCharacters && value.trim().length >= 3) {
      if (value !== lastCheckedValue) {
        const urduText = transliterateRomanUrdu(value);
        if (urduText && urduText !== value) {
          setSuggestion(urduText);
          setDismissed(false);
          setLastCheckedValue(value);
        } else {
          setSuggestion(null);
        }
      }
    } else {
      setSuggestion(null);
    }
  }, [value, lastCheckedValue]);

  if (!suggestion || dismissed) return null;

  return (
    <div className="mt-1.5 p-2.5 rounded-2xl bg-teal-50/90 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800 shadow-sm text-xs animate-fade-in flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
      <div className="flex items-start sm:items-center gap-2 text-teal-950 dark:text-teal-100 flex-1">
        <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5 sm:mt-0 animate-pulse" />
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
              Suggested Urdu:
            </span>
            <span className="urdu-text font-bold text-sm text-teal-900 dark:text-white leading-relaxed px-1.5 py-0.5 bg-white/70 dark:bg-slate-800/70 rounded-lg">
              {suggestion}
            </span>
          </div>
          <p className="text-[10px] text-teal-700/80 dark:text-teal-400/80">
            رومن اردو سے اردو میں تبدیل کریں
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
        <button
          type="button"
          onClick={() => {
            onApply(suggestion);
            setDismissed(true);
          }}
          className="px-3 py-1 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-colors active:scale-95"
          title="Use suggested Urdu text"
        >
          <Check className="w-3.5 h-3.5" />
          <span className="urdu-text text-xs">استعمال کریں</span>
        </button>

        <button
          type="button"
          onClick={() => {
            // Keep user input and dismiss helper
            setDismissed(true);
          }}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-teal-100/50 transition-colors"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
