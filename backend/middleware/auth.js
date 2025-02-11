import jwt from 'jsonwebtoken';
import User from '../models/userModel.js'

const authToken = async (req, res, next) => {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized: No token provided' });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user details to request (include organization and role)
        req.user = await User.findById(decoded.id).select('_id role organization');

        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized: User not found' });
        }

        next();
    } catch (error) {
        console.error('Token verification failed:', error.message);

        // Return appropriate error messages
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token has expired' });
        }

        res.status(500).json({ message: 'Internal server error' });
    }
};

const requireAdmin = (req, res, next) => {
    const { role } = req.user
    if(role !== 'admin') {
        return res.status(401).json({ message: 'Access Denied' })
    }
    next()
}

const requireSuperAdmin = (req, res, next) => {
    const { role } = req.user
    if(role !== 'superadmin') {
        return res.status(401).json({ message: 'Access Denied' })
    }
    next()
}

const requireUser = (req, res, next) => {

    const { role } = req.user
    if(role !== 'student' && role !== 'organization') {
        return res.status(401).json({ message: 'Access Denied' })
    }
    next()
}

export { authToken, requireAdmin, requireSuperAdmin, requireUser }