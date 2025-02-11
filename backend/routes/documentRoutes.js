import express from 'express';
import {
    createDocument,
    getDocumentById,
    updateDocument,
    deleteDocument,
    getDocumentsByUser,
} from '../controllers/documentController.js';
import { authToken, requireUser } from '../middleware/auth.js';

const router = express.Router();

// Routes for document operations
router.post('/', authToken, requireUser, createDocument);
router.get('/:id', authToken, requireUser, getDocumentById);
router.put('/:id', authToken, requireUser, updateDocument);
router.delete('/:id', authToken, requireUser, deleteDocument);
router.get('/user/:userId', authToken, requireUser, getDocumentsByUser);

export default router;
