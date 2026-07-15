-- DATABASE SCHEMA FOR SECURE AUTHENTICATION
-- Database: gatekeep_db

-- ============================================================================
-- HOW TO HASH PASSWORDS USING BCRYPT (Senior Dev Guidelines)
-- ============================================================================
-- 1. Never store plain-text passwords.
-- 2. bcrypt is a slow/adaptive hashing function specifically designed for password security.
-- 3. How bcrypt works:
--    a. Salt Generation: A random string of characters (salt) is generated.
--    b. Salt Prepended: The salt is combined with the user's password.
--    c. Hashing: The combined string is hashed using a computationally heavy algorithm.
--    d. Work Factor (Rounds): bcrypt uses a work factor (typically 10-12) representing the number of iterations (2^rounds). Higher numbers increase computation time, mitigating brute-force attacks.
--    e. Output String: The final database field contains the work factor, salt, and resulting hash together, structured like:
--       $2b$[rounds]$[22-char-salt][31-char-hash] (e.g., $2b$10$nOuT55BtZ....)
-- 4. How to hash in Node.js (Express) code:
--    const bcrypt = require('bcryptjs'); // or 'bcrypt'
--    const saltRounds = 10;
--    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
-- 5. How to verify a password during login:
--    const match = await bcrypt.compare(plainPassword, user.password_hash);
--    if (match) { /* Authenticated */ }
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `gatekeep_db`;
USE `gatekeep_db`;

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
