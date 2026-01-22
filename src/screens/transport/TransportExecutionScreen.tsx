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

interface TransportExecutionScreenProps {
  navigation: any;
  route: any;
}

export default function TransportExecutionScreen({ 
  navigation, 
  route 
}: TransportExecutionScreenProps) {
  const { transportId } = route.params;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [transport, setTransport] = useState<any>(null);
  const [started, setStarted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [pickupTime, setPickupTime] = useState<Date | null>(null);
  const [formData, setFormData] = useState({ start_mileage: '', end_mileage: '', notes: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`https://albiscare.co.uk/api/v1/transport/get.php?id=${transportId}`);
      const json = await res.json();

      if (json.success && json.data?.transport) {
        const t = json.data.transport;
        setTransport(t);
        if (t.status === 'in_progress') {
          setStarted(true);
          if (t.actual_pickup_time) {
            setStartTime(new Date(t.actual_pickup_time));
            setPickupTime(new Date(t.actual_pickup_time));
          }
          setFormData(prev => ({ ...prev, start_mileage: t.start_mileage || '' }));
        }
      } else {
        Alert.alert('Error', 'Transport job not found');
        navigation.goBack();
      }
    } catch (e) {
      Alert.alert('Error', 'Network Error');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    if (!formData.start_mileage) return Alert.alert('Error', 'Enter start mileage');
    try {
      const now = new Date();
      await fetch(`https://albiscare.co.uk/api/v1/transport/update.php?id=${transportId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'in_progress', start_mileage: parseInt(formData.start_mileage), actual_pickup_time: now.toISOString() })
      });
      setStarted(true);
      setStartTime(now);
    } catch (e) { Alert.alert('Error', 'Failed to start'); }
  };

  const handleRecordPickup = () => {
    const now = new Date();
    setPickupTime(now);
    Alert.alert('Success', 'Passenger pickup confirmed!');
  };

  const handleComplete = async () => {
    if (!formData.end_mileage) return Alert.alert('Error', 'Enter end mileage');
    try {
      setSaving(true);
      await fetch(`https://albiscare.co.uk/api/v1/transport/update.php?id=${transportId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed', end_mileage: parseInt(formData.end_mileage), actual_dropoff_time: new Date().toISOString(), notes: formData.notes })
      });
      Alert.alert('Success', 'Transport completed successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('Dashboard') }
      ]);
    } catch (e) { Alert.alert('Error', 'Failed to complete'); } finally { setSaving(false); }
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) return <ScreenWrapper><ActivityIndicator size="large" color="#f59e0b" style={{marginTop:50}} /></ScreenWrapper>;
  if (!transport) return null;

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backTxt}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Transport Job</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{paddingBottom: 40}}>
        {/* Info Card */}
        <View style={styles.card}>
          <View style={{ marginBottom: 16 }}>
            <Text style={styles.label}>PASSENGER (CARER)</Text>
            <Text style={styles.passenger}>{transport.passenger_name || 'Staff Member'}</Text>
            {transport.passenger_phone && <Text style={styles.phoneText}>📞 {transport.passenger_phone}</Text>}
          </View>
          
          <View style={{ marginBottom: 16 }}>
            <Text style={styles.label}>DESTINATION CLIENT</Text>
            <Text style={styles.client}>{transport.client_name}</Text>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.subLabel}>DATE</Text>
              <Text style={styles.val}>{transport.transport_date}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.subLabel}>TIME</Text>
              <Text style={styles.val}>{formatTime(transport.pickup_time)}</Text>
            </View>
          </View>

          <View style={styles.routeBox}>
            <Text style={styles.label}>PICKUP</Text>
            <Text style={styles.addr}>{transport.pickup_location || 'Office / Home'}</Text>
            <Text style={styles.arrow}>⬇</Text>
            <Text style={styles.label}>DROPOFF</Text>
            <Text style={styles.addr}>{transport.dropoff_location || 'Client Address'}</Text>
          </View>
        </View>

        {/* Action Area */}
        {transport.status === 'completed' ? (
          <View style={styles.section}>
            <View style={[styles.progressBox, { backgroundColor: '#d1fae5' }]}>
              <Text style={[styles.progTxt, { color: '#065f46' }]}>
                ✓ Transport Completed
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.btnComplete, { backgroundColor: '#2563eb' }]}
              onPress={() => navigation.navigate('Dashboard')}
            >
              <Text style={styles.btnTxt}>Back to Dashboard</Text>
            </TouchableOpacity>
          </View>
        ) : !started ? (
          <View style={styles.section}>
            <Text style={styles.secTitle}>Start Transport</Text>
            <TextInput
              style={styles.input}
              placeholder="Start Mileage"
              keyboardType="numeric"
              value={formData.start_mileage}
              onChangeText={t => setFormData({ ...formData, start_mileage: t })}
            />
            <TouchableOpacity style={styles.btnStart} onPress={handleStart}>
              <Text style={styles.btnTxt}>Start Journey</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.progressBox}>
              <Text style={styles.progTxt}>
                🚀 In Progress... Started at {startTime?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>

            {!pickupTime ? (
              <View style={styles.section}>
                <TouchableOpacity style={styles.pickupButton} onPress={handleRecordPickup}>
                  <Text style={styles.pickupButtonIcon}>✓</Text>
                  <Text style={styles.pickupButtonText}>Passenger Picked Up</Text>
                </TouchableOpacity>
                <Text style={styles.buttonHint}>Tap when Passenger is onboard</Text>
              </View>
            ) : (
              <>
                <Text style={styles.secTitle}>Complete Transport</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="End Mileage" 
                  keyboardType="numeric" 
                  value={formData.end_mileage} 
                  onChangeText={t => setFormData({ ...formData, end_mileage: t })} 
                />
                <TextInput 
                  style={[styles.input, { height: 80, textAlignVertical: 'top' }]} 
                  placeholder="Notes..." 
                  multiline 
                  value={formData.notes} 
                  onChangeText={t => setFormData({ ...formData, notes: t })} 
                />
                <TouchableOpacity style={styles.btnComplete} onPress={handleComplete} disabled={saving}>
                  <Text style={styles.btnTxt}>Complete & Arrived</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  // --- HEADER ---
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  backBtn: {
    padding: 8,
  },
  backTxt: {
    color: '#f59e0b',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },

  // --- LAYOUT ---
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 30,
  },
  secTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },

  // --- CARDS ---
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  label: {
    fontSize: 11,
    color: '#888',
    fontWeight: 'bold',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  passenger: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  phoneText: {
    color: '#64748b',
    fontSize: 14,
  },
  client: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  col: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
  },
  subLabel: {
    fontSize: 10,
    color: '#888',
    fontWeight: '600',
  },
  val: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 2,
  },
  routeBox: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
  },
  addr: {
    fontSize: 15,
    color: '#333',
    marginBottom: 4,
    fontWeight: '500',
  },
  arrow: {
    fontSize: 18,
    color: '#ccc',
    marginVertical: 4,
    marginLeft: 4,
  },

  // --- INPUTS ---
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    marginBottom: 12,
    color: '#333',
  },
  buttonHint: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 12,
  },

  // --- BUTTONS ---
  btnStart: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  startButtonIcon: {
    fontSize: 20,
    marginRight: 8,
    color: 'white',
  },
  btnComplete: {
    backgroundColor: '#f59e0b',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  pickupButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  pickupButtonIcon: {
    fontSize: 20,
    marginRight: 8,
    color: 'white',
  },
  pickupButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  btnTxt: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // --- PROGRESS ---
  progressBox: {
    backgroundColor: '#d1fae5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  progTxt: {
    color: '#065f46',
    fontWeight: 'bold',
    fontSize: 14,
  },
}); 