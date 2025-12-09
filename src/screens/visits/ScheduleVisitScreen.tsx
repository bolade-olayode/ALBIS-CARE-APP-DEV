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