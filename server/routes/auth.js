import { Router } from 'express';
const router = Router();
import { register, login, verify } from '../controllers/authcontrollers.js';
import  auth  from '../middleware/auth.js';

// Register
router.post('/register', register);

// Login
router.post('/login', login);

// Verify token
router.get('/verify', auth, verify);

export default router; 