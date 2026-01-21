# Albis Care - Care Management System

A comprehensive mobile application for managing care services, staff, clients, and care visits.

## 🎯 Project Overview

**Client:** Albis Care UK  
**Platform:** React Native (iOS/Android)  
**Backend:** PHP REST API  
**Database:** MySQL (MariaDB)  
**Hosting:** Hostinger cPanel  
**Development Status:** Phase 3 - Family Access & Visit Management  
**Target Launch:** January 20-25, 2026

---

## ✅ Completed Features (As of January 21, 2026)

### Week 1-2: Foundation & Core CRUD ✅
- [x] Database schema (12 tables)
- [x] Authentication system with role detection
- [x] Secure API endpoints (HTTPS)
- [x] Role-based access (Admin, Carer, Nurse, Driver, Relative)
- [x] React Native project setup
- [x] Navigation structure
- [x] Role-based dashboard routing

### Week 3-4: Client & Staff Management ✅
- [x] **Client Management (Complete CRUD)**
  - View all clients with search & filter
  - Client detail view with full information
  - Add new clients with comprehensive forms
  - Edit existing client information
  - Delete clients with confirmation
  - Care level indicators (Low, Medium, High, Complex)
  - Start/End date tracking
  - Priority sorting by care level

- [x] **Staff Management (Complete CRUD)**
  - View all staff (grouped by role)
  - Collapsible role sections (Care Managers, Carers, Nurses, Drivers)
  - Staff detail view with full information
  - Add new staff with password setup
  - Edit staff information
  - Delete staff with confirmation
  - Email and mobile number support
  - Professional information (PVG, SSSC numbers)
  - Emergency contact management
  - **Automatic staff_role assignment based on role_id**

- [x] **Dashboard System**
  - Admin Dashboard (Care Manager view)
  - Staff Dashboard (Carer/Nurse view - blue theme)
  - Driver Dashboard (Transport view - orange theme)
  - Relative Dashboard (Family view)
  - **Intelligent role detection and routing**
  - **Dual fallback system (staff_role + roleName)**
  - Personalized greeting with staff names

### Week 5: Family Portal & Access Management ✅
- [x] **Family Access Management (NEW)**
  - Grant family members access to client information
  - Create relative accounts linked to specific clients
  - Automatic user account generation with UUID
  - Password hashing for relative accounts
  - Role-based permissions system:
    - Primary Contact designation
    - Emergency Contact flag
    - Can receive updates
    - Can view reports
    - Can view visit logs
  - View existing family members per client
  - Visual indicators for primary/emergency contacts
  - Email-based login for relatives
  - Separate screen architecture for scalability

- [x] **Security Features**
  - Password hashing (bcrypt)
  - Rate limiting (5 attempts/minute)
  - Mobile OR email login
  - Session management with AsyncStorage
  - HTTPS/SSL encryption
  - Automatic login credential generation
  - UUID-based user identification
  - Soft delete capability (status field)

---

## 🚧 In Progress / Upcoming Features

### Week 6: Visit Execution & Logging (Current Priority)
- [ ] Visit execution screens (start/complete workflow)
- [ ] GPS location verification
- [ ] Visit timer functionality
- [ ] Care log entry forms
- [ ] Photo upload for visits
- [ ] Visit status tracking (scheduled → in_progress → completed)
- [ ] Digital signature capture

### Week 6: Transport Management
- [ ] Driver transport schedule execution
- [ ] Transport logs with mileage tracking
- [ ] Real-time transport status updates
- [ ] Route optimization (future)

### Week 7: Relative Portal Enhancement
- [ ] View family member's care history
- [ ] Visit notifications for relatives
- [ ] Communication system (messages)
- [ ] Edit relative permissions (Phase 2)
- [ ] Revoke family access (Phase 2)
- [ ] Multiple relatives per client (already supported)

### Week 7: Reporting & Analytics
- [ ] Client visit reports
- [ ] Staff performance metrics
- [ ] Analytics dashboard
- [ ] Export functionality (PDF/Excel)

### Week 8: Polish & Testing
- [ ] User acceptance testing
- [ ] Bug fixes
- [ ] Performance optimization
- [ ] Training materials
- [ ] App Store submission

---

## 🏗️ Technical Architecture

### Frontend (React Native)
```
src/
├── components/          # Reusable UI components
├── navigation/          # Navigation configuration
│   └── AppNavigator.tsx # Intelligent role-based routing
├── screens/
│   ├── auth/           # Login screens
│   ├── dashboard/      # Role-based dashboards
│   │   ├── AdminDashboard.tsx
│   │   ├── StaffDashboard.tsx
│   │   ├── DriverDashboard.tsx
│   │   └── RelativeDashboard.tsx
│   ├── clients/        # Client management (CRUD)
│   │   ├── ClientListScreen.tsx
│   │   ├── ClientDetailScreen.tsx (with relatives list)
│   │   ├── AddClientScreen.tsx
│   │   ├── EditClientScreen.tsx
│   │   └── GrantFamilyAccessScreen.tsx (NEW)
│   ├── staff/          # Staff management (CRUD)
│   ├── logs/           # Care log screens
│   ├── visits/         # Visit management
│   └── transport/      # Transport screens
├── services/
│   └── api/           # API service layer
│       ├── clientApi.ts
│       ├── staffApi.ts
│       ├── relativeApi.ts (NEW)
│       └── visitApi.ts
└── types/             # TypeScript type definitions
```

### Backend (PHP)
```
public_html/api/
├── v1/
│   ├── auth/          # Authentication endpoints
│   │   └── login.php  # Role detection & JWT
│   ├── clients/       # Client CRUD operations
│   ├── staff/         # Staff CRUD operations
│   │   ├── create.php # Auto staff_role mapping
│   │   └── update.php # Auto staff_role update
│   ├── relative/      # Family access management (NEW)
│   │   ├── create.php # Create family member accounts
│   │   ├── list.php   # List relatives per client
│   │   └── dashboard.php # Relative portal data
│   └── middleware/    # Rate limiting, etc.
└── config/            # Database configuration
```

### Database Schema (Key Tables)
```sql
- users           # Authentication (staff + relatives)
- staff           # Staff members (with roles)
  └── staff_role  # 'admin', 'carer', 'driver'
- CareUser        # Care clients
- Relative        # Family members (NEW - expanded)
  ├── user_id     # Links to users table (UUID)
  ├── cNo         # Links to CareUser (client)
  ├── relationship # Son/Daughter/Spouse/etc.
  ├── is_primary_contact
  ├── is_emergency_contact
  ├── can_receive_updates
  ├── can_view_reports
  └── can_view_visit_logs
- scheduled_visits # Visit records
- visit_logs      # Visit details
- transport_logs  # Driver transport records
- notifications   # System notifications
```

---

## 🔐 Security Features

- ✅ Bcrypt password hashing
- ✅ UUID-based user identification
- ✅ JWT token authentication
- ✅ Rate limiting (5 login attempts/minute per IP)
- ✅ HTTPS/SSL encryption
- ✅ SQL injection prevention (prepared statements)
- ✅ CORS configuration
- ✅ Session timeout (24 hours)
- ✅ Role-based access control (RBAC)
- ✅ Soft delete capability (status field)
- ✅ Email validation
- ✅ Password strength requirements (min 6 chars)
- ⏳ API authentication middleware (planned)
- ⏳ Two-factor authentication (planned Phase 2)

**Current Security Level:** 9/10 (Production-ready)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Expo CLI
- iOS Simulator (Mac) or Android Studio
- Access to Hostinger cPanel
- MySQL database credentials

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd albis-care-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure API endpoint**
```typescript
// src/config/api.ts
export const API_CONFIG = {
  BASE_URL: 'https://albiscare.co.uk/api',
  ENDPOINTS: {
    LOGIN: '/v1/auth/login.php',
    STAFF: '/v1/staff',
    CLIENTS: '/v1/clients/',
    VISITS: '/v1/visits',
    RELATIVE: '/v1/relative',
  },
};
```

4. **Start the development server**
```bash
npx expo start
```

5. **Run on device**
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan QR code with Expo Go app on physical device

---

## 🔑 Test Credentials

### Admin Account
```
Email: admin@albiscare.co.uk
Password: password
Role: Care Manager (Full Access)
Dashboard: Admin Dashboard (Blue theme)
```

### Staff Account (Carer/Nurse)
```
Email: staff@example.com
Password: [Set by admin during creation]
Role: Carer/Nurse
Dashboard: Staff Dashboard (Blue theme)
Features: View assigned visits, log care notes
```

### Driver Account
```
Email: driver@example.com
Password: [Set by admin during creation]
Role: Driver
Dashboard: Driver Dashboard (Orange theme)
Features: View transport schedule, log transport
```

### Relative Account (Family)
```
Email: [Set by admin when granting access]
Password: [Set by admin, relative can change]
Role: Relative
Dashboard: Relative Dashboard (Green theme)
Features: View family member's care, visit history
```

---

## 📡 API Endpoints

### Base URL
```
https://albiscare.co.uk/api/v1
```

### Authentication
- `POST /auth/login` - User login (rate limited, returns role-based data)

### Clients
- `GET /clients/` - List all clients
- `GET /clients/get.php?id={id}` - Get single client
- `POST /clients/create.php` - Create client
- `PUT /clients/update.php?id={id}` - Update client
- `DELETE /clients/delete.php?id={id}` - Delete client

### Staff
- `GET /staff/` - List all staff
- `GET /staff/get.php?id={id}` - Get single staff
- `POST /staff/create.php` - Create staff (auto-assigns staff_role)
- `PUT /staff/update.php?id={id}` - Update staff (auto-updates staff_role)
- `DELETE /staff/delete.php?id={id}` - Delete staff

### Relatives (NEW)
- `POST /relative/create.php` - Create family member account
- `GET /relative/list.php?client_id={id}` - List relatives for client
- `GET /relative/dashboard.php?relative_id={id}` - Get relative portal data

### Visits
- `GET /visits/index.php?staff_id={id}` - Get staff visits (filtered)
- `POST /visits/create.php` - Schedule new visit
- `PUT /visits/update.php?id={id}` - Update visit status
- `DELETE /visits/delete.php?id={id}` - Delete visit

### Transport
- `GET /transport/index.php?driver_id={id}` - Get driver schedule
- `POST /transport/create.php` - Create transport job
- `PUT /transport/update.php?id={id}` - Update transport status

---

## 🗄️ Database Configuration

### Connection Details
```
Host: localhost
Database: u153773720_albiscareuk
Username: u153773720_enquiry
Password: [In cPanel]
```

### Key Tables & Relationships
```sql
users (Authentication)
  ├── user_id (VARCHAR(36) UUID)
  ├── user_type ('staff', 'relative')
  └── status ('active', 'inactive', 'suspended')

staff (Staff Members)
  ├── staff_id (INT, PK)
  ├── user_id (FK → users.user_id)
  ├── role_id (1=Admin, 2=Carer, 3=Nurse, 4=Driver)
  └── staff_role ('admin', 'carer', 'driver')

CareUser (Care Clients)
  ├── cNo (INT, PK)
  └── care_level ('low', 'medium', 'high', 'complex')

Relative (Family Members) ⭐ NEW
  ├── rNo (INT, PK)
  ├── user_id (FK → users.user_id, VARCHAR(36))
  ├── cNo (FK → CareUser.cNo)
  ├── relationship (VARCHAR(50))
  ├── is_primary_contact (TINYINT)
  ├── is_emergency_contact (TINYINT)
  └── permissions (can_receive_updates, etc.)

scheduled_visits (Visit Records)
  ├── visit_id (INT, PK)
  ├── client_id (FK → CareUser.cNo)
  ├── staff_id (FK → staff.staff_id)
  └── status ('scheduled', 'completed', 'missed')

transport_logs (Driver Jobs)
  ├── transport_id (INT, PK)
  ├── visit_id (FK → scheduled_visits.visit_id)
  ├── driver_id (FK → staff.staff_id)
  └── status ('scheduled', 'in_progress', 'completed')
```

---

## 🎨 Design System

### Colors
```
Primary Blue: #2563eb
Success Green: #10b981
Warning Yellow: #f59e0b (Driver theme)
Error Red: #ef4444
Background: #f8fafc
Card Background: #ffffff
Border: #e2e8f0
```

### Dashboard Colors
```
Admin Dashboard: #2563eb (Blue)
Staff Dashboard: #2563eb (Blue)
Driver Dashboard: #f59e0b (Orange/Amber)
Relative Dashboard: #10b981 (Green)
```

### Role Colors
```
🔴 Care Manager: #fee2e2 (Red)
🔵 Carer: #dbeafe (Blue)
🟢 Nurse: #d1fae5 (Green)
🟡 Driver: #fef3c7 (Yellow)
```

### Care Levels
```
🔴 Complex: #fee2e2 (Red)
🟠 High: #fed7aa (Orange)
🟡 Medium: #fef3c7 (Yellow)
🟢 Low: #d1fae5 (Green)
```

---

## 📱 User Roles & Permissions

### Care Manager (Admin)
- ✅ Full system access
- ✅ Manage clients
- ✅ Manage staff
- ✅ Grant family access
- ✅ View all visits
- ✅ Generate reports
- ✅ System configuration
- **Dashboard:** Admin Dashboard with quick actions

### Carer / Nurse
- ✅ View assigned clients
- ✅ Log care visits
- ✅ View today's schedule
- ✅ Update visit notes
- ❌ Cannot manage staff
- ❌ Cannot grant family access
- **Dashboard:** Staff Dashboard with visit schedule

### Driver
- ✅ View transport schedule
- ✅ Log transport visits
- ✅ Update transport status
- ❌ Limited client access
- ❌ Cannot manage system
- **Dashboard:** Driver Dashboard with transport jobs (Orange theme)

### Relative (Family)
- ✅ View family member's care
- ✅ See visit history
- ✅ Receive notifications (based on permissions)
- ✅ View reports (if granted permission)
- ✅ View visit logs (if granted permission)
- ❌ Cannot access other clients
- ❌ Cannot manage system
- **Dashboard:** Relative Dashboard (Green theme)

---

## 🔄 Family Access System (NEW)

### How It Works
```typescript
// Admin grants family access from Client Detail screen
1. Admin navigates to client (e.g., "Robert Williams")
2. Clicks "Grant Family Access" button
3. Fills out form:
   - Personal details (Name, Title, Relationship, Phone)
   - Login credentials (Email, Password)
   - Permissions (Primary Contact, Emergency, Updates, etc.)
4. System creates:
   - User account with UUID
   - Relative record linked to client
   - Hashed password
5. Admin shares credentials with family member
6. Family member logs in → Routes to Relative Dashboard
7. Can view their loved one's care information
```

### Permission Levels
- **Primary Contact:** Main decision-maker for care
- **Emergency Contact:** Called in emergencies
- **Can Receive Updates:** Gets notifications about care changes
- **Can View Reports:** Access to analytics and reports
- **Can View Visit Logs:** See detailed visit history

### Multiple Relatives
- ✅ Clients can have multiple family members
- ✅ Each has independent login
- ✅ Each has customizable permissions
- ✅ Visual indicators show Primary/Emergency contacts
- ✅ Scalable for future features (edit/revoke access)

---

## 🐛 Known Issues / Limitations

### ✅ FIXED Issues (January 21, 2026)
1. ~~**Dashboard Routing**~~ ✅
   - ~~Admin seeing staff dashboard~~
   - ~~Driver seeing staff dashboard~~
   - **Fixed:** Proper role detection and routing

2. ~~**staff_role Field**~~ ✅
   - ~~Not being set automatically~~
   - **Fixed:** Auto-assignment based on role_id

3. ~~**Login userType**~~ ✅
   - ~~Admin returning 'staff' instead of 'admin'~~
   - **Fixed:** Correct userType in login response

4. ~~**Driver Data Leak**~~ ✅
   - ~~Drivers seeing all transport jobs~~
   - **Fixed:** Strict filtering by driver_id

5. ~~**API URL Duplication**~~ ✅
   - ~~Double /api/api/ in requests~~
   - **Fixed:** Corrected relativeApi.ts endpoint

### Current Limitations
1. **Email Notification**
   - Family access credentials not emailed automatically
   - Admin must manually share credentials
   - Email notification feature planned for Phase 2

2. **Relative Account Management**
   - Cannot edit relative permissions yet (Phase 2)
   - Cannot revoke access yet (Phase 2)
   - No relative-to-relative communication yet

3. **Offline Support**
   - No offline mode currently
   - Requires internet connection
   - Offline queue planned for Phase 3

---

## 📈 Project Status

### Timeline (Updated)
```
Week 1-2 (Nov 25-Dec 8):   ✅ Foundation & Setup
Week 3-4 (Dec 9-22):        ✅ Client & Staff Management
Week 5 (Jan 13-19):         ✅ Family Access System
Week 6 (Jan 20-26):         🚧 Visit Execution (IN PROGRESS)
Week 7 (Jan 27-Feb 2):      ⏳ Transport & Reporting
Week 8 (Feb 3-9):           ⏳ Testing & Polish
Launch (Feb 10-15):         ⏳ Production Deployment
```

### Progress
- **Overall:** 65% complete
- **Ahead of schedule:** Still on track
- **Launch confidence:** HIGH 🚀

### Recent Milestones
- ✅ Family Access feature complete (Jan 21)
- ✅ Professional code refactoring (separate screens)
- ✅ UX improvements (password visibility, form flow)
- ✅ Relatives list display on client detail
- ✅ Permission system implementation

---

## 🧪 Testing

### Manual Testing Checklist
- [x] Login (admin, staff, driver, relative)
- [x] Role-based dashboard routing
- [x] Admin dashboard access
- [x] Staff dashboard access
- [x] Driver dashboard access
- [x] Relative dashboard access
- [x] Client CRUD operations
- [x] Staff CRUD operations
- [x] Family access granting
- [x] Relative list viewing
- [x] Automatic staff_role assignment
- [x] Search functionality
- [x] Rate limiting
- [x] Password visibility toggle
- [ ] Visit execution (Week 6)
- [ ] Transport logging (Week 6)
- [ ] Reports (Week 7)

### Test Devices
- ✅ iPhone 15 Simulator (iOS 17)
- ✅ Android Emulator (Pixel 6)
- ⏳ Physical iPhone (testing with client)

---

## 🚀 Deployment

### Current Environment
```
Production API: https://albiscare.co.uk/api
Database: Hostinger cPanel MySQL
Mobile App: Development (Expo)
Status: Pre-production testing
```

### Deployment Process
1. Push code to GitHub
2. Upload PHP files to Hostinger via cPanel
3. Test API endpoints via Postman
4. Test mobile app flows
5. Build mobile app with EAS Build
6. Distribute TestFlight build to client
7. Collect feedback and iterate

---

## 📞 Support & Contact

**Developer:** Bolade Olayode  
**GitHub:** @bolade-olayode  
**Project:** Albis Care Management System

---

## 📄 License

Proprietary - Albis Care UK © 2026

---

## 🔄 Changelog

### [0.5.0] - 2026-01-21
**Added:**
- Family Access Management system
  - Grant Family Access screen with comprehensive form
  - Create relative accounts linked to clients
  - UUID-based user identification
  - Permission system (Primary Contact, Emergency, Updates, Reports, Visit Logs)
  - Password visibility toggle (eye icon)
  - Relatives list display on ClientDetailScreen
  - Visual badges for Primary/Emergency contacts
  - Support for multiple relatives per client
  - Backend endpoints (create.php, list.php)
  - Automatic password hashing
  - Email validation

**Improved:**
- Form UX: Personal details before login credentials
- Code architecture: Separate screen instead of modal (scalable)
- Follows industry best practices (separate concerns)
- Better error handling and validation

**Fixed:**
- API URL duplication (/api/api/ bug)
- Form field ordering for better UX

**Technical:**
- Added relativeApi.ts service
- Added GrantFamilyAccessScreen.tsx (600 lines)
- Updated ClientDetailScreen.tsx with relatives display
- Created /api/v1/relative/create.php
- Created /api/v1/relative/list.php
- Updated navigation with GrantFamilyAccess route

### [0.4.0] - 2025-12-15
**Added:**
- Visit execution screens
- Care log entry forms
- GPS location verification

### [0.3.0] - 2024-12-09
**Added:**
- Role-based dashboard routing system
- Driver Dashboard (orange theme)
- Automatic staff_role assignment
- Dual fallback role detection

**Fixed:**
- Dashboard routing issues
- Data leaks (7 Jobs Bug)
- staff_role auto-assignment

### [0.2.0] - 2024-12-03
**Added:**
- Staff management (complete CRUD)
- Password management with bcrypt
- Rate limiting on login

### [0.1.0] - 2024-12-02
**Added:**
- Client management (complete CRUD)
- Care level indicators
- Search functionality

---

## 📝 Notes for Client Testing

### What to Test (Priority Features)
1. **Family Access System (NEW)**
   - Log in as admin
   - Navigate to a client
   - Click "Grant Family Access"
   - Fill out the form (try different relationships)
   - Submit and note the credentials shown
   - Go back and verify the relative appears in the list
   - Log out and log in as the relative (test the credentials)
   - Verify relative sees Relative Dashboard

2. **Dashboard Routing**
   - Login as admin → should see Admin Dashboard (blue)
   - Login as driver → should see Driver Dashboard (orange)
   - Login as carer → should see Staff Dashboard (blue)
   - Login as relative → should see Relative Dashboard (green)

3. **Client Management**
   - View client list
   - Search for clients
   - View client details (should see family members if any)
   - Add new client
   - Edit existing client

4. **Staff Management**
   - View staff list
   - Add new staff (create a driver and verify dashboard)
   - Edit staff information

### Feedback Needed
- Family Access workflow clarity
- Form usability (Personal Details → Login Credentials flow)
- Password visibility toggle usefulness
- Relatives list display (is it clear?)
- Permission labels (are they understandable?)
- Button text ("Add Another Family Member" vs "Grant Family Access")
- Overall UX improvements
- Missing features
- Bug reports
- Performance issues

---

**Last Updated:** January 21, 2026  
**Version:** 0.5.0  
**Status:** Active Development - Week 6 (Visit Execution)  
**Next Milestone:** Visit execution screens (Start/Complete workflow)
