import React, { useState } from 'react';
import { X, FileCode, Folder, Copy, Check, Sparkles } from 'lucide-react';
import { ProjectFilesMap } from '../types';

interface FileInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: ProjectFilesMap;
  projectName: string;
}

export const FileInspectorModal: React.FC<FileInspectorModalProps> = ({
  isOpen,
  onClose,
  files,
  projectName,
}) => {
  const filePaths = Object.keys(files).sort();
  const [selectedFile, setSelectedFile] = useState<string>(filePaths[0] || '');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentFile = files[selectedFile];
  const isBinary = currentFile?.bin && !currentFile.content;

  const handleCopy = async () => {
    if (currentFile?.content) {
      await navigator.clipboard.writeText(currentFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="h-14 border-b border-slate-800 px-6 flex items-center justify-between bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <Folder className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-sm text-white">{projectName}</span>
            <span className="text-xs text-slate-400 font-mono">({filePaths.length} files)</span>
          </div>

          <div className="flex items-center gap-3">
            {currentFile?.content && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Content'}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 min-h-0">
          {/* File Tree / List */}
          <div className="md:col-span-4 border-r border-slate-800 bg-slate-950/90 p-4 overflow-y-auto font-mono text-xs">
            <div className="text-[10px] uppercase text-slate-500 tracking-wider font-bold px-2 py-1 mb-1">
              Project Manifest
            </div>
            <div className="flex flex-col gap-1">
              {filePaths.map((path) => {
                const isSelected = selectedFile === path;
                const isHtaccess = path.includes('.htaccess');
                const isHtml = path.endsWith('.html');
                const isEnv = path.includes('.env');

                return (
                  <button
                    key={path}
                    onClick={() => setSelectedFile(path)}
                    className={`w-full text-left px-3 py-2 rounded-xl truncate flex items-center gap-2 transition-all ${
                      isSelected
                        ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                    }`}
                  >
                    <FileCode
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isHtaccess
                          ? 'text-amber-400'
                          : isHtml
                          ? 'text-emerald-400'
                          : isEnv
                          ? 'text-violet-400'
                          : 'text-slate-500'
                      }`}
                    />
                    <span className="truncate">{path}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Code Viewer */}
          <div className="md:col-span-8 bg-slate-950 p-5 overflow-auto flex flex-col font-mono text-xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 shrink-0">
              <span className="font-semibold text-slate-200 text-sm">{selectedFile}</span>
              <span className="text-[11px] text-slate-500">
                {isBinary
                  ? `${currentFile?.bin?.length || 0} bytes (Binary asset)`
                  : `${(currentFile?.content || '').length} characters`}
              </span>
            </div>

            {isBinary ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500">
                <FileCode className="w-12 h-12 stroke-[1.5] mb-2 opacity-50 text-indigo-400" />
                <p>Binary or non-text asset file.</p>
                <p className="text-[11px] text-slate-600 mt-1">This asset is bundled directly into the Hostinger package.</p>
              </div>
            ) : (
              <pre className="flex-1 leading-relaxed text-slate-300 selection:bg-indigo-600/30 overflow-x-auto whitespace-pre">
                {currentFile?.content || '(Empty file)'}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
