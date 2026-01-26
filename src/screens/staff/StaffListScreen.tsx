// src/screens/staff/StaffListScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
// Added ScreenWrapper to imports
import { ScreenWrapper } from '../../components';
import { staffApi, Staff } from '../../services/api/staffApi';
import { usePermissions } from '../../hooks/usePermissions';

interface StaffListScreenProps {
  navigation: any;
}

interface GroupedStaff {
  roleId: number;
  roleName: string;
  staff: Staff[];
  color: string;
  icon: string;
}

export default function StaffListScreen({ navigation }: StaffListScreenProps) {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<{ [key: number]: boolean }>({
    0: true, // Other Staff
    1: true,
    2: true,
    3: true,
    4: true,
  });

  // Permission checks
  const { canCreate } = usePermissions();

  useEffect(() => {
    loadStaff();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadStaff();
    });
    return unsubscribe;
  }, [navigation]);

  const loadStaff = async () => {
    try {
      setLoading(true);
      const response = await staffApi.getStaff();

      console.log('=== STAFF LIST DEBUG ===');
      console.log('Response success:', response.success);
      console.log('Staff count:', response.data?.staff?.length);
      console.log('First staff member:', JSON.stringify(response.data?.staff?.[0], null, 2));
      console.log('All role_ids:', response.data?.staff?.map((s: any) => s.role_id));
      console.log('========================');

      if (response.success && response.data) {
        setStaff(response.data.staff);
      } else {
        Alert.alert('Error', response.message || 'Failed to load staff');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStaff();
    setRefreshing(false);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.trim() === '') {
      loadStaff();
      return;
    }

    try {
      const response = await staffApi.searchStaff(query);
      if (response.success && response.data) {
        setStaff(response.data.staff);
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

  const toggleSection = (roleId: number) => {
    setExpandedSections(prev => ({
      ...prev,
      [roleId]: !prev[roleId]
    }));
  };

  const groupStaffByRole = (): GroupedStaff[] => {
    const roleConfig = [
      { roleId: 1, roleName: 'Care Managers', color: '#fee2e2', textColor: '#991b1b', icon: '🔴' },
      { roleId: 2, roleName: 'Carers', color: '#dbeafe', textColor: '#1e40af', icon: '🔵' },
      { roleId: 3, roleName: 'Nurses', color: '#d1fae5', textColor: '#065f46', icon: '🟢' },
      { roleId: 4, roleName: 'Drivers', color: '#fef3c7', textColor: '#92400e', icon: '🟡' },
    ];

    const knownRoleIds = [1, 2, 3, 4];
    const groups = roleConfig.map(role => ({
      ...role,
      staff: staff.filter(s => s.role_id === role.roleId),
      color: role.color
    }));

    // Add "Other Staff" group for any staff with unknown role_ids
    const otherStaff = staff.filter(s => !knownRoleIds.includes(s.role_id));
    if (otherStaff.length > 0) {
      groups.push({
        roleId: 0,
        roleName: 'Other Staff',
        color: '#f1f5f9',
        textColor: '#475569',
        icon: '👤',
        staff: otherStaff
      });
    }

    console.log('=== GROUPING DEBUG ===');
    console.log('Total staff:', staff.length);
    groups.forEach(g => console.log(`${g.roleName}: ${g.staff.length} staff`));
    console.log('======================');

    return groups.filter(group => group.staff.length > 0);
  };

  const renderStaffCard = (item: Staff) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.staffCard}
        onPress={() => navigation.navigate('StaffDetail', { staffId: item.id })}
      >
        <View style={styles.staffHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.name.split(' ').map(n => n.charAt(0)).join('').substring(0, 2)}
            </Text>
          </View>
          <View style={styles.staffInfo}>
            <Text style={styles.staffName}>{item.name}</Text>
            <Text style={styles.staffDetail}>📞 {item.phone}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: item.status === 'active' ? '#dcfce7' : '#fee2e2' }]}>
            <Text style={[styles.statusText, { color: item.status === 'active' ? '#166534' : '#991b1b' }]}>
              {item.status || 'Active'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading staff...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const groupedStaff = groupStaffByRole();

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
        <Text style={styles.headerTitle}>Staff</Text>
        {canCreate('staff') ? (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddStaff')}
          >
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 70 }} />
        )}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search staff..."
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

      {/* Grouped Staff List */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {groupedStaff.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>👥</Text>
            <Text style={styles.emptyTitle}>No staff found</Text>
            <Text style={styles.emptyDescription}>
              {searchQuery ? 'Try a different search' : 'Add your first staff member to get started'}
            </Text>
          </View>
        ) : (
          groupedStaff.map((group) => (
            <View key={group.roleId} style={styles.roleSection}>
              {/* Role Header */}
              <TouchableOpacity
                style={[styles.roleHeader, { backgroundColor: group.color }]}
                onPress={() => toggleSection(group.roleId)}
              >
                <Text style={styles.roleHeaderText}>
                  {expandedSections[group.roleId] ? '▼' : '▶'} {group.icon} {group.roleName} ({group.staff.length})
                </Text>
              </TouchableOpacity>

              {/* Staff Cards */}
              {expandedSections[group.roleId] && (
                <View style={styles.staffList}>
                  {group.staff.map(renderStaffCard)}
                </View>
              )}
            </View>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
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
    paddingTop: 10, // CHANGED from 50 to 10
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
  content: {
    flex: 1,
  },
  roleSection: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  roleHeader: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  roleHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  staffList: {
    gap: 8,
  },
  staffCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  staffHeader: {
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
  staffInfo: {
    flex: 1,
    marginLeft: 12,
  },
  staffName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  staffDetail: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
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