// documentController.js - Add soft delete, recover, and erase functions
import Document from '../models/documentModel.js';
import Template from '../models/templateModel.js';
import DocumentRevision from "../models/documentRevisionModel.js"

// Create a new document
const createDocument = async (req, res) => {
    try {
        const { title, template, content } = req.body;

        if (!title || !template || !content) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Check if a document with the same title already exists for this user
        const existingDocument = await Document.findOne({ 
            title: title,
            user: req.user._id,
            status: 'active' // Only check active documents
        });

        if (existingDocument) {
            return res.status(400).json({ 
                message: 'A document with this title already exists. Please choose a different title.' 
            });
        }

        const document = new Document({
            title,
            template,
            organization: req.user.organization,
            content,
            user: req.user._id,
        });

        await document.save();
        // Add this to the createDocument function, right after document.save()
// Create initial revision
const initialRevision = new DocumentRevision({
    document: document._id,
    content: content,
    description: "Initial version",
    user: req.user._id,
    organization: req.user.organization,
  })
  await initialRevision.save()
        res.status(201).json(document);
    } catch (error) {
        console.error('Error creating document:', error);
        
        // Check for MongoDB duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({ 
                message: 'A document with this title already exists. Please choose a different title.' 
            });
        }
        
        res.status(500).json({ message: 'Failed to create document.' });
    }
};

// Get a single document by ID
const getDocumentById = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id)
            .populate('template')
            .populate('organization')
            .populate('user');

        if (!document) {
            return res.status(404).json({ message: 'Document not found.' });
        }

        res.status(200).json(document);
    } catch (error) {
        console.error('Error fetching document:', error);
        res.status(500).json({ message: 'Failed to fetch document.' });
    }
};

// Update a document
const updateDocument = async (req, res) => {
    try {
        const { title, content } = req.body;

        const document = await Document.findById(req.params.id);
        if (!document) {
            return res.status(404).json({ message: 'Document not found.' });
        }

        if (document.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized action.' });
        }

        // If title is being changed, check for duplicates
        if (title && title !== document.title) {
            const existingDocument = await Document.findOne({ 
                title: title,
                user: req.user._id,
                _id: { $ne: req.params.id }, // Exclude current document
                status: 'active' // Only check active documents
            });

            if (existingDocument) {
                return res.status(400).json({ 
                    message: 'A document with this title already exists. Please choose a different title.' 
                });
            }
        }

        document.title = title || document.title;
        document.content = content || document.content;

        await document.save();
        // Add this to the updateDocument function, right after document.save()
// Create revision for this update
const updateRevision = new DocumentRevision({
    document: document._id,
    content: content || document.content,
    description: "Auto-saved update",
    user: req.user._id,
    organization: req.user.organization,
  })
  await updateRevision.save()
        res.status(200).json(document);
    } catch (error) {
        console.error('Error updating document:', error);
        
        // Check for MongoDB duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({ 
                message: 'A document with this title already exists. Please choose a different title.' 
            });
        }
        
        res.status(500).json({ message: 'Failed to update document.' });
    }
};

// Soft Delete a document (set status to inactive)
const deleteDocument = async (req, res) => {
    try {
        const documentId = req.params.id;
        const userId = req.user._id;

        // Find the document
        const document = await Document.findById(documentId);
        if (!document) {
            return res.status(404).json({ message: 'Document not found.' });
        }

        // Check if the document belongs to the requesting user
        if (document.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Unauthorized action.' });
        }

        // Update the document's status to "inactive"
        document.status = 'inactive';
        await document.save();

        res.status(200).json({ message: 'Document archived successfully.', document });
    } catch (error) {
        console.error('Error archiving document:', error);
        res.status(500).json({ message: 'Failed to archive document.' });
    }
};

// Recover a document (set status back to active)
const recoverDocument = async (req, res) => {
    try {
        const documentId = req.params.id;
        const userId = req.user._id;

        // Find the document
        const document = await Document.findById(documentId);
        if (!document) {
            return res.status(404).json({ message: 'Document not found.' });
        }

        // Check if the document belongs to the requesting user
        if (document.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Unauthorized action.' });
        }

        // Update the document's status to "active"
        document.status = 'active';
        await document.save();

        res.status(200).json({ message: 'Document recovered successfully.', document });
    } catch (error) {
        console.error('Error recovering document:', error);
        res.status(500).json({ message: 'Failed to recover document.' });
    }
};

// Permanently delete a document
const eraseDocument = async (req, res) => {
    try {
        const documentId = req.params.id;
        const userId = req.user._id;

        // Find the document
        const document = await Document.findById(documentId);
        if (!document) {
            return res.status(404).json({ message: 'Document not found.' });
        }

        // Check if the document belongs to the requesting user
        if (document.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Unauthorized action.' });
        }

        // First delete all revisions for this document
        await DocumentRevision.deleteMany({ document: documentId });

        // Then permanently delete the document
        await Document.findByIdAndDelete(documentId);

        res.status(200).json({ message: 'Document and all its revisions permanently deleted.' });
    } catch (error) {
        console.error('Error erasing document:', error);
        res.status(500).json({ message: 'Failed to erase document.' });
    }
};

// Get all documents created by a user
const getDocumentsByUser = async (req, res) => {
    try {
        // Add status filter if provided in query params
        const statusFilter = req.query.status || 'active'; // Default to active
        
        const query = { 
            user: req.params.userId,
            ...(statusFilter !== 'all' && { status: statusFilter })
        };
        
        const documents = await Document.find(query)
            .populate('template')
            .populate('organization').select('-content');

        res.status(200).json(documents);
    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).json({ message: 'Failed to fetch documents.' });
    }
};

export { 
    createDocument, 
    getDocumentById, 
    updateDocument, 
    deleteDocument, 
    recoverDocument, 
    eraseDocument, 
    getDocumentsByUser 
};