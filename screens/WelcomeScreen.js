import React from 'react';
import { 
  SafeAreaView, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Dimensions 
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import LanguageSelector from '../components/LanguageSelector';
import { useLanguage } from '../context/LanguageContext';

const { width, height } = Dimensions.get('window');

const WelcomeText = () => {
  const { translate } = useLanguage();
  const welcomeText = translate('auth.welcome') || 'WELCOME';
  const colors = ['#FF0000','#FF7F00','#FFFF00','#00FF00','#0000FF','#4B0082','#8B00FF'];
  return (
    <View style={styles.welcomeContainer}>
      {welcomeText.split('').map((letter, idx) => (
        <Animatable.Text
          key={idx}
          animation="bounceIn"
          delay={idx * 100}
          style={[
            styles.welcomeLetter,
            {
              color: colors[idx % colors.length],
              // add perspective so rotateY looks 3D
              transform: [
                { perspective: 1000 },
                { rotateY: '20deg' }
              ]
            },
          ]}
        >
          {letter}
        </Animatable.Text>
      ))}
    </View>
  );
};

const WelcomeScreen = ({ navigation }) => {
  const { translate } = useLanguage();
  
  return (
  <SafeAreaView style={styles.container}>
      <LanguageSelector isDark={true} />
      
    <WelcomeText />

    <Animatable.View animation="fadeIn" delay={800} style={styles.illustrationContainer}>
      <Image
        source={require('../assets/images/children-reading.png')}
        style={styles.illustration}
        resizeMode="contain"
      />
    </Animatable.View>

    <Animatable.View animation="fadeInUp" delay={1200} style={styles.buttonContainer}>
      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => navigation.navigate('Login')}
      >
          <Text style={styles.buttonText}>{translate('auth.getStarted')}</Text>
      </TouchableOpacity>
    </Animatable.View>
  </SafeAreaView>
);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1B41',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  welcomeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: height * 0.05,
  },
  welcomeLetter: {
    fontSize: 36,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  illustration: {
    width: width,
    height: width * 0.9,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: height * 0.05,
    gap: 15,
  },
  loginButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    elevation: 5,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
});

export default WelcomeScreen;
