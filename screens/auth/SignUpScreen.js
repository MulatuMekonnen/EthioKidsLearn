// SignUpScreen.js
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function SignUpScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await register(email, password);
      Alert.alert('Success', 'Account created successfully!');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Registration Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <>
            <Button title="Sign Up" onPress={handleSignUp} />
            <Button
              title="Already have an account? Login"
              onPress={() => navigation.navigate('Auth')}
              color="gray"
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E90FF',
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    height: 50,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
  },
  buttonContainer: {
    marginTop: 20,
    borderRadius: 8,
    overflow: 'hidden',
  },
  linkContainer: {
    marginTop: 25,
    alignItems: 'center',
  },
  linkText: {
    color: '#666666',
    fontSize: 16,
  },
  link: {
    color: '#1E90FF',
    fontWeight: '600',
  },
});