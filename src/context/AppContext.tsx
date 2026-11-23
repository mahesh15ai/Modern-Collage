'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
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
  events: EventItem[];
  complaints: ComplaintItem[];
  // Realtime Actions
  updateStudent: (student: StudentRecord) => Promise<void>;
  deleteStudent: (studentId: string) => Promise<void>;
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
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const setActiveScreen = (screen: MobileScreen) => {
    setIsDrawerOpen(false);
    setActiveScreenState(screen);
  };
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
  const [timetable] = useState<TimetableSlot[]>(MOCK_TIMETABLE);
  const [assignments] = useState<Assignment[]>(MOCK_ASSIGNMENTS);
  const [materials, setMaterials] = useState<StudyMaterial[]>(MOCK_STUDY_MATERIALS);
  const [fees, setFees] = useState<FeeSummary>(MOCK_FEES);
  const [notices, setNotices] = useState<NoticeItem[]>(MOCK_NOTICES);
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
          setCurrentUser(sessionData.user);
          setRoleState(sessionData.user.role);
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
      }
    });

    const unsubFaculty = subscribeToFaculty((remoteFaculty) => {
      if (remoteFaculty) {
        setFacultyList(remoteFaculty);
        setStats((prev) => ({ ...prev, totalFaculty: remoteFaculty.length }));
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

    return () => {
      unsubscribeAuth();
      unsubStudents();
      unsubFaculty();
      unsubNotices();
      unsubEvents();
      unsubComplaints();
      unsubResults();
      unsubMaterials();
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
    const updatedUser =
      newRole === 'student'
        ? MOCK_STUDENT_USER
        : newRole === 'faculty'
          ? MOCK_FACULTY_USER
          : MOCK_ADMIN_USER;

    setCurrentUser(updatedUser);
    if (newRole === 'admin') {
      setViewMode('desktop');
    }
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
      cabin: 'Staff Quarters Block A',
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
