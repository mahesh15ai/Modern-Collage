'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  UserProfile,
  UserRole,
  StudentRecord,
  FacultyRecord,
  Department,
  Course,
  AttendanceSummary,
  StudentResult,
  TimetableSlot,
  Assignment,
  StudyMaterial,
  FeeSummary,
  NoticeItem,
  EventItem,
  ComplaintItem,
  CollegeStats,
} from '@/types';
import {
  MOCK_STUDENT_USER,
  MOCK_FACULTY_USER,
  MOCK_ADMIN_USER,
  MOCK_COLLEGE_STATS,
  MOCK_STUDENTS,
  MOCK_FACULTY,
  MOCK_DEPARTMENTS,
  MOCK_COURSES,
  MOCK_ATTENDANCE,
  MOCK_RESULT,
  MOCK_TIMETABLE,
  MOCK_ASSIGNMENTS,
  MOCK_STUDY_MATERIALS,
  MOCK_FEES,
  MOCK_NOTICES,
  MOCK_EVENTS,
  MOCK_COMPLAINTS,
} from '@/lib/mockData';
import {
  loginWithEmail,
  loginWithGoogle,
  logoutUser,
  subscribeToAuthState,
  registerNewUserAccount,
  createAdminAccount,
} from '@/services/authService';
import {
  saveStudentToFirestore,
  updateStudentInFirestore,
  deleteStudentFromFirestore,
  saveFacultyToFirestore,
  seedCampusDataToFirestore,
  fetchStudentsFromFirestore,
  fetchFacultyFromFirestore,
  subscribeToStudents,
  subscribeToFaculty,
  subscribeToNotices,
  subscribeToEvents,
  subscribeToComplaints,
  subscribeToResults,
  subscribeToStudyMaterials,
  saveNoticeToFirestore,
  deleteNoticeFromFirestore,
  saveEventToFirestore,
  registerForEventInFirestore,
  saveComplaintToFirestore,
  updateComplaintStatusInFirestore,
  saveStudentResultToFirestore,
  saveStudyMaterialToFirestore,
  saveAttendanceToFirestore,
  updateFacultyInFirestore,
  subscribeToTimetable,
  saveTimetableSlotToFirestore,
  deleteTimetableSlotFromFirestore,
} from '@/services/firestoreService';

export type MobileScreen =
  | 'splash'
  | 'login'
  | 'dashboard'
  | 'attendance'
  | 'results'
  | 'timetable'
  | 'materials'
  | 'fees'
  | 'complaints'
  | 'events'
  | 'notices'
  | 'profile';

export type AdminSection =
  | 'overview'
  | 'students'
  | 'faculty'
  | 'departments'
  | 'attendance'
  | 'exams'
  | 'results'
  | 'timetable'
  | 'assignments'
  | 'materials'
  | 'fees'
  | 'notices'
  | 'events'
  | 'complaints'
  | 'ml-research';

export interface DispatchedEmail {
  id: string;
  recipientName: string;
  to: string;
  role: 'student' | 'faculty';
  tempPassword: string;
  sentAt: string;
  identifier: string; // PRN or Employee ID
  department: string;
  courseOrDesignation: string;
  emailSent?: boolean;
  statusMessage?: string;
  qrDataUrl?: string;
  loginUrl?: string;
}

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  isAuthenticated: boolean;
  authLoading: boolean;
  authError: string | null;
  activeScreen: MobileScreen;
  setActiveScreen: (screen: MobileScreen) => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  backExitToast: boolean;
  adminSection: AdminSection;
  setAdminSection: (section: AdminSection) => void;
  viewMode: 'mobile' | 'desktop';
  setViewMode: (mode: 'mobile' | 'desktop') => void;
  // Auth actions
  login: (email: string, password: string, role?: UserRole) => Promise<void>;
  loginWithGoogleAuth: (role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  registerAdmin: (
    name: string,
    email: string,
    password: string,
    designation?: string
  ) => Promise<UserProfile>;
  // Onboarding actions by Admin
  registerStudent: (
    studentData: Omit<StudentRecord, 'id'>,
    password?: string
  ) => Promise<DispatchedEmail>;
  registerFaculty: (
    facultyData: Omit<FacultyRecord, 'id'>,
    password?: string
  ) => Promise<DispatchedEmail>;
  dispatchedEmails: DispatchedEmail[];
  syncToFirebase: () => Promise<number>;
  isSyncing: boolean;
  // Data state
  stats: CollegeStats;
  students: StudentRecord[];
  facultyList: FacultyRecord[];
  departments: Department[];
  courses: Course[];
  attendance: AttendanceSummary;
  result: StudentResult;
  resultsList: StudentResult[];
  timetable: TimetableSlot[];
  assignments: Assignment[];
  materials: StudyMaterial[];
  fees: FeeSummary;
  notices: NoticeItem[];
  readNoticeIds: string[];
  unreadNoticesCount: number;
  markNoticeAsRead: (noticeId: string) => void;
  markAllNoticesAsRead: () => void;
  toggleNoticeRead: (noticeId: string) => void;
  events: EventItem[];
  complaints: ComplaintItem[];
  // Realtime Actions
  updateStudent: (student: StudentRecord) => Promise<void>;
  deleteStudent: (studentId: string) => Promise<void>;
  updateFaculty: (faculty: FacultyRecord) => Promise<void>;
  addTimetableSlot: (slot: Omit<TimetableSlot, 'id'>) => Promise<void>;
  updateTimetableSlot: (slot: TimetableSlot) => Promise<void>;
  deleteTimetableSlot: (slotId: string) => Promise<void>;
  publishNotice: (
    title: string,
    category: NoticeItem['category'],
    content: string,
    targetRole?: NoticeItem['targetRole']
  ) => Promise<void>;
  deleteNotice: (noticeId: string) => Promise<void>;
  createEvent: (
    eventData: Omit<EventItem, 'id' | 'registeredCount'>
  ) => Promise<void>;
  registerForEvent: (eventId: string) => Promise<void>;
  addComplaint: (
    title: string,
    category: ComplaintItem['category'],
    description: string
  ) => Promise<void>;
  updateComplaintStatus: (
    complaintId: string,
    status: 'In Progress' | 'Resolved'
  ) => Promise<void>;
  publishResult: (resultData: StudentResult) => Promise<void>;
  recordAttendance: (
    studentId: string,
    attendanceData: AttendanceSummary
  ) => Promise<void>;
  uploadMaterial: (
    materialData: Omit<StudyMaterial, 'id' | 'downloads' | 'uploadedDate'>
  ) => Promise<void>;
  payFees: (feeId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>('student');
  const [currentUser, setCurrentUser] = useState<UserProfile>(MOCK_STUDENT_USER);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [activeScreen, setActiveScreenState] = useState<MobileScreen>('dashboard');
  const [isDrawerOpen, setIsDrawerOpenState] = useState<boolean>(false);
  const [backExitToast, setBackExitToast] = useState<boolean>(false);

  const activeScreenRef = useRef<MobileScreen>('dashboard');
  activeScreenRef.current = activeScreen;

  const isDrawerOpenRef = useRef<boolean>(false);
  isDrawerOpenRef.current = isDrawerOpen;

  const lastBackPressRef = useRef<number>(0);

  // Helper to open / close drawer with history awareness
  const setIsDrawerOpen = useCallback((open: boolean) => {
    if (open && !isDrawerOpenRef.current) {
      if (typeof window !== 'undefined') {
        window.history.pushState(
          { screen: activeScreenRef.current, drawer: true },
          '',
          window.location.href
        );
      }
    } else if (!open && isDrawerOpenRef.current) {
      if (typeof window !== 'undefined' && window.history.state?.drawer) {
        window.history.back();
        return;
      }
    }
    setIsDrawerOpenState(open);
  }, []);

  // Helper to change screen with history push
  const setActiveScreen = useCallback((screen: MobileScreen, replace: boolean = false) => {
    setIsDrawerOpenState(false);
    if (screen === activeScreenRef.current) return;

    if (typeof window !== 'undefined') {
      const hash = screen === 'dashboard' ? '' : `#${screen}`;
      const url = window.location.pathname + hash;
      const historyPayload = { screen, root: screen === 'dashboard' };

      if (replace) {
        window.history.replaceState(historyPayload, '', url);
      } else {
        window.history.pushState(historyPayload, '', url);
      }
    }

    setActiveScreenState(screen);
  }, []);

  // Browser History & Mobile Hardware Back Button Navigation Handler
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const validScreens: MobileScreen[] = [
      'splash',
      'login',
      'dashboard',
      'attendance',
      'results',
      'timetable',
      'materials',
      'fees',
      'complaints',
      'events',
      'notices',
      'profile',
    ];

    const hash = window.location.hash.replace('#', '') as MobileScreen;
    const initialScreen = validScreens.includes(hash) ? hash : 'dashboard';

    // Seed history stack so that dashboard has a guard state
    if (initialScreen === 'dashboard') {
      window.history.replaceState({ screen: 'dashboard', root: true, guard: true }, '', window.location.pathname);
      window.history.pushState({ screen: 'dashboard', root: true }, '', window.location.pathname);
    } else {
      window.history.replaceState({ screen: 'dashboard', root: true, guard: true }, '', window.location.pathname);
      window.history.pushState({ screen: initialScreen }, '', window.location.pathname + `#${initialScreen}`);
      setActiveScreenState(initialScreen);
    }

    const handlePopState = (event: PopStateEvent) => {
      // 1. If drawer is currently open, close the drawer and stay on the current screen
      if (isDrawerOpenRef.current) {
        setIsDrawerOpenState(false);
        return;
      }

      const state = event.state;
      const current = activeScreenRef.current;

      // 2. If user is currently on a sub-screen (notices, attendance, profile, results, etc.)
      if (current !== 'dashboard' && current !== 'splash' && current !== 'login') {
        const targetScreen =
          state?.screen && validScreens.includes(state.screen)
            ? (state.screen as MobileScreen)
            : 'dashboard';

        setActiveScreenState(targetScreen);
        return;
      }

      // 3. User is on Root Dashboard screen: Handle double-tap back to exit
      if (current === 'dashboard') {
        const now = Date.now();
        const timeDiff = now - lastBackPressRef.current;

        if (timeDiff < 2000) {
          // Double tapped back within 2 seconds: allow exit/navigate back!
          return;
        } else {
          // First tap: intercept exit, restore dashboard state, show toast
          lastBackPressRef.current = now;
          window.history.pushState(
            { screen: 'dashboard', root: true },
            '',
            window.location.pathname
          );
          setBackExitToast(true);
          setTimeout(() => {
            setBackExitToast(false);
          }, 2000);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
  const [adminSection, setAdminSection] = useState<AdminSection>('overview');
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');

  // App data state
  const [stats, setStats] = useState<CollegeStats>(MOCK_COLLEGE_STATS);
  const [students, setStudents] = useState<StudentRecord[]>(MOCK_STUDENTS);
  const [facultyList, setFacultyList] = useState<FacultyRecord[]>(MOCK_FACULTY);
  const [departments] = useState<Department[]>(MOCK_DEPARTMENTS);
  const [courses] = useState<Course[]>(MOCK_COURSES);
  const [attendance, setAttendance] = useState<AttendanceSummary>(MOCK_ATTENDANCE);
  const [result, setResult] = useState<StudentResult>(MOCK_RESULT);
  const [resultsList, setResultsList] = useState<StudentResult[]>([]);
  const [timetable, setTimetable] = useState<TimetableSlot[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('smart_campus_timetable');
        if (saved) return JSON.parse(saved);
      } catch (e) { }
    }
    return [
      {
        id: 'SLOT-001',
        day: 'Mon',
        subjectName: 'Data Structures & Algorithms',
        subjectCode: 'CS-301',
        facultyName: 'NITISH',
        course: 'B.Sc Computer Science',
        semester: 'Semester V (TY)',
        startTime: '09:00 AM',
        endTime: '10:00 AM',
        room: 'Hall 104',
        type: 'Lecture',
        category: 'CS',
      },
      {
        id: 'SLOT-002',
        day: 'Mon',
        subjectName: 'Database Management Lab',
        subjectCode: 'CS-302P',
        facultyName: 'NITISH',
        course: 'B.Sc Computer Science',
        semester: 'Semester V (TY)',
        startTime: '11:15 AM',
        endTime: '01:15 PM',
        room: 'Computer Lab 2',
        type: 'Lab',
        category: 'CS',
      },
      {
        id: 'SLOT-003',
        day: 'Tue',
        subjectName: 'Data Structures & Algorithms',
        subjectCode: 'CS-301',
        facultyName: 'NITISH',
        course: 'B.Sc Computer Science',
        semester: 'Semester V (TY)',
        startTime: '10:00 AM',
        endTime: '11:00 AM',
        room: 'Hall 104',
        type: 'Lecture',
        category: 'CS',
      },
      {
        id: 'SLOT-004',
        day: 'Wed',
        subjectName: 'Database Management Systems',
        subjectCode: 'CS-302',
        facultyName: 'NITISH',
        course: 'B.Sc Computer Science',
        semester: 'Semester V (TY)',
        startTime: '09:00 AM',
        endTime: '10:00 AM',
        room: 'Hall 105',
        type: 'Lecture',
        category: 'CS',
      },
      {
        id: 'SLOT-005',
        day: 'Thu',
        subjectName: 'Software Engineering & Project',
        subjectCode: 'CS-304',
        facultyName: 'NITISH',
        course: 'B.Sc Computer Science',
        semester: 'Semester V (TY)',
        startTime: '11:15 AM',
        endTime: '12:15 PM',
        room: 'Seminar Hall',
        type: 'Tutorial',
        category: 'CS',
      },
      {
        id: 'SLOT-006',
        day: 'Fri',
        subjectName: 'Web Technology & Frameworks',
        subjectCode: 'CS-303',
        facultyName: 'Dr. Snehal Joshi',
        course: 'B.Sc Computer Science',
        semester: 'Semester V (TY)',
        startTime: '10:00 AM',
        endTime: '11:00 AM',
        room: 'Hall 102',
        type: 'Lecture',
        category: 'IT',
      },
    ];
  });
  const [assignments] = useState<Assignment[]>(MOCK_ASSIGNMENTS);
  const [materials, setMaterials] = useState<StudyMaterial[]>(MOCK_STUDY_MATERIALS);
  const [fees, setFees] = useState<FeeSummary>(MOCK_FEES);
  const [notices, setNotices] = useState<NoticeItem[]>(MOCK_NOTICES);
  const [readNoticeIds, setReadNoticeIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('smart_campus_read_notices');
        if (saved) return JSON.parse(saved);
      } catch (e) { }
    }
    return [];
  });

  const markNoticeAsRead = (noticeId: string) => {
    setReadNoticeIds((prev) => {
      if (prev.includes(noticeId)) return prev;
      const next = [...prev, noticeId];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('smart_campus_read_notices', JSON.stringify(next));
        } catch (e) { }
      }
      return next;
    });
  };

  const markAllNoticesAsRead = () => {
    const allIds = notices.map((n) => n.id);
    setReadNoticeIds(allIds);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('smart_campus_read_notices', JSON.stringify(allIds));
      } catch (e) { }
    }
  };

  const toggleNoticeRead = (noticeId: string) => {
    setReadNoticeIds((prev) => {
      const next = prev.includes(noticeId)
        ? prev.filter((id) => id !== noticeId)
        : [...prev, noticeId];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('smart_campus_read_notices', JSON.stringify(next));
        } catch (e) { }
      }
      return next;
    });
  };

  const unreadNoticesCount = notices.filter((n) => !readNoticeIds.includes(n.id)).length;
  const [events, setEvents] = useState<EventItem[]>(MOCK_EVENTS);
  const [complaints, setComplaints] = useState<ComplaintItem[]>(MOCK_COMPLAINTS);
  const [dispatchedEmails, setDispatchedEmails] = useState<DispatchedEmail[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Restore saved session on client mount
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem('smart_campus_session');
      if (savedSession) {
        const sessionData = JSON.parse(savedSession);
        if (sessionData && sessionData.user) {
          const user = { ...sessionData.user };
          if (user.role === 'faculty') {
            if (!user.designation) user.designation = 'Assistant Professor';
            if (!user.department) user.department = 'Computer Science';
            if (!user.employeeId) user.employeeId = user.id?.startsWith('FAC') ? user.id : 'FAC-2024-009';
            if (!user.subjectsAssigned || user.subjectsAssigned.length === 0) {
              user.subjectsAssigned = ['Data Structures & Algorithms', 'Database Management Systems'];
            }
            if (!user.classTeacherOf) user.classTeacherOf = 'TY B.Sc Computer Science';

            // Ensure faculty is in facultyList so Admin sees them
            setFacultyList((prev) => {
              const exists = prev.some(
                (f) => f.id === user.id || f.name.toLowerCase() === user.name.toLowerCase()
              );
              if (!exists) {
                const facRec: FacultyRecord = {
                  id: user.id || 'FAC-2024-009',
                  name: user.name,
                  employeeId: user.employeeId || 'FAC-2024-009',
                  email: user.email || 'faculty@modernclg.edu.in',
                  phone: user.phone || '+91 94220 12345',
                  department: user.department || 'Computer Science',
                  designation: user.designation || 'Assistant Professor',
                  qualification: user.qualification || 'M.Sc., Ph.D',
                  workloadHours: user.workloadHours || 16,
                  subjectsAssigned: user.subjectsAssigned || ['Data Structures & Algorithms'],
                  classTeacherOf: user.classTeacherOf || 'TY B.Sc Computer Science',
                  status: 'Active',
                };
                return [facRec, ...prev];
              }
              return prev;
            });
          }
          setCurrentUser(user);
          setRoleState(user.role);
          setIsAuthenticated(true);
        }
      }
    } catch (e) {
      console.warn("Session restore error", e);
    }

    const unsubscribeAuth = subscribeToAuthState((firebaseUser) => {
      if (firebaseUser) {
        setIsAuthenticated(true);
      }
    });

    // -------------------------------------------------------------------------
    // Realtime Cloud Firestore Subscriptions
    // -------------------------------------------------------------------------
    const unsubStudents = subscribeToStudents((remoteStudents) => {
      if (remoteStudents) {
        setStudents(remoteStudents);
        setStats((prev) => ({ ...prev, totalStudents: remoteStudents.length }));

        // Realtime automatic role sync: if current user is in students, ensure student role and details
        try {
          const savedSession = localStorage.getItem('smart_campus_session');
          const current = savedSession ? JSON.parse(savedSession)?.user : null;
          if (current && current.role !== 'admin' && current.role !== 'faculty') {
            const stuMatch = remoteStudents.find(
              (s) =>
                (s.email && current.email && s.email.toLowerCase() === current.email.toLowerCase()) ||
                (s.name && current.name && s.name.toLowerCase() === current.name.toLowerCase()) ||
                (current.name && s.name && current.name.toLowerCase().includes(s.name.toLowerCase()))
            );
            if (stuMatch) {
              const updatedUser: UserProfile = {
                ...current,
                name: stuMatch.name || current.name,
                role: 'student',
                department: stuMatch.department,
                course: stuMatch.course,
                semester: stuMatch.semester,
                rollNo: stuMatch.rollNo,
                prn: stuMatch.prn,
              };
              setCurrentUser(updatedUser);
              setRoleState('student');
              localStorage.setItem('smart_campus_session', JSON.stringify({ user: updatedUser, timestamp: Date.now() }));
            }
          }
        } catch (e) { }
      }
    });

    const unsubFaculty = subscribeToFaculty((remoteFaculty) => {
      if (remoteFaculty) {
        setFacultyList(remoteFaculty);
        setStats((prev) => ({ ...prev, totalFaculty: remoteFaculty.length }));

        // Realtime automatic role sync: if current user is in faculty, ensure faculty role and details
        try {
          const savedSession = localStorage.getItem('smart_campus_session');
          const current = savedSession ? JSON.parse(savedSession)?.user : null;
          if (current && current.role !== 'admin') {
            const facMatch = remoteFaculty.find(
              (f) =>
                (f.email && current.email && f.email.toLowerCase() === current.email.toLowerCase()) ||
                (f.name && current.name && f.name.toLowerCase() === current.name.toLowerCase()) ||
                (current.name && f.name && current.name.toLowerCase().includes(f.name.toLowerCase()))
            );
            if (facMatch) {
              const updatedUser: UserProfile = {
                ...current,
                name: facMatch.name || current.name,
                role: 'faculty',
                department: facMatch.department,
                designation: facMatch.designation,
                employeeId: facMatch.employeeId,
                phone: facMatch.phone,
                qualification: facMatch.qualification,
                classTeacherOf: facMatch.classTeacherOf,
                subjectsAssigned: facMatch.subjectsAssigned,
              };
              setCurrentUser(updatedUser);
              setRoleState('faculty');
              localStorage.setItem('smart_campus_session', JSON.stringify({ user: updatedUser, timestamp: Date.now() }));
            }
          }
        } catch (e) { }
      }
    });

    const unsubNotices = subscribeToNotices((remoteNotices) => {
      if (remoteNotices) {
        setNotices(remoteNotices);
      }
    });

    const unsubEvents = subscribeToEvents((remoteEvents) => {
      if (remoteEvents) {
        setEvents(remoteEvents);
      }
    });

    const unsubComplaints = subscribeToComplaints((remoteComplaints) => {
      if (remoteComplaints) {
        setComplaints(remoteComplaints);
        setStats((prev) => ({
          ...prev,
          pendingGrievances: remoteComplaints.filter((c) => c.status === 'In Progress').length,
        }));
      }
    });

    const unsubResults = subscribeToResults((remoteResults) => {
      if (remoteResults) {
        setResultsList(remoteResults);
      }
    });

    const unsubMaterials = subscribeToStudyMaterials((remoteMaterials) => {
      if (remoteMaterials) {
        setMaterials(remoteMaterials);
      }
    });

    const unsubTimetable = subscribeToTimetable((remoteSlots) => {
      if (remoteSlots && remoteSlots.length > 0) {
        setTimetable(remoteSlots);
        localStorage.setItem('smart_campus_timetable', JSON.stringify(remoteSlots));
      }
    });

    return () => {
      unsubscribeAuth();
      unsubStudents();
      unsubFaculty();
      unsubNotices();
      unsubEvents();
      unsubComplaints();
      unsubResults();
      unsubMaterials();
      unsubTimetable();
    };
  }, []);

  // Update student specific result when resultsList or currentUser changes
  useEffect(() => {
    if (resultsList.length > 0 && currentUser.role === 'student') {
      const match = resultsList.find(
        (r) =>
          r.studentId === currentUser.id ||
          (currentUser.rollNo && r.rollNo === currentUser.rollNo) ||
          r.studentName.toLowerCase() === currentUser.name.toLowerCase()
      );
      if (match) {
        setResult(match);
      }
    }
  }, [resultsList, currentUser]);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    let updatedUser: UserProfile;

    if (newRole === 'faculty') {
      const match = facultyList.find(
        (f) =>
          f.id === currentUser.id ||
          f.name?.toLowerCase() === currentUser.name?.toLowerCase() ||
          (currentUser.name && f.name?.toLowerCase().includes(currentUser.name?.toLowerCase()))
      );

      if (match) {
        updatedUser = {
          id: match.id,
          name: match.name,
          email: match.email || currentUser.email || 'faculty@modernclg.edu.in',
          role: 'faculty',
          department: match.department || 'Computer Science',
          designation: match.designation || 'Assistant Professor',
          employeeId: match.employeeId || 'FAC-2024-009',
          phone: match.phone || '+91 94220 12345',
          qualification: match.qualification || 'M.Sc., Ph.D',
          classTeacherOf: match.classTeacherOf || 'TY B.Sc Computer Science',
          subjectsAssigned: match.subjectsAssigned || ['Data Structures & Algorithms', 'Database Systems'],
          avatar: currentUser.avatar || MOCK_FACULTY_USER.avatar,
        };
      } else {
        const facName =
          currentUser.name && currentUser.name !== 'Student' && currentUser.name !== 'Rahul Ramesh Shinde'
            ? currentUser.name
            : 'NITISH';
        updatedUser = {
          ...MOCK_FACULTY_USER,
          name: facName,
          role: 'faculty',
          designation: 'Assistant Professor',
          department: 'Computer Science',
          employeeId: 'FAC-2024-009',
          classTeacherOf: 'TY B.Sc Computer Science',
          subjectsAssigned: ['Data Structures & Algorithms', 'Database Management Systems'],
          avatar: currentUser.avatar || MOCK_FACULTY_USER.avatar,
        };
      }
    } else if (newRole === 'student') {
      const match = students.find(
        (s) =>
          s.id === currentUser.id ||
          s.name?.toLowerCase() === currentUser.name?.toLowerCase()
      );

      if (match) {
        updatedUser = {
          id: match.id,
          name: match.name,
          email: match.email || currentUser.email || 'student@modernclg.edu.in',
          role: 'student',
          rollNo: match.rollNo,
          prn: match.prn,
          department: match.department,
          course: match.course,
          semester: match.semester,
          phone: match.phone,
          avatar: currentUser.avatar || MOCK_STUDENT_USER.avatar,
        };
      } else {
        const stuName =
          currentUser.name && currentUser.name !== 'Faculty Member' && currentUser.name !== 'NITISH'
            ? currentUser.name
            : 'Rahul Ramesh Shinde';
        updatedUser = {
          ...MOCK_STUDENT_USER,
          name: stuName,
          role: 'student',
          course: 'B.Sc Computer Science',
          semester: 'Semester V (TY)',
          rollNo: 'CS-329',
          prn: '2024015200678912',
          department: 'Computer Science',
          avatar: currentUser.avatar || MOCK_STUDENT_USER.avatar,
        };
      }
    } else {
      updatedUser = MOCK_ADMIN_USER;
      setViewMode('desktop');
    }

    setCurrentUser(updatedUser);
    localStorage.setItem(
      'smart_campus_session',
      JSON.stringify({ user: updatedUser, timestamp: Date.now() })
    );
  };

  const login = async (email: string, password: string, requestedRole?: UserRole) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const profile = await loginWithEmail(email, password, requestedRole);
      setCurrentUser(profile);
      setRoleState(profile.role);
      setIsAuthenticated(true);

      localStorage.setItem(
        'smart_campus_session',
        JSON.stringify({ user: profile, timestamp: Date.now() })
      );

      // Automated Role Permission Check and Redirection
      if (profile.role === 'admin') {
        setViewMode('desktop');
        setAdminSection('overview');
      } else {
        setViewMode('mobile');
        setActiveScreen('dashboard');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  const loginWithGoogleAuth = async (preferredRole?: UserRole) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const profile = await loginWithGoogle(preferredRole);
      setCurrentUser(profile);
      setRoleState(profile.role);
      setIsAuthenticated(true);

      localStorage.setItem(
        'smart_campus_session',
        JSON.stringify({ user: profile, timestamp: Date.now() })
      );

      // Automated Role Permission Check and Redirection
      if (profile.role === 'admin') {
        setViewMode('desktop');
        setAdminSection('overview');
      } else {
        setViewMode('mobile');
        setActiveScreen('dashboard');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Google sign in failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    await logoutUser();
    setIsAuthenticated(false);
    setActiveScreen('login');
  };

  const registerAdmin = async (
    name: string,
    email: string,
    password: string,
    designation: string = 'Administrator / Principal'
  ): Promise<UserProfile> => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const profile = await createAdminAccount(name, email, password, designation);
      setCurrentUser(profile);
      setRoleState('admin');
      setIsAuthenticated(true);
      setViewMode('desktop');
      localStorage.setItem(
        'smart_campus_session',
        JSON.stringify({ user: profile, timestamp: Date.now() })
      );
      return profile;
    } catch (err: any) {
      setAuthError(err.message || 'Failed to create admin account');
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  // Admin Registration for Student
  const registerStudent = async (
    studentData: Omit<StudentRecord, 'id'>,
    customPassword?: string
  ): Promise<DispatchedEmail> => {
    const studentId = `STU-2025-${Math.floor(100 + Math.random() * 900)}`;
    const tempPassword = customPassword || `Modern@${Math.floor(1000 + Math.random() * 9000)}`;

    const newStudent: StudentRecord = {
      ...studentData,
      id: studentId,
      status: 'Active',
      admissionDate: new Date().toISOString().split('T')[0],
      documents: studentData.documents || [
        { name: '12th Marksheet', type: 'PDF', uploadedAt: new Date().toISOString().split('T')[0], verified: true },
        { name: 'Aadhar Card', type: 'PDF', uploadedAt: new Date().toISOString().split('T')[0], verified: true },
      ],
    };

    const userProfile: UserProfile = {
      id: studentId,
      name: newStudent.name,
      email: newStudent.email,
      role: 'student',
      phone: newStudent.phone,
      department: newStudent.department,
      course: newStudent.course,
      semester: newStudent.semester,
      rollNo: newStudent.rollNo,
      prn: newStudent.prn,
      batch: '2025-2028',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    };

    // Register in auth registry & Firestore
    await registerNewUserAccount(userProfile, tempPassword);
    await saveStudentToFirestore(newStudent, userProfile).catch((err) =>
      console.warn('Firestore student sync note:', err)
    );

    // Dispatch credentials to student email via API
    let emailSent = false;
    let statusMessage = '';
    let qrDataUrl = '';
    let loginUrl = '';
    try {
      const resp = await fetch('/api/send-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientName: newStudent.name,
          to: newStudent.email,
          phone: newStudent.phone,
          role: 'student',
          tempPassword,
          identifier: newStudent.prn,
          rollNo: newStudent.rollNo,
          prn: newStudent.prn,
          course: newStudent.course,
          semester: newStudent.semester,
          department: newStudent.department,
        }),
      });
      if (resp.ok) {
        const resData = await resp.json();
        emailSent = resData.emailSent || false;
        statusMessage = resData.message || '';
        qrDataUrl = resData.qrDataUrl || '';
        loginUrl = resData.loginUrl || '';
      }
    } catch (apiErr: any) {
      console.warn('API send-credentials dispatch note:', apiErr);
      statusMessage = apiErr?.message || '';
    }

    // Update students state locally
    setStudents((prev) => [newStudent, ...prev.filter((s) => s.id !== newStudent.id)]);
    setStats((prev) => ({ ...prev, totalStudents: prev.totalStudents + 1 }));

    // Create dispatched email record
    const emailDispatch: DispatchedEmail = {
      id: `DISP-${Date.now().toString().slice(-4)}`,
      recipientName: newStudent.name,
      to: newStudent.email,
      role: 'student',
      tempPassword,
      sentAt: new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      identifier: newStudent.prn,
      department: newStudent.department,
      courseOrDesignation: newStudent.course,
      emailSent,
      statusMessage,
      qrDataUrl,
      loginUrl,
    };

    setDispatchedEmails((prev) => [emailDispatch, ...prev]);
    return emailDispatch;
  };

  // CRUD: Update Faculty Member (Class Teacher, Subjects, Designation, Workload)
  const updateFaculty = async (updatedFaculty: FacultyRecord): Promise<void> => {
    setFacultyList((prev) => {
      const updated = prev.map((f) => (f.id === updatedFaculty.id ? updatedFaculty : f));
      localStorage.setItem('smart_campus_faculty', JSON.stringify(updated));
      return updated;
    });

    // If currently logged-in user is this faculty, update currentUser live
    if (
      currentUser.id === updatedFaculty.id ||
      currentUser.email?.toLowerCase() === updatedFaculty.email?.toLowerCase() ||
      currentUser.name.toLowerCase() === updatedFaculty.name.toLowerCase()
    ) {
      const updatedUser: UserProfile = {
        ...currentUser,
        name: updatedFaculty.name,
        role: 'faculty',
        department: updatedFaculty.department,
        designation: updatedFaculty.designation,
        employeeId: updatedFaculty.employeeId,
        phone: updatedFaculty.phone,
        qualification: updatedFaculty.qualification,
        classTeacherOf: updatedFaculty.classTeacherOf,
        subjectsAssigned: updatedFaculty.subjectsAssigned,
      };
      setCurrentUser(updatedUser);
      setRoleState('faculty');
      localStorage.setItem(
        'smart_campus_session',
        JSON.stringify({ user: updatedUser, timestamp: Date.now() })
      );
    }

    await updateFacultyInFirestore(updatedFaculty).catch((err) =>
      console.warn('Firestore updateFaculty note:', err)
    );
  };

  // CRUD: Add New Timetable Slot
  const addTimetableSlot = async (slotData: Omit<TimetableSlot, 'id'>): Promise<void> => {
    const newSlot: TimetableSlot = {
      ...slotData,
      id: `SLOT-${Date.now().toString().slice(-4)}`,
    };

    setTimetable((prev) => {
      const updated = [...prev, newSlot];
      localStorage.setItem('smart_campus_timetable', JSON.stringify(updated));
      return updated;
    });

    await saveTimetableSlotToFirestore(newSlot).catch((err) =>
      console.warn('Firestore addTimetableSlot note:', err)
    );
  };

  // CRUD: Update Timetable Slot
  const updateTimetableSlot = async (updatedSlot: TimetableSlot): Promise<void> => {
    setTimetable((prev) => {
      const updated = prev.map((s) => (s.id === updatedSlot.id ? updatedSlot : s));
      localStorage.setItem('smart_campus_timetable', JSON.stringify(updated));
      return updated;
    });

    await saveTimetableSlotToFirestore(updatedSlot).catch((err) =>
      console.warn('Firestore updateTimetableSlot note:', err)
    );
  };

  // CRUD: Delete Timetable Slot
  const deleteTimetableSlot = async (slotId: string): Promise<void> => {
    setTimetable((prev) => {
      const updated = prev.filter((s) => s.id !== slotId);
      localStorage.setItem('smart_campus_timetable', JSON.stringify(updated));
      return updated;
    });

    await deleteTimetableSlotFromFirestore(slotId).catch((err) =>
      console.warn('Firestore deleteTimetableSlot note:', err)
    );
  };

  // CRUD: Update Student Record
  const updateStudent = async (updatedStudent: StudentRecord) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s))
    );
    await updateStudentInFirestore(updatedStudent).catch((err) =>
      console.warn('Firestore updateStudent note:', err)
    );
  };

  // CRUD: Delete Student Record
  const deleteStudent = async (studentId: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    setStats((prev) => ({
      ...prev,
      totalStudents: Math.max(0, prev.totalStudents - 1),
    }));
    await deleteStudentFromFirestore(studentId).catch((err) =>
      console.warn('Firestore deleteStudent note:', err)
    );
  };

  // Admin Registration for Faculty
  const registerFaculty = async (
    facultyData: Omit<FacultyRecord, 'id'>,
    customPassword?: string
  ): Promise<DispatchedEmail> => {
    const facultyId = `FAC-${Math.floor(100 + Math.random() * 900)}`;
    const tempPassword = customPassword || `Faculty@${Math.floor(1000 + Math.random() * 9000)}`;

    const newFaculty: FacultyRecord = {
      ...facultyData,
      id: facultyId,
      status: 'Active',
    };

    const userProfile: UserProfile = {
      id: facultyId,
      name: newFaculty.name,
      email: newFaculty.email,
      role: 'faculty',
      phone: newFaculty.phone,
      department: newFaculty.department,
      designation: newFaculty.designation,
      workloadHours: newFaculty.workloadHours,
      qualification: newFaculty.qualification,
      classTeacherOf: newFaculty.classTeacherOf,
      subjectsAssigned: newFaculty.subjectsAssigned,
      cabin: newFaculty.cabin || 'Staff Quarters Block A',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    };

    // Register in auth registry & Firestore
    await registerNewUserAccount(userProfile, tempPassword);
    await saveFacultyToFirestore(newFaculty, userProfile).catch((err) =>
      console.warn('Firestore faculty sync note:', err)
    );

    // Dispatch credentials to faculty email via API
    let emailSent = false;
    let statusMessage = '';
    try {
      const resp = await fetch('/api/send-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientName: newFaculty.name,
          to: newFaculty.email,
          phone: newFaculty.phone,
          role: 'faculty',
          tempPassword,
          identifier: newFaculty.employeeId,
          department: newFaculty.department,
          course: newFaculty.designation,
        }),
      });
      if (resp.ok) {
        const resData = await resp.json();
        emailSent = resData.emailSent || false;
        statusMessage = resData.message || '';
      }
    } catch (apiErr: any) {
      console.warn('API send-credentials dispatch note (faculty):', apiErr);
      statusMessage = apiErr?.message || '';
    }

    // Update faculty state locally
    setFacultyList((prev) => [newFaculty, ...prev.filter((f) => f.id !== newFaculty.id)]);
    setStats((prev) => ({ ...prev, totalFaculty: prev.totalFaculty + 1 }));

    // Create dispatched email record
    const emailDispatch: DispatchedEmail = {
      id: `DISP-${Date.now().toString().slice(-4)}`,
      recipientName: newFaculty.name,
      to: newFaculty.email,
      role: 'faculty',
      tempPassword,
      sentAt: new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      identifier: newFaculty.employeeId,
      department: newFaculty.department,
      courseOrDesignation: newFaculty.designation,
      emailSent,
      statusMessage,
    };

    setDispatchedEmails((prev) => [emailDispatch, ...prev]);
    return emailDispatch;
  };

  // Realtime Notice Publishing
  const publishNotice = async (
    title: string,
    category: NoticeItem['category'],
    content: string,
    targetRole: NoticeItem['targetRole'] = 'all'
  ) => {
    const newNotice: NoticeItem = {
      id: `NOT-${Date.now()}`,
      title,
      category,
      content,
      targetRole,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      pinned: true,
    };
    // Update local state immediately
    setNotices((prev) => [newNotice, ...prev]);
    // Save to Firestore in real time
    await saveNoticeToFirestore(newNotice).catch((err) =>
      console.warn('Firestore publishNotice note:', err)
    );
  };

  // Delete Notice
  const deleteNotice = async (noticeId: string) => {
    setNotices((prev) => prev.filter((n) => n.id !== noticeId));
    await deleteNoticeFromFirestore(noticeId).catch((err) =>
      console.warn('Firestore deleteNotice note:', err)
    );
  };

  // Realtime Event Creation
  const createEvent = async (eventData: Omit<EventItem, 'id' | 'registeredCount'>) => {
    const newEvent: EventItem = {
      ...eventData,
      id: `EVT-${Date.now()}`,
      registeredCount: 0,
    };
    setEvents((prev) => [newEvent, ...prev]);
    await saveEventToFirestore(newEvent).catch((err) =>
      console.warn('Firestore createEvent note:', err)
    );
  };

  // Realtime Event Registration
  const registerForEvent = async (eventId: string) => {
    setEvents((prev) =>
      prev.map((evt) =>
        evt.id === eventId
          ? { ...evt, registeredCount: (evt.registeredCount || 0) + 1 }
          : evt
      )
    );
    await registerForEventInFirestore(eventId).catch((err) =>
      console.warn('Firestore registerForEvent note:', err)
    );
  };

  // Realtime Complaint Filing
  const addComplaint = async (
    title: string,
    category: ComplaintItem['category'],
    description: string
  ) => {
    const newComplaint: ComplaintItem = {
      id: `CMP-${Date.now().toString().slice(-4)}`,
      title,
      category,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'In Progress',
      description,
    };
    setComplaints((prev) => [newComplaint, ...prev]);
    await saveComplaintToFirestore(newComplaint).catch((err) =>
      console.warn('Firestore addComplaint note:', err)
    );
  };

  // Update Complaint Status (e.g. In Progress -> Resolved)
  const updateComplaintStatus = async (
    complaintId: string,
    status: 'In Progress' | 'Resolved'
  ) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === complaintId ? { ...c, status } : c))
    );
    await updateComplaintStatusInFirestore(complaintId, status).catch((err) =>
      console.warn('Firestore updateComplaintStatus note:', err)
    );
  };

  // Realtime Result Publishing
  const publishResult = async (resultData: StudentResult) => {
    setResultsList((prev) => [resultData, ...prev.filter((r) => r.id !== resultData.id)]);
    if (resultData.studentId === currentUser.id || resultData.rollNo === currentUser.rollNo) {
      setResult(resultData);
    }
    await saveStudentResultToFirestore(resultData).catch((err) =>
      console.warn('Firestore publishResult note:', err)
    );
  };

  // Realtime Attendance Record Update
  const recordAttendance = async (
    studentId: string,
    attendanceData: AttendanceSummary
  ) => {
    setAttendance(attendanceData);
    await saveAttendanceToFirestore(studentId, attendanceData).catch((err) =>
      console.warn('Firestore recordAttendance note:', err)
    );
  };

  // Realtime Study Material Upload
  const uploadMaterial = async (
    materialData: Omit<StudyMaterial, 'id' | 'downloads' | 'uploadedDate'>
  ) => {
    const newMaterial: StudyMaterial = {
      ...materialData,
      id: `MAT-${Date.now()}`,
      downloads: 0,
      uploadedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    };
    setMaterials((prev) => [newMaterial, ...prev]);
    await saveStudyMaterialToFirestore(newMaterial).catch((err) =>
      console.warn('Firestore uploadMaterial note:', err)
    );
  };

  const payFees = (feeId: string) => {
    setFees((prev) => {
      const updatedHistory = prev.history.map((item) => {
        if (item.id === feeId) {
          return {
            ...item,
            status: 'Paid' as const,
            paidDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            receiptNo: `REC-${Date.now().toString().slice(-4)}`,
          };
        }
        return item;
      });
      return {
        ...prev,
        pendingAmount: 0,
        paidAmount: prev.paidAmount + 2500,
        history: updatedHistory,
      };
    });
  };

  const syncToFirebase = async (): Promise<number> => {
    setIsSyncing(true);
    try {
      const res = await seedCampusDataToFirestore();
      return res.count;
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        currentUser,
        setCurrentUser,
        isAuthenticated,
        authLoading,
        authError,
        activeScreen,
        setActiveScreen,
        isDrawerOpen,
        setIsDrawerOpen,
        backExitToast,
        adminSection,
        setAdminSection,
        viewMode,
        setViewMode,
        login,
        loginWithGoogleAuth,
        logout,
        registerAdmin,
        registerStudent,
        updateStudent,
        deleteStudent,
        registerFaculty,
        updateFaculty,
        addTimetableSlot,
        updateTimetableSlot,
        deleteTimetableSlot,
        dispatchedEmails,
        syncToFirebase,
        isSyncing,
        stats,
        students,
        facultyList,
        departments,
        courses,
        attendance,
        result,
        resultsList,
        timetable,
        assignments,
        materials,
        fees,
        notices,
        readNoticeIds,
        unreadNoticesCount,
        markNoticeAsRead,
        markAllNoticesAsRead,
        toggleNoticeRead,
        events,
        complaints,
        publishNotice,
        deleteNotice,
        createEvent,
        registerForEvent,
        addComplaint,
        updateComplaintStatus,
        publishResult,
        recordAttendance,
        uploadMaterial,
        payFees,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
