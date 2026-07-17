import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../config/db';
import { AuthRequest } from '../types';

// Register a new user
export const register = async (req: Request, res: Response): Promise<void> => {
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
    const [existingUsers] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUsers.length > 0) {
      res.status(400).json({ message: 'Username or email is already registered.' });
      return;
    }

    // Hash the password using bcryptjs
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user into database
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    res.status(201).json({
      message: 'User registered successfully.',
      userId: result.insertId,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error during registration.' });
  }
};

// Login user and return JWT
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: 'Email and password are required.' });
    return;
  }

  try {
    // Query user by email
    const [users] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      // Use generic error message for security
      res.status(400).json({ message: 'Invalid email or password.' });
      return;
    }

    const user = users[0];

    // Verify hashed password using bcrypt.compare
    const isPasswordMatch = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordMatch) {
      res.status(400).json({ message: 'Invalid email or password.' });
      return;
    }

    // Generate JWT
    const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_change_me_in_production_12345';
    const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as any }
    );

    res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error during login.' });
  }
};

// Fetch current authenticated user's details
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: 'Access denied. User session not found.' });
    return;
  }

  try {
    const [users] = await pool.query<RowDataPacket[]>(
      'SELECT id, username, email, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    res.status(200).json({
      user: users[0],
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Internal server error fetching user profile.' });
  }
};

// Check database connection status dynamically
export const getDbStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const connection = await pool.getConnection();
    connection.release();
    res.status(200).json({ connected: true });
  } catch (error: any) {
    console.error('DB Status check error:', error);
    res.status(200).json({ connected: false, message: error.message || 'Unable to connect to database' });
  }
};
