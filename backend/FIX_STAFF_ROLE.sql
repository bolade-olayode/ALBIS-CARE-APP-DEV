-- Fix manager staff_role from 'admin' to 'manager'
-- This allows the login.php to correctly detect Care Manager role

UPDATE staff
SET staff_role = 'manager'
WHERE staff_id = 26;

-- Verify the update was successful
SELECT
    staff_id,
    first_name,
    last_name,
    staff_role,
    email
FROM staff
WHERE staff_id IN (13, 18, 26)
ORDER BY staff_id;

-- Expected result:
-- staff_id: 13, staff_role: 'carer', name: Bimbo Adesanya
-- staff_id: 18, staff_role: 'driver', name: Bode Thomas
-- staff_id: 26, staff_role: 'manager', name: Carol Derrick (UPDATED)
