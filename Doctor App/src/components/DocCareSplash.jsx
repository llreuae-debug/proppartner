import React, { useState, useEffect } from 'react';

/**
 * DocCareSplash - Premium Animated Startup & Splash Screen
 * 
 * Implements the exact 8-step animation sequence:
 * 1. Clean white background
 * 2. Subtle fade-in of teal / soft-blue medical background glow
 * 3. DocCare medical document + stethoscope icon animates smoothly into view
 * 4. Subtle scale-up effect 95% -> 100%
 * 5. Smooth left-to-right reveal of "DocCare™" wordmark
 * 6. Smooth reveal of tagline "Your Practice. Your Patients. One Simple Record."
 * 7. Hold completed logo for ~1 second
 * 8. Smooth fade out / transition into main application
 * 
 * Target duration: ~2.6 seconds.
 */
export default function DocCareSplash({ onComplete }) {
  // Phase sequence: 0 = Init White, 1 = Glow, 2 = Icon In (95%->100%), 3 = Wordmark, 4 = Tagline, 5 = Hold, 6 = Exit
  const [stage, setStage] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // 1. Start with clean white (0ms)
    // 2. Fade in medical glow (150ms)
    const t1 = setTimeout(() => setStage(1), 150);

    // 3 & 4. Icon animates in and scales 95% -> 100% (450ms)
    const t2 = setTimeout(() => setStage(2), 450);

    // 5. Reveal DocCare wordmark with left-to-right wipe (1050ms)
    const t3 = setTimeout(() => setStage(3), 1050);

    // 6. Reveal tagline (1550ms)
    const t4 = setTimeout(() => setStage(4), 1550);

    // 7. Hold completed logo (1900ms - 2500ms)
    const t5 = setTimeout(() => setStage(5), 1900);

    // 8. Smooth transition out (2550ms)
    const t6 = setTimeout(() => {
      setExiting(true);
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 450);
    }, 2550);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
    };
  }, [onComplete]);

  const handleSkip = () => {
    setExiting(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 200);
  };

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white cursor-pointer select-none transition-opacity duration-500 ease-out ${
        exiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        background: '#ffffff'
      }}
    >
      {/* 2. Medical Background Ambient Glow (Teal & Soft-Blue) */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ease-out ${
          stage >= 1 ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: 'radial-gradient(circle at 50% 48%, rgba(20, 184, 166, 0.14) 0%, rgba(56, 165, 248, 0.09) 38%, rgba(255, 255, 255, 0) 70%)'
        }}
      />

      {/* Decorative Subtle Medical Grid Pattern (Ultra-soft) */}
      <div
        className={`absolute inset-0 pointer-events-none opacity-40 transition-opacity duration-1000 ${
          stage >= 1 ? 'opacity-30' : 'opacity-0'
        }`}
        style={{
          backgroundImage: `radial-gradient(rgba(13, 148, 136, 0.15) 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Main Logo Container */}
      <div className="relative z-10 flex flex-col items-center max-w-sm px-6 text-center">
        
        {/* 3 & 4. Icon Animation (Smooth fade + scale 95% -> 100% + gentle heartbeat) */}
        <div
          className="relative transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            opacity: stage >= 2 ? 1 : 0,
            transform: stage >= 2 ? 'translateY(0px) scale(1)' : 'translateY(12px) scale(0.95)'
          }}
        >
          {/* Subtle icon ambient glow */}
          <div className="absolute inset-0 bg-teal-400/25 rounded-full blur-2xl transform scale-125 -z-10 animate-pulse" />
          
          <img
            src="/brand/doccare-icon.png"
            alt="DocCare Medical Icon"
            className="w-24 h-24 sm:w-28 sm:h-28 object-contain drop-shadow-lg mx-auto mb-3 animate-logo-heartbeat"
          />
        </div>

        {/* 5. DocCare Brand Wordmark */}
        <div
          className="overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] mb-1"
          style={{
            opacity: stage >= 3 ? 1 : 0,
            transform: stage >= 3 ? 'translateY(0px)' : 'translateY(8px)'
          }}
        >
          <div className="text-3xl sm:text-4xl font-black tracking-tight leading-none">
            <span className="text-slate-900">Doc</span>
            <span className="text-teal-600">Care</span>
          </div>
        </div>

        {/* 6. Tagline Reveal */}
        <div
          className="transition-all duration-600 ease-out"
          style={{
            opacity: stage >= 4 ? 1 : 0,
            transform: stage >= 4 ? 'translateY(0px)' : 'translateY(6px)'
          }}
        >
          <p className="text-xs sm:text-sm font-semibold tracking-tight text-slate-600">
            Your Practice. Your Patients. One Simple Record.
          </p>
        </div>

        {/* 7 & 8. Soft Pulse & Loading Bar Indicator */}
        <div
          className="mt-6 w-40 h-1.5 bg-slate-100 rounded-full overflow-hidden transition-opacity duration-300 shadow-inner"
          style={{ opacity: stage >= 2 ? 1 : 0 }}
        >
          <div
            className="h-full bg-gradient-to-r from-teal-500 via-teal-400 to-blue-500 rounded-full transition-all duration-[1800ms] ease-out shadow-sm"
            style={{ width: stage >= 5 ? '100%' : stage >= 3 ? '70%' : stage >= 2 ? '35%' : '10%' }}
          />
        </div>

        <p className="text-[10px] text-slate-400 font-bold mt-3.5 tracking-wider uppercase opacity-75">
          Pakistan Clinical Practice OS
        </p>

      </div>
    </div>
  );
}
