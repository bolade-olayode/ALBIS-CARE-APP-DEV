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
  ScrollView,
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

const FILTERS = [
  { key: 'in_progress', label: 'In Progress', color: '#f59e0b', bg: '#fffbeb' },
  { key: 'all',         label: 'All',         color: '#2563eb', bg: '#eff6ff' },
  { key: 'scheduled',   label: 'Scheduled',   color: '#3b82f6', bg: '#eff6ff' },
  { key: 'confirmed',   label: 'Confirmed',   color: '#10b981', bg: '#ecfdf5' },
  { key: 'completed',   label: 'Completed',   color: '#6b7280', bg: '#f9fafb' },
  { key: 'missed',      label: 'Missed',      color: '#ef4444', bg: '#fef2f2' },
];

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  scheduled:   { label: 'Scheduled',   color: '#3b82f6', bg: '#dbeafe' },
  confirmed:   { label: 'Confirmed',   color: '#059669', bg: '#d1fae5' },
  in_progress: { label: 'In Progress', color: '#d97706', bg: '#fef3c7' },
  completed:   { label: 'Completed',   color: '#6b7280', bg: '#f3f4f6' },
  cancelled:   { label: 'Cancelled',   color: '#ef4444', bg: '#fee2e2' },
  missed:      { label: 'Missed',      color: '#dc2626', bg: '#fee2e2' },
};

function getStatusMeta(status: string) {
  return STATUS_META[status?.toLowerCase()] ?? { label: status ?? 'Unknown', color: '#6b7280', bg: '#f3f4f6' };
}

function formatTime(time: string) {
  if (!time) return '';
  const [h, m] = time.split(':');
  const hour = parseInt(h);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
}

export default function VisitListScreen({ navigation, route }: VisitListScreenProps) {
  const [visits, setVisits] = useState<ScheduledVisit[]>([]);
  const [filteredVisits, setFilteredVisits] = useState<ScheduledVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('in_progress');

  const { canCreate } = usePermissions();

  useFocusEffect(
    useCallback(() => {
      loadVisits();
    }, [])
  );

  const loadVisits = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (route.params?.staff_id) filters.staff_id = route.params.staff_id;
      if (route.params?.client_id) filters.client_id = route.params.client_id;
      const response = await visitApi.getVisits(Object.keys(filters).length > 0 ? filters : undefined);
      if (response.success && response.data) {
        const data = response.data.visits || [];
        setVisits(data);
        applyFilter(data, searchQuery, statusFilter);
      } else {
        Alert.alert('Error', response.message || 'Failed to load visits');
      }
    } catch (error: any) {
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

  const applyFilter = (source: ScheduledVisit[], query: string, status: string) => {
    let result = status === 'all'
      ? source
      : source.filter(v => v.status?.toLowerCase() === status);

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(v =>
        v.client_name?.toLowerCase().includes(q) ||
        v.staff_name?.toLowerCase().includes(q) ||
        v.visit_date?.includes(query)
      );
    }
    setFilteredVisits(result);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    applyFilter(visits, query, statusFilter);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    applyFilter(visits, searchQuery, status);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayCount = filteredVisits.filter(v => v.visit_date === todayStr).length;
  const activeFilter = FILTERS.find(f => f.key === statusFilter) ?? FILTERS[1];

  const renderVisitItem = ({ item }: { item: any }) => {
    const meta = getStatusMeta(item.status || 'scheduled');
    const isToday = item.visit_date === todayStr;
    const isInProgress = item.status?.toLowerCase() === 'in_progress';

    return (
      <TouchableOpacity
        style={[styles.card, isInProgress && styles.cardInProgress]}
        onPress={() => navigation.navigate('VisitDetail', { visitId: item.visit_id })}
        activeOpacity={0.75}
      >
        {/* Left accent bar */}
        <View style={[styles.cardAccent, { backgroundColor: meta.color }]} />

        <View style={styles.cardBody}>
          {/* Top row */}
          <View style={styles.cardTop}>
            <View style={styles.cardTopLeft}>
              <Text style={styles.clientName} numberOfLines={1}>{item.client_name}</Text>
              <Text style={styles.staffName}>👤 {item.staff_name}</Text>
            </View>
            <View style={styles.cardTopRight}>
              <View style={[styles.statusPill, { backgroundColor: meta.bg }]}>
                <Text style={[styles.statusPillText, { color: meta.color }]}>{meta.label}</Text>
              </View>
              {item.transport_id && (
                <View style={styles.transportPill}>
                  <Text style={styles.transportPillText}>🚗 Transport</Text>
                </View>
              )}
            </View>
          </View>

          {/* Divider */}
          <View style={styles.cardDivider} />

          {/* Bottom row */}
          <View style={styles.cardBottom}>
            <View style={styles.cardMeta}>
              <Text style={styles.cardMetaText}>
                📅 {isToday ? 'Today' : formatDate(item.visit_date)}
              </Text>
              <Text style={styles.cardMetaDot}>·</Text>
              <Text style={styles.cardMetaText}>🕐 {formatTime(item.visit_time)}</Text>
            </View>
            <View style={styles.cardTags}>
              {item.estimated_duration && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>⏱ {item.estimated_duration}m</Text>
                </View>
              )}
              {item.visit_type && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{item.visit_type.replace(/_/g, ' ')}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>
        {statusFilter === 'in_progress' ? '✅' :
         statusFilter === 'completed'   ? '📋' :
         statusFilter === 'missed'      ? '⚠️' : '📅'}
      </Text>
      <Text style={styles.emptyTitle}>No visits found</Text>
      <Text style={styles.emptySubtitle}>
        {statusFilter === 'in_progress'
          ? 'No visits are currently in progress.'
          : `No ${activeFilter.label.toLowerCase()} visits match your search.`}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading visits...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Visits</Text>
        {canCreate('visits') ? (
          <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('ScheduleVisit')}>
            <Text style={styles.addButtonText}>+ Schedule</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 80 }} />
        )}
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search client, staff or date..."
            value={searchQuery}
            onChangeText={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity style={styles.clearButton} onPress={() => searchQuery ? handleSearch('') : null}>
            <Text style={styles.searchIcon}>🔍</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter tabs — fixed-height wrapper prevents Android ScrollView from claiming extra flex space */}
      <View style={styles.filterScrollWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {FILTERS.map(f => {
            const active = statusFilter === f.key;
            const count = f.key === 'all'
              ? visits.length
              : visits.filter(v => v.status?.toLowerCase() === f.key).length;
            return (
              <TouchableOpacity
                key={f.key}
                style={[
                  styles.filterTab,
                  active && { backgroundColor: f.color, borderColor: f.color },
                ]}
                onPress={() => handleStatusFilter(f.key)}
              >
                <Text style={[styles.filterTabText, active && styles.filterTabTextActive]}>
                  {f.label}
                </Text>
                <View style={[
                  styles.filterBadge,
                  active ? styles.filterBadgeActive : { backgroundColor: '#f1f5f9' },
                ]}>
                  <Text style={[styles.filterBadgeText, active && styles.filterBadgeTextActive]}>
                    {count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Stats bar */}
      <View style={styles.statsBar}>
        <Text style={styles.statsText}>
          <Text style={styles.statsCount}>{filteredVisits.length}</Text>
          {' '}{activeFilter.label.toLowerCase()} visit{filteredVisits.length !== 1 ? 's' : ''}
        </Text>
        {todayCount > 0 && (
          <View style={styles.todayPill}>
            <Text style={styles.todayPillText}>📅 {todayCount} today</Text>
          </View>
        )}
      </View>

      {/* List — flex: 1 fills all remaining space */}
      <FlatList
        style={styles.list}
        data={filteredVisits}
        renderItem={renderVisitItem}
        keyExtractor={item => item.visit_id?.toString() ?? Math.random().toString()}
        contentContainerStyle={[styles.listContainer, filteredVisits.length === 0 && { flex: 1 }]}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#2563eb']} />
        }
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#64748b' },

  // Header
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
  backButton: { padding: 8 },
  backText: { fontSize: 16, color: '#2563eb', fontWeight: '600' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  addButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: { color: 'white', fontWeight: '600', fontSize: 14 },

  // Search
  searchContainer: {
    padding: 16,
    backgroundColor: 'white',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    overflow: 'hidden',
  },
  searchIcon: { fontSize: 18 },
  searchInput: { flex: 1, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: '#1e293b' },
  clearButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#2563eb',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  clearButtonText: { fontSize: 18, color: 'white' },

  // Filter tabs
  filterScrollWrapper: { height: 44, marginTop: 8 },
  filterScrollContent: { paddingHorizontal: 16, gap: 8, alignItems: 'center', height: 44 },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: 'white',
    gap: 6,
  },
  filterTabText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  filterTabTextActive: { color: 'white' },
  filterBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  filterBadgeActive: { backgroundColor: 'rgba(255,255,255,0.3)' },
  filterBadgeText: { fontSize: 11, fontWeight: '700', color: '#64748b' },
  filterBadgeTextActive: { color: 'white' },

  // Stats bar
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
  },
  statsText: { fontSize: 13, color: '#64748b' },
  statsCount: { fontWeight: '700', color: '#1e293b' },
  todayPill: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  todayPillText: { fontSize: 12, color: '#2563eb', fontWeight: '600' },

  // List
  list: { flex: 1 },
  listContainer: { padding: 16, paddingTop: 8 },

  // Cards
  card: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  cardInProgress: {
    shadowColor: '#f59e0b',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  cardAccent: { width: 4, borderRadius: 2 },
  cardBody: { flex: 1, padding: 14 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTopLeft: { flex: 1, paddingRight: 8 },
  clientName: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 3 },
  staffName: { fontSize: 13, color: '#64748b' },
  cardTopRight: { alignItems: 'flex-end', gap: 4 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusPillText: { fontSize: 11, fontWeight: '700' },
  transportPill: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  transportPillText: { fontSize: 11, color: '#d97706', fontWeight: '600' },
  cardDivider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 10 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardMetaText: { fontSize: 13, color: '#475569' },
  cardMetaDot: { fontSize: 13, color: '#cbd5e1' },
  cardTags: { flexDirection: 'row', gap: 6 },
  tag: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: { fontSize: 11, color: '#64748b', fontWeight: '500', textTransform: 'capitalize' },

  // Empty state
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#1e293b', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#64748b', textAlign: 'center', paddingHorizontal: 32 },
});
