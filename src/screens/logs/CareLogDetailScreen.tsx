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
import { formatDate } from '../../utils/dateFormatter'; // Import Helper
import { usePermissions } from '../../hooks/usePermissions';

interface CareLogDetailScreenProps {
  route: any;
  navigation: any;
}

export default function CareLogDetailScreen({ route, navigation }: CareLogDetailScreenProps) {
  const { logId } = route.params;
  const [log, setLog] = useState<CareLog | null>(null);
  const [loading, setLoading] = useState(true);

  // Permission checks
  const { canEdit, canDelete, isRelative } = usePermissions();
  const isReadOnly = route.params?.isReadOnly || isRelative();

  // Load log details when screen comes into focus (handles both initial load and refresh)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadLogDetails();
    });
    return unsubscribe;
  }, [navigation]);

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
                    onPress: () => navigation.navigate('CareLogList'),
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
      case 'happy': return '😊';
      case 'calm': return '😌';
      case 'anxious': return '😰';
      case 'sad': return '😢';
      case 'agitated': return '😠';
      default: return '😐';
    }
  };

  const getVisitTypeColor = (visitType: string) => {
    switch (visitType) {
      case 'routine': return '#3b82f6';
      case 'urgent': return '#ef4444';
      case 'follow_up': return '#f59e0b';
      default: return '#6b7280';
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
        {!isReadOnly && canEdit('logs') ? (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('EditCareLog', { logId: log.log_id })}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 60 }} />
        )}
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
              {/* DATE FORMATTED HERE */}
              <Text style={styles.dateTimeValue}>{formatDate(log.visit_date)}</Text>
            </View>
            <View style={styles.dateTimeItem}>
              <Text style={styles.dateTimeLabel}>🕐 Time</Text>
              <Text style={styles.dateTimeValue}>{log.visit_time}</Text>
            </View>
            <View style={styles.dateTimeItem}>
              <Text style={styles.dateTimeLabel}>⏱️ Duration</Text>
              <Text style={styles.dateTimeValue}>{String(log.duration_minutes || 0)} mins</Text>
            </View>
          </View>
        </View>

        {/* Activities Performed */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activities Performed</Text>

          <View style={styles.activitiesGrid}>
            {log.personal_care && (
              <View style={styles.activityCard}>
                <Text style={styles.activityIcon}>🛁</Text>
                <Text style={styles.activityLabel}>Personal Care</Text>
              </View>
            )}
            {log.medication && (
              <View style={styles.activityCard}>
                <Text style={styles.activityIcon}>💊</Text>
                <Text style={styles.activityLabel}>Medication</Text>
              </View>
            )}
            {log.meal_preparation && (
              <View style={styles.activityCard}>
                <Text style={styles.activityIcon}>🍽️</Text>
                <Text style={styles.activityLabel}>Meal Prep</Text>
              </View>
            )}
            {log.housekeeping && (
              <View style={styles.activityCard}>
                <Text style={styles.activityIcon}>🧹</Text>
                <Text style={styles.activityLabel}>Housekeeping</Text>
              </View>
            )}
            {log.companionship && (
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
                  <Text style={styles.vitalValue}>{String(log.temperature)}°C</Text>
                </View>
              )}
              {log.blood_pressure && (
                <View style={styles.vitalCard}>
                  <Text style={styles.vitalIcon}>💉</Text>
                  <Text style={styles.vitalLabel}>Blood Pressure</Text>
                  <Text style={styles.vitalValue}>{String(log.blood_pressure)}</Text>
                </View>
              )}
              {log.heart_rate && (
                <View style={styles.vitalCard}>
                  <Text style={styles.vitalIcon}>❤️</Text>
                  <Text style={styles.vitalLabel}>Heart Rate</Text>
                  <Text style={styles.vitalValue}>{String(log.heart_rate)} bpm</Text>
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
                <Text style={styles.moodValue}>{String(log.client_mood)}</Text>
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
        {log.follow_up_required && (
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
        {!isReadOnly && canDelete('logs') && (
          <View style={styles.section}>
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Text style={styles.deleteButtonText}>🗑️ Delete Care Log</Text>
            </TouchableOpacity>
          </View>
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