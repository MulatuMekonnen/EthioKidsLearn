import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { 
  Appbar, 
  Searchbar, 
  List, 
  Menu, 
  Chip,
  Text,
  TouchableRipple
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';

const ProgressManagement = () => {
  const navigation = useNavigation();
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [loading, setLoading] = useState(true);

  const currentTime = new Date().toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const studentsRef = collection(db, 'students');
      const q = query(studentsRef);
      const querySnapshot = await getDocs(q);
      
      const studentsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setStudents(studentsList);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === 'All' || student.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const renderStudentItem = ({ item }) => (
    <TouchableRipple
      onPress={() => navigation.navigate('Report', { student: item })}
    >
      <List.Item
        title={`${item.id}, ${item.name}`}
        description={item.subject}
        style={styles.listItem}
      />
    </TouchableRipple>
  );

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Progress Management" subtitle={currentTime} />
      </Appbar.Header>

      <View style={styles.header}>
        <Searchbar
          placeholder="Search students..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
        
        <Menu
          visible={filterMenuVisible}
          onDismiss={() => setFilterMenuVisible(false)}
          anchor={
            <Chip 
              icon="filter" 
              onPress={() => setFilterMenuVisible(true)}
              style={styles.filterChip}
            >
              {selectedSubject}
            </Chip>
          }
        >
          <Menu.Item 
            onPress={() => {
              setSelectedSubject('All');
              setFilterMenuVisible(false);
            }} 
            title="All Subjects" 
          />
          <Menu.Item 
            onPress={() => {
              setSelectedSubject('Math');
              setFilterMenuVisible(false);
            }} 
            title="Math" 
          />
          <Menu.Item 
            onPress={() => {
              setSelectedSubject('English');
              setFilterMenuVisible(false);
            }} 
            title="English" 
          />
        </Menu>
      </View>

      {filteredStudents.length === 0 ? (
        <View style={styles.emptyState}>
          <Text>No students found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredStudents}
          renderItem={renderStudentItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
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
  filterChip: {
    marginLeft: 8,
  },
  listContainer: {
    padding: 8,
  },
  listItem: {
    backgroundColor: 'white',
    marginVertical: 4,
    borderRadius: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProgressManagement; 