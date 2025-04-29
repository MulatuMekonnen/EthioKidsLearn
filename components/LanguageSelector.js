import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, Menu, Divider } from 'react-native-paper';
import { useLanguage } from '../contexts/LanguageContext';
import { MaterialIcons } from '@expo/vector-icons';

const LanguageSelector = () => {
  const { currentLanguage, setLanguage } = useLanguage();
  const [visible, setVisible] = React.useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'am', name: 'አማርኛ' },
    { code: 'om', name: 'Afaan Oromo' },
  ];

  return (
    <View style={styles.container}>
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={
          <TouchableOpacity onPress={openMenu} style={styles.button}>
            <MaterialIcons 
              name="language" 
              size={24} 
              color="#fff" 
            />
            <Text style={styles.languageText}>
              {languages.find(lang => lang.code === currentLanguage)?.name}
            </Text>
          </TouchableOpacity>
        }
      >
        {languages.map((language) => (
          <React.Fragment key={language.code}>
            <Menu.Item
              onPress={() => {
                setLanguage(language.code);
                closeMenu();
              }}
              title={language.name}
              leadingIcon={language.code === currentLanguage ? "check" : undefined}
            />
            {language.code !== languages[languages.length - 1].code && <Divider />}
          </React.Fragment>
        ))}
      </Menu>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  languageText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
  },
});

export default LanguageSelector; 