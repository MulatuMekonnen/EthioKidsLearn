import { db } from '../config/firebase';

export const firestoreService = {
  // Create a document
  createDocument: async (collection, data) => {
    try {
      const ref = await db.collection(collection).add({
        ...data,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
      return ref.id;
    } catch (error) {
      throw error;
    }
  },

  // Read a document
  getDocument: async (collection, id) => {
    try {
      const doc = await db.collection(collection).doc(id).get();
      return doc.exists ? { id: doc.id, ...doc.data() } : null;
    } catch (error) {
      throw error;
    }
  },

  // Update a document
  updateDocument: async (collection, id, data) => {
    try {
      await db.collection(collection).doc(id).update({
        ...data,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      throw error;
    }
  },

  // Delete a document
  deleteDocument: async (collection, id) => {
    try {
      await db.collection(collection).doc(id).delete();
    } catch (error) {
      throw error;
    }
  },

  // Get all documents in a collection
  getCollection: async (collection) => {
    try {
      const snapshot = await db.collection(collection).get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw error;
    }
  }
}; 