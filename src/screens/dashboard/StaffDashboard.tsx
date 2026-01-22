// src/screens/dashboard/StaffDashboard.tsx

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
import { visitApi } from '../../services/api/visitApi';

interface StaffDashboardProps {
  navigation?: any;
  userData?: any;
  onLogout?: () => void;
}

export default function StaffDashboard({ navigation, userData, onLogout }: StaffDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [todayVisits, setTodayVisits] = useState<any[]>([]);
  const [upcomingVisits, setUpcomingVisits] = useState<any[]>([]);
  const [stats, setStats] = useState({ today: 0, upcoming: 0, completed: 0 });

  // --- ROBUST DATA EXTRACTION ---
  // 1. Get ID (Prioritize flat structure, fallback to nested)
  const staffId = userData?.id || userData?.staff?.staff_id || userData?.user?.id || 0;
  
  // 2. Get Name (Prioritize flat structure, fallback to nested)
  const staffName = userData?.name || userData?.staff?.name || userData?.user?.name || 'Staff Member';

  useEffect(() => {
    if (staffId) {
      loadDashboardData();
    } else {
      console.warn('No Staff ID found for dashboard');
      setLoading(false);
    }
  }, [staffId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const today = new Date().toISOString().split('T')[0];
      
      // Get Today's Visits
      const todayResponse = await visitApi.getStaffVisits(staffId, today, today);
      
      // Get Upcoming Visits
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const upcomingResponse = await visitApi.getStaffVisits(
        staffId,
        tomorrow.toISOString().split('T')[0],
        nextWeek.toISOString().split('T')[0]
      );

      if (todayResponse.success) {
        const visits = todayResponse.data?.visits || [];
        setTodayVisits(visits);
        const completed = visits.filter((v: any) => v.status === 'completed').length;
        setStats(prev => ({ ...prev, today: visits.length, completed: completed }));
      }

      if (upcomingResponse.success) {
        const visits = upcomingResponse.data?.visits || [];
        setUpcomingVisits(visits);
        setStats(prev => ({ ...prev, upcoming: visits.length }));
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
        { text: 'Logout', style: 'destructive', onPress: () => onLogout && onLogout() },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return '#3b82f6';
      case 'confirmed': return '#10b981';
      case 'in_progress': return '#f59e0b';
      case 'completed': return '#6b7280';
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
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading schedule...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.userName}>{staffName}</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => Alert.alert('Profile', 'Profile management coming soon!')}
          >
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.today}</Text>
            <Text style={styles.statLabel}>Today's Visits</Text>
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

        {/* Today's Visits */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📅 Today's Schedule</Text>
            <Text style={styles.sectionDate}>{new Date().toLocaleDateString('en-GB')}</Text>
          </View>

          {todayVisits.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🎉</Text>
              <Text style={styles.emptyText}>No visits scheduled for today</Text>
            </View>
          ) : (
            todayVisits.map((visit) => (
              <TouchableOpacity
                key={visit.visit_id}
                style={styles.visitCard}
                onPress={() => {
                  if (visit.status === 'scheduled' || visit.status === 'confirmed') {
                    navigation?.navigate('VisitExecution', { visitId: visit.visit_id, userData: userData });
                  } else {
                    navigation?.navigate('VisitDetail', { visitId: visit.visit_id });
                  }
                }}
              >
                <View style={styles.visitHeader}>
                  <View>
                    <Text style={styles.clientName}>{visit.client_name}</Text>
                    <Text style={styles.visitTime}>
                      🕐 {formatTime(visit.visit_time)} • {visit.estimated_duration || 60} mins
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(visit.status) }]}>
                    <Text style={styles.statusText}>{visit.status?.toUpperCase()}</Text>
                  </View>
                </View>

                <View style={styles.visitDetails}>
                  <Text style={styles.visitType}>📋 {visit.visit_type?.replace('_', ' ')}</Text>
                  {visit.special_instructions && (
                    <Text style={styles.visitInstructions} numberOfLines={2}>
                      ℹ️ {visit.special_instructions}
                    </Text>
                  )}
                </View>

                {(visit.status === 'scheduled' || visit.status === 'confirmed') && (
                  <View style={styles.visitAction}>
                    <Text style={styles.actionText}>Tap to start visit →</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Upcoming Visits */}
        {upcomingVisits.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📆 Upcoming This Week</Text>
            {upcomingVisits.slice(0, 5).map((visit) => (
              <TouchableOpacity
                key={visit.visit_id}
                style={styles.upcomingCard}
                onPress={() => navigation?.navigate('VisitDetail', { visitId: visit.visit_id })}
              >
                <View style={styles.upcomingDate}>
                  <Text style={styles.upcomingDay}>
                    {new Date(visit.visit_date).toLocaleDateString('en-GB', { weekday: 'short' })}
                  </Text>
                  <Text style={styles.upcomingDateNum}>
                    {new Date(visit.visit_date).getDate()}
                  </Text>
                </View>
                <View style={styles.upcomingInfo}>
                  <Text style={styles.upcomingClient}>{visit.client_name}</Text>
                  <Text style={styles.upcomingTime}>
                    {formatTime(visit.visit_time)} • {visit.visit_type?.replace('_', ' ')}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
             {upcomingVisits.length > 5 && (
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => navigation?.navigate('VisitList', { staff_id: staffId })}
              >
                <Text style={styles.viewAllText}>View All Upcoming Visits →</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation?.navigate('CareLogList', { staff_id: staffId })}>
            <Text style={styles.actionIcon}>📋</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>My Care Logs</Text>
              <Text style={styles.actionDescription}>View my completed care logs</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation?.navigate('VisitList', { staff_id: staffId })}>
            <Text style={styles.actionIcon}>📅</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>My Schedule</Text>
              <Text style={styles.actionDescription}>View my scheduled visits</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionCard, styles.logoutCard]} onPress={handleLogout}>
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
    backgroundColor: '#10b981',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: '#a7f3d0',
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
  visitCard: {
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
  visitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  clientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  visitTime: {
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
  visitDetails: {
    gap: 8,
  },
  visitType: {
    fontSize: 14,
    color: '#475569',
    textTransform: 'capitalize',
  },
  visitInstructions: {
    fontSize: 13,
    color: '#64748b',
    fontStyle: 'italic',
  },
  visitAction: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  actionText: {
    fontSize: 14,
    color: '#2563eb',
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
    color: '#2563eb',
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
    textTransform: 'capitalize',
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
    color: '#2563eb',
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