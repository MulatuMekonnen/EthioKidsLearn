// src/context/UserManagementContext.js
import React, { createContext, useContext, useState } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where
} from 'firebase/firestore';
import { db } from '../services/firebase';  

const UserManagementContext = createContext();

export function UserManagementProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all users except admins
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('role', 'in', ['parent', 'teacher']));
      const querySnapshot = await getDocs(q);
      const usersList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersList);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const addUser = async (userData) => {
    await addDoc(collection(db, 'users'), userData);
    await fetchUsers();
  };

  

  // Delete user
  const deleteUser = async (userId) => {
    setLoading(true);
    try {
      const userRef = doc(db, 'users', userId);
      await deleteDoc(userRef);
      await fetchUsers(); // Refresh the users list
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    users,
    loading,
    fetchUsers,
    deleteUser
  };

  return (
    <UserManagementContext.Provider value={value}>
      {children}
    </UserManagementContext.Provider>
  );
}

export const useUserManagement = () => {
  const context = useContext(UserManagementContext);
  if (!context) {
    throw new Error('useUserManagement must be used within UserManagementProvider');
  }
  return context;
};
