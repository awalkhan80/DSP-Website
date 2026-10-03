import React from 'react';

interface PhoenixLogoProps {
  className?: string;
  variant?: 'full' | 'icon' | 'white' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const PhoenixLogo: React.FC<PhoenixLogoProps> = ({
  className = 'h-11 w-auto',
  variant = 'full',
}) => {
  const isWhite = variant === 'white';

  if (variant === 'icon') {
    return (
      <svg
        className={className}
        viewBox="0 0 60 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Phoenix Desert Safari Logo"
      >
        <defs>
          <linearGradient id="phoenixGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="50%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
          <linearGradient id="phoenixOrange" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EA580C" />
            <stop offset="100%" stopColor="#9A3412" />
          </linearGradient>
        </defs>
        <circle cx="30" cy="30" r="28" fill="#1C1917" stroke="url(#phoenixGold)" strokeWidth="1.5" />
        {/* Phoenix Bird Wings & Flame Icon */}
        <path
          d="M30 12C32 16 35 19 39 21C35 22 33 24 33 28C33 25 31 23 28 23C26 23 24 24 22 26C22 22 25 18 30 12Z"
          fill="url(#phoenixGold)"
        />
        <path
          d="M30 20C34 24 42 26 48 30C41 31 37 36 36 42C35 37 32 34 27 34C22 34 18 38 12 30C19 28 25 24 30 20Z"
          fill="url(#phoenixGold)"
        />
        <path
          d="M30 28C32 32 36 35 41 37C37 39 35 43 34 48C33 44 31 41 27 41C23 41 20 44 19 48C18 43 16 39 12 37C17 35 21 32 23 28C26 31 28 31 30 28Z"
          fill="url(#phoenixOrange)"
        />
        <circle cx="30" cy="22" r="2" fill="#FEF3C7" />
      </svg>
    );
  }

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Emblem SVG */}
      <svg
        className="h-10 w-10 shrink-0"
        viewBox="0 0 60 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="phxGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="45%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
          <linearGradient id="phxFlameGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EA580C" />
            <stop offset="100%" stopColor="#9A3412" />
          </linearGradient>
        </defs>
        <circle
          cx="30"
          cy="30"
          r="28"
          fill={isWhite ? '#1C1917' : '#291811'}
          stroke="url(#phxGoldGrad)"
          strokeWidth="1.75"
        />
        <path
          d="M30 11C32.5 15.5 36 18.5 40.5 20.5C36 21.5 34 23.5 34 27.5C34 24.5 31.5 22.5 28.5 22.5C26.5 22.5 24.5 23.5 22.5 25.5C22.5 21.5 25.5 17.5 30 11Z"
          fill="url(#phxGoldGrad)"
        />
        <path
          d="M30 19C34.5 23.5 43 25.5 49 29.5C42 30.5 38 35.5 37 41.5C36 36.5 33 33.5 28 33.5C23 33.5 19 37.5 13 29.5C20 27.5 26 23.5 30 19Z"
          fill="url(#phxGoldGrad)"
        />
        <path
          d="M30 27C32 31 36 34 41 36C37 38 35 42 34 47C33 43 31 40 27 40C23 40 20 43 19 47C18 42 16 38 12 36C17 34 21 31 23 27C26 30 28 30 30 27Z"
          fill="url(#phxFlameGrad)"
        />
        <circle cx="30" cy="21" r="2.2" fill="#FEF3C7" />
      </svg>

      {/* Brand Typography */}
      <div className="flex flex-col text-left leading-none">
        <span
          className={`font-serif text-lg sm:text-xl font-black tracking-wider uppercase ${
            isWhite ? 'text-white' : 'text-[#1C1917]'
          }`}
          style={{ fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: '0.08em' }}
        >
          THE PHOENIX
        </span>
        <span
          className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-[0.24em] bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 bg-clip-text text-transparent mt-0.5"
          style={{ letterSpacing: '0.22em' }}
        >
          DESERT SAFARI DUBAI
        </span>
      </div>
    </div>
  );
};
