import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLanguage } from '../../contexts/LanguageContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

const AddContent = ({ navigation }) => {
  const { translate } = useLanguage();
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    gradeLevel: '',
    description: '',
    content: '',
    isPublished: false,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.title || !formData.subject || !formData.gradeLevel || !formData.content) {
      Alert.alert(translate('error.title'), translate('error.fillRequiredFields'));
      return;
    }

    setLoading(true);
    try {
      const contentRef = collection(db, 'lessons');
      await addDoc(contentRef, {
        ...formData,
        createdAt: new Date(),
      });
      
      Alert.alert(
        translate('success.title'),
        translate('success.contentAdded'),
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error adding content:', error);
      Alert.alert(translate('error.title'), translate('error.addContent'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>{translate('admin.addContent')}</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{translate('content.title')} *</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholder={translate('content.titlePlaceholder')}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{translate('content.subject')} *</Text>
            <TextInput
              style={styles.input}
              value={formData.subject}
              onChangeText={(text) => setFormData({ ...formData, subject: text })}
              placeholder={translate('content.subjectPlaceholder')}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{translate('content.grade')} *</Text>
            <TextInput
              style={styles.input}
              value={formData.gradeLevel}
              onChangeText={(text) => setFormData({ ...formData, gradeLevel: text })}
              placeholder={translate('content.gradePlaceholder')}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{translate('content.description')}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder={translate('content.descriptionPlaceholder')}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{translate('content.content')} *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.content}
              onChangeText={(text) => setFormData({ ...formData, content: text })}
              placeholder={translate('content.contentPlaceholder')}
              multiline
              numberOfLines={8}
            />
          </View>

          <View style={styles.publishContainer}>
            <Text style={styles.label}>{translate('content.publishStatus')}</Text>
            <TouchableOpacity
              style={[
                styles.publishButton,
                formData.isPublished ? styles.publishedButton : styles.unpublishedButton
              ]}
              onPress={() => setFormData({ ...formData, isPublished: !formData.isPublished })}
            >
              <Text style={styles.publishText}>
                {formData.isPublished ? translate('content.published') : translate('content.unpublished')}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? translate('common.saving') : translate('common.save')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
  },
  formContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  publishContainer: {
    marginBottom: 24,
  },
  publishButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  publishedButton: {
    backgroundColor: '#4CAF50',
  },
  unpublishedButton: {
    backgroundColor: '#FF5252',
  },
  publishText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddContent; 