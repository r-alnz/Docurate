import express from 'express';
import { authToken } from '../middleware/auth.js';
import { getOrgUsers } from '../controllers/orgController.js';

const router = express.Router();

router.get('/org-users', authToken, getOrgUsers);

export default router;
