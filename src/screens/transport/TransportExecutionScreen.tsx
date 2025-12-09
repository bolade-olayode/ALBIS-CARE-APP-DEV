// src/screens/transport/TransportExecutionScreen.tsx

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
} from 'react-native';
import { ScreenWrapper } from '../../components';
import { transportApi } from '../../services/api/transportApi';

interface TransportExecutionScreenProps {
  navigation: any;
  route: any;
}

export default function TransportExecutionScreen({ 
  navigation, 
  route 
}: TransportExecutionScreenProps) {
  const { transportId, userData } = route.params;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [transport, setTransport] = useState<any>(null);
  const [started, setStarted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [pickupTime, setPickupTime] = useState<Date | null>(null);

  // ✅ CHANGED: Get driver ID from userData passed via route params
  const driverId = userData?.staff?.staff_id || userData?.user?.id || 0;

  // Transport Form Data
  const [formData, setFormData] = useState({
    start_mileage: '',
    end_mileage: '',
    actual_pickup_time: '',
    actual_dropoff_time: '',
    distance_miles: '',
    duration_minutes: '',
    client_condition: '',
    notes: '',
  });

  useEffect(() => {
    loadTransportDetails();
  }, []);

  const loadTransportDetails = async () => {
    try {
      setLoading(true);
      
      // ✅ CHANGED: Use driverId from userData
      const response = await transportApi.getTransports({
        driver_id: driverId,
      });

      if (response.success) {
        const transports = response.data?.transports || [];
        const foundTransport = transports.find(
          (t: any) => t.transport_id === transportId
        );

        if (foundTransport) {
          setTransport(foundTransport);
          
          // If transport is already in progress, set started
          if (foundTransport.status === 'in_progress') {
            setStarted(true);
            setStartTime(new Date());
            if (foundTransport.actual_pickup_time) {
              setPickupTime(new Date(foundTransport.actual_pickup_time));
            }
            setFormData(prev => ({
              ...prev,
              start_mileage: foundTransport.start_mileage?.toString() || '',
            }));
          }
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

  const updateField = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleStartTransport = () => {
    if (!formData.start_mileage) {
      Alert.alert('Required', 'Please enter starting mileage');
      return;
    }

    Alert.alert(
      'Start Transport',
      `Start transport for ${transport.client_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          onPress: async () => {
            try {
              const now = new Date();
              const response = await transportApi.updateTransport(transportId, {
                status: 'in_progress',
                start_mileage: parseInt(formData.start_mileage),
                actual_pickup_time: now.toISOString(),
              });

              if (response.success) {
                setStarted(true);
                setStartTime(now);
                Alert.alert('Success', 'Transport started!');
              } else {
                Alert.alert('Error', response.message || 'Failed to start transport');
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Something went wrong');
            }
          },
        },
      ]
    );
  };

  const handleRecordPickup = () => {
    Alert.alert(
      'Record Pickup',
      `Confirm ${transport.client_name} has been picked up?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            const now = new Date();
            setPickupTime(now);
            updateField('actual_pickup_time', now.toISOString());
            Alert.alert('Success', 'Pickup time recorded!');
          },
        },
      ]
    );
  };

  const handleCompleteTransport = () => {
    // Validation
    if (!formData.end_mileage) {
      Alert.alert('Required', 'Please enter ending mileage');
      return;
    }

    if (!pickupTime) {
      Alert.alert('Required', 'Please record pickup time first');
      return;
    }

    const startMiles = parseInt(formData.start_mileage);
    const endMiles = parseInt(formData.end_mileage);

    if (endMiles < startMiles) {
      Alert.alert('Invalid', 'End mileage cannot be less than start mileage');
      return;
    }

    Alert.alert(
      'Complete Transport',
      'Mark this transport as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            setSaving(true);

            try {
              const now = new Date();
              const distance = endMiles - startMiles;
              
              // Calculate duration in minutes
              const durationMinutes = startTime
                ? Math.round((now.getTime() - startTime.getTime()) / 60000)
                : 0;

              const updateData = {
                status: 'completed',
                end_mileage: endMiles,
                actual_dropoff_time: now.toISOString(),
                distance_miles: distance,
                duration_minutes: durationMinutes,
                client_condition: formData.client_condition,
                notes: formData.notes,
              };

              const response = await transportApi.updateTransport(transportId, updateData);

              if (response.success) {
                Alert.alert(
                  'Success',
                  'Transport completed successfully!',
                  [
                    {
                      text: 'OK',
                      onPress: () => navigation.navigate('Dashboard'),
                    },
                  ]
                );
              } else {
                Alert.alert('Error', response.message || 'Failed to complete transport');
              }
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
          <ActivityIndicator size="large" color="#f59e0b" />
          <Text style={styles.loadingText}>Loading transport...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (!transport) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Transport not found</Text>
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
        <Text style={styles.headerTitle}>Transport Execution</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Transport Info Card */}
        <View style={styles.transportInfoCard}>
          <Text style={styles.clientNameLarge}>{transport.client_name}</Text>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>📅 Date</Text>
              <Text style={styles.infoValue}>{transport.transport_date}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>🕐 Pickup Time</Text>
              <Text style={styles.infoValue}>{formatTime(transport.pickup_time)}</Text>
            </View>
          </View>

          <View style={styles.locationCard}>
            <View style={styles.locationRow}>
              <Text style={styles.locationIcon}>📍</Text>
              <View style={styles.locationInfo}>
                <Text style={styles.locationLabel}>PICKUP</Text>
                <Text style={styles.locationText}>
                  {transport.pickup_location || `${transport.cAddr1}, ${transport.cTown}`}
                </Text>
              </View>
            </View>
            
            <View style={styles.locationDivider}>
              <Text style={styles.locationArrow}>↓</Text>
            </View>
            
            <View style={styles.locationRow}>
              <Text style={styles.locationIcon}>🎯</Text>
              <View style={styles.locationInfo}>
                <Text style={styles.locationLabel}>DROP-OFF</Text>
                <Text style={styles.locationText}>
                  {transport.dropoff_location || 'To be confirmed'}
                </Text>
              </View>
            </View>
          </View>

          {transport.purpose && (
            <View style={styles.purposeBox}>
              <Text style={styles.purposeTitle}>📋 Purpose</Text>
              <Text style={styles.purposeText}>{transport.purpose}</Text>
            </View>
          )}

          {transport.special_requirements && (
            <View style={styles.requirementsBox}>
              <Text style={styles.requirementsTitle}>⚠️ Special Requirements</Text>
              <Text style={styles.requirementsText}>{transport.special_requirements}</Text>
            </View>
          )}

          {/* Client Contact */}
          {transport.cTel && (
            <View style={styles.contactBox}>
              <Text style={styles.contactLabel}>📞 Client Phone:</Text>
              <Text style={styles.contactValue}>{transport.cTel}</Text>
            </View>
          )}
        </View>

        {/* Start Transport Section */}
        {!started ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🚗 Start Transport</Text>
            
            <Text style={styles.label}>Starting Mileage *</Text>
            <TextInput
              style={styles.input}
              value={formData.start_mileage}
              onChangeText={(text) => updateField('start_mileage', text)}
              placeholder="Enter current odometer reading"
              keyboardType="numeric"
            />

            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStartTransport}
            >
              <Text style={styles.startButtonIcon}>▶️</Text>
              <Text style={styles.startButtonText}>Start Transport</Text>
            </TouchableOpacity>
            <Text style={styles.buttonHint}>
              This will record the start time and begin tracking
            </Text>
          </View>
        ) : (
          <>
            {/* In Progress */}
            <View style={styles.progressCard}>
              <Text style={styles.progressLabel}>🚗 Transport In Progress</Text>
              <Text style={styles.progressTime}>
                Started at {startTime?.toLocaleTimeString('en-GB', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
              <Text style={styles.progressMileage}>
                Start: {formData.start_mileage} miles
              </Text>
            </View>

            {/* Pickup Confirmation */}
            {!pickupTime ? (
              <View style={styles.section}>
                <TouchableOpacity
                  style={styles.pickupButton}
                  onPress={handleRecordPickup}
                >
                  <Text style={styles.pickupButtonIcon}>✓</Text>
                  <Text style={styles.pickupButtonText}>Record Pickup Time</Text>
                </TouchableOpacity>
                <Text style={styles.buttonHint}>
                  Tap when client has been picked up
                </Text>
              </View>
            ) : (
              <View style={styles.pickupConfirmed}>
                <Text style={styles.pickupConfirmedIcon}>✓</Text>
                <View>
                  <Text style={styles.pickupConfirmedLabel}>Pickup Recorded</Text>
                  <Text style={styles.pickupConfirmedTime}>
                    {pickupTime?.toLocaleTimeString('en-GB', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </Text>
                </View>
              </View>
            )}

            {/* Complete Transport Form */}
            {pickupTime && (
              <>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>📝 Complete Transport</Text>

                  <Text style={styles.label}>Ending Mileage *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.end_mileage}
                    onChangeText={(text) => updateField('end_mileage', text)}
                    placeholder="Enter current odometer reading"
                    keyboardType="numeric"
                  />

                  {formData.start_mileage && formData.end_mileage && (
                    <View style={styles.distanceBox}>
                      <Text style={styles.distanceText}>
                        📏 Distance: {
                          parseInt(formData.end_mileage) - parseInt(formData.start_mileage)
                        } miles
                      </Text>
                    </View>
                  )}

                  <Text style={styles.label}>Client Condition</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={formData.client_condition}
                    onChangeText={(text) => updateField('client_condition', text)}
                    placeholder="How was the client during transport? Any issues or observations?"
                    multiline
                    numberOfLines={4}
                  />

                  <Text style={styles.label}>Additional Notes</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={formData.notes}
                    onChangeText={(text) => updateField('notes', text)}
                    placeholder="Traffic conditions, route taken, or any other relevant information"
                    multiline
                    numberOfLines={4}
                  />
                </View>

                {/* Complete Button */}
                <View style={styles.section}>
                  <TouchableOpacity
                    style={[styles.completeButton, saving && styles.completeButtonDisabled]}
                    onPress={handleCompleteTransport}
                    disabled={saving}
                  >
                    {saving ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <>
                        <Text style={styles.completeButtonIcon}>✓</Text>
                        <Text style={styles.completeButtonText}>Complete Transport</Text>
                      </>
                    )}
                  </TouchableOpacity>
                  <Text style={styles.buttonHint}>
                    This will mark the transport as completed and save all details
                  </Text>
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

// Keep all styles exactly as they were in the original file...
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
    backgroundColor: '#f59e0b',
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
    color: '#f59e0b',
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
  transportInfoCard: {
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
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  infoItem: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
  },
  infoLabel: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  locationCard: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  locationIcon: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 15,
    color: '#1e293b',
    fontWeight: '500',
    lineHeight: 22,
  },
  locationDivider: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  locationArrow: {
    fontSize: 20,
    color: '#94a3b8',
  },
  purposeBox: {
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  purposeTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 4,
  },
  purposeText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
  requirementsBox: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  requirementsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 4,
  },
  requirementsText: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
  },
  contactBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  contactLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  contactValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  section: {
    marginHorizontal: 16,
    marginTop: 16,
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
  startButton: {
    backgroundColor: '#10b981',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  startButtonIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonHint: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 12,
  },
  progressCard: {
    backgroundColor: '#10b981',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    marginBottom: 6,
  },
  progressTime: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    marginBottom: 4,
  },
  progressMileage: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  pickupButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 18,
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
  pickupButtonIcon: {
    fontSize: 24,
    color: 'white',
    marginRight: 12,
  },
  pickupButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  pickupConfirmed: {
    backgroundColor: '#d1fae5',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#10b981',
  },
  pickupConfirmedIcon: {
    fontSize: 32,
    color: '#10b981',
    marginRight: 16,
  },
  pickupConfirmedLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065f46',
  },
  pickupConfirmedTime: {
    fontSize: 14,
    color: '#047857',
    marginTop: 2,
  },
  distanceBox: {
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
  },
  completeButton: {
    backgroundColor: '#f59e0b',
    paddingVertical: 18,
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
});