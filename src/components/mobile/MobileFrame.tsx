'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  ChevronLeft,
  Home,
  Award,
  Bell,
  Grid,
  QrCode,
  X,
  Camera,
  CheckCircle2,
  Sparkles,
  ScanLine,
  BarChart3,
  UserCheck,
  Check,
} from 'lucide-react';
import CollegeLogo from '@/components/common/CollegeLogo';
import QRCode from 'qrcode';

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
  const {
    activeScreen,
    setActiveScreen,
    currentUser,
    students,
    attendance,
    recordAttendance,
  } = useApp();

  const isFullScreenMode = activeScreen === 'splash' || activeScreen === 'login';

  // Center QR Attendance Modal State
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrModalTab, setQrModalTab] = useState<'pass' | 'scanner'>('pass');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState<string | null>(null);

  const currentStudent = students.find((s) => s.id === currentUser.id) || students[0];

  const studentName = currentUser.name || currentStudent?.name || 'Rahul Ramesh Shinde';
  const studentRoll = currentUser.rollNo || currentStudent?.rollNo || 'CS-329';
  const studentPrn = currentUser.prn || currentStudent?.prn || '2024015200678912';
  const studentClass = currentUser.course || currentStudent?.course || 'B.Sc Computer Science';

  // Generate dynamic attendance verification QR Code
  useEffect(() => {
    const attendancePayload = JSON.stringify({
      app: 'MODERN_COLLEGE_ATTENDANCE_PASS',
      studentId: currentUser.id || 'STU-001',
      name: studentName,
      rollNo: studentRoll,
      prn: studentPrn,
      course: studentClass,
      session: '2024-2027',
      verified: true,
      issuedAt: new Date().toISOString(),
    });

    QRCode.toDataURL(attendancePayload, {
      width: 320,
      margin: 1,
      color: {
        dark: '#071D3A',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate Attendance QR:', err));
  }, [currentUser, currentStudent, studentName, studentRoll, studentPrn, studentClass]);

  // Handle simulated lecture scan
  const handleSimulateScan = async () => {
    setIsScanning(true);
    setScanSuccess(null);

    setTimeout(async () => {
      setIsScanning(false);
      const newPresent = attendance.present + 1;
      const newTotal = attendance.totalClasses + 1;
      const newOverall = Math.round((newPresent / newTotal) * 100);

      const updated = {
        ...attendance,
        present: newPresent,
        totalClasses: newTotal,
        overallPercentage: newOverall,
      };

      if (recordAttendance) {
        await recordAttendance(currentUser.id || 'STU-001', updated);
      }

      setScanSuccess(`Attendance Registered: Data Structures & Algorithms (Present) ✓`);
      setTimeout(() => setScanSuccess(null), 4000);
    }, 1800);
  };

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

      {/* =========================================================================
          BOTTOM NAVIGATION WITH CENTER ATTENDANCE QR BUTTON
         ========================================================================= */}
      {showNav && !isFullScreenMode && (
        <nav className="fixed bottom-0 inset-x-0 max-w-lg mx-auto h-16 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 sm:px-4 flex items-center justify-between z-40 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
          {/* 1. Home */}
          <button
            onClick={() => setActiveScreen('dashboard')}
            className={`flex flex-col items-center justify-center space-y-1 transition-colors flex-1 ${
              activeScreen === 'dashboard' ? 'text-blue-700 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px]">Home</span>
          </button>

          {/* 2. Results */}
          <button
            onClick={() => setActiveScreen('results')}
            className={`flex flex-col items-center justify-center space-y-1 transition-colors flex-1 ${
              activeScreen === 'results' ? 'text-blue-700 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Award className="w-5 h-5" />
            <span className="text-[10px]">Results</span>
          </button>

          {/* 3. CENTER: ATTENDANCE QR (Prominent floating action button) */}
          <div className="flex-1 flex flex-col items-center justify-center -mt-6">
            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className="w-13 h-13 p-3 rounded-full bg-gradient-to-tr from-blue-700 via-blue-800 to-indigo-950 text-white flex items-center justify-center shadow-xl shadow-blue-900/40 border-[3px] border-white transition-all active:scale-90 hover:scale-105 group"
              title="Attendance QR Pass & Scanner"
              aria-label="Attendance QR Pass"
            >
              <QrCode className="w-6 h-6 text-white group-hover:rotate-6 transition-transform" />
            </button>
            <span className="text-[9px] font-black text-blue-900 mt-0.5 tracking-tight uppercase whitespace-nowrap">
              Attendance QR
            </span>
          </div>

          {/* 4. Notices */}
          <button
            onClick={() => setActiveScreen('notices')}
            className={`flex flex-col items-center justify-center space-y-1 transition-colors flex-1 ${
              activeScreen === 'notices' ? 'text-blue-700 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
            </div>
            <span className="text-[10px]">Notices</span>
          </button>

          {/* 5. Profile / ID */}
          <button
            onClick={() => setActiveScreen('profile')}
            className={`flex flex-col items-center justify-center space-y-1 transition-colors flex-1 ${
              activeScreen === 'profile' ? 'text-blue-700 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Grid className="w-5 h-5" />
            <span className="text-[10px]">Profile / ID</span>
          </button>
        </nav>
      )}

      {/* =========================================================================
          ATTENDANCE QR PASS & SCANNER MODAL (Activated by Middle Button)
         ========================================================================= */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <CollegeLogo size={36} />
                <div>
                  <h3 className="font-black text-sm text-slate-900 uppercase tracking-wide">
                    Attendance QR Pass
                  </h3>
                  <p className="text-[10px] text-blue-600 font-semibold">
                    Modern College Smart Campus
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowQrModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Tabs: My QR Pass vs Scan Classroom QR */}
            <div className="mt-3 flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setQrModalTab('pass')}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center space-x-1 transition-all ${
                  qrModalTab === 'pass'
                    ? 'bg-white text-blue-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>My QR Pass</span>
              </button>

              <button
                onClick={() => setQrModalTab('scanner')}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center space-x-1 transition-all ${
                  qrModalTab === 'scanner'
                    ? 'bg-white text-blue-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Scan Classroom QR</span>
              </button>
            </div>

            {/* Toast Alert Inside Modal */}
            {scanSuccess && (
              <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center space-x-2 font-bold animate-in fade-in slide-in-from-top-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{scanSuccess}</span>
              </div>
            )}

            {/* Tab 1: My QR Pass */}
            {qrModalTab === 'pass' && (
              <div className="mt-3 text-center space-y-3">
                {/* Student Info Pill */}
                <div className="p-3 bg-gradient-to-r from-[#071D3A] via-blue-950 to-indigo-950 text-white rounded-2xl">
                  <h4 className="font-extrabold text-sm">{studentName}</h4>
                  <p className="text-[11px] text-blue-200 mt-0.5">{studentClass}</p>
                  <div className="flex items-center justify-center space-x-3 mt-1.5 text-[10px] font-mono text-amber-300">
                    <span>Roll: <strong>{studentRoll}</strong></span>
                    <span>•</span>
                    <span>PRN: <strong>{studentPrn}</strong></span>
                  </div>
                </div>

                {/* QR Code Container */}
                <div className="p-3 bg-white border-2 border-dashed border-blue-400 rounded-2xl inline-block shadow-sm">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Attendance QR Code"
                      className="w-48 h-48 mx-auto rounded-xl"
                    />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center text-xs text-slate-400">
                      Generating Attendance QR...
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  📷 Present this QR code on your phone screen to the professor or classroom terminal for attendance.
                </p>

                {/* Simulate Teacher Scanner Action */}
                <button
                  type="button"
                  onClick={handleSimulateScan}
                  disabled={isScanning}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>
                    {isScanning ? 'Verifying with Terminal...' : 'Simulate Professor Biometric Scan'}
                  </span>
                </button>
              </div>
            )}

            {/* Tab 2: Scan Classroom QR */}
            {qrModalTab === 'scanner' && (
              <div className="mt-3 space-y-3 text-center">
                {/* Simulated Camera Viewfinder */}
                <div className="relative w-full h-52 bg-slate-900 rounded-2xl overflow-hidden flex flex-col items-center justify-center border-2 border-slate-700 shadow-inner">
                  {/* Scanning Laser Line */}
                  <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 bg-rose-500 shadow-[0_0_8px_#ef4444] animate-pulse" />

                  {/* Corner Targets */}
                  <div className="w-40 h-40 border-2 border-white/50 rounded-2xl flex items-center justify-center relative">
                    <ScanLine className="w-10 h-10 text-white/70 animate-bounce" />
                    <span className="absolute bottom-2 text-[9px] text-white/80 font-mono">
                      Align QR in frame
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 leading-tight">
                  Point camera at the lecture QR code displayed on the classroom projector.
                </p>

                <button
                  type="button"
                  onClick={handleSimulateScan}
                  disabled={isScanning}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" />
                  <span>{isScanning ? 'Scanning Lecture Code...' : 'Scan Today’s Lecture QR'}</span>
                </button>
              </div>
            )}

            {/* Bottom Link: View Full Attendance Record */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1.5 text-slate-600 font-medium text-[11px]">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Overall: <strong>{attendance.overallPercentage}%</strong></span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowQrModal(false);
                  setActiveScreen('attendance');
                }}
                className="text-blue-600 hover:text-blue-800 font-bold text-[11px] flex items-center space-x-1"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>View Full Record →</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
