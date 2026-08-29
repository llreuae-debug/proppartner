import React from 'react';
import { PlusCircle, Globe, Menu, X } from 'lucide-react';
import { ProjectData } from '../types';
import { Logo } from './Logo';
import { LanguageSelector } from './LanguageSelector';
import { useI18n } from '../i18n/context';

interface TopbarProps {
  project: ProjectData | null;
  statusLabel: string;
  onReset: () => void;
  isMobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  project,
  statusLabel,
  onReset,
  isMobileMenuOpen,
  onToggleMobileMenu,
}) => {
  const { t } = useI18n();

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-3 sm:px-5 flex items-center justify-between z-20 shrink-0">
      <div className="flex items-center gap-2.5 sm:gap-3">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}
        <Logo size="md" />
        <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-400 font-mono border-l border-slate-800 pl-3 ml-1">
          <Globe className="w-3.5 h-3.5 text-indigo-400" />
          {t('brand.tagline')}
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-2.5">
        <div className="hidden xs:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-slate-900 border border-slate-800 text-slate-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
          <span>{statusLabel}</span>
        </div>

        <LanguageSelector />

        {project && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition-colors shadow-sm"
            title={t('topbar.new_project')}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('topbar.new_project')}</span>
          </button>
        )}
      </div>
    </header>
  );
};


