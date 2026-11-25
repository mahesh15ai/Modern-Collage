'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Send,
  User,
  GraduationCap,
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
  Users,
  Lock,
  Volume2,
} from 'lucide-react';
import { FacultyRecord, StudentRecord, ChatMessage, ClassGroupChannel } from '@/types';

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

  // Determine Class Teacher from registered facultyList (assigned to student's course or first faculty)
  const classTeacher: FacultyRecord | undefined =
    facultyList.find(
      (f) =>
        f.classTeacherOf &&
        currentUser.course &&
        (currentUser.course.toLowerCase().includes('computer science') ||
          f.classTeacherOf.toLowerCase().includes('computer science'))
    ) ||
    facultyList.find((f) => f.classTeacherOf) ||
    facultyList[0];

  // Subject Faculty list: ONLY real faculty registered in the system (excluding class teacher)
  const subjectTeachers: FacultyRecord[] = classTeacher
    ? facultyList.filter((f) => f.id !== classTeacher.id)
    : facultyList;

  // Class Group Channel definition (Managed by Class Teacher)
  const classGroupName = classTeacher?.classTeacherOf || currentUser.course || 'TY B.Sc Computer Science';
  const classGroupChannel: ClassGroupChannel | null = classTeacher
    ? {
        id: `GROUP-${classGroupName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`,
        name: `${classGroupName} (Official Class Group)`,
        type: 'group',
        className: classGroupName,
        classTeacherId: classTeacher.id,
        classTeacherName: classTeacher.name,
        avatar: classTeacher.avatar,
        academicYear: '2025-2026',
        description: `Official Broadcast Group for ${classGroupName}. Administered by Class Teacher ${classTeacher.name}.`,
        membersCount: 64,
      }
    : null;

  const isGroupActive = (activeChatRecipient as any)?.type === 'group';

  // Filter messages between current user and active recipient (or group messages)
  const currentUserId = currentUser.id || (isStudent ? 'STU-001' : 'FAC-2024-009');
  const activeRecipientId = activeChatRecipient?.id;

  const conversationMessages = chatMessages.filter((msg) => {
    if (!activeRecipientId) return false;
    if (isGroupActive) {
      return (
        msg.receiverId === activeRecipientId ||
        msg.groupId === activeRecipientId ||
        msg.receiverRole === 'group'
      );
    }
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

    // Strict Enforcement: In Class Group, ONLY Class Teacher can send messages! Students cannot!
    if (isGroupActive && isStudent) return;

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
  // VIEW A: Active Chat View (Group Broadcast or 1-on-1 Doubt Clearing)
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

            {isGroupActive ? (
              <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200/80 flex items-center justify-center text-[#1d4ed8] shrink-0">
                <Users className="w-5 h-5 text-[#1d4ed8]" />
              </div>
            ) : (
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
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-xs" />
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center space-x-1.5 flex-wrap gap-y-0.5">
                <h3 className="font-extrabold text-sm text-slate-900 truncate leading-tight">
                  {activeChatRecipient.name}
                </h3>
                {isGroupActive ? (
                  <span className="text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-md shrink-0">
                    Class Group
                  </span>
                ) : isClassTeacher && (
                  <span className="text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200/80 px-1.5 py-0.5 rounded-md shrink-0">
                    ★ Class Teacher
                  </span>
                )}
              </div>
              <p className="text-[10.5px] text-slate-500 truncate mt-0.5">
                {isGroupActive
                  ? `Class Teacher: ${classTeacher?.name || 'Class Teacher'} • Broadcast Channel`
                  : isRecipientFaculty
                  ? `${teacherData?.designation || 'Faculty'} • ${teacherData?.department || 'CS Dept'}`
                  : `${(activeChatRecipient as StudentRecord).course || 'Student'}`}
              </p>
            </div>
          </div>
        </header>

        {/* Message Thread Scroll Area */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-4 space-y-3.5">
          {/* Welcome Banner */}
          {isGroupActive ? (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 text-center space-y-1 shadow-xs">
              <div className="inline-flex items-center space-x-1 text-[10px] font-bold text-slate-700 uppercase tracking-wider bg-slate-100 px-2.5 py-0.5 rounded-full">
                <Users className="w-3 h-3 text-slate-600" />
                <span>Class Broadcast Group</span>
              </div>
              <h4 className="font-bold text-xs text-slate-900">
                {activeChatRecipient.name}
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed max-w-sm mx-auto">
                Official notices and announcements from Class Teacher <strong>{classTeacher?.name || 'Class Teacher'}</strong>. Only the Class Teacher can send messages in this group.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 text-center space-y-1 shadow-xs">
              <div className="inline-flex items-center space-x-1 text-[10px] font-bold text-slate-700 uppercase tracking-wider bg-slate-100 px-2.5 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3 text-slate-600" />
                <span>Academic Doubt Desk</span>
              </div>
              <h4 className="font-bold text-xs text-slate-900">
                {isRecipientFaculty
                  ? `Direct Q&A with ${activeChatRecipient.name}`
                  : `Student Query: ${activeChatRecipient.name}`}
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs mx-auto">
                Ask your syllabus doubts, assignment questions, or lab schedule queries directly. Messages are synced in real time.
              </p>
            </div>
          )}

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
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-xs transition-all ${
                      isMine
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
                      className={`flex items-center justify-end space-x-1 text-[9.5px] mt-1 ${
                        isMine ? 'text-blue-200' : 'text-slate-400'
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

        {/* Pinned Bottom Container: Group Broadcast Locked for Students, Enabled for Class Teacher */}
        {isGroupActive && isStudent ? (
          <div className="shrink-0 bg-white border-t border-slate-200/80 p-3 sm:p-3.5 text-center shadow-xs">
            <div className="flex items-center justify-center space-x-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3">
              <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="text-[11px] sm:text-xs font-semibold text-slate-700">
                Only Class Teacher ({classTeacher?.name || 'Class Teacher'}) can send messages in this group
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Students can view all official notices. For personal queries, use 1-on-1 Chat with your Class Teacher.
            </p>
          </div>
        ) : (
          <div className="shrink-0 bg-white border-t border-slate-200/90 shadow-[0_-4px_16px_rgba(0,0,0,0.03)] z-20">
            {/* Quick Chips */}
            <div className="px-3 py-1.5 bg-slate-50/90 border-b border-slate-100 flex items-center space-x-1.5 overflow-x-auto [scrollbar-width:none]">
              {(isGroupActive
                ? [
                    '📢 Attendance shortage review meeting today',
                    '📝 Practical journal submission deadline',
                    '⚠️ Timetable adjustment notice for tomorrow',
                    '✅ Internal examination schedule published',
                  ]
                : [
                    'Sir, I have a doubt in Unit 2',
                    'When is the assignment deadline?',
                    'Can you share the lecture slides?',
                    'Is the lab manual submission this week?',
                  ]
              ).map((chip) => (
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
                placeholder={
                  isGroupActive
                    ? `Broadcast announcement to ${classGroupName}...`
                    : `Ask ${activeChatRecipient.name} a doubt...`
                }
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all shadow-inner"
              />

              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="px-3.5 py-2 rounded-full bg-[#1d4ed8] hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-bold flex items-center justify-center space-x-1 shadow-md active:scale-95 transition-all shrink-0"
                title={isGroupActive ? 'Broadcast Announcement' : 'Send message'}
              >
                <Send className="w-3.5 h-3.5" />
                {isGroupActive && <span className="hidden sm:inline">Broadcast</span>}
              </button>
            </form>
          </div>
        )}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // VIEW B: Academic Doubt Desk Directory
  // ---------------------------------------------------------------------------

  // Search filtering logic
  const query = searchQuery.trim().toLowerCase();

  const isClassTeacherMatch =
    classTeacher &&
    (!query ||
      classTeacher.name.toLowerCase().includes(query) ||
      classTeacher.department?.toLowerCase().includes(query) ||
      classTeacher.subjectsAssigned?.some((s) => s.toLowerCase().includes(query)) ||
      classTeacher.classTeacherOf?.toLowerCase().includes(query));

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
          1. SEARCH INPUT
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
          2. SECTION: CLASS GROUP CHAT (BROADCAST ONLY)
         ======================================================================= */}
      {classGroupChannel &&
        classTeacher &&
        (!query ||
          classGroupChannel.name.toLowerCase().includes(query) ||
          classTeacher.name.toLowerCase().includes(query) ||
          'class group'.includes(query)) && (
          <section className="space-y-2">
            {/* Section Header */}
            <div className="flex items-center justify-between px-0.5">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-[#1d4ed8]" />
                <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">
                  Class Group Chat
                </h3>
              </div>
              <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 border border-slate-200/80 px-2.5 py-0.5 rounded-full inline-flex items-center space-x-1">
                <Lock className="w-2.5 h-2.5 text-slate-500 mr-0.5" />
                <span>Teacher Only</span>
              </span>
            </div>

            {/* Group Card - Clean White Card */}
            <div
              onClick={() => setActiveChatRecipient(classGroupChannel)}
              className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-3.5 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center space-x-3 min-w-0 flex-1 pr-2">
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-blue-50 border border-blue-200/70 flex items-center justify-center text-[#1d4ed8]">
                    <Users className="w-5 h-5 text-[#1d4ed8]" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-xs" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <h4 className="font-extrabold text-sm text-slate-900 truncate">
                      {classGroupChannel.name}
                    </h4>
                    <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center shrink-0 border border-blue-100">
                      Class Group
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 font-normal truncate mt-0.5">
                    Class Teacher: <strong>{classTeacher.name}</strong> • All Enrolled Students
                  </p>

                  <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5 flex items-center space-x-1">
                    <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>Only Class Teacher can send messages</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
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
          3. SECTION: ASSIGNED CLASS TEACHER
         ======================================================================= */}
      {classTeacher && isClassTeacherMatch && (
        <section className="space-y-2">
          {/* Section Header */}
          <div className="flex items-center justify-between px-0.5">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-5 h-5 text-[#1d4ed8]" />
              <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">
                Assigned Class Teacher
              </h3>
            </div>
            {subjectTeachers.length > 0 && (
              <button
                type="button"
                onClick={() => setShowAllFaculty((prev) => !prev)}
                className="text-[11px] font-semibold text-[#1d4ed8] bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-full flex items-center space-x-1 transition-colors"
              >
                <span>{showAllFaculty ? 'Show Less' : 'View All'}</span>
                <ChevronRight className="w-3 h-3 text-[#1d4ed8]" />
              </button>
            )}
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

                {classTeacher.subjectsAssigned && classTeacher.subjectsAssigned.length > 0 && (
                  <div className="flex items-center space-x-1 mt-0.5 text-[#2563eb]">
                    <BookOpen className="w-3.5 h-3.5 shrink-0 text-[#2563eb]" />
                    <span className="text-[11px] font-medium text-[#2563eb] truncate">
                      {classTeacher.subjectsAssigned.join(', ')}
                    </span>
                  </div>
                )}
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
          4. SECTION: SUBJECT TEACHING FACULTY (Only shown if subject faculty exist)
         ======================================================================= */}
      {subjectTeachers.length > 0 && (
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

                    {faculty.subjectsAssigned && faculty.subjectsAssigned.length > 0 && (
                      <div className="flex items-center space-x-1 mt-0.5 text-[#2563eb]">
                        <BookOpen className="w-3.5 h-3.5 shrink-0 text-[#2563eb]" />
                        <span className="text-[11px] font-medium text-[#2563eb] truncate">
                          {faculty.subjectsAssigned.join(', ')}
                        </span>
                      </div>
                    )}
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
      )}

      {/* If neither classTeacher nor subjectTeachers exist */}
      {!classTeacher && subjectTeachers.length === 0 && (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-2 my-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <h4 className="font-bold text-sm text-slate-800">No Faculty Assigned Yet</h4>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Faculty members and class teachers added in the Admin Portal will appear here.
          </p>
        </div>
      )}

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
