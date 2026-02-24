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
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useIsFocused } from '@react-navigation/native';
import { Colors, Fonts, Screens } from '../../constants/Constants';
import Button from '../../components/common/Button';
import {
  registerUser,
  googleLogin,
  clearError,
} from '../../store/slices/authSlice';
import { configureGoogleSignIn } from '../../services/googleAuthService';
import { useToast } from '../../context/ToastContext';

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { isLoading, isGoogleLoading, error, isAuthenticated, user } =
    useSelector(state => state.auth);
  const isFocused = useIsFocused();

  useEffect(() => {
    configureGoogleSignIn();
  }, []);

  useEffect(() => {
    if (error) {
      const fieldErrs = error.fieldErrors;
      if (
        fieldErrs &&
        typeof fieldErrs === 'object' &&
        !Array.isArray(fieldErrs)
      ) {
        const mapped = {};
        Object.keys(fieldErrs).forEach(key => {
          const fieldKey = key === 'name' ? 'username' : key;
          mapped[fieldKey] = Array.isArray(fieldErrs[key])
            ? fieldErrs[key][0]
            : fieldErrs[key];
        });
        setFieldErrors(mapped);
      } else {
        const msg =
          error.message ||
          (Array.isArray(fieldErrs) ? fieldErrs[0] : String(error));
        showToast('error', msg, 'Registration Failed');
      }
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (isAuthenticated && user && isFocused) {
      if (user.is_profile_complete) {
        navigation.replace(Screens.MainApp);
      } else {
        navigation.replace(Screens.Onboarding1, { username: username.trim() });
      }
    }
  }, [isAuthenticated, user, navigation, isFocused]);

  const handleRegister = () => {
    const errors = {};
    if (!username.trim()) errors.username = 'Please enter a username';
    else if (username.trim().length < 3)
      errors.username = 'Username must be at least 3 characters';
    else if (/\s/.test(username.trim()))
      errors.username = 'Username cannot contain spaces';
    if (!email.trim()) errors.email = 'Please enter your email';
    if (!password) errors.password = 'Please enter a password';
    else if (password.length < 8)
      errors.password = 'Password must be at least 8 characters';
    if (password !== confirmPassword)
      errors.confirmPassword = 'Passwords do not match';
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    dispatch(
      registerUser({
        name: username.trim(),
        email: email.trim(),
        password,
        password_confirmation: confirmPassword,
      }),
    );
  };

  const handleGoogleSignUp = () => {
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
        <Text style={styles.subtitle}>Sign up to Continue</Text>

        <Text style={styles.inputLabel}>Username</Text>
        <View
          style={[
            styles.inputContainer,
            fieldErrors.username && styles.inputError,
          ]}
        >
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
            onChangeText={text => {
              setUsername(text.replace(/\s/g, ''));
              setFieldErrors(p => ({ ...p, username: '' }));
            }}
            autoCapitalize="none"
            editable={!isLoading && !isGoogleLoading}
          />
        </View>
        {fieldErrors.username ? (
          <Text style={styles.fieldError}>{fieldErrors.username}</Text>
        ) : null}

        <Text style={styles.inputLabel}>Email</Text>
        <View
          style={[
            styles.inputContainer,
            fieldErrors.email && styles.inputError,
          ]}
        >
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
            onChangeText={t => {
              setEmail(t);
              setFieldErrors(p => ({ ...p, email: '' }));
            }}
            editable={!isLoading && !isGoogleLoading}
          />
        </View>
        {fieldErrors.email ? (
          <Text style={styles.fieldError}>{fieldErrors.email}</Text>
        ) : null}

        <Text style={styles.inputLabel}>Password</Text>
        <View
          style={[
            styles.inputContainer,
            fieldErrors.password && styles.inputError,
          ]}
        >
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
            onChangeText={t => {
              setPassword(t);
              setFieldErrors(p => ({ ...p, password: '' }));
            }}
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
        {fieldErrors.password ? (
          <Text style={styles.fieldError}>{fieldErrors.password}</Text>
        ) : null}

        <Text style={styles.inputLabel}>Confirm Password</Text>
        <View
          style={[
            styles.inputContainer,
            fieldErrors.confirmPassword && styles.inputError,
          ]}
        >
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
            onChangeText={t => {
              setConfirmPassword(t);
              setFieldErrors(p => ({ ...p, confirmPassword: '' }));
            }}
            editable={!isLoading && !isGoogleLoading}
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
        {fieldErrors.confirmPassword ? (
          <Text style={styles.fieldError}>{fieldErrors.confirmPassword}</Text>
        ) : null}

        <Button
          title={isLoading ? 'Signing Up...' : 'Sign up'}
          onPress={handleRegister}
          size="full"
          style={{ marginTop: 20, opacity: isLoading ? 0.7 : 1 }}
          disabled={isLoading || isGoogleLoading}
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

        <TouchableOpacity
          style={[styles.socialButton, isGoogleLoading && { opacity: 0.7 }]}
          activeOpacity={0.8}
          onPress={handleGoogleSignUp}
          disabled={isLoading || isGoogleLoading}
        >
          {isGoogleLoading ? (
            <>
              <ActivityIndicator
                size="small"
                color={Colors.primary}
                style={{ marginRight: 12 }}
              />
              <Text style={styles.socialButtonText}>Continuing...</Text>
            </>
          ) : (
            <>
              <Image
                source={require('../../assets/images/google.png')}
                style={styles.socialIcon}
                resizeMode="contain"
              />
              <Text style={styles.socialButtonText}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>

        {Platform.OS === 'ios' && (
          <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
            <Image
              source={require('../../assets/images/apple.png')}
              style={styles.socialIcon}
              resizeMode="contain"
            />
            <Text style={styles.socialButtonText}>Sign up with Apple</Text>
          </TouchableOpacity>
        )}

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
    marginBottom: 16,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  fieldError: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 12,
    color: '#EF4444',
    marginBottom: 4,
    marginLeft: 20,
    marginTop: -12,
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
    marginTop: 20,
    marginBottom: 20,
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
    marginBottom: 12,
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
    marginTop: 20,
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
