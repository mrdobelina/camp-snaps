import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCmCmi-BzMQdy-_LISAg6nJIELk_z99JX0",
  authDomain: "camp-snaps.firebaseapp.com",
  projectId: "camp-snaps",
  storageBucket: "camp-snaps.firebasestorage.app",
  messagingSenderId: "5237545728",
  appId: "1:5237545728:web:fbd31b81904f02fcaab1e5",
  measurementId: "G-NY34GYHFSC"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { db, storage, auth };