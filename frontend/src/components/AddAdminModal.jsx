import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { fetchOrganizations } from '../services/superAdminService';
import { useAuthContext } from '../hooks/useAuthContext';
import { useOrganizationContext } from '../hooks/useOrganizationContext';

const AddAdminModal = ({ isOpen, onClose, onSubmit }) => {
    const { token } = useAuthContext();
    const { organizations: contextOrganizations, dispatch } = useOrganizationContext();
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('admin'); // Default role is admin
    const [organization, setOrganization] = useState('');
    const [loading, setLoading] = useState(false);
    const [organizations, setOrganizations] = useState([]);

    useEffect(() => {
        const loadOrganizations = async () => {
            if (contextOrganizations.length > 0) {
                // Use organizations from context if available
                setOrganizations(contextOrganizations);
                return;
            }

            // Fetch organizations from backend if context is empty
            setLoading(true);
            try {
                const data = await fetchOrganizations(token);
                setOrganizations(data.organizations);
                dispatch({ type: 'SET_ORGANIZATIONS', payload: data.organizations });
            } catch (error) {
                console.error('Failed to fetch organizations:', error);
            } finally {
                setLoading(false);
            }
        };

        if (isOpen) {
            loadOrganizations();
        }
    }, [token, isOpen, contextOrganizations, dispatch]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const userDetails = { firstname, lastname, email, password, role, organization };
        onSubmit(userDetails);
        setFirstname('');
        setLastname('');
        setEmail('');
        setPassword('');
        setRole('admin'); // Reset role to default
        setOrganization('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow-lg w-1/3">
                <h2 className="text-xl font-bold mb-4">Add Admin</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">First Name</label>
                        <input
                            type="text"
                            value={firstname}
                            onChange={(e) => setFirstname(e.target.value)}
                            className="border rounded p-2 w-full"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">Last Name</label>
                        <input
                            type="text"
                            value={lastname}
                            onChange={(e) => setLastname(e.target.value)}
                            className="border rounded p-2 w-full"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="border rounded p-2 w-full"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="border rounded p-2 w-full"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">Role</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="border rounded p-2 w-full"
                        >
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">Organization</label>
                        {loading ? (
                            <p>Loading organizations...</p>
                        ) : (
                            <select
                                value={organization}
                                onChange={(e) => setOrganization(e.target.value)}
                                className="border rounded p-2 w-full"
                                required
                            >
                                <option value="">Select an organization</option>
                                {organizations.map((org) => (
                                    <option key={org._id} value={org._id}>
                                        {org.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-300 text-gray-700 py-2 px-4 rounded mr-2 hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
                            disabled={loading}
                        >
                            Add
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

AddAdminModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
};

export default AddAdminModal;
