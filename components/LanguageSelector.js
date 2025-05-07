import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal,
  FlatList,
  TouchableWithoutFeedback,
  Animated
} from 'react-native';
import { Svg, Path, Circle } from 'react-native-svg';
import { useLanguage } from '../context/LanguageContext';

// Globe icon
const GlobeIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="12" cy="12" r="10" />
    <Path d="M2 12h20" />
    <Path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </Svg>
);

export default function LanguageSelector({ isDark = false }) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { languages, currentLanguage, changeLanguage } = useLanguage();
  const dropdownAnim = useRef(new Animated.Value(0)).current;

  const toggleModal = () => {
    if (!isModalVisible) {
      setIsModalVisible(true);
      Animated.spring(dropdownAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(dropdownAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setIsModalVisible(false);
      });
    }
  };

  const handleSelectLanguage = (langCode) => {
    changeLanguage(langCode);
    toggleModal();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.globeButton,
          { backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }
        ]}
        onPress={toggleModal}
      >
        <GlobeIcon />
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={isModalVisible}
        animationType="none"
        onRequestClose={toggleModal}
      >
        <TouchableWithoutFeedback onPress={toggleModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <Animated.View 
                style={[
                  styles.languageDropdown,
                  {
                    transform: [
                      { 
                        translateY: dropdownAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-50, 0]
                        })
                      },
                      { 
                        scaleY: dropdownAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.8, 1]
                        })
                      }
                    ],
                    opacity: dropdownAnim
                  }
                ]}
              >
                <FlatList
                  data={Object.values(languages)}
                  keyExtractor={(item) => item.code}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.languageOption,
                        currentLanguage === item.code && styles.selectedLanguage
                      ]}
                      onPress={() => handleSelectLanguage(item.code)}
                    >
                      <Text style={[
                        styles.languageName,
                        currentLanguage === item.code && styles.selectedLanguageText
                      ]}>
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 100,
  },
  globeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  languageDropdown: {
    position: 'absolute',
    top: 60,
    right: 15,
    width: 150,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  languageOption: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedLanguage: {
    backgroundColor: '#f0f7ff',
  },
  languageName: {
    fontSize: 16,
    color: '#333',
  },
  selectedLanguageText: {
    fontWeight: 'bold',
    color: '#1E90FF',
  }
}); 