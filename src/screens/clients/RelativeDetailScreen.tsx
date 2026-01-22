// src/screens/clients/RelativeDetailScreen.tsx

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
import { relativeApi, Relative } from '../../services/api/relativeApi';

interface RelativeDetailScreenProps {
  route: any;
  navigation: any;
}

export default function RelativeDetailScreen({ route, navigation }: RelativeDetailScreenProps) {
  const { relativeId, clientId, clientName } = route.params;
  const [relative, setRelative] = useState<Relative | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Validate relativeId on mount
  useEffect(() => {
    if (relativeId === null || relativeId === undefined) {
      Alert.alert(
        'Error',
        'Relative ID is required but was not provided.',
        [{ text: 'Go Back', onPress: () => navigation.goBack() }]
      );
      setLoading(false);
    }
  }, []);

  // Load relative details when screen comes into focus (handles both initial load and refresh)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (relativeId !== null && relativeId !== undefined) {
        loadRelativeDetails();
      }
    });
    return unsubscribe;
  }, [navigation]);

  const loadRelativeDetails = async () => {
    try {
      setLoading(true);
      const response = await relativeApi.getRelative(relativeId);

      if (response.success && response.data) {
        setRelative(response.data.relative);
      } else {
        Alert.alert('Error', response.message || 'Failed to load relative details');
      }
    } catch (error: any) {
      console.error('Error loading relative details:', error);
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!relative) return;

    const isActive = relative.account_status === 'active';
    const action = isActive ? 'Revoke' : 'Reactivate';
    const actionLower = isActive ? 'revoke' : 'reactivate';

    Alert.alert(
      `${action} Family Access`,
      isActive 
        ? `Revoke family access for ${relative.rFName} ${relative.rLName}? They will no longer be able to log in.`
        : `Reactivate access for ${relative.rFName} ${relative.rLName}? They will be able to log in again.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action,
          style: isActive ? 'destructive' : 'default',
          onPress: async () => {
            setActionLoading(true);
            try {
              const response = isActive 
                ? await relativeApi.deactivateRelative(relativeId)
                : await relativeApi.reactivateRelative(relativeId);

              if (response.success) {
                Alert.alert('Success', `Family access ${actionLower}d successfully`, [
                  {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                  },
                ]);
              } else {
                Alert.alert('Error', response.message || `Failed to ${actionLower} access`);
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Something went wrong');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading details...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (!relative) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Relative not found</Text>
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

  const isActive = relative.account_status === 'active';

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
        <Text style={styles.headerTitle}>Family Member</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditRelative', { 
            relativeId,
            clientId,
            clientName
          })}
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
              {relative.rFName?.charAt(0)}{relative.rLName?.charAt(0)}
            </Text>
          </View>
          <Text style={styles.relativeName}>
            {relative.rTitle} {relative.rFName} {relative.rLName}
          </Text>
          <Text style={styles.relationship}>{relative.relationship}</Text>
          
          <View style={[
            styles.statusBadge, 
            isActive ? styles.statusBadgeActive : styles.statusBadgeInactive
          ]}>
            <Text style={[
              styles.statusText,
              isActive ? styles.statusTextActive : styles.statusTextInactive
            ]}>
              {isActive ? '✓ Active' : '⊗ Inactive'}
            </Text>
          </View>
        </View>

        {/* Client Info Banner */}
        <View style={styles.clientBanner}>
          <Text style={styles.clientBannerLabel}>Family member of:</Text>
          <Text style={styles.clientBannerName}>
            {relative.client_title} {relative.client_first_name} {relative.client_last_name}
          </Text>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          {relative.login_email && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>✉️ Login Email:</Text>
              <Text style={styles.infoValue}>{relative.login_email}</Text>
            </View>
          )}

          {relative.rTel && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📞 Phone:</Text>
              <Text style={styles.infoValue}>{relative.rTel}</Text>
            </View>
          )}

          {relative.rMobile && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📱 Mobile:</Text>
              <Text style={styles.infoValue}>{relative.rMobile}</Text>
            </View>
          )}
        </View>

        {/* Permissions & Access */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Permissions & Access</Text>
          
          <View style={styles.permissionRow}>
            <View style={[styles.permissionIcon, relative.is_primary_contact && styles.permissionIconActive]}>
              <Text style={styles.permissionIconText}>
                {relative.is_primary_contact ? '✓' : '✗'}
              </Text>
            </View>
            <View style={styles.permissionInfo}>
              <Text style={styles.permissionLabel}>Primary Contact</Text>
              <Text style={styles.permissionDescription}>Main point of contact for care decisions</Text>
            </View>
          </View>

          <View style={styles.permissionRow}>
            <View style={[styles.permissionIcon, relative.is_emergency_contact && styles.permissionIconActive]}>
              <Text style={styles.permissionIconText}>
                {relative.is_emergency_contact ? '✓' : '✗'}
              </Text>
            </View>
            <View style={styles.permissionInfo}>
              <Text style={styles.permissionLabel}>Emergency Contact</Text>
              <Text style={styles.permissionDescription}>Contacted in case of emergencies</Text>
            </View>
          </View>

          <View style={styles.permissionRow}>
            <View style={[styles.permissionIcon, relative.can_receive_updates && styles.permissionIconActive]}>
              <Text style={styles.permissionIconText}>
                {relative.can_receive_updates ? '✓' : '✗'}
              </Text>
            </View>
            <View style={styles.permissionInfo}>
              <Text style={styles.permissionLabel}>Can Receive Updates</Text>
              <Text style={styles.permissionDescription}>Gets notifications about care updates</Text>
            </View>
          </View>

          <View style={styles.permissionRow}>
            <View style={[styles.permissionIcon, relative.can_view_reports && styles.permissionIconActive]}>
              <Text style={styles.permissionIconText}>
                {relative.can_view_reports ? '✓' : '✗'}
              </Text>
            </View>
            <View style={styles.permissionInfo}>
              <Text style={styles.permissionLabel}>Can View Reports</Text>
              <Text style={styles.permissionDescription}>Access to care reports and analytics</Text>
            </View>
          </View>

          <View style={styles.permissionRow}>
            <View style={[styles.permissionIcon, relative.can_view_visit_logs && styles.permissionIconActive]}>
              <Text style={styles.permissionIconText}>
                {relative.can_view_visit_logs ? '✓' : '✗'}
              </Text>
            </View>
            <View style={styles.permissionInfo}>
              <Text style={styles.permissionLabel}>Can View Visit Logs</Text>
              <Text style={styles.permissionDescription}>See detailed visit history and notes</Text>
            </View>
          </View>
        </View>

        {/* Account Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📅 Created:</Text>
            <Text style={styles.infoValue}>
              {new Date(relative.created_at).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}
            </Text>
          </View>

          {relative.updated_at && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>🔄 Last Updated:</Text>
              <Text style={styles.infoValue}>
                {new Date(relative.updated_at).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })}
              </Text>
            </View>
          )}

          {relative.last_login && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>🔐 Last Login:</Text>
              <Text style={styles.infoValue}>
                {new Date(relative.last_login).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              isActive ? styles.revokeButton : styles.reactivateButton,
              actionLoading && styles.buttonDisabled
            ]}
            onPress={handleToggleStatus}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.toggleButtonText}>
                {isActive ? '🚫 Revoke Family Access' : '✓ Reactivate Access'}
              </Text>
            )}
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
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarLargeText: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
  },
  relativeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  relationship: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusBadgeActive: {
    backgroundColor: '#dcfce7',
  },
  statusBadgeInactive: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusTextActive: {
    color: '#166534',
  },
  statusTextInactive: {
    color: '#991b1b',
  },
  clientBanner: {
    backgroundColor: '#eff6ff',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  clientBannerLabel: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
  },
  clientBannerName: {
    fontSize: 18,
    color: '#1e40af',
    fontWeight: '600',
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
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  permissionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  permissionIconActive: {
    backgroundColor: '#dcfce7',
  },
  permissionIconText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#64748b',
  },
  permissionInfo: {
    flex: 1,
  },
  permissionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  permissionDescription: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  toggleButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  revokeButton: {
    backgroundColor: '#ef4444',
  },
  reactivateButton: {
    backgroundColor: '#10b981',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  toggleButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
});