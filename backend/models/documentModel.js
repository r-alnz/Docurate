// documentModel.js
import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
    {
        title: { 
            type: String, 
            required: true,
            // Add this index for uniqueness within the scope of a user
            // This makes titles unique per user, not globally
        },
        template: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Template', 
            required: true 
        },
        organization: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Organization', 
            required: true 
        },
        content: { 
            type: String, 
            required: true 
        },
        user: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User', 
            required: true 
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active'
        }
    },
    {
        timestamps: true
    }
);

// Create a compound index for user+title to ensure titles are unique per user
documentSchema.index({ user: 1, title: 1 }, { unique: true });

documentSchema.pre('save', async function (next) {
    const template = await mongoose.model('Template').findById(this.template);
    
    next();
});

const Document = mongoose.model('Document', documentSchema);

export default Document;