// src/screens/dashboard/DriverDashboard.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { ScreenWrapper } from '../../components';
import { transportApi } from '../../services/api/transportApi';

interface DriverDashboardProps {
  navigation?: any;
  userData?: any;
  onLogout?: () => void;
}

export default function DriverDashboard({ navigation, userData, onLogout }: DriverDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [todayTransports, setTodayTransports] = useState<any[]>([]);
  const [upcomingTransports, setUpcomingTransports] = useState<any[]>([]);
  const [stats, setStats] = useState({
    today: 0,
    upcoming: 0,
    completed: 0,
  });

 // Robust data extraction (prioritize flat structure, fallback to nested)
const driverId = userData?.id || userData?.staff?.staff_id || userData?.user?.id || 0;
const driverName = userData?.name || userData?.staff?.name || 'Driver';

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const today = new Date().toISOString().split('T')[0];
      
      const todayResponse = await transportApi.getDriverTodaySchedule(driverId);
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const upcomingResponse = await transportApi.getTransports({
        driver_id: driverId,
        start_date: tomorrow.toISOString().split('T')[0],
        end_date: nextWeek.toISOString().split('T')[0],
      });

      if (todayResponse.success) {
        const transports = todayResponse.data?.transports || [];
        setTodayTransports(transports);
        
        const completed = transports.filter((t: any) => t.status === 'completed').length;
        
        setStats(prev => ({
          ...prev,
          today: transports.length,
          completed: completed,
        }));
      }

      if (upcomingResponse.success) {
        const transports = upcomingResponse.data?.transports || [];
        setUpcomingTransports(transports);
        setStats(prev => ({ ...prev, upcoming: transports.length }));
      }

    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            if (onLogout) {
              onLogout();
            }
          },
        },
      ]
    );
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
          <Text style={styles.loadingText}>Loading your schedule...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.userName}>{driverName}</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation?.navigate('Profile')}
          >
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.today}</Text>
            <Text style={styles.statLabel}>Today's Jobs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.upcoming}</Text>
            <Text style={styles.statLabel}>Upcoming</Text>
          </View>
        </View>

        {/* Today's Transports */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🚗 Today's Schedule</Text>
            <Text style={styles.sectionDate}>{new Date().toLocaleDateString('en-GB')}</Text>
          </View>

          {todayTransports.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🎉</Text>
              <Text style={styles.emptyText}>No transports scheduled for today</Text>
            </View>
          ) : (
            todayTransports.map((transport) => (
              <TouchableOpacity
                key={transport.transport_id}
                style={styles.transportCard}
                onPress={() => {
                  if (transport.status === 'scheduled') {
                    navigation?.navigate('TransportExecution', { 
                      transportId: transport.transport_id,
                      userData: userData
                    });
                  } else {
                    navigation?.navigate('TransportDetail', { 
                      transportId: transport.transport_id 
                    });
                  }
                }}
              >
                <View style={styles.transportHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.clientName}>{transport.client_name}</Text>
                    <Text style={styles.transportTime}>
                      🕐 Pickup: {formatTime(transport.pickup_time)}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(transport.status) },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {transport.status?.toUpperCase().replace('_', ' ')}
                    </Text>
                  </View>
                </View>

                <View style={styles.locationSection}>
                  <View style={styles.locationRow}>
                    <Text style={styles.locationIcon}>📍</Text>
                    <View style={styles.locationInfo}>
                      <Text style={styles.locationLabel}>Pickup</Text>
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
                      <Text style={styles.locationLabel}>Drop-off</Text>
                      <Text style={styles.locationText}>
                        {transport.dropoff_location || 'To be confirmed'}
                      </Text>
                    </View>
                  </View>
                </View>

                {transport.purpose && (
                  <View style={styles.purposeBox}>
                    <Text style={styles.purposeText}>📋 {transport.purpose}</Text>
                  </View>
                )}

                {transport.special_requirements && (
                  <View style={styles.requirementsBox}>
                    <Text style={styles.requirementsText}>
                      ⚠️ {transport.special_requirements}
                    </Text>
                  </View>
                )}

                {transport.status === 'scheduled' && (
                  <View style={styles.transportAction}>
                    <Text style={styles.actionText}>Tap to start transport →</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Upcoming Transports */}
        {upcomingTransports.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📆 Upcoming This Week</Text>

            {upcomingTransports.slice(0, 5).map((transport) => (
              <TouchableOpacity
                key={transport.transport_id}
                style={styles.upcomingCard}
                onPress={() => navigation?.navigate('TransportDetail', { 
                  transportId: transport.transport_id 
                })}
              >
                <View style={styles.upcomingDate}>
                  <Text style={styles.upcomingDay}>
                    {new Date(transport.transport_date).toLocaleDateString('en-GB', { weekday: 'short' })}
                  </Text>
                  <Text style={styles.upcomingDateNum}>
                    {new Date(transport.transport_date).getDate()}
                  </Text>
                </View>
                <View style={styles.upcomingInfo}>
                  <Text style={styles.upcomingClient}>{transport.client_name}</Text>
                  <Text style={styles.upcomingTime}>
                    {formatTime(transport.pickup_time)} • {transport.transport_type}
                  </Text>
                  <Text style={styles.upcomingLocation} numberOfLines={1}>
                    📍 {transport.pickup_location || transport.cTown}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}

            {upcomingTransports.length > 5 && (
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => navigation?.navigate('MyTransports')}
              >
                <Text style={styles.viewAllText}>View All Upcoming Transports →</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation?.navigate('MyTransportLogs')}
          >
            <Text style={styles.actionIcon}>📋</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>My Transport Logs</Text>
              <Text style={styles.actionDescription}>View your completed transports</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation?.navigate('MyTransports')}
          >
            <Text style={styles.actionIcon}>🗓️</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Full Schedule</Text>
              <Text style={styles.actionDescription}>View all your assigned transports</Text>
            </View>
          </TouchableOpacity>

          {/* Logout Button */}
          <TouchableOpacity
            style={[styles.actionCard, styles.logoutCard]}
            onPress={handleLogout}
          >
            <Text style={styles.actionIcon}>🚪</Text>
            <View style={styles.actionContent}>
              <Text style={[styles.actionTitle, styles.logoutText]}>Logout</Text>
              <Text style={styles.actionDescription}>Sign out of your account</Text>
            </View>
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
  header: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: '#fef3c7',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 4,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIcon: {
    fontSize: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: -20,
    marginHorizontal: 16,
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
    textAlign: 'center',
  },
  section: {
    marginTop: 24,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 20,
  },
  sectionDate: {
    fontSize: 14,
    color: '#64748b',
  },
  emptyState: {
    backgroundColor: 'white',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
  },
  transportCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  transportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  clientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  transportTime: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  locationSection: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  locationIcon: {
    fontSize: 20,
    marginRight: 8,
    marginTop: 2,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  locationText: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  locationDivider: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  locationArrow: {
    fontSize: 16,
    color: '#94a3b8',
  },
  purposeBox: {
    backgroundColor: '#eff6ff',
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
  },
  purposeText: {
    fontSize: 13,
    color: '#1e40af',
  },
  requirementsBox: {
    backgroundColor: '#fef3c7',
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
  },
  requirementsText: {
    fontSize: 13,
    color: '#92400e',
  },
  transportAction: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  actionText: {
    fontSize: 14,
    color: '#f59e0b',
    fontWeight: '600',
    textAlign: 'center',
  },
  upcomingCard: {
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
  upcomingDate: {
    width: 60,
    alignItems: 'center',
    marginRight: 16,
  },
  upcomingDay: {
    fontSize: 12,
    color: '#64748b',
    textTransform: 'uppercase',
  },
  upcomingDateNum: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  upcomingInfo: {
    flex: 1,
  },
  upcomingClient: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  upcomingTime: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  upcomingLocation: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  viewAllButton: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  viewAllText: {
    fontSize: 14,
    color: '#f59e0b',
    fontWeight: '600',
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
  },
  actionDescription: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  logoutCard: {
    borderWidth: 1,
    borderColor: '#fee2e2',
    backgroundColor: '#fef2f2',
  },
  logoutText: {
    color: '#dc2626',
  },
});