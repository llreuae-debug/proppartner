import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { ValidationResult } from '../../types';
import { useI18n } from '../../i18n/context';

interface ValidateViewProps {
  validation: ValidationResult;
  onNext: () => void;
  onPrev: () => void;
}

export const ValidateView: React.FC<ValidateViewProps> = ({
  validation,
  onNext,
  onPrev,
}) => {
  const { t } = useI18n();
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (validation.score / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            {t('validate.title')}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t('validate.subtitle')}
          </p>
        </div>
      </div>

      {/* KPI & Gauge Bento Card */}
      <div className="p-6 rounded-3xl bg-slate-900/60 backdrop-blur-md border border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-8">
          {/* Radial Score Gauge */}
          <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r={radius}
                className="stroke-slate-800 fill-none"
                strokeWidth="10"
              />
              <circle
                cx="72"
                cy="72"
                r={radius}
                className={`fill-none transition-all duration-1000 ease-out ${
                  validation.score >= 90
                    ? 'stroke-emerald-400'
                    : validation.score >= 70
                    ? 'stroke-amber-400'
                    : 'stroke-rose-400'
                }`}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-black text-white font-mono tracking-tight">
                {validation.score}%
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {t('validate.score_card')}
              </span>
            </div>
          </div>

          {/* Validation Metrics Bento Cards */}
          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-medium">{t('validate.pass_count')}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-2xl font-bold text-emerald-400 font-mono mt-2">
                {validation.passCount}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-medium">{t('validate.warn_count')}</span>
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-2xl font-bold text-amber-400 font-mono mt-2">
                {validation.warnCount}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-medium">{t('validate.fail_count')}</span>
                <XCircle className="w-4 h-4 text-rose-400" />
              </div>
              <span className="text-2xl font-bold text-rose-400 font-mono mt-2">
                {validation.failCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Checks Checklist Bento Card */}
      <div className="p-6 rounded-3xl bg-slate-900/60 backdrop-blur-md border border-slate-800 space-y-4 shadow-sm">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <span>{t('validate.checklist_title')}</span>
          <span className="text-xs font-mono text-slate-400">({validation.checks.length} rules)</span>
        </h2>

        <div className="space-y-2.5">
          {validation.checks.map((check) => {
            return (
              <div
                key={check.id}
                className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-start justify-between gap-4 text-xs hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      check.status === 'pass'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : check.status === 'warn'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {check.status === 'pass' ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : check.status === 'warn' ? (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5" />
                    )}
                  </span>

                  <div className="min-w-0">
                    <div className="font-semibold text-white truncate">{check.name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                      {check.detail}
                    </div>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase shrink-0 ${
                    check.status === 'pass'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : check.status === 'warn'
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {check.status === 'pass' ? 'PASS' : check.status === 'warn' ? 'WARN' : 'FAIL'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onPrev}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 transition-colors border border-slate-700/60 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('common.prev')}</span>
        </button>

        <button
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-600/25"
        >
          <span>{t('validate.proceed_btn')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

