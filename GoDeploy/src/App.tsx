import React, { useState, useEffect } from 'react';
import { Topbar } from './components/Topbar';
import { Sidebar } from './components/Sidebar';
import { ToastContainer, ToastMessage } from './components/ToastContainer';
import { FileInspectorModal } from './components/FileInspectorModal';
import { AiAuditModal } from './components/AiAuditModal';
import { AiHostingerTierAuditModal } from './components/AiHostingerTierAuditModal';

import { ImportView } from './components/views/ImportView';
import { AnalyzeView } from './components/views/AnalyzeView';
import { RepairView } from './components/views/RepairView';
import { BuildView } from './components/views/BuildView';
import { ValidateView } from './components/views/ValidateView';
import { DownloadView } from './components/views/DownloadView';
import { PreviewView } from './components/views/PreviewView';
import { HistoryView } from './components/views/HistoryView';

import {
  AiAuditResult,
  AnalysisResult,
  AppliedFix,
  BuiltPackageResult,
  DeploymentMode,
  EnvVariableConfig,
  HistoryItem,
  ProjectData,
  ViewKey,
  ValidationResult,
} from './types';
import { analyzeProject } from './utils/analyzer';
import { runFixEngine, runDeepAiRepairPass } from './utils/fixEngine';
import { autoSelectMode, buildHostingerPackage } from './utils/packager';
import { runValidationChecks } from './utils/validator';

const STEPS_ORDER: ViewKey[] = ['import', 'analyze', 'repair', 'build', 'validate', 'download', 'preview'];

export default function App() {
  // Main Navigation State
  const [currentView, setCurrentView] = useState<ViewKey>('import');
  const [maxStepIndex, setMaxStepIndex] = useState<number>(0);

  // Core Pipeline State
  const [project, setProject] = useState<ProjectData | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [fixes, setFixes] = useState<AppliedFix[]>([]);
  const [buildMode, setBuildMode] = useState<DeploymentMode>('auto');
  const [envVars, setEnvVars] = useState<EnvVariableConfig[]>([]);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [packageBlob, setPackageBlob] = useState<BuiltPackageResult | null>(null);

  // History & Toast State
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Async & Modal States
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [isAiRepairing, setIsAiRepairing] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [isAiAuditing, setIsAiAuditing] = useState(false);
  const [aiAuditResult, setAiAuditResult] = useState<AiAuditResult | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isTierAuditModalOpen, setIsTierAuditModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Load history from localStorage on initial render
  useEffect(() => {
    try {
      const saved = localStorage.getItem('godeploy_history') || localStorage.getItem('website2host_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const addToast = (text: string, type: 'success' | 'warn' | 'error' | 'info' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Pipeline Import Handler
  const handleImportProject = (importedProject: ProjectData) => {
    setProject(importedProject);
    const analyzed = analyzeProject(importedProject);
    setAnalysis(analyzed);

    const initialFixes = runFixEngine(importedProject, analyzed);
    setFixes(initialFixes);

    const selectedMode = autoSelectMode(analyzed);
    setBuildMode(selectedMode);

    setEnvVars(analyzed.environmentVariables.map((name) => ({ name, value: '' })));
    setValidation(null);
    setPackageBlob(null);

    setMaxStepIndex(1); // can access analyze
    setCurrentView('analyze');
    addToast(
      `Imported ${importedProject.fileCount} files • Detected ${analyzed.framework}`,
      'success'
    );
  };

  // URL Snapshot Import
  const handleImportUrl = async (url: string) => {
    setIsLoadingUrl(true);
    try {
      let htmlContent = '';
      let originUrl = url;

      // Try server proxy first
      try {
        const res = await fetch('/api/proxy-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        });
        if (res.ok) {
          const data = await res.json();
          htmlContent = data.content;
          originUrl = data.url;
        }
      } catch {
        // fallback
      }

      // If server proxy failed or was unavailable, try direct public CORS proxies
      if (!htmlContent) {
        const proxies = [
          url,
          `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
          `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
        ];

        for (const proxy of proxies) {
          try {
            const resp = await fetch(proxy);
            if (resp.ok) {
              const text = await resp.text();
              if (text && text.length > 50) {
                htmlContent = text;
                break;
              }
            }
          } catch {
            // continue
          }
        }
      }

      if (!htmlContent) {
        throw new Error('Unable to fetch website HTML. Please upload the project source ZIP archive instead.');
      }

      let parsedName = 'website-snapshot';
      try {
        parsedName = new URL(originUrl).hostname.replace(/www\./i, '');
      } catch {
        // ignore
      }

      const files: Record<string, { content: string | null; bin?: Uint8Array }> = {
        'index.html': { content: htmlContent },
        'HOSTINGER-SNAPSHOT-NOTE.md': {
          content: `# Website Snapshot Import Note\n\nThis project was captured as a client DOM snapshot of ${originUrl}.\n\nFor full backend, API routes, and source compilation, upload the source .zip file.\n`,
        },
      };

      handleImportProject({
        name: parsedName,
        source: 'url-snapshot',
        files,
        fileCount: 2,
        originUrl,
        importedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      addToast(err.message || 'Failed to import URL', 'error');
    } finally {
      setIsLoadingUrl(false);
    }
  };

  // Run Deep AI Repair Pass
  const handleRunDeepAiRepair = async () => {
    if (!project || !analysis) return;
    setIsAiRepairing(true);
    addToast('Executing deep code normalization and Hostinger engine audit...', 'info');

    await new Promise((r) => setTimeout(r, 600));

    const extra = runDeepAiRepairPass(project, analysis);
    setFixes((prev) => [...prev, ...extra]);
    setIsAiRepairing(false);
    addToast(`Deep repair complete • ${extra.length} additional improvements added`, 'success');
  };

  // Run AI Architecture Audit via Gemini
  const handleRunAiAudit = async () => {
    if (!project || !analysis) return;
    setIsAiAuditing(true);
    setIsAuditModalOpen(true);

    try {
      const res = await fetch('/api/ai-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectSummary: {
            name: project.name,
            framework: analysis.framework,
            language: analysis.language,
            frontend: analysis.frontend,
            backend: analysis.backend,
            database: analysis.database,
            hasBuildOutput: analysis.hasBuildOutput,
            buildOutputDir: analysis.buildOutputDir,
            environmentVariables: analysis.environmentVariables,
            externalServices: analysis.externalServices,
            routing: analysis.routing,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiAuditResult(data.audit);
      } else {
        // Fallback local expert audit if server endpoint returns error
        setAiAuditResult({
          recommendedHostingerPlan: analysis.backend ? 'Cloud Startup / Node.js' : 'Shared Web Hosting',
          hostingerPlanReason: `For ${analysis.framework}, ${
            analysis.backend
              ? 'Hostinger Cloud or Node.js runtime provides dedicated resources for your backend process.'
              : 'Hostinger Shared Hosting with LiteSpeed web server delivers optimal static delivery with low latency.'
          }`,
          crucialSteps: [
            'Upload the generated website-hostinger-ready.zip to public_html in File Manager',
            'Extract archive files directly into public_html',
            'Verify that .htaccess is active to handle client-side routing and Gzip compression',
            'Configure any needed environment variables in .env',
            'Enable free SSL certificate under Security in hPanel',
          ],
          potentialPitfalls: [
            'Ensure index.html is in public_html root, not inside a nested subfolder',
            'If using Node.js, ensure your server listens on process.env.PORT',
          ],
          recommendedHtaccessNotes:
            'Use the generated .htaccess for SPA routing fallback to index.html and browser asset caching.',
        });
      }
    } catch {
      setAiAuditResult({
        recommendedHostingerPlan: analysis.backend ? 'Hostinger Node.js Hosting' : 'Hostinger Shared Hosting',
        hostingerPlanReason: `Optimized configuration for ${analysis.framework}.`,
        crucialSteps: [
          'Upload website-hostinger-ready.zip into public_html',
          'Extract all contents and check index.html placement',
          'Verify .htaccess rewrite rules in hPanel',
          'Activate Let\'s Encrypt SSL for your domain',
        ],
        potentialPitfalls: [
          'Ensure database credentials match your Hostinger MySQL database in hPanel',
        ],
      });
    } finally {
      setIsAiAuditing(false);
    }
  };

  // Handle completion of AI Hostinger Tier Audit with 100% Score
  const handleTierAuditCompleted = (
    updatedProject: ProjectData,
    newAnalysis: AnalysisResult,
    newValidation: ValidationResult,
    newFixes: AppliedFix[]
  ) => {
    setProject(updatedProject);
    setAnalysis(newAnalysis);
    setValidation(newValidation);
    setFixes(newFixes);
    setMaxStepIndex((prev) => Math.max(prev, 4));
    addToast('Target Achieved: 100% Hostinger Tier Compatibility Certified!', 'success');
  };

  // Build Hostinger Package
  const handleBuild = async () => {
    if (!project || !analysis) return;
    setIsBuilding(true);
    addToast('Compiling Hostinger deployment package...', 'info');

    try {
      const pkg = await buildHostingerPackage(project, analysis, buildMode, envVars, fixes);
      setPackageBlob(pkg);

      const val = runValidationChecks(project, analysis);
      setValidation(val);

      setMaxStepIndex(5); // unlocked up to download/preview
      setCurrentView('validate');
      addToast(`Package built successfully (${(pkg.size / 1024).toFixed(1)} KB) • ${val.score}% Ready`, 'success');
    } catch (err: any) {
      addToast(`Build error: ${err.message}`, 'error');
    } finally {
      setIsBuilding(false);
    }
  };

  // Download Package ZIP
  const handleDownloadZip = () => {
    if (!packageBlob) return;
    const url = URL.createObjectURL(packageBlob.blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = packageBlob.name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    addToast('Download started', 'success');
  };

  // Download Conversion Report HTML
  const handleDownloadReport = async () => {
    if (!project || !analysis) return;
    try {
      const { generateConversionReportHtml } = await import('./utils/packager');
      const htmlContent = generateConversionReportHtml(
        project,
        analysis,
        fixes,
        packageBlob?.mode || buildMode
      );
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${project.name}-godeploy-report.html`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      addToast('Detailed conversion report downloaded', 'success');
    } catch (err: any) {
      addToast(`Failed to generate report: ${err.message}`, 'error');
    }
  };

  // Copy Deployment Instructions
  const handleCopyInstructions = async () => {
    if (!project || !analysis) return;
    const text = `# Hostinger Deployment Guide for ${project.name} (via GoDeploy)
Framework: ${analysis.framework}
Compatibility Score: ${validation?.score || analysis.score}%
Mode: ${buildMode.toUpperCase()}

## Steps
1. Log in to Hostinger hPanel -> File Manager
2. Open public_html
3. Upload and extract website-hostinger-ready.zip
4. Ensure index.html and .htaccess are in public_html
5. Activate SSL in hPanel
`;
    try {
      await navigator.clipboard.writeText(text);
      addToast('Deployment guide copied to clipboard', 'success');
    } catch {
      addToast('Clipboard write failed', 'warn');
    }
  };

  // Save to Local History
  const handleSaveHistory = () => {
    if (!project || !analysis) return;
    const item: HistoryItem = {
      id: `hist-${Date.now()}`,
      name: project.name,
      source: project.source,
      framework: analysis.framework,
      score: validation?.score || analysis.score,
      mode: packageBlob?.mode || buildMode,
      fileCount: project.fileCount,
      date: new Date().toLocaleDateString(),
    };

    const updated = [item, ...history.filter((h) => h.name !== project.name)].slice(0, 25);
    setHistory(updated);
    localStorage.setItem('godeploy_history', JSON.stringify(updated));
    addToast('Saved conversion to workspace history', 'success');
    setCurrentView('history');
  };

  const handleDeleteHistoryItem = (id: string) => {
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    localStorage.setItem('godeploy_history', JSON.stringify(updated));
    addToast('Removed from history', 'info');
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('godeploy_history');
    localStorage.removeItem('website2host_history');
    addToast('History cleared', 'info');
  };

  // Reset Pipeline
  const handleResetProject = () => {
    setProject(null);
    setAnalysis(null);
    setFixes([]);
    setValidation(null);
    setPackageBlob(null);
    setEnvVars([]);
    setMaxStepIndex(0);
    setCurrentView('import');
    addToast('Reset workspace', 'info');
  };

  const statusLabel = !project
    ? 'Ready'
    : packageBlob
    ? 'Package Ready'
    : validation
    ? 'Validated'
    : analysis
    ? `${analysis.score}% Fit`
    : 'Imported';

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Header */}
      <Topbar
        project={project}
        statusLabel={statusLabel}
        onReset={handleResetProject}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Main App Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop Navigation Sidebar */}
        <Sidebar
          className="hidden md:flex"
          currentView={currentView}
          onSelectView={(v) => setCurrentView(v)}
          maxReachedStepIndex={maxStepIndex}
        />

        {/* Mobile Slide-over Drawer Backdrop */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 top-14 bg-slate-950/80 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div
              className="w-64 h-full bg-slate-950 border-r border-slate-800 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Sidebar
                className="w-full h-full border-r-0"
                currentView={currentView}
                onSelectView={(v) => {
                  setCurrentView(v);
                  setIsMobileMenuOpen(false);
                }}
                onClose={() => setIsMobileMenuOpen(false)}
                maxReachedStepIndex={maxStepIndex}
              />
            </div>
          </div>
        )}

        {/* Dynamic Center Stage */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/60 via-slate-950 to-slate-950">
          <div className="max-w-5xl mx-auto pb-12 animate-in fade-in duration-200">
            {currentView === 'import' && (
              <ImportView
                onImportProject={handleImportProject}
                onImportUrl={handleImportUrl}
                isLoadingUrl={isLoadingUrl}
                onSelectSample={(getSample) => handleImportProject(getSample())}
                onShowToast={addToast}
              />
            )}

            {currentView === 'analyze' && project && analysis && (
              <AnalyzeView
                project={project}
                analysis={analysis}
                onNext={() => {
                  setMaxStepIndex((prev) => Math.max(prev, 2));
                  setCurrentView('repair');
                }}
                onOpenInspector={() => setIsInspectorOpen(true)}
                onRunAiAudit={() => setIsTierAuditModalOpen(true)}
              />
            )}

            {currentView === 'repair' && project && analysis && (
              <RepairView
                project={project}
                fixes={fixes}
                onRunDeepAiRepair={() => setIsTierAuditModalOpen(true)}
                isAiRepairing={isAiRepairing}
                onNext={() => {
                  setMaxStepIndex((prev) => Math.max(prev, 3));
                  setCurrentView('build');
                }}
                onPrev={() => setCurrentView('analyze')}
              />
            )}

            {currentView === 'build' && project && analysis && (
              <BuildView
                project={project}
                analysis={analysis}
                buildMode={buildMode}
                onSelectMode={(mode) => setBuildMode(mode)}
                envVars={envVars}
                onUpdateEnvVar={(idx, val) => {
                  const copy = [...envVars];
                  copy[idx].value = val;
                  setEnvVars(copy);
                }}
                onBuild={handleBuild}
                isBuilding={isBuilding}
                onPrev={() => setCurrentView('repair')}
              />
            )}

            {currentView === 'validate' && validation && (
              <ValidateView
                validation={validation}
                onNext={() => {
                  setMaxStepIndex((prev) => Math.max(prev, 5));
                  setCurrentView('download');
                }}
                onPrev={() => setCurrentView('build')}
              />
            )}

            {currentView === 'download' && project && analysis && (
              <DownloadView
                project={project}
                analysis={analysis}
                packageBlob={packageBlob}
                envVars={envVars}
                onDownloadZip={handleDownloadZip}
                onDownloadReport={handleDownloadReport}
                onCopyInstructions={handleCopyInstructions}
                onNext={() => {
                  setMaxStepIndex((prev) => Math.max(prev, 6));
                  setCurrentView('preview');
                }}
                onPrev={() => setCurrentView('validate')}
              />
            )}

            {currentView === 'preview' && project && analysis && (
              <PreviewView
                project={project}
                analysis={analysis}
                onSaveHistory={handleSaveHistory}
                onDownloadZip={handleDownloadZip}
                onPrev={() => setCurrentView('download')}
              />
            )}

            {currentView === 'history' && (
              <HistoryView
                history={history}
                onDeleteHistoryItem={handleDeleteHistoryItem}
                onClearHistory={handleClearHistory}
                onNewConversion={() => setCurrentView('import')}
              />
            )}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      {project && (
        <FileInspectorModal
          isOpen={isInspectorOpen}
          onClose={() => setIsInspectorOpen(false)}
          files={project.files}
          projectName={project.name}
        />
      )}

      {project && analysis && (
        <AiHostingerTierAuditModal
          isOpen={isTierAuditModalOpen}
          onClose={() => setIsTierAuditModalOpen(false)}
          project={project}
          analysis={analysis}
          onAuditCompleted={handleTierAuditCompleted}
          onNavigateToTab={(tab) => {
            setIsTierAuditModalOpen(false);
            if (tab === 'repair') {
              setMaxStepIndex((prev) => Math.max(prev, 2));
              setCurrentView('repair');
            } else if (tab === 'build') {
              setMaxStepIndex((prev) => Math.max(prev, 3));
              setCurrentView('build');
            } else if (tab === 'validate') {
              setMaxStepIndex((prev) => Math.max(prev, 4));
              setCurrentView('validate');
            }
          }}
        />
      )}

      <AiAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        audit={aiAuditResult}
        isLoading={isAiAuditing}
      />

      {/* Toast Overlay */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
