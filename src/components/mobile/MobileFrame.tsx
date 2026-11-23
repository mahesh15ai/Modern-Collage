'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import {
  ChevronLeft,
  Home,
  Award,
  Bell,
  Grid,
} from 'lucide-react';

interface MobileFrameProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  showNav?: boolean;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({
  children,
  title,
  showBack = false,
  onBack,
  showNav = true,
}) => {
  const { activeScreen, setActiveScreen } = useApp();
  const isFullScreenMode = activeScreen === 'splash' || activeScreen === 'login';

  return (
    <div className="relative w-full max-w-lg min-h-screen bg-white sm:shadow-xl sm:border-x sm:border-slate-200/80 flex flex-col font-sans mx-auto">
      {/* Standard Clean Screen Header */}
      {title ? (
        <header className="sticky top-0 h-14 bg-white/95 backdrop-blur-md px-4 flex items-center justify-between border-b border-slate-100 shrink-0 z-30">
          <div className="flex items-center space-x-2">
            {showBack && (
              <button
                onClick={onBack || (() => setActiveScreen('dashboard'))}
                className="p-1.5 rounded-full text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Go back"
              >
                <ChevronLeft className="w-5 h-5 text-slate-800" />
              </button>
            )}
            <h1 className="font-extrabold text-slate-900 text-base">{title}</h1>
          </div>
          <div className="w-6" />
        </header>
      ) : null}

      {/* Screen Content Container */}
      <main className={`flex-1 w-full bg-slate-50 relative flex flex-col ${showNav && !isFullScreenMode ? 'pb-20' : ''}`}>
        {children}
      </main>

      {/* Standard Mobile Bottom Navigation */}
      {showNav && !isFullScreenMode && (
        <nav className="fixed bottom-0 inset-x-0 max-w-lg mx-auto h-16 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-6 flex items-center justify-between z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
          <button
            onClick={() => setActiveScreen('dashboard')}
            className={`flex flex-col items-center justify-center space-y-1 transition-colors ${activeScreen === 'dashboard' ? 'text-blue-700 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px]">Home</span>
          </button>

          <button
            onClick={() => setActiveScreen('results')}
            className={`flex flex-col items-center justify-center space-y-1 transition-colors ${activeScreen === 'results' ? 'text-blue-700 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
          >
            <Award className="w-5 h-5" />
            <span className="text-[10px]">Results</span>
          </button>

          <button
            onClick={() => setActiveScreen('notices')}
            className={`flex flex-col items-center justify-center space-y-1 transition-colors ${activeScreen === 'notices' ? 'text-blue-700 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
          >
            <div className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
            </div>
            <span className="text-[10px]">Notices</span>
          </button>

          <button
            onClick={() => setActiveScreen('profile')}
            className={`flex flex-col items-center justify-center space-y-1 transition-colors ${activeScreen === 'profile' ? 'text-blue-700 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
          >
            <Grid className="w-5 h-5" />
            <span className="text-[10px]">Profile / ID</span>
          </button>
        </nav>
      )}
    </div>
  );
};
