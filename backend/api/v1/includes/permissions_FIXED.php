/**
 * Verify authorization - UPDATED to work with .htaccess fix
 */
function verifyAuth() {
    // Try multiple methods to get the Authorization header
    $authHeader = null;

    // Method 1: Check $_SERVER (works after .htaccess RewriteRule)
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    }
    // Method 2: Try getallheaders() (works on some servers)
    elseif (function_exists('getallheaders')) {
        $headers = getallheaders();
        if (isset($headers['Authorization'])) {
            $authHeader = $headers['Authorization'];
        }
    }
    // Method 3: Try apache_request_headers() (alternative)
    elseif (function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        if (isset($headers['Authorization'])) {
            $authHeader = $headers['Authorization'];
        }
    }

    // If no Authorization header found
    if (!$authHeader) {
        return ['success' => false, 'userId' => null, 'message' => 'Authorization header missing'];
    }

    // Extract token (remove "Bearer " prefix)
    $token = str_replace('Bearer ', '', $authHeader);

    // Validate token and get user ID
    $userId = getUserIdFromToken($token);

    if (!$userId) {
        return ['success' => false, 'userId' => null, 'message' => 'Invalid or expired token'];
    }

    return ['success' => true, 'userId' => $userId, 'message' => 'Authorized'];
}
