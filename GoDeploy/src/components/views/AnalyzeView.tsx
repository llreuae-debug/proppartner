import React from 'react';
import {
  Activity,
  Sparkles,
  ArrowRight,
  Database,
  KeyRound,
  Layers,
  FileSearch,
  Github,
  GitBranch,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { AnalysisResult, ProjectData } from '../../types';
import { useI18n } from '../../i18n/context';

interface AnalyzeViewProps {
  project: ProjectData;
  analysis: AnalysisResult;
  onNext: () => void;
  onOpenInspector: () => void;
  onRunAiAudit: () => void;
}

export const AnalyzeView: React.FC<AnalyzeViewProps> = ({
  project,
  analysis,
  onNext,
  onOpenInspector,
  onRunAiAudit,
}) => {
  const { t } = useI18n();
  const compat = analysis.compatibility;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (analysis.score / 100) * circumference;
  const is100Percent = analysis.score >= 100;

  const compatMatrix: { label: string; status: 'ok' | 'warn' | 'err'; desc: string }[] = [
    {
      label: 'Frontend UI',
      status: compat.frontend,
      desc: analysis.frontend ? 'Client-side assets detected' : 'No frontend files found',
    },
    {
      label: 'Build System',
      status: compat.build,
      desc: analysis.hasBuildOutput
        ? `Found output in ${analysis.buildOutputDir}`
        : is100Percent
        ? 'Production build package ready'
        : 'Source files (build recommended)',
    },
    {
      label: 'Static Assets',
      status: compat.assets,
      desc: `${analysis.assets.count} media/style assets`,
    },
    {
      label: 'Server Routing',
      status: compat.routing,
      desc: is100Percent ? 'Hostinger .htaccess SPA fallback active' : analysis.routing,
    },
    {
      label: 'Backend Runtime',
      status: compat.backend,
      desc: analysis.backend ? 'Node / PHP backend required' : 'Static hosting compatible',
    },
    {
      label: 'Database Layer',
      status: compat.database,
      desc: analysis.database || 'No external database',
    },
    {
      label: 'Env Variables',
      status: compat.env,
      desc: is100Percent
        ? '.env.example & HOSTINGER_CONFIG ready'
        : `${analysis.environmentVariables.length} keys to configure`,
    },
    {
      label: 'External APIs',
      status: compat.apis,
      desc: `${analysis.apiDependencies.length + analysis.externalServices.length} third-party endpoints`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-indigo-400" />
            {t('analyze.title')}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
            <span>Source: <span className="font-mono text-slate-200">{project.name}</span></span>
            {project.source === 'github' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-indigo-400 font-mono text-[11px]">
                <Github className="w-3 h-3" />
                {project.githubRepo || 'github'}
                {project.githubBranch && (
                  <span className="text-slate-400 flex items-center gap-0.5">
                    <GitBranch className="w-2.5 h-2.5" />
                    {project.githubBranch}
                  </span>
                )}
              </span>
            ) : (
              <span className="text-slate-500 font-mono">({project.source})</span>
            )}
            <span>•</span>
            <span>{project.fileCount} {t('common.files').toLowerCase()}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenInspector}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-200 transition-colors shadow-sm"
          >
            <FileSearch className="w-4 h-4 text-indigo-400" />
            <span>{t('common.view_code')}</span>
          </button>

          <button
            id="top-ai-audit-trigger-btn"
            onClick={onRunAiAudit}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
              is100Percent
                ? 'bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 shadow-emerald-500/10'
                : 'bg-gradient-to-r from-indigo-600 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 text-white shadow-indigo-500/20'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{is100Percent ? 'Re-Audit Website' : 'AI Hostinger Tier Audit (100% Target)'}</span>
          </button>
        </div>
      </div>

      {/* AI Hostinger Tier Audit Banner */}
      <div
        id="ai-hostinger-tier-banner"
        className={`p-5 rounded-3xl border transition-all relative overflow-hidden ${
          is100Percent
            ? 'bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-slate-900/60 border-emerald-500/30 shadow-lg shadow-emerald-500/5'
            : 'bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900/60 border-indigo-500/30 shadow-lg shadow-indigo-500/5'
        }`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                is100Percent
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-gradient-to-tr from-indigo-600 to-emerald-500 text-white shadow-md shadow-indigo-500/20'
              }`}
            >
              {is100Percent ? (
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              ) : (
                <Sparkles className="w-5 h-5 text-white animate-pulse" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-white tracking-tight">
                  {is100Percent
                    ? '100% Hostinger Tier Compatibility Certified'
                    : 'AI Hostinger Tier Audit — Achieve 100% Compatibility Score'}
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono ${
                    is100Percent
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  }`}
                >
                  {is100Percent ? '100% Score' : 'Target: 100%'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {is100Percent
                  ? 'Fully deployment-ready for Hostinger Web & Cloud Hosting with zero critical errors. Configured with LiteSpeed .htaccess SPA fallback, Gzip compression, SEO robots.txt, XML sitemap, and vector favicon.'
                  : 'Automatically audit the entire website for Hostinger compatibility, identify every error, warning, configuration issue, deployment problem, and unsupported feature, then fix all issues automatically to achieve 100% score.'}
              </p>
            </div>
          </div>

          <button
            id="run-hostinger-audit-main-btn"
            onClick={onRunAiAudit}
            className={`w-full md:w-auto shrink-0 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all shadow-md ${
              is100Percent
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 text-white shadow-indigo-600/30'
            }`}
          >
            {is100Percent ? (
              <>
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>Re-Test Website</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Run AI Tier Audit (Achieve 100%)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Score & Architecture Bento Card */}
      <div className="p-6 rounded-3xl bg-slate-900/60 backdrop-blur-md border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
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
                className={`${
                  is100Percent ? 'stroke-emerald-400' : 'stroke-indigo-500'
                } fill-none transition-all duration-1000 ease-out`}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span
                className={`text-3xl font-black font-mono tracking-tight ${
                  is100Percent ? 'text-emerald-400' : 'text-white'
                }`}
              >
                {analysis.score}%
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {is100Percent ? 'Hostinger Tier' : t('analyze.score_card')}
              </span>
            </div>
          </div>

          {/* Architecture Summary Details */}
          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-400">{t('analyze.framework')}:</span>
              <span className="font-semibold text-white font-mono">{analysis.framework}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-400">Languages:</span>
              <span className="font-semibold text-white font-mono">
                {analysis.language.join(', ') || 'N/A'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-400">Package Manager:</span>
              <span className="font-semibold text-white font-mono">{analysis.packageManager || 'None'}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-400">Entry Point:</span>
              <span className="font-semibold text-white font-mono truncate max-w-[160px]">
                {analysis.entryPoint || 'index.html'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-400">{t('analyze.build_tool')}:</span>
              <span
                className={`font-semibold font-mono ${
                  analysis.hasBuildOutput || is100Percent ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {analysis.hasBuildOutput
                  ? `Output: ${analysis.buildOutputDir}`
                  : is100Percent
                  ? 'Hostinger Ready Package'
                  : 'Raw Source Code'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-400">{t('analyze.spa_routing')}:</span>
              <span className="font-semibold text-white font-mono truncate max-w-[160px]">
                {is100Percent ? '.htaccess Fallback Active' : analysis.routing}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Compatibility Matrix Bento Card */}
      <div className="p-6 rounded-3xl bg-slate-900/60 backdrop-blur-md border border-slate-800 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          {t('analyze.stack_card')}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {compatMatrix.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 flex flex-col justify-between gap-2.5 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-slate-200">{item.label}</span>
                {item.status === 'ok' ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    READY
                  </span>
                ) : item.status === 'warn' ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    REVIEW
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                    ACTION
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed truncate">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Two-Column Bento Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Environment Variables Card */}
        <div className="p-6 rounded-3xl bg-slate-900/60 backdrop-blur-md border border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
              <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
              {t('analyze.env_card')} ({analysis.environmentVariables.length})
            </h3>
          </div>

          <div className="flex-1">
            {analysis.environmentVariables.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                {analysis.environmentVariables.map((env, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-indigo-300"
                  >
                    {env}
                  </span>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-500">
                {t('analyze.env_none')}
              </div>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-3 pt-3 border-t border-slate-800">
            {t('analyze.env_note')}
          </p>
        </div>

        {/* Database & External Services Bento Card */}
        <div className="p-6 rounded-3xl bg-slate-900/60 backdrop-blur-md border border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-violet-400" />
              Database &amp; External Integrations
            </h3>
          </div>

          <div className="flex-1 space-y-2">
            <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">Database / ORM:</span>
              <span className="font-semibold text-white font-mono">
                {analysis.database || 'None detected'}
              </span>
            </div>

            {analysis.externalServices.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/80 text-xs">
                <div className="text-slate-400 mb-1.5">Third-Party Services:</div>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.externalServices.map((svc, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono text-[11px]"
                    >
                      {svc}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {analysis.paymentIntegrations.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/80 text-xs">
                <div className="text-slate-400 mb-1.5">Payment Gateways:</div>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.paymentIntegrations.map((pay, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono text-[11px]"
                    >
                      {pay}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-600/25"
        >
          <span>{t('analyze.proceed_btn')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
