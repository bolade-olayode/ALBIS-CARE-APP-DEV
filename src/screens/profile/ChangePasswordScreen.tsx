// src/screens/profile/ChangePasswordScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { ScreenWrapper } from '../../components';
import { authApi } from '../../services/api/authApi';

interface ChangePasswordScreenProps {
  navigation: any;
}

export default function ChangePasswordScreen({ navigation }: ChangePasswordScreenProps) {
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Strong password validation
  const isStrongPassword = (password: string): boolean => {
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return hasMinLength && hasUppercase && hasLowercase && hasNumber;
  };

  const validateForm = (): boolean => {
    if (!currentPassword.trim()) {
      Alert.alert('Validation Error', 'Please enter your current password');
      return false;
    }

    if (!newPassword.trim()) {
      Alert.alert('Validation Error', 'Please enter a new password');
      return false;
    }

    if (!isStrongPassword(newPassword)) {
      Alert.alert(
        'Weak Password',
        'Password must be at least 8 characters and contain uppercase, lowercase, and a number.'
      );
      return false;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Validation Error', 'New passwords do not match');
      return false;
    }

    if (currentPassword === newPassword) {
      Alert.alert('Validation Error', 'New password must be different from current password');
      return false;
    }

    return true;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const response = await authApi.changePassword(currentPassword, newPassword);

      if (response.success) {
        Alert.alert(
          'Success',
          'Your password has been changed successfully.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to change password');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Change Password</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Text style={styles.infoIcon}>🔒</Text>
            <Text style={styles.infoText}>
              For security, please enter your current password before setting a new one.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Current Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Current Password</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Enter current password"
                  secureTextEntry={!showCurrentPassword}
                  autoCapitalize="none"
                  autoComplete="password"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  <Text style={styles.eyeIcon}>{showCurrentPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.divider} />

            {/* New Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Min 8 chars, upper, lower, number"
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                  autoComplete="new-password"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowNewPassword(!showNewPassword)}
                >
                  <Text style={styles.eyeIcon}>{showNewPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm New Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm New Password</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Re-enter new password"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoComplete="new-password"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Text style={styles.eyeIcon}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Password Requirements */}
          <View style={styles.requirements}>
            <Text style={styles.requirementsTitle}>Password Requirements:</Text>
            <Text style={styles.requirementItem}>
              {newPassword.length >= 8 ? '✅' : '⬜'} At least 8 characters
            </Text>
            <Text style={styles.requirementItem}>
              {/[A-Z]/.test(newPassword) ? '✅' : '⬜'} Contains uppercase letter
            </Text>
            <Text style={styles.requirementItem}>
              {/[a-z]/.test(newPassword) ? '✅' : '⬜'} Contains lowercase letter
            </Text>
            <Text style={styles.requirementItem}>
              {/[0-9]/.test(newPassword) ? '✅' : '⬜'} Contains a number
            </Text>
            <Text style={styles.requirementItem}>
              {newPassword === confirmPassword && newPassword.length > 0 ? '✅' : '⬜'} Passwords match
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleChangePassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Change Password</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#2563eb',
    paddingTop: 10,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  infoBanner: {
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1e293b',
  },
  eyeButton: {
    padding: 12,
  },
  eyeIcon: {
    fontSize: 18,
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 16,
  },
  requirements: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 12,
  },
  requirementItem: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
