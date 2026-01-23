<?php
/**
 * ALBIS CARE - Admin Creation Endpoint
 *
 * POST /api/v1/admin/create.php
 *
 * Creates a new admin or super admin user.
 * Only super admins can access this endpoint.
 *
 * Body:
 * {
 *   "email": "admin@albiscare.co.uk",
 *   "password": "secure_password",
 *   "first_name": "John",
 *   "last_name": "Doe",
 *   "is_super_admin": false
 * }
 *
 * @version 1.0
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

// Verify authentication
$auth = verifyAuth();
if (!$auth['success']) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => $auth['message']
    ]);
    exit;
}

$userId = $auth['userId'];

// Check if user is super admin
$user = getUserRole($userId);
if (!$user || $user['effective_role'] !== 'super_admin') {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'message' => 'Access denied. Only super admins can create admin accounts.'
    ]);
    exit;
}

// Get request body
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';
$firstName = trim($input['first_name'] ?? '');
$lastName = trim($input['last_name'] ?? '');
$isSuperAdmin = isset($input['is_super_admin']) ? (bool)$input['is_super_admin'] : false;

// Validation
$errors = [];

if (empty($email)) {
    $errors[] = 'Email is required';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Invalid email format';
}

if (empty($password)) {
    $errors[] = 'Password is required';
} elseif (strlen($password) < 8) {
    $errors[] = 'Password must be at least 8 characters';
}

if (empty($firstName)) {
    $errors[] = 'First name is required';
}

if (empty($lastName)) {
    $errors[] = 'Last name is required';
}

// Check if email already exists
try {
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = :email LIMIT 1");
    $stmt->execute(['email' => $email]);
    if ($stmt->fetch()) {
        $errors[] = 'Email already exists';
    }
} catch (PDOException $e) {
    error_log("Email check error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error occurred'
    ]);
    exit;
}

// Return validation errors
if (!empty($errors)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Validation failed',
        'errors' => $errors
    ]);
    exit;
}

// Hash password
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Create admin user
try {
    $pdo->beginTransaction();

    // Insert into users table
    $stmt = $pdo->prepare("
        INSERT INTO users (
            email,
            password,
            userType,
            is_admin,
            is_super_admin,
            created_by,
            created_at
        ) VALUES (
            :email,
            :password,
            'admin',
            1,
            :is_super_admin,
            :created_by,
            NOW()
        )
    ");

    $stmt->execute([
        'email' => $email,
        'password' => $hashedPassword,
        'is_super_admin' => $isSuperAdmin ? 1 : 0,
        'created_by' => $userId
    ]);

    $newAdminId = $pdo->lastInsertId();

    // Optionally create an entry in Staff or Admin table if you have one
    // Adjust this based on your database schema

    $pdo->commit();

    // Log audit action
    $adminType = $isSuperAdmin ? 'super_admin' : 'admin';
    $details = json_encode([
        'email' => $email,
        'admin_type' => $adminType,
        'name' => "$firstName $lastName"
    ]);

    logAuditAction(
        $userId,
        'create',
        'admin',
        $newAdminId,
        $details,
        $_SERVER['REMOTE_ADDR'] ?? null,
        $_SERVER['HTTP_USER_AGENT'] ?? null
    );

    // Return success
    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Admin account created successfully',
        'data' => [
            'admin_id' => $newAdminId,
            'email' => $email,
            'is_super_admin' => $isSuperAdmin,
            'created_at' => date('Y-m-d H:i:s')
        ]
    ]);

} catch (PDOException $e) {
    $pdo->rollBack();
    error_log("Admin creation error: " . $e->getMessage());

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to create admin account. Please try again.'
    ]);
}
