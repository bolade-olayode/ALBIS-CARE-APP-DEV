<?php
/**
 * ALBIS CARE - Login Endpoint (UPDATED with permissions)
 *
 * POST /api/v1/auth/login.php
 *
 * This is an UPDATED version that includes permission data in the login response.
 * Compare with your existing login.php and merge the permission-related sections.
 *
 * Body:
 * {
 *   "email": "user@example.com",
 *   "password": "password123"
 * }
 *
 * @version 2.0
 * @date 2026-01-22
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
    // Find user by email
    $stmt = $pdo->prepare("
        SELECT
            id,
            email,
            password,
            userType,
            is_admin,
            is_super_admin
        FROM users
        WHERE email = :email
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

    // Verify password
    if (!password_verify($password, $user['password'])) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid email or password'
        ]);
        exit;
    }

    // Determine effective role
    if ($user['is_super_admin'] == 1) {
        $effectiveRole = 'super_admin';
    } elseif ($user['is_admin'] == 1) {
        $effectiveRole = 'admin';
    } else {
        $effectiveRole = $user['userType'];
    }

    // Get additional user details based on userType
    $userData = [
        'id' => $user['id'],
        'email' => $user['email'],
        'userType' => $user['userType'],
        'effective_role' => $effectiveRole,
        'is_admin' => (bool)$user['is_admin'],
        'is_super_admin' => (bool)$user['is_super_admin']
    ];

    // Get staff details if user is staff
    if ($user['userType'] === 'staff') {
        $staffStmt = $pdo->prepare("
            SELECT
                sNo as staff_id,
                sFName as first_name,
                sLName as last_name,
                staff_role,
                sEmail as email,
                sTel as phone
            FROM Staff
            WHERE user_id = :user_id
            LIMIT 1
        ");

        $staffStmt->execute(['user_id' => $user['id']]);
        $staffData = $staffStmt->fetch(PDO::FETCH_ASSOC);

        if ($staffData) {
            $userData['staff'] = $staffData;
            $userData['name'] = trim($staffData['first_name'] . ' ' . $staffData['last_name']);

            // Check if staff is a care manager
            $staffRole = strtolower($staffData['staff_role']);
            if (strpos($staffRole, 'manager') !== false || $staffRole === 'care manager') {
                $userData['effective_role'] = 'care_manager';
                $userData['role'] = 'care manager';
            }
        }
    }

    // Get relative details if user is relative
    if ($user['userType'] === 'relative') {
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

        $relativeStmt->execute(['user_id' => $user['id']]);
        $relativeData = $relativeStmt->fetch(PDO::FETCH_ASSOC);

        if ($relativeData) {
            $userData['relative'] = $relativeData;
            $userData['client_id'] = $relativeData['client_id'];
            $userData['name'] = trim($relativeData['first_name'] . ' ' . $relativeData['last_name']);

            // Get linked client details
            $clientStmt = $pdo->prepare("
                SELECT cFName, cLName, cTitle
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
                    'title' => $clientData['cTitle']
                ];
            }
        }
    }

    // ========================================
    // NEW: Get user permissions
    // ========================================
    $userData['permissions'] = [
        'clients' => [
            'view' => checkPermission($user['id'], 'clients', 'view'),
            'create' => checkPermission($user['id'], 'clients', 'create'),
            'edit' => checkPermission($user['id'], 'clients', 'edit'),
            'delete' => checkPermission($user['id'], 'clients', 'delete'),
        ],
        'staff' => [
            'view' => checkPermission($user['id'], 'staff', 'view'),
            'create' => checkPermission($user['id'], 'staff', 'create'),
            'edit' => checkPermission($user['id'], 'staff', 'edit'),
            'delete' => checkPermission($user['id'], 'staff', 'delete'),
        ],
        'visits' => [
            'view' => checkPermission($user['id'], 'visits', 'view'),
            'create' => checkPermission($user['id'], 'visits', 'create'),
            'edit' => checkPermission($user['id'], 'visits', 'edit'),
            'delete' => checkPermission($user['id'], 'visits', 'delete'),
        ],
        'logs' => [
            'view' => checkPermission($user['id'], 'logs', 'view'),
            'create' => checkPermission($user['id'], 'logs', 'create'),
            'edit' => checkPermission($user['id'], 'logs', 'edit'),
            'delete' => checkPermission($user['id'], 'logs', 'delete'),
        ],
        'transport' => [
            'view' => checkPermission($user['id'], 'transport', 'view'),
            'create' => checkPermission($user['id'], 'transport', 'create'),
            'edit' => checkPermission($user['id'], 'transport', 'edit'),
            'delete' => checkPermission($user['id'], 'transport', 'delete'),
        ],
        'analytics' => [
            'view' => checkPermission($user['id'], 'analytics', 'view'),
        ],
    ];

    // Generate token (adjust based on your token generation method)
    // This is a placeholder - use your actual JWT or session token generation
    $token = bin2hex(random_bytes(32));

    // Store session in database (adjust based on your auth system)
    // You may want to create a user_sessions table
    /*
    $sessionStmt = $pdo->prepare("
        INSERT INTO user_sessions (user_id, token, expires_at)
        VALUES (:user_id, :token, DATE_ADD(NOW(), INTERVAL 7 DAY))
    ");
    $sessionStmt->execute([
        'user_id' => $user['id'],
        'token' => $token
    ]);
    */

    // Log audit action
    logAuditAction(
        $user['id'],
        'login',
        'auth',
        null,
        json_encode(['email' => $email]),
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
