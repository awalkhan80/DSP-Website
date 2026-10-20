import React from 'react';

interface PhoenixLogoProps {
  className?: string;
  variant?: 'full' | 'icon' | 'white' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const PhoenixLogo: React.FC<PhoenixLogoProps> = ({
  className = 'h-11 w-auto',
}) => {
  return (
    <div className="inline-flex items-center bg-stone-950 px-2.5 py-1 rounded-xl shadow-sm border border-stone-800/80 shrink-0 select-none">
      <img
        src="/assets/aistudio/Phoenix_Logo_4c3d52f8.svg"
        alt="The Phoenix Travel & Tours Dubai"
        className={`object-contain block ${className}`}
        loading="eager"
      />
    </div>
  );
};
