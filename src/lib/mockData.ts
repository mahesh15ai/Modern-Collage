import {
  UserProfile,
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
  ExamScheduleItem,
} from '@/types';

export const COLLEGE_INFO = {
  name: "Modern College of Computer Science & Information Technology, Nanded",
  shortName: "Modern College",
  tagline: "Smart Campus - Learn • Grow • Innovate",
  location: "Nanded, Maharashtra, India",
  affiliation: "Affiliated to Swami Ramanand Teerth Marathwada University (SRTMUN)",
  established: 2004,
  accreditation: "NAAC 'A' Grade Accredited",
};

export const MOCK_STUDENT_USER: UserProfile = {
  id: "STU-EMPTY",
  name: "Student",
  email: "",
  role: "student",
  rollNo: "",
  prn: "",
  department: "",
  course: "",
  semester: "",
  batch: "",
  phone: "",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
};

export const MOCK_FACULTY_USER: UserProfile = {
  id: "FAC-2024-009",
  name: "Faculty Member",
  email: "",
  role: "faculty",
  department: "Computer Science",
  designation: "Assistant Professor",
  employeeId: "FAC-2024-009",
  qualification: "M.Sc., Ph.D (Computer Science)",
  workloadHours: 16,
  cabin: "Staff Room Block A",
  phone: "+91 94220 12345",
  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
};

export const MOCK_ADMIN_USER: UserProfile = {
  id: "ADM-001",
  name: "Administrator",
  email: "",
  role: "admin",
  department: "Administration",
  designation: "Administrator",
  phone: "",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
};

// 1. College Stats (Clean State)
export const MOCK_COLLEGE_STATS: CollegeStats = {
  totalStudents: 0,
  totalFaculty: 0,
  totalDepartments: 4,
  totalCourses: 4,
  averageAttendance: 0,
  feesCollectedPercent: 0,
  pendingGrievances: 0,
};

// 2. Students List (Zero mock records)
export const MOCK_STUDENTS: StudentRecord[] = [];

// 3. Faculty List (Zero mock records)
export const MOCK_FACULTY: FacultyRecord[] = [];

// 4. Academic Departments Structure
export const MOCK_DEPARTMENTS: Department[] = [
  {
    id: "DEP-CS",
    name: "Department of Computer Science",
    code: "CS",
    hod: "Unassigned",
    facultyCount: 0,
    studentCount: 0,
  },
  {
    id: "DEP-IT",
    name: "Department of Information Technology",
    code: "IT",
    hod: "Unassigned",
    facultyCount: 0,
    studentCount: 0,
  },
  {
    id: "DEP-CA",
    name: "Department of Computer Applications (BCA/MCA)",
    code: "CA",
    hod: "Unassigned",
    facultyCount: 0,
    studentCount: 0,
  },
  {
    id: "DEP-DS",
    name: "Department of Data Science & AI",
    code: "DSAI",
    hod: "Unassigned",
    facultyCount: 0,
    studentCount: 0,
  },
];

export const MOCK_COURSES: Course[] = [
  {
    id: "CRS-BCS",
    name: "B.Sc Computer Science",
    code: "BCS",
    departmentId: "DEP-CS",
    departmentName: "Computer Science",
    durationYears: 3,
    totalSemesters: 6,
    semesters: [],
  },
  {
    id: "CRS-BIT",
    name: "B.Sc Information Technology",
    code: "BIT",
    departmentId: "DEP-IT",
    departmentName: "Information Technology",
    durationYears: 3,
    totalSemesters: 6,
    semesters: [],
  },
  {
    id: "CRS-BCA",
    name: "Bachelor of Computer Applications (BCA)",
    code: "BCA",
    departmentId: "DEP-CA",
    departmentName: "Computer Applications",
    durationYears: 3,
    totalSemesters: 6,
    semesters: [],
  },
  {
    id: "CRS-MCS",
    name: "M.Sc Computer Science",
    code: "MCS",
    departmentId: "DEP-CS",
    departmentName: "Computer Science",
    durationYears: 2,
    totalSemesters: 4,
    semesters: [],
  },
];

// 5. Attendance (Clean State - Zero mock records)
export const MOCK_ATTENDANCE: AttendanceSummary = {
  overallPercentage: 0,
  totalClasses: 0,
  present: 0,
  absent: 0,
  late: 0,
  monthlyTrend: [],
  subjectWise: [],
};

// 6. Examination Schedule (Clean State)
export const MOCK_EXAM_SCHEDULE: ExamScheduleItem[] = [];

// 7. Results (Clean State)
export const MOCK_RESULT: StudentResult = {
  id: "RES-EMPTY",
  studentId: "",
  studentName: "",
  rollNo: "",
  course: "",
  semester: "",
  overallPercentage: 0,
  cgpa: 0,
  grade: "",
  status: "First Class",
  declaredDate: "",
  subjectMarks: [],
};

// 8. Timetable (Clean State)
export const MOCK_TIMETABLE: TimetableSlot[] = [];

// 9. Assignment Management (Clean State)
export const MOCK_ASSIGNMENTS: Assignment[] = [];

// 10. Study Materials (Clean State)
export const MOCK_STUDY_MATERIALS: StudyMaterial[] = [];

// 11. Fees Details (Clean State)
export const MOCK_FEES: FeeSummary = {
  pendingAmount: 0,
  totalAnnualFee: 0,
  paidAmount: 0,
  history: [],
};

// 12. Notice Board (Clean State)
export const MOCK_NOTICES: NoticeItem[] = [];

// 13. Events & Activities (Clean State)
export const MOCK_EVENTS: EventItem[] = [];

// 14. Complaints / Grievance Portal (Clean State)
export const MOCK_COMPLAINTS: ComplaintItem[] = [];
