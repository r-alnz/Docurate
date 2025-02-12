// import User from '../models/userModel.js';

// export const getOrgUsers = async (req, res) => {
//     try {
//         if (req.user.role !== 'organization') {
//             return res.status(403).json({ message: 'Access denied' });
//         }

//         const students = await User.find({
//             role: 'student',
//             suborganizations: req.user._id  // Only students linked to this org user
//         }).select('-password'); // Exclude passwords for security

//         res.json({ users: students });
//     } catch (error) {
//         console.error('Error fetching organization users:', error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// };

import User from '../models/userModel.js'; // Adjust this based on your actual model

export const getOrgUsers = async (req, res) => {
    try {
        const orgId = req.user._id; // Ensure `authToken` middleware attaches `req.user`
        
        if (!orgId) {
            return res.status(403).json({ message: 'Unauthorized: Missing organization ID' });
        }

        // Fetch students whose `suborganizations` include this orgId
        const students = await User.find({
            role: 'student',
            suborganizations: orgId
        });

        res.json({ users: students });
    } catch (error) {
        console.error('Error fetching organization users:', error);
        res.status(500).json({ message: 'Server error while fetching organization users' });
    }
};
