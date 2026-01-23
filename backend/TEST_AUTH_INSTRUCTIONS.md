# Test Authorization Header on Hostinger

## Step 1: Upload Diagnostic File

Upload the file `test_auth.php` to your Hostinger server:

**Local File:** `backend/test_auth.php`
**Upload To:** `public_html/api/test_auth.php`

## Step 2: Test from React Native App

After logging in as any user, open React DevTools Console and run this:

```javascript
// Get current token
AsyncStorage.getItem('authToken').then(token => {
  console.log('Token:', token?.substring(0, 20) + '...');

  // Call diagnostic endpoint
  fetch('https://albiscare.co.uk/api/test_auth.php', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(res => res.json())
  .then(data => {
    console.log('=== AUTH DIAGNOSTIC RESULTS ===');
    console.log(JSON.stringify(data, null, 2));
    console.log('================================');
  })
  .catch(err => console.error('Test failed:', err));
});
```

## Step 3: Analyze Results

### ✅ Good Result (Authorization Working)
```json
{
  "results": {
    "auth_header_found": true,
    "auth_header_location": "$_SERVER[HTTP_AUTHORIZATION]",
    "auth_header_preview": "Bearer eb58e63c5f67a59a935d..."
  }
}
```

### ❌ Bad Result (Authorization Stripped)
```json
{
  "results": {
    "auth_header_found": false,
    "auth_header_location": "NOT FOUND",
    "all_headers_received": {
      "Host": "albiscare.co.uk",
      "User-Agent": "...",
      // ❌ No "Authorization" header here!
    }
  }
}
```

---

## If Authorization is NOT Found

This means Apache is stripping the header. The fix is to update `.htaccess`:

### Check .htaccess File

**Location:** `public_html/api/.htaccess`

**Current Content Should Be:**
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On

    # Fix for Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
</IfModule>

Options -Indexes
AddDefaultCharset UTF-8
```

### If .htaccess Doesn't Exist or is Wrong

1. Go to Hostinger File Manager
2. Navigate to `public_html/api/`
3. Create new file: `.htaccess`
4. Paste the content above
5. Save

---

## If Authorization is Found but Staff/Client Lists Still Fail

This means the header IS working, but there's a different issue:

### Possible Cause 1: Token Not in Database

Check if your token exists in `user_sessions` table:

```sql
SELECT user_id, token, expires_at
FROM user_sessions
WHERE token = 'YOUR_TOKEN_HERE'
AND expires_at > NOW();
```

If no result, the token expired or wasn't saved during login.

**Fix:** Check login.php lines 265-270 to ensure it's saving sessions:
```php
$sessionStmt = $pdo->prepare("
    INSERT INTO user_sessions (user_id, token, expires_at)
    VALUES (:user_id, :token, DATE_ADD(NOW(), INTERVAL 7 DAY))
");
$sessionStmt->execute([
    'user_id' => $user['user_id'],
    'token' => $token
]);
```

### Possible Cause 2: getUserIdFromToken() Not Working

The `getUserIdFromToken()` function might be failing silently.

**Fix:** Add debugging to permissions.php `getUserIdFromToken()` function:

```php
function getUserIdFromToken($token) {
    $token = str_replace('Bearer ', '', $token);
    global $pdo;

    error_log("getUserIdFromToken called with token: " . substr($token, 0, 20) . "...");

    try {
        $stmt = $pdo->prepare("SELECT user_id FROM user_sessions WHERE token = :token AND expires_at > NOW() LIMIT 1");
        $stmt->execute(['token' => $token]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($result) {
            error_log("getUserIdFromToken SUCCESS: user_id = " . $result['user_id']);
            return $result['user_id'];
        } else {
            error_log("getUserIdFromToken FAILED: No matching session found");
            return null;
        }
    } catch (Exception $e) {
        error_log("getUserIdFromToken ERROR: " . $e->getMessage());
        return null;
    }
}
```

Then check PHP error logs on Hostinger.

---

## Alternative: Test Directly with curl

If you have curl, test from command line:

```bash
# Replace YOUR_TOKEN with actual token from app
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://albiscare.co.uk/api/test_auth.php
```

Should return JSON showing whether Authorization header was received.

---

## Summary

1. Upload `test_auth.php` to `public_html/api/`
2. Run the JavaScript test from React Native console
3. Check if `auth_header_found` is `true` or `false`
4. If `false`: Fix `.htaccess`
5. If `true` but endpoints still fail: Check token in database

This will tell us EXACTLY where the problem is!
