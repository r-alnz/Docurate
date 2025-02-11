import Template from '../models/templateModel.js';

// Fetch Templates
const getTemplates = async (req, res) => {
    try {
        const { role, organization } = req.user;

        // Query based on role
        const query = role === 'admin' 
            ? { organization } // Admins see all templates in their organization
            : { requiredRole: role, organization }; // Others see role-based templates

        const templates = await Template.find(query);

        if (!templates || templates.length === 0) {
            return res.status(404).json({ message: 'No templates available for your role or organization' });
        }

        res.status(200).json(templates);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching templates', error: error.message });
    }
};

// Fetch Active Templates
const getActiveTemplates = async (req, res) => {
    try {
        const { role, organization } = req.user;

        // Query based on role (only active templates)
        const query = role === 'admin'
            ? { organization, status: 'active' } // Admins see active templates in their organization
            : { requiredRole: role, organization, status: 'active' }; // Others see role-based active templates

        const templates = await Template.find(query);

        if (!templates || templates.length === 0) {
            return res.status(404).json({ message: 'No active templates available for your role or organization' });
        }

        res.status(200).json(templates);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching active templates', error: error.message });
    }
};

// Fetch Template by ID
const getTemplateById = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, organization } = req.user;

        // Query based on role
        const query = role === 'admin'
            ? { _id: id, organization }
            : { _id: id, requiredRole: role, organization };

        const template = await Template.findOne(query);

        if (!template) {
            return res.status(404).json({ message: 'Template not found or access denied' });
        }

        res.status(200).json(template);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching template', error: error.message });
    }
};

const getTemplateHeaderById = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, organization } = req.user;

        // Query based on role and active status
        const query = role === 'admin'
            ? { _id: id, organization, status: 'active' }
            : { _id: id, requiredRole: role, organization, status: 'active' };

        const template = await Template.findOne(query).select('-content');

        if (!template) {
            return res.status(404).json({ message: 'Template not found, inactive, or access denied' });
        }

        res.status(200).json(template);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching template', error: error.message });
    }
};


// Create Template
const createTemplate = async (req, res) => {
    try {
        const { name, content, type, subtype, paperSize, margins, requiredRole } = req.body;
        const { organization } = req.user;

        // Validate required fields
        if (!name || !content || !type || !requiredRole || !paperSize) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const template = new Template({
            name,
            content,
            type,
            subtype,
            paperSize,
            requiredRole,
            organization,
            margins
        });

        await template.save();

        res.status(201).json({ message: 'Template created successfully', template });
    } catch (error) {
        res.status(500).json({ message: 'Error creating template', error: error.message });
    }
};

// Update Template
const updateTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, content, type, subtype, margins, requiredRole } = req.body;
        const { organization } = req.user;

        const template = await Template.findOne({ _id: id, organization });

        if (!template) {
            return res.status(404).json({ message: 'Template not found or access denied' });
        }

        if (name) template.name = name;
        if (content) template.content = content;
        if (type) template.type = type;
        if (subtype) template.subtype = subtype;
        if (margins) template.margins = margins;
        if (requiredRole) template.requiredRole = requiredRole;

        await template.save();

        res.status(200).json({ message: 'Template updated successfully', template });
    } catch (error) {
        res.status(500).json({ message: 'Error updating template', error: error.message });
    }
};

// "Soft Delete" Template by Setting Status to Inactive
const deleteTemplate = async (req, res) => {
    try {
        const { id } = req.params;

        // Update the template's status to "inactive"
        const template = await Template.findByIdAndUpdate(
            id, 
            { status: 'inactive' }, 
            { new: true } // Return the updated document
        );

        if (!template) {
            return res.status(404).json({ message: 'Template not found or access denied' });
        }

        res.status(200).json({ message: 'Template status set to inactive successfully', template });
    } catch (error) {
        res.status(500).json({ message: 'Error updating template status', error: error.message });
    }
};

// Recover Template
const recoverTemplate = async (req, res) => {
    try {
        const { id } = req.params;

        // Update the template's status to "active"
        const template = await Template.findByIdAndUpdate(
            id,
            { status: 'active' }, // Set status to active
            { new: true } // Return the updated document
        );

        if (!template) {
            return res.status(404).json({ message: 'Template not found or access denied' });
        }

        res.status(200).json({ message: 'Template recovered successfully', template });
    } catch (error) {
        res.status(500).json({ message: 'Error recovering template', error: error.message });
    }
};


const fetchDecisionTree = async (req, res) => {
    try {
        const { organization, role } = req.user; // Extract organization and role from user info

        if (!organization) {
            return res.status(400).json({ message: 'Organization ID is required' });
        }

        // Build query based on user role
        const query = { organization, status: 'active' }; // Include status: 'active'

        // If the user's role is not admin, filter by `requiredRole`
        if (role !== 'admin') {
            query.requiredRole = role; // Only fetch templates that match the user's role
        }

        // Fetch templates matching the query
        const templates = await Template.find(query);

        const decisionTree = {};

        templates.forEach((template) => {
            const { type, subtype, name, _id, requiredRole } = template; // Include additional fields

            if (!decisionTree[type]) {
                decisionTree[type] = { subtype: {} };
            }

            if (subtype) {
                if (!decisionTree[type].subtype[subtype]) {
                    decisionTree[type].subtype[subtype] = [];
                }
                decisionTree[type].subtype[subtype].push({
                    name,
                    id: _id,
                    requiredRole, // Include other fields if necessary
                });
            } else {
                if (!decisionTree[type].names) {
                    decisionTree[type].names = [];
                }
                decisionTree[type].names.push({
                    name,
                    id: _id,
                    requiredRole, // Include other fields if necessary
                });
            }
        });

        res.status(200).json(decisionTree);
    } catch (error) {
        console.error('Error generating decision tree:', error.message);
        res.status(500).json({ message: 'Error generating decision tree', error: error.message });
    }
};





export { getTemplates, getActiveTemplates, getTemplateById, getTemplateHeaderById, createTemplate, updateTemplate, deleteTemplate, recoverTemplate, fetchDecisionTree };
