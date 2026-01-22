/**
 * ALBIS CARE - Permission Configuration
 *
 * This file provides utilities for checking user permissions throughout the app.
 * Permissions are received from the backend during login and stored in AsyncStorage.
 *
 * @version 1.0
 * @date 2026-01-22
 */

export interface PermissionSet {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

export interface UserPermissions {
  clients: PermissionSet;
  staff: PermissionSet;
  visits: PermissionSet;
  logs: PermissionSet;
  transport: PermissionSet;
  analytics: {
    view: boolean;
  };
}

export interface UserData {
  id: string;
  email: string;
  userType: 'admin' | 'staff' | 'relative' | 'driver';
  effective_role: 'super_admin' | 'admin' | 'care_manager' | 'staff' | 'relative' | 'driver';
  is_admin?: boolean;
  is_super_admin?: boolean;
  name?: string;
  permissions: UserPermissions;
  staff?: {
    staff_id: number;
    first_name: string;
    last_name: string;
    staff_role: string;
  };
  relative?: {
    relative_id: number;
    client_id: number;
    first_name: string;
    last_name: string;
  };
  client_id?: number; // For relatives - their linked client ID
}

/**
 * Permission checking utility class
 */
export class PermissionChecker {
  private permissions: UserPermissions;
  private userRole: string;

  constructor(userData: UserData) {
    this.permissions = userData.permissions;
    this.userRole = userData.effective_role || userData.userType;
  }

  /**
   * Check if user can perform an action on a resource
   */
  can(resource: keyof UserPermissions, action: 'view' | 'create' | 'edit' | 'delete'): boolean {
    const resourcePermissions = this.permissions[resource];

    if (!resourcePermissions) {
      return false;
    }

    // For analytics, only 'view' action exists
    if (resource === 'analytics') {
      return action === 'view' && resourcePermissions.view;
    }

    return (resourcePermissions as PermissionSet)[action] || false;
  }

  /**
   * Check if user can view a resource
   */
  canView(resource: keyof UserPermissions): boolean {
    return this.can(resource, 'view');
  }

  /**
   * Check if user can create a resource
   */
  canCreate(resource: keyof UserPermissions): boolean {
    return this.can(resource, 'create');
  }

  /**
   * Check if user can edit a resource
   */
  canEdit(resource: keyof UserPermissions): boolean {
    return this.can(resource, 'edit');
  }

  /**
   * Check if user can delete a resource
   */
  canDelete(resource: keyof UserPermissions): boolean {
    return this.can(resource, 'delete');
  }

  /**
   * Check if user is read-only for a resource
   */
  isReadOnly(resource: keyof UserPermissions): boolean {
    return this.canView(resource) &&
           !this.canCreate(resource) &&
           !this.canEdit(resource) &&
           !this.canDelete(resource);
  }

  /**
   * Check if user has admin privileges
   */
  isAdmin(): boolean {
    return this.userRole === 'super_admin' || this.userRole === 'admin';
  }

  /**
   * Check if user is super admin
   */
  isSuperAdmin(): boolean {
    return this.userRole === 'super_admin';
  }

  /**
   * Check if user is care manager
   */
  isCareManager(): boolean {
    return this.userRole === 'care_manager';
  }

  /**
   * Check if user is staff
   */
  isStaff(): boolean {
    return this.userRole === 'staff';
  }

  /**
   * Check if user is relative
   */
  isRelative(): boolean {
    return this.userRole === 'relative';
  }

  /**
   * Check if user is driver
   */
  isDriver(): boolean {
    return this.userRole === 'driver';
  }

  /**
   * Get user's effective role
   */
  getRole(): string {
    return this.userRole;
  }

  /**
   * Get readable role name for display
   */
  getRoleName(): string {
    const roleNames: Record<string, string> = {
      super_admin: 'Super Administrator',
      admin: 'Administrator',
      care_manager: 'Care Manager',
      staff: 'Care Staff',
      relative: 'Family Member',
      driver: 'Driver'
    };

    return roleNames[this.userRole] || 'User';
  }
}

/**
 * Helper function to create permission checker from user data
 */
export function createPermissionChecker(userData: UserData): PermissionChecker {
  return new PermissionChecker(userData);
}

/**
 * Default empty permissions (for logged out state)
 */
export const emptyPermissions: UserPermissions = {
  clients: { view: false, create: false, edit: false, delete: false },
  staff: { view: false, create: false, edit: false, delete: false },
  visits: { view: false, create: false, edit: false, delete: false },
  logs: { view: false, create: false, edit: false, delete: false },
  transport: { view: false, create: false, edit: false, delete: false },
  analytics: { view: false }
};

/**
 * Permission-based UI text helpers
 */
export const PermissionText = {
  /**
   * Get appropriate button label based on permissions
   */
  getButtonLabel(resource: string, isOwn: boolean = false): string {
    if (isOwn) {
      return `My ${resource}`;
    }
    return `All ${resource}`;
  },

  /**
   * Get appropriate screen title based on permissions
   */
  getScreenTitle(resource: string, role: string): string {
    if (role === 'relative') {
      return `Care ${resource}`;
    }
    if (role === 'staff') {
      return `My ${resource}`;
    }
    return resource;
  }
};

/**
 * Route parameter helpers for permission-based filtering
 */
export interface RouteParams {
  client_id?: number;
  staff_id?: number;
  isReadOnly?: boolean;
  filterByUser?: boolean;
}

export function getRouteParamsForUser(userData: UserData): RouteParams {
  const params: RouteParams = {};

  // Relatives: Filter by their linked client, read-only
  if (userData.effective_role === 'relative') {
    params.client_id = userData.client_id || userData.relative?.client_id;
    params.isReadOnly = true;
  }

  // Staff: Filter by their staff_id
  if (userData.effective_role === 'staff') {
    params.staff_id = userData.staff?.staff_id;
    params.filterByUser = true;
  }

  // Admins/Care Managers: No filtering needed
  return params;
}
