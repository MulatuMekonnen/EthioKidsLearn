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
import { Svg, Path, Circle } from 'react-native-svg';
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

  // SVG Icons
  const BackIcon = () => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  const PersonIcon = () => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="4" stroke={currentTheme.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M20 21C20 16.5817 16.4183 13 12 13C7.58172 13 4 16.5817 4 21" stroke={currentTheme.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  const NotificationIcon = () => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path d="M10 5C10 4.44772 10.4477 4 11 4H12C12.5523 4 13 4.44772 13 5C13 5.55228 12.5523 6 12 6H11C10.4477 6 10 5.55228 10 5Z" stroke={currentTheme.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M18.9227 18C19.1874 18 19.4043 17.7578 19.3225 17.5033C18.9099 16.3454 18.0072 15.3537 16.7555 14.7127C15.4648 14.047 13.9042 13.75 12.3217 13.75H10.6783C9.09582 13.75 7.5352 14.047 6.24454 14.7127C4.99277 15.3537 4.09012 16.3454 3.67746 17.5033C3.59566 17.7578 3.81262 18 4.07735 18H18.9227Z" stroke={currentTheme.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M8.57129 14L7.00001 3.5L12 6L17 3.5L15.4287 14" stroke={currentTheme.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  const VolumeIcon = () => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path d="M11 5L6 9H2V15H6L11 19V5Z" stroke={currentTheme.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M19.07 4.93C20.9447 6.80528 21.9979 9.34837 22 12C22 14.6516 20.9447 17.1947 19.07 19.07M15.54 8.46C16.4774 9.39764 17.0039 10.6692 17.0039 12C17.0039 13.3308 16.4774 14.6024 15.54 15.54" stroke={currentTheme.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  const ChartIcon = () => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path d="M18 20V10" stroke={currentTheme.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 20V4" stroke={currentTheme.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M6 20V14" stroke={currentTheme.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  const LogoutIcon = () => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Path d="M16 17L21 12M21 12L16 7M21 12H9" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21H9" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );

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
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        {/* Account Section */}
        <View style={[styles.section, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Account</Text>
          <View style={[styles.settingItem, { borderBottomColor: currentTheme.border }]}>
            <PersonIcon />
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: currentTheme.text }]}>Email</Text>
              <Text style={[styles.settingValue, { color: currentTheme.textSecondary || currentTheme.text }]}>{user?.email}</Text>
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
                  { 
                    borderColor: currentTheme.border,
                    backgroundColor: currentTheme.id === theme.id ? currentTheme.primary + '20' : 'transparent'
                  },
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
          <View style={[styles.settingItem, { borderBottomColor: currentTheme.border }]}>
            <NotificationIcon />
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: currentTheme.text }]}>Notifications</Text>
              <Switch
                value={notifications}
                onValueChange={handleNotificationToggle}
                trackColor={{ false: currentTheme.mode === 'dark' ? '#444' : '#ccc', true: currentTheme.primary }}
                thumbColor={notifications ? '#fff' : currentTheme.mode === 'dark' ? '#f4f3f4' : '#f4f3f4'}
                ios_backgroundColor={currentTheme.mode === 'dark' ? '#444' : '#ccc'}
              />
            </View>
          </View>
          <View style={[styles.settingItem, { borderBottomColor: currentTheme.border }]}>
            <VolumeIcon />
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: currentTheme.text }]}>Sound Effects</Text>
              <Switch
                value={soundEffects}
                onValueChange={handleSoundEffectsToggle}
                trackColor={{ false: currentTheme.mode === 'dark' ? '#444' : '#ccc', true: currentTheme.primary }}
                thumbColor={soundEffects ? '#fff' : currentTheme.mode === 'dark' ? '#f4f3f4' : '#f4f3f4'}
                ios_backgroundColor={currentTheme.mode === 'dark' ? '#444' : '#ccc'}
              />
            </View>
          </View>
          <View style={[styles.settingItem, { borderBottomColor: 'transparent' }]}>
            <ChartIcon />
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: currentTheme.text }]}>Progress Tracking</Text>
              <Switch
                value={progressTracking}
                onValueChange={handleProgressTrackingToggle}
                trackColor={{ false: currentTheme.mode === 'dark' ? '#444' : '#ccc', true: currentTheme.primary }}
                thumbColor={progressTracking ? '#fff' : currentTheme.mode === 'dark' ? '#f4f3f4' : '#f4f3f4'}
                ios_backgroundColor={currentTheme.mode === 'dark' ? '#444' : '#ccc'}
              />
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { 
            backgroundColor: currentTheme.card, 
            borderColor: '#FF3B30',
            marginBottom: 24
          }]}
          onPress={handleLogout}
        >
          <LogoutIcon />
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
    borderBottomColor: 'transparent',
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