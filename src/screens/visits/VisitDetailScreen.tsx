// src/screens/visits/VisitDetailScreen.tsx

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
import { visitApi, ScheduledVisit } from '../../services/api/visitApi';

interface VisitDetailScreenProps {
  route: any;
  navigation: any;
}

export default function VisitDetailScreen({ route, navigation }: VisitDetailScreenProps) {
  const { visitId } = route.params;
  const [visit, setVisit] = useState<ScheduledVisit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVisitDetails();
  }, []);

  const loadVisitDetails = async () => {
    try {
      setLoading(true);
      const response = await visitApi.getVisit(visitId);

      if (response.success && response.data) {
        setVisit(response.data.visit);
      } else {
        Alert.alert('Error', response.message || 'Failed to load visit details');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Visit',
      'Are you sure you want to delete this scheduled visit? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await visitApi.deleteVisit(visitId);

              if (response.success) {
                Alert.alert('Success', 'Visit deleted successfully', [
                  {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                  },
                ]);
              } else {
                Alert.alert('Error', response.message || 'Failed to delete visit');
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Something went wrong');
            }
          },
        },
      ]
    );
  };

  const handleStatusChange = (newStatus: string) => {
    Alert.alert(
      'Change Status',
      `Change visit status to "${newStatus}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              const response = await visitApi.updateVisit(visitId, {
                ...visit,
                status: newStatus,
              } as ScheduledVisit);

              if (response.success) {
                Alert.alert('Success', 'Status updated successfully');
                loadVisitDetails();
              } else {
                Alert.alert('Error', response.message || 'Failed to update status');
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Something went wrong');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return '#3b82f6';
      case 'confirmed':
        return '#10b981';
      case 'in_progress':
        return '#f59e0b';
      case 'completed':
        return '#6b7280';
      case 'cancelled':
        return '#ef4444';
      case 'missed':
        return '#dc2626';
      default:
        return '#6b7280';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '#dc2626';
      case 'high':
        return '#f59e0b';
      case 'normal':
        return '#3b82f6';
      case 'low':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading visit details...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (!visit) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Visit not found</Text>
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
        <Text style={styles.headerTitle}>Visit Details</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditVisit', { visitId: visit.visit_id })}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Client & Staff Info */}
        <View style={styles.headerCard}>
          <View style={styles.headerCardTop}>
            <View>
              <Text style={styles.clientNameLarge}>{visit.client_name}</Text>
              <Text style={styles.staffNameLarge}>with {visit.staff_name}</Text>
            </View>
            <View style={styles.badges}>
              <View
                style={[
                  styles.statusBadgeLarge,
                  { backgroundColor: getStatusColor(visit.status || 'scheduled') },
                ]}
              >
                <Text style={styles.statusTextLarge}>
                  {visit.status?.toUpperCase() || 'SCHEDULED'}
                </Text>
              </View>
              {visit.priority && visit.priority !== 'normal' && (
                <View
                  style={[
                    styles.priorityBadgeLarge,
                    { backgroundColor: getPriorityColor(visit.priority) },
                  ]}
                >
                  <Text style={styles.priorityTextLarge}>
                    {visit.priority.toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.dateTimeRow}>
            <View style={styles.dateTimeItem}>
              <Text style={styles.dateTimeLabel}>📅 Date</Text>
              <Text style={styles.dateTimeValue}>{visit.visit_date}</Text>
            </View>
            <View style={styles.dateTimeItem}>
              <Text style={styles.dateTimeLabel}>🕐 Time</Text>
              <Text style={styles.dateTimeValue}>{visit.visit_time}</Text>
            </View>
            <View style={styles.dateTimeItem}>
              <Text style={styles.dateTimeLabel}>⏱️ Duration</Text>
              <Text style={styles.dateTimeValue}>{visit.estimated_duration || 0} mins</Text>
            </View>
          </View>
        </View>

        {/* Visit Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visit Information</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Visit Type:</Text>
            <Text style={styles.infoValue}>{visit.visit_type?.replace('_', ' ')}</Text>
          </View>

          {visit.service_type && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Service Type:</Text>
              <Text style={styles.infoValue}>{visit.service_type}</Text>
            </View>
          )}

          {visit.is_recurring === 1 && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Recurring:</Text>
              <Text style={styles.infoValue}>
                {visit.recurrence_pattern} 
                {visit.recurrence_end_date && ` (until ${visit.recurrence_end_date})`}
              </Text>
            </View>
          )}
        </View>

        {/* Instructions & Notes */}
        {(visit.special_instructions || visit.notes) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions & Notes</Text>

            {visit.special_instructions && (
              <>
                <Text style={styles.subsectionTitle}>Special Instructions</Text>
                <View style={styles.detailBox}>
                  <Text style={styles.detailText}>{visit.special_instructions}</Text>
                </View>
              </>
            )}

            {visit.notes && (
              <>
                <Text style={styles.subsectionTitle}>Notes</Text>
                <View style={styles.detailBox}>
                  <Text style={styles.detailText}>{visit.notes}</Text>
                </View>
              </>
            )}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <View style={styles.actionButtons}>
            {visit.status === 'scheduled' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.confirmButton]}
                onPress={() => handleStatusChange('confirmed')}
              >
                <Text style={styles.actionButtonText}>✓ Confirm Visit</Text>
              </TouchableOpacity>
            )}

            {(visit.status === 'scheduled' || visit.status === 'confirmed') && (
              <TouchableOpacity
                style={[styles.actionButton, styles.startButton]}
                onPress={() => handleStatusChange('in_progress')}
              >
                <Text style={styles.actionButtonText}>▶ Start Visit</Text>
              </TouchableOpacity>
            )}

            {visit.status === 'in_progress' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.completeButton]}
                onPress={() => handleStatusChange('completed')}
              >
                <Text style={styles.actionButtonText}>✓ Complete Visit</Text>
              </TouchableOpacity>
            )}

            {(visit.status === 'scheduled' || visit.status === 'confirmed') && (
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => handleStatusChange('cancelled')}
              >
                <Text style={styles.actionButtonText}>✕ Cancel Visit</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Delete Button */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>🗑️ Delete Visit</Text>
          </TouchableOpacity>
        </View>
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
  badges: {
    alignItems: 'flex-end',
    gap: 4,
  },
  statusBadgeLarge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusTextLarge: {
    fontSize: 11,
    color: 'white',
    fontWeight: 'bold',
  },
  priorityBadgeLarge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  priorityTextLarge: {
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
    textTransform: 'capitalize',
  },
  detailBox: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#1e293b',
    lineHeight: 20,
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#10b981',
  },
  startButton: {
    backgroundColor: '#f59e0b',
  },
  completeButton: {
    backgroundColor: '#6b7280',
  },
  cancelButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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