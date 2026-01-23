# Deploy Backend Fixes to Hostinger

## The Problem

You've edited the backend files **locally** on your computer, but your React Native app is calling the **live Hostinger server** (`https://albiscare.co.uk/api/`), which still has the OLD code.

## Files That Need Uploading

You need to upload these 3 files to your Hostinger server:

### 1. permissions.php
**Local File:** `backend/v1/includes/permissions.php`
**Upload To:** `public_html/api/v1/includes/permissions.php`

### 2. staff/index.php
**Local File:** `backend/v1/staff/index.php`
**Upload To:** `public_html/api/v1/staff/index.php`

### 3. clients/index.php
**Local File:** `backend/v1/clients/index.php`
**Upload To:** `public_html/api/v1/clients/index.php`

---

## How to Upload to Hostinger

### Method 1: Hostinger File Manager (Easiest)

1. **Login to Hostinger hPanel**
   - Go to: https://hpanel.hostinger.com
   - Login with your credentials

2. **Open File Manager**
   - Click on "File Manager" in your hosting dashboard
   - Navigate to: `public_html/api/v1/`

3. **Upload permissions.php**
   - Navigate to: `public_html/api/v1/includes/`
   - Find existing `permissions.php` file
   - Right-click → "Edit" or "Delete" (to replace)
   - Click "Upload" button
   - Select your local file: `backend/v1/includes/permissions.php`
   - Confirm upload

4. **Upload staff/index.php**
   - Navigate to: `public_html/api/v1/staff/`
   - Find existing `index.php` file
   - Replace with your local: `backend/v1/staff/index.php`

5. **Upload clients/index.php**
   - Navigate to: `public_html/api/v1/clients/`
   - Find existing `index.php` file
   - Replace with your local: `backend/v1/clients/index.php`

---

### Method 2: FTP Client (FileZilla)

If you prefer using FTP:

1. **Download FileZilla** (if you don't have it)
   - https://filezilla-project.org/

2. **Get FTP Credentials from Hostinger**
   - Go to hPanel → File Manager
   - Look for "FTP Accounts" section
   - Create/view FTP account credentials

3. **Connect to Hostinger**
   - Open FileZilla
   - Host: `ftp.albiscare.co.uk` (or IP from Hostinger)
   - Username: Your FTP username
   - Password: Your FTP password
   - Port: 21
   - Click "Quickconnect"

4. **Upload Files**
   - On the right side (remote), navigate to: `/public_html/api/v1/`
   - On the left side (local), navigate to your project folder
   - Drag and drop the 3 files to their respective folders

---

## Verification After Upload

After uploading, **immediately test** in your React Native app:

### Test 1: Login as Super Admin
```
Email: super_admin@albiscare.com
Password: 123456
```

**Expected:**
- Dashboard loads without errors
- Stats show CORRECT numbers (not 0)
- Console shows:
  ```
  === AdminDashboard: Loading Stats ===
  Client data response: { success: true, data: { total: 12 } }  ← NOT 0!
  Staff data response: { success: true, data: { total: 20 } }   ← NOT 0!
  ```

### Test 2: Click "Manage Staff"

**Expected:**
- Staff list loads (shows 20+ staff members)
- NO "Authorization header missing" error
- Console shows:
  ```
  === API CLIENT REQUEST ===
  Authorization header set: Bearer eb58e63c...
  ==========================
  Staff data response: { success: true, data: { staff: [...] } }
  ```

### Test 3: Click "Manage Clients"

**Expected:**
- Client list loads
- Shows all clients (12+)
- NO "Authorization header missing" error

---

## If Still Not Working After Upload

### Check .htaccess File Exists

Make sure this file exists on Hostinger:
**Location:** `public_html/api/.htaccess`

**Contents:**
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On

    # Fix for Authorization Header (CRITICAL)
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
</IfModule>

Options -Indexes
AddDefaultCharset UTF-8
```

If it doesn't exist, create it using Hostinger File Manager:
1. Navigate to `public_html/api/`
2. Click "New File"
3. Name it: `.htaccess`
4. Edit and paste the content above
5. Save

### Check File Permissions

All PHP files should have permission: **644**

To check/change in Hostinger File Manager:
1. Right-click on the file
2. Select "Permissions" or "Change Permissions"
3. Set to: 644 (rw-r--r--)

### Clear Browser/App Cache

After uploading:
1. Close React Native app completely
2. Clear Metro bundler cache: `npx react-native start --reset-cache`
3. Restart app: `npx react-native run-android` or `npx react-native run-ios`

---

## Alternative: Quick Test to Confirm Upload Worked

You can test directly in your browser (or Postman):

1. **Get your auth token** from app console logs (after login)
2. **Test staff endpoint:**
   ```
   curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
        https://albiscare.co.uk/api/v1/staff/index.php
   ```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "staff": [...],
    "total": 20
  }
}
```

**If you still get "Authorization header missing":**
- The upload didn't work, or
- .htaccess file is missing, or
- Hostinger is caching the old PHP files

---

## Summary

**Problem:** You edited files locally, but app calls live Hostinger server

**Solution:** Upload 3 files to Hostinger:
1. `public_html/api/v1/includes/permissions.php`
2. `public_html/api/v1/staff/index.php`
3. `public_html/api/v1/clients/index.php`

**Verification:** Login as super_admin → Stats should show correct numbers (not 0)

**Time Required:** 5 minutes to upload, 2 minutes to test

---

## Need Help?

If authorization errors persist after upload:
1. Share screenshot of Hostinger File Manager showing the uploaded files
2. Share console logs from React Native app
3. Test the curl command above and share the response
