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
  Menu,
  IdCard,
  LogOut,
  Monitor,
  TrendingUp,
  Calendar,
  BookOpen,
  AlertCircle,
  Trophy,
  CreditCard,
  LayoutGrid,
  GraduationCap,
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
    result,
    fees,
    notices,
    unreadNoticesCount,
    events,
    recordAttendance,
    isDrawerOpen,
    setIsDrawerOpen,
    setViewMode,
    logout,
    setRole,
  } = useApp();

  const isFullScreenMode = activeScreen === 'splash' || activeScreen === 'login';
  const isFaculty = currentUser.role === 'faculty';

  // Navigation Drawer Sections configuration
  const drawerNavSections = [
    {
      title: isFaculty ? 'TEACHING & ACADEMICS' : 'ACADEMICS & LEARNING',
      items: [
        { id: 'dashboard', label: 'Dashboard / Home', icon: Home, screen: 'dashboard' as const, badge: null, color: 'text-blue-600 bg-blue-50' },
        {
          id: 'profile',
          label: isFaculty ? 'Faculty ID Card & Profile' : 'Digital ID Card & Profile',
          icon: IdCard,
          screen: 'profile' as const,
          badge: isFaculty ? 'Staff ID' : 'Verified',
          color: 'text-indigo-600 bg-indigo-50',
        },
        {
          id: 'attendance',
          label: isFaculty ? 'Lecture & Class Attendance' : 'QR Attendance Pass',
          icon: QrCode,
          screen: 'attendance' as const,
          badge: isFaculty ? '88% Avg' : `${attendance.overallPercentage}%`,
          color: 'text-emerald-600 bg-emerald-50',
        },
        {
          id: 'results',
          label: isFaculty ? 'Class Results & Evaluation' : 'Examination Results',
          icon: TrendingUp,
          screen: 'results' as const,
          badge: isFaculty ? 'Grade' : `${result.overallPercentage}%`,
          color: 'text-purple-600 bg-purple-50',
        },
        {
          id: 'timetable',
          label: isFaculty ? 'Teaching Schedule' : 'Daily Timetable',
          icon: Calendar,
          screen: 'timetable' as const,
          badge: null,
          color: 'text-sky-600 bg-sky-50',
        },
        {
          id: 'materials',
          label: isFaculty ? 'Courseware & Materials' : 'Study Materials & Notes',
          icon: BookOpen,
          screen: 'materials' as const,
          badge: null,
          color: 'text-teal-600 bg-teal-50',
        },
      ],
    },
    {
      title: isFaculty ? 'CAMPUS & STAFF SERVICES' : 'CAMPUS SERVICES & SUPPORT',
      items: [
        ...(isFaculty
          ? [
            {
              id: 'department',
              label: 'Department & Syllabus',
              icon: BookOpen,
              screen: 'materials' as const,
              badge: 'Syllabus',
              color: 'text-teal-600 bg-teal-50',
            },
          ]
          : [
            {
              id: 'fees',
              label: 'College Fees & Dues',
              icon: CreditCard,
              screen: 'fees' as const,
              badge: fees.pendingAmount > 0 ? `₹${fees.pendingAmount.toLocaleString('en-IN')}` : 'Paid',
              color: 'text-amber-600 bg-amber-50',
            },
          ]),
        { id: 'notices', label: 'Notice Board & Circulars', icon: Bell, screen: 'notices' as const, badge: unreadNoticesCount > 0 ? `${unreadNoticesCount} New` : null, color: 'text-rose-600 bg-rose-50' },
        { id: 'events', label: 'Events, Sports & Fests', icon: Trophy, screen: 'events' as const, badge: events.length > 0 ? `${events.length}` : null, color: 'text-violet-600 bg-violet-50' },
        { id: 'complaints', label: isFaculty ? 'Staff Grievance & Helpdesk' : 'Grievance & Student Support', icon: AlertCircle, screen: 'complaints' as const, badge: null, color: 'text-slate-600 bg-slate-100' },
      ],
    },
  ];

  // Close drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        setIsDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen, setIsDrawerOpen]);

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
    let attendancePayload: string;
    if (isFaculty) {
      attendancePayload = JSON.stringify({
        app: 'MODERN_COLLEGE_FACULTY_PASS',
        type: 'FACULTY_LECTURE_ATTENDANCE_PASS',
        facultyId: currentUser.id || 'FAC-001',
        name: currentUser.name,
        designation: currentUser.designation || 'Assistant Professor',
        department: currentUser.department || 'Computer Science',
        employeeId: currentUser.employeeId || currentUser.id || 'FAC-102',
        verified: true,
        issuedAt: new Date().toISOString(),
      });
    } else {
      attendancePayload = JSON.stringify({
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
    }

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
  }, [currentUser, currentStudent, studentName, studentRoll, studentPrn, studentClass, isFaculty]);

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
            {activeScreen === 'profile' && (
              <GraduationCap className="w-5 h-5 text-slate-800 shrink-0" />
            )}
            <h1 className="font-extrabold text-slate-900 text-base">{title}</h1>
          </div>
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="p-1.5 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5 text-slate-800" />
          </button>
        </header>
      ) : null}

      {/* Screen Content Container */}
      <main className={`flex-1 w-full bg-slate-50 relative flex flex-col ${showNav && !isFullScreenMode ? 'pb-28' : ''}`}>
        {children}
      </main>

      {/* =========================================================================
          FLOATING CAPSULE BOTTOM NAVIGATION (Matches Reference Image Exactly)
         ========================================================================= */}
      {showNav && !isFullScreenMode && (
        <div className="fixed bottom-3 inset-x-3 max-w-lg mx-auto z-40 pointer-events-none">
          <nav className="relative h-[70px] bg-white rounded-full shadow-[0_12px_45px_rgba(0,0,0,0.1)] border border-slate-200/90 px-3 flex items-center justify-between pointer-events-auto">
            {/* 1. Home */}
            <button
              type="button"
              onClick={() => setActiveScreen('dashboard')}
              className="flex-1 flex flex-col items-center justify-center py-1 transition-all group active:scale-95"
            >
              <Home
                className={`w-6 h-6 transition-colors ${activeScreen === 'dashboard'
                  ? 'text-[#2563eb] stroke-[2.4]'
                  : 'text-slate-400 group-hover:text-slate-600 stroke-[2]'
                  }`}
              />
              <span
                className={`text-[11px] mt-0.5 leading-none transition-colors ${activeScreen === 'dashboard'
                  ? 'font-bold text-[#2563eb]'
                  : 'font-medium text-slate-500 group-hover:text-slate-700'
                  }`}
              >
                Home
              </span>
              {/* Active Dot Indicator */}
              <span
                className={`w-1.5 h-1.5 rounded-full mt-1 transition-all ${activeScreen === 'dashboard'
                  ? 'bg-[#2563eb] opacity-100 scale-100 shadow-sm'
                  : 'bg-transparent opacity-0 scale-50'
                  }`}
              />
            </button>

            {/* 2. Results */}
            <button
              type="button"
              onClick={() => setActiveScreen('results')}
              className="flex-1 flex flex-col items-center justify-center py-1 transition-all group active:scale-95"
            >
              <Award
                className={`w-6 h-6 transition-colors ${activeScreen === 'results'
                  ? 'text-[#2563eb] stroke-[2.4]'
                  : 'text-slate-400 group-hover:text-slate-600 stroke-[2]'
                  }`}
              />
              <span
                className={`text-[11px] mt-0.5 leading-none transition-colors ${activeScreen === 'results'
                  ? 'font-bold text-[#2563eb]'
                  : 'font-medium text-slate-500 group-hover:text-slate-700'
                  }`}
              >
                Results
              </span>
              {/* Active Dot Indicator */}
              <span
                className={`w-1.5 h-1.5 rounded-full mt-1 transition-all ${activeScreen === 'results'
                  ? 'bg-[#2563eb] opacity-100 scale-100 shadow-sm'
                  : 'bg-transparent opacity-0 scale-50'
                  }`}
              />
            </button>

            {/* 3. CENTER: ATTENDANCE QR (Prominent floating action button with white halo & starburst) */}
            <div className="flex-1 flex flex-col items-center justify-center -mt-8 shrink-0 z-10">
              {/* Outer halo / cradle ring */}
              <div className="p-1 bg-white rounded-full shadow-[0_8px_25px_rgba(37,99,235,0.35)] ring-4 ring-white transition-transform hover:scale-105 active:scale-95">
                <button
                  type="button"
                  onClick={() => setShowQrModal(true)}
                  className="w-[56px] h-[56px] rounded-full bg-gradient-to-tr from-[#1d4ed8] via-[#2563eb] to-[#3b82f6] text-white flex items-center justify-center shadow-inner border-2 border-white/80 group"
                  title="Attendance QR Pass & Scanner"
                  aria-label="Attendance QR Pass"
                >
                  <div className="relative flex items-center justify-center">
                    <QrCode className="w-7 h-7 text-white stroke-[2.2] transition-transform group-hover:rotate-6" />
                    {/* Starburst icon in exact center of QR code (matching reference image) */}
                    <span className="absolute text-[11px] text-white font-extrabold pointer-events-none drop-shadow-sm leading-none select-none">
                      ✦
                    </span>
                  </div>
                </button>
              </div>
              <span className="text-[10px] font-black text-[#0f2c77] mt-1 tracking-tight uppercase whitespace-nowrap">
                ATTENDANCE QR
              </span>
            </div>

            {/* 4. Notices */}
            <button
              type="button"
              onClick={() => setActiveScreen('notices')}
              className="flex-1 flex flex-col items-center justify-center py-1 transition-all group active:scale-95"
            >
              <div className="relative">
                <Bell
                  className={`w-6 h-6 transition-colors ${activeScreen === 'notices'
                    ? 'text-[#2563eb] stroke-[2.4]'
                    : 'text-slate-400 group-hover:text-slate-600 stroke-[2]'
                    }`}
                />
                {/* Red notification dot (only shown when unread notices exist) */}
                {unreadNoticesCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#ef4444] border-2 border-white rounded-full shadow-sm animate-pulse" />
                )}
              </div>
              <span
                className={`text-[11px] mt-0.5 leading-none transition-colors ${activeScreen === 'notices'
                  ? 'font-bold text-[#2563eb]'
                  : 'font-medium text-slate-500 group-hover:text-slate-700'
                  }`}
              >
                Notices
              </span>
              {/* Active Dot Indicator */}
              <span
                className={`w-1.5 h-1.5 rounded-full mt-1 transition-all ${activeScreen === 'notices'
                  ? 'bg-[#2563eb] opacity-100 scale-100 shadow-sm'
                  : 'bg-transparent opacity-0 scale-50'
                  }`}
              />
            </button>

            {/* 5. Profile / ID */}
            <button
              type="button"
              onClick={() => setActiveScreen('profile')}
              className="flex-1 flex flex-col items-center justify-center py-1 transition-all group active:scale-95"
            >
              <LayoutGrid
                className={`w-6 h-6 transition-colors ${activeScreen === 'profile'
                  ? 'text-[#2563eb] stroke-[2.4]'
                  : 'text-slate-400 group-hover:text-slate-600 stroke-[2]'
                  }`}
              />
              <span
                className={`text-[11px] mt-0.5 leading-none transition-colors ${activeScreen === 'profile'
                  ? 'font-bold text-[#2563eb]'
                  : 'font-medium text-slate-500 group-hover:text-slate-700'
                  }`}
              >
                Profile / ID
              </span>
              {/* Active Dot Indicator */}
              <span
                className={`w-1.5 h-1.5 rounded-full mt-1 transition-all ${activeScreen === 'profile'
                  ? 'bg-[#2563eb] opacity-100 scale-100 shadow-sm'
                  : 'bg-transparent opacity-0 scale-50'
                  }`}
              />
            </button>
          </nav>
        </div>
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
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center space-x-1 transition-all ${qrModalTab === 'pass'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>My QR Pass</span>
              </button>

              <button
                onClick={() => setQrModalTab('scanner')}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center space-x-1 transition-all ${qrModalTab === 'scanner'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{isFaculty ? 'Scan Student QR' : 'Scan Classroom QR'}</span>
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
                {/* Faculty vs Student Info Pill */}
                {isFaculty ? (
                  <div className="p-3 bg-gradient-to-r from-[#071D3A] via-blue-950 to-indigo-950 text-white rounded-2xl">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-sm">{currentUser.name}</h4>
                      <span className="text-[9px] bg-amber-400 text-slate-900 font-extrabold px-2 py-0.5 rounded-full">
                        FACULTY PASS
                      </span>
                    </div>
                    <p className="text-[11px] text-blue-200 mt-0.5">
                      {currentUser.designation || 'Assistant Professor'} • {currentUser.department || 'Computer Science'} Dept
                    </p>
                    <div className="flex items-center justify-center space-x-3 mt-1.5 text-[10px] font-mono text-amber-300">
                      <span>EMP ID: <strong>{currentUser.employeeId || currentUser.id || 'FAC-102'}</strong></span>
                      <span>•</span>
                      <span>Status: <strong>Active Staff</strong></span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-gradient-to-r from-[#071D3A] via-blue-950 to-indigo-950 text-white rounded-2xl">
                    <h4 className="font-extrabold text-sm">{studentName}</h4>
                    <p className="text-[11px] text-blue-200 mt-0.5">{studentClass}</p>
                    <div className="flex items-center justify-center space-x-3 mt-1.5 text-[10px] font-mono text-amber-300">
                      <span>Roll: <strong>{studentRoll}</strong></span>
                      <span>•</span>
                      <span>PRN: <strong>{studentPrn}</strong></span>
                    </div>
                  </div>
                )}

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
                  {isFaculty
                    ? '📷 Present this Official Faculty ID & Lecture Pass to security or campus attendance terminals.'
                    : '📷 Present this QR code on your phone screen to the professor or classroom terminal for attendance.'}
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

      {/* =========================================================================
          SLIDE-OVER NAVIGATION MENU DRAWER (Centered with max-w-lg on desktop)
         ========================================================================= */}
      {/* 1. Backdrop Overlay */}
      <div
        className={`fixed inset-0 bg-slate-950/65 backdrop-blur-sm z-50 transition-opacity duration-300 ${isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => setIsDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* 2. Responsive Anchor Wrapper (Always aligned with the centered app on desktop) */}
      <div
        className={`fixed inset-0 z-50 pointer-events-none flex justify-center transition-opacity duration-300 ${isDrawerOpen ? 'opacity-100' : 'opacity-0'
          }`}
      >
        <div className="w-full max-w-lg h-full relative pointer-events-none overflow-hidden">
          <aside
            className={`absolute inset-y-0 left-0 w-[84%] max-w-[340px] bg-white shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ease-out pointer-events-auto ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
              }`}
            aria-label="Campus Navigation Drawer"
          >
            {/* Drawer Header with College Brand & Student Snapshot */}
            <div className="relative bg-gradient-to-br from-[#071D3A] via-[#0B254E] to-[#1E3A8A] text-white p-4 pt-5 shadow-lg shrink-0">
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-white/10 hover:bg-white/25 text-white/90 hover:text-white transition-all active:scale-95"
                aria-label="Close navigation drawer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* College Identity */}
              <div className="flex items-center space-x-3 pr-8">
                <CollegeLogo size={44} className="shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <h3 className="font-extrabold text-sm text-white tracking-wide truncate">
                      MODERN COLLEGE
                    </h3>
                  </div>
                  <p className="text-[10px] text-blue-200 font-medium leading-tight">
                    Ganeshkhind, Pune • Autonomous
                  </p>
                  <div className="mt-1 flex items-center space-x-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[9px] font-bold text-emerald-300 tracking-wider uppercase">
                      NAAC &apos;A+&apos; Grade • SPPU
                    </span>
                  </div>
                </div>
              </div>

              {/* Authenticated User Identity Snapshot (Student shows Student info, Teacher shows Teacher info) */}
              <div className="mt-3.5 pt-3 border-t border-white/15">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                    <div className="w-9 h-9 rounded-xl overflow-hidden border border-white/30 shrink-0">
                      <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                      <p className="text-[10px] text-blue-200 truncate">
                        {isFaculty
                          ? `${currentUser.designation || 'Faculty Member'} • ${currentUser.department ? `${currentUser.department} Dept` : 'CS Dept'}`
                          : `${currentUser.course || 'B.Sc Computer Science'} ${currentUser.semester ? `• ${currentUser.semester}` : ''}`}
                      </p>
                      {isFaculty && currentUser.classTeacherOf && (
                        <p className="text-[9px] text-amber-300 font-bold truncate mt-0.5 flex items-center">
                          <Award className="w-3 h-3 mr-1 shrink-0 text-amber-300" />
                          <span>Class Teacher: {currentUser.classTeacherOf}</span>
                        </p>
                      )}
                      {!isFaculty && currentUser.rollNo && (
                        <p className="text-[9px] text-blue-300 font-mono mt-0.5">
                          Roll No: {currentUser.rollNo}
                        </p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`text-[9px] font-black tracking-wider px-2.5 py-1 rounded-full border shrink-0 ${isFaculty
                      ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                      : 'bg-blue-400/20 text-blue-200 border-blue-400/40'
                      }`}
                  >
                    {isFaculty ? 'FACULTY' : 'STUDENT'}
                  </span>
                </div>
              </div>
            </div>

            {/* Scrollable Navigation List (Clean modern scrollbar) */}
            <div className="flex-1 overflow-y-auto py-3 px-3 space-y-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {drawerNavSections.map((section, sIdx) => (
                <div key={sIdx} className="space-y-1">
                  <div className="px-3 py-1 text-[9px] font-bold tracking-wider text-slate-400 uppercase">
                    {section.title}
                  </div>
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeScreen === item.screen;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setIsDrawerOpen(false);
                          setActiveScreen(item.screen);
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-left group ${isActive
                          ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/25'
                          : 'text-slate-700 hover:bg-slate-100 active:bg-slate-200'
                          }`}
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isActive ? 'bg-white/20 text-white' : item.color
                              }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className={`text-xs truncate ${isActive ? 'text-white font-bold' : 'font-semibold text-slate-800 group-hover:text-blue-900'}`}>
                            {item.label}
                          </span>
                        </div>
                        {item.badge && (
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 transition-colors ${isActive
                              ? 'bg-white/20 text-white border-white/30'
                              : 'bg-slate-100 text-slate-600 border-slate-200 group-hover:bg-blue-50 group-hover:text-blue-700 group-hover:border-blue-200'
                              }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Bottom Actions */}
            <div className="p-3 border-t border-slate-100 bg-slate-50 space-y-2 shrink-0">
              {/* Switch to Desktop ERP */}
              <button
                type="button"
                onClick={() => {
                  setIsDrawerOpen(false);
                  setViewMode('desktop');
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white shadow-sm hover:shadow-md transition-all active:scale-[0.98] text-xs font-bold"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center shrink-0 border border-white/20">
                    <Monitor className="w-3.5 h-3.5 text-blue-200" />
                  </div>
                  <span>Desktop ERP Portal</span>
                </div>
                <span className="text-[9px] bg-blue-500/80 px-2 py-0.5 rounded-md font-mono border border-blue-300/30">
                  OPEN ↗
                </span>
              </button>

              {/* Logout Button */}
              <button
                type="button"
                onClick={async () => {
                  setIsDrawerOpen(false);
                  await logout();
                }}
                className="w-full flex items-center space-x-2.5 p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-100 transition-all text-xs font-bold active:scale-[0.98]"
              >
                <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <LogOut className="w-3.5 h-3.5" />
                </div>
                <span>Sign Out / Log Out</span>
              </button>

              <div className="pt-0.5 text-center">
                <span className="text-[9px] text-slate-400 font-medium">
                  Modern College Autonomous Pune • v2.4
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
