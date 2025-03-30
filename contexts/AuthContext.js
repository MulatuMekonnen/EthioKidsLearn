import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth, db } from '../firebaseConfig';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserRole(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    console.log('AuthProvider mounted');
    let unsubscribe;
    
    try {
      unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          console.log('Auth state changed:', user.email);
          try {
            // Get additional user data from Firestore
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              console.log('User document found:', userData);
              setUser({ ...user, ...userData });
              setUserRole(userData.role);
            } else {
              console.log('No user document found');
              setUser(user);
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
            setUser(user);
          }
        } else {
          console.log('Auth state changed: No user');
          setUser(null);
          setUserRole(null);
        }
        setLoading(false);
      });
    } catch (error) {
      console.error('Error setting up auth state listener:', error);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const value = {
    user,
    userRole,
    loading,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 