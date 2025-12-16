// src/screens/transport/TransportListScreen.tsx

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { ScreenWrapper } from '../../components';
import { transportApi } from '../../services/api/transportApi';
import { useFocusEffect } from '@react-navigation/native';
import { formatDate } from '../../utils/dateFormatter';

interface TransportListScreenProps {
  navigation: any;
  route: any;
}

export default function TransportListScreen({ navigation, route }: TransportListScreenProps) {
  const [transports, setTransports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Get User Data to filter list (if driver)
  const userData = route.params?.userData || {};
  const isDriver = userData?.role === 'driver';

  useFocusEffect(
    useCallback(() => {
      loadTransports();
    }, [])
  );

  const loadTransports = async () => {
    try {
      setLoading(true);
      const params = isDriver ? { driver_id: userData?.staff?.staff_id } : {};
      const response = await transportApi.getTransports(params);

      if (response.success) {
        setTransports(response.data?.transports || []);
      } else {
        Alert.alert('Error', response.message || 'Failed to load transports');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTransports();
    setRefreshing(false);
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

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('TransportExecution', { 
        transportId: item.transport_id,
        userData: userData 
      })}
    >
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.clientName}>{item.client_name}</Text>
          <Text style={styles.dateText}>
            {formatDate(item.transport_date)} @ {item.pickup_time.substring(0, 5)}
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.badgeText}>
            {item.status.toUpperCase().replace('_', ' ')}
          </Text>
        </View>
      </View>

      <View style={styles.routeContainer}>
        <View style={styles.routeRow}>
          <Text style={styles.icon}>📍</Text>
          <Text style={styles.addressText} numberOfLines={1}>
            {item.pickup_location || 'Home'}
          </Text>
        </View>
        <View style={styles.routeConnector} />
        <View style={styles.routeRow}>
          <Text style={styles.icon}>🎯</Text>
          <Text style={styles.addressText} numberOfLines={1}>
            {item.dropoff_location || 'Destination'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#f59e0b" />
          <Text style={styles.loadingText}>Loading transport jobs...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transport Jobs</Text>
        <View style={{ width: 60 }} />
      </View>

      <FlatList
        data={transports}
        renderItem={renderItem}
        keyExtractor={(item) => item.transport_id?.toString()}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No transport jobs found</Text>
          </View>
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
    color: '#64748b',
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  backButton: {
    padding: 8,
  },
  backText: {
    color: '#f59e0b',
    fontWeight: '600',
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  list: {
    padding: 16,
  },
  card: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  clientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  dateText: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  routeContainer: {
    marginLeft: 4,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  routeConnector: {
    height: 10,
    borderLeftWidth: 1,
    borderLeftColor: '#cbd5e1',
    marginLeft: 9,
    marginVertical: 2,
  },
  icon: {
    fontSize: 16,
    marginRight: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#475569',
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: '#94a3b8',
  },
});