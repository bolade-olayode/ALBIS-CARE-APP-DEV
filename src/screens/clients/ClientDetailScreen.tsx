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
import { formatDate } from '../../utils/dateFormatter';
import { usePermissions } from '../../hooks/usePermissions';

interface ClientDetailScreenProps {
  route: any;
  navigation: any;
}

export default function ClientDetailScreen({ route, navigation }: ClientDetailScreenProps) {
  const { clientId } = route.params;
  const [client, setClient] = useState<any | null>(null);
  const [relatives, setRelatives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRelatives, setLoadingRelatives] = useState(true);

  // Permission checks
  const { canEdit, canDelete, isRelative } = usePermissions();
  const isReadOnly = route.params?.isReadOnly || isRelative();

  // Load client details and relatives when screen comes into focus (handles both initial load and refresh)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadClientDetails();
      loadRelatives();
    });
    return unsubscribe;
  }, [navigation]);

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

  const loadRelatives = async () => {
    try {
      setLoadingRelatives(true);
      const response = await fetch(`https://albiscare.co.uk/api/v1/relative/list.php?client_id=${clientId}`);
      const data = await response.json();

      if (data.success) {
        const relativesData = data.data?.relatives || [];
        setRelatives(relativesData);
      }
    } catch (error) {
      console.error('Error loading relatives:', error);
    } finally {
      setLoadingRelatives(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Client',
      `Are you sure you want to delete ${client?.cFName} ${client?.cLName}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await clientApi.deleteClient(clientId);
              
              if (response.success) {
                Alert.alert('Success', 'Client deleted successfully', [
                  { text: 'OK', onPress: () => navigation.navigate('ClientList') },
                ]);
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
        {!isReadOnly && canEdit('clients') ? (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('EditClient', { clientId: client.cNo })}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>
              {(client.cFName?.charAt(0) || '')}{(client.cLName?.charAt(0) || '')}
            </Text>
          </View>
          <Text style={styles.clientNameLarge}>
            {[client.cTitle, client.cFName, client.cLName].filter(v => v).join(' ')}
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

   {/* FAMILY ACCESS SECTION - UPDATED WITH CLICKABLE CARDS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👨‍👩‍👧 Family Access</Text>
          <Text style={styles.sectionDescription}>
            Grant family members access to view care information and updates.
          </Text>
          
          {/* Show existing relatives */}
          {loadingRelatives ? (
            <View style={styles.loadingRelativesContainer}>
              <ActivityIndicator size="small" color="#2563eb" />
              <Text style={styles.loadingRelativesText}>Loading family members...</Text>
            </View>
          ) : relatives.length > 0 ? (
            <View style={styles.relativesListContainer}>
              <Text style={styles.relativesListTitle}>
                Current Family Members ({relatives.length})
              </Text>
              {relatives.map((relative, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.relativeCard,
                    relative.account_status === 'inactive' && styles.relativeCardInactive
                  ]}
                  onPress={() => {
                    if (relative.rNo === null || relative.rNo === undefined) {
                      Alert.alert('Error', 'Relative ID is missing. Please try refreshing the page.');
                      return;
                    }

                    navigation.navigate('RelativeDetail', {
                      relativeId: relative.rNo,
                      clientId: client.cNo,
                      clientName: `${client.cFName} ${client.cLName}`
                    });
                  }}
                >
                  <View style={styles.relativeInfo}>
                    <View style={[
                      styles.relativeAvatar,
                      relative.account_status === 'inactive' && styles.relativeAvatarInactive
                    ]}>
                      <Text style={styles.relativeAvatarText}>
                        {(relative.rFName?.charAt(0) || '')}{(relative.rLName?.charAt(0) || '')}
                      </Text>
                    </View>
                    <View style={styles.relativeDetails}>
                      <View style={styles.relativeNameRow}>
                        <Text style={styles.relativeName}>
                          {[relative.rTitle, relative.rFName, relative.rLName].filter(v => v).join(' ')}
                        </Text>
                        {relative.account_status === 'inactive' && (
                          <View style={styles.inactiveBadge}>
                            <Text style={styles.inactiveBadgeText}>Inactive</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.relativeRelationship}>
                        {relative.relationship}
                      </Text>
                      <Text style={styles.relativeEmail}>
                        ✉️ {relative.rEmail || relative.login_email}
                      </Text>
                      <View style={styles.relativeBadgesRow}>
                        {!!relative.is_primary_contact && (
                          <View style={styles.primaryBadge}>
                            <Text style={styles.primaryBadgeText}>⭐ Primary</Text>
                          </View>
                        )}
                        {!!relative.is_emergency_contact && (
                          <View style={styles.emergencyBadge}>
                            <Text style={styles.emergencyBadgeText}>🚨 Emergency</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                  <View style={styles.relativeCardArrow}>
                    <Text style={styles.relativeCardArrowText}>›</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.noRelativesContainer}>
              <Text style={styles.noRelativesIcon}>👥</Text>
              <Text style={styles.noRelativesText}>
                No family members have access yet
              </Text>
            </View>
          )}

          {/* Add Family Member Button - Hidden in read-only mode */}
          {!isReadOnly && (
            <TouchableOpacity
              style={styles.grantAccessButton}
              onPress={() => navigation.navigate('GrantFamilyAccess', {
                clientId: client.cNo,
                clientName: `${client.cFName} ${client.cLName}`
              })}
            >
              <Text style={styles.grantAccessIcon}>➕</Text>
              <Text style={styles.grantAccessText}>
                {relatives.length > 0 ? 'Add Another Family Member' : 'Grant Family Access'}
              </Text>
            </TouchableOpacity>
          )}
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
              <Text style={styles.infoValue}>{formatDate(client.date_of_birth)}</Text>
            </View>
          )}

          {!!client.NHSNo && (
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
                <Text style={styles.infoValue}>{formatDate(client.cSDate)}</Text>
              </View>
            )}

            {client.cEDate && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>📅 End Date:</Text>
                <Text style={styles.infoValue}>{formatDate(client.cEDate)}</Text>
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
        {!isReadOnly && canDelete('clients') && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
            >
              <Text style={styles.deleteButtonText}>🗑️ Delete Client</Text>
            </TouchableOpacity>
          </View>
        )}
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
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
    lineHeight: 20,
  },
  loadingRelativesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  loadingRelativesText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#64748b',
  },
  relativesListContainer: {
    marginBottom: 16,
  },
  relativesListTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 12,
  },
  // CORRECTED: Merged relativeCard styles
  relativeCard: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#10b981', // Changed from blue to green to distinguish relatives
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  relativeCardInactive: {
    backgroundColor: '#fafafa',
    borderLeftColor: '#94a3b8',
    opacity: 0.7,
  },
  relativeInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1, // Added flex 1 to take available space
  },
  // CORRECTED: Merged relativeAvatar styles
  relativeAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  relativeAvatarInactive: {
    backgroundColor: '#94a3b8',
  },
  relativeAvatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  relativeDetails: {
    flex: 1,
  },
  relativeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  relativeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  inactiveBadge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  inactiveBadgeText: {
    fontSize: 10,
    color: '#991b1b',
    fontWeight: '600',
  },
  relativeRelationship: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  relativeEmail: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 6,
  },
  relativeBadgesRow: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 6,
  },
  primaryBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  primaryBadgeText: {
    fontSize: 11,
    color: '#92400e',
    fontWeight: '600',
  },
  emergencyBadge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  emergencyBadgeText: {
    fontSize: 11,
    color: '#991b1b',
    fontWeight: '600',
  },
  relativeCardArrow: {
    marginLeft: 'auto',
    paddingLeft: 8,
  },
  relativeCardArrowText: {
    fontSize: 28,
    color: '#cbd5e1',
    fontWeight: '300',
  },
  noRelativesContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  noRelativesIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  noRelativesText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  grantAccessButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  grantAccessIcon: {
    fontSize: 18,
    marginRight: 8,
    color: 'white',
  },
  grantAccessText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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