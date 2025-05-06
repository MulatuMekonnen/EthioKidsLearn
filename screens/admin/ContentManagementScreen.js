import React, { useEffect, useState } from 'react';
import { 
  SafeAreaView, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Alert, 
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useContent } from '../../context/ContentContext';
import { useTheme } from '../../context/ThemeContext';

export default function ContentManagementScreen({ navigation }) {
  const {
    pending,
    fetchPending,
    approveContent,
    rejectContent,
  } = useContent();
  
  const { currentTheme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);
        await fetchPending();
      } catch (error) {
        Alert.alert('Error', 'Failed to load content');
      } finally {
        setLoading(false);
      }
    };
    
    loadContent();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchPending();
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh content');
    } finally {
      setRefreshing(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveContent(id);
      Alert.alert('Success', 'Content has been published.');
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const handleReject = (id) => {
    Alert.alert(
      'Reject Content?',
      'This will mark it as rejected.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reject', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await rejectContent(id);
              Alert.alert('Success', 'Content has been rejected.');
            } catch (err) {
              Alert.alert('Error', err.message);
            }
          } 
        },
      ]
    );
  };

  const getCategoryIcon = (category) => {
    switch(category.toLowerCase()) {
      case 'math':
        return { icon: 'calculator-outline', color: '#4CAF50' };
      case 'science':
        return { icon: 'flask-outline', color: '#2196F3' };
      case 'language':
        return { icon: 'book-outline', color: '#9C27B0' };
      case 'history':
        return { icon: 'time-outline', color: '#FF9800' };
      case 'art':
        return { icon: 'color-palette-outline', color: '#E91E63' };
      default:
        return { icon: 'document-text-outline', color: '#607D8B' };
    }
  };

  const renderItem = ({ item }) => {
    const categoryInfo = getCategoryIcon(item.category);
    
    return (
      <View style={[styles.card, { backgroundColor: currentTheme.card }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.categoryIconContainer, { backgroundColor: categoryInfo.color + '20' }]}>
            <Ionicons name={categoryInfo.icon} size={24} color={categoryInfo.color} />
          </View>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: currentTheme.text }]}>{item.title}</Text>
            <View style={styles.metaContainer}>
              <Text style={[styles.meta, { color: currentTheme.textSecondary }]}>
                Category: <Text style={{color: categoryInfo.color, fontWeight: '600'}}>{item.category}</Text>
              </Text>
              <Text style={[styles.meta, { color: currentTheme.textSecondary }]}>
                By: {item.createdBy}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.descriptionContainer}>
          <Text style={[styles.description, { color: currentTheme.text }]}>{item.description}</Text>
        </View>
        
        <View style={styles.buttons}>
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: currentTheme.primary }]}
            onPress={() => handleApprove(item.id)}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: '#F5F5F5' }]}
            onPress={() => handleReject(item.id)}
          >
            <Ionicons name="close-circle-outline" size={20} color="#D32F2F" style={styles.buttonIcon} />
            <Text style={[styles.buttonText, {color: '#D32F2F'}]}>Reject</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={currentTheme.primary} />
      <View style={[styles.header, { backgroundColor: currentTheme.primary }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Content Management</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={refreshing}
        >
          <Ionicons name="refresh" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.statusCard}>
        <View style={[styles.statusBadge, { backgroundColor: currentTheme.primary + '15' }]}>
          <Ionicons name="hourglass-outline" size={20} color={currentTheme.primary} />
          <Text style={[styles.statusText, { color: currentTheme.primary }]}>
            Pending Review
          </Text>
        </View>
        <Text style={[styles.statusCount, { color: currentTheme.text }]}>
          {pending.length} {pending.length === 1 ? 'item' : 'items'}
        </Text>
      </View>
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={currentTheme.primary} />
          <Text style={[styles.loadingText, { color: currentTheme.text }]}>
            Loading content...
          </Text>
        </View>
      ) : pending.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-outline" size={60} color={currentTheme.textSecondary} />
          <Text style={[styles.empty, { color: currentTheme.textSecondary }]}>
            No pending content to review
          </Text>
          <TouchableOpacity 
            style={[styles.refreshEmptyButton, { backgroundColor: currentTheme.primary }]}
            onPress={handleRefresh}
          >
            <Ionicons name="refresh" size={18} color="#FFF" style={{marginRight: 8}} />
            <Text style={styles.refreshEmptyText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={pending}
          keyExtractor={i => i.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  refreshButton: {
    padding: 8,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  statusCount: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: { 
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  list: { 
    padding: 16,
  },
  card: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  titleContainer: {
    flex: 1,
  },
  title: { 
    fontSize: 18, 
    fontWeight: '600', 
    marginBottom: 5 
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  meta: { 
    fontSize: 14, 
  },
  descriptionContainer: {
    marginTop: 12,
    marginBottom: 8,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 8,
  },
  description: { 
    fontSize: 15,
    lineHeight: 20,
  },
  buttons: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  empty: { 
    textAlign: 'center', 
    marginTop: 16, 
    marginBottom: 24,
    fontSize: 16,
  },
  refreshEmptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  refreshEmptyText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 15,
  }
});
