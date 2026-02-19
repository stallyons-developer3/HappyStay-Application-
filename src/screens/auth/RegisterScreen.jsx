import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Colors, Fonts, Screens } from '../../constants/Constants';
import Button from '../../components/common/Button';
import { registerUser, clearError } from '../../store/slices/authSlice';

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const dispatch = useDispatch();
  const { isLoading, error, isAuthenticated, user } = useSelector(
    state => state.auth,
  );

  useEffect(() => {
    if (error) {
      Alert.alert('Registration Failed', error, [
        { text: 'OK', onPress: () => dispatch(clearError()) },
      ]);
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (isAuthenticated && user) {
      navigation.replace(Screens.Onboarding1, { username: username.trim() });
    }
  }, [isAuthenticated, user, navigation]);

  const handleRegister = () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Please enter a username');
      return;
    }
    if (username.trim().length < 3) {
      Alert.alert('Error', 'Username must be at least 3 characters');
      return;
    }
    if (/\s/.test(username.trim())) {
      Alert.alert('Error', 'Username cannot contain spaces');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    if (!password) {
      Alert.alert('Error', 'Please enter a password');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    dispatch(
      registerUser({
        name: username.trim(),
        email: email.trim(),
        password,
        password_confirmation: confirmPassword,
      }),
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
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

        <Text style={styles.title}>Hello !</Text>
        <Text style={styles.subtitle}>Sign up to Continue</Text>

        <Text style={styles.inputLabel}>Username</Text>
        <View style={styles.inputContainer}>
          <Image
            source={require('../../assets/images/user.png')}
            style={styles.inputIcon}
            resizeMode="contain"
          />
          <TextInput
            style={styles.input}
            placeholder="Enter username"
            placeholderTextColor={Colors.textLight}
            value={username}
            onChangeText={text => setUsername(text.replace(/\s/g, ''))}
            autoCapitalize="none"
            editable={!isLoading}
          />
        </View>

        <Text style={styles.inputLabel}>Email</Text>
        <View style={styles.inputContainer}>
          <Image
            source={require('../../assets/images/email.png')}
            style={styles.inputIcon}
            resizeMode="contain"
          />
          <TextInput
            style={styles.input}
            placeholder="Enter"
            placeholderTextColor={Colors.textLight}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            editable={!isLoading}
          />
        </View>

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
            editable={!isLoading}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Image
              source={
                showPassword
                  ? require('../../assets/images/eye_open.png')
                  : require('../../assets/images/eye_close.png')
              }
              style={styles.eyeIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.inputLabel}>Confirm Password</Text>
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
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            editable={!isLoading}
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Image
              source={
                showConfirmPassword
                  ? require('../../assets/images/eye_open.png')
                  : require('../../assets/images/eye_close.png')
              }
              style={styles.eyeIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        <Button
          title={isLoading ? 'Signing Up...' : 'Sign up'}
          onPress={handleRegister}
          size="full"
          style={{ opacity: isLoading ? 0.7 : 1 }}
          disabled={isLoading}
        />

        {isLoading && (
          <ActivityIndicator
            size="small"
            color={Colors.primary}
            style={{ marginTop: 10 }}
          />
        )}

        <View style={styles.orContainer}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.orLine} />
        </View>

        <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
          <Image
            source={require('../../assets/images/google.png')}
            style={styles.socialIcon}
            resizeMode="contain"
          />
          <Text style={styles.socialButtonText}>Sign up with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
          <Image
            source={require('../../assets/images/apple.png')}
            style={styles.socialIcon}
            resizeMode="contain"
          />
          <Text style={styles.socialButtonText}>Sign up with Apple</Text>
        </TouchableOpacity>

        <View style={styles.signInContainer}>
          <Text style={styles.signInText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate(Screens.Login)}>
            <Text style={styles.signInLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 30,
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
    fontFamily: Fonts.RobotoBold,
    fontSize: 30,
    color: Colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 25,
  },
  inputLabel: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    marginBottom: 16,
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
    fontFamily: Fonts.RobotoRegular,
    fontSize: 14,
    color: Colors.textGray,
    padding: 0,
  },
  eyeIcon: {
    width: 22,
    height: 22,
    tintColor: Colors.textLight,
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 25,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.primary,
  },
  orText: {
    fontFamily: Fonts.RobotoRegular,
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
    fontFamily: Fonts.poppinsRegular,
    fontSize: 14,
    color: Colors.textGray,
    textTransform: 'lowercase',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  signInText: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 14,
    color: Colors.textLight,
  },
  signInLink: {
    fontFamily: Fonts.poppinsRegular,
    fontSize: 14,
    color: Colors.primary,
    textTransform: 'lowercase',
  },
});

export default RegisterScreen;
