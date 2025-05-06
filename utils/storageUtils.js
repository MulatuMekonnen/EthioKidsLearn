import { storage } from '../services/firebase';
import { ref, uploadBytes, getDownloadURL, listAll } from 'firebase/storage';
import { Alert } from 'react-native';

// Upload a file to Firebase Storage
export const uploadFile = async (uri, path, filename) => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, `${path}/${filename}`);
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    Alert.alert('Upload Error', 'Failed to upload file');
    return null;
  }
};

// Get URLs for all files in a directory
export const getFilesFromDirectory = async (directory) => {
  try {
    const storageRef = ref(storage, directory);
    const fileList = await listAll(storageRef);
    
    const fileURLs = await Promise.all(
      fileList.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        return {
          name: itemRef.name,
          url
        };
      })
    );
    
    return fileURLs;
  } catch (error) {
    console.error('Error getting files:', error);
    return [];
  }
};

// Helper function to handle file URLs
export const getFileUri = (fileUrl) => {
  // For now, just return the URL directly
  // Later we can add caching here if needed
  return fileUrl;
}; 