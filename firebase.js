// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyD88w8wz0YP9MXcaSlr13sccytrh_NKnvU",
  authDomain: "ethiokidslearningapp-7c6ff.firebaseapp.com",
  projectId: "ethiokidslearningapp-7c6ff",
  storageBucket: "ethiokidslearningapp-7c6ff.firebasestorage.app",
  messagingSenderId: "488926380778",
  appId: "1:488926380778:web:608e077603f39d83c7cd93",
  measurementId: "G-YVQFDW1MQE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);