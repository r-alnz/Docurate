import axios from 'axios';

const API_URL = '/api/documents';

// Create a new document
const createDocument = async (documentData, token) => {
    try {
        const response = await axios.post(API_URL, documentData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Error creating document');
    }
};

// Get a document by ID
const getDocumentById = async (id, token) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Error fetching document');
    }
};

// Update a document
const updateDocument = async (id, documentData, token) => {
    try {
        const response = await axios.put(`${API_URL}/${id}`, documentData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Error updating document');
    }
};

// Delete a document
const deleteDocument = async (id, token) => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Error deleting document');
    }
};

// Get all documents by a user
const getDocumentsByUser = async (userId, token) => {
    try {
        const response = await axios.get(`${API_URL}/user/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Error fetching documents for user');
    }
};

// Get a document template by ID
const getDocumentTemplateById = async (templateId, token) => {
    try {
        const response = await axios.get(`${API_URL}/document-template/${templateId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Error fetching document template by ID');
    }
};

export {
    createDocument,
    getDocumentById,
    updateDocument,
    deleteDocument,
    getDocumentsByUser,
    getDocumentTemplateById,
};
