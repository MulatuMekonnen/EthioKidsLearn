import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TextInput,
  Button,
  ActivityIndicator,
  StyleSheet,
  Alert
} from 'react-native';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/firebase';

export default function ScoresByChild({ route }) {
  const { parentId, parentName } = route.params;
  const { user } = useAuth(); // the teacher
  const [scores, setScores] = useState([]);
  const [reports, setReports] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const q = query(collection(db, 'scores'), where('parentId', '==', parentId));
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setScores(list);
      const rpt = {};
      list.forEach(s => { rpt[s.id] = ''; });
      setReports(rpt);
      setLoading(false);
    })();
  }, [parentId]);

  const saveReport = async (scoreItem) => {
    const { id, childId, parentId, quizType, score } = scoreItem;
    const reportText = reports[id]?.trim();

    if (!reportText) {
      Alert.alert('Empty Report', 'Please write a report first.');
      return;
    }

    try {
      await addDoc(collection(db, 'reports'), {
        childId,
        parentId,
        teacherId: user.uid,
        quizType,
        score,
        report: reportText,
        timestamp: serverTimestamp()   // <-- use serverTimestamp here
      });
      Alert.alert('Success', 'Report saved.');
    } catch (e) {
      console.error('Error saving report:', e);
      Alert.alert('Error', 'Could not save report.');
    }
  };

  if (loading) return <ActivityIndicator style={styles.loader} />;

  if (scores.length === 0) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>No scores for {parentName} yet.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Scores for {parentName}</Text>
      <FlatList
        data={scores}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.subject}>
              {item.quizType} Quiz – Score: {item.score}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Write progress report..."
              value={reports[item.id]}
              onChangeText={text => setReports(r => ({ ...r, [item.id]: text }))}
              multiline
            />
            <Button
              title="Save Report"
              onPress={() => saveReport(item)}
            />
          </View>
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
  card: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  subject: { fontSize: 18, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    minHeight: 60,
    padding: 10,
    marginBottom: 8,
    textAlignVertical: 'top'
  }
});
