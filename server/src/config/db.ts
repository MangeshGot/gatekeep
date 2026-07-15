import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'gatekeep_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Helper to check connection on startup
export const checkDbConnection = async (): Promise<boolean> => {
  try {
    const connection = await pool.getConnection();
    console.log('Successfully connected to the MySQL database pool.');
    connection.release();
    return true;
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    return false;
  }
};

export default pool;
