import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { 
  Appbar, 
  Button, 
  Card, 
  Title, 
  Paragraph,
  ActivityIndicator,
  Snackbar
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';

const SendContent = () => {
  const navigation = useNavigation();
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true
      });

      if (!result.canceled) {
        setSelectedFile(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking file:', error);
      setSnackbar({
        visible: true,
        message: 'Error selecting file'
      });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setSnackbar({
        visible: true,
        message: 'Please select a file first'
      });
      return;
    }

    setLoading(true);
    try {
      const storage = getStorage();
      const filename = selectedFile.name;
      const storageRef = ref(storage, `teacher-content/${filename}`);

      // Convert URI to blob
      const response = await fetch(selectedFile.uri);
      const blob = await response.blob();

      // Upload file
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      // Save content metadata to Firestore
      await addDoc(collection(db, 'teacher-content'), {
        filename,
        fileUrl: downloadURL,
        type: selectedFile.mimeType,
        size: selectedFile.size,
        uploadedAt: serverTimestamp(),
        status: 'pending'
      });

      setSnackbar({
        visible: true,
        message: 'Content uploaded successfully!'
      });

      // Reset and navigate back after success
      setTimeout(() => {
        setSelectedFile(null);
        navigation.goBack();
      }, 1500);
    } catch (error) {
      console.error('Error uploading file:', error);
      setSnackbar({
        visible: true,
        message: 'Error uploading file'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Send Content" />
      </Appbar.Header>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Upload your content here</Title>
          <Paragraph>Select images or PDF files to share with admin</Paragraph>

          {selectedFile ? (
            <View style={styles.filePreview}>
              {selectedFile.mimeType?.startsWith('image/') ? (
                <Image
                  source={{ uri: selectedFile.uri }}
                  style={styles.imagePreview}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.pdfPreview}>
                  <Title>PDF Document</Title>
                  <Paragraph>{selectedFile.name}</Paragraph>
                </View>
              )}
            </View>
          ) : null}

          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={handleFilePick}
              icon="file-upload"
              style={styles.button}
              disabled={loading}
            >
              Select File
            </Button>

            {selectedFile && (
              <Button
                mode="contained"
                onPress={handleUpload}
                icon="cloud-upload"
                style={styles.button}
                loading={loading}
                disabled={loading}
              >
                Upload
              </Button>
            )}
          </View>
        </Card.Content>
      </Card>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" />
        </View>
      )}

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        duration={3000}
      >
        {snackbar.message}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
  },
  filePreview: {
    marginVertical: 16,
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  pdfPreview: {
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SendContent; 