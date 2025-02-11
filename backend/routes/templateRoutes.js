import express from 'express';
import {
    createTemplate,
    getTemplates,
    getActiveTemplates,
    getTemplateById,
    updateTemplate,
    deleteTemplate,
    recoverTemplate,
    fetchDecisionTree,
    getTemplateHeaderById,
} from '../controllers/templateController.js';
import { authToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router(); 

// Shared route for admins and users
router.get('/decision-tree', authToken, fetchDecisionTree); // Fetch decision tree for a template
router.get('/active', authToken, getActiveTemplates); // Fetch active templates
router.get('/:id', authToken, getTemplateById); // Fetch specific template by ID
router.get('/headers/:id', authToken, getTemplateHeaderById); // Fetch specific template by ID

// Admin-only routes
router.post('/', authToken, requireAdmin, createTemplate); // Create template
router.put('/:id', authToken, requireAdmin, updateTemplate); // Update template
router.delete('/:id', authToken, requireAdmin, deleteTemplate); // Delete template
router.put('/recover/:id', authToken, requireAdmin, recoverTemplate); // Recover deleted template
router.get('/', authToken, requireAdmin, getTemplates); // Fetch templates based on role and organization



export default router;
