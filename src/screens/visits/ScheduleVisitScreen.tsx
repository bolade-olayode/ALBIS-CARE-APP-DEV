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
  Platform,
  Modal,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ScreenWrapper, FormScrollView, SearchablePickerModal, PickerItem } from '../../components';
import { visitApi } from '../../services/api/visitApi';
import { clientApi } from '../../services/api/clientApi';
import { staffApi } from '../../services/api/staffApi';
import { formatDate, parseDate } from '../../utils/dateFormatter';

type PickerType = 'client' | 'staff' | 'driver' | null;

interface ScheduleVisitScreenProps {
  navigation: any;
}

export default function ScheduleVisitScreen({ navigation }: ScheduleVisitScreenProps) {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Searchable Picker State
  const [activePicker, setActivePicker] = useState<PickerType>(null);

  // Date Picker State
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeDateField, setActiveDateField] = useState<'visit_date' | 'recurrence_end_date'>('visit_date');
  const [tempDate, setTempDate] = useState(new Date());

  const [formData, setFormData] = useState({
    client_id: '',
    staff_id: '',
    // Default to Today in UK Format
    visit_date: formatDate(new Date().toISOString().split('T')[0]),
    visit_time: '09:00',
    estimated_duration: '60',
    visit_type: 'routine',
    service_type: '',
    special_instructions: '',
    priority: 'normal',
    status: 'scheduled',
    is_recurring: false,
    recurrence_pattern: 'weekly',
    recurrence_end_date: '',
    notes: '',
    // Transport Fields
    requires_transport: false,
    driver_id: '',
    pickup_location: '',
    dropoff_location: '',
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

      if (clientsResponse.success) setClients(clientsResponse.data?.clients || []);
      if (staffResponse.success) {
        const allStaff = staffResponse.data?.staff || [];
        setStaff(allStaff);
        
        // Filter for drivers based on role name
        const driverList = allStaff.filter((s: any) => 
          s.role_name?.toLowerCase() === 'driver' || s.staff_role?.toLowerCase() === 'driver'
        );
        setDrivers(driverList);
      }
    } catch (error) {
      // Data load failed silently
    } finally {
      setLoadingData(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  // Transform data for SearchablePickerModal
  const clientPickerItems: PickerItem[] = clients.map(c => ({
    id: c.cNo.toString(),
    label: `${c.cFName} ${c.cLName}`,
    sublabel: c.cAddress || c.cPostCode || undefined,
    icon: '👤',
    data: c,
  }));

  // Helper to normalize role names for display
  const normalizeRoleName = (role: string | undefined): string => {
    if (!role) return 'Staff';
    const lower = role.toLowerCase();
    if (lower.includes('care_manager') || lower.includes('care manager')) return 'Care Manager';
    if (lower.includes('care_assistant') || lower.includes('care assistant')) return 'Carer';
    if (lower.includes('carer')) return 'Carer';
    if (lower.includes('nurse')) return 'Nurse';
    if (lower.includes('driver')) return 'Driver';
    if (lower.includes('admin')) return 'Admin';
    // Capitalize first letter of each word
    return role.split(/[_\s]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  };

  // Filter staff to only include carers who can perform visits (exclude drivers & admins)
  const careStaff = staff.filter((s: any) => {
    const role = (s.role_name || s.staff_role || '').toLowerCase();
    const isDriver = role.includes('driver');
    const isAdmin = role.includes('admin') || s.is_admin;
    return !isDriver && !isAdmin;
  });

  const staffPickerItems: PickerItem[] = careStaff.map(s => ({
    id: s.id.toString(),
    label: s.name,
    sublabel: normalizeRoleName(s.role_name || s.staff_role),
    icon: '👨‍⚕️',
    data: s,
  }));

  const driverPickerItems: PickerItem[] = drivers.map(d => ({
    id: d.id.toString(),
    label: d.name,
    sublabel: 'Driver',
    icon: '🚗',
    data: d,
  }));

  const handlePickerSelect = (item: PickerItem) => {
    if (activePicker === 'client') {
      updateField('client_id', item.id.toString());
    } else if (activePicker === 'staff') {
      updateField('staff_id', item.id.toString());
    } else if (activePicker === 'driver') {
      updateField('driver_id', item.id.toString());
    }
    setActivePicker(null);
  };

  // Open Picker Helper
  const openDatePicker = (field: 'visit_date' | 'recurrence_end_date') => {
    setActiveDateField(field);
    let dateToSet = new Date();
    if (formData[field]) {
      dateToSet = new Date(parseDate(formData[field]));
    } 
    setTempDate(dateToSet);
    setShowDatePicker(true);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (selectedDate) {
        const isoDate = selectedDate.toISOString().split('T')[0];
        updateField(activeDateField, formatDate(isoDate));
      }
    } else {
      if (selectedDate) setTempDate(selectedDate);
    }
  };

  const confirmIOSDate = () => {
    const isoDate = tempDate.toISOString().split('T')[0];
    updateField(activeDateField, formatDate(isoDate));
    setShowDatePicker(false);
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

    if (formData.requires_transport && !formData.driver_id) {
      Alert.alert('Validation Error', 'Please select a driver for the transport');
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        client_id: parseInt(formData.client_id),
        staff_id: parseInt(formData.staff_id),
        estimated_duration: parseInt(formData.estimated_duration) || 60,
        // Convert UK Date back to SQL Date
        visit_date: parseDate(formData.visit_date),
        recurrence_end_date: formData.recurrence_end_date ? parseDate(formData.recurrence_end_date) : null,
        // Transport Data
        requires_transport: formData.requires_transport ? 1 : 0,
        driver_id: formData.driver_id ? parseInt(formData.driver_id) : null,
      };

      const response = await visitApi.createVisit(submitData);

      if (response.success) {
        Alert.alert(
          'Success',
          'Visit scheduled successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
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
        <View style={styles.headerContent}>
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
      </View>

      <FormScrollView>
        {/* Visit Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visit Details</Text>

          <Text style={styles.label}>Client *</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setActivePicker('client')}
          >
            <Text style={formData.client_id ? styles.selectButtonTextFilled : styles.selectButtonText}>
              {formData.client_id
                ? (() => {
                    const client = clients.find(c => c.cNo.toString() === formData.client_id);
                    return client ? `${client.cFName} ${client.cLName}` : 'Select Client...';
                  })()
                : 'Select Client...'}
            </Text>
            <Text style={styles.selectButtonIcon}>▼</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Carer (Staff Member) *</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setActivePicker('staff')}
          >
            <Text style={formData.staff_id ? styles.selectButtonTextFilled : styles.selectButtonText}>
              {formData.staff_id
                ? staff.find(s => s.id.toString() === formData.staff_id)?.name
                : 'Select Staff Member...'}
            </Text>
            <Text style={styles.selectButtonIcon}>▼</Text>
          </TouchableOpacity>

          {/* Date Picker */}
          <Text style={styles.label}>Visit Date *</Text>
          <TouchableOpacity 
            style={styles.dateButton} 
            onPress={() => openDatePicker('visit_date')}
          >
            <Text style={styles.dateButtonText}>
              {formData.visit_date || 'Select Date'}
            </Text>
            <Text style={styles.dateIcon}>📅</Text>
          </TouchableOpacity>

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
                  {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
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
        </View>

        {/* Transport Section - NEW */}
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
                  if (drivers.length === 0) {
                    Alert.alert('No Drivers', 'No staff members with "Driver" role found.');
                  } else {
                    setActivePicker('driver');
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
            placeholder="e.g. Personal Care" 
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

        {/* Recurring Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recurring Visit</Text>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>🔄 Make this a recurring visit</Text>
            <Switch 
              value={formData.is_recurring} 
              onValueChange={(value) => updateField('is_recurring', value)} 
              trackColor={{ false: '#e2e8f0', true: '#2563eb' }} 
              thumbColor={formData.is_recurring ? '#ffffff' : '#f4f4f5'} 
            />
          </View>
          
          {formData.is_recurring && (
            <>
              <Text style={styles.label}>Recurrence Pattern</Text>
              <View style={styles.radioGroup}>
                {['daily', 'weekly', 'monthly'].map((pattern) => (
                  <TouchableOpacity 
                    key={pattern} 
                    style={[
                      styles.radioButton, 
                      formData.recurrence_pattern === pattern && styles.radioButtonActive
                    ]} 
                    onPress={() => updateField('recurrence_pattern', pattern)}
                  >
                    <Text 
                      style={[
                        styles.radioText, 
                        formData.recurrence_pattern === pattern && styles.radioTextActive
                      ]}
                    >
                      {pattern.charAt(0).toUpperCase() + pattern.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <Text style={styles.label}>End Date (Optional)</Text>
              <TouchableOpacity 
                style={styles.dateButton} 
                onPress={() => openDatePicker('recurrence_end_date')}
              >
                <Text style={styles.dateButtonText}>
                  {formData.recurrence_end_date || 'Select End Date'}
                </Text>
                <Text style={styles.dateIcon}>🏁</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Date Picker Modal */}
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

        {/* Searchable Picker Modals */}
        <SearchablePickerModal
          visible={activePicker === 'client'}
          onClose={() => setActivePicker(null)}
          onSelect={handlePickerSelect}
          items={clientPickerItems}
          title="Select Client"
          placeholder="Search by name or address..."
          selectedId={formData.client_id || null}
          emptyMessage="No clients found"
          accentColor="#2563eb"
        />

        <SearchablePickerModal
          visible={activePicker === 'staff'}
          onClose={() => setActivePicker(null)}
          onSelect={handlePickerSelect}
          items={staffPickerItems}
          title="Select Staff Member"
          placeholder="Search by name or role..."
          selectedId={formData.staff_id || null}
          emptyMessage="No staff members found"
          accentColor="#2563eb"
          groupByField="sublabel"
          sectionOrder={['Care Manager', 'Carer', 'Nurse']}
        />

        <SearchablePickerModal
          visible={activePicker === 'driver'}
          onClose={() => setActivePicker(null)}
          onSelect={handlePickerSelect}
          items={driverPickerItems}
          title="Select Driver"
          placeholder="Search drivers..."
          selectedId={formData.driver_id || null}
          emptyMessage="No drivers found"
          accentColor="#f59e0b"
        />
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