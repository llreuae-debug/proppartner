import React from 'react';
import { X, Sparkles, Server, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { AiAuditResult } from '../types';

interface AiAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  audit: AiAuditResult | null;
  isLoading: boolean;
}

export const AiAuditModal: React.FC<AiAuditModalProps> = ({
  isOpen,
  onClose,
  audit,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl w-full max-w-3xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden shadow-indigo-500/10">
        {/* Modal Header */}
        <div className="h-16 border-b border-slate-800 px-6 flex items-center justify-between bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <div className="font-bold text-sm text-white flex items-center gap-2">
                Hostinger Architecture Audit
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  AI Powered
                </span>
              </div>
              <div className="text-xs text-slate-400">Custom infrastructure guidance for Hostinger deployment</div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
              <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
              <div className="text-sm font-semibold text-white">Analyzing stack with Gemini 3.7 Flash...</div>
              <div className="text-xs text-slate-400 max-w-sm">
                Evaluating database drivers, routing strategies, and Hostinger runtime optimization rules.
              </div>
            </div>
          ) : audit ? (
            <>
              {/* Recommended Plan */}
              <div className="p-5 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1 font-mono">
                  <Server className="w-4 h-4 text-indigo-400" />
                  Recommended Hostinger Tier
                </div>
                <div className="text-lg font-extrabold text-white mb-1">
                  {audit.recommendedHostingerPlan}
                </div>
                <div className="text-xs text-slate-300 leading-relaxed">{audit.hostingerPlanReason}</div>
              </div>

              {/* Crucial Steps */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-3">
                  Optimal hPanel Deployment Workflow
                </h4>
                <div className="space-y-2">
                  {audit.crucialSteps.map((step, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-200"
                    >
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold font-mono shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pitfalls & Security Notes */}
              {audit.potentialPitfalls && audit.potentialPitfalls.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono mb-3 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Hostinger Production Watchouts
                  </h4>
                  <div className="space-y-2">
                    {audit.potentialPitfalls.map((pitfall, i) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-slate-200 leading-relaxed"
                      >
                        • {pitfall}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Htaccess Tip */}
              {audit.recommendedHtaccessNotes && (
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
                  <div className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Server Routing &amp; .htaccess Strategy
                  </div>
                  {audit.recommendedHtaccessNotes}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              No audit report available. Please rerun AI Audit.
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-600/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
