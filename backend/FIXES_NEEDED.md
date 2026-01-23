# Backend Fixes Required

## Issue: Staff Role Dashboard Routing

**Problem:**
- manager@test.com, staff@test.com, and driver@test.com all show Staff Dashboard
- Backend `login_UPDATED.php` has incorrect schema column names
- Backend doesn't properly determine `effective_role` based on staff_role

## Database Schema Verification

Run this SQL to verify your schema matches:

```sql
-- Check users table structure
DESC users;

-- Expected columns:
-- user_id (VARCHAR/UUID, PRIMARY KEY)
-- email (VARCHAR)
-- password_hash (VARCHAR) -- NOT "password"
-- user_type (VARCHAR) -- NOT "userType"
-- staff_id (INT, FOREIGN KEY to Staff.sNo)
-- is_admin (TINYINT)
-- is_super_admin (TINYINT)
-- status (VARCHAR)
-- created_at (DATETIME)

-- Check Staff table structure
DESC Staff;

-- Expected columns:
-- sNo (INT, PRIMARY KEY) -- NOT "staff_id"
-- user_id (VARCHAR, FOREIGN KEY to users.user_id)
-- sFName, sLName (first/last name)
-- staff_role (VARCHAR) -- e.g., 'Care Manager', 'Driver', 'Care Assistant'
-- sEmail, sTel, sMobile
-- ... (other staff fields)

-- Verify test users are correctly linked to Staff
SELECT
    u.user_id,
    u.email,
    u.user_type,
    u.staff_id,
    s.sNo,
    s.sFName,
    s.sLName,
    s.staff_role
FROM users u
LEFT JOIN Staff s ON u.staff_id = s.sNo
WHERE u.email IN ('manager@test.com', 'staff@test.com', 'driver@test.com');

-- Expected results:
-- manager@test.com: user_type='staff', staff_id=26, staff_role='Care Manager' (or contains 'manager')
-- staff@test.com: user_type='staff', staff_id=13, staff_role='Care Assistant' or 'Carer'
-- driver@test.com: user_type='staff', staff_id=18, staff_role='Driver' or 'Transport'
```

## SQL Fix: Ensure test users link to correct staff records

```sql
-- Update test user staff_id links (adjust IDs as needed)
-- First, verify the staff IDs exist and have correct roles:

SELECT sNo, sFName, sLName, staff_role FROM Staff WHERE sNo IN (13, 18, 26);

-- If the above shows correct roles, ensure users are linked:

-- Manager: should link to a staff record with 'Manager' in staff_role
UPDATE users
SET staff_id = 26  -- Replace with actual sNo of a Care Manager
WHERE email = 'manager@test.com';

-- Staff: should link to a staff record with 'Care Assistant' or 'Carer' role
UPDATE users
SET staff_id = 13  -- Replace with actual sNo of a Care Assistant
WHERE email = 'staff@test.com';

-- Driver: should link to a staff record with 'Driver' in staff_role
UPDATE users
SET staff_id = 18  -- Replace with actual sNo of a Driver
WHERE email = 'driver@test.com';

-- Verify the updates
SELECT
    u.email,
    u.user_type,
    u.staff_id,
    s.staff_role
FROM users u
LEFT JOIN Staff s ON u.staff_id = s.sNo
WHERE u.email IN ('manager@test.com', 'staff@test.com', 'driver@test.com');
```

## Fixed Backend Login Code

The file `backend/FIXED_login.php` contains the corrected login logic with:
- ✅ Correct schema column names (user_id, password_hash, user_type, staff_id)
- ✅ Proper staff_id to Staff.sNo lookup via users.staff_id
- ✅ Detection of Care Manager, Driver, and regular Staff roles
- ✅ Correct effective_role assignment based on staff_role

## Deployment Instructions

1. **Verify database schema** using SQL above
2. **Fix staff_id links** if needed using UPDATE SQL above
3. **Upload fixed login code** from `backend/FIXED_login.php` to production:
   - Copy to: `public_html/api/v1/auth/login.php`
4. **Test all role logins** to verify dashboard routing works

## Expected Behavior After Fix

| Email | user_type | staff_id → staff_role | effective_role | Dashboard |
|-------|-----------|---------------------|----------------|-----------|
| super_admin@test.com | admin | NULL | super_admin | AdminDashboard (blue) |
| admin@test.com | admin | NULL | admin | AdminDashboard (blue) |
| manager@test.com | staff | 26 → Care Manager | care_manager | CareManagerDashboard |
| staff@test.com | staff | 13 → Care Assistant | staff | StaffDashboard (green) |
| driver@test.com | staff | 18 → Driver | driver | DriverDashboard (orange) |
