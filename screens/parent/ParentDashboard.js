import React from 'react';
import { SafeAreaView, View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';

export default function ParentDashboard({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Go Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate('ParentHome')}
      >
        <Text style={styles.backText}>Go Back</Text>
      </TouchableOpacity>

      {/* Dashboard Actions */}
      <View style={styles.container}>
        <Button title="Child Progress" onPress={() => {}} />
        <View style={styles.buttonSpacing} />
        <Button title="View Report" onPress={() => {}} />
        <View style={styles.buttonSpacing} />
        <Button title="Button 3" onPress={() => {}} />
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
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F0F0F0',
    borderRadius: 6,
    alignSelf: 'flex-start',
    margin: 16,
  },
  backText: {
    fontSize: 16,
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
