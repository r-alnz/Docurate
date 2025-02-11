import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { getTemplateHeaderById } from '../services/templateService';
import { getToken } from '../utils/authUtil';

const FilteredTemplateListContainer = ({ templates, onSelectTemplate }) => {
    const [detailedTemplates, setDetailedTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTemplateId, setSelectedTemplateId] = useState(null); // Track selected template ID

    useEffect(() => {
        const fetchTemplateHeaders = async () => {
            const token = getToken();
            const fetchedTemplates = [];

            try {
                for (const template of templates) {
                    const header = await getTemplateHeaderById(template.id, token); // Fetch header for each template
                    fetchedTemplates.push(header);
                }
                setDetailedTemplates(fetchedTemplates);
            } catch (error) {
                console.error('Error fetching template headers:', error.message);
                alert('Failed to fetch template headers. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchTemplateHeaders();
    }, [templates]);

    const handleSelect = (template) => {
        setSelectedTemplateId(template._id); // Set the selected template ID
        onSelectTemplate(template); // Pass the full template object to the parent
    };

    if (loading) {
        return <p className="text-gray-700 text-center mt-4">Loading templates...</p>;
    }

    if (detailedTemplates.length === 0) {
        return <p className="text-gray-700 text-center mt-4">No templates match the selected criteria.</p>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {detailedTemplates.map((template) => (
                <div
                    key={template._id}
                    className={`border rounded p-4 shadow hover:shadow-lg transition-shadow duration-300 ${
                        template._id === selectedTemplateId ? 'border-blue-500 ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => handleSelect(template)}
                >
                    <h3 className="text-xl font-semibold mb-2">{template.name}</h3>
                    <p className="text-gray-700 mb-1">
                        <strong>Type:</strong> {template.type}
                    </p>
                    <p className="text-gray-700 mb-1">
                        <strong>Subtype:</strong> {template.subtype || 'N/A'}
                    </p>
                    <p className="text-gray-700 mb-1">
                        <strong>Paper Size:</strong> {template.paperSize}
                    </p>
                    <p className="text-gray-700">
                        <strong>Role:</strong> {template.requiredRole}
                    </p>
                </div>
            ))}
        </div>
    );
};

FilteredTemplateListContainer.propTypes = {
    templates: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired, // Assuming the initial array only contains id and name
            name: PropTypes.string.isRequired,
        })
    ).isRequired,
    onSelectTemplate: PropTypes.func.isRequired,
};

export default FilteredTemplateListContainer;
