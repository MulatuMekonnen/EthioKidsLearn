// screens/admin/AdminPanel.js
import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { auth, db } from '../../services/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function AdminPanel() {
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');

  const createTeacher = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        teacherEmail,
        teacherPassword
      );
      
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: teacherEmail,
        role: 'teacher',
        createdAt: new Date().toISOString()
      });

      Alert.alert('Success', 'Teacher account created!');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Teacher Email"
        value={teacherEmail}
        onChangeText={setTeacherEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="Teacher Password"
        secureTextEntry
        value={teacherPassword}
        onChangeText={setTeacherPassword}
        style={styles.input}
      />
      <Button title="Create Teacher" onPress={createTeacher} />
    </View>
  );
}

const styles = {
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 10
  }
};