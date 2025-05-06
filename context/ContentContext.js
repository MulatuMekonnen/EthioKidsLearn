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
    const snap = await getDocs(contentsRef);
    setContents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const fetchPending = async () => {
    const q = query(contentsRef, where('status', '==', 'pending'));
    const snap = await getDocs(q);
    setPending(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const createContent = async (data) => {
    await addDoc(contentsRef, {
      ...data,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
    await fetchPending();
  };

  const createContentWithFile = async (data, localUri, fileName, onProgress) => {
    let fileUrl = null;
    if (localUri) {
      const remotePath = `contentFiles/${Date.now()}_${fileName}`;
      fileUrl = await uploadFile(localUri, remotePath, onProgress);
    }
    await addDoc(contentsRef, {
      ...data,
      fileUrl,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
    await fetchPending();
  };

  const updateContent = async (id, updates) => {
    await updateDoc(doc(db, 'contents', id), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    await fetchAllContent();
    await fetchPending();
  };

  const deleteContent = async (id) => {
    await deleteDoc(doc(db, 'contents', id));
    await fetchAllContent();
    await fetchPending();
  };

  const approveContent = async (id) => {
    await updateDoc(doc(db, 'contents', id), {
      status: 'approved',
      approvedAt: new Date().toISOString(),
    });
    await fetchPending();
  };

  const rejectContent = async (id) => {
    await updateDoc(doc(db, 'contents', id), {
      status: 'rejected',
      rejectedAt: new Date().toISOString(),
    });
    await fetchPending();
  };

  const fetchApprovedByCategory = async (category) => {
    const q = query(
      contentsRef,
      where('status', '==', 'approved'),
      where('category', '==', category)
    );
    const snap = await getDocs(q);
    setApprovedByCat(prev => ({
      ...prev,
      [category]: snap.docs.map(d => ({ id: d.id, ...d.data() })),
    }));
  };

  useEffect(() => {
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
