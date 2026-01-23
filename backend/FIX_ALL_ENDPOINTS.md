# Fix All Backend Endpoints - Authorization Header Issue

## Root Cause

The **login.php** works because it was updated with the correct Authorization header reading logic. However, **ALL OTHER ENDPOINTS** still have the OLD code and cannot read the Authorization header.

## Files That Need Fixing

All these files need the updated `verifyAuth()` function:

### API Endpoints (All in `public_html/api/v1/`)

1. **staff/index.php** (List all staff)
2. **staff/get.php** (Get single staff)
3. **staff/create.php** (Create staff)
4. **staff/update.php** (Update staff)
5. **staff/delete.php** (Delete staff)

6. **clients/index.php** (List all clients)
7. **clients/get.php** (Get single client)
8. **clients/create.php** (Create client)
9. **clients/update.php** (Update client)
10. **clients/delete.php** (Delete client)

11. **visits/index.php** (List visits)
12. **visits/get.php** (Get single visit)
13. **visits/create.php** (Create visit)
14. **visits/update.php** (Update visit)
15. **visits/delete.php** (Delete visit)

16. **logs/index.php** (List care logs)
17. **logs/get.php** (Get single log)
18. **logs/create.php** (Create care log)
19. **logs/update.php** (Update care log)
20. **logs/delete.php** (Delete care log)

21. **transport/index.php** (List transport jobs)
22. **transport/get.php** (Get single transport)
23. **transport/create.php** (Create transport)
24. **transport/update.php** (Update transport)
25. **transport/delete.php** (Delete transport)

26. **analytics/dashboard.php** (Analytics stats)

---

## The Fix: Update verifyAuth() in permissions.php

**File:** `public_html/api/v1/includes/permissions.php`

### Find the `verifyAuth()` function (around line 304)

Replace it with this FIXED version:

```php
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

    if (!$authHeader) {
        return ['success' => false, 'userId' => null, 'message' => 'Authorization header missing'];
    }

    // Extract token
    $token = str_replace('Bearer ', '', $authHeader);

    // Validate token (get user_id from token)
    $userId = getUserIdFromToken($token);

    if (!$userId) {
        return ['success' => false, 'userId' => null, 'message' => 'Invalid or expired token'];
    }

    return ['success' => true, 'userId' => $userId, 'message' => 'Authorized'];
}
```

### Also find `getUserIdFromToken()` function

If it doesn't exist or is using old logic, replace it with:

```php
function getUserIdFromToken($token) {
    global $pdo;

    try {
        // Look up token in user_sessions table
        $stmt = $pdo->prepare("
            SELECT user_id
            FROM user_sessions
            WHERE token = :token
            AND expires_at > NOW()
            LIMIT 1
        ");

        $stmt->execute(['token' => $token]);
        $session = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($session) {
            return $session['user_id'];
        }

        return null;
    } catch (PDOException $e) {
        error_log("getUserIdFromToken error: " . $e->getMessage());
        return null;
    }
}
```

---

## Testing After Fix

Once permissions.php is updated, test each endpoint:

### Test 1: Staff List
Login as super_admin@albiscare.com, click "Manage Staff"

**Console Should Show:**
```
=== API CLIENT REQUEST ===
URL: /v1/staff/index.php
Token exists: true
Authorization header set: Bearer eb58e63c5f67a59a935dffb...
==========================

=== AdminDashboard: Loading Stats ===
Staff data response: { success: true, data: { staff: [...], total: 20 } }
```

**Dashboard Should Show:**
- Total staff count (not 0)
- Staff list (not "No staff found")

### Test 2: Client List
Click "Manage Clients"

**Should Show:**
- Total client count (not 0)
- Client list (not "No clients found")

### Test 3: Visits
Click "Schedule Visits"

**Should Show:**
- Visit list (not "Authorization header missing")

### Test 4: Care Logs
Click "Care Logs"

**Should Show:**
- Care log list (not "Authorization header missing")

### Test 5: Analytics
Click "View Reports"

**Should Show:**
- Analytics dashboard (not "Failed to load analytics")

---

## Alternative Quick Fix (If editing permissions.php is difficult)

If you can't easily edit permissions.php, you can add this code to the TOP of each endpoint file:

```php
<?php
// Add this at the very top of staff/index.php, clients/index.php, etc.

// Fix Authorization header reading
$authHeader = null;
if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
} elseif (function_exists('getallheaders')) {
    $headers = getallheaders();
    if (isset($headers['Authorization'])) {
        $authHeader = $headers['Authorization'];
    }
}

// Override the global so verifyAuth() can use it
if ($authHeader) {
    $_SERVER['HTTP_AUTHORIZATION'] = $authHeader;
}

// Now include permissions.php
require_once __DIR__ . '/../includes/permissions.php';

// Rest of your endpoint code...
?>
```

But updating permissions.php once is much better than editing 26+ files.

---

## Summary

**Problem:** Only login.php was fixed to read Authorization header correctly

**Solution:** Update `verifyAuth()` function in permissions.php to try multiple methods

**Result:** All 26+ API endpoints will automatically work because they all use the same permissions.php file

**Priority:** This is the #1 blocker - fix this first before addressing other issues
