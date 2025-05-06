import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase.js';

export default function ChildScores({ navigation }) {
  const [scores, setScores] = useState([]);
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all scores once
  useEffect(() => {
    (async () => {
      const snap = await getDocs(collection(db, 'scores'));
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setScores(all);
      // extract unique parents
      const uniq = [];
      all.forEach(s => {
        if (!uniq.find(u => u.parentId === s.parentId)) {
          uniq.push({ parentId: s.parentId, parentName: s.parentName });
        }
      });
      setParents(uniq);
      setLoading(false);
    })();
  }, []);

  if (loading) return <ActivityIndicator style={styles.loader} />;

  if (parents.length === 0) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>No quiz scores available yet.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Children with Quiz Scores</Text>
      <FlatList
        data={parents}
        keyExtractor={item => item.parentId}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() =>
              navigation.navigate('ScoresByChild', {
                parentId: item.parentId,
                parentName: item.parentName,
              })
            }
          >
            <Text style={styles.name}>{item.parentName}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, padding: 20 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#ddd'
  },
  name: { fontSize: 18 }
});
