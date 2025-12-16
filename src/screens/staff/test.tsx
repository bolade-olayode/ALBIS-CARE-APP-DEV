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
} from 'react-native';
import { ScreenWrapper, FormScrollView } from '../../components';
import { staffApi } from '../../services/api/staffApi';

interface AddStaffScreenProps {
  navigation: any;
}

export default function AddStaffScreen({ navigation }: AddStaffScreenProps) {
  const [loading, setLoading] = useState(false);
  
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
    joined_date: new Date().toISOString().split('T')[0],
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
      const response = await staffApi.createStaff(formData);

      if (response.success) {
        const loginMethods = formData.email 
          ? `📱 Mobile: ${formData.mobile}\n📧 Email: ${formData.email}`
          : `📱 Mobile: ${formData.mobile}`;
          
        Alert.alert(
          'Staff Member Created!',
          `Login Credentials:\n\n${loginMethods}\n🔑 Password: ${formData.password}\n\n⚠️ Please share these credentials securely with the staff member.\n\n💡 They can login with their mobile number or email.\n💡 They should change this password after first login.`,
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
            💡 This password will be shared with the staff member. They should change it after first login.
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

        {/* Employment Details */}
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
          <TextInput
            style={styles.input}
            value={formData.joined_date}
            onChangeText={(text) => updateField('joined_date', text)}
            placeholder="YYYY-MM-DD"
          />
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
});



///EDIT STAFF SCREEN///
// src/screens/staff/EditStaffScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { ScreenWrapper, FormScrollView } from '../../components';
import { staffApi } from '../../services/api/staffApi';

interface EditStaffScreenProps {
  route: any;
  navigation: any;
}

export default function EditStaffScreen({ route, navigation }: EditStaffScreenProps) {
  const { staffId } = route.params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    mobile: '',
    email: '',
    role_id: 2,
    address_line1: '',
    address_line2: '',
    town: '',
    postcode: '',
    employment_type: 'full_time',
    joined_date: '',
    status: 'active',
    pvg_number: '',
    sssc_number: '',
    qualifications: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
  });

  useEffect(() => {
    loadStaffData();
  }, []);

  const loadStaffData = async () => {
    try {
      setLoading(true);
      const response = await staffApi.getStaffMember(staffId);
      
      if (response.success && response.data) {
        const staff = response.data.staff;
        
        setFormData({
          first_name: staff.first_name || '',
          last_name: staff.last_name || '',
          phone: staff.phone || '',
          mobile: staff.mobile || '',
          email: staff.email || '',
          role_id: staff.role_id || 2,
          address_line1: staff.address_line1 || '',
          address_line2: staff.address_line2 || '',
          town: staff.town || '',
          postcode: staff.postcode || '',
          employment_type: staff.employment_type || 'full_time',
          joined_date: staff.joined_date || '',
          status: staff.status || 'active',
          pvg_number: staff.pvg_number || '',
          sssc_number: staff.sssc_number || '',
          qualifications: staff.qualifications || '',
          emergency_contact_name: staff.emergency_contact_name || '',
          emergency_contact_phone: staff.emergency_contact_phone || '',
        });
      } else {
        Alert.alert('Error', response.message || 'Failed to load staff data');
        navigation.goBack();
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string | number) => {
    setFormData({ ...formData, [field]: value });
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

    setSaving(true);

    try {
      const response = await staffApi.updateStaff(staffId, formData);

      if (response.success) {
        Alert.alert(
          'Success',
          'Staff member updated successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to update staff member');
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
          <Text style={styles.loadingText}>Loading staff data...</Text>
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
        <Text style={styles.headerTitle}>Edit Staff</Text>
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

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>

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

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(text) => updateField('email', text)}
            placeholder="john.doe@gmail.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
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

        {/* Employment Details */}
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
          <TextInput
            style={styles.input}
            value={formData.joined_date}
            onChangeText={(text) => updateField('joined_date', text)}
            placeholder="YYYY-MM-DD"
          />

          <Text style={styles.label}>Status</Text>
          <View style={styles.radioGroup}>
            {[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ].map((status) => (
              <TouchableOpacity
                key={status.value}
                style={[
                  styles.radioButton,
                  formData.status === status.value && styles.radioButtonActive,
                ]}
                onPress={() => updateField('status', status.value)}
              >
                <Text
                  style={[
                    styles.radioText,
                    formData.status === status.value && styles.radioTextActive,
                  ]}
                >
                  {status.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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
    paddingTop: 10,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  cancelButton: {
    padding: 8,
  },
  cancelText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  saveButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
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
});


//STAFF DETAIL SCREEN//

// src/screens/staff/StaffDetailScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { ScreenWrapper } from '../../components';
import { staffApi } from '../../services/api/staffApi';

interface StaffDetailScreenProps {
  route: any;
  navigation: any;
}

export default function StaffDetailScreen({ route, navigation }: StaffDetailScreenProps) {
  const { staffId } = route.params;
  const [staff, setStaff] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStaffDetails();
  }, []);

  const loadStaffDetails = async () => {
    try {
      setLoading(true);
      const response = await staffApi.getStaffMember(staffId);
      
      if (response.success && response.data) {
        setStaff(response.data.staff);
      } else {
        Alert.alert('Error', response.message || 'Failed to load staff details');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Staff Member',
      `Are you sure you want to delete ${staff?.name}? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await staffApi.deleteStaff(staffId);
              
              if (response.success) {
                Alert.alert(
                  'Success',
                  'Staff member deleted successfully',
                  [
                    {
                      text: 'OK',
                      onPress: () => navigation.navigate('StaffList'),
                    },
                  ]
                );
              } else {
                Alert.alert('Error', response.message || 'Failed to delete staff member');
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Something went wrong');
            }
          },
        },
      ]
    );
  };

  const getRoleBadgeStyle = (roleId: number) => {
    switch (roleId) {
      case 1:
        return { backgroundColor: '#fee2e2', textColor: '#991b1b', icon: '🔴', label: 'Care Manager' };
      case 2:
        return { backgroundColor: '#dbeafe', textColor: '#1e40af', icon: '🔵', label: 'Carer' };
      case 3:
        return { backgroundColor: '#d1fae5', textColor: '#065f46', icon: '🟢', label: 'Nurse' };
      case 4:
        return { backgroundColor: '#fef3c7', textColor: '#92400e', icon: '🟡', label: 'Driver' };
      default:
        return { backgroundColor: '#f1f5f9', textColor: '#475569', icon: '⚪', label: 'Staff' };
    }
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading staff details...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (!staff) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Staff member not found</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  const roleBadge = getRoleBadgeStyle(staff.role_id);

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.headerBackText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Staff Details</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditStaff', { staffId: staff.id })}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>
              {staff.first_name?.charAt(0)}{staff.last_name?.charAt(0)}
            </Text>
          </View>
          <Text style={styles.staffNameLarge}>
            {staff.first_name} {staff.last_name}
          </Text>
          <View style={styles.statusBadgeLarge}>
            <Text style={styles.statusTextLarge}>{staff.status || 'Active'}</Text>
          </View>
        </View>

        {/* Role Badge */}
        <View style={[styles.roleCard, { backgroundColor: roleBadge.backgroundColor }]}>
          <Text style={[styles.roleTextLarge, { color: roleBadge.textColor }]}>
            {roleBadge.icon} {roleBadge.label}
          </Text>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          {staff.phone && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📞 Phone:</Text>
              <Text style={styles.infoValue}>{staff.phone}</Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📱 Mobile:</Text>
            <Text style={styles.infoValue}>{staff.mobile}</Text>
          </View>

          {staff.email && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>✉️ Email:</Text>
              <Text style={styles.infoValue}>{staff.email}</Text>
            </View>
          )}
        </View>

        {/* Address Information */}
        {(staff.address_line1 || staff.town || staff.postcode) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Address</Text>
            
            {staff.address_line1 && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>🏠 Address:</Text>
                <Text style={styles.infoValue}>
                  {staff.address_line1}
                  {staff.address_line2 ? `\n${staff.address_line2}` : ''}
                </Text>
              </View>
            )}

            {staff.town && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>📍 Town:</Text>
                <Text style={styles.infoValue}>{staff.town}</Text>
              </View>
            )}

            {staff.postcode && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>📮 Postcode:</Text>
                <Text style={styles.infoValue}>{staff.postcode}</Text>
              </View>
            )}
          </View>
        )}

        {/* Employment Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Employment Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>💼 Type:</Text>
            <Text style={styles.infoValue}>
              {staff.employment_type === 'full_time' ? 'Full Time' : 
               staff.employment_type === 'part_time' ? 'Part Time' : 'Contract'}
            </Text>
          </View>

          {staff.joined_date && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📅 Joined:</Text>
              <Text style={styles.infoValue}>{staff.joined_date}</Text>
            </View>
          )}
        </View>

        {/* Professional Information */}
        {(staff.pvg_number || staff.sssc_number || staff.qualifications) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Information</Text>
            
            {staff.pvg_number && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>🔒 PVG Number:</Text>
                <Text style={styles.infoValue}>{staff.pvg_number}</Text>
              </View>
            )}

            {staff.sssc_number && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>📋 SSSC Number:</Text>
                <Text style={styles.infoValue}>{staff.sssc_number}</Text>
              </View>
            )}

            {staff.qualifications && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>🎓 Qualifications:</Text>
                <Text style={styles.infoValue}>{staff.qualifications}</Text>
              </View>
            )}
          </View>
        )}

        {/* Emergency Contact */}
        {(staff.emergency_contact_name || staff.emergency_contact_phone) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Emergency Contact</Text>
            
            {staff.emergency_contact_name && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>👤 Name:</Text>
                <Text style={styles.infoValue}>{staff.emergency_contact_name}</Text>
              </View>
            )}

            {staff.emergency_contact_phone && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>📞 Phone:</Text>
                <Text style={styles.infoValue}>{staff.emergency_contact_phone}</Text>
              </View>
            )}
          </View>
        )}

        {/* Delete Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <Text style={styles.deleteButtonText}>🗑️ Delete Staff Member</Text>
          </TouchableOpacity>
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
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginBottom: 20,
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 10,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerBackButton: {
    padding: 8,
  },
  headerBackText: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  editButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: 'white',
    paddingVertical: 32,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarLargeText: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
  },
  staffNameLarge: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  statusBadgeLarge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusTextLarge: {
    fontSize: 14,
    color: '#166534',
    fontWeight: '600',
  },
  roleCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  roleTextLarge: {
    fontSize: 18,
    fontWeight: 'bold',
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
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    width: 140,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1e293b',
    flex: 1,
  },
  backButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  backButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

//ADD CLIENT SCREEN//
// src/screens/clients/AddClientScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { ScreenWrapper, FormScrollView } from '../../components';
import { clientApi } from '../../services/api/clientApi';

interface AddClientScreenProps {
  navigation: any;
}

export default function AddClientScreen({ navigation }: AddClientScreenProps) {
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    cTitle: 'Mr',
    cFName: '',
    cLName: '',
    cAddr1: '',
    cAddr2: '',
    cTown: '',
    cPostCode: '',
    cTel: '',
    cMobile: '',
    cEmail: '',
    cGender: 'Male',
    cCarePlan: '',
    cRemarks: '',
    NHSNo: '',
    care_level: 'low',
    date_of_birth: '',
    cSDate: '',
    cEDate: '',
    status: 'active',
  });

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    if (!formData.cFName || !formData.cLName) {
      Alert.alert('Validation Error', 'First name and last name are required');
      return;
    }

    if (!formData.cPostCode || !formData.cTel) {
      Alert.alert('Validation Error', 'Postcode and phone number are required');
      return;
    }

    setLoading(true);

    try {
      const response = await clientApi.createClient(formData);

      if (response.success) {
        Alert.alert(
          'Success',
          'Client added successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('ClientList', { refresh: Date.now() }),
            },
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to add client');
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
          
          <Text style={styles.headerTitle} numberOfLines={1}>Add CareUser</Text>
          
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
      {/* <-- FIXED: Added this missing closing tag */}

      <FormScrollView>
        {/* Personal Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Details</Text>

          <Text style={styles.label}>Title</Text>
          <View style={styles.radioGroup}>
            {['Mr', 'Mrs', 'Miss', 'Ms', 'Dr'].map((title) => (
              <TouchableOpacity
                key={title}
                style={[
                  styles.radioButton,
                  formData.cTitle === title && styles.radioButtonActive,
                ]}
                onPress={() => updateField('cTitle', title)}
              >
                <Text
                  style={[
                    styles.radioText,
                    formData.cTitle === title && styles.radioTextActive,
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
            value={formData.cFName}
            onChangeText={(text) => updateField('cFName', text)}
            placeholder="Enter first name"
          />

          <Text style={styles.label}>Last Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.cLName}
            onChangeText={(text) => updateField('cLName', text)}
            placeholder="Enter last name"
          />

          <Text style={styles.label}>Gender</Text>
          <View style={styles.radioGroup}>
            {['Male', 'Female', 'Other'].map((gender) => (
              <TouchableOpacity
                key={gender}
                style={[
                  styles.radioButton,
                  formData.cGender === gender && styles.radioButtonActive,
                ]}
                onPress={() => updateField('cGender', gender)}
              >
                <Text
                  style={[
                    styles.radioText,
                    formData.cGender === gender && styles.radioTextActive,
                  ]}
                >
                  {gender}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Date of Birth</Text>
          <TextInput
            style={styles.input}
            value={formData.date_of_birth}
            onChangeText={(text) => updateField('date_of_birth', text)}
            placeholder="YYYY-MM-DD (e.g., 1950-01-15)"
          />

          <Text style={styles.label}>NHS Number</Text>
          <TextInput
            style={styles.input}
            value={formData.NHSNo}
            onChangeText={(text) => updateField('NHSNo', text)}
            placeholder="Enter NHS number"
          />
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>

          <Text style={styles.label}>Phone *</Text>
          <TextInput
            style={styles.input}
            value={formData.cTel}
            onChangeText={(text) => updateField('cTel', text)}
            placeholder="01234567890"
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Mobile</Text>
          <TextInput
            style={styles.input}
            value={formData.cMobile}
            onChangeText={(text) => updateField('cMobile', text)}
            placeholder="07700900123"
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={formData.cEmail}
            onChangeText={(text) => updateField('cEmail', text)}
            placeholder="example@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address</Text>

          <Text style={styles.label}>Address Line 1 *</Text>
          <TextInput
            style={styles.input}
            value={formData.cAddr1}
            onChangeText={(text) => updateField('cAddr1', text)}
            placeholder="123 High Street"
          />

          <Text style={styles.label}>Address Line 2</Text>
          <TextInput
            style={styles.input}
            value={formData.cAddr2}
            onChangeText={(text) => updateField('cAddr2', text)}
            placeholder="Flat 4"
          />

          <Text style={styles.label}>Town</Text>
          <TextInput
            style={styles.input}
            value={formData.cTown}
            onChangeText={(text) => updateField('cTown', text)}
            placeholder="London"
          />

          <Text style={styles.label}>Postcode *</Text>
          <TextInput
            style={styles.input}
            value={formData.cPostCode}
            onChangeText={(text) => updateField('cPostCode', text.toUpperCase())}
            placeholder="SW1A 1AA"
            autoCapitalize="characters"
          />
        </View>

        {/* Care Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Care Details</Text>

          <Text style={styles.label}>Care Level</Text>
          <View style={styles.careLevelContainer}>
            {[
              { value: 'low', label: '🟢 Low', color: '#d1fae5' },
              { value: 'medium', label: '🟡 Medium', color: '#fef3c7' },
              { value: 'high', label: '🟠 High', color: '#fed7aa' },
              { value: 'complex', label: '🔴 Complex', color: '#fee2e2' },
            ].map((level) => (
              <TouchableOpacity
                key={level.value}
                style={[
                  styles.careLevelButton,
                  formData.care_level === level.value && {
                    backgroundColor: level.color,
                    borderColor: level.color,
                  },
                ]}
                onPress={() => updateField('care_level', level.value)}
              >
                <Text
                  style={[
                    styles.careLevelText,
                    formData.care_level === level.value && styles.careLevelTextActive,
                  ]}
                >
                  {level.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Care Start Date</Text>
          <TextInput
            style={styles.input}
            value={formData.cSDate}
            onChangeText={(text) => updateField('cSDate', text)}
            placeholder="YYYY-MM-DD (e.g., 2024-01-15)"
          />

          <Text style={styles.label}>Care End Date (Optional)</Text>
          <TextInput
            style={styles.input}
            value={formData.cEDate}
            onChangeText={(text) => updateField('cEDate', text)}
            placeholder="YYYY-MM-DD (leave empty if ongoing)"
          />

          <Text style={styles.label}>Care Plan</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.cCarePlan}
            onChangeText={(text) => updateField('cCarePlan', text)}
            placeholder="Describe the care plan..."
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Medical Notes & Remarks</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.cRemarks}
            onChangeText={(text) => updateField('cRemarks', text)}
            placeholder="Any medical conditions, allergies, or special notes..."
            multiline
            numberOfLines={4}
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
  careLevelContainer: {
    gap: 8,
    marginTop: 4,
  },
  careLevelButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: 'white',
  },
  careLevelText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  careLevelTextActive: {
    fontWeight: '600',
    color: '#1e293b',
  },
});


//CLIENT DETAIL SCREEN

// src/screens/clients/ClientDetailScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { ScreenWrapper } from '../../components';
import { clientApi } from '../../services/api/clientApi';

interface ClientDetailScreenProps {
  route: any;
  navigation: any;
}

export default function ClientDetailScreen({ route, navigation }: ClientDetailScreenProps) {
  const { clientId } = route.params;
  const [client, setClient] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClientDetails();
  }, []);

  const loadClientDetails = async () => {
    try {
      setLoading(true);
      const response = await clientApi.getClient(clientId);
      
      if (response.success && response.data) {
        setClient(response.data.client);
      } else {
        Alert.alert('Error', response.message || 'Failed to load client details');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Client',
      `Are you sure you want to delete ${client?.cFName} ${client?.cLName}? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await clientApi.deleteClient(clientId);
              
              if (response.success) {
                Alert.alert(
                  'Success',
                  'Client deleted successfully',
                  [
                    {
                      text: 'OK',
                      onPress: () => navigation.navigate('ClientList'),
                    },
                  ]
                );
              } else {
                Alert.alert('Error', response.message || 'Failed to delete client');
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Something went wrong');
            }
          },
        },
      ]
    );
  };

  const getCareLevelBadgeStyle = (careLevel: string) => {
    switch (careLevel?.toLowerCase()) {
      case 'complex':
        return { backgroundColor: '#fee2e2', textColor: '#991b1b', label: '🔴 Complex' };
      case 'high':
        return { backgroundColor: '#fed7aa', textColor: '#9a3412', label: '🟠 High' };
      case 'medium':
        return { backgroundColor: '#fef3c7', textColor: '#92400e', label: '🟡 Medium' };
      case 'low':
      default:
        return { backgroundColor: '#d1fae5', textColor: '#065f46', label: '🟢 Low' };
    }
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading client details...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (!client) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Client not found</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  const careLevelBadge = getCareLevelBadgeStyle(client.care_level);

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.headerBackText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Client Details</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditClient', { clientId: client.cNo })}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>
              {client.cFName?.charAt(0)}{client.cLName?.charAt(0)}
            </Text>
          </View>
          <Text style={styles.clientNameLarge}>
            {client.cTitle} {client.cFName} {client.cLName}
          </Text>
          <View style={styles.statusBadgeLarge}>
            <Text style={styles.statusTextLarge}>{client.status || 'Active'}</Text>
          </View>
        </View>

        {/* Care Level Badge */}
        <View style={[styles.careLevelCard, { backgroundColor: careLevelBadge.backgroundColor }]}>
          <Text style={[styles.careLevelTextLarge, { color: careLevelBadge.textColor }]}>
            {careLevelBadge.label}
          </Text>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          {client.cTel && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📞 Phone:</Text>
              <Text style={styles.infoValue}>{client.cTel}</Text>
            </View>
          )}

          {client.cMobile && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📱 Mobile:</Text>
              <Text style={styles.infoValue}>{client.cMobile}</Text>
            </View>
          )}

          {client.cEmail && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>✉️ Email:</Text>
              <Text style={styles.infoValue}>{client.cEmail}</Text>
            </View>
          )}
        </View>

        {/* Address Information */}
        {(client.cAddr1 || client.cTown || client.cPostCode) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Address</Text>
            
            {client.cAddr1 && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>🏠 Address:</Text>
                <Text style={styles.infoValue}>
                  {client.cAddr1}
                  {client.cAddr2 ? `\n${client.cAddr2}` : ''}
                </Text>
              </View>
            )}

            {client.cTown && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>📍 Town:</Text>
                <Text style={styles.infoValue}>{client.cTown}</Text>
              </View>
            )}

            {client.cPostCode && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>📮 Postcode:</Text>
                <Text style={styles.infoValue}>{client.cPostCode}</Text>
              </View>
            )}
          </View>
        )}

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          {client.cGender && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>👤 Gender:</Text>
              <Text style={styles.infoValue}>{client.cGender}</Text>
            </View>
          )}

          {client.date_of_birth && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>🎂 Date of Birth:</Text>
              <Text style={styles.infoValue}>{client.date_of_birth}</Text>
            </View>
          )}

          {client.NHSNo && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>🏥 NHS Number:</Text>
              <Text style={styles.infoValue}>{client.NHSNo}</Text>
            </View>
          )}
        </View>

        {/* Care Information */}
        {(client.cSDate || client.cEDate) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Care Period</Text>
            
            {client.cSDate && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>📅 Start Date:</Text>
                <Text style={styles.infoValue}>{client.cSDate}</Text>
              </View>
            )}

            {client.cEDate && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>📅 End Date:</Text>
                <Text style={styles.infoValue}>{client.cEDate}</Text>
              </View>
            )}
          </View>
        )}

        {/* Care Plan */}
        {client.cCarePlan && (
          <View style={[styles.section, styles.carePlanSection]}>
            <Text style={styles.sectionTitle}>Care Plan</Text>
            <Text style={styles.carePlanText}>{client.cCarePlan}</Text>
          </View>
        )}

        {/* Medical Notes */}
        {client.cRemarks && (
          <View style={[styles.section, styles.remarksSection]}>
            <Text style={styles.sectionTitle}>Medical Notes & Remarks</Text>
            <Text style={styles.remarksText}>{client.cRemarks}</Text>
          </View>
        )}

        {/* Delete Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <Text style={styles.deleteButtonText}>🗑️ Delete Client</Text>
          </TouchableOpacity>
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
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginBottom: 20,
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 10,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerBackButton: {
    padding: 8,
  },
  headerBackText: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  editButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: 'white',
    paddingVertical: 32,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarLargeText: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
  },
  clientNameLarge: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  statusBadgeLarge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusTextLarge: {
    fontSize: 14,
    color: '#166534',
    fontWeight: '600',
  },
  careLevelCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  careLevelTextLarge: {
    fontSize: 18,
    fontWeight: 'bold',
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
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    width: 140,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1e293b',
    flex: 1,
  },
  carePlanSection: {
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  carePlanText: {
    fontSize: 14,
    color: '#1e293b',
    lineHeight: 20,
  },
  remarksSection: {
    backgroundColor: '#fffbeb',
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  remarksText: {
    fontSize: 14,
    color: '#1e293b',
    lineHeight: 20,
  },
  backButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  backButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

//EDIT-CLIENT-SCREEN

// src/screens/clients/EditClientScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { ScreenWrapper, FormScrollView } from '../../components';
import { clientApi } from '../../services/api/clientApi';

interface EditClientScreenProps {
  route: any;
  navigation: any;
}

export default function EditClientScreen({ route, navigation }: EditClientScreenProps) {
  const { clientId } = route.params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    cTitle: 'Mr',
    cFName: '',
    cLName: '',
    cAddr1: '',
    cAddr2: '',
    cTown: '',
    cPostCode: '',
    cTel: '',
    cMobile: '',
    cEmail: '',
    cGender: 'Male',
    cCarePlan: '',
    cRemarks: '',
    NHSNo: '',
    care_level: 'low',
    date_of_birth: '',
    cSDate: '',
    cEDate: '',
    status: 'active',
  });

  useEffect(() => {
    loadClientData();
  }, []);

  const loadClientData = async () => {
    try {
      setLoading(true);
      const response = await clientApi.getClient(clientId);
      
      if (response.success && response.data) {
        const clientData = response.data.client;
        
        setFormData({
          cTitle: clientData.cTitle || 'Mr',
          cFName: clientData.cFName || '',
          cLName: clientData.cLName || '',
          cAddr1: clientData.cAddr1 || '',
          cAddr2: clientData.cAddr2 || '',
          cTown: clientData.cTown || '',
          cPostCode: clientData.cPostCode || '',
          cTel: clientData.cTel || '',
          cMobile: clientData.cMobile || '',
          cEmail: clientData.cEmail || '',
          cGender: clientData.cGender || 'Male',
          cCarePlan: clientData.cCarePlan || '',
          cRemarks: clientData.cRemarks || '',
          NHSNo: clientData.NHSNo || '',
          care_level: clientData.care_level || 'low',
          date_of_birth: clientData.date_of_birth || '',
          cSDate: clientData.cSDate || '',
          cEDate: clientData.cEDate || '',
          status: clientData.status || 'active',
        });
      } else {
        Alert.alert('Error', response.message || 'Failed to load client data');
        navigation.goBack();
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    if (!formData.cFName || !formData.cLName) {
      Alert.alert('Validation Error', 'First name and last name are required');
      return;
    }

    if (!formData.cPostCode || !formData.cTel) {
      Alert.alert('Validation Error', 'Postcode and phone number are required');
      return;
    }

    setSaving(true);

    try {
      const response = await clientApi.updateClient(clientId, formData);

      if (response.success) {
        Alert.alert(
          'Success',
          'Client updated successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to update client');
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
          <Text style={styles.loadingText}>Loading client data...</Text>
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
        <Text style={styles.headerTitle}>Edit Client</Text>
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

      <FormScrollView>
        {/* Personal Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Details</Text>

          <Text style={styles.label}>Title</Text>
          <View style={styles.radioGroup}>
            {['Mr', 'Mrs', 'Miss', 'Ms', 'Dr'].map((title) => (
              <TouchableOpacity
                key={title}
                style={[
                  styles.radioButton,
                  formData.cTitle === title && styles.radioButtonActive,
                ]}
                onPress={() => updateField('cTitle', title)}
              >
                <Text
                  style={[
                    styles.radioText,
                    formData.cTitle === title && styles.radioTextActive,
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
            value={formData.cFName}
            onChangeText={(text) => updateField('cFName', text)}
            placeholder="Enter first name"
          />

          <Text style={styles.label}>Last Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.cLName}
            onChangeText={(text) => updateField('cLName', text)}
            placeholder="Enter last name"
          />

          <Text style={styles.label}>Gender</Text>
          <View style={styles.radioGroup}>
            {['Male', 'Female', 'Other'].map((gender) => (
              <TouchableOpacity
                key={gender}
                style={[
                  styles.radioButton,
                  formData.cGender === gender && styles.radioButtonActive,
                ]}
                onPress={() => updateField('cGender', gender)}
              >
                <Text
                  style={[
                    styles.radioText,
                    formData.cGender === gender && styles.radioTextActive,
                  ]}
                >
                  {gender}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Date of Birth</Text>
          <TextInput
            style={styles.input}
            value={formData.date_of_birth}
            onChangeText={(text) => updateField('date_of_birth', text)}
            placeholder="YYYY-MM-DD (e.g., 1950-01-15)"
          />

          <Text style={styles.label}>NHS Number</Text>
          <TextInput
            style={styles.input}
            value={formData.NHSNo}
            onChangeText={(text) => updateField('NHSNo', text)}
            placeholder="Enter NHS number"
          />
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>

          <Text style={styles.label}>Phone *</Text>
          <TextInput
            style={styles.input}
            value={formData.cTel}
            onChangeText={(text) => updateField('cTel', text)}
            placeholder="01234567890"
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Mobile</Text>
          <TextInput
            style={styles.input}
            value={formData.cMobile}
            onChangeText={(text) => updateField('cMobile', text)}
            placeholder="07700900123"
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={formData.cEmail}
            onChangeText={(text) => updateField('cEmail', text)}
            placeholder="example@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address</Text>

          <Text style={styles.label}>Address Line 1 *</Text>
          <TextInput
            style={styles.input}
            value={formData.cAddr1}
            onChangeText={(text) => updateField('cAddr1', text)}
            placeholder="123 High Street"
          />

          <Text style={styles.label}>Address Line 2</Text>
          <TextInput
            style={styles.input}
            value={formData.cAddr2}
            onChangeText={(text) => updateField('cAddr2', text)}
            placeholder="Flat 4"
          />

          <Text style={styles.label}>Town</Text>
          <TextInput
            style={styles.input}
            value={formData.cTown}
            onChangeText={(text) => updateField('cTown', text)}
            placeholder="London"
          />

          <Text style={styles.label}>Postcode *</Text>
          <TextInput
            style={styles.input}
            value={formData.cPostCode}
            onChangeText={(text) => updateField('cPostCode', text.toUpperCase())}
            placeholder="SW1A 1AA"
            autoCapitalize="characters"
          />
        </View>

        {/* Care Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Care Details</Text>

          <Text style={styles.label}>Care Level</Text>
          <View style={styles.careLevelContainer}>
            {[
              { value: 'low', label: '🟢 Low', color: '#d1fae5' },
              { value: 'medium', label: '🟡 Medium', color: '#fef3c7' },
              { value: 'high', label: '🟠 High', color: '#fed7aa' },
              { value: 'complex', label: '🔴 Complex', color: '#fee2e2' },
            ].map((level) => (
              <TouchableOpacity
                key={level.value}
                style={[
                  styles.careLevelButton,
                  formData.care_level === level.value && {
                    backgroundColor: level.color,
                    borderColor: level.color,
                  },
                ]}
                onPress={() => updateField('care_level', level.value)}
              >
                <Text
                  style={[
                    styles.careLevelText,
                    formData.care_level === level.value && styles.careLevelTextActive,
                  ]}
                >
                  {level.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Care Start Date</Text>
          <TextInput
            style={styles.input}
            value={formData.cSDate}
            onChangeText={(text) => updateField('cSDate', text)}
            placeholder="YYYY-MM-DD (e.g., 2024-01-15)"
          />

          <Text style={styles.label}>Care End Date (Optional)</Text>
          <TextInput
            style={styles.input}
            value={formData.cEDate}
            onChangeText={(text) => updateField('cEDate', text)}
            placeholder="YYYY-MM-DD (leave empty if ongoing)"
          />

          <Text style={styles.label}>Care Plan</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.cCarePlan}
            onChangeText={(text) => updateField('cCarePlan', text)}
            placeholder="Describe the care plan..."
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Medical Notes & Remarks</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.cRemarks}
            onChangeText={(text) => updateField('cRemarks', text)}
            placeholder="Any medical conditions, allergies, or special notes..."
            multiline
            numberOfLines={4}
          />
        </View>
      </FormScrollView>
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
    paddingTop: 10,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  cancelButton: {
    padding: 8,
  },
  cancelText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  saveButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
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
  careLevelContainer: {
    gap: 8,
    marginTop: 4,
  },
  careLevelButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: 'white',
  },
  careLevelText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  careLevelTextActive: {
    fontWeight: '600',
    color: '#1e293b',
  },
});

// src/screens/logs/CareLogListScreen.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { ScreenWrapper } from '../../components';
import { careLogApi, CareLog } from '../../services/api/careLogApi';
import { useFocusEffect } from '@react-navigation/native';

interface CareLogListScreenProps {
  navigation: any;
  route: any;
}

export default function CareLogListScreen({ navigation, route }: CareLogListScreenProps) {
  const [logs, setLogs] = useState<CareLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<CareLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadLogs();
    }, [])
  );

  const loadLogs = async () => {
    try {
      setLoading(true);
      const response = await careLogApi.getLogs();

      if (response.success && response.data) {
        setLogs(response.data.logs || []);
        setFilteredLogs(response.data.logs || []);
      } else {
        Alert.alert('Error', response.message || 'Failed to load care logs');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadLogs();
    setRefreshing(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredLogs(logs);
      return;
    }

    const lowercaseQuery = query.toLowerCase();
    const filtered = logs.filter(
      (log) =>
        log.client_name?.toLowerCase().includes(lowercaseQuery) ||
        log.staff_name?.toLowerCase().includes(lowercaseQuery) ||
        log.visit_date?.includes(query)
    );

    setFilteredLogs(filtered);
  };

  const getVisitTypeColor = (visitType: string) => {
    switch (visitType) {
      case 'routine':
        return '#3b82f6';
      case 'urgent':
        return '#ef4444';
      case 'follow_up':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getMoodEmoji = (mood: string) => {
    switch (mood?.toLowerCase()) {
      case 'happy':
        return '😊';
      case 'calm':
        return '😌';
      case 'anxious':
        return '😰';
      case 'sad':
        return '😢';
      case 'agitated':
        return '😠';
      default:
        return '😐';
    }
  };

  const renderLogItem = ({ item }: { item: CareLog }) => (
    <TouchableOpacity
      style={styles.logCard}
      onPress={() => navigation.navigate('CareLogDetail', { logId: item.log_id })}
    >
      <View style={styles.logHeader}>
        <View style={styles.logHeaderLeft}>
          <Text style={styles.clientName}>{item.client_name}</Text>
          <Text style={styles.staffName}>by {item.staff_name}</Text>
        </View>
        <View
          style={[
            styles.visitTypeBadge,
            { backgroundColor: getVisitTypeColor(item.visit_type || 'routine') },
          ]}
        >
          <Text style={styles.visitTypeText}>
            {item.visit_type?.replace('_', ' ').toUpperCase() || 'ROUTINE'}
          </Text>
        </View>
      </View>

      <View style={styles.logInfo}>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>📅</Text>
          <Text style={styles.infoText}>{item.visit_date}</Text>
          <Text style={styles.infoDivider}>•</Text>
          <Text style={styles.infoIcon}>🕐</Text>
          <Text style={styles.infoText}>{item.visit_time}</Text>
          {item.duration_minutes && item.duration_minutes > 0 && (
            <>
              <Text style={styles.infoDivider}>•</Text>
              <Text style={styles.infoText}>{item.duration_minutes} mins</Text>
            </>
          )}
        </View>

        {item.client_mood && (
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>{getMoodEmoji(item.client_mood)}</Text>
            <Text style={styles.infoText}>Mood: {item.client_mood}</Text>
          </View>
        )}

        {/* Activities performed */}
        <View style={styles.activitiesRow}>
          {item.personal_care === 1 && (
            <View style={styles.activityBadge}>
              <Text style={styles.activityText}>🛁 Personal Care</Text>
            </View>
          )}
          {item.medication === 1 && (
            <View style={styles.activityBadge}>
              <Text style={styles.activityText}>💊 Medication</Text>
            </View>
          )}
          {item.meal_preparation === 1 && (
            <View style={styles.activityBadge}>
              <Text style={styles.activityText}>🍽️ Meals</Text>
            </View>
          )}
          {item.housekeeping === 1 && (
            <View style={styles.activityBadge}>
              <Text style={styles.activityText}>🧹 Housekeeping</Text>
            </View>
          )}
          {item.companionship === 1 && (
            <View style={styles.activityBadge}>
              <Text style={styles.activityText}>💬 Companionship</Text>
            </View>
          )}
        </View>

        {item.follow_up_required === 1 && (
          <View style={styles.followUpBadge}>
            <Text style={styles.followUpText}>⚠️ Follow-up Required</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>📋</Text>
      <Text style={styles.emptyStateTitle}>No Care Logs Yet</Text>
      <Text style={styles.emptyStateText}>
        {searchQuery
          ? 'No logs match your search'
          : 'Start by adding your first care log'}
      </Text>
      {!searchQuery && (
        <TouchableOpacity
          style={styles.emptyStateButton}
          onPress={() => navigation.navigate('AddCareLog')}
        >
          <Text style={styles.emptyStateButtonText}>+ Add Care Log</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Care Logs</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading care logs...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Care Logs</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddCareLog')}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by client, staff, or date..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Text style={styles.clearButton}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Stats Summary */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{filteredLogs.length}</Text>
          <Text style={styles.statLabel}>Total Logs</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>
            {filteredLogs.filter((log) => log.visit_date === new Date().toISOString().split('T')[0]).length}
          </Text>
          <Text style={styles.statLabel}>Today</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>
            {filteredLogs.filter((log) => log.follow_up_required === 1).length}
          </Text>
          <Text style={styles.statLabel}>Follow-ups</Text>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={filteredLogs}
        renderItem={renderLogItem}
        keyExtractor={(item) => item.log_id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#2563eb']}
          />
        }
      />
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
    paddingTop: 10,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  headerSpacer: {
    width: 60,
  },
  addButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1e293b',
  },
  clearButton: {
    fontSize: 18,
    color: '#64748b',
    padding: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
  },
  logCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  logHeaderLeft: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  staffName: {
    fontSize: 14,
    color: '#64748b',
  },
  visitTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  visitTypeText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  logInfo: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#475569',
  },
  infoDivider: {
    marginHorizontal: 8,
    color: '#cbd5e1',
  },
  activitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  activityBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activityText: {
    fontSize: 12,
    color: '#475569',
  },
  followUpBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 4,
  },
  followUpText: {
    fontSize: 13,
    color: '#92400e',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

// src/screens/logs/AddCareLogScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
  ScrollView,
} from 'react-native';
import { ScreenWrapper, FormScrollView } from '../../components';
import { careLogApi } from '../../services/api/careLogApi';
import { clientApi } from '../../services/api/clientApi';
import { staffApi } from '../../services/api/staffApi';

interface AddCareLogScreenProps {
  navigation: any;
}

export default function AddCareLogScreen({ navigation }: AddCareLogScreenProps) {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    client_id: '',
    staff_id: '',
    visit_date: new Date().toISOString().split('T')[0],
    visit_time: new Date().toTimeString().split(' ')[0].substring(0, 5),
    duration_minutes: '60',
    visit_type: 'routine',
    personal_care: false,
    medication: false,
    meal_preparation: false,
    housekeeping: false,
    companionship: false,
    temperature: '',
    blood_pressure: '',
    heart_rate: '',
    activities_performed: '',
    client_mood: 'calm',
    notes: '',
    concerns: '',
    follow_up_required: false,
    follow_up_notes: '',
    status: 'completed',
  });

  useEffect(() => {
    loadClientsAndStaff();
  }, []);

  const loadClientsAndStaff = async () => {
    try {
      setLoadingData(true);
      
      const [clientsResponse, staffResponse] = await Promise.all([
        clientApi.getClients(),
        staffApi.getStaff(),
      ]);

      if (clientsResponse.success) {
        setClients(clientsResponse.data?.clients || []);
      }

      if (staffResponse.success) {
        setStaff(staffResponse.data?.staff || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    if (!formData.client_id || !formData.staff_id) {
      Alert.alert('Validation Error', 'Please select a client and staff member');
      return;
    }

    if (!formData.visit_date || !formData.visit_time) {
      Alert.alert('Validation Error', 'Visit date and time are required');
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        client_id: parseInt(formData.client_id),
        staff_id: parseInt(formData.staff_id),
        duration_minutes: parseInt(formData.duration_minutes) || 0,
      };

      const response = await careLogApi.createLog(submitData);

      if (response.success) {
        Alert.alert('Success', 'Care log added successfully!', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert('Error', response.message || 'Failed to add care log');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading...</Text>
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
        <Text style={styles.headerTitle}>Add Care Log</Text>
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

      <FormScrollView>
        {/* Visit Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visit Details</Text>

          <Text style={styles.label}>Client *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {clients.map((client) => (
              <TouchableOpacity
                key={client.cNo}
                style={[
                  styles.chip,
                  formData.client_id === client.cNo.toString() && styles.chipActive,
                ]}
                onPress={() => updateField('client_id', client.cNo.toString())}
              >
                <Text
                  style={[
                    styles.chipText,
                    formData.client_id === client.cNo.toString() && styles.chipTextActive,
                  ]}
                >
                  {client.cFName} {client.cLName}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.label}>Staff Member *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {staff.map((member) => (
              <TouchableOpacity
                key={member.id}
                style={[
                  styles.chip,
                  formData.staff_id === member.id.toString() && styles.chipActive,
                ]}
                onPress={() => updateField('staff_id', member.id.toString())}
              >
                <Text
                  style={[
                    styles.chipText,
                    formData.staff_id === member.id.toString() && styles.chipTextActive,
                  ]}
                >
                  {member.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.label}>Visit Date *</Text>
          <TextInput
            style={styles.input}
            value={formData.visit_date}
            onChangeText={(text) => updateField('visit_date', text)}
            placeholder="YYYY-MM-DD"
          />

          <Text style={styles.label}>Visit Time *</Text>
          <TextInput
            style={styles.input}
            value={formData.visit_time}
            onChangeText={(text) => updateField('visit_time', text)}
            placeholder="HH:MM (e.g., 14:30)"
          />

          <Text style={styles.label}>Duration (minutes)</Text>
          <TextInput
            style={styles.input}
            value={formData.duration_minutes}
            onChangeText={(text) => updateField('duration_minutes', text)}
            placeholder="60"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Visit Type</Text>
          <View style={styles.radioGroup}>
            {[
              { value: 'routine', label: 'Routine' },
              { value: 'urgent', label: 'Urgent' },
              { value: 'follow_up', label: 'Follow-up' },
            ].map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.radioButton,
                  formData.visit_type === type.value && styles.radioButtonActive,
                ]}
                onPress={() => updateField('visit_type', type.value)}
              >
                <Text
                  style={[
                    styles.radioText,
                    formData.visit_type === type.value && styles.radioTextActive,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Activities Performed */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activities Performed</Text>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>🛁 Personal Care</Text>
            <Switch
              value={formData.personal_care}
              onValueChange={(value) => updateField('personal_care', value)}
              trackColor={{ false: '#e2e8f0', true: '#93c5fd' }}
              thumbColor={formData.personal_care ? '#2563eb' : '#f4f4f5'}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>💊 Medication</Text>
            <Switch
              value={formData.medication}
              onValueChange={(value) => updateField('medication', value)}
              trackColor={{ false: '#e2e8f0', true: '#93c5fd' }}
              thumbColor={formData.medication ? '#2563eb' : '#f4f4f5'}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>🍽 Meal Preparation</Text>
            <Switch
              value={formData.meal_preparation}
              onValueChange={(value) => updateField('meal_preparation', value)}
              trackColor={{ false: '#e2e8f0', true: '#93c5fd' }}
              thumbColor={formData.meal_preparation ? '#2563eb' : '#f4f4f5'}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>🧹 Housekeeping</Text>
            <Switch
              value={formData.housekeeping}
              onValueChange={(value) => updateField('housekeeping', value)}
              trackColor={{ false: '#e2e8f0', true: '#93c5fd' }}
              thumbColor={formData.housekeeping ? '#2563eb' : '#f4f4f5'}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>💬 Companionship</Text>
            <Switch
              value={formData.companionship}
              onValueChange={(value) => updateField('companionship', value)}
              trackColor={{ false: '#e2e8f0', true: '#93c5fd' }}
              thumbColor={formData.companionship ? '#2563eb' : '#f4f4f5'}
            />
          </View>

          <Text style={styles.label}>Activities Details</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.activities_performed}
            onChangeText={(text) => updateField('activities_performed', text)}
            placeholder="Describe activities performed in detail..."
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Vital Signs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vital Signs (Optional)</Text>

          <Text style={styles.label}>Temperature (°C)</Text>
          <TextInput
            style={styles.input}
            value={formData.temperature}
            onChangeText={(text) => updateField('temperature', text)}
            placeholder="36.5"
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>Blood Pressure</Text>
          <TextInput
            style={styles.input}
            value={formData.blood_pressure}
            onChangeText={(text) => updateField('blood_pressure', text)}
            placeholder="120/80"
          />

          <Text style={styles.label}>Heart Rate (bpm)</Text>
          <TextInput
            style={styles.input}
            value={formData.heart_rate}
            onChangeText={(text) => updateField('heart_rate', text)}
            placeholder="72"
            keyboardType="numeric"
          />
        </View>

        {/* Client Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client Status</Text>

          <Text style={styles.label}>Client Mood</Text>
          <View style={styles.radioGroup}>
            {[
              { value: 'happy', label: '😊 Happy' },
              { value: 'calm', label: '😌 Calm' },
              { value: 'anxious', label: '😰 Anxious' },
              { value: 'sad', label: '😢 Sad' },
              { value: 'agitated', label: '😠 Agitated' },
            ].map((mood) => (
              <TouchableOpacity
                key={mood.value}
                style={[
                  styles.radioButton,
                  formData.client_mood === mood.value && styles.radioButtonActive,
                ]}
                onPress={() => updateField('client_mood', mood.value)}
              >
                <Text
                  style={[
                    styles.radioText,
                    formData.client_mood === mood.value && styles.radioTextActive,
                  ]}
                >
                  {mood.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>General Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.notes}
            onChangeText={(text) => updateField('notes', text)}
            placeholder="Any observations or notes about the visit..."
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Concerns</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.concerns}
            onChangeText={(text) => updateField('concerns', text)}
            placeholder="Any concerns or issues noted..."
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Follow-up */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Follow-up</Text>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>⚠ Follow-up Required</Text>
            <Switch
              value={formData.follow_up_required}
              onValueChange={(value) => updateField('follow_up_required', value)}
              trackColor={{ false: '#e2e8f0', true: '#fbbf24' }}
              thumbColor={formData.follow_up_required ? '#f59e0b' : '#f4f4f5'}
            />
          </View>

          {formData.follow_up_required && (
            <>
              <Text style={styles.label}>Follow-up Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.follow_up_notes}
                onChangeText={(text) => updateField('follow_up_notes', text)}
                placeholder="What follow-up is required?"
                multiline
                numberOfLines={3}
              />
            </>
          )}
        </View>
      </FormScrollView>
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
    paddingTop: 10,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  cancelButton: {
    padding: 8,
  },
  cancelText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  saveButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
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
  chipScroll: {
    marginTop: 4,
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: 'white',
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  chipText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  chipTextActive: {
    color: 'white',
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  switchLabel: {
    fontSize: 15,
    color: '#1e293b',
    fontWeight: '500',
  },
});

// src/screens/logs/CareLogDetailScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { ScreenWrapper } from '../../components';
import { careLogApi, CareLog } from '../../services/api/careLogApi';

interface CareLogDetailScreenProps {
  route: any;
  navigation: any;
}

export default function CareLogDetailScreen({ route, navigation }: CareLogDetailScreenProps) {
  const { logId } = route.params;
  const [log, setLog] = useState<CareLog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogDetails();
  }, []);

  const loadLogDetails = async () => {
    try {
      setLoading(true);
      const response = await careLogApi.getLog(logId);

      if (response.success && response.data) {
        setLog(response.data.log);
      } else {
        Alert.alert('Error', response.message || 'Failed to load log details');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Care Log',
      'Are you sure you want to delete this care log? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await careLogApi.deleteLog(logId);

              if (response.success) {
                Alert.alert('Success', 'Care log deleted successfully', [
                  {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                  },
                ]);
              } else {
                Alert.alert('Error', response.message || 'Failed to delete log');
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Something went wrong');
            }
          },
        },
      ]
    );
  };

  const getMoodEmoji = (mood: string) => {
    switch (mood?.toLowerCase()) {
      case 'happy':
        return '😊';
      case 'calm':
        return '😌';
      case 'anxious':
        return '😰';
      case 'sad':
        return '😢';
      case 'agitated':
        return '😠';
      default:
        return '😐';
    }
  };

  const getVisitTypeColor = (visitType: string) => {
    switch (visitType) {
      case 'routine':
        return '#3b82f6';
      case 'urgent':
        return '#ef4444';
      case 'follow_up':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading log details...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (!log) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Care log not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBackButton} onPress={() => navigation.goBack()}>
          <Text style={styles.headerBackText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Care Log Details</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditCareLog', { logId: log.log_id })}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Client & Staff Info */}
        <View style={styles.headerCard}>
          <View style={styles.headerCardTop}>
            <View>
              <Text style={styles.clientNameLarge}>{log.client_name}</Text>
              <Text style={styles.staffNameLarge}>Care by {log.staff_name}</Text>
            </View>
            <View
              style={[
                styles.visitTypeBadgeLarge,
                { backgroundColor: getVisitTypeColor(log.visit_type || 'routine') },
              ]}
            >
              <Text style={styles.visitTypeTextLarge}>
                {log.visit_type?.replace('_', ' ').toUpperCase() || 'ROUTINE'}
              </Text>
            </View>
          </View>

          <View style={styles.dateTimeRow}>
            <View style={styles.dateTimeItem}>
              <Text style={styles.dateTimeLabel}>📅 Date</Text>
              <Text style={styles.dateTimeValue}>{log.visit_date}</Text>
            </View>
            <View style={styles.dateTimeItem}>
              <Text style={styles.dateTimeLabel}>🕐 Time</Text>
              <Text style={styles.dateTimeValue}>{log.visit_time}</Text>
            </View>
            <View style={styles.dateTimeItem}>
              <Text style={styles.dateTimeLabel}>⏱️ Duration</Text>
              <Text style={styles.dateTimeValue}>{log.duration_minutes || 0} mins</Text>
            </View>
          </View>
        </View>

        {/* Activities Performed */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activities Performed</Text>

          <View style={styles.activitiesGrid}>
            {log.personal_care === 1 && (
              <View style={styles.activityCard}>
                <Text style={styles.activityIcon}>🛁</Text>
                <Text style={styles.activityLabel}>Personal Care</Text>
              </View>
            )}
            {log.medication === 1 && (
              <View style={styles.activityCard}>
                <Text style={styles.activityIcon}>💊</Text>
                <Text style={styles.activityLabel}>Medication</Text>
              </View>
            )}
            {log.meal_preparation === 1 && (
              <View style={styles.activityCard}>
                <Text style={styles.activityIcon}>🍽️</Text>
                <Text style={styles.activityLabel}>Meal Prep</Text>
              </View>
            )}
            {log.housekeeping === 1 && (
              <View style={styles.activityCard}>
                <Text style={styles.activityIcon}>🧹</Text>
                <Text style={styles.activityLabel}>Housekeeping</Text>
              </View>
            )}
            {log.companionship === 1 && (
              <View style={styles.activityCard}>
                <Text style={styles.activityIcon}>💬</Text>
                <Text style={styles.activityLabel}>Companionship</Text>
              </View>
            )}
          </View>

          {log.activities_performed && (
            <View style={styles.detailBox}>
              <Text style={styles.detailText}>{log.activities_performed}</Text>
            </View>
          )}
        </View>

        {/* Vital Signs */}
        {(log.temperature || log.blood_pressure || log.heart_rate) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vital Signs</Text>

            <View style={styles.vitalsGrid}>
              {log.temperature && (
                <View style={styles.vitalCard}>
                  <Text style={styles.vitalIcon}>🌡️</Text>
                  <Text style={styles.vitalLabel}>Temperature</Text>
                  <Text style={styles.vitalValue}>{log.temperature}°C</Text>
                </View>
              )}
              {log.blood_pressure && (
                <View style={styles.vitalCard}>
                  <Text style={styles.vitalIcon}>💉</Text>
                  <Text style={styles.vitalLabel}>Blood Pressure</Text>
                  <Text style={styles.vitalValue}>{log.blood_pressure}</Text>
                </View>
              )}
              {log.heart_rate && (
                <View style={styles.vitalCard}>
                  <Text style={styles.vitalIcon}>❤️</Text>
                  <Text style={styles.vitalLabel}>Heart Rate</Text>
                  <Text style={styles.vitalValue}>{log.heart_rate} bpm</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Client Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client Status</Text>

          {log.client_mood && (
            <View style={styles.moodCard}>
              <Text style={styles.moodEmoji}>{getMoodEmoji(log.client_mood)}</Text>
              <View style={styles.moodInfo}>
                <Text style={styles.moodLabel}>Mood</Text>
                <Text style={styles.moodValue}>{log.client_mood}</Text>
              </View>
            </View>
          )}

          {log.notes && (
            <>
              <Text style={styles.subsectionTitle}>General Notes</Text>
              <View style={styles.detailBox}>
                <Text style={styles.detailText}>{log.notes}</Text>
              </View>
            </>
          )}

          {log.concerns && (
            <>
              <Text style={styles.subsectionTitle}>Concerns</Text>
              <View style={[styles.detailBox, styles.concernsBox]}>
                <Text style={styles.detailText}>{log.concerns}</Text>
              </View>
            </>
          )}
        </View>

        {/* Follow-up */}
        {log.follow_up_required === 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚠️ Follow-up Required</Text>

            {log.follow_up_notes && (
              <View style={[styles.detailBox, styles.followUpBox]}>
                <Text style={styles.detailText}>{log.follow_up_notes}</Text>
              </View>
            )}
          </View>
        )}

        {/* Delete Button */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>🗑️ Delete Care Log</Text>
          </TouchableOpacity>
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
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginBottom: 20,
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 10,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerBackButton: {
    padding: 8,
  },
  headerBackText: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  editButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  headerCard: {
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
  headerCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  clientNameLarge: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  staffNameLarge: {
    fontSize: 14,
    color: '#64748b',
  },
  visitTypeBadgeLarge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  visitTypeTextLarge: {
    fontSize: 11,
    color: 'white',
    fontWeight: 'bold',
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateTimeItem: {
    flex: 1,
  },
  dateTimeLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  dateTimeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
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
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginTop: 16,
    marginBottom: 8,
  },
  activitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  activityCard: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 100,
  },
  activityIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  activityLabel: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  vitalCard: {
    flex: 1,
    minWidth: 100,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  vitalIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  vitalLabel: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 4,
  },
  vitalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  moodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  moodEmoji: {
    fontSize: 48,
    marginRight: 16,
  },
  moodInfo: {
    flex: 1,
  },
  moodLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  moodValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    textTransform: 'capitalize',
  },
  detailBox: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  concernsBox: {
    backgroundColor: '#fef3c7',
  },
  followUpBox: {
    backgroundColor: '#fed7aa',
  },
  detailText: {
    fontSize: 14,
    color: '#1e293b',
    lineHeight: 20,
  },
  backButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  backButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

// src/screens/logs/EditCareLogScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { ScreenWrapper, FormScrollView } from '../../components';
import { careLogApi } from '../../services/api/careLogApi';

interface EditCareLogScreenProps {
  navigation: any;
  route: any;
}

export default function EditCareLogScreen({ navigation, route }: EditCareLogScreenProps) {
  const { logId } = route.params;
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [formData, setFormData] = useState({
    visit_date: '',
    visit_time: '',
    duration_minutes: '',
    visit_type: 'routine',
    personal_care: false,
    medication: false,
    meal_preparation: false,
    housekeeping: false,
    companionship: false,
    temperature: '',
    blood_pressure: '',
    heart_rate: '',
    activities_performed: '',
    client_mood: 'calm',
    notes: '',
    concerns: '',
    follow_up_required: false,
    follow_up_notes: '',
    status: 'completed',
  });

  useEffect(() => {
    loadLogData();
  }, []);

  const loadLogData = async () => {
    try {
      setInitialLoading(true);
      const response = await careLogApi.getLog(logId);

      if (response.success && response.data) {
        const log = response.data.log;
        setFormData({
          visit_date: log.visit_date || '',
          visit_time: log.visit_time || '',
          duration_minutes: log.duration_minutes?.toString() || '',
          visit_type: log.visit_type || 'routine',
          personal_care: log.personal_care === 1,
          medication: log.medication === 1,
          meal_preparation: log.meal_preparation === 1,
          housekeeping: log.housekeeping === 1,
          companionship: log.companionship === 1,
          temperature: log.temperature || '',
          blood_pressure: log.blood_pressure || '',
          heart_rate: log.heart_rate || '',
          activities_performed: log.activities_performed || '',
          client_mood: log.client_mood || 'calm',
          notes: log.notes || '',
          concerns: log.concerns || '',
          follow_up_required: log.follow_up_required === 1,
          follow_up_notes: log.follow_up_notes || '',
          status: log.status || 'completed',
        });
      } else {
        Alert.alert('Error', response.message || 'Failed to load log data');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setInitialLoading(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    if (!formData.visit_date || !formData.visit_time) {
      Alert.alert('Validation Error', 'Visit date and time are required');
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        duration_minutes: parseInt(formData.duration_minutes) || 0,
      };

      const response = await careLogApi.updateLog(logId, submitData);

      if (response.success) {
        Alert.alert('Success', 'Care log updated successfully!', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert('Error', response.message || 'Failed to update care log');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Care Log</Text>
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

      <FormScrollView>
        {/* Visit Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visit Details</Text>

          <Text style={styles.label}>Visit Date *</Text>
          <TextInput
            style={styles.input}
            value={formData.visit_date}
            onChangeText={(text) => updateField('visit_date', text)}
            placeholder="YYYY-MM-DD"
          />

          <Text style={styles.label}>Visit Time *</Text>
          <TextInput
            style={styles.input}
            value={formData.visit_time}
            onChangeText={(text) => updateField('visit_time', text)}
            placeholder="HH:MM"
          />

          <Text style={styles.label}>Duration (minutes)</Text>
          <TextInput
            style={styles.input}
            value={formData.duration_minutes}
            onChangeText={(text) => updateField('duration_minutes', text)}
            placeholder="60"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Visit Type</Text>
          <View style={styles.radioGroup}>
            {[
              { value: 'routine', label: 'Routine' },
              { value: 'urgent', label: 'Urgent' },
              { value: 'follow_up', label: 'Follow-up' },
            ].map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.radioButton,
                  formData.visit_type === type.value && styles.radioButtonActive,
                ]}
                onPress={() => updateField('visit_type', type.value)}
              >
                <Text
                  style={[
                    styles.radioText,
                    formData.visit_type === type.value && styles.radioTextActive,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Activities Performed */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activities Performed</Text>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>🛁 Personal Care</Text>
            <Switch
              value={formData.personal_care}
              onValueChange={(value) => updateField('personal_care', value)}
              trackColor={{ false: '#e2e8f0', true: '#93c5fd' }}
              thumbColor={formData.personal_care ? '#2563eb' : '#f4f4f5'}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>💊 Medication</Text>
            <Switch
              value={formData.medication}
              onValueChange={(value) => updateField('medication', value)}
              trackColor={{ false: '#e2e8f0', true: '#93c5fd' }}
              thumbColor={formData.medication ? '#2563eb' : '#f4f4f5'}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>🍽️ Meal Preparation</Text>
            <Switch
              value={formData.meal_preparation}
              onValueChange={(value) => updateField('meal_preparation', value)}
              trackColor={{ false: '#e2e8f0', true: '#93c5fd' }}
              thumbColor={formData.meal_preparation ? '#2563eb' : '#f4f4f5'}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>🧹 Housekeeping</Text>
            <Switch
              value={formData.housekeeping}
              onValueChange={(value) => updateField('housekeeping', value)}
              trackColor={{ false: '#e2e8f0', true: '#93c5fd' }}
              thumbColor={formData.housekeeping ? '#2563eb' : '#f4f4f5'}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>💬 Companionship</Text>
            <Switch
              value={formData.companionship}
              onValueChange={(value) => updateField('companionship', value)}
              trackColor={{ false: '#e2e8f0', true: '#93c5fd' }}
              thumbColor={formData.companionship ? '#2563eb' : '#f4f4f5'}
            />
          </View>

          <Text style={styles.label}>Activities Details</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.activities_performed}
            onChangeText={(text) => updateField('activities_performed', text)}
            placeholder="Describe activities performed in detail..."
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Vital Signs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vital Signs</Text>

          <Text style={styles.label}>Temperature (°C)</Text>
          <TextInput
            style={styles.input}
            value={formData.temperature}
            onChangeText={(text) => updateField('temperature', text)}
            placeholder="36.5"
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>Blood Pressure</Text>
          <TextInput
            style={styles.input}
            value={formData.blood_pressure}
            onChangeText={(text) => updateField('blood_pressure', text)}
            placeholder="120/80"
          />

          <Text style={styles.label}>Heart Rate (bpm)</Text>
          <TextInput
            style={styles.input}
            value={formData.heart_rate}
            onChangeText={(text) => updateField('heart_rate', text)}
            placeholder="72"
            keyboardType="numeric"
          />
        </View>

        {/* Client Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client Status</Text>

          <Text style={styles.label}>Client Mood</Text>
          <View style={styles.radioGroup}>
            {[
              { value: 'happy', label: '😊 Happy' },
              { value: 'calm', label: '😌 Calm' },
              { value: 'anxious', label: '😰 Anxious' },
              { value: 'sad', label: '😢 Sad' },
              { value: 'agitated', label: '😠 Agitated' },
            ].map((mood) => (
              <TouchableOpacity
                key={mood.value}
                style={[
                  styles.radioButton,
                  formData.client_mood === mood.value && styles.radioButtonActive,
                ]}
                onPress={() => updateField('client_mood', mood.value)}
              >
                <Text
                  style={[
                    styles.radioText,
                    formData.client_mood === mood.value && styles.radioTextActive,
                  ]}
                >
                  {mood.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>General Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.notes}
            onChangeText={(text) => updateField('notes', text)}
            placeholder="Any observations or notes..."
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Concerns</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.concerns}
            onChangeText={(text) => updateField('concerns', text)}
            placeholder="Any concerns or issues..."
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Follow-up */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Follow-up</Text>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>⚠️ Follow-up Required</Text>
            <Switch
              value={formData.follow_up_required}
              onValueChange={(value) => updateField('follow_up_required', value)}
              trackColor={{ false: '#e2e8f0', true: '#fbbf24' }}
              thumbColor={formData.follow_up_required ? '#f59e0b' : '#f4f4f5'}
            />
          </View>

          {formData.follow_up_required && (
            <>
              <Text style={styles.label}>Follow-up Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.follow_up_notes}
                onChangeText={(text) => updateField('follow_up_notes', text)}
                placeholder="What follow-up is required?"
                multiline
                numberOfLines={3}
              />
            </>
          )}
        </View>
      </FormScrollView>
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
    paddingTop: 10,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  cancelButton: {
    padding: 8,
  },
  cancelText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  saveButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  switchLabel: {
    fontSize: 15,
    color: '#1e293b',
    fontWeight: '500',
  },
});


// src/screens/visits/EditVisitScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { ScreenWrapper, FormScrollView } from '../../components';
import { visitApi } from '../../services/api/visitApi';

interface EditVisitScreenProps {
  navigation: any;
  route: any;
}

export default function EditVisitScreen({ navigation, route }: EditVisitScreenProps) {
  const { visitId } = route.params;
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [formData, setFormData] = useState({
    visit_date: '',
    visit_time: '',
    estimated_duration: '',
    visit_type: 'routine',
    service_type: '',
    special_instructions: '',
    priority: 'normal',
    status: 'scheduled',
    notes: '',
    cancellation_reason: '',
  });

  useEffect(() => {
    loadVisitData();
  }, []);

  const loadVisitData = async () => {
    try {
      setInitialLoading(true);
      const response = await visitApi.getVisit(visitId);

      if (response.success && response.data) {
        const visit = response.data.visit;
        setFormData({
          visit_date: visit.visit_date || '',
          visit_time: visit.visit_time || '',
          estimated_duration: visit.estimated_duration?.toString() || '',
          visit_type: visit.visit_type || 'routine',
          service_type: visit.service_type || '',
          special_instructions: visit.special_instructions || '',
          priority: visit.priority || 'normal',
          status: visit.status || 'scheduled',
          notes: visit.notes || '',
          cancellation_reason: visit.cancellation_reason || '',
        });
      } else {
        Alert.alert('Error', response.message || 'Failed to load visit data');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setInitialLoading(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    if (!formData.visit_date || !formData.visit_time) {
      Alert.alert('Validation Error', 'Visit date and time are required');
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        estimated_duration: parseInt(formData.estimated_duration) || 60,
      };

      const response = await visitApi.updateVisit(visitId, submitData);

      if (response.success) {
        Alert.alert('Success', 'Visit updated successfully!', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert('Error', response.message || 'Failed to update visit');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Visit</Text>
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

      <FormScrollView>
        {/* Visit Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visit Details</Text>

          <Text style={styles.label}>Visit Date *</Text>
          <TextInput
            style={styles.input}
            value={formData.visit_date}
            onChangeText={(text) => updateField('visit_date', text)}
            placeholder="YYYY-MM-DD"
          />

          <Text style={styles.label}>Visit Time *</Text>
          <TextInput
            style={styles.input}
            value={formData.visit_time}
            onChangeText={(text) => updateField('visit_time', text)}
            placeholder="HH:MM"
          />

          <Text style={styles.label}>Estimated Duration (minutes)</Text>
          <TextInput
            style={styles.input}
            value={formData.estimated_duration}
            onChangeText={(text) => updateField('estimated_duration', text)}
            placeholder="60"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Visit Type</Text>
          <View style={styles.radioGroup}>
            {[
              { value: 'routine', label: 'Routine' },
              { value: 'urgent', label: 'Urgent' },
              { value: 'follow_up', label: 'Follow-up' },
              { value: 'assessment', label: 'Assessment' },
            ].map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.radioButton,
                  formData.visit_type === type.value && styles.radioButtonActive,
                ]}
                onPress={() => updateField('visit_type', type.value)}
              >
                <Text
                  style={[
                    styles.radioText,
                    formData.visit_type === type.value && styles.radioTextActive,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Priority</Text>
          <View style={styles.radioGroup}>
            {[
              { value: 'low', label: 'Low' },
              { value: 'normal', label: 'Normal' },
              { value: 'high', label: 'High' },
              { value: 'urgent', label: 'Urgent' },
            ].map((priority) => (
              <TouchableOpacity
                key={priority.value}
                style={[
                  styles.radioButton,
                  formData.priority === priority.value && styles.radioButtonActive,
                ]}
                onPress={() => updateField('priority', priority.value)}
              >
                <Text
                  style={[
                    styles.radioText,
                    formData.priority === priority.value && styles.radioTextActive,
                  ]}
                >
                  {priority.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Status</Text>
          <View style={styles.radioGroup}>
            {[
              { value: 'scheduled', label: 'Scheduled' },
              { value: 'confirmed', label: 'Confirmed' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' },
              { value: 'missed', label: 'Missed' },
            ].map((status) => (
              <TouchableOpacity
                key={status.value}
                style={[
                  styles.radioButton,
                  formData.status === status.value && styles.radioButtonActive,
                ]}
                onPress={() => updateField('status', status.value)}
              >
                <Text
                  style={[
                    styles.radioText,
                    formData.status === status.value && styles.radioTextActive,
                  ]}
                >
                  {status.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Service Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Details</Text>

          <Text style={styles.label}>Service Type</Text>
          <TextInput
            style={styles.input}
            value={formData.service_type}
            onChangeText={(text) => updateField('service_type', text)}
            placeholder="e.g., Personal Care, Medication Administration"
          />

          <Text style={styles.label}>Special Instructions</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.special_instructions}
            onChangeText={(text) => updateField('special_instructions', text)}
            placeholder="Any special instructions for this visit..."
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.notes}
            onChangeText={(text) => updateField('notes', text)}
            placeholder="Additional notes..."
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Cancellation */}
        {(formData.status === 'cancelled' || formData.status === 'missed') && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cancellation/Miss Reason</Text>

            <Text style={styles.label}>Reason</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.cancellation_reason}
              onChangeText={(text) => updateField('cancellation_reason', text)}
              placeholder="Why was this visit cancelled or missed?"
              multiline
              numberOfLines={3}
            />
          </View>
        )}
      </FormScrollView>
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
    paddingTop: 10,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  cancelButton: {
    padding: 8,
  },
  cancelText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  saveButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
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
});

// src/screens/visits/ScheduleVisitScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { ScreenWrapper, FormScrollView } from '../../components';
import { visitApi } from '../../services/api/visitApi';
import { clientApi } from '../../services/api/clientApi';
import { staffApi } from '../../services/api/staffApi';

interface ScheduleVisitScreenProps {
  navigation: any;
}

export default function ScheduleVisitScreen({ navigation }: ScheduleVisitScreenProps) {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    client_id: '',
    staff_id: '',
    visit_date: new Date().toISOString().split('T')[0],
    visit_time: '09:00',
    estimated_duration: '60',
    visit_type: 'routine',
    service_type: '',
    special_instructions: '',
    priority: 'normal',
    status: 'scheduled',
    is_recurring: false,
    recurrence_pattern: '',
    recurrence_end_date: '',
    notes: '',
  });

  useEffect(() => {
    loadClientsAndStaff();
  }, []);

  const loadClientsAndStaff = async () => {
    try {
      setLoadingData(true);
      
      const [clientsResponse, staffResponse] = await Promise.all([
        clientApi.getClients(),
        staffApi.getStaff(),
      ]);

      if (clientsResponse.success) {
        setClients(clientsResponse.data?.clients || []);
      }

      if (staffResponse.success) {
        setStaff(staffResponse.data?.staff || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    if (!formData.client_id || !formData.staff_id) {
      Alert.alert('Validation Error', 'Please select a client and staff member');
      return;
    }

    if (!formData.visit_date || !formData.visit_time) {
      Alert.alert('Validation Error', 'Visit date and time are required');
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        client_id: parseInt(formData.client_id),
        staff_id: parseInt(formData.staff_id),
        estimated_duration: parseInt(formData.estimated_duration) || 60,
      };

      const response = await visitApi.createVisit(submitData);

      if (response.success) {
        Alert.alert('Success', 'Visit scheduled successfully!', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert('Error', response.message || 'Failed to schedule visit');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading...</Text>
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
        <Text style={styles.headerTitle}>Schedule Visit</Text>
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

      <FormScrollView>
        {/* Visit Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visit Details</Text>

          <Text style={styles.label}>Client *</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => {
              const clientOptions = clients.map(client => ({
                text: `${client.cFName} ${client.cLName}`,
                onPress: () => updateField('client_id', client.cNo.toString())
              }));
              
              Alert.alert(
                'Select Client',
                'Choose a client from the list',
                [...clientOptions, { text: 'Cancel', style: 'cancel' }],
                { cancelable: true }
              );
            }}
          >
            <Text style={formData.client_id ? styles.selectButtonTextFilled : styles.selectButtonText}>
              {formData.client_id 
                ? (() => {
                    const selectedClient = clients.find(c => c.cNo.toString() === formData.client_id);
                    return selectedClient ? `${selectedClient.cFName} ${selectedClient.cLName}` : 'Select a client...';
                  })()
                : 'Select a client...'}
            </Text>
            <Text style={styles.selectButtonIcon}>▼</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Staff Member *</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => {
              const staffOptions = staff.map(member => ({
                text: member.name,
                onPress: () => updateField('staff_id', member.id.toString())
              }));
              
              Alert.alert(
                'Select Staff Member',
                'Choose a staff member from the list',
                [...staffOptions, { text: 'Cancel', style: 'cancel' }],
                { cancelable: true }
              );
            }}
          >
            <Text style={formData.staff_id ? styles.selectButtonTextFilled : styles.selectButtonText}>
              {formData.staff_id 
                ? staff.find(s => s.id.toString() === formData.staff_id)?.name || 'Select a staff member...'
                : 'Select a staff member...'}
            </Text>
            <Text style={styles.selectButtonIcon}>▼</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Visit Date *</Text>
          <TextInput
            style={styles.input}
            value={formData.visit_date}
            onChangeText={(text) => updateField('visit_date', text)}
            placeholder="YYYY-MM-DD"
          />

          <Text style={styles.label}>Visit Time *</Text>
          <TextInput
            style={styles.input}
            value={formData.visit_time}
            onChangeText={(text) => updateField('visit_time', text)}
            placeholder="HH:MM (e.g., 14:30)"
          />

          <Text style={styles.label}>Estimated Duration (minutes)</Text>
          <TextInput
            style={styles.input}
            value={formData.estimated_duration}
            onChangeText={(text) => updateField('estimated_duration', text)}
            placeholder="60"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Visit Type</Text>
          <View style={styles.radioGroup}>
            {[
              { value: 'routine', label: 'Routine' },
              { value: 'urgent', label: 'Urgent' },
              { value: 'follow_up', label: 'Follow-up' },
              { value: 'assessment', label: 'Assessment' },
            ].map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.radioButton,
                  formData.visit_type === type.value && styles.radioButtonActive,
                ]}
                onPress={() => updateField('visit_type', type.value)}
              >
                <Text
                  style={[
                    styles.radioText,
                    formData.visit_type === type.value && styles.radioTextActive,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Priority</Text>
          <View style={styles.radioGroup}>
            {[
              { value: 'low', label: 'Low' },
              { value: 'normal', label: 'Normal' },
              { value: 'high', label: 'High' },
              { value: 'urgent', label: 'Urgent' },
            ].map((priority) => (
              <TouchableOpacity
                key={priority.value}
                style={[
                  styles.radioButton,
                  formData.priority === priority.value && styles.radioButtonActive,
                ]}
                onPress={() => updateField('priority', priority.value)}
              >
                <Text
                  style={[
                    styles.radioText,
                    formData.priority === priority.value && styles.radioTextActive,
                  ]}
                >
                  {priority.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Service Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Details</Text>

          <Text style={styles.label}>Service Type</Text>
          <TextInput
            style={styles.input}
            value={formData.service_type}
            onChangeText={(text) => updateField('service_type', text)}
            placeholder="e.g., Personal Care, Medication Administration"
          />

          <Text style={styles.label}>Special Instructions</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.special_instructions}
            onChangeText={(text) => updateField('special_instructions', text)}
            placeholder="Any special instructions for this visit..."
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.notes}
            onChangeText={(text) => updateField('notes', text)}
            placeholder="Additional notes..."
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Recurring Visit */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recurring Visit</Text>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>🔄 Make this a recurring visit</Text>
            <Switch
              value={formData.is_recurring}
              onValueChange={(value) => updateField('is_recurring', value)}
              trackColor={{ false: '#e2e8f0', true: '#93c5fd' }}
              thumbColor={formData.is_recurring ? '#2563eb' : '#f4f4f5'}
            />
          </View>

          {formData.is_recurring && (
            <>
              <Text style={styles.label}>Recurrence Pattern</Text>
              <View style={styles.radioGroup}>
                {[
                  { value: 'daily', label: 'Daily' },
                  { value: 'weekly', label: 'Weekly' },
                  { value: 'monthly', label: 'Monthly' },
                ].map((pattern) => (
                  <TouchableOpacity
                    key={pattern.value}
                    style={[
                      styles.radioButton,
                      formData.recurrence_pattern === pattern.value && styles.radioButtonActive,
                    ]}
                    onPress={() => updateField('recurrence_pattern', pattern.value)}
                  >
                    <Text
                      style={[
                        styles.radioText,
                        formData.recurrence_pattern === pattern.value && styles.radioTextActive,
                      ]}
                    >
                      {pattern.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Recurrence End Date (Optional)</Text>
              <TextInput
                style={styles.input}
                value={formData.recurrence_end_date}
                onChangeText={(text) => updateField('recurrence_end_date', text)}
                placeholder="YYYY-MM-DD (leave empty for no end date)"
              />
            </>
          )}
        </View>
      </FormScrollView>
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
    paddingTop: 10,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  cancelButton: {
    padding: 8,
  },
  cancelText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  saveButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
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
  selectButton: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectButtonText: {
    fontSize: 15,
    color: '#94a3b8',
  },
  selectButtonTextFilled: {
    fontSize: 15,
    color: '#1e293b',
    fontWeight: '500',
  },
  selectButtonIcon: {
    fontSize: 12,
    color: '#64748b',
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  switchLabel: {
    fontSize: 15,
    color: '#1e293b',
    fontWeight: '500',
  },
});

// src/screens/visits/VisitDetailScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { ScreenWrapper } from '../../components';
import { visitApi, ScheduledVisit } from '../../services/api/visitApi';

interface VisitDetailScreenProps {
  route: any;
  navigation: any;
}

export default function VisitDetailScreen({ route, navigation }: VisitDetailScreenProps) {
  const { visitId } = route.params;
  const [visit, setVisit] = useState<ScheduledVisit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVisitDetails();
  }, []);

  const loadVisitDetails = async () => {
    try {
      setLoading(true);
      const response = await visitApi.getVisit(visitId);

      if (response.success && response.data) {
        setVisit(response.data.visit);
      } else {
        Alert.alert('Error', response.message || 'Failed to load visit details');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Visit',
      'Are you sure you want to delete this scheduled visit? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await visitApi.deleteVisit(visitId);

              if (response.success) {
                Alert.alert('Success', 'Visit deleted successfully', [
                  {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                  },
                ]);
              } else {
                Alert.alert('Error', response.message || 'Failed to delete visit');
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Something went wrong');
            }
          },
        },
      ]
    );
  };

  const handleStatusChange = (newStatus: string) => {
    Alert.alert(
      'Change Status',
      `Change visit status to "${newStatus}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              const response = await visitApi.updateVisit(visitId, {
                ...visit,
                status: newStatus,
              } as ScheduledVisit);

              if (response.success) {
                Alert.alert('Success', 'Status updated successfully');
                loadVisitDetails();
              } else {
                Alert.alert('Error', response.message || 'Failed to update status');
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Something went wrong');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return '#3b82f6';
      case 'confirmed':
        return '#10b981';
      case 'in_progress':
        return '#f59e0b';
      case 'completed':
        return '#6b7280';
      case 'cancelled':
        return '#ef4444';
      case 'missed':
        return '#dc2626';
      default:
        return '#6b7280';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '#dc2626';
      case 'high':
        return '#f59e0b';
      case 'normal':
        return '#3b82f6';
      case 'low':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading visit details...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (!visit) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Visit not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBackButton} onPress={() => navigation.goBack()}>
          <Text style={styles.headerBackText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Visit Details</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditVisit', { visitId: visit.visit_id })}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Client & Staff Info */}
        <View style={styles.headerCard}>
          <View style={styles.headerCardTop}>
            <View>
              <Text style={styles.clientNameLarge}>{visit.client_name}</Text>
              <Text style={styles.staffNameLarge}>with {visit.staff_name}</Text>
            </View>
            <View style={styles.badges}>
              <View
                style={[
                  styles.statusBadgeLarge,
                  { backgroundColor: getStatusColor(visit.status || 'scheduled') },
                ]}
              >
                <Text style={styles.statusTextLarge}>
                  {visit.status?.toUpperCase() || 'SCHEDULED'}
                </Text>
              </View>
              {visit.priority && visit.priority !== 'normal' && (
                <View
                  style={[
                    styles.priorityBadgeLarge,
                    { backgroundColor: getPriorityColor(visit.priority) },
                  ]}
                >
                  <Text style={styles.priorityTextLarge}>
                    {visit.priority.toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.dateTimeRow}>
            <View style={styles.dateTimeItem}>
              <Text style={styles.dateTimeLabel}>📅 Date</Text>
              <Text style={styles.dateTimeValue}>{visit.visit_date}</Text>
            </View>
            <View style={styles.dateTimeItem}>
              <Text style={styles.dateTimeLabel}>🕐 Time</Text>
              <Text style={styles.dateTimeValue}>{visit.visit_time}</Text>
            </View>
            <View style={styles.dateTimeItem}>
              <Text style={styles.dateTimeLabel}>⏱️ Duration</Text>
              <Text style={styles.dateTimeValue}>{visit.estimated_duration || 0} mins</Text>
            </View>
          </View>
        </View>

        {/* Visit Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visit Information</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Visit Type:</Text>
            <Text style={styles.infoValue}>{visit.visit_type?.replace('_', ' ')}</Text>
          </View>

          {visit.service_type && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Service Type:</Text>
              <Text style={styles.infoValue}>{visit.service_type}</Text>
            </View>
          )}

          {visit.is_recurring === 1 && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Recurring:</Text>
              <Text style={styles.infoValue}>
                {visit.recurrence_pattern} 
                {visit.recurrence_end_date && ` (until ${visit.recurrence_end_date})`}
              </Text>
            </View>
          )}
        </View>

        {/* Instructions & Notes */}
        {(visit.special_instructions || visit.notes) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions & Notes</Text>

            {visit.special_instructions && (
              <>
                <Text style={styles.subsectionTitle}>Special Instructions</Text>
                <View style={styles.detailBox}>
                  <Text style={styles.detailText}>{visit.special_instructions}</Text>
                </View>
              </>
            )}

            {visit.notes && (
              <>
                <Text style={styles.subsectionTitle}>Notes</Text>
                <View style={styles.detailBox}>
                  <Text style={styles.detailText}>{visit.notes}</Text>
                </View>
              </>
            )}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <View style={styles.actionButtons}>
            {visit.status === 'scheduled' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.confirmButton]}
                onPress={() => handleStatusChange('confirmed')}
              >
                <Text style={styles.actionButtonText}>✓ Confirm Visit</Text>
              </TouchableOpacity>
            )}

            {(visit.status === 'scheduled' || visit.status === 'confirmed') && (
              <TouchableOpacity
                style={[styles.actionButton, styles.startButton]}
                onPress={() => handleStatusChange('in_progress')}
              >
                <Text style={styles.actionButtonText}>▶ Start Visit</Text>
              </TouchableOpacity>
            )}

            {visit.status === 'in_progress' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.completeButton]}
                onPress={() => handleStatusChange('completed')}
              >
                <Text style={styles.actionButtonText}>✓ Complete Visit</Text>
              </TouchableOpacity>
            )}

            {(visit.status === 'scheduled' || visit.status === 'confirmed') && (
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => handleStatusChange('cancelled')}
              >
                <Text style={styles.actionButtonText}>✕ Cancel Visit</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Delete Button */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>🗑️ Delete Visit</Text>
          </TouchableOpacity>
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
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginBottom: 20,
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 10,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerBackButton: {
    padding: 8,
  },
  headerBackText: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  editButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  headerCard: {
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
  headerCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  clientNameLarge: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  staffNameLarge: {
    fontSize: 14,
    color: '#64748b',
  },
  badges: {
    alignItems: 'flex-end',
    gap: 4,
  },
  statusBadgeLarge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusTextLarge: {
    fontSize: 11,
    color: 'white',
    fontWeight: 'bold',
  },
  priorityBadgeLarge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  priorityTextLarge: {
    fontSize: 11,
    color: 'white',
    fontWeight: 'bold',
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateTimeItem: {
    flex: 1,
  },
  dateTimeLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  dateTimeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
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
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginTop: 16,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
    textTransform: 'capitalize',
  },
  detailBox: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#1e293b',
    lineHeight: 20,
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#10b981',
  },
  startButton: {
    backgroundColor: '#f59e0b',
  },
  completeButton: {
    backgroundColor: '#6b7280',
  },
  cancelButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  backButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});


// src/screens/visits/VisitExecutionScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { ScreenWrapper } from '../../components';
import { visitApi } from '../../services/api/visitApi';
import { careLogApi } from '../../services/api/careLogApi';


interface VisitExecutionScreenProps {
  navigation: any;
  route: any;
}

export default function VisitExecutionScreen({ navigation, route }: VisitExecutionScreenProps) {
  const { visitId } = route.params;
  interface VisitExecutionScreenProps {
  navigation: any;
  route: any;
  userData?: any;
}

// Inside component, get userData from navigation
const userData = navigation.getState().routes[0].params?.userData;
const staffId = userData?.staff?.staff_id || userData?.user?.id;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [visit, setVisit] = useState<any>(null);
  const [clockedIn, setClockedIn] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);

  // Care Log Form Data
  const [careLogData, setCareLogData] = useState({
    activities_performed: '',
    mood: 'neutral',
    vital_signs: '',
    medications_administered: '',
    meals_provided: '',
    personal_care_notes: '',
    behavioral_observations: '',
    incidents: '',
    follow_up_required: false,
    follow_up_notes: '',
    general_notes: '',
  });

  useEffect(() => {
    loadVisitDetails();
  }, []);

  const loadVisitDetails = async () => {
    try {
      setLoading(true);
      const response = await visitApi.getVisit(visitId);

      if (response.success && response.data) {
        setVisit(response.data.visit);
        
        // If visit is already in progress, set clocked in
        if (response.data.visit.status === 'in_progress') {
          setClockedIn(true);
          setStartTime(new Date());
        }
      } else {
        Alert.alert('Error', response.message || 'Failed to load visit details');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async () => {
    Alert.alert(
      'Start Visit',
      `Start visit with ${visit.client_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          onPress: async () => {
            try {
              const response = await visitApi.updateVisit(visitId, {
                ...visit,
                status: 'in_progress',
              });

              if (response.success) {
                setClockedIn(true);
                setStartTime(new Date());
                Alert.alert('Success', 'Visit started!');
              } else {
                Alert.alert('Error', response.message || 'Failed to start visit');
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Something went wrong');
            }
          },
        },
      ]
    );
  };

  const handleClockOut = async () => {
    // Validate that care log has some data
    if (!careLogData.activities_performed && !careLogData.general_notes) {
      Alert.alert(
        'Incomplete Care Log',
        'Please add at least some activities performed or general notes before completing the visit.'
      );
      return;
    }

    Alert.alert(
      'Complete Visit',
      'Mark this visit as completed and save care log?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            setSaving(true);

            try {
              // Calculate duration
              const endTime = new Date();
              const durationMinutes = startTime
                ? Math.round((endTime.getTime() - startTime.getTime()) / 60000)
                : visit.estimated_duration || 60;

              // 1. Create care log
              const careLogResponse = await careLogApi.createCareLog({
                client_id: visit.client_id,
                staff_id: user?.staff_id || 0,
                visit_date: visit.visit_date,
                log_date: new Date().toISOString().split('T')[0],
                log_time: new Date().toTimeString().split(' ')[0],
                duration_minutes: durationMinutes,
                ...careLogData,
              });

              if (!careLogResponse.success) {
                throw new Error(careLogResponse.message || 'Failed to create care log');
              }

              // 2. Update visit status to completed
              const visitResponse = await visitApi.updateVisit(visitId, {
                ...visit,
                status: 'completed',
              });

              if (!visitResponse.success) {
                throw new Error(visitResponse.message || 'Failed to complete visit');
              }

              Alert.alert(
                'Success',
                'Visit completed and care log saved!',
                [
                  {
                    text: 'OK',
                    onPress: () => navigation.navigate('StaffDashboard'),
                  },
                ]
              );
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Something went wrong');
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  const updateField = (field: string, value: any) => {
    setCareLogData({ ...careLogData, [field]: value });
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading visit...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (!visit) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Visit not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.headerBackText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Visit Execution</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Visit Info Card */}
        <View style={styles.visitInfoCard}>
          <Text style={styles.clientNameLarge}>{visit.client_name}</Text>
          <View style={styles.visitInfoRow}>
            <Text style={styles.visitInfoLabel}>📅 Date:</Text>
            <Text style={styles.visitInfoValue}>{visit.visit_date}</Text>
          </View>
          <View style={styles.visitInfoRow}>
            <Text style={styles.visitInfoLabel}>🕐 Time:</Text>
            <Text style={styles.visitInfoValue}>{formatTime(visit.visit_time)}</Text>
          </View>
          <View style={styles.visitInfoRow}>
            <Text style={styles.visitInfoLabel}>⏱️ Duration:</Text>
            <Text style={styles.visitInfoValue}>{visit.estimated_duration || 60} mins</Text>
          </View>
          {visit.special_instructions && (
            <View style={styles.instructionsBox}>
              <Text style={styles.instructionsTitle}>ℹ️ Special Instructions:</Text>
              <Text style={styles.instructionsText}>{visit.special_instructions}</Text>
            </View>
          )}
        </View>

        {/* Clock In/Out */}
        {!clockedIn ? (
          <View style={styles.section}>
            <TouchableOpacity style={styles.clockInButton} onPress={handleClockIn}>
              <Text style={styles.clockInIcon}>▶️</Text>
              <Text style={styles.clockInText}>Clock In & Start Visit</Text>
            </TouchableOpacity>
            <Text style={styles.clockInHint}>
              Tap to begin the visit and start recording care activities
            </Text>
          </View>
        ) : (
          <>
            {/* Timer Display */}
            <View style={styles.timerCard}>
              <Text style={styles.timerLabel}>⏱️ Visit In Progress</Text>
              <Text style={styles.timerText}>
                Started at {startTime?.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>

            {/* Care Log Form */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📋 Care Log</Text>

              <Text style={styles.label}>Activities Performed *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={careLogData.activities_performed}
                onChangeText={(text) => updateField('activities_performed', text)}
                placeholder="What care activities did you perform? (e.g., Personal care, medication administration, meal preparation)"
                multiline
                numberOfLines={4}
              />

              <Text style={styles.label}>Client Mood</Text>
              <View style={styles.moodButtons}>
                {[
                  { value: 'happy', emoji: '😊', label: 'Happy' },
                  { value: 'neutral', emoji: '😐', label: 'Neutral' },
                  { value: 'sad', emoji: '😢', label: 'Sad' },
                  { value: 'anxious', emoji: '😰', label: 'Anxious' },
                  { value: 'agitated', emoji: '😤', label: 'Agitated' },
                ].map((mood) => (
                  <TouchableOpacity
                    key={mood.value}
                    style={[
                      styles.moodButton,
                      careLogData.mood === mood.value && styles.moodButtonActive,
                    ]}
                    onPress={() => updateField('mood', mood.value)}
                  >
                    <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                    <Text
                      style={[
                        styles.moodLabel,
                        careLogData.mood === mood.value && styles.moodLabelActive,
                      ]}
                    >
                      {mood.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Vital Signs (if taken)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={careLogData.vital_signs}
                onChangeText={(text) => updateField('vital_signs', text)}
                placeholder="BP: 120/80, Temp: 98.6°F, Pulse: 72 bpm"
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>Medications Administered</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={careLogData.medications_administered}
                onChangeText={(text) => updateField('medications_administered', text)}
                placeholder="List any medications given with dosage and time"
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>Meals Provided</Text>
              <TextInput
                style={styles.input}
                value={careLogData.meals_provided}
                onChangeText={(text) => updateField('meals_provided', text)}
                placeholder="Breakfast, Lunch, Dinner, Snacks"
              />

              <Text style={styles.label}>Personal Care Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={careLogData.personal_care_notes}
                onChangeText={(text) => updateField('personal_care_notes', text)}
                placeholder="Bathing, dressing, grooming, toileting assistance"
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>Behavioral Observations</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={careLogData.behavioral_observations}
                onChangeText={(text) => updateField('behavioral_observations', text)}
                placeholder="Any unusual behavior, mood changes, or concerns"
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>Incidents (if any)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={careLogData.incidents}
                onChangeText={(text) => updateField('incidents', text)}
                placeholder="Falls, accidents, medical emergencies, etc."
                multiline
                numberOfLines={3}
              />

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>🔔 Follow-up Required</Text>
                <Switch
                  value={careLogData.follow_up_required}
                  onValueChange={(value) => updateField('follow_up_required', value)}
                  trackColor={{ false: '#e2e8f0', true: '#93c5fd' }}
                  thumbColor={careLogData.follow_up_required ? '#2563eb' : '#f4f4f5'}
                />
              </View>

              {careLogData.follow_up_required && (
                <>
                  <Text style={styles.label}>Follow-up Notes</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={careLogData.follow_up_notes}
                    onChangeText={(text) => updateField('follow_up_notes', text)}
                    placeholder="What needs follow-up and why?"
                    multiline
                    numberOfLines={3}
                  />
                </>
              )}

              <Text style={styles.label}>General Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={careLogData.general_notes}
                onChangeText={(text) => updateField('general_notes', text)}
                placeholder="Any additional observations or notes"
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Complete Visit Button */}
            <View style={styles.section}>
              <TouchableOpacity
                style={[styles.completeButton, saving && styles.completeButtonDisabled]}
                onPress={handleClockOut}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Text style={styles.completeButtonIcon}>✓</Text>
                    <Text style={styles.completeButtonText}>Complete Visit & Save Log</Text>
                  </>
                )}
              </TouchableOpacity>
              <Text style={styles.completeHint}>
                This will mark the visit as completed and save the care log
              </Text>
            </View>
          </>
        )}
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
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 10,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerBackButton: {
    padding: 8,
  },
  headerBackText: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  content: {
    flex: 1,
  },
  visitInfoCard: {
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
  clientNameLarge: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  visitInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  visitInfoLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  visitInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  instructionsBox: {
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 6,
  },
  instructionsText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
  section: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  clockInButton: {
    backgroundColor: '#10b981',
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  clockInIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  clockInText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  clockInHint: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 12,
  },
  timerCard: {
    backgroundColor: '#10b981',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  timerLabel: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  timerText: {
    fontSize: 14,
    color: 'white',
    marginTop: 4,
    opacity: 0.9,
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
  moodButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moodButton: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  moodButtonActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  moodLabelActive: {
    color: '#2563eb',
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 12,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  switchLabel: {
    fontSize: 15,
    color: '#1e293b',
    fontWeight: '500',
  },
  completeButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completeButtonDisabled: {
    opacity: 0.6,
  },
  completeButtonIcon: {
    fontSize: 24,
    color: 'white',
    marginRight: 12,
  },
  completeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  completeHint: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 12,
  },
});

// src/screens/visits/VisitListScreen.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { ScreenWrapper } from '../../components';
import { visitApi, ScheduledVisit } from '../../services/api/visitApi';
import { useFocusEffect } from '@react-navigation/native';

interface VisitListScreenProps {
  navigation: any;
  route: any;
}

export default function VisitListScreen({ navigation, route }: VisitListScreenProps) {
  const [visits, setVisits] = useState<ScheduledVisit[]>([]);
  const [filteredVisits, setFilteredVisits] = useState<ScheduledVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useFocusEffect(
    useCallback(() => {
      loadVisits();
    }, [])
  );

  const loadVisits = async () => {
    try {
      setLoading(true);
      const response = await visitApi.getVisits();

      if (response.success && response.data) {
        setVisits(response.data.visits || []);
        setFilteredVisits(response.data.visits || []);
      } else {
        Alert.alert('Error', response.message || 'Failed to load visits');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadVisits();
    setRefreshing(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterVisits(query, statusFilter);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    filterVisits(searchQuery, status);
  };

  const filterVisits = (query: string, status: string) => {
    let filtered = visits;

    // Filter by status
    if (status !== 'all') {
      filtered = filtered.filter((visit) => visit.status === status);
    }

    // Filter by search query
    if (query.trim()) {
      const lowercaseQuery = query.toLowerCase();
      filtered = filtered.filter(
        (visit) =>
          visit.client_name?.toLowerCase().includes(lowercaseQuery) ||
          visit.staff_name?.toLowerCase().includes(lowercaseQuery) ||
          visit.visit_date?.includes(query)
      );
    }

    setFilteredVisits(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return '#3b82f6';
      case 'confirmed':
        return '#10b981';
      case 'in_progress':
        return '#f59e0b';
      case 'completed':
        return '#6b7280';
      case 'cancelled':
        return '#ef4444';
      case 'missed':
        return '#dc2626';
      default:
        return '#6b7280';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '#dc2626';
      case 'high':
        return '#f59e0b';
      case 'normal':
        return '#3b82f6';
      case 'low':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const isUpcoming = (visitDate: string) => {
    const today = new Date().toISOString().split('T')[0];
    return visitDate >= today;
  };

  const renderVisitItem = ({ item }: { item: ScheduledVisit }) => (
    <TouchableOpacity
      style={styles.visitCard}
      onPress={() => navigation.navigate('VisitDetail', { visitId: item.visit_id })}
    >
      <View style={styles.visitHeader}>
        <View style={styles.visitHeaderLeft}>
          <Text style={styles.clientName}>{item.client_name}</Text>
          <Text style={styles.staffName}>with {item.staff_name}</Text>
        </View>
        <View style={styles.badges}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status || 'scheduled') },
            ]}
          >
            <Text style={styles.statusText}>
              {item.status?.toUpperCase() || 'SCHEDULED'}
            </Text>
          </View>
          {item.priority && item.priority !== 'normal' && (
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: getPriorityColor(item.priority) },
              ]}
            >
              <Text style={styles.priorityText}>
                {item.priority.toUpperCase()}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.visitInfo}>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>📅</Text>
          <Text style={styles.infoText}>{item.visit_date}</Text>
          <Text style={styles.infoDivider}>•</Text>
          <Text style={styles.infoIcon}>🕐</Text>
          <Text style={styles.infoText}>{item.visit_time}</Text>
          {item.estimated_duration && (
            <>
              <Text style={styles.infoDivider}>•</Text>
              <Text style={styles.infoText}>{item.estimated_duration} mins</Text>
            </>
          )}
        </View>

        {item.visit_type && (
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📋</Text>
            <Text style={styles.infoText}>
              {item.visit_type.replace('_', ' ')}
            </Text>
          </View>
        )}

        {item.service_type && (
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>🏥</Text>
            <Text style={styles.infoText}>{item.service_type}</Text>
          </View>
        )}

        {item.is_recurring === 1 && (
          <View style={styles.recurringBadge}>
            <Text style={styles.recurringText}>
              🔄 Recurring ({item.recurrence_pattern})
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>📅</Text>
      <Text style={styles.emptyStateTitle}>No Visits Scheduled</Text>
      <Text style={styles.emptyStateText}>
        {searchQuery || statusFilter !== 'all'
          ? 'No visits match your filters'
          : 'Start by scheduling your first visit'}
      </Text>
      {!searchQuery && statusFilter === 'all' && (
        <TouchableOpacity
          style={styles.emptyStateButton}
          onPress={() => navigation.navigate('ScheduleVisit')}
        >
          <Text style={styles.emptyStateButtonText}>+ Schedule Visit</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scheduled Visits</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading visits...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scheduled Visits</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('ScheduleVisit')}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by client, staff, or date..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Text style={styles.clearButton}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Status Filter */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            statusFilter === 'all' && styles.filterButtonActive,
          ]}
          onPress={() => handleStatusFilter('all')}
        >
          <Text
            style={[
              styles.filterButtonText,
              statusFilter === 'all' && styles.filterButtonTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            statusFilter === 'scheduled' && styles.filterButtonActive,
          ]}
          onPress={() => handleStatusFilter('scheduled')}
        >
          <Text
            style={[
              styles.filterButtonText,
              statusFilter === 'scheduled' && styles.filterButtonTextActive,
            ]}
          >
            Scheduled
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            statusFilter === 'confirmed' && styles.filterButtonActive,
          ]}
          onPress={() => handleStatusFilter('confirmed')}
        >
          <Text
            style={[
              styles.filterButtonText,
              statusFilter === 'confirmed' && styles.filterButtonTextActive,
            ]}
          >
            Confirmed
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            statusFilter === 'completed' && styles.filterButtonActive,
          ]}
          onPress={() => handleStatusFilter('completed')}
        >
          <Text
            style={[
              styles.filterButtonText,
              statusFilter === 'completed' && styles.filterButtonTextActive,
            ]}
          >
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      {/* Stats Summary */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{filteredVisits.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>
            {
              filteredVisits.filter(
                (v) => v.visit_date === new Date().toISOString().split('T')[0]
              ).length
            }
          </Text>
          <Text style={styles.statLabel}>Today</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>
            {
              filteredVisits.filter(
                (v) => isUpcoming(v.visit_date) && v.status === 'scheduled'
              ).length
            }
          </Text>
          <Text style={styles.statLabel}>Upcoming</Text>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={filteredVisits}
        renderItem={renderVisitItem}
        keyExtractor={(item) => item.visit_id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#2563eb']}
          />
        }
      />
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
    paddingTop: 10,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  headerSpacer: {
    width: 60,
  },
  addButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1e293b',
  },
  clearButton: {
    fontSize: 18,
    color: '#64748b',
    padding: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: 'white',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  filterButtonText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
  },
  visitCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  visitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  visitHeaderLeft: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  staffName: {
    fontSize: 14,
    color: '#64748b',
  },
  badges: {
    alignItems: 'flex-end',
    gap: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  visitInfo: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#475569',
    textTransform: 'capitalize',
  },
  infoDivider: {
    marginHorizontal: 8,
    color: '#cbd5e1',
  },
  recurringBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 4,
  },
  recurringText: {
    fontSize: 13,
    color: '#1e40af',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});