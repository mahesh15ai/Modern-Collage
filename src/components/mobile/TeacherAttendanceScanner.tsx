'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Camera,
  CheckCircle2,
  XCircle,
  Users,
  Search,
  ScanLine,
  RefreshCw,
  Clock,
  ShieldCheck,
  AlertCircle,
  X,
  Sparkles,
  BookOpen,
  Calendar,
  Lock,
  ChevronRight,
} from 'lucide-react';
import { StudentRecord, LectureAttendanceSession, AttendanceStudentStatus } from '@/types';
import {
  saveLectureAttendanceSession,
  subscribeToLectureAttendanceSession,
  saveAttendanceToFirestore,
} from '@/services/firestoreService';
import { Html5Qrcode } from 'html5-qrcode';

interface Props {
  onClose: () => void;
}

export const TeacherAttendanceScanner: React.FC<Props> = ({ onClose }) => {
  const { currentUser, students, attendance, recordAttendance } = useApp();

  const isClassTeacher = currentUser.role === 'faculty' || currentUser.role === 'admin';
  const teacherName = currentUser.name || 'Class Teacher';
  const teacherId = currentUser.id || 'FAC-001';

  // Determine Class / Subject for this session
  const defaultClassName = currentUser.department
    ? `TY B.Sc ${currentUser.department}`
    : 'TY B.Sc Computer Science';

  const [selectedClass, setSelectedClass] = useState<string>(defaultClassName);
  const [selectedSubject, setSelectedSubject] = useState<string>('Data Structures & Algorithms');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'camera' | 'roster'>('camera');

  // Scanner state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [lastScannedMessage, setLastScannedMessage] = useState<string | null>(null);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isFinalized, setIsFinalized] = useState(false);

  const todayDate = new Date().toISOString().split('T')[0];
  const sessionId = `LECTURE-ATT-${todayDate}-${selectedClass.replace(/[^a-zA-Z0-9]/g, '_')}`;

  // Filter students enrolled in the selected class
  const classStudents = students.filter(
    (s) =>
      !s.course ||
      s.course.toLowerCase().includes('computer science') ||
      s.course.toLowerCase().includes(selectedClass.toLowerCase()) ||
      students.length <= 5
  );

  // Live session state (scanned attendance map)
  const [sessionData, setSessionData] = useState<LectureAttendanceSession>(() => {
    // Initial map: every student begins as ABSENT
    const initialMap: Record<string, AttendanceStudentStatus> = {};
    classStudents.forEach((st) => {
      initialMap[st.id] = {
        studentId: st.id,
        studentName: st.name,
        rollNo: st.rollNo || 'CS-000',
        prn: st.prn,
        course: st.course || selectedClass,
        status: 'Absent',
        verifiedByTeacher: false,
      };
    });

    return {
      id: sessionId,
      date: todayDate,
      subjectCode: 'CS-501',
      subjectName: selectedSubject,
      className: selectedClass,
      teacherId,
      teacherName,
      totalEnrolled: classStudents.length,
      presentCount: 0,
      absentCount: classStudents.length,
      status: 'In Progress',
      scannedStudents: initialMap,
      updatedAt: new Date().toISOString(),
    };
  });

  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Subscribe to realtime session in Firestore
  useEffect(() => {
    const unsub = subscribeToLectureAttendanceSession(sessionId, (remoteSession) => {
      if (remoteSession && remoteSession.scannedStudents) {
        setSessionData(remoteSession);
        if (remoteSession.status === 'Completed') {
          setIsFinalized(true);
        }
      }
    });

    return () => unsub();
  }, [sessionId]);

  // Mark student present function
  const handleMarkPresent = async (studentId: string, studentName?: string) => {
    const targetStudent = students.find((s) => s.id === studentId);
    const name = studentName || targetStudent?.name || 'Student';
    const roll = targetStudent?.rollNo || 'CS-000';
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setSessionData((prev) => {
      const currentStudentStatus = prev.scannedStudents[studentId];
      if (currentStudentStatus?.status === 'Present') {
        return prev; // Already present
      }

      const updatedScanned = {
        ...prev.scannedStudents,
        [studentId]: {
          studentId,
          studentName: name,
          rollNo: roll,
          prn: targetStudent?.prn,
          course: targetStudent?.course || selectedClass,
          status: 'Present' as const,
          scannedAt: nowTime,
          verifiedByTeacher: true,
          teacherId,
          teacherName,
        },
      };

      const presentCount = Object.values(updatedScanned).filter((s) => s.status === 'Present').length;
      const absentCount = Math.max(0, prev.totalEnrolled - presentCount);

      const updatedSession: LectureAttendanceSession = {
        ...prev,
        presentCount,
        absentCount,
        scannedStudents: updatedScanned,
        updatedAt: new Date().toISOString(),
      };

      // Save to Cloud Firestore
      saveLectureAttendanceSession(updatedSession).catch((err) =>
        console.warn('Failed to save lecture attendance session to Firestore:', err)
      );

      // Also update the student's personal AttendanceSummary in Firestore so student's app reflects immediately!
      const newPresent = attendance.present + 1;
      const newTotal = attendance.totalClasses + 1;
      const newPct = Math.round((newPresent / newTotal) * 100);

      const studentSummary = {
        ...attendance,
        present: newPresent,
        totalClasses: newTotal,
        overallPercentage: newPct,
      };

      saveAttendanceToFirestore(studentId, studentSummary).catch((e) =>
        console.warn('Failed to update student attendance summary:', e)
      );

      return updatedSession;
    });

    setLastScannedMessage(`Verified & Marked Present: ${name} (Roll: ${roll}) ✓`);
    setTimeout(() => {
      setLastScannedMessage(null);
    }, 4500);
  };

  // Toggle student absent / present manually by teacher
  const handleToggleStudent = (studentId: string) => {
    const current = sessionData.scannedStudents[studentId]?.status;
    if (current === 'Present') {
      // Toggle back to absent
      setSessionData((prev) => {
        const student = students.find((s) => s.id === studentId);
        const updatedScanned = {
          ...prev.scannedStudents,
          [studentId]: {
            studentId,
            studentName: student?.name || 'Student',
            rollNo: student?.rollNo || 'CS-000',
            course: student?.course || selectedClass,
            status: 'Absent' as const,
            verifiedByTeacher: false,
          },
        };
        const presentCount = Object.values(updatedScanned).filter((s) => s.status === 'Present').length;
        const updatedSession: LectureAttendanceSession = {
          ...prev,
          presentCount,
          absentCount: Math.max(0, prev.totalEnrolled - presentCount),
          scannedStudents: updatedScanned,
          updatedAt: new Date().toISOString(),
        };
        saveLectureAttendanceSession(updatedSession).catch(() => {});
        return updatedSession;
      });
    } else {
      handleMarkPresent(studentId);
    }
  };

  // Start Camera QR Scanner
  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;

    if (activeTab === 'camera') {
      const qrRegionId = 'teacher-qr-reader';
      setCameraError(null);

      // Short delay to ensure container element is mounted
      const timer = setTimeout(() => {
        const container = document.getElementById(qrRegionId);
        if (!container) return;

        try {
          html5QrCode = new Html5Qrcode(qrRegionId);
          scannerRef.current = html5QrCode;

          html5QrCode
            .start(
              { facingMode: 'environment' },
              {
                fps: 10,
                qrbox: { width: 220, height: 220 },
              },
              (decodedText) => {
                // QR Decoded successfully!
                try {
                  const parsed = JSON.parse(decodedText);
                  if (parsed.studentId) {
                    handleMarkPresent(parsed.studentId, parsed.name);
                  } else if (parsed.app?.includes('ATTENDANCE')) {
                    handleMarkPresent(parsed.studentId || 'STU-001', parsed.name);
                  }
                } catch (e) {
                  // If raw text or id was encoded
                  const matched = students.find(
                    (s) =>
                      s.id === decodedText ||
                      s.rollNo?.toLowerCase() === decodedText.toLowerCase() ||
                      decodedText.includes(s.id)
                  );
                  if (matched) {
                    handleMarkPresent(matched.id, matched.name);
                  } else {
                    setLastScannedMessage(`QR Code Scanned: ${decodedText}`);
                  }
                }
              },
              () => {
                // ignore scanning frame misses
              }
            )
            .then(() => {
              setCameraActive(true);
            })
            .catch((err) => {
              console.warn('Camera start error:', err);
              setCameraActive(false);
              setCameraError('Camera access unavailable or permission denied. You can tap any student below to mark attendance.');
            });
        } catch (err: any) {
          console.warn('Html5Qrcode init error:', err);
          setCameraActive(false);
          setCameraError('Camera module initialization failed.');
        }
      }, 300);

      return () => {
        clearTimeout(timer);
        if (html5QrCode && html5QrCode.isScanning) {
          html5QrCode.stop().catch(() => {}).finally(() => {
            html5QrCode?.clear();
          });
        }
      };
    }
  }, [activeTab]);

  // Finalize attendance session
  const handleFinalizeAttendance = async () => {
    setIsFinalizing(true);
    try {
      const finalSession: LectureAttendanceSession = {
        ...sessionData,
        status: 'Completed',
        updatedAt: new Date().toISOString(),
      };
      await saveLectureAttendanceSession(finalSession);
      setIsFinalized(true);
      setLastScannedMessage(
        `Attendance Locked! ${finalSession.presentCount} Present, ${finalSession.absentCount} Absent.`
      );
    } catch (e) {
      console.error('Error finalizing attendance:', e);
    } finally {
      setIsFinalizing(false);
    }
  };

  const filteredStudents = classStudents.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.rollNo?.toLowerCase().includes(q) ||
      s.prn?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 font-sans animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
        {/* Modal Header */}
        <header className="bg-white border-b border-slate-100 px-4 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200/80 flex items-center justify-center text-[#1d4ed8] shrink-0">
              <ScanLine className="w-5 h-5 text-[#1d4ed8]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <h3 className="font-extrabold text-sm text-slate-900 truncate">
                  Class Teacher Attendance Scanner
                </h3>
                <span className="text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full shrink-0">
                  Class Teacher
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                Teacher: <strong>{teacherName}</strong> • {selectedSubject}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors shrink-0"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* Live Counters Banner */}
        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-100 flex items-center justify-between shrink-0 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-medium">Enrolled:</span>
            <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200">
              {classStudents.length} Students
            </span>
          </div>

          <div className="flex items-center space-x-2.5">
            <span className="inline-flex items-center space-x-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Present: {sessionData.presentCount}</span>
            </span>

            <span className="inline-flex items-center space-x-1 text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full font-bold text-[11px]">
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>Absent: {sessionData.absentCount}</span>
            </span>
          </div>
        </div>

        {/* Success Toast / Alert Message */}
        {lastScannedMessage && (
          <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between shrink-0 shadow-sm animate-pulse">
            <div className="flex items-center space-x-2 truncate">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="truncate">{lastScannedMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setLastScannedMessage(null)}
              className="text-white/80 hover:text-white shrink-0 ml-2"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tab Switcher: [ Camera Scanner ] | [ Student Roster ] */}
        <div className="px-4 pt-3 shrink-0">
          <div className="flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setActiveTab('camera')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                activeTab === 'camera'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Camera QR Scanner</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('roster')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                activeTab === 'roster'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Student Roster ({sessionData.presentCount}/{classStudents.length})</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {/* TAB 1: Live Camera QR Scanner */}
          {activeTab === 'camera' && (
            <div className="space-y-3">
              {/* Camera Scanner Viewfinder */}
              <div className="relative w-full rounded-2xl overflow-hidden bg-slate-950 border-2 border-slate-700 shadow-inner flex flex-col items-center justify-center min-h-[240px]">
                {/* HTML5 QR Code Mount Node */}
                <div id="teacher-qr-reader" className="w-full h-full [&>video]:rounded-2xl" />

                {!cameraActive && !cameraError && (
                  <div className="p-6 text-center text-white/80 space-y-2">
                    <ScanLine className="w-10 h-10 mx-auto text-blue-400 animate-pulse" />
                    <p className="text-xs font-semibold">Initializing Camera Scanner...</p>
                  </div>
                )}

                {cameraError && (
                  <div className="p-5 text-center text-rose-300 space-y-2">
                    <AlertCircle className="w-8 h-8 mx-auto text-rose-400" />
                    <p className="text-xs leading-relaxed max-w-xs">{cameraError}</p>
                  </div>
                )}
              </div>

              <div className="bg-blue-50/80 rounded-2xl p-3 border border-blue-100 flex items-start space-x-2 text-xs text-blue-900">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <strong>Class Teacher Rule:</strong> Point your camera at the student’s phone screen. When scanned, attendance is immediately marked <strong>PRESENT</strong> and synced in real time. Unscanned students remain <strong>ABSENT</strong>.
                </p>
              </div>

              {/* Quick Tap-to-Scan List (Helper below scanner) */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs text-slate-900">
                    Quick Scan Students (Tap to Mark Present)
                  </h4>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {classStudents.length} Enrolled
                  </span>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {classStudents.map((st) => {
                    const statusObj = sessionData.scannedStudents[st.id];
                    const isPresent = statusObj?.status === 'Present';

                    return (
                      <div
                        key={st.id}
                        onClick={() => handleToggleStudent(st.id)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isPresent
                            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                            : 'bg-white border-slate-200/80 hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              isPresent
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {isPresent ? '✓' : st.name.charAt(0)}
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs font-bold truncate leading-tight">{st.name}</p>
                            <p className="text-[10px] text-slate-500 truncate mt-0.5">
                              Roll: {st.rollNo || 'CS-000'} • PRN: {st.prn || 'N/A'}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 flex items-center space-x-1 ${
                            isPresent
                              ? 'bg-emerald-500 text-white'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {isPresent ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-white" />
                              <span>Present ({statusObj.scannedAt || 'Now'})</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-rose-500" />
                              <span>Absent (Tap to Scan)</span>
                            </>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Full Student Roster Register */}
          {activeTab === 'roster' && (
            <div className="space-y-3">
              {/* Search input */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search student by name or roll number..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                />
              </div>

              {/* Roster Table / List */}
              <div className="space-y-2">
                {filteredStudents.map((st) => {
                  const statusObj = sessionData.scannedStudents[st.id];
                  const isPresent = statusObj?.status === 'Present';

                  return (
                    <div
                      key={st.id}
                      className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3 min-w-0 flex-1 pr-2">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                            isPresent
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {st.name.charAt(0)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h5 className="font-bold text-xs text-slate-900 truncate">{st.name}</h5>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            Roll No: <strong>{st.rollNo || 'CS-000'}</strong> • PRN: {st.prn || 'N/A'}
                          </p>
                          <div className="flex items-center space-x-1.5 mt-1">
                            {isPresent ? (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full inline-flex items-center space-x-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Present • Scanned at {statusObj.scannedAt || 'Now'}</span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full inline-flex items-center space-x-1">
                                <XCircle className="w-3 h-3 text-rose-500" />
                                <span>Absent • Not Scanned</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleStudent(st.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                          isPresent
                            ? 'bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                        }`}
                      >
                        {isPresent ? 'Mark Absent' : 'Scan / Present'}
                      </button>
                    </div>
                  );
                })}

                {filteredStudents.length === 0 && (
                  <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-xs text-slate-500 font-medium">
                      No students match &ldquo;{searchQuery}&rdquo;.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer: Finalize / Lock Attendance */}
        <footer className="bg-white border-t border-slate-100 p-3 sm:p-4 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500">
            <span>Status: </span>
            <strong className={isFinalized ? 'text-emerald-700' : 'text-amber-800'}>
              {isFinalized ? 'Completed & Locked' : 'Live Scanning Session'}
            </strong>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              Done / Close
            </button>

            <button
              type="button"
              onClick={handleFinalizeAttendance}
              disabled={isFinalizing || isFinalized}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm active:scale-95 transition-all"
            >
              <Lock className="w-3.5 h-3.5 text-white" />
              <span>{isFinalized ? 'Attendance Locked ✓' : isFinalizing ? 'Saving...' : 'Lock Attendance'}</span>
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};
