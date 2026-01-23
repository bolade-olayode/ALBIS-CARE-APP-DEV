<?php
/**
 * ALBIS CARE - Permission Check Endpoint
 *
 * GET /api/v1/permissions/check.php?resource=clients&action=create
 *
 * Returns whether the authenticated user has permission to perform
 * the specified action on the specified resource.
 *
 * @version 1.0
 * @date 2026-01-22
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed. Use GET.'
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

// Get query parameters
$resource = $_GET['resource'] ?? null;
$action = $_GET['action'] ?? null;
$resourceId = isset($_GET['resource_id']) ? (int)$_GET['resource_id'] : null;

// Validate required parameters
if (!$resource || !$action) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Missing required parameters: resource and action'
    ]);
    exit;
}

// Validate resource
$validResources = ['clients', 'staff', 'visits', 'logs', 'transport', 'analytics', 'admins'];
if (!in_array($resource, $validResources)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid resource. Valid resources: ' . implode(', ', $validResources)
    ]);
    exit;
}

// Validate action
$validActions = ['view', 'create', 'edit', 'delete'];
if (!in_array($action, $validActions)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid action. Valid actions: ' . implode(', ', $validActions)
    ]);
    exit;
}

// Check permission
$allowed = checkPermission($userId, $resource, $action, $resourceId);

// Get user role for additional context
$user = getUserRole($userId);

// Return response
http_response_code(200);
echo json_encode([
    'success' => true,
    'data' => [
        'allowed' => $allowed,
        'resource' => $resource,
        'action' => $action,
        'resource_id' => $resourceId,
        'user_role' => $user['effective_role'] ?? 'unknown'
    ]
]);
