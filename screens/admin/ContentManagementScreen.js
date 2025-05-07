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
import { Svg, Path, Circle, Rect } from 'react-native-svg';
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

  // Back Arrow Icon
  const BackArrowIcon = () => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 19L5 12L12 5" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  // Refresh Icon
  const RefreshIcon = () => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path d="M1 4V10H7" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M23 20V14H17" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M20.49 9.00001C19.9828 7.56675 19.1209 6.28541 17.9845 5.27543C16.8482 4.26545 15.4745 3.55976 13.9917 3.22427C12.5089 2.88878 10.9652 2.93436 9.50481 3.35677C8.04437 3.77919 6.71475 4.56497 5.64 5.64001L1 10M23 14L18.36 18.36C17.2853 19.435 15.9556 20.2208 14.4952 20.6432C13.0348 21.0656 11.4911 21.1112 10.0083 20.7757C8.52547 20.4402 7.1518 19.7346 6.01547 18.7246C4.87913 17.7146 4.01717 16.4333 3.51 15" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  // Checkmark Icon
  const CheckmarkIcon = () => (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke="#FFF" strokeWidth="2" />
      <Path d="M8 12L11 15L16 9" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  // Close Icon
  const CloseIcon = () => (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke="#D32F2F" strokeWidth="2" />
      <Path d="M15 9L9 15" stroke="#D32F2F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9 9L15 15" stroke="#D32F2F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  // Hourglass Icon
  const HourglassIcon = ({color}) => (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <Path d="M6.5 3H17.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M6.5 21H17.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M7 3L12 10L17 3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M7 21L12 14L17 21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  // Document Icon
  const DocumentIcon = ({color}) => (
    <Svg width="60" height="60" viewBox="0 0 24 24" fill="none">
      <Path d="M14 3V7H18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M17 21H7C6.46957 21 5.96086 20.7893 5.58579 20.4142C5.21071 20.0391 5 19.5304 5 19V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H14L19 8V19C19 19.5304 18.7893 20.0391 18.4142 20.4142C18.0391 20.7893 17.5304 21 17 21Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9 9H10" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M9 13H15" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M9 17H15" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );

  // Category Icons
  const CategoryIcon = ({type, color}) => {
    switch(type.toLowerCase()) {
      case 'calculator-outline':
        return (
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Rect x="4" y="3" width="16" height="18" rx="2" stroke={color} strokeWidth="2" />
            <Path d="M8 7H16" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M8 11H10" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M14 11H16" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M8 15H10" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M14 15H16" stroke={color} strokeWidth="2" strokeLinecap="round" />
          </Svg>
        );
      case 'flask-outline':
        return (
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Path d="M9 3H15" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M12 3V7" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M8 14L6 21H18L16 14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M6.5 13C8.5 10 10 7 10 7H14C14 7 15.5 10 17.5 13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M9 17H15" stroke={color} strokeWidth="2" strokeLinecap="round" />
          </Svg>
        );
      case 'book-outline':
        return (
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Path d="M4 19.5V4.5C4 3.4 4.9 2.5 6 2.5H19.5V19.5H6C4.9 19.5 4 18.6 4 17.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M8 7H15" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M8 11H13" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M8 15H12" stroke={color} strokeWidth="2" strokeLinecap="round" />
          </Svg>
        );
      case 'time-outline': 
        return (
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
            <Path d="M12 6V12L16 14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        );
      case 'color-palette-outline':
        return (
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Path d="M12 3C16.9706 3 21 7.02944 21 12C21 12.9334 20.3943 13.5 19.5 13.5C18.6057 13.5 18 12.8943 18 12C18 11.1057 17.3943 10.5 16.5 10.5C15.6057 10.5 15 11.1057 15 12C15 14.4853 12.9853 16.5 10.5 16.5C8.01472 16.5 6 14.4853 6 12C6 7.02944 8.02944 3 12 3Z" stroke={color} strokeWidth="2" strokeLinejoin="round" />
            <Circle cx="7.5" cy="10.5" r="1.5" fill={color} />
            <Circle cx="11" cy="7.5" r="1.5" fill={color} />
            <Circle cx="15.5" cy="7.5" r="1.5" fill={color} />
          </Svg>
        );
      case 'document-text-outline':
      default:
        return (
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Path d="M14 3V7H18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M17 21H7C6.46957 21 5.96086 20.7893 5.58579 20.4142C5.21071 20.0391 5 19.5304 5 19V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H14L19 8V19C19 19.5304 18.7893 20.0391 18.4142 20.4142C18.0391 20.7893 17.5304 21 17 21Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M9 9H10" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M9 13H15" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <Path d="M9 17H15" stroke={color} strokeWidth="2" strokeLinecap="round" />
          </Svg>
        );
    }
  };

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
            <CategoryIcon type={categoryInfo.icon} color={categoryInfo.color} />
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
            <CheckmarkIcon />
            <Text style={styles.buttonText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: '#F5F5F5' }]}
            onPress={() => handleReject(item.id)}
          >
            <CloseIcon />
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
          <BackArrowIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Content Management</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={refreshing}
        >
          <RefreshIcon />
        </TouchableOpacity>
      </View>
      
      <View style={styles.statusCard}>
        <View style={[styles.statusBadge, { backgroundColor: currentTheme.primary + '15' }]}>
          <HourglassIcon color={currentTheme.primary} />
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
          <DocumentIcon color={currentTheme.textSecondary} />
          <Text style={[styles.empty, { color: currentTheme.textSecondary }]}>
            No pending content to review
          </Text>
          <TouchableOpacity 
            style={[styles.refreshEmptyButton, { backgroundColor: currentTheme.primary }]}
            onPress={handleRefresh}
          >
            <View style={{marginRight: 8}}>
              <RefreshIcon />
            </View>
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
