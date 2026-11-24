'use client';

import React, { useState, useEffect } from 'react';
import { useApp, AdminSection } from '@/context/AppContext';
import CollegeLogo from '@/components/common/CollegeLogo';
import {
  Users,
  GraduationCap,
  Building2,
  CalendarCheck,
  FileCheck2,
  Award,
  Calendar,
  ClipboardList,
  FolderDown,
  CreditCard,
  Bell,
  Sparkles,
  AlertTriangle,
  BrainCircuit,
  Search,
  Plus,
  Download,
  Filter,
  ArrowUpRight,
  TrendingUp,
  BarChart3,
  Smartphone,
  LogOut,
  Mail,
  Lock,
  CheckCircle2,
  X,
  Copy,
  Send,
  Key,
  Check,
  Database,
  CloudUpload,
  RotateCcw,
  Trash2,
  Eye,
  Pencil,
  QrCode,
  Printer,
  Menu,
  BookOpen,
} from 'lucide-react';
import { DispatchedEmail } from '@/context/AppContext';
import { clearAllLocalCaches } from '@/services/authService';
import { StudentRecord, FacultyRecord, TimetableSlot } from '@/types';

export const AdminPortal: React.FC = () => {
  const {
    adminSection,
    setAdminSection,
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
    setViewMode,
    role,
    setRole,
    currentUser,
    logout,
    registerStudent,
    updateStudent,
    deleteStudent,
    registerFaculty,
    updateFaculty,
    addTimetableSlot,
    updateTimetableSlot,
    deleteTimetableSlot,
    dispatchedEmails,
    login,
    syncToFirebase,
    isSyncing,
    publishNotice,
    deleteNotice,
    createEvent,
    updateComplaintStatus,
    publishResult,
    recordAttendance,
    uploadMaterial,
  } = useApp();

  // Sidebar Drawer state for mobile & tablet responsive navigation
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [syncedCount, setSyncedCount] = useState<number | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Modals for Admission & Faculty Onboarding
  const [showAdmissionModal, setShowAdmissionModal] = useState(false);
  const [showFacultyModal, setShowFacultyModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [latestDispatch, setLatestDispatch] = useState<DispatchedEmail | null>(null);
  const [toastNotification, setToastNotification] = useState<{
    show: boolean;
    title: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (toastNotification?.show) {
      const timer = setTimeout(() => {
        setToastNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toastNotification]);

  // Student Admission Form State
  const [stuName, setStuName] = useState('');
  const [stuEmail, setStuEmail] = useState('');
  const [stuPhone, setStuPhone] = useState('');
  const [stuClassYear, setStuClassYear] = useState('First Year (FY)');
  const [stuDept, setStuDept] = useState('Computer Science');
  const [stuCourse, setStuCourse] = useState('B.Sc Computer Science');
  const [stuSemester, setStuSemester] = useState('Semester I');
  const [stuFacultyMentor, setStuFacultyMentor] = useState('Prof. Rajesh Kulkarni (HOD)');
  const [stuRollNo, setStuRollNo] = useState('');
  const [stuPrn, setStuPrn] = useState('');
  const [stuPassword, setStuPassword] = useState('');
  const [isSubmittingStu, setIsSubmittingStu] = useState(false);

  // Email verification status
  const isStuEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stuEmail.trim());
  const isStuEmailTaken = students.some(
    (s) => s.email.toLowerCase() === stuEmail.trim().toLowerCase()
  );

  // Random Password Generator for Students
  const generateRandomStudentPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let rand = '';
    for (let i = 0; i < 4; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const digits = Math.floor(1000 + Math.random() * 9000);
    return `Modern@${digits}${rand.slice(0, 2)}`;
  };

  // Edit Student Modal State (CRUD: Update)
  const [showEditStudentModal, setShowEditStudentModal] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState('');
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editDept, setEditDept] = useState('Computer Science');
  const [editCourse, setEditCourse] = useState('B.Sc Computer Science');
  const [editSemester, setEditSemester] = useState('Semester I');
  const [editRollNo, setEditRollNo] = useState('');
  const [editPrn, setEditPrn] = useState('');
  const [editStatus, setEditStatus] = useState<'Active' | 'Alumni' | 'Suspended'>('Active');
  const [isUpdatingStudent, setIsUpdatingStudent] = useState(false);

  // View Student Modal State (CRUD: Read)
  const [showViewStudentModal, setShowViewStudentModal] = useState(false);
  const [viewingStudent, setViewingStudent] = useState<StudentRecord | null>(null);

  // Faculty Onboarding Form State
  const [facName, setFacName] = useState('');
  const [facEmail, setFacEmail] = useState('');
  const [facPhone, setFacPhone] = useState('');
  const [facDept, setFacDept] = useState('Computer Science');
  const [facDesignation, setFacDesignation] = useState('Assistant Professor');
  const [facEmpId, setFacEmpId] = useState('');
  const [facQual, setFacQual] = useState('M.Tech / M.Sc (CS)');
  const [facWorkload, setFacWorkload] = useState(16);
  const [facSubjects, setFacSubjects] = useState('Data Structures, Web Tech');
  const [facClassTeacher, setFacClassTeacher] = useState('None');
  const [facPassword, setFacPassword] = useState('');
  const [isSubmittingFac, setIsSubmittingFac] = useState(false);

  // Edit Faculty & Assign Duties Modal State
  const [showEditFacultyModal, setShowEditFacultyModal] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<FacultyRecord | null>(null);
  const [editFacName, setEditFacName] = useState('');
  const [editFacDept, setEditFacDept] = useState('');
  const [editFacDesignation, setEditFacDesignation] = useState('');
  const [editFacEmpId, setEditFacEmpId] = useState('');
  const [editFacPhone, setEditFacPhone] = useState('');
  const [editFacQual, setEditFacQual] = useState('');
  const [editFacWorkload, setEditFacWorkload] = useState(16);
  const [editFacSubjects, setEditFacSubjects] = useState('');
  const [editFacClassTeacher, setEditFacClassTeacher] = useState('None');
  const [isSavingEditFaculty, setIsSavingEditFaculty] = useState(false);

  // Timetable Slot Allocation Modal State
  const [showTimetableModal, setShowTimetableModal] = useState(false);
  const [slotDay, setSlotDay] = useState<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat'>('Mon');
  const [slotSubject, setSlotSubject] = useState('');
  const [slotCode, setSlotCode] = useState('');
  const [slotFaculty, setSlotFaculty] = useState('');
  const [slotCourse, setSlotCourse] = useState('B.Sc Computer Science');
  const [slotSemester, setSlotSemester] = useState('Semester V (TY)');
  const [slotStartTime, setSlotStartTime] = useState('09:00 AM');
  const [slotEndTime, setSlotEndTime] = useState('10:00 AM');
  const [slotRoom, setSlotRoom] = useState('Hall 104');
  const [slotType, setSlotType] = useState<'Lecture' | 'Lab' | 'Tutorial'>('Lecture');
  const [slotCategory, setSlotCategory] = useState<'CS' | 'IT' | 'MATH' | 'ELEC'>('CS');
  const [isSubmittingSlot, setIsSubmittingSlot] = useState(false);
  const [timetableFacultyFilter, setTimetableFacultyFilter] = useState('all');

  // Notice Modal
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeCategory, setNoticeCategory] = useState<'Academic' | 'Exam' | 'General' | 'Urgent'>('Academic');
  const [noticeTargetRole, setNoticeTargetRole] = useState<'all' | 'students' | 'faculty'>('all');
  const [noticeContent, setNoticeContent] = useState('');
  const [isSubmittingNotice, setIsSubmittingNotice] = useState(false);

  // Event Modal
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventSubtitle, setEventSubtitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventVenue, setEventVenue] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventBanner, setEventBanner] = useState('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800');
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);

  // Student Marks Result Modal
  const [showResultModal, setShowResultModal] = useState(false);
  const [resStudentId, setResStudentId] = useState('');
  const [resSemester, setResSemester] = useState('Semester I');
  const [m1, setM1] = useState(85);
  const [m2, setM2] = useState(78);
  const [m3, setM3] = useState(82);
  const [m4, setM4] = useState(90);
  const [m5, setM5] = useState(84);
  const [isSubmittingResult, setIsSubmittingResult] = useState(false);

  // Attendance Modal
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attStudentId, setAttStudentId] = useState('');
  const [attPct, setAttPct] = useState(85);
  const [isSubmittingAtt, setIsSubmittingAtt] = useState(false);

  // Material Modal
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [matTitle, setMatTitle] = useState('');
  const [matSubject, setMatSubject] = useState('Data Structures');
  const [matCategory, setMatCategory] = useState<'Notes' | 'Papers' | 'Books'>('Notes');
  const [matFileSize, setMatFileSize] = useState('2.4 MB');
  const [isSubmittingMat, setIsSubmittingMat] = useState(false);

  const handlePublishNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeContent.trim()) return;
    setIsSubmittingNotice(true);
    try {
      await publishNotice(noticeTitle, noticeCategory, noticeContent, noticeTargetRole);
      setShowNoticeModal(false);
      setNoticeTitle('');
      setNoticeContent('');
    } finally {
      setIsSubmittingNotice(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;
    setIsSubmittingEvent(true);
    try {
      await createEvent({
        title: eventTitle,
        subtitle: eventSubtitle || 'Annual Campus Activity',
        date: eventDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: eventTime || '10:00 AM - 04:00 PM',
        venue: eventVenue || 'College Auditorium',
        bannerImage: eventBanner,
        description: eventDesc || 'Join us for this exciting campus event.',
        registrationOpen: true,
      });
      setShowEventModal(false);
      setEventTitle('');
      setEventSubtitle('');
      setEventDesc('');
    } finally {
      setIsSubmittingEvent(false);
    }
  };

  const handlePublishResult = async (e: React.FormEvent) => {
    e.preventDefault();
    const selStudent = students.find((s) => s.id === resStudentId) || students[0];
    if (!selStudent) return;
    setIsSubmittingResult(true);
    try {
      const marks = [Number(m1), Number(m2), Number(m3), Number(m4), Number(m5)];
      const totalObtained = marks.reduce((a, b) => a + b, 0);
      const pct = Math.round((totalObtained / 500) * 100);
      const grade = pct >= 85 ? 'A+' : pct >= 75 ? 'A' : pct >= 60 ? 'B+' : pct >= 50 ? 'B' : 'Pass';
      const status = pct >= 75 ? 'Distinction' : pct >= 60 ? 'First Class' : pct >= 50 ? 'Second Class' : 'Fail';

      await publishResult({
        id: `RES-${selStudent.id}`,
        studentId: selStudent.id,
        studentName: selStudent.name,
        rollNo: selStudent.rollNo,
        course: selStudent.course,
        semester: resSemester,
        overallPercentage: pct,
        cgpa: Number((pct / 9.5).toFixed(2)),
        grade,
        status,
        declaredDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        subjectMarks: [
          { subjectName: 'Data Structures & Algorithms', subjectCode: 'CS-501', obtained: Number(m1), total: 100, grade: Number(m1) >= 80 ? 'A+' : 'A', status: 'Pass' },
          { subjectName: 'Operating Systems Architecture', subjectCode: 'CS-502', obtained: Number(m2), total: 100, grade: Number(m2) >= 80 ? 'A+' : 'A', status: 'Pass' },
          { subjectName: 'Database Management Systems', subjectCode: 'CS-503', obtained: Number(m3), total: 100, grade: Number(m3) >= 80 ? 'A+' : 'A', status: 'Pass' },
          { subjectName: 'Advanced Web Technologies', subjectCode: 'CS-504', obtained: Number(m4), total: 100, grade: Number(m4) >= 80 ? 'A+' : 'A', status: 'Pass' },
          { subjectName: 'Computer Networks & Security', subjectCode: 'CS-505', obtained: Number(m5), total: 100, grade: Number(m5) >= 80 ? 'A+' : 'A', status: 'Pass' },
        ],
      });
      setShowResultModal(false);
    } finally {
      setIsSubmittingResult(false);
    }
  };

  const handleUpdateAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    const selStudent = students.find((s) => s.id === attStudentId) || students[0];
    if (!selStudent) return;
    setIsSubmittingAtt(true);
    try {
      const pct = Number(attPct);
      const total = 60;
      const attended = Math.round((pct / 100) * total);
      await recordAttendance(selStudent.id, {
        overallPercentage: pct,
        totalClasses: total,
        present: attended,
        absent: total - attended,
        late: 2,
        monthlyTrend: [
          { month: 'Aug', percentage: Math.min(100, pct + 2) },
          { month: 'Sep', percentage: Math.min(100, pct - 3) },
          { month: 'Oct', percentage: Math.min(100, pct + 1) },
          { month: 'Nov', percentage: pct },
        ],
        subjectWise: [
          { subjectName: 'Data Structures', subjectCode: 'CS-501', attended: Math.round(attended * 0.22), total: 12, percentage: pct },
          { subjectName: 'Operating Systems', subjectCode: 'CS-502', attended: Math.round(attended * 0.2), total: 12, percentage: pct },
          { subjectName: 'Database Systems', subjectCode: 'CS-503', attended: Math.round(attended * 0.2), total: 12, percentage: pct },
          { subjectName: 'Web Technologies', subjectCode: 'CS-504', attended: Math.round(attended * 0.2), total: 12, percentage: pct },
          { subjectName: 'Computer Networks', subjectCode: 'CS-505', attended: Math.round(attended * 0.18), total: 12, percentage: pct },
        ],
      });
      setShowAttendanceModal(false);
    } finally {
      setIsSubmittingAtt(false);
    }
  };

  const handleUploadMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matTitle.trim()) return;
    setIsSubmittingMat(true);
    try {
      await uploadMaterial({
        title: matTitle,
        subject: matSubject,
        category: matCategory,
        fileSize: matFileSize || '2.0 MB',
        uploadedBy: currentUser.name || 'HOD / Academic Desk',
        fileUrl: '#',
      });
      setShowMaterialModal(false);
      setMatTitle('');
    } finally {
      setIsSubmittingMat(false);
    }
  };

  const handleOpenAdmissionModal = () => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    setStuRollNo(`CS-${randomSuffix}`);
    setStuPrn(`20250019${randomSuffix}`);
    setStuPassword(generateRandomStudentPassword());
    setStuName('');
    setStuEmail('');
    setStuPhone('');
    setShowAdmissionModal(true);
  };

  const handleOpenFacultyModal = () => {
    const randomSuffix = Math.floor(10 + Math.random() * 90);
    setFacEmpId(`EMP-CS-${randomSuffix}`);
    setFacPassword(`Faculty@${Math.floor(1000 + Math.random() * 9000)}`);
    setShowFacultyModal(true);
  };

  const handleStudentAdmissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stuName.trim() || !stuEmail.trim()) return;
    if (!isStuEmailValid) {
      alert('Please enter a valid email address (e.g. name@gmail.com)');
      return;
    }
    if (isStuEmailTaken) {
      alert('This email address is already registered for an existing student.');
      return;
    }
    setIsSubmittingStu(true);
    try {
      const dispatch = await registerStudent(
        {
          name: stuName.trim(),
          email: stuEmail.trim().toLowerCase(),
          phone: stuPhone.trim() || '+91 98765 00000',
          department: stuDept,
          course: `${stuCourse} (${stuClassYear})`,
          semester: stuSemester,
          rollNo: stuRollNo,
          prn: stuPrn,
          admissionDate: new Date().toISOString().split('T')[0],
          status: 'Active',
          documents: [
            { name: '12th Marksheet', type: 'PDF', uploadedAt: new Date().toISOString().split('T')[0], verified: true },
            { name: 'Aadhar Card', type: 'PDF', uploadedAt: new Date().toISOString().split('T')[0], verified: true },
          ],
        },
        stuPassword
      );
      setLatestDispatch(dispatch);
      setShowAdmissionModal(false);
      setToastNotification({
        show: true,
        title: 'Admission Confirmed & Digital QR Pass Dispatched!',
        message: `Student account provisioned. Official QR Pass delivered directly to ${stuEmail.trim().toLowerCase()}.`,
      });
      // Reset
      setStuName('');
      setStuEmail('');
      setStuPhone('');
    } finally {
      setIsSubmittingStu(false);
    }
  };

  const openMailtoClient = () => {
    if (!latestDispatch) return;
    const subject = encodeURIComponent("Welcome to Modern College, Nanded - Your Smart Campus Login Credentials");
    const body = encodeURIComponent(
      `Dear ${latestDispatch.recipientName},\n\nWelcome to Modern College of Computer Science & Information Technology, Nanded.\n\nYour institutional student account has been officially provisioned:\n\n• Student Name: ${latestDispatch.recipientName}\n• Login Email: ${latestDispatch.to}\n• Initial Password: ${latestDispatch.tempPassword}\n• Course: ${latestDispatch.courseOrDesignation}\n• PRN / Identifier: ${latestDispatch.identifier}\n• Department: ${latestDispatch.department}\n\nSmart Campus Portal: http://localhost:3000 (or http://192.168.0.136:3000 on Wi-Fi)\n\nPlease log in and update your password.\n\nBest Regards,\nCollege Administration Desk\nModern College of Computer Science & IT, Nanded`
    );
    window.open(`mailto:${latestDispatch.to}?subject=${subject}&body=${body}`, '_blank');
  };

  const openWebGmail = () => {
    if (!latestDispatch) return;
    const subject = encodeURIComponent("Welcome to Modern College, Nanded - Your Smart Campus Login Credentials");
    const body = encodeURIComponent(
      `Dear ${latestDispatch.recipientName},\n\nWelcome to Modern College of Computer Science & Information Technology, Nanded.\n\nYour institutional account has been officially provisioned in our Smart Campus ERP system:\n\n• Name: ${latestDispatch.recipientName}\n• Login Email: ${latestDispatch.to}\n• Initial Password: ${latestDispatch.tempPassword}\n• Course: ${latestDispatch.courseOrDesignation}\n• PRN / Roll No: ${latestDispatch.identifier}\n• Department: ${latestDispatch.department}\n\nSmart Campus Portal: http://localhost:3000 (or http://192.168.0.136:3000 on Wi-Fi)\n\nPlease log in and update your password.\n\nBest Regards,\nCollege Administration Desk\nModern College of Computer Science & IT, Nanded`
    );
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(latestDispatch.to)}&su=${subject}&body=${body}`, '_blank');
  };

  // CRUD: Open Edit Student Modal
  const handleOpenEditStudent = (stu: StudentRecord) => {
    setEditingStudentId(stu.id);
    setEditName(stu.name);
    setEditEmail(stu.email);
    setEditPhone(stu.phone);
    setEditDept(stu.department);
    setEditCourse(stu.course);
    setEditSemester(stu.semester);
    setEditRollNo(stu.rollNo);
    setEditPrn(stu.prn);
    setEditStatus(stu.status);
    setShowEditStudentModal(true);
  };

  // CRUD: Submit Updated Student Record
  const handleUpdateStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editEmail.trim()) return;
    setIsUpdatingStudent(true);
    try {
      const existing = students.find((s) => s.id === editingStudentId);
      await updateStudent({
        id: editingStudentId,
        name: editName.trim(),
        email: editEmail.trim(),
        phone: editPhone.trim(),
        department: editDept,
        course: editCourse,
        semester: editSemester,
        rollNo: editRollNo.trim(),
        prn: editPrn.trim(),
        admissionDate: existing?.admissionDate || new Date().toISOString().split('T')[0],
        status: editStatus,
        documents: existing?.documents || [],
      });
      setShowEditStudentModal(false);
    } finally {
      setIsUpdatingStudent(false);
    }
  };

  // CRUD: Delete Student Record with Confirmation
  const handleDeleteStudent = async (stu: StudentRecord) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete student "${stu.name}" (${stu.rollNo}) from the college database?`
    );
    if (!confirmed) return;
    await deleteStudent(stu.id);
  };

  // CRUD: Open View Student Dossier
  const handleOpenViewStudent = (stu: StudentRecord) => {
    setViewingStudent(stu);
    setShowViewStudentModal(true);
  };

  const handleFacultySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facName || !facEmail) return;
    setIsSubmittingFac(true);
    try {
      const dispatch = await registerFaculty(
        {
          name: facName,
          email: facEmail,
          phone: facPhone || '+91 94220 00000',
          department: facDept,
          designation: facDesignation,
          employeeId: facEmpId,
          qualification: facQual,
          workloadHours: Number(facWorkload) || 16,
          subjectsAssigned: facSubjects.split(',').map((s) => s.trim()).filter(Boolean),
          classTeacherOf: facClassTeacher !== 'None' ? facClassTeacher : undefined,
          status: 'Active',
        },
        facPassword
      );
      setLatestDispatch(dispatch);
      setShowFacultyModal(false);
      setToastNotification({
        show: true,
        title: 'Faculty Onboarded & Credentials Dispatched!',
        message: `Faculty account created and credentials sent directly to ${facEmail.trim().toLowerCase()}.`,
      });
      // Reset
      setFacName('');
      setFacEmail('');
      setFacPhone('');
      setFacClassTeacher('None');
    } finally {
      setIsSubmittingFac(false);
    }
  };

  // CRUD: Open Edit Faculty Modal
  const handleOpenEditFaculty = (fac: FacultyRecord) => {
    setEditingFaculty(fac);
    setEditFacName(fac.name);
    setEditFacDept(fac.department || 'Computer Science');
    setEditFacDesignation(fac.designation || 'Assistant Professor');
    setEditFacEmpId(fac.employeeId);
    setEditFacPhone(fac.phone || '');
    setEditFacQual(fac.qualification || '');
    setEditFacWorkload(fac.workloadHours || 16);
    setEditFacSubjects(fac.subjectsAssigned ? fac.subjectsAssigned.join(', ') : '');
    setEditFacClassTeacher(fac.classTeacherOf || 'None');
    setShowEditFacultyModal(true);
  };

  // CRUD: Save Edited Faculty Member
  const handleSaveEditFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaculty) return;
    setIsSavingEditFaculty(true);
    try {
      const updated: FacultyRecord = {
        ...editingFaculty,
        name: editFacName.trim(),
        department: editFacDept,
        designation: editFacDesignation,
        employeeId: editFacEmpId.trim(),
        phone: editFacPhone.trim(),
        qualification: editFacQual.trim(),
        workloadHours: Number(editFacWorkload) || 16,
        subjectsAssigned: editFacSubjects.split(',').map((s) => s.trim()).filter(Boolean),
        classTeacherOf: editFacClassTeacher !== 'None' ? editFacClassTeacher : undefined,
      };
      await updateFaculty(updated);
      setShowEditFacultyModal(false);
      setToastNotification({
        show: true,
        title: 'Faculty Academic Assignments Saved!',
        message: `${updated.name}'s Class Teacher & Subjects updated in realtime across mobile & web.`,
      });
    } finally {
      setIsSavingEditFaculty(false);
    }
  };

  // CRUD: Save Timetable Slot
  const handleSaveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slotSubject.trim()) return;
    setIsSubmittingSlot(true);
    try {
      const chosenFaculty = facultyList.find((f) => f.name === slotFaculty);
      await addTimetableSlot({
        day: slotDay,
        subjectName: slotSubject.trim(),
        subjectCode: slotCode.trim() || 'CS-301',
        facultyName: slotFaculty || (facultyList[0]?.name || 'Dr. Nitish Sharma'),
        facultyId: chosenFaculty?.id,
        course: slotCourse,
        semester: slotSemester,
        startTime: slotStartTime,
        endTime: slotEndTime,
        room: slotRoom,
        type: slotType,
        category: slotCategory,
      });
      setShowTimetableModal(false);
      setSlotSubject('');
      setSlotCode('');
      setToastNotification({
        show: true,
        title: 'Timetable Slot Allocated in Realtime!',
        message: `${slotSubject} on ${slotDay} allocated to ${slotFaculty || 'Faculty'}.`,
      });
    } finally {
      setIsSubmittingSlot(false);
    }
  };


  // AI Predictor State in Research Tab
  const [aiAttendance, setAiAttendance] = useState(92);
  const [aiTest1, setAiTest1] = useState(25);
  const [aiTest2, setAiTest2] = useState(24);
  const [aiAssignment, setAiAssignment] = useState(95);
  const [aiCgpa, setAiCgpa] = useState(8.35);
  const [aiPredicting, setAiPredicting] = useState(false);
  const [aiResult, setAiResult] = useState<{
    predictedPercentage: number;
    grade: string;
    risk: 'Low' | 'Medium' | 'High';
    confidence: number;
    recommendation: string;
  }>({
    predictedPercentage: 78.5,
    grade: 'A+ (Distinction)',
    risk: 'Low',
    confidence: 94.2,
    recommendation: 'Student demonstrates consistent academic metrics. Keep continuing advanced laboratory problem solving.',
  });

  const runAiPrediction = () => {
    setAiPredicting(true);
    setTimeout(() => {
      const calculated = (aiAttendance * 0.25 + ((aiTest1 + aiTest2) / 60 * 100) * 0.35 + aiAssignment * 0.15 + (aiCgpa * 10) * 0.25);
      const rounded = Math.round(calculated * 10) / 10;
      const riskLevel = rounded < 50 ? 'High' : (rounded < 70 ? 'Medium' : 'Low');
      const gradeStr = rounded >= 80 ? 'A+ (Distinction)' : (rounded >= 65 ? 'A (First Class)' : (rounded >= 50 ? 'B (Second Class)' : 'F (At Risk)'));

      setAiResult({
        predictedPercentage: rounded,
        grade: gradeStr,
        risk: riskLevel,
        confidence: Math.round((90 + Math.random() * 8) * 10) / 10,
        recommendation:
          rounded < 60
            ? 'Attendance & Internal scores are low. Immediate peer mentoring and remedial class recommended.'
            : 'Strong consistency in submission rates and practical assignments.',
      });
      setAiPredicting(false);
    }, 600);
  };

  const navItems: { id: AdminSection; label: string; icon: React.ComponentType<{ className?: string }>; count?: number; badgeColor?: string }[] = [
    { id: 'overview', label: '1. College Overview', icon: BarChart3 },
    { id: 'students', label: '2. Student Management', icon: Users, count: students.length },
    { id: 'faculty', label: '3. Faculty Management', icon: GraduationCap, count: facultyList.length },
    { id: 'departments', label: '4. Department & Course', icon: Building2, count: departments.length },
    { id: 'attendance', label: '5. Attendance Tracker', icon: CalendarCheck },
    { id: 'exams', label: '6. Exam Management', icon: FileCheck2 },
    { id: 'results', label: '7. Result Management', icon: Award },
    { id: 'timetable', label: '8. Timetable Allocation', icon: Calendar },
    { id: 'assignments', label: '9. Assignment Portal', icon: ClipboardList, count: assignments.length },
    { id: 'materials', label: '10. Study Materials', icon: FolderDown, count: materials.length },
    { id: 'fees', label: '11. Fees & Finance', icon: CreditCard },
    { id: 'notices', label: '12. Notice Board', icon: Bell, count: notices.length },
    { id: 'events', label: '13. Events & Activities', icon: Sparkles, count: events.length },
    { id: 'complaints', label: 'Grievance Redressal', icon: AlertTriangle, count: complaints.filter(c => c.status === 'In Progress').length, badgeColor: 'bg-amber-500' },
    { id: 'ml-research', label: 'AI Research Lab (ML)', icon: BrainCircuit, badgeColor: 'bg-purple-600' },
  ];

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-800 overflow-hidden relative">
      {/* Mobile Sidebar Overlay Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Admin Sidebar - Fully Responsive Drawer on Mobile/Tablet, Docked on Desktop */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 bg-slate-900 text-white flex flex-col justify-between border-r border-slate-800 shadow-2xl z-50 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div>
          {/* College Crest & Title */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CollegeLogo size={42} />
              <div>
                <h2 className="font-extrabold text-xs tracking-wide text-white uppercase leading-snug">
                  Modern College
                </h2>
                <p className="text-[10px] text-blue-400 font-medium">Nanded Campus ERP</p>
              </div>
            </div>
            {/* Close button on mobile/tablet */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden transition-colors"
              aria-label="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Module Navigation List (13 Modules + Grievance + AI) */}
          <nav className="p-2 space-y-0.5 overflow-y-auto max-h-[calc(100vh-170px)] scrollbar-thin">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = adminSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setAdminSection(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.count !== undefined && (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${item.badgeColor || (isActive ? 'bg-blue-800 text-white' : 'bg-slate-800 text-slate-400')
                        }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer - Switch to Mobile View */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60">
          <button
            onClick={() => {
              setViewMode('mobile');
              setSidebarOpen(false);
            }}
            className="w-full py-2.5 px-3 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center space-x-2 transition-all active:scale-95"
          >
            <Smartphone className="w-4 h-4 text-white" />
            <span>Switch to Mobile App Preview</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between shadow-sm z-10 shrink-0">
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Hamburger toggle button for Mobile/Tablet */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 lg:hidden transition-colors border border-slate-200/80"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 hidden sm:inline">
              Module
            </span>
            <span className="text-slate-300 hidden sm:inline">/</span>
            <h1 className="font-extrabold text-slate-900 text-xs sm:text-sm capitalize truncate max-w-[130px] sm:max-w-none">
              {adminSection.replace('-', ' ')}
            </h1>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Role Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <span className="text-slate-500 text-[10px] px-1.5 uppercase font-mono hidden md:inline">Role:</span>
              <button
                onClick={() => setRole('student')}
                className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[10px] sm:text-xs transition-all ${role === 'student' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                Student
              </button>
              <button
                onClick={() => setRole('faculty')}
                className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[10px] sm:text-xs transition-all ${role === 'faculty' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                Teacher
              </button>
              <button
                onClick={() => setRole('admin')}
                className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[10px] sm:text-xs transition-all ${role === 'admin' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                Admin
              </button>
            </div>

            {/* Switch to Mobile View button on tablet/desktop */}
            <button
              onClick={() => setViewMode('mobile')}
              className="hidden md:flex px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold items-center space-x-1.5 transition-all shadow-xs"
              title="Switch to Mobile App Preview"
            >
              <Smartphone className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden xl:inline">Mobile App</span>
            </button>

            {/* Profile Avatar & Logout */}
            <div className="flex items-center space-x-2 sm:space-x-3 pl-2 sm:pl-3 border-l border-slate-200">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-blue-600 object-cover"
              />
              <div className="text-left hidden lg:block">
                <div className="text-xs font-bold text-slate-900 truncate max-w-[120px]">{currentUser.name}</div>
                <div className="text-[10px] text-slate-500 capitalize">{currentUser.role} • Modern College</div>
              </div>
              <button
                onClick={logout}
                title="Sign Out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-50">
          {/* SECTION 1: OVERVIEW */}
          {adminSection === 'overview' && (
            <div className="space-y-6">
              {/* College Welcome Card */}
              <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-900 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10 max-w-xl">
                  <span className="bg-blue-500/30 text-blue-200 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wider">
                    Swami Ramanand Teerth Marathwada University Affiliated
                  </span>
                  <h2 className="text-2xl font-black mt-3 leading-snug">
                    Modern College of Computer Science &amp; Information Technology, Nanded
                  </h2>
                  <p className="mt-2 text-xs text-blue-200 leading-relaxed">
                    Integrated Institutional ERP, Student Life Cycle, Examination Automation, and AI-Driven Early-Warning Platform.
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      onClick={async () => {
                        setSyncError(null);
                        try {
                          const count = await syncToFirebase();
                          setSyncedCount(count);
                          setTimeout(() => setSyncedCount(null), 5000);
                        } catch (err: any) {
                          if (err?.code === 'permission-denied' || err?.message?.includes('permission')) {
                            setSyncError("Firestore Security Rules: In Firebase Console -> Firestore Database -> Rules, set 'allow read, write: if true;' and click Publish.");
                          } else {
                            setSyncError(err?.message || "Sync failed. Please check Firestore connection.");
                          }
                          setTimeout(() => setSyncError(null), 10000);
                        }
                      }}
                      disabled={isSyncing}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-xs flex items-center space-x-2 transition-all shadow-md active:scale-95 disabled:opacity-75"
                    >
                      <Database className="w-4 h-4" />
                      <span>
                        {isSyncing ? 'Connecting & Saving to Cloud Firestore...' : 'Sync Campus Data to Cloud Firestore (modernclg-5270c)'}
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        clearAllLocalCaches();
                        window.location.reload();
                      }}
                      className="px-3 py-2 bg-slate-800/90 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-sm active:scale-95 border border-slate-700/60"
                      title="Clear old cached accounts and test session"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                      <span>Clean / Reset Local Cache</span>
                    </button>

                    {syncedCount !== null && (
                      <span className="text-xs bg-emerald-950/80 text-emerald-300 px-3 py-1.5 rounded-xl border border-emerald-500/40 font-semibold flex items-center space-x-1 animate-pulse">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{syncedCount} records successfully synced to live Firestore!</span>
                      </span>
                    )}

                    {syncError && (
                      <span className="text-xs bg-rose-950/90 text-rose-300 px-3 py-2 rounded-xl border border-rose-500/40 font-semibold flex items-center space-x-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                        <span>{syncError}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 4 Big Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                  <div className="flex justify-between items-center text-slate-500 mb-2">
                    <span className="text-xs font-bold">Total Students</span>
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{stats.totalStudents}</div>
                  <div className="mt-1 text-[11px] text-emerald-600 font-semibold flex items-center">
                    <TrendingUp className="w-3.5 h-3.5 mr-1" />
                    +12% vs last academic year
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                  <div className="flex justify-between items-center text-slate-500 mb-2">
                    <span className="text-xs font-bold">Total Faculty</span>
                    <GraduationCap className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{stats.totalFaculty}</div>
                  <div className="mt-1 text-[11px] text-slate-500 font-medium">Across 6 departments</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                  <div className="flex justify-between items-center text-slate-500 mb-2">
                    <span className="text-xs font-bold">Avg Attendance</span>
                    <CalendarCheck className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{stats.averageAttendance}%</div>
                  <div className="mt-1 text-[11px] text-emerald-600 font-semibold">Exceeds 75% requirement</div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                  <div className="flex justify-between items-center text-slate-500 mb-2">
                    <span className="text-xs font-bold">Fees Realization</span>
                    <CreditCard className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{stats.feesCollectedPercent}%</div>
                  <div className="mt-1 text-[11px] text-amber-600 font-semibold">₹2.4 Cr collected</div>
                </div>
              </div>

              {/* Department Breakdown Table */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-sm text-slate-900">Departmental Overview</h3>
                  <button
                    onClick={() => setAdminSection('departments')}
                    className="text-xs font-bold text-blue-600 hover:underline flex items-center space-x-1"
                  >
                    <span>Manage Departments</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto w-full">
                  <table className="min-w-[550px] w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Department</th>
                        <th className="py-3 px-4">Head of Department</th>
                        <th className="py-3 px-4">Faculty Count</th>
                        <th className="py-3 px-4">Enrolled Students</th>
                        <th className="py-3 px-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {departments.map((dept) => (
                        <tr key={dept.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-900">{dept.name}</td>
                          <td className="py-3 px-4 text-slate-600">{dept.hod}</td>
                          <td className="py-3 px-4 font-mono">{dept.facultyCount}</td>
                          <td className="py-3 px-4 font-mono font-bold text-blue-900">{dept.studentCount}</td>
                          <td className="py-3 px-4">
                            <span className="text-blue-600 font-semibold cursor-pointer hover:underline">
                              View Report
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: STUDENT MANAGEMENT */}
          {adminSection === 'students' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search students by name, PRN, or roll no..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div className="flex items-center space-x-2 self-start sm:self-auto">
                  <button className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 flex items-center space-x-1.5 shadow-sm">
                    <Filter className="w-3.5 h-3.5" />
                    <span>Filter</span>
                  </button>
                  <button
                    onClick={handleOpenAdmissionModal}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-sm flex items-center space-x-1.5 transition-all active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Admission</span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-x-auto w-full">
                <table className="min-w-[750px] w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4">Roll No</th>
                      <th className="py-3 px-4">PRN</th>
                      <th className="py-3 px-4">Program &amp; Semester</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">Documents</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students.filter(
                      (s) =>
                        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        s.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        s.prn.includes(searchQuery)
                    ).length > 0 ? (
                      students
                        .filter(
                          (s) =>
                            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            s.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            s.prn.includes(searchQuery)
                        )
                        .map((stu) => (
                          <tr key={stu.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-4 font-bold text-slate-900">{stu.name}</td>
                            <td className="py-3 px-4 font-mono font-semibold">{stu.rollNo}</td>
                            <td className="py-3 px-4 font-mono text-slate-600">{stu.prn}</td>
                            <td className="py-3 px-4">
                              <div className="font-semibold text-slate-800">{stu.course}</div>
                              <div className="text-[10px] text-slate-400">{stu.semester}</div>
                            </td>
                            <td className="py-3 px-4 text-slate-600">{stu.phone}</td>
                            <td className="py-3 px-4">
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                                {stu.documents.length} Uploaded
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                                {stu.status}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-1.5">
                                <button
                                  onClick={() => handleOpenViewStudent(stu)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                                  title="View Student Dossier (Read)"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleOpenEditStudent(stu)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-amber-700 hover:bg-amber-50 transition-colors"
                                  title="Edit Student Information (Update)"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteStudent(stu)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                                  title="Delete Student Record (Delete)"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-400">
                          No students registered yet. Click &apos;+ New Admission&apos; above to admit the first student.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 3: FACULTY MANAGEMENT */}
          {adminSection === 'faculty' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h3 className="font-bold text-sm text-slate-900">Faculty Staff Roster</h3>
                <button
                  onClick={handleOpenFacultyModal}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-sm flex items-center space-x-1.5 transition-all active:scale-95 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Faculty Member</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {facultyList.length > 0 ? (
                  facultyList.map((fac) => (
                    <div key={fac.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm">
                          {fac.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-slate-900 truncate">{fac.name}</h4>
                          <p className="text-[11px] text-blue-700 font-semibold truncate">{fac.designation}</p>
                          <p className="text-[10px] text-slate-400 truncate">{fac.department}</p>
                        </div>
                      </div>

                      {/* Class Teacher Badge */}
                      {fac.classTeacherOf ? (
                        <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200/80 rounded-xl text-[10px] font-bold">
                          <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
                          <span className="truncate">Class Teacher: {fac.classTeacherOf}</span>
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-400 font-medium italic">
                          Not assigned as Class Teacher
                        </div>
                      )}

                      <div className="pt-2 border-t border-slate-100 text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Employee ID:</span>
                          <span className="font-mono font-bold text-slate-800">{fac.employeeId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Workload:</span>
                          <span className="font-bold text-blue-900">{fac.workloadHours} hrs / week</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Qualification:</span>
                          <span className="text-slate-700 truncate max-w-[150px]">{fac.qualification}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase">Assigned Subjects</span>
                        <div className="flex flex-wrap gap-1">
                          {fac.subjectsAssigned && fac.subjectsAssigned.length > 0 ? (
                            fac.subjectsAssigned.map((sub, i) => (
                              <span key={i} className="text-[10px] bg-blue-50 text-blue-800 border border-blue-100 px-2 py-0.5 rounded-md font-medium">
                                {sub}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">No subjects assigned yet</span>
                          )}
                        </div>
                      </div>

                      {/* Action buttons to assign Class Teacher, Subjects, or Timetable */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleOpenEditFaculty(fac)}
                          className="flex-1 px-2.5 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 transition-all active:scale-95"
                          title="Assign Class Teacher role and subjects"
                        >
                          <Pencil className="w-3.5 h-3.5 text-blue-600" />
                          <span>Assign Class &amp; Subjects</span>
                        </button>
                        <button
                          onClick={() => {
                            setSlotFaculty(fac.name);
                            setShowTimetableModal(true);
                          }}
                          className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold flex items-center space-x-1 transition-all active:scale-95"
                          title="Allocate Lecture for this Teacher"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>+ Lecture</span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full bg-white rounded-2xl p-8 border border-slate-200/80 text-center text-slate-400">
                    No faculty members onboarded yet. Click &apos;+ Add Faculty Member&apos; above to onboard teaching staff.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION 4: DEPARTMENT & COURSE */}
          {adminSection === 'departments' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h3 className="font-bold text-sm text-slate-900">Academic Structure &amp; Courses</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-sm flex items-center space-x-1.5 self-start sm:self-auto">
                  <Plus className="w-4 h-4" />
                  <span>Add New Course</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {courses.map((course) => (
                  <div key={course.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                          {course.code}
                        </span>
                        <h4 className="font-extrabold text-sm text-slate-900 mt-1">{course.name}</h4>
                        <p className="text-xs text-slate-500">{course.departmentName}</p>
                      </div>
                      <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                        {course.durationYears} Years ({course.totalSemesters} Semesters)
                      </span>
                    </div>

                    {course.semesters.length > 0 && (
                      <div className="pt-3 border-t border-slate-100">
                        <h5 className="font-bold text-xs text-slate-700 mb-2">
                          Semester V Curriculum ({course.semesters[0].subjects.length} Subjects):
                        </h5>
                        <div className="space-y-1.5">
                          {course.semesters[0].subjects.map((sub) => (
                            <div key={sub.id} className="flex justify-between items-center text-xs p-2 bg-slate-50 rounded-xl">
                              <span className="font-semibold text-slate-800">{sub.name}</span>
                              <div className="flex items-center space-x-2">
                                <span className="text-[10px] text-slate-500">{sub.facultyName}</span>
                                <span className="font-mono font-bold bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.5 rounded">
                                  {sub.credits} Credits
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 5: ATTENDANCE */}
          {adminSection === 'attendance' && (
            <div className="space-y-6">
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Attendance Monitoring &amp; Defaulter Control</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Statutory University minimum requirement: 75.0%</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      if (students.length > 0) setAttStudentId(students[0].id);
                      setShowAttendanceModal(true);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center space-x-1.5 transition-all active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Update Student Attendance</span>
                  </button>
                  <button className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-sm flex items-center space-x-1.5">
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Defaulter List (Excel)</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
                  <h4 className="text-xs font-bold text-slate-700 mb-3">Overall College Average</h4>
                  <div className="text-3xl font-extrabold text-blue-900">{attendance.overallPercentage}%</div>
                  <p className="text-xs text-slate-500 mt-1">Based on 51 scheduled lectures</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
                  <h4 className="text-xs font-bold text-slate-700 mb-3">Defaulters (&lt;75%)</h4>
                  <div className="text-3xl font-extrabold text-rose-600">8 Students</div>
                  <p className="text-xs text-slate-500 mt-1">SMS alert dispatched to guardians</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
                  <h4 className="text-xs font-bold text-slate-700 mb-3">Monthly Progression</h4>
                  <div className="flex items-center space-x-3 text-xs mt-2">
                    {attendance.monthlyTrend.map((m) => (
                      <div key={m.month} className="text-center">
                        <span className="block font-bold text-slate-800">{m.percentage}%</span>
                        <span className="text-[10px] text-slate-400">{m.month}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 6: EXAM MANAGEMENT */}
          {adminSection === 'exams' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h3 className="font-bold text-sm text-slate-900">Semester Examination Timetable</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-sm flex items-center space-x-1.5 self-start sm:self-auto">
                  <Plus className="w-4 h-4" />
                  <span>Schedule Examination</span>
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-x-auto w-full">
                <table className="min-w-[650px] w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">Code</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Time Slot</th>
                      <th className="py-3 px-4">Exam Hall</th>
                      <th className="py-3 px-4">Max Marks</th>
                      <th className="py-3 px-4">Hall Ticket</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {['Data Structures', 'Operating Systems', 'Database Systems', 'Web Technologies', 'Computer Networks'].map((sub, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-bold text-slate-900">{sub}</td>
                        <td className="py-3 px-4 font-mono">CS-50{i + 1}</td>
                        <td className="py-3 px-4 font-semibold text-slate-700">{15 + i * 3} Dec 2025</td>
                        <td className="py-3 px-4">10:00 AM - 01:00 PM</td>
                        <td className="py-3 px-4">Hall {i % 2 === 0 ? 'A' : 'B'}</td>
                        <td className="py-3 px-4 font-mono font-bold">100</td>
                        <td className="py-3 px-4 text-blue-600 font-semibold cursor-pointer hover:underline">
                          Generate
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 7: RESULT MANAGEMENT */}
          {adminSection === 'results' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Student Gradebook &amp; Marksheets</h3>
                  <p className="text-xs text-slate-500">Realtime examination evaluation records</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      if (students.length > 0) setResStudentId(students[0].id);
                      setShowResultModal(true);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center space-x-1.5 transition-all active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Enter / Publish Student Marks</span>
                  </button>
                  <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold shadow-sm flex items-center space-x-1.5">
                    <Download className="w-3.5 h-3.5" />
                    <span>Bulk Marksheet PDF</span>
                  </button>
                </div>
              </div>

              {(resultsList.length > 0 ? resultsList : (result.subjectMarks.length > 0 ? [result] : [])).length > 0 ? (
                <div className="space-y-4">
                  {(resultsList.length > 0 ? resultsList : [result]).map((resItem) => (
                    <div key={resItem.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">
                            {resItem.studentName} ({resItem.rollNo})
                          </h4>
                          <p className="text-xs text-slate-500">
                            {resItem.course} - {resItem.semester} • Declared on {resItem.declaredDate}
                          </p>
                        </div>
                        <div className="text-left sm:text-right">
                          <span className="text-xl font-black text-blue-900">{resItem.overallPercentage}%</span>
                          <span className="block text-[11px] text-emerald-600 font-bold">{resItem.status} (Grade: {resItem.grade})</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                        {resItem.subjectMarks.map((s) => (
                          <div key={s.subjectCode} className="p-3 bg-slate-50 rounded-xl text-center">
                            <span className="text-[10px] text-slate-500 block truncate">{s.subjectName}</span>
                            <span className="text-base font-extrabold text-slate-900 block mt-1">{s.obtained}/100</span>
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full inline-block mt-1">
                              Grade {s.grade}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center shadow-sm space-y-3">
                  <Award className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <h4 className="font-bold text-sm text-slate-800">No Examination Results Published Yet</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    Click &apos;+ Enter / Publish Student Marks&apos; above to record subject-wise marks for enrolled students. Results will instantly reflect on the student&apos;s mobile app in real-time.
                  </p>
                  <button
                    onClick={() => {
                      if (students.length > 0) setResStudentId(students[0].id);
                      setShowResultModal(true);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm inline-flex items-center space-x-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Enter Marks Now</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* SECTION 8: TIMETABLE ALLOCATION */}
          {adminSection === 'timetable' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Weekly Master Timetable</h3>
                  <p className="text-[11px] text-slate-500">
                    Allocate lectures and classroom slots to faculty. Synced in real-time with teacher mobile schedules.
                  </p>
                </div>
                <button
                  onClick={() => setShowTimetableModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-sm flex items-center space-x-1.5 transition-all active:scale-95 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Allocate New Slot</span>
                </button>
              </div>

              {/* Filter by Faculty */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                <div className="flex items-center space-x-2 text-xs">
                  <span className="font-bold text-slate-700">Filter by Faculty:</span>
                  <select
                    value={timetableFacultyFilter}
                    onChange={(e) => setTimetableFacultyFilter(e.target.value)}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="all">All Faculty Schedule</option>
                    {facultyList.map((f) => (
                      <option key={f.id} value={f.name}>
                        {f.name} ({f.department})
                      </option>
                    ))}
                  </select>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  Total Allocated Slots: <strong>{timetable.length}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => {
                  const daySlots = timetable
                    .filter((s) => s.day === day)
                    .filter(
                      (s) =>
                        timetableFacultyFilter === 'all' ||
                        s.facultyName?.toLowerCase() === timetableFacultyFilter.toLowerCase()
                    );
                  return (
                    <div key={day} className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-sm space-y-2">
                      <h4 className="font-bold text-xs text-slate-900 pb-2 border-b border-slate-100 flex justify-between items-center">
                        <span>{day}</span>
                        <span className="text-[10px] text-blue-600 font-mono font-bold bg-blue-50 px-1.5 py-0.5 rounded">
                          {daySlots.length} Slots
                        </span>
                      </h4>
                      {daySlots.length > 0 ? (
                        daySlots.map((slot) => (
                          <div
                            key={slot.id}
                            className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1 relative group hover:border-blue-300 transition-all"
                          >
                            <div className="flex justify-between items-start gap-1">
                              <span className="font-bold text-slate-900 block truncate flex-1" title={slot.subjectName}>
                                {slot.subjectName}
                              </span>
                              <button
                                onClick={() => deleteTimetableSlot(slot.id)}
                                className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition-colors shrink-0"
                                title="Remove Slot"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <span className="text-[10px] text-slate-500 block font-mono">
                              {slot.startTime} - {slot.endTime}
                            </span>
                            <div className="flex items-center justify-between text-[10px] pt-0.5">
                              <span className="font-mono text-blue-700 font-semibold">{slot.room}</span>
                              <span className="text-[9px] bg-slate-200 text-slate-700 font-semibold px-1.5 py-0.5 rounded">
                                {slot.type}
                              </span>
                            </div>
                            <div className="pt-0.5 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                              <span className="text-slate-600 font-medium truncate max-w-[120px]">
                                👤 {slot.facultyName}
                              </span>
                            </div>
                            {slot.course && (
                              <span className="text-[9px] text-blue-800 font-semibold block truncate">
                                {slot.course}
                              </span>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="py-4 text-center text-[10px] text-slate-400 italic">
                          No lectures scheduled
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 9: ASSIGNMENTS */}
          {adminSection === 'assignments' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h3 className="font-bold text-sm text-slate-900">Coursework &amp; Assignment Submissions</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-sm flex items-center space-x-1.5 self-start sm:self-auto">
                  <Plus className="w-4 h-4" />
                  <span>Post Assignment</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {assignments.map((asg) => (
                  <div key={asg.id} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                        {asg.subject}
                      </span>
                      <span className="text-[10px] font-semibold text-rose-600">Due: {asg.dueDate}</span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900">{asg.title}</h4>
                    <p className="text-xs text-slate-600">{asg.description}</p>

                    <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">By {asg.assignedBy}</span>
                      <span className="font-bold text-blue-900">{asg.totalPoints} Points</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 10: STUDY MATERIALS */}
          {adminSection === 'materials' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h3 className="font-bold text-sm text-slate-900">Digital Library &amp; Study Materials Repository</h3>
                <button
                  onClick={() => setShowMaterialModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-sm flex items-center space-x-1.5 transition-all active:scale-95 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Upload Document</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {materials.map((mat) => (
                  <div key={mat.id} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs">
                      PDF
                    </div>
                    <h4 className="font-bold text-xs text-slate-900 truncate">{mat.title}</h4>
                    <p className="text-[11px] text-slate-500">{mat.subject}</p>
                    <div className="pt-2 border-t border-slate-100 flex justify-between text-[10px] text-slate-400">
                      <span>{mat.fileSize}</span>
                      <span>{mat.downloads} downloads</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 11: FEES MANAGEMENT */}
          {adminSection === 'fees' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                  <span className="text-xs font-bold text-slate-500">Total Fees Budget</span>
                  <div className="text-2xl font-black text-slate-900 mt-1">₹4.85 Crore</div>
                  <p className="text-[11px] text-slate-400 mt-1">Annual projected collection</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                  <span className="text-xs font-bold text-slate-500">Collected Amount</span>
                  <div className="text-2xl font-black text-emerald-600 mt-1">₹4.32 Crore</div>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1">89.2% realized</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                  <span className="text-xs font-bold text-slate-500">Outstanding Balance</span>
                  <div className="text-2xl font-black text-amber-600 mt-1">₹53.0 Lakhs</div>
                  <p className="text-[11px] text-amber-600 font-semibold mt-1">112 Defaulter notices sent</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm">
                <h4 className="font-bold text-sm text-slate-900 mb-4">Sample Student Payment Record</h4>
                <div className="space-y-2">
                  {fees.history.map((h) => (
                    <div key={h.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-slate-50 rounded-xl text-xs gap-2">
                      <div>
                        <span className="font-bold text-slate-900">{h.title}</span>
                        {h.receiptNo && (
                          <span className="ml-2 font-mono text-[10px] text-slate-500">({h.receiptNo})</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 self-end sm:self-auto">
                        <span className="font-extrabold text-slate-900">₹{h.amount.toLocaleString('en-IN')}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${h.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}
                        >
                          {h.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 12: NOTICE BOARD */}
          {adminSection === 'notices' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h3 className="font-bold text-sm text-slate-900">Broadcast Circulars &amp; Notifications</h3>
                <button
                  onClick={() => setShowNoticeModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-sm flex items-center space-x-1.5 transition-all active:scale-95 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publish New Circular</span>
                </button>
              </div>

              <div className="space-y-3">
                {notices.map((n) => (
                  <div key={n.id} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        {n.category}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-slate-400 font-medium">{n.date}</span>
                        <button
                          onClick={() => deleteNotice(n.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Circular"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">{n.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{n.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 13: EVENTS & ACTIVITIES */}
          {adminSection === 'events' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h3 className="font-bold text-sm text-slate-900">Institutional Events &amp; Tech Fests</h3>
                <button
                  onClick={() => setShowEventModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-sm flex items-center space-x-1.5 transition-all active:scale-95 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Event</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.map((evt) => (
                  <div key={evt.id} className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm">
                    <img src={evt.bannerImage} alt={evt.title} className="w-full h-36 object-cover" />
                    <div className="p-4 space-y-2">
                      <h4 className="font-bold text-sm text-slate-900">{evt.title}</h4>
                      <p className="text-xs text-blue-600 font-semibold">{evt.subtitle}</p>
                      <p className="text-xs text-slate-500">{evt.date} • {evt.venue}</p>
                      <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-700">{evt.registeredCount} Registered</span>
                        <span className="text-emerald-600 font-semibold">Active</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GRIEVANCE / COMPLAINTS */}
          {adminSection === 'complaints' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h3 className="font-bold text-sm text-slate-900">Student Grievances &amp; Maintenance Tickets</h3>
                <span className="text-xs font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full self-start sm:self-auto">
                  {complaints.filter(c => c.status === 'In Progress').length} In Progress
                </span>
              </div>

              <div className="space-y-3">
                {complaints.map((c) => (
                  <div key={c.id} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{c.title}</h4>
                      <p className="text-xs text-slate-600 mt-0.5">{c.description}</p>
                      <div className="flex items-center space-x-3 mt-1 text-[11px] text-slate-400">
                        <span>{c.category}</span>
                        <span>•</span>
                        <span>Filed on {c.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 self-end sm:self-auto">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${c.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}
                      >
                        {c.status}
                      </span>
                      <button
                        onClick={() => updateComplaintStatus(c.id, c.status === 'Resolved' ? 'In Progress' : 'Resolved')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${c.status === 'Resolved'
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                          }`}
                      >
                        {c.status === 'Resolved' ? 'Reopen' : 'Mark Resolved'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI RESEARCH LAB (Python + Scikit-Learn Module) */}
          {adminSection === 'ml-research' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-950 via-indigo-900 to-blue-950 rounded-3xl p-6 text-white shadow-lg">
                <div className="flex items-center space-x-2 text-purple-300 font-mono text-xs font-bold uppercase tracking-wider mb-2">
                  <BrainCircuit className="w-4 h-4 text-purple-400" />
                  <span>Research Track: Scikit-Learn Predictive Model</span>
                </div>
                <h3 className="text-xl font-black">Student Academic Early-Warning &amp; Performance Forecaster</h3>
                <p className="text-xs text-purple-200 mt-1 max-w-2xl leading-relaxed">
                  Trained on multi-dimensional academic metrics (Attendance %, Mid-term continuous evaluations, Lab practicals, LMS login frequency) using RandomForestRegressor and GradientBoostingClassifier.
                </p>
              </div>

              {/* Interactive Prediction Sandbox */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Inputs */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-4">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-blue-600" />
                    <span>Feature Input Parameters</span>
                  </h4>

                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between font-bold text-slate-700 mb-1">
                        <span>Attendance Rate (%):</span>
                        <span className="text-blue-900 font-mono">{aiAttendance}%</span>
                      </div>
                      <input
                        type="range"
                        min="40"
                        max="100"
                        value={aiAttendance}
                        onChange={(e) => setAiAttendance(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-bold text-slate-700 mb-1">
                        <span>Internal Test 1 (out of 30):</span>
                        <span className="text-blue-900 font-mono">{aiTest1} / 30</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="30"
                        value={aiTest1}
                        onChange={(e) => setAiTest1(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-bold text-slate-700 mb-1">
                        <span>Internal Test 2 (out of 30):</span>
                        <span className="text-blue-900 font-mono">{aiTest2} / 30</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="30"
                        value={aiTest2}
                        onChange={(e) => setAiTest2(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-bold text-slate-700 mb-1">
                        <span>Assignment Submission Rate (%):</span>
                        <span className="text-blue-900 font-mono">{aiAssignment}%</span>
                      </div>
                      <input
                        type="range"
                        min="30"
                        max="100"
                        value={aiAssignment}
                        onChange={(e) => setAiAssignment(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-bold text-slate-700 mb-1">
                        <span>Previous Semester CGPA:</span>
                        <span className="text-blue-900 font-mono">{aiCgpa}</span>
                      </div>
                      <input
                        type="range"
                        min="4.0"
                        max="10.0"
                        step="0.05"
                        value={aiCgpa}
                        onChange={(e) => setAiCgpa(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>

                    <button
                      onClick={runAiPrediction}
                      disabled={aiPredicting}
                      className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold text-xs shadow-md flex items-center justify-center space-x-2 transition-all active:scale-95 disabled:opacity-75"
                    >
                      <BrainCircuit className="w-4 h-4" />
                      <span>{aiPredicting ? 'Executing Scikit-Learn Model...' : 'Run Scikit-Learn Prediction'}</span>
                    </button>
                  </div>
                </div>

                {/* Model Output */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span>Model Inference Output</span>
                    </h4>

                    <div className="mt-4 p-4 bg-purple-50 border border-purple-100 rounded-2xl text-center">
                      <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block">
                        Predicted Semester Score
                      </span>
                      <span className="text-4xl font-black text-purple-950 block mt-1">
                        {aiResult.predictedPercentage}%
                      </span>
                      <span className="inline-block mt-2 font-bold text-xs px-3 py-1 bg-purple-200/80 text-purple-900 rounded-full">
                        {aiResult.grade}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <span className="text-slate-500 block text-[10px]">At-Risk Classification</span>
                        <span
                          className={`font-bold text-xs ${aiResult.risk === 'Low' ? 'text-emerald-600' : (aiResult.risk === 'Medium' ? 'text-amber-600' : 'text-rose-600')
                            }`}
                        >
                          {aiResult.risk} Risk
                        </span>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl">
                        <span className="text-slate-500 block text-[10px]">Model Confidence</span>
                        <span className="font-bold text-xs text-blue-900">
                          {aiResult.confidence}%
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-slate-50 rounded-xl">
                      <span className="font-bold text-xs text-slate-800 block mb-1">
                        Institutional Intervention Recommendation:
                      </span>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {aiResult.recommendation}
                      </p>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 font-mono">
                    Model: RandomForestRegressor (Scikit-Learn 1.3) • Seed: 42
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL 1: NEW STUDENT ADMISSION */}
      {showAdmissionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-start pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <CollegeLogo size={42} />
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    New Student Admission &amp; Email Dispatch
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Takes Full Name, Email, Mobile, Class, Course, Faculty &amp; auto-generates random password sent to student email.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAdmissionModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStudentAdmissionSubmit} className="mt-4 space-y-4 text-xs">
              {/* Full Name & Verified Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    value={stuName}
                    onChange={(e) => {
                      setStuName(e.target.value);
                      if (!stuEmail && e.target.value.includes(' ')) {
                        const parts = e.target.value.toLowerCase().trim().split(/\s+/);
                        if (parts.length >= 2) {
                          setStuEmail(`${parts[0]}.${parts[1]}@modernclg.edu.in`);
                        }
                      }
                    }}
                    placeholder="e.g. Rahul Ramesh Shinde"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-slate-700">Student Email Address *</label>
                    {stuEmail && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${!isStuEmailValid
                          ? 'bg-amber-100 text-amber-800'
                          : isStuEmailTaken
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                          }`}
                      >
                        {!isStuEmailValid
                          ? 'Invalid Format'
                          : isStuEmailTaken
                            ? 'Already Taken'
                            : 'Verified Email ✓'}
                      </span>
                    )}
                  </div>
                  <input
                    type="email"
                    required
                    value={stuEmail}
                    onChange={(e) => setStuEmail(e.target.value)}
                    placeholder="rahul.shinde@modernclg.edu.in"
                    className={`w-full px-3 py-2 bg-slate-50 border rounded-xl focus:ring-2 focus:outline-none font-medium ${stuEmail
                      ? !isStuEmailValid || isStuEmailTaken
                        ? 'border-rose-400 focus:ring-rose-500'
                        : 'border-emerald-400 focus:ring-emerald-500'
                      : 'border-slate-200 focus:ring-blue-600'
                      }`}
                  />
                  {stuEmail && !isStuEmailValid && (
                    <p className="text-[10px] text-amber-600 font-semibold mt-1">
                      ⚠️ Please enter a valid email format (e.g. name@gmail.com).
                    </p>
                  )}
                  {stuEmail && isStuEmailTaken && (
                    <p className="text-[10px] text-rose-600 font-semibold mt-1">
                      ❌ This email is already registered for an existing student.
                    </p>
                  )}
                  {stuEmail && isStuEmailValid && !isStuEmailTaken && (
                    <p className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Email verified: login credentials will be delivered to this inbox.
                    </p>
                  )}
                </div>
              </div>

              {/* Mobile Contact & Class */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mobile Contact Number *</label>
                  <input
                    type="tel"
                    required
                    value={stuPhone}
                    onChange={(e) => setStuPhone(e.target.value)}
                    placeholder="+91 98230 44556"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Class / Academic Year *</label>
                  <select
                    value={stuClassYear}
                    onChange={(e) => setStuClassYear(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none font-semibold text-slate-800"
                  >
                    <option value="First Year (FY)">First Year (FY)</option>
                    <option value="Second Year (SY)">Second Year (SY)</option>
                    <option value="Third Year (TY)">Third Year (TY)</option>
                    <option value="Postgraduate (PG)">Postgraduate (PG)</option>
                  </select>
                </div>
              </div>

              {/* Course & Semester & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Enrolled Course *</label>
                  <select
                    value={stuCourse}
                    onChange={(e) => setStuCourse(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none font-semibold"
                  >
                    <option value="B.Sc Computer Science">B.Sc Computer Science</option>
                    <option value="B.Sc Information Technology">B.Sc IT</option>
                    <option value="Bachelor of Computer Applications (BCA)">BCA</option>
                    <option value="M.Sc Computer Science">M.Sc Computer Science</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Semester *</label>
                  <select
                    value={stuSemester}
                    onChange={(e) => setStuSemester(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none font-semibold"
                  >
                    <option value="Semester I">Semester I</option>
                    <option value="Semester II">Semester II</option>
                    <option value="Semester III">Semester III</option>
                    <option value="Semester IV">Semester IV</option>
                    <option value="Semester V">Semester V</option>
                    <option value="Semester VI">Semester VI</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Department / Faculty *</label>
                  <select
                    value={stuDept}
                    onChange={(e) => setStuDept(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none font-semibold"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Computer Applications">Computer Applications</option>
                    <option value="Data Science & AI">Data Science &amp; AI</option>
                  </select>
                </div>
              </div>

              {/* Faculty Mentor & Roll No */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Faculty Mentor / In-Charge</label>
                  <select
                    value={stuFacultyMentor}
                    onChange={(e) => setStuFacultyMentor(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none font-semibold"
                  >
                    <option value="Prof. Rajesh Kulkarni (HOD)">Prof. Rajesh Kulkarni (HOD)</option>
                    <option value="Dr. A. P. Patil">Dr. A. P. Patil</option>
                    <option value="Prof. Sneha Deshmukh">Prof. Sneha Deshmukh</option>
                    <option value="Prof. Vikas Joshi">Prof. Vikas Joshi</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Assigned Roll Number</label>
                  <input
                    type="text"
                    value={stuRollNo}
                    onChange={(e) => setStuRollNo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* University PRN & Random Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">University PRN Number</label>
                  <input
                    type="text"
                    value={stuPrn}
                    onChange={(e) => setStuPrn(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-slate-700">Randomly Generated Password</label>
                    <button
                      type="button"
                      onClick={() => setStuPassword(generateRandomStudentPassword())}
                      className="text-[10px] text-blue-600 hover:text-blue-800 font-bold underline"
                    >
                      🎲 Re-roll Random
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={stuPassword}
                      className="w-full px-3 py-2 bg-amber-50/60 border border-amber-300 rounded-xl font-mono text-blue-950 font-black tracking-wider focus:outline-none cursor-default"
                    />
                    <Key className="w-3.5 h-3.5 absolute right-3 top-2.5 text-amber-600" />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Auto-generated secure password (will be emailed to student)
                  </p>
                </div>
              </div>

              {/* Email Dispatch Notice */}
              <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl flex items-center space-x-2.5 text-[11px] text-blue-950 font-medium">
                <Send className="w-4 h-4 text-blue-700 flex-shrink-0" />
                <span>
                  <strong>Automated Dispatch:</strong> Submitting will create the live student profile and dispatch official login credentials (Email, PRN, Roll No &amp; Random Password) directly to <strong>{stuEmail || 'the student email'}</strong>.
                </span>
              </div>

              <div className="pt-2 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdmissionModal(false)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-semibold text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isStuEmailValid || isStuEmailTaken || isSubmittingStu}
                  className="w-full sm:w-auto px-5 py-2 rounded-xl text-white bg-blue-600 hover:bg-blue-700 font-bold shadow-md flex items-center justify-center space-x-1.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    {isSubmittingStu ? 'Registering & Dispatching Email...' : 'Complete Admission & Dispatch Credentials'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD FACULTY MEMBER */}
      {showFacultyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <CollegeLogo size={40} />
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Faculty Member Onboarding &amp; Credentials
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Register new faculty, assign academic workload, and send institutional login.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFacultyModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFacultySubmit} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Faculty Full Name *</label>
                  <input
                    type="text"
                    required
                    value={facName}
                    onChange={(e) => {
                      setFacName(e.target.value);
                      if (!facEmail && e.target.value.includes(' ')) {
                        const parts = e.target.value.toLowerCase().split(' ');
                        setFacEmail(`${parts[0]}.${parts[1]}@modernclg.edu.in`);
                      }
                    }}
                    placeholder="e.g. Dr. Snehal Joshi"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Faculty Email Address *</label>
                  <input
                    type="email"
                    required
                    value={facEmail}
                    onChange={(e) => setFacEmail(e.target.value)}
                    placeholder="snehal.joshi@modernclg.edu.in"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Employee ID</label>
                  <input
                    type="text"
                    value={facEmpId}
                    onChange={(e) => setFacEmpId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Department</label>
                  <select
                    value={facDept}
                    onChange={(e) => setFacDept(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Computer Applications">Computer Applications</option>
                    <option value="Data Science & AI">Data Science &amp; AI</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Designation</label>
                  <select
                    value={facDesignation}
                    onChange={(e) => setFacDesignation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor & HOD">HOD</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Qualification</label>
                  <input
                    type="text"
                    value={facQual}
                    onChange={(e) => setFacQual(e.target.value)}
                    placeholder="Ph.D, M.Tech, NET/SET"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Weekly Workload (Hours)</label>
                  <input
                    type="number"
                    value={facWorkload}
                    onChange={(e) => setFacWorkload(Number(e.target.value))}
                    min={4}
                    max={30}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Assigned Subjects (comma separated)</label>
                <input
                  type="text"
                  value={facSubjects}
                  onChange={(e) => setFacSubjects(e.target.value)}
                  placeholder="Data Structures, Operating Systems"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Class Teacher Assignment</label>
                <select
                  value={facClassTeacher}
                  onChange={(e) => setFacClassTeacher(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium"
                >
                  <option value="None">None / General Faculty</option>
                  <option value="TY B.Sc Computer Science">TY B.Sc Computer Science</option>
                  <option value="SY B.Sc Computer Science">SY B.Sc Computer Science</option>
                  <option value="FY B.Sc Computer Science">FY B.Sc Computer Science</option>
                  <option value="TY B.Sc IT">TY B.Sc IT</option>
                  <option value="SY B.Sc IT">SY B.Sc IT</option>
                  <option value="FY B.Sc IT">FY B.Sc IT</option>
                  <option value="BCA - TY">BCA - TY</option>
                  <option value="BCA - SY">BCA - SY</option>
                  <option value="M.Sc Computer Science - Part I">M.Sc Computer Science - Part I</option>
                  <option value="M.Sc Computer Science - Part II">M.Sc Computer Science - Part II</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Temporary Password</label>
                <div className="relative">
                  <input
                    type="text"
                    value={facPassword}
                    onChange={(e) => setFacPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-blue-900 font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                  <Key className="w-3.5 h-3.5 absolute right-3 top-2.5 text-slate-400" />
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center space-x-2 text-[11px] text-blue-900 font-medium">
                <Send className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>
                  Faculty credentials and departmental timetable access link will be dispatched to this email.
                </span>
              </div>

              <div className="pt-2 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowFacultyModal(false)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-semibold text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingFac}
                  className="w-full sm:w-auto px-5 py-2 rounded-xl text-white bg-blue-600 hover:bg-blue-700 font-bold shadow-md flex items-center justify-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isSubmittingFac ? 'Onboarding...' : 'Onboard Faculty & Dispatch Email'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Success Notification Toast */}
      {toastNotification && toastNotification.show && (
        <div className="fixed top-6 right-6 z-50 max-w-sm w-full bg-slate-900 border border-emerald-500/40 shadow-2xl rounded-2xl p-4 text-white flex items-start space-x-3 animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex-1 pr-1">
            <h4 className="font-bold text-xs text-emerald-400">{toastNotification.title}</h4>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{toastNotification.message}</p>
            {latestDispatch?.qrDataUrl && (
              <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowQrModal(true)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all active:scale-95"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>View &amp; Print QR Pass</span>
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => setToastNotification(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MODAL 3: VIEW & PRINT DIGITAL QR PASS MODAL */}
      {showQrModal && latestDispatch && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <CollegeLogo size={36} />
                <div className="text-left">
                  <h4 className="font-extrabold text-xs text-slate-900 uppercase">Modern College</h4>
                  <p className="text-[10px] text-blue-600 font-semibold">Digital Admission Pass</p>
                </div>
              </div>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="p-3.5 bg-gradient-to-r from-blue-900 via-blue-950 to-indigo-950 text-white rounded-2xl">
                <h3 className="font-extrabold text-sm">{latestDispatch.recipientName}</h3>
                <p className="text-[11px] text-blue-300 mt-0.5">{latestDispatch.courseOrDesignation}</p>
                <p className="text-[10px] font-mono text-slate-400 mt-1">PRN / ID: {latestDispatch.identifier}</p>
              </div>

              {latestDispatch.qrDataUrl ? (
                <div className="p-3 bg-white border-2 border-dashed border-blue-300 rounded-2xl inline-block shadow-sm">
                  <img
                    src={latestDispatch.qrDataUrl}
                    alt="Admission QR Pass"
                    className="w-48 h-48 mx-auto rounded-xl"
                  />
                </div>
              ) : (
                <p className="text-xs text-slate-400">QR Code generating...</p>
              )}

              <p className="text-[11px] text-slate-500 font-medium">
                📷 Scan with smartphone camera for 1-tap instant campus login.
              </p>

              <div className="pt-2 flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm active:scale-95"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
                {latestDispatch.qrDataUrl && (
                  <a
                    href={latestDispatch.qrDataUrl}
                    download={`Modern_College_QR_Pass_${latestDispatch.identifier}.png`}
                    className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Save PNG</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: PUBLISH NOTICE MODAL */}
      {showNoticeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Publish Campus Circular</h3>
                  <p className="text-[11px] text-slate-500">Broadcasts in real-time to student and faculty apps</p>
                </div>
              </div>
              <button
                onClick={() => setShowNoticeModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublishNotice} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Circular Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Winter 2025 Semester Exam Hall Tickets Released"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={noticeCategory}
                    onChange={(e: any) => setNoticeCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-semibold"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Exam">Exam</option>
                    <option value="General">General</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Audience</label>
                  <select
                    value={noticeTargetRole}
                    onChange={(e: any) => setNoticeTargetRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-semibold"
                  >
                    <option value="all">All (Students &amp; Faculty)</option>
                    <option value="students">Students Only</option>
                    <option value="faculty">Faculty Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Circular Content / Notice Body</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Enter complete notification details, instructions, and dates..."
                  value={noticeContent}
                  onChange={(e) => setNoticeContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium resize-none"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNoticeModal(false)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-semibold text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNotice}
                  className="w-full sm:w-auto px-5 py-2 rounded-xl text-white bg-blue-600 hover:bg-blue-700 font-bold shadow-md flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmittingNotice ? 'Publishing Live...' : 'Publish Circular'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: CREATE EVENT MODAL */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Create Campus Event</h3>
                  <p className="text-[11px] text-slate-500">Publish symposiums, hackathons &amp; cultural fests</p>
                </div>
              </div>
              <button
                onClick={() => setShowEventModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tech Fest 2025: National Symposium"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Subtitle / Tagline</label>
                <input
                  type="text"
                  placeholder="e.g. National Level Coding Competition &amp; Web Hackathon"
                  value={eventSubtitle}
                  onChange={(e) => setEventSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="text"
                    placeholder="e.g. 15-16 Dec 2025"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Venue</label>
                  <input
                    type="text"
                    placeholder="e.g. Main Auditorium / Lab 3"
                    value={eventVenue}
                    onChange={(e) => setEventVenue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Banner Image URL</label>
                <input
                  type="text"
                  value={eventBanner}
                  onChange={(e) => setEventBanner(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono text-[11px]"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-semibold text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEvent}
                  className="w-full sm:w-auto px-5 py-2 rounded-xl text-white bg-purple-600 hover:bg-purple-700 font-bold shadow-md flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isSubmittingEvent ? 'Saving Live...' : 'Publish Event'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: ENTER / PUBLISH STUDENT MARKS MODAL */}
      {showResultModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Enter &amp; Publish Student Marks</h3>
                  <p className="text-[11px] text-slate-500">Live gradebook computation synced to student mobile app</p>
                </div>
              </div>
              <button
                onClick={() => setShowResultModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublishResult} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Select Enrolled Student</label>
                  <select
                    value={resStudentId}
                    onChange={(e) => setResStudentId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-semibold"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.rollNo})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Semester</label>
                  <select
                    value={resSemester}
                    onChange={(e) => setResSemester(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-semibold"
                  >
                    <option value="Semester I">Semester I</option>
                    <option value="Semester II">Semester II</option>
                    <option value="Semester III">Semester III</option>
                    <option value="Semester IV">Semester IV</option>
                    <option value="Semester V">Semester V</option>
                    <option value="Semester VI">Semester VI</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-2">Subject Marks (Max 100 Each)</label>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-slate-50 rounded-xl">
                    <span className="font-semibold text-slate-700">Data Structures &amp; Algorithms:</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={m1}
                      onChange={(e) => setM1(Number(e.target.value))}
                      className="w-20 px-2 py-1 text-center font-bold bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-50 rounded-xl">
                    <span className="font-semibold text-slate-700">Operating Systems:</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={m2}
                      onChange={(e) => setM2(Number(e.target.value))}
                      className="w-20 px-2 py-1 text-center font-bold bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-50 rounded-xl">
                    <span className="font-semibold text-slate-700">Database Management Systems:</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={m3}
                      onChange={(e) => setM3(Number(e.target.value))}
                      className="w-20 px-2 py-1 text-center font-bold bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-50 rounded-xl">
                    <span className="font-semibold text-slate-700">Advanced Web Technologies:</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={m4}
                      onChange={(e) => setM4(Number(e.target.value))}
                      className="w-20 px-2 py-1 text-center font-bold bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-50 rounded-xl">
                    <span className="font-semibold text-slate-700">Computer Networks &amp; Security:</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={m5}
                      onChange={(e) => setM5(Number(e.target.value))}
                      className="w-20 px-2 py-1 text-center font-bold bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Live Computed Summary */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex justify-between items-center">
                <span className="font-bold text-amber-950">Calculated Overall:</span>
                <span className="font-black text-amber-900 text-sm">
                  {Math.round(((Number(m1) + Number(m2) + Number(m3) + Number(m4) + Number(m5)) / 500) * 100)}%
                </span>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowResultModal(false)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-semibold text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingResult}
                  className="w-full sm:w-auto px-5 py-2 rounded-xl text-white bg-amber-600 hover:bg-amber-700 font-bold shadow-md flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  <Award className="w-4 h-4" />
                  <span>{isSubmittingResult ? 'Publishing...' : 'Publish Result'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 7: UPDATE ATTENDANCE MODAL */}
      {showAttendanceModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Update Student Attendance</h3>
                  <p className="text-[11px] text-slate-500">Live attendance percentage update</p>
                </div>
              </div>
              <button
                onClick={() => setShowAttendanceModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateAttendance} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Student</label>
                <select
                  value={attStudentId}
                  onChange={(e) => setAttStudentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-semibold"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.rollNo})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1">
                  <span>Attendance Rate (%):</span>
                  <span className="text-emerald-700 font-extrabold">{attPct}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={attPct}
                  onChange={(e) => setAttPct(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAttendanceModal(false)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-semibold text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAtt}
                  className="w-full sm:w-auto px-5 py-2 rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 font-bold shadow-md flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSubmittingAtt ? 'Saving...' : 'Save Attendance'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 8: UPLOAD STUDY MATERIAL MODAL */}
      {showMaterialModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold">
                  <FolderDown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Upload Study Material</h3>
                  <p className="text-[11px] text-slate-500">Add notes, past papers or reference materials</p>
                </div>
              </div>
              <button
                onClick={() => setShowMaterialModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadMaterial} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit 3 - Binary Trees and Graph Algorithms"
                  value={matTitle}
                  onChange={(e) => setMatTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Data Structures"
                    value={matSubject}
                    onChange={(e) => setMatSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={matCategory}
                    onChange={(e: any) => setMatCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-semibold"
                  >
                    <option value="Notes">Notes</option>
                    <option value="Papers">Papers</option>
                    <option value="Books">Books</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">File Size</label>
                <input
                  type="text"
                  placeholder="e.g. 2.5 MB"
                  value={matFileSize}
                  onChange={(e) => setMatFileSize(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowMaterialModal(false)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-semibold text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingMat}
                  className="w-full sm:w-auto px-5 py-2 rounded-xl text-white bg-blue-600 hover:bg-blue-700 font-bold shadow-md flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  <FolderDown className="w-4 h-4" />
                  <span>{isSubmittingMat ? 'Uploading...' : 'Save Document'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 9: EDIT STUDENT MODAL (CRUD: UPDATE) */}
      {showEditStudentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-start pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Edit Student Record
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Update student academic details, contact information, and enrollment status.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEditStudentModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStudentSubmit} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mobile Contact *</label>
                  <input
                    type="tel"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Enrollment Status</label>
                  <select
                    value={editStatus}
                    onChange={(e: any) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none font-semibold text-slate-800"
                  >
                    <option value="Active">Active</option>
                    <option value="Alumni">Alumni</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Enrolled Course *</label>
                  <select
                    value={editCourse}
                    onChange={(e) => setEditCourse(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none font-semibold"
                  >
                    <option value="B.Sc Computer Science">B.Sc Computer Science</option>
                    <option value="B.Sc Information Technology">B.Sc IT</option>
                    <option value="Bachelor of Computer Applications (BCA)">BCA</option>
                    <option value="M.Sc Computer Science">M.Sc Computer Science</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Semester *</label>
                  <select
                    value={editSemester}
                    onChange={(e) => setEditSemester(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none font-semibold"
                  >
                    <option value="Semester I">Semester I</option>
                    <option value="Semester II">Semester II</option>
                    <option value="Semester III">Semester III</option>
                    <option value="Semester IV">Semester IV</option>
                    <option value="Semester V">Semester V</option>
                    <option value="Semester VI">Semester VI</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Department *</label>
                  <select
                    value={editDept}
                    onChange={(e) => setEditDept(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none font-semibold"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Computer Applications">Computer Applications</option>
                    <option value="Data Science & AI">Data Science &amp; AI</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Roll Number</label>
                  <input
                    type="text"
                    value={editRollNo}
                    onChange={(e) => setEditRollNo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">University PRN Number</label>
                  <input
                    type="text"
                    value={editPrn}
                    onChange={(e) => setEditPrn(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditStudentModal(false)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-semibold text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingStudent}
                  className="w-full sm:w-auto px-5 py-2 rounded-xl text-white bg-blue-600 hover:bg-blue-700 font-bold shadow-md flex items-center justify-center space-x-1.5 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isUpdatingStudent ? 'Saving Updates...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 10: VIEW STUDENT DOSSIER MODAL (CRUD: READ) */}
      {showViewStudentModal && viewingStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-start pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <CollegeLogo size={42} />
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Student Institutional Dossier
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Swami Ramanand Teerth Marathwada University Affiliated
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowViewStudentModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* Profile Card */}
              <div className="p-4 bg-gradient-to-r from-blue-900 via-blue-950 to-indigo-950 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-black text-base">{viewingStudent.name}</h4>
                  <p className="text-blue-200 text-xs mt-0.5">{viewingStudent.course} • {viewingStudent.semester}</p>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 text-[11px] text-blue-300 font-mono">
                    <span>Roll: <strong>{viewingStudent.rollNo}</strong></span>
                    <span>•</span>
                    <span>PRN: <strong>{viewingStudent.prn}</strong></span>
                  </div>
                </div>
                <span
                  className={`self-start sm:self-center text-[10px] font-bold px-3 py-1 rounded-full ${viewingStudent.status === 'Active'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-400/40'
                    }`}
                >
                  {viewingStudent.status}
                </span>
              </div>

              {/* Details Grid */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-semibold">Registered Email:</span>
                  <span className="font-bold text-slate-900">{viewingStudent.email}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-semibold">Mobile Number:</span>
                  <span className="font-bold text-slate-900">{viewingStudent.phone}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-semibold">Department:</span>
                  <span className="font-bold text-slate-900">{viewingStudent.department}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-semibold">Admission Date:</span>
                  <span className="font-bold text-slate-900">{viewingStudent.admissionDate}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-semibold">System Record ID:</span>
                  <span className="font-mono text-slate-600">{viewingStudent.id}</span>
                </div>
              </div>

              {/* Verification Documents */}
              <div>
                <h5 className="font-bold text-xs text-slate-800 mb-2">Verified Admission Documents</h5>
                <div className="space-y-1.5">
                  {viewingStudent.documents && viewingStudent.documents.length > 0 ? (
                    viewingStudent.documents.map((doc: { name: string; type: string; uploadedAt?: string }, i: number) => (
                      <div key={i} className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                            {doc.type}
                          </span>
                          <span className="font-semibold text-slate-800">{doc.name}</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Verified
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 text-center py-2">No documents attached.</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowViewStudentModal(false)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-semibold text-center"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowViewStudentModal(false);
                    handleOpenEditStudent(viewingStudent);
                  }}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl text-white bg-blue-600 hover:bg-blue-700 font-bold flex items-center justify-center space-x-1.5 shadow-sm"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT FACULTY & ASSIGN ACADEMIC DUTIES (CLASS TEACHER & SUBJECTS) */}
      {showEditFacultyModal && editingFaculty && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20 font-bold">
                  <BookOpen className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Assign Academic Duties &amp; Edit Faculty
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Assign Class Teacher role and subjects for {editingFaculty.name} (Realtime Cloud Sync)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEditFacultyModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditFaculty} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Faculty Name *</label>
                  <input
                    type="text"
                    required
                    value={editFacName}
                    onChange={(e) => setEditFacName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Employee ID</label>
                  <input
                    type="text"
                    required
                    value={editFacEmpId}
                    onChange={(e) => setEditFacEmpId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Department</label>
                  <select
                    value={editFacDept}
                    onChange={(e) => setEditFacDept(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Computer Applications">Computer Applications</option>
                    <option value="Data Science & AI">Data Science &amp; AI</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Designation</label>
                  <select
                    value={editFacDesignation}
                    onChange={(e) => setEditFacDesignation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor & HOD">HOD / Department Head</option>
                  </select>
                </div>
              </div>

              {/* CLASS TEACHER ASSIGNMENT */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-1.5">
                <label className="font-bold text-amber-900 block flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Class Teacher Appointment</span>
                </label>
                <select
                  value={editFacClassTeacher}
                  onChange={(e) => setEditFacClassTeacher(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-amber-300 rounded-xl font-bold text-amber-950 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="None">None (No Class Teacher duty assigned)</option>
                  <option value="TY B.Sc Computer Science">TY B.Sc Computer Science</option>
                  <option value="SY B.Sc Computer Science">SY B.Sc Computer Science</option>
                  <option value="FY B.Sc Computer Science">FY B.Sc Computer Science</option>
                  <option value="TY B.Sc IT">TY B.Sc IT</option>
                  <option value="SY B.Sc IT">SY B.Sc IT</option>
                  <option value="FY B.Sc IT">FY B.Sc IT</option>
                  <option value="BCA - TY">BCA - TY</option>
                  <option value="BCA - SY">BCA - SY</option>
                  <option value="BCA - FY">BCA - FY</option>
                  <option value="M.Sc Computer Science - Part I">M.Sc Computer Science - Part I</option>
                  <option value="M.Sc Computer Science - Part II">M.Sc Computer Science - Part II</option>
                </select>
                <p className="text-[10px] text-amber-700">
                  Appointing this teacher will display their Class Teacher badge across their mobile app and campus portal.
                </p>
              </div>

              {/* ASSIGNED SUBJECTS */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 block">
                  Assigned Teaching Subjects
                </label>
                <input
                  type="text"
                  value={editFacSubjects}
                  onChange={(e) => setEditFacSubjects(e.target.value)}
                  placeholder="e.g. Data Structures, Web Technology, Python"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 font-semibold self-center mr-1">Quick Add:</span>
                  {[
                    'Data Structures & Algorithms',
                    'Database Management Systems',
                    'Web Technology & Frameworks',
                    'Python Programming',
                    'Operating Systems',
                    'Software Engineering',
                    'Computer Networks',
                    'Cloud Computing',
                  ].map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => {
                        const current = editFacSubjects.trim();
                        if (!current) {
                          setEditFacSubjects(sub);
                        } else if (!current.toLowerCase().includes(sub.toLowerCase())) {
                          setEditFacSubjects(`${current}, ${sub}`);
                        }
                      }}
                      className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 text-[10px] font-medium transition-colors"
                    >
                      + {sub}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editFacPhone}
                    onChange={(e) => setEditFacPhone(e.target.value)}
                    placeholder="+91 94220 12345"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Weekly Workload (Hours)</label>
                  <input
                    type="number"
                    value={editFacWorkload}
                    onChange={(e) => setEditFacWorkload(Number(e.target.value))}
                    min={4}
                    max={36}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditFacultyModal(false)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-semibold text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEditFaculty}
                  className="w-full sm:w-auto px-5 py-2 rounded-xl text-white bg-blue-600 hover:bg-blue-700 font-bold shadow-md flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSavingEditFaculty ? 'Saving Realtime...' : 'Save Academic Assignments'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ALLOCATE NEW TIMETABLE SLOT */}
      {showTimetableModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center border border-blue-500/20 font-bold">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Allocate Master Timetable Slot
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Assign day, subject, faculty, class, and classroom in realtime.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTimetableModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSlot} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Day of Week *</label>
                  <select
                    value={slotDay}
                    onChange={(e: any) => setSlotDay(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-blue-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="Mon">Monday</option>
                    <option value="Tue">Tuesday</option>
                    <option value="Wed">Wednesday</option>
                    <option value="Thu">Thursday</option>
                    <option value="Fri">Friday</option>
                    <option value="Sat">Saturday</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Assigned Faculty Member *</label>
                  <select
                    value={slotFaculty}
                    onChange={(e) => setSlotFaculty(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    {facultyList.map((f) => (
                      <option key={f.id} value={f.name}>
                        {f.name} ({f.department})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Subject Name *</label>
                  <input
                    type="text"
                    required
                    value={slotSubject}
                    onChange={(e) => setSlotSubject(e.target.value)}
                    placeholder="e.g. Data Structures & Algorithms"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Subject Code</label>
                  <input
                    type="text"
                    value={slotCode}
                    onChange={(e) => setSlotCode(e.target.value)}
                    placeholder="e.g. CS-301"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Course / Program</label>
                  <select
                    value={slotCourse}
                    onChange={(e) => setSlotCourse(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium"
                  >
                    <option value="B.Sc Computer Science">B.Sc Computer Science</option>
                    <option value="B.Sc Information Technology">B.Sc Information Technology</option>
                    <option value="BCA">BCA (Bachelor of Computer Applications)</option>
                    <option value="M.Sc Computer Science">M.Sc Computer Science</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Semester / Year</label>
                  <select
                    value={slotSemester}
                    onChange={(e) => setSlotSemester(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium"
                  >
                    <option value="Semester I (FY)">Semester I (FY)</option>
                    <option value="Semester II (FY)">Semester II (FY)</option>
                    <option value="Semester III (SY)">Semester III (SY)</option>
                    <option value="Semester IV (SY)">Semester IV (SY)</option>
                    <option value="Semester V (TY)">Semester V (TY)</option>
                    <option value="Semester VI (TY)">Semester VI (TY)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Start Time</label>
                  <input
                    type="text"
                    value={slotStartTime}
                    onChange={(e) => setSlotStartTime(e.target.value)}
                    placeholder="09:00 AM"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">End Time</label>
                  <input
                    type="text"
                    value={slotEndTime}
                    onChange={(e) => setSlotEndTime(e.target.value)}
                    placeholder="10:00 AM"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Room / Lab</label>
                  <input
                    type="text"
                    value={slotRoom}
                    onChange={(e) => setSlotRoom(e.target.value)}
                    placeholder="Hall 105"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Session Type</label>
                  <select
                    value={slotType}
                    onChange={(e: any) => setSlotType(e.target.value)}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="Lecture">Lecture</option>
                    <option value="Lab">Lab</option>
                    <option value="Tutorial">Tutorial</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={slotCategory}
                    onChange={(e: any) => setSlotCategory(e.target.value)}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="CS">CS</option>
                    <option value="IT">IT</option>
                    <option value="MATH">MATH</option>
                    <option value="ELEC">ELEC</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTimetableModal(false)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-semibold text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSlot}
                  className="w-full sm:w-auto px-5 py-2 rounded-xl text-white bg-blue-600 hover:bg-blue-700 font-bold shadow-md flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isSubmittingSlot ? 'Allocating...' : 'Allocate Slot in Realtime'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
