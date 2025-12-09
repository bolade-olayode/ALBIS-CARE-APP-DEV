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
  userData?: any; // ADD THIS - but we'll get it from route params
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