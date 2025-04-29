import React from 'react';
import { View, Button, Text } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function ParentHome({ navigation }) {
  const { user, logout } = useAuth();

  // Assume there's only one child, so we directly access it
  const child = { id: 'child1', name: 'Your Child' };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <View style={styles.childItem}>
        <Text>{child.name}</Text>
        <Button
          title="Go to Child Dashboard"
          onPress={() => navigation.navigate('ChildDashboard', { childId: child.id })}
        />
      </View>

      <Button
        title="Go to Parent Dashboard"
        onPress={() => navigation.navigate('ParentDashboard')}
      />

      <Button title="Log Out" onPress={logout} />
    </View>
  );
}

const styles = {
  childItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
};
