import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true, className = '' }) => {
  const iconSize = size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8';
  const textSize = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-base';

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* GoDeploy Custom Vector Brand Icon */}
      <div
        className={`relative ${iconSize} rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 p-[1.5px] shadow-lg shadow-indigo-500/25 flex items-center justify-center shrink-0 group`}
      >
        <div className="w-full h-full bg-slate-950/80 backdrop-blur-sm rounded-[10px] flex items-center justify-center relative overflow-hidden">
          {/* Subtle glow highlight inside */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-indigo-500/15 to-violet-400/25" />
          
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 text-white relative z-10 drop-shadow-sm transition-transform group-hover:scale-110 duration-200"
          >
            {/* Rocket / Launch arrow path */}
            <path
              d="M12 2.5L18.5 9H14.5V16.5H9.5V9H5.5L12 2.5Z"
              fill="url(#godeploy-grad-1)"
            />
            {/* Speed trails */}
            <path
              d="M8 18.5H16M10 21H14"
              stroke="url(#godeploy-grad-2)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="godeploy-grad-1" x1="5.5" y1="2.5" x2="18.5" y2="16.5" gradientUnits="userSpaceOnUse">
                <stop stopColor="#ffffff" />
                <stop offset="0.6" stopColor="#c7d2fe" />
                <stop offset="1" stopColor="#818cf8" />
              </linearGradient>
              <linearGradient id="godeploy-grad-2" x1="8" y1="18.5" x2="16" y2="21" gradientUnits="userSpaceOnUse">
                <stop stopColor="#818cf8" />
                <stop offset="1" stopColor="#34d399" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="flex items-baseline tracking-tight select-none">
          <span className={`font-black ${textSize} text-white tracking-tight`}>Go</span>
          <span className={`font-black ${textSize} bg-gradient-to-r from-indigo-400 via-indigo-300 to-violet-400 bg-clip-text text-transparent`}>
            Deploy
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-0.5 inline-block animate-pulse" />
        </div>
      )}
    </div>
  );
};
