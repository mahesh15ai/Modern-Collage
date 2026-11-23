'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Trophy, Download, ChevronDown, CheckCircle } from 'lucide-react';

export const ResultsView: React.FC = () => {
  const { result, currentUser } = useApp();
  const [selectedSemester, setSelectedSemester] = useState(currentUser.semester || 'Semester I');
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    }, 1200);
  };

  return (
    <div className="w-full min-h-full p-4 space-y-4 font-sans">
      {/* Semester Dropdown Selector */}
      <div className="relative">
        <select
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
          className="w-full appearance-none bg-white border border-slate-200 rounded-2xl py-3 px-4 text-xs font-bold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-700 cursor-pointer"
        >
          <option value="Semester I">Semester I</option>
          <option value="Semester II">Semester II</option>
          <option value="Semester III">Semester III</option>
          <option value="Semester IV">Semester IV</option>
          <option value="Semester V">Semester V</option>
          <option value="Semester VI">Semester VI</option>
        </select>
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-500">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      {/* Big Trophy Overall Percentage Card (Matches Mockup exactly) */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-3xl p-5 shadow-sm flex items-center space-x-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-400 text-amber-900 flex items-center justify-center shadow-md">
          <Trophy className="w-9 h-9" />
        </div>
        <div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {result.overallPercentage}%
          </div>
          <p className="text-xs font-semibold text-slate-600">
            Overall Percentage
          </p>
          <div className="mt-1 flex items-center space-x-2">
            {result.grade ? (
              <span className="text-[10px] font-bold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full">
                Grade: {result.grade}
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-slate-500">
                Awaiting Semester Examination
              </span>
            )}
            {result.cgpa > 0 && (
              <span className="text-[10px] font-medium text-slate-500">
                CGPA: {result.cgpa}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Subject-Wise Marks Card (Matches Mockup exactly) */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-800 text-xs">Subject-wise Marks</h3>
          <span className="text-[10px] font-semibold text-slate-400">Total: 100</span>
        </div>

        {result.subjectMarks.length > 0 ? (
          <div className="space-y-4">
            {result.subjectMarks.map((sub) => (
              <div key={sub.subjectCode} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-800">{sub.subjectName}</span>
                  <span className="font-extrabold text-blue-950 font-mono">
                    {sub.obtained}/100
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-700"
                    style={{ width: `${sub.obtained}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-slate-400 text-center py-2">No examination results declared for this semester yet.</p>
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 text-[11px] text-slate-600 space-y-1">
              <h5 className="font-bold text-xs text-slate-800 mb-1">SRTMUN 10-Point CBCS Grading Scale</h5>
              <div className="grid grid-cols-2 gap-1 text-[10px]">
                <div className="flex justify-between py-0.5 border-b border-slate-100">
                  <span className="font-bold text-blue-900">O (Outstanding)</span>
                  <span>80-100% (GP 10)</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-100">
                  <span className="font-bold text-emerald-700">A+ (Excellent)</span>
                  <span>70-79% (GP 9)</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="font-bold text-slate-700">A (Very Good)</span>
                  <span>60-69% (GP 8)</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="font-bold text-slate-700">B+ (Good)</span>
                  <span>55-59% (GP 7)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Download Marksheet Button (Matches Mockup) */}
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="w-full py-3.5 bg-blue-950 hover:bg-blue-900 text-white rounded-2xl font-bold text-xs shadow-md flex items-center justify-center space-x-2 transition-all active:scale-95 disabled:opacity-75"
      >
        {downloadSuccess ? (
          <>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Marksheet Downloaded!</span>
          </>
        ) : downloading ? (
          <span>Generating Official PDF...</span>
        ) : (
          <>
            <Download className="w-4 h-4" />
            <span>Download Marksheet</span>
          </>
        )}
      </button>
    </div>
  );
};
