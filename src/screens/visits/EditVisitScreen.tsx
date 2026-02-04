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
  Platform,
  Modal,
  Switch,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ScreenWrapper, FormScrollView } from '../../components';
import { visitApi } from '../../services/api/visitApi';
import { staffApi } from '../../services/api/staffApi'; // Added to fetch drivers
import { formatDate, parseDate } from '../../utils/dateFormatter';

interface EditVisitScreenProps {
  navigation: any;
  route: any;
}

export default function EditVisitScreen({ navigation, route }: EditVisitScreenProps) {
  const { visitId } = route.params;
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [drivers, setDrivers] = useState<any[]>([]); // To store list of drivers
  
  // Date Picker State
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

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
    // Transport Fields
    requires_transport: false,
    driver_id: '',
    pickup_location: '',
    dropoff_location: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setInitialLoading(true);
      
      // 1. Fetch Drivers and Visit Details in parallel
      const [visitRes, staffRes] = await Promise.all([
        visitApi.getVisit(visitId),
        staffApi.getStaff()
      ]);

      // 2. Process Staff to find Drivers
      if (staffRes.success) {
        const allStaff = staffRes.data?.staff || [];
        const driverList = allStaff.filter((s: any) => 
          s.role_name?.toLowerCase() === 'driver' || s.staff_role?.toLowerCase() === 'driver'
        );
        setDrivers(driverList);
      }

      // 3. Process Visit Data
      if (visitRes.success && visitRes.data) {
        const visit = visitRes.data.visit;
        
        setFormData({
          visit_date: formatDate(visit.visit_date),
          visit_time: visit.visit_time || '',
          estimated_duration: visit.estimated_duration?.toString() || '',
          visit_type: visit.visit_type || 'routine',
          service_type: visit.service_type || '',
          special_instructions: visit.special_instructions || '',
          priority: visit.priority || 'normal',
          status: visit.status?.toLowerCase() || 'scheduled',
          notes: visit.notes || '',
          cancellation_reason: visit.cancellation_reason || '',
          // Check if transport data exists in the visit object
          // (Backend needs to join 'transports' table to send this data)
          requires_transport: visit.driver_id ? true : false, 
          driver_id: visit.driver_id?.toString() || '',
          pickup_location: visit.pickup_location || '',
          dropoff_location: visit.dropoff_location || '',
        });
      } else {
        Alert.alert('Error', visitRes.message || 'Failed to load visit data');
        navigation.goBack();
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
      navigation.goBack();
    } finally {
      setInitialLoading(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  // Date Picker Logic
  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (selectedDate) {
        const isoDate = selectedDate.toISOString().split('T')[0];
        updateField('visit_date', formatDate(isoDate));
      }
    } else {
      if (selectedDate) setTempDate(selectedDate);
    }
  };

  const confirmIOSDate = () => {
    const isoDate = tempDate.toISOString().split('T')[0];
    updateField('visit_date', formatDate(isoDate));
    setShowDatePicker(false);
  };

  const openDatePicker = () => {
    const currentDate = formData.visit_date ? new Date(parseDate(formData.visit_date)) : new Date();
    setTempDate(currentDate);
    setShowDatePicker(true);
  };

  const handleSubmit = async () => {
    if (!formData.visit_date || !formData.visit_time) {
      Alert.alert('Validation Error', 'Visit date and time are required');
      return;
    }

    if (formData.requires_transport && !formData.driver_id) {
      Alert.alert('Validation Error', 'Please select a driver');
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        visit_date: parseDate(formData.visit_date),
        estimated_duration: parseInt(formData.estimated_duration) || 60,
        // Ensure transport data is sent
        requires_transport: formData.requires_transport ? 1 : 0,
        driver_id: formData.driver_id ? parseInt(formData.driver_id) : null,
      };

      const response = await visitApi.updateVisit(visitId, submitData);

      if (response.success) {
        Alert.alert(
          'Success',
          'Visit updated successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
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
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={() => navigation.goBack()}
          >
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
      </View>

      <FormScrollView>
        {/* Visit Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visit Details</Text>

          <Text style={styles.label}>Visit Date *</Text>
          <TouchableOpacity 
            style={styles.dateButton} 
            onPress={openDatePicker}
          >
            <Text style={styles.dateButtonText}>
              {formData.visit_date || 'Select Date'}
            </Text>
            <Text style={styles.dateIcon}>📅</Text>
          </TouchableOpacity>

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
            value={formData.estimated_duration} 
            onChangeText={(text) => updateField('estimated_duration', text)} 
            placeholder="60" 
            keyboardType="numeric" 
          />

          <Text style={styles.label}>Visit Type</Text>
          <View style={styles.radioGroup}>
            {['routine', 'urgent', 'follow_up', 'assessment'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.radioButton, 
                  formData.visit_type === type && styles.radioButtonActive
                ]}
                onPress={() => updateField('visit_type', type)}
              >
                <Text 
                  style={[
                    styles.radioText, 
                    formData.visit_type === type && styles.radioTextActive
                  ]}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Priority</Text>
          <View style={styles.radioGroup}>
            {['low', 'normal', 'high', 'urgent'].map((prio) => (
              <TouchableOpacity
                key={prio}
                style={[
                  styles.radioButton, 
                  formData.priority === prio && styles.radioButtonActive
                ]}
                onPress={() => updateField('priority', prio)}
              >
                <Text 
                  style={[
                    styles.radioText, 
                    formData.priority === prio && styles.radioTextActive
                  ]}
                >
                  {prio.charAt(0).toUpperCase() + prio.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Status</Text>
          <View style={styles.radioGroup}>
            {['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'missed'].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.radioButton, 
                  formData.status === status && styles.radioButtonActive
                ]}
                onPress={() => updateField('status', status)}
              >
                <Text 
                  style={[
                    styles.radioText, 
                    formData.status === status && styles.radioTextActive
                  ]}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Transport Section - ADDED */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transport</Text>
          
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>🚗 Requires Transport?</Text>
            <Switch 
              value={formData.requires_transport} 
              onValueChange={(value) => updateField('requires_transport', value)} 
              trackColor={{ false: '#e2e8f0', true: '#f59e0b' }} 
              thumbColor={formData.requires_transport ? '#ffffff' : '#f4f4f5'} 
            />
          </View>

          {formData.requires_transport && (
            <>
              <Text style={styles.label}>Assign Driver *</Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => {
                  const options = drivers.map(d => ({ 
                    text: d.name, 
                    onPress: () => updateField('driver_id', d.id.toString()) 
                  }));
                  
                  if (drivers.length === 0) {
                    Alert.alert('No Drivers', 'No staff members with "Driver" role found.');
                  } else {
                    Alert.alert('Select Driver', 'Choose a driver', [...options, { text: 'Cancel', style: 'cancel' }]);
                  }
                }}
              >
                <Text style={formData.driver_id ? styles.selectButtonTextFilled : styles.selectButtonText}>
                  {formData.driver_id 
                    ? drivers.find(d => d.id.toString() === formData.driver_id)?.name 
                    : 'Select Driver...'}
                </Text>
                <Text style={styles.selectButtonIcon}>▼</Text>
              </TouchableOpacity>

              <Text style={styles.label}>Pickup Location</Text>
              <TextInput 
                style={styles.input} 
                value={formData.pickup_location} 
                onChangeText={(t) => updateField('pickup_location', t)} 
                placeholder="e.g. Client's Home Address" 
              />

              <Text style={styles.label}>Drop-off Location</Text>
              <TextInput 
                style={styles.input} 
                value={formData.dropoff_location} 
                onChangeText={(t) => updateField('dropoff_location', t)} 
                placeholder="e.g. Hospital / Day Centre" 
              />
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Details</Text>
          <Text style={styles.label}>Service Type</Text>
          <TextInput 
            style={styles.input} 
            value={formData.service_type} 
            onChangeText={(text) => updateField('service_type', text)} 
          />
          
          <Text style={styles.label}>Special Instructions</Text>
          <TextInput 
            style={[styles.input, styles.textArea]} 
            value={formData.special_instructions} 
            onChangeText={(text) => updateField('special_instructions', text)} 
            multiline 
            numberOfLines={4} 
          />
          
          <Text style={styles.label}>Notes</Text>
          <TextInput 
            style={[styles.input, styles.textArea]} 
            value={formData.notes} 
            onChangeText={(text) => updateField('notes', text)} 
            multiline 
            numberOfLines={3} 
          />
        </View>

        {(formData.status === 'cancelled' || formData.status === 'missed') && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cancellation/Miss Reason</Text>
            <Text style={styles.label}>Reason</Text>
            <TextInput 
              style={[styles.input, styles.textArea]} 
              value={formData.cancellation_reason} 
              onChangeText={(text) => updateField('cancellation_reason', text)} 
              multiline 
              numberOfLines={3} 
              placeholder="Reason..." 
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