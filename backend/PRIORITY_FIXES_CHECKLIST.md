# Priority Fixes Checklist

Based on your testing, here are ALL issues found and their priority:

---

## 🔴 PRIORITY 1: Authorization Header (BLOCKS EVERYTHING)

### Issue
ALL API endpoints return "Authorization header missing":
- Staff list → 0 staff, "No staff found"
- Client list → 0 clients, "No clients found"
- Visits list → "Authorization header missing"
- Care logs list → "Authorization header missing"
- Analytics → "Failed to load analytics"

### Root Cause
Only `login.php` was updated with the new Authorization header reading logic. All other endpoints (staff, clients, visits, logs, transport, analytics) still have the OLD code.

### Fix
Update `verifyAuth()` function in **ONE file**: `public_html/api/v1/includes/permissions.php`

See: [FIX_ALL_ENDPOINTS.md](FIX_ALL_ENDPOINTS.md) for exact code to copy-paste

### Expected Result After Fix
- Stats show correct counts (not 0)
- Staff list loads
- Client list loads
- Visits load
- Care logs load
- Analytics loads

### Test
Login as super_admin@albiscare.com → click "Manage Staff" → should see staff list (not "Authorization header missing")

**STATUS: ⏳ NEEDS FIXING**

---

## 🟡 PRIORITY 2: Backend SQL Parameter Error

### Issue
Staff Dashboard (care.assistant@albiscare.com) shows:
- "DB Error: SQLSTATE[HY093]: Invalid parameter number" when loading "My Schedule"

### Root Cause
Backend `visits/index.php` has a SQL query with mismatched placeholders and parameters.

### Fix Needed
Check backend `public_html/api/v1/visits/index.php`:

1. Find the SQL query that filters by `staff_id`
2. Look for placeholders like `:staff_id`, `:start_date`, `:end_date`
3. Ensure the `$stmt->execute()` call has matching parameters

Example of CORRECT code:
```php
$stmt = $pdo->prepare("
    SELECT * FROM Visits
    WHERE staff_id = :staff_id
    AND visit_date BETWEEN :start_date AND :end_date
");

$stmt->execute([
    'staff_id' => $staffId,        // ✅ Matches :staff_id
    'start_date' => $startDate,    // ✅ Matches :start_date
    'end_date' => $endDate         // ✅ Matches :end_date
]);
```

Example of WRONG code (causes "Invalid parameter number"):
```php
$stmt = $pdo->prepare("
    SELECT * FROM Visits
    WHERE staff_id = :staff_id
    AND visit_date BETWEEN :start_date AND :end_date
");

$stmt->execute([
    'staff_id' => $staffId,
    // ❌ Missing start_date and end_date!
]);
```

### Test
Login as care.assistant@albiscare.com → Dashboard should load "Today's Schedule" without SQL error

**STATUS: ⏳ NEEDS FIXING (After Priority 1)**

---

## 🟡 PRIORITY 3: Driver Dashboard Shows ALL Jobs

### Issue
Driver Dashboard (driver@albiscare.com) shows:
- ALL transport jobs in the system (not just their own)
- Can start transport jobs for OTHER drivers

### Root Cause
Backend `transport/index.php` not filtering by `driver_id`, or frontend not passing driver filter correctly.

### Fix Option 1: Backend Filter (Recommended)
Update `public_html/api/v1/transport/index.php`:

```php
// When user is a driver, automatically filter by their staff_id
$userId = verifyAuth()['userId'];
$userRole = getUserRole($userId); // Get from users/staff table

if ($userRole === 'driver') {
    // Force filter to only their jobs
    $driverStaffId = getStaffIdFromUser($userId);
    $filters['driver_id'] = $driverStaffId;
}

// Then build SQL query with filters
$stmt = $pdo->prepare("
    SELECT * FROM Transport
    WHERE driver_id = :driver_id  -- Always filter for drivers
    ...
");
```

### Fix Option 2: Frontend Filter (Temporary)
Update DriverDashboard.tsx to only show jobs where `transport.driver_id === userData.staff_id`:

```typescript
// Filter transport jobs by current driver
const myJobs = todayTransports.filter(t => t.driver_id === userData.staff_id);
setTodayTransports(myJobs);
```

But this is NOT secure - drivers could still call the API directly to see all jobs.

### Test
Login as driver@albiscare.com → Should only see transport jobs assigned to "Mike Driver" (staff_id 102)

**STATUS: ⏳ NEEDS FIXING (After Priority 1 & 2)**

---

## 🟡 PRIORITY 4: Transport Details Showing Action Buttons for Admins

### Issue
When admin clicks on transport details, they see "Start Journey" button (should be read-only)

### Root Cause
`TransportExecutionScreen` doesn't check user role before showing action buttons

### Fix
Update `src/screens/transport/TransportExecutionScreen.tsx`:

```typescript
import { usePermissions } from '../../hooks/usePermissions';

export default function TransportExecutionScreen({ route, navigation }) {
  const { isAdmin, isSuperAdmin, isStaff, userData } = usePermissions();

  // Check if current user is the assigned driver
  const isAssignedDriver = transport.driver_id === userData?.staff_id;

  // Admins and non-assigned staff should see read-only view
  const isReadOnly = isAdmin() || isSuperAdmin() || !isAssignedDriver;

  return (
    <View>
      {/* Transport details... */}

      {/* Only show action buttons if assigned driver and not admin */}
      {!isReadOnly && (
        <TouchableOpacity onPress={startJourney}>
          <Text>Start Journey</Text>
        </TouchableOpacity>
      )}

      {isReadOnly && (
        <Text>View Only - You are not the assigned driver</Text>
      )}
    </View>
  );
}
```

### Test
Login as super_admin@albiscare.com → View transport details → Should NOT see "Start Journey" button

**STATUS: ⏳ NEEDS FIXING (Frontend)**

---

## 🟢 PRIORITY 5: Minor Issues

### Issue 5A: Stats Show 0
This will be fixed automatically when Priority 1 is fixed.

### Issue 5B: Care Manager Has Wrong Header Color
Care Manager shows "deep pink" header instead of default color.

**Fix:** Check `src/screens/dashboard/CareManagerDashboard.tsx` styles:
```typescript
header: {
  backgroundColor: '#8b5cf6',  // ← Should this be a different color?
  // Change to: backgroundColor: '#2563eb', for blue
}
```

### Issue 5C: Relative Dashboard Needs Testing
Need to create test visit/log linked to client 16 to verify relative can view them.

**Create Test Visit:**
```sql
INSERT INTO Visits (client_id, staff_id, visit_date, visit_time, visit_type, status)
VALUES (16, 100, CURDATE(), '10:00:00', 'routine', 'scheduled');
```

**Create Test Care Log:**
```sql
INSERT INTO care_logs (client_id, staff_id, visit_date, visit_time, duration_minutes, notes)
VALUES (16, 100, CURDATE(), '10:00:00', 60, 'Test care log for relative viewing');
```

Then login as relative@albiscare.com and verify "Recent Visits" and "Care Logs" tabs show data.

---

## 🎯 Recommended Order of Fixes

1. **Fix permissions.php verifyAuth()** → Fixes Authorization errors → Unblocks everything
2. **Fix visits/index.php SQL error** → Fixes Staff Dashboard
3. **Fix driver filtering** → Fixes Driver Dashboard
4. **Add permission checks to TransportExecutionScreen** → Fixes admin read-only view
5. **Test relative dashboard with real data** → Verify complete functionality

---

## Quick Win: Fix #1 (5 Minutes)

The BIGGEST impact fix is updating permissions.php. This ONE change fixes:
- ✅ Staff list
- ✅ Client list
- ✅ Visits list
- ✅ Care logs list
- ✅ Analytics
- ✅ Stats showing correct counts
- ✅ All dashboards working properly

**File to edit:** `public_html/api/v1/includes/permissions.php`

**Function to replace:** `verifyAuth()` (around line 304)

**Code to use:** See [FIX_ALL_ENDPOINTS.md](FIX_ALL_ENDPOINTS.md) lines 26-62

---

## Summary

| Issue | Priority | Location | Status |
|-------|----------|----------|--------|
| Authorization header missing | 🔴 P1 | Backend permissions.php | ⏳ Needs fix |
| SQL parameter error | 🟡 P2 | Backend visits/index.php | ⏳ Needs fix |
| Driver sees all jobs | 🟡 P3 | Backend transport/index.php | ⏳ Needs fix |
| Admin can start transport | 🟡 P4 | Frontend TransportExecution | ⏳ Needs fix |
| Care Manager pink header | 🟢 P5 | Frontend CareManagerDashboard | Optional |
| Relative testing | 🟢 P5 | Database + testing | ⏳ Needs data |

**Estimated Time:**
- P1: 5 minutes (one function replacement)
- P2: 10 minutes (debug SQL query)
- P3: 15 minutes (add driver filter)
- P4: 10 minutes (add permission check)
- P5: 5 minutes (create test data)

**Total: ~45 minutes to fix everything**
