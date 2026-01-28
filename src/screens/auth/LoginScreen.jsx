import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar,
  TextInput,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Colors, Fonts, Screens } from '../../constants/Constants';

const { width } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />

      {/* Back Arrow */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Image
          source={require('../../assets/images/arrow-left.png')}
          style={styles.backIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* Header */}
      <Text style={styles.title}>Hello !</Text>
      <Text style={styles.subtitle}>Sign in to Continue</Text>

      {/* Name Input */}
      <Text style={styles.inputLabel}>Name</Text>
      <View style={styles.inputContainer}>
        <Image
          source={require('../../assets/images/user.png')}
          style={styles.inputIcon}
          resizeMode="contain"
        />
        <TextInput
          style={styles.input}
          placeholder="Rafni"
          placeholderTextColor={Colors.textLight}
          value={name}
          onChangeText={setName}
        />
      </View>

      {/* Password Input */}
      <Text style={styles.inputLabel}>Password</Text>
      <View style={styles.inputContainer}>
        <Image
          source={require('../../assets/images/password_icon.png')}
          style={styles.inputIcon}
          resizeMode="contain"
        />
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor={Colors.textLight}
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Image
            source={require('../../assets/images/eye_close.png')}
            style={styles.eyeIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      {/* Forgot Password */}
      <TouchableOpacity style={styles.forgotContainer}>
        <Text style={styles.forgotText}>Forgot Password ?</Text>
      </TouchableOpacity>

      {/* Sign In Button */}
      <TouchableOpacity
        style={styles.signInButton}
        activeOpacity={0.8}
        onPress={() => navigation.navigate(Screens.Onboarding1)}
      >
        <Text style={styles.signInButtonText}>Sign In</Text>
      </TouchableOpacity>

      {/* OR Divider */}
      <View style={styles.orContainer}>
        <View style={styles.orLine} />
        <Text style={styles.orText}>OR</Text>
        <View style={styles.orLine} />
      </View>

      {/* Google Button */}
      <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
        <Image
          source={require('../../assets/images/google.png')}
          style={styles.socialIcon}
          resizeMode="contain"
        />
        <Text style={styles.socialButtonText}>Sign in with Google</Text>
      </TouchableOpacity>

      {/* Apple Button */}
      <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
        <Image
          source={require('../../assets/images/apple.png')}
          style={styles.socialIcon}
          resizeMode="contain"
        />
        <Text style={styles.socialButtonText}>Sign in with Apple</Text>
      </TouchableOpacity>

      {/* Sign Up Link */}
      <View style={styles.signUpContainer}>
        <Text style={styles.signUpText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate(Screens.Register)}>
          <Text style={styles.signUpLink}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 24,
  },
  backButton: {
    marginTop: 50,
    marginBottom: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  title: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 30,
    color: Colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: Fonts.kantumruyRegular,
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 30,
  },
  inputLabel: {
    fontFamily: Fonts.kantumruyRegular,
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    marginBottom: 20,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 50,
  },
  inputIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontFamily: Fonts.kantumruyRegular,
    fontSize: 16,
    color: Colors.textGray,
    padding: 0,
  },
  eyeIcon: {
    width: 22,
    height: 22,
    tintColor: Colors.textLight,
  },
  forgotContainer: {
    alignSelf: 'flex-end',
    marginBottom: 25,
  },
  forgotText: {
    fontFamily: Fonts.kantumruyRegular,
    fontSize: 12,
    color: Colors.primary,
  },
  signInButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 25,
  },
  signInButtonText: {
    fontFamily: Fonts.poppinsBold,
    fontSize: 20,
    color: Colors.white,
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.primary,
  },
  orText: {
    fontFamily: Fonts.kantumruyRegular,
    fontSize: 14,
    color: Colors.textLight,
    marginHorizontal: 15,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
    paddingVertical: 14,
    marginBottom: 15,
    backgroundColor: Colors.background,
  },
  socialIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  socialButtonText: {
    fontFamily: Fonts.kantumruyMedium,
    fontSize: 14,
    color: Colors.textGray,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signUpText: {
    fontFamily: Fonts.kantumruyRegular,
    fontSize: 14,
    color: Colors.textLight,
  },
  signUpLink: {
    fontFamily: Fonts.kantumruyRegular,
    fontSize: 14,
    color: Colors.primary,
  },
});

export default LoginScreen;
