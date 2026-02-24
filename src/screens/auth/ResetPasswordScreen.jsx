import React, { useState, useEffect, useCallback } from 'react';
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
import { Colors, Fonts, Screens } from '../../constants/Constants';
import Button from '../../components/common/Button';
import api from '../../api/axiosInstance';
import { AUTH } from '../../api/endpoints';
import { useToast } from '../../context/ToastContext';

const RESEND_COOLDOWN = 60;

const ResetPasswordScreen = ({ navigation, route }) => {
  const { email } = route.params;
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [fieldErrors, setFieldErrors] = useState({});
  const { showToast } = useToast();

  // Resend cooldown timer
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleResendOTP = useCallback(async () => {
    if (resendTimer > 0 || isResending) return;
    setIsResending(true);
    try {
      const response = await api.post(AUTH.FORGOT_PASSWORD, { email });
      showToast('success', response.data?.message || 'OTP resent successfully');
      setResendTimer(RESEND_COOLDOWN);
      setOtp('');
      setFieldErrors(prev => ({ ...prev, otp: '' }));
    } catch (error) {
      const message =
        error.response?.data?.message ||
        'Failed to resend OTP. Please try again.';
      showToast('error', message);
    } finally {
      setIsResending(false);
    }
  }, [email, resendTimer, isResending, showToast]);

  const handleResetPassword = async () => {
    const errors = {};

    // OTP validations
    if (!otp.trim()) {
      errors.otp = 'OTP is required';
    } else if (otp.trim().length < 6) {
      errors.otp = 'Invalid OTP';
    }

    // Password validations
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }

    // Confirm password validations
    if (!confirmPassword) {
      errors.confirmPassword = 'Confirm password is required';
    } else if (password && confirmPassword && password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsLoading(true);
    try {
      const response = await api.post(AUTH.RESET_PASSWORD, {
        email,
        otp: otp.trim(),
        password,
        password_confirmation: confirmPassword,
      });
      showToast(
        'success',
        response.data?.message || 'Password reset successfully',
      );
      setTimeout(() => navigation.navigate(Screens.Login), 1000);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        'Failed to reset password. Please try again.';
      // Backend returns error for expired/wrong OTP — show inline
      if (message.toLowerCase().includes('otp')) {
        setFieldErrors(prev => ({ ...prev, otp: 'Invalid OTP' }));
      } else {
        showToast('error', message);
      }
    } finally {
      setIsLoading(false);
    }
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

        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Enter the OTP sent to {email} and set your new password
        </Text>

        {/* OTP Field with Resend */}
        <View style={styles.otpLabelRow}>
          <Text style={styles.otpLabel}>OTP Code</Text>
          <TouchableOpacity
            onPress={handleResendOTP}
            disabled={resendTimer > 0 || isResending}
            activeOpacity={0.6}
          >
            {isResending ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Text
                style={[
                  styles.resendText,
                  resendTimer > 0 && styles.resendTextDisabled,
                ]}
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
        <View
          style={[styles.inputContainer, fieldErrors.otp && styles.inputError]}
        >
          <Image
            source={require('../../assets/images/password_icon.png')}
            style={styles.inputIcon}
            resizeMode="contain"
          />
          <TextInput
            style={styles.input}
            placeholder="Enter 6-digit OTP"
            placeholderTextColor={Colors.textLight}
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={t => {
              setOtp(t);
              setFieldErrors(p => ({ ...p, otp: '' }));
            }}
            editable={!isLoading}
          />
        </View>
        {fieldErrors.otp ? (
          <Text style={styles.fieldError}>{fieldErrors.otp}</Text>
        ) : null}

        {/* New Password */}
        <Text style={styles.inputLabel}>New Password</Text>
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
        {fieldErrors.password ? (
          <Text style={styles.fieldError}>{fieldErrors.password}</Text>
        ) : null}

        {/* Confirm Password */}
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
        {fieldErrors.confirmPassword ? (
          <Text style={styles.fieldError}>{fieldErrors.confirmPassword}</Text>
        ) : null}

        <Button
          title={isLoading ? 'Resetting...' : 'Reset Password'}
          onPress={handleResetPassword}
          size="full"
          style={{ marginTop: 20, opacity: isLoading ? 0.7 : 1 }}
          disabled={isLoading}
        />

        {isLoading && (
          <ActivityIndicator
            size="small"
            color={Colors.primary}
            style={{ marginTop: 15 }}
          />
        )}
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
    lineHeight: 22,
    marginBottom: 30,
  },
  otpLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  otpLabel: {
    fontFamily: Fonts.RobotoRegular,
    fontSize: 12,
    color: Colors.textLight,
  },
  resendText: {
    fontFamily: Fonts.RobotoBold,
    fontSize: 12,
    color: Colors.primary,
  },
  resendTextDisabled: {
    color: Colors.textLight,
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
});

export default ResetPasswordScreen;
