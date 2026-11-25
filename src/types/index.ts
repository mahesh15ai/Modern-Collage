export type UserRole = 'student' | 'faculty' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  department?: string;
  // Student specific
  rollNo?: string;
  prn?: string;
  course?: string;
  semester?: string;
  batch?: string;
  bloodGroup?: string;
  address?: string;
  emergencyContact?: string;
  dob?: string;
  validUpto?: string;
  // Faculty specific
  designation?: string;
  workloadHours?: number;
  cabin?: string;
  employeeId?: string;
  qualification?: string;
  classTeacherOf?: string;
  subjectsAssigned?: string[];
}

// 1. Admin & College Overview
export interface CollegeStats {
  totalStudents: number;
  totalFaculty: number;
  totalDepartments: number;
  totalCourses: number;
  averageAttendance: number;
  feesCollectedPercent: number;
  pendingGrievances: number;
}

// 2. Student Management
export interface StudentRecord {
  id: string;
  name: string;
  rollNo: string;
  prn: string;
  email: string;
  phone: string;
  department: string;
  course: string;
  semester: string;
  admissionDate: string;
  status: 'Active' | 'Alumni' | 'Suspended';
  avatar?: string;
  documents: {
    name: string;
    type: string;
    uploadedAt: string;
    verified: boolean;
  }[];
  bloodGroup?: string;
  address?: string;
  emergencyContact?: string;
  dob?: string;
  validUpto?: string;
}

// 3. Faculty Management
export interface FacultyRecord {
  id: string;
  name: string;
  employeeId: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  qualification: string;
  workloadHours: number;
  subjectsAssigned: string[];
  status: 'Active' | 'On Leave';
  avatar?: string;
  classTeacherOf?: string;
  cabin?: string;
}

// 4. Department & Course
export interface Department {
  id: string;
  name: string;
  code: string;
  hod: string;
  facultyCount: number;
  studentCount: number;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  departmentId: string;
  departmentName: string;
  durationYears: number;
  totalSemesters: number;
  semesters: {
    semesterNumber: number;
    subjects: Subject[];
  }[];
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  credits: number;
  facultyName?: string;
}

// 5. Attendance Management
export interface AttendanceSummary {
  overallPercentage: number;
  totalClasses: number;
  present: number;
  absent: number;
  late: number;
  monthlyTrend: {
    month: string;
    percentage: number;
  }[];
  subjectWise: {
    subjectName: string;
    subjectCode: string;
    attended: number;
    total: number;
    percentage: number;
  }[];
}

// 6. Examination Management
export interface ExamScheduleItem {
  id: string;
  course: string;
  semester: string;
  subject: string;
  subjectCode: string;
  date: string;
  time: string;
  room: string;
  maxMarks: number;
}

// 7. Result Management
export interface SubjectMarks {
  subjectName: string;
  subjectCode: string;
  obtained: number;
  total: number;
  grade: string;
  status: 'Pass' | 'Fail';
}

export interface StudentResult {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  course: string;
  semester: string;
  overallPercentage: number;
  cgpa: number;
  grade: string;
  status: 'Distinction' | 'First Class' | 'Second Class' | 'Fail';
  subjectMarks: SubjectMarks[];
  declaredDate: string;
}

// 8. Timetable Management
export interface TimetableSlot {
  id: string;
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';
  subjectName: string;
  subjectCode: string;
  facultyName: string;
  facultyId?: string;
  course?: string;
  semester?: string;
  startTime: string;
  endTime: string;
  room: string;
  type: 'Lecture' | 'Lab' | 'Tutorial';
  category: 'CS' | 'IT' | 'MATH' | 'ELEC';
}

// 9. Assignment Management
export interface Assignment {
  id: string;
  title: string;
  subject: string;
  course: string;
  semester: string;
  assignedBy: string;
  dueDate: string;
  totalPoints: number;
  submitted: boolean;
  submittedDate?: string;
  grade?: string;
  description: string;
}

// 10. Study Materials
export interface StudyMaterial {
  id: string;
  title: string;
  subject: string;
  category: 'Notes' | 'Papers' | 'Books';
  fileSize: string;
  uploadedDate: string;
  uploadedBy: string;
  downloads: number;
  fileUrl: string;
}

// 11. Fees Management
export interface FeeHistoryItem {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  receiptNo?: string;
  paymentMode?: string;
}

export interface FeeSummary {
  pendingAmount: number;
  totalAnnualFee: number;
  paidAmount: number;
  history: FeeHistoryItem[];
}

// 12. Notice Board
export interface NoticeItem {
  id: string;
  title: string;
  content: string;
  date: string;
  category: 'Academic' | 'Exam' | 'General' | 'Urgent';
  targetRole: 'all' | 'students' | 'faculty';
  pinned?: boolean;
  isRead?: boolean;
}

// 13. Events & Activities
export interface EventRegistration {
  studentId: string;
  studentName: string;
  rollNo?: string;
  prn?: string;
  department?: string;
  course?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  registeredAt: string;
}

export interface EventItem {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  time: string;
  venue: string;
  bannerImage?: string;
  registrationOpen: boolean;
  registeredCount: number;
  description: string;
  registeredUserIds?: string[];
  registeredStudents?: EventRegistration[];
}

// Complaint / Grievance Portal
export interface ComplaintItem {
  id: string;
  title: string;
  category: 'Infrastructure' | 'Academic' | 'Hostel' | 'Other';
  date: string;
  status: 'In Progress' | 'Resolved' | 'Pending';
  description: string;
  resolvedAt?: string;
}

// 15. Realtime Academic Chat (Subject Teacher, Class Teacher & Official Class Group)
export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'student' | 'faculty';
  receiverId: string;
  receiverName: string;
  receiverRole: 'student' | 'faculty' | 'group';
  text: string;
  timestamp: string;
  subjectName?: string;
  isRead?: boolean;
  isGroupMessage?: boolean;
  groupId?: string;
}

export interface ClassGroupChannel {
  id: string;
  name: string;
  type: 'group';
  className: string;
  classTeacherId: string;
  classTeacherName: string;
  avatar?: string;
  academicYear?: string;
  description?: string;
  membersCount?: number;
}
