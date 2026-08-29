import React from 'react';
import {
  Cpu,
  ArrowLeft,
  FolderTree,
  KeyRound,
  Package,
} from 'lucide-react';
import { AnalysisResult, DeploymentMode, EnvVariableConfig, ProjectData } from '../../types';
import { autoSelectMode } from '../../utils/packager';
import { useI18n } from '../../i18n/context';

interface BuildViewProps {
  project: ProjectData;
  analysis: AnalysisResult;
  buildMode: DeploymentMode;
  onSelectMode: (mode: DeploymentMode) => void;
  envVars: EnvVariableConfig[];
  onUpdateEnvVar: (index: number, value: string) => void;
  onBuild: () => Promise<void>;
  isBuilding: boolean;
  onPrev: () => void;
}

export const BuildView: React.FC<BuildViewProps> = ({
  project,
  analysis,
  buildMode,
  onSelectMode,
  envVars,
  onUpdateEnvVar,
  onBuild,
  isBuilding,
  onPrev,
}) => {
  const { t } = useI18n();
  const recommendedMode = autoSelectMode(analysis);
  const effectiveMode = buildMode === 'auto' ? recommendedMode : buildMode;

  const modeOptions: { id: DeploymentMode; title: string; desc: string; icon: string }[] = [
    {
      id: 'static',
      title: 'Static Web Hosting',
      icon: '📄',
      desc: 'Deploy to public_html/ for React, Vue, Svelte, Vite, and Static HTML sites.',
    },
    {
      id: 'node',
      title: 'Node.js Runtime',
      icon: '⬢',
      desc: 'Deploy to app/ with Node.js process manager (Express, Fastify, Next.js).',
    },
    {
      id: 'php',
      title: 'PHP & MySQL Hosting',
      icon: '🐘',
      desc: 'Deploy to public_html/ with native index.php and PDO database integration.',
    },
    {
      id: 'fullstack',
      title: 'Full-Stack Separated',
      icon: '◈',
      desc: 'Static client in public_html/ + Node.js background API in app/.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-indigo-400" />
            {t('build.title')}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Target Hostinger infrastructure: <strong className="text-indigo-300 font-mono">{effectiveMode.toUpperCase()}</strong>
          </p>
        </div>
      </div>

      {/* Deployment Mode Selection Bento Grid */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
          {t('build.mode_title')}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {modeOptions.map((opt) => {
            const isSelected = effectiveMode === opt.id;
            const isRec = recommendedMode === opt.id;

            return (
              <div
                key={opt.id}
                onClick={() => onSelectMode(opt.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-indigo-600/15 border-indigo-500 shadow-md shadow-indigo-500/10'
                    : 'bg-slate-900/60 backdrop-blur-md border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{opt.icon}</span>
                    <span className="font-bold text-xs text-white">{opt.title}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isRec && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        RECOMMENDED
                      </span>
                    )}
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{opt.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Environment Variables Bento Card */}
      <div className="p-6 rounded-3xl bg-slate-900/60 backdrop-blur-md border border-slate-800 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
              <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
              {t('build.env_title')} ({envVars.length})
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              These will be structured into <code className="text-slate-200 font-mono">.env.example</code> for your Hostinger hPanel setup.
            </p>
          </div>
        </div>

        {envVars.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500 border border-slate-800/80 rounded-2xl bg-slate-950/40">
            No environment variables required for this project.
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {envVars.map((v, idx) => (
              <div
                key={v.name}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-mono"
              >
                <span className="text-indigo-300 font-semibold w-1/3 truncate">{v.name}</span>
                <input
                  type="text"
                  placeholder="e.g. your-api-key (optional preview value)"
                  value={v.value}
                  onChange={(e) => onUpdateEnvVar(idx, e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-[11px]"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Package Structure Preview Bento Card */}
      <div className="p-6 rounded-3xl bg-slate-900/60 backdrop-blur-md border border-slate-800 space-y-3 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-2">
          <FolderTree className="w-3.5 h-3.5 text-indigo-400" />
          {t('build.output_title')}
        </h3>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
          {effectiveMode === 'static' ? (
            <div>
              <span className="text-indigo-400 font-bold">public_html/</span>
              <br />
              &nbsp;&nbsp;├── index.html
              <br />
              &nbsp;&nbsp;├── .htaccess <span className="text-slate-500"># SPA routing & compression</span>
              <br />
              &nbsp;&nbsp;├── favicon.svg <span className="text-slate-500"># Brand asset</span>
              <br />
              &nbsp;&nbsp;├── robots.txt &amp; sitemap.xml <span className="text-slate-500"># SEO directives</span>
              <br />
              &nbsp;&nbsp;└── assets/ <span className="text-slate-500"># Bundled styles, scripts, images</span>
              <br />
              <span className="text-emerald-400">HOSTINGER_DEPLOYMENT.md</span> <span className="text-slate-500"># Step-by-step guide</span>
              <br />
              <span className="text-amber-400">conversion-report.html</span> <span className="text-slate-500"># Interactive audit summary</span>
              <br />
              {envVars.length > 0 && <span>.env.example</span>}
            </div>
          ) : effectiveMode === 'node' ? (
            <div>
              <span className="text-indigo-400 font-bold">app/</span>
              <br />
              &nbsp;&nbsp;├── package.json <span className="text-slate-500"># Start scripts & Node engine</span>
              <br />
              &nbsp;&nbsp;├── server.js / index.js
              <br />
              &nbsp;&nbsp;├── .env.example
              <br />
              &nbsp;&nbsp;└── src/ &amp; public/
              <br />
              <span className="text-emerald-400">HOSTINGER_DEPLOYMENT.md</span>
              <br />
              <span className="text-amber-400">conversion-report.html</span>
            </div>
          ) : (
            <div>
              <span className="text-indigo-400 font-bold">public_html/</span>
              <br />
              &nbsp;&nbsp;├── index.php <span className="text-slate-500"># Main application</span>
              <br />
              &nbsp;&nbsp;├── config.php <span className="text-slate-500"># MySQL PDO connection</span>
              <br />
              &nbsp;&nbsp;└── .htaccess
              <br />
              <span className="text-emerald-400">HOSTINGER_DEPLOYMENT.md</span>
              <br />
              {analysis.database && <span>database-migration/ <span className="text-slate-500"># SQL schema</span></span>}
            </div>
          )}
        </div>
      </div>

      {/* Build CTA Bento Card */}
      <div className="p-6 rounded-3xl bg-slate-900/80 backdrop-blur-md border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md shadow-indigo-500/10">
        <div>
          <div className="font-extrabold text-sm text-white mb-1">
            Ready to Generate Hostinger Package
          </div>
          <div className="text-xs text-slate-400">
            Produces a self-contained, validated <code className="text-indigo-300 font-mono">website-hostinger-ready.zip</code> archive.
          </div>
        </div>

        <button
          onClick={onBuild}
          disabled={isBuilding}
          className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-95 text-white disabled:opacity-50 transition-all shadow-xl shadow-indigo-600/25 shrink-0"
        >
          {isBuilding ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>{t('build.btn_packaging')}</span>
            </>
          ) : (
            <>
              <Package className="w-4 h-4" />
              <span>{t('build.btn_package')}</span>
            </>
          )}
        </button>
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
      </div>
    </div>
  );
};

