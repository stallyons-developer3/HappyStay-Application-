import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Colors, Fonts, Screens } from '../../constants/Constants';
import Button from '../../components/common/Button';
import {
  loginUser,
  googleLogin,
  clearError,
} from '../../store/slices/authSlice';
import { configureGoogleSignIn } from '../../services/googleAuthService';

const { width } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const { isLoading, isGoogleLoading, error, isAuthenticated, user } =
    useSelector(state => state.auth);

  useEffect(() => {
    configureGoogleSignIn();
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert('Login Failed', error, [
        { text: 'OK', onPress: () => dispatch(clearError()) },
      ]);
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.is_profile_complete) {
        navigation.replace(Screens.MainApp);
      } else {
        navigation.replace(Screens.Onboarding1);
      }
    }
  }, [isAuthenticated, user, navigation]);

  const handleLogin = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }
    dispatch(loginUser({ email: email.trim(), password }));
  };

  const handleGoogleLogin = () => {
    dispatch(googleLogin());
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
        <Text style={styles.subtitle}>Sign in to Continue</Text>

        <Text style={styles.inputLabel}>Email</Text>
        <View style={styles.inputContainer}>
          <Image
            source={require('../../assets/images/user.png')}
            style={styles.inputIcon}
            resizeMode="contain"
          />
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor={Colors.textLight}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading && !isGoogleLoading}
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
            editable={!isLoading && !isGoogleLoading}
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

        <TouchableOpacity
          style={styles.forgotContainer}
          onPress={() => navigation.navigate(Screens.ForgotPassword)}
        >
          <Text style={styles.forgotText}>Forgot Password ?</Text>
        </TouchableOpacity>

        <Button
          title={isLoading ? 'Signing In...' : 'Sign In'}
          onPress={handleLogin}
          size="full"
          style={{ marginBottom: 25, opacity: isLoading ? 0.7 : 1 }}
          disabled={isLoading || isGoogleLoading}
        />

        {isLoading && (
          <ActivityIndicator
            size="small"
            color={Colors.primary}
            style={{ marginBottom: 15 }}
          />
        )}

        <View style={styles.orContainer}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.orLine} />
        </View>

        <TouchableOpacity
          style={[styles.socialButton, isGoogleLoading && { opacity: 0.7 }]}
          activeOpacity={0.8}
          onPress={handleGoogleLogin}
          disabled={isLoading || isGoogleLoading}
        >
          {isGoogleLoading ? (
            <>
              <ActivityIndicator
                size="small"
                color={Colors.primary}
                style={{ marginRight: 12 }}
              />
              <Text style={styles.socialButtonText}>Signing in...</Text>
            </>
          ) : (
            <>
              <Image
                source={require('../../assets/images/google.png')}
                style={styles.socialIcon}
                resizeMode="contain"
              />
              <Text style={styles.socialButtonText}>Sign in with Google</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
          <Image
            source={require('../../assets/images/apple.png')}
            style={styles.socialIcon}
            resizeMode="contain"
          />
          <Text style={styles.socialButtonText}>Sign in with Apple</Text>
        </TouchableOpacity>

        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>Don't have an account? </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate(Screens.Register)}
          >
            <Text style={styles.signUpLink}>Sign up</Text>
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
    paddingHorizontal: 24,
    paddingBottom: 40,
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
    marginBottom: 30,
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
    marginBottom: 15,
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
  forgotContainer: {
    alignSelf: 'flex-end',
    marginBottom: 25,
  },
  forgotText: {
    fontFamily: Fonts.poppinsRegular,
    fontSize: 12,
    color: Colors.primary,
    textTransform: 'lowercase',
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
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signUpText: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 14,
    color: Colors.textLight,
  },
  signUpLink: {
    fontFamily: Fonts.poppinsRegular,
    fontSize: 14,
    color: Colors.primary,
    textTransform: 'lowercase',
  },
});

export default LoginScreen;
