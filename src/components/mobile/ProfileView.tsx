'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  GraduationCap,
  CreditCard,
  Calendar,
  Phone,
  Mail,
  RotateCw,
  Printer,
  Pencil,
  X,
  Check,
  Camera,
  AlertCircle,
  FileText,
  Users,
  CornerDownLeft,
  CheckCircle2,
  Sparkles,
  Download,
  Laptop,
  LogOut,
} from 'lucide-react';
import CollegeLogo from '@/components/common/CollegeLogo';
import QRCode from 'qrcode';
import { UserProfile, StudentRecord } from '@/types';

// Preset avatar gallery
const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=240&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=240&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=240&auto=format&fit=crop&q=80',
];

export const ProfileView: React.FC = () => {
  const { currentUser, setCurrentUser, students, facultyList, updateStudent, setViewMode, logout, setRole } = useApp();

  const isFaculty = currentUser.role === 'faculty';
  const currentStudent = students.find((s) => s.id === currentUser.id) || students[0];

  // Active side: 'front' | 'back' | 'both'
  const [activeSide, setActiveSide] = useState<'front' | 'back' | 'both'>('front');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Field values for Student
  const studentName = currentUser.name || currentStudent?.name || 'Rahul Ramesh Shinde';
  const studentClass = currentUser.course || currentStudent?.course || 'B.Sc Computer Science';
  const studentYear = currentUser.semester
    ? `(${currentUser.semester})`
    : currentStudent?.semester
      ? `(${currentStudent.semester})`
      : '(First Year)';
  const studentRoll = currentUser.rollNo || currentStudent?.rollNo || 'CS-329';
  const studentDob = currentUser.dob || currentStudent?.dob || '15/08/2004';
  const studentMobile = currentUser.phone || currentStudent?.phone || '9023456789';
  const studentPrn = currentUser.prn || currentStudent?.prn || '2024015200678912';
  const studentAvatar = currentUser.avatar || PRESET_AVATARS[0];

  // Field values for Faculty
  const facultyName = currentUser.name || 'Dr. Nitish Sharma';
  const facultyDesignation = currentUser.designation || 'Assistant Professor';
  const facultyDepartment = currentUser.department || 'Computer Science';
  const facultyEmpId = currentUser.employeeId || currentUser.id || 'FAC-2024-009';
  const facultyMobile = currentUser.phone || '9422012345';
  const facultyAvatar = currentUser.avatar || PRESET_AVATARS[2];
  const facultyQualification = currentUser.qualification || 'M.Sc., Ph.D (Comp Sci)';

  // Edit form state
  const [editName, setEditName] = useState(isFaculty ? facultyName : studentName);
  const [editCourse, setEditCourse] = useState(studentClass);
  const [editYear, setEditYear] = useState(studentYear.replace(/[()]/g, ''));
  const [editRoll, setEditRoll] = useState(studentRoll);
  const [editDob, setEditDob] = useState(studentDob);
  const [editMobile, setEditMobile] = useState(isFaculty ? facultyMobile : studentMobile);
  const [editAvatar, setEditAvatar] = useState(isFaculty ? facultyAvatar : studentAvatar);
  const [editDesignation, setEditDesignation] = useState(facultyDesignation);
  const [editDepartment, setEditDepartment] = useState(facultyDepartment);
  const [editEmpId, setEditEmpId] = useState(facultyEmpId);
  const [editQualification, setEditQualification] = useState(facultyQualification);
  const [isSaving, setIsSaving] = useState(false);

  // Generate verified Attendance / Faculty QR code matching the reference
  useEffect(() => {
    let payload: string;
    if (isFaculty) {
      payload = JSON.stringify({
        college: 'MODERN_COLLEGE_NANDED',
        type: 'FACULTY_IDENTITY_PASS',
        name: facultyName,
        designation: facultyDesignation,
        department: facultyDepartment,
        employeeId: facultyEmpId,
        phone: facultyMobile,
        status: 'Active Faculty Staff',
        verified: true,
        authorizedBy: 'Principal, Modern College',
        timestamp: Date.now(),
      });
    } else {
      payload = JSON.stringify({
        college: 'MODERN_COLLEGE_NANDED',
        type: 'CAMPUS_ATTENDANCE_PASS',
        name: studentName,
        class: `${studentClass} ${studentYear}`,
        rollNo: studentRoll,
        dob: studentDob,
        mobile: studentMobile,
        prn: studentPrn,
        verified: true,
        timestamp: Date.now(),
      });
    }

    QRCode.toDataURL(payload, {
      width: 340,
      margin: 1,
      color: {
        dark: '#0a1d37',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR code generation error:', err));
  }, [
    isFaculty,
    facultyName,
    facultyDesignation,
    facultyDepartment,
    facultyEmpId,
    facultyMobile,
    studentName,
    studentClass,
    studentYear,
    studentRoll,
    studentDob,
    studentMobile,
    studentPrn,
  ]);

  // Handle open edit modal
  const handleOpenEdit = () => {
    if (isFaculty) {
      setEditName(facultyName);
      setEditDesignation(facultyDesignation);
      setEditDepartment(facultyDepartment);
      setEditEmpId(facultyEmpId);
      setEditMobile(facultyMobile);
      setEditQualification(facultyQualification);
      setEditAvatar(facultyAvatar);
    } else {
      setEditName(studentName);
      setEditCourse(studentClass);
      setEditYear(studentYear.replace(/[()]/g, ''));
      setEditRoll(studentRoll);
      setEditDob(studentDob);
      setEditMobile(studentMobile);
      setEditAvatar(studentAvatar);
    }
    setShowEditModal(true);
  };

  // Save profile edits
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (isFaculty) {
        const updatedUser: UserProfile = {
          ...currentUser,
          name: editName.trim(),
          designation: editDesignation.trim(),
          department: editDepartment.trim(),
          employeeId: editEmpId.trim(),
          phone: editMobile.trim(),
          qualification: editQualification.trim(),
          avatar: editAvatar,
        };
        setCurrentUser(updatedUser);
        setShowEditModal(false);
        setToastMessage('Faculty ID Card updated successfully! ✓');
      } else {
        const updatedUser: UserProfile = {
          ...currentUser,
          name: editName.trim(),
          course: editCourse.trim(),
          semester: editYear.trim(),
          rollNo: editRoll.trim(),
          dob: editDob.trim(),
          phone: editMobile.trim(),
          avatar: editAvatar,
        };
        setCurrentUser(updatedUser);

        if (currentStudent && updateStudent) {
          const updatedStudentRecord: StudentRecord = {
            ...currentStudent,
            name: editName.trim(),
            course: editCourse.trim(),
            semester: editYear.trim(),
            rollNo: editRoll.trim(),
            dob: editDob.trim(),
            phone: editMobile.trim(),
          };
          await updateStudent(updatedStudentRecord);
        }

        setShowEditModal(false);
        setToastMessage('Student ID Card updated successfully! ✓');
      }
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full min-h-full p-3 sm:p-4 space-y-4 font-sans text-slate-900 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center space-x-2 text-xs font-bold animate-in fade-in slide-in-from-top-3 max-w-sm w-full mx-auto">
          <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <div>
          <h2 className="font-black text-base sm:text-lg text-slate-900 tracking-tight flex items-center space-x-1.5">
            <span>{isFaculty ? 'Faculty Identity Card' : 'Student Identity Card'}</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </h2>
          <p className="text-[11px] text-slate-500">
            {isFaculty
              ? 'Official Campus Faculty & Staff ID with Verification QR'
              : 'Official Campus ID with Attendance Verification QR'}
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={handleOpenEdit}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-sm transition-all active:scale-95"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-sm transition-all active:scale-95"
            title="Print Official ID Card Slip"
          >
            <Printer className="w-3.5 h-3.5 text-amber-300" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Side Switcher Tab Pills */}
      <div className="flex items-center bg-slate-200/80 p-1 rounded-2xl text-xs font-bold">
        <button
          onClick={() => setActiveSide('front')}
          className={`flex-1 py-1.5 rounded-xl transition-all ${activeSide === 'front'
              ? 'bg-white text-blue-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
            }`}
        >
          🪪 Front Side
        </button>
        <button
          onClick={() => setActiveSide('back')}
          className={`flex-1 py-1.5 rounded-xl transition-all ${activeSide === 'back'
              ? 'bg-white text-blue-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
            }`}
        >
          🔄 Back Side
        </button>
        <button
          onClick={() => setActiveSide('both')}
          className={`flex-1 py-1.5 rounded-xl transition-all ${activeSide === 'both'
              ? 'bg-white text-blue-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
            }`}
        >
          📑 Both Sides
        </button>
      </div>

      {/* =========================================================================
          ID CARDS CONTAINER (Matching user reference layout precisely)
         ========================================================================= */}
      <div className="space-y-4">
        {/* FRONT CARD (Shown on 'front' or 'both') */}
        {(activeSide === 'front' || activeSide === 'both') && (
          <div className="relative w-full max-w-[500px] mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden text-slate-900 select-none">
            {/* Top Navy Header Banner with Gold Swoosh */}
            <div className="relative bg-[#071D3A] text-white pt-3 pb-2.5 px-3 sm:px-4 overflow-hidden">
              {/* Golden Wave Graphic across right corner */}
              <svg
                className="absolute top-0 right-0 h-full w-28 sm:w-36 pointer-events-none"
                viewBox="0 0 140 70"
                preserveAspectRatio="none"
              >
                <path
                  d="M 0 0 C 45 40 85 55 140 25 L 140 70 L 140 0 Z"
                  fill="#E5A93B"
                />
                <path
                  d="M 12 0 C 50 35 90 48 140 20 L 140 0 Z"
                  fill="#071D3A"
                />
                <path
                  d="M 0 0 C 45 40 85 55 140 25 L 140 38 C 85 68 45 52 0 0 Z"
                  fill="#F5B945"
                />
              </svg>

              <div className="relative z-10 flex items-center space-x-2.5 sm:space-x-3">
                {/* College Logo in White Circular Badge */}
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white p-1 flex items-center justify-center shrink-0 shadow-md">
                  <CollegeLogo size={36} />
                </div>

                {/* Vertical Divider Line */}
                <div className="w-[1.5px] h-9 bg-white/40 shrink-0" />

                {/* College Title & Affiliation */}
                <div className="flex-1">
                  <h3 className="font-black text-sm sm:text-base tracking-wider text-white uppercase leading-tight font-sans">
                    MODERN COLLEGE
                  </h3>
                  <p className="text-[10px] sm:text-[11px] font-semibold text-white/95 leading-tight">
                    Computer Science &amp; IT, Nanded
                  </p>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <span className="w-6 h-[1px] bg-white/60 inline-block" />
                    <span className="text-[8px] sm:text-[9px] font-bold text-white/90 uppercase tracking-widest">
                      {isFaculty ? 'Autonomous • Staff Pass' : 'SRTMUN Affiliated'}
                    </span>
                    <span className="w-6 h-[1px] bg-white/60 inline-block" />
                  </div>
                </div>
              </div>
            </div>

            {/* Front Card Body (Photo on Left, Details on Right) */}
            <div className="p-3 sm:p-4 relative">
              <div className="flex items-start gap-3 sm:gap-4">
                {/* Left: Photo */}
                <div className="shrink-0 flex flex-col items-center">
                  <div className="w-24 sm:w-28 h-32 sm:h-36 rounded-xl border border-slate-900 overflow-hidden shadow-sm bg-slate-100">
                    <img
                      src={isFaculty ? facultyAvatar : studentAvatar}
                      alt={isFaculty ? facultyName : studentName}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                </div>

                {/* Right: Details with Circular Blue Icons */}
                <div className="flex-1 min-w-0 space-y-2">
                  {/* Badge: FACULTY ID CARD vs STUDENT ID CARD */}
                  <div className="flex items-center justify-center space-x-1.5 pt-0.5">
                    <span className="w-5 sm:w-7 h-[1px] bg-slate-400" />
                    <span className="px-3 py-0.5 bg-[#071D3A] text-white font-black text-[9px] sm:text-[10px] uppercase tracking-wider rounded-full shadow-sm">
                      {isFaculty ? 'FACULTY ID CARD' : 'STUDENT ID CARD'}
                    </span>
                    <span className="w-5 sm:w-7 h-[1px] bg-slate-400" />
                  </div>

                  {/* Name */}
                  <div className="text-center sm:text-left pb-0.5">
                    <h4 className="font-extrabold text-xs sm:text-sm text-slate-950 truncate">
                      {isFaculty ? facultyName : studentName}
                    </h4>
                  </div>

                  {isFaculty ? (
                    <>
                      {/* Faculty Field 1: Designation */}
                      <div className="flex items-center space-x-2 bg-slate-50/90 border border-slate-100 rounded-xl px-2 py-1">
                        <div className="w-6 h-6 rounded-full bg-[#071D3A] text-white flex items-center justify-center shrink-0">
                          <Sparkles className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 text-[11px] leading-tight flex items-center justify-between min-w-0">
                          <span className="font-medium text-slate-600 text-[10px] shrink-0">Designation</span>
                          <span className="text-slate-400 mx-1">:</span>
                          <span className="font-extrabold text-blue-900 truncate text-[11px] text-right">
                            {facultyDesignation}
                          </span>
                        </div>
                      </div>

                      {/* Faculty Field 2: Department */}
                      <div className="flex items-center space-x-2 bg-slate-50/90 border border-slate-100 rounded-xl px-2 py-1">
                        <div className="w-6 h-6 rounded-full bg-[#071D3A] text-white flex items-center justify-center shrink-0">
                          <GraduationCap className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 text-[11px] leading-tight flex items-center justify-between min-w-0">
                          <span className="font-medium text-slate-600 text-[10px] shrink-0">Department</span>
                          <span className="text-slate-400 mx-1">:</span>
                          <span className="font-bold text-slate-900 truncate text-[11px] text-right">
                            {facultyDepartment}
                          </span>
                        </div>
                      </div>

                      {/* Faculty Field 3: Employee ID */}
                      <div className="flex items-center space-x-2 bg-slate-50/90 border border-slate-100 rounded-xl px-2 py-1">
                        <div className="w-6 h-6 rounded-full bg-[#071D3A] text-white flex items-center justify-center shrink-0">
                          <CreditCard className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 text-[11px] leading-tight flex items-center justify-between min-w-0">
                          <span className="font-medium text-slate-600 text-[10px] shrink-0">Employee ID</span>
                          <span className="text-slate-400 mx-1">:</span>
                          <span className="font-extrabold font-mono text-slate-950 text-xs">
                            {facultyEmpId}
                          </span>
                        </div>
                      </div>

                      {/* Faculty Field 4: Mobile Number */}
                      <div className="flex items-center space-x-2 bg-slate-50/90 border border-slate-100 rounded-xl px-2 py-1">
                        <div className="w-6 h-6 rounded-full bg-[#071D3A] text-white flex items-center justify-center shrink-0">
                          <Phone className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 text-[11px] leading-tight flex items-center justify-between min-w-0">
                          <span className="font-medium text-slate-600 text-[10px] shrink-0">Mobile Number</span>
                          <span className="text-slate-400 mx-1">:</span>
                          <span className="font-bold font-mono text-slate-900 text-[11px]">
                            {facultyMobile}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Field 1: Class */}
                      <div className="flex items-center space-x-2 bg-slate-50/90 border border-slate-100 rounded-xl px-2 py-1">
                        <div className="w-6 h-6 rounded-full bg-[#071D3A] text-white flex items-center justify-center shrink-0">
                          <GraduationCap className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 text-[11px] leading-tight flex items-baseline justify-between min-w-0">
                          <span className="font-medium text-slate-600 text-[10px] shrink-0">Class</span>
                          <span className="text-slate-400 mx-1">:</span>
                          <span className="font-bold text-slate-900 truncate text-[11px] text-right">
                            {studentClass} <span className="block text-[9px] text-blue-900 font-semibold">{studentYear}</span>
                          </span>
                        </div>
                      </div>

                      {/* Field 2: Roll Number */}
                      <div className="flex items-center space-x-2 bg-slate-50/90 border border-slate-100 rounded-xl px-2 py-1">
                        <div className="w-6 h-6 rounded-full bg-[#071D3A] text-white flex items-center justify-center shrink-0">
                          <CreditCard className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 text-[11px] leading-tight flex items-center justify-between min-w-0">
                          <span className="font-medium text-slate-600 text-[10px] shrink-0">Roll Number</span>
                          <span className="text-slate-400 mx-1">:</span>
                          <span className="font-extrabold font-mono text-slate-950 text-xs">
                            {studentRoll}
                          </span>
                        </div>
                      </div>

                      {/* Field 3: Date of Birth */}
                      <div className="flex items-center space-x-2 bg-slate-50/90 border border-slate-100 rounded-xl px-2 py-1">
                        <div className="w-6 h-6 rounded-full bg-[#071D3A] text-white flex items-center justify-center shrink-0">
                          <Calendar className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 text-[11px] leading-tight flex items-center justify-between min-w-0">
                          <span className="font-medium text-slate-600 text-[10px] shrink-0">Date of Birth</span>
                          <span className="text-slate-400 mx-1">:</span>
                          <span className="font-bold text-slate-900 text-[11px]">
                            {studentDob}
                          </span>
                        </div>
                      </div>

                      {/* Field 4: Mobile Number */}
                      <div className="flex items-center space-x-2 bg-slate-50/90 border border-slate-100 rounded-xl px-2 py-1">
                        <div className="w-6 h-6 rounded-full bg-[#071D3A] text-white flex items-center justify-center shrink-0">
                          <Phone className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 text-[11px] leading-tight flex items-center justify-between min-w-0">
                          <span className="font-medium text-slate-600 text-[10px] shrink-0">Mobile Number</span>
                          <span className="text-slate-400 mx-1">:</span>
                          <span className="font-bold font-mono text-slate-900 text-[11px]">
                            {studentMobile}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Bottom Decorative Wave */}
              <div className="mt-3 -mx-4 -mb-4 h-6 relative bg-gradient-to-r from-[#071D3A] via-[#0E2D58] to-[#071D3A] overflow-hidden">
                <svg
                  className="absolute inset-0 w-full h-full"
                  viewBox="0 0 500 24"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M 0 0 C 150 15 350 5 500 24 L 500 0 Z"
                    fill="#F5B945"
                  />
                  <path
                    d="M 0 0 C 140 18 340 8 500 24 L 0 24 Z"
                    fill="#071D3A"
                  />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* BACK CARD (Shown on 'back' or 'both') */}
        {(activeSide === 'back' || activeSide === 'both') && (
          <div className="relative w-full max-w-[500px] mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden text-slate-900 select-none">
            {/* Top Script Header Banner with Gold Ribbon */}
            <div className="relative pt-3 pb-1 px-4 sm:px-5 flex items-center justify-between border-b border-slate-100">
              {/* Left Script / Cursive Title */}
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-serif italic font-black text-xl sm:text-2xl text-[#071D3A] tracking-tight">
                    Modern College
                  </span>
                  <div className="w-16 sm:w-24 h-[1.5px] bg-[#071D3A] shrink-0" />
                </div>
                <p className="text-[10px] sm:text-[11px] font-bold text-[#071D3A] leading-tight">
                  Computer Science &amp; IT, Nanded
                </p>
              </div>

              {/* Top-Right Gold & Blue Ribbon Corner */}
              <svg
                className="absolute top-0 right-0 h-10 w-24 pointer-events-none"
                viewBox="0 0 100 40"
                preserveAspectRatio="none"
              >
                <path d="M 0 0 C 40 25 70 30 100 10 L 100 0 Z" fill="#F5B945" />
                <path d="M 15 0 C 50 20 80 25 100 8 L 100 0 Z" fill="#071D3A" />
              </svg>
            </div>

            {/* Back Card Body: Instructions on Left, QR on Right */}
            <div className="p-3 sm:p-4">
              <div className="flex items-start gap-3 sm:gap-4">
                {/* Left Column: 4 Rules with Circular Dark Blue Badges */}
                <div className="flex-1 space-y-2.5 text-slate-800 text-[10px] sm:text-[11px]">
                  {isFaculty ? (
                    <>
                      {/* Faculty Rule 1 */}
                      <div className="flex items-start space-x-2">
                        <div className="w-6 h-6 rounded-full bg-[#071D3A] text-white flex items-center justify-center shrink-0 mt-0.5">
                          <AlertCircle className="w-3.5 h-3.5 font-bold" />
                        </div>
                        <p className="font-semibold text-slate-800 leading-snug">
                          This ID Card is the official property of Modern College, Nanded.
                        </p>
                      </div>

                      {/* Faculty Rule 2 */}
                      <div className="flex items-start space-x-2">
                        <div className="w-6 h-6 rounded-full bg-[#071D3A] text-white flex items-center justify-center shrink-0 mt-0.5">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <p className="font-semibold text-slate-800 leading-snug">
                          Entitled to faculty library, labs &amp; administrative privileges.
                        </p>
                      </div>

                      {/* Faculty Rule 3 */}
                      <div className="flex items-start space-x-2">
                        <div className="w-6 h-6 rounded-full bg-[#071D3A] text-white flex items-center justify-center shrink-0 mt-0.5">
                          <Users className="w-3.5 h-3.5" />
                        </div>
                        <p className="font-semibold text-slate-800 leading-snug">
                          Must be carried on campus and shown upon official request.
                        </p>
                      </div>

                      {/* Faculty Rule 4 */}
                      <div className="flex items-start space-x-2">
                        <div className="w-6 h-6 rounded-full bg-[#071D3A] text-white flex items-center justify-center shrink-0 mt-0.5">
                          <CornerDownLeft className="w-3.5 h-3.5" />
                        </div>
                        <p className="font-semibold text-slate-800 leading-snug">
                          If found, please return to Principal Office, Modern College.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Rule 1: Exclamation */}
                      <div className="flex items-start space-x-2">
                        <div className="w-6 h-6 rounded-full bg-[#071D3A] text-white flex items-center justify-center shrink-0 mt-0.5">
                          <AlertCircle className="w-3.5 h-3.5 font-bold" />
                        </div>
                        <p className="font-semibold text-slate-800 leading-snug">
                          This ID Card is the property of Modern College, Nanded.
                        </p>
                      </div>

                      {/* Rule 2: Show when required */}
                      <div className="flex items-start space-x-2">
                        <div className="w-6 h-6 rounded-full bg-[#071D3A] text-white flex items-center justify-center shrink-0 mt-0.5">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <p className="font-semibold text-slate-800 leading-snug">
                          It must be shown when required by the college authorities.
                        </p>
                      </div>

                      {/* Rule 3: Do not share */}
                      <div className="flex items-start space-x-2">
                        <div className="w-6 h-6 rounded-full bg-[#071D3A] text-white flex items-center justify-center shrink-0 mt-0.5">
                          <Users className="w-3.5 h-3.5" />
                        </div>
                        <p className="font-semibold text-slate-800 leading-snug">
                          Do not share this card with anyone.
                        </p>
                      </div>

                      {/* Rule 4: Return if found */}
                      <div className="flex items-start space-x-2">
                        <div className="w-6 h-6 rounded-full bg-[#071D3A] text-white flex items-center justify-center shrink-0 mt-0.5">
                          <CornerDownLeft className="w-3.5 h-3.5" />
                        </div>
                        <p className="font-semibold text-slate-800 leading-snug">
                          If found, please return to the college office.
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Vertical Divider */}
                <div className="w-[1.5px] h-32 bg-slate-300 shrink-0 self-center" />

                {/* Right Column: Attendance / Faculty Verification QR Box */}
                <div className="shrink-0 flex flex-col items-center">
                  <div className="w-28 sm:w-32 rounded-2xl border-2 border-[#071D3A] overflow-hidden bg-white shadow-md">
                    {/* QR Code */}
                    <div className="p-1.5 flex items-center justify-center">
                      {qrDataUrl ? (
                        <img
                          src={qrDataUrl}
                          alt={isFaculty ? 'Faculty Verification QR' : 'Attendance QR Code'}
                          className="w-24 h-24 sm:w-28 sm:h-28 object-contain"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-slate-100 flex items-center justify-center text-[10px] text-slate-400">
                          Loading QR...
                        </div>
                      )}
                    </div>

                    {/* Bottom Pill: Scan for Verification */}
                    <div className="bg-[#071D3A] text-white py-1 px-2 text-center">
                      <span className="font-bold text-[9px] sm:text-[10px] tracking-wide block">
                        Scan for Verification
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Navy Wave Banner with Campus Building Architectural Blueprint */}
            <div className="relative bg-[#071D3A] text-white pt-2 pb-2.5 px-4 overflow-hidden mt-1">
              {/* Golden Wave Trim separating top */}
              <svg
                className="absolute top-0 inset-x-0 w-full h-2"
                viewBox="0 0 500 8"
                preserveAspectRatio="none"
              >
                <path d="M 0 0 C 150 8 350 4 500 0 L 500 4 L 0 4 Z" fill="#F5B945" />
              </svg>

              <div className="flex items-center justify-between relative z-10 pt-1">
                {/* Campus Building Architectural Blueprint Graphic */}
                <div className="w-36 sm:w-48 h-8 opacity-40">
                  <svg viewBox="0 0 200 40" className="w-full h-full">
                    <rect x="10" y="8" width="180" height="30" stroke="white" strokeWidth="0.8" fill="none" />
                    <rect x="75" y="2" width="50" height="36" stroke="white" strokeWidth="1" fill="none" />
                    <line x1="75" y1="2" x2="100" y2="0" stroke="white" strokeWidth="1" />
                    <line x1="125" y1="2" x2="100" y2="0" stroke="white" strokeWidth="1" />
                    <rect x="15" y="12" width="12" height="6" stroke="white" strokeWidth="0.6" fill="none" />
                    <rect x="32" y="12" width="12" height="6" stroke="white" strokeWidth="0.6" fill="none" />
                    <rect x="49" y="12" width="12" height="6" stroke="white" strokeWidth="0.6" fill="none" />
                    <rect x="15" y="22" width="12" height="6" stroke="white" strokeWidth="0.6" fill="none" />
                    <rect x="32" y="22" width="12" height="6" stroke="white" strokeWidth="0.6" fill="none" />
                    <rect x="49" y="22" width="12" height="6" stroke="white" strokeWidth="0.6" fill="none" />
                    <rect x="83" y="10" width="14" height="8" stroke="white" strokeWidth="0.6" fill="none" />
                    <rect x="103" y="10" width="14" height="8" stroke="white" strokeWidth="0.6" fill="none" />
                    <rect x="88" y="22" width="24" height="16" stroke="white" strokeWidth="0.8" fill="none" />
                    <rect x="139" y="12" width="12" height="6" stroke="white" strokeWidth="0.6" fill="none" />
                    <rect x="156" y="12" width="12" height="6" stroke="white" strokeWidth="0.6" fill="none" />
                    <rect x="173" y="12" width="12" height="6" stroke="white" strokeWidth="0.6" fill="none" />
                    <rect x="139" y="22" width="12" height="6" stroke="white" strokeWidth="0.6" fill="none" />
                    <rect x="156" y="22" width="12" height="6" stroke="white" strokeWidth="0.6" fill="none" />
                    <rect x="173" y="22" width="12" height="6" stroke="white" strokeWidth="0.6" fill="none" />
                  </svg>
                </div>

                {/* Bottom Right: MODERN COLLEGE */}
                <div className="text-right">
                  <h5 className="font-black text-xs sm:text-[13px] tracking-wider uppercase text-white leading-tight font-sans">
                    MODERN COLLEGE
                  </h5>
                  <p className="text-[9px] text-amber-300 font-semibold leading-tight">
                    Computer Science &amp; IT, Nanded
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Controls (Flip & Download) */}
      <div className="flex items-center justify-between gap-2 pt-1 max-w-[500px] mx-auto text-xs font-bold">
        <button
          onClick={() => setActiveSide((prev) => (prev === 'front' ? 'back' : 'front'))}
          className="flex-1 py-2 px-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl flex items-center justify-center space-x-1.5 shadow-sm transition-all active:scale-95"
        >
          <RotateCw className="w-3.5 h-3.5 text-blue-600" />
          <span>{activeSide === 'front' ? 'Flip to Back Side' : 'Flip to Front Side'}</span>
        </button>

        {qrDataUrl && (
          <a
            href={qrDataUrl}
            download={isFaculty ? `ModernCollege_FacultyID_${facultyEmpId}.png` : `ModernCollege_AttendanceQR_${studentRoll}.png`}
            className="py-2 px-3 bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 rounded-xl flex items-center justify-center space-x-1 transition-all"
            title="Download QR Image"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save QR</span>
          </a>
        )}
      </div>

      {/* Verified Academic / Faculty Documents */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm space-y-3 max-w-[500px] mx-auto">
        <div className="flex justify-between items-center">
          <h4 className="font-bold text-xs text-slate-800 flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isFaculty ? 'Campus Employment & Staff Records' : 'Campus Enrollment & Records'}</span>
          </h4>
          <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
            {isFaculty ? `EMP ID: ${facultyEmpId}` : `PRN: ${studentPrn}`}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="p-2.5 bg-slate-50 rounded-xl">
            <span className="text-slate-400 block text-[9px] uppercase font-semibold">
              {isFaculty ? 'Staff Email' : 'Institutional Email'}
            </span>
            <span className="font-semibold text-slate-800 truncate block">
              {currentUser.email || (isFaculty ? 'faculty@modernclg.edu.in' : currentStudent?.email || 'rahul.shinde@modernclg.edu.in')}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl">
            <span className="text-slate-400 block text-[9px] uppercase font-semibold">
              {isFaculty ? 'Department & Cabin' : 'Affiliated University'}
            </span>
            <span className="font-semibold text-slate-800 truncate block">
              {isFaculty ? `${facultyDepartment} Dept • ${currentUser.cabin || 'Staff Room Block A'}` : 'SRTMUN, Nanded'}
            </span>
          </div>
        </div>
      </div>

      {/* Switch to Desktop ERP Portal & Logout */}
      <div className="space-y-2 pt-2 max-w-[500px] mx-auto">
        <button
          onClick={() => setViewMode('desktop')}
          className="w-full py-3 bg-slate-900 text-white rounded-2xl font-bold text-xs shadow-sm flex items-center justify-center space-x-2 hover:bg-slate-800 transition-all active:scale-95"
        >
          <Laptop className="w-4 h-4 text-blue-400" />
          <span>Open Full Desktop ERP Portal</span>
        </button>

        <button
          onClick={logout}
          className="w-full py-2.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-2xl font-semibold text-xs flex items-center justify-center space-x-1 transition-all active:scale-95"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout Session</span>
        </button>
      </div>

      {/* =========================================================================
          EDIT PROFILE MODAL
         ========================================================================= */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    {isFaculty ? 'Edit Faculty ID Profile' : 'Edit Student ID Profile'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {isFaculty ? 'Update Faculty ID details & Verification QR' : 'Update ID Card details & Attendance QR'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProfile} className="mt-4 space-y-3 text-xs">
              {/* Avatar Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5 flex items-center space-x-1">
                  <Camera className="w-3.5 h-3.5 text-blue-600" />
                  <span>Choose Profile Photo</span>
                </label>
                <div className="flex items-center space-x-2 overflow-x-auto pb-1.5">
                  {PRESET_AVATARS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setEditAvatar(url)}
                      className={`relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${editAvatar === url
                          ? 'border-blue-600 ring-2 ring-blue-500/30 scale-105'
                          : 'border-slate-200 hover:border-slate-400'
                        }`}
                    >
                      <img src={url} alt="preset" className="w-full h-full object-cover object-top" />
                      {editAvatar === url && (
                        <div className="absolute inset-0 bg-blue-600/30 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white stroke-[3]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {isFaculty ? 'Faculty Full Name *' : 'Student Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder={isFaculty ? 'e.g. Dr. Nitish Sharma' : 'e.g. Rahul Ramesh Shinde'}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-semibold text-slate-800"
                />
              </div>

              {isFaculty ? (
                <>
                  {/* Designation & Department */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Designation *</label>
                      <select
                        value={editDesignation}
                        onChange={(e) => setEditDesignation(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-semibold text-slate-800"
                      >
                        <option value="Assistant Professor">Assistant Professor</option>
                        <option value="Associate Professor">Associate Professor</option>
                        <option value="Professor">Professor</option>
                        <option value="Head of Department (HOD)">Head of Department (HOD)</option>
                        <option value="Lecturer / Faculty">Lecturer / Faculty</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Department *</label>
                      <select
                        value={editDepartment}
                        onChange={(e) => setEditDepartment(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-semibold text-slate-800"
                      >
                        <option value="Computer Science">Computer Science</option>
                        <option value="Information Technology">Information Technology</option>
                        <option value="Computer Applications">Computer Applications</option>
                      </select>
                    </div>
                  </div>

                  {/* Employee ID & Qualification */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Employee ID *</label>
                      <input
                        type="text"
                        required
                        value={editEmpId}
                        onChange={(e) => setEditEmpId(e.target.value)}
                        placeholder="e.g. FAC-2024-009"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono font-bold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Qualification</label>
                      <input
                        type="text"
                        value={editQualification}
                        onChange={(e) => setEditQualification(e.target.value)}
                        placeholder="e.g. M.Sc., Ph.D"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-semibold text-slate-800"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Class & Academic Year */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Enrolled Class / Course *</label>
                      <select
                        value={editCourse}
                        onChange={(e) => setEditCourse(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-semibold text-slate-800"
                      >
                        <option value="B.Sc Computer Science">B.Sc Computer Science</option>
                        <option value="B.Sc Information Technology">B.Sc IT</option>
                        <option value="Bachelor of Computer Applications (BCA)">BCA</option>
                        <option value="M.Sc Computer Science">M.Sc Computer Science</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Year / Semester *</label>
                      <select
                        value={editYear}
                        onChange={(e) => setEditYear(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-semibold text-slate-800"
                      >
                        <option value="First Year">First Year</option>
                        <option value="Second Year">Second Year</option>
                        <option value="Third Year">Third Year</option>
                        <option value="Semester I">Semester I</option>
                        <option value="Semester II">Semester II</option>
                        <option value="Semester III">Semester III</option>
                        <option value="Semester IV">Semester IV</option>
                      </select>
                    </div>
                  </div>

                  {/* Roll Number & Date of Birth */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Roll Number *</label>
                      <input
                        type="text"
                        required
                        value={editRoll}
                        onChange={(e) => setEditRoll(e.target.value)}
                        placeholder="e.g. CS-329"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono font-bold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Date of Birth (DOB) *</label>
                      <input
                        type="text"
                        required
                        value={editDob}
                        onChange={(e) => setEditDob(e.target.value)}
                        placeholder="DD/MM/YYYY (e.g. 15/08/2004)"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-semibold text-slate-800"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Mobile Number */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mobile Contact Number *</label>
                <input
                  type="tel"
                  required
                  value={editMobile}
                  onChange={(e) => setEditMobile(e.target.value)}
                  placeholder="e.g. 9023456789"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 font-semibold text-slate-800"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-semibold text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full sm:w-auto px-5 py-2 rounded-xl text-white bg-blue-600 hover:bg-blue-700 font-bold shadow-md flex items-center justify-center space-x-1.5 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSaving ? 'Updating...' : 'Save & Update ID Card'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
