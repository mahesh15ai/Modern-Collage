'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Check,
  CheckCircle2,
  X,
  Clock,
  BarChart2,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Info,
  AlertCircle,
  GraduationCap,
} from 'lucide-react';

interface AcademicMonth {
  key: string;
  name: string;
  year: number;
  monthIndex: number; // 0-based: 0=Jan, 5=June, 10=Nov
  semester: string;
}

// Full 12-Month Academic Year 2026-2027 (Both Semesters / Full Year)
const ACADEMIC_YEAR_MONTHS: AcademicMonth[] = [
  // Odd Semester / Term 1
  { key: '2026-06', name: 'June 2026', year: 2026, monthIndex: 5, semester: 'Odd Semester (Term 1)' },
  { key: '2026-07', name: 'July 2026', year: 2026, monthIndex: 6, semester: 'Odd Semester (Term 1)' },
  { key: '2026-08', name: 'August 2026', year: 2026, monthIndex: 7, semester: 'Odd Semester (Term 1)' },
  { key: '2026-09', name: 'September 2026', year: 2026, monthIndex: 8, semester: 'Odd Semester (Term 1)' },
  { key: '2026-10', name: 'October 2026', year: 2026, monthIndex: 9, semester: 'Odd Semester (Term 1)' },
  { key: '2026-11', name: 'November 2026', year: 2026, monthIndex: 10, semester: 'Odd Semester (Term 1)' },
  // Even Semester / Term 2
  { key: '2026-12', name: 'December 2026', year: 2026, monthIndex: 11, semester: 'Even Semester (Term 2)' },
  { key: '2027-01', name: 'January 2027', year: 2027, monthIndex: 0, semester: 'Even Semester (Term 2)' },
  { key: '2027-02', name: 'February 2027', year: 2027, monthIndex: 1, semester: 'Even Semester (Term 2)' },
  { key: '2027-03', name: 'March 2027', year: 2027, monthIndex: 2, semester: 'Even Semester (Term 2)' },
  { key: '2027-04', name: 'April 2027', year: 2027, monthIndex: 3, semester: 'Even Semester (Term 2)' },
  { key: '2027-05', name: 'May 2027', year: 2027, monthIndex: 4, semester: 'Even Semester (Term 2)' },
];

export const AttendanceView: React.FC = () => {
  const { attendance, currentUser } = useApp();

  // Active Month (Default to current month: November 2026)
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>('2026-11');
  const [selectedDay, setSelectedDay] = useState<number>(26); // Default 26th
  const [showMonthDropdown, setShowMonthDropdown] = useState<boolean>(false);

  // Real attendance metrics directly from Firestore / AppContext
  const presentCount = attendance.present || 0;
  const absentCount = attendance.absent || 0;
  const lateCount = attendance.late || 0;
  const totalClasses =
    attendance.totalClasses !== undefined && attendance.totalClasses !== null
      ? attendance.totalClasses
      : presentCount + absentCount + lateCount;

  const overallPercentage =
    attendance.overallPercentage !== undefined && attendance.overallPercentage !== null
      ? Math.min(100, Math.max(0, attendance.overallPercentage))
      : totalClasses > 0
        ? Math.min(100, Math.round((presentCount / totalClasses) * 100))
        : 0;

  // Selected Month metadata from full academic year
  const currentMonth = useMemo(() => {
    return (
      ACADEMIC_YEAR_MONTHS.find((m) => m.key === selectedMonthKey) ||
      ACADEMIC_YEAR_MONTHS[5] // Default: November 2026
    );
  }, [selectedMonthKey]);

  const isCurrentMonth = currentMonth.key === '2026-11';

  // Check if monthlyTrend from Firestore has specific data for the selected month
  const monthTrendRecord = useMemo(() => {
    if (!attendance.monthlyTrend || attendance.monthlyTrend.length === 0) return null;
    return attendance.monthlyTrend.find(
      (m) =>
        m.month.toLowerCase().includes(currentMonth.name.split(' ')[0].toLowerCase()) ||
        m.month === currentMonth.key
    );
  }, [attendance.monthlyTrend, currentMonth]);

  // Display metrics for the selected month (Pure real data)
  const monthPercentage = isCurrentMonth
    ? overallPercentage
    : monthTrendRecord
      ? monthTrendRecord.percentage
      : 0;

  const monthTotal = isCurrentMonth ? totalClasses : 0;
  const monthPresent = isCurrentMonth ? presentCount : 0;

  // Circular Gauge Calculations (Academic Year Overall)
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallPercentage / 100) * circumference;

  const isGoodStanding = totalClasses > 0 && overallPercentage >= 75;
  const isAverage = totalClasses > 0 && overallPercentage >= 60 && overallPercentage < 75;

  // Month navigation across all 12 academic months
  const currentMonthIdx = ACADEMIC_YEAR_MONTHS.findIndex((m) => m.key === selectedMonthKey);
  const handlePrevMonth = () => {
    if (currentMonthIdx > 0) {
      setSelectedMonthKey(ACADEMIC_YEAR_MONTHS[currentMonthIdx - 1].key);
      setSelectedDay(1);
    }
  };
  const handleNextMonth = () => {
    if (currentMonthIdx < ACADEMIC_YEAR_MONTHS.length - 1) {
      setSelectedMonthKey(ACADEMIC_YEAR_MONTHS[currentMonthIdx + 1].key);
      setSelectedDay(1);
    }
  };

  // ---------------------------------------------------------------------------
  // CALENDAR DAYS GENERATOR (Dynamic for all 12 months)
  // ---------------------------------------------------------------------------
  const { calendarCells, startDayOffset } = useMemo(() => {
    const year = currentMonth.year;
    const month = currentMonth.monthIndex;
    const totalDays = new Date(year, month + 1, 0).getDate();

    // Monday-based day of week for 1st of month: 0=Mon, 1=Tue, ..., 6=Sun
    const firstDay = new Date(year, month, 1).getDay();
    const offset = firstDay === 0 ? 6 : firstDay - 1;

    const cells: {
      day: number;
      isSunday: boolean;
      status: 'present' | 'absent' | 'late' | 'holiday' | 'none' | 'future';
    }[] = [];

    for (let d = 1; d <= totalDays; d++) {
      const dateObj = new Date(year, month, d);
      const isSunday = dateObj.getDay() === 0;

      let status: 'present' | 'absent' | 'late' | 'holiday' | 'none' | 'future' = 'none';

      if (isSunday) {
        status = 'holiday';
      } else if (currentMonth.key === '2026-11') {
        if (d === 26) {
          // Today: Present if student has verified present scan
          status = presentCount > 0 ? 'present' : 'none';
        } else if (d > 26) {
          status = 'future';
        } else {
          status = 'none';
        }
      } else if (currentMonth.year > 2026 || (currentMonth.year === 2026 && currentMonth.monthIndex > 10)) {
        status = 'future';
      } else {
        status = 'none';
      }

      cells.push({ day: d, isSunday, status });
    }

    return { calendarCells: cells, startDayOffset: offset };
  }, [currentMonth, presentCount]);

  // Selected Day Details
  const selectedDayInfo = useMemo(() => {
    const found = calendarCells.find((c) => c.day === selectedDay);
    if (!found) return null;

    const dateStr = `${selectedDay} ${currentMonth.name}`;
    let label = 'No Attendance Recorded';
    let color = 'text-slate-700 bg-slate-100 border-slate-200';

    if (found.isSunday) {
      label = 'Sunday (College Holiday)';
      color = 'text-slate-700 bg-slate-100 border-slate-200';
    } else if (currentMonth.key === '2026-11' && selectedDay === 26) {
      if (presentCount > 0) {
        label = 'Present (Verified by Class Teacher QR Scanner)';
        color = 'text-emerald-700 bg-emerald-50 border-emerald-200';
      } else {
        label = 'Today (Awaiting Class Teacher QR Scan)';
        color = 'text-amber-700 bg-amber-50 border-amber-200';
      }
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
  }, [calendarCells, selectedDay, currentMonth, presentCount]);

  const programName = currentUser.course || 'B.Sc Computer Science';

  return (
    <div className="w-full min-h-full p-4 space-y-4 bg-slate-50 font-sans pb-12">
      {/* =========================================================================
          1. TOP HERO CARD: ACADEMIC YEAR (ANNUAL) ATTENDANCE
         ========================================================================= */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-sm relative overflow-hidden">
        {/* Academic Year Header Chip */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
          <div className="flex items-center space-x-1.5 text-blue-900 font-extrabold text-xs">
            <GraduationCap className="w-4 h-4 text-blue-700" />
            <span>Academic Year 2026 - 2027</span>
          </div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2.5 py-0.5 rounded-full">
            Full Year Session
          </span>
        </div>

        {/* Ambient background blurs */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-100/50 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-teal-100/40 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          {/* Left: Circular Percentage Ring (Full Academic Year) */}
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
                {overallPercentage}%
              </span>
            </div>
          </div>

          {/* Subtle Vertical Divider */}
          <div className="w-px h-16 bg-slate-200/80 mx-3 sm:mx-5 shrink-0" />

          {/* Right: Academic Year Standing & Details */}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <span className="text-xs font-semibold text-slate-500">
              Academic Year Attendance
            </span>

            <div className="flex items-center space-x-1.5 mt-1">
              {totalClasses === 0 ? (
                <>
                  <Clock className="w-5 h-5 text-slate-400 shrink-0" />
                  <span className="text-base sm:text-lg font-bold text-slate-700 tracking-tight truncate">
                    No Attendance Logged
                  </span>
                </>
              ) : isGoodStanding ? (
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
              {presentCount} attended out of {totalClasses} class
              {totalClasses === 1 ? '' : 'es'}
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. THREE COUNTER PILLS: PRESENT, ABSENT, LATE (ACADEMIC YEAR TOTALS)
         ========================================================================= */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {/* Present Card */}
        <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden transition-transform active:scale-95">
          <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
            <Check className="w-5 h-5 stroke-[2.8]" />
          </div>
          <span className="text-xl font-black text-slate-900 mt-2 leading-none">
            {presentCount}
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
            {absentCount}
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
            {lateCount}
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
        </div>

        {/* If real subjectWise records exist in attendance */}
        {attendance.subjectWise && attendance.subjectWise.length > 0 ? (
          <div className="space-y-4 pt-1">
            {attendance.subjectWise.map((sub, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900 truncate pr-2">
                    {sub.subjectName}
                  </span>
                  <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full shrink-0">
                    {sub.percentage}%
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 font-medium text-right -mt-0.5">
                  {sub.attended}/{sub.total} Classes
                </div>

                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, sub.percentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : totalClasses > 0 ? (
          /* Single enrolled course view with real attendance */
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900 truncate pr-2">
                {programName}
              </span>
              <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full shrink-0">
                {overallPercentage}%
              </span>
            </div>

            <div className="text-[11px] text-slate-400 font-medium text-right -mt-0.5">
              {presentCount}/{totalClasses} Classes
            </div>

            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${overallPercentage}%` }}
              />
            </div>
          </div>
        ) : (
          /* Clean empty state when no lecture has been scanned yet */
          <div className="py-3 text-center space-y-1">
            <p className="text-xs font-bold text-slate-700">
              {programName}
            </p>
            <p className="text-[11px] text-slate-400">
              No lecture sessions recorded yet. Attendance will update automatically when your Class Teacher scans your QR Pass.
            </p>
          </div>
        )}
      </div>

      {/* =========================================================================
          4. ATTENDANCE CALENDAR (ALL 12 MONTHS OF ACADEMIC YEAR 2026-2027)
         ========================================================================= */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-sm space-y-3.5 relative">
        {/* Calendar Header with Left/Right Arrows & Month Selector Pill */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-slate-900 stroke-[2.2]" />
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 leading-tight">
                Attendance Calendar
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">
                {currentMonth.semester}
              </p>
            </div>
          </div>

          {/* Month Selector Pill with 12-Month Arrow Navigation */}
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
              <span>{currentMonth.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-teal-700" />
            </button>

            <button
              type="button"
              onClick={handleNextMonth}
              disabled={currentMonthIdx === ACADEMIC_YEAR_MONTHS.length - 1}
              className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 text-slate-600 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 12-Month Academic Year Dropdown Menu */}
        {showMonthDropdown && (
          <div className="absolute top-14 right-4 z-30 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 w-56 max-h-72 overflow-y-auto space-y-1 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-2.5 py-1 text-[10px] font-bold text-blue-900 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
              <span>Academic Year 2026-27</span>
              <span>12 Months</span>
            </div>

            <div className="pt-1">
              <div className="px-2 py-0.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                Odd Semester (Term 1)
              </div>
              {ACADEMIC_YEAR_MONTHS.slice(0, 6).map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => {
                    setSelectedMonthKey(m.key);
                    setSelectedDay(1);
                    setShowMonthDropdown(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${m.key === selectedMonthKey
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-700 hover:bg-slate-100'
                    }`}
                >
                  <span>{m.name}</span>
                  {m.key === '2026-11' && (
                    <span className="text-[9px] font-bold opacity-90 bg-white/20 px-1.5 py-0.5 rounded">
                      Current
                    </span>
                  )}
                </button>
              ))}

              <div className="px-2 pt-2 pb-0.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider border-t border-slate-100 mt-1">
                Even Semester (Term 2)
              </div>
              {ACADEMIC_YEAR_MONTHS.slice(6).map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => {
                    setSelectedMonthKey(m.key);
                    setSelectedDay(1);
                    setShowMonthDropdown(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${m.key === selectedMonthKey
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-700 hover:bg-slate-100'
                    }`}
                >
                  <span>{m.name}</span>
                </button>
              ))}
            </div>
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
            const isToday = currentMonth.key === '2026-11' && cell.day === 26;
            const isSelected = cell.day === selectedDay;

            let statusBg = 'text-slate-700 hover:bg-slate-100';
            if (isToday) {
              statusBg =
                presentCount > 0
                  ? 'bg-[#a7f3d0] text-emerald-950 font-extrabold shadow-2xs'
                  : 'bg-blue-50 text-blue-900 font-extrabold ring-1 ring-blue-400/60';
            } else if (isSelected) {
              statusBg = 'bg-slate-200 text-slate-900 font-bold';
            } else if (cell.status === 'holiday') {
              statusBg = 'text-slate-400 hover:bg-slate-100';
            }

            return (
              <button
                key={cell.day}
                type="button"
                onClick={() => setSelectedDay(cell.day)}
                className={`h-9 w-9 mx-auto flex flex-col items-center justify-center text-xs rounded-xl transition-all relative ${statusBg}`}
              >
                <span>{cell.day}</span>
                {/* Present Status Dot under date if marked present */}
                {cell.status === 'present' && !isToday && (
                  <span className="w-1 h-1 rounded-full -mt-0.5 bg-emerald-500" />
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
