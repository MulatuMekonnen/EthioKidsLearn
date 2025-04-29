import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // Create a mock user for bypassing authentication
  const mockUser = {
    uid: 'mock-user-id',
    displayName: 'Student',
    email: 'student@example.com',
    role: 'child',
    // Add any other properties needed by your app
  };

  const [user, setUser] = useState(mockUser);
  const [loading, setLoading] = useState(false); // Set to false to skip loading state
  const [error, setError] = useState(null);

  // Skip Firebase authentication for now
  useEffect(() => {
    // No Firebase auth check, just set the mock user
    setLoading(false);
  }, []);

  const signup = async (email, password, role, userData) => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      try {
        // Create user document in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          email,
          role,
          ...userData,
          createdAt: new Date()
        });
      } catch (firestoreError) {
        // Handle offline Firestore errors
        console.warn('Firestore error during signup:', firestoreError);
        // Continue with authentication even if Firestore fails
        // The user document will be created when they come back online
      }

      // Update user state with role and additional data
      const userWithRole = { ...user, role, ...userData };
      setUser(userWithRole);
      setError(null);
      return userWithRole;
    } catch (error) {
      console.error('Error during signup:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userWithRole = { ...userCredential.user, role: userData.role, ...userData };
        setUser(userWithRole);
        return userWithRole;
      }
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };

  const loginChild = async (childId, pin) => {
    try {
      const childDoc = await getDoc(doc(db, 'children', childId));
      
      if (!childDoc.exists()) {
        throw new Error('Child not found');
      }

      const childData = childDoc.data();
      
      if (childData.pin !== pin) {
        throw new Error('Invalid PIN');
      }

      // Create a custom user object for the child
      const childUser = {
        uid: childId,
        role: 'child',
        name: childData.name,
        age: childData.age,
        grade: childData.grade,
        parentId: childData.parentId
      };

      setUser(childUser);
      return childUser;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (user?.role === 'child') {
        // For child users, just clear the user state
        setUser(null);
      } else {
        // For regular users, sign out from Firebase
        await signOut(auth);
      }
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signup,
    login,
    loginChild,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};