// src/screens/teacher/CreateContentScreen.js

import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../../context/AuthContext';
import { useContent } from '../../context/ContentContext';
import { serverTimestamp } from 'firebase/firestore';
import { ProgressBarAndroid, ProgressViewIOS } from 'react-native';

export default function CreateContentScreen({ navigation }) {
  const { user } = useAuth();
  const { createContentWithFile } = useContent();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('math');
  const [fileInfo, setFileInfo] = useState(null);

  // Loader & progress
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // ← THIS is the working picker that lets you choose a file:
  const pickFile = async () => {
    try {
      const res = await DocumentPicker.pickSingle({
        type: DocumentPicker.types.allFiles,
      });
      // console.log('Picked file:', res);
      setFileInfo(res);
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        console.error('DocumentPicker Error:', err);
        Alert.alert('Error', 'Could not pick file');
      }
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !category) {
      return Alert.alert('Error', 'Title, description, and category are required');
    }
    if (!fileInfo) {
      return Alert.alert('Error', 'Please select a file first');
    }

    setUploading(true);
    setProgress(0);

    try {
      await createContentWithFile(
        {
          title,
          description,
          category,
          createdBy: user.uid,
          timestamp: serverTimestamp()
        },
        fileInfo.uri,
        fileInfo.name,
        pct => setProgress(pct)
      );

      Alert.alert('Success', 'Content submitted for approval', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      console.error('Upload Error:', err);
      Alert.alert('Error', err.message);
      setUploading(false);
    }
  };

  // Full‐screen spinner before progress begins
  if (uploading && progress === 0) {
    return (
      <View style={styles.fullscreen}>
        <ActivityIndicator size="large" />
        <Text style={styles.uploadingText}>Uploading…</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner}>
        <Text style={styles.header}>New Content</Text>

        <TextInput
          style={styles.input}
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Category:</Text>
          <Picker
            selectedValue={category}
            onValueChange={setCategory}
            style={styles.picker}
          >
            <Picker.Item label="Mathematics" value="math" />
            <Picker.Item label="English"     value="english" />
            <Picker.Item label="Amharic"     value="amharic" />
            <Picker.Item label="Afaan Oromo" value="oromo" />
          </Picker>
        </View>

        <View style={styles.fileSection}>
          <Button title="Select File…" onPress={pickFile} />
          {fileInfo && <Text style={styles.fileName}>{fileInfo.name}</Text>}
        </View>

        {uploading && progress > 0 && (
          <View style={styles.progress}>
            {Platform.OS === 'android' ? (
              <ProgressBarAndroid
                styleAttr="Horizontal"
                indeterminate={false}
                progress={progress / 100}
              />
            ) : (
              <ProgressViewIOS progress={progress / 100} />
            )}
            <Text>{progress}%</Text>
          </View>
        )}

        <View style={styles.button}>
          {uploading ? (
            <ActivityIndicator size="large" />
          ) : (
            <Button title="Submit for Review" onPress={handleSubmit} />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 5,
    padding: 10, marginBottom: 15, fontSize: 16,
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  pickerContainer: { marginBottom: 15 },
  pickerLabel: { fontSize: 16, marginBottom: 5 },
  picker: { borderWidth: 1, borderColor: '#ccc' },
  fileSection: { marginBottom: 15 },
  fileName: { marginTop: 5, color: '#555' },
  progress: { marginVertical: 15, alignItems: 'center' },
  button: { marginTop: 10 },
});
