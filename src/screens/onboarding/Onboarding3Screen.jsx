import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StatusBar,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import ImagePicker from 'react-native-image-crop-picker';
import { Colors, Fonts } from '../../constants/Constants';
import Button from '../../components/common/Button';
import api from '../../api/axiosInstance';
import { PROFILE } from '../../api/endpoints';
import { resetOnboarding } from '../../store/slices/onboardingSlice';
import { useToast } from '../../context/ToastContext';

const Onboarding3Screen = ({ navigation }) => {
  const { showToast } = useToast();
  const dispatch = useDispatch();
  const onboardingData = useSelector(state => state.onboarding);
  const [profileImage, setProfileImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = () => {
    ImagePicker.openPicker({
      width: 800,
      height: 800,
      cropping: true,
      cropperCircleOverlay: true,
      compressImageQuality: 0.8,
    })
      .then(image => {
        setProfileImage(image);
      })
      .catch(err => {
        if (err.code !== 'E_PICKER_CANCELLED') {
          showToast('error', 'Failed to pick image');
        }
      });
  };

  const handleContinue = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();

      formData.append('first_name', onboardingData.first_name);
      formData.append('last_name', onboardingData.last_name);
      formData.append('username', onboardingData.username);
      formData.append('gender', onboardingData.gender);
      formData.append('nationality', onboardingData.nationality);
      formData.append('age', onboardingData.age);

      onboardingData.trip_interests.forEach(item => {
        formData.append('trip_interests[]', item);
      });

      if (profileImage) {
        const filename = profileImage.path.split('/').pop();
        formData.append('profile_picture', {
          uri: profileImage.path,
          type: profileImage.mime || 'image/jpeg',
          name: filename || 'profile.jpg',
        });
      }

      const response = await api.post(PROFILE.SETUP_PROFILE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Navigate to Onboarding4 — do NOT dispatch setUser here
      // because LoginScreen may still be in the navigation stack
      // and its auth watcher would redirect to MainApp
      navigation.replace('Onboarding4');
      dispatch(resetOnboarding());
    } catch (error) {
      const errors = error.response?.data?.errors;
      const message = errors
        ? errors.join('\n')
        : error.response?.data?.message ||
          'Profile setup failed. Please try again.';
      showToast('error', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Image
          source={require('../../assets/images/arrow-left.png')}
          style={styles.backIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <Text style={styles.title}>Profile Picture</Text>
      <Text style={styles.tagline}>
        Let's put a face to your name!{'\n'}
        Upload a photo so others can recognize you.
      </Text>

      <View style={styles.profileContainer}>
        <View style={styles.profileRing}>
          <View style={styles.profileImageWrapper}>
            <Image
              source={
                profileImage
                  ? { uri: profileImage.path }
                  : require('../../assets/images/profile.png')
              }
              style={styles.profileImage}
              resizeMode="cover"
            />
          </View>
        </View>
        <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
          <Image
            source={require('../../assets/images/camera.png')}
            style={styles.cameraIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        {isLoading && (
          <ActivityIndicator
            size="large"
            color={Colors.primary}
            style={{ marginBottom: 20 }}
          />
        )}
        <Button
          title={isLoading ? 'Setting up...' : 'Continue'}
          onPress={handleContinue}
          size="full"
          style={{ opacity: isLoading ? 0.7 : 1 }}
          disabled={isLoading}
        />
      </View>
    </View>
  );
};

const SAFE_TOP =
  Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 5 : 5;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 24,
    paddingTop: SAFE_TOP,
  },
  backButton: {
    marginBottom: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  title: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 20,
    color: Colors.textBlack,
    textAlign: 'center',
    marginBottom: 12,
  },
  tagline: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 14,
    color: Colors.textGray,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  profileContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  profileRing: {
    width: 180,
    height: 180,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageWrapper: {
    width: 165,
    height: 165,
    borderRadius: 82.5,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: '22%',
    width: 50,
    height: 50,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    width: 36,
    height: 36,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 40,
  },
});

export default Onboarding3Screen;
