// src/screens/visits/VisitDetailScreen.tsx

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScreenWrapper } from '../../components';
import { visitApi } from '../../services/api/visitApi';
import { formatDate } from '../../utils/dateFormatter';
import { useFocusEffect } from '@react-navigation/native';
import { usePermissions } from '../../hooks/usePermissions';

interface VisitDetailScreenProps {
  route: any;
  navigation: any;
}

export default function VisitDetailScreen({ route, navigation }: VisitDetailScreenProps) {
  const { visitId } = route.params;
  const [visit, setVisit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Permission checks
  const { canEdit, canDelete, isRelative } = usePermissions();
  const isReadOnly = route.params?.isReadOnly || isRelative();

  useFocusEffect(
    useCallback(() => {
      loadVisitDetails();
      getCurrentUser();
    }, [visitId])
  );

  // 1. Get Logged-in User for Security Check
  const getCurrentUser = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('userData');
      if (jsonValue != null) {
        setCurrentUser(JSON.parse(jsonValue));
      }
    } catch (e) {
      // User load failed silently
    }
  };

  const loadVisitDetails = async () => {
    try {
      setLoading(true);
      const response = await visitApi.getVisit(visitId);
      if (response.success && response.data) {
        setVisit(response.data.visit);
      } else {
        Alert.alert('Error', response.message || 'Failed to load details');
      }
    } catch (error: any) {
      Alert.alert('Error', 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Visit', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await visitApi.deleteVisit(visitId);
            navigation.goBack();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete');
          }
        },
      },
    ]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return '#3b82f6';
      case 'confirmed': return '#10b981';
      case 'completed': return '#6b7280';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // 2. Logic: Only allow view if Admin or Assigned Driver
  const canViewTransportJob = () => {
    if (!visit || !currentUser) return false;
    
    // Admin Override
    if (currentUser.user?.role === 'admin') return true;

    // Check Driver ID match
    const staffId = currentUser.staff?.staff_id;
    // Note: visit.driver_id comes from our new API join
    if (staffId && visit.driver_id && parseInt(staffId) == parseInt(visit.driver_id)) {
      return true;
    }
    return false;
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </ScreenWrapper>
    );
  }

  if (!visit) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Visit not found</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBackButton} onPress={() => navigation.goBack()}>
          <Text style={styles.headerBackText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Visit Details</Text>
        {!isReadOnly && canEdit('visits') ? (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('EditVisit', { visitId: visit.visit_id })}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Main Info Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerCardTop}>
            <View>
              <Text style={styles.clientNameLarge}>{visit.client_name}</Text>
              <Text style={styles.staffNameLarge}>with {visit.staff_name}</Text>
            </View>
            <View style={[styles.statusBadgeLarge, { backgroundColor: getStatusColor(visit.status) }]}>
              <Text style={styles.statusTextLarge}>{visit.status?.toUpperCase()}</Text>
            </View>
          </View>
          <View style={styles.dateTimeRow}>
            <View style={styles.dateTimeItem}>
              <Text style={styles.dateTimeLabel}>📅 Date</Text>
              <Text style={styles.dateTimeValue}>{formatDate(visit.visit_date)}</Text>
            </View>
            <View style={styles.dateTimeItem}>
              <Text style={styles.dateTimeLabel}>🕐 Time</Text>
              <Text style={styles.dateTimeValue}>{visit.visit_time}</Text>
            </View>
            <View style={styles.dateTimeItem}>
              <Text style={styles.dateTimeLabel}>⏱️ Duration</Text>
              <Text style={styles.dateTimeValue}>{visit.estimated_duration} mins</Text>
            </View>
          </View>
        </View>

        {/* Transport Details - Shows Driver & Route */}
        {visit.transport_id && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Transport Details</Text>
            <View style={styles.transportBox}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>🚗 Driver:</Text>
                <Text style={styles.infoValue}>{visit.driver_name || 'Unassigned'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Status:</Text>
                <Text style={[styles.infoValue, { color: getStatusColor(visit.transport_status) }]}>
                  {visit.transport_status?.toUpperCase()}
                </Text>
              </View>
              <View style={{ marginTop: 8 }}>
                <Text style={styles.infoLabel}>📍 Pickup:</Text>
                <Text style={styles.routeText}>{visit.pickup_location || 'Office/Home'}</Text>
                <Text style={styles.arrowText}>⬇</Text>
                <Text style={styles.infoLabel}>🎯 Dropoff:</Text>
                <Text style={styles.routeText}>{visit.dropoff_location || 'Client Address'}</Text>
              </View>
              
              {/* BUTTON HIDDEN FOR CARERS/PASSENGERS */}
              {canViewTransportJob() ? (
                <TouchableOpacity
                  style={styles.transportButton}
                  onPress={() => {
                    // Navigate to detail screen if visit is completed, execution screen otherwise
                    if (visit.status === 'completed' || visit.status === 'cancelled') {
                      navigation.navigate('TransportDetail', { transportId: visit.transport_id });
                    } else {
                      navigation.navigate('TransportExecution', { transportId: visit.transport_id });
                    }
                  }}
                >
                  <Text style={styles.transportButtonText}>
                    {visit.status === 'completed' || visit.status === 'cancelled' ? 'View Transport Details' : 'View Job Status / Start'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.passengerNote}>
                  <Text style={styles.passengerNoteText}>
                    ℹ️ You are the passenger. {visit.driver_name ? `Contact ${visit.driver_name} for updates.` : 'Driver not assigned yet.'}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Action Buttons - Only show for users with edit/delete permissions */}
        {!isReadOnly && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Actions</Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.startButton]}
                onPress={() => navigation.navigate('VisitExecution', { visitId: visit.visit_id })}
              >
                <Text style={styles.actionButtonText}>▶ Start Visit & Log</Text>
              </TouchableOpacity>
              {canDelete('visits') && (
                <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                  <Text style={styles.deleteButtonText}>🗑️ Delete Visit</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  // --- LAYOUT ---
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  
  // --- TEXT ---
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
  },

  // --- HEADER ---
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

  // --- MAIN CARD ---
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

  // --- SECTIONS ---
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

  // --- TRANSPORT BOX ---
  transportBox: {
    backgroundColor: '#fffbeb',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: 'bold',
  },
  routeText: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
    marginLeft: 12,
    marginBottom: 4,
  },
  arrowText: {
    fontSize: 16,
    color: '#94a3b8',
    marginLeft: 16,
    marginVertical: 2,
  },
  transportButton: {
    backgroundColor: '#f59e0b',
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
    marginTop: 12,
  },
  transportButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  passengerNote: {
    marginTop: 12,
    padding: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 6,
  },
  passengerNoteText: {
    fontSize: 13,
    color: '#92400e',
    fontStyle: 'italic',
    textAlign: 'center',
  },

  // --- ACTION BUTTONS ---
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#10b981',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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