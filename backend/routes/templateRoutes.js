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
    eraseTemplate,
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
router.delete('/erase/:id', authToken, requireAdmin, eraseTemplate); // Erase template permanently
// router.get('/', authToken, requireAdmin, getTemplates); // Fetch templates based on role and organizatioand
    // > this causes a glitch when a student opens the template list,
    // i.e., returns error when loaded but shows it finally when reloaded

router.get('/', authToken, getTemplates); // Fetch templates for user (admins, students, organizations)

export default router;
