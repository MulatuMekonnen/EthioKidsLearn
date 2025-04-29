import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, SafeAreaView, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2; // 60 = padding (20) * 3 for left, right, and middle gap

const subjects = [
  { id: '1', title: 'Maths', color: '#FF0000', route: 'MathsLesson' },
  { id: '2', title: 'English', color: '#FFFF00', route: 'EnglishLesson' },
  { id: '3', title: 'አማርኛ', color: '#00FF00', route: 'AmharicLesson' },
  { id: '4', title: 'A/Oromo', color: '#FF00FF', route: 'OromoLesson' },
  { id: '5', title: 'Animals and\ntheir Sound', color: '#0088FF', route: 'AnimalsLesson', isWide: true },
  { id: '6', title: 'Days and\nMonths', color: '#FF8800', route: 'CalendarLesson', isWide: true },
];

export default function LessonsScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { currentLanguage, changeLanguage, languages, translate } = useLanguage();
  const [languageModalVisible, setLanguageModalVisible] = React.useState(false);
  
  const userName = user?.displayName || "Student";

  // Debug logs
  useEffect(() => {
    console.log('Current language:', currentLanguage);
    console.log('Available languages:', Object.keys(languages));
    console.log('Translation example:', translate('common.selectLanguage'));
  }, [currentLanguage]);

  const handleLanguageChange = (langCode) => {
    console.log('Changing language to:', langCode);
    changeLanguage(langCode);
    setLanguageModalVisible(false);
  };

  const renderSubjectCard = (subject, index) => {
    const cardStyle = [
      styles.card,
      { backgroundColor: subject.color },
      subject.isWide && styles.wideCard
    ];

    return (
      <Animatable.View
        animation="zoomIn"
        duration={500}
        delay={index * 100}
        key={subject.id}
        style={subject.isWide ? styles.wideCardContainer : styles.cardContainer}
      >
        <TouchableOpacity
          style={cardStyle}
          onPress={() => navigation.navigate(subject.route)}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.cardText,
            subject.color === '#FFFF00' && styles.darkText
          ]}>
            {subject.title}
          </Text>
        </TouchableOpacity>
      </Animatable.View>
    );
  };

  const renderLanguageModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={languageModalVisible}
      onRequestClose={() => setLanguageModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{translate('common.selectLanguage')}</Text>
          
          {Object.values(languages).map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.languageOption,
                currentLanguage === lang.code && styles.selectedLanguage
              ]}
              onPress={() => handleLanguageChange(lang.code)}
            >
              <Text style={[
                styles.languageText,
                currentLanguage === lang.code && styles.selectedLanguageText
              ]}>
                {lang.name}
              </Text>
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setLanguageModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>{translate('common.close')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Helper function to replace placeholder with value
  const formatString = (str, ...values) => {
    return str.replace(/{(\d+)}/g, (match, number) => {
      return typeof values[number] !== 'undefined' ? values[number] : match;
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animatable.View 
        animation="fadeInDown" 
        duration={800} 
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <Text style={styles.greeting}>
            {formatString(translate('lessons.greeting'), userName)}
          </Text>
          <TouchableOpacity 
            style={styles.languageButton}
            onPress={() => setLanguageModalVisible(true)}
          >
            <Text style={styles.languageButtonText}>
              {languages[currentLanguage]?.name || translate('common.language')}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>{translate('lessons.chooseSubject')}</Text>
      </Animatable.View>

      <View style={styles.cardsContainer}>
        {subjects.map((subject, index) => renderSubjectCard(subject, index))}
      </View>

      {renderLanguageModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1B41',
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardContainer: {
    width: cardWidth,
    marginBottom: 20,
  },
  wideCardContainer: {
    width: '100%',
    marginBottom: 20,
  },
  card: {
    height: cardWidth,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    padding: 10,
  },
  wideCard: {
    width: '100%',
    height: cardWidth * 0.5,
  },
  cardText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  darkText: {
    color: '#000000',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
  },
  languageButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginLeft: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  languageButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    maxHeight: '60%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1A1B41',
  },
  languageOption: {
    width: '100%',
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
    backgroundColor: '#f0f0f0',
  },
  selectedLanguage: {
    backgroundColor: '#1A1B41',
  },
  languageText: {
    fontSize: 18,
    textAlign: 'center',
  },
  selectedLanguageText: {
    color: 'white',
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    width: '100%',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});
export default LessonsScreen;