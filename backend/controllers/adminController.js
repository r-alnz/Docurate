import User from '../models/userModel.js';
import Organization from '../models/organizationModel.js';

// Admin: Create User Account
const createUserAccount = async (req, res) => {
    try {
        const { firstname, lastname, email, password, role, organization, studentId } = req.body;
        console.log(req.body);
        // Validate required fields
        if (!firstname || !lastname || !email || !password || !role) {
            return res.status(400).json({
                message: 'All fields are required: firstname, lastname, email, password, role',
            });
        }

        // Allowed roles for users created by admin
        const allowedRoles = ['student', 'organization'];
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                message: `Invalid role. Allowed roles: ${allowedRoles.join(', ')}`,
            });
        }

        // Check if the organization exists for role assignment (if applicable)
        if (role !== 'student') {
            const orgExists = await Organization.findById(organization);
            if (!orgExists) {
                return res.status(404).json({ message: 'Organization not found' });
            }
        }

        // Check for duplicate email
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const userPayload = {
            firstname,
            lastname,
            email,
            password,
            role,
            organization,
        };

        // Add `studentId` only for students
        if (role === 'student') {
            userPayload.studentId = studentId;
        }

        // Create the user
        const newUser = await User.create(userPayload);

        // Response
        res.status(201).json({
            message: 'User account created successfully',
            user: {
                _id: newUser._id,
                firstname: newUser.firstname,
                lastname: newUser.lastname,
                email: newUser.email,
                role: newUser.role,
                studentId: newUser.studentId || null,
                organization: newUser.organization || null,
            },
        });
    } catch (error) {
        console.error('Error creating user account:', error.message);
        res.status(500).json({ message: 'Failed to create user account', error: error.message });
    }
};




const getUsers = async (req, res) => {
    try {
        const { role } = req.query; // Role filter
        const requestingAdminOrganization = req.user.organization; // Admin's organization ID from token
        // Allowed roles: 'student' and 'organization'
        const allowedRoles = ['student', 'organization'];

        // Build the filter object dynamically
        const filter = {
            role: { $in: allowedRoles }, // Only 'student' and 'organization' roles
            organization: requestingAdminOrganization, // Only users within the admin's organization
        };

        if (role && allowedRoles.includes(role)) {
            filter.role = role; // Additional role filter if provided
        }

        // Fetch users from the database
        const users = await User.find(filter)
            .populate('organization', '_id name') // Populate the organization name
            .select('-password') // Exclude password field
            .sort({ createdAt: -1 }); // Sort by creation date descending

        res.status(200).json({
            message: 'Users retrieved successfully',
            count: users.length,
            users,
        });
    } catch (error) {
        console.error('Error fetching users:', error.message);
        res.status(500).json({ message: 'Failed to fetch users', error: error.message });
    }
};

// Edit User Account
const editUserAccount = async (req, res) => {
    const { id } = req.params;
    const { firstname, lastname, email, password, organization, role, studentId } = req.body;
    console.log(req.body);
    try {
        if (!id) throw new Error('User account ID is required');

        const updateData = {};

        if (firstname) updateData.firstname = firstname;
        if (lastname) updateData.lastname = lastname;
        if (email) updateData.email = email;
        if (password) updateData.password = await User.hashPassword(password); // Hash new password
        if (organization) updateData.organization = organization;
        if (role) updateData.role = role;

        // Conditionally handle `studentId`
        if (role === 'student') {
            updateData.studentId = studentId || null; // Include studentId only if role is student
        } else {
            updateData.studentId = undefined; // Remove studentId for non-students
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedUser) throw new Error('User account not found');

        res.status(200).json({
            message: 'User account updated successfully',
            user: updatedUser,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};



// Delete User Account
const deleteUserAccount = async (req, res) => {
    const { id } = req.params; // User account ID

    try {
        if (!id) throw new Error('User account ID is required');

        // Find and delete the user in the User table
        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) throw new Error('User account not found');

        res.status(200).json({
            message: 'User account and associated record deleted successfully',
            user: deletedUser,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


export { createUserAccount, getUsers, editUserAccount, deleteUserAccount };
