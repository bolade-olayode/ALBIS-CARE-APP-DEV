// src/screens/staff/AddStaffScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ScreenWrapper, FormScrollView } from '../../components';
import { staffApi } from '../../services/api/staffApi';
import { formatDate, parseDate } from '../../utils/dateFormatter';

interface AddStaffScreenProps {
  navigation: any;
}

export default function AddStaffScreen({ navigation }: AddStaffScreenProps) {
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    mobile: '',
    email: '',
    password: '',
    role_id: 2,
    address_line1: '',
    address_line2: '',
    town: '',
    postcode: '',
    employment_type: 'full_time',
    joined_date: formatDate(new Date().toISOString().split('T')[0]), // Initialize with UK Date
    status: 'active',
    pvg_number: '',
    sssc_number: '',
    qualifications: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
  });

  const updateField = (field: string, value: string | number) => {
    setFormData({ ...formData, [field]: value });
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const isoDate = selectedDate.toISOString().split('T')[0];
      updateField('joined_date', formatDate(isoDate));
    }
  };

  const handleSubmit = async () => {
    if (!formData.first_name || !formData.last_name) {
      Alert.alert('Validation Error', 'First name and last name are required');
      return;
    }

    if (!formData.mobile) {
      Alert.alert('Validation Error', 'Mobile number is required');
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Convert date back to SQL format (YYYY-MM-DD) before sending
      const submitData = {
        ...formData,
        joined_date: parseDate(formData.joined_date),
      };

      const response = await staffApi.createStaff(submitData);

      if (response.success) {
        const loginMethods = formData.email 
          ? `📱 Mobile: ${formData.mobile}\n📧 Email: ${formData.email}`
          : `📱 Mobile: ${formData.mobile}`;
          
        Alert.alert(
          'Staff Member Created!',
          `Login Credentials:\n\n${loginMethods}\n🔑 Password: ${formData.password}\n\n⚠️ Please share these credentials securely.\n\n💡 They should change this password after first login.`,
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('StaffList', { refresh: Date.now() }),
            },
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to add staff member');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          
          <Text style={styles.headerTitle} numberOfLines={1}>Add Staff</Text>
          
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.saveText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <FormScrollView>
        {/* Personal Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Details</Text>
          <Text style={styles.label}>First Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.first_name}
            onChangeText={(text) => updateField('first_name', text)}
            placeholder="Enter first name"
          />
          <Text style={styles.label}>Last Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.last_name}
            onChangeText={(text) => updateField('last_name', text)}
            placeholder="Enter last name"
          />
        </View>

        {/* Role Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Role</Text>
          <View style={styles.radioGroup}>
            {[
              { value: 1, label: '🔴 Care Manager', color: '#fee2e2' },
              { value: 2, label: '🔵 Carer', color: '#dbeafe' },
              { value: 3, label: '🟢 Nurse', color: '#d1fae5' },
              { value: 4, label: '🟡 Driver', color: '#fef3c7' },
            ].map((role) => (
              <TouchableOpacity
                key={role.value}
                style={[
                  styles.roleButton,
                  formData.role_id === role.value && {
                    backgroundColor: role.color,
                    borderColor: role.color,
                  },
                ]}
                onPress={() => updateField('role_id', role.value)}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    formData.role_id === role.value && styles.roleButtonTextActive,
                  ]}
                >
                  {role.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Contact Information & Login */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information & Login</Text>
          <Text style={styles.label}>Mobile *</Text>
          <TextInput
            style={styles.input}
            value={formData.mobile}
            onChangeText={(text) => updateField('mobile', text)}
            placeholder="07700900123"
            keyboardType="phone-pad"
          />
          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            value={formData.phone}
            onChangeText={(text) => updateField('phone', text)}
            placeholder="01234567890"
            keyboardType="phone-pad"
          />
          <Text style={styles.label}>Email (Optional)</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(text) => updateField('email', text)}
            placeholder="john.doe@gmail.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Text style={styles.label}>Temporary Password *</Text>
          <TextInput
            style={styles.input}
            value={formData.password}
            onChangeText={(text) => updateField('password', text)}
            placeholder="Minimum 6 characters"
            secureTextEntry
          />
          <Text style={styles.hintText}>
            💡 This password will be shared with the staff member.
          </Text>
        </View>

        {/* Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address</Text>
          <Text style={styles.label}>Address Line 1</Text>
          <TextInput
            style={styles.input}
            value={formData.address_line1}
            onChangeText={(text) => updateField('address_line1', text)}
            placeholder="123 High Street"
          />
          <Text style={styles.label}>Address Line 2</Text>
          <TextInput
            style={styles.input}
            value={formData.address_line2}
            onChangeText={(text) => updateField('address_line2', text)}
            placeholder="Flat 4"
          />
          <Text style={styles.label}>Town</Text>
          <TextInput
            style={styles.input}
            value={formData.town}
            onChangeText={(text) => updateField('town', text)}
            placeholder="London"
          />
          <Text style={styles.label}>Postcode</Text>
          <TextInput
            style={styles.input}
            value={formData.postcode}
            onChangeText={(text) => updateField('postcode', text)}
            placeholder="SW1A 1AA"
            autoCapitalize="characters"
          />
        </View>

        {/* Employment Details - DATE PICKER */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Employment Details</Text>
          <Text style={styles.label}>Employment Type</Text>
          <View style={styles.radioGroup}>
            {[
              { value: 'full_time', label: 'Full Time' },
              { value: 'part_time', label: 'Part Time' },
              { value: 'contract', label: 'Contract' },
            ].map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.radioButton,
                  formData.employment_type === type.value && styles.radioButtonActive,
                ]}
                onPress={() => updateField('employment_type', type.value)}
              >
                <Text
                  style={[
                    styles.radioText,
                    formData.employment_type === type.value && styles.radioTextActive,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Joined Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>
              {formData.joined_date || 'Select Date'}
            </Text>
            <Text style={styles.dateIcon}>📅</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={formData.joined_date ? new Date(parseDate(formData.joined_date)) : new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
            />
          )}
        </View>

        {/* Professional Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Information</Text>
          <Text style={styles.label}>PVG Number</Text>
          <TextInput
            style={styles.input}
            value={formData.pvg_number}
            onChangeText={(text) => updateField('pvg_number', text)}
            placeholder="Enter PVG number"
          />
          <Text style={styles.label}>SSSC Number</Text>
          <TextInput
            style={styles.input}
            value={formData.sssc_number}
            onChangeText={(text) => updateField('sssc_number', text)}
            placeholder="Enter SSSC number"
          />
          <Text style={styles.label}>Qualifications</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.qualifications}
            onChangeText={(text) => updateField('qualifications', text)}
            placeholder="List qualifications and certifications..."
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Emergency Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Contact</Text>
          <Text style={styles.label}>Contact Name</Text>
          <TextInput
            style={styles.input}
            value={formData.emergency_contact_name}
            onChangeText={(text) => updateField('emergency_contact_name', text)}
            placeholder="Enter emergency contact name"
          />
          <Text style={styles.label}>Contact Phone</Text>
          <TextInput
            style={styles.input}
            value={formData.emergency_contact_phone}
            onChangeText={(text) => updateField('emergency_contact_phone', text)}
            placeholder="07700900123"
            keyboardType="phone-pad"
          />
        </View>
      </FormScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingTop: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 16,
    minHeight: 50,
  },
  cancelButton: {
    padding: 8,
    minWidth: 50,
    alignItems: 'flex-start',
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
    marginHorizontal: 4,
  },
  saveButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 50,
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
  section: {
    backgroundColor: 'white',
    marginTop: 16,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  hintText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    fontStyle: 'italic',
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
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
  roleButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: 'white',
    marginBottom: 8,
    minWidth: '48%',
  },
  roleButtonText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
    textAlign: 'center',
  },
  roleButtonTextActive: {
    fontWeight: '600',
    color: '#1e293b',
  },
  dateButton: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 15,
    color: '#1e293b',
  },
  dateIcon: {
    fontSize: 16,
  },
});