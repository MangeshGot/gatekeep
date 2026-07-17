import { Router } from 'express';
import { register, login, getMe, getDbStatus } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken as any, getMe as any);
router.get('/db-status', getDbStatus);

export default router;
