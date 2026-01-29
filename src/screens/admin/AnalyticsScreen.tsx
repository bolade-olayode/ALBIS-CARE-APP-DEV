// src/screens/admin/AnalyticsScreen.tsx

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
  Alert,
  TouchableOpacity
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScreenWrapper } from '../../components';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { useFocusEffect } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

export default function AnalyticsScreen({ navigation }: any) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // NEW: State for Range Filter
  const [range, setRange] = useState('7d'); // Options: 1d, 7d, 30d, all

  useFocusEffect(
    useCallback(() => {
      loadAnalytics(range);
    }, [range])
  );

  const loadAnalytics = async (selectedRange: string) => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem('authToken');

      const response = await fetch(`https://albiscare.co.uk/api/v1/analytics/dashboard.php?range=${selectedRange}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const json = await response.json();

      if (json.success) {
        setData(json.data);
      } else {
        Alert.alert('Error', json.message || 'Failed to load analytics');
      }
    } catch (e: any) {
      Alert.alert('Error', 'Network error: ' + e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAnalytics(range);
  };

  // Helper to render Filter Tabs
  const renderFilterTab = (label: string, value: string) => (
    <TouchableOpacity
      style={[styles.filterTab, range === value && styles.filterTabActive]}
      onPress={() => setRange(value)}
    >
      <Text style={[styles.filterText, range === value && styles.filterTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </ScreenWrapper>
    );
  }

  // Chart Data Preparation
  const trendLabels = data?.trend?.map((d: any) => d.label) || [];
  const trendValues = data?.trend?.map((d: any) => d.count) || [];

  const pieData = [
    { name: 'Done', population: parseInt(data?.status_breakdown?.completed || 0), color: '#10b981', legendFontColor: '#7F7F7F', legendFontSize: 12 },
    { name: 'Sched', population: parseInt(data?.status_breakdown?.scheduled || 0), color: '#3b82f6', legendFontColor: '#7F7F7F', legendFontSize: 12 },
    { name: 'Missed', population: parseInt(data?.status_breakdown?.cancelled || 0) + parseInt(data?.status_breakdown?.missed || 0), color: '#ef4444', legendFontColor: '#7F7F7F', legendFontSize: 12 },
  ];

  return (
    <ScreenWrapper>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Analytics</Text>
        </View>
        <View style={{ width: 60 }} />
      </View>

      {/* FILTER TABS */}
      <View style={styles.filterContainer}>
        {renderFilterTab('Today', '1d')}
        {renderFilterTab('7 Days', '7d')}
        {renderFilterTab('30 Days', '30d')}
        {renderFilterTab('All Time', 'all')}
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        
        {/* KPI CARDS (Dynamic based on filter) */}
        <View style={styles.kpiContainer}>
          <View style={[styles.kpiCard, { borderLeftColor: '#3b82f6' }]}>
            <Text style={styles.kpiLabel}>Total Visits</Text>
            <Text style={[styles.kpiValue, { color: '#3b82f6' }]}>{data?.total_visits || 0}</Text>
          </View>

          <View style={[styles.kpiCard, { borderLeftColor: '#10b981' }]}>
            <Text style={styles.kpiLabel}>Completion</Text>
            <Text style={[styles.kpiValue, { color: '#10b981' }]}>{data?.completion_rate || 0}%</Text>
          </View>

          <View style={[styles.kpiCard, { borderLeftColor: '#f59e0b' }]}>
            <Text style={styles.kpiLabel}>Staff Active</Text>
            <Text style={[styles.kpiValue, { color: '#f59e0b' }]}>{data?.active_staff || 0}</Text>
          </View>
        </View>

        {/* TREND CHART */}
        <View style={styles.chartCard}>
          <Text style={styles.sectionTitle}>
            {range === '1d' ? 'Hourly Activity' : 'Visit Trend'}
          </Text>
          {trendLabels.length > 0 ? (
            <LineChart
              data={{
                labels: trendLabels,
                datasets: [{ data: trendValues }]
              }}
              width={screenWidth - 64}
              height={220}
              yAxisInterval={1}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                propsForDots: { r: '4', strokeWidth: '2', stroke: '#2563eb' }
              }}
              bezier
              style={styles.chart}
            />
          ) : (
            <Text style={styles.emptyText}>No data available for this period.</Text>
          )}
        </View>

        {/* QUICK ACTIONS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Management</Text>
          <View style={styles.gridButtons}>
            <TouchableOpacity style={styles.gridBtn} onPress={() => navigation.navigate('ClientList')}>
              <Text style={styles.gridIcon}>👥</Text>
              <Text style={styles.gridText}>Clients</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.gridBtn} onPress={() => navigation.navigate('StaffList')}>
              <Text style={styles.gridIcon}>🪪</Text>
              <Text style={styles.gridText}>Staff</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.gridBtn} onPress={() => navigation.navigate('TransportList')}>
              <Text style={styles.gridIcon}>🚗</Text>
              <Text style={styles.gridText}>Transport</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.gridBtn} onPress={() => navigation.navigate('VisitList')}>
              <Text style={styles.gridIcon}>📅</Text>
              <Text style={styles.gridText}>Visits</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* TOP STAFF */}
        <View style={styles.listCard}>
          <Text style={styles.sectionTitle}>⭐ Top Staff ({range.toUpperCase()})</Text>
          {data?.top_staff?.length > 0 ? (
            data.top_staff.map((staff: any, index: number) => (
              <View key={index} style={styles.staffRow}>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>#{index + 1}</Text>
                </View>
                <Text style={styles.staffName}>{staff.name}</Text>
                <Text style={styles.visitCount}>{staff.visits} visits</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No data for this period.</Text>
          )}
        </View>

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
    padding: 16,
  },

  // --- HEADER ---
  header: {
    padding: 16,
    paddingTop: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  backText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },

  // --- FILTER TABS ---
  filterContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'white',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
  },
  filterTab: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
  },
  filterTabActive: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  filterText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#2563eb',
    fontWeight: 'bold',
  },

  // --- KPI CARDS ---
  kpiContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 4,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    elevation: 2,
    minHeight: 90,
    justifyContent: 'center',
  },
  kpiLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  // --- CHARTS & SECTIONS ---
  chartCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    elevation: 2,
    alignItems: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  emptyText: {
    color: '#94a3b8',
    fontStyle: 'italic',
    marginTop: 10,
  },

  // --- QUICK ACTIONS ---
  gridButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridBtn: {
    flexBasis: '48%',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    elevation: 2,
  },
  gridIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  gridText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },

  // --- LEADERBOARD ---
  listCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    elevation: 2,
  },
  staffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  rankBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 12,
  },
  rankText: {
    color: '#2563eb',
    fontWeight: 'bold',
    fontSize: 12,
  },
  staffName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  visitCount: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: 'bold',
  },
});