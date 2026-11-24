'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Building2,
  IdCard,
  UploadCloud,
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

// Helper to crop and compress passport size photo (standard 3:4 aspect ratio)
const compressPassportPhoto = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const targetWidth = 450;
        const targetHeight = 600;

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, targetWidth, targetHeight);

        const scale = Math.max(targetWidth / img.width, targetHeight / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const x = (targetWidth - scaledWidth) / 2;
        const y = Math.min(0, (targetHeight - scaledHeight) * 0.25);

        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        resolve(dataUrl);
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const ProfileView: React.FC = () => {
  const { currentUser, setCurrentUser, students, facultyList, updateStudent, updateFaculty, setViewMode, logout, setRole } = useApp();

  const isFaculty = currentUser.role === 'faculty';
  const currentStudent = students.find((s) => s.id === currentUser.id) || students[0];

  // Active side: 'front' | 'back' | 'both'
  const [activeSide, setActiveSide] = useState<'front' | 'back' | 'both'>('front');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Field values for Student
  const studentName =
    currentUser.name && currentUser.name !== 'Student' && currentUser.name !== 'Rahul Ramesh Shinde'
      ? (currentUser.name.toLowerCase().includes('gomaskar') ? 'Mahesh Gomaskar' : currentUser.name)
      : 'Mahesh Gomaskar';
  const studentClass = currentUser.course || 'B.Sc Computer Science (First Year (FY))';
  const studentYear = currentUser.semester
    ? (currentUser.semester.startsWith('(') ? currentUser.semester : `(${currentUser.semester})`)
    : '(Semester I)';
  const studentRoll = currentUser.rollNo || 'CS- 329';
  const studentDob = currentUser.dob || '15/08/2004';
  const studentMobile = currentUser.phone || '7896541230';
  const studentPrn = currentUser.prn || '202580019329';
  const studentEmail = currentUser.email || 'gomaskarm@gmail.com';
  const studentAvatar = currentUser.avatar || '/student-avatar.jpg';

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

  // Photo upload state & ref
  const directFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Direct photo upload handler (called from ID card photo click)
  const handleDirectPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPhoto(true);
    try {
      const optimizedPhoto = await compressPassportPhoto(file);
      const updatedUser: UserProfile = {
        ...currentUser,
        avatar: optimizedPhoto,
      };
      setCurrentUser(updatedUser);
      localStorage.setItem('smart_campus_session', JSON.stringify({ user: updatedUser, timestamp: Date.now() }));

      if (!isFaculty && currentStudent && updateStudent) {
        await updateStudent({
          ...currentStudent,
          avatar: optimizedPhoto,
        });
      } else if (isFaculty && updateFaculty) {
        const linkedFaculty = facultyList.find(
          (f) => f.id === currentUser.id || f.name?.toLowerCase() === currentUser.name?.toLowerCase()
        );
        if (linkedFaculty) {
          await updateFaculty({
            ...linkedFaculty,
            avatar: optimizedPhoto,
          });
        }
      }

      setToastMessage('ID Card Photo updated successfully! ✓');
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      console.error('Photo upload error:', err);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Modal photo upload handler
  const handleModalPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const optimizedPhoto = await compressPassportPhoto(file);
      setEditAvatar(optimizedPhoto);
    } catch (err) {
      console.error('Modal photo upload error:', err);
    }
  };

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
        localStorage.setItem('smart_campus_session', JSON.stringify({ user: updatedUser, timestamp: Date.now() }));

        if (updateFaculty) {
          const linkedFaculty = facultyList.find(
            (f) => f.id === currentUser.id || f.name?.toLowerCase() === currentUser.name?.toLowerCase()
          );
          if (linkedFaculty) {
            await updateFaculty({
              ...linkedFaculty,
              name: editName.trim(),
              designation: editDesignation.trim(),
              department: editDepartment.trim(),
              employeeId: editEmpId.trim(),
              phone: editMobile.trim(),
              qualification: editQualification.trim(),
              avatar: editAvatar,
            });
          }
        }

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
        localStorage.setItem('smart_campus_session', JSON.stringify({ user: updatedUser, timestamp: Date.now() }));

        if (currentStudent && updateStudent) {
          const updatedStudentRecord: StudentRecord = {
            ...currentStudent,
            name: editName.trim(),
            course: editCourse.trim(),
            semester: editYear.trim(),
            rollNo: editRoll.trim(),
            dob: editDob.trim(),
            phone: editMobile.trim(),
            avatar: editAvatar,
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

      {/* Header & Controls Bar matching reference mockup */}
      <div className="flex items-center justify-between gap-2 pt-1 max-w-[500px] mx-auto w-full">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 text-[#1d4ed8] flex items-center justify-center shrink-0 border border-blue-200/60 shadow-xs">
            <IdCard className="w-5 h-5 text-[#1d4ed8]" />
          </div>
          <div className="min-w-0">
            <h2 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight flex items-center space-x-1.5 truncate">
              <span>{isFaculty ? 'Faculty Identity Card' : 'Student Identity Card'}</span>
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-400 text-slate-900 font-black text-[10px] shadow-xs shrink-0">
                ✓
              </span>
            </h2>
            <p className="text-[11px] text-slate-500 font-medium truncate">
              {isFaculty
                ? 'Official Campus Faculty & Staff ID with Verification QR'
                : 'Official Campus ID with Attendance Verification QR'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleOpenEdit}
            className="px-3.5 py-1.5 bg-[#1d4ed8] hover:bg-blue-700 text-white rounded-full text-xs font-bold flex items-center space-x-1.5 shadow-sm active:scale-95 transition-all"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-full text-xs font-bold flex items-center space-x-1.5 shadow-sm active:scale-95 transition-all"
            title="Print Official ID Card Slip"
          >
            <Printer className="w-3.5 h-3.5 text-slate-700" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Side Switcher Tab Pills matching reference mockup */}
      <div className="flex items-center bg-[#edf2f7] p-1.5 rounded-full text-xs font-bold border border-slate-200/80 max-w-[500px] mx-auto w-full">
        <button
          onClick={() => setActiveSide('front')}
          className={`flex-1 py-2 rounded-full transition-all flex items-center justify-center space-x-1.5 ${activeSide === 'front'
              ? 'bg-[#1d4ed8] text-white shadow-md'
              : 'text-slate-700 hover:text-slate-950 font-semibold'
            }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Front Side</span>
        </button>

        <button
          onClick={() => setActiveSide('back')}
          className={`flex-1 py-2 rounded-full transition-all flex items-center justify-center space-x-1.5 ${activeSide === 'back'
              ? 'bg-[#1d4ed8] text-white shadow-md'
              : 'text-slate-700 hover:text-slate-950 font-semibold'
            }`}
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Back Side</span>
        </button>

        <button
          onClick={() => setActiveSide('both')}
          className={`flex-1 py-2 rounded-full transition-all flex items-center justify-center space-x-1.5 ${activeSide === 'both'
              ? 'bg-[#1d4ed8] text-white shadow-md'
              : 'text-slate-700 hover:text-slate-950 font-semibold'
            }`}
        >
          <IdCard className="w-3.5 h-3.5" />
          <span>Both Sides</span>
        </button>
      </div>

      {/* =========================================================================
          ID CARDS CONTAINER (Matching user reference layout precisely)
         ========================================================================= */}
      <div className="space-y-4">
        {/* FRONT CARD (Shown on 'front' or 'both') */}
        {(activeSide === 'front' || activeSide === 'both') && (
          <div className="relative w-full max-w-[500px] mx-auto bg-white rounded-[26px] shadow-[0_12px_40px_rgba(0,0,0,0.10)] border border-slate-200/90 overflow-hidden text-slate-900 select-none">
            {/* Top Navy Header Banner with Flowing Waves */}
            <div className="relative bg-gradient-to-r from-[#031846] via-[#072460] to-[#0c397f] text-white pt-3.5 pb-3 px-3.5 sm:px-4 overflow-hidden">
              {/* Layered Blue Wave Graphic on right */}
              <svg
                className="absolute top-0 right-0 h-full w-40 sm:w-48 pointer-events-none"
                viewBox="0 0 180 75"
                preserveAspectRatio="none"
              >
                <path
                  d="M 0 0 C 60 50 110 70 180 30 L 180 75 L 180 0 Z"
                  fill="#1d4ed8"
                  opacity="0.45"
                />
                <path
                  d="M 20 0 C 70 45 120 60 180 22 L 180 0 Z"
                  fill="#031846"
                />
                <path
                  d="M 0 0 C 65 50 125 65 180 25 L 180 40 C 120 85 60 60 0 0 Z"
                  fill="#38bdf8"
                  opacity="0.7"
                />
              </svg>

              <div className="relative z-10 flex items-center space-x-2.5 sm:space-x-3">
                {/* College Logo in White Circular Badge */}
                <div className="w-12 h-12 rounded-full bg-white p-1 flex items-center justify-center shrink-0 shadow-md">
                  <CollegeLogo size={38} />
                </div>

                {/* Vertical Divider Line */}
                <div className="w-[1.5px] h-9 bg-white/35 shrink-0" />

                {/* College Title & Affiliation */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-sm sm:text-base tracking-wider text-white uppercase leading-tight font-sans">
                    MODERN COLLEGE
                  </h3>
                  <p className="text-[10.5px] sm:text-[11.5px] font-semibold text-white/95 leading-tight">
                    Computer Science &amp; IT, Nanded
                  </p>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <span className="w-6 h-[1px] bg-white/50 inline-block" />
                    <span className="text-[8.5px] sm:text-[9.5px] font-bold text-cyan-200 uppercase tracking-widest">
                      {isFaculty ? 'Autonomous • Staff Pass' : 'SRTMUN AFFILIATED'}
                    </span>
                    <span className="w-6 h-[1px] bg-white/50 inline-block" />
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-Header Ribbon with STUDENT ID CARD / FACULTY ID CARD */}
            <div className="relative my-2.5 px-4 flex items-center justify-center">
              <div className="w-full border-t border-slate-200" />
              <span className="absolute bg-[#0a2356] text-white text-[9.5px] font-black uppercase tracking-wider px-4 py-0.5 rounded-full shadow-sm">
                {isFaculty ? 'FACULTY ID CARD' : 'STUDENT ID CARD'}
              </span>
            </div>

            {/* Front Card Body (Photo on Left, Key-Value Table on Right) */}
            <div className="px-3.5 sm:px-4.5 pt-1 pb-0 relative">
              <div className="flex items-start gap-3.5 sm:gap-4">
                {/* Left: Passport Size Student Photo with Add Photo feature */}
                <div className="shrink-0 flex flex-col items-center">
                  <div className="relative group w-[112px] sm:w-[124px] h-[146px] sm:h-[158px] rounded-2xl border-2 border-slate-200 overflow-hidden shadow-xs bg-blue-50">
                    <img
                      src={isFaculty ? facultyAvatar : studentAvatar}
                      alt={isFaculty ? facultyName : studentName}
                      className="w-full h-full object-cover object-top"
                    />
                    {/* Add / Change Photo Button */}
                    <button
                      type="button"
                      onClick={() => directFileInputRef.current?.click()}
                      className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/65 to-transparent pt-3 pb-1.5 px-1 flex items-center justify-center space-x-1 text-white hover:bg-blue-600/90 transition-all cursor-pointer opacity-90 hover:opacity-100"
                      title="Click to add or change your ID card photo"
                    >
                      <Camera className="w-3.5 h-3.5 text-blue-200" />
                      <span className="text-[9.5px] font-bold text-white tracking-tight">
                        {isUploadingPhoto ? 'Uploading...' : 'Add Photo'}
                      </span>
                    </button>
                  </div>
                  {/* Hidden file input for direct photo upload */}
                  <input
                    ref={directFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleDirectPhotoUpload}
                    className="hidden"
                  />
                </div>

                {/* Right: Student Details Table */}
                <div className="flex-1 min-w-0">
                  {/* Name */}
                  <h4 className="font-black text-base sm:text-lg text-slate-900 tracking-tight leading-tight mb-2.5">
                    {isFaculty ? facultyName : studentName}
                  </h4>

                  {isFaculty ? (
                    /* Faculty Details Rows */
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-full bg-[#dbeafe] text-[#1d4ed8] flex items-center justify-center shrink-0 shadow-xs">
                          <Sparkles className="w-4 h-4 text-[#1d4ed8]" />
                        </div>
                        <div className="flex-1 text-[11px] leading-tight flex items-center justify-between min-w-0">
                          <span className="font-semibold text-slate-600 text-[11px] shrink-0 w-24">Designation</span>
                          <span className="text-slate-400 font-bold mx-1 shrink-0">:</span>
                          <span className="font-bold text-[#1d4ed8] text-[11px] text-right flex-1 min-w-0">
                            {facultyDesignation}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-full bg-[#dbeafe] text-[#1d4ed8] flex items-center justify-center shrink-0 shadow-xs">
                          <GraduationCap className="w-4 h-4 text-[#1d4ed8]" />
                        </div>
                        <div className="flex-1 text-[11px] leading-tight flex items-center justify-between min-w-0">
                          <span className="font-semibold text-slate-600 text-[11px] shrink-0 w-24">Department</span>
                          <span className="text-slate-400 font-bold mx-1 shrink-0">:</span>
                          <span className="font-bold text-slate-900 text-[11px] text-right flex-1 min-w-0">
                            {facultyDepartment}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-full bg-[#dbeafe] text-[#1d4ed8] flex items-center justify-center shrink-0 shadow-xs">
                          <CreditCard className="w-4 h-4 text-[#1d4ed8]" />
                        </div>
                        <div className="flex-1 text-[11px] leading-tight flex items-center justify-between min-w-0">
                          <span className="font-semibold text-slate-600 text-[11px] shrink-0 w-24">Employee ID</span>
                          <span className="text-slate-400 font-bold mx-1 shrink-0">:</span>
                          <span className="font-black font-mono text-slate-900 text-xs text-right flex-1 min-w-0">
                            {facultyEmpId}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-full bg-[#dbeafe] text-[#1d4ed8] flex items-center justify-center shrink-0 shadow-xs">
                          <Phone className="w-4 h-4 text-[#1d4ed8]" />
                        </div>
                        <div className="flex-1 text-[11px] leading-tight flex items-center justify-between min-w-0">
                          <span className="font-semibold text-slate-600 text-[11px] shrink-0 w-24">Mobile Number</span>
                          <span className="text-slate-400 font-bold mx-1 shrink-0">:</span>
                          <span className="font-bold font-mono text-slate-900 text-xs text-right flex-1 min-w-0">
                            {facultyMobile}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Student Details Rows matching reference mockup */
                    <div className="space-y-2">
                      {/* Row 1: Class */}
                      <div className="flex items-start space-x-2">
                        <div className="w-7 h-7 rounded-full bg-[#dbeafe] text-[#1d4ed8] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                          <GraduationCap className="w-4 h-4 text-[#1d4ed8]" />
                        </div>
                        <div className="flex-1 text-[11px] leading-tight flex items-baseline justify-between min-w-0">
                          <span className="font-semibold text-slate-600 text-[11px] shrink-0 w-24">Class</span>
                          <span className="text-slate-400 font-bold mx-1 shrink-0">:</span>
                          <span className="font-bold text-slate-900 text-[11px] text-right flex-1 min-w-0">
                            {studentClass}
                            <span className="block text-[10px] text-[#1d4ed8] font-bold mt-0.5">
                              {studentYear}
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Row 2: Roll Number */}
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-full bg-[#dbeafe] text-[#1d4ed8] flex items-center justify-center shrink-0 shadow-xs">
                          <IdCard className="w-4 h-4 text-[#1d4ed8]" />
                        </div>
                        <div className="flex-1 text-[11px] leading-tight flex items-center justify-between min-w-0">
                          <span className="font-semibold text-slate-600 text-[11px] shrink-0 w-24">Roll Number</span>
                          <span className="text-slate-400 font-bold mx-1 shrink-0">:</span>
                          <span className="font-black font-mono text-slate-900 text-xs text-right flex-1 min-w-0">
                            {studentRoll}
                          </span>
                        </div>
                      </div>

                      {/* Row 3: Date of Birth */}
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-full bg-[#dbeafe] text-[#1d4ed8] flex items-center justify-center shrink-0 shadow-xs">
                          <Calendar className="w-4 h-4 text-[#1d4ed8]" />
                        </div>
                        <div className="flex-1 text-[11px] leading-tight flex items-center justify-between min-w-0">
                          <span className="font-semibold text-slate-600 text-[11px] shrink-0 w-24">Date of Birth</span>
                          <span className="text-slate-400 font-bold mx-1 shrink-0">:</span>
                          <span className="font-bold text-slate-900 text-xs text-right flex-1 min-w-0">
                            {studentDob}
                          </span>
                        </div>
                      </div>

                      {/* Row 4: Mobile Number */}
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-full bg-[#dbeafe] text-[#1d4ed8] flex items-center justify-center shrink-0 shadow-xs">
                          <Phone className="w-4 h-4 text-[#1d4ed8]" />
                        </div>
                        <div className="flex-1 text-[11px] leading-tight flex items-center justify-between min-w-0">
                          <span className="font-semibold text-slate-600 text-[11px] shrink-0 w-24">Mobile Number</span>
                          <span className="text-slate-400 font-bold mx-1 shrink-0">:</span>
                          <span className="font-bold font-mono text-slate-900 text-xs text-right flex-1 min-w-0">
                            {studentMobile}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Decorative Smooth Wave */}
              <div className="h-7 w-full relative overflow-hidden mt-3 -mx-4">
                <svg
                  className="absolute inset-0 w-full h-full"
                  viewBox="0 0 500 28"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M 0 10 C 140 28 360 0 500 16 L 500 28 L 0 28 Z"
                    fill="#2563eb"
                    opacity="0.4"
                  />
                  <path
                    d="M 0 18 C 140 6 360 26 500 8 L 500 28 L 0 28 Z"
                    fill="#031846"
                  />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* BACK CARD (Shown on 'back' or 'both') */}
        {(activeSide === 'back' || activeSide === 'both') && (
          <div className="relative w-full max-w-[500px] mx-auto bg-white rounded-[26px] shadow-[0_12px_40px_rgba(0,0,0,0.10)] border border-slate-200/90 overflow-hidden text-slate-900 select-none">
            {/* Top Header Banner with Blue Ribbon */}
            <div className="relative pt-3.5 pb-2 px-4 sm:px-5 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-serif italic font-black text-xl sm:text-2xl text-[#0a2356] tracking-tight">
                    Modern College
                  </span>
                  <div className="w-16 sm:w-24 h-[1.5px] bg-[#0a2356] shrink-0" />
                </div>
                <p className="text-[10px] sm:text-[11px] font-bold text-[#0a2356] leading-tight">
                  Computer Science &amp; IT, Nanded
                </p>
              </div>

              {/* Top-Right Blue Ribbon Corner */}
              <svg
                className="absolute top-0 right-0 h-10 w-24 pointer-events-none"
                viewBox="0 0 100 40"
                preserveAspectRatio="none"
              >
                <path d="M 0 0 C 40 25 70 30 100 10 L 100 0 Z" fill="#38bdf8" opacity="0.8" />
                <path d="M 15 0 C 50 20 80 25 100 8 L 100 0 Z" fill="#0a2356" />
              </svg>
            </div>

            {/* Back Card Body: Instructions on Left, QR on Right */}
            <div className="p-3.5 sm:p-4">
              <div className="flex items-start gap-3 sm:gap-4">
                {/* Left Column: 4 Rules with Circular Dark Blue Badges */}
                <div className="flex-1 space-y-2.5 text-slate-800 text-[10px] sm:text-[11px]">
                  {isFaculty ? (
                    <>
                      <div className="flex items-start space-x-2">
                        <div className="w-6 h-6 rounded-full bg-[#0a2356] text-white flex items-center justify-center shrink-0 mt-0.5">
                          <AlertCircle className="w-3.5 h-3.5 font-bold" />
                        </div>
                        <p className="font-semibold text-slate-800 leading-snug">
                          This ID Card is the official property of Modern College, Nanded.
                        </p>
                      </div>

                      <div className="flex items-start space-x-2">
                        <div className="w-6 h-6 rounded-full bg-[#0a2356] text-white flex items-center justify-center shrink-0 mt-0.5">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <p className="font-semibold text-slate-800 leading-snug">
                          Entitled to faculty library, labs &amp; administrative privileges.
                        </p>
                      </div>

                      <div className="flex items-start space-x-2">
                        <div className="w-6 h-6 rounded-full bg-[#0a2356] text-white flex items-center justify-center shrink-0 mt-0.5">
                          <Users className="w-3.5 h-3.5" />
                        </div>
                        <p className="font-semibold text-slate-800 leading-snug">
                          Must be carried on campus and shown upon official request.
                        </p>
                      </div>

                      <div className="flex items-start space-x-2">
                        <div className="w-6 h-6 rounded-full bg-[#0a2356] text-white flex items-center justify-center shrink-0 mt-0.5">
                          <CornerDownLeft className="w-3.5 h-3.5" />
                        </div>
                        <p className="font-semibold text-slate-800 leading-snug">
                          If found, please return to Principal Office, Modern College.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-start space-x-2">
                        <div className="w-6 h-6 rounded-full bg-[#0a2356] text-white flex items-center justify-center shrink-0 mt-0.5">
                          <AlertCircle className="w-3.5 h-3.5 font-bold" />
                        </div>
                        <p className="font-semibold text-slate-800 leading-snug">
                          This ID Card is the property of Modern College, Nanded.
                        </p>
                      </div>

                      <div className="flex items-start space-x-2">
                        <div className="w-6 h-6 rounded-full bg-[#0a2356] text-white flex items-center justify-center shrink-0 mt-0.5">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <p className="font-semibold text-slate-800 leading-snug">
                          It must be shown when required by the college authorities.
                        </p>
                      </div>

                      <div className="flex items-start space-x-2">
                        <div className="w-6 h-6 rounded-full bg-[#0a2356] text-white flex items-center justify-center shrink-0 mt-0.5">
                          <Users className="w-3.5 h-3.5" />
                        </div>
                        <p className="font-semibold text-slate-800 leading-snug">
                          Do not share this card with anyone.
                        </p>
                      </div>

                      <div className="flex items-start space-x-2">
                        <div className="w-6 h-6 rounded-full bg-[#0a2356] text-white flex items-center justify-center shrink-0 mt-0.5">
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
                <div className="w-[1.5px] h-32 bg-slate-200 shrink-0 self-center" />

                {/* Right Column: Attendance / Faculty Verification QR Box */}
                <div className="shrink-0 flex flex-col items-center">
                  <div className="w-28 sm:w-32 rounded-2xl border-2 border-[#0a2356] overflow-hidden bg-white shadow-md">
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

                    <div className="bg-[#0a2356] text-white py-1 px-2 text-center">
                      <span className="font-bold text-[9px] sm:text-[10px] tracking-wide block">
                        Scan for Verification
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Navy Wave Banner */}
            <div className="relative bg-[#0a2356] text-white pt-2.5 pb-2.5 px-4 overflow-hidden mt-1">
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center space-x-2">
                  <CollegeLogo size={24} className="brightness-200" />
                  <span className="text-[10px] font-bold text-blue-200">Official Smart Campus Pass</span>
                </div>

                <div className="text-right">
                  <h5 className="font-black text-xs tracking-wider uppercase text-white leading-tight font-sans">
                    MODERN COLLEGE
                  </h5>
                  <p className="text-[9px] text-cyan-200 font-semibold leading-tight">
                    Computer Science &amp; IT, Nanded
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Controls (Flip to Back Side & Save QR) matching reference mockup */}
      <div className="flex items-center justify-between gap-3 max-w-[500px] mx-auto text-xs font-bold w-full">
        <button
          onClick={() => setActiveSide((prev) => (prev === 'front' ? 'back' : 'front'))}
          className="flex-1 py-3 px-4 bg-white border border-blue-200 text-[#1d4ed8] hover:bg-blue-50/50 rounded-2xl flex items-center justify-center space-x-2 shadow-xs transition-all active:scale-95"
        >
          <RotateCw className="w-4 h-4 text-[#1d4ed8]" />
          <span>{activeSide === 'front' ? 'Flip to Back Side' : 'Flip to Front Side'}</span>
        </button>

        {qrDataUrl && (
          <a
            href={qrDataUrl}
            download={isFaculty ? `ModernCollege_FacultyID_${facultyEmpId}.png` : `ModernCollege_AttendanceQR_${studentRoll}.png`}
            className="py-3 px-6 bg-[#ebfbf3] border border-emerald-200 text-[#0f766e] hover:bg-emerald-100/70 rounded-2xl flex items-center justify-center space-x-2 shadow-xs transition-all active:scale-95 shrink-0"
            title="Download QR Image"
          >
            <Download className="w-4 h-4 text-[#0f766e]" />
            <span>Save QR</span>
          </a>
        )}
      </div>

      {/* Campus Enrollment & Records Card matching reference mockup */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm space-y-3 max-w-[500px] mx-auto w-full">
        <div className="flex justify-between items-center">
          <h4 className="font-bold text-xs text-slate-800 flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{isFaculty ? 'Campus Employment & Staff Records' : 'Campus Enrollment & Records'}</span>
          </h4>
          <span className="text-[11px] font-mono font-bold text-[#15803d] bg-[#dcfce7] px-3 py-1 rounded-full border border-emerald-200/60">
            {isFaculty ? `EMP ID : ${facultyEmpId}` : `PRN : ${studentPrn}`}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="p-3 bg-[#f0f6ff] rounded-2xl border border-blue-100/60 flex items-start space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#1d4ed8] flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4 text-[#1d4ed8]" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block">
                {isFaculty ? 'STAFF EMAIL' : 'INSTITUTIONAL EMAIL'}
              </span>
              <span className="text-xs font-bold text-slate-900 truncate block mt-0.5">
                {studentEmail}
              </span>
            </div>
          </div>

          <div className="p-3 bg-[#f0f6ff] rounded-2xl border border-blue-100/60 flex items-start space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#1d4ed8] flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4 text-[#1d4ed8]" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block">
                {isFaculty ? 'AFFILIATED DEPT' : 'AFFILIATED UNIVERSITY'}
              </span>
              <span className="text-xs font-bold text-slate-900 truncate block mt-0.5">
                {isFaculty ? `${facultyDepartment} Dept` : 'SRTMUN, Nanded'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Actions matching reference mockup */}
      <div className="space-y-2.5 pt-1 max-w-[500px] mx-auto w-full">
        <button
          onClick={() => setViewMode('desktop')}
          className="w-full py-3.5 bg-[#0a2356] hover:bg-[#071a42] text-white rounded-2xl font-bold text-xs shadow-md flex items-center justify-center space-x-2 active:scale-95 transition-all"
        >
          <Laptop className="w-4 h-4 text-white" />
          <span>Open Full Desktop ERP Portal</span>
        </button>

        <button
          onClick={logout}
          className="w-full py-3 bg-[#fee2e2]/70 hover:bg-[#fecaca] text-[#b91c1c] rounded-2xl font-bold text-xs border border-rose-200/80 flex items-center justify-center space-x-2 active:scale-95 transition-all"
        >
          <LogOut className="w-4 h-4 text-[#b91c1c]" />
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
              {/* Avatar Selector with Upload Photo feature */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-700 flex items-center space-x-1">
                    <Camera className="w-3.5 h-3.5 text-blue-600" />
                    <span>ID Card Photo</span>
                  </label>
                  <span className="text-[10px] text-blue-600 font-semibold">Upload Photo or Pick Preset</span>
                </div>
                <div className="flex items-center space-x-2 overflow-x-auto pb-1.5">
                  {/* Upload Your Photo Tile */}
                  <label className="flex flex-col items-center justify-center w-12 h-12 rounded-xl border-2 border-dashed border-blue-400 bg-blue-50 hover:bg-blue-100 cursor-pointer transition-all shrink-0 group">
                    <UploadCloud className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                    <span className="text-[8px] font-bold text-blue-800">Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleModalPhotoUpload}
                      className="hidden"
                    />
                  </label>

                  {/* If user has custom uploaded photo, show it with verified checkmark */}
                  {editAvatar && !PRESET_AVATARS.includes(editAvatar) && (
                    <button
                      type="button"
                      onClick={() => setEditAvatar(editAvatar)}
                      className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border-2 border-blue-600 ring-2 ring-blue-500/30 scale-105"
                      title="Your custom uploaded photo"
                    >
                      <img src={editAvatar} alt="custom photo" className="w-full h-full object-cover object-top" />
                      <div className="absolute inset-0 bg-blue-600/30 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white stroke-[3]" />
                      </div>
                    </button>
                  )}

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
