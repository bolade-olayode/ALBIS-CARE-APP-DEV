// src/screens/transport/TransportDetailScreen.tsx

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
import { transportApi, TransportLog } from '../../services/api/transportApi';
import { formatDate } from '../../utils/dateFormatter';
import { usePermissions } from '../../hooks/usePermissions';

interface TransportDetailScreenProps {
  route: any;
  navigation: any;
}

export default function TransportDetailScreen({ route, navigation }: TransportDetailScreenProps) {
  const { transportId } = route.params;
  const [transport, setTransport] = useState<TransportLog | null>(null);
  const [loading, setLoading] = useState(true);

  // Permission checks
  const { isRelative } = usePermissions();
  const isReadOnly = route.params?.isReadOnly || isRelative();

  // Load transport details when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadTransportDetails();
    });
    return unsubscribe;
  }, [navigation]);

  const loadTransportDetails = async () => {
    try {
      setLoading(true);
      // Get all transports and filter by ID (since there's no single transport endpoint)
      const response = await transportApi.getTransports();

      if (response.success && response.data) {
        const foundTransport = response.data.transports?.find(
          (t: TransportLog) => t.transport_id === transportId
        );

        if (foundTransport) {
          setTransport(foundTransport);
        } else {
          Alert.alert('Error', 'Transport not found');
        }
      } else {
        Alert.alert('Error', response.message || 'Failed to load transport details');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return '#3b82f6';
      case 'in_progress': return '#f59e0b';
      case 'completed': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getTransportTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'appointment': return '🏥';
      case 'shopping': return '🛒';
      case 'social': return '👥';
      case 'emergency': return '🚨';
      default: return '🚗';
    }
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading transport details...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (!transport) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Transport not found</Text>
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
        <Text style={styles.headerTitle}>Transport Details</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Client & Driver Info */}
        <View style={styles.headerCard}>
          <View style={styles.headerCardTop}>
            <View>
              <Text style={styles.clientNameLarge}>{transport.client_name}</Text>
              <Text style={styles.driverNameLarge}>Driver: {transport.driver_name}</Text>
            </View>
            <View
              style={[
                styles.statusBadgeLarge,
                { backgroundColor: getStatusColor(transport.status || 'scheduled') },
              ]}
            >
              <Text style={styles.statusTextLarge}>
                {transport.status?.replace('_', ' ').toUpperCase() || 'SCHEDULED'}
              </Text>
            </View>
          </View>

          <View style={styles.dateTimeRow}>
            <View style={styles.dateTimeItem}>
              <Text style={styles.dateTimeLabel}>📅 Date</Text>
              <Text style={styles.dateTimeValue}>{formatDate(transport.transport_date)}</Text>
            </View>
            <View style={styles.dateTimeItem}>
              <Text style={styles.dateTimeLabel}>🕐 Pickup</Text>
              <Text style={styles.dateTimeValue}>
                {transport.actual_pickup_time?.substring(0, 5) || transport.pickup_time?.substring(0, 5)}
              </Text>
            </View>
            {transport.actual_dropoff_time && (
              <View style={styles.dateTimeItem}>
                <Text style={styles.dateTimeLabel}>🕐 Dropoff</Text>
                <Text style={styles.dateTimeValue}>
                  {transport.actual_dropoff_time.substring(0, 5)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Transport Type & Purpose */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transport Information</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              {getTransportTypeIcon(transport.transport_type)} Type:
            </Text>
            <Text style={styles.infoValue}>
              {transport.transport_type?.replace('_', ' ').toUpperCase()}
            </Text>
          </View>

          {transport.purpose && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📋 Purpose:</Text>
              <Text style={styles.infoValue}>{transport.purpose}</Text>
            </View>
          )}

          {transport.vehicle_reg && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>🚗 Vehicle:</Text>
              <Text style={styles.infoValue}>{transport.vehicle_reg}</Text>
            </View>
          )}
        </View>

        {/* Route Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Route</Text>

          <View style={styles.routeCard}>
            <View style={styles.routePoint}>
              <Text style={styles.routeIcon}>📍</Text>
              <View style={styles.routeInfo}>
                <Text style={styles.routeLabel}>Pickup Location</Text>
                <Text style={styles.routeAddress}>{transport.pickup_location}</Text>
              </View>
            </View>

            <View style={styles.routeLine} />

            <View style={styles.routePoint}>
              <Text style={styles.routeIcon}>🎯</Text>
              <View style={styles.routeInfo}>
                <Text style={styles.routeLabel}>Dropoff Location</Text>
                <Text style={styles.routeAddress}>{transport.dropoff_location}</Text>
              </View>
            </View>
          </View>

          {(transport.distance_miles || transport.duration_minutes) && (
            <View style={styles.routeStats}>
              {transport.distance_miles && (
                <View style={styles.statCard}>
                  <Text style={styles.statIcon}>📏</Text>
                  <Text style={styles.statValue}>{transport.distance_miles}</Text>
                  <Text style={styles.statLabel}>miles</Text>
                </View>
              )}
              {transport.duration_minutes && (
                <View style={styles.statCard}>
                  <Text style={styles.statIcon}>⏱️</Text>
                  <Text style={styles.statValue}>{transport.duration_minutes}</Text>
                  <Text style={styles.statLabel}>minutes</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Mileage Information */}
        {(transport.start_mileage || transport.end_mileage) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mileage</Text>

            <View style={styles.mileageRow}>
              {transport.start_mileage && (
                <View style={styles.mileageCard}>
                  <Text style={styles.mileageLabel}>Start</Text>
                  <Text style={styles.mileageValue}>{transport.start_mileage}</Text>
                </View>
              )}
              {transport.end_mileage && (
                <View style={styles.mileageCard}>
                  <Text style={styles.mileageLabel}>End</Text>
                  <Text style={styles.mileageValue}>{transport.end_mileage}</Text>
                </View>
              )}
              {transport.start_mileage && transport.end_mileage && (
                <View style={styles.mileageCard}>
                  <Text style={styles.mileageLabel}>Total</Text>
                  <Text style={styles.mileageValue}>
                    {transport.end_mileage - transport.start_mileage}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Client Condition & Requirements */}
        {(transport.client_condition || transport.special_requirements) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Client Information</Text>

            {transport.client_condition && (
              <>
                <Text style={styles.subsectionTitle}>Condition on Arrival</Text>
                <View style={styles.detailBox}>
                  <Text style={styles.detailText}>{transport.client_condition}</Text>
                </View>
              </>
            )}

            {transport.special_requirements && (
              <>
                <Text style={styles.subsectionTitle}>Special Requirements</Text>
                <View style={[styles.detailBox, styles.requirementsBox]}>
                  <Text style={styles.detailText}>{transport.special_requirements}</Text>
                </View>
              </>
            )}
          </View>
        )}

        {/* Notes */}
        {transport.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.detailBox}>
              <Text style={styles.detailText}>{transport.notes}</Text>
            </View>
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
  driverNameLarge: {
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
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    width: 140,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1e293b',
    flex: 1,
    textTransform: 'capitalize',
  },
  routeCard: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 8,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  routeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  routeInfo: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  routeAddress: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  routeLine: {
    width: 2,
    height: 24,
    backgroundColor: '#cbd5e1',
    marginLeft: 12,
    marginVertical: 8,
  },
  routeStats: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  mileageRow: {
    flexDirection: 'row',
    gap: 12,
  },
  mileageCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  mileageLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  mileageValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  detailBox: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  requirementsBox: {
    backgroundColor: '#fef3c7',
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
});
