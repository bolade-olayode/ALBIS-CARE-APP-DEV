import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ScreenWrapper } from '../../components';
import { staffApi } from '../../services/api/staffApi';

interface ProfileScreenProps {
  navigation: any;
  userData: any; // Strictly required from AppNavigator
}

interface ProfileData {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  mobile: string;
  address_line1: string;
  address_line2: string;
  town: string;
  postcode: string;
  role_name: string;
  employment_type: string;
  joined_date: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
}

export default function ProfileScreen({ navigation, userData }: ProfileScreenProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [editedProfile, setEditedProfile] = useState<Partial<ProfileData>>({});

  // === STRICT ID EXTRACTION (Self-Service Only) ===
  const staffId = 
    userData?.staff?.staff_id || 
    userData?.staff_id || 
    userData?.id || 
    userData?.user_id || 
    0;

  const userRole = userData?.effective_role || userData?.role || 'staff';

  // Role Styling
  const getRoleColor = () => {
    switch (userRole) {
      case 'care_manager': return '#ec4899';
      case 'driver': return '#f59e0b';
      case 'admin': return '#2563eb';
      case 'super_admin': return '#7c3aed';
      default: return '#10b981';
    }
  };

  const getRoleBadge = () => {
    switch (userRole) {
      case 'care_manager': return 'CARE MANAGER';
      case 'driver': return 'DRIVER';
      case 'admin': return 'ADMINISTRATOR';
      case 'super_admin': return 'SUPER ADMIN';
      default: return 'STAFF MEMBER';
    }
  };

  useEffect(() => {
    loadProfile();
  }, [staffId]);

  const loadProfile = async () => {
    if (!staffId) {
      Alert.alert('Error', 'User ID not found. Please log in again.');
      return;
    }

    try {
      setLoading(true);
      const response = await staffApi.getStaffMember(staffId);

      if (response.success && response.data) {
        const staffData = response.data.staff || response.data;
        
        setProfile({
          id: staffData.id || staffData.staff_id,
          name: staffData.name || `${staffData.first_name || ''} ${staffData.last_name || ''}`.trim(),
          first_name: staffData.first_name || '',
          last_name: staffData.last_name || '',
          email: staffData.email || '',
          phone: staffData.phone || '',
          mobile: staffData.mobile || staffData.phone || '',
          address_line1: staffData.address_line1 || staffData.addr1 || '',
          address_line2: staffData.address_line2 || staffData.addr2 || '',
          town: staffData.town || '',
          postcode: staffData.postcode || '',
          role_name: staffData.role_name || staffData.staff_role || '',
          employment_type: staffData.employment_type || '',
          joined_date: staffData.joined_date || staffData.created_at || '',
          emergency_contact_name: staffData.emergency_contact_name || '',
          emergency_contact_phone: staffData.emergency_contact_phone || '',
        });
      } else {
        Alert.alert('Error', 'Failed to load profile data');
      }
    } catch (error: any) {
      Alert.alert('Error', 'Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (!profile) return;
    setEditedProfile({
      phone: profile.phone || '',
      mobile: profile.mobile || '',
      address_line1: profile.address_line1 || '',
      address_line2: profile.address_line2 || '',
      town: profile.town || '',
      postcode: profile.postcode || '',
      emergency_contact_name: profile.emergency_contact_name || '',
      emergency_contact_phone: profile.emergency_contact_phone || '',
    });
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setEditedProfile({});
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await staffApi.updateStaff(staffId, editedProfile);

      if (response.success) {
        Alert.alert('Success', 'Profile updated successfully');
        setEditing(false);
        loadProfile(); 
      } else {
        Alert.alert('Error', response.message || 'Failed to update profile');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric',
      });
    } catch { return dateString; }
  };

  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??';
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={getRoleColor()} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (!profile) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Unable to load profile</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadProfile}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: getRoleColor() }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Dashboard</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Profile</Text>
          {!editing ? (
            <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 60 }} />
          )}
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={[styles.avatar, { backgroundColor: getRoleColor() }]}>
              <Text style={styles.avatarText}>{getInitials(profile.name)}</Text>
            </View>
            <Text style={styles.profileName}>{profile.name}</Text>
            <View style={[styles.roleBadge, { backgroundColor: getRoleColor() + '20' }]}>
              <Text style={[styles.roleBadgeText, { color: getRoleColor() }]}>
                {getRoleBadge()}
              </Text>
            </View>
          </View>

          {editing ? (
            // === EDIT MODE ===
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Contact Information</Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Phone</Text>
                  <TextInput
                    style={styles.input}
                    value={editedProfile.phone}
                    onChangeText={(t) => setEditedProfile(p => ({ ...p, phone: t }))}
                    placeholder="Enter phone number"
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Mobile</Text>
                  <TextInput
                    style={styles.input}
                    value={editedProfile.mobile}
                    onChangeText={(t) => setEditedProfile(p => ({ ...p, mobile: t }))}
                    placeholder="Enter mobile number"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Address</Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Address Line 1</Text>
                  <TextInput
                    style={styles.input}
                    value={editedProfile.address_line1}
                    onChangeText={(t) => setEditedProfile(p => ({ ...p, address_line1: t }))}
                    placeholder="Enter address"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Address Line 2</Text>
                  <TextInput
                    style={styles.input}
                    value={editedProfile.address_line2}
                    onChangeText={(t) => setEditedProfile(p => ({ ...p, address_line2: t }))}
                    placeholder="Enter address line 2"
                  />
                </View>

                <View style={styles.inputRow}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.inputLabel}>Town</Text>
                    <TextInput
                      style={styles.input}
                      value={editedProfile.town}
                      onChangeText={(t) => setEditedProfile(p => ({ ...p, town: t }))}
                      placeholder="Town"
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.inputLabel}>Postcode</Text>
                    <TextInput
                      style={styles.input}
                      value={editedProfile.postcode}
                      onChangeText={(t) => setEditedProfile(p => ({ ...p, postcode: t }))}
                      placeholder="Postcode"
                    />
                  </View>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Emergency Contact</Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Contact Name</Text>
                  <TextInput
                    style={styles.input}
                    value={editedProfile.emergency_contact_name}
                    onChangeText={(t) => setEditedProfile(p => ({ ...p, emergency_contact_name: t }))}
                    placeholder="Enter emergency contact name"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Contact Phone</Text>
                  <TextInput
                    style={styles.input}
                    value={editedProfile.emergency_contact_phone}
                    onChangeText={(t) => setEditedProfile(p => ({ ...p, emergency_contact_phone: t }))}
                    placeholder="Enter emergency contact phone"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              {/* Save/Cancel Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancel}
                  disabled={saving}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveButton, { backgroundColor: getRoleColor() }]}
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          ) : (
            // === VIEW MODE ===
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Contact Information</Text>
                <View style={styles.infoCard}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Email</Text>
                    <Text style={styles.infoValue}>{profile.email || 'N/A'}</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Phone</Text>
                    <Text style={styles.infoValue}>{profile.phone || 'N/A'}</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Mobile</Text>
                    <Text style={styles.infoValue}>{profile.mobile || 'N/A'}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Address</Text>
                <View style={styles.infoCard}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Address</Text>
                    <Text style={styles.infoValue}>
                      {[profile.address_line1, profile.address_line2]
                        .filter(Boolean)
                        .join(', ') || 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Town</Text>
                    <Text style={styles.infoValue}>{profile.town || 'N/A'}</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Postcode</Text>
                    <Text style={styles.infoValue}>{profile.postcode || 'N/A'}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Employment Details</Text>
                <View style={styles.infoCard}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Role</Text>
                    <Text style={styles.infoValue}>{profile.role_name || 'N/A'}</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Employment Type</Text>
                    <Text style={styles.infoValue}>{profile.employment_type || 'N/A'}</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Joined Date</Text>
                    <Text style={styles.infoValue}>{formatDate(profile.joined_date)}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Emergency Contact</Text>
                <View style={styles.infoCard}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Name</Text>
                    <Text style={styles.infoValue}>{profile.emergency_contact_name || 'N/A'}</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Phone</Text>
                    <Text style={styles.infoValue}>{profile.emergency_contact_phone || 'N/A'}</Text>
                  </View>
                </View>
              </View>
            </>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
    color: '#64748b',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  header: {
    paddingTop: 10,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  editButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  roleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748b',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    color: '#1e293b',
  },
  inputRow: {
    flexDirection: 'row',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#64748b',
    fontWeight: '600',
    fontSize: 16,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});