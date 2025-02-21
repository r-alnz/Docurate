import { useEffect, useState } from 'react';
import { useTemplateContext } from '../hooks/useTemplateContext';
import { fetchTemplates, fetchActiveTemplates, deleteTemplate, recoverTemplate } from '../services/templateService';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../utils/authUtil';
import { useAuthContext } from '../hooks/useAuthContext';
import DeleteTemplateModal from './DeleteTemplateModal';

const TemplateListContainer = () => {
    const { templates, loading, error, dispatch } = useTemplateContext();
    const { user } = useAuthContext();
    const navigate = useNavigate();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('All'); // Dropdown state
    const [sortOption, setSortOption] = useState('date-desc'); // Sorting state
    const [statusFilter, setStatusFilter] = useState('active'); // Dropdown state for status


    useEffect(() => {
        const loadTemplates = async () => {
            dispatch({ type: 'SET_LOADING', payload: true });
            try {
                const token = getToken();
                const organizationId = user.organization; // Ensure user has this property
                // const suborganizationIds = user.suborganizations || [];
                const suborganizationIds = Array.isArray(user.suborganizations) ? user.suborganizations : [];

                // console.log("Fssetching templates for organization & suborganizations:", {
                //     organization: user.organization,
                //     suborganizations: suborganizationIds
                //   });

                // const fetchedTemplates = await fetchTemplates(token, organizationId, suborganizationIds);
                const fetchedTemplates = await fetchTemplates(token);
                console.log("Fetched templates from API:", fetchedTemplates);
                dispatch({ type: 'SET_TEMPLATES', payload: fetchedTemplates });
            } catch (err) {
                // console.error(err);
                dispatch({
                    type: 'SET_ERROR',
                    payload: 'Failed to fetch templates. (Or there might be no templates yet!)',
                });
            } finally {
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        };
    
        loadTemplates();
    }, [dispatch, user.role, user.organization]);    

    const handleOpenModal = (template) => {
        setTemplateToDelete(template);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setTemplateToDelete(null);
        setIsModalOpen(false);
    };

    const handleDeleteTemplate = async (templateId) => {
        try {
            const token = getToken();
            await deleteTemplate(templateId, token);
            dispatch({ type: 'DELETE_TEMPLATE', payload: templateId });
        } catch (err) {
            console.error('Failed to delete template:', err.message);
            alert(err.message || 'Failed to delete template. Please try again.');
        }
    };

    const handleRecoverTemplate = async (templateId) => {
        const token = getToken(); // Replace with your token retrieval logic
        try {
            const response = await recoverTemplate(templateId, token);
            console.log('Template recovered:', response.template);
            alert('Template recovered successfully!');
            // Optionally dispatch an action to update the state
            dispatch({ type: 'RECOVER_TEMPLATE', payload: response.template });
        } catch (error) {
            console.error(error.message);
            alert('Failed to recover the template. Please try again.');
        }
    };

    // Filter templates by search query and role
    const filteredTemplates = templates.filter((template) => {
        const matchesSearch =
            template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (template.subtype && template.subtype.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesRole =
            roleFilter === 'All' || template.requiredRole === roleFilter;

    // 🛠️ Debugging Log
    // console.log(`Checking template: ${template.name}`);
    // console.log(`- Template Required Role: ${template.requiredRole}`);
    // console.log(`- User Role: ${user.role}`);
    // console.log(`- User Organization: ${JSON.stringify(user.organization)}`);
    // console.log(`- User Suborganizations: ${JSON.stringify(user.suborganizations)}`);

    // console.log(`Checking role condition for template: ${template.name}`);
    // console.log(`- User Role: ${user.role}`);
    // console.log(`- Template Required Role: ${template.requiredRole}`);



    // Allow students to see organization templates if they belong to suborganizations
    if (user.role === 'student' && template.requiredRole === 'organization') {
        const belongsToSubOrg = user.suborganizations?.includes(template.organization); // Fix condition
        // console.log(`- Template Organization: ${template.organization}`);
        // console.log(`- Matches Student's Suborganization: ${belongsToSubOrg}`);

        if (belongsToSubOrg) {
            matchesRole = true;
        }
    }

        const matchesStatus =
            statusFilter === 'All' || template.status === statusFilter.toLowerCase();

        return matchesSearch && matchesRole && matchesStatus;
    });


    // Sort templates based on selected option
    const sortedTemplates = [...filteredTemplates].sort((a, b) => {
        switch (sortOption) {
            case 'name-asc':
                return a.name.localeCompare(b.name);
            case 'name-desc':
                return b.name.localeCompare(a.name);
            case 'date-asc':
                return new Date(a.createdAt) - new Date(b.createdAt);
            case 'date-desc':
                return new Date(b.createdAt) - new Date(a.createdAt);
            default:
                return 0;
        }
    });

    if (loading) return <p>Loading templates...</p>;
    if (error) return <p className="text-red-500">{error}</p>;


    return (
        
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Available Templates</h2>

            <div className="mb-4 flex gap-4">
                <input
                    type="text"
                    placeholder="Search templates by name, type, or subtype..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border rounded w-full p-2 shadow"
                />
                {user.role === 'admin' && (
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="border rounded p-2 shadow bg-white"
                    >
                        <option value="All">All</option>
                        <option value="student">Student</option>
                        <option value="organization">Organization</option>
                    </select>
                )}
                {user.role === 'admin' && (
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border rounded p-2 shadow bg-white"
                    >
                        <option value="All">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                )}

                <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="border rounded p-2 shadow bg-white"
                >
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                    <option value="date-asc">Date (Oldest First)</option>
                    <option value="date-desc">Date (Newest First)</option>
                </select>
            </div>

            {sortedTemplates.length === 0 ? (
                <p>No templates found matching your criteria.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sortedTemplates.map((template) => (
                        <div
                            key={template._id}
                            className={`border rounded p-4 shadow hover:shadow-lg transition-shadow duration-300 bg-white ${template.status === 'inactive' ? 'opacity-50' : ''
                                }`}
                        >

                        {(() => {
                            const matchingSuborg = template?.suborganizations?.find(templateSuborg =>
                                user?.suborganizations?.some(userSuborg => 
                                    String(userSuborg._id) === String(templateSuborg._id)
                                )
                            );
                            return matchingSuborg ?
                                <p className='flex justify-end text-yellow-600 italic'>
                                Member Privilege!
                                </p>
                            : null;
                        })()}

                        <div className="flex justify-end gap-2 mb-2">
                            {template.suborganizations && template.suborganizations.length > 0 ? (
                                template.suborganizations.map((suborg) => (
                                    <>
                                    <span key={suborg._id} className="bg-violet-100 text-violet-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                                        Special for: {suborg.firstname}
                                    </span>
                                    </>
                                ))
                            ) : (
                                <span className="bg-gray-200 text-blue-600 text-sm font-medium px-2.5 py-0.5 rounded-full">
                                    General for: {user.organization.name}
                                </span>
                            )}
                        </div>

                            <h3 className="text-xl font-semibold mb-2">{template.name}</h3>
                            <p className="text-gray-700 mb-1">
                                <strong>Type:</strong> {template.type}
                            </p>
                            <p className="text-gray-700 mb-1">
                                <strong>Subtype:</strong> {template.subtype || 'N/A'}
                            </p>
                            <p className="text-gray-700 mb-1">
                                <strong>Role:</strong> {template.requiredRole}
                            </p>
                            <div className="mt-4 flex gap-2">
                                {template.status === 'inactive' ? (
                                    <button
                                        className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-700"
                                        onClick={() => handleRecoverTemplate(template._id)}
                                    >
                                        Recover
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
                                            onClick={() =>
                                                navigate(
                                                    user.role === 'admin'
                                                        ? `/templates/${template._id}`
                                                        : `/user-templates/${template._id}`
                                                )
                                            }
                                        >
                                            View
                                        </button>
                                        {user.role === 'admin' && (
                                            <button
                                                className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-700"
                                                onClick={() => handleOpenModal(template)}
                                            >
                                                Inactive
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>


                    ))}
                </div>
            )}

            {templateToDelete && (
                <DeleteTemplateModal
                    isOpen={isModalOpen}
                    template={templateToDelete}
                    onClose={handleCloseModal}
                    onDelete={handleDeleteTemplate}
                />
            )}
        </div>
    );
};

export default TemplateListContainer;
