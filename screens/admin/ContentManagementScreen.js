import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { 
  Appbar, 
  Searchbar, 
  FAB, 
  Menu, 
  Chip,
  Portal,
  Dialog,
  Paragraph,
  Button,
  ActivityIndicator,
  Text
} from 'react-native-paper';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import ContentItem from '../../components/admin/ContentItem';
import { useNavigation } from '@react-navigation/native';

const Tab = createMaterialTopTabNavigator();

const SORT_OPTIONS = {
  NEWEST: 'Newest',
  OLDEST: 'Oldest',
  AZ: 'A-Z',
  LANGUAGE: 'Language'
};

const LANGUAGES = ['Amharic', 'English', 'Afaan Oromo'];

const ContentListScreen = ({ contentType }) => {
  const navigation = useNavigation();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState(SORT_OPTIONS.NEWEST);
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, 'content'),
      where('type', '==', contentType),
      orderBy('lastUpdated', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const contentData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setContent(contentData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching content:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [contentType]);

  const handleSort = (option) => {
    setSortBy(option);
    setSortMenuVisible(false);
    
    let sortedContent = [...content];
    switch (option) {
      case SORT_OPTIONS.NEWEST:
        sortedContent.sort((a, b) => b.lastUpdated - a.lastUpdated);
        break;
      case SORT_OPTIONS.OLDEST:
        sortedContent.sort((a, b) => a.lastUpdated - b.lastUpdated);
        break;
      case SORT_OPTIONS.AZ:
        sortedContent.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case SORT_OPTIONS.LANGUAGE:
        sortedContent.sort((a, b) => a.language.localeCompare(b.language));
        break;
    }
    setContent(sortedContent);
  };

  const handlePublishToggle = async (id, currentStatus) => {
    // Optimistic update
    setContent(prev => prev.map(item =>
      item.id === id ? { ...item, isPublished: !currentStatus } : item
    ));

    try {
      await updateDoc(doc(db, 'content', id), {
        isPublished: !currentStatus,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      // Revert on error
      setContent(prev => prev.map(item =>
        item.id === id ? { ...item, isPublished: currentStatus } : item
      ));
      console.error('Error updating publish status:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;

    try {
      await deleteDoc(doc(db, 'content', selectedItem.id));
      setDeleteDialogVisible(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Error deleting content:', error);
    }
  };

  const filteredContent = content.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLanguage = selectedLanguage === 'All' || item.language === selectedLanguage;
    return matchesSearch && matchesLanguage;
  });

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Search content..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
        
        <Menu
          visible={sortMenuVisible}
          onDismiss={() => setSortMenuVisible(false)}
          anchor={
            <Chip 
              icon="sort" 
              onPress={() => setSortMenuVisible(true)}
              style={styles.sortChip}
            >
              {sortBy}
            </Chip>
          }
        >
          {Object.values(SORT_OPTIONS).map(option => (
            <Menu.Item
              key={option}
              onPress={() => handleSort(option)}
              title={option}
            />
          ))}
        </Menu>
      </View>

      <View style={styles.languageFilter}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Chip
            selected={selectedLanguage === 'All'}
            onPress={() => setSelectedLanguage('All')}
            style={styles.languageChip}
          >
            All
          </Chip>
          {LANGUAGES.map(lang => (
            <Chip
              key={lang}
              selected={selectedLanguage === lang}
              onPress={() => setSelectedLanguage(lang)}
              style={styles.languageChip}
            >
              {lang}
            </Chip>
          ))}
        </ScrollView>
      </View>

      {filteredContent.length === 0 ? (
        <View style={styles.emptyState}>
          <Text>No content found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredContent}
          renderItem={({ item }) => (
            <ContentItem
              item={item}
              onEdit={() => navigation.navigate('ContentEditor', { content: item })}
              onDelete={() => {
                setSelectedItem(item);
                setDeleteDialogVisible(true);
              }}
              onTogglePublish={() => handlePublishToggle(item.id, item.isPublished)}
            />
          )}
          keyExtractor={item => item.id}
        />
      )}

      <Portal>
        <Dialog
          visible={deleteDialogVisible}
          onDismiss={() => setDeleteDialogVisible(false)}
        >
          <Dialog.Title>Confirm Delete</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              Are you sure you want to delete "{selectedItem?.title}"?
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleDelete} color="red">Delete</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('ContentEditor', { contentType })}
      />
    </View>
  );
};

const ContentManagementScreen = () => {
  const navigation = useNavigation();

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Content Management" />
      </Appbar.Header>

      <Tab.Navigator>
        <Tab.Screen 
          name="Lessons" 
          component={() => <ContentListScreen contentType="lesson" />} 
        />
        <Tab.Screen 
          name="Quizzes" 
          component={() => <ContentListScreen contentType="quiz" />} 
        />
        <Tab.Screen 
          name="Media" 
          component={() => <ContentListScreen contentType="media" />} 
        />
      </Tab.Navigator>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  searchBar: {
    flex: 1,
    marginRight: 8,
  },
  sortChip: {
    marginLeft: 8,
  },
  languageFilter: {
    padding: 8,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  languageChip: {
    marginHorizontal: 4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default ContentManagementScreen; 