import React, { useEffect } from 'react';
import { 
  SafeAreaView, 
  View, 
  Text, 
  FlatList, 
  Button, 
  Alert, 
  StyleSheet 
} from 'react-native';
import { useContent } from '../../context/ContentContext.js';

export default function ContentManagementScreen() {
  const {
    pending,
    fetchPending,
    approveContent,
    rejectContent,
  } = useContent();

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
    <View style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.meta}>Category: {item.category}</Text>
      <Text style={styles.meta}>By: {item.createdBy}</Text>
      <Text style={styles.description}>{item.description}</Text>
      <View style={styles.buttons}>
        <Button title="Approve" onPress={() => handleApprove(item.id)} />
        <Button title="Reject" color="#D32F2F" onPress={() => handleReject(item.id)} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Pending Content</Text>
      {pending.length === 0 ? (
        <Text style={styles.empty}>No pending items</Text>
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
  container: { flex:1, padding:20, backgroundColor:'#fff' },
  header: { fontSize:24, fontWeight:'bold', marginBottom:15 },
  list: { paddingBottom: 20 },
  card: {
    marginBottom:15,
    padding:15,
    borderRadius:8,
    backgroundColor:'#f9f9f9',
    shadowColor:'#000',
    shadowOpacity:0.1,
    shadowOffset:{ width:0, height:2 },
    shadowRadius:4,
    elevation:2,
  },
  title: { fontSize:18, fontWeight:'600', marginBottom:5 },
  meta: { fontSize:14, color:'#555' },
  description: { marginTop:10, fontSize:16, color:'#333' },
  buttons: { flexDirection:'row', justifyContent:'space-between', marginTop:15 },
  empty: { textAlign:'center', marginTop:50, color:'#666' },
});
