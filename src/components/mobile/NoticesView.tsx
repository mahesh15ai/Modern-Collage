'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Pin, Calendar } from 'lucide-react';

export const NoticesView: React.FC = () => {
  const { notices } = useApp();

  return (
    <div className="w-full min-h-full p-4 space-y-3 font-sans">
      <div className="flex items-center justify-between pb-1">
        <h3 className="font-bold text-slate-800 text-xs">Official Circulars</h3>
        <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-full">
          {notices.length} Active
        </span>
      </div>

      {notices.length > 0 ? (
        notices.map((notice) => (
          <div
            key={notice.id}
            className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-2 hover:border-slate-200 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-1.5">
                {notice.pinned && <Pin className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />}
                <span
                  className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${notice.category === 'Exam'
                      ? 'bg-rose-100 text-rose-700'
                      : notice.category === 'Academic'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                >
                  {notice.category}
                </span>
              </div>
              <div className="flex items-center space-x-1 text-[10px] text-slate-400">
                <Calendar className="w-3 h-3" />
                <span>{notice.date}</span>
              </div>
            </div>

            <h4 className="font-bold text-xs text-slate-900 leading-snug">
              {notice.title}
            </h4>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              {notice.content}
            </p>
          </div>
        ))
      ) : (
        <div className="space-y-3">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 mx-auto flex items-center justify-center">
              <Pin className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-bold text-xs text-slate-800">No New Circulars for Today</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Academic circulars, holiday announcements, and examination hall ticket notices will be published by the Principal&apos;s Office.
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-2xl p-4 border border-slate-200/80 space-y-2">
            <h5 className="font-bold text-xs text-slate-900">Official College Administration Desk</h5>
            <div className="text-[11px] text-slate-600 space-y-1">
              <p>• <strong>Principal Office:</strong> Administrative Block (Ground Floor)</p>
              <p>• <strong>University Exam Section:</strong> Room 104</p>
              <p>• <strong>Scholarship &amp; Free-ship Cell:</strong> Counter 2</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
