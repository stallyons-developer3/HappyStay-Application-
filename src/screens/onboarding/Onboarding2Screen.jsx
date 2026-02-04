import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Fonts, Screens } from '../../constants/Constants';
import Button from '../../components/common/Button';

const Onboarding2Screen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.title}>Profile Picture</Text>

      {/* Tagline */}
      <Text style={styles.tagline}>
        Let's put a face to your name!{'\n'}
        Upload a photo so others can recognize you.
      </Text>

      {/* Profile Container */}
      <View style={styles.profileContainer}>
        <View style={styles.profileRing}>
          <View style={styles.profileImageWrapper}>
            <Image
              source={require('../../assets/images/profile.png')}
              style={styles.profileImage}
              resizeMode="cover"
            />
          </View>
        </View>
        <TouchableOpacity style={styles.cameraButton}>
          <Image
            source={require('../../assets/images/camera.png')}
            style={styles.cameraIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      {/* Bottom Button */}
      <View style={styles.buttonContainer}>
        <Button
          title="Continue"
          onPress={() => navigation.navigate(Screens.Onboarding4)}
          size="full"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 24,
    paddingTop: 60,
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
  continueButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  continueButtonText: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 20,
    color: Colors.white,
  },
});

export default Onboarding2Screen;
