import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';

export default function Settings() {
  const { user, logout } = useAuth();
  const { currentTheme, changeTheme, themes } = useTheme();
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [progressTracking, setProgressTracking] = useState(true);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleThemeChange = (themeId) => {
    changeTheme(themeId);
    Alert.alert('Theme Updated', 'The theme has been updated successfully!');
  };

  const handleNotificationToggle = (value) => {
    setNotifications(value);
    // TODO: Implement notification settings
  };

  const handleSoundEffectsToggle = (value) => {
    setSoundEffects(value);
    // TODO: Implement sound effects settings
  };

  const handleProgressTrackingToggle = (value) => {
    setProgressTracking(value);
    // TODO: Implement progress tracking settings
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <View style={[styles.header, { backgroundColor: currentTheme.primary }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        {/* Account Section */}
        <View style={[styles.section, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Account</Text>
          <View style={styles.settingItem}>
            <Ionicons name="person-circle-outline" size={24} color={currentTheme.text} />
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: currentTheme.text }]}>Email</Text>
              <Text style={[styles.settingValue, { color: currentTheme.text }]}>{user?.email}</Text>
            </View>
          </View>
        </View>

        {/* Theme Selection */}
        <View style={[styles.section, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Theme</Text>
          <View style={styles.themeContainer}>
            {Object.values(themes).map((theme) => (
              <TouchableOpacity
                key={theme.id}
                style={[
                  styles.themeOption,
                  { borderColor: currentTheme.border },
                  currentTheme.id === theme.id && { borderColor: currentTheme.primary },
                ]}
                onPress={() => handleThemeChange(theme.id)}
              >
                <View
                  style={[
                    styles.themePreview,
                    { backgroundColor: theme.primary },
                  ]}
                />
                <Text style={[styles.themeName, { color: currentTheme.text }]}>{theme.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Preferences Section */}
        <View style={[styles.section, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Preferences</Text>
          <View style={styles.settingItem}>
            <Ionicons name="notifications-outline" size={24} color={currentTheme.text} />
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: currentTheme.text }]}>Notifications</Text>
              <Switch
                value={notifications}
                onValueChange={handleNotificationToggle}
                trackColor={{ false: '#767577', true: currentTheme.primary }}
                thumbColor={notifications ? currentTheme.primary : '#f4f3f4'}
              />
            </View>
          </View>
          <View style={styles.settingItem}>
            <Ionicons name="volume-high-outline" size={24} color={currentTheme.text} />
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: currentTheme.text }]}>Sound Effects</Text>
              <Switch
                value={soundEffects}
                onValueChange={handleSoundEffectsToggle}
                trackColor={{ false: '#767577', true: currentTheme.primary }}
                thumbColor={soundEffects ? currentTheme.primary : '#f4f3f4'}
              />
            </View>
          </View>
          <View style={styles.settingItem}>
            <Ionicons name="bar-chart-outline" size={24} color={currentTheme.text} />
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: currentTheme.text }]}>Progress Tracking</Text>
              <Switch
                value={progressTracking}
                onValueChange={handleProgressTrackingToggle}
                trackColor={{ false: '#767577', true: currentTheme.primary }}
                thumbColor={progressTracking ? currentTheme.primary : '#f4f3f4'}
              />
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: currentTheme.card, borderColor: '#FF3B30' }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 16,
  },
  settingLabel: {
    fontSize: 16,
  },
  settingValue: {
    fontSize: 14,
  },
  themeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  themeOption: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 16,
    padding: 8,
    borderRadius: 8,
    borderWidth: 2,
  },
  themePreview: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 8,
  },
  themeName: {
    fontSize: 14,
    textAlign: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
}); 