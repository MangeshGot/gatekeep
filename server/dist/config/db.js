"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDbConnection = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
const pool = promise_1.default.createPool({
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
const checkDbConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Successfully connected to the MySQL database pool.');
        connection.release();
        return true;
    }
    catch (error) {
        console.error('Failed to connect to the database:', error);
        return false;
    }
};
exports.checkDbConnection = checkDbConnection;
exports.default = pool;
