import express from 'express';
import { createUserAccount, getUsers, editUserAccount, deleteUserAccount, inactivateUserAccount } from '../controllers/adminController.js';
import { authToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Route for admins to create users
router.post('/users', authToken, requireAdmin, createUserAccount);

// Route for admins to get all users
router.get('/users', authToken, requireAdmin, getUsers);

router.patch('/users/:id', authToken, editUserAccount);
// router.patch('/inactivate/:id', authToken, requireAdmin, inactivateUserAccount);
router.patch('/inactivate/:id', authToken, inactivateUserAccount);
router.delete('/users/:id', authToken, deleteUserAccount);


export default router;
