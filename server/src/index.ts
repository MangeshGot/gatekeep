import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import { checkDbConnection } from './config/db';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS with support for headers and credentials
app.use(cors({
  origin: 'http://localhost:5173', // Default Vite port
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json());

// Main Auth Routes
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Start Express server and check Database Connection
const startServer = async () => {
  console.log('Starting server...');
  await checkDbConnection();
  
  app.listen(PORT, () => {
    console.log(`Server is running in development mode on port ${PORT}`);
    console.log(`Health check available at http://localhost:${PORT}/health`);
  });
};

startServer();
