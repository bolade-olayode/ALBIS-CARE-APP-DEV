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
  Platform,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ScreenWrapper, FormScrollView } from '../../components';
import { clientApi } from '../../services/api/clientApi';
import { formatDate, parseDate } from '../../utils/dateFormatter';

interface EditClientScreenProps {
  route: any;
  navigation: any;
}

export default function EditClientScreen({ route, navigation }: EditClientScreenProps) {
  const { clientId } = route.params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Date Picker State
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeDateField, setActiveDateField] = useState<string | null>(null);
  const [tempDate, setTempDate] = useState(new Date());

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
          // CONVERT DB DATES TO UI FORMAT
          date_of_birth: formatDate(clientData.date_of_birth),
          cSDate: formatDate(clientData.cSDate),
          cEDate: formatDate(clientData.cEDate),
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

  // Open Picker
  const openDatePicker = (field: string) => {
    setActiveDateField(field);
    
    let initialDate = new Date();
    // Try to parse existing date, else default
    if (formData[field as keyof typeof formData]) {
      // We must parse the UI date (DD-MM-YYYY) back to a Date object
      initialDate = new Date(parseDate(formData[field as keyof typeof formData] as string));
    } else if (field === 'date_of_birth') {
      initialDate = new Date('1990-01-01');
    }

    setTempDate(initialDate);
    setShowDatePicker(true);
  };

  // Handle Change
  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (selectedDate && activeDateField) {
        const isoDate = selectedDate.toISOString().split('T')[0];
        updateField(activeDateField, formatDate(isoDate));
      }
    } else {
      if (selectedDate) setTempDate(selectedDate);
    }
  };

  // iOS Confirm
  const confirmIOSDate = () => {
    if (activeDateField) {
      const isoDate = tempDate.toISOString().split('T')[0];
      updateField(activeDateField, formatDate(isoDate));
    }
    setShowDatePicker(false);
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
      // CONVERT UI DATES BACK TO DB FORMAT (YYYY-MM-DD)
      const submitData = {
        ...formData,
        date_of_birth: parseDate(formData.date_of_birth),
        cSDate: parseDate(formData.cSDate),
        cEDate: parseDate(formData.cEDate),
      };

      const response = await clientApi.updateClient(clientId, submitData);

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
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>Edit Client</Text>
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
          />

          <Text style={styles.label}>Last Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.cLName}
            onChangeText={(text) => updateField('cLName', text)}
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
          <TouchableOpacity 
            style={styles.dateButton} 
            onPress={() => openDatePicker('date_of_birth')}
          >
            <Text style={styles.dateButtonText}>
              {formData.date_of_birth || 'Select DOB'}
            </Text>
            <Text style={styles.dateIcon}></Text>
          </TouchableOpacity>

          <Text style={styles.label}>NHS Number</Text>
          <TextInput
            style={styles.input}
            value={formData.NHSNo}
            onChangeText={(text) => updateField('NHSNo', text)}
          />
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <Text style={styles.label}>Phone *</Text>
          <TextInput
            style={styles.input}
            value={formData.cTel}
            onChangeText={(text) => updateField('cTel', text)}
            keyboardType="phone-pad"
          />
          <Text style={styles.label}>Mobile</Text>
          <TextInput
            style={styles.input}
            value={formData.cMobile}
            onChangeText={(text) => updateField('cMobile', text)}
            keyboardType="phone-pad"
          />
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={formData.cEmail}
            onChangeText={(text) => updateField('cEmail', text)}
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
          />
          <Text style={styles.label}>Address Line 2</Text>
          <TextInput
            style={styles.input}
            value={formData.cAddr2}
            onChangeText={(text) => updateField('cAddr2', text)}
          />
          <Text style={styles.label}>Town</Text>
          <TextInput
            style={styles.input}
            value={formData.cTown}
            onChangeText={(text) => updateField('cTown', text)}
          />
          <Text style={styles.label}>Postcode *</Text>
          <TextInput
            style={styles.input}
            value={formData.cPostCode}
            onChangeText={(text) => updateField('cPostCode', text.toUpperCase())}
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
          <TouchableOpacity 
            style={styles.dateButton} 
            onPress={() => openDatePicker('cSDate')}
          >
            <Text style={styles.dateButtonText}>
              {formData.cSDate || 'Select Start Date'}
            </Text>
            <Text style={styles.dateIcon}></Text>
          </TouchableOpacity>

          <Text style={styles.label}>Care End Date</Text>
          <TouchableOpacity 
            style={styles.dateButton} 
            onPress={() => openDatePicker('cEDate')}
          >
            <Text style={styles.dateButtonText}>
              {formData.cEDate || 'Select End Date'}
            </Text>
            <Text style={styles.dateIcon}></Text>
          </TouchableOpacity>

          <Text style={styles.label}>Care Plan</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.cCarePlan}
            onChangeText={(text) => updateField('cCarePlan', text)}
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Medical Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.cRemarks}
            onChangeText={(text) => updateField('cRemarks', text)}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Date Picker Modal (Platform Specific) */}
        {showDatePicker && (
          Platform.OS === 'ios' ? (
            <Modal
              transparent={true}
              animationType="slide"
              visible={showDatePicker}
              onRequestClose={() => setShowDatePicker(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                      <Text style={styles.modalCancel}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={confirmIOSDate}>
                      <Text style={styles.modalDone}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={tempDate}
                    mode="date"
                    display="spinner"
                    onChange={onDateChange}
                    textColor="black"
                  />
                </View>
              </View>
            </Modal>
          ) : (
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          )
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalCancel: {
    fontSize: 16,
    color: '#64748b',
  },
  modalDone: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
  },
});