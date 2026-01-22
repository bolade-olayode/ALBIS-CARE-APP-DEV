/**
 * ALBIS CARE - usePermissions Hook
 *
 * React hook for accessing user permissions throughout the app.
 * Automatically loads permissions from AsyncStorage and provides permission checking utilities.
 *
 * @version 1.0
 * @date 2026-01-22
 */

import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserData, PermissionChecker, createPermissionChecker, emptyPermissions, getRouteParamsForUser } from '../config/permissions';

interface UsePermissionsResult {
  permissions: PermissionChecker | null;
  userData: UserData | null;
  loading: boolean;
  isAuthenticated: boolean;
  can: (resource: any, action: any) => boolean;
  canView: (resource: any) => boolean;
  canCreate: (resource: any) => boolean;
  canEdit: (resource: any) => boolean;
  canDelete: (resource: any) => boolean;
  isReadOnly: (resource: any) => boolean;
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
  isCareManager: () => boolean;
  isStaff: () => boolean;
  isRelative: () => boolean;
  getRole: () => string;
  getRoleName: () => string;
  getRouteParams: () => any;
  refresh: () => Promise<void>;
}

/**
 * Hook for accessing and checking user permissions
 */
export function usePermissions(): UsePermissionsResult {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [permissions, setPermissions] = useState<PermissionChecker | null>(null);
  const [loading, setLoading] = useState(true);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      const userDataString = await AsyncStorage.getItem('userData');

      if (userDataString) {
        const parsedUserData: UserData = JSON.parse(userDataString);

        // TEMPORARY FIX: Grant relatives VIEW permissions for visits and logs
        // Backend should be updated to return these permissions correctly
        if (parsedUserData.effective_role === 'relative') {
          parsedUserData.permissions = {
            ...parsedUserData.permissions,
            visits: {
              view: true,  // Relatives can view visits
              create: false,
              edit: false,
              delete: false
            },
            logs: {
              view: true,  // Relatives can view logs
              create: false,
              edit: false,
              delete: false
            }
          };
          console.log('PERMISSIONS FIX: Granted VIEW access to relative for visits and logs');
        }

        setUserData(parsedUserData);

        // Create permission checker
        const checker = createPermissionChecker(parsedUserData);
        setPermissions(checker);
      } else {
        setUserData(null);
        setPermissions(null);
      }
    } catch (error) {
      console.error('Error loading permissions:', error);
      setUserData(null);
      setPermissions(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPermissions();
  }, []);

  // Helper functions that safely handle null permissions
  const can = (resource: any, action: any): boolean => {
    return permissions?.can(resource, action) || false;
  };

  const canView = (resource: any): boolean => {
    return permissions?.canView(resource) || false;
  };

  const canCreate = (resource: any): boolean => {
    return permissions?.canCreate(resource) || false;
  };

  const canEdit = (resource: any): boolean => {
    return permissions?.canEdit(resource) || false;
  };

  const canDelete = (resource: any): boolean => {
    return permissions?.canDelete(resource) || false;
  };

  const isReadOnly = (resource: any): boolean => {
    return permissions?.isReadOnly(resource) || false;
  };

  const isAdmin = (): boolean => {
    return permissions?.isAdmin() || false;
  };

  const isSuperAdmin = (): boolean => {
    return permissions?.isSuperAdmin() || false;
  };

  const isCareManager = (): boolean => {
    return permissions?.isCareManager() || false;
  };

  const isStaff = (): boolean => {
    return permissions?.isStaff() || false;
  };

  const isRelative = (): boolean => {
    return permissions?.isRelative() || false;
  };

  const getRole = (): string => {
    return permissions?.getRole() || 'guest';
  };

  const getRoleName = (): string => {
    return permissions?.getRoleName() || 'Guest';
  };

  const getRouteParams = () => {
    if (!userData) return {};
    return getRouteParamsForUser(userData);
  };

  return {
    permissions,
    userData,
    loading,
    isAuthenticated: !!userData && !!permissions,
    can,
    canView,
    canCreate,
    canEdit,
    canDelete,
    isReadOnly,
    isAdmin,
    isSuperAdmin,
    isCareManager,
    isStaff,
    isRelative,
    getRole,
    getRoleName,
    getRouteParams,
    refresh: loadPermissions
  };
}

/**
 * Hook for checking a specific permission
 * Useful for conditional rendering
 */
export function usePermission(resource: any, action: any): boolean {
  const { can } = usePermissions();
  return can(resource, action);
}

/**
 * Hook for getting user's role
 */
export function useUserRole(): {
  role: string;
  roleName: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isCareManager: boolean;
  isStaff: boolean;
  isRelative: boolean;
  loading: boolean;
} {
  const {
    getRole,
    getRoleName,
    isAdmin,
    isSuperAdmin,
    isCareManager,
    isStaff,
    isRelative,
    loading
  } = usePermissions();

  return {
    role: getRole(),
    roleName: getRoleName(),
    isAdmin: isAdmin(),
    isSuperAdmin: isSuperAdmin(),
    isCareManager: isCareManager(),
    isStaff: isStaff(),
    isRelative: isRelative(),
    loading
  };
}
