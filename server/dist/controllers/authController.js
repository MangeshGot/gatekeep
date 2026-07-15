"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../config/db"));
// Register a new user
const register = async (req, res) => {
    const { username, email, password } = req.body;
    // Basic validation
    if (!username || !email || !password) {
        res.status(400).json({ message: 'All fields (username, email, password) are required.' });
        return;
    }
    // Basic email formatting validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        res.status(400).json({ message: 'Please enter a valid email address.' });
        return;
    }
    // Password length validation
    if (password.length < 6) {
        res.status(400).json({ message: 'Password must be at least 6 characters long.' });
        return;
    }
    try {
        // Check if user already exists
        const [existingUsers] = await db_1.default.query('SELECT id FROM users WHERE email = ? OR username = ?', [email, username]);
        if (existingUsers.length > 0) {
            res.status(400).json({ message: 'Username or email is already registered.' });
            return;
        }
        // Hash the password using bcryptjs
        const saltRounds = 10;
        const hashedPassword = await bcryptjs_1.default.hash(password, saltRounds);
        // Insert user into database
        const [result] = await db_1.default.query('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)', [username, email, hashedPassword]);
        res.status(201).json({
            message: 'User registered successfully.',
            userId: result.insertId,
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error during registration.' });
    }
};
exports.register = register;
// Login user and return JWT
const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required.' });
        return;
    }
    try {
        // Query user by email
        const [users] = await db_1.default.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            // Use generic error message for security
            res.status(400).json({ message: 'Invalid email or password.' });
            return;
        }
        const user = users[0];
        // Verify hashed password using bcrypt.compare
        const isPasswordMatch = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!isPasswordMatch) {
            res.status(400).json({ message: 'Invalid email or password.' });
            return;
        }
        // Generate JWT
        const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_change_me_in_production_12345';
        const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
        const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        res.status(200).json({
            message: 'Login successful.',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
            },
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error during login.' });
    }
};
exports.login = login;
// Fetch current authenticated user's details
const getMe = async (req, res) => {
    if (!req.user) {
        res.status(401).json({ message: 'Access denied. User session not found.' });
        return;
    }
    try {
        const [users] = await db_1.default.query('SELECT id, username, email, created_at FROM users WHERE id = ?', [req.user.id]);
        if (users.length === 0) {
            res.status(404).json({ message: 'User not found.' });
            return;
        }
        res.status(200).json({
            user: users[0],
        });
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Internal server error fetching user profile.' });
    }
};
exports.getMe = getMe;
