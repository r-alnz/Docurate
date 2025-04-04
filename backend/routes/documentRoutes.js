// documentRoutes.js - Add routes for recover and erase
import express from 'express';
import {
    createDocument,
    getDocumentById,
    updateDocument,
    deleteDocument,
    recoverDocument,
    eraseDocument,
    getDocumentsByUser,
} from '../controllers/documentController.js';
import { authToken, requireUser } from '../middleware/auth.js';

const router = express.Router();

// Routes for document operations
router.post('/', authToken, requireUser, createDocument);
router.get('/:id', authToken, requireUser, getDocumentById);
router.put('/:id', authToken, requireUser, updateDocument);
router.delete('/:id', authToken, requireUser, deleteDocument); // Now soft delete
router.put('/recover/:id', authToken, requireUser, recoverDocument); // New route for recovery
router.delete('/erase/:id', authToken, requireUser, eraseDocument); // New route for permanent deletion
router.get('/user/:userId', authToken, requireUser, getDocumentsByUser);

export default router;