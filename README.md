# Albis Care - Care Management System READM.md

A comprehensive mobile application for managing care services, staff, clients, and care visits.

## 🎯 Project Overview

**Client:** Albis Care UK  
**Platform:** React Native (iOS/Android)  
**Backend:** PHP REST API  
**Database:** MySQL (MariaDB)  
**Hosting:** Hostinger cPanel  
**Development Status:** Phase 2 - Staff Management Complete  
**Target Launch:** December 27-30, 2024

---

## ✅ Completed Features (As of Dec 3, 2024)

### Week 1: Foundation ✅
- [x] Database schema (10 tables)
- [x] Authentication system (JWT tokens)
- [x] Secure API endpoints (HTTPS)
- [x] Role-based access (Admin, Carer, Nurse, Driver, Relative)
- [x] React Native project setup
- [x] Navigation structure

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

- [x] **Security Features**
  - Password hashing (bcrypt)
  - Rate limiting (5 attempts/minute)
  - Mobile OR email login
  - Session management with AsyncStorage
  - HTTPS/SSL encryption

---

## 🚧 In Progress / Upcoming Features

### Week 3: Visit Management (Next)
- [ ] Log care visits
- [ ] Visit history per client
- [ ] Today's schedule view
- [ ] Visit notes and photos
- [ ] Visit status tracking

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
│   └── AppNavigator.tsx
├── screens/
│   ├── auth/           # Login screens
│   ├── dashboard/      # Role-based dashboards
│   ├── clients/        # Client management
│   └── staff/          # Staff management
├── services/
│   └── api/           # API service layer
└── types/             # TypeScript type definitions
```

### Backend (PHP)
```
public_html/api/
├── v1/
│   ├── auth/          # Authentication endpoints
│   ├── clients/       # Client CRUD operations
│   ├── staff/         # Staff CRUD operations
│   └── middleware/    # Rate limiting, etc.
└── config/            # Database configuration
```

### Database Schema (Key Tables)
```sql
- users           # Authentication
- staff           # Staff members (with roles)
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
- ✅ Rate limiting (5 login attempts/minute)
- ✅ HTTPS/SSL encryption
- ✅ SQL injection prevention (prepared statements)
- ✅ CORS configuration
- ✅ Session timeout (24 hours)
- ⏳ API authentication middleware (planned)
- ⏳ Input sanitization (planned)

**Current Security Level:** 7/10 (Good for MVP)

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
const BASE_URL = 'https://api.albiscare.co.uk/api';
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
```

### Staff Account (Example)
```
Mobile: 07700900123
Password: [Set by admin]
Role: Carer/Nurse/Driver
```

---

## 📡 API Endpoints

### Base URL
```
https://api.albiscare.co.uk/api/v1
```

### Authentication
- `POST /auth/login` - User login (rate limited)

### Clients
- `GET /clients/` - List all clients
- `GET /clients/get.php?id={id}` - Get single client
- `POST /clients/create.php` - Create client
- `PUT /clients/update.php?id={id}` - Update client
- `DELETE /clients/delete.php?id={id}` - Delete client

### Staff
- `GET /staff/` - List all staff
- `GET /staff/get.php?id={id}` - Get single staff
- `POST /staff/create.php` - Create staff
- `PUT /staff/update.php?id={id}` - Update staff
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
Warning Yellow: #f59e0b
Error Red: #ef4444
Background: #f8fafc
Card Background: #ffffff
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

### Carer / Nurse
- ✅ View assigned clients
- ✅ Log care visits
- ✅ View today's schedule
- ✅ Update visit notes
- ❌ Cannot manage staff
- ❌ Cannot access admin features

### Driver
- ✅ View transport schedule
- ✅ Log transport visits
- ❌ Limited client access

### Relative (Family)
- ✅ View family member's care
- ✅ See visit history
- ✅ Receive notifications
- ❌ Cannot access other clients
- ❌ Cannot manage system

---

## 🐛 Known Issues / Limitations

1. **Staff Dashboard Name Display**
   - Staff name not showing in header (will fix in Week 3)
   - Workaround: Shows role badge correctly

2. **Email Verification**
   - Email addresses not verified automatically
   - Admin manually verifies during staff creation
   - Automated verification planned for post-launch

3. **Offline Support**
   - No offline mode currently
   - Requires internet connection
   - Offline queue planned for Phase 2

---

## 📈 Project Status

### Timeline
```
Week 1 (Nov 25-Dec 1):  ✅ Foundation & Setup
Week 2 (Dec 2-8):        ✅ Client & Staff Management (90% complete)
Week 3 (Dec 9-15):       🚧 Visit Logging & Reports
Week 4 (Dec 16-22):      ⏳ Family Portal & Polish
Week 5 (Dec 23-30):      ⏳ Testing & Launch
```

### Progress
- **Overall:** 40% complete
- **Ahead of schedule:** 7+ days
- **Launch confidence:** HIGH 🚀

---

## 🧪 Testing

### Manual Testing Checklist
- [x] Login (admin & staff)
- [x] Client CRUD operations
- [x] Staff CRUD operations
- [x] Search functionality
- [x] Role-based navigation
- [x] Rate limiting
- [ ] Visit logging (coming Week 3)
- [ ] Reports (coming Week 3)

### Test Devices
- ✅ iPhone 15 Simulator (iOS 17)
- ⏳ Android Emulator (Pixel 6)
- ⏳ Physical iPhone (testing with client)

## 🚀 Deployment

### Current Environment
```
Production API: https://api.albiscare.co.uk
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

## 📄 License

Proprietary - Albis Care UK © 2024

---

## 🔄 Changelog

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


## 📝 Notes for Client Testing

### What to Test
1. **Login**
   - Use provided test credentials
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
   - Add new staff member
   - Edit staff information
   - View staff details

### Feedback Needed
- UI/UX improvements
- Missing features
- Bug reports
- Performance issues
- Any confusing workflows


**Last Updated:** December 3, 2024  
**Version:** 0.2.0  
**Status:** Active Development