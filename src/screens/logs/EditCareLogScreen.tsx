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
  Platform,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ScreenWrapper, FormScrollView } from '../../components';
import { careLogApi } from '../../services/api/careLogApi';
import { formatDate, parseDate } from '../../utils/dateFormatter';

interface EditCareLogScreenProps {
  navigation: any;
  route: any;
}

export default function EditCareLogScreen({ navigation, route }: EditCareLogScreenProps) {
  const { logId } = route.params;
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  // Date Picker State
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

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
          // Convert DB date to UI format
          visit_date: formatDate(log.visit_date),
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

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        // Convert UI date back to DB format
        visit_date: parseDate(formData.visit_date),
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
      <View style={styles.header}>
        <View style={styles.headerContent}>
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
      </View>

      <FormScrollView>
        {/* Visit Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visit Details</Text>

          {/* Date Picker Button */}
          <Text style={styles.label}>Visit Date *</Text>
          <TouchableOpacity 
            style={styles.dateButton} 
            onPress={openDatePicker}
          >
            <Text style={styles.dateButtonText}>
              {formData.visit_date || 'Select Date'}
            </Text>
            <Text style={styles.dateIcon}></Text>
          </TouchableOpacity>

          {/* Modal Picker for iOS / Default for Android */}
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
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
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
  // Date Button
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
  // iOS Modal Styles
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