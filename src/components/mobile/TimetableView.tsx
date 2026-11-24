'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Clock, MapPin, User, Calendar as CalendarIcon, Sparkles, BookOpen, CheckCircle2 } from 'lucide-react';

export const TimetableView: React.FC = () => {
  const { timetable, currentUser, facultyList } = useApp();
  const isFaculty = currentUser.role === 'faculty';

  // Find linked faculty record
  const linkedFaculty = facultyList.find(
    (f) =>
      f.id === currentUser.id ||
      f.name?.toLowerCase() === currentUser.name?.toLowerCase()
  );

  const mySubjects = currentUser.subjectsAssigned || linkedFaculty?.subjectsAssigned || [];
  const myClassTeacherOf = currentUser.classTeacherOf || linkedFaculty?.classTeacherOf;

  const [facultyFilter, setFacultyFilter] = useState<'my' | 'all'>(isFaculty ? 'my' : 'all');
  const [viewType, setViewType] = useState<'class' | 'subject'>('class');
  const [selectedDay, setSelectedDay] = useState<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat'>('Mon');

  const days: ('Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat')[] = [
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
  ];

  const isMySlot = (slot: any) => {
    const facNameMatch =
      slot.facultyName?.toLowerCase().includes(currentUser.name?.toLowerCase()) ||
      (slot.facultyId && slot.facultyId === currentUser.id);
    const subMatch = mySubjects.some(
      (sub: string) =>
        sub.toLowerCase().includes(slot.subjectName?.toLowerCase()) ||
        slot.subjectName?.toLowerCase().includes(sub.toLowerCase())
    );
    return facNameMatch || subMatch;
  };

  const daySlots = timetable.filter((slot) => slot.day === selectedDay);

  const filteredSlots =
    isFaculty && facultyFilter === 'my'
      ? daySlots.filter((slot) => isMySlot(slot))
      : daySlots;

  return (
    <div className="w-full min-h-full p-4 space-y-4 font-sans">
      {/* Faculty Mode: Toggle between 'My Assigned Lectures' and 'All Department Classes' */}
      {isFaculty ? (
        <div className="space-y-2">
          {myClassTeacherOf && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="font-bold text-amber-950">
                  Class Teacher: <strong>{myClassTeacherOf}</strong>
                </span>
              </div>
              <span className="text-[10px] bg-amber-200/80 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                Active Duty
              </span>
            </div>
          )}

          <div className="bg-slate-100 p-1 rounded-2xl flex items-center justify-between text-xs font-bold">
            <button
              onClick={() => setFacultyFilter('my')}
              className={`flex-1 py-2 text-center rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
                facultyFilter === 'my'
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>👨‍🏫 My Assigned Lectures</span>
            </button>
            <button
              onClick={() => setFacultyFilter('all')}
              className={`flex-1 py-2 text-center rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
                facultyFilter === 'all'
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🏫 All Dept Classes</span>
            </button>
          </div>
        </div>
      ) : (
        /* Student Mode: Class Wise / Subject Wise Toggle */
        <div className="bg-slate-100 p-1 rounded-full flex items-center justify-between text-xs font-semibold">
          <button
            onClick={() => setViewType('class')}
            className={`flex-1 py-1.5 text-center rounded-full transition-all ${
              viewType === 'class'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Class Wise
          </button>
          <button
            onClick={() => setViewType('subject')}
            className={`flex-1 py-1.5 text-center rounded-full transition-all ${
              viewType === 'subject'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Subject Wise
          </button>
        </div>
      )}

      {/* Days Tabs (Mon, Tue, Wed, Thu, Fri, Sat) */}
      <div className="flex items-center justify-between space-x-1">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`flex-1 py-2 text-center rounded-xl text-xs font-bold transition-all ${
              selectedDay === day
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Class Schedule Cards */}
      <div className="space-y-3">
        {filteredSlots.length > 0 ? (
          filteredSlots.map((slot) => {
            const isAssignedToMe = isFaculty && isMySlot(slot);

            return (
              <div
                key={slot.id}
                className={`bg-white rounded-2xl p-4 border shadow-sm flex items-start space-x-3.5 transition-all ${
                  isAssignedToMe
                    ? 'border-blue-500 ring-2 ring-blue-500/10'
                    : 'border-slate-100 hover:border-blue-200'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-xs flex-shrink-0 ${
                    slot.category === 'CS'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-indigo-100 text-indigo-800'
                  }`}
                >
                  {slot.category}
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start gap-1">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">
                        {slot.subjectName}
                      </h4>
                      {slot.course && (
                        <p className="text-[10px] text-blue-600 font-semibold mt-0.5">
                          {slot.course} {slot.semester ? `• ${slot.semester}` : ''}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                        {slot.type}
                      </span>
                      {isAssignedToMe && (
                        <span className="text-[9px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-md flex items-center space-x-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5 text-blue-600" />
                          <span>My Lecture</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-1 flex items-center space-x-1.5 text-[11px] text-slate-500 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      ({slot.startTime} - {slot.endTime})
                    </span>
                  </div>

                  <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-600">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium text-slate-700">{slot.room}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-slate-500 text-[10px]">
                      <User className="w-3 h-3 text-slate-400" />
                      <span className={isAssignedToMe ? 'font-bold text-blue-700' : ''}>
                        {slot.facultyName}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="space-y-3">
            <div className="text-center py-6 bg-white rounded-2xl border border-slate-100 p-4">
              <CalendarIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <h4 className="font-bold text-xs text-slate-700">
                {isFaculty && facultyFilter === 'my'
                  ? `No teaching lectures assigned to you on ${selectedDay}`
                  : `No lectures scheduled for ${selectedDay}`}
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isFaculty
                  ? 'Admin can allocate new timetable slots from the Desktop ERP Portal.'
                  : 'Classroom allocation will be updated by your Department HOD.'}
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
          {currentUser.role === 'faculty'
            ? 'Faculty Academic Timetable • Realtime Synchronized'
            : currentUser.semester
            ? `${currentUser.semester} Academic Calendar Active`
            : 'Academic Calendar Active'}
        </span>
      </div>
    </div>
  );
};
