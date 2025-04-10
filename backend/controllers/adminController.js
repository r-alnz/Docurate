import User from '../models/userModel.js';
import Organization from '../models/organizationModel.js';

/* =========================
    Admin: Create User Account
============================ */
const createUserAccount = async (req, res) => {
    try {
        console.log('📥 Received user data:', JSON.stringify(req.body, null, 2));

        // Destructure fields from request body
        const { firstname, lastname, email, password, role, organization, college, program, studentId, suborganizations, birthdate } = req.body;

        // Validate required fields
        if (!firstname || !lastname || !email || !password || !role) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Students must provide birthdate
        if (role === 'student' && !birthdate) {
            return res.status(400).json({ message: 'Birthdate is required for students' });
        }

        // Only allow roles: student or organization
        if (!['student', 'organization'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        // Non-student roles must have an organization
        if (role !== 'student' && !organization) {
            return res.status(400).json({ message: 'Organization is required for this role' });
        }

        // Check if the organization exists (if applicable)
        const orgExists = role !== 'student' ? await Organization.findById(organization) : true;
        if (!orgExists) return res.status(404).json({ message: 'Organization not found' });

        // Check if email is already registered
        const emailExists = await User.findOne({ email });
        if (emailExists) return res.status(400).json({ message: 'Email already exists' });

        // Prepare user data for creation
        const userPayload = { firstname, lastname, birthdate, email, password, role, organization, college, program, suborganizations: suborganizations || [] };
        if (role === 'student') userPayload.studentId = studentId;

        // Create new user
        const newUser = await User.create(userPayload);
        res.status(201).json({ message: 'User created successfully', user: newUser });

    } catch (error) {
        console.error('Error creating user account:', error.message);
        res.status(500).json({ message: 'Failed to create user account', error: error.message });
    }
};

/* =========================
    Get Users (With Filters)
============================ */
const getUsers = async (req, res) => {
    try {
        // Extract filters & role of requester
        const { role } = req.query;
        const requestingAdminOrganization = req.user.organization;
        const requestingOrganizationId = req.user._id;
        const requestingRole = req.user.role;

        // Allowed roles for fetching
        const allowedRoles = ['student', 'organization'];

        // Build filter query based on role
        const filter = {
            role: { $in: allowedRoles },
        };

        // Apply organization-based filters
        if (requestingRole === 'admin') {
            filter.organization = requestingAdminOrganization;
        } else if (requestingRole === 'organization') {
            filter.suborganizations = requestingOrganizationId;
        }

        // Apply additional role filter if provided
        if (role && allowedRoles.includes(role)) {
            filter.role = role;
        }

        // Fetch users
        const users = await User.find(filter)
            .populate('organization', '_id name')
            .populate('suborganizations', '_id firstname lastname')
            .select('-password')
            .sort({ createdAt: -1 });

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

/* =========================
    Edit User Account
============================ */
const editUserAccount = async (req, res) => {
    const { id } = req.params;
    console.log("📥 Raw Request Body:", JSON.stringify(req.body, null, 2));

    const { firstname, lastname, email, birthdate, password, organization, suborganizations, role, studentId, college, program } = req.body;
    try {
        if (!id) throw new Error('User account ID is required');

        const updateData = {};

        // Conditionally update fields if provided
        if (firstname) updateData.firstname = firstname;
        if (lastname) updateData.lastname = lastname;
        if (email) updateData.email = email;
        if (birthdate) updateData.birthdate = birthdate;
        if (password) updateData.password = await User.hashPassword(password);
        if (organization) updateData.organization = organization;
        if (role) updateData.role = role;
        if (program) updateData.program = program;
        if (college) updateData.college = college;

        // Handle student-specific fields
        if (role === 'student') {
            updateData.studentId = studentId || null;
        } else {
            updateData.studentId = undefined;
        }

        // Handle suborganizations array
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

        // Update user
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

/* =========================
    Delete User Account
============================ */
const deleteUserAccount = async (req, res) => {
    const { id } = req.params;
    try {
        if (!id) throw new Error('User account ID is required');

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

/* =========================
    Inactivate User Account
============================ */
const inactivateUserAccount = async (req, res) => {
    const { id } = req.params;
    try {
        if (!id) throw new Error('User account ID is required');

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

/* =========================
    Activate User Account
============================ */
const activateUserAccount = async (req, res) => {
    const { id } = req.params;
    try {
        if (!id) throw new Error('User account ID is required');

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
