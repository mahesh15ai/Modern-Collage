'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Pin, Calendar, Check, CheckCheck, Bell, ChevronDown, ChevronUp, BookOpen, AlertCircle } from 'lucide-react';

export const NoticesView: React.FC = () => {
  const { notices, readNoticeIds, unreadNoticesCount, markNoticeAsRead, markAllNoticesAsRead, toggleNoticeRead } = useApp();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedNoticeId, setExpandedNoticeId] = useState<string | null>(null);

  const categories = ['All', 'Academic', 'Exam', 'General', 'Urgent'];

  const filteredNotices = notices.filter((notice) => {
    const isRead = readNoticeIds.includes(notice.id);
    if (filter === 'unread' && isRead) return false;
    if (selectedCategory !== 'All' && notice.category !== selectedCategory) return false;
    return true;
  });

  const handleCardClick = (id: string, isRead: boolean) => {
    if (!isRead) {
      markNoticeAsRead(id);
    }
    setExpandedNoticeId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="w-full min-h-full p-4 space-y-3 font-sans pb-16">
      {/* Top Header with Unread Count & Mark All As Read */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <Bell className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-xs">Official Circulars</h3>
            <p className="text-[10px] text-slate-500">
              {unreadNoticesCount > 0 ? `${unreadNoticesCount} unread announcements` : 'All notices read ✓'}
            </p>
          </div>
        </div>

        {unreadNoticesCount > 0 ? (
          <button
            type="button"
            onClick={markAllNoticesAsRead}
            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-[11px] font-bold flex items-center space-x-1.5 transition-all active:scale-95 border border-blue-200/80 shadow-xs"
            title="Mark all notifications as read"
          >
            <CheckCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Mark all as read</span>
          </button>
        ) : (
          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-full flex items-center space-x-1">
            <Check className="w-3 h-3 text-emerald-600" />
            <span>All Caught Up</span>
          </span>
        )}
      </div>

      {/* Main Filter Tabs: All vs Unread */}
      <div className="bg-slate-100 p-1 rounded-2xl flex items-center justify-between text-xs font-bold border border-slate-200/60">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${filter === 'all'
              ? 'bg-white text-blue-900 shadow-sm font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
            }`}
        >
          <span>All Circulars</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">
            {notices.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilter('unread')}
          className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${filter === 'unread'
              ? 'bg-blue-600 text-white shadow-sm font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
            }`}
        >
          <span>Unread</span>
          {unreadNoticesCount > 0 && (
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${filter === 'unread' ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'}`}>
              {unreadNoticesCount}
            </span>
          )}
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-full text-[10.5px] font-bold transition-all shrink-0 ${selectedCategory === cat
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Notices List */}
      {filteredNotices.length > 0 ? (
        filteredNotices.map((notice) => {
          const isRead = readNoticeIds.includes(notice.id);
          const isExpanded = expandedNoticeId === notice.id;

          return (
            <div
              key={notice.id}
              onClick={() => handleCardClick(notice.id, isRead)}
              className={`rounded-2xl p-4 transition-all cursor-pointer space-y-2.5 ${isRead
                  ? 'bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 opacity-90'
                  : 'bg-white border-2 border-blue-500/80 shadow-md ring-1 ring-blue-500/20'
                }`}
            >
              {/* Header Badges */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                  {notice.pinned && (
                    <span className="p-1 rounded-md bg-blue-50 text-blue-600" title="Pinned Notice">
                      <Pin className="w-3 h-3 text-blue-600 fill-blue-600" />
                    </span>
                  )}
                  <span
                    className={`text-[9.5px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${notice.category === 'Exam'
                        ? 'bg-rose-100 text-rose-700'
                        : notice.category === 'Academic'
                          ? 'bg-blue-100 text-blue-700'
                          : notice.category === 'Urgent'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-700'
                      }`}
                  >
                    {notice.category}
                  </span>

                  {/* Read / Unread Status Badge */}
                  {!isRead ? (
                    <span className="text-[9px] font-extrabold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full inline-flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                      <span>Unread</span>
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full inline-flex items-center space-x-1">
                      <Check className="w-2.5 h-2.5 text-slate-400" />
                      <span>Read</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-1 text-[10px] text-slate-400 font-medium shrink-0 ml-2">
                  <Calendar className="w-3 h-3" />
                  <span>{notice.date}</span>
                </div>
              </div>

              {/* Title */}
              <h4 className={`text-xs leading-snug ${isRead ? 'font-bold text-slate-800' : 'font-extrabold text-slate-900'}`}>
                {notice.title}
              </h4>

              {/* Notice Content with Expand/Collapse */}
              <p className={`text-[11px] leading-relaxed text-slate-600 ${!isExpanded ? 'line-clamp-2' : ''}`}>
                {notice.content}
              </p>

              {/* Bottom Actions Bar */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="text-[10px] text-slate-400 font-medium flex items-center space-x-1">
                  <span>{isExpanded ? 'Show less' : 'Read details'}</span>
                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </span>

                {/* Mark as Read / Unread Toggle Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleNoticeRead(notice.id);
                  }}
                  className={`px-2.5 py-1 rounded-xl text-[10.5px] font-bold flex items-center space-x-1 transition-all active:scale-95 ${!isRead
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                >
                  <Check className="w-3 h-3" />
                  <span>{isRead ? 'Mark unread' : 'Mark as read'}</span>
                </button>
              </div>
            </div>
          );
        })
      ) : (
        <div className="space-y-3 pt-2">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 mx-auto flex items-center justify-center">
              {filter === 'unread' ? <CheckCheck className="w-6 h-6 text-emerald-600" /> : <Pin className="w-6 h-6 text-blue-600" />}
            </div>
            <h4 className="font-bold text-xs text-slate-800">
              {filter === 'unread' ? 'All Caught Up!' : 'No Circulars Found'}
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {filter === 'unread'
                ? 'You have read all current official circulars. Check the "All Circulars" tab to review previously read notices.'
                : 'No circulars match the selected category.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
