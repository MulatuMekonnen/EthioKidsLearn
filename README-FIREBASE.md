# Firebase Storage Guide for EthioKidsLearn

This guide explains how to use Firebase Storage for animal sounds and images in the app.

## Setup

Firebase has already been set up with the following features:
- Firestore Database for storing animal metadata
- Firebase Storage for storing images and sounds
- Firebase Authentication for user management

## Uploading Animals to Firebase

### Option 1: Using the Upload Script

1. Make sure you have Node.js installed on your computer
2. Navigate to the project directory
3. Install required dependencies:
   ```
   npm install firebase fs path
   ```
4. Update the animal data in `scripts/uploadDataToFirebase.js` if needed
5. Run the script:
   ```
   node scripts/uploadDataToFirebase.js
   ```

### Option 2: Manual Upload

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select project "ethiokidslearningapp-7c6ff"
3. Navigate to "Storage" in the left sidebar
4. Create folders: 
   - `animals/images`
   - `animals/sounds`
5. Upload images and sounds to these folders
6. Go to "Firestore Database" in the left sidebar
7. Create a collection named "animals"
8. For each animal, create a document with the following fields:
   - `name` (string) - e.g., "Lion"
   - `category` (string) - e.g., "Wild Animals"
   - `imageUrl` (string) - The URL from the uploaded image
   - `soundUrl` (string) - The URL from the uploaded sound

## Storage Structure

The Firebase Storage is organized as follows:
- `/animals/images/` - Contains all animal images
- `/animals/sounds/` - Contains all animal sound files

## Collection Structure

The Firestore Database has the following structure:
- Collection: `animals`
  - Document ID: (auto-generated)
    - `name`: String
    - `category`: String 
    - `imageUrl`: String
    - `soundUrl`: String
    - `createdAt`: Timestamp

## Storage Limits for Free Tier

Firebase free tier (Spark plan) includes:
- 5GB of Storage
- 1GB/day download bandwidth
- 20,000 document writes per day
- 50,000 document reads per day
- 10GB/month of data transfer

This should be more than sufficient for this app, especially with the local caching mechanism implemented to reduce bandwidth usage.

## Troubleshooting

If you encounter issues:

1. Check Firebase console for any error messages
2. Ensure your images and sounds are in supported formats (PNG/JPG for images, MP3 for sounds)
3. Verify the app has network connectivity
4. Check file permissions in Firebase Storage (default is public read/write)

## Cloud Firestore Security Rules

Default security rules have been set. If you need to modify:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read;
      allow write: if request.auth != null;
    }
  }
}
``` 