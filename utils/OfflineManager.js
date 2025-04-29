import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { db } from '../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';

const CONTENT_STORAGE_KEY = '@offline_content';
const DOWNLOAD_DIR = `${FileSystem.documentDirectory}downloads/`;

class OfflineManager {
  constructor() {
    this.initializeStorage();
  }

  async initializeStorage() {
    try {
      const dirInfo = await FileSystem.getInfoAsync(DOWNLOAD_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(DOWNLOAD_DIR, { intermediates: true });
      }
    } catch (error) {
      console.error('Error initializing storage:', error);
    }
  }

  async downloadContent(content) {
    try {
      // Create a unique directory for this content
      const contentDir = `${DOWNLOAD_DIR}${content.id}/`;
      await FileSystem.makeDirectoryAsync(contentDir, { intermediates: true });

      // Download and save all media files
      const mediaDownloads = await Promise.all(
        (content.mediaUrls || []).map(async (url) => {
          const filename = url.split('/').pop();
          const localUri = `${contentDir}${filename}`;
          await FileSystem.downloadAsync(url, localUri);
          return { url, localUri };
        })
      );

      // Save content metadata and file mappings
      const offlineContent = {
        ...content,
        mediaUrls: mediaDownloads.map(({ url, localUri }) => ({
          url,
          localUri,
        })),
        downloadedAt: new Date().toISOString(),
      };

      // Save to AsyncStorage
      const savedContent = await this.getSavedContent();
      savedContent[content.id] = offlineContent;
      await AsyncStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(savedContent));

      // Update Firestore download status
      await updateDoc(doc(db, 'content', content.id), {
        isDownloaded: true,
        lastDownloaded: new Date().toISOString(),
      });

      return true;
    } catch (error) {
      console.error('Error downloading content:', error);
      return false;
    }
  }

  async removeContent(contentId) {
    try {
      // Remove local files
      const contentDir = `${DOWNLOAD_DIR}${contentId}/`;
      await FileSystem.deleteAsync(contentDir, { idempotent: true });

      // Remove from AsyncStorage
      const savedContent = await this.getSavedContent();
      delete savedContent[contentId];
      await AsyncStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(savedContent));

      // Update Firestore status
      await updateDoc(doc(db, 'content', contentId), {
        isDownloaded: false,
        lastDownloaded: null,
      });

      return true;
    } catch (error) {
      console.error('Error removing content:', error);
      return false;
    }
  }

  async getSavedContent() {
    try {
      const content = await AsyncStorage.getItem(CONTENT_STORAGE_KEY);
      return content ? JSON.parse(content) : {};
    } catch (error) {
      console.error('Error getting saved content:', error);
      return {};
    }
  }

  async isContentDownloaded(contentId) {
    try {
      const savedContent = await this.getSavedContent();
      return !!savedContent[contentId];
    } catch (error) {
      console.error('Error checking content status:', error);
      return false;
    }
  }

  async getOfflineContent(contentId) {
    try {
      const savedContent = await this.getSavedContent();
      return savedContent[contentId] || null;
    } catch (error) {
      console.error('Error getting offline content:', error);
      return null;
    }
  }

  async getDownloadedContentList() {
    try {
      const savedContent = await this.getSavedContent();
      return Object.values(savedContent);
    } catch (error) {
      console.error('Error getting downloaded content list:', error);
      return [];
    }
  }
}

export default new OfflineManager(); 