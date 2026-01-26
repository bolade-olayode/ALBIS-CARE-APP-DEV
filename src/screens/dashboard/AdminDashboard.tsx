import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { staffApi } from '../../services/api/staffApi';
import { clientApi } from '../../services/api/clientApi';

interface AdminDashboardProps {
  userData: any;
  onLogout: () => void;
  navigation: any;
}

export default function AdminDashboard({ userData, onLogout, navigation }: AdminDashboardProps) {
  const [clientCount, setClientCount] = useState<number>(0);
  const [staffCount, setStaffCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

 useFocusEffect(
  useCallback(() => {
    loadStats();
    // Return a cleanup function if needed (usually empty for simple fetch)
    return () => {}; 
  }, [])
);

  // DEBUG: Test Authorization
  const testAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const storedUserData = await AsyncStorage.getItem('userData');

      console.log('=== AUTH DEBUG ===');
      console.log('Token in AsyncStorage:', token ? `${token.substring(0, 30)}...` : 'NULL');
      console.log('UserData in AsyncStorage:', storedUserData ? 'EXISTS' : 'NULL');

      if (!token) {
        Alert.alert('Debug', 'NO TOKEN FOUND in AsyncStorage!\n\nThis is the problem - token was not saved after login.');
        return;
      }

      // Test 1: Direct fetch to staff endpoint
      console.log('Test 1: Direct fetch to staff endpoint...');
      const fetchResponse = await fetch('https://albiscare.co.uk/api/v1/staff/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const fetchData = await fetchResponse.json();
      console.log('Direct fetch response:', fetchData);

      // Test 2: Using apiClient (axios)
      console.log('Test 2: Using apiClient (axios)...');
      const axiosResponse = await staffApi.getStaff();
      console.log('Axios response:', axiosResponse);

      // Show results
      let message = `TOKEN FOUND: ${token.substring(0, 20)}...\n\n`;
      message += `FETCH Result: ${fetchData.success ? 'SUCCESS' : 'FAILED'}\n`;
      message += fetchData.success ? `Staff: ${fetchData.data?.total || 0}\n` : `Error: ${fetchData.message}\n`;
      message += `\nAXIOS Result: ${axiosResponse.success ? 'SUCCESS' : 'FAILED'}\n`;
      message += axiosResponse.success ? `Staff: ${axiosResponse.data?.total || 0}` : `Error: ${axiosResponse.message}`;

      Alert.alert('Auth Debug Results', message);
    } catch (error: any) {
      console.error('Auth test error:', error);
      Alert.alert('Error', `Test failed: ${error.message}`);
    }
  };

  const loadStats = async () => {
    try {
      console.log('=== AdminDashboard: Loading Stats ===');

      // Load client count using apiClient (includes Authorization header automatically)
      const clientData = await clientApi.getClients();
      console.log('Client data response:', clientData);
      if (clientData.success) {
        setClientCount(clientData.data?.total || 0);
      }

      // Load staff count using apiClient (includes Authorization header automatically)
      const staffData = await staffApi.getStaff();
      console.log('Staff data response:', staffData);
      if (staffData.success) {
        setStaffCount(staffData.data?.total || 0);
      }

      console.log('=== AdminDashboard: Stats Loaded ===');
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.roleBadge}>
              {userData?.is_super_admin
                ? 'Super Admin'
                : userData?.is_admin
                ? 'Admin'
                : userData?.name || userData?.email || 'Admin'}
            </Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{loading ? '...' : clientCount}</Text>
            <Text style={styles.statLabel}>Total Clients</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{loading ? '...' : staffCount}</Text>
            <Text style={styles.statLabel}>Active Staff</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Today's Visits</Text>
          </View>
        </View>

        {/* DEBUG: Test Auth Button */}
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: '#fef3c7', borderColor: '#f59e0b', borderWidth: 1 }]}
          onPress={testAuth}
        >
          <Text style={styles.actionIcon}>🔧</Text>
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, { color: '#92400e' }]}>Test Authorization</Text>
            <Text style={styles.actionDescription}>Debug: Check if token is working</Text>
          </View>
        </TouchableOpacity>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('StaffList')}
        >
          <Text style={styles.actionIcon}>👨‍⚕️</Text>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Manage Staff</Text>
            <Text style={styles.actionDescription}>View and manage staff members</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('ClientList')}
        >
          <Text style={styles.actionIcon}>👥</Text>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Manage Clients</Text>
            <Text style={styles.actionDescription}>View and manage care users</Text>
          </View>
        </TouchableOpacity>

   <TouchableOpacity
  style={styles.actionCard}
  onPress={() => navigation.navigate('VisitList')}
>
  <Text style={styles.actionIcon}>📅</Text>
  <View style={styles.actionContent}>
    <Text style={styles.actionTitle}>Schedule Visits</Text>
    <Text style={styles.actionDescription}>Create and manage care visits</Text>
  </View>
</TouchableOpacity>

<TouchableOpacity
  style={styles.actionCard}
  onPress={() => navigation.navigate('TransportList', { userData })} // Pass userData
>
  <Text style={styles.actionIcon}>🚗</Text>
  <View style={styles.actionContent}>
    <Text style={styles.actionTitle}>Transport</Text>
    <Text style={styles.actionDescription}>Manage driver schedules</Text>
  </View>
</TouchableOpacity>

<TouchableOpacity
  style={styles.actionCard}
  onPress={() => navigation.navigate('CareLogList')}
>
  <Text style={styles.actionIcon}>📋</Text>
  <View style={styles.actionContent}>
    <Text style={styles.actionTitle}>Care Logs</Text>
    <Text style={styles.actionDescription}>View and manage care visit logs</Text>
  </View>
</TouchableOpacity>

<TouchableOpacity 
  style={styles.actionCard}
  onPress={() => navigation.navigate('Analytics')}
>
    
          <Text style={styles.actionIcon}>📊</Text>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>View Reports</Text>
            <Text style={styles.actionDescription}>Analytics and insights</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
  },
  header: {
    backgroundColor: '#2563eb',
    padding: 20,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  roleBadge: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  actionCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  actionIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: '#64748b',
  },
});