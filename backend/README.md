# ALBIS CARE - Permission System Backend Files

This directory contains all the backend PHP files needed to implement the permission and security system for the Albis Care application.

## 📋 Overview

The permission system implements:
- **Hierarchical Role-Based Access Control (RBAC)**
  - Super Admin > Admin > Care Manager > Staff > Relative
- **Granular Permissions** for resources (clients, staff, visits, logs, transport, analytics)
- **Audit Logging** to track all important actions
- **Secure Admin Creation** restricted to super admins only

---

## 🗂️ File Structure

```
backend/
├── database/
│   └── migration_001_permissions_system.sql    # Database migration script
├── v1/
│   ├── includes/
│   │   ├── db.php                              # Database connection (CONFIGURE THIS!)
│   │   └── permissions.php                      # Permission helper functions
│   ├── permissions/
│   │   └── check.php                           # Permission check endpoint
│   ├── admin/
│   │   └── create.php                          # Admin creation endpoint
│   ├── audit/
│   │   ├── log.php                             # Create audit log endpoint
│   │   └── get.php                             # Retrieve audit logs endpoint
│   ├── auth/
│   │   └── login_UPDATED.php                   # Updated login with permissions
│   ├── clients/
│   │   └── index_UPDATED.php                   # Updated clients list with filters
│   └── logs/
│       └── create_UPDATED.php                  # Updated care log creation with checks
└── README.md                                    # This file
```

---

## 🚀 Deployment Steps

### Step 1: Configure Database Connection

1. Open `v1/includes/db.php`
2. Update the database credentials:
   ```php
   define('DB_HOST', 'localhost');          // Your database host
   define('DB_NAME', 'your_database_name'); // Your database name
   define('DB_USER', 'your_db_username');   // Your database username
   define('DB_PASS', 'your_db_password');   // Your database password
   ```

### Step 2: Run Database Migration

1. Connect to your MySQL database (via phpMyAdmin, MySQL Workbench, or command line)
2. Execute the SQL script: `database/migration_001_permissions_system.sql`
3. This will:
   - Add admin hierarchy fields to `users` table
   - Create `permissions` table
   - Create `audit_log` table
   - Create necessary indexes

**Verification:**
```sql
-- Check if new columns exist
SELECT COLUMN_NAME
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'users'
AND COLUMN_NAME IN ('is_super_admin', 'is_admin', 'created_by');

-- Check if new tables exist
SHOW TABLES LIKE 'permissions';
SHOW TABLES LIKE 'audit_log';
```

### Step 3: Create Your First Super Admin

**Option A: Using SQL (Recommended for first super admin)**

```sql
-- Generate a hashed password using PHP
-- Run this PHP snippet to get the hash:
-- echo password_hash('YourSecurePassword123', PASSWORD_DEFAULT);

INSERT INTO users (email, password, userType, is_super_admin, is_admin, created_at)
VALUES (
  'superadmin@albiscare.co.uk',
  '$2y$10$YOUR_HASHED_PASSWORD_HERE',  -- Replace with actual hash
  'admin',
  1,  -- is_super_admin
  1,  -- is_admin
  NOW()
);
```

**Option B: Create hash using this PHP script:**

Save this as `generate_password_hash.php`:
```php
<?php
$password = 'YourSecurePassword123';  // Change this!
$hash = password_hash($password, PASSWORD_DEFAULT);
echo "Password Hash: " . $hash;
?>
```

Run it: `php generate_password_hash.php`

### Step 4: Upload Backend Files to Server

Upload all files to your server at `https://albiscare.co.uk/api/`:

```
https://albiscare.co.uk/api/
├── v1/
│   ├── includes/
│   │   ├── db.php
│   │   └── permissions.php
│   ├── permissions/
│   │   └── check.php
│   ├── admin/
│   │   └── create.php
│   ├── audit/
│   │   ├── log.php
│   │   └── get.php
│   └── [other existing folders]
```

### Step 5: Update Existing API Files

The following existing files need to be updated. Compare the `_UPDATED.php` versions with your current files and merge the permission checks:

1. **`v1/auth/login.php`**
   - Compare with: `auth/login_UPDATED.php`
   - Add permission data to login response
   - Add audit logging for logins

2. **`v1/clients/index.php`** (or `v1/clients/`)
   - Compare with: `clients/index_UPDATED.php`
   - Add filtering based on user role
   - Relatives see only linked client
   - Staff see only assigned clients

3. **`v1/logs/create.php`**
   - Compare with: `logs/create_UPDATED.php`
   - Add check that only assigned staff can create logs
   - Prevent admins/care managers from creating logs

4. **Other files to update** (follow similar patterns):
   - `v1/visits/index.php` - Filter visits by role
   - `v1/transport/index.php` - Already filters by driver, verify it works
   - `v1/logs/index.php` - Filter logs by role
   - `v1/clients/create.php` - Check create permission
   - `v1/clients/update.php` - Check edit permission
   - `v1/clients/delete.php` - Check delete permission
   - `v1/staff/create.php` - Check create permission
   - `v1/staff/update.php` - Check edit permission
   - `v1/staff/delete.php` - Check delete permission

**Permission Check Pattern:**
```php
// At the top of each endpoint
require_once __DIR__ . '/../includes/permissions.php';

$auth = verifyAuth();
if (!$auth['success']) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => $auth['message']]);
    exit;
}

$userId = $auth['userId'];

// Check specific permission
if (!checkPermission($userId, 'clients', 'create')) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Access denied']);
    exit;
}
```

### Step 6: Set File Permissions

Ensure PHP can read the files:
```bash
chmod 644 v1/**/*.php
chmod 755 v1/includes/
chmod 755 v1/permissions/
chmod 755 v1/admin/
chmod 755 v1/audit/
```

---

## 🧪 Testing

### Test 1: Check Database Migration
```sql
-- Should return 3 rows
SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'users'
AND COLUMN_NAME IN ('is_super_admin', 'is_admin', 'created_by');

-- Should return rows
SELECT COUNT(*) FROM permissions;
SELECT COUNT(*) FROM audit_log;
```

### Test 2: Test Permission Check Endpoint
```bash
# Login as different users and test:
curl -X GET "https://albiscare.co.uk/api/v1/permissions/check.php?resource=clients&action=create" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Should return:
# { "success": true, "data": { "allowed": true/false } }
```

### Test 3: Test Login with Permissions
```bash
curl -X POST "https://albiscare.co.uk/api/v1/auth/login.php" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Response should include:
# { "success": true, "data": { "token": "...", "user": { "permissions": {...} } } }
```

### Test 4: Test Admin Creation
```bash
# Login as super admin first, then:
curl -X POST "https://albiscare.co.uk/api/v1/admin/create.php" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SUPER_ADMIN_TOKEN" \
  -d '{
    "email": "newadmin@albiscare.co.uk",
    "password": "SecurePassword123",
    "first_name": "John",
    "last_name": "Doe",
    "is_super_admin": false
  }'
```

### Test 5: Test Audit Logging
```bash
# View audit logs (as admin):
curl -X GET "https://albiscare.co.uk/api/v1/audit/get.php?limit=10" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## 🔐 Permission Matrix

| Role          | Clients | Staff | Visits | Logs | Transport | Analytics | Admins |
|--------------|---------|-------|--------|------|-----------|-----------|--------|
| **Super Admin** | ✅ All  | ✅ All | ✅ All | ✅ All | ✅ All | ✅ View | ✅ Create |
| **Admin**       | ✅ All  | ✅ All | ✅ All | 👁️ View<br>🗑️ Delete | ✅ All | ✅ View | ❌ None |
| **Care Manager** | 👁️ View<br>✏️ Edit | 👁️ View | ✅ All | 👁️ View<br>🗑️ Delete | ✅ All | ✅ View | ❌ None |
| **Staff**       | 👁️ View | ❌ None | 👁️ Assigned | 👁️ Own<br>➕ Assigned | ❌ None | ❌ None | ❌ None |
| **Relative**    | 👁️ Linked | ❌ None | 👁️ Linked | 👁️ Linked | ❌ None | 👁️ Linked | ❌ None |

**Legend:**
- ✅ = Full CRUD access
- 👁️ = View only
- ✏️ = View + Edit
- 🗑️ = Delete
- ➕ = Create
- ❌ = No access
- **Assigned** = Only for visits assigned to them
- **Own** = Only logs they created
- **Linked** = Only for their linked client

---

## 🔧 Troubleshooting

### Issue: "Database connection failed"
- Check `v1/includes/db.php` credentials
- Verify MySQL server is running
- Check if database user has proper permissions

### Issue: "Call to undefined function checkPermission()"
- Ensure `require_once __DIR__ . '/../includes/permissions.php';` is at the top of the file
- Check file paths are correct

### Issue: "Authorization header missing"
- Frontend not sending Bearer token
- Check API client configuration in `src/services/api/apiClient.ts`

### Issue: "Access denied" for valid users
- Check user role in database: `SELECT userType, is_admin FROM users WHERE email = 'user@example.com'`
- Check staff_role in Staff table: `SELECT staff_role FROM Staff WHERE user_id = X`
- Verify permission matrix logic in `v1/includes/permissions.php`

### Issue: Relative can't see client
- Check Relative table: `SELECT cNo FROM Relative WHERE user_id = X`
- Ensure `cNo` (client_id) is set correctly

---

## 📝 Important Notes

1. **Security:**
   - Never expose database credentials in version control
   - Always use prepared statements (PDO) for SQL queries
   - Hash passwords using `password_hash()` with `PASSWORD_DEFAULT`
   - Use HTTPS in production

2. **Token Management:**
   - The `getUserIdFromToken()` function in `permissions.php` is a placeholder
   - Update it based on your JWT or session token implementation
   - Consider using a library like `firebase/php-jwt` for JWT tokens

3. **Audit Logging:**
   - Audit logs grow over time - consider archiving old logs
   - Set up a cron job to clean logs older than X days if needed

4. **Backup:**
   - Always backup your database before running migrations
   - Test migrations on a development/staging environment first

---

## 📞 Support

If you encounter issues:
1. Check PHP error logs: `/var/log/apache2/error.log` or `/var/log/php/error.log`
2. Enable error display temporarily (development only):
   ```php
   ini_set('display_errors', 1);
   error_reporting(E_ALL);
   ```
3. Check browser console for frontend errors
4. Verify API responses using Postman or curl

---

## ✅ Deployment Checklist

- [ ] Configure `v1/includes/db.php` with correct database credentials
- [ ] Run database migration SQL script
- [ ] Verify new tables and columns exist
- [ ] Create first super admin account via SQL
- [ ] Upload all backend files to server
- [ ] Update existing API files with permission checks
- [ ] Set correct file permissions (chmod)
- [ ] Test permission check endpoint
- [ ] Test login endpoint returns permissions
- [ ] Test admin creation
- [ ] Test audit logging
- [ ] Update frontend to use new permission data
- [ ] Test each user role (super admin, admin, care manager, staff, relative)
- [ ] Verify relatives can only see their linked client
- [ ] Verify staff can only create logs for assigned visits
- [ ] Test care manager cannot create clients/staff
- [ ] Backup production database before deploying

---

**Version:** 1.0
**Date:** 2026-01-22
**Author:** Claude Code Assistant
