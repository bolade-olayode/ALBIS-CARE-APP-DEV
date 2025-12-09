// src/screens/clients/ClientDetailScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { ScreenWrapper } from '../../components';
import { clientApi } from '../../services/api/clientApi';

interface ClientDetailScreenProps {
  route: any;
  navigation: any;
}

export default function ClientDetailScreen({ route, navigation }: ClientDetailScreenProps) {
  const { clientId } = route.params;
  const [client, setClient] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClientDetails();
  }, []);

  const loadClientDetails = async () => {
    try {
      setLoading(true);
      const response = await clientApi.getClient(clientId);
      
      if (response.success && response.data) {
        setClient(response.data.client);
      } else {
        Alert.alert('Error', response.message || 'Failed to load client details');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Client',
      `Are you sure you want to delete ${client?.cFName} ${client?.cLName}? This action cannot be undone.`,
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
              const response = await clientApi.deleteClient(clientId);
              
              if (response.success) {
                Alert.alert(
                  'Success',
                  'Client deleted successfully',
                  [
                    {
                      text: 'OK',
                      onPress: () => navigation.navigate('ClientList'),
                    },
                  ]
                );
              } else {
                Alert.alert('Error', response.message || 'Failed to delete client');
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Something went wrong');
            }
          },
        },
      ]
    );
  };

  const getCareLevelBadgeStyle = (careLevel: string) => {
    switch (careLevel?.toLowerCase()) {
      case 'complex':
        return { backgroundColor: '#fee2e2', textColor: '#991b1b', label: '🔴 Complex' };
      case 'high':
        return { backgroundColor: '#fed7aa', textColor: '#9a3412', label: '🟠 High' };
      case 'medium':
        return { backgroundColor: '#fef3c7', textColor: '#92400e', label: '🟡 Medium' };
      case 'low':
      default:
        return { backgroundColor: '#d1fae5', textColor: '#065f46', label: '🟢 Low' };
    }
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading client details...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (!client) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Client not found</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  const careLevelBadge = getCareLevelBadgeStyle(client.care_level);

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.headerBackText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Client Details</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditClient', { clientId: client.cNo })}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>
              {client.cFName?.charAt(0)}{client.cLName?.charAt(0)}
            </Text>
          </View>
          <Text style={styles.clientNameLarge}>
            {client.cTitle} {client.cFName} {client.cLName}
          </Text>
          <View style={styles.statusBadgeLarge}>
            <Text style={styles.statusTextLarge}>{client.status || 'Active'}</Text>
          </View>
        </View>

        {/* Care Level Badge */}
        <View style={[styles.careLevelCard, { backgroundColor: careLevelBadge.backgroundColor }]}>
          <Text style={[styles.careLevelTextLarge, { color: careLevelBadge.textColor }]}>
            {careLevelBadge.label}
          </Text>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          {client.cTel && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📞 Phone:</Text>
              <Text style={styles.infoValue}>{client.cTel}</Text>
            </View>
          )}

          {client.cMobile && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📱 Mobile:</Text>
              <Text style={styles.infoValue}>{client.cMobile}</Text>
            </View>
          )}

          {client.cEmail && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>✉️ Email:</Text>
              <Text style={styles.infoValue}>{client.cEmail}</Text>
            </View>
          )}
        </View>

        {/* Address Information */}
        {(client.cAddr1 || client.cTown || client.cPostCode) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Address</Text>
            
            {client.cAddr1 && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>🏠 Address:</Text>
                <Text style={styles.infoValue}>
                  {client.cAddr1}
                  {client.cAddr2 ? `\n${client.cAddr2}` : ''}
                </Text>
              </View>
            )}

            {client.cTown && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>📍 Town:</Text>
                <Text style={styles.infoValue}>{client.cTown}</Text>
              </View>
            )}

            {client.cPostCode && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>📮 Postcode:</Text>
                <Text style={styles.infoValue}>{client.cPostCode}</Text>
              </View>
            )}
          </View>
        )}

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          {client.cGender && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>👤 Gender:</Text>
              <Text style={styles.infoValue}>{client.cGender}</Text>
            </View>
          )}

          {client.date_of_birth && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>🎂 Date of Birth:</Text>
              <Text style={styles.infoValue}>{client.date_of_birth}</Text>
            </View>
          )}

          {client.NHSNo && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>🏥 NHS Number:</Text>
              <Text style={styles.infoValue}>{client.NHSNo}</Text>
            </View>
          )}
        </View>

        {/* Care Information */}
        {(client.cSDate || client.cEDate) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Care Period</Text>
            
            {client.cSDate && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>📅 Start Date:</Text>
                <Text style={styles.infoValue}>{client.cSDate}</Text>
              </View>
            )}

            {client.cEDate && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>📅 End Date:</Text>
                <Text style={styles.infoValue}>{client.cEDate}</Text>
              </View>
            )}
          </View>
        )}

        {/* Care Plan */}
        {client.cCarePlan && (
          <View style={[styles.section, styles.carePlanSection]}>
            <Text style={styles.sectionTitle}>Care Plan</Text>
            <Text style={styles.carePlanText}>{client.cCarePlan}</Text>
          </View>
        )}

        {/* Medical Notes */}
        {client.cRemarks && (
          <View style={[styles.section, styles.remarksSection]}>
            <Text style={styles.sectionTitle}>Medical Notes & Remarks</Text>
            <Text style={styles.remarksText}>{client.cRemarks}</Text>
          </View>
        )}

        {/* Delete Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <Text style={styles.deleteButtonText}>🗑️ Delete Client</Text>
          </TouchableOpacity>
        </View>
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
  clientNameLarge: {
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
  careLevelCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  careLevelTextLarge: {
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
  carePlanSection: {
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  carePlanText: {
    fontSize: 14,
    color: '#1e293b',
    lineHeight: 20,
  },
  remarksSection: {
    backgroundColor: '#fffbeb',
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  remarksText: {
    fontSize: 14,
    color: '#1e293b',
    lineHeight: 20,
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