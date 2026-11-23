'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Calendar, MapPin, Users, CheckCircle, Sparkles } from 'lucide-react';

export const EventsView: React.FC = () => {
  const { events, registerForEvent } = useApp();
  const [registeredList, setRegisteredList] = useState<string[]>([]);

  const handleRegister = (id: string) => {
    registerForEvent(id);
    setRegisteredList((prev) => [...prev, id]);
  };

  return (
    <div className="w-full min-h-full p-4 space-y-4 font-sans">
      {events.length > 0 ? (
        events.map((event, index) => {
          const isRegistered = registeredList.includes(event.id);
          const isFeatured = index === 0;

          return (
            <div
              key={event.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all"
            >
              {/* Banner Image / Header */}
              <div className="relative h-36 w-full overflow-hidden">
                <img
                  src={event.bannerImage}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-end p-4">
                  {isFeatured && (
                    <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Featured Event</span>
                    </span>
                  )}
                  <h3 className="font-extrabold text-white text-base leading-tight">
                    {event.title}
                  </h3>
                  <p className="text-[11px] text-blue-200">{event.subtitle}</p>
                </div>
              </div>

              {/* Event Details & Registration */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span className="font-semibold text-slate-800">{event.date}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>{event.venue}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center space-x-1 text-[11px] text-slate-500">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{event.registeredCount} Registered</span>
                  </div>

                  <button
                    onClick={() => handleRegister(event.id)}
                    disabled={isRegistered}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${isRegistered
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-900 text-white hover:bg-blue-950 active:scale-95 shadow-sm'
                      }`}
                  >
                    {isRegistered ? (
                      <span className="flex items-center space-x-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Registered!</span>
                      </span>
                    ) : (
                      'Register Now'
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="space-y-3">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm text-center space-y-2">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-bold text-xs text-slate-800">No Active Events for Registration</h4>
            <p className="text-[11px] text-slate-400">Upcoming symposiums and workshops will be published here.</p>
          </div>

          {/* Upcoming College Annual Highlights Card */}
          <div className="bg-gradient-to-br from-indigo-950 to-blue-900 rounded-3xl p-4 text-white space-y-3 shadow-md">
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold">
              <Sparkles className="w-4 h-4" />
              <span>Modern College Flagship Events (2025-26)</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-sm border border-white/10">
                <div className="flex justify-between items-start">
                  <h5 className="font-bold text-white text-xs">Tech Fest 2025</h5>
                  <span className="text-[9px] bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded-full">Annual</span>
                </div>
                <p className="text-[11px] text-blue-200 mt-1">State-level Coding Competition, Project Exhibition &amp; AI Workshops.</p>
              </div>

              <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-sm border border-white/10">
                <div className="flex justify-between items-start">
                  <h5 className="font-bold text-white text-xs">Annual Gathering &amp; Sports Meet</h5>
                  <span className="text-[9px] bg-blue-400 text-slate-950 font-bold px-2 py-0.5 rounded-full">Term II</span>
                </div>
                <p className="text-[11px] text-blue-200 mt-1">Cricket, Badminton, Drama, Dance &amp; Youth Cultural Festival.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
