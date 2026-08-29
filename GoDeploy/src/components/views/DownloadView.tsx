import React, { useState } from 'react';
import {
  DownloadCloud,
  FileText,
  Copy,
  Check,
  ExternalLink,
  Eye,
  ArrowLeft,
  Server,
} from 'lucide-react';
import { AnalysisResult, BuiltPackageResult, EnvVariableConfig, ProjectData } from '../../types';
import { useI18n } from '../../i18n/context';

interface DownloadViewProps {
  project: ProjectData;
  analysis: AnalysisResult;
  packageBlob: BuiltPackageResult | null;
  envVars: EnvVariableConfig[];
  onDownloadZip: () => void;
  onDownloadReport: () => void;
  onCopyInstructions: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export const DownloadView: React.FC<DownloadViewProps> = ({
  project,
  analysis,
  packageBlob,
  envVars,
  onDownloadZip,
  onDownloadReport,
  onCopyInstructions,
  onNext,
  onPrev,
}) => {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const handleCopy = () => {
    onCopyInstructions();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2.5">
            <DownloadCloud className="w-5 h-5 text-emerald-400" />
            {t('download.title')}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t('download.subtitle')}
          </p>
        </div>
      </div>

      {/* Hero Download Bento Card */}
      <div className="p-6 rounded-3xl bg-slate-900/70 backdrop-blur-md border border-emerald-500/30 shadow-md shadow-emerald-500/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                {t('download.hero_ready')}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Target: {packageBlob?.mode.toUpperCase() || 'STATIC'}
              </span>
            </div>

            <h2 className="text-lg font-bold text-white font-mono">{packageBlob?.name || 'website-hostinger-ready.zip'}</h2>
            <div className="text-xs text-slate-400">
              Size: <strong className="text-white font-mono">{packageBlob ? formatBytes(packageBlob.size) : 'Calculated'}</strong> • Contains verified .htaccess, assets, sitemaps, and deployment guide.
            </div>
          </div>

          <button
            onClick={onDownloadZip}
            className="flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-xl shadow-emerald-500/25 shrink-0 font-sans"
          >
            <DownloadCloud className="w-5 h-5 stroke-[2.5]" />
            <span>{t('download.btn_zip')}</span>
          </button>
        </div>
      </div>

      {/* Action Buttons Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={onDownloadReport}
          className="p-5 rounded-3xl bg-slate-900/60 backdrop-blur-md border border-slate-800 hover:border-slate-700 text-left transition-all flex items-center justify-between group shadow-sm"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-xs text-white group-hover:text-indigo-400 transition-colors">
                {t('download.btn_report')}
              </div>
              <div className="text-[11px] text-slate-400">Comprehensive audit and architecture record</div>
            </div>
          </div>
          <span className="text-xs text-slate-500 font-mono">HTML</span>
        </button>

        <button
          onClick={handleCopy}
          className="p-5 rounded-3xl bg-slate-900/60 backdrop-blur-md border border-slate-800 hover:border-slate-700 text-left transition-all flex items-center justify-between group shadow-sm"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
            </div>
            <div>
              <div className="font-semibold text-xs text-white group-hover:text-violet-400 transition-colors">
                {copied ? t('download.btn_instructions_copied') : t('download.btn_instructions')}
              </div>
              <div className="text-[11px] text-slate-400">Full step-by-step Hostinger checklist</div>
            </div>
          </div>
          <span className="text-xs text-slate-500 font-mono">MD</span>
        </button>
      </div>

      {/* Step-by-Step Hostinger Deployment Checklist Bento Card */}
      <div className="p-6 rounded-3xl bg-slate-900/60 backdrop-blur-md border border-slate-800 space-y-4 shadow-sm">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Server className="w-4 h-4 text-indigo-400" />
          {t('download.guide_title')}
        </h2>

        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 flex items-start gap-3.5 text-xs">
            <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold font-mono flex items-center justify-center shrink-0 text-[11px]">
              1
            </span>
            <div className="space-y-1">
              <div className="font-semibold text-white">{t('download.step1_title')}</div>
              <p className="text-slate-400 leading-relaxed">
                Open <a href="https://hpanel.hostinger.com" target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 underline inline-flex items-center gap-1">hpanel.hostinger.com <ExternalLink className="w-3 h-3" /></a>, select your hosting plan, and click <strong>Manage</strong>.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 flex items-start gap-3.5 text-xs">
            <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold font-mono flex items-center justify-center shrink-0 text-[11px]">
              2
            </span>
            <div className="space-y-1">
              <div className="font-semibold text-white">{t('download.step2_title')}</div>
              <p className="text-slate-400 leading-relaxed">
                Go to <strong>Files → File Manager</strong>. Navigate inside the <code className="text-indigo-300 font-mono">public_html</code> folder and upload your downloaded <code className="text-indigo-300 font-mono">{packageBlob?.name || 'website-hostinger-ready.zip'}</code>.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 flex items-start gap-3.5 text-xs">
            <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold font-mono flex items-center justify-center shrink-0 text-[11px]">
              3
            </span>
            <div className="space-y-1">
              <div className="font-semibold text-white">{t('download.step3_title')}</div>
              <p className="text-slate-400 leading-relaxed">
                Right-click the uploaded zip and choose <strong>Extract</strong>. Ensure <code className="text-indigo-300 font-mono">index.html</code> (or <code className="text-indigo-300 font-mono">index.php</code>) and <code className="text-indigo-300 font-mono">.htaccess</code> sit directly in <code className="text-indigo-300 font-mono">public_html</code>.
              </p>
            </div>
          </div>

          {envVars.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 flex items-start gap-3.5 text-xs">
              <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 font-bold font-mono flex items-center justify-center shrink-0 text-[11px]">
                4
              </span>
              <div className="space-y-1">
                <div className="font-semibold text-white">{t('download.step4_title')}</div>
                <p className="text-slate-400 leading-relaxed">
                  Rename <code className="text-indigo-300 font-mono">.env.example</code> to <code className="text-indigo-300 font-mono">.env</code> in File Manager and paste your live API secrets and keys.
                </p>
              </div>
            </div>
          )}

          <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 flex items-start gap-3.5 text-xs">
            <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold font-mono flex items-center justify-center shrink-0 text-[11px]">
              {envVars.length > 0 ? 5 : 4}
            </span>
            <div className="space-y-1">
              <div className="font-semibold text-white">{t('download.step5_title')}</div>
              <p className="text-slate-400 leading-relaxed">
                Check <strong>Security → SSL</strong> in hPanel to make sure Let's Encrypt SSL is active. Your website is ready for the world!
              </p>
            </div>
          </div>
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
          <span>{t('download.proceed_btn')}</span>
          <Eye className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

