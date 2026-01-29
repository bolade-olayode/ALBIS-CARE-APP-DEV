// src/screens/dashboard/CareManagerDashboard.tsx

import React, { useState } from 'react';
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
import { clientApi } from '../../services/api/clientApi';
import { visitApi } from '../../services/api/visitApi';

interface CareManagerDashboardProps {
  userData: any;
  onLogout: () => void;
  navigation: any;
}

export default function CareManagerDashboard({ userData, onLogout, navigation }: CareManagerDashboardProps) {
  const [clientCount, setClientCount] = useState<number>(0);
  const [todayVisits, setTodayVisits] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Get care manager name
  const managerName = userData?.name || userData?.staff?.name || userData?.email || 'Care Manager';

  useFocusEffect(
    useCallback(() => {
      loadStats();
      return () => {};
    }, [])
  );

  const loadStats = async () => {
    try {
      // Load client count
      const clientData = await clientApi.getClients();
      if (clientData.success) {
        setClientCount(clientData.data?.total || 0);
      }

      // Load today's visits count
      const today = new Date().toISOString().split('T')[0];
      const visitsData = await visitApi.getVisits({ start_date: today, end_date: today });
      if (visitsData.success) {
        setTodayVisits(visitsData.data?.visits?.length || 0);
      }
    } catch (error) {
      // Stats load failed silently
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: onLogout },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.roleBadge}>{managerName}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>CARE MANAGER</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
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
            <Text style={styles.statNumber}>{loading ? '...' : todayVisits}</Text>
            <Text style={styles.statLabel}>Today's Visits</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>

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
            <Text style={styles.actionDescription}>Assign care visits to staff</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('TransportList', { userData })}
        >
          <Text style={styles.actionIcon}>🚗</Text>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Transport</Text>
            <Text style={styles.actionDescription}>Manage transport schedules</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('CareLogList')}
        >
          <Text style={styles.actionIcon}>📋</Text>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Care Logs</Text>
            <Text style={styles.actionDescription}>View completed care logs</Text>
          </View>
        </TouchableOpacity>

        {/* Profile Section */}
        <Text style={styles.sectionTitle}>Account</Text>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.actionIcon}>👤</Text>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>My Profile</Text>
            <Text style={styles.actionDescription}>View and edit your profile</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('ChangePassword')}
        >
          <Text style={styles.actionIcon}>🔑</Text>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Change Password</Text>
            <Text style={styles.actionDescription}>Update your login password</Text>
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
    backgroundColor: '#ec4899',
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
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 1,
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
