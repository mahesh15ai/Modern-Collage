import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD-LSMdSz55xocdF_tlRtUJpakkij8--p0",
  authDomain: "modernclg-5270c.firebaseapp.com",
  projectId: "modernclg-5270c",
  storageBucket: "modernclg-5270c.firebasestorage.app",
  messagingSenderId: "627568528211",
  appId: "1:627568528211:web:eb5ae27e650886a494efa6",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const adminEmail = "moderncsitned@gmail.com";
const adminPassword = "Modern@26";
const adminName = "Modern College";

async function main() {
  console.log(`Creating Admin in Firebase for: ${adminEmail}...`);
  let uid;
  try {
    const cred = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
    uid = cred.user.uid;
    console.log(`[Success] User created in Firebase Auth! UID: ${uid}`);
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log(`User already exists in Firebase Auth, signing in to update profile...`);
      const cred = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      uid = cred.user.uid;
      console.log(`Signed in successfully! UID: ${uid}`);
    } else {
      console.error(`Firebase Auth error:`, error);
      throw error;
    }
  }

  const adminProfile = {
    id: uid,
    name: adminName,
    email: adminEmail.toLowerCase(),
    role: "admin",
    department: "College Administration",
    designation: "Principal & Chief Administrator",
    phone: "+91 94220 99887",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    createdAt: new Date().toISOString()
  };

  await setDoc(doc(db, "users", uid), adminProfile, { merge: true });
  console.log(`[Success] Admin profile written to Firestore users/${uid}!`);
  console.log(JSON.stringify(adminProfile, null, 2));
}

main().then(() => {
  console.log("Admin account setup complete!");
  process.exit(0);
}).catch((err) => {
  console.error("Setup failed:", err);
  process.exit(1);
});
