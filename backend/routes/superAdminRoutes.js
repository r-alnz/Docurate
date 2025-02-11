import express from 'express';
import {
    createOrganization,
    createAdminAccount,
    getOrganizations,
    getAdminAccounts,
    editAdminAccount,
    deleteAdminAccount
} from '../controllers/superAdminController.js';
import { authToken, requireSuperAdmin } from '../middleware/auth.js';

const router = express.Router();

// Super Admin actions
router.post('/organizations', authToken, requireSuperAdmin, createOrganization); // Create Organization
router.post('/admins', authToken, requireSuperAdmin, createAdminAccount);        // Create Admin Account

router.get('/organizations', authToken, requireSuperAdmin, getOrganizations);    // Get All Organizations
router.get('/admins', authToken, requireSuperAdmin, getAdminAccounts);           // Get All Admin Accounts

router.put('/admins/:id', authToken, editAdminAccount);
router.delete('/admins/:id', authToken, deleteAdminAccount);
export default router;
