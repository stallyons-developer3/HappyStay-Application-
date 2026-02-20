import React, { useState } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { Colors, Fonts, Screens } from '../../constants/Constants';
import Button from '../../components/common/Button';
import api from '../../api/axiosInstance';
import { AUTH } from '../../api/endpoints';
import { useToast } from '../../context/ToastContext';

const { width } = Dimensions.get('window');

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const { showToast } = useToast();

  const handleSendOTP = async () => {
    const errors = {};
    if (!email.trim()) errors.email = 'Please enter your email';
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsLoading(true);
    try {
      const response = await api.post(AUTH.FORGOT_PASSWORD, {
        email: email.trim(),
      });
      showToast('success', response.data?.message || 'Check your email for OTP', 'OTP Sent');
      setTimeout(() => {
        navigation.navigate(Screens.ResetPassword, { email: email.trim() });
      }, 1000);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send OTP. Please try again.';
      showToast('error', message);
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

        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>
          Enter your email address and we'll send{'\n'}you an OTP to reset your
          password
        </Text>

        <Text style={styles.inputLabel}>Email</Text>
        <View style={[styles.inputContainer, fieldErrors.email && styles.inputError]}>
          <Image
            source={require('../../assets/images/email.png')}
            style={styles.inputIcon}
            resizeMode="contain"
          />
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor={Colors.textLight}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={t => { setEmail(t); setFieldErrors({}); }}
            editable={!isLoading}
          />
        </View>
        {fieldErrors.email ? <Text style={styles.fieldError}>{fieldErrors.email}</Text> : null}

        <Button
          title={isLoading ? 'Sending...' : 'Send OTP'}
          onPress={handleSendOTP}
          size="full"
          style={{ opacity: isLoading ? 0.7 : 1, marginTop: 16 }}
          disabled={isLoading}
        />

        {isLoading && (
          <ActivityIndicator
            size="small"
            color={Colors.primary}
            style={{ marginTop: 15 }}
          />
        )}

        <View style={styles.backToLoginContainer}>
          <Text style={styles.backToLoginText}>Remember your password? </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backToLoginLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
  backButton: { marginTop: 50, marginBottom: 20, width: 40, height: 40, justifyContent: 'center' },
  backIcon: { width: 24, height: 24 },
  title: { fontFamily: Fonts.RobotoBold, fontSize: 30, color: Colors.primary, marginBottom: 8 },
  subtitle: { fontFamily: Fonts.RobotoRegular, fontSize: 14, color: Colors.textLight, lineHeight: 22, marginBottom: 40 },
  inputLabel: { fontFamily: Fonts.RobotoRegular, fontSize: 12, color: Colors.textLight, marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, marginBottom: 4, paddingVertical: 15, paddingHorizontal: 20, borderRadius: 50, borderWidth: 1, borderColor: 'transparent' },
  inputError: { borderColor: '#EF4444', backgroundColor: '#FEF2F2' },
  fieldError: { fontFamily: Fonts.RobotoRegular, fontSize: 12, color: '#EF4444', marginBottom: 8, marginLeft: 20, marginTop: 2 },
  inputIcon: { width: 24, height: 24, marginRight: 12 },
  input: { flex: 1, fontFamily: Fonts.RobotoRegular, fontSize: 14, color: Colors.textGray, padding: 0 },
  backToLoginContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  backToLoginText: { fontFamily: Fonts.RobotoRegular, fontSize: 14, color: Colors.textLight },
  backToLoginLink: { fontFamily: Fonts.poppinsRegular, fontSize: 14, color: Colors.primary, textTransform: 'lowercase' },
});

export default ForgotPasswordScreen;
