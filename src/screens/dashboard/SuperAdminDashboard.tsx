// src/screens/dashboard/SuperAdminDashboard.tsx

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenWrapper } from '../../components';
import { staffApi } from '../../services/api/staffApi';
import { clientApi } from '../../services/api/clientApi';
import { visitApi } from '../../services/api/visitApi';

interface SuperAdminDashboardProps {
  userData: any;
  onLogout: () => void;
  navigation: any;
}

export default function SuperAdminDashboard({ userData, onLogout, navigation }: SuperAdminDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClients: 0,
    totalStaff: 0,
    totalVisits: 0,
    admins: 0,
    careManagers: 0,
    carers: 0,
    drivers: 0,
  });

  useFocusEffect(
    useCallback(() => {
      loadStats();
      return () => {};
    }, [])
  );

  const loadStats = async () => {
    try {
      setLoading(true);

      // Load all stats in parallel
      const [clientData, staffData, visitData] = await Promise.all([
        clientApi.getClients(),
        staffApi.getStaff(),
        visitApi.getVisits(),
      ]);

      if (clientData.success) {
        setStats(prev => ({ ...prev, totalClients: clientData.data?.total || 0 }));
      }

      if (staffData.success && staffData.data?.staff) {
        const staffList = staffData.data.staff;
        setStats(prev => ({
          ...prev,
          totalStaff: staffData.data?.total || 0,
          // Count by role_id (adjust these based on your actual role IDs)
          admins: staffList.filter((s: any) => s.role_id === 5 || s.is_admin).length,
          careManagers: staffList.filter((s: any) => s.role_id === 1).length,
          carers: staffList.filter((s: any) => s.role_id === 2).length,
          drivers: staffList.filter((s: any) => s.role_id === 4).length,
        }));
      }

      if (visitData.success) {
        setStats(prev => ({ ...prev, totalVisits: visitData.data?.visits?.length || 0 }));
      }

    } catch (error) {
      console.error('Error loading stats:', error);
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
    <ScreenWrapper>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{userData?.name || 'Super Admin'}</Text>
            <View style={styles.superBadge}>
              <Text style={styles.superBadgeText}>SUPER ADMIN</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats - Row 1 */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{loading ? '...' : stats.totalClients}</Text>
            <Text style={styles.statLabel}>Clients</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{loading ? '...' : stats.totalStaff}</Text>
            <Text style={styles.statLabel}>Staff</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{loading ? '...' : stats.totalVisits}</Text>
            <Text style={styles.statLabel}>Visits</Text>
          </View>
        </View>

        {/* Staff Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Staff Breakdown</Text>
          <View style={styles.breakdownGrid}>
            <View style={[styles.breakdownCard, { backgroundColor: '#fee2e2' }]}>
              <Text style={styles.breakdownNumber}>{stats.careManagers}</Text>
              <Text style={styles.breakdownLabel}>Care Managers</Text>
            </View>
            <View style={[styles.breakdownCard, { backgroundColor: '#dbeafe' }]}>
              <Text style={styles.breakdownNumber}>{stats.carers}</Text>
              <Text style={styles.breakdownLabel}>Carers</Text>
            </View>
            <View style={[styles.breakdownCard, { backgroundColor: '#fef3c7' }]}>
              <Text style={styles.breakdownNumber}>{stats.drivers}</Text>
              <Text style={styles.breakdownLabel}>Drivers</Text>
            </View>
            <View style={[styles.breakdownCard, { backgroundColor: '#f3e8ff' }]}>
              <Text style={styles.breakdownNumber}>{stats.admins}</Text>
              <Text style={styles.breakdownLabel}>Admins</Text>
            </View>
          </View>
        </View>

        {/* Super Admin Controls */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Super Admin Controls</Text>

          <TouchableOpacity
            style={[styles.actionCard, styles.superAdminCard]}
            onPress={() => navigation.navigate('AddStaff', { createAdmin: true })}
          >
            <Text style={styles.actionIcon}>👑</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Create Admin User</Text>
              <Text style={styles.actionDescription}>Add a new administrator to the system</Text>
            </View>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, styles.superAdminCard]}
            onPress={() => navigation.navigate('AddStaff', { createCareManager: true })}
          >
            <Text style={styles.actionIcon}>🔴</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Create Care Manager</Text>
              <Text style={styles.actionDescription}>Add a new care manager</Text>
            </View>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, styles.superAdminCard]}
            onPress={() => Alert.alert('System Settings', 'System configuration coming soon!')}
          >
            <Text style={styles.actionIcon}>⚙️</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>System Settings</Text>
              <Text style={styles.actionDescription}>Configure system preferences</Text>
            </View>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Standard Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Management</Text>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('StaffList')}
          >
            <Text style={styles.actionIcon}>👨‍⚕️</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Manage Staff</Text>
              <Text style={styles.actionDescription}>View and manage all staff members</Text>
            </View>
            <Text style={styles.actionArrow}>→</Text>
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
            <Text style={styles.actionArrow}>→</Text>
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
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('TransportList', { userData })}
          >
            <Text style={styles.actionIcon}>🚗</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Transport</Text>
              <Text style={styles.actionDescription}>Manage driver schedules</Text>
            </View>
            <Text style={styles.actionArrow}>→</Text>
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
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Analytics')}
          >
            <Text style={styles.actionIcon}>📊</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Analytics & Reports</Text>
              <Text style={styles.actionDescription}>View insights and statistics</Text>
            </View>
            <Text style={styles.actionArrow}>→</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 4,
  },
  superBadge: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  superBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#78350f',
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
    marginHorizontal: 16,
    marginTop: -12,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  section: {
    marginTop: 24,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  breakdownGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  breakdownCard: {
    width: '47%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  breakdownNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  breakdownLabel: {
    fontSize: 12,
    color: '#475569',
    marginTop: 4,
  },
  actionCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  superAdminCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#7c3aed',
  },
  actionIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  actionDescription: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  actionArrow: {
    fontSize: 18,
    color: '#94a3b8',
  },
});
