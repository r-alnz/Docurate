import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import FilteredTemplateListContainer from './FilteredTemplateListContainer';
import { useTemplateContext } from '../hooks/useTemplateContext';
import { fetchDecisionTree } from '../services/templateService';
import { getToken } from '../utils/authUtil';


const AddDocumentModal = ({ onClose }) => {
    const { templates, dispatch, loading: contextLoading, error: contextError } = useTemplateContext();
    const [decisionTree, setDecisionTree] = useState({});
    const [documentType, setDocumentType] = useState('');
    const [documentSubtype, setDocumentSubtype] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (templates.length === 0) {
            dispatch({ type: 'SET_LOADING', payload: true });
        } else {
            const buildDecisionTree = async() => {
                // const tree = {};
                const token = getToken();
                const tree = await fetchDecisionTree(token);

                // templates.forEach((template) => {
                //     const { type, subtype, name, _id } = template;

                //     if (!tree[type]) {
                //         tree[type] = { subtype: {} };
                //     }

                //     if (subtype) {
                //         if (!tree[type].subtype[subtype]) {
                //             tree[type].subtype[subtype] = [];
                //         }
                //         tree[type].subtype[subtype].push({ name, id: _id });
                //     } else {
                //         if (!tree[type].names) {
                //             tree[type].names = [];
                //         }
                //         tree[type].names.push({ name, id: _id });
                //     }
                // });

                setDecisionTree(tree);
            };

            buildDecisionTree();
        }
    }, [templates, dispatch]);
    // console.log(decisionTree);
    

    const handleUseTemplate = () => {
        if (selectedTemplate) {
            navigate(`/document-creation/${selectedTemplate._id}`, { state: selectedTemplate }); // Redirect with full template details
        }
    };

    if (contextLoading) return <p>Loading templates...</p>;
    if (contextError) return <p className="text-red-500">{contextError}</p>;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-md w-full max-w-3xl">
                <h2 className="text-xl font-bold mb-4">Create New Document</h2>
                <label className="block text-gray-700 mb-2">
                    Document Type:
                    <select
                        className="w-full border rounded p-2 mb-4"
                        value={documentType}
                        onChange={(e) => {
                            setDocumentType(e.target.value);
                            setDocumentSubtype('');
                        }}
                    >
                        <option value="">Select Type</option>
                        {Object.keys(decisionTree).map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                </label>
                {documentType && decisionTree[documentType]?.subtype && (
                    <label className="block text-gray-700 mb-2">
                        Document Subtype (Optional):
                        <select
                            className="w-full border rounded p-2 mb-4"
                            value={documentSubtype}
                            onChange={(e) => setDocumentSubtype(e.target.value)}
                        >
                            <option value="">Select Subtype</option>
                            {Object.keys(decisionTree[documentType].subtype).map((subtype) => (
                                <option key={subtype} value={subtype}>
                                    {subtype}
                                </option>
                            ))}
                        </select>
                    </label>
                )}
                <div className="mt-4 max-h-[40vh] overflow-y-auto">
                    {documentType && (
                        <FilteredTemplateListContainer
                            templates={[
                                ...(decisionTree[documentType].names || []),
                                ...(documentSubtype
                                    ? decisionTree[documentType].subtype[documentSubtype] || []
                                    : Object.values(decisionTree[documentType].subtype || {}).flat()),
                            ]}
                            onSelectTemplate={(template) => setSelectedTemplate(template)}
                        />
                    )}
                </div>
                {selectedTemplate && (
                    <div className="mt-4">
                        <button
                            className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-700"
                            onClick={handleUseTemplate}
                        >
                            Use Template
                        </button>
                    </div>
                )}
                <button
                    className="mt-4 w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-700"
                    onClick={onClose}
                >
                    Close
                </button>
            </div>
        </div>

    );
};

AddDocumentModal.propTypes = {
    onClose: PropTypes.func.isRequired,
};

export default AddDocumentModal;
