// src/screens/staff/StaffDetailScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { staffApi, Staff } from '../../services/api/staffApi';

interface StaffDetailScreenProps {
  route: any;
  navigation: any;
}

export default function StaffDetailScreen({ route, navigation }: StaffDetailScreenProps) {
  const { staffId } = route.params;
  const [staff, setStaff] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStaffDetails();
  }, []);

  const loadStaffDetails = async () => {
    try {
      setLoading(true);
      const response = await staffApi.getStaffMember(staffId);
      
      if (response.success && response.data) {
        setStaff(response.data.staff);
      } else {
        Alert.alert('Error', response.message || 'Failed to load staff details');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Staff Member',
      `Are you sure you want to delete ${staff?.name}? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await staffApi.deleteStaff(staffId);
              
              if (response.success) {
                Alert.alert(
                  'Success',
                  'Staff member deleted successfully',
                  [
                    {
                      text: 'OK',
                      onPress: () => navigation.navigate('StaffList'),
                    },
                  ]
                );
              } else {
                Alert.alert('Error', response.message || 'Failed to delete staff member');
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Something went wrong');
            }
          },
        },
      ]
    );
  };

  const getRoleBadgeStyle = (roleId: number) => {
    switch (roleId) {
      case 1: // Care Manager
        return { backgroundColor: '#fee2e2', textColor: '#991b1b', icon: '🔴' };
      case 2: // Carer
        return { backgroundColor: '#dbeafe', textColor: '#1e40af', icon: '🔵' };
      case 3: // Nurse
        return { backgroundColor: '#d1fae5', textColor: '#065f46', icon: '🟢' };
      case 4: // Driver
        return { backgroundColor: '#fef3c7', textColor: '#92400e', icon: '🟡' };
      default:
        return { backgroundColor: '#f1f5f9', textColor: '#475569', icon: '⚪' };
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading staff details...</Text>
      </View>
    );
  }

  if (!staff) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Staff member not found</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const roleBadge = getRoleBadgeStyle(staff.role_id);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.headerBackText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Staff Details</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditStaff', { staffId: staff.id })}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Avatar & Name Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>
              {staff.first_name.charAt(0)}{staff.last_name.charAt(0)}
            </Text>
          </View>
          <Text style={styles.staffNameLarge}>
            {staff.first_name} {staff.last_name}
          </Text>
          <View style={styles.statusBadgeLarge}>
            <Text style={styles.statusTextLarge}>{staff.status || 'Active'}</Text>
          </View>
        </View>

        {/* Role Badge */}
        <View style={[styles.roleCard, { backgroundColor: roleBadge.backgroundColor }]}>
          <Text style={[styles.roleTextLarge, { color: roleBadge.textColor }]}>
            {roleBadge.icon} {staff.role_name}
          </Text>
        </View>

        {/* Contact Information */}
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Contact Information</Text>
  
  {staff.phone && (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>📞 Phone:</Text>
      <Text style={styles.infoValue}>{staff.phone}</Text>
    </View>
  )}

  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>📱 Mobile:</Text>
    <Text style={styles.infoValue}>{staff.mobile}</Text>
  </View>

  {staff.email && (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>✉️ Email:</Text>
      <Text style={styles.infoValue}>{staff.email}</Text>
    </View>
  )}
</View>


        {/* Address Information */}
        {(staff.address_line1 || staff.town || staff.postcode) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Address</Text>
            
            {staff.address_line1 && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>🏠 Address:</Text>
                <Text style={styles.infoValue}>
                  {staff.address_line1}
                  {staff.address_line2 ? `\n${staff.address_line2}` : ''}
                </Text>
              </View>
            )}

            {staff.town && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>📍 Town:</Text>
                <Text style={styles.infoValue}>{staff.town}</Text>
              </View>
            )}

            {staff.postcode && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>📮 Postcode:</Text>
                <Text style={styles.infoValue}>{staff.postcode}</Text>
              </View>
            )}
          </View>
        )}

        {/* Employment Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Employment Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>💼 Type:</Text>
            <Text style={styles.infoValue}>
              {staff.employment_type === 'full_time' ? 'Full Time' : 
               staff.employment_type === 'part_time' ? 'Part Time' : 'Contract'}
            </Text>
          </View>

          {staff.joined_date && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📅 Joined:</Text>
              <Text style={styles.infoValue}>{staff.joined_date}</Text>
            </View>
          )}
        </View>

        {/* Professional Information */}
        {(staff.pvg_number || staff.sssc_number || staff.qualifications) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Information</Text>
            
            {staff.pvg_number && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>🔒 PVG Number:</Text>
                <Text style={styles.infoValue}>{staff.pvg_number}</Text>
              </View>
            )}

            {staff.sssc_number && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>📋 SSSC Number:</Text>
                <Text style={styles.infoValue}>{staff.sssc_number}</Text>
              </View>
            )}

            {staff.qualifications && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>🎓 Qualifications:</Text>
                <Text style={styles.infoValue}>{staff.qualifications}</Text>
              </View>
            )}
          </View>
        )}

        {/* Emergency Contact */}
        {(staff.emergency_contact_name || staff.emergency_contact_phone) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Emergency Contact</Text>
            
            {staff.emergency_contact_name && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>👤 Name:</Text>
                <Text style={styles.infoValue}>{staff.emergency_contact_name}</Text>
              </View>
            )}

            {staff.emergency_contact_phone && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>📞 Phone:</Text>
                <Text style={styles.infoValue}>{staff.emergency_contact_phone}</Text>
              </View>
            )}
          </View>
        )}

        {/* Delete Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <Text style={styles.deleteButtonText}>🗑️ Delete Staff Member</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginBottom: 20,
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
  headerBackButton: {
    padding: 8,
  },
  headerBackText: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  editButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: 'white',
    paddingVertical: 32,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarLargeText: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
  },
  staffNameLarge: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  statusBadgeLarge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusTextLarge: {
    fontSize: 14,
    color: '#166534',
    fontWeight: '600',
  },
  roleCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  roleTextLarge: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    width: 140,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1e293b',
    flex: 1,
  },
  backButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  backButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});