// src/navigation/AppNavigator.tsx

import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import AdminDashboard from '../screens/dashboard/AdminDashboard';
import StaffDashboard from '../screens/dashboard/StaffDashboard';
import DriverDashboard from '../screens/dashboard/DriverDashboard';
import RelativeDashboard from '../screens/dashboard/RelativeDashboard';
import ClientListScreen from '../screens/clients/ClientListScreen';
import ClientDetailScreen from '../screens/clients/ClientDetailScreen';
import AddClientScreen from '../screens/clients/AddClientScreen';
import EditClientScreen from '../screens/clients/EditClientScreen';
import StaffListScreen from '../screens/staff/StaffListScreen';
import StaffDetailScreen from '../screens/staff/StaffDetailScreen';
import AddStaffScreen from '../screens/staff/AddStaffScreen';
import EditStaffScreen from '../screens/staff/EditStaffScreen';
import CareLogListScreen from '../screens/logs/CareLogListScreen';
import CareLogDetailScreen from '../screens/logs/CareLogDetailScreen';
import AddCareLogScreen from '../screens/logs/AddCareLogScreen';
import EditCareLogScreen from '../screens/logs/EditCareLogScreen';
import VisitListScreen from '../screens/visits/VisitListScreen';
import VisitDetailScreen from '../screens/visits/VisitDetailScreen';
import ScheduleVisitScreen from '../screens/visits/ScheduleVisitScreen';
import EditVisitScreen from '../screens/visits/EditVisitScreen';
import VisitExecutionScreen from '../screens/visits/VisitExecutionScreen';
import TransportExecutionScreen from '../screens/transport/TransportExecutionScreen';

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
      console.error('Error checking login status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (token: string, data: any) => {
    setUserToken(token);
    setUserData(data);
    
    // Save to AsyncStorage
    await AsyncStorage.setItem('authToken', token);
    await AsyncStorage.setItem('userData', JSON.stringify(data));
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
      setUserToken(null);
      setUserData(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  const getDashboardComponent = () => {
    const userType = userData?.user?.userType;
    const staffRole = userData?.staff?.staff_role;
    const roleName = userData?.staff?.roleName || ''; // ✅ Added fallback

    console.log('🔍 Dashboard Debug:', { userType, staffRole, roleName }); // ✅ Debug log

    if (userType === 'admin') {
      return AdminDashboard;
    }

    if (userType === 'staff') {
      // Check BOTH staff_role and roleName for driver
      if (staffRole === 'driver' || roleName === 'Driver') {
        return DriverDashboard;
      }
      return StaffDashboard;
    }

    if (userType === 'relative') {
      return RelativeDashboard;
    }

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
          <Stack.Screen name="Login">
            {(props) => <LoginScreen {...props} onLogin={handleLogin} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Dashboard">
              {(props) => (
                <DashboardComponent 
                  {...props} 
                  userData={userData} 
                  onLogout={handleLogout} 
                />
              )}
            </Stack.Screen>

            {/* Client Screens */}
            <Stack.Screen name="ClientList" component={ClientListScreen} />
            <Stack.Screen name="ClientDetail" component={ClientDetailScreen} />
            <Stack.Screen name="AddClient" component={AddClientScreen} />
            <Stack.Screen name="EditClient" component={EditClientScreen} />
            
            {/* Staff Screens */}
            <Stack.Screen name="StaffList" component={StaffListScreen} />
            <Stack.Screen name="StaffDetail" component={StaffDetailScreen} />
            <Stack.Screen name="AddStaff" component={AddStaffScreen} />
            <Stack.Screen name="EditStaff" component={EditStaffScreen} />

            {/* Care Log Screens */}
            <Stack.Screen name="CareLogList" component={CareLogListScreen} />
            <Stack.Screen name="CareLogDetail" component={CareLogDetailScreen} />
            <Stack.Screen name="AddCareLog" component={AddCareLogScreen} />
            <Stack.Screen name="EditCareLog" component={EditCareLogScreen} />

            {/* Visit Screens */}
            <Stack.Screen name="VisitList" component={VisitListScreen} />
            <Stack.Screen name="VisitDetail" component={VisitDetailScreen} />
            <Stack.Screen name="ScheduleVisit" component={ScheduleVisitScreen} />
            <Stack.Screen name="EditVisit" component={EditVisitScreen} />
            
            {/* Staff/Carer Screens */}
            <Stack.Screen name="StaffDashboard">
              {(props) => (
                <StaffDashboard 
                  {...props} 
                  userData={userData} 
                  onLogout={handleLogout} 
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="VisitExecution" component={VisitExecutionScreen} />

            {/* Driver Screens */}
            <Stack.Screen name="DriverDashboard">
              {(props) => (
                <DriverDashboard 
                  {...props} 
                  userData={userData} 
                  onLogout={handleLogout} 
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="TransportExecution" component={TransportExecutionScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}