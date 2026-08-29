import React, { useState, useMemo, useRef } from 'react';
import {
  Monitor,
  Tablet,
  Smartphone,
  RotateCw,
  ShieldCheck,
  DownloadCloud,
  BookmarkPlus,
  ArrowLeft,
  Eye,
  Layers,
  ExternalLink,
  SmartphoneNfc,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Wifi,
  Battery,
} from 'lucide-react';
import { AnalysisResult, ProjectData } from '../../types';
import { useI18n } from '../../i18n/context';

interface PreviewViewProps {
  project: ProjectData;
  analysis: AnalysisResult;
  onSaveHistory: () => void;
  onDownloadZip: () => void;
  onPrev: () => void;
}

type DeviceMode = 'desktop' | 'tablet' | 'mobile';
type Orientation = 'portrait' | 'landscape';

export const PreviewView: React.FC<PreviewViewProps> = ({
  project,
  analysis,
  onSaveHistory,
  onDownloadZip,
  onPrev,
}) => {
  const { t } = useI18n();
  const [device, setDevice] = useState<DeviceMode>('desktop');
  const [orientation, setOrientation] = useState<Orientation>('portrait');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [refreshKey, setRefreshKey] = useState(0);

  // Generate self-contained HTML srcdoc with responsive viewport and styling injection
  const srcDocContent = useMemo(() => {
    const files = project.files;
    const htmlFile =
      files['index.html'] ||
      files['public_html/index.html'] ||
      files['dist/index.html'] ||
      files['build/index.html'];

    let html = htmlFile?.content || '';

    // If html content is missing or root element is empty with no bundled scripts, provide a rich fallback
    if (!html || html.trim().length === 0) {
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #09090f;
      color: #f1f5f9;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      text-align: center;
    }
    .card {
      max-width: 460px;
      background: rgba(30, 41, 59, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 32px 24px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      background: rgba(99, 102, 241, 0.2);
      border: 1px solid rgba(99, 102, 241, 0.4);
      color: #818cf8;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 16px;
    }
    h2 { font-size: 20px; font-weight: 700; margin-bottom: 8px; }
    p { font-size: 13px; color: #94a3b8; line-height: 1.6; margin-bottom: 20px; }
    .btn {
      display: inline-block;
      background: #4f46e5;
      color: #fff;
      font-weight: 600;
      font-size: 13px;
      padding: 10px 20px;
      border-radius: 12px;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">⚡ Hostinger Package Ready</div>
    <h2>${project.name || 'Application Workspace'}</h2>
    <p>Framework detected: <strong>${analysis.framework}</strong>. Production deployment bundle and static fallbacks are ready for upload.</p>
    <a href="#" class="btn">Ready for Hostinger</a>
  </div>
</body>
</html>`;
    }

    // 1. Ensure viewport meta tag exists
    if (!html.includes('<meta name="viewport"')) {
      const viewportTag = '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">';
      if (html.includes('<head>')) {
        html = html.replace('<head>', `<head>\n  ${viewportTag}`);
      } else if (html.includes('<head ')) {
        html = html.replace(/<head[^>]*>/, `$& \n  ${viewportTag}`);
      } else {
        html = `${viewportTag}\n${html}`;
      }
    }

    // 2. Inline CSS stylesheets from project files
    html = html.replace(/<link[^>]*href=["']([^"']+\.css)["'][^>]*>/gi, (match, cssPath) => {
      const cleanPath = cssPath.replace(/^\.\//, '').replace(/^\//, '');
      const foundEntry = Object.entries(files).find(
        ([p]) => p === cleanPath || p.endsWith(`/${cleanPath}`) || p.endsWith(cleanPath)
      );
      const fileData = foundEntry ? (foundEntry[1] as { content: string | null; bin?: Uint8Array }) : undefined;
      if (fileData && fileData.content) {
        return `<style>\n/* Inlined: ${cleanPath} */\n${fileData.content}\n</style>`;
      }
      return match;
    });

    // 3. Inject responsive container reset styles to ensure flawless rendering across mobile & tablet frames
    const responsiveHelperCss = `
<style id="godeploy-responsive-injector">
  /* Responsive device frame sandbox normalization */
  html, body {
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow-x: hidden !important;
    -webkit-text-size-adjust: 100%;
    box-sizing: border-box;
  }
  *, *::before, *::after {
    box-sizing: border-box;
  }
  img, video, canvas, svg, iframe {
    max-width: 100% !important;
    height: auto;
  }
</style>
`;

    if (html.includes('</head>')) {
      html = html.replace('</head>', `${responsiveHelperCss}\n</head>`);
    } else {
      html = `${responsiveHelperCss}\n${html}`;
    }

    return html;
  }, [project.files, project.name, analysis.framework, refreshKey]);

  // Handle external popout preview in new browser tab
  const handleOpenNewTab = () => {
    const blob = new Blob([srcDocContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  // Calculate Frame Dimensions based on Device Mode and Orientation
  const getDeviceDimensions = () => {
    if (device === 'mobile') {
      if (orientation === 'portrait') {
        return { width: '375px', height: '680px', label: '375 × 680 (Mobile)' };
      }
      return { width: '680px', height: '375px', label: '680 × 375 (Landscape)' };
    }
    if (device === 'tablet') {
      if (orientation === 'portrait') {
        return { width: '768px', height: '680px', label: '768 × 680 (Tablet)' };
      }
      return { width: '920px', height: '540px', label: '920 × 540 (Landscape)' };
    }
    return { width: '100%', height: '580px', label: 'Desktop (100% Fluid)' };
  };

  const dimensions = getDeviceDimensions();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2.5">
            <Eye className="w-5 h-5 text-indigo-400" />
            {t('preview.title')}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t('preview.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onSaveHistory}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-200 transition-colors shadow-sm"
          >
            <BookmarkPlus className="w-4 h-4 text-emerald-400" />
            <span>{t('preview.btn_save_history')}</span>
          </button>

          <button
            onClick={onDownloadZip}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-md shadow-indigo-600/20"
          >
            <DownloadCloud className="w-4 h-4" />
            <span>{t('preview.btn_download')}</span>
          </button>
        </div>
      </div>

      {/* Interactive Browser & Device Simulator Card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-md overflow-hidden shadow-2xl flex flex-col">
        {/* Device & Browser Controls Toolbar */}
        <div className="p-3 sm:p-3.5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between gap-2.5 flex-wrap">
          {/* Device Switcher Pills */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 shrink-0">
            <button
              onClick={() => setDevice('desktop')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                device === 'desktop'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>{t('preview.desktop')}</span>
            </button>

            <button
              onClick={() => setDevice('tablet')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                device === 'tablet'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span>{t('preview.tablet')}</span>
            </button>

            <button
              onClick={() => setDevice('mobile')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                device === 'mobile'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{t('preview.mobile')}</span>
            </button>
          </div>

          {/* Orientation & Zoom Helpers for Mobile / Tablet */}
          {device !== 'desktop' && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setOrientation((o) => (o === 'portrait' ? 'landscape' : 'portrait'))}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-medium text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
                title="Rotate Orientation"
              >
                <SmartphoneNfc className="w-3.5 h-3.5 text-indigo-400" />
                <span className="capitalize">{orientation}</span>
              </button>
            </div>
          )}

          {/* Simulated URL Bar with Hostinger Domain */}
          <div className="flex-1 min-w-[180px] max-w-md flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-emerald-400 font-semibold">https://</span>
            <span className="text-slate-200 truncate">
              {project.name ? `${project.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.hostingerapp.com` : 'your-app.hostingerapp.com'}
            </span>
          </div>

          {/* Actions: Refresh & Popout */}
          <div className="flex items-center gap-1.5">
            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-900 px-1 py-0.5 rounded-xl border border-slate-800 text-xs font-mono text-slate-400">
              <button
                onClick={() => setZoomLevel((z) => Math.max(50, z - 10))}
                className="p-1 hover:text-white"
                title="Zoom Out"
              >
                <ZoomOut className="w-3 h-3" />
              </button>
              <span className="text-[11px] px-1">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
                className="p-1 hover:text-white"
                title="Zoom In"
              >
                <ZoomIn className="w-3 h-3" />
              </button>
            </div>

            <button
              onClick={() => setRefreshKey((k) => k + 1)}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 transition-colors border border-slate-700/50"
              title="Reload Frame"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleOpenNewTab}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 transition-colors border border-slate-700/50"
              title="Open Fullscreen in New Tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Viewport Canvas Stage */}
        <div className="p-4 sm:p-8 bg-slate-950/90 flex items-center justify-center min-h-[580px] overflow-auto">
          {device === 'desktop' ? (
            /* Desktop Browser Frame Mockup */
            <div
              className="w-full bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col transition-all duration-300"
              style={{
                maxWidth: '1100px',
                height: `${Math.round(580 * (zoomLevel / 100))}px`,
                transformOrigin: 'top center',
              }}
            >
              {/* Browser Window Bar */}
              <div className="h-9 px-4 bg-slate-900 border-b border-slate-800/80 flex items-center justify-between shrink-0 select-none">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  <span>Desktop Viewport (100% Responsive)</span>
                </div>
                <div className="w-12" />
              </div>

              {/* Iframe Viewport */}
              <div className="flex-1 bg-white relative">
                <iframe
                  key={`desktop-${refreshKey}`}
                  title="Hostinger Desktop Live Preview"
                  srcDoc={srcDocContent}
                  sandbox="allow-scripts allow-same-origin"
                  className="w-full h-full border-0 bg-white block"
                />
              </div>
            </div>
          ) : device === 'tablet' ? (
            /* Tablet Device Frame Mockup */
            <div
              className="bg-slate-900 rounded-[36px] shadow-2xl border-[10px] border-slate-800/90 overflow-hidden flex flex-col transition-all duration-300 relative"
              style={{
                width: dimensions.width,
                height: dimensions.height,
                transform: zoomLevel !== 100 ? `scale(${zoomLevel / 100})` : undefined,
                transformOrigin: 'center center',
              }}
            >
              {/* Tablet Top Bezel with Camera */}
              <div className="h-6 bg-slate-950 flex items-center justify-between px-6 shrink-0 select-none">
                <span className="text-[10px] font-mono text-slate-500 font-semibold">9:41 AM</span>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700 mx-auto" />
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Wifi className="w-2.5 h-2.5" />
                  <Battery className="w-3 h-3" />
                </div>
              </div>

              {/* Iframe Screen */}
              <div className="flex-1 bg-white relative overflow-hidden">
                <iframe
                  key={`tablet-${refreshKey}`}
                  title="Hostinger Tablet Live Preview"
                  srcDoc={srcDocContent}
                  sandbox="allow-scripts allow-same-origin"
                  className="w-full h-full border-0 bg-white block"
                />
              </div>

              {/* Tablet Bottom Home Indicator */}
              <div className="h-4 bg-slate-950 flex items-center justify-center shrink-0">
                <div className="w-28 h-1 bg-slate-700 rounded-full" />
              </div>
            </div>
          ) : (
            /* Smartphone Device Frame Mockup */
            <div
              className="bg-slate-900 rounded-[44px] shadow-2xl border-[10px] border-slate-800/95 overflow-hidden flex flex-col transition-all duration-300 relative"
              style={{
                width: dimensions.width,
                height: dimensions.height,
                transform: zoomLevel !== 100 ? `scale(${zoomLevel / 100})` : undefined,
                transformOrigin: 'center center',
              }}
            >
              {/* Smartphone Dynamic Island / Notch Bezel */}
              <div className="h-8 bg-slate-950 flex items-center justify-between px-5 shrink-0 select-none z-10">
                <span className="text-[10px] font-mono text-slate-400 font-semibold">9:41</span>
                {/* Dynamic Island pill */}
                <div className="w-20 h-4 bg-black rounded-full border border-slate-800/80 flex items-center justify-end px-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500/60" />
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Wifi className="w-2.5 h-2.5" />
                  <Battery className="w-3 h-3" />
                </div>
              </div>

              {/* Iframe Screen */}
              <div className="flex-1 bg-white relative overflow-hidden">
                <iframe
                  key={`mobile-${refreshKey}`}
                  title="Hostinger Mobile Live Preview"
                  srcDoc={srcDocContent}
                  sandbox="allow-scripts allow-same-origin"
                  className="w-full h-full border-0 bg-white block"
                />
              </div>

              {/* Smartphone Bottom Home Bar */}
              <div className="h-5 bg-slate-950 flex items-center justify-center shrink-0">
                <div className="w-24 h-1 bg-slate-600 rounded-full" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Simulator Notes Bento Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/60 backdrop-blur-md border border-slate-800 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-2 flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          Production Simulation Notes
        </h3>
        <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside leading-relaxed">
          <li>Responsive frame automatically injects viewport normalization and inlines linked stylesheets.</li>
          <li>Supports portrait & landscape rotations, dynamic zoom scaling, and direct full-screen popouts.</li>
          <li>The production package includes an optimized <code className="text-indigo-300 font-mono">.htaccess</code> routing file to handle SPA single-page refreshes on Hostinger.</li>
        </ul>
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
