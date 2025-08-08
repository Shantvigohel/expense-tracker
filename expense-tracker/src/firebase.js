import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // ✅ Add this

const firebaseConfig = {
  apiKey: "AIzaSyBqnVnPilrHWkiTSjl6zJCaIqlxCjFG13U",
  authDomain: "expense-tracker-1717.firebaseapp.com",
  projectId: "expense-tracker-1717",
  storageBucket: "expense-tracker-1717.firebasestorage.app",
  messagingSenderId: "243643374378",
  appId: "1:243643374378:web:ab2deef814b1088e2cdc53",
  measurementId: "G-5V6BHX4SCN"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app); // ✅ This gives access to Firestore

export { auth, provider, db }; // ✅ Now export db too
