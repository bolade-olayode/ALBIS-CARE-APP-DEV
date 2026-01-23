# Dashboard Routing Test Guide

## New Test Accounts Created

All accounts use password: **123456**

| Email | Role | Expected Dashboard | Header Color |
|-------|------|-------------------|--------------|
| super_admin@albiscare.com | Super Admin | AdminDashboard | Blue (#2563eb) |
| admin@albiscare.com | Admin | AdminDashboard | Blue (#2563eb) |
| care.manager@albiscare.com | Care Manager | CareManagerDashboard | Default |
| care.assistant@albiscare.com | Care Assistant | StaffDashboard | Green (#10b981) |
| driver@albiscare.com | Driver | DriverDashboard | Orange (#f59e0b) |
| relative@albiscare.com | Relative | RelativeDashboard | Default |

## Setup Instructions

### 1. Run SQL to Create Test Users

In phpMyAdmin, copy and paste the entire contents of [CREATE_TEST_USERS.sql](CREATE_TEST_USERS.sql) and execute.

**Important:** Before running, you need to:
1. Find a valid client ID from your Clients table:
   ```sql
   SELECT cNo, cFName, cLName FROM Clients LIMIT 5;
   ```
2. Replace `cNo = 12` in the Relative INSERT statement (line 184) with an actual client ID from your database.

### 2. Verify Creation

After running the SQL, the verification queries at the bottom will show:

**Users Table:**
```
super_admin@albiscare.com   | admin    | NULL | is_admin=1 | is_super_admin=1
admin@albiscare.com         | admin    | NULL | is_admin=1 | is_super_admin=0
care.manager@albiscare.com  | staff    | 100  | is_admin=0 | is_super_admin=0
care.assistant@albiscare.com| staff    | 101  | is_admin=0 | is_super_admin=0
driver@albiscare.com        | staff    | 102  | is_admin=0 | is_super_admin=0
relative@albiscare.com      | relative | NULL | is_admin=0 | is_super_admin=0
```

**Staff Join Query:**
```
care.manager@albiscare.com   | staff_id: 100 | staff_role: 'Care Manager'
care.assistant@albiscare.com | staff_id: 101 | staff_role: 'Care Assistant'
driver@albiscare.com         | staff_id: 102 | staff_role: 'Driver'
```

---

## Testing Procedure

### Test 1: Super Admin
1. Login with: `super_admin@albiscare.com` / `123456`
2. **Check Console Logs:**
   ```
   effective_role: "super_admin"
   Routing to: AdminDashboard
   ```
3. **Verify Dashboard:**
   - ✅ Blue header (#2563eb)
   - ✅ Shows "Welcome back, Super Admin"
   - ✅ Can see "Manage Staff" and "Manage Clients"
   - ✅ Clicking "Manage Staff" loads staff list (no "Authorization header missing")
   - ✅ Stats show correct counts

---

### Test 2: Admin
1. Login with: `admin@albiscare.com` / `123456`
2. **Check Console Logs:**
   ```
   effective_role: "admin"
   Routing to: AdminDashboard
   ```
3. **Verify Dashboard:**
   - ✅ Blue header (#2563eb)
   - ✅ Shows "Welcome back, Admin" (or "Administrator" if no admin_profiles entry)
   - ✅ Same access as Super Admin
   - ✅ No "Authorization header missing" errors

---

### Test 3: Care Manager
1. Login with: `care.manager@albiscare.com` / `123456`
2. **Check Console Logs:**
   ```
   effective_role: "care_manager"
   staff_role: "Care Manager"
   Routing to: CareManagerDashboard
   ```
3. **Verify Dashboard:**
   - ✅ Shows "Welcome back, Sarah Manager"
   - ✅ Can manage staff, clients, visits
   - ✅ Stats load correctly
   - ✅ No "Authorization header missing" errors

---

### Test 4: Care Assistant (Regular Staff)
1. Login with: `care.assistant@albiscare.com` / `123456`
2. **Check Console Logs:**
   ```
   effective_role: "staff"
   staff_role: "Care Assistant"
   Routing to: StaffDashboard (default)
   ```
3. **Verify Dashboard:**
   - ✅ Green header (#10b981)
   - ✅ Shows "Hello, John Assistant"
   - ✅ Displays today's visits assigned to this staff member
   - ✅ Can execute visits

---

### Test 5: Driver
1. Login with: `driver@albiscare.com` / `123456`
2. **Check Console Logs:**
   ```
   effective_role: "driver"
   staff_role: "Driver"
   Routing to: DriverDashboard
   ```
3. **Verify Dashboard:**
   - ✅ Orange header (#f59e0b)
   - ✅ Shows "Hello, Mike Driver"
   - ✅ Displays today's transport jobs
   - ✅ Shows upcoming transport schedule

---

### Test 6: Relative (Family Member)
1. Login with: `relative@albiscare.com` / `123456`
2. **Check Console Logs:**
   ```
   effective_role: "relative"
   client_id: 12 (or your chosen client ID)
   ```
3. **Verify Dashboard:**
   - ✅ Shows "Welcome, Emma Family"
   - ✅ Shows linked care recipient info
   - ✅ Can view Recent Visits (read-only)
   - ✅ Can view Care Logs (read-only)
   - ✅ NO "Add Family Member" button visible
   - ✅ All buttons hidden except view actions

---

## Expected Console Log Flow

When a staff user logs in, you should see:

```
=== HANDLE LOGIN DEBUG ===
Token received: eb58e63c5f67a59a935d...
User data received: {
  "id": "...",
  "email": "care.manager@albiscare.com",
  "userType": "staff",
  "effective_role": "care_manager",  ← CRITICAL
  "staff_id": 100,
  "staff": {
    "staff_id": 100,
    "first_name": "Sarah",
    "last_name": "Manager",
    "staff_role": "Care Manager"  ← CRITICAL
  },
  "name": "Sarah Manager"
}
==========================

=== DASHBOARD ROUTING DEBUG ===
Full userData: {...}
effective_role: care_manager  ← CRITICAL
Routing to: CareManagerDashboard  ← SUCCESS!
==============================
```

---

## Troubleshooting

### Issue: Still showing wrong dashboard

**Check Console:**
```
LOG  effective_role: staff  ← WRONG (should be 'care_manager' or 'driver')
```

**Solution:**
1. Verify staff_role in database:
   ```sql
   SELECT staff_id, staff_role FROM staff WHERE staff_id IN (100, 101, 102);
   ```
2. Check login.php line 151-167 has the role detection logic
3. Clear app cache and restart

---

### Issue: "Authorization header missing"

**Check Console:**
```
ERROR  Authorization header missing
```

**Solution:**
1. Verify .htaccess exists in `public_html/api/`
2. Verify permissions.php has updated `verifyAuth()` function
3. Check apiClient.js has interceptor adding Authorization header

---

### Issue: Stats show 0 for everything

**Check Console:**
```
LOG  Client data response: { success: false, message: "Access denied" }
```

**Solution:**
1. Verify permissions.php `checkPermission()` allows list access (resourceId = null)
2. Check admin/manager has 'all' or 'view' permission in role_permissions table

---

## Success Criteria

All 6 test accounts should:
- ✅ Login successfully
- ✅ Route to correct dashboard
- ✅ Display correct user name
- ✅ Load stats without errors
- ✅ Access staff/client lists (admin/manager only)
- ✅ Show appropriate permissions (create/edit buttons visible or hidden)

---

## Next Steps After Testing

Once all 6 accounts work correctly:

1. **Disable/Delete old test accounts** (manager@test.com, staff@test.com, driver@test.com)
   ```sql
   UPDATE users SET status = 'inactive'
   WHERE email IN ('manager@test.com', 'staff@test.com', 'driver@test.com');
   ```

2. **Document the working configuration** for production deployment

3. **Create admin_profiles entries** for super_admin and admin accounts if you want custom names:
   ```sql
   INSERT INTO admin_profiles (user_id, first_name, last_name)
   SELECT user_id, 'Super', 'Admin'
   FROM users WHERE email = 'super_admin@albiscare.com';
   ```

4. **Train staff** on which email/dashboard to use

5. **Update production** with the same fixes
