# Albis Care - Care Management System

A comprehensive mobile application for managing care services, staff, clients, and care visits.

## 🎯 Project Overview

**Client:** Albis Care UK
**Platform:** React Native / Expo (iOS & Android)
**Backend:** PHP REST API
**Database:** MySQL (MariaDB)
**Hosting:** Hostinger cPanel
**API URL:** https://albiscare.co.uk/api
**Version:** 1.0.0
**Last Updated:** February 4, 2026

---

## ✅ Features

### Authentication & Security
- [x] Role-based authentication (6 user types)
- [x] JWT token authentication
- [x] Bcrypt password hashing
- [x] Rate limiting (5 attempts/minute)
- [x] HTTPS/SSL encryption
- [x] Session management with AsyncStorage
- [x] Change password functionality
- [x] Secure password requirements

### Dashboards (Role-Based)
- [x] **Super Admin Dashboard** - Full system access
- [x] **Admin Dashboard** - Care management
- [x] **Care Manager Dashboard** - Staff & client oversight
- [x] **Staff Dashboard** - Visit execution (Green theme)
- [x] **Driver Dashboard** - Transport management (Orange theme)
- [x] **Relative Dashboard** - Family portal (Read-only)

### Client Management
- [x] Complete CRUD operations
- [x] Search & filter functionality
- [x] Care level indicators (Low, Medium, High, Complex)
- [x] Client detail views
- [x] Family access management

### Staff Management
- [x] Complete CRUD operations
- [x] Role-based grouping
- [x] Automatic staff_role assignment
- [x] Professional info (PVG, SSSC numbers)
- [x] Emergency contact management

### Visit Management
- [x] Schedule visits
- [x] Visit list with filtering (Today, Upcoming, Completed, Missed)
- [x] Visit detail view
- [x] Visit execution workflow (Start → Complete)
- [x] Care log creation
- [x] Status tracking

### Transport Management
- [x] Transport schedule for drivers
- [x] Transport execution workflow
- [x] Mileage tracking
- [x] Status updates

### Push Notifications 🆕
- [x] Expo Push Notifications integration
- [x] Automatic token registration on login
- [x] Token deactivation on logout
- [x] Visit reminder notifications (cron job)
- [x] Deep linking from notifications
- [x] Multiple device support per user

### Family Portal
- [x] Grant family access to clients
- [x] Permission-based access control
- [x] View care visit history
- [x] Receive care updates (notifications)

---

## 🏗️ Technical Architecture

### Frontend Stack
```
React Native + Expo SDK 53
TypeScript
React Navigation 6
Axios for API calls
AsyncStorage for persistence
Expo Notifications
```

### Backend Stack
```
PHP 8.x
MySQL/MariaDB
JWT Authentication
PDO for database
Expo Push API integration
```

### Project Structure
```
src/
├── components/          # Reusable UI components
├── config/              # API configuration
├── navigation/          # App navigation
│   └── AppNavigator.tsx
├── screens/
│   ├── auth/            # Login
│   ├── dashboard/       # 6 role-based dashboards
│   ├── clients/         # Client management
│   ├── staff/           # Staff management
│   ├── visits/          # Visit management
│   ├── transport/       # Transport management
│   ├── logs/            # Care logs
│   ├── profile/         # User profile & settings
│   └── admin/           # Admin settings
├── services/
│   ├── api/             # API service layer
│   └── notificationService.ts
└── types/               # TypeScript definitions
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (Mac) or Android Studio
- Expo Go app (for testing)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd my-app

# Install dependencies
npm install

# Start development server
npx expo start

# Run on device
# Press 'i' for iOS Simulator
# Press 'a' for Android Emulator
# Scan QR code with Expo Go on physical device
```

### Environment Configuration
The API is configured in `src/config/api.ts`:
```typescript
export const API_CONFIG = {
  BASE_URL: 'https://albiscare.co.uk/api',
  TIMEOUT: 30000,
};
```

---

## 📡 API Endpoints

### Base URL
```
https://albiscare.co.uk/api/v1
```

### Authentication
- `POST /auth/login.php` - User login

### Clients
- `GET /clients/` - List all clients
- `GET /clients/get.php?id={id}` - Get client details
- `POST /clients/create.php` - Create client
- `PUT /clients/update.php?id={id}` - Update client
- `DELETE /clients/delete.php?id={id}` - Delete client

### Staff
- `GET /staff/` - List all staff
- `GET /staff/get.php?id={id}` - Get staff details
- `POST /staff/create.php` - Create staff
- `PUT /staff/update.php?id={id}` - Update staff
- `DELETE /staff/delete.php?id={id}` - Delete staff

### Visits
- `GET /visits/` - List visits
- `POST /visits/create.php` - Schedule visit
- `PUT /visits/update.php?id={id}` - Update visit
- `PUT /visits/start.php` - Start visit execution
- `PUT /visits/complete.php` - Complete visit

### Notifications
- `POST /notifications/register-token.php` - Register push token
- `POST /notifications/unregister-token.php` - Deactivate push token

### Cron Jobs
- `GET /cron/send-visit-reminders.php?key={key}` - Send visit reminders

---

## 🔐 Security Features

- ✅ Bcrypt password hashing
- ✅ UUID-based user identification
- ✅ JWT token authentication
- ✅ Rate limiting on login
- ✅ HTTPS/SSL encryption
- ✅ SQL injection prevention (prepared statements)
- ✅ CORS configuration
- ✅ Role-based access control (RBAC)
- ✅ Secure session management
- ✅ Password change functionality

---

## 🎨 Design System

### Theme Colors
```
Primary Blue:    #2563eb
Success Green:   #10b981
Warning Orange:  #f59e0b
Error Red:       #ef4444
Background:      #f8fafc
Card:            #ffffff
Border:          #e2e8f0
```

### Dashboard Themes
| Role | Color | Theme |
|------|-------|-------|
| Super Admin | Blue | #2563eb |
| Admin | Blue | #2563eb |
| Care Manager | Blue | #2563eb |
| Staff | Green | #10b981 |
| Driver | Orange | #f59e0b |
| Relative | Blue | #2563eb |

---

## 📱 Building for Production

### Development Build (Recommended for Testing)
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Create development build
eas build --profile development --platform ios
eas build --profile development --platform android
```

### Production Build
```bash
# iOS (App Store)
eas build --profile production --platform ios

# Android (Play Store)
eas build --profile production --platform android
```

---

## 🔔 Push Notifications Setup

Push notifications are configured and ready. The system:
1. Registers device token automatically on login
2. Sends visit reminders via cron job
3. Supports deep linking to specific screens
4. Handles foreground and background notifications

### Cron Job (Hostinger)
Set up cron to run every 15 minutes:
```
*/15 * * * * curl -s "https://albiscare.co.uk/api/cron/send-visit-reminders.php?key=AlbisSecretCron2026"
```

---

## 📞 Support

**Developer:** Bolade Olayode
**Project:** Albis Care Management System
**Client:** Albis Care UK

---

## 📄 License

Proprietary - Albis Care UK © 2026

---

**Version:** 1.0.0
**Status:** Production Ready
**Last Updated:** February 4, 2026
