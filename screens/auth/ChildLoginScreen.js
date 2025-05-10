import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  ImageBackground
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Animatable from 'react-native-animatable';
import { db, auth } from '../../services/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

// PIN Pad Component
const PinPad = ({ onPinComplete }) => {
  const [pin, setPin] = useState('');
  
  const handleNumberPress = (number) => {
    if (pin.length < 4) {
      const newPin = pin + number;
      setPin(newPin);
      
      if (newPin.length === 4) {
        onPinComplete(newPin);
      }
    }
  };
  
  const handleDelete = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
    }
  };
  
  return (
    <View style={styles.pinPadContainer}>
      {/* PIN Display */}
      <View style={styles.pinDisplay}>
        {[0, 1, 2, 3].map((index) => (
          <View 
            key={index} 
            style={[
              styles.pinDot, 
              pin.length > index ? styles.pinDotFilled : {}
            ]}
          />
        ))}
      </View>
      
      {/* Number Pad */}
      <View style={styles.numberPad}>
        {/* First row: 1, 2, 3 */}
        <View style={styles.numberRow}>
          {[1, 2, 3].map((num) => (
            <TouchableOpacity
              key={num}
              style={styles.numberButton}
              onPress={() => handleNumberPress(num.toString())}
            >
              <Text style={styles.numberText}>{num}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Second row: 4, 5, 6 */}
        <View style={styles.numberRow}>
          {[4, 5, 6].map((num) => (
            <TouchableOpacity
              key={num}
              style={styles.numberButton}
              onPress={() => handleNumberPress(num.toString())}
            >
              <Text style={styles.numberText}>{num}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Third row: 7, 8, 9 */}
        <View style={styles.numberRow}>
          {[7, 8, 9].map((num) => (
            <TouchableOpacity
              key={num}
              style={styles.numberButton}
              onPress={() => handleNumberPress(num.toString())}
            >
              <Text style={styles.numberText}>{num}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Fourth row: empty, 0, delete */}
        <View style={styles.numberRow}>
          <View style={styles.emptyButton} />
          <TouchableOpacity
            style={[styles.numberButton, styles.zeroButton]}
            onPress={() => handleNumberPress('0')}
          >
            <Text style={[styles.numberText, styles.zeroText]}>0</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <View style={styles.deleteIconContainer}>
              <Ionicons name="backspace" size={30} color="#E53935" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default function ChildLoginScreen() {
  const navigation = useNavigation();
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  
  useEffect(() => {
    loadChildren();
  }, []);
  
  const loadChildren = async () => {
    try {
      let childrenData = [];
      
      // Check if a user is logged in
      const currentUser = auth.currentUser;
      
      if (currentUser) {
        // Try to load from Firestore first
        try {
          const childrenCollectionRef = collection(db, `users/${currentUser.uid}/children`);
          const querySnapshot = await getDocs(query(childrenCollectionRef, orderBy('name')));
          
          if (!querySnapshot.empty) {
            childrenData = querySnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              parentId: currentUser.uid // Add parent ID to track ownership
            }));
            
            // Save to AsyncStorage with parent ID to identify ownership
            await AsyncStorage.setItem('children', JSON.stringify(childrenData));
          }
        } catch (error) {
          console.error('Error loading children from Firestore:', error);
        }
      }
      
      // If no children loaded from Firestore or no user logged in, try AsyncStorage
      if (childrenData.length === 0) {
        const savedChildren = await AsyncStorage.getItem('children');
        if (savedChildren) {
          const parsedChildren = JSON.parse(savedChildren);
          
          // If user is logged in, only show children that belong to this parent
          if (currentUser) {
            childrenData = parsedChildren.filter(child => 
              !child.parentId || child.parentId === currentUser.uid
            );
          } else {
            childrenData = parsedChildren;
          }
        }
      }
      
      // Add default PINs to children if they don't already have them
      const childrenWithPins = childrenData.map(child => {
        if (!child.pin) {
          // Generate default PIN (last 4 digits of ID or first 4 if ID is short)
          const defaultPin = child.id.slice(-4).padStart(4, '0');
          return { ...child, pin: defaultPin };
        }
        return child;
      });
      
      // Save children with pins back to storage
      await AsyncStorage.setItem('children', JSON.stringify(childrenWithPins));
      setChildren(childrenWithPins);
    } catch (error) {
      console.error('Error loading children:', error);
      
      // Fallback to AsyncStorage if all else fails
      try {
        const savedChildren = await AsyncStorage.getItem('children');
        if (savedChildren) {
          setChildren(JSON.parse(savedChildren));
        } else {
          setChildren([]);
        }
      } catch (e) {
        console.error('Error with AsyncStorage fallback:', e);
        setChildren([]);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleChildSelect = (child) => {
    setSelectedChild(child);
  };
  
  const handlePinComplete = async (pin) => {
    setVerifying(true);
    
    // Simulate verification delay
    setTimeout(async () => {
      if (pin === selectedChild.pin) {
        // PIN matches!
        try {
          // Save active child to storage
          await AsyncStorage.setItem('activeChild', JSON.stringify(selectedChild));
          
          // Navigate to lessons screen
          navigation.navigate('LessonsScreen', {
            childId: selectedChild.id,
            childName: selectedChild.name
          });
        } catch (error) {
          console.error('Error saving active child:', error);
          Alert.alert('Error', 'Failed to login. Please try again.');
        }
      } else {
        // PIN doesn't match
        Alert.alert('Incorrect PIN', 'The PIN you entered is incorrect. Please try again.');
      }
      setVerifying(false);
      setSelectedChild(null);
    }, 1000);
  };
  
  const handleBackToParent = () => {
    navigation.goBack();
  };
  
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackToParent}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Child Login</Text>
        <View style={styles.headerRight} />
      </View>
      
      <View style={styles.container}>
        {selectedChild ? (
          <View style={styles.pinContainer}>
            <Animatable.View animation="fadeIn" style={styles.selectedChildInfo}>
              <View style={styles.avatarLarge}>
                <Text style={styles.avatarTextLarge}>{selectedChild.name.charAt(0)}</Text>
              </View>
              <Text style={styles.selectedChildName}>{selectedChild.name}</Text>
              <Text style={styles.pinInstructions}>Please enter your 4-digit PIN</Text>
            </Animatable.View>
            
            {verifying ? (
              <ActivityIndicator size="large" color="#2196F3" />
            ) : (
              <PinPad onPinComplete={handlePinComplete} />
            )}
            
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => setSelectedChild(null)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.profileSelectionContainer}>
            <Text style={styles.subtitle}>Select your profile to continue</Text>
            
            {children.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="person-outline" size={64} color="#666" />
                <Text style={styles.emptyStateText}>No child profiles found</Text>
                <Text style={styles.emptyStateSubText}>Ask a parent to create a profile for you</Text>
              </View>
            ) : (
              <ScrollView style={styles.childrenList} contentContainerStyle={styles.childrenListContent}>
                {children.map((child) => (
                  <Animatable.View key={child.id} animation="fadeInUp">
                    <TouchableOpacity
                      style={styles.childCard}
                      onPress={() => handleChildSelect(child)}
                    >
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{child.name.charAt(0)}</Text>
                      </View>
                      <View style={styles.childInfo}>
                        <Text style={styles.childName}>{child.name}</Text>
                        <Text style={styles.childLevel}>Level: {child.level || 1}</Text>
                      </View>
                      <View style={styles.chevron}>
                        <Ionicons name="chevron-forward" size={24} color="#2196F3" />
                      </View>
                    </TouchableOpacity>
                  </Animatable.View>
                ))}
              </ScrollView>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EEF6FF', // Lighter blue background
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    padding: 20,
    paddingBottom: 30,
  },
  profileSelectionContainer: {
    flex: 1,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2196F3',
    width: '100%',
    padding: 12,
    paddingVertical: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  headerRight: {
    width: 30,
  },
  subtitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  childrenList: {
    flex: 1,
    width: '100%',
  },
  childrenListContent: {
    paddingBottom: 20,
  },
  childCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  childInfo: {
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF9800',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  childName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  childLevel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  chevron: {
    marginLeft: 'auto',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
  },
  emptyStateSubText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  pinContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 10,
    paddingBottom: 20,
    backgroundColor: '#EEF6FF',
  },
  selectedChildInfo: {
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 10,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    padding: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarLarge: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FF9800',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  avatarTextLarge: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  selectedChildName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  pinInstructions: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  pinPadContainer: {
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 15,
    paddingTop: 10,
    paddingBottom: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  pinDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  pinDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#2196F3',
    marginHorizontal: 10,
  },
  pinDotFilled: {
    backgroundColor: '#2196F3',
  },
  numberPad: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingBottom: 10,
  },
  numberRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 5,
  },
  numberButton: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    borderRadius: 35,
    backgroundColor: 'white',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  emptyButton: {
    width: 70,
    height: 70,
    margin: 5,
  },
  deleteButton: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    borderRadius: 35,
    backgroundColor: 'white',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#E53935',
  },
  numberText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  cancelButton: {
    marginTop: 10,
    marginBottom: 10,
    alignSelf: 'center',
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  cancelButtonText: {
    color: '#FF5722',
    fontSize: 16,
    fontWeight: 'bold',
  },
  zeroButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  zeroText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  deleteIconContainer: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 