// src/screens/clients/ClientListScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import { ScreenWrapper } from '../../components'; // Added Wrapper
import { clientApi, Client } from '../../services/api/clientApi';
import { usePermissions } from '../../hooks/usePermissions';

interface ClientListScreenProps {
  navigation: any;
}

export default function ClientListScreen({ navigation }: ClientListScreenProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Permission checks
  const { canCreate } = usePermissions();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadClients();
    });
    return unsubscribe;
  }, [navigation]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const response = await clientApi.getClients();
      
      if (response.success && response.data) {
        // Sort clients by care level priority
        const sortedClients = sortClientsByPriority(response.data.clients);
        setClients(sortedClients);
      } else {
        Alert.alert('Error', response.message || 'Failed to load clients');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Sort clients by care level priority (complex > high > medium > low)
  const sortClientsByPriority = (clientList: Client[]) => {
    const priorityMap: { [key: string]: number } = {
      'complex': 1,
      'high': 2,
      'medium': 3,
      'low': 4,
    };

    return [...clientList].sort((a, b) => {
      const priorityA = priorityMap[a.care_level?.toLowerCase() || 'low'] || 5;
      const priorityB = priorityMap[b.care_level?.toLowerCase() || 'low'] || 5;
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      // If same priority, sort alphabetically by first name
      return a.cFName.localeCompare(b.cFName);
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadClients();
    setRefreshing(false);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.trim() === '') {
      loadClients();
      return;
    }

    try {
      const response = await clientApi.searchClients(query);
      if (response.success && response.data) {
        const sortedClients = sortClientsByPriority(response.data.clients);
        setClients(sortedClients);
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const executeSearch = () => {
    if (searchQuery.trim()) {
      handleSearch(searchQuery);
    }
  };

  // Get care level badge style
  const getCareLevelStyle = (careLevel?: string) => {
    const level = careLevel?.toLowerCase() || 'low';
    
    switch (level) {
      case 'complex':
        return { backgroundColor: '#fee2e2', textColor: '#991b1b', priority: '🔴' };
      case 'high':
        return { backgroundColor: '#fed7aa', textColor: '#9a3412', priority: '🟠' };
      case 'medium':
        return { backgroundColor: '#fef3c7', textColor: '#92400e', priority: '🟡' };
      case 'low':
        return { backgroundColor: '#d1fae5', textColor: '#065f46', priority: '🟢' };
      default:
        return { backgroundColor: '#f1f5f9', textColor: '#475569', priority: '⚪' };
    }
  };

  const renderClientCard = ({ item }: { item: Client }) => {
    const careLevelStyle = getCareLevelStyle(item.care_level);
    
    return (
      <TouchableOpacity
        style={styles.clientCard}
        onPress={() => navigation.navigate('ClientDetail', { clientId: item.cNo })}
      >
        <View style={styles.clientHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.cFName.charAt(0)}{item.cLName.charAt(0)}
            </Text>
          </View>
          <View style={styles.clientInfo}>
            <Text style={styles.clientName}>
              {item.cFName} {item.cLName}
            </Text>
            <Text style={styles.clientDetail}>📍 {item.cTown || 'N/A'}</Text>
            <Text style={styles.clientDetail}>📞 {item.cTel || 'N/A'}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{item.status || 'Active'}</Text>
          </View>
        </View>
        
        {item.care_level && (
          <View style={[styles.careLevelBadge, { backgroundColor: careLevelStyle.backgroundColor }]}>
            <Text style={[styles.careLevelText, { color: careLevelStyle.textColor }]}>
              {careLevelStyle.priority} Care Level: {item.care_level}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading clients...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Clients</Text>
        {canCreate('clients') ? (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddClient')}
          >
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 70 }} />
        )}
      </View>

      {/* Search Bar with Icon */}
      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search clients..."
            value={searchQuery}
            onChangeText={handleSearch}
            onSubmitEditing={executeSearch}
            returnKeyType="search"
          />
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={executeSearch}
          >
            <Text style={styles.searchIcon}>🔍</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Client List */}
      <FlatList
        data={clients}
        renderItem={renderClientCard}
        keyExtractor={(item) => item.cNo.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>🏥</Text>
            <Text style={styles.emptyTitle}>No clients found</Text>
            <Text style={styles.emptyDescription}>
              {searchQuery ? 'Try a different search' : 'Add your first client to get started'}
            </Text>
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
    fontSize: 14,
    color: '#64748b',
  },
  header: {
    backgroundColor: 'white',
    paddingTop: 10, // FIXED: Changed from 50 to 10 to match ScreenWrapper
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
  backButtonText: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
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
  searchInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
  },
  searchButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchIcon: {
    fontSize: 18,
  },
  listContent: {
    padding: 16,
  },
  clientCard: {
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
  clientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  clientInfo: {
    flex: 1,
    marginLeft: 12,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  clientDetail: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 2,
  },
  statusBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#166534',
    fontWeight: '600',
  },
  careLevelBadge: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  careLevelText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
});