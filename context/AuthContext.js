import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../services/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, collection } from 'firebase/firestore';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true); // Track loading state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true); // Always set loading when auth state changes
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
  
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            console.log('Fetched user data:', userData); // 👀 Debugging
            setUserRole(userData.role);
            setUser(firebaseUser);
          } else {
            console.warn('User document not found in Firestore.');
            await signOut(auth);
            setUser(null);
            setUserRole(null);
          }
        } catch (error) {
          console.error('Error fetching user document:', error);
          setUser(null);
          setUserRole(null);
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false); // Done loading
    });
  
    return () => unsubscribe();
  }, []);
  

  // Helper functions for login, registration, logout, etc.

  const login = async (email, password) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (userDoc.exists()) {
        setUserRole(userDoc.data().role); // Set role after login
      }
      return userCredential.user;
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: email,
        role: 'parent', // Default role as parent
        createdAt: new Date().toISOString(),
        children: [],
      });
      return userCredential.user;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      setUserRole(null);
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    userRole,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
