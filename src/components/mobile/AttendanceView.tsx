'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';

export const AttendanceView: React.FC = () => {
  const { attendance } = useApp();

  // SVG Donut calculation
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (attendance.overallPercentage / 100) * circumference;

  return (
    <div className="w-full min-h-full p-4 space-y-4 font-sans">
      {/* Overall Attendance Circular Chart Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col items-center">
        <div className="relative w-40 h-40 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
            {/* Background Circle */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              stroke="#E2E8F0"
              strokeWidth="12"
              fill="transparent"
            />
            {/* Progress Circle (Teal / Emerald gradient) */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              stroke="#0D9488"
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-3xl font-extrabold text-slate-900">
              {attendance.overallPercentage}%
            </span>
          </div>
        </div>
        <p className="mt-2 text-xs font-bold text-slate-700">Overall Attendance</p>

        {/* Breakdown Legend (Matches Mockup: Present 46, Absent 4, Late 1) */}
        <div className="mt-5 w-full flex items-center justify-around border-t border-slate-100 pt-4 text-xs font-semibold">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-slate-600">Present</span>
            <span className="text-slate-900 font-bold">{attendance.present}</span>
          </div>

          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-rose-500" />
            <span className="text-slate-600">Absent</span>
            <span className="text-slate-900 font-bold">{attendance.absent}</span>
          </div>

          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <span className="text-slate-600">Late</span>
            <span className="text-slate-900 font-bold">{attendance.late}</span>
          </div>
        </div>
      </div>

      {/* Monthly Trend Bar Chart Card - Only rendered if real monthly data exists */}
      {attendance.monthlyTrend && attendance.monthlyTrend.length > 0 && (
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 text-xs mb-4">Monthly Trend</h3>
          <div className="flex items-end justify-between h-32 px-4 pb-2 border-b border-slate-100">
            {attendance.monthlyTrend.map((item) => (
              <div key={item.month} className="flex flex-col items-center space-y-2">
                <span className="text-[10px] font-bold text-blue-800">
                  {item.percentage}%
                </span>
                <div
                  style={{ height: `${(item.percentage / 100) * 80}px` }}
                  className="w-8 bg-blue-600 rounded-t-lg transition-all duration-700 hover:bg-blue-700 shadow-sm"
                />
                <span className="text-[11px] font-medium text-slate-500">
                  {item.month}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subject-Wise Attendance Breakdown */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm">
        <h3 className="font-bold text-slate-800 text-xs mb-3">Subject-Wise Breakdown</h3>
        {attendance.subjectWise.length > 0 ? (
          <div className="space-y-3">
            {attendance.subjectWise.map((sub) => (
              <div key={sub.subjectCode} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-800">{sub.subjectName}</span>
                  <span className="font-bold text-blue-900">{sub.percentage}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-teal-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${sub.percentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>{sub.subjectCode}</span>
                  <span>{sub.attended} / {sub.total} Classes</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2 py-1">
            <p className="text-xs text-slate-400 text-center">No attendance sessions recorded yet.</p>
            <div className="bg-amber-50/80 rounded-2xl p-3 border border-amber-200/60 text-[11px] text-amber-900 leading-relaxed">
              <strong>SRTMUN University Norm:</strong> Minimum 75% attendance in theory lectures and 80% in practical lab sessions is compulsory for semester exam eligibility.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
