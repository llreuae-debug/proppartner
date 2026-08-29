import React from 'react';
import {
  History,
  Trash2,
  Calendar,
  Folder,
} from 'lucide-react';
import { HistoryItem } from '../../types';
import { useI18n } from '../../i18n/context';

interface HistoryViewProps {
  history: HistoryItem[];
  onDeleteHistoryItem: (id: string) => void;
  onClearHistory: () => void;
  onNewConversion: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onDeleteHistoryItem,
  onClearHistory,
  onNewConversion,
}) => {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2.5">
            <History className="w-5 h-5 text-indigo-400" />
            {t('history.title')}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t('history.subtitle')}
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors shadow-sm"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t('history.btn_clear')}</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/60 backdrop-blur-md border border-slate-800 flex flex-col items-center justify-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-slate-500">
            <History className="w-6 h-6" />
          </div>
          <div className="font-semibold text-sm text-white">{t('history.empty_title')}</div>
          <p className="text-xs text-slate-400 max-w-sm">
            {t('history.empty_desc')}
          </p>
          <button
            onClick={onNewConversion}
            className="mt-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-600/20"
          >
            {t('history.btn_start_new')}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-3xl bg-slate-900/60 backdrop-blur-md border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 font-bold font-mono text-sm">
                  {item.score}%
                </div>

                <div className="min-w-0">
                  <div className="font-semibold text-xs text-white truncate flex items-center gap-2">
                    <span>{item.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                      {item.framework}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-slate-800 text-slate-400 border border-slate-700 uppercase">
                      {item.mode}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 font-mono">
                    <span className="flex items-center gap-1">
                      <Folder className="w-3 h-3 text-slate-500" />
                      {item.fileCount} files
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {item.date}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onDeleteHistoryItem(item.id)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Delete record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

