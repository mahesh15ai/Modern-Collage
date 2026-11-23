'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import {
  Menu,
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
} from 'lucide-react';

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
    setIsDrawerOpen,
  } = useApp();

  return (
    <div className="w-full min-h-full p-4 space-y-4 font-sans relative">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsDrawerOpen(true)}
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
    </div>
  );
};
