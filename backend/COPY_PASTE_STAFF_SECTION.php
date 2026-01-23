    // 5a. Get STAFF details
    // FIXED: Uses staff_id FK join, detects manager/driver/carer roles
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

            // Check for Care Manager (also handles 'admin' from current database)
            if (strpos($staffRole, 'manager') !== false ||
                $staffRole === 'manager' ||
                $staffRole === 'care manager' ||
                $staffRole === 'admin') {
                $userData['effective_role'] = 'care_manager';
                $userData['role'] = 'Care Manager';
            }
            // Check for Driver
            elseif (strpos($staffRole, 'driver') !== false ||
                    $staffRole === 'driver' ||
                    $staffRole === 'transport') {
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
