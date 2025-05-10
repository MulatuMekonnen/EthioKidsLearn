import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useContent } from '../../context/ContentContext';
import { useTheme } from '../../context/ThemeContext';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ContentsScreen({ route, navigation }) {
  const { category } = route.params;
  const { fetchApprovedByCategory, approvedByCat } = useContent();
  const { currentTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState({});
  const [offlineContent, setOfflineContent] = useState({});

  useEffect(() => {
    loadContent();
    loadOfflineContent();
  }, [category]);

  const loadContent = async () => {
    try {
      setLoading(true);
      await fetchApprovedByCategory(category);
    } catch (error) {
      Alert.alert('Error', 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const loadOfflineContent = async () => {
    try {
      const savedContent = await AsyncStorage.getItem(`offline_content_${category}`);
      if (savedContent) {
        setOfflineContent(JSON.parse(savedContent));
      }
    } catch (error) {
      console.error('Error loading offline content:', error);
    }
  };

  const downloadContent = async (content) => {
    try {
      setDownloading(prev => ({ ...prev, [content.id]: true }));
      
      // Create directory if it doesn't exist
      const dirPath = `${FileSystem.documentDirectory}offline_content/${category}`;
      await FileSystem.makeDirectoryAsync(dirPath, { intermediates: true });
      
      // Download file
      const fileUri = `${dirPath}/${content.fileName}`;
      const downloadResult = await FileSystem.downloadAsync(content.fileUrl, fileUri);
      
      if (downloadResult.status === 200) {
        // Save metadata
        const offlineData = {
          ...content,
          localUri: downloadResult.uri,
          downloadedAt: new Date().toISOString(),
        };
        
        const updatedOfflineContent = {
          ...offlineContent,
          [content.id]: offlineData,
        };
        
        await AsyncStorage.setItem(
          `offline_content_${category}`,
          JSON.stringify(updatedOfflineContent)
        );
        
        setOfflineContent(updatedOfflineContent);
        Alert.alert('Success', 'Content downloaded successfully');
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to download content');
    } finally {
      setDownloading(prev => ({ ...prev, [content.id]: false }));
    }
  };

  const deleteOfflineContent = async (contentId) => {
    try {
      const content = offlineContent[contentId];
      if (content?.localUri) {
        await FileSystem.deleteAsync(content.localUri);
      }
      
      const updatedOfflineContent = { ...offlineContent };
      delete updatedOfflineContent[contentId];
      
      await AsyncStorage.setItem(
        `offline_content_${category}`,
        JSON.stringify(updatedOfflineContent)
      );
      
      setOfflineContent(updatedOfflineContent);
      Alert.alert('Success', 'Content removed from offline storage');
    } catch (error) {
      console.error('Delete error:', error);
      Alert.alert('Error', 'Failed to remove offline content');
    }
  };

  const openContent = async (content) => {
    try {
      if (offlineContent[content.id]) {
        // Handle local file based on content type
        const localUri = offlineContent[content.id].localUri;
        
        if (content.contentType === 'image') {
          // For images, we can use the Image component directly
          navigation.navigate('ImageViewer', { uri: localUri });
        } else if (content.contentType === 'video') {
          // For videos, use the Video component
          navigation.navigate('VideoPlayer', { uri: localUri });
        } else if (content.contentType === 'document') {
          // For documents, use a document viewer
          navigation.navigate('DocumentViewer', { uri: localUri });
        } else {
          // For other types, try to open with system viewer
          const canOpen = await Linking.canOpenURL(localUri);
          if (canOpen) {
            await Linking.openURL(localUri);
          } else {
            Alert.alert('Error', 'Cannot open this file type');
          }
        }
      } else {
        // Open online file
        const canOpen = await Linking.canOpenURL(content.fileUrl);
        if (canOpen) {
          await Linking.openURL(content.fileUrl);
        } else {
          Alert.alert('Error', 'Cannot open this file type');
        }
      }
    } catch (error) {
      console.error('Error opening content:', error);
      Alert.alert('Error', 'Failed to open content');
    }
  };

  const renderContentItem = ({ item }) => {
    const isDownloaded = !!offlineContent[item.id];
    const isDownloading = downloading[item.id];

    return (
      <View style={[styles.contentCard, { backgroundColor: currentTheme.card }]}>
        <View style={styles.contentHeader}>
          <Ionicons 
            name={getContentTypeIcon(item.contentType)} 
            size={24} 
            color={currentTheme.primary} 
          />
          <Text style={[styles.contentTitle, { color: currentTheme.text }]}>
            {item.title}
          </Text>
        </View>

        <Text style={[styles.contentDescription, { color: currentTheme.textSecondary }]}>
          {item.description}
        </Text>

        <View style={styles.contentMeta}>
          <Text style={[styles.metaText, { color: currentTheme.textSecondary }]}>
            Level: {item.level}
          </Text>
          {item.tags && item.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {item.tags.map((tag, index) => (
                <View 
                  key={index} 
                  style={[styles.tag, { backgroundColor: currentTheme.primary + '15' }]}
                >
                  <Text style={[styles.tagText, { color: currentTheme.primary }]}>
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: currentTheme.primary }]}
            onPress={() => openContent(item)}
          >
            <Ionicons name="play-outline" size={20} color="#FFF" />
            <Text style={styles.actionButtonText}>
              {isDownloaded ? 'Open Offline' : 'View Online'}
            </Text>
          </TouchableOpacity>

          {!isDownloaded ? (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
              onPress={() => downloadContent(item)}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Ionicons name="download-outline" size={20} color="#FFF" />
                  <Text style={styles.actionButtonText}>Download</Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#F44336' }]}
              onPress={() => deleteOfflineContent(item.id)}
            >
              <Ionicons name="trash-outline" size={20} color="#FFF" />
              <Text style={styles.actionButtonText}>Remove</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

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

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={currentTheme.primary} />
          <Text style={[styles.loadingText, { color: currentTheme.text }]}>
            Loading content...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <View style={[styles.header, { backgroundColor: currentTheme.primary }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {category.charAt(0).toUpperCase() + category.slice(1)} Content
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={approvedByCat[category] || []}
        renderItem={renderContentItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.contentList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color={currentTheme.textSecondary} />
            <Text style={[styles.emptyText, { color: currentTheme.textSecondary }]}>
              No content available for this category
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  contentList: {
    padding: 16,
  },
  contentCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  contentDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  contentMeta: {
    marginBottom: 16,
  },
  metaText: {
    fontSize: 14,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: '#FFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
}); 