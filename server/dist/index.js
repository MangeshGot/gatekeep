"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const db_1 = require("./config/db");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Enable CORS with support for headers and credentials
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173', // Default Vite port
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// Body parser
app.use(express_1.default.json());
// Main Auth Routes
app.use('/api/auth', authRoutes_1.default);
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date() });
});
// Start Express server and check Database Connection
const startServer = async () => {
    console.log('Starting server...');
    await (0, db_1.checkDbConnection)();
    app.listen(PORT, () => {
        console.log(`Server is running in development mode on port ${PORT}`);
        console.log(`Health check available at http://localhost:${PORT}/health`);
    });
};
startServer();
