// src/screens/admin/SystemSettingsScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScreenWrapper } from '../../components';
import { authApi } from '../../services/api/authApi';

interface SystemSettingsScreenProps {
  navigation: any;
  userData?: any;
}

interface SettingsState {
  pushNotifications: boolean;
  emailNotifications: boolean;
  biometricLogin: boolean;
  autoLogout: boolean;
  darkMode: boolean;
}

export default function SystemSettingsScreen({ navigation, userData }: SystemSettingsScreenProps) {
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [settings, setSettings] = useState<SettingsState>({
    pushNotifications: true,
    emailNotifications: true,
    biometricLogin: false,
    autoLogout: true,
    darkMode: false,
  });

  // System info
  const appVersion = '1.0.0';
  const buildNumber = '100';
  const apiVersion = 'v1';

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Load saved settings from AsyncStorage
      const savedSettings = await AsyncStorage.getItem('systemSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }

      // Check biometric status
      const biometricEnabled = await authApi.isBiometricEnabled();
      setSettings(prev => ({ ...prev, biometricLogin: biometricEnabled }));
    } catch (error) {
      // Settings load failed silently
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: SettingsState) => {
    try {
      await AsyncStorage.setItem('systemSettings', JSON.stringify(newSettings));
    } catch (error) {
      // Settings save failed silently
    }
  };

  const handleToggle = async (key: keyof SettingsState) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    await saveSettings(newSettings);

    // Special handling for biometric
    if (key === 'biometricLogin') {
      if (!settings.biometricLogin) {
        Alert.alert(
          'Enable Biometric Login',
          'Users will be prompted to enable biometric login after their next successful sign-in.',
          [{ text: 'OK' }]
        );
      } else {
        await authApi.clearBiometricCredentials();
        Alert.alert('Disabled', 'Biometric login has been disabled.');
      }
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. You may need to reload some information. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            setClearing(true);
            try {
              // Clear specific cache keys (not auth data)
              const keysToKeep = ['authToken', 'userData', 'biometricEnabled', 'biometricCredentials', 'rememberedEmail'];
              const allKeys = await AsyncStorage.getAllKeys();
              const keysToRemove = allKeys.filter(key => !keysToKeep.includes(key));
              await AsyncStorage.multiRemove(keysToRemove);
              Alert.alert('Success', 'Cache cleared successfully.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear cache.');
            } finally {
              setClearing(false);
            }
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'This feature will export all system data to a downloadable file. This is typically used for backup purposes.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: () => {
            Alert.alert('Coming Soon', 'Data export functionality will be available in a future update.');
          },
        },
      ]
    );
  };

  const handleResetBiometric = async () => {
    Alert.alert(
      'Reset Biometric Data',
      'This will remove all stored biometric credentials. Users will need to re-enable biometric login.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await authApi.clearBiometricCredentials();
            setSettings(prev => ({ ...prev, biometricLogin: false }));
            Alert.alert('Success', 'Biometric data has been reset.');
          },
        },
      ]
    );
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@albiscare.co.uk?subject=App Support Request');
  };

  const handleViewPrivacyPolicy = () => {
    Linking.openURL('https://albiscare.co.uk/privacy-policy');
  };

  const handleViewTerms = () => {
    Linking.openURL('https://albiscare.co.uk/terms-of-service');
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7c3aed" />
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>System Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="notifications-outline" size={22} color="#7c3aed" />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Push Notifications</Text>
                  <Text style={styles.settingDescription}>Receive alerts for visits and updates</Text>
                </View>
              </View>
              <Switch
                value={settings.pushNotifications}
                onValueChange={() => handleToggle('pushNotifications')}
                trackColor={{ false: '#e2e8f0', true: '#c4b5fd' }}
                thumbColor={settings.pushNotifications ? '#7c3aed' : '#94a3b8'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="mail-outline" size={22} color="#7c3aed" />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Email Notifications</Text>
                  <Text style={styles.settingDescription}>Receive daily summaries via email</Text>
                </View>
              </View>
              <Switch
                value={settings.emailNotifications}
                onValueChange={() => handleToggle('emailNotifications')}
                trackColor={{ false: '#e2e8f0', true: '#c4b5fd' }}
                thumbColor={settings.emailNotifications ? '#7c3aed' : '#94a3b8'}
              />
            </View>
          </View>
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="finger-print-outline" size={22} color="#7c3aed" />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Biometric Login</Text>
                  <Text style={styles.settingDescription}>Allow Face ID / Fingerprint login</Text>
                </View>
              </View>
              <Switch
                value={settings.biometricLogin}
                onValueChange={() => handleToggle('biometricLogin')}
                trackColor={{ false: '#e2e8f0', true: '#c4b5fd' }}
                thumbColor={settings.biometricLogin ? '#7c3aed' : '#94a3b8'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="timer-outline" size={22} color="#7c3aed" />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Auto Logout</Text>
                  <Text style={styles.settingDescription}>Log out after 30 minutes of inactivity</Text>
                </View>
              </View>
              <Switch
                value={settings.autoLogout}
                onValueChange={() => handleToggle('autoLogout')}
                trackColor={{ false: '#e2e8f0', true: '#c4b5fd' }}
                thumbColor={settings.autoLogout ? '#7c3aed' : '#94a3b8'}
              />
            </View>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.settingRow} onPress={handleResetBiometric}>
              <View style={styles.settingInfo}>
                <Ionicons name="refresh-outline" size={22} color="#ef4444" />
                <View style={styles.settingText}>
                  <Text style={[styles.settingLabel, { color: '#ef4444' }]}>Reset Biometric Data</Text>
                  <Text style={styles.settingDescription}>Clear all stored biometric credentials</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Data Management Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.settingRow} onPress={handleClearCache} disabled={clearing}>
              <View style={styles.settingInfo}>
                <Ionicons name="trash-outline" size={22} color="#7c3aed" />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Clear Cache</Text>
                  <Text style={styles.settingDescription}>Free up space by clearing cached data</Text>
                </View>
              </View>
              {clearing ? (
                <ActivityIndicator size="small" color="#7c3aed" />
              ) : (
                <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
              )}
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.settingRow} onPress={handleExportData}>
              <View style={styles.settingInfo}>
                <Ionicons name="download-outline" size={22} color="#7c3aed" />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Export Data</Text>
                  <Text style={styles.settingDescription}>Download a backup of system data</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="moon-outline" size={22} color="#7c3aed" />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Dark Mode</Text>
                  <Text style={styles.settingDescription}>Use dark theme throughout the app</Text>
                </View>
              </View>
              <Switch
                value={settings.darkMode}
                onValueChange={() => handleToggle('darkMode')}
                trackColor={{ false: '#e2e8f0', true: '#c4b5fd' }}
                thumbColor={settings.darkMode ? '#7c3aed' : '#94a3b8'}
              />
            </View>
          </View>
          {settings.darkMode && (
            <Text style={styles.comingSoonNote}>Dark mode will be available in a future update.</Text>
          )}
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.settingRow} onPress={handleContactSupport}>
              <View style={styles.settingInfo}>
                <Ionicons name="help-circle-outline" size={22} color="#7c3aed" />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Contact Support</Text>
                  <Text style={styles.settingDescription}>Get help with the app</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.settingRow} onPress={handleViewPrivacyPolicy}>
              <View style={styles.settingInfo}>
                <Ionicons name="shield-checkmark-outline" size={22} color="#7c3aed" />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Privacy Policy</Text>
                  <Text style={styles.settingDescription}>View our privacy policy</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.settingRow} onPress={handleViewTerms}>
              <View style={styles.settingInfo}>
                <Ionicons name="document-text-outline" size={22} color="#7c3aed" />
                <View style={styles.settingText}>
                  <Text style={styles.settingLabel}>Terms of Service</Text>
                  <Text style={styles.settingDescription}>View terms and conditions</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* System Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Information</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>App Version</Text>
              <Text style={styles.infoValue}>{appVersion} ({buildNumber})</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>API Version</Text>
              <Text style={styles.infoValue}>{apiVersion}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Server</Text>
              <Text style={styles.infoValue}>albiscare.co.uk</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Logged in as</Text>
              <Text style={styles.infoValue}>{userData?.email || 'Super Admin'}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Albis Care Ltd</Text>
          <Text style={styles.footerSubtext}>Care Management System</Text>
          <Text style={styles.copyright}>© 2024 All Rights Reserved</Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
  },
  header: {
    backgroundColor: '#7c3aed',
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 14,
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1e293b',
  },
  settingDescription: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginLeft: 52,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  comingSoonNote: {
    fontSize: 12,
    color: '#f59e0b',
    marginTop: 8,
    marginLeft: 4,
    fontStyle: 'italic',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  copyright: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 8,
  },
});
