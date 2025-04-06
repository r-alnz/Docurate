import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import SuperAdmin from './superAdminModel.js';
import Admin from './adminModel.js'

const userSchema = new mongoose.Schema(
    {
        firstname: { 
            type: String, 
            required: true, 
        },
        lastname: { 
            type: String, 
            required: true, 
        },
        birthdate: {
            type: Date,
            default: null
        },
        email: { 
            type: String, 
            required: true, 
            unique: true 
        },
        password: { 
            type: String, 
            required: true 
        }, 

        organization: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Organization',
            required: function () {
                return this.role && this.role !== 'superadmin';
            }
        },
        position: {
            type: String,
            default: ""
        },
        college: { 
            type: String,
        },
        program: { 
            type: String,
        },
        suborganizations: [{ 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User',
        }],        

        studentId: {
            type: String,
            required: function () {
                return this.role === 'student';
            },
        },
        role: { 
            type: String, 
            enum: ["superadmin", "admin", "organization", "student"], 
            default: "admin" 
        },
        inactive: {
            type: Boolean,
            default: false
        }        
    }, 
    {
        timestamps: true
    }
);

// Encrypt password before saving user
userSchema.pre('save', async function (next) {
    try {
        if(this.isModified('password')) {
            const salt = await bcrypt.genSalt(12)
            this.password = await bcrypt.hash(this.password, salt)
        }
        next();
    } catch (error) {
        next(error)
        
    }
})

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};


userSchema.statics.signup = async function (
    firstname, lastname, birthdate, email, password, role, organization = null, position = null
) {
    try {
        if (!firstname || !lastname || !email || !password || !role) {
            throw new Error('Please provide all required fields');
        }

        // Ensure student role requires studentId
        if (role === 'student' && !studentId) {
            throw new Error('Student ID is required for a student role');
        }

        if (role === 'organization' && !organization) {
            throw new Error('Organization ID is required for an organization role');
        }

        // console.log('Creating user:', { firstname, lastname, birthdate, email, role, organization, position });

        const exists = await this.findOne({ email });
        if (exists) {
            throw new Error('User with this email already exists');
        }

        const user = await this.create({
            firstname,
            lastname,
            birthdate: birthdate || null,
            email,
            password,
            role,
            organization,
            position: position || "",
        });

        // Check role and create appropriate Admin if needed
        if (role === 'admin') {
            if (!organization) {
                throw new Error('Organization ID is required for admin creation');
            }

            const admin = new Admin({
                user: user._id,
            });
            await admin.save();
        }

        console.log('Creating user:', { firstname, lastname, birthdate, email, role, organization, position });

        // res.status(201).json(user);
        return user;
    } catch (error) {
        console.error('❌ Error signing up user:', error); // Log the full error
        throw new Error(error.message);
    }
};

// hash password
/*
userSchema.statics.hashPassword = async function (password) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};
*/

// Static method to login user
userSchema.statics.login = async function (email, password) {
    try {
        if (!email || !password) {
            throw new Error('Email and password are required');
        }

        const user = await this.findOne({ email })
            .populate('organization', 'name') // Populate organization name
            .populate('suborganizations', 'firstname'); // Populate suborganizations
        
            console.log("🚀 User from DB (before returning):", JSON.stringify(user, null, 2));

        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        return user;
    } catch (error) {
        console.error('Error logging in user:', error.message);
        throw new Error(error.message);
    }
};


// Admin -----------------------
// Static method to create an admin user
userSchema.statics.createSuperAdminUser = async function(firstname, lastname, email, password) {
    try {
        // Check if the super admin user already exists
        const existingSuperAdmin = await this.findOne({ email, role: 'superadmin' });
        if (existingSuperAdmin) {
            console.log('SuperAdmin user already exists:', existingSuperAdmin);
            return existingSuperAdmin;
        }
        

        // Create the super admin user with the role 'superadmin'
        const superAdminUser = await this.signup(firstname, lastname, email, password, 'superadmin');
        // Create the SuperAdmin model (no organization link)
        // const superAdmin = new SuperAdmin({
        //     user: superAdminUser._id,  // Link to the created super admin user
        // });

        await superAdminUser.save();

        console.log('SuperAdmin user created:', superAdminUser);
        return superAdminUser;
    } catch (error) {
        console.error('Error creating super admin user:', error);
        throw new Error('Failed to create super admin user');
    }
};

// Admin -----------------------
// Function to create an admin user (invoke this function during app initialization or as needed)
const createSuperAdminUser = async () => {
    try {
        await User.createSuperAdminUser('Super Admin','User', 'admin@gmail.com', 'QWEasd123');
    } catch (error) {
        console.error('Error creating admin user:', error);
    }
};


const User = mongoose.model('User', userSchema)

export { createSuperAdminUser };
export default User