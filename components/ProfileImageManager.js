import React, { useState } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Svg, Path } from 'react-native-svg';
import { uploadToCloudinary } from '../services/cloudinary';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const ProfileImageManager = ({ 
  userId, 
  imageUrl, 
  size = 80, 
  onImageChange,
  name = '',
  editable = true,
  showName = false,
  nameStyle = {}
}) => {
  const [loading, setLoading] = useState(false);
  
  // Get initials from name
  const getInitials = () => {
    if (!name) return 'U';
    
    const names = name.split(' ');
    const firstInitial = names[0].charAt(0).toUpperCase();
    const lastInitial = names.length > 1 ? names[names.length - 1].charAt(0).toUpperCase() : '';
    
    return lastInitial ? `${firstInitial}${lastInitial}` : firstInitial;
  };

  // Pick image from device
  const pickImage = async () => {
    if (!editable) return;
    
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'You need to grant permission to access your photos');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });
      
      if (!result.canceled && result.assets && result.assets[0].uri) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  // Upload image to Cloudinary
  const uploadImage = async (uri) => {
    if (!userId) {
      Alert.alert('Error', 'User ID is required to upload profile image');
      return;
    }
    
    setLoading(true);
    
    try {
      // Upload to Cloudinary
      const result = await uploadToCloudinary(uri);
      
      if (result.success) {
        // Update user document with Cloudinary image URL
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          profileImage: result.url,
          cloudinaryPublicId: result.publicId
        });
        
        // Notify parent component
        if (onImageChange) {
          onImageChange(result.url);
        }
        
        Alert.alert('Success', 'Profile picture updated successfully');
      } else {
        throw new Error('Failed to upload image to Cloudinary');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Custom edit icon
  const EditIcon = () => (
    <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <Path 
        d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" 
        stroke="white" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <Path 
        d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" 
        stroke="white" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </Svg>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[
          styles.imageContainer, 
          { 
            width: size, 
            height: size, 
            borderRadius: size / 2 
          }
        ]} 
        onPress={pickImage}
        disabled={loading || !editable}
      >
        {loading ? (
          <View style={[styles.placeholder, { backgroundColor: '#3498db' }]}>
            <ActivityIndicator color="white" />
          </View>
        ) : imageUrl ? (
          <Image 
            source={{ uri: imageUrl }} 
            style={[styles.image, { borderRadius: size / 2 }]} 
          />
        ) : (
          <View style={[styles.placeholder, { backgroundColor: '#4CAF50' }]}>
            <Text style={[styles.placeholderText, { fontSize: size * 0.4 }]}>
              {getInitials()}
            </Text>
          </View>
        )}
        
        {editable && !loading && (
          <View style={styles.editButtonContainer}>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={pickImage}
            >
              <EditIcon />
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
      
      {showName && name && (
        <Text style={[styles.name, nameStyle]}>
          {name}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  imageContainer: {
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: 'white',
    fontWeight: 'bold',
  },
  editButtonContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  editButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  name: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileImageManager; 