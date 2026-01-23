<?php
/**
 * ALBIS CARE - Password Hash Generator
 *
 * This utility script generates password hashes for creating admin accounts.
 * Run this script to get a hashed password, then use it in your SQL INSERT statement.
 *
 * Usage:
 *   php generate_password_hash.php
 *   php generate_password_hash.php YourPassword123
 *
 * @version 1.0
 * @date 2026-01-22
 */

// Check if password provided as command line argument
if (isset($argv[1])) {
    $password = $argv[1];
} else {
    // Prompt for password if not provided
    echo "Enter password to hash: ";
    $password = trim(fgets(STDIN));
}

// Validate password
if (empty($password)) {
    die("Error: Password cannot be empty.\n");
}

if (strlen($password) < 8) {
    echo "Warning: Password is less than 8 characters. This is not recommended.\n";
}

// Generate hash
$hash = password_hash($password, PASSWORD_DEFAULT);

// Display results
echo "\n";
echo "========================================\n";
echo "Password Hash Generated Successfully!\n";
echo "========================================\n";
echo "\n";
echo "Password: " . str_repeat('*', strlen($password)) . "\n";
echo "Hash:     " . $hash . "\n";
echo "\n";
echo "========================================\n";
echo "SQL Query to Create Super Admin:\n";
echo "========================================\n";
echo "\n";
echo "INSERT INTO users (email, password, userType, is_super_admin, is_admin, created_at)\n";
echo "VALUES (\n";
echo "  'superadmin@albiscare.co.uk',  -- Change this email\n";
echo "  '" . $hash . "',\n";
echo "  'admin',\n";
echo "  1,  -- is_super_admin\n";
echo "  1,  -- is_admin\n";
echo "  NOW()\n";
echo ");\n";
echo "\n";
echo "========================================\n";
echo "IMPORTANT NOTES:\n";
echo "========================================\n";
echo "1. Change the email address in the SQL query above\n";
echo "2. Keep this password hash secure\n";
echo "3. Do not commit this file with passwords to version control\n";
echo "4. After creating the super admin, delete this file or clear the terminal history\n";
echo "\n";
