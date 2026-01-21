// src/screens/relative/RelativeDashboardScreen.tsx

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScreenWrapper } from '../../components';
import { useFocusEffect } from '@react-navigation/native';

export default function RelativeDashboardScreen({ navigation }: any) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [])
  );

  const loadDashboard = async () => {
    try {
      setLoading(true);
      // 1. Get Logged-in Relative ID
      const jsonValue = await AsyncStorage.getItem('userData');
      const user = jsonValue != null ? JSON.parse(jsonValue) : null;
      
      if (!user?.user?.id) {
        Alert.alert('Error', 'Session expired. Please login again.');
        return;
      }

      setUserName(user.user.username || 'Relative');

      // 2. Fetch Data using the user ID (which matches rNo)
      const response = await fetch(`https://albiscare.co.uk/api/v1/relative/dashboard.php?relative_id=${user.user.id}`);
      const json = await response.json();

      if (json.success) {
        setData(json.data);
      } else {
        // If no client is linked, data will be null, handled in render
        console.log(json.message);
      }
    } catch (e) {
      Alert.alert('Error', 'Network error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  if (loading && !refreshing) {
    return (
      <ScreenWrapper>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </ScreenWrapper>
    );
  }

  // Formatting Date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  return (
    <ScreenWrapper>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.headerTitle}>{userName}</Text>
        </View>
        <TouchableOpacity onPress={() => loadDashboard()}>
          <Text style={styles.refreshIcon}>↻</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        
        {/* 1. MY LOVED ONE (Client Profile) */}
        {data?.client ? (
          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {data.client.cFName?.[0]}{data.client.cLName?.[0]}
                </Text>
              </View>
              <View>
                <Text style={styles.label}>LOVED ONE</Text>
                <Text style={styles.clientName}>
                  {data.client.cFName} {data.client.cLName}
                </Text>
                <Text style={styles.address}>
                  {data.client.cAddr1}, {data.client.cTown}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No care recipient linked to this account.</Text>
          </View>
        )}

        {/* 2. STATUS CARD (Next/Current Visit) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Latest Status</Text>
          {data?.status ? (
            <View style={[styles.statusCard, 
              data.status.status === 'in_progress' ? styles.activeBorder : styles.scheduledBorder
            ]}>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>
                  {data.status.status === 'in_progress' ? '🟢 CARER IS PRESENT' : '📅 NEXT VISIT'}
                </Text>
                <Text style={styles.statusTime}>
                  {formatDate(data.status.visit_date)} @ {data.status.visit_time?.substring(0,5)}
                </Text>
              </View>
              
              <View style={styles.carerRow}>
                <Text style={styles.carerLabel}>Carer:</Text>
                <Text style={styles.carerName}>{data.status.carer_name || 'Allocating...'}</Text>
              </View>

              {data.status.visit_type && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{data.status.visit_type.toUpperCase()}</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>No upcoming visits scheduled.</Text>
            </View>
          )}
        </View>

        {/* 3. RECENT ACTIVITY (History) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {data?.history && data.history.length > 0 ? (
            data.history.map((item: any, index: number) => (
              <View key={index} style={styles.historyItem}>
                <View style={styles.historyLeft}>
                  <Text style={styles.historyDate}>{formatDate(item.visit_date)}</Text>
                  <Text style={styles.historyTime}>{item.visit_time?.substring(0,5)}</Text>
                </View>
                <View style={styles.historyRight}>
                  <Text style={styles.historyTitle}>Visit Completed</Text>
                  <Text style={styles.historyCarer}>by {item.carer_name}</Text>
                  {item.notes ? (
                    <Text style={styles.historyNotes} numberOfLines={2}>"{item.notes}"</Text>
                  ) : null}
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No history available yet.</Text>
          )}
        </View>

      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  // --- LAYOUT ---
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, padding: 16 },
  section: { marginBottom: 24 },

  // --- HEADER ---
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  welcomeText: { fontSize: 14, color: '#64748b' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1e293b' },
  refreshIcon: { fontSize: 24, color: '#2563eb' },

  // --- PROFILE CARD ---
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    elevation: 3,
  },
  profileHeader: { flexDirection: 'row', alignItems: 'center' },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#bfdbfe'
  },
  avatarText: { fontSize: 18, fontWeight: 'bold', color: '#2563eb' },
  label: { fontSize: 10, fontWeight: '700', color: '#94a3b8', letterSpacing: 1 },
  clientName: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  address: { fontSize: 13, color: '#64748b', marginTop: 2 },

  // --- STATUS CARD ---
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginBottom: 12 },
  statusCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    elevation: 2,
  },
  activeBorder: { borderLeftColor: '#10b981' }, // Green for In Progress
  scheduledBorder: { borderLeftColor: '#3b82f6' }, // Blue for Scheduled
  
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  statusLabel: { fontSize: 12, fontWeight: '800', color: '#1e293b' },
  statusTime: { fontSize: 14, fontWeight: '600', color: '#2563eb' },
  
  carerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  carerLabel: { fontSize: 14, color: '#64748b', marginRight: 6 },
  carerName: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  
  tag: { 
    alignSelf: 'flex-start', 
    backgroundColor: '#f1f5f9', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 6, 
    marginTop: 12 
  },
  tagText: { fontSize: 10, 
    fontWeight: 'bold', color: '#64748b' },

  // --- HISTORY LIST ---
  historyItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  historyLeft: {
    paddingRight: 12,
    borderRightWidth: 1,
    borderRightColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60
  },
  historyDate: { fontSize: 12, fontWeight: 'bold', color: '#1e293b', textAlign: 'center' },
  historyTime: { fontSize: 12, color: '#64748b', marginTop: 2 },
  
  historyRight: { flex: 1, paddingLeft: 12 },
  historyTitle: { fontSize: 14, fontWeight: '600', color: '#10b981' },
  historyCarer: { fontSize: 12, color: '#64748b' },
  historyNotes: { fontSize: 12, color: '#334155', fontStyle: 'italic', marginTop: 4 },

  // --- EMPTY STATES ---
  emptyCard: { padding: 20, backgroundColor: '#f8fafc', borderRadius: 12, alignItems: 'center' },
  infoCard: { padding: 16, backgroundColor: 'white', borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#eee' },
  infoText: { color: '#94a3b8' },
  emptyText: { color: '#94a3b8', textAlign: 'center', fontStyle: 'italic' },
});