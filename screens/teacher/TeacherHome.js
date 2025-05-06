import React from 'react';
import { SafeAreaView, View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function TeacherHome({ navigation }) {
  const { user, logout } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header with logout button if needed */}
      <View style={styles.header}>
        <Text style={styles.title}>Teacher Dashboard</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Dashboard Actions */}
      <View style={styles.container}>
        <Button title="Child Progress" onPress={() => navigation.navigate('ChildDashboard')} />
        <View style={styles.buttonSpacing} />
        <Button title="Give Report" onPress={() => {}} />
        <View style={styles.buttonSpacing} />
        <Button title="Send Content" onPress={() => {}} />
        <View style={styles.buttonSpacing} />
        <Button title="Button 4" onPress={() => {}} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: '#1E90FF',
    fontWeight: '600',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  buttonSpacing: {
    marginVertical: 10,
  },
});
