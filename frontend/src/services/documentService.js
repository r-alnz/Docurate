// documentService.js - Add functions for recover and erase
import axios from 'axios';
import { getApiUrl } from "../api.js";
const API_URL = getApiUrl("/documents");

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
        // Extract the error message from the response
        const errorMessage = error.response?.data?.message || 'Error creating document';
        throw new Error(errorMessage);
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
        // Extract the error message from the response
        const errorMessage = error.response?.data?.message || 'Error updating document';
        throw new Error(errorMessage);
    }
};

// Soft delete a document (set status to inactive)
const deleteDocument = async (id, token) => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Error archiving document');
    }
};

// Recover a document (set status back to active)
const recoverDocument = async (id, token) => {
    try {
        const response = await axios.put(`${API_URL}/recover/${id}`, {}, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Error recovering document');
    }
};

// Permanently delete a document
const eraseDocument = async (id, token) => {
    try {
        const response = await axios.delete(`${API_URL}/erase/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Error permanently deleting document');
    }
};

// Get all documents by a user
const getDocumentsByUser = async (userId, token, status = 'active') => {
    try {
        const response = await axios.get(`${API_URL}/user/${userId}?status=${status}`, {
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
    recoverDocument,
    eraseDocument,
    getDocumentsByUser,
    getDocumentTemplateById,
};