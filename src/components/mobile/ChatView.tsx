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
  Sparkles,
  MessageCircle,
} from 'lucide-react';
import { FacultyRecord, StudentRecord, ChatMessage, ClassGroupChannel, UserProfile } from '@/types';

interface StudentConversation {
  student: StudentRecord;
  lastMessage: ChatMessage;
  unreadCount: number;
}

// Helper to check if two names refer to the same person (handles full vs short names like "Mahesh Gomaskar" vs "Mahesh Kishan Gomaskar")
function namesMatch(name1?: string, name2?: string): boolean {
  if (!name1 || !name2) return false;
  const a = name1.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  const b = name2.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;
  const wordsA = a.split(/\s+/).filter((w) => w.length > 1);
  const wordsB = b.split(/\s+/).filter((w) => w.length > 1);
  if (wordsA.length >= 2 && wordsB.length >= 2) {
    if (wordsA[0] === wordsB[0] && wordsA[wordsA.length - 1] === wordsB[wordsB.length - 1]) {
      return true;
    }
  }
  const distinctMatch = wordsA.some((wa) => wa.length >= 4 && wordsB.includes(wa));
  if (distinctMatch) return true;
  return false;
}

// Helper to check if a message participant (sender or receiver) matches a faculty member
function matchesFaculty(
  id?: string,
  name?: string,
  faculty?: FacultyRecord | UserProfile | null,
  fallbackUser?: UserProfile | null
): boolean {
  if (!faculty && !fallbackUser) return false;
  const f = faculty || fallbackUser;
  if (!f) return false;
  if (id) {
    const idLower = id.toLowerCase();
    const idNorm = idLower.replace(/\.@/, '@');
    if (
      id === f.id ||
      (fallbackUser && id === fallbackUser.id) ||
      ((f as any).employeeId && (f as any).employeeId.toLowerCase() === idLower) ||
      (f.email && f.email.toLowerCase() === idLower) ||
      (f.email && f.email.toLowerCase().replace(/\.@/, '@') === idNorm) ||
      (fallbackUser?.email && fallbackUser.email.toLowerCase() === idLower) ||
      (fallbackUser?.email && fallbackUser.email.toLowerCase().replace(/\.@/, '@') === idNorm)
    ) {
      return true;
    }
  }
  if (name && (namesMatch(name, f.name) || (fallbackUser && namesMatch(name, fallbackUser.name)))) {
    return true;
  }
  return false;
}

// Helper to check if a message participant (sender or receiver) matches a student
function matchesStudent(
  id?: string,
  name?: string,
  student?: StudentRecord | UserProfile | null,
  fallbackUser?: UserProfile | null
): boolean {
  if (!student && !fallbackUser) return false;
  const s = student || fallbackUser;
  if (!s) return false;
  if (id) {
    const idLower = id.toLowerCase();
    if (
      id === s.id ||
      (fallbackUser && id === fallbackUser.id) ||
      ((s as any).rollNo && (s as any).rollNo.toLowerCase() === idLower) ||
      ((s as any).prn && (s as any).prn.toLowerCase() === idLower) ||
      (s.email && s.email.toLowerCase() === idLower) ||
      (fallbackUser?.email && fallbackUser.email.toLowerCase() === idLower)
    ) {
      return true;
    }
  }
  if (name && (namesMatch(name, s.name) || (fallbackUser && namesMatch(name, fallbackUser.name)))) {
    return true;
  }
  return false;
}

// Extract numeric millisecond timestamp for strict chronological ordering
function getMessageTimestamp(msg?: ChatMessage | null): number {
  if (!msg) return 0;
  if (typeof msg.createdAt === 'number' && msg.createdAt > 0) {
    return msg.createdAt;
  }
  const match = (msg.id || '').match(/\d{12,14}/);
  if (match) {
    const parsed = parseInt(match[0], 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  return 0;
}

// Format message bubble time cleanly in 12-hour AM/PM format (e.g. "4:25 PM")
function formatMessageTime(msg: ChatMessage): string {
  const ts = getMessageTimestamp(msg);
  if (ts > 0) {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }
  if (msg.timestamp) {
    const m = msg.timestamp.match(/^(\d{1,2}):(\d{2})(\s*(AM|PM))?$/i);
    if (m) {
      let h = parseInt(m[1], 10);
      const min = m[2];
      const ampm = m[4];
      if (!ampm) {
        const suffix = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        return `${h}:${min} ${suffix}`;
      }
      return `${h}:${min} ${ampm.toUpperCase()}`;
    }
    return msg.timestamp;
  }
  return '';
}

// Format calendar date label for WhatsApp-style date separators ("Today", "Yesterday", "26 Nov 2026")
function getMessageDateLabel(msg: ChatMessage): string {
  const ts = getMessageTimestamp(msg);
  if (ts <= 0) return '';
  const d = new Date(ts);
  const now = new Date();

  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  if (isToday) return 'Today';

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();

  if (isYesterday) return 'Yesterday';

  return d.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

// Format inbox last message timestamp (e.g. "4:26 PM", "Yesterday", "26 Nov")
function formatConversationTime(lastMsg?: ChatMessage): string {
  if (!lastMsg) return '';
  const ts = getMessageTimestamp(lastMsg);
  if (ts <= 0) return formatMessageTime(lastMsg);
  const d = new Date(ts);
  const now = new Date();

  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  if (isToday) {
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear()
  ) {
    return 'Yesterday';
  }

  return d.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
  });
}

export const ChatView: React.FC = () => {
  const {
    currentUser,
    facultyList,
    students,
    chatMessages,
    activeChatRecipient,
    setActiveChatRecipient,
    sendChatMessage,
    markMessagesAsRead,
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [showAllFaculty, setShowAllFaculty] = useState(false);
  const [showAllStudents, setShowAllStudents] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isStudent = currentUser.role === 'student';
  const isFaculty = currentUser.role === 'faculty';

  // Resolved student record if logged in as student
  const currentStudentRecord: StudentRecord | undefined = isStudent
    ? students.find(
      (s) =>
        matchesStudent(currentUser.id, currentUser.name, s) ||
        (currentUser.email && s.email?.toLowerCase() === currentUser.email.toLowerCase())
    )
    : undefined;

  // Resolved faculty record if logged in as teacher
  const teacherFaculty: FacultyRecord | undefined = isFaculty
    ? facultyList.find(
      (f) =>
        matchesFaculty(currentUser.id, currentUser.name, f) ||
        (currentUser.email &&
          f.email?.toLowerCase().replace(/\.@/, '@') === currentUser.email.toLowerCase().replace(/\.@/, '@'))
    )
    : undefined;

  // Teacher assigned class
  const teacherClassName =
    currentUser.classTeacherOf ||
    teacherFaculty?.classTeacherOf ||
    'FY B.Sc Computer Science';

  // Determine Class Teacher for Student view
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

  // Subject Faculty list for Student view (excluding class teacher and current user)
  const subjectTeachers: FacultyRecord[] = facultyList.filter(
    (f) =>
      (!classTeacher || f.id !== classTeacher.id) &&
      !matchesFaculty(f.id, f.name, currentUser)
  );

  // Class Group Channel definition
  const classGroupName = isStudent
    ? (classTeacher?.classTeacherOf || currentUser.course || 'FY B.Sc Computer Science')
    : (teacherClassName || 'FY B.Sc Computer Science');

  const classGroupChannel: ClassGroupChannel | null = {
    id: `GROUP-${classGroupName.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`,
    name: `${classGroupName} (Official Class Group)`,
    type: 'group',
    className: classGroupName,
    classTeacherId: isStudent ? (classTeacher?.id || '') : (currentUser.id || teacherFaculty?.id || ''),
    classTeacherName: isStudent ? (classTeacher?.name || '') : (currentUser.name || teacherFaculty?.name || 'Class Teacher'),
    avatar: isStudent ? classTeacher?.avatar : (currentUser.avatar || teacherFaculty?.avatar),
    academicYear: '2026-2027',
    description: `Official Broadcast Group for ${classGroupName}. Administered by Class Teacher ${isStudent ? classTeacher?.name : currentUser.name}.`,
    membersCount: 64,
  };

  const isGroupActive = (activeChatRecipient as any)?.type === 'group';
  const activeRecipientId = activeChatRecipient?.id;

  // Filter messages between current user and active recipient (or group messages)
  const conversationMessages = chatMessages.filter((msg) => {
    if (!activeRecipientId) return false;
    if (isGroupActive) {
      return (
        msg.receiverId === activeRecipientId ||
        msg.groupId === activeRecipientId ||
        msg.receiverRole === 'group'
      );
    }

    // 1-on-1 direct conversation
    if (isStudent) {
      // Current user is student, active recipient is faculty
      const activeFaculty = activeChatRecipient as FacultyRecord;
      const myStudentProfile = currentStudentRecord || currentUser;

      const isFromMeToTeacher =
        matchesStudent(msg.senderId, msg.senderName, myStudentProfile, currentUser) &&
        matchesFaculty(msg.receiverId, msg.receiverName, activeFaculty);

      const isFromTeacherToMe =
        matchesFaculty(msg.senderId, msg.senderName, activeFaculty) &&
        matchesStudent(msg.receiverId, msg.receiverName, myStudentProfile, currentUser);

      return isFromMeToTeacher || isFromTeacherToMe;
    } else {
      // Current user is faculty, active recipient is student
      const activeStudent = activeChatRecipient as StudentRecord;
      const myFacultyProfile = teacherFaculty || currentUser;

      const isFromMeToStudent =
        matchesFaculty(msg.senderId, msg.senderName, myFacultyProfile, currentUser) &&
        matchesStudent(msg.receiverId, msg.receiverName, activeStudent);

      const isFromStudentToMe =
        matchesStudent(msg.senderId, msg.senderName, activeStudent) &&
        matchesFaculty(msg.receiverId, msg.receiverName, myFacultyProfile, currentUser);

      return isFromMeToStudent || isFromStudentToMe;
    }
  }).sort((a, b) => getMessageTimestamp(a) - getMessageTimestamp(b));

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages]);

  // Automatically mark incoming 1-on-1 messages as read while viewing the conversation
  useEffect(() => {
    if (activeChatRecipient && (activeChatRecipient as any).type !== 'group') {
      markMessagesAsRead(activeChatRecipient);
    }
  }, [activeChatRecipient, conversationMessages.length, markMessagesAsRead]);

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

  // Back button handler to return to list
  const handleBackToList = () => {
    setActiveChatRecipient(null);
  };

  // ---------------------------------------------------------------------------
  // Build WhatsApp-style Student Conversations for Teacher View
  // ---------------------------------------------------------------------------
  const studentConversations: StudentConversation[] = React.useMemo(() => {
    if (!isFaculty) return [];

    const myFacultyProfile = teacherFaculty || currentUser;

    // All 1-on-1 messages involving the current faculty member
    const facultyDirectMessages = chatMessages.filter((msg) => {
      if (msg.isGroupMessage || msg.receiverRole === 'group') return false;
      const isTeacherSender = matchesFaculty(msg.senderId, msg.senderName, myFacultyProfile, currentUser);
      const isTeacherReceiver = matchesFaculty(msg.receiverId, msg.receiverName, myFacultyProfile, currentUser);
      return isTeacherSender || isTeacherReceiver;
    });

    const conversationMap = new Map<string, { student: StudentRecord; messages: ChatMessage[] }>();

    facultyDirectMessages.forEach((msg) => {
      const isTeacherSender = matchesFaculty(msg.senderId, msg.senderName, myFacultyProfile, currentUser);
      const otherId = isTeacherSender ? msg.receiverId : msg.senderId;
      const otherName = isTeacherSender ? msg.receiverName : msg.senderName;
      const otherRole = isTeacherSender ? msg.receiverRole : msg.senderRole;

      // Skip faculty-to-faculty messages
      if (otherRole === 'faculty') return;

      // Match with enrolled student in database
      const matchedStudent: StudentRecord =
        students.find((s) => matchesStudent(otherId, otherName, s)) || {
          id: otherId,
          name: otherName || 'Student',
          rollNo: 'CS-Student',
          prn: '',
          email: '',
          phone: '',
          department: 'Computer Science',
          course: teacherClassName,
          semester: 'Semester 1',
          admissionDate: '',
          status: 'Active',
          documents: [],
        };

      const key = matchedStudent.id || matchedStudent.name;
      if (!conversationMap.has(key)) {
        conversationMap.set(key, { student: matchedStudent, messages: [] });
      }
      conversationMap.get(key)!.messages.push(msg);
    });

    const result: StudentConversation[] = Array.from(conversationMap.values()).map(
      ({ student, messages }) => {
        // Sort chronologically by numeric timestamp to find last message
        const sorted = [...messages].sort((a, b) => getMessageTimestamp(a) - getMessageTimestamp(b));
        const lastMessage = sorted[sorted.length - 1];
        const unreadCount = sorted.filter(
          (m) =>
            !m.isRead &&
            m.senderRole === 'student' &&
            !matchesFaculty(m.senderId, m.senderName, myFacultyProfile, currentUser)
        ).length;
        return { student, lastMessage, unreadCount };
      }
    );

    // Sort conversations: newest conversation first
    return result.sort((a, b) => getMessageTimestamp(b.lastMessage) - getMessageTimestamp(a.lastMessage));
  }, [chatMessages, isFaculty, currentUser, teacherFaculty, students, teacherClassName]);

  // Enrolled students belonging to teacher's class
  const classStudents = React.useMemo(() => {
    if (!isFaculty) return [];
    return students.filter((s) => {
      if (!teacherClassName) return true;
      return (
        !s.course ||
        s.course.toLowerCase().includes(teacherClassName.toLowerCase()) ||
        teacherClassName.toLowerCase().includes(s.course.toLowerCase()) ||
        s.department?.toLowerCase().includes('computer')
      );
    });
  }, [students, isFaculty, teacherClassName]);

  // Search filtering logic
  const query = searchQuery.trim().toLowerCase();

  // Filtered active conversations for Teacher
  const filteredStudentConversations = studentConversations.filter(({ student, lastMessage }) => {
    if (!query) return true;
    return (
      student.name.toLowerCase().includes(query) ||
      student.rollNo?.toLowerCase().includes(query) ||
      lastMessage.text.toLowerCase().includes(query)
    );
  });

  // Filtered enrolled students for quick chat initiation
  const filteredClassStudents = classStudents.filter((student) => {
    if (!query) return true;
    return (
      student.name.toLowerCase().includes(query) ||
      student.rollNo?.toLowerCase().includes(query) ||
      student.prn?.toLowerCase().includes(query)
    );
  });

  // Student directory filters (when logged in as Student)
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

  // ---------------------------------------------------------------------------
  // VIEW A: Active Chat View (Group Broadcast or 1-on-1 Doubt Clearing)
  // ---------------------------------------------------------------------------
  if (activeChatRecipient) {
    const isRecipientFaculty = 'designation' in activeChatRecipient;
    const teacherData = isRecipientFaculty ? (activeChatRecipient as FacultyRecord) : null;
    const studentData = !isRecipientFaculty && !isGroupActive ? (activeChatRecipient as StudentRecord) : null;
    const isClassTeacher = teacherData?.classTeacherOf;

    const quickChips = isGroupActive
      ? [
        '📢 Attendance shortage review meeting today',
        '📝 Practical journal submission deadline',
        '⚠️ Timetable adjustment notice for tomorrow',
        '✅ Internal examination schedule published',
      ]
      : isStudent
        ? [
          'Sir, I have a doubt in Unit 2',
          'When is the assignment deadline?',
          'Can you share the lecture slides?',
          'Is the lab manual submission this week?',
        ]
        : [
          '✅ Noted, let us discuss during practical session',
          '📝 Please submit the assignment by tomorrow',
          '📚 Check the lecture slides in Study Materials',
          '📍 Please meet me in the staff room during break',
        ];

    return (
      <div className="fixed inset-0 z-40 max-w-lg mx-auto flex flex-col bg-slate-50 overflow-hidden font-sans h-full shadow-2xl">
        {/* Dedicated 1-on-1 Chat Header */}
        <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3 py-2.5 flex items-center justify-between z-30 shadow-xs shrink-0">
          <div className="flex items-center space-x-2.5 min-w-0">
            <button
              type="button"
              onClick={handleBackToList}
              className="p-1.5 -ml-1 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
              title="Back to conversations"
            >
              <ArrowLeft className="w-5 h-5 text-slate-800" />
            </button>

            {isGroupActive ? (
              <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200/80 flex items-center justify-center text-[#1d4ed8] shrink-0">
                <Users className="w-5 h-5 text-[#1d4ed8]" />
              </div>
            ) : (
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 bg-blue-50 flex items-center justify-center">
                  {(activeChatRecipient as any).avatar ? (
                    <img
                      src={(activeChatRecipient as any).avatar}
                      alt={activeChatRecipient.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-extrabold text-sm text-blue-700">
                      {activeChatRecipient.name.charAt(0)}
                    </span>
                  )}
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
                ) : isClassTeacher ? (
                  <span className="text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200/80 px-1.5 py-0.5 rounded-md shrink-0">
                    ★ Class Teacher
                  </span>
                ) : studentData ? (
                  <span className="text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-100 px-1.5 py-0.5 rounded-md shrink-0">
                    Roll: {studentData.rollNo || 'Enrolled'}
                  </span>
                ) : null}
              </div>
              <p className="text-[10.5px] text-slate-500 truncate mt-0.5">
                {isGroupActive
                  ? `Class Teacher: ${isStudent ? classTeacher?.name : currentUser.name} • Broadcast Channel`
                  : isRecipientFaculty
                    ? `${teacherData?.designation || 'Faculty'} • ${teacherData?.department || 'CS Dept'}`
                    : `Student • ${studentData?.course || teacherClassName}`}
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
                Official announcements and notices from Class Teacher <strong>{isStudent ? (classTeacher?.name || 'Class Teacher') : currentUser.name}</strong>.
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
                  : `Student Query Desk: ${activeChatRecipient.name}`}
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs mx-auto">
                {isRecipientFaculty
                  ? 'Ask syllabus doubts, assignment questions, or lab schedule queries directly.'
                  : `Realtime academic doubt clearing with ${activeChatRecipient.name}. Messages sync instantly.`}
              </p>
            </div>
          )}

          {/* Chat Messages */}
          {conversationMessages.length > 0 ? (
            conversationMessages.map((msg, index) => {
              const isMine = isStudent
                ? matchesStudent(msg.senderId, msg.senderName, currentStudentRecord, currentUser)
                : matchesFaculty(msg.senderId, msg.senderName, teacherFaculty, currentUser);

              const dateLabel = getMessageDateLabel(msg);
              const prevMsg = index > 0 ? conversationMessages[index - 1] : null;
              const prevDateLabel = prevMsg ? getMessageDateLabel(prevMsg) : null;
              const isNewDay = Boolean(dateLabel && dateLabel !== prevDateLabel);

              return (
                <React.Fragment key={msg.id}>
                  {isNewDay && (
                    <div className="flex items-center justify-center my-2.5">
                      <span className="bg-slate-200/90 text-slate-700 font-semibold text-[10.5px] px-3 py-0.5 rounded-full shadow-2xs">
                        {dateLabel}
                      </span>
                    </div>
                  )}

                  <div
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
                        <span>{formatMessageTime(msg)}</span>
                        {isMine && <CheckCheck className="w-3 h-3 text-blue-300" />}
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })
          ) : (
            <div className="py-8 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <h5 className="font-bold text-xs text-slate-800">No Messages Yet</h5>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                {isStudent
                  ? `Send your first question or academic doubt to start the conversation with ${activeChatRecipient.name}.`
                  : `Start the conversation or answer questions for ${activeChatRecipient.name}.`}
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
                Only Class Teacher ({classTeacher?.name || 'Class Teacher'}) can broadcast messages
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Students can view official notices. For personal queries, use 1-on-1 Chat with your Class Teacher.
            </p>
          </div>
        ) : (
          <div className="shrink-0 bg-white border-t border-slate-200/90 shadow-[0_-4px_16px_rgba(0,0,0,0.03)] z-20">
            {/* Quick Chips */}
            <div className="px-3 py-1.5 bg-slate-50/90 border-b border-slate-100 flex items-center space-x-1.5 overflow-x-auto [scrollbar-width:none]">
              {quickChips.map((chip) => (
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
                    : isStudent
                      ? `Ask ${activeChatRecipient.name} a doubt...`
                      : `Reply to ${activeChatRecipient.name}...`
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
  // VIEW B: Directory View
  // - For Faculty: Class Group Broadcast + WhatsApp-style Student Messages Inbox
  // - For Student: Class Group Broadcast + Assigned Class Teacher + Subject Faculty
  // ---------------------------------------------------------------------------
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
          placeholder={
            isFaculty
              ? 'Search student name or roll number...'
              : 'Search teacher or subject name...'
          }
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/90 rounded-full text-xs font-normal text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all"
        />
      </div>

      {/* =======================================================================
          2. CLASS GROUP CHAT (Broadcast Channel)
         ======================================================================= */}
      {classGroupChannel && (
        <section className="space-y-2">
          <div className="flex items-center justify-between px-0.5">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-[#1d4ed8]" />
              <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">
                Class Group Chat
              </h3>
            </div>
            <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 rounded-full inline-flex items-center space-x-1">
              <Lock className="w-2.5 h-2.5 text-blue-600 mr-0.5" />
              <span>{isFaculty ? 'You Are Class Teacher' : 'Teacher Only'}</span>
            </span>
          </div>

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
                    Official Broadcast
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 font-normal truncate mt-0.5">
                  Class Teacher: <strong>{isStudent ? (classTeacher?.name || 'Class Teacher') : currentUser.name}</strong> • All Enrolled Students
                </p>

                <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5 flex items-center space-x-1">
                  {isFaculty ? (
                    <span className="text-blue-600 font-semibold">Tap to broadcast notices to your class</span>
                  ) : (
                    <>
                      <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>Only Class Teacher can send messages</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            <button
              type="button"
              className="px-3.5 py-1.5 bg-[#1d4ed8] hover:bg-blue-700 text-white rounded-full text-xs font-bold flex items-center space-x-1.5 shrink-0 shadow-sm active:scale-95 transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5 fill-white/20 text-white" />
              <span>{isFaculty ? 'Broadcast' : 'Chat'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>
      )}

      {/* =======================================================================
          3. TEACHER-SPECIFIC VIEW: WhatsApp-Style Student Inquiries Inbox
         ======================================================================= */}
      {isFaculty && (
        <section className="space-y-3 pt-1">
          {/* Section Header */}
          <div className="flex items-center justify-between px-0.5">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5 text-[#1d4ed8]" />
              <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">
                Student Doubts & Direct Messages
              </h3>
            </div>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 rounded-full">
              {filteredStudentConversations.length} Active {filteredStudentConversations.length === 1 ? 'Chat' : 'Chats'}
            </span>
          </div>

          {/* Active WhatsApp-Style Student Conversation List */}
          {filteredStudentConversations.length > 0 ? (
            <div className="space-y-2.5">
              {filteredStudentConversations.map(({ student, lastMessage, unreadCount }) => {
                const isSentByTeacher = matchesFaculty(
                  lastMessage.senderId,
                  lastMessage.senderName,
                  teacherFaculty,
                  currentUser
                );

                return (
                  <div
                    key={student.id || student.name}
                    onClick={() => {
                      setActiveChatRecipient(student);
                      markMessagesAsRead(student);
                    }}
                    className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-3.5 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer active:scale-[0.99]"
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1 pr-2">
                      {/* Avatar with Online Dot */}
                      <div className="relative shrink-0">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-blue-50 border border-slate-200/80 flex items-center justify-center">
                          {student.avatar ? (
                            <img
                              src={student.avatar}
                              alt={student.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="font-extrabold text-sm text-[#1d4ed8]">
                              {student.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-xs" />
                      </div>

                      {/* Info & Message Snippet */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between space-x-1">
                          <h4 className="font-extrabold text-sm text-slate-900 truncate">
                            {student.name}
                          </h4>
                          <span className="text-[10px] font-medium text-slate-400 shrink-0">
                            {formatConversationTime(lastMessage)}
                          </span>
                        </div>

                        <div className="flex items-center space-x-1.5 mt-0.5">
                          <span className="bg-slate-100 text-slate-700 text-[9.5px] font-bold px-1.5 py-0.5 rounded-md shrink-0 border border-slate-200/60">
                            Roll: {student.rollNo || 'CS'}
                          </span>
                          <span className="text-[10px] text-slate-400 truncate">
                            {student.course || teacherClassName}
                          </span>
                        </div>

                        {/* WhatsApp-Style Last Message Snippet */}
                        <div className="flex items-center space-x-1 mt-1 text-xs">
                          {isSentByTeacher && (
                            <CheckCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          )}
                          <p
                            className={`truncate text-[11px] ${unreadCount > 0 && !isSentByTeacher
                              ? 'font-bold text-slate-900'
                              : 'font-normal text-slate-500'
                              }`}
                          >
                            {isSentByTeacher ? `You: ${lastMessage.text}` : lastMessage.text}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right: Unread Badge or Chat Button */}
                    <div className="flex items-center space-x-2 shrink-0">
                      {unreadCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-white font-extrabold text-[10px] flex items-center justify-center shadow-xs">
                          {unreadCount}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveChatRecipient(student);
                          markMessagesAsRead(student);
                        }}
                        className="px-3.5 py-1.5 bg-[#1d4ed8] hover:bg-blue-700 text-white rounded-full text-xs font-bold flex items-center space-x-1 shadow-sm active:scale-95 transition-all"
                      >
                        <MessageSquare className="w-3.5 h-3.5 fill-white/20 text-white" />
                        <span>Chat</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty State for Inquiries */
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 text-center space-y-2 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-[#1d4ed8] flex items-center justify-center mx-auto">
                <MessageSquare className="w-6 h-6 text-[#1d4ed8]" />
              </div>
              <h4 className="font-bold text-sm text-slate-800">No Student Inquiries Yet</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                When students from your class send questions or academic doubts, their conversations will appear here automatically just like WhatsApp.
              </p>
            </div>
          )}

          {/* Enrolled Students Quick-Start Directory */}
          {classStudents.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between px-0.5">
                <div className="flex items-center space-x-1.5">
                  <Users className="w-4 h-4 text-slate-600" />
                  <h4 className="font-bold text-xs text-slate-700">
                    Enrolled Class Students ({classStudents.length})
                  </h4>
                </div>
                {classStudents.length > 3 && (
                  <button
                    type="button"
                    onClick={() => setShowAllStudents((prev) => !prev)}
                    className="text-[11px] font-semibold text-[#1d4ed8] hover:underline"
                  >
                    {showAllStudents ? 'Show Less' : 'View All'}
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {(showAllStudents ? filteredClassStudents : filteredClassStudents.slice(0, 3)).map(
                  (student) => (
                    <div
                      key={student.id || student.name}
                      onClick={() => {
                        setActiveChatRecipient(student);
                        markMessagesAsRead(student);
                      }}
                      className="bg-white rounded-xl border border-slate-100 shadow-2xs p-3 flex items-center justify-between hover:border-blue-200 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0 flex-1 pr-2">
                        <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700 shrink-0">
                          {student.avatar ? (
                            <img
                              src={student.avatar}
                              alt={student.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            student.name.charAt(0)
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h5 className="font-bold text-xs text-slate-900 truncate">
                            {student.name}
                          </h5>
                          <p className="text-[10px] text-slate-500 truncate">
                            Roll No: {student.rollNo || 'N/A'} • {student.course || teacherClassName}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveChatRecipient(student);
                          markMessagesAsRead(student);
                        }}
                        className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-[#1d4ed8] border border-blue-200/80 rounded-full text-[11px] font-bold flex items-center space-x-1 shrink-0 transition-colors"
                      >
                        <MessageSquare className="w-3 h-3 text-[#1d4ed8]" />
                        <span>Message</span>
                      </button>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {/* =======================================================================
          4. STUDENT-SPECIFIC VIEW: ASSIGNED CLASS TEACHER + SUBJECT FACULTY
         ======================================================================= */}
      {isStudent && (
        <>
          {/* Section: Assigned Class Teacher */}
          {classTeacher && isClassTeacherMatch && (
            <section className="space-y-2">
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
                <div className="flex items-center space-x-3 min-w-0 flex-1 pr-2">
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

                <button
                  type="button"
                  onClick={() => {
                    setActiveChatRecipient(classTeacher);
                    markMessagesAsRead(classTeacher);
                  }}
                  className="px-3.5 py-1.5 bg-[#1d4ed8] hover:bg-blue-700 text-white rounded-full text-xs font-bold flex items-center space-x-1.5 shrink-0 shadow-sm active:scale-95 transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5 fill-white/20 text-white" />
                  <span>Chat</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </section>
          )}

          {/* Section: Subject Teaching Faculty */}
          {subjectTeachers.length > 0 && (
            <section className="space-y-2 pt-1">
              <div className="flex items-center space-x-2 px-0.5">
                <BookOpen className="w-5 h-5 text-[#1d4ed8]" />
                <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">
                  Subject Teaching Faculty
                </h3>
              </div>

              <div className="space-y-2.5">
                {filteredSubjectTeachers.map((faculty) => (
                  <div
                    key={faculty.id}
                    className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-3.5 flex items-center justify-between hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1 pr-2">
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

                    <button
                      type="button"
                      onClick={() => {
                        setActiveChatRecipient(faculty);
                        markMessagesAsRead(faculty);
                      }}
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

          {/* Section: Bottom Illustration */}
          <div className="pt-6 pb-4 flex flex-col items-center justify-center text-center">
            <div className="relative w-36 h-24 flex items-center justify-center">
              <div className="absolute top-1 left-2 w-14 h-10 bg-blue-100/70 rounded-2xl rounded-bl-sm flex items-center justify-center space-x-1">
                <span className="w-1 h-1 bg-blue-300 rounded-full" />
                <span className="w-1 h-1 bg-blue-300 rounded-full" />
                <span className="w-1 h-1 bg-blue-300 rounded-full" />
              </div>
              <div className="absolute bottom-2 right-4 w-12 h-9 bg-blue-100/50 rounded-2xl rounded-br-sm" />

              <div className="relative z-10 flex flex-col items-center">
                <svg className="w-16 h-16 text-blue-300/80 drop-shadow-xs" viewBox="0 0 64 64" fill="none">
                  <polygon points="32,16 56,26 32,36 8,26" fill="currentColor" opacity="0.9" />
                  <path d="M20,32 V40 C20,45 44,45 44,40 V32" fill="currentColor" opacity="0.7" />
                  <path d="M48,27 V41" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
                  <circle cx="48" cy="43" r="2.2" fill="currentColor" opacity="0.9" />
                </svg>
              </div>
            </div>

            <h4 className="font-extrabold text-[15px] text-slate-800 tracking-tight mt-1">
              Have a doubt?
            </h4>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              Our faculty is here to help you!
            </p>
          </div>
        </>
      )}
    </div>
  );
};
