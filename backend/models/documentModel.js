import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
    {
        title: { 
            type: String, 
            required: true 
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
        },  // Finalized HTML with placeholders replaced by user inputs
        user: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User', 
            required: true 
        },
    },
    {
        timestamps: true
    }
);

documentSchema.pre('save', async function (next) {
    const template = await mongoose.model('Template').findById(this.template);
    
    next();
});


const Document = mongoose.model('Document', documentSchema);

export default Document;
