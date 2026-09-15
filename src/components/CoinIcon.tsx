import React from 'react';

interface CoinIconProps {
  type?: 'blue' | 'silver';
  size?: number;
  className?: string;
}

export const CoinIcon: React.FC<CoinIconProps> = ({
  type = 'blue',
  size = 18,
  className = '',
}) => {
  const isBlue = type === 'blue';

  const base = isBlue ? '#00e5ff' : '#94a3b8';
  const edge = isBlue ? '#007a99' : '#475569';
  const highlight = isBlue ? '#ccfaff' : '#f1f5f9';
  const inner = isBlue ? '#00b8cc' : '#64748b';
  const symbol = isBlue ? '#005c73' : '#334155';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block ${className}`}
      style={{ verticalAlign: 'middle', transform: 'translateY(-1px)' }}
      aria-label={`${type} coin`}
    >
      {/* Dark Outer Rim (Depth/Edge) */}
      <circle cx="12" cy="13" r="10" fill={edge} />
      
      {/* Main Base (Top Face) */}
      <circle cx="12" cy="11" r="10" fill={`url(#grad-base-${type})`} />
      
      {/* Inner Rim (Recessed area) */}
      <circle cx="12" cy="11" r="7.5" fill={`url(#grad-inner-${type})`} />
      
      {/* Top Highlight (Light edge) */}
      <path d="M22 11C22 5.47715 17.5228 1 12 1C6.47715 1 2 5.47715 2 11" stroke={highlight} strokeWidth="0.8" opacity="0.6" fill="none" />
      
      {/* Center S Symbol */}
      <path
        d="M14.5 8.5C14.5 8.5 13 7 11 7C9 7 7.5 8.5 7.5 10C7.5 11.5 9 12 11 12.5C13 13 14.5 14 14.5 15.5C14.5 17.5 12.5 18.5 11 18.5C9 18.5 7.5 17 7.5 17"
        stroke={symbol}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <defs>
        <linearGradient id={`grad-base-${type}`} x1="12" y1="1" x2="12" y2="21" gradientUnits="userSpaceOnUse">
          <stop stopColor={highlight} />
          <stop offset="0.2" stopColor={base} />
          <stop offset="1" stopColor={base} />
        </linearGradient>
        <linearGradient id={`grad-inner-${type}`} x1="12" y1="3.5" x2="12" y2="18.5" gradientUnits="userSpaceOnUse">
          <stop stopColor={inner} />
          <stop offset="1" stopColor={base} />
        </linearGradient>
      </defs>
    </svg>
  );
};
