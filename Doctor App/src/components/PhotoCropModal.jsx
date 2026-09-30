import React, { useState, useRef } from 'react';
import { X, Upload, Check, Image as ImageIcon, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

export default function PhotoCropModal({ isOpen, onClose, onSave, title = "Upload & Crop Photo", aspectRatio = 1 }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApply = () => {
    if (!imageSrc) return;
    
    // Create cropped canvas data
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const size = 400;
      canvas.width = size;
      canvas.height = size / aspectRatio;

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);
      
      const drawWidth = canvas.width;
      const drawHeight = (img.height / img.width) * drawWidth;
      ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
      ctx.restore();

      const croppedBase64 = canvas.toDataURL('image/jpeg', 0.9);
      onSave(croppedBase64);
      onClose();
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-teal-600" />
            {title}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          {!imageSrc ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-teal-300 dark:border-teal-700 bg-teal-50/50 dark:bg-slate-800/50 hover:bg-teal-50 rounded-2xl p-8 text-center cursor-pointer transition-colors"
            >
              <Upload className="w-8 h-8 text-teal-600 dark:text-teal-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Click to browse image file
              </p>
              <p className="text-[11px] text-slate-400">
                Supports JPG, PNG, WEBP (Max 5MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-full h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden flex items-center justify-center relative border border-slate-200 dark:border-slate-700">
                <img
                  src={imageSrc}
                  alt="Preview"
                  style={{
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    transition: 'transform 0.1s ease',
                    maxHeight: '100%',
                    maxWidth: '100%',
                    objectFit: 'contain'
                  }}
                />
                <div className="absolute inset-0 pointer-events-none border-2 border-teal-500/50 rounded-2xl" />
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4 bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setZoom(prev => Math.max(0.6, prev - 0.2))}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono font-medium text-slate-600 dark:text-slate-400">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoom(prev => Math.min(2.5, prev + 0.2))}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />
                <button
                  type="button"
                  onClick={() => setRotation(prev => (prev + 90) % 360)}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center gap-1 text-xs"
                  title="Rotate 90°"
                >
                  <RotateCw className="w-4 h-4" />
                  <span>Rotate</span>
                </button>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setImageSrc(null);
                    setZoom(1);
                    setRotation(0);
                  }}
                  className="text-xs text-rose-600 hover:underline font-medium"
                >
                  Choose Different File
                </button>

                <button
                  type="button"
                  onClick={handleApply}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Image</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
