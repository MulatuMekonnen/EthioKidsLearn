import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { 
  Appbar, 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  Checkbox,
  TextInput,
  Snackbar
} from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';

const ReportScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { student } = route.params;
  
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState('');
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });

  const currentTime = new Date().toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  const handleSendReport = async () => {
    if (!checked) {
      setSnackbar({
        visible: true,
        message: 'Please confirm the report by checking the box'
      });
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'reports'), {
        studentId: student.id,
        studentName: student.name,
        subject: student.subject,
        score: student.score || '17/20', // Example score
        comments,
        timestamp: serverTimestamp(),
        status: 'pending'
      });

      setSnackbar({
        visible: true,
        message: 'Report sent successfully!'
      });

      // Navigate back after a short delay
      setTimeout(() => navigation.goBack(), 1500);
    } catch (error) {
      console.error('Error sending report:', error);
      setSnackbar({
        visible: true,
        message: 'Error sending report'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Student Report" subtitle={currentTime} />
      </Appbar.Header>

      <Card style={styles.card}>
        <Card.Content>
          <Title>{student.name}</Title>
          <Paragraph>ID: {student.id}</Paragraph>
          <Paragraph>Subject: {student.subject}</Paragraph>
          <Paragraph style={styles.score}>Quiz Score: 17/20</Paragraph>

          <TextInput
            label="Additional Comments"
            value={comments}
            onChangeText={setComments}
            multiline
            numberOfLines={4}
            style={styles.comments}
          />

          <View style={styles.checkboxContainer}>
            <Checkbox
              status={checked ? 'checked' : 'unchecked'}
              onPress={() => setChecked(!checked)}
            />
            <Paragraph>I confirm this report is accurate</Paragraph>
          </View>
        </Card.Content>
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleSendReport}
          loading={loading}
          disabled={loading}
          style={styles.sendButton}
        >
          Send
        </Button>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.cancelButton}
        >
          Cancel
        </Button>
      </View>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        duration={3000}
      >
        {snackbar.message}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
  },
  score: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  comments: {
    marginTop: 16,
    backgroundColor: 'white',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },
  sendButton: {
    flex: 1,
    marginRight: 8,
  },
  cancelButton: {
    flex: 1,
    marginLeft: 8,
  },
});

export default ReportScreen; 