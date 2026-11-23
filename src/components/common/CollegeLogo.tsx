import React from 'react';

interface CollegeLogoProps {
  className?: string;
  size?: number;
  withText?: boolean;
}

export const CollegeLogo: React.FC<CollegeLogoProps> = ({
  className = '',
  size = 64,
  withText = false,
}) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        style={{ width: size, height: size }}
        className="relative flex items-center justify-center shrink-0 p-1 bg-white rounded-2xl shadow-sm border border-slate-100/80 transition-transform duration-200 hover:scale-105"
      >
        <img
          src="/college-logo.png"
          alt="Modern College Nanded Crest"
          className="w-full h-full object-contain"
          loading="eager"
        />
      </div>
      {withText && (
        <div className="mt-2 text-center">
          <div className="font-extrabold text-slate-900 text-sm tracking-wide">
            MODERN COLLEGE
          </div>
          <div className="text-[10px] text-blue-700 font-bold tracking-wider uppercase">
            NANDED
          </div>
        </div>
      )}
    </div>
  );
};

export default CollegeLogo;
