<?php
/**
 * ALBIS CARE - Get Clients List (UPDATED with permissions)
 *
 * GET /api/v1/clients/index.php
 * GET /api/v1/clients/
 *
 * This is an UPDATED version that filters clients based on user permissions.
 * Compare with your existing clients/index.php and merge the permission checks.
 *
 * - Admins/Care Managers: See all clients
 * - Staff: See clients they're assigned to visit
 * - Relatives: See only their linked client
 *
 * @version 2.0
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

// Check view permission
if (!checkPermission($userId, 'clients', 'view')) {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'message' => 'Access denied. You do not have permission to view clients.'
    ]);
    exit;
}

// Get user role to determine filtering
$user = getUserRole($userId);
$role = $user['effective_role'];

try {
    // Build query based on role
    $query = "
        SELECT
            c.cNo as id,
            c.cNo,
            c.cFName,
            c.cLName,
            c.cTitle,
            c.cAddr1,
            c.cAddr2,
            c.cTown,
            c.cPostCode,
            c.cTel,
            c.cMobile,
            c.cEmail,
            c.cGender,
            c.care_level,
            c.date_of_birth,
            c.status,
            c.created_at
        FROM Clients c
    ";

    $where = [];
    $params = [];

    // Filter based on role
    if ($role === 'relative') {
        // Relatives can only see their linked client
        $linkedClientId = getRelativeLinkedClient($userId);
        if (!$linkedClientId) {
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'data' => [
                    'clients' => [],
                    'total' => 0
                ]
            ]);
            exit;
        }

        $where[] = 'c.cNo = :client_id';
        $params['client_id'] = $linkedClientId;
    } elseif ($role === 'staff') {
        // Staff can see clients they're assigned to visit
        $staffDetails = getStaffDetails($userId);
        if (!$staffDetails) {
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'data' => [
                    'clients' => [],
                    'total' => 0
                ]
            ]);
            exit;
        }

        $query .= "
            INNER JOIN ScheduledVisits sv ON c.cNo = sv.client_id
        ";
        $where[] = 'sv.staff_id = :staff_id';
        $params['staff_id'] = $staffDetails['staff_id'];
    }

    // Add WHERE clause if needed
    if (!empty($where)) {
        $query .= ' WHERE ' . implode(' AND ', $where);
    }

    // Add GROUP BY for staff to avoid duplicates
    if ($role === 'staff') {
        $query .= ' GROUP BY c.cNo';
    }

    // Order by name
    $query .= ' ORDER BY c.cLName ASC, c.cFName ASC';

    // Execute query
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $clients = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get total count
    $countQuery = "SELECT COUNT(DISTINCT c.cNo) as total FROM Clients c";

    if ($role === 'relative') {
        $countQuery .= " WHERE c.cNo = :client_id";
    } elseif ($role === 'staff') {
        $countQuery .= "
            INNER JOIN ScheduledVisits sv ON c.cNo = sv.client_id
            WHERE sv.staff_id = :staff_id
        ";
    }

    $countStmt = $pdo->prepare($countQuery);
    $countStmt->execute($params);
    $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

    // Log audit action for non-admin/care-manager users
    if (!in_array($role, ['super_admin', 'admin', 'care_manager'])) {
        logAuditAction(
            $userId,
            'view',
            'clients',
            null,
            'Viewed clients list',
            $_SERVER['REMOTE_ADDR'] ?? null,
            $_SERVER['HTTP_USER_AGENT'] ?? null
        );
    }

    // Return response
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => [
            'clients' => $clients,
            'total' => (int)$total
        ]
    ]);

} catch (PDOException $e) {
    error_log("Get clients error: " . $e->getMessage());

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to retrieve clients'
    ]);
}
