'use client';

import React, { useState, useMemo } from 'react';
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
  ChevronLeft,
  ChevronRight,
  Info,
  AlertCircle,
  CalendarDays,
  Sparkles,
} from 'lucide-react';

interface MonthMeta {
  key: string;
  name: string;
  shortName: string;
  year: number;
  monthIndex: number; // 0 = Jan, 10 = Nov
  totalDays: number;
  totalClasses: number;
  present: number;
  absent: number;
  late: number;
  percentage: number;
}

export const AttendanceView: React.FC = () => {
  const { attendance, currentUser } = useApp();

  // Selected Month state (Default to current month: November 2026)
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>('2026-11');
  const [selectedDay, setSelectedDay] = useState<number>(26); // Default 26th
  const [showMonthDropdown, setShowMonthDropdown] = useState<boolean>(false);
  const [viewScope, setViewScope] = useState<'selected' | 'overall'>('selected');
  const [showAllSubjects, setShowAllSubjects] = useState<boolean>(false);

  // ---------------------------------------------------------------------------
  // 1. ALL SEMESTER MONTHS DATA (July 2026 to December 2026)
  // ---------------------------------------------------------------------------
  const semesterMonths: MonthMeta[] = useMemo(() => {
    // Current live data from attendance context (for November 2026)
    const novPresent = Math.max(1, attendance.present || 1);
    const novAbsent = attendance.absent || 0;
    const novLate = attendance.late || 0;
    const novTotal = Math.max(novPresent + novAbsent + novLate, attendance.totalClasses || 1);
    const novPct = Math.round((novPresent / novTotal) * 100);

    return [
      {
        key: '2026-07',
        name: 'July 2026',
        shortName: 'Jul',
        year: 2026,
        monthIndex: 6,
        totalDays: 31,
        totalClasses: 24,
        present: 23,
        absent: 1,
        late: 0,
        percentage: 96,
      },
      {
        key: '2026-08',
        name: 'August 2026',
        shortName: 'Aug',
        year: 2026,
        monthIndex: 7,
        totalDays: 31,
        totalClasses: 26,
        present: 24,
        absent: 2,
        late: 0,
        percentage: 92,
      },
      {
        key: '2026-09',
        name: 'September 2026',
        shortName: 'Sep',
        year: 2026,
        monthIndex: 8,
        totalDays: 30,
        totalClasses: 25,
        present: 23,
        absent: 1,
        late: 1,
        percentage: 92,
      },
      {
        key: '2026-10',
        name: 'October 2026',
        shortName: 'Oct',
        year: 2026,
        monthIndex: 9,
        totalDays: 31,
        totalClasses: 25,
        present: 22,
        absent: 3,
        late: 0,
        percentage: 88,
      },
      {
        key: '2026-11',
        name: 'November 2026',
        shortName: 'Nov (Current)',
        year: 2026,
        monthIndex: 10,
        totalDays: 30,
        totalClasses: novTotal,
        present: novPresent,
        absent: novAbsent,
        late: novLate,
        percentage: novPct,
      },
      {
        key: '2026-12',
        name: 'December 2026',
        shortName: 'Dec (Upcoming)',
        year: 2026,
        monthIndex: 11,
        totalDays: 31,
        totalClasses: 0,
        present: 0,
        absent: 0,
        late: 0,
        percentage: 0,
      },
    ];
  }, [attendance]);

  // Current active month object
  const currentMonthData = useMemo(() => {
    return (
      semesterMonths.find((m) => m.key === selectedMonthKey) ||
      semesterMonths[4] // Fallback to November 2026
    );
  }, [selectedMonthKey, semesterMonths]);

  // Cumulative Semester Totals
  const semesterTotals = useMemo(() => {
    const activeMonths = semesterMonths.filter((m) => m.key !== '2026-12');
    const totalPresent = activeMonths.reduce((acc, m) => acc + m.present, 0);
    const totalAbsent = activeMonths.reduce((acc, m) => acc + m.absent, 0);
    const totalLate = activeMonths.reduce((acc, m) => acc + m.late, 0);
    const totalClasses = activeMonths.reduce((acc, m) => acc + m.totalClasses, 0);
    const overallPct =
      totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 100;

    return {
      present: totalPresent,
      absent: totalAbsent,
      late: totalLate,
      totalClasses,
      percentage: overallPct,
    };
  }, [semesterMonths]);

  // Determine what to display based on scope ('selected' or 'overall')
  const displayMetrics =
    viewScope === 'overall'
      ? semesterTotals
      : {
          present: currentMonthData.present,
          absent: currentMonthData.absent,
          late: currentMonthData.late,
          totalClasses: currentMonthData.totalClasses,
          percentage: currentMonthData.percentage,
        };

  // Circular Gauge Calculations
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const gaugePct = Math.min(100, Math.max(0, displayMetrics.percentage || 0));
  const strokeDashoffset = circumference - (gaugePct / 100) * circumference;

  const isGoodStanding = gaugePct >= 75;
  const isAverage = gaugePct >= 60 && gaugePct < 75;

  // Month navigation helpers
  const currentMonthIdx = semesterMonths.findIndex((m) => m.key === selectedMonthKey);
  const handlePrevMonth = () => {
    if (currentMonthIdx > 0) {
      const prev = semesterMonths[currentMonthIdx - 1];
      setSelectedMonthKey(prev.key);
      setSelectedDay(1);
    }
  };
  const handleNextMonth = () => {
    if (currentMonthIdx < semesterMonths.length - 1) {
      const next = semesterMonths[currentMonthIdx + 1];
      setSelectedMonthKey(next.key);
      setSelectedDay(1);
    }
  };

  // ---------------------------------------------------------------------------
  // 2. CALENDAR DAYS GENERATOR FOR SELECTED MONTH
  // ---------------------------------------------------------------------------
  const { calendarCells, startDayOffset } = useMemo(() => {
    const year = currentMonthData.year;
    const month = currentMonthData.monthIndex;
    const totalDays = new Date(year, month + 1, 0).getDate();

    // Monday-based day of week for 1st of month: 0=Mon, 1=Tue, ..., 6=Sun
    const firstDay = new Date(year, month, 1).getDay();
    const offset = firstDay === 0 ? 6 : firstDay - 1;

    const cells: {
      day: number;
      isSunday: boolean;
      status: 'present' | 'absent' | 'late' | 'holiday' | 'future';
    }[] = [];

    for (let d = 1; d <= totalDays; d++) {
      const dateObj = new Date(year, month, d);
      const isSunday = dateObj.getDay() === 0;

      let status: 'present' | 'absent' | 'late' | 'holiday' | 'future' = 'present';

      if (currentMonthData.key === '2026-12') {
        status = 'future';
      } else if (isSunday) {
        status = 'holiday';
      } else if (currentMonthData.key === '2026-11') {
        if (d === 26) {
          status = 'present'; // Verified marked present today
        } else if (d > 26) {
          status = 'future';
        } else if (d === 14) {
          status = 'absent';
        } else if (d === 19) {
          status = 'late';
        } else {
          status = 'present';
        }
      } else if (currentMonthData.key === '2026-10') {
        if (d === 5 || d === 12 || d === 20) status = 'absent';
        else status = 'present';
      } else if (currentMonthData.key === '2026-09') {
        if (d === 11) status = 'absent';
        else if (d === 24) status = 'late';
        else status = 'present';
      } else if (currentMonthData.key === '2026-08') {
        if (d === 15) status = 'holiday'; // Independence day
        else if (d === 18 || d === 25) status = 'absent';
        else status = 'present';
      } else if (currentMonthData.key === '2026-07') {
        if (d === 22) status = 'absent';
        else status = 'present';
      }

      cells.push({ day: d, isSunday, status });
    }

    return { calendarCells: cells, startDayOffset: offset };
  }, [currentMonthData]);

  // Selected Day Details
  const selectedDayInfo = useMemo(() => {
    const found = calendarCells.find((c) => c.day === selectedDay);
    if (!found) return null;

    const dateStr = `${selectedDay} ${currentMonthData.name}`;
    let label = 'Present (Marked via QR Pass)';
    let color = 'text-emerald-700 bg-emerald-50 border-emerald-200';

    if (found.status === 'holiday') {
      label = found.isSunday ? 'Sunday (College Holiday)' : 'Institutional Holiday';
      color = 'text-slate-700 bg-slate-100 border-slate-200';
    } else if (found.status === 'absent') {
      label = 'Absent (Class Teacher Scan Missed)';
      color = 'text-rose-700 bg-rose-50 border-rose-200';
    } else if (found.status === 'late') {
      label = 'Late Attendance Logged';
      color = 'text-amber-700 bg-amber-50 border-amber-200';
    } else if (found.status === 'future') {
      label = 'Scheduled Upcoming Lecture';
      color = 'text-blue-700 bg-blue-50 border-blue-200';
    }

    return {
      dateStr,
      status: found.status,
      label,
      color,
    };
  }, [calendarCells, selectedDay, currentMonthData]);

  // Subjects fallback
  const programName = currentUser.course || 'B.Sc Computer Science';
  const subjectsList =
    attendance.subjectWise && attendance.subjectWise.length > 0
      ? attendance.subjectWise
      : [
          {
            subjectName: programName,
            subjectCode: 'CS-UG',
            attended: displayMetrics.present || 1,
            total: displayMetrics.totalClasses || 1,
            percentage: displayMetrics.percentage || 100,
          },
        ];

  const displayedSubjects = showAllSubjects ? subjectsList : subjectsList.slice(0, 3);

  return (
    <div className="w-full min-h-full p-4 space-y-4 bg-slate-50 font-sans pb-12">
      {/* =========================================================================
          VIEW SCOPE SELECTOR TABS: SELECTED MONTH vs ALL SEMESTER
         ========================================================================= */}
      <div className="bg-slate-200/80 p-1 rounded-2xl flex items-center justify-between text-xs font-bold text-slate-600 shadow-inner">
        <button
          type="button"
          onClick={() => setViewScope('selected')}
          className={`flex-1 py-2 text-center rounded-xl transition-all ${
            viewScope === 'selected'
              ? 'bg-white text-blue-900 shadow-sm'
              : 'hover:text-slate-900'
          }`}
        >
          {currentMonthData.name} View
        </button>
        <button
          type="button"
          onClick={() => setViewScope('overall')}
          className={`flex-1 py-2 text-center rounded-xl transition-all ${
            viewScope === 'overall'
              ? 'bg-white text-blue-900 shadow-sm'
              : 'hover:text-slate-900'
          }`}
        >
          All Months (Full Semester)
        </button>
      </div>

      {/* =========================================================================
          1. TOP HERO CARD: CIRCULAR GAUGE & OVERALL STANDING
         ========================================================================= */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-sm relative overflow-hidden">
        {/* Ambient blurs matching reference mockup */}
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
                {gaugePct}%
              </span>
            </div>
          </div>

          {/* Subtle Vertical Divider */}
          <div className="w-px h-16 bg-slate-200/80 mx-3 sm:mx-5 shrink-0" />

          {/* Right: Attendance Standing & Details */}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                {viewScope === 'overall' ? 'Cumulative Semester Attendance' : 'Monthly Attendance'}
              </span>
            </div>

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
              {displayMetrics.present} attended out of {displayMetrics.totalClasses} class
              {displayMetrics.totalClasses === 1 ? '' : 'es'}
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
            {displayMetrics.present}
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
            {displayMetrics.absent}
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
            {displayMetrics.late}
          </span>
          <span className="text-xs font-medium text-slate-500 mt-1">
            Late
          </span>
        </div>
      </div>

      {/* =========================================================================
          3. ALL MONTHS SEMESTER BREAKDOWN (सत्रनिहाय सर्व महिन्यांची उपस्थिती)
         ========================================================================= */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <CalendarDays className="w-4 h-4 text-blue-900 stroke-[2.5]" />
            <h3 className="font-extrabold text-sm text-slate-900">
              All Months Attendance (सत्र उपस्थिती)
            </h3>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Academic 2026-27
          </span>
        </div>

        {/* List of All Semester Months with One-Click Calendar Switch */}
        <div className="space-y-2.5 pt-1">
          {semesterMonths.map((m) => {
            const isSelected = m.key === selectedMonthKey;
            const isFuture = m.key === '2026-12';

            return (
              <div
                key={m.key}
                onClick={() => {
                  setSelectedMonthKey(m.key);
                  setSelectedDay(1);
                  setViewScope('selected');
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col space-y-2 ${
                  isSelected
                    ? 'bg-blue-50/70 border-blue-200 shadow-xs ring-1 ring-blue-300/60'
                    : 'bg-slate-50/60 hover:bg-slate-100/80 border-slate-200/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900">
                      {m.name}
                    </span>
                    {m.key === '2026-11' && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-blue-100 text-blue-800">
                        Current
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-slate-500">
                      {isFuture ? 'Upcoming' : `${m.present} / ${m.totalClasses} classes`}
                    </span>
                    <span
                      className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                        isFuture
                          ? 'bg-slate-200 text-slate-600'
                          : m.percentage >= 75
                          ? 'bg-emerald-100 text-emerald-800'
                          : m.percentage >= 60
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {isFuture ? '0%' : `${m.percentage}%`}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isFuture
                        ? 'bg-slate-300'
                        : m.percentage >= 75
                        ? 'bg-emerald-500'
                        : m.percentage >= 60
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, m.percentage)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          4. ATTENDANCE CALENDAR (INTERACTIVE MONTH NAVIGATOR)
         ========================================================================= */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-sm space-y-3.5 relative">
        {/* Calendar Header with Left/Right Arrows & Month Selector Pill */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-slate-900 stroke-[2.2]" />
            <h3 className="font-extrabold text-sm text-slate-900">
              Attendance Calendar
            </h3>
          </div>

          {/* Month Selector Pill with Arrow Navigation */}
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              disabled={currentMonthIdx === 0}
              className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 text-slate-600 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setShowMonthDropdown(!showMonthDropdown)}
              className="px-2.5 py-1 bg-teal-50/90 hover:bg-teal-100/90 border border-teal-200/60 rounded-xl text-xs font-bold text-teal-800 flex items-center space-x-1 shadow-2xs transition-all active:scale-95"
            >
              <span>{currentMonthData.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-teal-700" />
            </button>

            <button
              type="button"
              onClick={handleNextMonth}
              disabled={currentMonthIdx === semesterMonths.length - 1}
              className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 text-slate-600 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Month Selector Dropdown Menu */}
        {showMonthDropdown && (
          <div className="absolute top-14 right-4 z-30 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 w-48 space-y-1 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Select Semester Month
            </div>
            {semesterMonths.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => {
                  setSelectedMonthKey(m.key);
                  setSelectedDay(1);
                  setShowMonthDropdown(false);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                  m.key === selectedMonthKey
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{m.name}</span>
                <span className="text-[10px] opacity-80">{m.percentage}%</span>
              </button>
            ))}
          </div>
        )}

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

        {/* Days Grid (Accurately offset for the selected month) */}
        <div className="grid grid-cols-7 gap-y-1 text-center">
          {/* Empty cells for starting day offset */}
          {Array.from({ length: startDayOffset }).map((_, i) => (
            <div key={`empty-${i}`} className="h-9 w-9 mx-auto" />
          ))}

          {/* Actual Month Days */}
          {calendarCells.map((cell) => {
            const isToday = currentMonthData.key === '2026-11' && cell.day === 26;
            const isSelected = cell.day === selectedDay;

            let statusBg = 'text-slate-700 hover:bg-slate-100';
            if (isToday) {
              statusBg = 'bg-[#a7f3d0] text-emerald-950 font-extrabold shadow-2xs';
            } else if (isSelected) {
              statusBg = 'bg-blue-100 text-blue-900 font-extrabold ring-2 ring-blue-500/50';
            } else if (cell.status === 'holiday') {
              statusBg = 'text-slate-400 hover:bg-slate-100';
            } else if (cell.status === 'absent') {
              statusBg = 'bg-rose-50 text-rose-700 font-semibold';
            } else if (cell.status === 'late') {
              statusBg = 'bg-amber-50 text-amber-700 font-semibold';
            }

            return (
              <button
                key={cell.day}
                type="button"
                onClick={() => setSelectedDay(cell.day)}
                className={`h-9 w-9 mx-auto flex flex-col items-center justify-center text-xs rounded-xl transition-all relative ${statusBg}`}
              >
                <span>{cell.day}</span>
                {/* Status Dot under date */}
                {!isToday && !isSelected && cell.status !== 'future' && (
                  <span
                    className={`w-1 h-1 rounded-full -mt-0.5 ${
                      cell.status === 'present'
                        ? 'bg-emerald-500'
                        : cell.status === 'absent'
                        ? 'bg-rose-500'
                        : cell.status === 'late'
                        ? 'bg-amber-400'
                        : 'bg-transparent'
                    }`}
                  />
                )}
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

        {/* Selected Date Detailed Log Card */}
        {selectedDayInfo && (
          <div className={`mt-2 p-3 rounded-2xl border text-xs flex items-center justify-between ${selectedDayInfo.color}`}>
            <div className="space-y-0.5">
              <span className="font-bold block text-slate-900">
                {selectedDayInfo.dateStr}
              </span>
              <span className="text-[11px] font-medium block">
                {selectedDayInfo.label}
              </span>
            </div>
            <div className="text-[10px] font-mono font-bold bg-white/80 px-2 py-1 rounded-lg border border-current">
              Lecture Log
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          5. SUBJECT-WISE BREAKDOWN CARD
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
          6. UNIVERSITY ATTENDANCE RULE NOTICE ALERT
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
