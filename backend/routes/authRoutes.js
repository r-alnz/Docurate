import express from 'express';
import { loginUser } from '../controllers/authController.js';
import { getUserDetails, changePassword, resetUserPassword, resetAdminPassword } from '../controllers/authController.js';
import { authToken, requireSuperAdmin } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/auth.js';
const router = express.Router();

// General login route
router.post('/login', loginUser);

router.get('/profile', authToken, getUserDetails);

router.put('/change-password', authToken, changePassword);
router.put('/reset-user-password', authToken, requireAdmin, resetUserPassword);
router.put('/reset-admin-password', authToken, requireSuperAdmin, resetAdminPassword);

export default router;
