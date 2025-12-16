// src/screens/logs/CareLogListScreen.tsx

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
import { careLogApi, CareLog } from '../../services/api/careLogApi';
import { useFocusEffect } from '@react-navigation/native';
import { formatDate } from '../../utils/dateFormatter'; // Import Helper

interface CareLogListScreenProps {
  navigation: any;
  route: any;
}

export default function CareLogListScreen({ navigation, route }: CareLogListScreenProps) {
  const [logs, setLogs] = useState<CareLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<CareLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadLogs();
    }, [])
  );

  const loadLogs = async () => {
    try {
      setLoading(true);
      const response = await careLogApi.getLogs();

      if (response.success && response.data) {
        setLogs(response.data.logs || []);
        setFilteredLogs(response.data.logs || []);
      } else {
        Alert.alert('Error', response.message || 'Failed to load care logs');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadLogs();
    setRefreshing(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredLogs(logs);
      return;
    }

    const lowercaseQuery = query.toLowerCase();
    const filtered = logs.filter(
      (log) =>
        log.client_name?.toLowerCase().includes(lowercaseQuery) ||
        log.staff_name?.toLowerCase().includes(lowercaseQuery) ||
        log.visit_date?.includes(query)
    );

    setFilteredLogs(filtered);
  };

  const getVisitTypeColor = (visitType: string) => {
    switch (visitType) {
      case 'routine': return '#3b82f6';
      case 'urgent': return '#ef4444';
      case 'follow_up': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getMoodEmoji = (mood: string) => {
    switch (mood?.toLowerCase()) {
      case 'happy': return '😊';
      case 'calm': return '😌';
      case 'anxious': return '😰';
      case 'sad': return '😢';
      case 'agitated': return '😠';
      default: return '😐';
    }
  };

  const renderLogItem = ({ item }: { item: CareLog }) => (
    <TouchableOpacity
      style={styles.logCard}
      onPress={() => navigation.navigate('CareLogDetail', { logId: item.log_id })}
    >
      <View style={styles.logHeader}>
        <View style={styles.logHeaderLeft}>
          <Text style={styles.clientName}>{item.client_name}</Text>
          <Text style={styles.staffName}>by {item.staff_name}</Text>
        </View>
        <View
          style={[
            styles.visitTypeBadge,
            { backgroundColor: getVisitTypeColor(item.visit_type || 'routine') },
          ]}
        >
          <Text style={styles.visitTypeText}>
            {item.visit_type?.replace('_', ' ').toUpperCase() || 'ROUTINE'}
          </Text>
        </View>
      </View>

      <View style={styles.logInfo}>
        <View style={styles.infoRow}>
          <Text style={styles.infoIcon}>📅</Text>
          {/* Apply Date Formatting Here */}
          <Text style={styles.infoText}>{formatDate(item.visit_date)}</Text>
          <Text style={styles.infoDivider}>•</Text>
          <Text style={styles.infoIcon}>🕐</Text>
          <Text style={styles.infoText}>{item.visit_time}</Text>
          {item.duration_minutes && item.duration_minutes > 0 && (
            <>
              <Text style={styles.infoDivider}>•</Text>
              <Text style={styles.infoText}>{item.duration_minutes} mins</Text>
            </>
          )}
        </View>

        {item.client_mood && (
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>{getMoodEmoji(item.client_mood)}</Text>
            <Text style={styles.infoText}>Mood: {item.client_mood}</Text>
          </View>
        )}

        <View style={styles.activitiesRow}>
          {item.personal_care === 1 && (
            <View style={styles.activityBadge}>
              <Text style={styles.activityText}>🛁 Personal Care</Text>
            </View>
          )}
          {item.medication === 1 && (
            <View style={styles.activityBadge}>
              <Text style={styles.activityText}>💊 Medication</Text>
            </View>
          )}
          {item.meal_preparation === 1 && (
            <View style={styles.activityBadge}>
              <Text style={styles.activityText}>🍽️ Meals</Text>
            </View>
          )}
          {item.housekeeping === 1 && (
            <View style={styles.activityBadge}>
              <Text style={styles.activityText}>🧹 Housekeeping</Text>
            </View>
          )}
          {item.companionship === 1 && (
            <View style={styles.activityBadge}>
              <Text style={styles.activityText}>💬 Companionship</Text>
            </View>
          )}
        </View>

        {item.follow_up_required === 1 && (
          <View style={styles.followUpBadge}>
            <Text style={styles.followUpText}>⚠️ Follow-up Required</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>📋</Text>
      <Text style={styles.emptyStateTitle}>No Care Logs Yet</Text>
      <Text style={styles.emptyStateText}>
        {searchQuery
          ? 'No logs match your search'
          : 'Start by adding your first care log'}
      </Text>
      {!searchQuery && (
        <TouchableOpacity
          style={styles.emptyStateButton}
          onPress={() => navigation.navigate('AddCareLog')}
        >
          <Text style={styles.emptyStateButtonText}>+ Add Care Log</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Care Logs</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading care logs...</Text>
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
        <Text style={styles.headerTitle}>Care Logs</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddCareLog')}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
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

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{filteredLogs.length}</Text>
          <Text style={styles.statLabel}>Total Logs</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>
            {filteredLogs.filter((log) => log.visit_date === new Date().toISOString().split('T')[0]).length}
          </Text>
          <Text style={styles.statLabel}>Today</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>
            {filteredLogs.filter((log) => log.follow_up_required === 1).length}
          </Text>
          <Text style={styles.statLabel}>Follow-ups</Text>
        </View>
      </View>

      <FlatList
        data={filteredLogs}
        renderItem={renderLogItem}
        keyExtractor={(item) => item.log_id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
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
  headerSpacer: {
    width: 60,
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
  logCard: {
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
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  logHeaderLeft: {
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
  visitTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  visitTypeText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  logInfo: {
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
  },
  infoDivider: {
    marginHorizontal: 8,
    color: '#cbd5e1',
  },
  activitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  activityBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activityText: {
    fontSize: 12,
    color: '#475569',
  },
  followUpBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 4,
  },
  followUpText: {
    fontSize: 13,
    color: '#92400e',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});