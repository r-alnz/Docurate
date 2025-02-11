import { useAuthContext } from '../hooks/useAuthContext';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

const AddUserModal = ({ isOpen, onClose, onSubmit, subOrganizations }) => {
    const { user } = useAuthContext(); // Fetch current user context
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student'); // Default role
    const [studentId, setStudentId] = useState('');
    const [isStudentOrgMember, setIsStudentOrgMember] = useState(false);
    const [selectedSubOrg, setSelectedSubOrg] = useState('');

    // Fetch sub-organizations when modal opens

    const handleSubmit = (e) => {
        e.preventDefault();
        const userDetails = {
            firstname,
            lastname,
            email,
            password,
            role,
            studentId: role === 'student' ? studentId : null, // Include studentId if role is student
            organization: user.organization._id, // Use admin's organization ID
            organizationName: user.organization.name, // Include the organization name
            suborganization: isStudentOrgMember ? selectedSubOrg : null, // Include sub-organization if checked
        };
        onSubmit(userDetails);
        setFirstname('');
        setLastname('');
        setEmail('');
        setPassword('');
        setRole('student');
        setStudentId('');
        setIsStudentOrgMember(false);
        setSelectedSubOrg('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow-lg w-1/3">
                <h2 className="text-xl font-bold mb-4">Add User</h2>
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
                            <option value="student">Student</option>
                            <option value="organization">Organization</option>
                        </select>
                    </div>
                    {role === 'student' && (
                        <div className="mb-4">
                            <label className="block text-gray-700 font-medium mb-2">Student ID</label>
                            <input
                                type="text"
                                value={studentId}
                                onChange={(e) => setStudentId(e.target.value)}
                                className="border rounded p-2 w-full"
                                required />
                        </div>
                    )}

                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">Organization</label>
                        <p className="text-gray-700">{user.organization?.name || 'N/A'}</p>
                    </div>
                    
                    {role === 'student' && (
                        <> {/* Check if part of student org */}
                        <div className="mb-4">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={isStudentOrgMember}
                                    onChange={() => setIsStudentOrgMember(!isStudentOrgMember)}
                                    className="w-4 h-4" />
                                <span className="text-gray-700 font-medium">Part of a suborganization (e.g., Student Organization)?</span>
                            </label>

                            {/* Conditionally show Sub-organization dropdown */}
                            {isStudentOrgMember && (
                                <div className="mb-4">
                                    <select name="organization"
                                        value={selectedSubOrg}
                                        className="border rounded p-2 w-full"
                                        onChange={(e) => setSelectedSubOrg(e.target.value)}>
                                    <option value="">Select Organization</option>
                                    {subOrganizations.map(org => (
                                        <option key={org._id} value={org._id}>
                                            {org.firstname} {org.lastname}
                                        </option>
                                    ))}
                                </select>
                                </div>
                            )}
                        </div>
                        </>
                    )}
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
                        >
                            Add User
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

AddUserModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
};

export default AddUserModal;
