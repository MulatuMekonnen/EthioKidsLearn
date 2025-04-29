import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD88w8wz0YP9MXcaSlr13sccytrh_NKnvU",
  authDomain: "ethiokidslearningapp-7c6ff.firebaseapp.com",
  projectId: "ethiokidslearningapp-7c6ff",
  storageBucket: "ethiokidslearningapp-7c6ff.appspot.com",
  messagingSenderId: "488926380778",
  appId: "1:488926380778:web:608e077603f39d83c7cd93"
};

// Initialize Firebase only if it hasn't been initialized already
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
const db = getFirestore(app);

// Function to initialize Firebase services
async function initializeFirebaseServices() {
  if (Platform.OS !== 'web') {
    try {
      // Enable offline persistence for Firestore
      await enableIndexedDbPersistence(db, {
        synchronizeTabs: true
      });
      console.log('Firestore persistence enabled successfully');
    } catch (err) {
      if (err.code === 'failed-precondition') {
        console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
      } else if (err.code === 'unimplemented') {
        console.warn('The current browser does not support persistence.');
      } else {
        console.error('Error enabling Firestore persistence:', err);
      }
    }
  }
}

// Initialize Firebase services
initializeFirebaseServices().catch(console.error);

let analytics = null;

// Initialize Analytics only in supported environments
const initAnalytics = async () => {
  // Skip analytics initialization in development or unsupported environments
  if (__DEV__ || Platform.OS === 'web') {
    return;
  }

  try {
    const supported = await isSupported();
    if (supported) {
      analytics = getAnalytics(app);
    }
  } catch (error) {
    console.log('Analytics not supported in this environment');
  }
};

// Initialize Firebase and Analytics
initAnalytics();

// Analytics helper functions
const logEvent = async (eventName, eventParams = {}) => {
  if (analytics) {
    try {
      await analytics.logEvent(eventName, eventParams);
    } catch (error) {
      console.log('Failed to log analytics event:', error);
    }
  }
};

const setUserProperty = async (name, value) => {
  if (analytics) {
    try {
      await analytics.setUserProperty(name, value);
    } catch (error) {
      console.log('Failed to set user property:', error);
    }
  }
};

export { auth, db, analytics, logEvent, setUserProperty };
export default app;