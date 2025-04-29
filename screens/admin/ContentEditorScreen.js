import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { 
  TextInput, 
  Button, 
  Appbar, 
  HelperText, 
  Snackbar,
  Menu,
  Divider,
  List
} from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const LANGUAGES = ['Amharic', 'English', 'Afaan Oromo'];

const ContentEditorScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { content, contentType } = route.params || {};
  const isEditing = !!content;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    language: 'English',
    content: '',
    type: contentType || 'lesson',
    isPublished: false,
    mediaUrls: [],
    ...content
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.content) newErrors.content = 'Content is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 0.8,
      });

      if (!result.canceled) {
        setLoading(true);
        const storage = getStorage();
        const filename = result.assets[0].uri.split('/').pop();
        const storageRef = ref(storage, `content/${filename}`);

        // Convert URI to blob
        const response = await fetch(result.assets[0].uri);
        const blob = await response.blob();

        // Upload file
        await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(storageRef);

        setFormData(prev => ({
          ...prev,
          mediaUrls: [...prev.mediaUrls, downloadURL]
        }));

        setSnackbar({
          visible: true,
          message: 'Media uploaded successfully!'
        });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setSnackbar({
        visible: true,
        message: 'Error uploading media'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const contentData = {
        ...formData,
        lastUpdated: serverTimestamp()
      };

      if (isEditing) {
        await updateDoc(doc(db, 'content', content.id), contentData);
      } else {
        await setDoc(doc(db, 'content'), contentData);
      }

      setSnackbar({
        visible: true,
        message: `Content ${isEditing ? 'updated' : 'created'} successfully!`
      });

      navigation.goBack();
    } catch (error) {
      console.error('Error saving content:', error);
      setSnackbar({
        visible: true,
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={isEditing ? 'Edit Content' : 'New Content'} />
        <Appbar.Action icon="check" onPress={handleSave} disabled={loading} />
      </Appbar.Header>

      <ScrollView style={styles.container}>
        <TextInput
          label="Title"
          value={formData.title}
          onChangeText={(text) => setFormData({ ...formData, title: text })}
          style={styles.input}
          error={!!errors.title}
        />
        <HelperText type="error" visible={!!errors.title}>
          {errors.title}
        </HelperText>

        <TextInput
          label="Description"
          value={formData.description}
          onChangeText={(text) => setFormData({ ...formData, description: text })}
          style={styles.input}
          multiline
          numberOfLines={3}
          error={!!errors.description}
        />
        <HelperText type="error" visible={!!errors.description}>
          {errors.description}
        </HelperText>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.language}
            onValueChange={(value) => setFormData({ ...formData, language: value })}
            style={styles.picker}
          >
            {LANGUAGES.map(lang => (
              <Picker.Item key={lang} label={lang} value={lang} />
            ))}
          </Picker>
        </View>

        <TextInput
          label="Content"
          value={formData.content}
          onChangeText={(text) => setFormData({ ...formData, content: text })}
          style={styles.input}
          multiline
          numberOfLines={10}
          error={!!errors.content}
        />
        <HelperText type="error" visible={!!errors.content}>
          {errors.content}
        </HelperText>

        <Button
          mode="outlined"
          onPress={handleImageUpload}
          style={styles.uploadButton}
          icon="image"
          loading={loading}
        >
          Add Media
        </Button>

        {formData.mediaUrls.length > 0 && (
          <List.Section>
            <List.Subheader>Attached Media</List.Subheader>
            {formData.mediaUrls.map((url, index) => (
              <List.Item
                key={url}
                title={`Media ${index + 1}`}
                left={props => <List.Icon {...props} icon="file" />}
                right={props => (
                  <IconButton
                    {...props}
                    icon="close"
                    onPress={() => {
                      setFormData(prev => ({
                        ...prev,
                        mediaUrls: prev.mediaUrls.filter(u => u !== url)
                      }));
                    }}
                  />
                )}
              />
            ))}
          </List.Section>
        )}

        <Snackbar
          visible={snackbar.visible}
          onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
          duration={3000}
        >
          {snackbar.message}
        </Snackbar>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  input: {
    marginBottom: 8,
    backgroundColor: 'white',
  },
  pickerContainer: {
    marginVertical: 16,
    backgroundColor: 'white',
    borderRadius: 4,
  },
  picker: {
    height: 50,
  },
  uploadButton: {
    marginTop: 16,
  },
});

export default ContentEditorScreen; 