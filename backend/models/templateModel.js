import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema(
    {
        name: { 
            type: String, 
            required: true 
        },
        content: { 
            type: String, 
            required: true 
        },  // This can store HTML content, or you can serialize a WYSIWYG format
        type: {
            type: String,      
            required: true
        },
        subtype: {
            type: String,           
        },
        paperSize: {
            type: String,
            enum: ['letter', 'legal', 'a4'],
            required: true
        },
        requiredRole: { 
            type: String, 
            enum: ['organization', 'student'],
            required: true
        },
        organization: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Organization', 
            required: true 
        },
        margins: {
            top: { type: Number, default: 1 }, // Default value: 1 inch
            bottom: { type: Number, default: 1 },
            left: { type: Number, default: 1 },
            right: { type: Number, default: 1 }
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active' // Default value
        }
    },
    {
        timestamps: true
    }
);

// Add an index for the `requiredRole` field
templateSchema.index({ organization: 1, requiredRole: 1 });

const Template = mongoose.model('Template', templateSchema);

export default Template;
