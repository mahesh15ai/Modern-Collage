'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Clock, MapPin, User, Calendar as CalendarIcon } from 'lucide-react';

export const TimetableView: React.FC = () => {
  const { timetable, currentUser } = useApp();
  const [viewType, setViewType] = useState<'class' | 'subject'>('class');
  const [selectedDay, setSelectedDay] = useState<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri'>('Mon');

  const days: ('Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri')[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  const filteredSlots = timetable.filter((slot) => slot.day === selectedDay);

  return (
    <div className="w-full min-h-full p-4 space-y-4 font-sans">
      {/* Class Wise / Subject Wise Toggle (Matches Mockup) */}
      <div className="bg-slate-100 p-1 rounded-full flex items-center justify-between text-xs font-semibold">
        <button
          onClick={() => setViewType('class')}
          className={`flex-1 py-1.5 text-center rounded-full transition-all ${viewType === 'class'
            ? 'bg-blue-900 text-white shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
            }`}
        >
          Class Wise
        </button>
        <button
          onClick={() => setViewType('subject')}
          className={`flex-1 py-1.5 text-center rounded-full transition-all ${viewType === 'subject'
            ? 'bg-blue-900 text-white shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
            }`}
        >
          Subject Wise
        </button>
      </div>

      {/* Days Tabs (Matches Mockup: Mon, Tue, Wed, Thu, Fri) */}
      <div className="flex items-center justify-between space-x-1">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`flex-1 py-2 text-center rounded-xl text-xs font-bold transition-all ${selectedDay === day
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Class Schedule Cards (Matches Mockup: Data Structures 09:00-10:00 AM Lab 1, etc.) */}
      <div className="space-y-3">
        {filteredSlots.length > 0 ? (
          filteredSlots.map((slot) => (
            <div
              key={slot.id}
              className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-start space-x-3.5 hover:border-blue-200 transition-all"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-xs flex-shrink-0 ${slot.category === 'CS'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-indigo-100 text-indigo-800'
                  }`}
              >
                {slot.category}
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-xs text-slate-900">
                    {slot.subjectName}
                  </h4>
                  <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                    {slot.type}
                  </span>
                </div>

                <div className="mt-1 flex items-center space-x-1.5 text-[11px] text-slate-500 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    ({slot.startTime} - {slot.endTime})
                  </span>
                </div>

                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-600">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{slot.room}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-slate-500 text-[10px]">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>{slot.facultyName}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="space-y-3">
            <div className="text-center py-6 bg-white rounded-2xl border border-slate-100 p-4">
              <CalendarIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <h4 className="font-bold text-xs text-slate-700">No Lectures Scheduled for {selectedDay}</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Classroom allocation will be updated by your Department HOD.
              </p>
            </div>

            {/* Standard Daily College Shifts Card */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 space-y-2.5">
              <h5 className="font-bold text-xs text-slate-800">Standard College Bell Schedule</h5>
              <div className="space-y-1.5 text-[11px] text-slate-600">
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span>Theory Lecture Session</span>
                  <span className="font-mono font-semibold text-blue-900">10:00 AM - 01:00 PM</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span>Lunch Interval</span>
                  <span className="font-mono font-semibold text-amber-700">01:00 PM - 01:45 PM</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span>Computer Lab Practicals</span>
                  <span className="font-mono font-semibold text-blue-900">01:45 PM - 04:45 PM</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Calendar Card at Bottom */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-3.5 flex items-center justify-center space-x-2.5 text-blue-900">
        <CalendarIcon className="w-5 h-5 text-blue-700 shrink-0" />
        <span className="text-xs font-semibold">
          {currentUser.semester ? `${currentUser.semester} Academic Calendar Active` : 'Academic Calendar Active'}
        </span>
      </div>
    </div>
  );
};
