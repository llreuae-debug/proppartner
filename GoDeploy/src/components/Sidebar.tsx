import React from 'react';
import {
  UploadCloud,
  Activity,
  Wrench,
  Cpu,
  CheckCircle2,
  DownloadCloud,
  Eye,
  History,
  Check,
} from 'lucide-react';
import { ViewKey } from '../types';
import { useI18n } from '../i18n/context';

interface SidebarProps {
  currentView: ViewKey;
  onSelectView: (view: ViewKey) => void;
  maxReachedStepIndex: number;
  className?: string;
  onClose?: () => void;
}

interface NavStep {
  key: ViewKey;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  stepNum?: number;
}

const WORKFLOW_STEPS: NavStep[] = [
  { key: 'import', labelKey: 'sidebar.step.import', icon: UploadCloud, stepNum: 1 },
  { key: 'analyze', labelKey: 'sidebar.step.analyze', icon: Activity, stepNum: 2 },
  { key: 'repair', labelKey: 'sidebar.step.repair', icon: Wrench, stepNum: 3 },
  { key: 'build', labelKey: 'sidebar.step.build', icon: Cpu, stepNum: 4 },
  { key: 'validate', labelKey: 'sidebar.step.validate', icon: CheckCircle2, stepNum: 5 },
  { key: 'download', labelKey: 'sidebar.step.download', icon: DownloadCloud, stepNum: 6 },
  { key: 'preview', labelKey: 'sidebar.step.preview', icon: Eye, stepNum: 7 },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  maxReachedStepIndex,
  className = '',
  onClose,
}) => {
  const { t } = useI18n();

  const handleStepClick = (key: ViewKey) => {
    onSelectView(key);
    if (onClose) onClose();
  };

  return (
    <aside className={`w-64 md:w-60 border-r border-slate-800 bg-slate-950/95 md:bg-slate-950/70 backdrop-blur-md p-3.5 flex flex-col gap-1 overflow-y-auto shrink-0 select-none ${className}`}>
      <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold px-3 pt-2 pb-2 font-mono">
        {t('sidebar.pipeline')}
      </div>

      <nav className="flex flex-col gap-1.5">
        {WORKFLOW_STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isActive = currentView === step.key;
          const isDone = idx < maxReachedStepIndex;
          const isAvailable = idx <= maxReachedStepIndex;

          return (
            <button
              key={step.key}
              disabled={!isAvailable}
              onClick={() => handleStepClick(step.key)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left relative border ${
                isActive
                  ? 'bg-indigo-600/15 text-white border-indigo-500/40 shadow-sm shadow-indigo-500/10 font-semibold'
                  : isAvailable
                  ? 'text-slate-300 hover:text-white hover:bg-slate-900/80 border-transparent hover:border-slate-800'
                  : 'text-slate-600 cursor-not-allowed border-transparent'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-indigo-400' : isDone ? 'text-emerald-400' : 'text-current'
                }`}
              />
              <span className="truncate">{t(step.labelKey)}</span>

              <span
                className={`ml-auto w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : isDone
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : isAvailable
                    ? 'bg-slate-800 text-slate-400'
                    : 'bg-slate-900 text-slate-700'
                }`}
              >
                {isDone ? <Check className="w-3 h-3 stroke-[2.5]" /> : step.stepNum}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold px-3 pt-5 pb-2 font-mono">
        {t('sidebar.workspace')}
      </div>

      <nav className="flex flex-col gap-1.5">
        <button
          onClick={() => handleStepClick('history')}
          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left border ${
            currentView === 'history'
              ? 'bg-indigo-600/15 text-white border-indigo-500/40'
              : 'text-slate-300 hover:text-white hover:bg-slate-900/80 border-transparent hover:border-slate-800'
          }`}
        >
          <History className="w-4 h-4 text-slate-400 shrink-0" />
          <span>{t('sidebar.step.history')}</span>
        </button>
      </nav>

      <div className="mt-auto pt-6 px-1">
        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 shadow-sm">
          <div className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            {t('sidebar.ready_badge')}
          </div>
          {t('sidebar.ready_desc')}
        </div>
      </div>
    </aside>
  );
};

