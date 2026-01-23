<?php
/**
 * ALBIS CARE - Database Connection
 *
 * This file provides PDO database connection for the API.
 * Adjust the credentials below to match your database configuration.
 *
 * @version 1.0
 * @date 2026-01-22
 */

// Database configuration
define('DB_HOST', 'localhost');        // Change if your database is on a different host
define('DB_NAME', 'albiscare_db');     // Change to your actual database name
define('DB_USER', 'your_db_username'); // Change to your database username
define('DB_PASS', 'your_db_password'); // Change to your database password
define('DB_CHARSET', 'utf8mb4');

// Global PDO instance
$pdo = null;

try {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];

    $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
} catch (PDOException $e) {
    // Log the error (don't expose database details to users)
    error_log("Database Connection Error: " . $e->getMessage());

    // Return generic error to user
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed. Please try again later.'
    ]);
    exit;
}
