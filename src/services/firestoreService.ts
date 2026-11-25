import {
  collection,
  doc,
  getDocs,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import {
  StudentRecord,
  FacultyRecord,
  Department,
  Course,
  NoticeItem,
  EventItem,
  ComplaintItem,
  UserProfile,
  StudentResult,
  StudyMaterial,
  AttendanceSummary,
  TimetableSlot,
} from '@/types';
import {
  MOCK_STUDENTS,
  MOCK_FACULTY,
  MOCK_DEPARTMENTS,
  MOCK_COURSES,
  MOCK_NOTICES,
  MOCK_EVENTS,
  MOCK_COMPLAINTS,
} from '@/lib/mockData';

// Firestore Collection Names
export const COLLECTIONS = {
  USERS: 'users',
  STUDENTS: 'students',
  FACULTY: 'faculty',
  DEPARTMENTS: 'departments',
  COURSES: 'courses',
  ATTENDANCE: 'attendance',
  EXAMS: 'exams',
  RESULTS: 'results',
  NOTICES: 'notices',
  EVENTS: 'events',
  COMPLAINTS: 'complaints',
  MATERIALS: 'study_materials',
  TIMETABLE: 'timetable',
};

// ---------------------------------------------------------------------------
// Realtime Firestore Subscriptions (onSnapshot)
// ---------------------------------------------------------------------------

/**
 * Subscribe to Realtime Students collection
 */
export function subscribeToStudents(
  callback: (students: StudentRecord[]) => void
): () => void {
  if (!isFirebaseConfigured) return () => { };
  try {
    const q = collection(db, COLLECTIONS.STUDENTS);
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => d.data() as StudentRecord);
        callback(items);
      },
      (error) => {
        console.warn('Realtime students listener error:', error?.message);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Could not attach students listener:', err);
    return () => { };
  }
}

/**
 * Subscribe to Realtime Faculty collection
 */
export function subscribeToFaculty(
  callback: (faculty: FacultyRecord[]) => void
): () => void {
  if (!isFirebaseConfigured) return () => { };
  try {
    const q = collection(db, COLLECTIONS.FACULTY);
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => d.data() as FacultyRecord);
        callback(items);
      },
      (error) => {
        console.warn('Realtime faculty listener error:', error?.message);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Could not attach faculty listener:', err);
    return () => { };
  }
}

/**
 * Subscribe to Realtime Notices collection
 */
export function subscribeToNotices(
  callback: (notices: NoticeItem[]) => void
): () => void {
  if (!isFirebaseConfigured) return () => { };
  try {
    const q = collection(db, COLLECTIONS.NOTICES);
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => d.data() as NoticeItem);
        // Sort newest first
        callback(items);
      },
      (error) => {
        console.warn('Realtime notices listener error:', error?.message);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Could not attach notices listener:', err);
    return () => { };
  }
}

/**
 * Subscribe to Realtime Events collection
 */
export function subscribeToEvents(
  callback: (events: EventItem[]) => void
): () => void {
  if (!isFirebaseConfigured) return () => { };
  try {
    const q = collection(db, COLLECTIONS.EVENTS);
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => d.data() as EventItem);
        callback(items);
      },
      (error) => {
        console.warn('Realtime events listener error:', error?.message);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Could not attach events listener:', err);
    return () => { };
  }
}

/**
 * Subscribe to Realtime Complaints collection
 */
export function subscribeToComplaints(
  callback: (complaints: ComplaintItem[]) => void
): () => void {
  if (!isFirebaseConfigured) return () => { };
  try {
    const q = collection(db, COLLECTIONS.COMPLAINTS);
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => d.data() as ComplaintItem);
        callback(items);
      },
      (error) => {
        console.warn('Realtime complaints listener error:', error?.message);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Could not attach complaints listener:', err);
    return () => { };
  }
}

/**
 * Subscribe to Realtime Student Results collection
 */
export function subscribeToResults(
  callback: (results: StudentResult[]) => void
): () => void {
  if (!isFirebaseConfigured) return () => { };
  try {
    const q = collection(db, COLLECTIONS.RESULTS);
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => d.data() as StudentResult);
        callback(items);
      },
      (error) => {
        console.warn('Realtime results listener error:', error?.message);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Could not attach results listener:', err);
    return () => { };
  }
}

/**
 * Subscribe to Realtime Study Materials collection
 */
export function subscribeToStudyMaterials(
  callback: (materials: StudyMaterial[]) => void
): () => void {
  if (!isFirebaseConfigured) return () => { };
  try {
    const q = collection(db, COLLECTIONS.MATERIALS);
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => d.data() as StudyMaterial);
        callback(items);
      },
      (error) => {
        console.warn('Realtime materials listener error:', error?.message);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Could not attach materials listener:', err);
    return () => { };
  }
}

// ---------------------------------------------------------------------------
// Firestore Realtime Write & Mutation Operations
// ---------------------------------------------------------------------------

/**
 * Save student and profile to Firestore
 */
export async function saveStudentToFirestore(
  student: StudentRecord,
  profile: UserProfile
): Promise<void> {
  if (!isFirebaseConfigured) return;
  try {
    await setDoc(doc(db, COLLECTIONS.STUDENTS, student.id), student);
    await setDoc(doc(db, COLLECTIONS.USERS, profile.id), profile);
  } catch (error: any) {
    console.warn('Error saving student to Firestore:', error?.message);
    throw error;
  }
}

/**
 * Update student record in Cloud Firestore (CRUD: Update)
 */
export async function updateStudentInFirestore(
  student: StudentRecord
): Promise<void> {
  if (!isFirebaseConfigured) return;
  try {
    await setDoc(doc(db, COLLECTIONS.STUDENTS, student.id), student, { merge: true });
    // Also update profile in users collection
    const userRef = doc(db, COLLECTIONS.USERS, student.id);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      await updateDoc(userRef, {
        name: student.name,
        email: student.email,
        phone: student.phone,
        department: student.department,
        course: student.course,
        semester: student.semester,
        rollNo: student.rollNo,
        prn: student.prn,
      });
    }
  } catch (error: any) {
    console.warn('Error updating student in Firestore:', error?.message);
    throw error;
  }
}

/**
 * Delete student record from Cloud Firestore (CRUD: Delete)
 */
export async function deleteStudentFromFirestore(
  studentId: string
): Promise<void> {
  if (!isFirebaseConfigured) return;
  try {
    await deleteDoc(doc(db, COLLECTIONS.STUDENTS, studentId));
    await deleteDoc(doc(db, COLLECTIONS.USERS, studentId)).catch(() => {});
  } catch (error: any) {
    console.warn('Error deleting student from Firestore:', error?.message);
    throw error;
  }
}

/**
 * Save faculty and profile to Firestore
 */
export async function saveFacultyToFirestore(
  faculty: FacultyRecord,
  profile: UserProfile
): Promise<void> {
  if (!isFirebaseConfigured) return;
  try {
    await setDoc(doc(db, COLLECTIONS.FACULTY, faculty.id), faculty);
    await setDoc(doc(db, COLLECTIONS.USERS, profile.id), profile);
  } catch (error: any) {
    console.warn('Error saving faculty to Firestore:', error?.message);
    throw error;
  }
}

/**
 * Update existing faculty in Firestore
 */
export async function updateFacultyInFirestore(
  faculty: FacultyRecord
): Promise<void> {
  if (!isFirebaseConfigured) return;
  try {
    await setDoc(doc(db, COLLECTIONS.FACULTY, faculty.id), faculty, { merge: true });
    // Also sync partial fields to users collection if user doc exists
    await setDoc(
      doc(db, COLLECTIONS.USERS, faculty.id),
      {
        name: faculty.name,
        designation: faculty.designation,
        department: faculty.department,
        employeeId: faculty.employeeId,
        phone: faculty.phone,
        qualification: faculty.qualification,
        classTeacherOf: faculty.classTeacherOf || '',
        subjectsAssigned: faculty.subjectsAssigned || [],
      },
      { merge: true }
    ).catch(() => {});
  } catch (error: any) {
    console.warn('Error updating faculty in Firestore:', error?.message);
    throw error;
  }
}

/**
 * Subscribe to Realtime Timetable collection
 */
export function subscribeToTimetable(
  callback: (slots: TimetableSlot[]) => void
): () => void {
  if (!isFirebaseConfigured) return () => {};
  try {
    const q = collection(db, COLLECTIONS.TIMETABLE);
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => d.data() as TimetableSlot);
        callback(items);
      },
      (error) => {
        console.warn('Realtime timetable listener error:', error?.message);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('Could not attach timetable listener:', err);
    return () => {};
  }
}

/**
 * Save Timetable Slot to Cloud Firestore
 */
export async function saveTimetableSlotToFirestore(
  slot: TimetableSlot
): Promise<void> {
  if (!isFirebaseConfigured) return;
  try {
    await setDoc(doc(db, COLLECTIONS.TIMETABLE, slot.id), slot);
  } catch (error: any) {
    console.warn('Error saving timetable slot to Firestore:', error?.message);
    throw error;
  }
}

/**
 * Delete a Timetable Slot from Cloud Firestore
 */
export async function deleteTimetableSlotFromFirestore(
  slotId: string
): Promise<void> {
  if (!isFirebaseConfigured) return;
  try {
    await deleteDoc(doc(db, COLLECTIONS.TIMETABLE, slotId));
  } catch (error: any) {
    console.warn('Error deleting timetable slot from Firestore:', error?.message);
    throw error;
  }
}

/**
 * Publish a new Notice / Circular to Cloud Firestore
 */
export async function saveNoticeToFirestore(notice: NoticeItem): Promise<void> {
  if (!isFirebaseConfigured) return;
  try {
    await setDoc(doc(db, COLLECTIONS.NOTICES, notice.id), notice);
  } catch (error: any) {
    console.warn('Error saving notice to Firestore:', error?.message);
    throw error;
  }
}

/**
 * Delete a Notice from Cloud Firestore
 */
export async function deleteNoticeFromFirestore(noticeId: string): Promise<void> {
  if (!isFirebaseConfigured) return;
  try {
    await deleteDoc(doc(db, COLLECTIONS.NOTICES, noticeId));
  } catch (error: any) {
    console.warn('Error deleting notice from Firestore:', error?.message);
    throw error;
  }
}

/**
 * Save an Event to Cloud Firestore
 */
export async function saveEventToFirestore(event: EventItem): Promise<void> {
  if (!isFirebaseConfigured) return;
  try {
    await setDoc(doc(db, COLLECTIONS.EVENTS, event.id), event);
  } catch (error: any) {
    console.warn('Error saving event to Firestore:', error?.message);
    throw error;
  }
}

/**
 * Register student for an event in Cloud Firestore (One student = one registration)
 */
export async function registerForEventInFirestore(
  eventId: string,
  userId?: string
): Promise<void> {
  if (!isFirebaseConfigured) return;
  try {
    const eventRef = doc(db, COLLECTIONS.EVENTS, eventId);
    const snap = await getDoc(eventRef);
    if (snap.exists()) {
      const data = snap.data() as EventItem;
      const registeredUserIds = data.registeredUserIds || [];
      if (userId && registeredUserIds.includes(userId)) {
        // Already registered in Firestore, skip duplicate
        return;
      }
      const updatedUserIds = userId ? [...registeredUserIds, userId] : registeredUserIds;
      await updateDoc(eventRef, {
        registeredCount: (data.registeredCount || 0) + 1,
        registeredUserIds: updatedUserIds,
      });
    }
  } catch (error: any) {
    console.warn('Error registering for event in Firestore:', error?.message);
    throw error;
  }
}

/**
 * Save student grievance / complaint to Cloud Firestore
 */
export async function saveComplaintToFirestore(
  complaint: ComplaintItem
): Promise<void> {
  if (!isFirebaseConfigured) return;
  try {
    await setDoc(doc(db, COLLECTIONS.COMPLAINTS, complaint.id), complaint);
  } catch (error: any) {
    console.warn('Error saving complaint to Firestore:', error?.message);
    throw error;
  }
}

/**
 * Update complaint status (Resolved / In Progress)
 */
export async function updateComplaintStatusInFirestore(
  complaintId: string,
  status: 'In Progress' | 'Resolved' | 'Pending'
): Promise<void> {
  if (!isFirebaseConfigured) return;
  try {
    const ref = doc(db, COLLECTIONS.COMPLAINTS, complaintId);
    await updateDoc(ref, {
      status,
      resolvedAt: status === 'Resolved' ? new Date().toISOString() : null,
    });
  } catch (error: any) {
    console.warn('Error updating complaint status in Firestore:', error?.message);
    throw error;
  }
}

/**
 * Save / Publish examination result to Cloud Firestore
 */
export async function saveStudentResultToFirestore(
  result: StudentResult
): Promise<void> {
  if (!isFirebaseConfigured) return;
  try {
    await setDoc(doc(db, COLLECTIONS.RESULTS, result.id), result);
  } catch (error: any) {
    console.warn('Error saving student result to Firestore:', error?.message);
    throw error;
  }
}

/**
 * Save study material / notes to Cloud Firestore
 */
export async function saveStudyMaterialToFirestore(
  material: StudyMaterial
): Promise<void> {
  if (!isFirebaseConfigured) return;
  try {
    await setDoc(doc(db, COLLECTIONS.MATERIALS, material.id), material);
  } catch (error: any) {
    console.warn('Error saving study material to Firestore:', error?.message);
    throw error;
  }
}

/**
 * Save attendance update to Cloud Firestore
 */
export async function saveAttendanceToFirestore(
  studentId: string,
  attendance: AttendanceSummary
): Promise<void> {
  if (!isFirebaseConfigured) return;
  try {
    await setDoc(doc(db, COLLECTIONS.ATTENDANCE, studentId), attendance);
  } catch (error: any) {
    console.warn('Error saving attendance to Firestore:', error?.message);
    throw error;
  }
}

/**
 * Fetch all students from Cloud Firestore (one-time fetch)
 */
export async function fetchStudentsFromFirestore(): Promise<StudentRecord[]> {
  if (!isFirebaseConfigured) return [];
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.STUDENTS));
    if (snap.empty) return [];
    return snap.docs.map((d) => d.data() as StudentRecord);
  } catch (error: any) {
    console.warn('Could not fetch students from Firestore:', error?.message);
    return [];
  }
}

/**
 * Fetch all faculty from Cloud Firestore (one-time fetch)
 */
export async function fetchFacultyFromFirestore(): Promise<FacultyRecord[]> {
  if (!isFirebaseConfigured) return [];
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.FACULTY));
    if (snap.empty) return [];
    return snap.docs.map((d) => d.data() as FacultyRecord);
  } catch (error: any) {
    console.warn('Could not fetch faculty from Firestore:', error?.message);
    return [];
  }
}

/**
 * Seed initial sample college data to Cloud Firestore
 */
export async function seedCampusDataToFirestore(): Promise<{ count: number }> {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase credentials are not configured in .env.local');
  }

  let count = 0;

  for (const s of MOCK_STUDENTS) {
    await setDoc(doc(db, COLLECTIONS.STUDENTS, s.id), s);
    count++;
  }

  for (const f of MOCK_FACULTY) {
    await setDoc(doc(db, COLLECTIONS.FACULTY, f.id), f);
    count++;
  }

  for (const d of MOCK_DEPARTMENTS) {
    await setDoc(doc(db, COLLECTIONS.DEPARTMENTS, d.id), d);
    count++;
  }

  for (const c of MOCK_COURSES) {
    await setDoc(doc(db, COLLECTIONS.COURSES, c.id), c);
    count++;
  }

  for (const n of MOCK_NOTICES) {
    await setDoc(doc(db, COLLECTIONS.NOTICES, n.id), n);
    count++;
  }

  for (const e of MOCK_EVENTS) {
    await setDoc(doc(db, COLLECTIONS.EVENTS, e.id), e);
    count++;
  }

  for (const comp of MOCK_COMPLAINTS) {
    await setDoc(doc(db, COLLECTIONS.COMPLAINTS, comp.id), comp);
    count++;
  }

  return { count };
}

/**
 * Clear all dummy records from Cloud Firestore
 */
export async function clearAllFirestoreData(): Promise<{ deleted: number }> {
  if (!isFirebaseConfigured) return { deleted: 0 };
  let deleted = 0;
  const collectionsToClear = [
    COLLECTIONS.STUDENTS,
    COLLECTIONS.FACULTY,
    COLLECTIONS.NOTICES,
    COLLECTIONS.EVENTS,
    COLLECTIONS.COMPLAINTS,
    COLLECTIONS.RESULTS,
    COLLECTIONS.MATERIALS,
  ];
  for (const collName of collectionsToClear) {
    const snap = await getDocs(collection(db, collName));
    for (const d of snap.docs) {
      await deleteDoc(d.ref);
      deleted++;
    }
  }
  return { deleted };
}
