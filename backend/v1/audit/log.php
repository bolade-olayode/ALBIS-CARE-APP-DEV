<?php
/**
 * ALBIS CARE - Audit Log Endpoint
 *
 * POST /api/v1/audit/log.php
 *
 * Creates a new audit log entry.
 * This can be called from frontend to log important user actions.
 *
 * Body:
 * {
 *   "action": "view",
 *   "resource": "client",
 *   "resource_id": 123,
 *   "details": "Viewed client profile"
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

// Get request body
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
$action = $input['action'] ?? '';
$resource = $input['resource'] ?? '';
$resourceId = isset($input['resource_id']) ? (int)$input['resource_id'] : null;
$details = $input['details'] ?? '';

// Validation
if (empty($action)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Action is required'
    ]);
    exit;
}

if (empty($resource)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Resource is required'
    ]);
    exit;
}

// Get client info
$ipAddress = $_SERVER['REMOTE_ADDR'] ?? null;
$userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;

// Log the action
$success = logAuditAction(
    $userId,
    $action,
    $resource,
    $resourceId,
    $details,
    $ipAddress,
    $userAgent
);

if ($success) {
    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Audit log created successfully'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to create audit log'
    ]);
}
