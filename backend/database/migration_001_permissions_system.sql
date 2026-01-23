-- ============================================================================
-- ALBIS CARE - Permission System Database Migration
-- Version: 1.0
-- Date: 2026-01-22
-- Description: Adds admin hierarchy, permissions table, and audit logging
-- ============================================================================

-- ============================================================================
-- STEP 1: Update users table for admin hierarchy
-- ============================================================================

-- Add admin flags and tracking
ALTER TABLE users
ADD COLUMN is_super_admin TINYINT(1) DEFAULT 0 AFTER userType,
ADD COLUMN is_admin TINYINT(1) DEFAULT 0 AFTER is_super_admin,
ADD COLUMN created_by INT(11) NULL AFTER is_admin,
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER created_by,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

-- Create indexes for performance
CREATE INDEX idx_userType ON users(userType);
CREATE INDEX idx_is_admin ON users(is_admin);
CREATE INDEX idx_is_super_admin ON users(is_super_admin);

-- ============================================================================
-- STEP 2: Create permissions table
-- ============================================================================

CREATE TABLE IF NOT EXISTS permissions (
  permission_id INT(11) AUTO_INCREMENT PRIMARY KEY,
  user_id INT(11) NOT NULL,
  resource VARCHAR(50) NOT NULL COMMENT 'clients, staff, visits, logs, transport, analytics',
  can_view TINYINT(1) DEFAULT 0,
  can_create TINYINT(1) DEFAULT 0,
  can_edit TINYINT(1) DEFAULT 0,
  can_delete TINYINT(1) DEFAULT 0,
  scope VARCHAR(50) DEFAULT 'all' COMMENT 'all, own, assigned, linked',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_resource (user_id, resource)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_user_resource ON permissions(user_id, resource);
CREATE INDEX idx_scope ON permissions(scope);

-- ============================================================================
-- STEP 3: Create audit_log table
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_log (
  audit_id INT(11) AUTO_INCREMENT PRIMARY KEY,
  user_id INT(11) NOT NULL,
  action VARCHAR(50) NOT NULL COMMENT 'create, update, delete, view, login, logout',
  resource VARCHAR(50) NOT NULL COMMENT 'client, staff, visit, log, transport, admin',
  resource_id INT(11) NULL COMMENT 'ID of the affected resource',
  details TEXT NULL COMMENT 'JSON or text details about the action',
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create indexes for efficient querying
CREATE INDEX idx_user_action ON audit_log(user_id, action);
CREATE INDEX idx_resource ON audit_log(resource, resource_id);
CREATE INDEX idx_created_at ON audit_log(created_at);
CREATE INDEX idx_action ON audit_log(action);

-- ============================================================================
-- STEP 4: Insert default permissions for existing users (Optional)
-- ============================================================================
-- This is commented out - you should review and adjust based on your needs
-- Uncomment and modify if you want to set default permissions for existing users

/*
-- Example: Set default permissions for all existing staff
INSERT INTO permissions (user_id, resource, can_view, can_create, can_edit, can_delete, scope)
SELECT id, 'visits', 1, 0, 0, 0, 'assigned' FROM users WHERE userType = 'staff'
ON DUPLICATE KEY UPDATE can_view = 1, scope = 'assigned';

INSERT INTO permissions (user_id, resource, can_view, can_create, can_edit, can_delete, scope)
SELECT id, 'logs', 1, 1, 0, 0, 'own' FROM users WHERE userType = 'staff'
ON DUPLICATE KEY UPDATE can_view = 1, can_create = 1, scope = 'own';

-- Example: Set default permissions for relatives
INSERT INTO permissions (user_id, resource, can_view, can_create, can_edit, can_delete, scope)
SELECT id, 'visits', 1, 0, 0, 0, 'linked' FROM users WHERE userType = 'relative'
ON DUPLICATE KEY UPDATE can_view = 1, scope = 'linked';

INSERT INTO permissions (user_id, resource, can_view, can_create, can_edit, can_delete, scope)
SELECT id, 'logs', 1, 0, 0, 0, 'linked' FROM users WHERE userType = 'relative'
ON DUPLICATE KEY UPDATE can_view = 1, scope = 'linked';
*/

-- ============================================================================
-- STEP 5: Create your first Super Admin (MANUAL STEP)
-- ============================================================================
-- IMPORTANT: Replace the values below with your actual super admin details
-- Password should be hashed using password_hash() in PHP

/*
INSERT INTO users (email, password, userType, is_super_admin, is_admin, created_at)
VALUES (
  'superadmin@albiscare.co.uk',
  '$2y$10$YOUR_HASHED_PASSWORD_HERE',  -- Use PHP: password_hash('your_password', PASSWORD_DEFAULT)
  'admin',
  1,  -- is_super_admin
  1,  -- is_admin
  NOW()
);
*/

-- ============================================================================
-- VERIFICATION QUERIES (Run these to check migration success)
-- ============================================================================

-- Check if new columns were added to users table
-- SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME IN ('is_super_admin', 'is_admin', 'created_by');

-- Check if permissions table exists
-- SELECT COUNT(*) FROM permissions;

-- Check if audit_log table exists
-- SELECT COUNT(*) FROM audit_log;

-- ============================================================================
-- ROLLBACK SCRIPT (Use this to undo the migration if needed)
-- ============================================================================

/*
-- WARNING: This will delete all permission and audit data!

DROP TABLE IF EXISTS audit_log;
DROP TABLE IF EXISTS permissions;

ALTER TABLE users
DROP COLUMN is_super_admin,
DROP COLUMN is_admin,
DROP COLUMN created_by,
DROP COLUMN created_at,
DROP COLUMN updated_at;

DROP INDEX idx_userType ON users;
DROP INDEX idx_is_admin ON users;
DROP INDEX idx_is_super_admin ON users;
*/

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
