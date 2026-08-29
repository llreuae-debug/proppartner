import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Globe,
  FolderOpen,
  Sparkles,
  Zap,
  ArrowRight,
  Layers,
  CheckCircle2,
  FileArchive,
  Github,
} from 'lucide-react';
import { getSampleProjects } from '../../utils/samples';
import { ProjectData } from '../../types';
import { useI18n } from '../../i18n/context';
import { HeroGlowEffect } from '../HeroGlowEffect';
import { GitHubImportCard } from '../GitHubImportCard';

interface ImportViewProps {
  onImportProject: (project: ProjectData) => void;
  onImportUrl: (url: string) => Promise<void>;
  isLoadingUrl: boolean;
  onSelectSample: (sample: () => ProjectData) => void;
  onShowToast?: (msg: string, type: 'success' | 'error' | 'info' | 'warn') => void;
}

type ImportTab = 'github' | 'zip' | 'url';

export const ImportView: React.FC<ImportViewProps> = ({
  onImportProject,
  onImportUrl,
  isLoadingUrl,
  onSelectSample,
  onShowToast,
}) => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<ImportTab>('github');
  const [urlInput, setUrlInput] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const zipInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const samples = getSampleProjects();

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      onImportUrl(urlInput.trim());
    }
  };

  const handleZipChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const JSZip = (await import('jszip')).default;
      const zip = await JSZip.loadAsync(file);
      const files: Record<string, { content: string | null; bin?: Uint8Array }> = {};
      let fileCount = 0;

      const entries = Object.values(zip.files).filter((f) => !f.dir);
      for (const entry of entries) {
        if (/(__MACOSX|\.DS_Store|node_modules\/|\.git\/)/.test(entry.name)) continue;
        const ext = (entry.name.split('.').pop() || '').toLowerCase();
        const textExts = [
          'html', 'htm', 'css', 'js', 'jsx', 'ts', 'tsx', 'vue', 'svelte', 'json',
          'md', 'txt', 'env', 'example', 'yml', 'yaml', 'xml', 'svg', 'htaccess',
          'gitignore', 'php', 'py', 'rb', 'sql', 'mjs', 'cjs', 'ini', 'sh',
        ];

        if (textExts.includes(ext)) {
          try {
            const txt = await entry.async('string');
            files[entry.name] = { content: txt };
          } catch {
            const bin = await entry.async('uint8array');
            files[entry.name] = { content: null, bin };
          }
        } else {
          try {
            const bin = await entry.async('uint8array');
            files[entry.name] = { content: null, bin };
          } catch {
            // ignore
          }
        }
        fileCount++;
      }

      onImportProject({
        name: file.name.replace(/\.zip$/i, ''),
        source: 'zip',
        files,
        fileCount,
        importedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      alert(`Error reading zip file: ${err.message}`);
    }
  };

  const handleFolderChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const files: Record<string, { content: string | null; bin?: Uint8Array }> = {};
    let fileCount = 0;
    let baseName = 'imported-project';

    const textExts = [
      'html', 'htm', 'css', 'js', 'jsx', 'ts', 'tsx', 'vue', 'svelte', 'json',
      'md', 'txt', 'env', 'example', 'yml', 'yaml', 'xml', 'svg', 'htaccess',
      'gitignore', 'php', 'py', 'rb', 'sql', 'mjs', 'cjs', 'ini', 'sh',
    ];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      let path = file.webkitRelativePath || file.name;
      const parts = path.split('/');
      if (parts.length > 1) {
        if (baseName === 'imported-project') baseName = parts[0];
        path = parts.slice(1).join('/');
      }
      if (!path || /(node_modules\/|\.git\/|\.DS_Store|__MACOSX)/.test(path)) continue;

      const ext = (path.split('.').pop() || '').toLowerCase();
      if (textExts.includes(ext) || file.type.startsWith('text/')) {
        try {
          const txt = await file.text();
          files[path] = { content: txt };
        } catch {
          const bin = new Uint8Array(await file.arrayBuffer());
          files[path] = { content: null, bin };
        }
      } else {
        const bin = new Uint8Array(await file.arrayBuffer());
        files[path] = { content: null, bin };
      }
      fileCount++;
    }

    onImportProject({
      name: baseName,
      source: 'folder',
      files,
      fileCount,
      importedAt: new Date().toISOString(),
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.zip')) {
        if (zipInputRef.current) {
          const dt = new DataTransfer();
          dt.items.add(file);
          zipInputRef.current.files = dt.files;
          handleZipChange({ target: { files: dt.files } } as any);
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Bento Hero Banner */}
      <div className="hero text-center py-8 px-6 rounded-3xl bg-slate-900/50 backdrop-blur-md border border-slate-800/80 relative overflow-hidden shadow-sm">
        <HeroGlowEffect />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none z-0" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            {t('import.badge')}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {t('import.title')}
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto mt-2 leading-relaxed">
            {t('import.subtitle')}
          </p>

          {/* Source Badges */}
          <div className="flex flex-wrap justify-center gap-2 mt-5 text-[11px] font-mono text-slate-400">
            <span className="px-2.5 py-1 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center gap-1">
              <Github className="w-3 h-3 text-white" /> GitHub Direct
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-950/60 border border-slate-800/80">Google AI Studio</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-950/60 border border-slate-800/80">Lovable</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-950/60 border border-slate-800/80">Bolt.new</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-950/60 border border-slate-800/80">Replit</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-950/60 border border-slate-800/80">React / Vite</span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-950/60 border border-slate-800/80">HTML / JS</span>
          </div>
        </div>
      </div>

      {/* Main Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Import Modes (Left 7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Tab Selector Pills */}
          <div className="p-1.5 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 flex items-center gap-1.5 shadow-sm">
            <button
              onClick={() => setActiveTab('github')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'github'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Github className="w-3.5 h-3.5" />
              <span>{t('import.tab_github')}</span>
            </button>

            <button
              onClick={() => setActiveTab('zip')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'zip'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <FileArchive className="w-3.5 h-3.5" />
              <span>{t('import.tab_zip')} / Folder</span>
            </button>

            <button
              onClick={() => setActiveTab('url')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'url'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{t('import.tab_url')}</span>
            </button>
          </div>

          {/* Tab Content: GitHub Direct Import */}
          {activeTab === 'github' && (
            <GitHubImportCard
              onImportProject={onImportProject}
              onShowToast={onShowToast}
            />
          )}

          {/* Tab Content: ZIP / Folder Upload */}
          {activeTab === 'zip' && (
            <div className="p-6 rounded-3xl bg-slate-900/60 backdrop-blur-md border border-slate-800 shadow-sm animate-in fade-in duration-200">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileArchive className="w-4 h-4 text-indigo-400" />
                  {t('import.zip_title')}
                </h2>
              </div>

              {/* Drag & Drop Area */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => zipInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  isDragOver
                    ? 'border-indigo-500 bg-indigo-500/10 scale-[0.99]'
                    : 'border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-950/80'
                }`}
              >
                <UploadCloud className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                <div className="font-semibold text-sm text-white mb-1">
                  {t('import.zip_title')}
                </div>
                <div className="text-xs text-slate-400 mb-4">
                  {t('import.zip_subtitle')}
                </div>

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition-colors">
                  {t('import.zip_browse')}
                </div>
              </div>

              {/* Hidden Inputs */}
              <input
                type="file"
                ref={zipInputRef}
                accept=".zip"
                onChange={handleZipChange}
                className="hidden"
              />
              <input
                type="file"
                ref={folderInputRef}
                {...({ webkitdirectory: '', directory: '', multiple: true } as any)}
                onChange={handleFolderChange}
                className="hidden"
              />

              {/* Folder & Files button */}
              <div className="flex items-center justify-center gap-3 mt-4 pt-3 border-t border-slate-800">
                <button
                  onClick={() => folderInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-200 transition-colors shadow-sm cursor-pointer"
                >
                  <FolderOpen className="w-4 h-4 text-indigo-400" />
                  {t('import.folder_browse')}
                </button>
              </div>
            </div>
          )}

          {/* Tab Content: URL Snapshot */}
          {activeTab === 'url' && (
            <div className="p-6 rounded-3xl bg-slate-900/60 backdrop-blur-md border border-slate-800 shadow-sm animate-in fade-in duration-200">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-400" />
                  {t('import.url_title')}
                </h2>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                {t('import.url_subtitle')}
              </p>

              <form onSubmit={handleUrlSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder={t('import.url_placeholder')}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
                <button
                  type="submit"
                  disabled={isLoadingUrl || !urlInput.trim()}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0 shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  {isLoadingUrl ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{t('import.url_fetching_btn')}</span>
                    </>
                  ) : (
                    <>
                      <span>{t('import.url_fetch_btn')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Preset Sample Projects Bento Card (Right 5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-slate-900/60 backdrop-blur-md border border-slate-800 h-full flex flex-col shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                {t('import.samples_title')}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              {t('import.samples_subtitle')}
            </p>

            <div className="grid grid-cols-1 gap-2.5 flex-1">
              {samples.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => onSelectSample(sample.getProject)}
                  className="w-full p-3.5 rounded-2xl bg-slate-950/50 hover:bg-slate-800/60 border border-slate-800/80 hover:border-slate-700 text-left transition-all group flex items-start gap-3 cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition-transform">
                    {sample.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-xs text-white truncate">{sample.title}</div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {sample.framework}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-normal">
                      {sample.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Capabilities Overview Bento Grid */}
      <div className="p-6 rounded-3xl bg-slate-900/60 backdrop-blur-md border border-slate-800 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          {t('import.features_title')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 space-y-1.5">
            <div className="font-semibold text-white flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {t('import.feat_htaccess_title')}
            </div>
            <p className="text-slate-400 leading-relaxed">
              {t('import.feat_htaccess_desc')}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 space-y-1.5">
            <div className="font-semibold text-white flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {t('import.feat_assets_title')}
            </div>
            <p className="text-slate-400 leading-relaxed">
              {t('import.feat_assets_desc')}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 space-y-1.5">
            <div className="font-semibold text-white flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {t('import.feat_hpanel_title')}
            </div>
            <p className="text-slate-400 leading-relaxed">
              {t('import.feat_hpanel_desc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

