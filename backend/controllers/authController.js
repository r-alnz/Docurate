import User from '../models/userModel.js';
import Template from '../models/templateModel.js';
import generateToken from '../utils/generateToken.js';


// Login User
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        // console.log(email, password);
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Authenticate user
        const user = await User.login(email, password); // Calls the login method in the userModel
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        console.log(user);
        // Generate token
        const token = generateToken(user._id, user.role);

        // Return user data and token
        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user._id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                role: user.role,
            },
            token,
        });
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
};

const getUserDetails = async (req, res) => {
    try {
        // Find user by ID, populate the organization name, and exclude the password field
        const user = await User.findById(req.user._id)
            .populate({
                path: 'organization', // Populate the 'organization' field
                select: 'name',       // Include only the 'name' field from Organization
                options: { nullable: true } // Ensure nullable if the organization does not exist
            })
            .select('-password'); // Exclude password field

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user details:', error.message);
        res.status(500).json({ message: error.message });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        console.log(req.body);
        console.log(req.user);
        // Validate input
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current and new passwords are required' });
        }

        // Find the user by ID
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        // Update to the new password
        user.password = newPassword; // Ensure password hashing is done in your model's pre-save middleware
        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error changing password:', error.message);
        res.status(500).json({ message: 'Error changing password', error: error.message });
    }
};

// Reset Password Controller
const resetUserPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        const { user: requestingUser } = req;

        // Validate input
        if (!email || !newPassword) {
            return res.status(400).json({ message: 'Email and new password are required' });
        }

        // Find the user to reset
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the user being reset has a valid role
        if (!['student', 'organization'].includes(user.role)) {
            return res.status(403).json({ message: 'Password reset allowed only for students or organizations' });
        }

        // Check if the requesting user and the target user belong to the same organization
        if (user.organization.toString() !== requestingUser.organization.toString()) {
            return res.status(403).json({ message: 'You can only reset passwords for users in your organization' });
        }

        // Update the user's password
        user.password = newPassword; // Password will be hashed in the pre-save middleware
        await user.save();

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Error resetting password:', error.message);
        res.status(500).json({ message: 'Failed to reset password', error: error.message });
    }
};

const resetAdminPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        // Validate input
        if (!email || !newPassword) {
            return res.status(400).json({ message: 'Email and new password are required' });
        }

        // Find the user to reset
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Admin user not found' });
        }

        // Check if the user being reset has the role of admin
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Password reset is allowed only for admin users' });
        }

        // Update the user's password
        user.password = newPassword; // Password will be hashed in the pre-save middleware
        await user.save();

        res.status(200).json({ message: 'Admin password reset successfully' });
    } catch (error) {
        console.error('Error resetting admin password:', error.message);
        res.status(500).json({ message: 'Failed to reset admin password', error: error.message });
    }
};



export { loginUser, getUserDetails, changePassword, resetUserPassword, resetAdminPassword };

