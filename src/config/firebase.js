import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDZ1l2Zf_QpqAk_ANf8mw3TLHfEFHk8k6w",
  authDomain: "formly-95229.firebaseapp.com",
  projectId: "formly-95229",
  storageBucket: "formly-95229.firebasestorage.app",
  messagingSenderId: "4725849116",
  appId: "1:4725849116:web:3434a60a60accc995773d9",
  measurementId: "G-QTYHYEE6RX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
export const storage = getStorage(app);

export default app; 