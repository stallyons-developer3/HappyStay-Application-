import React from 'react';
import {
  View,
  Text,
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
      <StatusBar
        translucent
        backgroundColor={Colors.transparent}
        barStyle="light-content"
      />

      {/* Background Image */}
      <View style={styles.imageContainer}>
        <Image
          source={require('../assets/images/welcome-bg.png')}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
      </View>

      {/* Bottom White Section */}
      <View style={styles.bottomContainer}>
        <Text style={styles.title}>Welcome</Text>

        <Text style={styles.description}>
          Find your dream vacation with My Holiday.{'\n'}
          Travel the world easily safely and quickly{'\n'}
          without fear of rising ticket prices.
        </Text>

        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={() => navigation.navigate(Screens.Login)}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  imageContainer: {
    flex: 1,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    borderBottomRightRadius: 50,
    borderBottomLeftRadius: 50,
  },
  bottomContainer: {
    backgroundColor: Colors.white,
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 34,
    color: Colors.primary,
    marginBottom: 16,
  },
  description: {
    fontFamily: Fonts.kantumruyRegular,
    fontSize: 14,
    color: Colors.textGray,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  button: {
    backgroundColor: Colors.primary,
    width: '100%',
    paddingVertical: 10,
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: Fonts.poppinsBold,
    color: Colors.white,
    fontSize: 20,
  },
});

export default WelcomeScreen;
