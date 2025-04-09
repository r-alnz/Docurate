import User from '../models/userModel.js';
import Organization from '../models/organizationModel.js';

// Admin: Create User Account
const createUserAccount = async (req, res) => {
    try {
        console.log('📥 Received user data:', JSON.stringify(req.body, null, 2));

        const { firstname, lastname, email, password, role, organization, college, program, studentId, suborganizations, birthdate } = req.body;


        if (!firstname || !lastname || !email || !password || !role) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        
        if (role === 'student' && !birthdate) {
            return res.status(400).json({ message: 'Birthdate is required for students' });
        }        

        if (!['student', 'organization'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        if (role !== 'student' && !organization) {
            return res.status(400).json({ message: 'Organization is required for this role' });
        }

        const orgExists = role !== 'student' ? await Organization.findById(organization) : true;
        if (!orgExists) return res.status(404).json({ message: 'Organization not found' });

        const emailExists = await User.findOne({ email });
        if (emailExists) return res.status(400).json({ message: 'Email already exists' });

        const userPayload = { firstname, lastname, birthdate, email, password, role, organization, college, program, suborganizations: suborganizations || [] };
        if (role === 'student') userPayload.studentId = studentId;

        const newUser = await User.create(userPayload);
        res.status(201).json({ message: 'User created successfully', user: newUser });

    } catch (error) {
        console.error('Error creating user account:', error.message);
        res.status(500).json({ message: 'Failed to create user account', error: error.message });
    }
};




const getUsers = async (req, res) => {
    try {
        const { role } = req.query; // Role filter
        const requestingAdminOrganization = req.user.organization; // Admin's organization ID from token
        const requestingOrganizationId = req.user._id; // Organization user's ID
        const requestingRole = req.user.role; // Get the role of the requester

        // Allowed roles: 'student' and 'organization'
        const allowedRoles = ['student', 'organization'];

        // Build the filter object dynamically
        const filter = {
            role: { $in: allowedRoles }, // Only 'student' and 'organization' roles
        };

        if (requestingRole === 'admin') {
            // Admins can only see users within their organization
            filter.organization = requestingAdminOrganization;
        } else if (requestingRole === 'organization') {
            // Organizations can only see users where their ID is in suborganizations
            filter.suborganizations = requestingOrganizationId;
        }

        if (role && allowedRoles.includes(role)) {
            filter.role = role; // Additional role filter if provided
        }

        // Fetch users from the database
        const users = await User.find(filter)
            .populate('organization', '_id name') // Populate the organization name
            .populate('suborganizations', '_id firstname lastname') // Populate suborganizations names
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
    console.log("📥 Raw Request Body:", JSON.stringify(req.body, null, 2)); // Log received body

    const { firstname, lastname, email, birthdate, password, organization, suborganizations, role, studentId, college, program } = req.body;
    console.log(req.body);
    try {
        if (!id) throw new Error('User account ID is required');

        const updateData = {};

        if (firstname) updateData.firstname = firstname;
        if (lastname) updateData.lastname = lastname;
        if (email) updateData.email = email;
        if (birthdate) updateData.birthdate = birthdate;
        if (password) updateData.password = await User.hashPassword(password); // Hash new password
        if (organization) updateData.organization = organization;
        if (role) updateData.role = role;
        if (program) updateData.program = program;
        if (college) updateData.college = college;

        // Conditionally handle `studentId`
        if (role === 'student') {
            updateData.studentId = studentId || null; // Include studentId only if role is student
        } else {
            updateData.studentId = undefined;
        }

        if (suborganizations !== undefined) {
            if (Array.isArray(suborganizations)) {
                updateData.suborganizations = suborganizations.map((suborg) => 
                    typeof suborg === "object" && suborg._id ? String(suborg._id) : String(suborg)
                );
            } else {
                console.error("⚠️ suborganizations is not an array:", suborganizations);
                return res.status(400).json({ message: "suborganizations must be an array" });
            }
        }

        console.log("🛠️ Update Payload:", JSON.stringify(updateData, null, 2));

        // Update the user
        const updatedUser = await User.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true })
            .populate('organization', '_id name')
            .populate('suborganizations', '_id firstname');

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

// Inactivate User Account
const inactivateUserAccount = async (req, res) => {
    const { id } = req.params; // User account ID
    try {
        if (!id) throw new Error('User account ID is required');

        // Find the user and update the "inactive" field to true
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { inactive: true },
            { new: true }
        );

        if (!updatedUser) throw new Error('User account not found');

        res.status(200).json({
            message: 'User account inactivated successfully',
            user: updatedUser,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Inactivate User Account
const activateUserAccount = async (req, res) => {
    const { id } = req.params; // User account ID
    try {
        if (!id) throw new Error('User account ID is required');

        // Find the user and update the "inactive" field to true
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { inactive: false },
            { new: true }
        );

        if (!updatedUser) throw new Error('User account not found');

        res.status(200).json({
            message: 'User account activated successfully',
            user: updatedUser,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export { createUserAccount, getUsers, editUserAccount, deleteUserAccount, inactivateUserAccount, activateUserAccount };
