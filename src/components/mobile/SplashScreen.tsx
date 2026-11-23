'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import CollegeLogo from '@/components/common/CollegeLogo';
import { ArrowRight } from 'lucide-react';

export const SplashScreen: React.FC = () => {
  const { setActiveScreen } = useApp();

  return (
    <div className="relative w-full min-h-full flex flex-col justify-between bg-gradient-to-b from-blue-50 via-white to-blue-900/90 overflow-hidden text-center p-6">
      {/* College Crest & Title */}
      <div className="pt-4 flex flex-col items-center">
        <CollegeLogo size={90} />

        <h1 className="mt-6 text-lg font-extrabold text-blue-950 leading-snug px-3">
          Modern College<br />
          <span className="text-sm font-semibold text-slate-700">
            of Computer Science &amp; Information Technology, Nanded
          </span>
        </h1>

        <div className="mt-4 inline-block bg-blue-100 text-blue-900 font-bold px-4 py-1.5 rounded-full text-xs tracking-wide">
          Smart Campus
        </div>

        <p className="mt-2 text-xs font-medium text-slate-500">
          Learn • Grow • Innovate
        </p>
      </div>

      {/* College Campus Imagery Graphic */}
      <div className="my-auto relative">
        <div className="w-full h-44 rounded-2xl overflow-hidden shadow-lg border border-slate-200">
          <img
            src="https://images.unsplash.com/photo-1562774053-701939374585?w=600&auto=format&fit=crop&q=80"
            alt="Modern College Campus"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-950/60 to-transparent flex items-end p-3">
            <span className="text-[11px] text-white font-medium">
              Swami Ramanand Teerth Marathwada University Affiliated
            </span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="pb-8">
        <button
          onClick={() => setActiveScreen('login')}
          className="w-full py-3.5 bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-full font-bold text-sm shadow-xl flex items-center justify-center space-x-2 hover:opacity-95 transition-all active:scale-95"
        >
          <span>Get Started</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
