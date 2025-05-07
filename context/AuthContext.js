import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../services/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
  
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setUserRole(userData.role);
            setUser(firebaseUser);
          } else {
            console.warn('User document not found in Firestore.');
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
      setLoading(false);
    });
  
    return () => unsubscribe();
  }, []);

  

  const login = async (email, password) => {
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const userDocSnap = await getDoc(doc(db, 'users', cred.user.uid));
      if (userDocSnap.exists()) {
        setUserRole(userDocSnap.data().role);
      }
      return cred.user;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, fullName = '') => {
    setLoading(true);
    try {
      // Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create the user document in Firestore
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      await setDoc(userDocRef, {
        email: email,
        displayName: fullName,
        role: 'parent', // Default role as parent
        createdAt: new Date().toISOString(),
        children: [],
      });

      // Set the user state
      setUser(userCredential.user);
      setUserRole('parent');
      
      if (fullName) {
        // Update the auth profile with the display name
        await updateProfile(userCredential.user, {
          displayName: fullName
        });
      }
      
      return userCredential.user;
    } catch (err) {
      console.error('Registration error:', err);
      // If Firestore document creation fails, delete the auth user
      if (auth.currentUser) {
        await auth.currentUser.delete();
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Admin-created teacher (collects name)
  const createTeacherAccount = async (email, password, name) => {
    if (userRole !== 'admin') {
      throw new Error('Unauthorized: Only admins can create teachers');
    }
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', cred.user.uid), {
        email,
        name,
        role: 'teacher',
        createdAt: new Date().toISOString(),
        assignedClasses: [],
      });
      return cred.user;
    } finally {
      setLoading(false);
    }
  };

  // Password reset
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (err) {
      throw new Error(err.message);
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
    createTeacherAccount,
    resetPassword,
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
