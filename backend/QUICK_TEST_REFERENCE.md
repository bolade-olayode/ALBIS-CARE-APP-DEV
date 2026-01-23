# Quick Test Reference Card

## All Passwords: 123456

---

## ✅ super_admin@albiscare.com
**Expected:**
- Dashboard: `AdminDashboard`
- Header: Blue (#2563eb)
- Name: "Super Admin"
- Console: `effective_role: "super_admin"`

---

## ✅ admin@albiscare.com
**Expected:**
- Dashboard: `AdminDashboard`
- Header: Blue (#2563eb)
- Name: "Admin" or "Administrator"
- Console: `effective_role: "admin"`

---

## ✅ care.manager@albiscare.com
**Expected:**
- Dashboard: `CareManagerDashboard`
- Name: "Sarah Manager"
- Console: `effective_role: "care_manager"`, `staff_role: "Care Manager"`

---

## ✅ care.assistant@albiscare.com
**Expected:**
- Dashboard: `StaffDashboard`
- Header: Green (#10b981)
- Name: "John Assistant"
- Console: `effective_role: "staff"`, `staff_role: "Care Assistant"`

---

## ✅ driver@albiscare.com
**Expected:**
- Dashboard: `DriverDashboard`
- Header: Orange (#f59e0b)
- Name: "Mike Driver"
- Console: `effective_role: "driver"`, `staff_role: "Driver"`

---

## ✅ relative@albiscare.com
**Expected:**
- Dashboard: `RelativeDashboard`
- Name: "Emma Family"
- Console: `effective_role: "relative"`, `client_id: 12`
- All create/edit buttons HIDDEN

---

## Before You Test

1. Run [CREATE_TEST_USERS.sql](CREATE_TEST_USERS.sql) in phpMyAdmin
2. Update line 184: Replace `cNo = 12` with actual client ID
3. Verify with the verification queries at end of SQL file

---

## Common Issues

| Problem | Console Shows | Fix |
|---------|---------------|-----|
| Wrong dashboard | `effective_role: "staff"` for manager | Check staff_role in database |
| Authorization error | `Authorization header missing` | Check .htaccess and permissions.php |
| Stats show 0 | `Access denied` | Check checkPermission() allows list access |
| Name shows email | `name: "care.manager@albiscare.com"` | Check staff record exists with staff_id |

---

## Quick Verification SQL

```sql
-- Check users are created correctly
SELECT email, user_type, staff_id, is_admin, is_super_admin
FROM users
WHERE email LIKE '%albiscare.com'
ORDER BY is_super_admin DESC, is_admin DESC, user_type;

-- Check staff records linked correctly
SELECT u.email, s.staff_role, CONCAT(s.first_name, ' ', s.last_name) as name
FROM users u
JOIN staff s ON u.staff_id = s.staff_id
WHERE u.email LIKE '%albiscare.com';
```
