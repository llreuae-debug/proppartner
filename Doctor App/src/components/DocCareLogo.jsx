import React, { useState } from 'react';

/**
 * DocCareLogo - Standard Single Source of Truth Brand Component
 * High-resolution, accessible, dark/light contrast optimized, with smooth entrance and pulse animations.
 *
 * @param {('full'|'horizontal'|'compact'|'icon'|'wordmark')} variant
 * @param {('xs'|'sm'|'md'|'lg'|'xl'|'2xl')} size
 * @param {string} className
 * @param {boolean} showTagline
 * @param {boolean} animated
 * @param {string} alt
 */
export default function DocCareLogo({
  variant = 'horizontal',
  size = 'md',
  className = '',
  showTagline = true,
  animated = true,
  alt = 'DocCare — Your Practice. Your Patients. One Simple Record.'
}) {
  const [imgError, setImgError] = useState(false);

  // Size mapping for the icon element
  const iconSizeMap = {
    xs: 'w-6 h-6',
    sm: 'w-7 h-7 sm:w-8 sm:h-8',
    md: 'w-9 h-9 sm:w-10 sm:h-10',
    lg: 'w-12 h-12 sm:w-14 sm:h-14',
    xl: 'w-16 h-16 sm:w-20 sm:h-20',
    '2xl': 'w-24 h-24 sm:w-28 sm:h-28'
  };

  // Text size classes
  const textTitleSizeMap = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-lg sm:text-xl',
    lg: 'text-2xl sm:text-3xl',
    xl: 'text-3xl sm:text-4xl',
    '2xl': 'text-4xl sm:text-5xl'
  };

  const taglineSizeMap = {
    xs: 'text-[9px]',
    sm: 'text-[10px]',
    md: 'text-[11px]',
    lg: 'text-xs sm:text-sm',
    xl: 'text-sm',
    '2xl': 'text-base'
  };

  const currentIconSize = iconSizeMap[size] || iconSizeMap.md;
  const currentTitleSize = textTitleSizeMap[size] || textTitleSizeMap.md;
  const currentTaglineSize = taglineSizeMap[size] || taglineSizeMap.md;

  // Render high-clarity icon element with subtle pulse & hover glow
  const renderIcon = (extraClass = '') => {
    return (
      <div 
        className={`relative shrink-0 flex items-center justify-center select-none ${
          animated ? 'logo-glow-hover group' : ''
        } ${extraClass}`}
      >
        {!imgError ? (
          <img
            src="/brand/doccare-icon.png"
            onError={() => setImgError(true)}
            alt={alt}
            className={`${currentIconSize} object-contain shrink-0 drop-shadow-sm transition-transform duration-300 ${
              animated ? 'group-hover:scale-105' : ''
            }`}
            loading="eager"
          />
        ) : (
          // Crisp Vector Medical Cross / Shield Fallback
          <div className={`${currentIconSize} rounded-2xl bg-gradient-to-tr from-teal-700 via-teal-600 to-teal-400 p-2 text-white shadow-md shadow-teal-600/20 flex items-center justify-center`}>
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
              <path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z" />
            </svg>
          </div>
        )}
      </div>
    );
  };

  // 1. Icon Only Variant
  if (variant === 'icon') {
    return renderIcon(className);
  }

  // 2. Wordmark Only Variant
  if (variant === 'wordmark') {
    return (
      <div className={`inline-flex items-center tracking-tight select-none font-extrabold ${currentTitleSize} ${className}`}>
        <span className="text-slate-900 dark:text-white">Doc</span>
        <span className="text-teal-600 dark:text-teal-400">Care</span>
      </div>
    );
  }

  // 3. Full Centered Variant (for Login / Auth screens / Splash)
  if (variant === 'full') {
    return (
      <div className={`flex flex-col items-center text-center select-none ${animated ? 'animate-logo-entrance' : ''} ${className}`}>
        <div className="mb-2.5 relative">
          <div className="absolute inset-0 bg-teal-500/15 rounded-full blur-xl transform scale-125 -z-10" />
          {renderIcon()}
        </div>
        <div className={`font-black tracking-tight leading-none ${currentTitleSize}`}>
          <span className="text-slate-900 dark:text-white">Doc</span>
          <span className="text-teal-600 dark:text-teal-400">Care</span>
        </div>
        {showTagline && (
          <p className={`font-medium text-slate-500 dark:text-slate-400 mt-1 tracking-tight leading-tight max-w-xs ${currentTaglineSize}`}>
            Your Practice. Your Patients. One Simple Record.
          </p>
        )}
      </div>
    );
  }

  // 4. Compact Variant (Icon + Clean Text side-by-side)
  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2 select-none ${animated ? 'logo-glow-hover' : ''} ${className}`}>
        {renderIcon()}
        <span className={`font-extrabold tracking-tight leading-none ${currentTitleSize}`}>
          <span className="text-slate-900 dark:text-white">Doc</span>
          <span className="text-teal-600 dark:text-teal-400">Care</span>
        </span>
      </div>
    );
  }

  // 5. Default: Horizontal Layout (Icon + Title + Subtitle)
  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 select-none ${animated ? 'logo-glow-hover group' : ''} ${className}`}>
      {renderIcon()}
      <div className="flex flex-col justify-center">
        <div className={`font-extrabold tracking-tight leading-none flex items-center ${currentTitleSize}`}>
          <span className="text-slate-900 dark:text-white">Doc</span>
          <span className="text-teal-600 dark:text-teal-400">Care</span>
        </div>
        {showTagline && (
          <span className={`font-medium text-slate-500 dark:text-slate-400 tracking-tight leading-none mt-1 hidden sm:block ${currentTaglineSize}`}>
            Your Practice. Your Patients. One Simple Record.
          </span>
        )}
      </div>
    </div>
  );
}
