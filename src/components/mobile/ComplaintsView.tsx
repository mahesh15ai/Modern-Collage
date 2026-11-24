'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Plus, ChevronRight, CheckCircle2, Clock, X } from 'lucide-react';
import { ComplaintItem } from '@/types';

export const ComplaintsView: React.FC = () => {
  const { complaints, addComplaint } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ComplaintItem['category']>('Infrastructure');
  const [description, setDescription] = useState('');

  // Intercept mobile hardware back button to close modal
  useEffect(() => {
    if (showModal) {
      if (typeof window !== 'undefined') {
        window.history.pushState({ modal: 'complaint' }, '', window.location.href);
      }
      const handleModalPop = () => {
        setShowModal(false);
      };
      window.addEventListener('popstate', handleModalPop, { once: true });
      return () => {
        window.removeEventListener('popstate', handleModalPop);
        if (typeof window !== 'undefined' && window.history.state?.modal === 'complaint') {
          window.history.back();
        }
      };
    }
  }, [showModal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addComplaint(title, category, description);
    setTitle('');
    setDescription('');
    setShowModal(false);
  };

  return (
    <div className="w-full min-h-full p-4 space-y-4 font-sans">
      {/* New Complaint Button (Matches Mockup) */}
      <button
        onClick={() => setShowModal(true)}
        className="w-full py-3.5 bg-blue-900 hover:bg-blue-950 text-white rounded-2xl font-bold text-xs shadow-md flex items-center justify-center space-x-2 transition-all active:scale-95"
      >
        <Plus className="w-4 h-4" />
        <span>File Grievance / Complaint</span>
      </button>

      {/* Complaints List or Clean Empty State */}
      {complaints.length > 0 ? (
        <div className="space-y-3">
          {complaints.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between hover:border-slate-200 transition-all"
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.status === 'Resolved'
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-amber-100 text-amber-600'
                    }`}
                >
                  {item.status === 'Resolved' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Clock className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">{item.title}</h4>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.status === 'Resolved'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                        }`}
                    >
                      {item.status}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {item.date}
                    </span>
                  </div>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900">All Campus Services Operational</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                You have not filed any grievances. If you encounter any issues regarding computer laboratories, library access, or campus facilities, click the button above.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50/60 rounded-2xl p-4 border border-blue-100/80 space-y-2">
            <h5 className="font-bold text-xs text-blue-950">Grievance Redressal Cell</h5>
            <div className="text-[11px] text-slate-600 space-y-1">
              <p>• <strong>Student Welfare Officer:</strong> Staff Room, 1st Floor</p>
              <p>• <strong>Anti-Ragging Helpline:</strong> 1800-180-5522 (Toll Free)</p>
              <p>• <strong>IT &amp; Lab Support:</strong> admin@modernclg.edu.in</p>
            </div>
          </div>
        </div>
      )}

      {/* New Complaint Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h4 className="font-bold text-sm text-slate-900">File Grievance</h4>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Issue Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Lab 3 Air Conditioner issue"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-700 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ComplaintItem['category'])}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-700 focus:outline-none"
                >
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Academic">Academic</option>
                  <option value="Hostel">Hostel</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Details
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your issue in detail..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-700 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-blue-900 hover:bg-blue-950"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
