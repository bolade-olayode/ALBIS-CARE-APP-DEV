# EXACT LOGIN.PHP FIXES NEEDED

## Discovered Issues

### Database Schema (Verified)
- ✅ Table name: `staff` (lowercase)
- ✅ Primary key: `staff_id` (not `sNo`)
- ✅ Join: `users.staff_id = staff.staff_id`

### Current Staff Data
```
manager@test.com → staff_id: 26, staff_role: 'admin', name: Carol Derrick
staff@test.com   → staff_id: 13, staff_role: 'carer', name: Bimbo Adesanya
driver@test.com  → staff_id: 18, staff_role: 'driver', name: Bode Thomas
```

### Problems in Current login.php

**Problem 1: Wrong Staff Lookup (Line 127-137)**
```php
// WRONG: Looking for staff.user_id instead of staff.staff_id
$staffStmt = $pdo->prepare("
    SELECT staff_id, first_name, last_name, staff_role, email, phone
    FROM staff
    WHERE user_id = :user_id  // ❌ WRONG!
    LIMIT 1
");
$staffStmt->execute(['user_id' => $user['user_id']]);  // ❌ WRONG!
```

**Problem 2: Incomplete Role Detection (Line 144-148)**
```php
// Only checks for 'manager', doesn't check for 'driver'
if (strpos($staffRole, 'manager') !== false || $staffRole === 'care manager') {
    $userData['effective_role'] = 'care_manager';
}
// ❌ Missing driver check!
```

**Problem 3: Wrong staff_role Value**
- manager@test.com has `staff_role = 'admin'` (doesn't contain "manager")
- Should be `staff_role = 'manager'` or `'Care Manager'`

---

## FIXES

### Fix 1: Update manager staff_role in Database

Run this SQL in phpMyAdmin:

```sql
-- Fix manager staff_role from 'admin' to 'manager'
UPDATE staff
SET staff_role = 'manager'
WHERE staff_id = 26;

-- Verify the update
SELECT staff_id, first_name, last_name, staff_role
FROM staff
WHERE staff_id IN (13, 18, 26);
```

**Expected Result:**
```
staff_id: 26, staff_role: 'manager', name: Carol Derrick
staff_id: 13, staff_role: 'carer', name: Bimbo Adesanya
staff_id: 18, staff_role: 'driver', name: Bode Thomas
```

---

### Fix 2: Replace Staff Lookup Section in login.php

**Open:** `public_html/api/v1/auth/login.php`

**Find this section (around lines 127-150):**

```php
    // 5a. Get STAFF details
    if ($user['user_type'] === 'staff') {
        $staffStmt = $pdo->prepare("
            SELECT
                staff_id,
                first_name,
                last_name,
                staff_role,
                email,
                phone
            FROM staff
            WHERE user_id = :user_id
            LIMIT 1
        ");

        $staffStmt->execute(['user_id' => $user['user_id']]);
        $staffData = $staffStmt->fetch(PDO::FETCH_ASSOC);

        if ($staffData) {
            $userData['staff'] = $staffData;
            $userData['name'] = trim($staffData['first_name'] . ' ' . $staffData['last_name']);

            // Check for Manager role
            $staffRole = strtolower($staffData['staff_role']);
            if (strpos($staffRole, 'manager') !== false || $staffRole === 'care manager') {
                $userData['effective_role'] = 'care_manager';
            }
        }
    }
```

**Replace with this FIXED version:**

```php
    // 5a. Get STAFF details
    if ($user['user_type'] === 'staff' && !empty($user['staff_id'])) {
        $staffStmt = $pdo->prepare("
            SELECT
                staff_id,
                first_name,
                last_name,
                staff_role,
                email,
                phone,
                mobile
            FROM staff
            WHERE staff_id = :staff_id
            LIMIT 1
        ");

        $staffStmt->execute(['staff_id' => $user['staff_id']]);
        $staffData = $staffStmt->fetch(PDO::FETCH_ASSOC);

        if ($staffData) {
            $userData['staff'] = $staffData;
            $userData['name'] = trim($staffData['first_name'] . ' ' . $staffData['last_name']);
            $userData['staff_id'] = $staffData['staff_id'];

            // Determine specific staff role based on staff_role column
            $staffRole = strtolower(trim($staffData['staff_role'] ?? ''));

            // Check for Care Manager
            if (strpos($staffRole, 'manager') !== false || $staffRole === 'manager' || $staffRole === 'care manager' || $staffRole === 'admin') {
                $userData['effective_role'] = 'care_manager';
                $userData['role'] = 'Care Manager';
            }
            // Check for Driver
            elseif (strpos($staffRole, 'driver') !== false || $staffRole === 'driver' || $staffRole === 'transport') {
                $userData['effective_role'] = 'driver';
                $userData['role'] = 'Driver';
            }
            // Default to regular staff/carer
            else {
                $userData['effective_role'] = 'staff';
                $userData['role'] = $staffData['staff_role'] ?? 'Staff';
            }
        } else {
            // Staff record not found - fallback
            error_log("WARNING: User {$user['email']} has staff_id={$user['staff_id']} but no staff record found");
            $userData['effective_role'] = 'staff';
            $userData['name'] = $user['email'];
        }
    }
```

---

## Summary of Changes

### Changed Lines:

**Line 123:** Added check for `!empty($user['staff_id'])`
```php
if ($user['user_type'] === 'staff' && !empty($user['staff_id'])) {
```

**Line 135:** Changed `WHERE user_id = :user_id` → `WHERE staff_id = :staff_id`
```php
WHERE staff_id = :staff_id
```

**Line 139:** Changed execute parameter from `user_id` → `staff_id`
```php
$staffStmt->execute(['staff_id' => $user['staff_id']]);
```

**Line 144:** Added `$userData['staff_id'] = $staffData['staff_id'];`

**Lines 147-165:** Complete role detection logic with:
- Manager detection (includes 'admin' for current data)
- Driver detection (includes 'transport')
- Fallback to 'staff'

**Lines 166-171:** Error handling for missing staff records

---

## Testing After Fix

Test each login and verify the console logs show correct `effective_role`:

```
manager@test.com → effective_role: 'care_manager' → CareManagerDashboard
staff@test.com   → effective_role: 'staff' → StaffDashboard (green)
driver@test.com  → effective_role: 'driver' → DriverDashboard (orange)
```

---

## Quick Copy-Paste Instructions

1. **Run SQL** (fix manager staff_role):
   ```sql
   UPDATE staff SET staff_role = 'manager' WHERE staff_id = 26;
   ```

2. **Edit login.php** on Hostinger:
   - Navigate to: File Manager → `public_html/api/v1/auth/login.php`
   - Find lines 123-150 (the "5a. Get STAFF details" section)
   - Replace with the FIXED version above
   - Save the file

3. **Test all logins** and check mobile app console for `effective_role` values

4. **Verify dashboards** display correctly for each role
