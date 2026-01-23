<?php
/**
 * ALBIS CARE - FIXED Login Endpoint
 *
 * POST /api/v1/auth/login.php
 *
 * This version uses CORRECT schema column names:
 * - user_id (not id)
 * - password_hash (not password)
 * - user_type (not userType)
 * - staff_id (users.staff_id → Staff.sNo foreign key)
 *
 * Properly detects effective_role for:
 * - Super Admin
 * - Admin
 * - Care Manager (staff with staff_role containing 'manager')
 * - Driver (staff with staff_role containing 'driver')
 * - Staff/Carer (regular staff)
 * - Relative
 *
 * @version 3.0 - FIXED
 * @date 2026-01-23
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed. Use POST.'
    ]);
    exit;
}

// Include dependencies
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/permissions.php';

// Get request body
$input = json_decode(file_get_contents('php://input'), true);
$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';

// Validate input
if (empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Email and password are required'
    ]);
    exit;
}

try {
    // Find user by email with CORRECT column names
    $stmt = $pdo->prepare("
        SELECT
            user_id,
            email,
            password_hash,
            user_type,
            staff_id,
            is_admin,
            is_super_admin,
            status
        FROM users
        WHERE email = :email AND status = 'active'
        LIMIT 1
    ");

    $stmt->execute(['email' => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // Check if user exists
    if (!$user) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid email or password'
        ]);
        exit;
    }

    // Verify password using password_hash column
    if (!password_verify($password, $user['password_hash'])) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid email or password'
        ]);
        exit;
    }

    // Initialize base user data
    $userData = [
        'id' => $user['user_id'], // Frontend expects 'id' field
        'user_id' => $user['user_id'],
        'email' => $user['email'],
        'user_type' => $user['user_type'],
        'is_admin' => (bool)$user['is_admin'],
        'is_super_admin' => (bool)$user['is_super_admin'],
        'status' => $user['status']
    ];

    // ========================================
    // Determine effective_role
    // ========================================
    if ($user['is_super_admin'] == 1) {
        $effectiveRole = 'super_admin';
        $userData['name'] = 'Super Admin';
    } elseif ($user['is_admin'] == 1) {
        $effectiveRole = 'admin';
        $userData['name'] = 'Admin';
    } else {
        // Default to user_type, will be overridden for staff with specific roles
        $effectiveRole = $user['user_type'];
    }

    // ========================================
    // Get staff details if user_type is 'staff'
    // ========================================
    if ($user['user_type'] === 'staff' && !empty($user['staff_id'])) {
        $staffStmt = $pdo->prepare("
            SELECT
                sNo as staff_id,
                sFName as first_name,
                sLName as last_name,
                staff_role,
                sEmail as email,
                sTel as phone,
                sMobile as mobile,
                sAddr1 as address_line1,
                sAddr2 as address_line2,
                sTown as town,
                sPostCode as postcode
            FROM Staff
            WHERE sNo = :staff_id
            LIMIT 1
        ");

        $staffStmt->execute(['staff_id' => $user['staff_id']]);
        $staffData = $staffStmt->fetch(PDO::FETCH_ASSOC);

        if ($staffData) {
            $userData['staff'] = $staffData;
            $userData['name'] = trim($staffData['first_name'] . ' ' . $staffData['last_name']);
            $userData['staff_id'] = $staffData['staff_id'];

            // Determine specific staff role
            $staffRole = strtolower(trim($staffData['staff_role'] ?? ''));

            // Check for Care Manager
            if (strpos($staffRole, 'manager') !== false || $staffRole === 'care manager') {
                $effectiveRole = 'care_manager';
                $userData['role'] = 'Care Manager';
            }
            // Check for Driver
            elseif (strpos($staffRole, 'driver') !== false || strpos($staffRole, 'transport') !== false) {
                $effectiveRole = 'driver';
                $userData['role'] = 'Driver';
            }
            // Default to regular staff/carer
            else {
                $effectiveRole = 'staff';
                $userData['role'] = $staffData['staff_role'] ?? 'Staff';
            }
        } else {
            // Staff record not found - should not happen if data is consistent
            error_log("WARNING: User {$user['email']} has staff_id={$user['staff_id']} but no Staff record found");
            $effectiveRole = 'staff'; // Fallback
            $userData['name'] = $user['email'];
        }
    }

    // ========================================
    // Get relative details if user_type is 'relative'
    // ========================================
    if ($user['user_type'] === 'relative') {
        $relativeStmt = $pdo->prepare("
            SELECT
                rNo as relative_id,
                rFName as first_name,
                rLName as last_name,
                cNo as client_id,
                relationship,
                rEmail as email,
                rTel as phone,
                rMobile as mobile,
                can_receive_updates,
                can_view_reports,
                can_view_visit_logs
            FROM Relative
            WHERE user_id = :user_id
            LIMIT 1
        ");

        $relativeStmt->execute(['user_id' => $user['user_id']]);
        $relativeData = $relativeStmt->fetch(PDO::FETCH_ASSOC);

        if ($relativeData) {
            $userData['relative'] = $relativeData;
            $userData['client_id'] = $relativeData['client_id'];
            $userData['name'] = trim($relativeData['first_name'] . ' ' . $relativeData['last_name']);
            $effectiveRole = 'relative';

            // Get linked client details
            $clientStmt = $pdo->prepare("
                SELECT cFName, cLName, cTitle, care_level
                FROM Clients
                WHERE cNo = :client_id
                LIMIT 1
            ");

            $clientStmt->execute(['client_id' => $relativeData['client_id']]);
            $clientData = $clientStmt->fetch(PDO::FETCH_ASSOC);

            if ($clientData) {
                $userData['linked_client'] = [
                    'name' => trim(($clientData['cTitle'] ?? '') . ' ' . $clientData['cFName'] . ' ' . $clientData['cLName']),
                    'first_name' => $clientData['cFName'],
                    'last_name' => $clientData['cLName'],
                    'title' => $clientData['cTitle'],
                    'care_level' => $clientData['care_level']
                ];
            }
        }
    }

    // Set effective_role in userData
    $userData['effective_role'] = $effectiveRole;

    // ========================================
    // Get user permissions using permission system
    // ========================================
    $userData['permissions'] = [
        'clients' => [
            'view' => checkPermission($user['user_id'], 'clients', 'view'),
            'create' => checkPermission($user['user_id'], 'clients', 'create'),
            'edit' => checkPermission($user['user_id'], 'clients', 'edit'),
            'delete' => checkPermission($user['user_id'], 'clients', 'delete'),
        ],
        'staff' => [
            'view' => checkPermission($user['user_id'], 'staff', 'view'),
            'create' => checkPermission($user['user_id'], 'staff', 'create'),
            'edit' => checkPermission($user['user_id'], 'staff', 'edit'),
            'delete' => checkPermission($user['user_id'], 'staff', 'delete'),
        ],
        'visits' => [
            'view' => checkPermission($user['user_id'], 'visits', 'view'),
            'create' => checkPermission($user['user_id'], 'visits', 'create'),
            'edit' => checkPermission($user['user_id'], 'visits', 'edit'),
            'delete' => checkPermission($user['user_id'], 'visits', 'delete'),
        ],
        'logs' => [
            'view' => checkPermission($user['user_id'], 'logs', 'view'),
            'create' => checkPermission($user['user_id'], 'logs', 'create'),
            'edit' => checkPermission($user['user_id'], 'logs', 'edit'),
            'delete' => checkPermission($user['user_id'], 'logs', 'delete'),
        ],
        'transport' => [
            'view' => checkPermission($user['user_id'], 'transport', 'view'),
            'create' => checkPermission($user['user_id'], 'transport', 'create'),
            'edit' => checkPermission($user['user_id'], 'transport', 'edit'),
            'delete' => checkPermission($user['user_id'], 'transport', 'delete'),
        ],
        'analytics' => [
            'view' => checkPermission($user['user_id'], 'analytics', 'view'),
        ],
    ];

    // Generate session token
    $token = bin2hex(random_bytes(32));

    // Optional: Store session in database
    // Implement user_sessions table if you want to validate tokens on subsequent requests
    /*
    $sessionStmt = $pdo->prepare("
        INSERT INTO user_sessions (user_id, token, expires_at, created_at)
        VALUES (:user_id, :token, DATE_ADD(NOW(), INTERVAL 7 DAY), NOW())
        ON DUPLICATE KEY UPDATE token = :token, expires_at = DATE_ADD(NOW(), INTERVAL 7 DAY)
    ");
    $sessionStmt->execute([
        'user_id' => $user['user_id'],
        'token' => $token
    ]);
    */

    // Log audit action
    logAuditAction(
        $user['user_id'],
        'login',
        'auth',
        null,
        json_encode([
            'email' => $email,
            'effective_role' => $effectiveRole
        ]),
        $_SERVER['REMOTE_ADDR'] ?? null,
        $_SERVER['HTTP_USER_AGENT'] ?? null
    );

    // Return success response
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Login successful',
        'data' => [
            'token' => $token,
            'user' => $userData
        ]
    ]);

} catch (PDOException $e) {
    error_log("Login error: " . $e->getMessage());

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred during login. Please try again.'
    ]);
}
