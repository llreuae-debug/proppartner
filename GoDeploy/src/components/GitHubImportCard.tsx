import React, { useState } from 'react';
import {
  Github,
  GitBranch,
  FolderTree,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Star,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { fetchGitHubRepo, POPULAR_GITHUB_STARTERS, GitHubQuickTemplate } from '../utils/github';
import { ProjectData } from '../types';
import { useI18n } from '../i18n/context';

interface GitHubImportCardProps {
  onImportProject: (project: ProjectData) => void;
  onShowToast?: (msg: string, type: 'success' | 'error' | 'info' | 'warn') => void;
}

export const GitHubImportCard: React.FC<GitHubImportCardProps> = ({
  onImportProject,
  onShowToast,
}) => {
  const { t } = useI18n();

  // Form State
  const [repoInput, setRepoInput] = useState('');
  const [branch, setBranch] = useState('');
  const [subpath, setSubpath] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Import Action State
  const [isLoading, setIsLoading] = useState(false);
  const [statusStep, setStatusStep] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Main Import Action
  const handleImport = async (e?: React.FormEvent, customRepo?: string, customBranch?: string, customSubpath?: string) => {
    if (e) e.preventDefault();
    const targetRepo = customRepo || repoInput.trim();
    if (!targetRepo) return;

    setErrorMsg(null);
    setIsLoading(true);
    setStatusStep('Connecting to GitHub...');

    try {
      const result = await fetchGitHubRepo(targetRepo, {
        branch: customBranch || branch.trim() || undefined,
        subpath: customSubpath || subpath.trim() || undefined,
        onProgress: (step) => setStatusStep(step),
      });

      if (onShowToast) {
        onShowToast(
          `Successfully imported ${result.details.fullName} (${result.project.fileCount} files)`,
          'success'
        );
      }

      onImportProject(result.project);
    } catch (err: any) {
      const msg = err.message || 'Failed to import repository from GitHub';
      setErrorMsg(msg);
      if (onShowToast) {
        onShowToast(msg, 'error');
      }
    } finally {
      setIsLoading(false);
      setStatusStep('');
    }
  };

  const handleSelectStarter = (starter: GitHubQuickTemplate) => {
    setRepoInput(starter.repo);
    setBranch(starter.branch || '');
    setSubpath(starter.subpath || '');
    setShowAdvanced(Boolean(starter.branch || starter.subpath));
  };

  return (
    <div className="space-y-4">
      {/* Repository URL & Slug Import Form */}
      <div className="p-6 rounded-3xl bg-slate-900/60 backdrop-blur-md border border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Github className="w-4 h-4 text-white" />
            <span>{t('import.github_title')}</span>
          </h2>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Direct Fetch
          </span>
        </div>

        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          {t('import.github_subtitle')}
        </p>

        <form onSubmit={(e) => handleImport(e)} className="space-y-3.5">
          {/* Main Repo URL Input */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Repository URL or Slug</span>
              <span className="text-[11px] text-slate-500 font-mono">e.g. owner/repo or https://github.com/owner/repo</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Github className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={repoInput}
                onChange={(e) => {
                  setRepoInput(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder={t('import.github_placeholder')}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono transition-all"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Advanced options toggle (Branch, Subfolder) */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>{showAdvanced ? 'Hide branch & subfolder options' : 'Configure custom branch or subfolder'}</span>
              {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showAdvanced && (
              <div className="mt-3 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                      <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{t('import.github_branch')}</span>
                    </label>
                    <input
                      type="text"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      placeholder="e.g. main, dev, or release/v1.0"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                      <FolderTree className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{t('import.github_subpath')}</span>
                    </label>
                    <input
                      type="text"
                      value={subpath}
                      onChange={(e) => setSubpath(e.target.value)}
                      placeholder="e.g. client, frontend, apps/web"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-normal">
                <span className="font-semibold">GitHub Import Error: </span>
                {errorMsg}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !repoInput.trim()}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-600/25 cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{statusStep || t('import.github_importing_btn')}</span>
              </>
            ) : (
              <>
                <Github className="w-4 h-4" />
                <span>{t('import.github_import_btn')}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Popular Starters Quick Selector */}
      <div className="p-5 rounded-3xl bg-slate-900/60 backdrop-blur-md border border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>{t('import.github_starters_title')}</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {POPULAR_GITHUB_STARTERS.map((starter) => (
            <button
              key={starter.name}
              type="button"
              onClick={() => handleSelectStarter(starter)}
              className="p-3 rounded-2xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-indigo-500/40 text-left transition-all group flex flex-col justify-between cursor-pointer"
            >
              <div className="flex items-start justify-between w-full gap-2">
                <div className="font-semibold text-xs text-white group-hover:text-indigo-300 transition-colors truncate">
                  {starter.name}
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                  {starter.category}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {starter.desc}
              </p>
              <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span className="truncate">{starter.repo}</span>
                <span className="flex items-center gap-0.5 text-amber-400/90 shrink-0">
                  <Star className="w-2.5 h-2.5 fill-amber-400/90" /> {starter.stars}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
