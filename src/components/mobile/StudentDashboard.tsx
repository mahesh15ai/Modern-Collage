'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Menu,
  X,
  Bell,
  GraduationCap,
  CheckCircle2,
  TrendingUp,
  CreditCard,
  Calendar,
  BookOpen,
  AlertCircle,
  Trophy,
  ChevronRight,
  Sparkles,
  Home,
  QrCode,
  IdCard,
  LogOut,
  Monitor,
} from 'lucide-react';
import CollegeLogo from '@/components/common/CollegeLogo';

export const StudentDashboard: React.FC = () => {
  const {
    currentUser,
    attendance,
    result,
    fees,
    notices,
    events,
    setActiveScreen,
    setViewMode,
    logout,
  } = useApp();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navMenuItems = [
    { id: 'dashboard', label: 'Dashboard / Home', icon: Home, screen: 'dashboard' as const, badge: null, color: 'text-blue-600 bg-blue-50' },
    { id: 'profile', label: 'Digital ID Card & Profile', icon: IdCard, screen: 'profile' as const, badge: 'Verified', color: 'text-indigo-600 bg-indigo-50' },
    { id: 'attendance', label: 'QR Attendance Pass', icon: QrCode, screen: 'attendance' as const, badge: `${attendance.overallPercentage}%`, color: 'text-emerald-600 bg-emerald-50' },
    { id: 'results', label: 'Examination Results', icon: TrendingUp, screen: 'results' as const, badge: `${result.overallPercentage}%`, color: 'text-purple-600 bg-purple-50' },
    { id: 'timetable', label: 'Daily Timetable', icon: Calendar, screen: 'timetable' as const, badge: null, color: 'text-sky-600 bg-sky-50' },
    { id: 'materials', label: 'Study Materials & Notes', icon: BookOpen, screen: 'materials' as const, badge: null, color: 'text-teal-600 bg-teal-50' },
    { id: 'fees', label: 'College Fees & Dues', icon: CreditCard, screen: 'fees' as const, badge: fees.pendingAmount > 0 ? `₹${fees.pendingAmount}` : 'Paid', color: 'text-amber-600 bg-amber-50' },
    { id: 'notices', label: 'Notice Board & Circulars', icon: Bell, screen: 'notices' as const, badge: notices.length > 0 ? `${notices.length}` : null, color: 'text-rose-600 bg-rose-50' },
    { id: 'events', label: 'Campus Events & Fests', icon: Trophy, screen: 'events' as const, badge: events.length > 0 ? `${events.length}` : null, color: 'text-violet-600 bg-violet-50' },
    { id: 'complaints', label: 'Grievance & Complaints', icon: AlertCircle, screen: 'complaints' as const, badge: null, color: 'text-slate-600 bg-slate-100' },
  ];

  return (
    <div className="w-full min-h-full p-4 space-y-4 font-sans relative">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open Navigation Menu"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-sm hover:bg-slate-50 active:scale-95 transition-all"
          >
            <Menu className="w-5 h-5 text-slate-800" />
          </button>
          <div>
            <div className="flex items-center space-x-1">
              <h2 className="font-extrabold text-slate-900 text-base">
                Hello, {currentUser.role === 'admin' ? (currentUser.name.includes('College') ? 'Admin' : currentUser.name.split(' ')[0]) : currentUser.name.split(' ')[0]}!
              </h2>
              <span>👋</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Welcome back to Smart Campus
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveScreen('notices')}
            className="relative p-2 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-sm hover:bg-slate-50"
            aria-label="View Notices"
          >
            <Bell className="w-4 h-4 text-slate-800" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white" />
          </button>
          <div
            onClick={() => setActiveScreen('profile')}
            className="w-9 h-9 rounded-xl overflow-hidden border-2 border-blue-600 cursor-pointer shadow-sm hover:ring-2 hover:ring-blue-400 active:scale-95 transition-all"
            title="View Profile / ID Card"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Dynamic Program / Course Banner */}
      {currentUser.role === 'admin' ? (
        <div
          onClick={() => setViewMode('desktop')}
          className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-2xl p-4 text-white shadow-md flex items-center justify-between cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all active:scale-[0.98]"
          title="Click to open Desktop ERP Portal"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20 shrink-0">
              <GraduationCap className="w-6 h-6 text-blue-200" />
            </div>
            <div>
              <h3 className="font-bold text-xs tracking-wide">College Administration ERP</h3>
              <p className="text-[11px] text-blue-200 font-medium">Click to open Desktop ERP Portal →</p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] bg-blue-600/60 px-2.5 py-1 rounded-full font-mono text-blue-100 font-bold border border-blue-400/30">
              OPEN ERP ↗
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-2xl p-4 text-white shadow-md flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20 shrink-0">
              <GraduationCap className="w-6 h-6 text-blue-200" />
            </div>
            <div>
              <h3 className="font-bold text-xs tracking-wide">
                {currentUser.course || 'Undergraduate / Post Graduate'}
              </h3>
              <p className="text-[11px] text-blue-200 font-medium">
                {currentUser.semester || (currentUser.department ? `${currentUser.department} Dept` : 'Academic Session 2026-27')}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] bg-blue-600/60 px-2.5 py-1 rounded-full font-mono text-blue-100 font-bold border border-blue-400/30">
              {currentUser.rollNo || currentUser.prn || 'STUDENT'}
            </span>
          </div>
        </div>
      )}

      {/* 4 Stat Cards Grid (Matches Mockup exactly) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Attendance Card */}
        <div
          onClick={() => setActiveScreen('attendance')}
          className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-98"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="text-xl font-extrabold text-slate-900">
            {attendance.overallPercentage}%
          </div>
          <div className="text-[11px] text-slate-500 font-medium">Attendance</div>
        </div>

        {/* Result Card */}
        <div
          onClick={() => setActiveScreen('results')}
          className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-98"
        >
          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-2">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="text-xl font-extrabold text-slate-900">
            {result.overallPercentage}%
          </div>
          <div className="text-[11px] text-slate-500 font-medium">Result</div>
        </div>

        {/* Fees Due Card */}
        <div
          onClick={() => setActiveScreen('fees')}
          className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-98"
        >
          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-2">
            <CreditCard className="w-5 h-5" />
          </div>
          <div className="text-xl font-extrabold text-slate-900">
            ₹{fees.pendingAmount.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">Fees Due</div>
        </div>

        {/* Notices Card */}
        <div
          onClick={() => setActiveScreen('notices')}
          className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-98"
        >
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-2">
            <Bell className="w-5 h-5" />
          </div>
          <div className="text-xl font-extrabold text-slate-900">
            {notices.length}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">Notices</div>
        </div>
      </div>

      {/* Quick Access Grid (Matches Mockup: Timetable, Study Materials, Complaints, Events) */}
      <div>
        <h4 className="font-bold text-slate-800 text-xs mb-2.5">Quick Access</h4>
        <div className="grid grid-cols-4 gap-2">
          {/* Timetable */}
          <button
            onClick={() => setActiveScreen('timetable')}
            className="flex flex-col items-center p-2.5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:bg-blue-50 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-1.5">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-semibold text-slate-700 text-center leading-tight">
              Timetable
            </span>
          </button>

          {/* Study Materials */}
          <button
            onClick={() => setActiveScreen('materials')}
            className="flex flex-col items-center p-2.5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:bg-blue-50 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-1.5">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-semibold text-slate-700 text-center leading-tight">
              Study Materials
            </span>
          </button>

          {/* Complaints */}
          <button
            onClick={() => setActiveScreen('complaints')}
            className="flex flex-col items-center p-2.5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:bg-blue-50 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-1.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-semibold text-slate-700 text-center leading-tight">
              Complaints
            </span>
          </button>

          {/* Events */}
          <button
            onClick={() => setActiveScreen('events')}
            className="flex flex-col items-center p-2.5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:bg-blue-50 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-1.5">
              <Trophy className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-semibold text-slate-700 text-center leading-tight">
              Events
            </span>
          </button>
        </div>
      </div>

      {/* Real Events Banner (Shown only if actual events are published) */}
      {events.length > 0 ? (
        <div
          onClick={() => setActiveScreen('events')}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950 via-indigo-900 to-purple-950 p-4 text-white shadow-md cursor-pointer group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl -mr-10 -mt-10" />
          <div className="relative flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-1 text-amber-400 text-[10px] font-bold tracking-wider uppercase">
                <Sparkles className="w-3 h-3" />
                <span>Featured Event</span>
              </div>
              <h4 className="font-extrabold text-sm text-white">{events[0].title}</h4>
              <p className="text-[11px] text-blue-200">{events[0].subtitle}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white group-hover:translate-x-1 transition-transform">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      ) : null}

      {/* =========================================================================
          SLIDE-OVER NAVIGATION MENU DRAWER
         ========================================================================= */}
      {/* Backdrop */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 transition-opacity animate-in fade-in duration-200"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Slide-over Drawer Panel */}
      <aside
        className={`fixed inset-y-0 left-0 max-w-[320px] w-[85%] bg-white z-50 shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Navigation Menu Drawer"
      >
        {/* Top Header with College Branding */}
        <div className="relative bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 text-white p-5 pt-6 shadow-md shrink-0">
          {/* Close button */}
          <button
            onClick={() => setIsMenuOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3 pr-8">
            <CollegeLogo size={42} className="shrink-0" />
            <div>
              <h3 className="font-extrabold text-sm leading-tight text-white tracking-wide">
                MODERN COLLEGE
              </h3>
              <p className="text-[10px] text-blue-200 font-medium leading-snug">
                Autonomous • NAAC &apos;A+&apos; Grade
              </p>
              <div className="mt-1 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-300">Smart Campus Portal</span>
              </div>
            </div>
          </div>

          {/* Student Profile Quick Peek */}
          <div
            onClick={() => {
              setIsMenuOpen(false);
              setActiveScreen('profile');
            }}
            className="mt-4 p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-between cursor-pointer hover:bg-white/20 transition-all group"
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-white/40 shrink-0">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-xs text-white truncate">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-blue-200 truncate">
                  {currentUser.rollNo || currentUser.prn || (currentUser.role === 'admin' ? 'Administrator' : 'Student')}
                </div>
              </div>
            </div>
            <div className="flex items-center text-blue-200 group-hover:text-white transition-colors">
              <span className="text-[10px] font-semibold mr-1">ID Card</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>

        {/* Scrollable Navigation List */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
          <div className="px-3 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            Campus Navigation
          </div>
          {navMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setIsMenuOpen(false);
                  setActiveScreen(item.screen);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100/80 active:bg-slate-200/70 transition-all text-left group"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 truncate">
                    {item.label}
                  </span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 group-hover:bg-blue-100 group-hover:text-blue-700 group-hover:border-blue-200 transition-colors shrink-0">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Drawer Bottom Actions */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/80 space-y-2 shrink-0">
          {/* Switch to Desktop ERP */}
          <button
            onClick={() => {
              setIsMenuOpen(false);
              setViewMode('desktop');
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-blue-50/80 hover:bg-blue-100 border border-blue-100 text-blue-800 transition-all text-xs font-bold active:scale-[0.98]"
          >
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Monitor className="w-3.5 h-3.5" />
              </div>
              <span>Desktop ERP Portal</span>
            </div>
            <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-md font-mono">
              OPEN ↗
            </span>
          </button>

          {/* Logout Button */}
          <button
            onClick={async () => {
              setIsMenuOpen(false);
              await logout();
            }}
            className="w-full flex items-center space-x-2.5 p-2.5 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-100 transition-all text-xs font-bold active:scale-[0.98]"
          >
            <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <LogOut className="w-3.5 h-3.5" />
            </div>
            <span>Sign Out / Log Out</span>
          </button>

          <div className="pt-1 text-center">
            <span className="text-[9px] text-slate-400 font-medium">
              Modern College Autonomous Pune • v2.4
            </span>
          </div>
        </div>
      </aside>
    </div>
  );
};
