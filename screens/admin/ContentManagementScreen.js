import React, { useEffect } from 'react';
import { 
  SafeAreaView, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Alert, 
  StyleSheet,
  ActivityIndicator
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

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (id) => {
    try {
      await approveContent(id);
      Alert.alert('Approved', 'Content has been published.');
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
              Alert.alert('Rejected', 'Content has been rejected.');
            } catch (err) {
              Alert.alert('Error', err.message);
            }
          } 
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: currentTheme.card }]}>
      <Text style={[styles.title, { color: currentTheme.text }]}>{item.title}</Text>
      <Text style={[styles.meta, { color: currentTheme.textSecondary }]}>Category: {item.category}</Text>
      <Text style={[styles.meta, { color: currentTheme.textSecondary }]}>By: {item.createdBy}</Text>
      <Text style={[styles.description, { color: currentTheme.text }]}>{item.description}</Text>
      <View style={styles.buttons}>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: currentTheme.primary }]}
          onPress={() => handleApprove(item.id)}
        >
          <Text style={styles.buttonText}>Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#D32F2F' }]}
          onPress={() => handleReject(item.id)}
        >
          <Text style={styles.buttonText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <View style={[styles.header, { backgroundColor: currentTheme.primary }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Content Management</Text>
      </View>
      
      <Text style={[styles.sectionHeader, { color: currentTheme.text }]}>Pending Content</Text>
      
      {pending.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-outline" size={60} color={currentTheme.textSecondary} />
          <Text style={[styles.empty, { color: currentTheme.textSecondary }]}>
            No pending content items
          </Text>
        </View>
      ) : (
        <FlatList
          data={pending}
          keyExtractor={i => i.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
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
    padding: 16,
  },
  backButton: {
    marginRight: 12,
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  sectionHeader: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    margin: 16 
  },
  list: { 
    padding: 16,
  },
  card: {
    marginBottom: 15,
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  title: { 
    fontSize: 18, 
    fontWeight: '600', 
    marginBottom: 5 
  },
  meta: { 
    fontSize: 14, 
  },
  description: { 
    marginTop: 10, 
    fontSize: 16,
  },
  buttons: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 15,
    gap: 10
  },
  button: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: { 
    textAlign: 'center', 
    marginTop: 16, 
    fontSize: 16,
  },
});
