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