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
import { formatDate, parseDate } from '../../utils/dateFormatter';

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
          joined_date: formatDate(staff.joined_date),
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
      const submitData = {
        ...formData,
        joined_date: parseDate(formData.joined_date),
      };

      const response = await staffApi.updateStaff(staffId, submitData);

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
      {/* Header - Flattened to match StaffDetailScreen */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle} numberOfLines={1}>Edit Staff</Text>
        
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
          />
          <Text style={styles.label}>Last Name *</Text>
          <TextInput 
            style={styles.input} 
            value={formData.last_name} 
            onChangeText={(text) => updateField('last_name', text)} 
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
                    borderColor: role.color 
                  },
                ]}
                onPress={() => updateField('role_id', role.value)}
              >
                <Text 
                  style={[
                    styles.roleButtonText, 
                    formData.role_id === role.value && styles.roleButtonTextActive
                  ]}
                >
                  {role.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <Text style={styles.label}>Mobile *</Text>
          <TextInput 
            style={styles.input} 
            value={formData.mobile} 
            onChangeText={(text) => updateField('mobile', text)} 
            keyboardType="phone-pad" 
          />
          <Text style={styles.label}>Phone</Text>
          <TextInput 
            style={styles.input} 
            value={formData.phone} 
            onChangeText={(text) => updateField('phone', text)} 
            keyboardType="phone-pad" 
          />
          <Text style={styles.label}>Email</Text>
          <TextInput 
            style={styles.input} 
            value={formData.email} 
            onChangeText={(text) => updateField('email', text)} 
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
          />
          <Text style={styles.label}>Address Line 2</Text>
          <TextInput 
            style={styles.input} 
            value={formData.address_line2} 
            onChangeText={(text) => updateField('address_line2', text)} 
          />
          <Text style={styles.label}>Town</Text>
          <TextInput 
            style={styles.input} 
            value={formData.town} 
            onChangeText={(text) => updateField('town', text)} 
          />
          <Text style={styles.label}>Postcode</Text>
          <TextInput 
            style={styles.input} 
            value={formData.postcode} 
            onChangeText={(text) => updateField('postcode', text)} 
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
                    formData.employment_type === type.value && styles.radioTextActive
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
            placeholder="DD-MM-YYYY"
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
                    formData.status === status.value && styles.radioTextActive
                  ]}
                >
                  {status.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Professional Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Information</Text>
          <Text style={styles.label}>PVG Number</Text>
          <TextInput 
            style={styles.input} 
            value={formData.pvg_number} 
            onChangeText={(text) => updateField('pvg_number', text)} 
          />
          <Text style={styles.label}>SSSC Number</Text>
          <TextInput 
            style={styles.input} 
            value={formData.sssc_number} 
            onChangeText={(text) => updateField('sssc_number', text)} 
          />
          <Text style={styles.label}>Qualifications</Text>
          <TextInput 
            style={[styles.input, styles.textArea]} 
            value={formData.qualifications} 
            onChangeText={(text) => updateField('qualifications', text)} 
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
          />
          <Text style={styles.label}>Contact Phone</Text>
          <TextInput 
            style={styles.input} 
            value={formData.emergency_contact_phone} 
            onChangeText={(text) => updateField('emergency_contact_phone', text)} 
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
    paddingHorizontal: 16, // Matched to StaffDetailScreen
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  cancelButton: {
    padding: 8,
    minWidth: 50,
    alignItems: 'flex-start',
  },
  cancelText: {
    fontSize: 16,
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