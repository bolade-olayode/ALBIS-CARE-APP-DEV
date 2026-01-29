import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- AUTH ---
import LoginScreen from '../screens/auth/LoginScreen';

// --- DASHBOARDS ---
import AdminDashboard from '../screens/dashboard/AdminDashboard';
import SuperAdminDashboard from '../screens/dashboard/SuperAdminDashboard';
import CareManagerDashboard from '../screens/dashboard/CareManagerDashboard';
import StaffDashboard from '../screens/dashboard/StaffDashboard';
import DriverDashboard from '../screens/dashboard/DriverDashboard';
import RelativeDashboard from '../screens/dashboard/RelativeDashboard';

// --- CLIENTS ---
import ClientListScreen from '../screens/clients/ClientListScreen';
import ClientDetailScreen from '../screens/clients/ClientDetailScreen';
import AddClientScreen from '../screens/clients/AddClientScreen';
import EditClientScreen from '../screens/clients/EditClientScreen';
import GrantFamilyAccessScreen from '../screens/clients/GrantFamilyAccessScreen';
import RelativeDetailScreen from '../screens/clients/RelativeDetailScreen';
import EditRelativeScreen from '../screens/clients/EditRelativeScreen';

// --- STAFF ---
import StaffListScreen from '../screens/staff/StaffListScreen';
import StaffDetailScreen from '../screens/staff/StaffDetailScreen';
import AddStaffScreen from '../screens/staff/AddStaffScreen';
import EditStaffScreen from '../screens/staff/EditStaffScreen';

// --- LOGS ---
import CareLogListScreen from '../screens/logs/CareLogListScreen';
import CareLogDetailScreen from '../screens/logs/CareLogDetailScreen';
import AddCareLogScreen from '../screens/logs/AddCareLogScreen';
import EditCareLogScreen from '../screens/logs/EditCareLogScreen';

// --- VISITS ---
import VisitListScreen from '../screens/visits/VisitListScreen';
import VisitDetailScreen from '../screens/visits/VisitDetailScreen';
import ScheduleVisitScreen from '../screens/visits/ScheduleVisitScreen';
import EditVisitScreen from '../screens/visits/EditVisitScreen';
import VisitExecutionScreen from '../screens/visits/VisitExecutionScreen';

// --- TRANSPORT ---
import TransportListScreen from '../screens/transport/TransportListScreen';
import TransportDetailScreen from '../screens/transport/TransportDetailScreen';
import TransportExecutionScreen from '../screens/transport/TransportExecutionScreen';

// --- ADMIN & SHARED ---
import AnalyticsScreen from '../screens/admin/AnalyticsScreen';
import SystemSettingsScreen from '../screens/admin/SystemSettingsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import ChangePasswordScreen from '../screens/profile/ChangePasswordScreen'; 

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userDataString = await AsyncStorage.getItem('userData');
      
      if (token && userDataString) {
        setUserToken(token);
        setUserData(JSON.parse(userDataString));
      }
    } catch (error) {
      // Login check failed silently
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (token: string, data: any): Promise<void> => {
    if (!token || typeof token !== 'string' || token.length === 0) {
      return;
    }

    try {
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(data));

      const storedToken = await AsyncStorage.getItem('authToken');
      if (!storedToken) {
        return;
      }

      setUserToken(token);
      setUserData(data);

    } catch (error: any) {
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
      setUserToken(null);
      setUserData(null);
    } catch (error) {
      // Logout error silently handled
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  // Determine which Dashboard to show based on role
  const getDashboardComponent = () => {
    if (!userData) return LoginScreen;

    const effectiveRole = userData.effective_role || userData.user?.role || userData.userType || userData.role;
    const staffRole = userData.staff?.staff_role?.toLowerCase() || '';

    // Priority Roles
    if (effectiveRole === 'super_admin') return SuperAdminDashboard;
    if (effectiveRole === 'admin') return AdminDashboard;
    if (effectiveRole === 'care_manager') return CareManagerDashboard;
    
    // Relative
    if (effectiveRole === 'relative') return RelativeDashboard;
    
    // Driver (Role Check or Job Title Check)
    if (effectiveRole === 'driver' || staffRole.includes('driver')) return DriverDashboard;

    // Default Staff
    return StaffDashboard;
  };

  const DashboardComponent = getDashboardComponent();

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: '#f8fafc' }
        }}
      >
        {!userToken ? (
          // --- AUTH STACK ---
          <Stack.Screen name="Login">
            {(props) => <LoginScreen {...props} onLogin={handleLogin} />}
          </Stack.Screen>
        ) : (
          // --- APP STACK ---
          <>
            {/* Main Dashboard */}
            <Stack.Screen name="Dashboard">
              {(props) => (
                <DashboardComponent 
                  {...props} 
                  userData={userData} 
                  onLogout={handleLogout} 
                />
              )}
            </Stack.Screen>

            {/* Profile Screen - Passing userData for role context */}
            <Stack.Screen name="Profile">
              {(props) => <ProfileScreen {...props} userData={userData} />}
            </Stack.Screen>

            {/* Change Password Screen */}
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />

            {/* Admin / Analytics */}
            <Stack.Screen name="Analytics" component={AnalyticsScreen} />

            {/* Client Management */}
            <Stack.Screen name="ClientList" component={ClientListScreen} />
            <Stack.Screen name="ClientDetail" component={ClientDetailScreen} />
            <Stack.Screen name="AddClient" component={AddClientScreen} />
            <Stack.Screen name="EditClient" component={EditClientScreen} />
            <Stack.Screen name="GrantFamilyAccess" component={GrantFamilyAccessScreen} />
            <Stack.Screen name="RelativeDetail" component={RelativeDetailScreen} />
            <Stack.Screen name="EditRelative" component={EditRelativeScreen} />

            {/* Staff Management */}
            <Stack.Screen name="StaffList" component={StaffListScreen} />
            <Stack.Screen name="StaffDetail" component={StaffDetailScreen} />
            <Stack.Screen name="AddStaff" component={AddStaffScreen} />
            <Stack.Screen name="EditStaff" component={EditStaffScreen} />

            {/* Care Logs */}
            <Stack.Screen name="CareLogList" component={CareLogListScreen} />
            <Stack.Screen name="CareLogDetail" component={CareLogDetailScreen} />
            <Stack.Screen name="AddCareLog" component={AddCareLogScreen} />
            <Stack.Screen name="EditCareLog" component={EditCareLogScreen} />

            {/* Visits */}
            <Stack.Screen name="VisitList" component={VisitListScreen} />
            <Stack.Screen name="VisitDetail" component={VisitDetailScreen} />
            <Stack.Screen name="ScheduleVisit" component={ScheduleVisitScreen} />
            <Stack.Screen name="EditVisit" component={EditVisitScreen} />
            <Stack.Screen name="VisitExecution" component={VisitExecutionScreen} />

            {/* Transport */}
            <Stack.Screen name="TransportList" component={TransportListScreen} />
            <Stack.Screen name="TransportDetail" component={TransportDetailScreen} />
            <Stack.Screen name="TransportExecution" component={TransportExecutionScreen} />

            {/* Admin Settings */}
            <Stack.Screen name="SystemSettings">
              {(props) => <SystemSettingsScreen {...props} userData={userData} />}
            </Stack.Screen>

            {/* Explicit Dashboards */}
            <Stack.Screen name="StaffDashboard">
              {(props) => <StaffDashboard {...props} userData={userData} onLogout={handleLogout} />}
            </Stack.Screen>
            <Stack.Screen name="DriverDashboard">
              {(props) => <DriverDashboard {...props} userData={userData} onLogout={handleLogout} />}
            </Stack.Screen>
            <Stack.Screen name="RelativeDashboard">
              {(props) => <RelativeDashboard {...props} userData={userData} onLogout={handleLogout} />}
            </Stack.Screen>

          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}