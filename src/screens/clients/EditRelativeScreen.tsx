// src/screens/clients/EditRelativeScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../components';
import { relativeApi, Relative } from '../../services/api/relativeApi';

interface EditRelativeScreenProps {
  route: any;
  navigation: any;
}

export default function EditRelativeScreen({ route, navigation }: EditRelativeScreenProps) {
  const { relativeId, clientId, clientName } = route.params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    title: 'Mr',
    relationship: 'Son',
    phone: '',
    mobile: '',
    new_password: '',
    is_primary_contact: false,
    is_emergency_contact: false,
    can_receive_updates: true,
    can_view_reports: true,
    can_view_visit_logs: true,
  });

  useEffect(() => {
    loadRelativeData();
  }, []);

  const loadRelativeData = async () => {
    try {
      setLoading(true);
      const response = await relativeApi.getRelative(relativeId);
      
      if (response.success && response.data) {
        const relative: Relative = response.data.relative;
        setFormData({
          first_name: relative.rFName || '',
          last_name: relative.rLName || '',
          title: relative.rTitle || 'Mr',
          relationship: relative.relationship || 'Son',
          phone: relative.rTel || '',
          mobile: relative.rMobile || '',
          new_password: '',
          is_primary_contact: relative.is_primary_contact === 1,
          is_emergency_contact: relative.is_emergency_contact === 1,
          can_receive_updates: relative.can_receive_updates === 1,
          can_view_reports: relative.can_view_reports === 1,
          can_view_visit_logs: relative.can_view_visit_logs === 1,
        });
      } else {
        Alert.alert('Error', response.message || 'Failed to load relative data');
        navigation.goBack();
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.first_name || !formData.last_name) {
      Alert.alert('Validation Error', 'First name and last name are required');
      return;
    }

    // If password is being reset, validate it
    if (formData.new_password && formData.new_password.length < 6) {
      Alert.alert('Validation Error', 'New password must be at least 6 characters');
      return;
    }

    setSaving(true);

    try {
      const response = await relativeApi.updateRelative(relativeId, formData);

      if (response.success) {
        Alert.alert(
          'Success',
          'Family member updated successfully',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to update family member');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading data...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Family Member</Text>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSubmit}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.saveText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Client Info Banner */}
        <View style={styles.clientBanner}>
          <Text style={styles.clientBannerTitle}>Editing family member for:</Text>
          <Text style={styles.clientBannerName}>{clientName}</Text>
        </View>

        {/* Personal Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Details</Text>
          
          <Text style={styles.label}>Title</Text>
          <View style={styles.radioGroup}>
            {['Mr', 'Mrs', 'Miss', 'Ms', 'Dr'].map((title) => (
              <TouchableOpacity
                key={title}
                style={[
                  styles.radioButton,
                  formData.title === title && styles.radioButtonActive,
                ]}
                onPress={() => updateField('title', title)}
              >
                <Text
                  style={[
                    styles.radioText,
                    formData.title === title && styles.radioTextActive,
                  ]}
                >
                  {title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>First Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.first_name}
            onChangeText={(text) => updateField('first_name', text)}
            placeholder="John"
          />

          <Text style={styles.label}>Last Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.last_name}
            onChangeText={(text) => updateField('last_name', text)}
            placeholder="Smith"
          />

          <Text style={styles.label}>Relationship *</Text>
          <View style={styles.relationshipGroup}>
            {['Son', 'Daughter', 'Spouse', 'Sibling', 'Guardian', 'Other'].map((rel) => (
              <TouchableOpacity
                key={rel}
                style={[
                  styles.relationshipButton,
                  formData.relationship === rel && styles.relationshipButtonActive,
                ]}
                onPress={() => updateField('relationship', rel)}
              >
                <Text
                  style={[
                    styles.relationshipText,
                    formData.relationship === rel && styles.relationshipTextActive,
                  ]}
                >
                  {rel}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            value={formData.phone}
            onChangeText={(text) => updateField('phone', text)}
            placeholder="01234567890"
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Mobile</Text>
          <TextInput
            style={styles.input}
            value={formData.mobile}
            onChangeText={(text) => updateField('mobile', text)}
            placeholder="07700900123"
            keyboardType="phone-pad"
          />
        </View>

        {/* Password Reset Section (Optional) */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.passwordToggleHeader}
            onPress={() => setShowPasswordSection(!showPasswordSection)}
          >
            <View style={styles.passwordToggleLeft}>
              <Text style={styles.sectionTitle}>Reset Password</Text>
              <Text style={styles.passwordToggleSubtext}>
                {showPasswordSection ? 'Hide password reset section' : 'Tap to reset password'}
              </Text>
            </View>
            <Ionicons 
              name={showPasswordSection ? "chevron-up" : "chevron-down"} 
              size={24} 
              color="#64748b" 
            />
          </TouchableOpacity>

          {showPasswordSection && (
            <>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={formData.new_password}
                  onChangeText={(text) => updateField('new_password', text)}
                  placeholder="Min. 6 characters (leave blank to keep current)"
                  secureTextEntry={!isPasswordVisible}
                  autoCapitalize="none"
                />
                <TouchableOpacity 
                  style={styles.eyeIcon}
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                >
                  <Ionicons 
                    name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} 
                    size={24} 
                    color="#64748b" 
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.hint}>
                💡 Leave blank to keep the current password
              </Text>
            </>
          )}
        </View>

        {/* Permissions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Access Permissions</Text>
          
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => updateField('is_primary_contact', !formData.is_primary_contact)}
          >
            <View style={[styles.checkbox, formData.is_primary_contact && styles.checkboxChecked]}>
              {formData.is_primary_contact && (
                <Text style={styles.checkboxTick}>✓</Text>
              )}
            </View>
            <View style={styles.checkboxLabel}>
              <Text style={styles.checkboxLabelText}>Primary Contact</Text>
              <Text style={styles.checkboxLabelDescription}>
                Main point of contact for care decisions
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => updateField('is_emergency_contact', !formData.is_emergency_contact)}
          >
            <View style={[styles.checkbox, formData.is_emergency_contact && styles.checkboxChecked]}>
              {formData.is_emergency_contact && (
                <Text style={styles.checkboxTick}>✓</Text>
              )}
            </View>
            <View style={styles.checkboxLabel}>
              <Text style={styles.checkboxLabelText}>Emergency Contact</Text>
              <Text style={styles.checkboxLabelDescription}>
                Contacted in case of emergencies
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => updateField('can_receive_updates', !formData.can_receive_updates)}
          >
            <View style={[styles.checkbox, formData.can_receive_updates && styles.checkboxChecked]}>
              {formData.can_receive_updates && (
                <Text style={styles.checkboxTick}>✓</Text>
              )}
            </View>
            <View style={styles.checkboxLabel}>
              <Text style={styles.checkboxLabelText}>Can Receive Updates</Text>
              <Text style={styles.checkboxLabelDescription}>
                Gets notifications about care updates
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => updateField('can_view_reports', !formData.can_view_reports)}
          >
            <View style={[styles.checkbox, formData.can_view_reports && styles.checkboxChecked]}>
              {formData.can_view_reports && (
                <Text style={styles.checkboxTick}>✓</Text>
              )}
            </View>
            <View style={styles.checkboxLabel}>
              <Text style={styles.checkboxLabelText}>Can View Reports</Text>
              <Text style={styles.checkboxLabelDescription}>
                Access to care reports and analytics
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => updateField('can_view_visit_logs', !formData.can_view_visit_logs)}
          >
            <View style={[styles.checkbox, formData.can_view_visit_logs && styles.checkboxChecked]}>
              {formData.can_view_visit_logs && (
                <Text style={styles.checkboxTick}>✓</Text>
              )}
            </View>
            <View style={styles.checkboxLabel}>
              <Text style={styles.checkboxLabelText}>Can View Visit Logs</Text>
              <Text style={styles.checkboxLabelDescription}>
                See detailed visit history and notes
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            Changes will take effect immediately. The family member will keep their login email but permissions will be updated.
          </Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
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
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingTop: 10,
    paddingBottom: 16,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cancelButton: {
    padding: 8,
    minWidth: 60,
  },
  cancelText: {
    fontSize: 15,
    color: '#ef4444',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
  content: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  clientBanner: {
    backgroundColor: '#eff6ff',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  clientBannerTitle: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
  },
  clientBannerName: {
    fontSize: 18,
    color: '#1e40af',
    fontWeight: '600',
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1e293b',
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
    marginBottom: 8,
  },
  radioButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: 'white',
  },
  radioButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  radioText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  radioTextActive: {
    color: 'white',
  },
  relationshipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  relationshipButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: 'white',
  },
  relationshipButtonActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
  },
  relationshipText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  relationshipTextActive: {
    color: '#2563eb',
    fontWeight: '600',
  },
  passwordToggleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  passwordToggleLeft: {
    flex: 1,
  },
  passwordToggleSubtext: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingRight: 12,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1e293b',
  },
  eyeIcon: {
    padding: 4,
  },
  hint: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 6,
    fontStyle: 'italic',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingVertical: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
    backgroundColor: 'white',
  },
  checkboxChecked: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  checkboxTick: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  checkboxLabel: {
    flex: 1,
  },
  checkboxLabelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  checkboxLabelDescription: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  infoBox: {
    backgroundColor: '#fef3c7',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#92400e',
    lineHeight: 20,
  },
});