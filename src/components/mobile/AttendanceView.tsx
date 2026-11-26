'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Check,
  CheckCircle2,
  X,
  Clock,
  BarChart2,
  ArrowRight,
  Calendar,
  ChevronDown,
  Info,
  AlertCircle,
} from 'lucide-react';

export const AttendanceView: React.FC = () => {
  const { attendance, currentUser } = useApp();
  const [selectedMonth, setSelectedMonth] = useState('November 2026');
  const [selectedDay, setSelectedDay] = useState<number>(26); // Default to current date (26) as in mockup
  const [showAllSubjects, setShowAllSubjects] = useState<boolean>(false);

  // Circular Gauge Calculations
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(100, Math.max(0, attendance.overallPercentage || 0));
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const totalClasses =
    attendance.totalClasses ||
    (attendance.present + attendance.absent + attendance.late) ||
    1;

  const isGoodStanding = percentage >= 75;
  const isAverage = percentage >= 60 && percentage < 75;

  // Subjects fallback
  const programName = currentUser.course || 'B.Sc Computer Science';
  const subjectsList =
    attendance.subjectWise && attendance.subjectWise.length > 0
      ? attendance.subjectWise
      : [
        {
          subjectName: programName,
          subjectCode: 'CS-UG',
          attended: attendance.present || 1,
          total: totalClasses,
          percentage: percentage,
        },
      ];

  const displayedSubjects = showAllSubjects ? subjectsList : subjectsList.slice(0, 3);

  // Calendar Day Numbers (1 to 30 as in November mockup)
  const calendarDays = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className="w-full min-h-full p-4 space-y-3.5 bg-slate-50 font-sans">
      {/* =========================================================================
          1. TOP HERO CARD: CIRCULAR GAUGE & OVERALL STANDING
         ========================================================================= */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-sm relative overflow-hidden">
        {/* Soft decorative background ambient blurs (matches mockup aesthetic) */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-100/50 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-teal-100/40 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          {/* Left: Circular Percentage Ring */}
          <div className="relative w-[96px] h-[96px] shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 96 96">
              {/* Background Track Circle */}
              <circle
                cx="48"
                cy="48"
                r={radius}
                stroke="#E2E8F0"
                strokeWidth="8.5"
                fill="transparent"
              />
              {/* Foreground Progress Circle */}
              <circle
                cx="48"
                cy="48"
                r={radius}
                stroke="#059669"
                strokeWidth="8.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {percentage}%
              </span>
            </div>
          </div>

          {/* Subtle Vertical Divider */}
          <div className="w-px h-16 bg-slate-200/80 mx-3 sm:mx-5 shrink-0" />

          {/* Right: Overall Attendance & Standing Status */}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <span className="text-xs font-semibold text-slate-500">
              Overall Attendance
            </span>

            <div className="flex items-center space-x-1.5 mt-1">
              {isGoodStanding ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="text-base sm:text-lg font-bold text-emerald-600 tracking-tight truncate">
                    Good Standing
                  </span>
                </>
              ) : isAverage ? (
                <>
                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                  <span className="text-base sm:text-lg font-bold text-amber-600 tracking-tight truncate">
                    Average Standing
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                  <span className="text-base sm:text-lg font-bold text-rose-600 tracking-tight truncate">
                    Low Attendance
                  </span>
                </>
              )}
            </div>

            <p className="text-xs text-slate-500 font-medium mt-1 truncate">
              {attendance.present} attended out of {totalClasses} class{totalClasses === 1 ? '' : 'es'}
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. THREE COUNTER PILLS: PRESENT, ABSENT, LATE
         ========================================================================= */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {/* Present Card */}
        <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden transition-transform active:scale-95">
          <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
            <Check className="w-5 h-5 stroke-[2.8]" />
          </div>
          <span className="text-xl font-black text-slate-900 mt-2 leading-none">
            {attendance.present}
          </span>
          <span className="text-xs font-medium text-slate-500 mt-1">
            Present
          </span>
        </div>

        {/* Absent Card */}
        <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden transition-transform active:scale-95">
          <div className="w-9 h-9 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xs">
            <X className="w-5 h-5 stroke-[2.8]" />
          </div>
          <span className="text-xl font-black text-slate-900 mt-2 leading-none">
            {attendance.absent}
          </span>
          <span className="text-xs font-medium text-slate-500 mt-1">
            Absent
          </span>
        </div>

        {/* Late Card */}
        <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden transition-transform active:scale-95">
          <div className="w-9 h-9 rounded-full bg-amber-400 text-white flex items-center justify-center shadow-xs">
            <Clock className="w-5 h-5 stroke-[2.8]" />
          </div>
          <span className="text-xl font-black text-slate-900 mt-2 leading-none">
            {attendance.late}
          </span>
          <span className="text-xs font-medium text-slate-500 mt-1">
            Late
          </span>
        </div>
      </div>

      {/* =========================================================================
          3. SUBJECT-WISE BREAKDOWN CARD
         ========================================================================= */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart2 className="w-5 h-5 text-slate-900 stroke-[2.5]" />
            <h3 className="font-extrabold text-sm text-slate-900">
              Subject-Wise Breakdown
            </h3>
          </div>

          {subjectsList.length > 1 && (
            <button
              type="button"
              onClick={() => setShowAllSubjects(!showAllSubjects)}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-0.5 transition-colors"
            >
              <span>{showAllSubjects ? 'View Less' : 'View All'}</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          )}
        </div>

        <div className="space-y-4 pt-1">
          {displayedSubjects.map((sub, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900 truncate pr-2">
                  {sub.subjectName}
                </span>
                <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full shrink-0">
                  {sub.percentage}%
                </span>
              </div>

              {/* classes count */}
              <div className="text-[11px] text-slate-400 font-medium text-right -mt-0.5">
                {sub.attended}/{sub.total} Classes
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, sub.percentage)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================================
          4. ATTENDANCE CALENDAR CARD
         ========================================================================= */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-sm space-y-3">
        {/* Calendar Header with Month Selector Pill */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-slate-900 stroke-[2.2]" />
            <h3 className="font-extrabold text-sm text-slate-900">
              Attendance Calendar
            </h3>
          </div>

          <div className="px-3 py-1 bg-teal-50/90 border border-teal-200/60 rounded-xl text-xs font-bold text-teal-800 flex items-center space-x-1 shadow-2xs">
            <span>{selectedMonth}</span>
            <ChevronDown className="w-3.5 h-3.5 text-teal-700" />
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 text-center text-xs font-semibold text-slate-400 py-1">
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
          <div>Sun</div>
        </div>

        {/* Days Grid (1 to 30) */}
        <div className="grid grid-cols-7 gap-y-1 text-center">
          {calendarDays.map((day) => {
            const isToday = day === 26; // Highlight Day 26 as shown in user's image
            const isSelected = day === selectedDay;

            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={`h-9 flex items-center justify-center text-xs font-semibold rounded-xl transition-all mx-auto w-9 ${
                  isToday
                    ? 'bg-[#a7f3d0] text-emerald-950 font-extrabold shadow-2xs'
                    : isSelected
                    ? 'bg-slate-200 text-slate-900 font-bold'
                    : 'text-slate-700 hover:bg-slate-100 active:scale-95'
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* Calendar Legend Markers */}
        <div className="pt-3 border-t border-slate-100/90 flex items-center justify-center space-x-4 text-xs font-medium text-slate-500">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span>Present</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            <span>Absent</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
            <span>Late</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" />
            <span>Holiday</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          5. UNIVERSITY ATTENDANCE RULE NOTICE ALERT
         ========================================================================= */}
      <div className="bg-amber-50/80 border border-amber-200/70 rounded-2xl p-3.5 flex items-start space-x-3 shadow-2xs">
        <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
          <Info className="w-4 h-4 text-white stroke-[2.8]" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-bold text-slate-900 leading-tight">
            University Attendance Rule
          </h4>
          <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5 font-normal">
            Minimum 75% in theory and 80% in practical sessions is required for semester exam eligibility.
          </p>
        </div>
      </div>
    </div>
  );
};
