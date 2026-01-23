-- ========================================
-- Verification Queries for Test Users
-- ========================================

-- 1. Check all test users were created
SELECT
    u.email,
    u.user_type,
    u.staff_id,
    u.is_admin,
    u.is_super_admin,
    u.status
FROM users u
WHERE u.email IN (
    'super_admin@albiscare.com',
    'admin@albiscare.com',
    'care.manager@albiscare.com',
    'care.assistant@albiscare.com',
    'driver@albiscare.com',
    'relative@albiscare.com'
)
ORDER BY
    CASE
        WHEN u.is_super_admin = 1 THEN 1
        WHEN u.is_admin = 1 THEN 2
        WHEN u.user_type = 'staff' THEN 3
        ELSE 4
    END;

-- Expected:
-- super_admin@albiscare.com   | admin    | NULL | 1 | 1 | active
-- admin@albiscare.com         | admin    | NULL | 1 | 0 | active
-- care.manager@albiscare.com  | staff    | 100  | 0 | 0 | active
-- care.assistant@albiscare.com| staff    | 101  | 0 | 0 | active
-- driver@albiscare.com        | staff    | 102  | 0 | 0 | active
-- relative@albiscare.com      | relative | NULL | 0 | 0 | active

-- 2. Check staff records linked correctly
SELECT
    s.staff_id,
    s.user_id,
    CONCAT(s.first_name, ' ', s.last_name) as name,
    s.staff_role,
    s.email
FROM staff s
WHERE s.staff_id IN (100, 101, 102)
ORDER BY s.staff_id;

-- Expected:
-- 100 | 33333333-3333-3333-3333-333333333333 | Sarah Manager    | Care Manager   | care.manager@albiscare.com
-- 101 | 44444444-4444-4444-4444-444444444444 | John Assistant   | Care Assistant | care.assistant@albiscare.com
-- 102 | 55555555-5555-5555-5555-555555555555 | Mike Driver      | Driver         | driver@albiscare.com

-- 3. Check bidirectional links (CRITICAL!)
SELECT
    u.email,
    u.staff_id as user_staff_id,
    s.staff_id as staff_staff_id,
    s.user_id as staff_user_id,
    u.user_id as user_user_id,
    s.staff_role,
    CASE
        WHEN u.staff_id = s.staff_id AND s.user_id = u.user_id THEN '✅ LINKED'
        ELSE '❌ BROKEN'
    END as link_status
FROM users u
INNER JOIN staff s ON u.staff_id = s.staff_id
WHERE u.email IN (
    'care.manager@albiscare.com',
    'care.assistant@albiscare.com',
    'driver@albiscare.com'
);

-- Expected: All should show ✅ LINKED

-- 4. Check relative record
SELECT
    r.rNo,
    r.user_id,
    CONCAT(r.rFName, ' ', r.rLName) as name,
    r.cNo as linked_client_id,
    r.relationship,
    r.rEmail
FROM Relative r
WHERE r.rEmail = 'relative@albiscare.com';

-- Expected:
-- 200 | 66666666-6666-6666-6666-666666666666 | Emma Family | 16 | Daughter | relative@albiscare.com

-- 5. Verify client 16 exists (for relative)
SELECT cNo, cFName, cLName FROM Clients WHERE cNo = 16;

-- If no result, relative login will fail. Pick another client:
-- SELECT cNo, cFName, cLName FROM Clients LIMIT 5;
-- Then update:
-- UPDATE Relative SET cNo = [chosen_cNo] WHERE rNo = 200;

-- 6. Test staff join query (what login.php will use)
SELECT
    u.email,
    u.user_type,
    u.staff_id,
    s.staff_role,
    CONCAT(s.first_name, ' ', s.last_name) as staff_name
FROM users u
LEFT JOIN staff s ON u.staff_id = s.staff_id
WHERE u.email LIKE '%@albiscare.com'
ORDER BY u.email;

-- Expected to see all 6 accounts with correct staff_role for staff users
