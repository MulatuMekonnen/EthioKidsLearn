import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../services/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  deleteUser
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
      // Log the user in with Firebase Authentication
      const cred = await signInWithEmailAndPassword(auth, email, password);
      console.log('User logged in:', cred.user.uid);
      
      try {
        // Try to get the user document
        const userDocRef = doc(db, 'users', cred.user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
      if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          console.log('User role found:', userData.role);
          setUserRole(userData.role);
        } else {
          console.warn('User document not found in Firestore. Checking email domain for role determination...');
          
          // Fallback: Try to determine role from email if document doesn't exist
          // This could be useful if Firestore document creation failed but auth succeeded
          if (cred.user.email.includes('@teacher.')) {
            console.log('Setting role to teacher based on email domain');
            setUserRole('teacher');
            
            // Try to create the missing document
            try {
              await setDoc(userDocRef, {
                email: cred.user.email,
                role: 'teacher',
                createdAt: new Date().toISOString()
              }, { merge: true });
              console.log('Created missing teacher document during login');
            } catch (docCreateError) {
              console.error('Failed to create missing document:', docCreateError);
      }
          } else {
            // Default to parent if we can't determine role
            console.log('No role found, defaulting to parent');
            setUserRole('parent');
          }
        }
        
        // Set the user state regardless
        setUser(cred.user);
        
        return cred.user;
      } catch (firestoreError) {
        console.error('Error fetching user document during login:', firestoreError);
        // Still set the user even if we can't get the document
        // This ensures they at least log in to the app
        setUser(cred.user);
        setUserRole('unknown');
      return cred.user;
      }
    } catch (authError) {
      console.error('Login authentication error:', authError);
      throw authError;
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
    if (!user) {
      throw new Error('Not authenticated');
    }
    
    setLoading(true);
    let createdUserCred = null;
    
    try {
      // Step 1: Create the user in Firebase Auth
      createdUserCred = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Teacher auth account created:', createdUserCred.user.uid);
      
      // Remember the current user to switch back later
      const adminUser = auth.currentUser;
      
      // Step 2: Create the teacher document in Firestore
      try {
        const teacherData = {
        email,
          displayName: name,
          name: name,
        role: 'teacher',
        createdAt: new Date().toISOString(),
          createdBy: adminUser.uid
        };
        
        console.log('Creating teacher document with data:', teacherData);
        
        // Set the document with merge option
        await setDoc(doc(db, 'users', createdUserCred.user.uid), teacherData, { merge: true });
        console.log('Teacher document created successfully in Firestore');
        
        // Step 3: Update Auth profile
        await updateProfile(createdUserCred.user, { displayName: name });
        console.log('Auth profile updated with displayName');
        
        // Step 4: Handle auth state if needed
        if (auth.currentUser.uid !== adminUser.uid) {
          console.log('Auth state changed, signing out to restore admin session');
          await signOut(auth);
        }
        
        return createdUserCred.user;
      } catch (firestoreError) {
        console.error('Failed to create teacher Firestore document:', firestoreError);
        
        // If we're using open rules, we shouldn't get permission errors
        // But let's keep some retry logic just in case
        try {
          console.log('Attempting with minimal document');
          await setDoc(doc(db, 'users', createdUserCred.user.uid), {
            email,
            role: 'teacher',
          });
          console.log('Created minimal teacher document');
          return createdUserCred.user;
        } catch (retryError) {
          console.error('All attempts to create teacher document failed:', retryError);
          
          // Try to delete the orphaned auth account
          try {
            await deleteUser(createdUserCred.user);
            console.log('Deleted orphaned auth user');
          } catch (cleanupError) {
            console.error('Failed to delete orphaned user:', cleanupError);
          }
          
          throw retryError;
        }
      }
    } catch (error) {
      console.error('Error in teacher account creation:', error);
      throw error;
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
