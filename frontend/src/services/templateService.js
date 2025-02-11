import axios from 'axios';

const API_URL = '/api/templates';

const createTemplate = async (templateData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`, // Include auth token
        },
    };

    try {
        const response = await axios.post(API_URL, templateData, config);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Error creating template');
    }
};

const fetchTemplates = async (token) => {
    try {
        const response = await axios.get(API_URL, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Error fetching templates');
    }
};

const fetchActiveTemplates = async (token) => {
    try {
        const response = await axios.get(`${API_URL}/active`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Error fetching active templates');
    }
};

const getTemplateById = async (templateId, token) => {
    try {
        const response = await axios.get(`${API_URL}/${templateId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching template by ID:', error.message);
        throw new Error(error.response?.data?.message || 'Failed to fetch the template. Please try again.');
    }
};

const getTemplateHeaderById = async (templateId, token) => {
    try {
        const response = await axios.get(`${API_URL}/headers/${templateId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch template header');
    }
}

const updateTemplate = async (templateId, templateData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`, // Include auth token
        },
    };

    try {
        const response = await axios.put(`${API_URL}/${templateId}`, templateData, config);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Error updating template');
    }
};

const fetchDecisionTree = async (token) => {
    try {
        const response = await axios.get(`${API_URL}/decision-tree`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || 'Failed to fetch decision tree'
        );
    }
};

const deleteTemplate = async (id, token) => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting template:', error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

const recoverTemplate = async (templateId, token) => {
    try {
        const response = await axios.put(
            `${API_URL}/recover/${templateId}`,
            {}, // No body required
            {
                headers: {
                    Authorization: `Bearer ${token}`, // Include auth token
                },
            }
        );
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Error recovering template');
    }
};

export { createTemplate, fetchTemplates, fetchActiveTemplates, getTemplateById, updateTemplate, fetchDecisionTree, getTemplateHeaderById, deleteTemplate, recoverTemplate };
