// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyD88w8wz0YP9MXcaSlr13sccytrh_NKnvU",
  authDomain: "ethiokidslearningapp-7c6ff.firebaseapp.com",
  projectId: "ethiokidslearningapp-7c6ff",
  storageBucket: "ethiokidslearningapp-7c6ff.appspot.com",
  messagingSenderId: "488926380778",
  appId: "1:488926380778:web:608e077603f39d83c7cd93"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics only in supported environments
let analytics = null;
const initAnalytics = async () => {
  try {
    const supported = await isSupported();
    if (supported) {
      analytics = getAnalytics(app);
    }
  } catch (error) {
    console.log('Analytics not supported in this environment');
  }
};

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
const db = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

// Initialize Analytics
initAnalytics();

export { auth, db, storage, analytics };