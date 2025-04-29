import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Searchbar, Button, List, Portal, Dialog, Paragraph, Menu, Chip } from 'react-native-paper';
import { collection, query, orderBy, getDocs, deleteDoc, doc, where } from 'firebase/firestore';
import { db } from '../../config/firebase';

const UserManagementScreen = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  const fetchUsers = async (filter = activeFilter) => {
    try {
      let userQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      
      if (filter !== 'All') {
        userQuery = query(
          collection(db, 'users'),
          where('role', '==', filter),
          orderBy('createdAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(userQuery);
      const usersList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersList);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUsers().finally(() => setRefreshing(false));
  }, []);

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await deleteDoc(doc(db, 'users', selectedUser.id));
      setUsers(users.filter(user => user.id !== selectedUser.id));
      setDeleteDialogVisible(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderUserItem = ({ item }) => (
    <List.Item
      title={item.name}
      description={`${item.role} • ${new Date(item.createdAt).toLocaleDateString()}`}
      right={props => (
        <Button
          {...props}
          onPress={() => {
            setSelectedUser(item);
            setDeleteDialogVisible(true);
          }}
          color="red"
        >
          Delete
        </Button>
      )}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Search users..."
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
              {activeFilter}
            </Chip>
          }
        >
          <Menu.Item 
            onPress={() => {
              setActiveFilter('All');
              setFilterMenuVisible(false);
              fetchUsers('All');
            }} 
            title="All" 
          />
          <Menu.Item 
            onPress={() => {
              setActiveFilter('Teacher');
              setFilterMenuVisible(false);
              fetchUsers('Teacher');
            }} 
            title="Teachers" 
          />
          <Menu.Item 
            onPress={() => {
              setActiveFilter('Admin');
              setFilterMenuVisible(false);
              fetchUsers('Admin');
            }} 
            title="Admins" 
          />
        </Menu>
      </View>

      <FlatList
        data={filteredUsers}
        renderItem={renderUserItem}
        keyExtractor={item => item.id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <Portal>
        <Dialog
          visible={deleteDialogVisible}
          onDismiss={() => setDeleteDialogVisible(false)}
        >
          <Dialog.Title>Confirm Delete</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              Are you sure you want to delete {selectedUser?.name}?
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleDeleteUser} color="red">Delete</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
  },
});

export default UserManagementScreen; 