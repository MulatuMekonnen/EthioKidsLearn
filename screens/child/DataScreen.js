import { db } from '../../firebaseConfig';

// Add data
const addData = async (collection, data) => {
  try {
    const docRef = await db.collection(collection).add(data);
    console.log('Document written with ID:', docRef.id);
  } catch (error) {
    console.error('Error adding document:', error);
  }
};

// Read data
const getData = async (collection) => {
  try {
    const querySnapshot = await db.collection(collection).get();
    querySnapshot.forEach((doc) => {
      console.log(doc.id, ' => ', doc.data());
    });
  } catch (error) {
    console.error('Error getting documents:', error);
  }
};

// Update data
const updateData = async (collection, docId, data) => {
  try {
    await db.collection(collection).doc(docId).update(data);
    console.log('Document successfully updated');
  } catch (error) {
    console.error('Error updating document:', error);
  }
};

// Delete data
const deleteData = async (collection, docId) => {
  try {
    await db.collection(collection).doc(docId).delete();
    console.log('Document successfully deleted');
  } catch (error) {
    console.error('Error removing document:', error);
  }
}; 