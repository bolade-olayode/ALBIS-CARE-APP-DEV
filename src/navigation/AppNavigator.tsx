// src/navigation/AppNavigator.tsx

import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View, Text } from 'react-native';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import AdminDashboard from '../screens/dashboard/AdminDashboard';
import StaffDashboard from '../screens/dashboard/StaffDashboard';
import RelativeDashboard from '../screens/dashboard/RelativeDashboard';
import ClientListScreen from '../screens/clients/ClientListScreen';
import ClientDetailScreen from '../screens/clients/ClientDetailScreen';
import AddClientScreen from '../screens/clients/AddClientScreen';
import EditClientScreen from '../screens/clients/EditClientScreen';
import StaffListScreen from '../screens/staff/StaffListScreen';
import StaffDetailScreen from '../screens/staff/StaffDetailScreen';
import AddStaffScreen from '../screens/staff/AddStaffScreen';
import EditStaffScreen from '../screens/staff/EditStaffScreen';


const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);

  // Check if user is logged in
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

  // Show loading screen while checking auth
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  // Determine which dashboard to show based on user type
  const getDashboardComponent = () => {
    if (!userData) return null;

    const userType = userData.user?.userType;
    const roleId = userData.staff?.roleId;

    // Admin (roleId 1)
    if (userType === 'staff' && roleId === 1) {
      return AdminDashboard;
    }
    
    // Staff (roleId 2 or 3)
    if (userType === 'staff') {
      return StaffDashboard;
    }
    
    // Relative
    if (userType === 'relative') {
      return RelativeDashboard;
    }

    return AdminDashboard; // Default fallback
  };

  const DashboardComponent = getDashboardComponent();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!userToken ? (
          // Not logged in - show login screen
          <Stack.Screen name="Login">
            {(props) => <LoginScreen {...props} onLogin={handleLogin} />}
          </Stack.Screen>
        ) : (
          <>
            {/* Main Dashboard */}
            <Stack.Screen name="Dashboard">
              {(props) => DashboardComponent ? (
                <DashboardComponent {...props} userData={userData} onLogout={handleLogout} />
              ) : (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <Text>Error loading dashboard</Text>
                </View>
              )}
            </Stack.Screen>

            {/* Client List Screen-list all the clients available */}
            <Stack.Screen 
              name="ClientList" 
              component={ClientListScreen}
              options={{ headerShown: false }}
            />
            
            {/* Client Detail Screen-shows details of all clients available */}
            <Stack.Screen 
            name="ClientDetail" 
            component={ClientDetailScreen}
            options={{ headerShown: false }}
            />

            {/* Add Client Screen */}
            <Stack.Screen 
            name="AddClient" 
            component={AddClientScreen}
            options={{ headerShown: false }}
            />

           {/* Edit Client Screen */}
           <Stack.Screen 
           name="EditClient" 
           component={EditClientScreen}
           options={{ headerShown: false }}
           />
          
          {/* Staff Lists Screen */}
          <Stack.Screen 
          name="StaffList" 
          component={StaffListScreen}
          options={{ headerShown: false }}
          />

         {/* Staff Detail Screen */}
         <Stack.Screen 
        name="StaffDetail" 
        component={StaffDetailScreen}
        options={{ headerShown: false }}
       /> 
       
       {/* Add Staff Screen */}
       <Stack.Screen 
        name="AddStaff" 
        component={AddStaffScreen}
        options={{ headerShown: false }}
        />

       {/* Edit Staff Screen */}
       <Stack.Screen 
       name="EditStaff" 
       component={EditStaffScreen}
       options={{ headerShown: false }}
       />


          </>
          
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}