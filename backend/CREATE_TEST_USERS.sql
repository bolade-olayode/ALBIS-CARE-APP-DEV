-- ========================================
-- ALBIS CARE - Create Clean Test Users
-- ========================================
-- This script creates fresh test users with clearly defined roles
-- for testing the dashboard routing system.
--
-- Test Users to Create:
-- 1. super_admin@albiscare.com   → Super Admin (blue header)
-- 2. admin@albiscare.com         → Admin (blue header)
-- 3. care.manager@albiscare.com  → Care Manager Dashboard
-- 4. care.assistant@albiscare.com → Staff Dashboard (green header)
-- 5. driver@albiscare.com        → Driver Dashboard (orange header)
-- 6. relative@albiscare.com      → Relative Dashboard (read-only)
--
-- Password for ALL: 123456
-- Hash: $2a$12$7sRw4ySBnttyzMVwTro1.OtiYmgI5ncTmHb2ZTLRG1pYvfJ9PTSwW
-- ========================================

-- Step 1: Create Staff Records with CLEAR roles
-- ========================================

-- Care Manager
INSERT INTO staff (staff_id, user_id, first_name, last_name, staff_role, email, phone, status, created_at)
VALUES (
    100,  -- Using high ID to avoid conflicts
    NULL,  -- Will be updated after user creation
    'Sarah',
    'Manager',
    'Care Manager',  -- ✅ Clear role name
    'care.manager@albiscare.com',
    '07700123001',
    'active',
    NOW()
) ON DUPLICATE KEY UPDATE staff_role = 'Care Manager', email = 'care.manager@albiscare.com';

-- Care Assistant (Regular Staff)
INSERT INTO staff (staff_id, user_id, first_name, last_name, staff_role, email, phone, status, created_at)
VALUES (
    101,
    NULL,
    'John',
    'Assistant',
    'Care Assistant',  -- ✅ Clear role name
    'care.assistant@albiscare.com',
    '07700123002',
    'active',
    NOW()
) ON DUPLICATE KEY UPDATE staff_role = 'Care Assistant', email = 'care.assistant@albiscare.com';

-- Driver
INSERT INTO staff (staff_id, user_id, first_name, last_name, staff_role, email, phone, status, created_at)
VALUES (
    102,
    NULL,
    'Mike',
    'Driver',
    'Driver',  -- ✅ Clear role name
    'driver@albiscare.com',
    '07700123003',
    'active',
    NOW()
) ON DUPLICATE KEY UPDATE staff_role = 'Driver', email = 'driver@albiscare.com';

-- ========================================
-- Step 2: Create User Accounts
-- ========================================

-- Super Admin (No staff_id, is_super_admin=1, is_admin=1)
INSERT INTO users (user_id, email, password_hash, user_type, staff_id, is_admin, is_super_admin, status, created_at)
VALUES (
    UUID(),
    'super_admin@albiscare.com',
    '$2a$12$7sRw4ySBnttyzMVwTro1.OtiYmgI5ncTmHb2ZTLRG1pYvfJ9PTSwW',
    'admin',
    NULL,
    1,
    1,
    'active',
    NOW()
) ON DUPLICATE KEY UPDATE
    password_hash = '$2a$12$7sRw4ySBnttyzMVwTro1.OtiYmgI5ncTmHb2ZTLRG1pYvfJ9PTSwW',
    user_type = 'admin',
    is_admin = 1,
    is_super_admin = 1;

-- Admin (No staff_id, is_admin=1, is_super_admin=0)
INSERT INTO users (user_id, email, password_hash, user_type, staff_id, is_admin, is_super_admin, status, created_at)
VALUES (
    UUID(),
    'admin@albiscare.com',
    '$2a$12$7sRw4ySBnttyzMVwTro1.OtiYmgI5ncTmHb2ZTLRG1pYvfJ9PTSwW',
    'admin',
    NULL,
    1,
    0,
    'active',
    NOW()
) ON DUPLICATE KEY UPDATE
    password_hash = '$2a$12$7sRw4ySBnttyzMVwTro1.OtiYmgI5ncTmHb2ZTLRG1pYvfJ9PTSwW',
    user_type = 'admin',
    is_admin = 1,
    is_super_admin = 0;

-- Care Manager (user_type='staff', staff_id=100)
INSERT INTO users (user_id, email, password_hash, user_type, staff_id, is_admin, is_super_admin, status, created_at)
VALUES (
    UUID(),
    'care.manager@albiscare.com',
    '$2a$12$7sRw4ySBnttyzMVwTro1.OtiYmgI5ncTmHb2ZTLRG1pYvfJ9PTSwW',
    'staff',
    100,  -- Links to Care Manager staff record
    0,
    0,
    'active',
    NOW()
) ON DUPLICATE KEY UPDATE
    password_hash = '$2a$12$7sRw4ySBnttyzMVwTro1.OtiYmgI5ncTmHb2ZTLRG1pYvfJ9PTSwW',
    user_type = 'staff',
    staff_id = 100,
    is_admin = 0,
    is_super_admin = 0;

-- Care Assistant (user_type='staff', staff_id=101)
INSERT INTO users (user_id, email, password_hash, user_type, staff_id, is_admin, is_super_admin, status, created_at)
VALUES (
    UUID(),
    'care.assistant@albiscare.com',
    '$2a$12$7sRw4ySBnttyzMVwTro1.OtiYmgI5ncTmHb2ZTLRG1pYvfJ9PTSwW',
    'staff',
    101,  -- Links to Care Assistant staff record
    0,
    0,
    'active',
    NOW()
) ON DUPLICATE KEY UPDATE
    password_hash = '$2a$12$7sRw4ySBnttyzMVwTro1.OtiYmgI5ncTmHb2ZTLRG1pYvfJ9PTSwW',
    user_type = 'staff',
    staff_id = 101,
    is_admin = 0,
    is_super_admin = 0;

-- Driver (user_type='staff', staff_id=102)
INSERT INTO users (user_id, email, password_hash, user_type, staff_id, is_admin, is_super_admin, status, created_at)
VALUES (
    UUID(),
    'driver@albiscare.com',
    '$2a$12$7sRw4ySBnttyzMVwTro1.OtiYmgI5ncTmHb2ZTLRG1pYvfJ9PTSwW',
    'staff',
    102,  -- Links to Driver staff record
    0,
    0,
    'active',
    NOW()
) ON DUPLICATE KEY UPDATE
    password_hash = '$2a$12$7sRw4ySBnttyzMVwTro1.OtiYmgI5ncTmHb2ZTLRG1pYvfJ9PTSwW',
    user_type = 'staff',
    staff_id = 102,
    is_admin = 0,
    is_super_admin = 0;

-- Relative (Use existing relative record linked to client cNo=12)
-- Note: You need a valid client_id (cNo) from your Clients table
-- Replace 12 with an actual client ID from your database
INSERT INTO users (user_id, email, password_hash, user_type, staff_id, is_admin, is_super_admin, status, created_at)
VALUES (
    UUID(),
    'relative@albiscare.com',
    '$2a$12$7sRw4ySBnttyzMVwTro1.OtiYmgI5ncTmHb2ZTLRG1pYvfJ9PTSwW',
    'relative',
    NULL,  -- Relatives don't have staff_id
    0,
    0,
    'active',
    NOW()
) ON DUPLICATE KEY UPDATE
    password_hash = '$2a$12$7sRw4ySBnttyzMVwTro1.OtiYmgI5ncTmHb2ZTLRG1pYvfJ9PTSwW',
    user_type = 'relative',
    staff_id = NULL,
    is_admin = 0,
    is_super_admin = 0;

-- ========================================
-- Step 3: Create Relative Record (if needed)
-- ========================================
-- NOTE: Replace cNo value (12) with a valid client ID from your Clients table

-- First, check if you have any clients:
-- SELECT cNo, cFName, cLName FROM Clients LIMIT 5;

-- If you have clients, pick one and use its cNo below:
INSERT INTO Relative (rNo, user_id, rFName, rLName, cNo, relationship, rEmail, rTel, can_receive_updates, can_view_reports, can_view_visit_logs)
SELECT
    200,  -- Using high ID to avoid conflicts
    (SELECT user_id FROM users WHERE email = 'relative@albiscare.com' LIMIT 1),
    'Emma',
    'Family',
    12,  -- ⚠️ REPLACE with actual client cNo from your Clients table
    'Daughter',
    'relative@albiscare.com',
    '07700123004',
    1,
    1,
    1
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM Relative WHERE rEmail = 'relative@albiscare.com'
)
LIMIT 1;

-- ========================================
-- Step 4: Update staff.user_id (Link back to users)
-- ========================================
-- This ensures bidirectional link between users and staff

UPDATE staff s
INNER JOIN users u ON u.email = s.email
SET s.user_id = u.user_id
WHERE s.staff_id IN (100, 101, 102);

-- ========================================
-- Verification Queries
-- ========================================

-- Verify Users Table
SELECT
    email,
    user_type,
    staff_id,
    is_admin,
    is_super_admin,
    status
FROM users
WHERE email IN (
    'super_admin@albiscare.com',
    'admin@albiscare.com',
    'care.manager@albiscare.com',
    'care.assistant@albiscare.com',
    'driver@albiscare.com',
    'relative@albiscare.com'
)
ORDER BY
    CASE
        WHEN is_super_admin = 1 THEN 1
        WHEN is_admin = 1 THEN 2
        WHEN user_type = 'staff' THEN 3
        WHEN user_type = 'relative' THEN 4
        ELSE 5
    END;

-- Expected Result:
-- super_admin@albiscare.com   | admin    | NULL | 1 | 1 | active
-- admin@albiscare.com         | admin    | NULL | 1 | 0 | active
-- care.manager@albiscare.com  | staff    | 100  | 0 | 0 | active
-- care.assistant@albiscare.com| staff    | 101  | 0 | 0 | active
-- driver@albiscare.com        | staff    | 102  | 0 | 0 | active
-- relative@albiscare.com      | relative | NULL | 0 | 0 | active

-- Verify Staff Records with Joined Data
SELECT
    u.email,
    u.user_type,
    u.staff_id,
    s.staff_role,
    CONCAT(s.first_name, ' ', s.last_name) as staff_name
FROM users u
LEFT JOIN staff s ON u.staff_id = s.staff_id
WHERE u.email IN (
    'care.manager@albiscare.com',
    'care.assistant@albiscare.com',
    'driver@albiscare.com'
)
ORDER BY s.staff_id;

-- Expected Result:
-- care.manager@albiscare.com    | staff | 100 | Care Manager   | Sarah Manager
-- care.assistant@albiscare.com  | staff | 101 | Care Assistant | John Assistant
-- driver@albiscare.com          | staff | 102 | Driver         | Mike Driver

-- Verify Relative Record
SELECT
    u.email,
    r.rNo as relative_id,
    CONCAT(r.rFName, ' ', r.rLName) as relative_name,
    r.cNo as linked_client_id,
    r.relationship
FROM users u
INNER JOIN Relative r ON u.user_id = r.user_id
WHERE u.email = 'relative@albiscare.com';

-- Expected Result:
-- relative@albiscare.com | 200 | Emma Family | 12 | Daughter

-- ========================================
-- Testing Checklist
-- ========================================
-- After running this SQL:
--
-- 1. Login to React Native app with each account (password: 123456)
-- 2. Check console logs for 'effective_role' value
-- 3. Verify correct dashboard displays:
--
--    Email: super_admin@albiscare.com
--    Password: 123456
--    Expected: AdminDashboard (blue header, "Welcome back, Super Admin")
--
--    Email: admin@albiscare.com
--    Password: 123456
--    Expected: AdminDashboard (blue header, "Welcome back, Admin")
--
--    Email: care.manager@albiscare.com
--    Password: 123456
--    Expected: CareManagerDashboard (shows "Sarah Manager")
--
--    Email: care.assistant@albiscare.com
--    Password: 123456
--    Expected: StaffDashboard (green header, shows "John Assistant")
--
--    Email: driver@albiscare.com
--    Password: 123456
--    Expected: DriverDashboard (orange header, shows "Mike Driver")
--
--    Email: relative@albiscare.com
--    Password: 123456
--    Expected: RelativeDashboard (read-only, shows "Emma Family")
-- ========================================
