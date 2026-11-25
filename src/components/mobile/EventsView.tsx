'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Calendar, MapPin, Users, CheckCircle, Sparkles, Ticket, ShieldCheck } from 'lucide-react';

export const EventsView: React.FC = () => {
  const { events, registerForEvent, isRegisteredForEvent, currentUser } = useApp();
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleRegister = async (eventId: string, eventTitle: string) => {
    if (isRegisteredForEvent(eventId)) {
      setToastMessage('You have already registered for this event.');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    setSubmittingId(eventId);
    try {
      const registered = await registerForEvent(eventId);
      if (registered) {
        setToastMessage(`🎉 Registration confirmed for ${eventTitle}! (1 pass per student)`);
      } else {
        setToastMessage('Already registered! Only 1 registration allowed per student.');
      }
    } catch (err) {
      console.error('Registration failed:', err);
    } finally {
      setSubmittingId(null);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  return (
    <div className="w-full min-h-full p-4 space-y-4 font-sans pb-16">
      {/* Registration Confirmation Alert Toast */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-emerald-400/50 flex items-center space-x-2 text-xs font-semibold animate-in fade-in slide-in-from-top-4 duration-200 max-w-sm w-full mx-4">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="leading-snug">{toastMessage}</span>
        </div>
      )}

      {events.length > 0 ? (
        events.map((event, index) => {
          const isRegistered = isRegisteredForEvent(event.id);
          const isFeatured = index === 0;

          return (
            <div
              key={event.id}
              className={`bg-white rounded-3xl overflow-hidden border transition-all ${isRegistered
                  ? 'border-emerald-200/80 shadow-xs'
                  : 'border-slate-100 shadow-sm hover:shadow-md'
                }`}
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

                  {isRegistered ? (
                    <button
                      type="button"
                      disabled
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/90 flex items-center space-x-1.5 cursor-not-allowed shadow-none"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Registered ✓</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleRegister(event.id, event.title)}
                      disabled={submittingId === event.id}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-900 text-white hover:bg-blue-950 active:scale-95 transition-all shadow-sm flex items-center space-x-1.5 disabled:opacity-60"
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      <span>{submittingId === event.id ? 'Registering...' : 'Register (1 Pass)'}</span>
                    </button>
                  )}
                </div>

                {/* Single Pass Confirmed Footer Banner for Registered Students */}
                {isRegistered && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-emerald-700 bg-emerald-50/70 -mx-4 -mb-4 px-4 py-2 rounded-b-3xl">
                    <div className="flex items-center space-x-1.5 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>1 Registration Confirmed • Pass verified</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded-md">
                      {currentUser.rollNo || 'Pass Active'}
                    </span>
                  </div>
                )}
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
