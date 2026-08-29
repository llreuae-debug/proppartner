import React, { useState } from 'react';
import {
  Wrench,
  AlertTriangle,
  Info,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  FileCode,
  Check,
} from 'lucide-react';
import { AppliedFix, ProjectData } from '../../types';
import { useI18n } from '../../i18n/context';

interface RepairViewProps {
  project: ProjectData;
  fixes: AppliedFix[];
  onRunDeepAiRepair: () => void;
  isAiRepairing: boolean;
  onNext: () => void;
  onPrev: () => void;
}

export const RepairView: React.FC<RepairViewProps> = ({
  project,
  fixes,
  onRunDeepAiRepair,
  isAiRepairing,
  onNext,
  onPrev,
}) => {
  const { t } = useI18n();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedFixId, setExpandedFixId] = useState<string | null>(fixes[0]?.id || null);

  const fixCount = fixes.filter((f) => f.type === 'fix').length;
  const warnCount = fixes.filter((f) => f.type === 'warn').length;
  const infoCount = fixes.filter((f) => f.type === 'info').length;

  const categories = [
    { id: 'all', label: `All (${fixes.length})` },
    { id: 'routing', label: 'Routing & .htaccess' },
    { id: 'assets', label: 'Asset Paths' },
    { id: 'code', label: 'Code & Localhost' },
    { id: 'security', label: 'Security' },
    { id: 'seo', label: 'SEO & Meta' },
  ];

  const filteredFixes =
    activeCategory === 'all'
      ? fixes
      : fixes.filter((f) => f.category === activeCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2.5">
            <Wrench className="w-5 h-5 text-indigo-400" />
            {t('repair.title')}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t('repair.subtitle')}
          </p>
        </div>

        <button
          onClick={onRunDeepAiRepair}
          disabled={isAiRepairing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-95 text-white disabled:opacity-50 transition-all shadow-md shadow-indigo-600/20"
        >
          {isAiRepairing ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>{t('repair.deep_ai_running')}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('repair.deep_ai_btn')}</span>
            </>
          )}
        </button>
      </div>

      {/* Bento Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900/60 backdrop-blur-md border border-slate-800 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-mono font-extrabold text-xl border border-emerald-500/20">
            {fixCount}
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider font-mono">
              {t('repair.kpi_fixed')}
            </div>
            <div className="text-sm font-bold text-white">Auto-configured for Hostinger</div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/60 backdrop-blur-md border border-slate-800 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-mono font-extrabold text-xl border border-amber-500/20">
            {warnCount}
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider font-mono">
              {t('repair.kpi_warnings')}
            </div>
            <div className="text-sm font-bold text-white">Advisories & Key Settings</div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/60 backdrop-blur-md border border-slate-800 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center font-mono font-extrabold text-xl border border-indigo-500/20">
            {infoCount}
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider font-mono">
              {t('repair.kpi_info')}
            </div>
            <div className="text-sm font-bold text-white">Runtime & Structure Notes</div>
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800 text-xs">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? 'bg-slate-800 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Fixes List in Bento Containers */}
      <div className="space-y-3">
        {filteredFixes.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs shadow-sm">
            {t('repair.no_fixes')}
          </div>
        ) : (
          filteredFixes.map((fix) => {
            const isExpanded = expandedFixId === fix.id;
            return (
              <div
                key={fix.id}
                className={`rounded-2xl border transition-all overflow-hidden shadow-sm ${
                  fix.type === 'fix'
                    ? 'bg-slate-900/60 border-emerald-500/20'
                    : fix.type === 'warn'
                    ? 'bg-slate-900/60 border-amber-500/30'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                {/* Fix Item Row */}
                <div
                  onClick={() => setExpandedFixId(isExpanded ? null : fix.id)}
                  className="p-4 flex items-center justify-between gap-4 cursor-pointer select-none hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                        fix.type === 'fix'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : fix.type === 'warn'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-indigo-500/20 text-indigo-400'
                      }`}
                    >
                      {fix.type === 'fix' ? (
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      ) : fix.type === 'warn' ? (
                        <AlertTriangle className="w-3.5 h-3.5" />
                      ) : (
                        <Info className="w-3.5 h-3.5" />
                      )}
                    </span>

                    <div className="min-w-0">
                      <div className="font-semibold text-xs text-white truncate flex items-center gap-2">
                        <span>{fix.msg}</span>
                        {fix.targetFile && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-950 text-slate-400 border border-slate-800">
                            {fix.targetFile}
                          </span>
                        )}
                      </div>
                      {fix.detail && (
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{fix.detail}</p>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 shrink-0">
                    {fix.category}
                  </span>
                </div>

                {/* Expanded Diff / Code Details */}
                {isExpanded && (
                  <div className="p-4 pt-0 border-t border-slate-800 space-y-3 bg-slate-950/60">
                    {fix.detail && (
                      <p className="text-xs text-slate-300 leading-relaxed">{fix.detail}</p>
                    )}

                    {fix.diff && (
                      <div className="rounded-xl bg-slate-950 border border-slate-800 p-3.5 font-mono text-xs overflow-x-auto">
                        <div className="text-[10px] uppercase font-bold text-indigo-400 mb-1.5 flex items-center gap-1.5">
                          <FileCode className="w-3 h-3" />
                          Generated / Updated Content:
                        </div>
                        <pre className="text-emerald-300 text-[11px] whitespace-pre leading-relaxed">
                          {fix.diff.after}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
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
          <span>{t('repair.proceed_btn')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

