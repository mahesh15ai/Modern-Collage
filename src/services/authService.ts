import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  User as FirebaseUser,
  getAuth,
} from 'firebase/auth';
import { initializeApp, getApps } from 'firebase/app';
import { doc, getDoc, setDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '@/lib/firebase';
import { UserProfile, UserRole } from '@/types';
import {
  MOCK_STUDENT_USER,
  MOCK_FACULTY_USER,
  MOCK_ADMIN_USER,
} from '@/lib/mockData';

export interface RegisteredAccount {
  email: string;
  password: string;
  profile: UserProfile;
  dispatchedAt: string;
}

export const DEMO_CREDENTIALS = {
  student: {
    email: '',
    password: '',
    role: 'student' as UserRole,
    user: MOCK_STUDENT_USER,
  },
  faculty: {
    email: '',
    password: '',
    role: 'faculty' as UserRole,
    user: MOCK_FACULTY_USER,
  },
  admin: {
    email: '',
    password: '',
    role: 'admin' as UserRole,
    user: MOCK_ADMIN_USER,
  },
};

export const INITIAL_ACCOUNTS: RegisteredAccount[] = [
  {
    email: 'moderncsitned@gmail.com',
    password: 'Modern@26',
    profile: {
      id: 'PNCfILiPHfgVwh4NxhS9nhwz1f63',
      name: 'Modern College',
      email: 'moderncsitned@gmail.com',
      role: 'admin',
      department: 'College Administration',
      designation: 'Principal & Chief Administrator',
      phone: '+91 94220 99887',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    },
    dispatchedAt: new Date().toLocaleString('en-IN'),
  },
];

// Load registered accounts from localStorage if in browser
export function getStoredAccounts(): RegisteredAccount[] {
  if (typeof window === 'undefined') return INITIAL_ACCOUNTS;
  try {
    const raw = localStorage.getItem('smart_campus_accounts');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Could not read stored accounts', e);
  }
  return INITIAL_ACCOUNTS;
}

export function saveStoredAccounts(accounts: RegisteredAccount[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('smart_campus_accounts', JSON.stringify(accounts));
  } catch (e) {
    console.warn('Could not save accounts', e);
  }
}

export function removeStoredAccount(email: string): void {
  if (typeof window === 'undefined') return;
  try {
    const normalized = email.trim().toLowerCase();
    const accounts = getStoredAccounts();
    const filtered = accounts.filter((a) => a.email.toLowerCase() !== normalized);
    saveStoredAccounts(filtered);
  } catch (e) {
    console.warn('Could not remove stored account', e);
  }
}

export function purgeUnregisteredStudentAccounts(validStudentEmails: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    const validSet = new Set(validStudentEmails.map((e) => e.trim().toLowerCase()));
    const accounts = getStoredAccounts();
    const filtered = accounts.filter((a) => {
      // Keep admin and faculty accounts
      if (a.profile.role === 'admin' || a.profile.role === 'faculty') return true;
      // Only keep student accounts that are explicitly enrolled in students list
      return validSet.has(a.email.trim().toLowerCase());
    });
    saveStoredAccounts(filtered);
  } catch (e) {
    console.warn('Could not purge unregistered student accounts', e);
  }
}

export function clearAllLocalCaches(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('smart_campus_accounts');
      localStorage.removeItem('smart_campus_session');
    } catch (e) {
      console.warn('Could not clear local caches', e);
    }
  }
}

/**
 * Register a new Student or Faculty member in the Auth Registry
 */
export async function registerNewUserAccount(
  profile: UserProfile,
  password: string
): Promise<RegisteredAccount> {
  const normalizedEmail = profile.email.trim().toLowerCase();
  const newAccount: RegisteredAccount = {
    email: normalizedEmail,
    password,
    profile,
    dispatchedAt: new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  };

  // If live Firebase is configured, create Firebase Auth user and store profile in Firestore
  if (isFirebaseConfigured) {
    try {
      const secondaryAppName = 'SecondaryAuthProvisioning';
      const secApp =
        getApps().find((a) => a.name === secondaryAppName) ||
        initializeApp(auth.app.options, secondaryAppName);
      const secAuth = getAuth(secApp);
      try {
        const cred = await createUserWithEmailAndPassword(secAuth, normalizedEmail, password);
        if (cred.user) {
          profile.id = cred.user.uid;
        }
        await firebaseSignOut(secAuth);
      } catch (authErr: any) {
        console.warn('Firebase Auth user creation note:', authErr?.message);
      }

      const userDocRef = doc(db, 'users', profile.id);
      await setDoc(userDocRef, profile);
    } catch (err) {
      console.warn('Firebase Firestore save error:', err);
    }
  }

  // Save to persistent registry
  const currentAccounts = getStoredAccounts();
  const updated = [
    newAccount,
    ...currentAccounts.filter((a) => a.email.toLowerCase() !== normalizedEmail),
  ];
  saveStoredAccounts(updated);

  return newAccount;
}

/**
 * Register a new Admin user in Firebase Auth & Firestore
 */
export async function createAdminAccount(
  name: string,
  email: string,
  password: string,
  designation: string = 'Administrator / Principal'
): Promise<UserProfile> {
  const normalizedEmail = email.trim().toLowerCase();
  const adminId = `ADM-${Math.floor(100 + Math.random() * 900)}`;

  const adminProfile: UserProfile = {
    id: adminId,
    name: name.trim() || 'College Administrator',
    email: normalizedEmail,
    role: 'admin',
    department: 'Administration',
    designation: designation || 'College Administrator',
    phone: '+91 94220 99887',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  };

  if (isFirebaseConfigured) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      if (userCredential.user) {
        adminProfile.id = userCredential.user.uid;
      }
      const userDocRef = doc(db, 'users', adminProfile.id);
      await setDoc(userDocRef, adminProfile);
    } catch (authErr: any) {
      if (authErr?.code === 'auth/email-already-in-use') {
        const cred = await signInWithEmailAndPassword(auth, normalizedEmail, password);
        adminProfile.id = cred.user.uid;
        await setDoc(doc(db, 'users', cred.user.uid), adminProfile);
      } else {
        throw authErr;
      }
    }
  }

  // Save to persistent registry
  const currentAccounts = getStoredAccounts();
  const updated = [
    {
      email: normalizedEmail,
      password,
      profile: adminProfile,
      dispatchedAt: new Date().toLocaleString('en-IN'),
    },
    ...currentAccounts.filter((a) => a.email.toLowerCase() !== normalizedEmail),
  ];
  saveStoredAccounts(updated);

  return adminProfile;
}

/**
 * Sign in using Email and Password
 * Supports both live Firebase Auth and instant offline demo fallback.
 */
export async function loginWithEmail(
  email: string,
  password: string,
  requestedRole?: UserRole
): Promise<UserProfile> {
  const normalizedEmail = email.trim().toLowerCase();

  // If live Firebase is configured, authenticate with Firebase Auth
  if (isFirebaseConfigured) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
      const user = userCredential.user;

      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      const existingUser = userDocSnap.exists() ? (userDocSnap.data() as UserProfile) : null;

      // 1. Check if this is an Admin account
      if (
        normalizedEmail === 'moderncsitned@gmail.com' ||
        normalizedEmail.includes('admin') ||
        existingUser?.role === 'admin'
      ) {
        if (existingUser) return existingUser;
        const adminProfile: UserProfile = {
          id: user.uid,
          name: 'Modern College Administration',
          email: normalizedEmail,
          role: 'admin',
          department: 'Administration',
          designation: 'Principal & Chief Administrator',
          phone: '+91 94220 99887',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        };
        await setDoc(userDocRef, adminProfile, { merge: true });
        return adminProfile;
      }

      // 2. Check if this is a Faculty account
      const facQuery = query(collection(db, 'faculty'), where('email', '==', normalizedEmail));
      const facQuerySnap = await getDocs(facQuery);
      if (!facQuerySnap.empty) {
        const f = facQuerySnap.docs[0].data();
        const facProfile: UserProfile = {
          id: user.uid,
          name: f.name,
          email: normalizedEmail,
          role: 'faculty',
          phone: f.phone,
          department: f.department,
          designation: f.designation,
          workloadHours: f.workloadHours,
          classTeacherOf: f.classTeacherOf,
          subjectsAssigned: f.subjectsAssigned,
          employeeId: f.employeeId,
          avatar: f.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        };
        await setDoc(userDocRef, facProfile, { merge: true });
        return facProfile;
      }

      // 3. Check if this is an active enrolled Student in students collection
      const stuQuery = query(collection(db, 'students'), where('email', '==', normalizedEmail));
      const stuQuerySnap = await getDocs(stuQuery);
      if (!stuQuerySnap.empty) {
        const s = stuQuerySnap.docs[0].data();
        if (s.status === 'Suspended') {
          await firebaseSignOut(auth);
          throw new Error('Your student account has been suspended by College Administration.');
        }

        const studentProfile: UserProfile = {
          id: user.uid,
          name: s.name,
          email: normalizedEmail,
          role: 'student',
          phone: s.phone,
          department: s.department,
          course: s.course,
          semester: s.semester,
          rollNo: s.rollNo,
          prn: s.prn,
          avatar: s.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        };
        await setDoc(userDocRef, studentProfile, { merge: true });
        return studentProfile;
      }

      // 4. User authenticated in Firebase Auth, but does NOT exist in students/faculty/admin!
      // This means the student record was DELETED by the admin from the ERP.
      await firebaseSignOut(auth);
      await deleteDoc(userDocRef).catch(() => {});
      removeStoredAccount(normalizedEmail);
      throw new Error(
        'Student admission record not found. Your student account has been removed or revoked by College Administration.'
      );
    } catch (error: any) {
      if (
        error?.message?.includes('admission record not found') ||
        error?.message?.includes('suspended')
      ) {
        throw error;
      }
      console.warn("Firebase Auth error, checking local registry:", error?.message);
    }
  }

  // Check persistent registry for registered students/faculty/admins (offline / local fallback)
  const accounts = getStoredAccounts();
  const matched = accounts.find(
    (acc) => acc.email.toLowerCase() === normalizedEmail
  );

  if (matched) {
    if (matched.password === password) {
      return matched.profile;
    } else {
      throw new Error('Incorrect password. Please verify your institutional login credentials.');
    }
  }

  throw new Error('Account not found. Please verify your institutional email and password.');
}

/**
 * Sign in with Google Popup
 */
export async function loginWithGoogle(preferredRole: UserRole = 'student'): Promise<UserProfile> {
  if (isFirebaseConfigured) {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      const userEmail = (user.email || '').toLowerCase().trim();

      if (userEmail) {
        // Priority 1: Check if this user exists in faculty collection
        const facQuery = query(collection(db, 'faculty'), where('email', '==', userEmail));
        const facSnap = await getDocs(facQuery);
        if (!facSnap.empty) {
          const f = facSnap.docs[0].data();
          const facProfile: UserProfile = {
            id: user.uid,
            name: f.name || user.displayName || 'Faculty Member',
            email: userEmail,
            role: 'faculty',
            phone: f.phone,
            department: f.department,
            designation: f.designation,
            employeeId: f.employeeId,
            qualification: f.qualification,
            workloadHours: f.workloadHours,
            classTeacherOf: f.classTeacherOf,
            subjectsAssigned: f.subjectsAssigned,
            avatar: user.photoURL || f.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          };
          await setDoc(userDocRef, facProfile, { merge: true });
          return facProfile;
        }

        // Priority 2: Check if this user exists in students collection
        const stuQuery = query(collection(db, 'students'), where('email', '==', userEmail));
        const stuSnap = await getDocs(stuQuery);
        if (!stuSnap.empty) {
          const s = stuSnap.docs[0].data();
          if (s.status === 'Suspended') {
            await firebaseSignOut(auth);
            throw new Error('Your student account has been suspended by College Administration.');
          }
          const stuProfile: UserProfile = {
            id: user.uid,
            name: s.name || user.displayName || 'Student',
            email: userEmail,
            role: 'student',
            phone: s.phone,
            department: s.department,
            course: s.course,
            semester: s.semester,
            rollNo: s.rollNo,
            prn: s.prn,
            avatar: user.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          };
          await setDoc(userDocRef, stuProfile, { merge: true });
          return stuProfile;
        }

        // Priority 3: Check if Admin
        if (
          userEmail === 'moderncsitned@gmail.com' ||
          userEmail.includes('admin') ||
          (userDocSnap.exists() && (userDocSnap.data() as UserProfile).role === 'admin')
        ) {
          const adminProfile: UserProfile = {
            id: user.uid,
            name: user.displayName || 'Modern College Administration',
            email: userEmail,
            role: 'admin',
            department: 'Administration',
            designation: 'Principal & Chief Administrator',
          };
          await setDoc(userDocRef, adminProfile, { merge: true });
          return adminProfile;
        }

        // Non-admin, non-faculty, non-student: Block access
        await firebaseSignOut(auth);
        await deleteDoc(userDocRef).catch(() => {});
        throw new Error(
          'Student admission record not found for this Google account. Please contact College Administration.'
        );
      }
    } catch (error: any) {
      if (
        error?.message?.includes('admission record not found') ||
        error?.message?.includes('suspended')
      ) {
        throw error;
      }
      console.warn("Google Sign-In error:", error?.message);
    }
  }

  return preferredRole === 'admin'
    ? MOCK_ADMIN_USER
    : preferredRole === 'faculty'
      ? MOCK_FACULTY_USER
      : MOCK_STUDENT_USER;
}

/**
 * Sign out user
 */
export async function logoutUser(): Promise<void> {
  if (isFirebaseConfigured) {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.error("Sign out error", err);
    }
  }
  if (typeof window !== 'undefined') {
    localStorage.removeItem('smart_campus_session');
  }
}

/**
 * Send Password Reset Email
 */
export async function sendResetPassword(email: string): Promise<boolean> {
  if (isFirebaseConfigured) {
    await sendPasswordResetEmail(auth, email);
    return true;
  }
  return true;
}

/**
 * Subscribe to Auth State Changes
 */
export function subscribeToAuthState(callback: (user: FirebaseUser | null) => void) {
  if (isFirebaseConfigured) {
    return onAuthStateChanged(auth, callback);
  }
  return () => { };
}
