import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema(
    {
        name: { 
            type: String, 
            required: true 
        }       
    },
    {
        timestamps: true
    }
);

const Organization = mongoose.model('Organization', organizationSchema);

export default Organization;
