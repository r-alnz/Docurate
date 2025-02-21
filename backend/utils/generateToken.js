import jwt from 'jsonwebtoken';

const generateToken = (id, role, organization, suborganizations) => {
    return jwt.sign(
        { id, role, organization, suborganizations }, // ✅ Add these
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
}

export default generateToken;