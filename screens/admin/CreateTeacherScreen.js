// src/screens/admin/CreateTeacherScreen.js
import React, { useState } from 'react';
import {
  View,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  SafeAreaView,
  Text
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function CreateTeacherScreen({ navigation }) {
  const { createTeacherAccount } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name || !email || !password) {
      return Alert.alert('Error', 'All fields are required');
    }
    setLoading(true);
    try {
      await createTeacherAccount(email, password, name);
      // Show an OK button that navigates back to ManageUsers
      Alert.alert(
        'Success',
        'Teacher account created',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('ManageUsers'),
          },
        ],
        { cancelable: false }
      );
    } catch (err) {
      Alert.alert('Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Create Teacher Account</Text>
      <TextInput
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <View style={styles.button}>
        <Button
          title={loading ? 'Creating...' : 'Create Teacher'}
          onPress={handleCreate}
          disabled={loading}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center'
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15
  },
  button: {
    marginTop: 10
  }
});
