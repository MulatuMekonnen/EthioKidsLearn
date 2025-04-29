import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Image,
} from 'react-native';
import * as Animatable from 'react-native-animatable';

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2; // 60 = padding (20) * 3 for left, right, and middle gap

const roles = [
  { 
    id: '1', 
    title: 'Child', 
    color: '#FF6B6B', 
    route: 'ChildDashboard',
    description: 'Fun learning activities',
    icon: require('../assets/images/play.png')
  },
  { 
    id: '2', 
    title: 'Parent', 
    color: '#4ECDC4', 
    route: 'ParentDashboard',
    description: 'Monitor child progress',
    icon: require('../assets/images/book.png')
  },
  { 
    id: '3', 
    title: 'Teacher', 
    color: '#45B7D1', 
    route: 'TeacherDashboard',
    description: 'Manage student learning',
    icon: require('../assets/images/teacher.png')
  },
  { 
    id: '4', 
    title: 'Admin', 
    color: '#FFEEAD', 
    route: 'AdminDashboard',
    description: 'System administration',
    icon: require('../assets/images/computer.png')
  },
];

export default function RoleSelectionScreen({ navigation }) {
  const renderRoleCard = (role, index) => {
    return (
      <Animatable.View
        animation="zoomIn"
        duration={500}
        delay={index * 150}
        key={role.id}
        style={styles.cardContainer}
      >
        <TouchableOpacity
          style={[styles.card, { backgroundColor: role.color }]}
          onPress={() => navigation.navigate(role.route)}
          activeOpacity={0.8}
        >
          <Image source={role.icon} style={styles.cardIcon} resizeMode="contain" />
          <Text style={styles.cardTitle}>{role.title}</Text>
          <Text style={styles.cardDescription}>{role.description}</Text>
        </TouchableOpacity>
      </Animatable.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animatable.View 
        animation="fadeInDown" 
        duration={800} 
        style={styles.header}
      >
        <Text style={styles.headerText}>EthioKids Learn</Text>
        <Text style={styles.subtitle}>Select your role to continue</Text>
      </Animatable.View>

      <View style={styles.cardsContainer}>
        {roles.map((role, index) => renderRoleCard(role, index))}
      </View>
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
    marginBottom: 40,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 10,
    textAlign: 'center',
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  cardContainer: {
    width: cardWidth,
    marginBottom: 10,
  },
  card: {
    height: cardWidth * 1.2,
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
    padding: 15,
  },
  cardIcon: {
    width: cardWidth * 0.4,
    height: cardWidth * 0.4,
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
});