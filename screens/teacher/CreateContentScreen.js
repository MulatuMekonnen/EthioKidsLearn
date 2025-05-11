// src/screens/teacher/CreateContentScreen.js

import React, { useState, useEffect } from 'react';
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
  TouchableOpacity,
  Image,
  PermissionsAndroid,
  Linking,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { serverTimestamp, addDoc, collection } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { uploadToCloudinary } from '../../services/cloudinary';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { Video } from 'expo-av';
import { useContent } from '../../context/ContentContext';
import { useLanguage } from '../../context/LanguageContext';

const CONTENT_TYPES = {
  DOCUMENT: 'document',
  VIDEO: 'video',
  AUDIO: 'audio',
  IMAGE: 'image',
};

export default function CreateContentScreen({ navigation }) {
  const { user } = useAuth();
  const { createContent } = useContent();
  const { translate } = useLanguage();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('math');
  const [level, setLevel] = useState('beginner');
  const [contentType, setContentType] = useState('document');
  const [fileInfo, setFileInfo] = useState(null);
  const [tags, setTags] = useState('');

  // Loader & progress
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Initialize content type
  useEffect(() => {
    console.log('Component mounted, content type initialized to:', contentType);
  }, []);

  // Request storage permission for Android
  const requestStoragePermission = async () => {
    if (Platform.OS !== 'android') return true;
    
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      ]);

      const allGranted = Object.values(granted).every(
        permission => permission === PermissionsAndroid.RESULTS.GRANTED
      );

      if (!allGranted) {
        Alert.alert(
          'Permission Required',
          'Storage permission is required to select files. Please grant permission in Settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Open Settings', 
              onPress: () => {
                if (Platform.OS === 'android') {
                  Linking.openSettings();
                }
              }
            }
          ]
        );
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Permission request error:', err);
      return false;
    }
  };

  // Pick file based on content type
  const pickFile = async () => {
    try {
      // Request permission first
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        return;
      }

      console.log(`Picking file for content type: ${contentType}`);
      
      let result;
      
      if (contentType === 'image') {
        // Use ImagePicker for images
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 1,
        });

        if (!result.canceled && result.assets && result.assets[0]) {
          const asset = result.assets[0];
          setFileInfo({
            uri: asset.uri,
            name: asset.uri.split('/').pop(),
            type: 'image/jpeg',
            size: asset.fileSize || 0
          });
        }
      } else if (contentType === 'video') {
        // Use DocumentPicker for videos
        console.log('Opening video picker...');
        try {
          result = await DocumentPicker.getDocumentAsync({
            type: ['video/*'],
            copyToCacheDirectory: true,
            presentationStyle: 'fullScreen'
          });
          console.log('Video picker result:', result);

          if (!result.canceled && result.assets && result.assets[0]) {
            const asset = result.assets[0];
            const fileInfo = {
              uri: asset.uri,
              name: asset.name,
              type: asset.mimeType,
              size: asset.size
            };
            console.log('Setting video file info:', fileInfo);
            setFileInfo(fileInfo);
          }
        } catch (pickerError) {
          if (pickerError.code === 'E_DOCUMENT_PICKER_CANCELED') {
            console.log('User cancelled video picker');
          } else {
            console.error('Video picker error:', pickerError);
            Alert.alert('Error', 'Failed to pick video file. Please try again.');
          }
        }
      } else if (contentType === 'audio') {
        // Use DocumentPicker for audio
        console.log('Opening audio picker...');
        try {
          result = await DocumentPicker.getDocumentAsync({
            type: ['audio/*'],
            copyToCacheDirectory: true,
            presentationStyle: 'fullScreen'
          });
          console.log('Audio picker result:', result);

          if (result.type === 'success') {
            setFileInfo({
              uri: result.uri,
              name: result.name,
              type: result.mimeType,
              size: result.size
            });
          }
        } catch (pickerError) {
          if (pickerError.code === 'E_DOCUMENT_PICKER_CANCELED') {
            console.log('User cancelled audio picker');
          } else {
            console.error('Audio picker error:', pickerError);
            Alert.alert('Error', 'Failed to pick audio file. Please try again.');
          }
        }
      } else {
        // Use DocumentPicker for documents
        console.log('Opening document picker...');
        try {
          result = await DocumentPicker.getDocumentAsync({
            type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
            copyToCacheDirectory: true,
            presentationStyle: 'fullScreen'
          });
          console.log('Document picker result:', result);

          if (result.type === 'success') {
            setFileInfo({
              uri: result.uri,
              name: result.name,
              type: result.mimeType,
              size: result.size
            });
          }
        } catch (pickerError) {
          if (pickerError.code === 'E_DOCUMENT_PICKER_CANCELED') {
            console.log('User cancelled document picker');
          } else {
            console.error('Document picker error:', pickerError);
            Alert.alert('Error', 'Failed to pick document. Please try again.');
          }
        }
      }
    } catch (error) {
      console.error('Error in pickFile:', error);
      Alert.alert('Error', 'Failed to pick file. Please try again.');
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !category || !level) {
      return Alert.alert('Error', 'Title, description, category, and level are required');
    }
    if (!fileInfo) {
      return Alert.alert('Error', 'Please select a file first');
    }

    setUploading(true);
    setProgress(0);

    try {
      // 1. Upload file to Cloudinary
      setProgress(10);
      const uploadResult = await uploadToCloudinary(fileInfo.uri, {
        resource_type: contentType === 'image' ? 'image' : 
                       contentType === 'video' ? 'video' : 
                       contentType === 'audio' ? 'video' : 'raw', // Cloudinary uses 'video' for audio too
        folder: `ethiokidslearn/${category}/${contentType}`,
      });
      
      if (!uploadResult.success) {
        throw new Error('Failed to upload to Cloudinary');
      }
      
      setProgress(70);
      
      // 2. Save metadata to Firebase using ContentContext
      const contentData = {
          title,
          description,
          category,
        level,
        contentType,
        fileUrl: uploadResult.url,
        publicId: uploadResult.publicId,
        fileName: fileInfo.name,
        fileType: fileInfo.mimeType || fileInfo.type,
        fileSize: fileInfo.size,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
          createdBy: user.uid,
        createdByName: user.displayName || user.email,
        status: 'pending', // Set as pending for admin approval
      };
      
      console.log('Creating content with data:', contentData);
      await createContent(contentData);
      setProgress(100);
      
      Alert.alert(
        'Success', 
        'Content has been submitted for admin approval. It will be available to students once approved.', 
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      console.error('Upload Error:', err);
      Alert.alert('Error', err.message || 'Failed to upload content');
    } finally {
      setUploading(false);
    }
  };

  // Get content type icon
  const getContentTypeIcon = (type) => {
    switch(type) {
      case 'document':
        return 'document-text-outline';
      case 'video':
        return 'videocam-outline';
      case 'audio':
        return 'musical-note-outline';
      case 'image':
        return 'image-outline';
      default:
        return 'document-outline';
    }
  };

  // Full-screen spinner before progress begins
  if (uploading && progress === 0) {
    return (
      <View style={styles.fullscreen}>
        <ActivityIndicator size="large" color="#4285F4" />
        <Text style={styles.uploadingText}>Preparing Upload...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner}>
        <Text style={styles.header}>{translate('teacher.createContent') || 'Create Educational Content'}</Text>
        
        <Text style={styles.label}>{translate('teacher.contentType') || 'Content Type'}</Text>
        <View style={styles.contentTypeSelector}>
          {Object.values(CONTENT_TYPES).map((type) => (
            <TouchableOpacity 
              key={type}
              style={[
                styles.contentTypeButton, 
                contentType === type && styles.contentTypeButtonActive
              ]}
              onPress={() => {
                console.log(`Setting content type to: ${type}`);
                // Force the type to be the exact string value
                if (type === 'document') setContentType('document');
                else if (type === 'video') setContentType('video');
                else if (type === 'audio') setContentType('audio');
                else if (type === 'image') setContentType('image');
                else setContentType(type);
                setFileInfo(null); // Clear previously selected file
              }}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons 
                name={getContentTypeIcon(type)} 
                size={28} 
                color={contentType === type ? "#FFFFFF" : "#333333"} 
              />
              <Text 
                style={[
                  styles.contentTypeText,
                  contentType === type && styles.contentTypeTextActive
                ]}
              >
                {translate(`teacher.contentTypes.${type}`) || type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={styles.input}
          placeholder={translate('teacher.contentTitle') || "Title"}
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder={translate('teacher.contentDescription') || "Description (what will students learn from this content?)"}
          value={description}
          onChangeText={setDescription}
          multiline
        />
        
        <TextInput
          style={styles.input}
          placeholder={translate('teacher.contentTags') || "Tags (comma separated: e.g. numbers, counting, basic)"}
          value={tags}
          onChangeText={setTags}
        />

        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>{translate('teacher.contentCategory') || "Category:"}</Text>
          <Picker
            selectedValue={category}
            onValueChange={setCategory}
            style={styles.picker}
          >
            <Picker.Item label={translate('subjects.math.title') || "Mathematics"} value="math" />
            <Picker.Item label={translate('subjects.english.title') || "English"} value="english" />
            <Picker.Item label={translate('subjects.አማርኛ.title') || "Amharic"} value="amharic" />
            <Picker.Item label={translate('subjects.a/oromo.title') || "Afaan Oromo"} value="oromo" />
          </Picker>
        </View>

        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>{translate('teacher.contentLevel') || "Level:"}</Text>
          <Picker
            selectedValue={level}
            onValueChange={setLevel}
            style={styles.picker}
          >
            <Picker.Item label={translate('teacher.levels.beginner') || "Beginner"} value="beginner" />
            <Picker.Item label={translate('teacher.levels.intermediate') || "Intermediate"} value="intermediate" />
            <Picker.Item label={translate('teacher.levels.advanced') || "Advanced"} value="advanced" />
          </Picker>
        </View>

        <View style={styles.fileSection}>
          <TouchableOpacity style={styles.filePicker} onPress={pickFile}>
            <Ionicons name="cloud-upload-outline" size={28} color="#4285F4" />
            <Text style={styles.filePickerText}>
              {fileInfo 
                ? translate('teacher.changeFile') || "Change File"
                : translate('teacher.selectFile') || `Select ${contentType} File`}
            </Text>
          </TouchableOpacity>
          
          {fileInfo && (
            <View style={styles.fileInfoContainer}>
              <Ionicons 
                name={getContentTypeIcon(contentType)} 
                size={24} 
                color="#4285F4" 
              />
              <View style={styles.fileInfoText}>
                <Text style={styles.fileName}>{fileInfo.name}</Text>
                <Text style={styles.fileSize}>
                  {(fileInfo.size / 1024 / 1024).toFixed(2)} MB
                </Text>
              </View>
            </View>
          )}
        </View>

        {uploading && progress > 0 && (
          <View style={styles.progress}>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { width: `${progress}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>{progress}% Uploaded</Text>
          </View>
        )}

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={24} color="#4285F4" />
          <Text style={styles.infoText}>
            {translate('teacher.reviewNotice') || 
              "Your content will be reviewed by administrators before being published. This helps ensure all content meets our educational standards."}
          </Text>
        </View>

        <TouchableOpacity 
          style={[
            styles.submitButton,
            uploading && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="cloud-upload" size={20} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>
                {translate('teacher.submitForReview') || "Submit for Review"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  uploadingText: {
    marginTop: 16,
    fontSize: 18,
    color: '#4285F4',
  },
  container: { 
    flex: 1, 
    backgroundColor: '#F6F8FA' 
  },
  inner: { 
    padding: 20,
    paddingBottom: 40,
  },
  header: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 20,
    color: '#333'
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  contentTypeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  contentTypeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#E8EAED',
    width: '24%',
    minHeight: 80,
  },
  contentTypeButtonActive: {
    backgroundColor: '#4285F4',
  },
  contentTypeText: {
    fontSize: 13,
    marginTop: 5,
    color: '#333',
    textAlign: 'center',
  },
  contentTypeTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1, 
    borderColor: '#DFE1E5', 
    borderRadius: 8,
    padding: 12, 
    marginBottom: 16, 
    fontSize: 16,
    backgroundColor: '#FFF',
  },
  textArea: { 
    height: 100, 
    textAlignVertical: 'top' 
  },
  pickerContainer: { 
    marginBottom: 16 
  },
  pickerLabel: { 
    fontSize: 16, 
    marginBottom: 8,
    fontWeight: '600',
    color: '#333',
  },
  picker: { 
    borderWidth: 1, 
    borderColor: '#DFE1E5',
    backgroundColor: '#FFF',
    borderRadius: 8,
  },
  fileSection: { 
    marginBottom: 20,
  },
  filePicker: {
    borderWidth: 2,
    borderColor: '#4285F4',
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(66, 133, 244, 0.05)',
  },
  filePickerText: {
    marginTop: 10,
    color: '#4285F4',
    fontSize: 16,
    fontWeight: '600',
  },
  fileInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4285F4',
  },
  fileInfoText: {
    marginLeft: 12,
    flex: 1,
  },
  fileName: { 
    marginTop: 5, 
    fontWeight: '600',
    color: '#333',
  },
  fileSize: {
    color: '#757575',
    fontSize: 14,
    marginTop: 2,
  },
  progress: { 
    marginVertical: 16, 
    alignItems: 'center' 
  },
  progressBarContainer: {
    height: 8,
    width: '100%',
    backgroundColor: '#E8EAED',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4285F4',
  },
  progressText: {
    marginTop: 8,
    color: '#4285F4',
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: 'rgba(66, 133, 244, 0.1)',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoText: {
    marginLeft: 10,
    color: '#555',
    flex: 1,
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#4285F4',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#A4C2F4',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
