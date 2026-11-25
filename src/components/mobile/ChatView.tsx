'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Send,
  User,
  GraduationCap,
  Sparkles,
  Search,
  MessageSquare,
  ArrowLeft,
  Check,
  CheckCheck,
  Award,
  BookOpen,
  Calendar,
  Clock,
  ChevronRight,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { FacultyRecord, StudentRecord, ChatMessage } from '@/types';

// Fallback faculty records matching the design reference perfectly
const DEFAULT_CLASS_TEACHER: FacultyRecord = {
  id: 'FAC-CT-001',
  name: 'Nikita Sharma',
  employeeId: 'EMP-CS-012',
  email: 'nikita.sharma@modernclg.edu.in',
  phone: '+91 94220 12345',
  department: 'Computer Science Dept',
  designation: 'Associate Professor',
  qualification: 'M.Tech, Ph.D (Computer Science)',
  workloadHours: 18,
  subjectsAssigned: ['Data Structures', 'Web Tech'],
  classTeacherOf: 'TY B.Sc Computer Science',
  status: 'Active',
  avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=240&auto=format&fit=crop&q=80',
};

const DEFAULT_SUBJECT_FACULTY: FacultyRecord[] = [
  {
    id: 'FAC-SUB-001',
    name: 'Rohit Mehta',
    employeeId: 'EMP-CS-018',
    email: 'rohit.mehta@modernclg.edu.in',
    phone: '+91 94220 54321',
    department: 'Computer Science',
    designation: 'Associate Professor',
    qualification: 'M.Sc., NET-SET, Ph.D',
    workloadHours: 16,
    subjectsAssigned: ['Data Structures', 'Web Tech'],
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80',
  },
];

export const ChatView: React.FC = () => {
  const {
    currentUser,
    facultyList,
    students,
    chatMessages,
    activeChatRecipient,
    setActiveChatRecipient,
    sendChatMessage,
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [showAllFaculty, setShowAllFaculty] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isStudent = currentUser.role === 'student';

  // Determine Class Teacher: check facultyList first, otherwise fallback to DEFAULT_CLASS_TEACHER
  const classTeacher: FacultyRecord =
    facultyList.find(
      (f) =>
        f.classTeacherOf &&
        currentUser.course &&
        (currentUser.course.toLowerCase().includes('computer science') ||
          f.classTeacherOf.toLowerCase().includes('computer science'))
    ) ||
    facultyList.find((f) => f.classTeacherOf) ||
    (facultyList.length > 0 ? facultyList[0] : DEFAULT_CLASS_TEACHER);

  // Determine Subject Faculty list:
  const rawSubjectTeachers: FacultyRecord[] =
    facultyList.filter((f) => f.id !== classTeacher?.id);

  const subjectTeachers: FacultyRecord[] =
    rawSubjectTeachers.length > 0 ? rawSubjectTeachers : DEFAULT_SUBJECT_FACULTY;

  // Filter messages between current user and active recipient
  const currentUserId = currentUser.id || (isStudent ? 'STU-001' : 'FAC-2024-009');
  const activeRecipientId = activeChatRecipient?.id;

  const conversationMessages = chatMessages.filter((msg) => {
    if (!activeRecipientId) return false;
    return (
      (msg.senderId === currentUserId && msg.receiverId === activeRecipientId) ||
      (msg.senderId === activeRecipientId && msg.receiverId === currentUserId)
    );
  });

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || !activeChatRecipient) return;

    const text = inputMessage.trim();
    setInputMessage('');
    await sendChatMessage(text, selectedSubject);
  };

  const handleQuickChipClick = (chipText: string) => {
    setInputMessage(chipText);
  };

  // Back button handler to return to teacher directory list
  const handleBackToList = () => {
    setActiveChatRecipient(null);
  };

  // ---------------------------------------------------------------------------
  // VIEW A: Active 1-on-1 Realtime Doubt Clearing Chat View (Edge-to-Edge Full Height)
  // ---------------------------------------------------------------------------
  if (activeChatRecipient) {
    const isRecipientFaculty = 'designation' in activeChatRecipient;
    const teacherData = isRecipientFaculty ? (activeChatRecipient as FacultyRecord) : null;
    const isClassTeacher = teacherData?.classTeacherOf;

    return (
      <div className="fixed inset-0 z-40 max-w-lg mx-auto flex flex-col bg-slate-50 overflow-hidden font-sans h-full shadow-2xl">
        {/* Dedicated 1-on-1 Chat Header (Replaces Outer Frame Header) */}
        <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3 py-2.5 flex items-center justify-between z-30 shadow-xs shrink-0">
          <div className="flex items-center space-x-2.5 min-w-0">
            <button
              type="button"
              onClick={handleBackToList}
              className="p-1.5 -ml-1 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
              title="Back to teachers list"
            >
              <ArrowLeft className="w-5 h-5 text-slate-800" />
            </button>

            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 bg-blue-50">
                <img
                  src={
                    (activeChatRecipient as any).avatar ||
                    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=240&auto=format&fit=crop&q=80'
                  }
                  alt={activeChatRecipient.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-xs" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center space-x-1.5 flex-wrap gap-y-0.5">
                <h3 className="font-extrabold text-sm text-slate-900 truncate leading-tight">
                  {activeChatRecipient.name}
                </h3>
                {isClassTeacher && (
                  <span className="text-[9px] font-black bg-amber-100 text-amber-900 border border-amber-200/80 px-1.5 py-0.2 rounded-md shrink-0">
                    ★ Class Teacher
                  </span>
                )}
              </div>
              <p className="text-[10.5px] text-slate-500 truncate mt-0.5">
                {isRecipientFaculty
                  ? `${teacherData?.designation || 'Faculty'} • ${teacherData?.department || 'CS Dept'}`
                  : `${(activeChatRecipient as StudentRecord).course || 'Student'}`}
              </p>
            </div>
          </div>
        </header>

        {/* Message Thread Scroll Area (Takes remaining height and scrolls smoothly) */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-4 space-y-3.5">
          {/* Welcome Official Doubts Banner */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/70 rounded-2xl p-3 text-center space-y-1">
            <div className="inline-flex items-center space-x-1 text-[10px] font-extrabold text-blue-800 uppercase tracking-wider bg-white/80 px-2.5 py-0.5 rounded-full border border-blue-100">
              <ShieldCheck className="w-3 h-3 text-blue-600" />
              <span>Official Academic Doubt Desk</span>
            </div>
            <h4 className="font-extrabold text-xs text-slate-900">
              {isRecipientFaculty
                ? `Direct Q&A with ${activeChatRecipient.name}`
                : `Student Query: ${activeChatRecipient.name}`}
            </h4>
            <p className="text-[10.5px] text-slate-600 leading-relaxed max-w-xs mx-auto">
              Ask your syllabus doubts, assignment questions, or lab schedule queries directly. Messages are synced in real time.
            </p>
          </div>

          {/* Chat Messages */}
          {conversationMessages.length > 0 ? (
            conversationMessages.map((msg) => {
              const isMine = msg.senderId === currentUserId;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-xs transition-all ${isMine
                        ? 'bg-[#1d4ed8] text-white rounded-br-xs'
                        : 'bg-white text-slate-900 border border-slate-200/90 rounded-bl-xs shadow-sm'
                      }`}
                  >
                    {!isMine && (
                      <span className="text-[9.5px] font-bold text-blue-700 block mb-0.5">
                        {msg.senderName}
                      </span>
                    )}

                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                    <div
                      className={`flex items-center justify-end space-x-1 text-[9.5px] mt-1 ${isMine ? 'text-blue-200' : 'text-slate-400'
                        }`}
                    >
                      <span>{msg.timestamp}</span>
                      {isMine && <CheckCheck className="w-3 h-3 text-blue-300" />}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <h5 className="font-bold text-xs text-slate-800">No Messages Yet</h5>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                Send your first question or academic doubt to start the conversation with {activeChatRecipient.name}.
              </p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Pinned Bottom Container: Quick Chips + Message Input Bar */}
        <div className="shrink-0 bg-white border-t border-slate-200/90 shadow-[0_-4px_16px_rgba(0,0,0,0.03)] z-20">
          {/* Quick Academic Doubt Chips */}
          <div className="px-3 py-1.5 bg-slate-50/90 border-b border-slate-100 flex items-center space-x-1.5 overflow-x-auto [scrollbar-width:none]">
            {[
              'Sir, I have a doubt in Unit 2',
              'When is the assignment deadline?',
              'Can you share the lecture slides?',
              'Is the lab manual submission this week?',
            ].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => handleQuickChipClick(chip)}
                className="px-2.5 py-1 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-800 rounded-full text-[10.5px] font-semibold whitespace-nowrap border border-slate-200/90 shadow-2xs transition-colors shrink-0 active:scale-95"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Message Input Bar */}
          <form
            onSubmit={handleSendMessage}
            className="p-2.5 sm:p-3 bg-white flex items-center space-x-2"
          >
            <input
              type="text"
              required
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Ask ${activeChatRecipient.name} a doubt...`}
              className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all shadow-inner"
            />

            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="w-10 h-10 rounded-full bg-[#1d4ed8] hover:bg-blue-700 disabled:opacity-40 text-white flex items-center justify-center shadow-md active:scale-95 transition-all shrink-0"
              title="Send message"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // VIEW B: Academic Doubt Desk Directory (Pixel-Perfect to Reference Design)
  // ---------------------------------------------------------------------------

  // Search filtering logic
  const query = searchQuery.trim().toLowerCase();

  const isClassTeacherMatch =
    !query ||
    classTeacher.name.toLowerCase().includes(query) ||
    classTeacher.department?.toLowerCase().includes(query) ||
    classTeacher.subjectsAssigned?.some((s) => s.toLowerCase().includes(query)) ||
    classTeacher.classTeacherOf?.toLowerCase().includes(query);

  const filteredSubjectTeachers = subjectTeachers.filter((f) => {
    if (!query) return true;
    return (
      f.name.toLowerCase().includes(query) ||
      f.department?.toLowerCase().includes(query) ||
      f.subjectsAssigned?.some((s) => s.toLowerCase().includes(query)) ||
      f.classTeacherOf?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="w-full min-h-full px-4 pt-3 pb-8 space-y-4 font-sans bg-slate-50/50">
      {/* =======================================================================
          1. TOP BLUE GRADIENT BANNER
         ======================================================================= */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1d4ed8] via-[#2563eb] to-[#1e40af] p-4 text-white shadow-[0_4px_20px_rgba(29,78,216,0.25)] flex items-center">
        {/* Left Side: Speech Bubble with Question Mark & Perched Graduation Cap */}
        <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
          {/* White Speech Bubble */}
          <div className="w-9 h-9 bg-white rounded-2xl rounded-bl-xs shadow-md flex items-center justify-center relative mt-2">
            <span className="text-[#1d4ed8] font-black text-lg leading-none">?</span>
          </div>
          {/* Navy Graduation Cap with Golden Tassel perched on top at angle */}
          <div className="absolute top-0.5 -left-1 -rotate-12 drop-shadow-sm pointer-events-none">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
              <polygon points="12,3 22,8 12,13 2,8" fill="#0f172a" />
              <path d="M6,10.5 V15 C6,17.5 18,17.5 18,15 V10.5" fill="#1e293b" />
              <path d="M20,8.5 V15" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="20" cy="16" r="1.2" fill="#f59e0b" />
            </svg>
          </div>
        </div>

        {/* Thin Vertical White Divider */}
        <div className="h-10 w-[1.5px] bg-white/20 mx-3 shrink-0" />

        {/* Banner Texts */}
        <div className="min-w-0 flex-1 pr-4">
          <h2 className="font-extrabold text-[15px] sm:text-base text-white tracking-tight leading-tight">
            Academic Doubt Desk
          </h2>
          <p className="text-[11px] text-blue-100 font-normal leading-snug mt-0.5">
            Chat directly with your Class Teacher &amp; Subject Faculty
          </p>
        </div>

        {/* Watermark Book Icon on Right */}
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-20">
          <BookOpen className="w-16 h-16 text-white stroke-[1.4]" />
        </div>
      </div>

      {/* =======================================================================
          2. SEARCH INPUT
         ======================================================================= */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search teacher or subject name..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/90 rounded-full text-xs font-normal text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all"
        />
      </div>

      {/* =======================================================================
          3. SECTION: ASSIGNED CLASS TEACHER
         ======================================================================= */}
      {isClassTeacherMatch && (
        <section className="space-y-2">
          {/* Section Header */}
          <div className="flex items-center justify-between px-0.5">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-5 h-5 text-[#1d4ed8]" />
              <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">
                Assigned Class Teacher
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowAllFaculty((prev) => !prev)}
              className="text-[11px] font-semibold text-[#1d4ed8] bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-full flex items-center space-x-1 transition-colors"
            >
              <span>{showAllFaculty ? 'Show Less' : 'View All'}</span>
              <ChevronRight className="w-3 h-3 text-[#1d4ed8]" />
            </button>
          </div>

          {/* Teacher Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-3.5 flex items-center justify-between hover:shadow-md transition-shadow">
            {/* Left: Avatar + Details */}
            <div className="flex items-center space-x-3 min-w-0 flex-1 pr-2">
              {/* Circular Avatar with Active Green Dot */}
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 border border-slate-200/70">
                  <img
                    src={
                      classTeacher.avatar ||
                      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=240&auto=format&fit=crop&q=80'
                    }
                    alt={classTeacher.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-xs" />
              </div>

              {/* Info Lines */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <h4 className="font-extrabold text-sm text-slate-900 truncate">
                    {classTeacher.name}
                  </h4>
                  <span className="bg-[#fef3c7] text-[#92400e] text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center space-x-0.5 shrink-0">
                    <span>★</span>
                    <span>Class Teacher</span>
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 font-normal truncate mt-0.5">
                  {classTeacher.designation} • {classTeacher.department || 'Computer Science Dept'}
                </p>

                <div className="flex items-center space-x-1 mt-0.5 text-[#2563eb]">
                  <BookOpen className="w-3.5 h-3.5 shrink-0 text-[#2563eb]" />
                  <span className="text-[11px] font-medium text-[#2563eb] truncate">
                    {classTeacher.subjectsAssigned && classTeacher.subjectsAssigned.length > 0
                      ? classTeacher.subjectsAssigned.join(', ')
                      : 'Data Structures, Web Tech'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Solid Royal Blue Pill Button (💬 Chat >) */}
            <button
              type="button"
              onClick={() => setActiveChatRecipient(classTeacher)}
              className="px-3.5 py-1.5 bg-[#1d4ed8] hover:bg-blue-700 text-white rounded-full text-xs font-bold flex items-center space-x-1.5 shrink-0 shadow-sm active:scale-95 transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5 fill-white/20 text-white" />
              <span>Chat</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>
      )}

      {/* =======================================================================
          4. SECTION: SUBJECT TEACHING FACULTY
         ======================================================================= */}
      <section className="space-y-2 pt-1">
        {/* Section Header */}
        <div className="flex items-center space-x-2 px-0.5">
          <BookOpen className="w-5 h-5 text-[#1d4ed8]" />
          <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">
            Subject Teaching Faculty
          </h3>
        </div>

        {/* Faculty Cards */}
        <div className="space-y-2.5">
          {filteredSubjectTeachers.map((faculty) => (
            <div
              key={faculty.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-3.5 flex items-center justify-between hover:shadow-md transition-shadow"
            >
              {/* Left: Avatar + Details */}
              <div className="flex items-center space-x-3 min-w-0 flex-1 pr-2">
                {/* Circular Avatar with Active Green Dot */}
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 border border-slate-200/70">
                    <img
                      src={
                        faculty.avatar ||
                        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80'
                      }
                      alt={faculty.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-xs" />
                </div>

                {/* Info Lines */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <h4 className="font-extrabold text-sm text-slate-900 truncate">
                      {faculty.name}
                    </h4>
                    <span className="bg-[#dbeafe] text-[#1e40af] text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center shrink-0">
                      Subject Faculty
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 font-normal truncate mt-0.5">
                    {faculty.designation} • {faculty.department || 'Computer Science'}
                  </p>

                  <div className="flex items-center space-x-1 mt-0.5 text-[#2563eb]">
                    <BookOpen className="w-3.5 h-3.5 shrink-0 text-[#2563eb]" />
                    <span className="text-[11px] font-medium text-[#2563eb] truncate">
                      {faculty.subjectsAssigned && faculty.subjectsAssigned.length > 0
                        ? faculty.subjectsAssigned.join(', ')
                        : 'Data Structures, Web Tech'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Outlined Royal Blue Pill Button (💬 Chat) */}
              <button
                type="button"
                onClick={() => setActiveChatRecipient(faculty)}
                className="px-3.5 py-1.5 bg-white hover:bg-blue-50 text-[#1d4ed8] border border-[#1d4ed8] rounded-full text-xs font-bold flex items-center space-x-1.5 shrink-0 active:scale-95 transition-all"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#1d4ed8]" />
                <span>Chat</span>
              </button>
            </div>
          ))}

          {filteredSubjectTeachers.length === 0 && (
            <div className="p-6 text-center bg-white rounded-2xl border border-dashed border-slate-200">
              <p className="text-xs text-slate-500 font-medium">
                No faculty members match your search &ldquo;{searchQuery}&rdquo;.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* =======================================================================
          5. BOTTOM ILLUSTRATION: "Have a doubt? Our faculty is here to help you!"
         ======================================================================= */}
      <div className="pt-6 pb-4 flex flex-col items-center justify-center text-center">
        {/* Soft Illustration: Speech Bubbles with Centered Graduation Cap */}
        <div className="relative w-36 h-24 flex items-center justify-center">
          {/* Background Soft Speech Bubbles */}
          <div className="absolute top-1 left-2 w-14 h-10 bg-blue-100/70 rounded-2xl rounded-bl-sm flex items-center justify-center space-x-1">
            <span className="w-1 h-1 bg-blue-300 rounded-full" />
            <span className="w-1 h-1 bg-blue-300 rounded-full" />
            <span className="w-1 h-1 bg-blue-300 rounded-full" />
          </div>
          <div className="absolute bottom-2 right-4 w-12 h-9 bg-blue-100/50 rounded-2xl rounded-br-sm" />

          {/* Centered Graduation Cap Graphic */}
          <div className="relative z-10 flex flex-col items-center">
            <svg className="w-16 h-16 text-blue-300/80 drop-shadow-xs" viewBox="0 0 64 64" fill="none">
              {/* Cap rhombus */}
              <polygon points="32,16 56,26 32,36 8,26" fill="currentColor" opacity="0.9" />
              {/* Cap skull base */}
              <path d="M20,32 V40 C20,45 44,45 44,40 V32" fill="currentColor" opacity="0.7" />
              {/* Tassel */}
              <path d="M48,27 V41" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
              <circle cx="48" cy="43" r="2.2" fill="currentColor" opacity="0.9" />
            </svg>
          </div>
        </div>

        {/* Heading & Subtitle */}
        <h4 className="font-extrabold text-[15px] text-slate-800 tracking-tight mt-1">
          Have a doubt?
        </h4>
        <p className="text-xs text-slate-500 font-normal mt-0.5">
          Our faculty is here to help you!
        </p>
      </div>
    </div>
  );
};
