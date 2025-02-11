import Organization from '../models/organizationModel.js';
import User from '../models/userModel.js';
import Admin from '../models/adminModel.js';

// Create Organization
const createOrganization = async (req, res) => {
    const { name } = req.body;

    try {
        if (!name) throw new Error('Organization name is required');

        const organization = await Organization.create({ name });
        res.status(201).json({ message: 'Organization created', organization });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Create Admin Account
const createAdminAccount = async (req, res) => {
    const { firstname, lastname, email, password, organization } = req.body;

    try {
        if (!firstname || !lastname || !email || !password || !organization) {
            throw new Error('All fields are required');
        }

        // Create the admin user
        const adminUser = await User.signup(firstname, lastname, email, password, 'admin', organization);

        // Populate the organization field
        const populatedAdmin = await User.findById(adminUser._id).populate('organization', 'name _id');

        res.status(201).json({ message: 'Admin account created', user: populatedAdmin });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


// Get All Organizations
const getOrganizations = async (req, res) => {
    try {
        const organizations = await Organization.find({});
        res.status(200).json({ message: 'Organizations retrieved', organizations });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get All Admin Accounts
const getAdminAccounts = async (req, res) => {
    try {
        const adminAccounts = await User.find({ role: 'admin' }).populate('organization', 'name');
        res.status(200).json({ message: 'Admin accounts retrieved', admins: adminAccounts });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Edit Admin Account
const editAdminAccount = async (req, res) => {
    const { id } = req.params; // Admin account ID
    const { firstname, lastname, email, password, organization } = req.body;

    try {
        if (!id) throw new Error('Admin account ID is required');
        if (!firstname && !lastname && !email && !password && !organization) {
            throw new Error('At least one field is required to update');
        }

        const updateData = {};

        if (firstname) updateData.firstname = firstname;
        if (lastname) updateData.lastname = lastname;
        if (email) updateData.email = email;
        if (password) updateData.password = await User.hashPassword(password); // Hash new password
        if (organization) updateData.organization = organization;

        const updatedAdmin = await User.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).populate('organization', 'name');

        if (!updatedAdmin) throw new Error('Admin account not found');

        res.status(200).json({ message: 'Admin account updated successfully', admin: updatedAdmin });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete Admin Account
const deleteAdminAccount = async (req, res) => {
    const { id } = req.params; // Admin account ID

    try {
        if (!id) throw new Error('Admin account ID is required');

        // Find and delete the user in the User table
        const deletedAdmin = await User.findByIdAndDelete(id);

        if (!deletedAdmin) throw new Error('Admin account not found');

        // Delete the related record in the Admin table
        await Admin.findOneAndDelete({ user: id });

        res.status(200).json({
            message: 'Admin account and associated record deleted successfully',
            admin: deletedAdmin,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


export { createOrganization, createAdminAccount, getOrganizations, getAdminAccounts, editAdminAccount, deleteAdminAccount };
