import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  Button, 
  StyleSheet, 
  SafeAreaView, 
  ActivityIndicator, 
  Alert,
  Text,
  TouchableOpacity
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      // on success, AuthContext will handle navigation
    } catch (error) {
      console.log('[LoginScreen] login error:', error, 'code:', error.code, 'message:', error.message);
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Go Back Button to Welcome */}
      <View style={styles.backContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Welcome')}
        >
          <Text style={styles.backText}>Go Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <Text style={styles.title}>EthioKids Learn</Text>
        
        <View style={styles.inputContainer}>
          <Ionicons name="mail" size={22} color="#999" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed" size={22} color="#999" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry={!passwordVisible}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity 
            style={styles.eyeIcon}
            onPress={() => setPasswordVisible(!passwordVisible)}
          >
            <Ionicons 
              name={passwordVisible ? 'eye-off' : 'eye'} 
              size={22} 
              color="#999" 
            />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#1E90FF" />
        ) : (
          <>
            <View style={styles.buttonContainer}>
              <Button
                title="Login"
                onPress={handleLogin}
                color="#1E90FF"
              />
            </View>
            
            <View style={styles.linkContainer}>
              <Text style={styles.linkText}>
                Don't have an account?{' '}
                <Text 
                  style={styles.link}
                  onPress={() => navigation.navigate('SignUp')}
                >
                  Sign up
                </Text>
              </Text>
            </View>
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
  backContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#F0F0F0',
    borderRadius: 6,
  },
  backText: {
    fontSize: 16,
    color: '#1E90FF',
    fontWeight: '600',
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: '#F8F9FA',
  },
  inputIcon: {
    marginLeft: 15,
    marginRight: 5,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 5,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 10,
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
  }
});
