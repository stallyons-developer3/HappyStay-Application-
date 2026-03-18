import React from 'react';
import {
  View,
  Text,
  ImageBackground,
  Image,
  StyleSheet,
  StatusBar,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Colors, Fonts, Screens } from '../constants/Constants';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <StatusBar translucent={false} backgroundColor={Colors.primary} barStyle="light-content" />
      <ImageBackground
        source={require('../assets/images/welcome_bg.jpg')}
        style={styles.background}
        resizeMode="cover"
      >

        {/* Content */}
        <View style={styles.content}>
          {/* Top section: tagline + logo */}
          <View style={styles.topSection}>
            <Text style={styles.tagline}>discover more, stay connected with</Text>
            <Image
              source={require('../assets/images/appystay_logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Bottom section: buttons */}
          <View style={styles.bottomSection}>
            {/* Create Account button */}
            <TouchableOpacity
              style={styles.createButton}
              activeOpacity={0.8}
              onPress={() => navigation.navigate(Screens.Register)}
            >
              <Text style={styles.createButtonText}>create your account</Text>
            </TouchableOpacity>

            {/* Already have an account? login */}
            <View style={styles.loginRow}>
              <Text style={styles.loginLabel}>already have an account? </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation.navigate(Screens.Login)}
              >
                <Text style={styles.loginLink}>login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: height * 0.12,
    paddingBottom: height * 0.08,
    paddingHorizontal: 30,
  },
  topSection: {
    alignItems: 'center',
  },
  tagline: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  logo: {
    width: width,
    height: width * 0.45,
  },
  bottomSection: {
    alignItems: 'center',
  },
  createButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    marginBottom: 14,
  },
  createButtonText: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 16,
    color: Colors.white,
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginLabel: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 14,
    color: '#FFFFFF',
  },
  loginLink: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 14,
    color: Colors.primary,
  },
});

export default WelcomeScreen;
