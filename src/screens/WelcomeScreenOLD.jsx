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
import Button from '../components/common/Button';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
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

        <Button
          title="Get Started"
          onPress={() => navigation.navigate(Screens.Login)}
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
  },
  imageContainer: {
    height: height * 0.65,
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
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 34,
    color: Colors.primary,
    marginBottom: 10,
  },
  description: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 14,
    color: Colors.textGray,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  button: {
    backgroundColor: Colors.primary,
    width: '100%',
    paddingVertical: 15,
    borderRadius: 50,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: Fonts.poppinsBold,
    color: Colors.white,
    fontSize: 20,
  },
});

export default WelcomeScreen;
