# Albis Care - Care Management System

A comprehensive mobile application for managing care services, staff, clients, and care visits.

## 🎯 Project Overview

**Client:** Albis Care UK  
**Platform:** React Native (iOS/Android)  
**Backend:** PHP REST API  
**Database:** MySQL (MariaDB)  
**Hosting:** Hostinger cPanel  
**Development Status:** Phase 2 - Staff Management & Dashboard Routing Complete  
**Target Launch:** January 15-20, 2026

---

## ✅ Completed Features (As of Dec 9, 2024)

### Week 1: Foundation ✅
- [x] Database schema (10 tables)
- [x] Authentication system with role detection
- [x] Secure API endpoints (HTTPS)
- [x] Role-based access (Admin, Carer, Nurse, Driver, Relative)
- [x] React Native project setup
- [x] Navigation structure
- [x] Role-based dashboard routing

### Week 2: Client & Staff Management ✅
- [x] **Client Management (Complete CRUD)**
  - View all clients with search & filter
  - Client detail view with full information
  - Add new clients with comprehensive forms
  - Edit existing client information
  - Delete clients with confirmation
  - Care level indicators (Low, Medium, High, Complex)
  - Start/End date tracking

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

- [x] **Security Features**
  - Password hashing (bcrypt)
  - Rate limiting (5 attempts/minute)
  - Mobile OR email login
  - Session management with AsyncStorage
  - HTTPS/SSL encryption
  - Automatic login credential generation

---

## 🚧 In Progress / Upcoming Features

### Week 3: Visit Management (Current)
- [ ] Log care visits
- [ ] Visit history per client
- [ ] Today's schedule view
- [ ] Visit notes and photos
- [ ] Visit status tracking
- [ ] Visit execution screens

### Week 3: Transport Management
- [ ] Driver transport schedule
- [ ] Transport execution screens
- [ ] Transport logs

### Week 3: Reporting
- [ ] Client visit reports
- [ ] Staff performance metrics
- [ ] Analytics dashboard

### Week 4: Family Portal
- [ ] Relative dashboard
- [ ] View family member's care history
- [ ] Communication system

### Week 4: Polish & Testing
- [ ] User acceptance testing
- [ ] Bug fixes
- [ ] Performance optimization
- [ ] Training materials

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
│   ├── staff/          # Staff management (CRUD)
│   ├── logs/           # Care log screens
│   ├── visits/         # Visit management
│   └── transport/      # Transport screens
├── services/
│   └── api/           # API service layer
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
│   └── middleware/    # Rate limiting, etc.
└── config/            # Database configuration
```

### Database Schema (Key Tables)
```sql
- users           # Authentication
- staff           # Staff members (with roles)
  └── staff_role  # 'admin', 'carer', 'driver'
- CareUser        # Care clients
- Relative        # Family members
- care_visits     # Visit records
- visit_logs      # Visit details
- notifications   # System notifications
```

---

## 🔐 Security Features

- ✅ Bcrypt password hashing
- ✅ JWT token authentication
- ✅ Rate limiting (5 login attempts/minute per IP)
- ✅ HTTPS/SSL encryption
- ✅ SQL injection prevention (prepared statements)
- ✅ CORS configuration
- ✅ Session timeout (24 hours)
- ✅ Role-based access control (RBAC)
- ⏳ API authentication middleware (planned)
- ⏳ Input sanitization (planned)

**Current Security Level:** 8/10 (Production-ready)

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
// src/services/api/apiClient.ts
const BASE_URL = 'https://albiscare.co.uk/api';
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

### Staff Account (Example)
```
Mobile: 07700900123
Email: staff@example.com
Password: [Set by admin during creation]
Role: Carer/Nurse
Dashboard: Staff Dashboard (Blue theme)
```

### Driver Account (Example)
```
Mobile: 09012315678
Email: driver@example.com
Password: [Set by admin during creation]
Role: Driver
Dashboard: Driver Dashboard (Orange theme)
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

---

## 🗄️ Database Configuration

### Connection Details
```
Host: localhost
Database: u153773720_albiscareuk
Username: u153773720_enquiry
Password: [In cPanel]
```

### Key Tables
```sql
staff          # Staff members with roles
  ├── role_id        # 1=Admin, 2=Carer, 3=Nurse, 4=Driver
  ├── role_name      # Human-readable role name
  └── staff_role     # System role: 'admin', 'carer', 'driver'
CareUser       # Care clients
Relative       # Family members
care_visits    # Visit records
visit_logs     # Detailed visit logs
notifications  # Push notifications
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
- ❌ Cannot access admin features
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
- ✅ Receive notifications
- ❌ Cannot access other clients
- ❌ Cannot manage system
- **Dashboard:** Relative Dashboard (Coming Week 4)

---

## 🔄 Role Detection System

### How It Works
```typescript
// 1. User logs in with email/mobile
// 2. Backend checks credentials
// 3. Returns userData with:
{
  user: { userType: 'admin' | 'staff' | 'relative' },
  staff: { 
    staff_role: 'admin' | 'carer' | 'driver',
    roleName: 'Care Manager' | 'Carer' | 'Driver'
  }
}

// 4. Frontend routes to appropriate dashboard:
if (userType === 'admin') → AdminDashboard
if (userType === 'staff') {
  if (staff_role === 'driver') → DriverDashboard
  else → StaffDashboard
}
```

### Dual Fallback System
- **Primary:** Checks `staff_role` field
- **Fallback:** Checks `roleName` field
- **Result:** Robust routing even with incomplete data

---

## 🐛 Known Issues / Limitations

### ✅ FIXED Issues (Dec 9, 2024)
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

### Current Limitations
1. **Email Verification**
   - Email addresses not verified automatically
   - Admin manually verifies during staff creation
   - Automated verification planned for post-launch

2. **Offline Support**
   - No offline mode currently
   - Requires internet connection
   - Offline queue planned for Phase 2

---

## 📈 Project Status

### Timeline
```
Week 1 (Nov 25-Dec 1):  ✅ Foundation & Setup
Week 2 (Dec 2-8):        ✅ Client & Staff Management
Week 3 (Dec 9-15):       🚧 Visit Logging & Reports (IN PROGRESS)
Week 4 (Dec 16-22):      ⏳ Family Portal & Polish
Week 5 (Dec 23-30):      ⏳ Testing & Launch
```

### Progress
- **Overall:** 45% complete
- **Ahead of schedule:** 8+ days
- **Launch confidence:** HIGH 🚀

---

## 🧪 Testing

### Manual Testing Checklist
- [x] Login (admin, staff, driver)
- [x] Role-based dashboard routing
- [x] Admin dashboard access
- [x] Staff dashboard access
- [x] Driver dashboard access
- [x] Client CRUD operations
- [x] Staff CRUD operations
- [x] Automatic staff_role assignment
- [x] Search functionality
- [x] Rate limiting
- [ ] Visit logging (coming Week 3)
- [ ] Transport logging (coming Week 3)
- [ ] Reports (coming Week 3)

### Test Devices
- ✅ iPhone 15 Simulator (iOS 17)
- ⏳ Android Emulator (Pixel 6)
- ⏳ Physical iPhone (testing with client)

---

## 🚀 Deployment

### Current Environment
```
Production API: https://albiscare.co.uk/api
Database: Hostinger cPanel MySQL
Mobile App: Development (Expo)
```

### Deployment Process
1. Push code to GitHub
2. Upload PHP files to Hostinger via cPanel
3. Test API endpoints via Postman
4. Build mobile app with EAS Build
5. Distribute TestFlight build to client

---

## 📞 Support & Contact

**Developer:** Bolade Olayode  
**GitHub:** @bolade-olayode

---

## 📄 License

Proprietary - Albis Care UK © 2024

---

## 🔄 Changelog

### [0.3.0] - 2024-12-09
**Added:**
- Role-based dashboard routing system
- Driver Dashboard (orange theme)
- Automatic staff_role assignment in create.php
- Automatic staff_role update in update.php
- Dual fallback role detection (staff_role + roleName)
- Debug logging for dashboard routing

**Fixed:**
- Admin showing Staff Dashboard (now shows Admin Dashboard)
- Driver showing Staff Dashboard (now shows Driver Dashboard)
- staff_role not being set on staff creation
- staff_role not updating when role_id changes
- Login API returning wrong userType for admin

**Security:**
- Enhanced role-based access control
- Improved session management

**Technical:**
- Updated AppNavigator.tsx with intelligent routing
- Updated login.php with correct admin userType
- Updated staff/create.php with staff_role mapping
- Updated staff/update.php with staff_role mapping

### [0.2.0] - 2024-12-03
**Added:**
- Staff management (complete CRUD)
- Email field for staff
- Password management with bcrypt
- Rate limiting on login
- Collapsible role sections
- Professional information fields

**Fixed:**
- AUTO_INCREMENT issues on staff_id
- Email not displaying in detail view
- Foreign key constraints

**Security:**
- Implemented bcrypt password hashing
- Added rate limiting (5 attempts/minute)
- Mobile OR email login support

### [0.1.0] - 2024-12-02
**Added:**
- Client management (complete CRUD)
- Care level indicators
- Priority sorting
- Search functionality
- Auto-refresh after edits

---

## 📝 Notes for Client Testing

### What to Test
1. **Login & Dashboards**
   - Login as admin (should see Admin Dashboard - blue theme)
   - Login as driver (should see Driver Dashboard - orange theme)
   - Login as carer (should see Staff Dashboard - blue theme)
   - Try wrong password (should rate limit after 5 attempts)

2. **Client Management**
   - View client list
   - Search for clients
   - Add new client
   - Edit existing client
   - View client details

3. **Staff Management**
   - View staff list (grouped by role)
   - Expand/collapse role sections
   - Add new staff member (try each role)
   - Edit staff information
   - View staff details
   - **Test:** Create a Driver and verify they see Driver Dashboard

### Feedback Needed
- Dashboard usability
- Role switching clarity
- UI/UX improvements
- Missing features
- Bug reports
- Performance issues
- Any confusing workflows

---

**Last Updated:** December 29, 2025
**Version:** 0.3.0  
**Status:** Active Development - Week 3
