'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Calendar,
  MapPin,
  Users,
  CheckCircle,
  Sparkles,
  Ticket,
  ShieldCheck,
  X,
  Clock,
  Award,
  Eye,
} from 'lucide-react';
import { EventItem } from '@/types';

export const EventsView: React.FC = () => {
  const { events, registerForEvent, isRegisteredForEvent, currentUser } = useApp();
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

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
              {/* Banner Image / Header (Clickable for Full Details Modal) */}
              <div
                onClick={() => setSelectedEvent(event)}
                className="relative h-36 w-full overflow-hidden cursor-pointer group"
                title="Tap image to view full event details"
              >
                <img
                  src={event.bannerImage}
                  alt={event.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent flex flex-col justify-end p-4">
                  <div className="flex items-center justify-between mb-1">
                    {isFeatured ? (
                      <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                        <Sparkles className="w-3 h-3" />
                        <span>Featured Event</span>
                      </span>
                    ) : (
                      <span />
                    )}

                    {/* Visual Pill Indicator that Image is Clickable */}
                    <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-white bg-black/45 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20 shadow-xs group-hover:bg-[#1d4ed8] transition-colors">
                      <Eye className="w-3 h-3" />
                      <span>View Details</span>
                    </span>
                  </div>

                  <h3 className="font-extrabold text-white text-base leading-tight group-hover:text-blue-100 transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-[11px] text-blue-200">{event.subtitle}</p>
                </div>
              </div>

              {/* Event Details & Registration Bar */}
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
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1d4ed8] text-white hover:bg-blue-800 active:scale-95 transition-all shadow-sm flex items-center space-x-1.5 disabled:opacity-60"
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
                      {currentUser.rollNo || 'PASS ACTIVE'}
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

      {/* =========================================================================
          FULL EVENT DETAILS MODAL (Opens on image click)
         ========================================================================= */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col font-sans">
            {/* Modal Hero Banner */}
            <div className="relative h-48 sm:h-52 w-full overflow-hidden shrink-0">
              <img
                src={selectedEvent.bannerImage}
                alt={selectedEvent.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-between p-4">
                <div className="flex justify-between items-center">
                  <span className="inline-flex items-center space-x-1 text-[10px] font-extrabold text-amber-400 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full uppercase tracking-wider border border-amber-400/30">
                    <Sparkles className="w-3 h-3" />
                    <span>Campus Event</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedEvent(null)}
                    className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md transition-colors"
                    title="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <h3 className="font-extrabold text-white text-lg leading-tight drop-shadow-md">
                    {selectedEvent.title}
                  </h3>
                  <p className="text-xs text-blue-200 font-medium mt-0.5 drop-shadow-sm">
                    {selectedEvent.subtitle}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Event Metadata Chips Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-2xl flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Date</span>
                    <span className="text-xs font-bold text-slate-900 truncate block">{selectedEvent.date}</span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-2xl flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Time</span>
                    <span className="text-xs font-bold text-slate-900 truncate block">
                      {selectedEvent.time || '10:00 AM Onwards'}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-2xl flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Venue</span>
                    <span className="text-xs font-bold text-slate-900 truncate block">{selectedEvent.venue}</span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-2xl flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Capacity</span>
                    <span className="text-xs font-bold text-slate-900 truncate block">
                      {selectedEvent.registeredCount} Registered
                    </span>
                  </div>
                </div>
              </div>

              {/* Single Registration Policy Box */}
              <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-3 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 text-blue-900 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-[#1d4ed8] shrink-0" />
                  <span>Single Student Registration Rule Enforced</span>
                </div>
                <span className="text-[10px] font-bold bg-blue-200/70 text-blue-900 px-2 py-0.5 rounded-md shrink-0">
                  1 Pass Only
                </span>
              </div>

              {/* Detailed Description */}
              <div className="space-y-1.5">
                <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                  About this Event &amp; Schedule
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                  {selectedEvent.description ||
                    'Join us for the premier annual Tech Fest at Modern College! Participate in algorithmic challenges, web & app design sprints, debugging wars, and tech presentations. Winners receive prestigious trophies and institutional merit certificates.'}
                </p>
              </div>

              {/* Highlights & Guidelines */}
              <div className="space-y-2 bg-slate-50 rounded-2xl p-3 border border-slate-100 text-xs">
                <h5 className="font-bold text-slate-800 text-[11px] uppercase tracking-wide flex items-center space-x-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span>Event Highlights &amp; Rules</span>
                </h5>
                <ul className="space-y-1.5 text-slate-600 text-[11px]">
                  <li className="flex items-start space-x-1.5">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Bring your valid Modern College Digital ID card or QR Pass for auditorium entry.</span>
                  </li>
                  <li className="flex items-start space-x-1.5">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>All participants receive university-recognized certificates of participation.</span>
                  </li>
                  <li className="flex items-start space-x-1.5">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>Complimentary refreshments and event badges will be provided at the registration desk.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Modal Sticky Bottom Action Footer */}
            <div className="p-3.5 bg-white border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
              {isRegisteredForEvent(selectedEvent.id) ? (
                <div className="w-full flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-2.5">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="text-xs font-bold text-emerald-900 block leading-tight">Registration Confirmed ✓</span>
                      <span className="text-[10px] text-emerald-700">Pass verified • Single entry active</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-200/80 px-2.5 py-1 rounded-lg">
                    {currentUser.rollNo || 'PASS ACTIVE'}
                  </span>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setSelectedEvent(null)}
                    className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    disabled={submittingId === selectedEvent.id}
                    onClick={() => handleRegister(selectedEvent.id, selectedEvent.title)}
                    className="flex-1 py-2.5 px-4 rounded-2xl bg-[#1d4ed8] hover:bg-blue-700 text-white text-xs font-bold shadow-md flex items-center justify-center space-x-2 transition-all active:scale-95 disabled:opacity-60"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>{submittingId === selectedEvent.id ? 'Registering...' : 'Register Now (1 Pass)'}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
