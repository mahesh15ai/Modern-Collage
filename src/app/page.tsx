'use client';

import React, { useEffect, useState } from 'react';
import { useApp, MobileScreen } from '@/context/AppContext';
import { MobileFrame } from '@/components/mobile/MobileFrame';
import { SplashScreen } from '@/components/mobile/SplashScreen';
import { LoginScreen } from '@/components/mobile/LoginScreen';
import { StudentDashboard } from '@/components/mobile/StudentDashboard';
import { AttendanceView } from '@/components/mobile/AttendanceView';
import { ResultsView } from '@/components/mobile/ResultsView';
import { TimetableView } from '@/components/mobile/TimetableView';
import { StudyMaterialsView } from '@/components/mobile/StudyMaterialsView';
import { FeesView } from '@/components/mobile/FeesView';
import { ComplaintsView } from '@/components/mobile/ComplaintsView';
import { EventsView } from '@/components/mobile/EventsView';
import { NoticesView } from '@/components/mobile/NoticesView';
import { ProfileView } from '@/components/mobile/ProfileView';
import { AdminPortal } from '@/components/admin/AdminPortal';
import {
  Laptop,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export default function Home() {
  const {
    viewMode,
    setViewMode,
    activeScreen,
    setActiveScreen,
    currentUser,
    isAuthenticated,
    logout,
    login,
  } = useApp();

  const [qrToast, setQrToast] = useState<{ show: boolean; name: string } | null>(null);

  // Automatic 1-Tap QR Admission Pass Login Detector
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const qrParam = params.get('auth_qr');
    if (qrParam) {
      try {
        const decodedJson = atob(decodeURIComponent(qrParam));
        const payload = JSON.parse(decodedJson);
        if (payload && payload.email && payload.pass) {
          login(payload.email, payload.pass, payload.role || 'student')
            .then(() => {
              setQrToast({ show: true, name: payload.name || 'Student' });
              setTimeout(() => setQrToast(null), 6000);
              const cleanUrl = window.location.pathname;
              window.history.replaceState({}, document.title, cleanUrl);
            })
            .catch((err) => {
              console.error('QR Login Error:', err);
            });
        }
      } catch (e) {
        console.warn('Invalid QR auth token payload:', e);
      }
    }
  }, [login]);

  // Register PWA Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.log('SW registration failed: ', err);
      });
    }
  }, []);

  // Screen configuration for the mobile app
  const screenTitleMap: Record<MobileScreen, string | undefined> = {
    splash: undefined,
    login: undefined,
    dashboard: undefined,
    attendance: 'My Attendance',
    results: 'My Results',
    timetable: 'Timetable',
    materials: 'Study Materials',
    fees: 'Fees Details',
    complaints: 'Complaints',
    events: 'Events & Activities',
    notices: 'Notice Board',
    profile: 'Student Profile',
  };

  const renderActiveMobileScreen = () => {
    switch (activeScreen) {
      case 'splash':
        return <SplashScreen />;
      case 'login':
        return <LoginScreen />;
      case 'dashboard':
        return <StudentDashboard />;
      case 'attendance':
        return <AttendanceView />;
      case 'results':
        return <ResultsView />;
      case 'timetable':
        return <TimetableView />;
      case 'materials':
        return <StudyMaterialsView />;
      case 'fees':
        return <FeesView />;
      case 'complaints':
        return <ComplaintsView />;
      case 'events':
        return <EventsView />;
      case 'notices':
        return <NoticesView />;
      case 'profile':
        return <ProfileView />;
      default:
        return <StudentDashboard />;
    }
  };

  if (viewMode === 'desktop') {
    if (isAuthenticated && currentUser.role !== 'admin') {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center font-sans">
          <div className="max-w-md bg-slate-900 border border-rose-500/30 rounded-3xl p-8 shadow-2xl space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8 text-rose-400" />
            </div>
            <h2 className="text-xl font-extrabold text-white">Access Denied • Permission Restricted</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              The <strong>Desktop ERP Admin Portal</strong> is strictly restricted to Institutional Administrators and Principal. Your active account (<span className="text-white font-mono">{currentUser.email || currentUser.name}</span>) is provisioned with the role of <span className="text-amber-400 font-bold uppercase">{currentUser.role}</span>.
            </p>
            <div className="pt-2 flex flex-col space-y-2">
              <button
                onClick={() => setViewMode('mobile')}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-lg transition-all"
              >
                Return to Smart Campus Mobile
              </button>
              <button
                onClick={logout}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold text-xs transition-all"
              >
                Sign Out &amp; Login as Administrator
              </button>
            </div>
          </div>
        </div>
      );
    }
    return <AdminPortal />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-start items-center text-slate-900 relative">
      {/* 1-Tap QR Login Notification Toast */}
      {qrToast && qrToast.show && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-400/50 flex items-center space-x-3 animate-in fade-in slide-in-from-top-4 duration-300 max-w-sm w-full">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 pr-1">
            <h4 className="font-bold text-xs flex items-center space-x-1">
              <span>🎉 QR Pass Verified &amp; Signed In!</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            </h4>
            <p className="text-[11px] text-emerald-100 mt-0.5">Welcome, {qrToast.name}! Smart Campus loaded.</p>
          </div>
        </div>
      )}

      {/* Discreet Desktop ERP Switcher for Admin only */}
      {isAuthenticated && currentUser.role === 'admin' && (
        <button
          onClick={() => setViewMode('desktop')}
          className="fixed top-3 right-3 z-50 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-xs font-semibold text-blue-400 flex items-center space-x-1.5 shadow-lg backdrop-blur-md transition-all active:scale-95"
          title="Switch to Desktop ERP Portal"
        >
          <Laptop className="w-4 h-4 text-blue-400" />
          <span className="hidden sm:inline">Desktop ERP Portal</span>
          <span className="sm:hidden">ERP</span>
        </button>
      )}

      {/* Main Full-App Responsive View (No Phone Bezel/Mockup) */}
      <div className="w-full flex-1 flex justify-center">
        <MobileFrame
          title={screenTitleMap[activeScreen]}
          showBack={activeScreen !== 'dashboard' && activeScreen !== 'splash' && activeScreen !== 'login'}
          onBack={() => setActiveScreen('dashboard')}
          showNav={activeScreen !== 'splash' && activeScreen !== 'login'}
        >
          {renderActiveMobileScreen()}
        </MobileFrame>
      </div>
    </div>
  );
}
