# Albis Care - Development Log

This document tracks all major development milestones, bug fixes, and feature implementations.

---

## Version 1.0.0 (February 4, 2026) - Production Release

### Push Notifications System
**Date:** February 3-4, 2026

#### Added
- Expo Push Notifications integration
- `notificationService.ts` - Core notification handling
- `notificationApi.ts` - API client for token management
- Push token registration on login
- Push token deactivation on logout
- Deep linking from notifications to specific screens
- Visit reminder cron job (`send-visit-reminders.php`)
- Notification channels for Android (default, visit-reminders, assignments, care-updates)

#### Backend Files
- `api/v1/notifications/register-token.php` - Register Expo push tokens
- `api/v1/notifications/unregister-token.php` - Deactivate tokens on logout
- `api/cron/send-visit-reminders.php` - Automated visit reminders
- `push_tokens` table - Store device tokens per user
- `notification_logs` table - Track sent notifications

#### Bug Fixes
- Fixed timing issue with token registration (added 500ms delay after login)
- Fixed auth token verification before API call
- Verified database integration works correctly

---

## Version 0.9.0 (February 3, 2026)

### Visit Status Filtering Fix
**Date:** February 3, 2026

#### Fixed
- Case-sensitive status comparison issues across all screens
- Added `.toLowerCase()` to all status comparisons

#### Files Modified
- `VisitListScreen.tsx`
- `VisitDetailScreen.tsx`
- `VisitExecutionScreen.tsx`
- `EditVisitScreen.tsx`
- `StaffDashboard.tsx`
- `DriverDashboard.tsx`
- `RelativeDashboardScreen.tsx`
- `TransportListScreen.tsx`
- `TransportExecutionScreen.tsx`

---

## Version 0.8.0 (January 29, 2026)

### Security Enhancements
**Date:** January 29, 2026

#### Added
- Change Password functionality
- `ChangePasswordScreen.tsx` - New screen for password changes
- `SearchablePickerModal` component - Reusable searchable dropdown
- Profile screen security section
- Password validation (minimum 6 characters)
- Current password verification

#### Backend
- `api/v1/auth/change-password.php` - Password change endpoint
- Bcrypt password hashing verification

---

## Version 0.7.0 (January 23-28, 2026)

### Dashboard System Overhaul
**Date:** January 23-28, 2026

#### Added
- `SuperAdminDashboard.tsx` - New super admin interface
- Corrected API calling on Admin and Staff Dashboard
- Improved dashboard routing logic

#### Fixed
- Dashboard re-routing issues
- Role detection improvements
- Staff assignment display

---

## Version 0.6.0 (January 20-22, 2026)

### Visit Execution System
**Date:** January 20-22, 2026

#### Added
- `VisitExecutionScreen.tsx` - Complete visit workflow
- Start visit functionality with timestamp
- Complete visit with care log creation
- Visit status tracking (Scheduled → In Progress → Completed)
- Care log entry forms

#### Features
- GPS location capture (planned)
- Visit timer display
- Care notes input
- Mood/wellbeing tracking
- Tasks completed checklist

---

## Version 0.5.0 (January 21, 2026)

### Family Access Management
**Date:** January 21, 2026

#### Added
- `GrantFamilyAccessScreen.tsx` - Create family member accounts
- Relative account creation with UUID
- Permission system implementation:
  - Primary Contact designation
  - Emergency Contact flag
  - Can receive updates
  - Can view reports
  - Can view visit logs
- Relatives list display on ClientDetailScreen
- Visual indicators for Primary/Emergency contacts
- Password visibility toggle

#### Backend
- `api/v1/relative/create.php` - Create relative accounts
- `api/v1/relative/list.php` - List relatives per client
- `api/v1/relative/dashboard.php` - Relative portal data

#### Technical
- Separate screen architecture (scalable design)
- Email-based login for relatives
- Automatic password hashing
- UUID-based user identification

---

## Version 0.4.0 (December 15, 2025)

### Transport Management
**Date:** December 15, 2025

#### Added
- `TransportListScreen.tsx` - Driver transport schedule
- `TransportDetailScreen.tsx` - Transport job details
- `TransportExecutionScreen.tsx` - Execute transport jobs
- Driver-specific filtering
- Mileage tracking
- Transport status updates

#### Dashboard
- `DriverDashboard.tsx` - Orange themed driver interface
- Today's transport jobs display
- Transport statistics

---

## Version 0.3.0 (December 9, 2025)

### Role-Based Dashboard System
**Date:** December 9, 2025

#### Added
- Intelligent role detection and routing
- `AdminDashboard.tsx` - Care Manager view
- `StaffDashboard.tsx` - Carer/Nurse view (Blue theme)
- `DriverDashboard.tsx` - Transport view (Orange theme)
- `RelativeDashboard.tsx` - Family view (Green theme)
- Dual fallback system (staff_role + roleName)
- Personalized greeting with staff names

#### Fixed
- Dashboard routing issues (admin seeing staff dashboard)
- Driver data leak (seeing all transport jobs)
- staff_role auto-assignment

---

## Version 0.2.0 (December 3, 2025)

### Staff Management
**Date:** December 3, 2025

#### Added
- `StaffListScreen.tsx` - Staff directory
- `StaffDetailScreen.tsx` - Staff profile view
- `AddStaffScreen.tsx` - Create new staff
- `EditStaffScreen.tsx` - Update staff info
- Role-based grouping (Care Managers, Carers, Nurses, Drivers)
- Collapsible role sections
- Password management with bcrypt
- Professional info (PVG, SSSC numbers)
- Emergency contact management

#### Backend
- `api/v1/staff/create.php` - Auto staff_role mapping
- `api/v1/staff/update.php` - Auto staff_role update
- Rate limiting implementation

---

## Version 0.1.0 (December 2, 2025)

### Client Management & Foundation
**Date:** December 2, 2025

#### Added
- `ClientListScreen.tsx` - Client directory
- `ClientDetailScreen.tsx` - Client profile view
- `AddClientScreen.tsx` - Create new clients
- `EditClientScreen.tsx` - Update client info
- Care level indicators (Low, Medium, High, Complex)
- Search & filter functionality
- Priority sorting by care level

#### Foundation
- React Native project setup with Expo
- Navigation structure (React Navigation 6)
- API service layer (`apiClient.ts`)
- Authentication system
- AsyncStorage session management
- TypeScript configuration

#### Backend
- Database schema (12+ tables)
- Authentication endpoints
- HTTPS/SSL encryption
- CORS configuration

---

## Database Schema Changes

### February 2026
```sql
-- Push tokens table
CREATE TABLE push_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    expo_push_token VARCHAR(255) NOT NULL,
    device_type ENUM('ios', 'android', 'web'),
    device_name VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Notification logs table
CREATE TABLE notification_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    notification_type ENUM('visit_reminder', 'new_assignment', ...),
    title VARCHAR(255),
    body TEXT,
    data_payload LONGTEXT,
    status ENUM('pending', 'sent', 'delivered', 'failed'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Visit reminder tracking
ALTER TABLE scheduled_visits
ADD COLUMN reminder_sent BOOLEAN DEFAULT FALSE;
```

### January 2026
```sql
-- Relative table expansion
ALTER TABLE Relative
ADD COLUMN user_id VARCHAR(36),
ADD COLUMN is_primary_contact TINYINT DEFAULT 0,
ADD COLUMN is_emergency_contact TINYINT DEFAULT 0,
ADD COLUMN can_receive_updates TINYINT DEFAULT 1,
ADD COLUMN can_view_reports TINYINT DEFAULT 0,
ADD COLUMN can_view_visit_logs TINYINT DEFAULT 1;
```

---

## Known Issues & Resolutions

### Resolved

| Issue | Resolution | Date |
|-------|------------|------|
| Push token registration failing with "Database error" | Added 500ms delay after login to ensure auth token is saved | Feb 4, 2026 |
| Status filtering case-sensitive | Added `.toLowerCase()` to all comparisons | Feb 3, 2026 |
| Dashboard routing incorrect | Improved role detection logic | Jan 28, 2026 |
| API URL duplication (/api/api/) | Fixed endpoint paths in relativeApi.ts | Jan 21, 2026 |
| staff_role not auto-assigned | Added auto-assignment in create/update PHP | Dec 9, 2025 |
| Driver seeing all transport jobs | Added strict driver_id filtering | Dec 9, 2025 |

### Current Limitations

1. **Expo Go Limitations**
   - Push notifications have limited support in Expo Go (SDK 53+)
   - Recommend using development builds for full testing

2. **Offline Support**
   - No offline mode currently
   - Requires internet connection

3. **Email Notifications**
   - Family access credentials not emailed automatically
   - Admin must share credentials manually

---

## Performance Optimizations

### February 2026
- Added 500ms delay for token registration timing
- Optimized notification API response handling
- Removed debug logging for production

### January 2026
- Implemented list virtualization for large datasets
- Added search debouncing (300ms)
- Optimized image loading

---

## Testing Notes

### Devices Tested
- iPhone 15 Pro Max (iOS 17) - Simulator
- iPhone 14 Pro Max (iOS 17) - Physical device
- Pixel 6 (Android 13) - Emulator
- Samsung Galaxy S21 (Android 12) - Physical device

### Test Coverage
- Authentication flow ✓
- Role-based routing ✓
- Client CRUD ✓
- Staff CRUD ✓
- Visit management ✓
- Transport management ✓
- Push notifications ✓
- Deep linking ✓

---

## Deployment History

| Date | Version | Notes |
|------|---------|-------|
| Feb 4, 2026 | 1.0.0 | Production release with push notifications |
| Feb 3, 2026 | 0.9.0 | Status filtering fixes |
| Jan 29, 2026 | 0.8.0 | Security enhancements |
| Jan 23, 2026 | 0.7.0 | Dashboard overhaul |
| Jan 21, 2026 | 0.5.0 | Family access system |
| Dec 15, 2025 | 0.4.0 | Transport management |
| Dec 9, 2025 | 0.3.0 | Role-based dashboards |
| Dec 3, 2025 | 0.2.0 | Staff management |
| Dec 2, 2025 | 0.1.0 | Initial release |

---

**Document maintained by:** Development Team
**Last updated:** February 4, 2026
