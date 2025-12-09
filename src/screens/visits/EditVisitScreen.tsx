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