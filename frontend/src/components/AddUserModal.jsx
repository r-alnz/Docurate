import { useAuthContext } from '../hooks/useAuthContext';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

const AddUserModal = ({ isOpen, onClose, onSubmit, suborganizations, suborgAlready }) => {
    const { user } = useAuthContext(); // Fetch current user context
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student'); // Default role
    const [studentId, setStudentId] = useState('');
    // const [isStudentOrgMember, setIsStudentOrgMember] = useState(false);
    const [isStudentOrgMember, setIsStudentOrgMember] = useState(true);
    const [selectedSubOrgs, setSelectedSubOrgs] = useState([]);
    const currRole = suborgAlready.length > 0 ? suborgAlready[0].role : null;

    console.log("Props received in AddUserModal:", { suborgAlready, suborganizations, currRole });

    useEffect(() => {
        if (currRole === "organization") {
            setSelectedSubOrgs(suborgAlready.map(org => org._id));
            console.log("Auto-selecting suborg: ", suborgAlready);
        }
    }, [currRole, suborgAlready]);

    // Fetch sub-organizations when modal opens

    const handleSubmit = (e) => {
        e.preventDefault();

        // 🛠 Debugging: Log selected sub-orgs before sending
        console.log("Submitting with suborganizations:", selectedSubOrgs);

        const userDetails = {
            firstname: firstname.trim() === '' ? null : firstname,
            lastname: lastname.trim() === '' ? ' ' : lastname,
            email,
            password,
            role,
            studentId: role === 'student' ? studentId : null, // Include studentId if role is student
            organization: user.organization._id, // Use admin's organization ID
            organizationName: user.organization.name, // Include the organization name
            suborganizations: isStudentOrgMember ? [...selectedSubOrgs] : [], // Ensure it's an array
        };
        onSubmit(userDetails);

        // 🛠 Debugging: Check after sending
        console.log("User details submitted:", userDetails);

        //  Delay reset to prevent premature clearing
        // setTimeout(() => {
        setFirstname('');
        setLastname('');
        setEmail('');
        setPassword('');
        setRole('student');
        setStudentId('');
        setIsStudentOrgMember(false);
        setSelectedSubOrgs([]); // Reset selection
        // }, 200);
    };


    if (!isOpen) return null;

    console.log("Suborganizations Type:", typeof suborganizations, suborganizations);
    suborganizations.forEach((org, index) => {
        console.log(`Index ${index}:`, org);
    });

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">Add User</h2>
                <form onSubmit={handleSubmit}>
                    {role === 'student' ? (
                        <>
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
                        </>
                    ) : role === 'organization' ? (
                        <div className="mb-4">
                            <label className="block text-gray-700 font-medium mb-2">Organization Name</label>
                            <input
                                type="text"
                                value={firstname}
                                onChange={(e) => setFirstname(e.target.value)}
                                className="border rounded p-2 w-full"
                                required
                            />
                        </div>
                    ) : null}

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

                    {currRole === 'organization' ? (
                        <>
                            <label className="block text-gray-700 font-medium mb-2">Suborganization</label>
                            <p className="text-gray-700">{suborgAlready.map(org => org.firstname)}</p>
                        </>
                    ) : currRole === 'admin' ? (
                        <>
                            {role === 'student' && (
                                <div className="mb-4">
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={isStudentOrgMember}
                                            onChange={() => setIsStudentOrgMember(!isStudentOrgMember)}
                                            className="w-4 h-4" />
                                        <span className="text-gray-700 font-medium">Part of a suborganization (e.g., Student Organization)?</span>
                                    </label>

                                    {isStudentOrgMember && (
                                        <div className="mb-4">
                                            {suborganizations.length === 0 ? (
                                                <div className="border rounded p-2 w-full text-gray-500">
                                                    No suborganizations under {user.organization?.name}
                                                </div>
                                            ) : (
                                                <div className="border rounded p-2 w-full h-32 overflow-y-auto">
                                                    {suborganizations.map((org) => (
                                                        <div
                                                            key={org._id}
                                                            onClick={() => {
                                                                setSelectedSubOrgs((prev) =>
                                                                    prev.includes(org._id)
                                                                        ? prev.filter((id) => id !== org._id) // Remove if already selected
                                                                        : [...prev, org._id] // Add if not selected
                                                                );
                                                            }}
                                                            className={`p-2 cursor-pointer ${selectedSubOrgs.includes(org._id)
                                                                ? "bg-blue-500 text-white"
                                                                : "bg-gray-100 text-gray-700"
                                                                } rounded mb-1`}
                                                        >
                                                            {org.firstname || "(No Name)"}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    ) : null}
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
