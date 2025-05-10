// src/context/ContentContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db, storage } from '../services/firebase'; // ✅ use storage from firebase.js

const ContentContext = createContext();

export const useContent = () => {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useContent must be inside ContentProvider');
  return ctx;
};

export const ContentProvider = ({ children }) => {
  const [contents, setContents] = useState([]);
  const [pending, setPending] = useState([]);
  const [approvedByCat, setApprovedByCat] = useState({});
  const contentsRef = collection(db, 'contents');

  // ✅ Upload file to Firebase Storage
  const uploadFile = async (localUri, remotePath, onProgress) => {
    const response = await fetch(localUri);
    const blob = await response.blob();
    const storageRef = storage.ref().child(remotePath);
    const uploadTask = storageRef.put(blob);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        snapshot => {
          if (onProgress) {
            const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(Math.floor(pct));
          }
        },
        reject,
        async () => {
          const url = await uploadTask.snapshot.ref.getDownloadURL();
          resolve(url);
        }
      );
    });
  };

  const fetchAllContent = async () => {
    try {
      const snap = await getDocs(contentsRef);
      const contentList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      console.log('Fetched all content:', contentList.length, 'items');
      setContents(contentList);
    } catch (error) {
      console.error('Error fetching all content:', error);
    }
  };

  const fetchPending = async () => {
    try {
      console.log('Fetching pending content...');
      const q = query(contentsRef, where('status', '==', 'pending'));
      const snap = await getDocs(q);
      const pendingList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      console.log('Fetched pending content:', pendingList.length, 'items');
      console.log('Pending content details:', pendingList);
      setPending(pendingList);
    } catch (error) {
      console.error('Error fetching pending content:', error);
    }
  };

  const createContent = async (data) => {
    try {
      const contentData = {
        ...data,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      console.log('Creating content with data:', contentData);
      await addDoc(contentsRef, contentData);
      await fetchPending();
    } catch (error) {
      console.error('Error creating content:', error);
      throw error;
    }
  };

  const createContentWithFile = async (data, localUri, fileName, onProgress) => {
    try {
      let fileUrl = null;
      if (localUri) {
        const remotePath = `contentFiles/${Date.now()}_${fileName}`;
        fileUrl = await uploadFile(localUri, remotePath, onProgress);
      }
      const contentData = {
        ...data,
        fileUrl,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      console.log('Creating content with file:', contentData);
      await addDoc(contentsRef, contentData);
      await fetchPending();
    } catch (error) {
      console.error('Error creating content with file:', error);
      throw error;
    }
  };

  const updateContent = async (id, updates) => {
    try {
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp(),
      };
      console.log('Updating content:', id, updateData);
      await updateDoc(doc(db, 'contents', id), updateData);
      await fetchAllContent();
      await fetchPending();
    } catch (error) {
      console.error('Error updating content:', error);
      throw error;
    }
  };

  const deleteContent = async (id) => {
    try {
      console.log('Deleting content:', id);
      await deleteDoc(doc(db, 'contents', id));
      await fetchAllContent();
      await fetchPending();
    } catch (error) {
      console.error('Error deleting content:', error);
      throw error;
    }
  };

  const approveContent = async (id) => {
    try {
      const updateData = {
        status: 'approved',
        approvedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      console.log('Approving content:', id, updateData);
      await updateDoc(doc(db, 'contents', id), updateData);
      await fetchPending();
    } catch (error) {
      console.error('Error approving content:', error);
      throw error;
    }
  };

  const rejectContent = async (id) => {
    try {
      const updateData = {
        status: 'rejected',
        rejectedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      console.log('Rejecting content:', id, updateData);
      await updateDoc(doc(db, 'contents', id), updateData);
      await fetchPending();
    } catch (error) {
      console.error('Error rejecting content:', error);
      throw error;
    }
  };

  const fetchApprovedByCategory = async (category) => {
    try {
      console.log('Fetching approved content for category:', category);
      const q = query(
        contentsRef,
        where('status', '==', 'approved'),
        where('category', '==', category)
      );
      const snap = await getDocs(q);
      const categoryContent = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      console.log('Fetched approved content for category:', category, categoryContent.length, 'items');
      setApprovedByCat(prev => ({
        ...prev,
        [category]: categoryContent,
      }));
    } catch (error) {
      console.error('Error fetching approved content by category:', error);
    }
  };

  useEffect(() => {
    console.log('ContentProvider mounted, fetching initial data...');
    fetchAllContent();
    fetchPending();
  }, []);

  return (
    <ContentContext.Provider
      value={{
        contents,
        pending,
        approvedByCat,
        fetchAllContent,
        fetchPending,
        createContent,
        createContentWithFile,
        updateContent,
        deleteContent,
        approveContent,
        rejectContent,
        fetchApprovedByCategory,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
};
