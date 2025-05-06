// src/screens/admin/AdminPanel.js
import React from 'react';
import { View, Button, StyleSheet, SafeAreaView, Text } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function AdmnPanel({ navigation }) {
  const { logout } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>

      <View style={styles.buttonWrapper}>
        <Button
          title="Create Teacher"
          onPress={() => navigation.navigate('CreateTeacher')}
        />
      </View>

      <View style={styles.buttonWrapper}>
        <Button
          title="Manage Users"
          onPress={() => navigation.navigate('ManageUsers')}
        />
      </View>

      <View style={styles.buttonWrapper}>
        <Button
          title="Manage Content"
          onPress={() => navigation.navigate('ManageContent')}
        />
      </View>

      <View style={[styles.buttonWrapper, { marginTop: 40 }]}>
        <Button
          title="Logout"
          color="#D32F2F"
          onPress={logout}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  buttonWrapper: {
    marginVertical: 10,
  },
});
