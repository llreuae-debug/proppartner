import React from 'react';

/**
 * MedicalAtmosphereBackground
 * 
 * Provides a calm, subtle, multi-layered healthcare atmospheric background
 * with floating medical crosses, soft capsule shapes, abstract molecule nodes,
 * and gentle ambient gradients.
 * 
 * Performance:
 * - Pure CSS GPU-accelerated transforms (translate3d)
 * - Zero JavaScript animation loops
 * - Respects prefers-reduced-motion
 * - Lightweight responsive SVG nodes
 * - pointer-events-none to never block UI clicks
 */
export default function MedicalAtmosphereBackground({ variant = 'standard' }) {
  // Determine opacity and element presence based on screen density
  // 'prominent': Login, Auth, Landing, Discovery
  // 'standard': Dashboard, Patient Portal, Appointments
  // 'minimal': Prescription Writer, Ledger, Medical Records
  
  const opacityClass = 
    variant === 'prominent' ? 'opacity-90' :
    variant === 'minimal' ? 'opacity-35' : 
    'opacity-65';

  return (
    <div 
      className={`fixed inset-0 pointer-events-none overflow-hidden select-none z-0 transition-opacity duration-700 ${opacityClass}`}
      aria-hidden="true"
    >
      
      {/* ==========================================
          LAYER 1: DEEP AMBIENT GLOW BLOBS
          ========================================== */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-teal-300/10 dark:bg-teal-900/15 blur-3xl animate-med-ambient" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-medblue-300/10 dark:bg-medblue-900/15 blur-3xl animate-med-ambient" style={{ animationDelay: '-6s' }} />
      <div className="absolute -bottom-32 left-1/4 w-[28rem] h-[28rem] rounded-full bg-teal-400/8 dark:bg-teal-950/20 blur-3xl animate-med-ambient" style={{ animationDelay: '-10s' }} />

      {/* ==========================================
          LAYER 2: ABSTRACT MOLECULES & CAPSULES
          ========================================== */}

      {/* Abstract Molecule Structure 1 (Top Left) */}
      <div className="absolute top-20 left-12 animate-med-float-1 hidden md:block">
        <svg width="120" height="90" viewBox="0 0 120 90" fill="none" className="text-teal-600/15 dark:text-teal-400/10">
          <line x1="20" y1="30" x2="60" y2="20" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="60" y1="20" x2="90" y2="50" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="60" y1="20" x2="50" y2="70" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="20" cy="30" r="4" fill="currentColor" />
          <circle cx="60" cy="20" r="5.5" fill="currentColor" />
          <circle cx="90" cy="50" r="4.5" fill="currentColor" />
          <circle cx="50" cy="70" r="3.5" fill="currentColor" />
        </svg>
      </div>

      {/* Abstract Molecule Structure 2 (Bottom Right) */}
      <div className="absolute bottom-28 right-16 animate-med-float-2 hidden lg:block">
        <svg width="110" height="85" viewBox="0 0 110 85" fill="none" className="text-medblue-600/15 dark:text-medblue-400/10">
          <line x1="25" y1="60" x2="65" y2="45" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" />
          <line x1="65" y1="45" x2="85" y2="20" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" />
          <circle cx="25" cy="60" r="4" fill="currentColor" />
          <circle cx="65" cy="45" r="5" fill="currentColor" />
          <circle cx="85" cy="20" r="3.5" fill="currentColor" />
        </svg>
      </div>

      {/* Floating Capsule 1 (Soft Teal Pill - Mid Left) */}
      <div 
        className="absolute top-1/3 left-8 animate-med-float-3 hidden sm:flex items-center"
        style={{ transform: 'rotate(-25deg)' }}
      >
        <div className="w-12 h-5 rounded-full border border-teal-500/20 dark:border-teal-400/15 backdrop-blur-xs flex overflow-hidden shadow-xs">
          <div className="w-1/2 h-full bg-teal-500/10 dark:bg-teal-400/10" />
          <div className="w-1/2 h-full bg-white/40 dark:bg-slate-700/30" />
        </div>
      </div>

      {/* Floating Capsule 2 (Soft Blue Pill - Top Right) */}
      <div 
        className="absolute top-36 right-24 animate-med-float-1 hidden md:flex items-center"
        style={{ transform: 'rotate(35deg)', animationDelay: '-4s' }}
      >
        <div className="w-10 h-4.5 rounded-full border border-medblue-500/20 dark:border-medblue-400/15 backdrop-blur-xs flex overflow-hidden shadow-xs">
          <div className="w-1/2 h-full bg-medblue-500/10 dark:bg-medblue-400/10" />
          <div className="w-1/2 h-full bg-white/40 dark:bg-slate-700/30" />
        </div>
      </div>

      {/* Floating Capsule 3 (Minimalist Pill - Bottom Center/Left) */}
      <div 
        className="absolute bottom-40 left-1/3 animate-med-float-2 hidden lg:flex items-center"
        style={{ transform: 'rotate(15deg)', animationDelay: '-9s' }}
      >
        <div className="w-9 h-4 rounded-full border border-teal-600/15 dark:border-teal-400/10 backdrop-blur-xs flex overflow-hidden">
          <div className="w-1/2 h-full bg-teal-600/8 dark:bg-teal-400/8" />
          <div className="w-1/2 h-full bg-slate-200/30 dark:bg-slate-700/20" />
        </div>
      </div>

      {/* Subtle ECG Heartbeat Fragment (Center Right Edge) */}
      <div className="absolute top-1/2 right-6 -translate-y-1/2 animate-med-float-3 hidden xl:block">
        <svg width="140" height="40" viewBox="0 0 140 40" fill="none" className="text-teal-500/15 dark:text-teal-400/10">
          <path 
            d="M5 20 H45 L52 10 L58 32 L65 4 L72 35 L78 17 L84 20 H135" 
            stroke="currentColor" 
            strokeWidth="1.2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
        </svg>
      </div>

      {/* ==========================================
          LAYER 3: FOREGROUND MEDICAL MICRO PARTICLES
          ========================================== */}

      {/* Medical Cross Particle 1 (Top Center) */}
      <div className="absolute top-28 left-1/2 -translate-x-1/2 animate-med-float-2">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-teal-600/15 dark:text-teal-400/12">
          <path d="M9 3H15V9H21V15H15V21H9V15H3V9H9V3Z" />
        </svg>
      </div>

      {/* Medical Cross Particle 2 (Bottom Left) */}
      <div className="absolute bottom-24 left-16 animate-med-float-1 hidden sm:block" style={{ animationDelay: '-7s' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-medblue-600/15 dark:text-medblue-400/12">
          <path d="M9 3H15V9H21V15H15V21H9V15H3V9H9V3Z" />
        </svg>
      </div>

      {/* Medical Cross Particle 3 (Upper Right) */}
      <div className="absolute top-1/4 right-1/4 animate-med-float-3" style={{ animationDelay: '-12s' }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-teal-500/15 dark:text-teal-400/10">
          <path d="M9 3H15V9H21V15H15V21H9V15H3V9H9V3Z" />
        </svg>
      </div>

      {/* Soft Micro Dots (Floating depth accents) */}
      <div className="absolute top-44 left-1/4 w-2 h-2 rounded-full bg-teal-400/20 dark:bg-teal-400/15 animate-med-float-1" />
      <div className="absolute top-2/3 right-1/3 w-2.5 h-2.5 rounded-full bg-medblue-400/20 dark:bg-medblue-400/15 animate-med-float-2" style={{ animationDelay: '-5s' }} />
      <div className="absolute bottom-16 right-1/2 w-1.5 h-1.5 rounded-full bg-teal-500/20 dark:bg-teal-400/15 animate-med-float-3" style={{ animationDelay: '-8s' }} />
      <div className="absolute top-16 right-12 w-2 h-2 rounded-full bg-teal-400/15 dark:bg-teal-300/10 animate-med-float-1" style={{ animationDelay: '-14s' }} />

      {/* Minimal Medical Document Outline Fragment */}
      <div className="absolute bottom-1/3 left-12 animate-med-float-2 hidden md:block" style={{ animationDelay: '-3s' }}>
        <svg width="22" height="26" viewBox="0 0 24 28" fill="none" className="text-teal-600/12 dark:text-teal-400/8">
          <rect x="2" y="2" width="20" height="24" rx="3" stroke="currentColor" strokeWidth="1" />
          <line x1="6" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          <line x1="6" y1="13" x2="18" y2="13" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          <line x1="6" y1="18" x2="12" y2="18" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        </svg>
      </div>

    </div>
  );
}
