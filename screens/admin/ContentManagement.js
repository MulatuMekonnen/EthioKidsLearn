import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLanguage } from '../../contexts/LanguageContext';
import { collection, query, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

const ContentManagement = ({ navigation }) => {
  const { translate } = useLanguage();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const contentRef = collection(db, 'lessons');
      const querySnapshot = await getDocs(contentRef);
      
      const contentList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setContent(contentList);
    } catch (error) {
      console.error('Error fetching content:', error);
      Alert.alert(translate('error.title'), translate('error.fetchContent'));
    } finally {
      setLoading(false);
    }
  };

  const handleContentStatus = async (contentId, currentStatus) => {
    try {
      const contentRef = doc(db, 'lessons', contentId);
      await updateDoc(contentRef, {
        isPublished: !currentStatus
      });
      
      // Update local state
      setContent(content.map(item => 
        item.id === contentId 
          ? { ...item, isPublished: !currentStatus }
          : item
      ));
      
      Alert.alert(
        translate('success.title'),
        translate('success.contentStatusUpdated')
      );
    } catch (error) {
      console.error('Error updating content status:', error);
      Alert.alert(translate('error.title'), translate('error.updateContentStatus'));
    }
  };

  const renderContent = ({ item }) => (
    <View style={styles.contentCard}>
      <View style={styles.contentInfo}>
        <Text style={styles.contentTitle}>{item.title}</Text>
        <Text style={styles.contentSubject}>{item.subject}</Text>
        <Text style={styles.contentGrade}>
          {translate('content.grade')}: {item.gradeLevel}
        </Text>
      </View>
      
      <View style={styles.contentActions}>
        <TouchableOpacity
          style={[
            styles.statusButton,
            item.isPublished ? styles.publishedButton : styles.unpublishedButton
          ]}
          onPress={() => handleContentStatus(item.id, item.isPublished)}
        >
          <Text style={styles.statusText}>
            {item.isPublished ? translate('content.published') : translate('content.unpublished')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{translate('admin.contentManagement')}</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddContent')}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={content}
        renderItem={renderContent}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.contentList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {translate('admin.noContent')}
          </Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  contentList: {
    padding: 16,
  },
  contentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  contentInfo: {
    flex: 1,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  contentSubject: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 4,
  },
  contentGrade: {
    fontSize: 14,
    color: '#666',
  },
  contentActions: {
    marginLeft: 16,
  },
  statusButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  publishedButton: {
    backgroundColor: '#4CAF50',
  },
  unpublishedButton: {
    backgroundColor: '#FF5252',
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 32,
  },
});

export default ContentManagement; 