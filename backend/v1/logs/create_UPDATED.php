<?php
/**
 * ALBIS CARE - Create Care Log (UPDATED with permissions)
 *
 * POST /api/v1/logs/create.php
 *
 * This is an UPDATED version that enforces:
 * - Only staff assigned to a visit can create care logs for that visit
 * - Admins and care managers CANNOT create care logs (they can only view/delete)
 *
 * Body:
 * {
 *   "visit_id": 123,
 *   "care_provided": "Assisted with morning routine...",
 *   "notes": "Client was in good spirits",
 *   "duration_minutes": 60,
 *   "tasks_completed": ["bathing", "medication", "meal"]
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

// Get user role
$user = getUserRole($userId);
$role = $user['effective_role'];

// IMPORTANT: Only staff can create care logs, not admins or care managers
if (!in_array($role, ['staff', 'care_manager'])) {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'message' => 'Access denied. Only care staff can create care logs.'
    ]);
    exit;
}

// Get staff details
$staffDetails = getStaffDetails($userId);
if (!$staffDetails) {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'message' => 'Staff record not found for this user.'
    ]);
    exit;
}

$staffId = $staffDetails['staff_id'];

// Get request body
$input = json_decode(file_get_contents('php://input'), true);

// Validate required fields
$visitId = isset($input['visit_id']) ? (int)$input['visit_id'] : null;
$careProvided = trim($input['care_provided'] ?? '');
$notes = trim($input['notes'] ?? '');
$durationMinutes = isset($input['duration_minutes']) ? (int)$input['duration_minutes'] : null;
$tasksCompleted = $input['tasks_completed'] ?? [];

// Validation
$errors = [];

if (!$visitId) {
    $errors[] = 'Visit ID is required';
}

if (empty($careProvided)) {
    $errors[] = 'Care provided description is required';
}

if ($durationMinutes && $durationMinutes <= 0) {
    $errors[] = 'Duration must be a positive number';
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

// CRITICAL: Verify that this staff member is assigned to this visit
if (!canCreateCareLog($staffId, $visitId)) {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'message' => 'Access denied. You can only create care logs for visits assigned to you.'
    ]);

    // Log unauthorized attempt
    logAuditAction(
        $userId,
        'create_attempt_denied',
        'log',
        null,
        json_encode([
            'visit_id' => $visitId,
            'reason' => 'Not assigned to visit'
        ]),
        $_SERVER['REMOTE_ADDR'] ?? null,
        $_SERVER['HTTP_USER_AGENT'] ?? null
    );

    exit;
}

// Get visit details for additional validation
try {
    $visitStmt = $pdo->prepare("
        SELECT
            visit_id,
            client_id,
            visit_date,
            visit_time,
            status
        FROM ScheduledVisits
        WHERE visit_id = :visit_id
        LIMIT 1
    ");

    $visitStmt->execute(['visit_id' => $visitId]);
    $visit = $visitStmt->fetch(PDO::FETCH_ASSOC);

    if (!$visit) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Visit not found'
        ]);
        exit;
    }

    // Check if log already exists for this visit
    $existingLogStmt = $pdo->prepare("
        SELECT log_id
        FROM CareLogs
        WHERE visit_id = :visit_id
        LIMIT 1
    ");

    $existingLogStmt->execute(['visit_id' => $visitId]);
    if ($existingLogStmt->fetch()) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'A care log already exists for this visit'
        ]);
        exit;
    }

    // Create care log
    $pdo->beginTransaction();

    $insertStmt = $pdo->prepare("
        INSERT INTO CareLogs (
            visit_id,
            client_id,
            staff_id,
            care_provided,
            notes,
            duration_minutes,
            tasks_completed,
            log_date,
            created_at
        ) VALUES (
            :visit_id,
            :client_id,
            :staff_id,
            :care_provided,
            :notes,
            :duration_minutes,
            :tasks_completed,
            NOW(),
            NOW()
        )
    ");

    $insertStmt->execute([
        'visit_id' => $visitId,
        'client_id' => $visit['client_id'],
        'staff_id' => $staffId,
        'care_provided' => $careProvided,
        'notes' => $notes,
        'duration_minutes' => $durationMinutes,
        'tasks_completed' => !empty($tasksCompleted) ? json_encode($tasksCompleted) : null
    ]);

    $logId = $pdo->lastInsertId();

    // Update visit status to completed if not already
    if ($visit['status'] !== 'completed') {
        $updateVisitStmt = $pdo->prepare("
            UPDATE ScheduledVisits
            SET status = 'completed', actual_end_time = NOW()
            WHERE visit_id = :visit_id
        ");
        $updateVisitStmt->execute(['visit_id' => $visitId]);
    }

    $pdo->commit();

    // Log audit action
    logAuditAction(
        $userId,
        'create',
        'log',
        $logId,
        json_encode([
            'visit_id' => $visitId,
            'client_id' => $visit['client_id']
        ]),
        $_SERVER['REMOTE_ADDR'] ?? null,
        $_SERVER['HTTP_USER_AGENT'] ?? null
    );

    // Return success
    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Care log created successfully',
        'data' => [
            'log_id' => $logId,
            'visit_id' => $visitId,
            'created_at' => date('Y-m-d H:i:s')
        ]
    ]);

} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    error_log("Create care log error: " . $e->getMessage());

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to create care log. Please try again.'
    ]);
}
