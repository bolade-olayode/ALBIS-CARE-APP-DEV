// src/screens/auth/LoginScreen.tsx

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  Animated,
  Modal,
  ScrollView,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { authApi } from '../../services/api/authApi';

interface LoginScreenProps {
  navigation?: any;
  onLogin?: (token: string, userData: any) => Promise<void>;
}

type ForgotPasswordStep = 'email' | 'otp' | 'newPassword' | 'success';

// Rate limiting constants
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 300; // 5 minutes in seconds
const ATTEMPT_RESET_TIME = 900; // 15 minutes in seconds

export default function LoginScreen({ navigation, onLogin }: LoginScreenProps) {
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Validation state
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  // Rate limiting state
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutEndTime, setLockoutEndTime] = useState<number | null>(null);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  // Biometric state
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('');
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState<ForgotPasswordStep>('email');
  const [resetEmail, setResetEmail] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // OTP input refs
  const otpInputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    initializeScreen();
    startEntryAnimation();
  }, []);

  // Lockout timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (lockoutEndTime) {
      interval = setInterval(() => {
        const remaining = Math.ceil((lockoutEndTime - Date.now()) / 1000);
        if (remaining <= 0) {
          setLockoutEndTime(null);
          setLockoutRemaining(0);
          setFailedAttempts(0);
        } else {
          setLockoutRemaining(remaining);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [lockoutEndTime]);

  const initializeScreen = async () => {
    // Check for remembered email
    const rememberedEmail = await authApi.getRememberedEmail();
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }

    // Check biometric availability
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();

    if (compatible && enrolled) {
      setBiometricAvailable(true);
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        setBiometricType('Face ID');
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        setBiometricType('Fingerprint');
      }

      // Check if biometric is enabled for this app
      const enabled = await authApi.isBiometricEnabled();
      setBiometricEnabled(enabled);
    }
  };

  const startEntryAnimation = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const triggerShakeAnimation = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(value)) {
      setEmailError('Please enter a valid email');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (value: string) => {
    if (!value) {
      setPasswordError('Password is required');
      return false;
    }
    if (value.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const isLocked = () => {
    return lockoutEndTime !== null && Date.now() < lockoutEndTime;
  };

  const formatLockoutTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBiometricLogin = async () => {
    if (!biometricEnabled) {
      Alert.alert(
        'Biometric Login',
        'Biometric login is not enabled. Please log in with your credentials first, then enable biometric login from settings.'
      );
      return;
    }

    const credentials = await authApi.getBiometricCredentials();
    if (!credentials) {
      Alert.alert('Error', 'No stored credentials found. Please log in with your email and password.');
      setBiometricEnabled(false);
      await authApi.setBiometricEnabled(false);
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: `Login with ${biometricType}`,
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });

    if (result.success) {
      setEmail(credentials.email);
      setPassword(credentials.password);
      // Perform login with stored credentials
      await performLogin(credentials.email, credentials.password, true);
    }
  };

  const performLogin = async (loginEmail: string, loginPassword: string, isBiometric: boolean = false) => {
    setLoading(true);
    Keyboard.dismiss();

    try {
      const response = await authApi.login(loginEmail, loginPassword);

      if (response.success && onLogin) {
        // Reset failed attempts on success
        setFailedAttempts(0);

        // Save email if remember me is checked
        if (rememberMe) {
          await authApi.setRememberedEmail(loginEmail);
        } else {
          await authApi.setRememberedEmail(null);
        }

        // Offer to enable biometric if not already enabled and device supports it
        if (!isBiometric && biometricAvailable && !biometricEnabled) {
          Alert.alert(
            `Enable ${biometricType}?`,
            `Would you like to use ${biometricType} for faster login next time?`,
            [
              { text: 'Not Now', style: 'cancel' },
              {
                text: 'Enable',
                onPress: async () => {
                  await authApi.storeCredentialsForBiometric(loginEmail, loginPassword);
                  await authApi.setBiometricEnabled(true);
                },
              },
            ]
          );
        }

        await onLogin(response.token, response.user);
      }
    } catch (error: any) {
      // Handle failed attempt
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      if (newAttempts >= MAX_ATTEMPTS) {
        const lockoutEnd = Date.now() + (LOCKOUT_DURATION * 1000);
        setLockoutEndTime(lockoutEnd);
        setLockoutRemaining(LOCKOUT_DURATION);
        triggerShakeAnimation();
        Alert.alert(
          'Account Temporarily Locked',
          `Too many failed attempts. Please try again in ${Math.ceil(LOCKOUT_DURATION / 60)} minutes.`
        );
      } else {
        triggerShakeAnimation();
        const remainingAttempts = MAX_ATTEMPTS - newAttempts;
        Alert.alert(
          'Login Failed',
          `${error.message || 'Invalid credentials'}. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setEmailTouched(true);
    setPasswordTouched(true);

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      triggerShakeAnimation();
      return;
    }

    if (isLocked()) {
      Alert.alert(
        'Account Locked',
        `Please wait ${formatLockoutTime(lockoutRemaining)} before trying again.`
      );
      return;
    }

    await performLogin(email, password);
  };

  // ============ FORGOT PASSWORD HANDLERS ============

  const handleForgotPasswordSubmitEmail = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!resetEmail || !emailRegex.test(resetEmail)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setForgotPasswordLoading(true);
    try {
      const response = await authApi.requestPasswordReset(resetEmail);
      if (response.success) {
        setForgotPasswordStep('otp');
        Alert.alert('Code Sent', 'Please check your email for the verification code.');
      } else {
        Alert.alert('Error', response.message || 'Failed to send reset code');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otp = otpCode.join('');
    if (otp.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit code');
      return;
    }

    setForgotPasswordLoading(true);
    try {
      const response = await authApi.verifyOTP(resetEmail, otp);
      if (response.success) {
        setResetToken(response.resetToken || '');
        setForgotPasswordStep('newPassword');
      } else {
        Alert.alert('Error', response.message || 'Invalid verification code');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Verification failed');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setForgotPasswordLoading(true);
    try {
      const response = await authApi.resetPassword(resetEmail, resetToken, newPassword);
      if (response.success) {
        setForgotPasswordStep('success');
      } else {
        Alert.alert('Error', response.message || 'Failed to reset password');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Password reset failed');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const closeForgotPassword = () => {
    setShowForgotPassword(false);
    setForgotPasswordStep('email');
    setResetEmail('');
    setOtpCode(['', '', '', '', '', '']);
    setNewPassword('');
    setConfirmPassword('');
    setResetToken('');
  };

  // ============ RENDER FUNCTIONS ============

  const renderForgotPasswordContent = () => {
    switch (forgotPasswordStep) {
      case 'email':
        return (
          <>
            <Text style={styles.modalTitle}>Forgot Password</Text>
            <Text style={styles.modalSubtitle}>
              Enter your email address and we'll send you a verification code.
            </Text>

            <View style={styles.modalInputContainer}>
              <Ionicons name="mail-outline" size={20} color="#64748b" style={styles.modalInputIcon} />
              <TextInput
                style={styles.modalInput}
                placeholder="Enter your email"
                value={resetEmail}
                onChangeText={setResetEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.modalButton, forgotPasswordLoading && styles.buttonDisabled]}
              onPress={handleForgotPasswordSubmitEmail}
              disabled={forgotPasswordLoading}
            >
              {forgotPasswordLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.modalButtonText}>Send Code</Text>
              )}
            </TouchableOpacity>
          </>
        );

      case 'otp':
        return (
          <>
            <Text style={styles.modalTitle}>Enter Verification Code</Text>
            <Text style={styles.modalSubtitle}>
              We've sent a 6-digit code to {resetEmail}
            </Text>

            <View style={styles.otpContainer}>
              {otpCode.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (otpInputRefs.current[index] = ref)}
                  style={styles.otpInput}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value.replace(/[^0-9]/g, ''), index)}
                  onKeyPress={({ nativeEvent }) => handleOtpKeyPress(nativeEvent.key, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                />
              ))}
            </View>

            <TouchableOpacity
              style={[styles.modalButton, forgotPasswordLoading && styles.buttonDisabled]}
              onPress={handleVerifyOtp}
              disabled={forgotPasswordLoading}
            >
              {forgotPasswordLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.modalButtonText}>Verify Code</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={handleForgotPasswordSubmitEmail} style={styles.resendButton}>
              <Text style={styles.resendButtonText}>Resend Code</Text>
            </TouchableOpacity>
          </>
        );

      case 'newPassword':
        return (
          <>
            <Text style={styles.modalTitle}>Create New Password</Text>
            <Text style={styles.modalSubtitle}>
              Enter a strong password for your account.
            </Text>

            <View style={styles.modalInputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#64748b" style={styles.modalInputIcon} />
              <TextInput
                style={styles.modalInput}
                placeholder="New password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
            </View>

            <View style={styles.modalInputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#64748b" style={styles.modalInputIcon} />
              <TextInput
                style={styles.modalInput}
                placeholder="Confirm password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={[styles.modalButton, forgotPasswordLoading && styles.buttonDisabled]}
              onPress={handleResetPassword}
              disabled={forgotPasswordLoading}
            >
              {forgotPasswordLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.modalButtonText}>Reset Password</Text>
              )}
            </TouchableOpacity>
          </>
        );

      case 'success':
        return (
          <>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={80} color="#10b981" />
            </View>
            <Text style={styles.modalTitle}>Password Reset!</Text>
            <Text style={styles.modalSubtitle}>
              Your password has been successfully reset. You can now log in with your new password.
            </Text>

            <TouchableOpacity style={styles.modalButton} onPress={closeForgotPassword}>
              <Text style={styles.modalButtonText}>Back to Login</Text>
            </TouchableOpacity>
          </>
        );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { translateX: shakeAnim },
              ],
            },
          ]}
        >
          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <View style={styles.logoWrapper}>
              <Image
                source={require('../../../assets/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.welcomeText}>Welcome to</Text>
            <Text style={styles.title}>Albis Care</Text>
            <Text style={styles.subtitle}>Care Management System</Text>
            <View style={styles.brandAccent} />
          </View>

          {/* Lockout Warning */}
          {isLocked() && (
            <View style={styles.lockoutBanner}>
              <Ionicons name="lock-closed" size={24} color="#dc2626" />
              <View style={styles.lockoutTextContainer}>
                <Text style={styles.lockoutTitle}>Account Temporarily Locked</Text>
                <Text style={styles.lockoutTimer}>
                  Try again in {formatLockoutTime(lockoutRemaining)}
                </Text>
              </View>
            </View>
          )}

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <View style={[styles.inputWrapper, emailTouched && emailError ? styles.inputError : null]}>
              <Ionicons name="mail-outline" size={20} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#94a3b8"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailTouched) validateEmail(text);
                }}
                onBlur={() => {
                  setEmailTouched(true);
                  validateEmail(email);
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading && !isLocked()}
              />
              {email.length > 0 && !emailError && emailTouched && (
                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              )}
            </View>
            {emailTouched && emailError ? (
              <Text style={styles.errorText}>{emailError}</Text>
            ) : null}
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={[styles.inputWrapper, passwordTouched && passwordError ? styles.inputError : null]}>
              <Ionicons name="lock-closed-outline" size={20} color="#64748b" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (passwordTouched) validatePassword(text);
                }}
                onBlur={() => {
                  setPasswordTouched(true);
                  validatePassword(password);
                }}
                secureTextEntry={!isPasswordVisible}
                editable={!loading && !isLocked()}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                <Ionicons
                  name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#64748b"
                />
              </TouchableOpacity>
            </View>
            {passwordTouched && passwordError ? (
              <Text style={styles.errorText}>{passwordError}</Text>
            ) : null}
          </View>

          {/* Remember Me & Forgot Password Row */}
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={styles.rememberMeContainer}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                {rememberMe && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
              <Text style={styles.rememberMeText}>Remember me</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowForgotPassword(true)}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.button, (loading || isLocked()) && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading || isLocked()}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Biometric Login */}
          {biometricAvailable && (
            <TouchableOpacity
              style={styles.biometricButton}
              onPress={handleBiometricLogin}
              disabled={loading || isLocked()}
            >
              <Ionicons
                name={biometricType === 'Face ID' ? 'scan-outline' : 'finger-print-outline'}
                size={24}
                color={biometricEnabled ? '#2563eb' : '#94a3b8'}
              />
              <Text style={[styles.biometricText, !biometricEnabled && styles.biometricTextDisabled]}>
                {biometricEnabled ? `Sign in with ${biometricType}` : `${biometricType} not enabled`}
              </Text>
            </TouchableOpacity>
          )}

          {/* Failed Attempts Warning */}
          {failedAttempts > 0 && failedAttempts < MAX_ATTEMPTS && !isLocked() && (
            <View style={styles.attemptsWarning}>
              <Ionicons name="warning-outline" size={16} color="#f59e0b" />
              <Text style={styles.attemptsWarningText}>
                {MAX_ATTEMPTS - failedAttempts} attempt{MAX_ATTEMPTS - failedAttempts !== 1 ? 's' : ''} remaining
              </Text>
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Powered by Albis Care Ltd</Text>
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Forgot Password Modal */}
      <Modal
        visible={showForgotPassword}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeForgotPassword}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeForgotPassword} style={styles.modalCloseButton}>
              <Ionicons name="close" size={24} color="#1e293b" />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.modalContent}
            keyboardShouldPersistTaps="handled"
          >
            {renderForgotPasswordContent()}
          </ScrollView>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoWrapper: {
    width: 88,
    height: 88,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
    marginBottom: 20,
  },
  logo: {
    width: 56,
    height: 56,
  },
  welcomeText: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  brandAccent: {
    width: 40,
    height: 3,
    backgroundColor: '#2563eb',
    borderRadius: 2,
    marginTop: 16,
  },
  lockoutBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  lockoutTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  lockoutTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
  },
  lockoutTimer: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#dc2626',
    marginTop: 4,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1e293b',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 6,
    marginLeft: 4,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  rememberMeText: {
    fontSize: 14,
    color: '#64748b',
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingVertical: 12,
  },
  biometricText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
    marginLeft: 8,
  },
  biometricTextDisabled: {
    color: '#94a3b8',
  },
  attemptsWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    alignSelf: 'center',
  },
  attemptsWarningText: {
    fontSize: 12,
    color: '#92400e',
    marginLeft: 6,
    fontWeight: '500',
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  versionText: {
    fontSize: 11,
    color: '#cbd5e1',
    marginTop: 4,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  modalInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  modalInputIcon: {
    marginRight: 12,
  },
  modalInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1e293b',
  },
  modalButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
    gap: 8,
  },
  otpInput: {
    width: 48,
    height: 56,
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  resendButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  resendButtonText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
  },
  successIcon: {
    alignItems: 'center',
    marginBottom: 24,
  },
});
