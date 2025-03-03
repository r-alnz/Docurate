
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useOrganizationContext } from "../hooks/useOrganizationContext";

import { useAuthContext } from '../hooks/useAuthContext';

const EditAdminModal = ({ isOpen, user, onClose, onEdit, suborganizations }) => {
    console.log("Organizations from context:", suborganizations);

    const [formData, setFormData] = useState({
        firstname: "",
        lastname: "",
        email: "",
        role: "",
        studentId: "",
        suborganizations: [],
        birthdate: "",
    });

    const [selectedSubOrgs, setSelectedSubOrgs] = useState([]);

    useEffect(() => {
        // Initialize selected suborganizations only when formData.suborganizations is available
        if (formData.suborganizations) {
            setSelectedSubOrgs([...formData.suborganizations]);
        }
    }, [formData.suborganizations]);

    const toggleSubOrg = (suborgId) => {
        setSelectedSubOrgs((prev) =>
            prev.includes(suborgId)
                ? prev.filter((id) => id !== suborgId) // Remove if selected
                : [...prev, suborgId] // Add if not selected
        );
    };

    useEffect(() => {
        if (user) {
            setFormData({
                firstname: user.firstname || "",
                lastname: user.lastname || "",
                email: user.email || "",
                role: user.role || "",
                studentId: user.role === 'student' ? user.studentId || '' : '',
                suborganizations: Array.isArray(user?.suborganizations)
                    ? user.suborganizations.map(suborg => suborg._id)
                    : [],
                birthdate: user.birthdate ? user.birthdate.split("T")[0] : "",
            });
        }
    }, [user]);

    const userSuborganizations = formData.suborganizations.length
    ? formData.suborganizations
        .map(suborgId => {
            const suborg = suborganizations.find(org => org._id === suborgId);
            return suborg ? suborg.firstname + " " + suborg.lastname || "(No Name)" : "Unknown";
        })
        .join(", ")
    : "No suborganizations assigned";
    

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
    
        if (!user || !user._id) {
            console.error("❌ Error: Missing user ID");
            return;
        }
    
        const updatedUser = { 
            ...formData, 
            suborganizations: selectedSubOrgs.length ? selectedSubOrgs : [],
            birthdate: formData.birthdate ? new Date(formData.birthdate).toISOString() : null,
        };
    
        console.log("🔹 Updating user:", user._id);
        console.log("📤 Final Payload:", JSON.stringify(updatedUser, null, 2));
    
        onEdit(user._id, updatedUser);
    };
    
    

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto">
            <div className="bg-white p-6 rounded shadow-lg max-w-sm">
                <h2 className="text-lg font-bold mb-4">Edit User</h2>
                <form>
                    <div className="mb-4">
                        <label className="block text-gray-700">First Name</label>
                        <input
                            type="text"
                            name="firstname"
                            value={formData.firstname}
                            onChange={handleInputChange}
                            className="w-full border p-2 rounded"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Last Name</label>
                        <input
                            type="text"
                            name="lastname"
                            value={formData.lastname}
                            onChange={handleInputChange}
                            className="w-full border p-2 rounded"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full border p-2 rounded"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700">Birthdate</label>
                        <input
                            type="date"
                            name="birthdate"
                            value={formData.birthdate}
                            onChange={handleInputChange}
                            className="w-full border p-2 rounded"
                        />
                    </div>
                    
                    {user.role === 'student' && (
                        <div className="mb-4">
                            <label className="block text-gray-700">Student ID</label>
                            <input
                                type="text"
                                name="studentId"
                                value={formData.studentId}
                                onChange={handleInputChange}
                                className="w-full border p-2 rounded"
                            />
                        </div>
                    )}

                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">Suborganizations</label>
                        {/* <div className="border rounded p-2 w-full h-32 overflow-y-auto">
                            {userSuborganizations}
                        </div> */}

{suborganizations.length === 0 ? (
                <div className="border rounded p-2 w-full text-gray-500">
                    No suborganizations available.
                </div>
            ) : (
                <div className="border rounded p-2 w-full h-32 overflow-y-auto">
                    {suborganizations.map((org) => (
                        <div
                            key={org._id}
                            onClick={() => toggleSubOrg(org._id)}
                            className={`p-2 cursor-pointer ${
                                selectedSubOrgs.includes(org._id)
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
                            onClick={handleSubmit}
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

EditAdminModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    user: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
};

export default EditAdminModal;
