// src/screens/visits/VisitListScreen.tsx

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { ScreenWrapper } from '../../components';
import { visitApi, ScheduledVisit } from '../../services/api/visitApi';
import { useFocusEffect } from '@react-navigation/native';
import { formatDate } from '../../utils/dateFormatter';
import { usePermissions } from '../../hooks/usePermissions';

interface VisitListScreenProps {
  navigation: any;
  route: any;
}

export default function VisitListScreen({ navigation, route }: VisitListScreenProps) {
  const [visits, setVisits] = useState<ScheduledVisit[]>([]);
  const [filteredVisits, setFilteredVisits] = useState<ScheduledVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Permission checks
  const { canCreate } = usePermissions();

  useFocusEffect(
    useCallback(() => {
      loadVisits();
    }, [])
  );

  const loadVisits = async () => {
    try {
      setLoading(true);

      // Build filters from route params (staff_id or client_id)
      const filters: any = {};
      if (route.params?.staff_id) filters.staff_id = route.params.staff_id;
      if (route.params?.client_id) filters.client_id = route.params.client_id;

      console.log('=== VISIT LIST DEBUG ===');
      console.log('Filters:', filters);

      const response = await visitApi.getVisits(Object.keys(filters).length > 0 ? filters : undefined);

      console.log('Visit API response:', JSON.stringify(response, null, 2));
      console.log('Visits count:', response.data?.visits?.length);

      if (response.success && response.data) {
        setVisits(response.data.visits || []);
        setFilteredVisits(response.data.visits || []);
      } else {
        console.log('Visit API failed:', response.message);
        Alert.alert('Error', response.message || 'Failed to load visits');
      }
    } catch (error: any) {
      console.error('Visit load error:', error);
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadVisits();
    setRefreshing(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterVisits(query, statusFilter);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    filterVisits(searchQuery, status);
  };

  const filterVisits = (query: string, status: string) => {
    let filtered = visits;

    if (status !== 'all') {
      filtered = filtered.filter((visit) => visit.status === status);
    }

    if (query.trim()) {
      const lowercaseQuery = query.toLowerCase();
      filtered = filtered.filter(
        (visit) =>
          visit.client_name?.toLowerCase().includes(lowercaseQuery) ||
          visit.staff_name?.toLowerCase().includes(lowercaseQuery) ||
          visit.visit_date?.includes(query)
      );
    }

    setFilteredVisits(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return '#3b82f6';
      case 'confirmed': return '#10b981';
      case 'in_progress': return '#f59e0b';
      case 'completed': return '#6b7280';
      case 'cancelled': return '#ef4444';
      case 'missed': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const renderVisitItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.visitCard}
      onPress={() => navigation.navigate('VisitDetail', { visitId: item.visit_id })}
    >
      <View style={styles.visitHeader}>
        <View style={styles.visitHeaderLeft}>
          <Text style={styles.clientName}>{item.client_name}</Text>
          <Text style={styles.staffName}>with {item.staff_name}</Text>
        </View>
        <View style={styles.badges}>
          <View 
            style={[
              styles.statusBadge, 
              { backgroundColor: getStatusColor(item.status || 'scheduled') }
            ]}
          >
            <Text style={styles.statusText}>
              {item.status?.toUpperCase() || 'SCHEDULED'}
            </Text>
          </View>
          
          {/* Transport Badge */}
          {item.transport_id && (
            <View style={styles.transportBadge}>
              <Text style={styles.transportText}>🚗 + Transport</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.visitInfo}>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>📅</Text>
          <Text style={styles.infoText}>{formatDate(item.visit_date)}</Text>
          <Text style={styles.infoDivider}>•</Text>
          <Text style={styles.infoIcon}>🕐</Text>
          <Text style={styles.infoText}>{item.visit_time}</Text>
        </View>

        {item.visit_type && (
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📋</Text>
            <Text style={styles.infoText}>
              {item.visit_type.replace('_', ' ')}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading visits...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scheduled Visits</Text>
        {canCreate('visits') ? (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('ScheduleVisit')}
          >
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 70 }} />
        )}
      </View>

      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by client, staff, or date..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Text style={styles.clearButton}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterContainer}>
        {['all', 'scheduled', 'confirmed', 'completed'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton, 
              statusFilter === status && styles.filterButtonActive
            ]}
            onPress={() => handleStatusFilter(status)}
          >
            <Text 
              style={[
                styles.filterButtonText, 
                statusFilter === status && styles.filterButtonTextActive
              ]}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{filteredVisits.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>
            {filteredVisits.filter((v) => v.visit_date === new Date().toISOString().split('T')[0]).length}
          </Text>
          <Text style={styles.statLabel}>Today</Text>
        </View>
      </View>

      <FlatList
        data={filteredVisits}
        renderItem={renderVisitItem}
        keyExtractor={(item) => item.visit_id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#2563eb']}
          />
        }
      />
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
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  addButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1e293b',
  },
  clearButton: {
    fontSize: 18,
    color: '#64748b',
    padding: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: 'white',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  filterButtonText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
  },
  visitCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
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
  visitHeaderLeft: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  staffName: {
    fontSize: 14,
    color: '#64748b',
  },
  badges: {
    alignItems: 'flex-end',
    gap: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  transportBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  transportText: {
    fontSize: 10,
    color: '#d97706',
    fontWeight: 'bold',
  },
  visitInfo: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#475569',
    textTransform: 'capitalize',
  },
  infoDivider: {
    marginHorizontal: 8,
    color: '#cbd5e1',
  },
});