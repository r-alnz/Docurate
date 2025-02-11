import Document from '../models/documentModel.js';
import Template from '../models/templateModel.js';

// Create a new document
const createDocument = async (req, res) => {
    try {
        const { title, template, content } = req.body;
        // console.log(req.body);
        // console.log(req.user);

        if (!title || !template || !content) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const document = new Document({
            title,
            template,
            organization: req.user.organization,
            content,
            user: req.user._id,
        });
        // console.log(document);
        await document.save();
        res.status(201).json(document);
    } catch (error) {
        console.error('Error creating document:', error);
        res.status(500).json({ message: 'Failed to create document.' });
    }
};

// Get a single document by ID
const getDocumentById = async (req, res) => {
    console.log(req.params.id);
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

        document.title = title || document.title;
        document.content = content || document.content;

        await document.save();
        res.status(200).json(document);
    } catch (error) {
        console.error('Error updating document:', error);
        res.status(500).json({ message: 'Failed to update document.' });
    }
};

// Delete a document
const deleteDocument = async (req, res) => {
    try {
        const documentId = req.params.id;
        const userId = req.user._id;

        console.log(documentId);

        // Find the document
        const document = await Document.findById(documentId);
        if (!document) {
            return res.status(404).json({ message: 'Document not found.' });
        }

        // Check if the document belongs to the requesting user
        if (document.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Unauthorized action.' });
        }

        // Delete the document
        await Document.findByIdAndDelete(documentId);

        res.status(200).json({ message: 'Document deleted successfully.' });
    } catch (error) {
        console.error('Error deleting document:', error);
        res.status(500).json({ message: 'Failed to delete document.' });
    }
};


// Get all documents created by a user
const getDocumentsByUser = async (req, res) => {
    try {
        const documents = await Document.find({ user: req.params.userId })
            .populate('template')
            .populate('organization');

        res.status(200).json(documents);
    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).json({ message: 'Failed to fetch documents.' });
    }
};


export { createDocument, getDocumentById, updateDocument, deleteDocument, getDocumentsByUser };