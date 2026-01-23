<?php
/**
 * ALBIS CARE - Get Audit Logs Endpoint
 *
 * GET /api/v1/audit/get.php?limit=50&offset=0&user_id=123&resource=client&action=delete
 *
 * Retrieves audit log entries. Only accessible by admins and care managers.
 *
 * Query Parameters:
 * - limit: Number of records to return (default: 50, max: 500)
 * - offset: Number of records to skip (default: 0)
 * - user_id: Filter by specific user
 * - resource: Filter by resource type
 * - action: Filter by action type
 * - start_date: Filter logs from this date (YYYY-MM-DD)
 * - end_date: Filter logs until this date (YYYY-MM-DD)
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

// Check if user is admin or care manager
$user = getUserRole($userId);
if (!$user || !in_array($user['effective_role'], ['super_admin', 'admin', 'care_manager'])) {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'message' => 'Access denied. Only admins and care managers can view audit logs.'
    ]);
    exit;
}

// Get query parameters
$limit = isset($_GET['limit']) ? min((int)$_GET['limit'], 500) : 50;
$offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
$filterUserId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : null;
$filterResource = $_GET['resource'] ?? null;
$filterAction = $_GET['action'] ?? null;
$startDate = $_GET['start_date'] ?? null;
$endDate = $_GET['end_date'] ?? null;

// Build WHERE clause
$where = [];
$params = [];

if ($filterUserId) {
    $where[] = 'al.user_id = :user_id';
    $params['user_id'] = $filterUserId;
}

if ($filterResource) {
    $where[] = 'al.resource = :resource';
    $params['resource'] = $filterResource;
}

if ($filterAction) {
    $where[] = 'al.action = :action';
    $params['action'] = $filterAction;
}

if ($startDate) {
    $where[] = 'DATE(al.created_at) >= :start_date';
    $params['start_date'] = $startDate;
}

if ($endDate) {
    $where[] = 'DATE(al.created_at) <= :end_date';
    $params['end_date'] = $endDate;
}

$whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';

try {
    // Get total count
    $countQuery = "
        SELECT COUNT(*) as total
        FROM audit_log al
        $whereClause
    ";

    $stmt = $pdo->prepare($countQuery);
    $stmt->execute($params);
    $totalCount = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

    // Get audit logs with user information
    $query = "
        SELECT
            al.audit_id,
            al.user_id,
            u.email as user_email,
            al.action,
            al.resource,
            al.resource_id,
            al.details,
            al.ip_address,
            al.user_agent,
            al.created_at
        FROM audit_log al
        LEFT JOIN users u ON al.user_id = u.id
        $whereClause
        ORDER BY al.created_at DESC
        LIMIT :limit OFFSET :offset
    ";

    $stmt = $pdo->prepare($query);

    // Bind filter params
    foreach ($params as $key => $value) {
        $stmt->bindValue(":$key", $value);
    }

    // Bind limit and offset
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);

    $stmt->execute();
    $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Return response
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => [
            'logs' => $logs,
            'total' => $totalCount,
            'limit' => $limit,
            'offset' => $offset
        ]
    ]);

} catch (PDOException $e) {
    error_log("Get audit logs error: " . $e->getMessage());

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to retrieve audit logs'
    ]);
}
