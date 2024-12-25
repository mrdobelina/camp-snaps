import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCmCmi-BzMQdy-_LISAg6nJIELk_z99JX0",
  authDomain: "camp-snaps.firebaseapp.com",
  projectId: "camp-snaps",
  storageBucket: "camp-snaps.firebasestorage.app",
  messagingSenderId: "5237545728",
  appId: "1:5237545728:web:fbd31b81904f02fcaab1e5",
  measurementId: "G-NY34GYHFSC",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const testFirestore = async () => {
  try {
    const docRef = await addDoc(collection(db, "testCollection"), {
      testField: "Hello Firestore!",
    });
    console.log("Documento aggiunto con ID:", docRef.id);
  } catch (error) {
    console.error("Errore Firestore:", error);
  }
};

testFirestore();
