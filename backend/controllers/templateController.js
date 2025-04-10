import Template from '../models/templateModel.js';

// Fetch Templates
const getTemplates = async (req, res) => {

    // console.log("🚀 User in middleware (before getTemplates):", JSON.stringify(req.user));

    try {
        const { organization, suborganizations } = req.user;

        // console.log("User in getTemplates:", JSON.stringify(req.user));

        // console.log("Fetching templates for organization & suborganizations:", {
        //     organization,
        //     suborganizations,
        // });

        // let query = {
        //     $and: [
        //         { organization }, 
        //         {
        //             $or: [
        //                 { suborganizations: { $in: suborganizations.map(id => id.toString()) } },
        //                 { status: 'active' }
        //             ]
        //         }
        //     ]
        // };
        

        // const query = { 
        //     organization, 
        //     ...(suborganizations?.length > 0 && { suborganizations: { $in: suborganizations } })
        // };
        

        let query = {
            organization: req.user.organization,  // Always filter by organization
            $or: [
                { suborganizations: { $exists: false } }, // General-use templates (null)
                { suborganizations: { $size: 0 } },       // General-use templates (empty array)
            ],
        };
        
        query.$and = query.$and || [];

        // Add role-specific conditions dynamically
        if (req.user.role === "student") {
            console.warn("studet acc")
            console.log("subor:", suborganizations)
            console.log("req user:", req.user)
            query.$and.push({requiredRole: req.user.role})
            query.$or.push({ suborganizations: { $in: suborganizations } });
        } else if (req.user.role === "organization") {
            console.warn("org acc")
            // query.$and.push({requiredRole: req.user.role})
            query.$and.push({requiredRole: req.user.role}) // just show templates for org
            query.$or.push({ suborganizations: req.user._id }); // Match org itself
        }

        // else if (req.user.role === "organization") {
        //     console.warn("org accy")
        //     console.log("req.user._id:", req.user._id);
        //     console.log("subor:", suborganizations)
        //     console.log("req user:", req.user)
        //     query.$or.push(
        //         { suborganizations: req.user._id.toString() }, 
        //         { organization: req.user.organization } // Include org-level templates
        //     );
        // }
        
        // // Future expansion: Easily add more roles!
        if (req.user.role === "admin") {
            query.$or.push({ status: "active" }); // Example: Admins see all active templates
        // } else if (req.user.role === "superadmin") {
        //     delete query.organization; // Example: Superadmins can see all templates, regardless of org
        }
        
        console.log("Final Query:", JSON.stringify(query, null, 2));       

        // console.log("Applied filters:", JSON.stringify(query, null, 2));

        // Fetch templates
        const templates = await Template.find(query)
            .populate('suborganizations', '_id firstname').select('-content')
          

        // console.log("Fetched Templates:", templates.length ? templates : "No templates found");

        if (!templates || templates.length === 0) {
            return res.status(404).json({ message: 'No templates available for your organization or suborganizations' });
        }

        res.status(200).json(templates);
    } catch (error) {
        console.error('Error fetching templates:', error.message);
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
        const { name, content, type, subtype, paperSize, margins, requiredRole, suborganizations } = req.body;
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
            margins,
            suborganizations
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
        const { name, content, type, subtype, margins, requiredRole, suborganizations } = req.body;
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
        if (suborganizations) template.suborganizations = suborganizations;

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

// Erase Template
const eraseTemplate = async (req, res) => {
    const { id } = req.params;
    try {
        const template = await Template.findById(id);

        if (!template) {
            return res.status(404).json({ message: 'Template not found.' });
        }

        await template.deleteOne(); // Permanently delete the template
        res.json({ message: 'Template deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete template.' });
    }
};


const fetchDecisionTree = async (req, res) => {
    try {
        const { organization, role } = req.user;

        if (!organization) {
            return res.status(400).json({ message: 'Organization ID is required' });
        }

        const query = { organization, status: 'active' };

        if (role !== 'admin') {
            query.requiredRole = role;
        }

        const templates = await Template.find(query);

        const decisionTree = {};

        templates.forEach((template) => {
            const { type, subtype, name, _id, requiredRole, paperSize } = template;

            // Level 1 – Type
            if (!decisionTree[type]) {
                decisionTree[type] = { subtypes: {} };
            }

            const typeNode = decisionTree[type];

            // Level 2 – Subtype (or 'default' if empty)
            const subKey = subtype || 'default';
            if (!typeNode.subtypes[subKey]) {
                typeNode.subtypes[subKey] = { paperSizes: {} };
            }

            const subtypeNode = typeNode.subtypes[subKey];

            // Level 3 – Paper Size
            if (!subtypeNode.paperSizes[paperSize]) {
                subtypeNode.paperSizes[paperSize] = { requiredRoles: {} };
            }

            const paperSizeNode = subtypeNode.paperSizes[paperSize];

            // Level 4 – Required Role
            if (!paperSizeNode.requiredRoles[requiredRole]) {
                paperSizeNode.requiredRoles[requiredRole] = [];
            }

            paperSizeNode.requiredRoles[requiredRole].push({
                id: _id,
                name,
                requiredRole,
                paperSize
            });
        });

        res.status(200).json(decisionTree);
    } catch (error) {
        console.error('Error generating decision tree:', error.message);
        res.status(500).json({ message: 'Error generating decision tree', error: error.message });
    }
};




export { getTemplates, getActiveTemplates, getTemplateById, getTemplateHeaderById, createTemplate, updateTemplate, deleteTemplate, recoverTemplate, eraseTemplate, fetchDecisionTree };
