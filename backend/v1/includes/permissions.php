<?php
/**
 * ALBIS CARE - Permission System Helper Functions
 *
 * This file provides centralized permission checking logic for the entire API.
 * All API endpoints should use these functions to validate user permissions.
 *
 * @version 1.0
 * @date 2026-01-22
 */

// Include database connection
require_once __DIR__ . '/db.php';

/**
 * Get user role and details from database
 *
 * @param int $userId User ID
 * @return array|null User details including role, or null if not found
 */
function getUserRole($userId) {
    global $pdo;

    try {
        $stmt = $pdo->prepare("
            SELECT
                id,
                email,
                userType,
                is_super_admin,
                is_admin,
                created_by
            FROM users
            WHERE id = :user_id
            LIMIT 1
        ");

        $stmt->execute(['user_id' => $userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            return null;
        }

        // Determine effective role
        if ($user['is_super_admin'] == 1) {
            $user['effective_role'] = 'super_admin';
        } elseif ($user['is_admin'] == 1) {
            $user['effective_role'] = 'admin';
        } else {
            $user['effective_role'] = $user['userType'];
        }

        return $user;
    } catch (PDOException $e) {
        error_log("getUserRole Error: " . $e->getMessage());
        return null;
    }
}

/**
 * Get staff details for a user (if they are staff)
 *
 * @param int $userId User ID
 * @return array|null Staff details or null if not staff
 */
function getStaffDetails($userId) {
    global $pdo;

    try {
        $stmt = $pdo->prepare("
            SELECT
                sNo as staff_id,
                user_id,
                staff_role,
                sFName,
                sLName
            FROM Staff
            WHERE user_id = :user_id
            LIMIT 1
        ");

        $stmt->execute(['user_id' => $userId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        error_log("getStaffDetails Error: " . $e->getMessage());
        return null;
    }
}

/**
 * Get linked client ID for a relative user
 *
 * @param int $userId User ID
 * @return int|null Client ID (cNo) or null if not found
 */
function getRelativeLinkedClient($userId) {
    global $pdo;

    try {
        $stmt = $pdo->prepare("
            SELECT cNo
            FROM Relative
            WHERE user_id = :user_id
            LIMIT 1
        ");

        $stmt->execute(['user_id' => $userId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        return $result ? (int)$result['cNo'] : null;
    } catch (PDOException $e) {
        error_log("getRelativeLinkedClient Error: " . $e->getMessage());
        return null;
    }
}

/**
 * Check if user has permission to perform an action on a resource
 *
 * @param int $userId User ID
 * @param string $resource Resource name (clients, staff, visits, logs, transport)
 * @param string $action Action to perform (view, create, edit, delete)
 * @param int|null $resourceId Optional specific resource ID to check ownership
 * @return bool True if allowed, false otherwise
 */
function checkPermission($userId, $resource, $action, $resourceId = null) {
    $user = getUserRole($userId);

    if (!$user) {
        return false;
    }

    $role = $user['effective_role'];

    // Super Admin has all permissions
    if ($role === 'super_admin') {
        return true;
    }

    // Define permission matrix
    $permissions = [
        'admin' => [
            'clients' => ['view' => true, 'create' => true, 'edit' => true, 'delete' => true],
            'staff' => ['view' => true, 'create' => true, 'edit' => true, 'delete' => true],
            'visits' => ['view' => true, 'create' => true, 'edit' => true, 'delete' => true],
            'logs' => ['view' => true, 'create' => false, 'edit' => false, 'delete' => true],  // Can't create logs
            'transport' => ['view' => true, 'create' => true, 'edit' => true, 'delete' => true],
            'analytics' => ['view' => true],
            'admins' => ['view' => false, 'create' => false, 'edit' => false, 'delete' => false],  // Can't manage admins
        ],
        'care_manager' => [
            'clients' => ['view' => true, 'create' => false, 'edit' => true, 'delete' => false],  // View/edit only
            'staff' => ['view' => true, 'create' => false, 'edit' => false, 'delete' => false],  // View only
            'visits' => ['view' => true, 'create' => true, 'edit' => true, 'delete' => true],  // Full access
            'logs' => ['view' => true, 'create' => false, 'edit' => false, 'delete' => true],  // View/delete only
            'transport' => ['view' => true, 'create' => true, 'edit' => true, 'delete' => true],  // Full access
            'analytics' => ['view' => true],
        ],
        'staff' => [
            'clients' => ['view' => true, 'create' => false, 'edit' => false, 'delete' => false],
            'staff' => ['view' => false, 'create' => false, 'edit' => false, 'delete' => false],
            'visits' => ['view' => 'assigned', 'create' => false, 'edit' => false, 'delete' => false],  // Only assigned visits
            'logs' => ['view' => 'own', 'create' => 'assigned', 'edit' => false, 'delete' => false],  // Can create logs for assigned visits
            'transport' => ['view' => false, 'create' => false, 'edit' => false, 'delete' => false],
            'analytics' => ['view' => false],
        ],
        'relative' => [
            'clients' => ['view' => 'linked', 'create' => false, 'edit' => false, 'delete' => false],  // Only linked client
            'staff' => ['view' => false, 'create' => false, 'edit' => false, 'delete' => false],
            'visits' => ['view' => 'linked', 'create' => false, 'edit' => false, 'delete' => false],  // Only linked client's visits
            'logs' => ['view' => 'linked', 'create' => false, 'edit' => false, 'delete' => false],  // Only linked client's logs
            'transport' => ['view' => false, 'create' => false, 'edit' => false, 'delete' => false],
            'analytics' => ['view' => 'linked'],  // Only linked client's analytics
        ],
    ];

    // Map staff role variations to care_manager
    if ($role === 'staff') {
        $staffDetails = getStaffDetails($userId);
        if ($staffDetails) {
            $staffRole = strtolower($staffDetails['staff_role']);
            if (strpos($staffRole, 'manager') !== false || $staffRole === 'care manager') {
                $role = 'care_manager';
            }
        }
    }

    // Check if role exists in permission matrix
    if (!isset($permissions[$role])) {
        return false;
    }

    // Check if resource exists for this role
    if (!isset($permissions[$role][$resource])) {
        return false;
    }

    // Get permission for this action
    $permission = $permissions[$role][$resource][$action] ?? false;

    // Handle boolean permissions
    if ($permission === true) {
        return true;
    }

    if ($permission === false) {
        return false;
    }

    // Handle scoped permissions (own, assigned, linked)
    if (is_string($permission) && $resourceId !== null) {
        switch ($permission) {
            case 'own':
                return checkOwnership($userId, $resource, $resourceId);
            case 'assigned':
                return checkAssignment($userId, $resource, $resourceId);
            case 'linked':
                return checkLinked($userId, $resource, $resourceId);
        }
    }

    return false;
}

/**
 * Check if user owns a resource
 *
 * @param int $userId User ID
 * @param string $resource Resource type
 * @param int $resourceId Resource ID
 * @return bool True if user owns the resource
 */
function checkOwnership($userId, $resource, $resourceId) {
    global $pdo;

    try {
        $staffDetails = getStaffDetails($userId);
        if (!$staffDetails) {
            return false;
        }

        $staffId = $staffDetails['staff_id'];

        switch ($resource) {
            case 'logs':
                // Check if staff created this log
                $stmt = $pdo->prepare("SELECT log_id FROM CareLogs WHERE log_id = :resource_id AND staff_id = :staff_id LIMIT 1");
                $stmt->execute(['resource_id' => $resourceId, 'staff_id' => $staffId]);
                return $stmt->fetch() !== false;

            case 'visits':
                // Check if staff is assigned to this visit
                $stmt = $pdo->prepare("SELECT visit_id FROM ScheduledVisits WHERE visit_id = :resource_id AND staff_id = :staff_id LIMIT 1");
                $stmt->execute(['resource_id' => $resourceId, 'staff_id' => $staffId]);
                return $stmt->fetch() !== false;

            default:
                return false;
        }
    } catch (PDOException $e) {
        error_log("checkOwnership Error: " . $e->getMessage());
        return false;
    }
}

/**
 * Check if user is assigned to a resource (e.g., staff assigned to visit)
 *
 * @param int $userId User ID
 * @param string $resource Resource type
 * @param int $resourceId Resource ID
 * @return bool True if user is assigned
 */
function checkAssignment($userId, $resource, $resourceId) {
    global $pdo;

    try {
        $staffDetails = getStaffDetails($userId);
        if (!$staffDetails) {
            return false;
        }

        $staffId = $staffDetails['staff_id'];

        switch ($resource) {
            case 'visits':
                // Check if staff is assigned to this visit
                $stmt = $pdo->prepare("SELECT visit_id FROM ScheduledVisits WHERE visit_id = :resource_id AND staff_id = :staff_id LIMIT 1");
                $stmt->execute(['resource_id' => $resourceId, 'staff_id' => $staffId]);
                return $stmt->fetch() !== false;

            case 'logs':
                // Check if log is for a visit assigned to this staff
                $stmt = $pdo->prepare("
                    SELECT cl.log_id
                    FROM CareLogs cl
                    INNER JOIN ScheduledVisits sv ON cl.visit_id = sv.visit_id
                    WHERE cl.log_id = :resource_id AND sv.staff_id = :staff_id
                    LIMIT 1
                ");
                $stmt->execute(['resource_id' => $resourceId, 'staff_id' => $staffId]);
                return $stmt->fetch() !== false;

            default:
                return false;
        }
    } catch (PDOException $e) {
        error_log("checkAssignment Error: " . $e->getMessage());
        return false;
    }
}

/**
 * Check if resource is linked to user's care recipient (for relatives)
 *
 * @param int $userId User ID
 * @param string $resource Resource type
 * @param int $resourceId Resource ID
 * @return bool True if resource is linked to user's client
 */
function checkLinked($userId, $resource, $resourceId) {
    global $pdo;

    $linkedClientId = getRelativeLinkedClient($userId);
    if (!$linkedClientId) {
        return false;
    }

    try {
        switch ($resource) {
            case 'clients':
                // Check if this is their linked client
                return $resourceId == $linkedClientId;

            case 'visits':
                // Check if visit is for their linked client
                $stmt = $pdo->prepare("SELECT visit_id FROM ScheduledVisits WHERE visit_id = :resource_id AND client_id = :client_id LIMIT 1");
                $stmt->execute(['resource_id' => $resourceId, 'client_id' => $linkedClientId]);
                return $stmt->fetch() !== false;

            case 'logs':
                // Check if log is for their linked client
                $stmt = $pdo->prepare("
                    SELECT cl.log_id
                    FROM CareLogs cl
                    INNER JOIN ScheduledVisits sv ON cl.visit_id = sv.visit_id
                    WHERE cl.log_id = :resource_id AND sv.client_id = :client_id
                    LIMIT 1
                ");
                $stmt->execute(['resource_id' => $resourceId, 'client_id' => $linkedClientId]);
                return $stmt->fetch() !== false;

            default:
                return false;
        }
    } catch (PDOException $e) {
        error_log("checkLinked Error: " . $e->getMessage());
        return false;
    }
}

/**
 * Check if staff member can create a care log for a specific visit
 *
 * @param int $staffId Staff ID (sNo from Staff table)
 * @param int $visitId Visit ID
 * @return bool True if staff can create log for this visit
 */
function canCreateCareLog($staffId, $visitId) {
    global $pdo;

    try {
        // Check if this staff member is assigned to the visit
        $stmt = $pdo->prepare("
            SELECT visit_id
            FROM ScheduledVisits
            WHERE visit_id = :visit_id AND staff_id = :staff_id
            LIMIT 1
        ");

        $stmt->execute([
            'visit_id' => $visitId,
            'staff_id' => $staffId
        ]);

        return $stmt->fetch() !== false;
    } catch (PDOException $e) {
        error_log("canCreateCareLog Error: " . $e->getMessage());
        return false;
    }
}

/**
 * Log audit action to database
 *
 * @param int $userId User ID performing the action
 * @param string $action Action performed (create, update, delete, view)
 * @param string $resource Resource type
 * @param int|null $resourceId Resource ID
 * @param string $details Additional details (JSON or text)
 * @param string|null $ipAddress User's IP address
 * @param string|null $userAgent User's browser user agent
 * @return bool True if logged successfully
 */
function logAuditAction($userId, $action, $resource, $resourceId = null, $details = '', $ipAddress = null, $userAgent = null) {
    global $pdo;

    try {
        $stmt = $pdo->prepare("
            INSERT INTO audit_log (
                user_id,
                action,
                resource,
                resource_id,
                details,
                ip_address,
                user_agent,
                created_at
            ) VALUES (
                :user_id,
                :action,
                :resource,
                :resource_id,
                :details,
                :ip_address,
                :user_agent,
                NOW()
            )
        ");

        return $stmt->execute([
            'user_id' => $userId,
            'action' => $action,
            'resource' => $resource,
            'resource_id' => $resourceId,
            'details' => $details,
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent
        ]);
    } catch (PDOException $e) {
        error_log("logAuditAction Error: " . $e->getMessage());
        return false;
    }
}

/**
 * Get user ID from JWT token
 *
 * @param string $token JWT Bearer token
 * @return int|null User ID or null if invalid
 */
function getUserIdFromToken($token) {
    // Remove 'Bearer ' prefix if present
    $token = str_replace('Bearer ', '', $token);

    // This is a simplified version - adjust based on your JWT implementation
    // You may need to include a JWT library like firebase/php-jwt

    try {
        // If you're using JWT, decode it here
        // For now, this is a placeholder - adjust based on your auth system

        // Example if you're storing user_id in a sessions table:
        global $pdo;
        $stmt = $pdo->prepare("SELECT user_id FROM user_sessions WHERE token = :token AND expires_at > NOW() LIMIT 1");
        $stmt->execute(['token' => $token]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        return $result ? (int)$result['user_id'] : null;
    } catch (Exception $e) {
        error_log("getUserIdFromToken Error: " . $e->getMessage());
        return null;
    }
}

/**
 * Verify authorization header and return user ID
 *
 * @return array [success, userId, message]
 */
function verifyAuth() {
    $headers = getallheaders();

    if (!isset($headers['Authorization'])) {
        return [
            'success' => false,
            'userId' => null,
            'message' => 'Authorization header missing'
        ];
    }

    $token = str_replace('Bearer ', '', $headers['Authorization']);
    $userId = getUserIdFromToken($token);

    if (!$userId) {
        return [
            'success' => false,
            'userId' => null,
            'message' => 'Invalid or expired token'
        ];
    }

    return [
        'success' => true,
        'userId' => $userId,
        'message' => 'Authorized'
    ];
}
