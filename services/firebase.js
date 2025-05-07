// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, doc, getDoc } from 'firebase/firestore';
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

// Initialize Firebase only if it hasn't been initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

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

// Initialize Auth with AsyncStorage persistence only if not already initialized
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (error) {
  if (error.code === 'auth/already-initialized') {
    auth = getAuth(app);
  } else {
    throw error;
  }
}

// Initialize Firestore
const db = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

// Initialize Analytics
initAnalytics();

// Quiz Scores Collection
export const saveQuizScore = async (childId, childName, quizType, score, totalQuestions) => {
  try {
    const quizScoresRef = collection(db, 'quizScores');
    await addDoc(quizScoresRef, {
      childId,
      childName,
      quizType,
      score,
      totalQuestions,
      percentage: (score / totalQuestions) * 100,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error saving quiz score:', error);
    throw error;
  }
};

export const getQuizScoresByChild = async (childId) => {
  try {
    const resultsJson = await AsyncStorage.getItem('quizResults');
    if (!resultsJson) {
      return [];
    }
    
    const results = JSON.parse(resultsJson);
    return results
      .filter(result => result.childId === childId)
      .map(result => ({
        id: result.id || Date.now().toString(),
        childId: result.childId,
        childName: result.childName,
        quizType: result.category,
        score: result.score,
        totalQuestions: result.totalQuestions,
        percentage: (result.score / result.totalQuestions) * 100,
        timestamp: result.date || result.timestamp
      }))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  } catch (error) {
    console.error('Error fetching quiz scores:', error);
    throw error;
  }
};

export const getAllQuizScores = async () => {
  try {
    const resultsJson = await AsyncStorage.getItem('quizResults');
    if (!resultsJson) {
      return [];
    }
    
    const results = JSON.parse(resultsJson);
    return results.map(result => ({
      id: result.id,
      childId: result.childId,
      childName: result.childName,
      quizType: result.category,
      score: result.score,
      totalQuestions: result.totalQuestions,
      percentage: (result.score / result.totalQuestions) * 100,
      timestamp: result.date
    }));
  } catch (error) {
    console.error('Error fetching all quiz scores:', error);
    throw error;
  }
};

// Progress Reports Collection
export const createProgressReport = async (childId, childName, teacherId, teacherName, report) => {
  try {
    const reportsJson = await AsyncStorage.getItem('progressReports');
    const reports = reportsJson ? JSON.parse(reportsJson) : [];
    
    const newReport = {
      id: Date.now().toString(),
      childId,
      childName,
      teacherId,
      teacherName,
      report,
      timestamp: new Date().toISOString()
    };
    
    reports.push(newReport);
    await AsyncStorage.setItem('progressReports', JSON.stringify(reports));
  } catch (error) {
    console.error('Error creating progress report:', error);
    throw error;
  }
};

export const getProgressReportsByChild = async (childId) => {
  try {
    const reportsJson = await AsyncStorage.getItem('progressReports');
    if (!reportsJson) {
      return [];
    }
    
    const reports = JSON.parse(reportsJson);
    return reports
      .filter(report => report.childId === childId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  } catch (error) {
    console.error('Error fetching progress reports:', error);
    throw error;
  }
};

export { auth, db, storage, analytics };