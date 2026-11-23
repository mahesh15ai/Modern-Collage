'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ChevronRight, CheckCircle2, Receipt, CreditCard } from 'lucide-react';

export const FeesView: React.FC = () => {
  const { fees, payFees, currentUser } = useApp();
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  const handlePayNow = () => {
    setPaying(true);
    setTimeout(() => {
      payFees('FEE-03');
      setPaying(false);
    }, 1000);
  };

  return (
    <div className="w-full min-h-full p-4 space-y-4 font-sans">
      {/* Pending Fees Big Orange Card (Matches Mockup) */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-3xl p-5 shadow-sm flex items-center space-x-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center font-black text-2xl shadow-sm">
          ₹
        </div>
        <div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            ₹{fees.pendingAmount.toLocaleString('en-IN')}
          </div>
          <p className="text-xs font-semibold text-slate-600">Pending Fees</p>
        </div>
      </div>

      {fees.pendingAmount > 0 && (
        <button
          onClick={handlePayNow}
          disabled={paying}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs shadow-sm flex items-center justify-center space-x-2 transition-all active:scale-95 disabled:opacity-75"
        >
          <CreditCard className="w-4 h-4" />
          <span>{paying ? 'Processing Payment...' : 'Pay ₹2,500 via UPI / Card'}</span>
        </button>
      )}

      {/* Fee History Section (Matches Mockup) */}
      <div>
        <h3 className="font-bold text-slate-800 text-xs mb-3">Fee History</h3>
        {fees.history.length > 0 ? (
          <div className="space-y-3">
            {fees.history.map((item) => (
              <div
                key={item.id}
                onClick={() => item.status === 'Paid' && setSelectedReceipt(item.id)}
                className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between cursor-pointer hover:border-slate-200 transition-all"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-bold text-xs text-slate-900">{item.title}</h4>
                  </div>
                  <div className="mt-1 text-sm font-extrabold text-slate-900">
                    ₹{item.amount.toLocaleString('en-IN')}
                  </div>
                  {item.paidDate && (
                    <p className="text-[10px] text-slate-400 font-medium">
                      Paid on {item.paidDate}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      item.status === 'Paid'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {item.status}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-white rounded-2xl p-4 border border-slate-100 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Annual Fee Clearance</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>No Dues Pending</span>
                </span>
              </div>
              <div className="text-[11px] text-slate-600 space-y-1.5 border-t border-slate-50 pt-2">
                <div className="flex justify-between">
                  <span>Tuition &amp; Academic Fees:</span>
                  <span className="font-semibold text-slate-800">Clear</span>
                </div>
                <div className="flex justify-between">
                  <span>Computer &amp; Software Lab:</span>
                  <span className="font-semibold text-slate-800">Clear</span>
                </div>
                <div className="flex justify-between">
                  <span>University Examination Fee:</span>
                  <span className="font-semibold text-slate-800">Clear</span>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 text-center py-1">No pending installment transactions recorded.</p>
          </div>
        )}
      </div>

      {/* View Receipt Button - Only shown when real payment transactions exist */}
      {fees.history.length > 0 && (
        <button
          onClick={() => setSelectedReceipt(fees.history[0]?.id || null)}
          className="w-full py-3.5 bg-blue-950 hover:bg-blue-900 text-white rounded-2xl font-bold text-xs shadow-md flex items-center justify-center space-x-2 transition-all active:scale-95"
        >
          <Receipt className="w-4 h-4" />
          <span>View Payment Receipt</span>
        </button>
      )}

      {/* Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl border border-slate-100">
            <div className="text-center pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">Payment Receipt</h4>
              <p className="text-[10px] text-slate-500">Official College E-Receipt</p>
            </div>

            {(() => {
              const item = fees.history.find((h) => h.id === selectedReceipt) || fees.history[0];
              return item ? (
                <div className="py-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Receipt No:</span>
                    <span className="font-mono font-bold text-slate-800">{item.receiptNo || `REC-${item.id}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Student:</span>
                    <span className="font-bold text-slate-800">{currentUser.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Course:</span>
                    <span className="font-bold text-slate-800">{currentUser.course || 'Enrolled Program'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Amount:</span>
                    <span className="font-bold text-blue-900">₹{item.amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status:</span>
                    <span className="font-bold text-emerald-600">{item.status}</span>
                  </div>
                </div>
              ) : null;
            })()}

            <button
              onClick={() => setSelectedReceipt(null)}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
