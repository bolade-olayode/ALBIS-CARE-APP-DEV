// src/screens/dashboard/RelativeDashboard.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';

interface RelativeDashboardProps {
  userData: any;
  onLogout: () => void;
  navigation: any;
}

export default function RelativeDashboard({ userData, onLogout, navigation }: RelativeDashboardProps) {
  // DEBUG: Log userData to diagnose issues
  console.log('=== RELATIVE DASHBOARD DEBUG ===');
  console.log('Full userData:', JSON.stringify(userData, null, 2));
  console.log('================================');

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: onLogout },
      ]
    );
  };

  const user = userData.user || userData;
  const relativeName = userData.name || userData.relative?.name || userData.user?.name || user?.name || 'Family Member';
  // Get the linked care user ID (client_id) that this relative is connected to
  const linkedClientId = userData.client_id || userData.relative?.client_id || userData.cNo || user?.client_id;

  console.log('Relative Name:', relativeName);
  console.log('Linked Client ID:', linkedClientId);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome,</Text>
            <Text style={styles.name}>{relativeName}</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Care Recipient Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Loved One</Text>
          <TouchableOpacity
            style={styles.infoCard}
            onPress={() => {
              if (linkedClientId) {
                navigation.navigate('ClientDetail', { clientId: linkedClientId, isReadOnly: true });
              } else {
                Alert.alert('Notice', 'No linked care recipient found');
              }
            }}
          >
            <Text style={styles.infoTitle}>Care Information</Text>
            <Text style={styles.infoText}>View care details and updates</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('VisitList', { client_id: linkedClientId })}
          >
            <Text style={styles.actionTitle}>📅 Recent Visits</Text>
            <Text style={styles.actionDescription}>View care visit history</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('CareLogList', { client_id: linkedClientId })}
          >
            <Text style={styles.actionTitle}>📋 Care Logs</Text>
            <Text style={styles.actionDescription}>Review care visit logs</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
  },
  header: {
    backgroundColor: '#8b5cf6',
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  logoutBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#64748b',
  },
  actionCard: {
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
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: '#64748b',
  },
});