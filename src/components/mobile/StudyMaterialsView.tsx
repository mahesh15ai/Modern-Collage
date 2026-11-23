'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Search, Download, CheckCircle } from 'lucide-react';

export const StudyMaterialsView: React.FC = () => {
  const { materials } = useApp();
  const [activeCategory, setActiveCategory] = useState<'Notes' | 'Papers' | 'Books'>('Notes');
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadedIds, setDownloadedIds] = useState<string[]>([]);

  const filteredMaterials = materials.filter((mat) => {
    const matchesCategory = mat.category === activeCategory;
    const matchesSearch =
      mat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mat.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleDownload = (id: string) => {
    setDownloadedIds((prev) => [...prev, id]);
  };

  return (
    <div className="w-full min-h-full p-4 space-y-4 font-sans">
      {/* Search Bar (Matches Mockup) */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search notes..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-700 shadow-sm"
        />
      </div>

      {/* Category Pills (Matches Mockup: Notes, Papers, Books) */}
      <div className="flex items-center space-x-2">
        {(['Notes', 'Papers', 'Books'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeCategory === cat
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Materials List (Matches Mockup: DS Notes 2.5MB, OS Notes 1.8MB, DBMS Notes 2.1MB, Previous Year Papers 1.2MB) */}
      <div className="space-y-3">
        {filteredMaterials.map((item) => {
          const isDownloaded = downloadedIds.includes(item.id);
          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all"
            >
              <div className="flex items-center space-x-3">
                {/* Red PDF Icon (Matches Mockup) */}
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold text-[10px] tracking-wider">
                  PDF
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">{item.title}</h4>
                  <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-medium">
                    <span>({item.fileSize})</span>
                    <span>•</span>
                    <span>{item.subject}</span>
                  </div>
                </div>
              </div>

              {/* Download Action Button */}
              <button
                onClick={() => handleDownload(item.id)}
                className={`p-2 rounded-xl transition-all ${isDownloaded
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100 active:scale-95'
                  }`}
                title="Download File"
              >
                {isDownloaded ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
              </button>
            </div>
          );
        })}

        {filteredMaterials.length === 0 && (
          <div className="space-y-3 pt-2">
            <div className="bg-white rounded-2xl p-6 border border-slate-100 text-center space-y-2.5 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 mx-auto flex items-center justify-center">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-xs text-slate-800">No Study Materials Published Yet</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Lecture notes, syllabus copies, and lab assignment PDFs will appear here once faculty uploads them.
              </p>
            </div>

            <div className="bg-gradient-to-br from-indigo-50/70 to-blue-50 rounded-2xl p-4 border border-blue-100/70 space-y-2">
              <h5 className="font-bold text-xs text-blue-950">University E-Resources &amp; Library</h5>
              <div className="text-[11px] text-slate-600 space-y-1.5">
                <div className="flex justify-between items-center py-0.5">
                  <span>SRTMUN Syllabus Curriculum:</span>
                  <span className="font-bold text-blue-800">B.Sc CS (CBCS Pattern)</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span>Central Library Timing:</span>
                  <span className="font-semibold text-slate-700">10:00 AM - 05:30 PM</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span>Free E-Journal Access:</span>
                  <span className="font-bold text-emerald-700">Campus Wi-Fi Active</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
