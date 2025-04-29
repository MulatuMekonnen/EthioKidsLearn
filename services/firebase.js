// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
  apiKey: "AIzaSyABGTWldWfmHcOpTVDjTkEea_xG3Fd5f-A",
  authDomain: "ethiokidslearn.firebaseapp.com",
  projectId: "ethiokidslearn",
  storageBucket: "ethiokidslearn.firebasestorage.app",
  messagingSenderId: "187247254526",
  appId: "1:187247254526:web:a278c90a2a54422f31beaf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);