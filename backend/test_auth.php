<?php
/**
 * DIAGNOSTIC ENDPOINT - Test Authorization Header
 *
 * Upload this to: public_html/api/test_auth.php
 * Then call it from your app to see what headers are received
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Collect ALL possible Authorization header locations
$authHeader = null;
$foundIn = 'NOT FOUND';

// Method 1: HTTP_AUTHORIZATION
if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    $foundIn = '$_SERVER[HTTP_AUTHORIZATION]';
}

// Method 2: REDIRECT_HTTP_AUTHORIZATION (Hostinger specific)
if (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION']) && !$authHeader) {
    $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    $foundIn = '$_SERVER[REDIRECT_HTTP_AUTHORIZATION]';
}

// Method 3: getallheaders()
if (function_exists('getallheaders') && !$authHeader) {
    $headers = getallheaders();
    if (isset($headers['Authorization'])) {
        $authHeader = $headers['Authorization'];
        $foundIn = 'getallheaders()[Authorization]';
    }
}

// Method 4: apache_request_headers()
if (function_exists('apache_request_headers') && !$authHeader) {
    $headers = apache_request_headers();
    if (isset($headers['Authorization'])) {
        $authHeader = $headers['Authorization'];
        $foundIn = 'apache_request_headers()[Authorization]';
    }
}

// Collect all $_SERVER keys that might contain auth info
$serverKeys = [];
foreach ($_SERVER as $key => $value) {
    if (stripos($key, 'AUTH') !== false || stripos($key, 'BEARER') !== false || stripos($key, 'TOKEN') !== false) {
        $serverKeys[$key] = substr($value, 0, 50) . '...'; // Truncate for security
    }
}

// Collect all headers
$allHeaders = [];
if (function_exists('getallheaders')) {
    $allHeaders = getallheaders();
    // Truncate Authorization for security
    if (isset($allHeaders['Authorization'])) {
        $allHeaders['Authorization'] = substr($allHeaders['Authorization'], 0, 30) . '...';
    }
}

echo json_encode([
    'success' => true,
    'message' => 'Authorization Header Diagnostic',
    'results' => [
        'auth_header_found' => !!$authHeader,
        'auth_header_location' => $foundIn,
        'auth_header_preview' => $authHeader ? substr($authHeader, 0, 30) . '...' : null,
        'server_keys_with_auth' => $serverKeys,
        'all_headers_received' => $allHeaders,
        'php_sapi' => php_sapi_name(),
        'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'unknown',
    ],
    'recommendations' => [
        'If auth_header_found is false, the Authorization header is being stripped by Apache',
        'Check if .htaccess file exists in public_html/api/',
        'Check if mod_rewrite is enabled on your hosting',
        'If REDIRECT_HTTP_AUTHORIZATION is present, update verifyAuth() to check it',
    ]
], JSON_PRETTY_PRINT);
?>
