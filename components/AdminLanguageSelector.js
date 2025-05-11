import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Modal,
  TouchableWithoutFeedback,
  Dimensions
} from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Svg, Path } from 'react-native-svg';

const AdminLanguageSelector = () => {
  const { currentLanguage, changeLanguage, languages, translate } = useLanguage();
  const { currentTheme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const buttonRef = useRef(null);
  const [modalPosition, setModalPosition] = useState({ top: 0, right: 0 });

  const handleLanguageChange = (languageCode) => {
    changeLanguage(languageCode);
    setModalVisible(false);
  };

  const showModal = () => {
    if (buttonRef.current) {
      buttonRef.current.measure((x, y, width, height, pageX, pageY) => {
        setModalPosition({
          top: pageY + height,
          right: Dimensions.get('window').width - (pageX + width)
        });
        setModalVisible(true);
      });
    } else {
      setModalVisible(true);
    }
  };

  const CheckIcon = () => (
    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <Path d="M5 12L10 17L19 8" stroke={currentTheme.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );

  // Get language code for display
  const getLanguageCode = () => {
    switch(currentLanguage) {
      case 'en': return 'EN';
      case 'am': return 'AM';
      case 'or': return 'OR';
      default: return 'EN';
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        ref={buttonRef}
        style={styles.languageButton}
        onPress={showModal}
      >
        <Text style={[styles.languageLabel, { color: currentTheme.text }]}>
          {translate('common.language')}
        </Text>
        <Text style={[styles.languageCode, { color: currentTheme.primary }]}>
          {getLanguageCode()}
        </Text>
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View 
                style={[
                  styles.modalContent, 
                  { 
                    backgroundColor: currentTheme.card,
                    position: 'absolute',
                    top: modalPosition.top,
                    right: modalPosition.right
                  }
                ]}
              >
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: currentTheme.text }]}>
                    {translate('common.selectLanguage')}
                  </Text>
                </View>
                
                {Object.values(languages).map((lang) => (
                  <TouchableOpacity
                    key={lang.code}
                    style={[
                      styles.languageOption,
                      currentLanguage === lang.code && { backgroundColor: currentTheme.primary + '10' }
                    ]}
                    onPress={() => handleLanguageChange(lang.code)}
                  >
                    <Text style={[styles.languageOptionText, { color: currentTheme.text }]}>
                      {lang.name}
                    </Text>
                    {currentLanguage === lang.code && (
                      <CheckIcon />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    width: '100%',
  },
  languageLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  languageCode: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '60%',
    maxWidth: 250,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  languageOptionText: {
    fontSize: 15,
  },
});

export default AdminLanguageSelector; 