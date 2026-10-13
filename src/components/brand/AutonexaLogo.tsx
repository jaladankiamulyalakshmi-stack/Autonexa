import React from 'react';

interface AutonexaLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'white';
  showTagline?: boolean;
}

export const AutonexaLogo: React.FC<AutonexaLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'full',
  showTagline = true,
}) => {
  const sizeMap = {
    sm: { icon: 28, text: 'text-lg', tagline: 'text-[9px]' },
    md: { icon: 38, text: 'text-2xl', tagline: 'text-[11px]' },
    lg: { icon: 48, text: 'text-3xl', tagline: 'text-xs' },
    xl: { icon: 64, text: 'text-4xl', tagline: 'text-sm' },
  };

  const currentSize = sizeMap[size];

  // SVG Geometric Connected-Node 'A' with Upward-Trending Arrow
  const SymbolIcon = (
    <svg
      width={currentSize.icon}
      height={currentSize.icon}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-300 hover:scale-105"
    >
      <defs>
        <linearGradient id="anx-purple-blue" x1="10" y1="90" x2="90" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="45%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>
        <linearGradient id="anx-arrow-grad" x1="30" y1="70" x2="95" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>
        <linearGradient id="anx-nodes-grad" x1="10" y1="50" x2="50" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
      </defs>

      {/* Left arm network connecting lines */}
      <line x1="24" y1="52" x2="50" y2="16" stroke="url(#anx-nodes-grad)" strokeWidth="6" strokeLinecap="round" />
      <line x1="24" y1="52" x2="34" y2="76" stroke="url(#anx-nodes-grad)" strokeWidth="6" strokeLinecap="round" />
      <line x1="50" y1="16" x2="68" y2="52" stroke="url(#anx-purple-blue)" strokeWidth="7" strokeLinecap="round" />

      {/* Left arm main body of 'A' */}
      <path
        d="M22 80 L36 48 L48 20"
        stroke="#7C3AED"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Network Nodes (Circles) on Left Arm */}
      {/* Outer branch node */}
      <circle cx="22" cy="50" r="8" fill="#7C3AED" />
      <circle cx="22" cy="50" r="3.5" fill="#FFFFFF" />

      {/* Lower node */}
      <circle cx="34" cy="74" r="7.5" fill="#6D28D9" />

      {/* Apex node (Ring with center) */}
      <circle cx="50" cy="18" r="9" fill="#7C3AED" />
      <circle cx="50" cy="18" r="4.5" fill="#FFFFFF" />

      {/* Right Leg of 'A' */}
      <path
        d="M52 24 L78 84"
        stroke="#6366F1"
        strokeWidth="10"
        strokeLinecap="round"
        strokeOpacity="0.45"
      />

      {/* Upward Growth Arrow (Crossbar & soaring breakthrough right stroke) */}
      <path
        d="M26 66 L42 62 L58 72 L82 26"
        stroke="url(#anx-arrow-grad)"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Arrow Head pointing to top-right */}
      <path
        d="M66 22 L86 24 L84 44 Z"
        fill="#38BDF8"
      />
      <path
        d="M66 22 L86 24 L84 44"
        stroke="#38BDF8"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  if (variant === 'icon') {
    return <div className={`inline-flex items-center ${className}`}>{SymbolIcon}</div>;
  }

  const textColor = variant === 'white' ? 'text-white' : 'text-[#312E81]';
  const taglineColor = variant === 'white' ? 'text-indigo-200' : 'text-[#7C3AED]';

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {SymbolIcon}
      <div className="flex flex-col select-none">
        <span
          className={`font-extrabold tracking-wider leading-none ${currentSize.text} ${textColor}`}
          style={{ letterSpacing: '0.06em' }}
        >
          AUTONEXA
        </span>
        {showTagline && (
          <span
            className={`font-semibold tracking-wider uppercase mt-1 leading-none ${currentSize.tagline} ${taglineColor}`}
            style={{ letterSpacing: '0.08em' }}
          >
            Discover Smarter. Close Faster.
          </span>
        )}
      </div>
    </div>
  );
};
