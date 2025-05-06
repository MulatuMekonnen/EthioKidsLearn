// Import firebase modules
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const fs = require('fs');
const path = require('path');

// Firebase configuration - this should match your services/firebase.js config
const firebaseConfig = {
  apiKey: "AIzaSyD88w8wz0YP9MXcaSlr13sccytrh_NKnvU",
  authDomain: "ethiokidslearningapp-7c6ff.firebaseapp.com",
  projectId: "ethiokidslearningapp-7c6ff",
  storageBucket: "ethiokidslearningapp-7c6ff.appspot.com",
  messagingSenderId: "488926380778",
  appId: "1:488926380778:web:608e077603f39d83c7cd93"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Sample animal data
const animalsData = [
  {
    name: 'Lion',
    category: 'Wild Animals',
    localImagePath: './assets/images/animals/lion.png',
    localSoundPath: './assets/sounds/animals/lion.mp3'
  },
  {
    name: 'Tiger',
    category: 'Wild Animals',
    localImagePath: './assets/images/animals/tiger.png',
    localSoundPath: './assets/sounds/animals/tiger.mp3'
  },
  {
    name: 'Monkey',
    category: 'Wild Animals',
    localImagePath: './assets/images/animals/monkey.png',
    localSoundPath: './assets/sounds/animals/monkey.mp3'
  },
  {
    name: 'Cow',
    category: 'Farm Animals',
    localImagePath: './assets/images/animals/cow.png',
    localSoundPath: './assets/sounds/animals/cow.mp3'
  },
  {
    name: 'Dog',
    category: 'Pets',
    localImagePath: './assets/images/animals/dog.png',
    localSoundPath: './assets/sounds/animals/dog.mp3'
  }
];

// Function to upload a file to Firebase Storage
const uploadFileToStorage = async (localFilePath, storagePath) => {
  try {
    // Read the local file
    const fileBuffer = fs.readFileSync(path.resolve(process.cwd(), localFilePath));
    
    // Create a reference to the file in Firebase Storage
    const storageRef = ref(storage, storagePath);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, fileBuffer);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    console.log(`File uploaded successfully: ${downloadURL}`);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    return null;
  }
};

// Function to upload animal data to Firestore and storage
const uploadAnimalsData = async () => {
  try {
    const animalsCollection = collection(db, 'animals');
    
    for (const animal of animalsData) {
      // Upload image to Storage
      const imageFileName = animal.localImagePath.split('/').pop();
      const imageStoragePath = `animals/images/${imageFileName}`;
      const imageUrl = await uploadFileToStorage(animal.localImagePath, imageStoragePath);
      
      // Upload sound to Storage
      const soundFileName = animal.localSoundPath.split('/').pop();
      const soundStoragePath = `animals/sounds/${soundFileName}`;
      const soundUrl = await uploadFileToStorage(animal.localSoundPath, soundStoragePath);
      
      // Add animal data to Firestore
      const animalData = {
        name: animal.name,
        category: animal.category,
        imageUrl: imageUrl,
        soundUrl: soundUrl,
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(animalsCollection, animalData);
      console.log(`Animal ${animal.name} added with ID: ${docRef.id}`);
    }
    
    console.log('All animals uploaded successfully!');
  } catch (error) {
    console.error('Error uploading animals data:', error);
  }
};

// Run the upload function
uploadAnimalsData().then(() => {
  console.log('Upload process complete!');
  process.exit(0);
}).catch(error => {
  console.error('Upload process failed:', error);
  process.exit(1);
}); 