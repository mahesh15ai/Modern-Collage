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
} from 'lucide-react';
import { FacultyRecord, StudentRecord, ChatMessage } from '@/types';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isStudent = currentUser.role === 'student';

  // Find class teacher and subject teachers for student
  const classTeacher = facultyList.find(
    (f) =>
      f.classTeacherOf &&
      currentUser.course &&
      (currentUser.course.toLowerCase().includes('computer science') ||
        f.classTeacherOf.toLowerCase().includes('computer science'))
  ) || facultyList[0];

  const subjectTeachers = facultyList.filter(
    (f) => f.id !== classTeacher?.id
  );

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

  // Back button handler to return to teacher list
  const handleBackToList = () => {
    setActiveChatRecipient(null);
  };

  // ---------------------------------------------------------------------------
  // VIEW A: Active 1-on-1 Conversation View
  // ---------------------------------------------------------------------------
  if (activeChatRecipient) {
    const isRecipientFaculty = 'designation' in activeChatRecipient;
    const teacherData = isRecipientFaculty ? (activeChatRecipient as FacultyRecord) : null;
    const isClassTeacher = teacherData?.classTeacherOf;

    return (
      <div className="flex flex-col h-[calc(100vh-65px)] max-w-lg mx-auto bg-slate-50 relative font-sans">
        {/* Chat Top Header */}
        <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3.5 py-2.5 flex items-center justify-between z-30 shadow-xs">
          <div className="flex items-center space-x-2.5 min-w-0">
            <button
              type="button"
              onClick={handleBackToList}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
              title="Back to teachers list"
            >
              <ArrowLeft className="w-5 h-5 text-slate-800" />
            </button>

            <div className="relative">
              <div className="w-10 h-10 rounded-2xl overflow-hidden border border-slate-200 bg-blue-50 shrink-0">
                <img
                  src={
                    (activeChatRecipient as any).avatar ||
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80'
                  }
                  alt={activeChatRecipient.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <h3 className="font-extrabold text-sm text-slate-900 truncate leading-tight">
                  {activeChatRecipient.name}
                </h3>
                {isClassTeacher && (
                  <span className="text-[9px] font-black bg-amber-100 text-amber-900 border border-amber-200/80 px-1.5 py-0.2 rounded-md shrink-0">
                    Class Teacher
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 truncate mt-0.5">
                {isRecipientFaculty
                  ? `${teacherData?.designation || 'Faculty'} • ${teacherData?.department || 'CS'} Dept`
                  : `${(activeChatRecipient as StudentRecord).course || 'Student'}`}
              </p>
            </div>
          </div>
        </header>

        {/* Message Thread Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/70 rounded-2xl p-3.5 text-center space-y-1">
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
                    className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs shadow-xs transition-all ${
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

        {/* Quick Academic Doubt Chips */}
        <div className="px-3 py-1.5 bg-white border-t border-slate-100 flex items-center space-x-1.5 overflow-x-auto [scrollbar-width:none]">
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
              className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-800 rounded-full text-[10.5px] font-semibold whitespace-nowrap border border-slate-200/80 transition-colors shrink-0"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Message Input Bar */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2"
        >
          <input
            type="text"
            required
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={`Ask ${activeChatRecipient.name} a doubt...`}
            className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
          />

          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className="w-10 h-10 rounded-2xl bg-[#1d4ed8] hover:bg-blue-700 disabled:opacity-40 text-white flex items-center justify-center shadow-md active:scale-95 transition-all shrink-0"
            title="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // VIEW B: Teacher Directory / Recipient Selector
  // ---------------------------------------------------------------------------
  const filteredFaculty = facultyList.filter((f) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      f.name.toLowerCase().includes(query) ||
      f.department?.toLowerCase().includes(query) ||
      f.subjectsAssigned?.some((s) => s.toLowerCase().includes(query)) ||
      f.classTeacherOf?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="w-full min-h-full p-4 space-y-4 font-sans pb-20">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-4.5 shadow-md space-y-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-bold">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-white">Academic Doubt Desk</h3>
            <p className="text-[10px] text-blue-200">
              {isStudent
                ? 'Chat directly with your Class Teacher & Subject Faculty'
                : 'Student Doubt Queries & Mentorship Desk'}
            </p>
          </div>
        </div>

        <p className="text-xs text-blue-100 leading-relaxed pt-1">
          {isStudent
            ? 'Have questions about syllabus, assignments, or lectures? Select your class teacher or subject faculty below to message them.'
            : 'Select a student below to review their academic questions and provide guidance.'}
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={isStudent ? 'Search teacher or subject name...' : 'Search student...'}
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200/90 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-xs"
        />
      </div>

      {/* 1. Class Teacher Featured Card (High Priority) */}
      {isStudent && classTeacher && (
        <div className="space-y-1.5">
          <h4 className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider flex items-center space-x-1.5 px-1">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>Assigned Class Teacher</span>
          </h4>

          <div
            onClick={() => setActiveChatRecipient(classTeacher)}
            className="bg-gradient-to-br from-amber-50/80 via-white to-amber-50/30 rounded-2xl p-4 border border-amber-200/90 shadow-sm hover:shadow-md cursor-pointer transition-all active:scale-[0.99] flex items-center justify-between"
          >
            <div className="flex items-center space-x-3 min-w-0 pr-2">
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-amber-400/80 bg-blue-50 shadow-xs">
                  <img
                    src={classTeacher.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80'}
                    alt={classTeacher.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center space-x-1.5 flex-wrap gap-y-0.5">
                  <h4 className="font-extrabold text-sm text-slate-900 truncate">
                    {classTeacher.name}
                  </h4>
                  <span className="text-[9.5px] font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    ★ Class Teacher
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 font-medium truncate mt-0.5">
                  {classTeacher.designation} • {classTeacher.department} Dept
                </p>

                {classTeacher.classTeacherOf && (
                  <p className="text-[10px] text-amber-900 font-bold truncate mt-0.5">
                    Class Mentor: {classTeacher.classTeacherOf}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              className="px-3 py-1.5 bg-[#1d4ed8] text-white rounded-xl text-xs font-bold shrink-0 flex items-center space-x-1 shadow-xs"
            >
              <span>Chat</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Subject Faculty List */}
      <div className="space-y-2">
        <h4 className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider flex items-center space-x-1.5 px-1">
          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
          <span>{isStudent ? 'Subject Teaching Faculty' : 'Faculty Roster'}</span>
        </h4>

        <div className="space-y-2">
          {filteredFaculty.map((faculty) => {
            const isCT = faculty.id === classTeacher?.id;
            return (
              <div
                key={faculty.id}
                onClick={() => setActiveChatRecipient(faculty)}
                className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs hover:shadow-md cursor-pointer transition-all active:scale-[0.99] flex items-center justify-between"
              >
                <div className="flex items-center space-x-3 min-w-0 pr-2">
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-2xl overflow-hidden border border-slate-200 bg-blue-50">
                      <img
                        src={faculty.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80'}
                        alt={faculty.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <h4 className="font-extrabold text-xs text-slate-900 truncate">
                        {faculty.name}
                      </h4>
                      {isCT && (
                        <span className="text-[9px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded-md">
                          Class Teacher
                        </span>
                      )}
                    </div>

                    <p className="text-[10.5px] text-slate-500 font-medium truncate mt-0.5">
                      {faculty.designation} • {faculty.department}
                    </p>

                    {faculty.subjectsAssigned && faculty.subjectsAssigned.length > 0 && (
                      <div className="flex items-center space-x-1 mt-1 overflow-hidden">
                        <span className="text-[9.5px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-md truncate max-w-[200px]">
                          📖 {faculty.subjectsAssigned.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-blue-600 p-2 rounded-xl bg-blue-50 hover:bg-blue-100 inline-flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
